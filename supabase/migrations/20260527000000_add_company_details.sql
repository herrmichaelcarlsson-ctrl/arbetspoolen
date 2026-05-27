-- 20260527000000_add_company_details.sql
-- Add company profile columns to public.profiles and setup storage bucket for logos

-- 1. Add Columns to public.profiles
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS company_name TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS company_logo_url TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS company_presentation TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS company_website TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS company_is_public BOOLEAN NOT NULL DEFAULT TRUE;

-- 2. Setup Storage Bucket for Company Logos
INSERT INTO storage.buckets (id, name, public) 
VALUES ('company-logos', 'company-logos', true)
ON CONFLICT (id) DO NOTHING;

-- Storage RLS Policies
-- Allow public access to read logos
CREATE POLICY "Public Access" 
ON storage.objects FOR SELECT 
USING (bucket_id = 'company-logos');

-- Allow employers to upload their own logos
CREATE POLICY "Employers can upload logos" 
ON storage.objects FOR INSERT 
WITH CHECK (
  bucket_id = 'company-logos' AND 
  auth.role() = 'authenticated' AND 
  (auth.uid())::text = (string_to_array(name, '/'))[1]
);

-- Allow employers to update their own logos
CREATE POLICY "Employers can update logos" 
ON storage.objects FOR UPDATE 
USING (
  bucket_id = 'company-logos' AND 
  auth.role() = 'authenticated' AND 
  (auth.uid())::text = (string_to_array(name, '/'))[1]
);

-- Allow employers to delete their own logos
CREATE POLICY "Employers can delete logos" 
ON storage.objects FOR DELETE 
USING (
  bucket_id = 'company-logos' AND 
  auth.role() = 'authenticated' AND 
  (auth.uid())::text = (string_to_array(name, '/'))[1]
);
