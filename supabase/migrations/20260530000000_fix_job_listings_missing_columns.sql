-- 20260530000000_fix_job_listings_missing_columns.sql
-- Fix for existing job_listings table that is missing columns

-- Add expires_at column if it doesn't exist
ALTER TABLE public.job_listings 
ADD COLUMN IF NOT EXISTS expires_at TIMESTAMPTZ;

-- Add is_premium column if it doesn't exist
ALTER TABLE public.job_listings 
ADD COLUMN IF NOT EXISTS is_premium BOOLEAN NOT NULL DEFAULT FALSE;

-- Add applications_count column if it doesn't exist
ALTER TABLE public.job_listings 
ADD COLUMN IF NOT EXISTS applications_count INTEGER NOT NULL DEFAULT 0;

-- Add company info columns to employer_company_details if missing
ALTER TABLE public.employer_company_details 
ADD COLUMN IF NOT EXISTS company_description TEXT;

ALTER TABLE public.employer_company_details 
ADD COLUMN IF NOT EXISTS company_website TEXT;

-- Recreate RLS policies if they don't exist (using OR REPLACE)
DROP POLICY IF EXISTS "Job listings viewable by everyone" ON public.job_listings;
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

DROP POLICY IF EXISTS "Only premium employers can create listings" ON public.job_listings;
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

DROP POLICY IF EXISTS "Owners can update their listings" ON public.job_listings;
CREATE POLICY "Owners can update their listings"
ON public.job_listings
FOR UPDATE
USING (auth.uid() = employer_id)
WITH CHECK (auth.uid() = employer_id);

DROP POLICY IF EXISTS "Owners can delete their listings" ON public.job_listings;
CREATE POLICY "Owners can delete their listings"
ON public.job_listings
FOR DELETE
USING (auth.uid() = employer_id);

-- Ensure employer_company_details policies exist
DROP POLICY IF EXISTS "Employer company details viewable by everyone" ON public.employer_company_details;
CREATE POLICY "Employer company details viewable by everyone"
ON public.employer_company_details
FOR SELECT
USING (true);

DROP POLICY IF EXISTS "Employers can manage their company details" ON public.employer_company_details;
CREATE POLICY "Employers can manage their company details"
ON public.employer_company_details
FOR ALL
USING (auth.uid() = profile_id)
WITH CHECK (auth.uid() = profile_id);