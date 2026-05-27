-- 20260527100000_add_avatar_url.sql
-- Add avatar_url column that onboarding expects

ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS avatar_url TEXT;

-- Also create storage bucket for avatars if not already existing
INSERT INTO storage.buckets (id, name, public) 
VALUES ('avatars', 'avatars', true)
ON CONFLICT (id) DO NOTHING;

-- Storage RLS Policies for avatars
CREATE POLICY "Public Access Avatars" 
ON storage.objects FOR SELECT 
USING (bucket_id = 'avatars');

CREATE POLICY "Users can upload own avatar" 
ON storage.objects FOR INSERT 
WITH CHECK (
  bucket_id = 'avatars' AND 
  auth.role() = 'authenticated' AND 
  (auth.uid())::text = (string_to_array(name, '/'))[1]
);

CREATE POLICY "Users can update own avatar" 
ON storage.objects FOR UPDATE 
USING (
  bucket_id = 'avatars' AND 
  auth.role() = 'authenticated' AND 
  (auth.uid())::text = (string_to_array(name, '/'))[1]
);
