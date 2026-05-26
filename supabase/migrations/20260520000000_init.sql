-- 20260520000000_init.sql
-- SveaTalang Database Schema Migration
-- Sets up the profiles, profile contact details, RLS policies, and auth signup triggers.

-- ==========================================
-- 1. EXTENSIONS & FUNCTIONS
-- ==========================================

-- Standard trigger function to automatically update `updated_at` timestamps
CREATE OR REPLACE FUNCTION public.handle_update_timestamp()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  new.updated_at = now();
  RETURN new;
END;
$$;

-- ==========================================
-- 2. TABLE DEFINITIONS
-- ==========================================

-- A public profiles table containing search-optimized job seeker/employer information.
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  role TEXT NOT NULL CHECK (role IN ('job_seeker', 'employer')),
  trade TEXT,
  city TEXT,
  experience_years INTEGER NOT NULL DEFAULT 0,
  availability TEXT,
  bio TEXT,
  is_premium_locked BOOLEAN NOT NULL DEFAULT TRUE,
  is_premium BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- A private profile contact details table containing sensitive personal information.
CREATE TABLE IF NOT EXISTS public.profile_contact_details (
  profile_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE PRIMARY KEY,
  full_name TEXT NOT NULL,
  contact_email TEXT NOT NULL,
  contact_phone TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- ==========================================
-- 3. TRIGGERS FOR TIMESTAMPS
-- ==========================================

-- Ensure updated_at is kept fresh on update
CREATE OR REPLACE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_update_timestamp();

-- ==========================================
-- 4. ROW LEVEL SECURITY (RLS) POLICIES
-- ==========================================

-- Enable Row Level Security (RLS) on both tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profile_contact_details ENABLE ROW LEVEL SECURITY;

-- --- Profiles Table Policies ---

-- Policy: Profiles are viewable by everyone
CREATE POLICY "Profiles are viewable by everyone" 
ON public.profiles 
FOR SELECT 
USING (true);

-- Policy: Users can insert their own profile
CREATE POLICY "Users can insert their own profile" 
ON public.profiles 
FOR INSERT 
WITH CHECK (auth.uid() = id);

-- Policy: Users can update their own profile
CREATE POLICY "Users can update their own profile" 
ON public.profiles 
FOR UPDATE 
USING (auth.uid() = id) 
WITH CHECK (auth.uid() = id);

-- --- Profile Contact Details Table Policies ---

-- Policy: Viewable by self (owner) OR if the requesting user is a premium employer
CREATE POLICY "Contact details viewable by self or premium employers" 
ON public.profile_contact_details 
FOR SELECT 
USING (
  auth.uid() = profile_id 
  OR 
  EXISTS (
    SELECT 1 
    FROM public.profiles 
    WHERE id = auth.uid() 
      AND role = 'employer' 
      AND is_premium = true
  )
);

-- Policy: Users can insert their own contact details
CREATE POLICY "Users can insert their own contact details" 
ON public.profile_contact_details 
FOR INSERT 
WITH CHECK (auth.uid() = profile_id);

-- Policy: Users can update their own contact details
CREATE POLICY "Users can update their own contact details" 
ON public.profile_contact_details 
FOR UPDATE 
USING (auth.uid() = profile_id) 
WITH CHECK (auth.uid() = profile_id);

-- ==========================================
-- 5. AUTH SIGNUP TRIGGER FUNCTION
-- ==========================================

-- Automatically inserts a public profile and a default contact detail record on auth signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
DECLARE
  default_role TEXT;
BEGIN
  -- Determine role from metadata or default to 'job_seeker'
  default_role := COALESCE(new.raw_user_meta_data ->> 'role', 'job_seeker');
  
  -- Sanity check: Ensure role is valid
  IF default_role NOT IN ('job_seeker', 'employer') THEN
    default_role := 'job_seeker';
  END IF;

  -- 1. Insert default public profile record
  INSERT INTO public.profiles (
    id,
    role,
    trade,
    city,
    experience_years,
    availability,
    bio,
    is_premium_locked,
    is_premium
  ) VALUES (
    new.id,
    default_role,
    new.raw_user_meta_data ->> 'trade',
    new.raw_user_meta_data ->> 'city',
    COALESCE((new.raw_user_meta_data ->> 'experience_years')::integer, 0),
    new.raw_user_meta_data ->> 'availability',
    new.raw_user_meta_data ->> 'bio',
    TRUE,  -- default premium lock status is true (locked)
    FALSE  -- default premium status is false
  );

  -- 2. Insert private contact details record using email/metadata
  INSERT INTO public.profile_contact_details (
    profile_id,
    full_name,
    contact_email,
    contact_phone
  ) VALUES (
    new.id,
    COALESCE(
      new.raw_user_meta_data ->> 'full_name',
      new.raw_user_meta_data ->> 'name',
      'Anonymous Candidate'
    ),
    COALESCE(new.email, 'no-email@example.com'),
    new.raw_user_meta_data ->> 'contact_phone'
  );

  RETURN new;
END;
$$;

-- Create trigger on auth.users table
CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();
