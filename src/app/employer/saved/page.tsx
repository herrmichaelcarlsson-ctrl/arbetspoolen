'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { MessageButton } from '@/components/MessageButton';

interface SavedCandidate {
  id: string;
  candidate_id: string;
  note: string | null;
  created_at: string;
  profile: {
    trade: string;
    city: string;
    experience_years: number;
    availability: string;
    bio: string;
    avatar_url: string | null;
  };
  contact: {
    full_name: string;
    contact_email: string;
    contact_phone: string;
  } | null;
}

const AVAILABILITY_LABELS: Record<string, string> = {
  omgaende: 'Tillgänglig omgående',
  '2_veckor': 'Inom 2 veckor',
  '1_manad': 'Inom 1 månad',
  inte_tillganglig: 'Inte tillgänglig just nu',
};

export default function SavedCandidatesPage() {
  const router = useRouter();
  const [userId, setUserId] = useState<string | null>(null);
  const [isPremium, setIsPremium] = useState(false);
  const [candidates, setCandidates] = useState<SavedCandidate[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingNote, setEditingNote] = useState<string | null>(null);
  const [noteText, setNoteText] = useState('');

  useEffect(() => {
    const init = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.push('/login'); return; }
      setUserId(user.id);

      const { data: profile } = await supabase
        .from('profiles').select('role, is_premium').eq('id', user.id).single();

      if (profile?.role !== 'employer') { router.push('/seeker/dashboard'); return; }
      setIsPremium(profile.is_premium || false);

      await loadSaved(user.id, profile.is_premium || false);
      setLoading(false);
    };
    init();
  }, []);

  const loadSaved = async (uid: string, premium: boolean) => {
    const { data } = await supabase
      .from('saved_candidates')
      .select('id, candidate_id, note, created_at')
      .eq('employer_id', uid)
      .order('created_at', { ascending: false });

    if (!data || data.length === 0) { setCandidates([]); return; }

    const ids = data.map(d => d.candidate_id);

    const { data: profiles } = await supabase
      .from('profiles')
      .select('id, trade, city, experience_years, availability, bio, avatar_url')
      .in('id', ids);

    let contacts: any[] = [];
    if (premium) {
      const { data: cd } = await supabase
        .from('profile_contact_details')
        .select('profile_id, full_name, contact_email, contact_phone')
        .in('profile_id', ids);
      contacts = cd || [];
    }

    const merged: SavedCandidate[] = data.map(s => ({
      ...s,
      profile: profiles?.find(p => p.id === s.candidate_id) || {} as any,
      contact: contacts.find(c => c.profile_id === s.candidate_id) || null,
    }));

    setCandidates(merged);
  };

  const handleRemove = async (savedId: string) => {
    await supabase.from('saved_candidates').delete().eq('id', savedId);
    setCandidates(prev => prev.filter(c => c.id !== savedId));
  };

  const handleSaveNote = async (savedId: string) => {
    await supabase.from('saved_candidates').update({ note: noteText }).eq('id', savedId);
    setCandidates(prev => prev.map(c => c.id === savedId ? { ...c, note: noteText } : c));
    setEditingNote(null);
  };

  if (loading) return (
    <div style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ width: 32, height: 32, border: '3px solid #e0eaf4', borderTopColor: '#1a5fa8', borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} />
    </div>
  );

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=DM+Sans:wght@300;400;500&display=swap');
        @keyframes spin { to { transform: rotate(360deg); } }

        .sc-wrap { font-family: 'DM Sans', sans-serif; background: #f5f9fd; min-height: 100vh; color: #1a3a5c; }
        .sc-body { max-width: 900px; margin: 0 auto; padding: 2.5rem 1.5rem 4rem; }
        .sc-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 2rem; }
        .sc-title { font-family: 'DM Serif Display', serif; font-size: 28px; color: #1a3a5c; margin: 0; letter-spacing: -0.5px; }
        .sc-count { font-size: 13px; color: #4a6480; margin-top: 4px; }

        .rb-btn { font-family: 'DM Sans', sans-serif; font-size: 13px; padding: 7px 16px; border-radius: 99px; border: 1px solid #b8d0e8; background: transparent; color: #1a3a5c; cursor: pointer; text-decoration: none; display: inline-flex; align-items: center; gap: 6px; transition: background 0.15s; }
        .rb-btn:hover { background: #eaf3fb; }
        .rb-btn-primary { background: #1a5fa8; border-color: #1a5fa8; color: #fff; font-weight: 500; }

        .sc-grid { display: flex; flex-direction: column; gap: 12px; }
        .sc-card { background: #fff; border: 1px solid #e0eaf4; border-radius: 16px; padding: 1.25rem; display: flex; gap: 16px; align-items: flex-start; }
        .sc-avatar { width: 52px; height: 52px; border-radius: 50%; overflow: hidden; flex-shrink: 0; display: flex; align-items: center; justify-content: center; font-size: 18px; font-weight: 600; background: #e6f1fb; color: #1a5fa8; }
        .sc-avatar img { width: 100%; height: 100%; object-fit: cover; }
        .sc-info { flex: 1; min-width: 0; }
        .sc-name { font-size: 15px; font-weight: 500; color: #1a3a5c; margin-bottom: 3px; }
        .sc-meta { font-size: 12px; color: #4a6480; margin-bottom: 8px; }
        .sc-tags { display: flex; gap: 6px; flex-wrap: wrap; margin-bottom: 8px; }
        .sc-tag { font-size: 11px; padding: 3px 9px; border-radius: 99px; border: 1px solid #e0eaf4; color: #4a6480; }
        .sc-tag-green { border-color: #86efac; color: #16a34a; background: #f0fdf4; }
        .sc-contact { display: flex; flex-direction: column; gap: 3px; margin-bottom: 8px; }
        .sc-contact-item { font-size: 12px; color: #1a5fa8; }
        .sc-note { font-size: 12px; color: #4a6480; background: #f5f9fd; border: 1px solid #e0eaf4; border-radius: 8px; padding: 8px 10px; margin-bottom: 8px; font-style: italic; }
        .sc-note-input { width: 100%; padding: 8px 10px; font-family: 'DM Sans', sans-serif; font-size: 12px; color: #1a3a5c; background: #fff; border: 1px solid #1a5fa8; border-radius: 8px; outline: none; box-sizing: border-box; resize: none; }
        .sc-actions { display: flex; gap: 6px; flex-wrap: wrap; }

        .sc-locked { display: flex; align-items: center; gap: 6px; font-size: 12px; padding: 6px 10px; background: #f5f9fd; border: 1px dashed #b8d0e8; border-radius: 8px; color: #9ca3af; margin-bottom: 8px; }
        .sc-locked-blur { filter: blur(4px); user-select: none; }

        .sc-empty { text-align: center; padding: 4rem 2rem; }
        .sc-empty-icon { font-size: 48px; margin-bottom: 1rem; }
        .sc-empty h3 { font-family: 'DM Serif Display', serif; font-size: 22px; color: #1a3a5c; margin: 0 0 0.5rem; }
        .sc-empty p { font-size: 14px; color: #4a6480; }
      `}</style>

      <div className="sc-wrap">
        <div className="sc-body">
          <div className="sc-header">
            <div>
              <h1 className="sc-title">Sparade kandidater</h1>
              <div className="sc-count">{candidates.length} sparade · {isPremium ? 'Premium — kontaktuppgifter visas' : 'Uppgradera för att se kontaktuppgifter'}</div>
            </div>
            <Link href="/employer/directory" className="rb-btn">← Tillbaka till katalogen</Link>
          </div>

          {candidates.length === 0 ? (
            <div className="sc-empty">
              <div className="sc-empty-icon">☆</div>
              <h3>Inga sparade kandidater</h3>
              <p>Klicka på stjärnan på en kandidat i katalogen för att spara dem här.</p>
              <Link href="/employer/directory" className="rb-btn rb-btn-primary" style={{ marginTop: '1rem', display: 'inline-flex' }}>
                🔍 Sök kandidater
              </Link>
            </div>
          ) : (
            <div className="sc-grid">
              {candidates.map(sc => {
                const initials = (sc.contact?.full_name || '?').split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
                return (
                  <div key={sc.id} className="sc-card">
                    <div className="sc-avatar">
                      {sc.profile.avatar_url
                        ? <img src={sc.profile.avatar_url} alt={initials} />
                        : initials
                      }
                    </div>
                    <div className="sc-info">
                      {/* Name / locked */}
                      {isPremium && sc.contact ? (
                        <>
                          <div className="sc-name">{sc.contact.full_name}</div>
                          <div className="sc-meta">{sc.profile.trade} · {sc.profile.city} · {sc.profile.experience_years} år</div>
                          <div className="sc-contact">
                            {sc.contact.contact_email && <span className="sc-contact-item">✉️ {sc.contact.contact_email}</span>}
                            {sc.contact.contact_phone && <span className="sc-contact-item">📞 {sc.contact.contact_phone}</span>}
                          </div>
                        </>
                      ) : (
                        <>
                          <div className="sc-name">{sc.profile.trade || 'Kandidat'} · {sc.profile.city}</div>
                          <div className="sc-meta">{sc.profile.experience_years} år erfarenhet</div>
                          <div className="sc-locked">
                            🔒 <span className="sc-locked-blur">namn@email.se · 070-xxx xx xx</span>
                            <Link href="/employer/directory" className="rb-btn" style={{ fontSize: 11, padding: '3px 10px', marginLeft: 'auto' }}>Uppgradera</Link>
                          </div>
                        </>
                      )}

                      <div className="sc-tags">
                        {sc.profile.trade && <span className="sc-tag">🔧 {sc.profile.trade}</span>}
                        {sc.profile.availability && (
                          <span className={`sc-tag ${sc.profile.availability === 'omgaende' ? 'sc-tag-green' : ''}`}>
                            📅 {AVAILABILITY_LABELS[sc.profile.availability] || sc.profile.availability}
                          </span>
                        )}
                        <span className="sc-tag">💼 {sc.profile.experience_years} år</span>
                      </div>

                      {/* Note */}
                      {editingNote === sc.id ? (
                        <div style={{ marginBottom: 8 }}>
                          <textarea
                            className="sc-note-input"
                            rows={2}
                            value={noteText}
                            onChange={e => setNoteText(e.target.value)}
                            placeholder="Lägg till en anteckning om denna kandidat..."
                          />
                          <div style={{ display: 'flex', gap: 6, marginTop: 4 }}>
                            <button className="rb-btn rb-btn-primary" style={{ fontSize: 12, padding: '4px 12px' }} onClick={() => handleSaveNote(sc.id)}>Spara</button>
                            <button className="rb-btn" style={{ fontSize: 12, padding: '4px 12px' }} onClick={() => setEditingNote(null)}>Avbryt</button>
                          </div>
                        </div>
                      ) : (
                        sc.note && <div className="sc-note">📝 {sc.note}</div>
                      )}

                      <div className="sc-actions">
                        {userId && <MessageButton recipientId={sc.candidate_id} recipientName={sc.contact?.full_name || 'Kandidat'} />}
                        <button
                          className="rb-btn"
                          style={{ fontSize: 12, padding: '5px 12px' }}
                          onClick={() => { setEditingNote(sc.id); setNoteText(sc.note || ''); }}
                        >
                          📝 {sc.note ? 'Redigera anteckning' : 'Lägg till anteckning'}
                        </button>
                        <button
                          className="rb-btn"
                          style={{ fontSize: 12, padding: '5px 12px', color: '#ef4444', borderColor: '#fca5a5' }}
                          onClick={() => handleRemove(sc.id)}
                        >
                          ✕ Ta bort
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
