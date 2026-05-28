'use client';

import { useParams } from 'next/navigation';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

export default function CompanyProfilePage() {
  const params = useParams();
  const companyId = params?.id as string;
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadCompany = async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, role, company_name, company_logo_url, company_presentation, company_website, is_premium')
        .eq('id', companyId)
        .single();
      
      if (error || !data) {
        setError('Company not found');
      } else {
        setProfile(data);
      }
      setLoading(false);
    };
    
    if (companyId) loadCompany();
  }, [companyId]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--surface)]">
        <div className="w-10 h-10 border-4 border-[var(--border)] border-t-[var(--brand)] rounded-full animate-spin" />
      </div>
    );
  }

  if (error || !profile || profile.role !== 'employer') {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[var(--surface)] gap-4">
        <div className="w-20 h-20 rounded-full bg-white border border-[var(--border)] flex items-center justify-center">
          <span className="text-4xl">🏢</span>
        </div>
        <h1 className="text-xl font-serif font-bold text-[var(--brand-navy)]">Företaget hittades inte</h1>
        <Link href="/" className="text-sm text-[var(--brand)] hover:underline">← Tillbaka</Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--surface)]">
      <main className="max-w-3xl mx-auto px-4 py-12">
        
        {/* Company Card */}
        <div className="bg-white border border-[var(--border)] rounded-[20px] p-8 shadow-sm">
          
          {/* Logo - Large and centered */}
          <div className="flex justify-center mb-6">
            {profile.company_logo_url ? (
              <div className="w-48 h-48 rounded-2xl border-2 border-[var(--border-strong)] overflow-hidden bg-white flex items-center justify-center p-4 shadow-sm">
                <img 
                  src={profile.company_logo_url} 
                  alt={`${profile.company_name} logo`} 
                  className="w-full h-full object-contain"
                />
              </div>
            ) : (
              <div className="w-48 h-48 rounded-2xl bg-[var(--surface)] border-2 border-dashed border-[var(--border)] flex items-center justify-center">
                <span className="text-6xl">🏢</span>
              </div>
            )}
          </div>
          
          {/* Company Name */}
          <div className="text-center mb-6">
            <h1 className="text-2xl sm:text-3xl font-serif font-bold text-[var(--brand-navy)] tracking-tight">
              {profile.company_name || 'Okänt Företag'}
            </h1>
            {profile.is_premium && (
              <div className="inline-flex items-center gap-1.5 mt-3 px-3 py-1 bg-amber-50 border border-amber-200 rounded-full">
                <span className="text-sm">⭐</span>
                <span className="text-xs font-bold text-amber-600">Premium Arbetsgivare</span>
              </div>
            )}
          </div>
          
          {/* Website */}
          {profile.company_website && (
            <div className="flex justify-center mb-8">
              <a 
                href={profile.company_website.startsWith('http') ? profile.company_website : `https://${profile.company_website}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2 bg-[var(--surface)] border border-[var(--border)] rounded-full text-sm text-[var(--brand)] hover:border-[var(--brand)] transition-all"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
                Besök webbplats
              </a>
            </div>
          )}
          
          {/* Presentation */}
          <div className="border-t border-[var(--border)] pt-6">
            <h2 className="text-xs font-bold text-[var(--muted)] uppercase tracking-widest mb-4">Om oss</h2>
            {profile.company_presentation ? (
              <div className="text-[var(--brand-navy)] leading-relaxed whitespace-pre-line text-sm">
                {profile.company_presentation}
              </div>
            ) : (
              <p className="text-[var(--muted)] italic text-sm">
                Detta företag har inte lagt till någon presentation ännu.
              </p>
            )}
          </div>
          
        </div>
        
        {/* Back Link */}
        <div className="mt-8 text-center">
          <Link 
            href="/" 
            className="inline-flex items-center gap-2 text-sm text-[var(--brand)] hover:text-[var(--brand-hover)] font-medium transition-colors"
          >
            ← Tillbaka till startsidan
          </Link>
        </div>
        
      </main>
    </div>
  );
}
