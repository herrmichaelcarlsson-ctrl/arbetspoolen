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

export interface JobListing {
  id: string;
  employer_id: string;
  title: string;
  description: string;
  trade: string;
  city: string;
  salary_min?: number | null;
  salary_max?: number | null;
  salary_text?: string | null;
  employment_type: 'heltid' | 'deltid' | 'timmar' | 'säsong' | 'annat';
  is_urgent: boolean;
  is_premium: boolean;
  is_active: boolean;
  views_count: number;
  applications_count: number;
  created_at: string;
  updated_at: string;
  expires_at?: string | null;
}

export interface JobListingWithEmployer extends JobListing {
  employer?: Profile;
  company_name?: string;
  company_logo_url?: string;
  employer_details?: {
    company_name?: string;
    company_logo_url?: string;
    company_description?: string;
    company_website?: string;
  };
}