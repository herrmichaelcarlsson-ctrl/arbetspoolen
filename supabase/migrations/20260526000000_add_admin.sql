-- 20260526000000_add_admin.sql
-- Add admin capabilities to profiles

-- Add is_admin column
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS is_admin BOOLEAN NOT NULL DEFAULT FALSE;

-- Set herrmichael.carlsson@outlook.com as admin
-- This runs after the user has signed up and the trigger has created their profile
UPDATE public.profiles
SET is_admin = TRUE
WHERE id = (
  SELECT id FROM auth.users WHERE email = 'herrmichael.carlsson@outlook.com' LIMIT 1
);

-- RLS: Only admins can read all contact details (in addition to premium employers)
-- This policy already exists for premium employers; admins get the same power.
CREATE POLICY "Admins can view all contact details"
ON public.profile_contact_details
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND is_admin = true
  )
);

-- RLS: Admins can update any profile
CREATE POLICY "Admins can update any profile"
ON public.profiles
FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND is_admin = true
  )
);

-- RLS: Admins can delete any profile
CREATE POLICY "Admins can delete any profile"
ON public.profiles
FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND is_admin = true
  )
);
