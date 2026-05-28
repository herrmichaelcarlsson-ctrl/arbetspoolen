-- 20260530000003_create_employer_details.sql
-- Creates employer_company_details table

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