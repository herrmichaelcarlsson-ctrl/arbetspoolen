-- 20260529000000_add_job_listings.sql
-- Job listings feature for employers to post job ads (premium-only)

CREATE TABLE IF NOT EXISTS public.job_listings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  employer_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  trade TEXT NOT NULL,
  city TEXT NOT NULL,
  salary_min INTEGER,
  salary_max INTEGER,
  salary_text TEXT,
  employment_type TEXT NOT NULL DEFAULT 'heltid' CHECK (employment_type IN ('heltid', 'deltid', 'timmar', 'säsong', 'annat')),
  is_urgent BOOLEAN NOT NULL DEFAULT FALSE,
  is_premium BOOLEAN NOT NULL DEFAULT FALSE,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  views_count INTEGER NOT NULL DEFAULT 0,
  applications_count INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  expires_at TIMESTAMPTZ
);

-- Trigger for updated_at
CREATE OR REPLACE TRIGGER update_job_listings_updated_at
  BEFORE UPDATE ON public.job_listings
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_update_timestamp();

-- Enable RLS
ALTER TABLE public.job_listings ENABLE ROW LEVEL SECURITY;

-- RLS Policies:

-- Job listings are viewable by everyone (but contact details hidden for non-premium)
CREATE POLICY "Job listings viewable by everyone"
ON public.job_listings
FOR SELECT
USING (
  is_active = TRUE
  AND (
    expires_at IS NULL 
    OR expires_at > now()
  )
);

-- Only employers can create job listings (must be premium)
CREATE POLICY "Only premium employers can create listings"
ON public.job_listings
FOR INSERT
WITH CHECK (
  auth.uid() = employer_id
  AND EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid()
    AND role = 'employer'
    AND is_premium = TRUE
  )
);

-- Only listing owner can update their listings
CREATE POLICY "Owners can update their listings"
ON public.job_listings
FOR UPDATE
USING (auth.uid() = employer_id)
WITH CHECK (auth.uid() = employer_id);

-- Owners can delete their listings
CREATE POLICY "Owners can delete their listings"
ON public.job_listings
FOR DELETE
USING (auth.uid() = employer_id);

-- Function to increment views (public, no auth required for counting views)
CREATE OR REPLACE FUNCTION public.increment_job_view(listing_id UUID)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE public.job_listings
  SET views_count = views_count + 1
  WHERE id = listing_id;
END;
$$;

-- Indexes for better query performance
CREATE INDEX idx_job_listings_trade ON public.job_listings(trade);
CREATE INDEX idx_job_listings_city ON public.job_listings(city);
CREATE INDEX idx_job_listings_created_at ON public.job_listings(created_at DESC);
CREATE INDEX idx_job_listings_is_urgent ON public.job_listings(is_urgent) WHERE is_urgent = TRUE;
CREATE INDEX idx_job_listings_employer ON public.job_listings(employer_id);

-- Create employer_company_details table if not exists (for showing company name on listings)
CREATE TABLE IF NOT EXISTS public.employer_company_details (
  profile_id UUID PRIMARY KEY REFERENCES public.profiles(id) ON DELETE CASCADE,
  company_name TEXT,
  company_description TEXT,
  company_logo_url TEXT,
  company_website TEXT,
  org_number TEXT,
  employee_count TEXT,
  founded_year INTEGER,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE OR REPLACE TRIGGER update_employer_company_details_updated_at
  BEFORE UPDATE ON public.employer_company_details
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_update_timestamp();

ALTER TABLE public.employer_company_details ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Employer company details viewable by everyone"
ON public.employer_company_details
FOR SELECT
USING (true);

CREATE POLICY "Employers can manage their company details"
ON public.employer_company_details
FOR ALL
USING (auth.uid() = profile_id)
WITH CHECK (auth.uid() = profile_id);