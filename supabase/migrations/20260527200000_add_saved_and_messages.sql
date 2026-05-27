-- 20260527200000_add_saved_and_messages.sql
-- Migration to support Certificates, Saved Candidates, and Chat Messages features.

-- 1. Alter public.profiles to support Certificates if not already present
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS certificates TEXT[] NOT NULL DEFAULT '{}';

-- 2. Create Saved Candidates table
CREATE TABLE IF NOT EXISTS public.saved_candidates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  employer_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  candidate_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  note TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  UNIQUE(employer_id, candidate_id)
);

-- Enable RLS for saved_candidates
ALTER TABLE public.saved_candidates ENABLE ROW LEVEL SECURITY;

-- Drop policy if exists to allow recreating it cleanly
DROP POLICY IF EXISTS "Employers can manage their saved candidates" ON public.saved_candidates;

-- Create policy for saved_candidates
CREATE POLICY "Employers can manage their saved candidates"
ON public.saved_candidates
FOR ALL
USING (auth.uid() = employer_id)
WITH CHECK (auth.uid() = employer_id);

-- 3. Create Chat Messages table
CREATE TABLE IF NOT EXISTS public.messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sender_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  recipient_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  is_read BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- Enable RLS for messages
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

-- Drop policies if exist to recreate them cleanly
DROP POLICY IF EXISTS "Users can view messages they sent or received" ON public.messages;
DROP POLICY IF EXISTS "Users can insert messages they send" ON public.messages;
DROP POLICY IF EXISTS "Users can update messages they receive or send" ON public.messages;

-- Create policies for messages
CREATE POLICY "Users can view messages they sent or received"
ON public.messages
FOR SELECT
USING (auth.uid() = sender_id OR auth.uid() = recipient_id);

CREATE POLICY "Users can insert messages they send"
ON public.messages
FOR INSERT
WITH CHECK (auth.uid() = sender_id);

CREATE POLICY "Users can update messages they receive or send"
ON public.messages
FOR UPDATE
USING (auth.uid() = sender_id OR auth.uid() = recipient_id)
WITH CHECK (auth.uid() = sender_id OR auth.uid() = recipient_id);
