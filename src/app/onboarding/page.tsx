'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { UserRole } from '@/types';

const TRADES = [
  { id: 'snickare', label: 'Snickare', desc: 'Träarbete, stomme och inredning', icon: '🪚' },
  { id: 'elektriker', label: 'Elektriker', desc: 'Elinstallation och service', icon: '⚡' },
  { id: 'rörmokare', label: 'Rörmokare / VVS', desc: 'Värme, ventilation och sanitet', icon: '🔧' },
  { id: 'målare', label: 'Målare', desc: 'In- och utvändig målning', icon: '🖌️' },
  { id: 'murare', label: 'Murare / Plattsättare', desc: 'Murning, puts och kakelsättning', icon: '🧱' },
  { id: 'svetsare', label: 'Svetsare', desc: 'Stål- och metallkonstruktion', icon: '🔥' },
  { id: 'bartender', label: 'Bartender', desc: 'Bar och servering', icon: '🍸' },
  { id: 'kock', label: 'Kock / Kökspersonal', desc: 'Matlagning och köksdrift', icon: '👨‍🍳' },
  { id: 'annat', label: 'Annat yrke', desc: 'Övriga yrken', icon: '🛠️' },
];

const AVAILABILITIES = [
  { id: 'omgaende', label: 'Omgående', desc: 'Klar för start direkt' },
  { id: '2_veckor', label: 'Inom 2 veckor', desc: 'Kortare uppsägningstid' },
  { id: '1_manad', label: 'Inom 1 månad', desc: 'Standarduppsägningstid' },
  { id: 'inte_tillganglig', label: 'Inte tillgänglig just nu', desc: 'Längre varsel eller pågående uppdrag' },
];

