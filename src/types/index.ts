export type UserRole = 'job_seeker' | 'employer';

export interface Profile {
  id: string;
  role: UserRole;
  trade?: string | null;
  city?: string | null;
  experience_years?: number;
  availability?: string | null;
  bio?: string | null;
  is_premium?: boolean;
  is_premium_locked?: boolean;
  avatar_url?: string | null;
  certificates?: string[];
  created_at?: string;
  updated_at?: string;
}

export interface ProfileContactDetails {
  profile_id: string;
  full_name?: string | null;
  contact_email?: string | null;
  contact_phone?: string | null;
}

export interface CandidateProfile extends Profile {
  profile_contact_details?: ProfileContactDetails | null;
  cv_url?: string | null;
  cover_letter_url?: string | null;
}