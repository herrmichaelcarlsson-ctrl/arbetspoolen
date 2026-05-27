export type UserRole = 'job_seeker' | 'employer';

export interface Profile {
  id: string;
  role: UserRole;
  trade: string | null;
  city: string | null;
  experience_years: number;
  availability: string | null;
  bio: string | null;
  is_premium_locked: boolean;
  is_premium: boolean;
  is_admin: boolean;
  company_name: string | null;
  company_logo_url: string | null;
  company_presentation: string | null;
  company_website: string | null;
  company_is_public: boolean;
  avatar_url?: string | null;
  certificates?: string[];
  created_at: string;
  updated_at: string;
}

export interface ProfileContactDetails {
  profile_id: string;
  full_name: string;
  contact_email: string;
  contact_phone: string | null;
  created_at: string;
}

export type CandidateProfile = Profile & {
  profile_contact_details?: ProfileContactDetails | null;
};
