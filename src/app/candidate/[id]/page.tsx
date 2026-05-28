'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { MessageButton } from '@/components/MessageButton';
import { SaveButton } from '@/components/SaveButton';

const AVAILABILITY_LABELS: Record<string, string> = {
  omgaende: 'Tillgänglig omgående',
  '2_veckor': 'Inom 2 veckor',
  '1_manad': 'Inom 1 månad',
  inte_tillganglig: 'Inte tillgänglig just nu',
  datum: 'Från ett datum',
};

export default function CandidateProfilePage() {
  const params = useParams();
  const router = useRouter();
  const candidateId = params?.id as string;

  const [currentUser, setCurrentUser] = useState<any>(null);
  const [isPremium, setIsPremium] = useState(false);
  const [candidate, setCandidate] = useState<any>(null);
  const [contact, setContact] = useState<any>(null);
  const [references, setReferences] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    const load = async () => {
      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      setCurrentUser(user);

      if (user) {
        const { data: profile } = await supabase
          .from('profiles').select('is_premium, role, company_name').eq('id', user.id).single();
        setIsPremium(profile?.is_premium || false);

        // Log this view
        if (profile?.is_premium) {
          await supabase.from('profile_views').insert({
            profile_id: candidateId,
            viewer_id: user.id,
            viewer_company: profile?.company_name || null,
          });
        }
      }

      // Load candidate profile
      const { data: cand } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', candidateId)
        .eq('role', 'job_seeker')
        .single();

      if (!cand) { setNotFound(true); setLoading(false); return; }
      setCandidate(cand);

      // Load contact details if premium
      if (isPremium || (user && (await supabase.from('profiles').select('is_premium').eq('id', user.id).single()).data?.is_premium)) {
        const { data: cd } = await supabase
          .from('profile_contact_details')
          .select('*')
          .eq('profile_id', candidateId)
          .single();
        setContact(cd);
      }

      // Load submitted references
      const { data: refs } = await supabase
        .from('references')
        .select('*')
        .eq('profile_id', candidateId)
        .eq('status', 'submitted')
        .order('submitted_at', { ascending: false });
      setReferences(refs || []);

      setLoading(false);
    };
    if (candidateId) load();
  }, [candidateId]);

  if (loading) return (
    <div style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ width: 32, height: 32, border: '3px solid #e0eaf4', borderTopColor: '#1a5fa8', borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} />
    </div>
  );

  if (notFound) return (
    <div style={{ minHeight: '60vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 12, fontFamily: 'DM Sans, sans-serif' }}>
      <div style={{ fontSize: 48 }}>👤</div>
      <h2 style={{ fontFamily: 'DM Serif Display, serif', color: '#1a3a5c', margin: 0 }}>Kandidaten hittades inte</h2>
      <Link href="/employer/directory" style={{ color: '#1a5fa8', fontSize: 14 }}>← Tillbaka till katalogen</Link>
    </div>
  );

  const availLabel = candidate.availability === 'datum' && candidate.available_from
    ? `Tillgänglig från ${new Date(candidate.available_from).toLocaleDateString('sv-SE', { day: 'numeric', month: 'long', year: 'numeric' })}`
    : AVAILABILITY_LABELS[candidate.availability] || candidate.availability;

  const isAvailableSoon = candidate.availability === 'omgaende' ||
    (candidate.availability === 'datum' && candidate.available_from && new Date(candidate.available_from) <= new Date(Date.now() + 30 * 24 * 60 * 60 * 1000));

  // Profile completeness score
  const fields = [
    !!candidate.trade, !!candidate.city, !!candidate.bio,
    !!candidate.avatar_url, (candidate.experience_years > 0),
    (candidate.certificates?.filter((c: string) => c.trim()).length > 0),
    (references.length > 0),
  ];
  const score = Math.round((fields.filter(Boolean).length / fields.length) * 100);

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=DM+Sans:wght@300;400;500&display=swap');
        @keyframes spin { to { transform: rotate(360deg); } }
        .cp-wrap { font-family: 'DM Sans', sans-serif; background: #f5f9fd; min-height: 100vh; color: #1a3a5c; }
        .cp-body { max-width: 780px; margin: 0 auto; padding: 2rem 1.5rem 4rem; display: flex; flex-direction: column; gap: 16px; }
        .cp-card { background: #fff; border: 1px solid #e0eaf4; border-radius: 20px; padding: 1.75rem; }
        .cp-section-label { font-size: 11px; font-weight: 500; letter-spacing: 1px; text-transform: uppercase; color: #9ca3af; margin-bottom: 1rem; }
        .cp-tag { display: inline-flex; align-items: center; gap: 4px; font-size: 12px; padding: 4px 12px; border-radius: 99px; border: 1px solid #e0eaf4; color: #4a6480; margin: 3px 3px 0 0; }
        .cp-tag-blue { border-color: #b8d0e8; color: #1a5fa8; background: #e6f1fb; }
        .cp-tag-green { border-color: #86efac; color: #16a34a; background: #f0fdf4; }
        .rb-btn { font-family: 'DM Sans', sans-serif; font-size: 13px; padding: 8px 18px; border-radius: 99px; border: 1px solid #b8d0e8; background: transparent; color: #1a3a5c; cursor: pointer; text-decoration: none; display: inline-flex; align-items: center; gap: 6px; transition: background 0.15s; font-weight: 500; }
        .rb-btn:hover { background: #eaf3fb; }
        .rb-btn-primary { background: #1a5fa8; border-color: #1a5fa8; color: #fff; }
        .rb-btn-primary:hover { background: #134a85; }
        .cp-ref { background: #f5f9fd; border: 1px solid #e0eaf4; border-radius: 12px; padding: 1rem 1.25rem; margin-bottom: 8px; }
        .cp-ref-author { font-size: 13px; font-weight: 500; color: #1a3a5c; }
        .cp-ref-meta { font-size: 11px; color: #4a6480; margin-top: 2px; margin-bottom: 8px; }
        .cp-ref-text { font-size: 14px; color: #1a3a5c; line-height: 1.65; font-style: italic; }
        .cp-cert { display: inline-flex; align-items: center; gap: 6px; font-size: 12px; padding: 5px 12px; border-radius: 99px; background: #f5f9fd; border: 1px solid #e0eaf4; color: #1a3a5c; margin: 3px; }
        .cp-score-bar { height: 6px; background: #e0eaf4; borderRadius: 99px; overflow: hidden; margin-top: 6px; }
        .cp-score-fill { height: 100%; border-radius: 99px; transition: width 0.5s ease; }
        .cp-locked { display: flex; align-items: center; gap: 8px; padding: 10px 14px; background: #f5f9fd; border: 1px dashed #b8d0e8; border-radius: 12px; font-size: 13px; color: #9ca3af; }
        .cp-locked-blur { filter: blur(5px); user-select: none; }
      `}</style>

      <div className="cp-wrap">
        <div className="cp-body">

          {/* Back + actions */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Link href="/employer/directory" className="rb-btn">← Tillbaka till katalogen</Link>
            {currentUser && (
              <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                <MessageButton recipientId={candidateId} recipientName={contact?.full_name || 'Kandidat'} />
                <SaveButton candidateId={candidateId} employerId={currentUser.id} />
              </div>
            )}
          </div>

          {/* Header card */}
          <div className="cp-card">
            <div style={{ display: 'flex', gap: 16, alignItems: 'flex-start' }}>
              {/* Avatar */}
              <div style={{
                width: 80, height: 80, borderRadius: '50%', flexShrink: 0,
                overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center',
                background: '#e6f1fb', color: '#1a5fa8', fontSize: 28, fontWeight: 700,
                border: '2px solid #e0eaf4',
              }}>
                {candidate.avatar_url
                  ? <img src={candidate.avatar_url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  : (contact?.full_name?.charAt(0) || candidate.trade?.charAt(0) || '?')
                }
              </div>

              <div style={{ flex: 1 }}>
                {/* Name */}
                <h1 style={{ fontFamily: 'DM Serif Display, serif', fontSize: 26, color: '#1a3a5c', margin: '0 0 4px', letterSpacing: '-0.5px' }}>
                  {contact?.full_name || (isPremium ? 'Okänt namn' : `${candidate.trade || 'Yrkesperson'} i ${candidate.city || 'Sverige'}`)}
                </h1>

                {/* Tags */}
                <div style={{ marginBottom: 12 }}>
                  {candidate.trade && <span className="cp-tag">🔧 {candidate.trade}</span>}
                  {candidate.city && <span className="cp-tag cp-tag-blue">📍 {candidate.city}</span>}
                  {candidate.experience_years > 0 && <span className="cp-tag">💼 {candidate.experience_years} år</span>}
                  <span className={`cp-tag ${isAvailableSoon ? 'cp-tag-green' : ''}`}>📅 {availLabel}</span>
                </div>

                {/* Profile score */}
                <div style={{ marginBottom: 0 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: '#4a6480' }}>
                    <span>Profilkvalitet</span>
                    <span style={{ fontWeight: 500, color: score >= 70 ? '#16a34a' : '#f0a020' }}>{score}%</span>
                  </div>
                  <div className="cp-score-bar">
                    <div className="cp-score-fill" style={{
                      width: `${score}%`,
                      background: score >= 70 ? 'linear-gradient(90deg,#16a34a,#4ade80)' : 'linear-gradient(90deg,#f0a020,#fbbf24)',
                    }} />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Bio */}
          {candidate.bio && (
            <div className="cp-card">
              <div className="cp-section-label">Om kandidaten</div>
              <p style={{ fontSize: 15, color: '#1a3a5c', lineHeight: 1.7, margin: 0 }}>{candidate.bio}</p>
            </div>
          )}

          {/* Certifikat */}
          {candidate.certificates?.filter((c: string) => c.trim()).length > 0 && (
            <div className="cp-card">
              <div className="cp-section-label">Certifikat & Utbildningar</div>
              <div>
                {candidate.certificates.filter((c: string) => c.trim()).map((cert: string, i: number) => (
                  <span key={i} className="cp-cert">🎓 {cert}</span>
                ))}
              </div>
            </div>
          )}

          {/* References */}
          <div className="cp-card">
            <div className="cp-section-label">
              Referenser {references.length > 0 && `(${references.length})`}
            </div>
            {references.length === 0 ? (
              <p style={{ fontSize: 13, color: '#9ca3af', margin: 0 }}>Inga referencias inkomna ännu.</p>
            ) : references.map(ref => (
              <div key={ref.id} className="cp-ref">
                <div className="cp-ref-author">{ref.referee_name}</div>
                <div className="cp-ref-meta">
                  {[ref.referee_title, ref.referee_company, ref.relationship].filter(Boolean).join(' · ')}
                </div>
                <div className="cp-ref-text">"{ref.testimonial}"</div>
              </div>
            ))}
          </div>

          {/* Contact details */}
          <div className="cp-card">
            <div className="cp-section-label">Kontaktuppgifter</div>
            {isPremium && contact ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {contact.contact_email && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 14 }}>
                    <span>✉️</span>
                    <a href={`mailto:${contact.contact_email}`} style={{ color: '#1a5fa8', textDecoration: 'none' }}>{contact.contact_email}</a>
                  </div>
                )}
                {contact.contact_phone && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 14 }}>
                    <span>📞</span>
                    <a href={`tel:${contact.contact_phone}`} style={{ color: '#1a5fa8', textDecoration: 'none' }}>{contact.contact_phone}</a>
                  </div>
                )}
              </div>
            ) : (
              <div className="cp-locked">
                🔒
                <div>
                  <span className="cp-locked-blur">namn@email.se · 070-xxx xx xx</span>
                </div>
                <Link href="/employer/directory" className="rb-btn rb-btn-primary" style={{ fontSize: 12, padding: '5px 14px', marginLeft: 'auto' }}>
                  Uppgradera →
                </Link>
              </div>
            )}
          </div>

        </div>
      </div>
    </>
  );
}
