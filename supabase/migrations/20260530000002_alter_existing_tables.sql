-- 20260530000002_alter_existing_tables.sql
-- Adds missing columns to existing tables

-- Add columns to job_listings if they don't exist
ALTER TABLE public.job_listings ADD COLUMN IF NOT EXISTS expires_at TIMESTAMPTZ;
ALTER TABLE public.job_listings ADD COLUMN IF NOT EXISTS is_premium BOOLEAN NOT NULL DEFAULT FALSE;
ALTER TABLE public.job_listings ADD COLUMN IF NOT EXISTS applications_count INTEGER NOT NULL DEFAULT 0;

-- Add columns to employer_company_details if they don't exist
ALTER TABLE public.employer_company_details ADD COLUMN IF NOT EXISTS company_description TEXT;
ALTER TABLE public.employer_company_details ADD COLUMN IF NOT EXISTS company_website TEXT;