export default function OnboardingPage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const employerFileInputRef = useRef<HTMLInputElement>(null);

  const [userId, setUserId] = useState<string | null>(null);
  const [role, setRole] = useState<UserRole>('job_seeker');
  const [authLoading, setAuthLoading] = useState(true);

  const [step, setStep] = useState(1);
  const [fullName, setFullName] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [trade, setTrade] = useState('');
  const [customTrade, setCustomTrade] = useState('');
  const [city, setCity] = useState('');
  const [experienceYears, setExperienceYears] = useState(2);
  const [availability, setAvailability] = useState('omgaende');
  const [bio, setBio] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [companyPhone, setCompanyPhone] = useState('');

  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [avatarUploading, setAvatarUploading] = useState(false);

  const [saving, setSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    const checkUser = async () => {
      try {
        const { data: { user }, error: authError } = await supabase.auth.getUser();
        if (authError || !user) { router.push('/login'); return; }
        setUserId(user.id);
        setContactEmail(user.email || '');
        const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single();
        if (profile) setRole(profile.role);
      } catch { router.push('/login'); }
      finally { setAuthLoading(false); }
    };
    checkUser();
  }, [router]);

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) { setErrorMessage('Bilden får max vara 5 MB.'); return; }
    setAvatarFile(file);
    setAvatarPreview(URL.createObjectURL(file));
    setErrorMessage(null);
  };

  const uploadAvatar = async (uid: string): Promise<string | null> => {
    if (!avatarFile) return null;
    setAvatarUploading(true);
    try {
      const ext = avatarFile.name.split('.').pop();
      const path = `${uid}/avatar.${ext}`;
      const { error } = await supabase.storage.from('avatars').upload(path, avatarFile, { upsert: true });
      if (error) throw error;
      const { data } = supabase.storage.from('avatars').getPublicUrl(path);
      return data.publicUrl;
    } catch { return null; }
    finally { setAvatarUploading(false); }
  };

  const nextStep = () => {
    if (step === 1) {
      if (!fullName.trim()) { setErrorMessage('Vänligen fyll i ditt fullständiga namn.'); return; }
      if (!phone.trim()) { setErrorMessage('Vänligen fyll i ditt telefonnummer.'); return; }
    }
    if (step === 2) {
      if (!trade) { setErrorMessage('Vänligen välj ett yrkesområde.'); return; }
      if (trade === 'annat' && !customTrade.trim()) { setErrorMessage('Vänligen specificera ditt yrke.'); return; }
      if (!city.trim()) { setErrorMessage('Vänligen ange din nuvarande ort/stad.'); return; }
    }
    setErrorMessage(null);
    setStep(p => p + 1);
  };

  const prevStep = () => { setErrorMessage(null); setStep(p => p - 1); };

  const handleSubmitSeeker = async () => {
    if (!userId) return;
    setSaving(true);
    setErrorMessage(null);
    const finalTrade = trade === 'annat' ? customTrade : TRADES.find(t => t.id === trade)?.label || trade;
    try {
      const avatarUrl = await uploadAvatar(userId);
      const { error: pe } = await supabase.from('profiles').upsert({
        id: userId, role: 'job_seeker', trade: finalTrade, city,
        experience_years: Number(experienceYears), availability, bio: bio || null,
        is_premium: false, is_premium_locked: true, updated_at: new Date().toISOString(),
        ...(avatarUrl && { avatar_url: avatarUrl }),
      });
      if (pe) throw new Error(pe.message);
      const { error: ce } = await supabase.from('profile_contact_details').upsert({
        profile_id: userId, full_name: fullName, contact_email: contactEmail, contact_phone: phone,
      });
      if (ce) throw new Error(ce.message);
      setSuccessMessage('Din profil är sparad! Omdirigerar...');
      setTimeout(() => router.push('/seeker/dashboard'), 2000);
    } catch (err: any) {
      setErrorMessage(err.message || 'Ett fel uppstod.');
    } finally { setSaving(false); }
  };

  const handleSubmitEmployer = async () => {
    if (!userId) return;
    setSaving(true);
    setErrorMessage(null);
    try {
      const avatarUrl = await uploadAvatar(userId);
      const { error: pe } = await supabase.from('profiles').upsert({
        id: userId, role: 'employer', updated_at: new Date().toISOString(),
        ...(avatarUrl && { avatar_url: avatarUrl }),
      });
      if (pe) throw new Error(pe.message);
      const { error: ce } = await supabase.from('profile_contact_details').upsert({
        profile_id: userId, full_name: companyName || 'Företagsanvändare',
        contact_email: contactEmail, contact_phone: companyPhone || null,
      });
      if (ce) throw new Error(ce.message);
      setSuccessMessage('Företagsprofil sparad! Omdirigerar...');
      setTimeout(() => router.push('/'), 2000);
    } catch (err: any) {
      setErrorMessage(err.message || 'Ett fel uppstod.');
    } finally { setSaving(false); }
  };

  if (authLoading) {
    return (
      <div style={{ minHeight: '100vh', background: '#f5f9fd', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'DM Sans', sans-serif" }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ width: 40, height: 40, border: '3px solid #e0eaf4', borderTopColor: '#1a5fa8', borderRadius: '50%', animation: 'spin 0.7s linear infinite', margin: '0 auto 12px' }} />
          <p style={{ fontSize: 13, color: '#4a6480' }}>Kontrollerar session...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=DM+Sans:wght@300;400;500&display=swap');
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes fadeUp { from { opacity:0; transform:translateY(16px); } to { opacity:1; transform:translateY(0); } }

        .ob-wrap { color: #1a3a5c; min-height: 60vh; display: flex; flex-direction: column; }

        .ob-body { flex: 1; display: flex; align-items: flex-start; justify-content: center; padding: 2.5rem 1rem 4rem; max-width: 720px; margin: 0 auto; width: 100%; }
        .ob-card { background: #fff; border: 1px solid #e0eaf4; border-radius: 20px; padding: 2.5rem; width: 100%; max-width: 600px; animation: fadeUp 0.4s ease both; }

        .ob-steps { display: flex; align-items: center; gap: 0; margin-bottom: 2rem; }
        .ob-step-dot { width: 32px; height: 32px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 13px; font-weight: 500; flex-shrink: 0; border: 2px solid #e0eaf4; background: #fff; color: #9ca3af; transition: all 0.3s; }
        .ob-step-dot.active { background: #1a5fa8; border-color: #1a5fa8; color: #fff; }
        .ob-step-dot.done { background: #e6f1fb; border-color: #1a5fa8; color: #1a5fa8; }
        .ob-step-line { flex: 1; height: 2px; background: #e0eaf4; transition: background 0.3s; }
        .ob-step-line.done { background: #1a5fa8; }
        .ob-step-labels { display: grid; grid-template-columns: repeat(3, 1fr); margin-top: 6px; margin-bottom: 2rem; }
        .ob-step-label { font-size: 10px; font-weight: 500; text-transform: uppercase; letter-spacing: 0.5px; color: #9ca3af; }
        .ob-step-label:nth-child(2) { text-align: center; }
        .ob-step-label:nth-child(3) { text-align: right; }
        .ob-step-label.active { color: #1a5fa8; }

        .ob-section-title { font-family: 'DM Serif Display', serif; font-size: 22px; color: #1a3a5c; margin: 0 0 0.25rem; }
        .ob-section-sub { font-size: 13px; color: #4a6480; margin: 0 0 1.75rem; }

        .ob-label { display: block; font-size: 11px; font-weight: 500; letter-spacing: 0.8px; text-transform: uppercase; color: #4a6480; margin-bottom: 6px; }
        .ob-input { width: 100%; padding: 10px 14px; font-family: 'DM Sans', sans-serif; font-size: 14px; color: #1a3a5c; background: #f5f9fd; border: 1px solid #e0eaf4; border-radius: 10px; outline: none; transition: border 0.15s; box-sizing: border-box; }
        .ob-input:focus { border-color: #1a5fa8; background: #fff; }
        .ob-input:disabled { color: #9ca3af; cursor: not-allowed; background: #f9fafb; }
        .ob-group { margin-bottom: 1.25rem; }
        .ob-grid2 { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; }

        .ob-avatar-area { display: flex; align-items: center; gap: 16px; margin-bottom: 1.5rem; padding: 1rem; background: #f5f9fd; border: 1px solid #e0eaf4; border-radius: 14px; }
        .ob-avatar-circle { width: 72px; height: 72px; border-radius: 50%; border: 2px dashed #b8d0e8; display: flex; align-items: center; justify-content: center; overflow: hidden; cursor: pointer; flex-shrink: 0; transition: border-color 0.15s; background: #fff; }
        .ob-avatar-circle:hover { border-color: #1a5fa8; }
        .ob-avatar-circle img { width: 100%; height: 100%; object-fit: cover; }
        .ob-avatar-btn { font-family: 'DM Sans', sans-serif; font-size: 12px; padding: 6px 14px; border-radius: 99px; border: 1px solid #b8d0e8; background: #fff; color: #1a3a5c; cursor: pointer; transition: all 0.15s; }
        .ob-avatar-btn:hover { border-color: #1a5fa8; color: #1a5fa8; background: #eaf3fb; }
        .ob-avatar-hint { font-size: 11px; color: #9ca3af; margin-top: 4px; }
        .ob-avatar-remove { font-size: 11px; color: #ef4444; cursor: pointer; margin-top: 3px; background: none; border: none; padding: 0; }

        .ob-trade-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; margin-bottom: 1.25rem; }
        .ob-trade-btn { display: flex; align-items: center; gap: 10px; padding: 10px 12px; border-radius: 10px; border: 1px solid #e0eaf4; background: #f5f9fd; cursor: pointer; transition: all 0.15s; text-align: left; }
        .ob-trade-btn:hover { border-color: #b8d0e8; background: #eaf3fb; }
        .ob-trade-btn.selected { border-color: #1a5fa8; border-width: 2px; background: #e6f1fb; }
        .ob-trade-icon { font-size: 20px; flex-shrink: 0; }
        .ob-trade-name { font-size: 13px; font-weight: 500; color: #1a3a5c; }
        .ob-trade-desc { font-size: 11px; color: #4a6480; margin-top: 1px; }

        .ob-avail-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; margin-bottom: 1.25rem; }
        .ob-avail-btn { padding: 12px 14px; border-radius: 10px; border: 1px solid #e0eaf4; background: #f5f9fd; cursor: pointer; transition: all 0.15s; text-align: left; }
        .ob-avail-btn:hover { border-color: #b8d0e8; background: #eaf3fb; }
        .ob-avail-btn.selected { border-color: #1a5fa8; border-width: 2px; background: #e6f1fb; }
        .ob-avail-name { font-size: 13px; font-weight: 500; color: #1a3a5c; }
        .ob-avail-desc { font-size: 11px; color: #4a6480; margin-top: 2px; }

        .ob-range { width: 100%; accent-color: #1a5fa8; }
        .ob-range-labels { display: flex; justify-content: space-between; font-size: 10px; color: #9ca3af; margin-top: 4px; }

        .ob-textarea { width: 100%; padding: 10px 14px; font-family: 'DM Sans', sans-serif; font-size: 14px; color: #1a3a5c; background: #f5f9fd; border: 1px solid #e0eaf4; border-radius: 10px; outline: none; transition: border 0.15s; box-sizing: border-box; resize: none; }
        .ob-textarea:focus { border-color: #1a5fa8; background: #fff; }

        .ob-alert { padding: 10px 14px; border-radius: 10px; font-size: 13px; margin-bottom: 1.25rem; }
        .ob-alert-error { background: #fff0f0; border: 1px solid #fca5a5; color: #b91c1c; }
        .ob-alert-success { background: #e6f1fb; border: 1px solid #b8d0e8; color: #1a5fa8; }

        .ob-footer { display: flex; justify-content: space-between; align-items: center; margin-top: 2rem; padding-top: 1.5rem; border-top: 1px solid #e0eaf4; }
        .ob-btn-back { font-family: 'DM Sans', sans-serif; font-size: 13px; padding: 9px 20px; border-radius: 99px; border: 1px solid #b8d0e8; background: transparent; color: #1a3a5c; cursor: pointer; transition: background 0.15s; }
        .ob-btn-back:hover { background: #eaf3fb; }
        .ob-btn-next { font-family: 'DM Sans', sans-serif; font-size: 14px; font-weight: 500; padding: 10px 26px; border-radius: 99px; border: none; background: #1a5fa8; color: #fff; cursor: pointer; transition: background 0.15s; display: flex; align-items: center; gap: 6px; }
        .ob-btn-next:hover { background: #134a85; }
        .ob-btn-next:disabled { opacity: 0.6; cursor: not-allowed; }
        .ob-btn-employer { background: #f0a020; }
        .ob-btn-employer:hover { background: #d48a10; }

        .ob-spinner { width: 18px; height: 18px; border: 2px solid rgba(255,255,255,0.4); border-top-color: #fff; border-radius: 50%; animation: spin 0.7s linear infinite; }

        @media (max-width: 600px) {
          .ob-card { padding: 1.5rem; }
          .ob-trade-grid, .ob-avail-grid, .ob-grid2 { grid-template-columns: 1fr; }
        }
      `}</style>

      <div className="ob-wrap">
        <div className="ob-body">
          <div className="ob-card">

            {role === 'job_seeker' ? (
              <>
                {/* Steg-indikator */}
                <div className="ob-steps">
                  <div className={`ob-step-dot ${step >= 1 ? 'active' : ''} ${step > 1 ? 'done' : ''}`}>{step > 1 ? '✓' : '1'}</div>
                  <div className={`ob-step-line ${step > 1 ? 'done' : ''}`} />
                  <div className={`ob-step-dot ${step >= 2 ? 'active' : ''} ${step > 2 ? 'done' : ''}`}>{step > 2 ? '✓' : '2'}</div>
                  <div className={`ob-step-line ${step > 2 ? 'done' : ''}`} />
                  <div className={`ob-step-dot ${step >= 3 ? 'active' : ''}`}>3</div>
                </div>
                <div className="ob-step-labels">
                  <span className={`ob-step-label ${step === 1 ? 'active' : ''}`}>Kontakt</span>
                  <span className={`ob-step-label ${step === 2 ? 'active' : ''}`}>Yrke & Ort</span>
                  <span className={`ob-step-label ${step === 3 ? 'active' : ''}`}>Tillgänglighet</span>
                </div>

                {errorMessage && <div className="ob-alert ob-alert-error">{errorMessage}</div>}
                {successMessage && <div className="ob-alert ob-alert-success">{successMessage}</div>}

                {/* STEG 1 */}
                {step === 1 && (
                  <>
                    <div className="ob-section-title">Grundläggande info</div>
                    <div className="ob-section-sub">Hur kan arbetsgivare kontakta dig?</div>

                    {/* Profilbild */}
                    <div className="ob-avatar-area">
                      <div className="ob-avatar-circle" onClick={() => fileInputRef.current?.click()}>
                        {avatarPreview
                          ? <img src={avatarPreview} alt="Förhandsgranskning" />
                          : <span style={{ fontSize: 28 }}>📷</span>
                        }
                      </div>
                      <div>
                        <div style={{ fontSize: 13, fontWeight: 500, color: '#1a3a5c', marginBottom: 6 }}>Profilbild <span style={{ fontWeight: 400, color: '#9ca3af' }}>(valfritt)</span></div>
                        <button type="button" className="ob-avatar-btn" onClick={() => fileInputRef.current?.click()}>
                          {avatarPreview ? 'Byt bild' : 'Välj bild'}
                        </button>
                        <div className="ob-avatar-hint">JPG, PNG eller WebP · max 5 MB</div>
                        {avatarPreview && (
                          <button type="button" className="ob-avatar-remove" onClick={() => { setAvatarFile(null); setAvatarPreview(null); }}>Ta bort</button>
                        )}
                      </div>
                      <input ref={fileInputRef} type="file" accept="image/jpeg,image/png,image/webp" style={{ display: 'none' }} onChange={handleAvatarChange} />
                    </div>

                    <div className="ob-group">
                      <label className="ob-label">Fullständigt namn</label>
                      <input type="text" className="ob-input" value={fullName} onChange={e => setFullName(e.target.value)} placeholder="t.ex. Sven Svensson" />
                    </div>
                    <div className="ob-group">
                      <label className="ob-label">Telefonnummer</label>
                      <input type="tel" className="ob-input" value={phone} onChange={e => setPhone(e.target.value)} placeholder="t.ex. 070-123 45 67" />
                    </div>
                    <div className="ob-group" style={{ opacity: 0.6 }}>
                      <label className="ob-label">E-postadress</label>
                      <input type="email" className="ob-input" disabled value={contactEmail} />
                      <div style={{ fontSize: 11, color: '#9ca3af', marginTop: 4 }}>Ändras i säkerhetsinställningarna</div>
                    </div>
                  </>
                )}

                {/* STEG 2 */}
                {step === 2 && (
                  <>
                    <div className="ob-section-title">Yrke & Ort</div>
                    <div className="ob-section-sub">Välj ditt primära yrke och var du befinner dig.</div>

                    <label className="ob-label">Yrkesområde</label>
                    <div className="ob-trade-grid">
                      {TRADES.map(t => (
                        <button key={t.id} type="button" className={`ob-trade-btn ${trade === t.id ? 'selected' : ''}`} onClick={() => setTrade(t.id)}>
                          <span className="ob-trade-icon">{t.icon}</span>
                          <div>
                            <div className="ob-trade-name">{t.label}</div>
                            <div className="ob-trade-desc">{t.desc}</div>
                          </div>
                        </button>
                      ))}
                    </div>

                    {trade === 'annat' && (
                      <div className="ob-group">
                        <label className="ob-label">Specificera yrke</label>
                        <input type="text" className="ob-input" value={customTrade} onChange={e => setCustomTrade(e.target.value)} placeholder="t.ex. Takläggare, Ställningsbyggare..." />
                      </div>
                    )}

                    <div className="ob-grid2">
                      <div className="ob-group">
                        <label className="ob-label">Ort / Stad</label>
                        <input type="text" className="ob-input" value={city} onChange={e => setCity(e.target.value)} placeholder="t.ex. Stockholm" />
                      </div>
                      <div className="ob-group">
                        <label className="ob-label" style={{ display: 'flex', justifyContent: 'space-between' }}>
                          <span>Erfarenhet</span>
                          <span style={{ color: '#1a5fa8', fontWeight: 500 }}>{experienceYears} år</span>
                        </label>
                        <input type="range" min="0" max="25" value={experienceYears} onChange={e => setExperienceYears(Number(e.target.value))} className="ob-range" style={{ marginTop: 10 }} />
                        <div className="ob-range-labels"><span>0</span><span>10</span><span>25+</span></div>
                      </div>
                    </div>
                  </>
                )}

                {/* STEG 3 */}
                {step === 3 && (
                  <>
                    <div className="ob-section-title">Tillgänglighet & Bio</div>
                    <div className="ob-section-sub">När kan du börja och berätta lite om dig själv.</div>

                    <label className="ob-label">När kan du börja?</label>
                    <div className="ob-avail-grid">
                      {AVAILABILITIES.map(a => (
                        <button key={a.id} type="button" className={`ob-avail-btn ${availability === a.id ? 'selected' : ''}`} onClick={() => setAvailability(a.id)}>
                          <div className="ob-avail-name">{a.label}</div>
                          <div className="ob-avail-desc">{a.desc}</div>
                        </button>
                      ))}
                    </div>

                    <div className="ob-group">
                      <label className="ob-label" style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span>Bio</span><span style={{ color: '#9ca3af', fontWeight: 400, textTransform: 'none', letterSpacing: 0 }}>{bio.length}/500</span>
                      </label>
                      <textarea className="ob-textarea" rows={4} maxLength={500} value={bio} onChange={e => setBio(e.target.value)}
                        placeholder="Berätta om din erfarenhet, dina styrkor och vad du söker..." />
                    </div>
                  </>
                )}

                <div className="ob-footer">
                  <div>{step > 1 && <button type="button" className="ob-btn-back" onClick={prevStep}>← Bakåt</button>}</div>
                  <div>
                    {step < 3
                      ? <button type="button" className="ob-btn-next" onClick={nextStep}>Nästa steg →</button>
                      : <button type="button" className="ob-btn-next" onClick={handleSubmitSeeker} disabled={saving || avatarUploading}>
                          {saving || avatarUploading ? <div className="ob-spinner" /> : 'Slutför profil ✓'}
                        </button>
                    }
                  </div>
                </div>
              </>

            ) : (
              <>
                <div className="ob-section-title">Företagsprofil</div>
                <div className="ob-section-sub">Fyll i era uppgifter för att börja söka kandidater.</div>

                {errorMessage && <div className="ob-alert ob-alert-error">{errorMessage}</div>}
                {successMessage && <div className="ob-alert ob-alert-success">{successMessage}</div>}

                {/* Företagslogga */}
                <div className="ob-avatar-area">
                  <div className="ob-avatar-circle" onClick={() => employerFileInputRef.current?.click()}>
                    {avatarPreview
                      ? <img src={avatarPreview} alt="Logga" />
                      : <span style={{ fontSize: 28 }}>🏢</span>
                    }
                  </div>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 500, color: '#1a3a5c', marginBottom: 6 }}>Företagslogga <span style={{ fontWeight: 400, color: '#9ca3af' }}>(valfritt)</span></div>
                    <button type="button" className="ob-avatar-btn" onClick={() => employerFileInputRef.current?.click()}>
                      {avatarPreview ? 'Byt bild' : 'Välj bild'}
                    </button>
                    <div className="ob-avatar-hint">JPG, PNG eller WebP · max 5 MB</div>
                  </div>
                  <input ref={employerFileInputRef} type="file" accept="image/jpeg,image/png,image/webp" style={{ display: 'none' }} onChange={handleAvatarChange} />
                </div>

                <div className="ob-group">
                  <label className="ob-label">Företagsnamn</label>
                  <input type="text" className="ob-input" value={companyName} onChange={e => setCompanyName(e.target.value)} placeholder="t.ex. Bygg & Renovering AB" />
                </div>
                <div className="ob-group">
                  <label className="ob-label">Telefonnummer</label>
                  <input type="tel" className="ob-input" value={companyPhone} onChange={e => setCompanyPhone(e.target.value)} placeholder="t.ex. 08-123 456 00" />
                </div>
                <div className="ob-group" style={{ opacity: 0.6 }}>
                  <label className="ob-label">E-postadress</label>
                  <input type="email" className="ob-input" disabled value={contactEmail} />
                </div>

                <div className="ob-footer" style={{ justifyContent: 'flex-end' }}>
                  <button type="button" className="ob-btn-next ob-btn-employer" onClick={handleSubmitEmployer} disabled={saving || avatarUploading || !companyName.trim()}>
                    {saving || avatarUploading ? <div className="ob-spinner" /> : 'Spara profil ✓'}
                  </button>
                </div>
              </>
            )}

          </div>
        </div>

      </div>
    </>
  );
}
