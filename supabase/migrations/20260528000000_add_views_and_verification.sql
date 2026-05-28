-- ==========================================
-- 7. PROFILE VIEWS TRACKING & VERIFICATION TABLE
-- ==========================================

-- Table to track profile views
CREATE TABLE IF NOT EXISTS public.profile_views (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  profile_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  viewer_id UUID REFERENCES auth.users(id) ON DELETE SET NULL, -- NULL for anonymous
  viewer_email TEXT, -- captured for anonymous view requests
  viewed_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  source TEXT DEFAULT 'directory' -- 'directory', 'search', 'direct', 'saved'
);

-- Index for fast weekly counting
CREATE INDEX IF NOT EXISTS idx_profile_views_profile_week 
  ON public.profile_views (profile_id, date_trunc('week', viewed_at));

-- Table for verification requests
CREATE TABLE IF NOT EXISTS public.verification_requests (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  profile_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE UNIQUE,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  document_url TEXT,
  document_type TEXT, -- 'certificate', 'license', 'tax', 'other'
  submitted_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  reviewed_at TIMESTAMPTZ,
  reviewed_by UUID REFERENCES auth.users(id),
  notes TEXT,
  stripe_payment_id TEXT
);

-- ==========================================
-- 8. ENHANCED RLS POLICIES
-- ==========================================

-- Profile views can be inserted by authenticated users
CREATE POLICY "Users can create profile view records"
ON public.profile_views
FOR INSERT
WITH CHECK (auth.uid() IS NOT NULL);

-- Users can view their own views (for stats)
CREATE POLICY "Users can view their own profile views"
ON public.profile_views
FOR SELECT
USING (auth.uid() = profile_id);

-- Verification requests: anyone authenticated can insert
CREATE POLICY "Authenticated users can submit verification requests"
ON public.verification_requests
FOR INSERT
WITH CHECK (auth.uid() = profile_id);

-- Users can view their own verification status
CREATE POLICY "Users can view their own verification status"
ON public.verification_requests
FOR SELECT
USING (auth.uid() = profile_id);

-- Admins can view all verification requests
CREATE POLICY "Admins can view all verification requests"
ON public.verification_requests
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND is_admin = true
  )
);

-- Admins can update verification status
CREATE POLICY "Admins can update verification status"
ON public.verification_requests
FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND is_admin = true
  )
);

-- ==========================================
-- 9. HELPER FUNCTIONS
-- ==========================================

-- Function to log a profile view
CREATE OR REPLACE FUNCTION public.log_profile_view(
  p_profile_id UUID,
  p_viewer_id UUID DEFAULT NULL,
  p_viewer_email TEXT DEFAULT NULL,
  p_source TEXT DEFAULT 'directory'
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profile_views (profile_id, viewer_id, viewer_email, source)
  VALUES (p_profile_id, p_viewer_id, p_viewer_email, p_source);
END;
$$;

-- Function to get weekly view count for a profile
CREATE OR REPLACE FUNCTION public.get_weekly_view_count(p_profile_id UUID)
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  view_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO view_count
  FROM public.profile_views
  WHERE profile_id = p_profile_id
    AND viewed_at >= date_trunc('week', NOW());
  RETURN view_count;
END;
$$;

-- Trigger to set has_verified_badge when verification is approved
CREATE OR REPLACE FUNCTION public.handle_verification_approved()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.status = 'approved' AND OLD.status != 'approved' THEN
    UPDATE public.profiles 
    SET has_verified_badge = true, updated_at = NOW()
    WHERE id = NEW.profile_id;
  END IF;
  IF NEW.status IN ('rejected', 'pending') AND OLD.status = 'approved' THEN
    UPDATE public.profiles 
    SET has_verified_badge = false, updated_at = NOW()
    WHERE id = NEW.profile_id;
  END IF;
END;
$$;

CREATE OR REPLACE TRIGGER on_verification_status_change
AFTER UPDATE ON public.verification_requests
FOR EACH ROW
EXECUTE FUNCTION public.handle_verification_approved();

-- Add has_verified_badge column if not exists
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'profiles' AND column_name = 'has_verified_badge'
  ) THEN
    ALTER TABLE public.profiles ADD COLUMN has_verified_badge BOOLEAN DEFAULT false;
  END IF;
END
$$;
