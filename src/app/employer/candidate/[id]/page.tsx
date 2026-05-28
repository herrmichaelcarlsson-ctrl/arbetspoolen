'use client';

import React, { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { CandidateProfile } from '@/types';

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function CandidateProfilePage({ params }: PageProps) {
  const { id } = use(params);
  const router = useRouter();
  
  const [candidate, setCandidate] = useState<CandidateProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [hasPremium, setHasPremium] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      try {
        // Check auth
        const { data: { user } } = await supabase.auth.getUser();
        setCurrentUser(user);

        if (!user) {
          router.push('/login');
          return;
        }

        // Check if user has premium
        const { data: profile } = await supabase
          .from('profiles')
          .select('is_premium')
          .eq('id', user.id)
          .single();
        
        setHasPremium(profile?.is_premium === true);

        // Fetch candidate with contact details
        const { data, error: fetchError } = await supabase
          .from('profiles')
          .select('*, profile_contact_details(*)')
          .eq('id', id)
          .eq('role', 'job_seeker')
          .single();

        if (fetchError) throw new Error(fetchError.message);
        setCandidate(data);
      } catch (err: any) {
        setError(err.message || 'Kunde inte ladda kandidatprofilen.');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [id, router]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-slate-500 font-medium">Laddar profil...</p>
        </div>
      </div>
    );
  }

  if (error || !candidate) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center p-8 bg-white rounded-xl border border-slate-200">
          <h2 className="text-xl font-bold text-slate-800 mb-2">Ett fel uppstod</h2>
          <p className="text-slate-500 mb-4">{error || 'Kandidaten hittades inte.'}</p>
          <Link href="/employer/directory" className="text-blue-600 hover:underline">
            ← Tillbaka till katalogen
          </Link>
        </div>
      </div>
    );
  }

  const contact = candidate.profile_contact_details;
  const hasContact = contact && typeof contact === 'object';
  const details = contact as any;

  // Availability styling
  const availabilityLabels: Record<string, string> = {
    omgaende: 'Tillgänglig omgående',
    '2_veckor': 'Tillgänglig inom 2 veckor',
    '1_manad': 'Tillgänglig inom 1 månad',
    inte_tillganglig: 'Inte tillgänglig just nu',
  };

  const activeCertificates = (Array.isArray(candidate.certificates) ? candidate.certificates : [])
    .filter((c: string) => typeof c === 'string' && c.trim());

  // Generate avatar color
  const indexColors = ['#f43f5e', '#ec4899', '#d946ef', '#a855f7', '#8b5cf6', '#6366f1', '#3b82f6', '#0ea5e9', '#06b6d4', '#14b8a6', '#10b981'];
  const avatarColor = indexColors[candidate.id.charCodeAt(0) % indexColors.length];
  const initial = details?.full_name?.charAt(0) || candidate.city?.charAt(0) || 'S';

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link 
              href="/employer/directory"
              className="flex items-center gap-2 text-slate-600 hover:text-slate-900 font-medium text-sm"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Tillbaka
            </Link>
            <span className="text-slate-300">|</span>
            <h1 className="font-semibold text-slate-800">Kandidatprofil</h1>
          </div>
          <div className="flex items-center gap-3">
            {hasPremium && (
              <span className="px-3 py-1 bg-amber-100 text-amber-700 text-xs font-bold rounded-full border border-amber-200">
                ⭐ Premium
              </span>
            )}
            <button 
              onClick={handleLogout}
              className="text-sm text-slate-500 hover:text-slate-700"
            >
              Logga ut
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 py-8">
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
          
          {/* Profile Header */}
          <div className="bg-gradient-to-r from-slate-800 to-slate-700 p-8">
            <div className="flex items-center gap-6">
              <div 
                className="w-24 h-24 rounded-full flex items-center justify-center text-3xl font-bold text-white shadow-lg border-4 border-white/20"
                style={{ backgroundColor: candidate.avatar_url ? 'transparent' : avatarColor }}
              >
                {candidate.avatar_url ? (
                  <img src={candidate.avatar_url} alt="Profil" className="w-full h-full object-cover rounded-full" />
                ) : initial}
              </div>
              <div className="flex-1">
                <h2 className="text-2xl font-bold text-white mb-1">
                  {hasContact && details?.full_name ? details.full_name : 'Namn dolt'}
                </h2>
                <p className="text-slate-300 text-lg mb-2">{candidate.trade || 'Yrke ej angivet'}</p>
                <div className="flex flex-wrap gap-3">
                  {candidate.city && (
                    <span className="inline-flex items-center gap-1 px-3 py-1 bg-white/10 text-white text-sm rounded-full">
                      📍 {candidate.city}
                    </span>
                  )}
                  <span className="inline-flex items-center gap-1 px-3 py-1 bg-emerald-500/20 text-emerald-300 text-sm rounded-full">
                    🔎 Aktiv sökande
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Profile Content */}
          <div className="p-8 space-y-8">
            
            {/* Core Info Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-slate-50 rounded-xl p-4 border border-slate-100">
                <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Erfarenhet</div>
                <div className="text-xl font-bold text-slate-800">{candidate.experience_years || 0} år</div>
              </div>
              <div className="bg-slate-50 rounded-xl p-4 border border-slate-100">
                <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Tillgänglighet</div>
                <div className="text-sm font-bold text-slate-800">
                  {availabilityLabels[candidate.availability || ''] || candidate.availability || 'Ej angivet'}
                </div>
              </div>
              <div className="bg-slate-50 rounded-xl p-4 border border-slate-100">
                <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Stad</div>
                <div className="text-sm font-bold text-slate-800">{candidate.city || 'Ej angivet'}</div>
              </div>
              <div className="bg-slate-50 rounded-xl p-4 border border-slate-100">
                <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Yrke</div>
                <div className="text-sm font-bold text-slate-800 truncate">{candidate.trade || 'Ej angivet'}</div>
              </div>
            </div>

            {/* Bio / CV Sektion */}
            <div>
              <h3 className="text-lg font-bold text-slate-800 mb-3 flex items-center gap-2">
                <span>📋</span> Om mig / CV
              </h3>
              <div className="bg-slate-50 rounded-xl p-6 border border-slate-100">
                <p className="text-slate-700 leading-relaxed whitespace-pre-wrap">
                  {candidate.bio || 'Ingen biografi har skrivits ännu.'}
                </p>
              </div>
            </div>

            {/* Certifikat & Licenser */}
            {activeCertificates.length > 0 && (
              <div>
                <h3 className="text-lg font-bold text-slate-800 mb-3 flex items-center gap-2">
                  <span>📜</span> Certifikat & Licenser
                </h3>
                <div className="flex flex-wrap gap-3">
                  {activeCertificates.map((cert: string, idx: number) => (
                    <div key={idx} className="flex items-center gap-2 px-4 py-2 bg-emerald-50 text-emerald-700 rounded-xl border border-emerald-100 font-medium">
                      ✅ {cert}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Contact Information */}
            <div>
              <h3 className="text-lg font-bold text-slate-800 mb-3 flex items-center gap-2">
                <span>📞</span> Kontaktuppgifter
                {!hasContact && (
                  <span className="ml-2 px-2 py-0.5 bg-slate-100 text-slate-500 text-xs font-medium rounded-full">
                    🔒 Premium låst
                  </span>
                )}
              </h3>
              
              {hasContact ? (
                <div className="bg-emerald-50 rounded-xl p-6 border border-emerald-100 space-y-4">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600">
                      📧
                    </div>
                    <div>
                      <div className="text-xs font-semibold text-emerald-600 uppercase tracking-wider">E-post</div>
                      <a href={`mailto:${details.contact_email}`} className="text-slate-800 hover:text-blue-600 font-medium">
                        {details.contact_email}
                      </a>
                    </div>
                  </div>
                  {details.contact_phone && (
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600">
                        📞
                      </div>
                      <div>
                        <div className="text-xs font-semibold text-emerald-600 uppercase tracking-wider">Telefon</div>
                        <a href={`tel:${details.contact_phone}`} className="text-slate-800 hover:text-blue-600 font-medium">
                          {details.contact_phone}
                        </a>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="bg-slate-100 rounded-xl p-6 border border-dashed border-slate-300 text-center">
                  <div className="text-4xl mb-3">🔒</div>
                  <p className="text-slate-600 mb-3">
                    Kontaktuppgifterna är låsta. Uppgradera till Premium för att se fullständig kontaktinformation.
                  </p>
                  <Link 
                    href="/employer/directory"
                    className="inline-flex items-center gap-2 px-6 py-3 bg-amber-500 text-white font-bold rounded-xl hover:bg-amber-600 transition shadow-lg shadow-amber-500/20"
                  >
                    ⭐ Uppgradera till Premium
                  </Link>
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="flex flex-wrap gap-4 pt-4 border-t border-slate-100">
              <Link 
                href="/employer/directory"
                className="px-6 py-3 border border-slate-300 text-slate-700 font-medium rounded-xl hover:bg-slate-50 transition"
              >
                ← Tillbaka till sökning
              </Link>
              
              {hasContact && details?.contact_email && (
                <a 
                  href={`mailto:${details.contact_email}?subject=Angående tjänst&body=Hej, jag såg din profil på Arbetspoolen och vill höra mer...`}
                  className="px-6 py-3 bg-blue-600 text-white font-medium rounded-xl hover:bg-blue-700 transition shadow-lg shadow-blue-600/20"
                >
                  ✉️ Skicka meddelande
                </a>
              )}
            </div>

          </div>
        </div>
      </main>
    </div>
  );
}
