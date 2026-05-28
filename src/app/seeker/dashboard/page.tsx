'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { SWEDISH_CITIES, TRADES_BY_SECTOR } from '@/lib/constants';
import ImageCropperModal from '@/components/ImageCropperModal';
import { ProfileStrength } from '@/components/ProfileStrength';

// Availability styling map for the live preview
const AVAILABILITY_MAP: Record<string, { label: string; textClass: string; bgClass: string }> = {
  omgaende: { label: 'Tillgänglig omgående', textClass: 'text-emerald-600', bgClass: 'bg-emerald-50 border-emerald-200' },
  '2_veckor': { label: 'Tillgänglig inom 2 veckor', textClass: 'text-teal-600', bgClass: 'bg-teal-50 border-teal-200' },
  '1_manad': { label: 'Tillgänglig inom 1 månad', textClass: 'text-sky-600', bgClass: 'bg-sky-50 border-sky-200' },
  inte_tillganglig: { label: 'Inte tillgänglig just nu', textClass: 'text-slate-500', bgClass: 'bg-slate-50 border-slate-200' },
};

export default function SeekerDashboard() {
  const router = useRouter();

  // Session & User State
  const [userId, setUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Form State (Real-time synced with live preview)
  const [fullName, setFullName] = useState('');
  const [trade, setTrade] = useState('');
  const [city, setCity] = useState('');
  const [experienceYears, setExperienceYears] = useState(2);
  const [availability, setAvailability] = useState('omgaende');
  const [bio, setBio] = useState('');
  const [certificates, setCertificates] = useState<string[]>([]); // Nytt state för certifikat
  const [contactEmail, setContactEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [isPremium, setIsPremium] = useState(false);
  const [weeklyViews, setWeeklyViews] = useState(0);
  const [isPremiumLocked, setIsPremiumLocked] = useState(true);

  // Avatar state
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarUploading, setAvatarUploading] = useState(false);
  const [selectedImageSrc, setSelectedImageSrc] = useState<string | null>(null);
  const [isCropperOpen, setIsCropperOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Preview Mode Option: 'compact' (Card view) or 'detailed' (Full sheet view)
  const [previewMode, setPreviewMode] = useState<'compact' | 'detailed'>('compact');

  // Load profile data on mount
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const { data: { user }, error: authError } = await supabase.auth.getUser();

        if (authError || !user) {
          router.push('/login');
          return;
        }

        setUserId(user.id);

        // 1. Fetch core profile details
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();

        // 2. Fetch contact details
        const { data: contact } = await supabase
          .from('profile_contact_details')
          .select('*')
          .eq('profile_id', user.id)
          .single();

        if (profile) {
          // If the logged in user is an employer, redirect them out
          if (profile.role !== 'job_seeker') {
            router.push('/employer/directory');
            return;
          }

          setTrade(profile.trade || '');
          setCity(profile.city || '');
          setExperienceYears(profile.experience_years ?? 0);
          setAvailability(profile.availability || 'omgaende');
          setBio(profile.bio || '');
          // Ladda in sparade certifikat (om de finns, annars en tom array)
          const rawCerts = profile.certificates;
          let parsedCerts: string[] = [];
          if (Array.isArray(rawCerts)) {
            // Unwrap any nested JSON-encoded strings
            parsedCerts = rawCerts.map((c: any) => {
              let val = c;
              while (typeof val === 'string' && (val.startsWith('[') || val.startsWith('"'))) {
                try { val = JSON.parse(val); } catch { break; }
              }
              return Array.isArray(val) ? val[0] : String(val);
            }).filter((c: string) => c && c.trim());
          } else if (typeof rawCerts === 'string') {
            try { parsedCerts = JSON.parse(rawCerts); } catch { parsedCerts = [rawCerts]; }
          }
          setCertificates(parsedCerts);
          setIsPremium(profile.is_premium || false);
          setAvatarUrl(profile.avatar_url || null);
          setIsPremiumLocked(profile.is_premium_locked ?? true);
        }

        if (contact) {
          setFullName(contact.full_name || '');
          setContactEmail(contact.contact_email || user.email || '');
          setPhone(contact.contact_phone || '');
        } else {
          setContactEmail(user.email || '');
        }

      } catch (err) {
        console.error('Failed to load profile data:', err);
        setErrorMessage('Ett fel uppstod när din profil laddades.');
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [router]);

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !userId) return;
    if (file.size > 8 * 1024 * 1024) { setErrorMessage('Bilden får max vara 8 MB.'); return; }
    
    const reader = new FileReader();
    reader.onload = () => {
      setSelectedImageSrc(reader.result as string);
      setIsCropperOpen(true);
    };
    reader.readAsDataURL(file);
  };

  const handleCropComplete = async (croppedBlob: Blob) => {
    if (!userId) return;
    setAvatarUploading(true);
    setErrorMessage(null);
    setSuccessMessage(null);
    try {
      const ext = 'jpg';
      const path = `${userId}/avatar.${ext}`;
      const { error } = await supabase.storage.from('avatars').upload(path, croppedBlob, { upsert: true });
      if (error) throw error;
      const { data } = supabase.storage.from('avatars').getPublicUrl(path);
      const url = data.publicUrl;
      await supabase.from('profiles').update({ avatar_url: url }).eq('id', userId);
      setAvatarUrl(url);
      setAvatarPreview(URL.createObjectURL(croppedBlob));
      setSuccessMessage('Profilbild uppdaterad!');
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err: any) {
      setErrorMessage('Kunde inte ladda upp bilden.');
    } finally {
      setAvatarUploading(false);
    }
  };

  // Hantera dynamiska fält för certifikat
  const handleCertificateChange = (index: number, value: string) => {
    const newCerts = [...certificates];
    newCerts[index] = value;
    setCertificates(newCerts);
  };

  const removeCertificate = (index: number) => {
    const newCerts = certificates.filter((_, i) => i !== index);
    setCertificates(newCerts);
  };

  const addCertificate = () => {
    setCertificates([...certificates, '']);
  };

  // Handle saving data to Supabase
  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userId) return;

    setSaving(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    // Rensa bort eventuella tomma certifikat-rader innan sparning
    const cleanedCertificates = certificates.filter(c => c.trim() !== '');

    try {
      // 1. Save profile details
      const { error: profileError } = await supabase
        .from('profiles')
        .upsert({
          id: userId,
          role: 'job_seeker',
          trade: trade || null,
          city: city || null,
          experience_years: Number(experienceYears),
          availability: availability,
          bio: bio || null,
          certificates: cleanedCertificates, // Spara certifikaten
          is_premium: isPremium,
          is_premium_locked: isPremiumLocked,
          updated_at: new Date().toISOString(),
        });

      if (profileError) throw new Error(`Profil-sparning misslyckades: ${profileError.message}`);

      // 2. Save contact details
      const { error: contactError } = await supabase
        .from('profile_contact_details')
        .upsert({
          profile_id: userId,
          full_name: fullName,
          contact_email: contactEmail,
          contact_phone: phone || null,
        });

      if (contactError) throw new Error(`Kontaktuppgifter-sparning misslyckades: ${contactError.message}`);

      setCertificates(cleanedCertificates); // Uppdatera state med rensad lista
      setSuccessMessage('Din profil har sparats och uppdaterats i realtid!');
      
      // Auto clear success message after 3 seconds
      setTimeout(() => {
        setSuccessMessage(null);
      }, 3000);

    } catch (err: any) {
      setErrorMessage(err.message || 'Ett oväntat fel uppstod.');
    } finally {
      setSaving(false);
    }
  };

  // Sign out handler
  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      router.push('/login');
    } catch (err) {
      console.error('Logout error:', err);
    }
  };

  // Get Initials for avatar preview
  const getInitials = (name: string) => {
    if (!name) return 'ST';
    return name
      .split(' ')
      .map((part) => part[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center text-[var(--muted)]">
        <div className="w-12 h-12 border-4 border-[var(--border)] border-t-[var(--brand)] rounded-full animate-spin mb-4" />
        <p className="text-sm tracking-widest uppercase">Hämtar profiluppgifter...</p>
      </div>
    );
  }

  const availabilityInfo = AVAILABILITY_MAP[availability] || AVAILABILITY_MAP.omgaende;
  const activeCertificates = certificates.filter(c => c.trim() !== '');

  return (
    <div className="min-h-screen w-full text-[var(--brand-navy)] relative">


      {/* Main Dashboard Layout */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* ============================================================== */}
          {/* PROFILE EDITOR FORM (LEFT 7 COLUMNS)                           */}
          {/* ============================================================== */}
          <div className="lg:col-span-7 space-y-6">
            <div className="bg-white border border-[var(--border)] rounded-[20px] p-6 sm:p-8 shadow-sm">
              <div>
                <h1 className="text-xl sm:text-2xl font-serif text-[var(--brand-navy)] tracking-tight">
                  Hantera din <span className="text-[var(--brand)]">Yrkesprofil</span>
                </h1>
                <p className="text-xs text-[var(--muted)] mt-1">
                  Ändra din information och se direkt i förhandsgranskningen hur din profil visas för arbetsgivare.
                </p>
              </div>

              {/* Feedback messages */}
              {errorMessage && (
                <div className="mt-4 p-4 rounded-lg bg-red-50 border border-red-200 text-red-700 text-xs tracking-wide">
                  {errorMessage}
                </div>
              )}
              {successMessage && (
                <div className="mt-4 p-4 rounded-lg bg-[#eaf3fb] border border-[var(--border-strong)] text-[var(--brand)] text-xs tracking-wide">
                  {successMessage}
                </div>
              )}

              {/* Profilstyrka-räknare */}
              <ProfileStrength
                fullName={fullName}
                trade={trade}
                city={city}
                bio={bio}
                phone={phone}
                avatarUrl={avatarUrl}
                avatarPreview={avatarPreview}
                certificates={certificates}
                experienceYears={experienceYears}
              />

              <form onSubmit={handleSaveProfile} className="space-y-6 mt-8">

                {/* 0. Profilbild */}
                <div className="flex items-center gap-4 p-4 bg-[var(--surface)] border border-[var(--border)] rounded-xl">
                  <div
                    className="w-16 h-16 rounded-full border-2 border-dashed border-[var(--border-strong)] overflow-hidden flex items-center justify-center cursor-pointer hover:border-[var(--brand)] transition-colors flex-shrink-0 bg-white"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    {(avatarPreview || avatarUrl)
                      ? <img src={avatarPreview || avatarUrl!} alt="Avatar" style={{width:'100%',height:'100%',objectFit:'cover'}} />
                      : <span className="text-2xl">📷</span>
                    }
                  </div>
                  <div>
                    <div className="text-xs font-semibold text-[var(--brand-navy)] mb-1">Profilbild</div>
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={avatarUploading}
                      className="px-3 py-1.5 rounded-full border border-[var(--border-strong)] text-[var(--brand-navy)] text-xs hover:border-[var(--brand)] hover:bg-[#eaf3fb] transition-all disabled:opacity-50"
                    >
                      {avatarUploading ? 'Laddar upp...' : avatarPreview || avatarUrl ? 'Byt bild' : 'Välj bild'}
                    </button>
                    <div className="text-[10px] text-slate-500 mt-1">JPG, PNG eller WebP · max 5 MB</div>
                  </div>
                  <input ref={fileInputRef} type="file" accept="image/jpeg,image/png,image/webp" className="hidden" onChange={handleAvatarChange} />
                </div>

                {/* 1. Full name & Phone */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="block text-xs font-medium text-[var(--muted)] uppercase tracking-widest">
                      Namn
                    </label>
                    <input
                      type="text"
                      required
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="Sven Svensson"
                      className="w-full px-4 py-2.5 bg-[var(--surface)] border border-[var(--border)] rounded-[10px] text-[var(--brand-navy)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--brand)]/15 focus:border-[var(--brand)] transition-all"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="block text-xs font-medium text-[var(--muted)] uppercase tracking-widest">
                      Telefonnummer
                    </label>
                    <input
                      type="tel"
                      required
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="070-123 45 67"
                      className="w-full px-4 py-2.5 bg-[var(--surface)] border border-[var(--border)] rounded-[10px] text-[var(--brand-navy)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--brand)]/15 focus:border-[var(--brand)] transition-all"
                    />
                  </div>
                </div>

                {/* 2. Trade & City */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="block text-xs font-medium text-[var(--muted)] uppercase tracking-widest">
                      Yrke / Hantverk
                    </label>
                    <select
                      required
                      value={trade}
                      onChange={(e) => setTrade(e.target.value)}
                      className="w-full px-4 py-2.5 bg-[var(--surface)] border border-[var(--border)] rounded-[10px] text-[var(--brand-navy)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--brand)]/15 focus:border-[var(--brand)] transition-all cursor-pointer"
                    >
                      <option value="" disabled>Välj ditt primära yrke...</option>
                      {TRADES_BY_SECTOR.map((sec) => (
                        <optgroup key={sec.sector} label={sec.sector}>
                          {sec.options.map((opt) => (
                            <option key={opt.id} value={opt.label}>{opt.label}</option>
                          ))}
                        </optgroup>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-2">
                    <label className="block text-xs font-medium text-[var(--muted)] uppercase tracking-widest">
                      Ort / Stad
                    </label>
                    <input
                      type="text"
                      required
                      list="dashboard-cities"
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      placeholder="t.ex. Malmö, Stockholm"
                      className="w-full px-4 py-2.5 bg-[var(--surface)] border border-[var(--border)] rounded-[10px] text-[var(--brand-navy)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--brand)]/15 focus:border-[var(--brand)] transition-all"
                    />
                    <datalist id="dashboard-cities">
                      {SWEDISH_CITIES.map(c => (
                        <option key={c} value={c} />
                      ))}
                    </datalist>
                  </div>
                </div>

                {/* 3. Experience slider */}
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <label className="block text-xs font-medium text-[var(--muted)] uppercase tracking-widest">
                      Erfarenhetsnivå
                    </label>
                    <span className="text-xs font-semibold text-[var(--brand)] bg-[#eaf3fb] px-2.5 py-0.5 rounded border border-[var(--border-strong)]">
                      {experienceYears} år
                    </span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="25"
                    value={experienceYears}
                    onChange={(e) => setExperienceYears(Number(e.target.value))}
                    className="w-full h-1.5 bg-[var(--border)] rounded-lg appearance-none cursor-pointer accent-[var(--brand)]"
                  />
                  <div className="flex justify-between text-[9px] text-[var(--muted)]">
                    <span>Nybörjare</span>
                    <span>10 år</span>
                    <span>25+ år</span>
                  </div>
                </div>

                {/* 4. Availability grid selection */}
                <div className="space-y-2">
                  <label className="block text-xs font-semibold text-[var(--muted)] uppercase tracking-widest mb-2">
                    Tillgänglighetsstatus
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    {Object.keys(AVAILABILITY_MAP).map((key) => {
                      const opt = AVAILABILITY_MAP[key];
                      const isSelected = availability === key;
                      return (
                        <button
                          key={key}
                          type="button"
                          onClick={() => setAvailability(key)}
                          className={`px-3 py-2.5 text-xs font-semibold rounded-xl border text-left transition-all cursor-pointer ${
                            isSelected
                              ? 'bg-[#eaf3fb] border-[var(--brand)] text-[var(--brand-navy)] shadow-sm'
                              : 'bg-[var(--surface)] border-[var(--border)] hover:border-[var(--border-strong)] text-[var(--muted)]'
                          }`}
                        >
                          {opt.label}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* 5. Contact Email (read-only for security) */}
                <div className="space-y-2 opacity-75">
                  <label className="block text-xs font-semibold text-[var(--muted)] uppercase tracking-widest">
                    Inloggnings-epost (Säkerhet)
                  </label>
                  <input
                    type="email"
                    disabled
                    value={contactEmail}
                    className="w-full px-4 py-2.5 bg-[var(--surface)] border border-[var(--border)] rounded-xl text-[var(--muted)] text-sm cursor-not-allowed"
                  />
                </div>

                {/* 6. Bio */}
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <label className="block text-xs font-medium text-[var(--muted)] uppercase tracking-widest">
                      Biografi / Yrkesbeskrivning
                    </label>
                    <span className="text-[10px] text-[var(--muted)] font-light">{bio.length}/500</span>
                  </div>
                  <textarea
                    maxLength={500}
                    rows={4}
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    placeholder="Berätta kort om dina yrkeskunskaper..."
                    className="w-full px-4 py-3 bg-[var(--surface)] border border-[var(--border)] rounded-[10px] text-[var(--brand-navy)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--brand)]/15 focus:border-[var(--brand)] transition-all resize-none placeholder:text-[#9ca3af]"
                  />
                </div>

                {/* 7. Certifikat (DYNAMISKT FÄLT) */}
                <div className="space-y-3 pt-2">
                  <div className="flex justify-between items-center">
                    <label className="block text-xs font-medium text-[var(--muted)] uppercase tracking-widest">
                      Certifikat & Licenser
                    </label>
                  </div>
                  {certificates.map((cert, index) => (
                    <div key={index} className="flex gap-2">
                      <input
                        type="text"
                        value={cert}
                        onChange={(e) => handleCertificateChange(index, e.target.value)}
                        placeholder="t.ex. Heta Arbeten, Truckkort"
                        className="w-full px-4 py-2 bg-[var(--surface)] border border-[var(--border)] rounded-[10px] text-[var(--brand-navy)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--brand)]/15 focus:border-[var(--brand)] transition-all"
                      />
                      <button
                        type="button"
                        onClick={() => removeCertificate(index)}
                        className="px-3 py-2 text-red-500 hover:bg-red-50 rounded-lg border border-transparent hover:border-red-100 transition-all flex items-center justify-center text-sm font-bold"
                        title="Ta bort rad"
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={addCertificate}
                    className="text-xs font-semibold text-[var(--brand)] hover:text-[var(--brand-hover)] flex items-center gap-1 mt-1 transition-colors"
                  >
                    <span className="text-lg leading-none">+</span> Lägg till certifikat
                  </button>
                </div>

                {/* 8. Premium Simulation (For demonstration/onboarding toggle) */}
                <div className="p-4 rounded-xl border border-[var(--border)] bg-[var(--surface)] flex items-center justify-between mt-6">
                  <div>
                    <h4 className="text-xs font-bold text-[var(--brand-navy)]">Premium (förhandsvisning)</h4>
                    <p className="text-[10px] text-[var(--muted)] mt-0.5">Se hur din profil kan markeras som premium.</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setIsPremium(!isPremium);
                      setIsPremiumLocked(isPremium);
                    }}
                    className={`w-12 h-6 rounded-full p-1 transition-all duration-300 ease-in-out cursor-pointer ${
                      isPremium ? 'bg-[var(--brand)]' : 'bg-[var(--border-strong)]'
                    }`}
                  >
                    <div className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-all duration-300 ease-in-out ${
                      isPremium ? 'translate-x-6' : 'translate-x-0'
                    }`} />
                  </button>
                </div>

                {/* Submit button */}
                <div className="pt-4 border-t border-[var(--border)] flex justify-end">
                  <button
                    type="submit"
                    disabled={saving}
                    className="px-6 py-3 rounded-full bg-[var(--brand)] hover:bg-[var(--brand-hover)] text-white font-semibold text-sm tracking-wide shadow-sm flex items-center justify-center gap-2 transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                  >
                    {saving ? (
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <>
                        Spara ändringar
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                        </svg>
                      </>
                    )}
                  </button>
                </div>

              </form>

            </div>
          </div>

          {/* ============================================================== */}
          {/* LIVE PREVIEW (RIGHT 5 COLUMNS)                                 */}
          {/* ============================================================== */}
          <div className="lg:col-span-5 space-y-4">

            {/* Preview mode toggle */}
            <div className="flex items-center justify-between bg-white border border-[var(--border)] rounded-xl p-3.5">
              <span className="text-xs font-bold text-[var(--muted)] uppercase tracking-widest">
                Förhandsgranskning
              </span>
              <div className="flex bg-[var(--surface)] p-1 rounded-lg border border-[var(--border)]">
                <button
                  onClick={() => setPreviewMode('compact')}
                  className={`px-3 py-1 text-[10px] uppercase tracking-wider font-bold rounded transition-all cursor-pointer ${
                    previewMode === 'compact'
                      ? 'bg-[var(--brand)] text-white shadow-sm'
                      : 'text-[var(--muted)] hover:text-[var(--brand-navy)]'
                  }`}
                >
                  Kort
                </button>
                <button
                  onClick={() => setPreviewMode('detailed')}
                  className={`px-3 py-1 text-[10px] uppercase tracking-wider font-bold rounded transition-all cursor-pointer ${
                    previewMode === 'detailed'
                      ? 'bg-[var(--brand)] text-white shadow-sm'
                      : 'text-[var(--muted)] hover:text-[var(--brand-navy)]'
                  }`}
                >
                  Fullständig
                </button>
              </div>
            </div>

            {/* PREVIEW CARD */}
            <div className="relative group transition-all duration-300">
              <div className="absolute -inset-0.5 rounded-2xl bg-gradient-to-tr from-[#1a5fa8] to-[#7ecff5] opacity-10 blur-[10px] group-hover:opacity-20 transition-all duration-500 pointer-events-none -z-10" />

              {previewMode === 'compact' ? (
                <div className="bg-white border border-[var(--border)] rounded-[20px] p-6 shadow-sm flex flex-col justify-between min-h-[400px]">
                  <div>
                    <div className="flex items-start justify-between">
                      <div className="w-14 h-14 rounded-2xl border border-[var(--border-strong)] overflow-hidden flex items-center justify-center bg-[var(--surface)]">
                        {(avatarPreview || avatarUrl)
                          ? <img src={avatarPreview || avatarUrl!} alt="Avatar" style={{width:'100%',height:'100%',objectFit:'cover'}} />
                          : <span className="text-[var(--brand)] font-black text-xl">{getInitials(fullName)}</span>
                        }
                      </div>
                      {isPremium ? (
                        <span className="text-[10px] font-bold text-amber-600 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded flex items-center gap-1">✨ Premium</span>
                      ) : (
                        <span className="text-[10px] font-medium text-[var(--muted)] bg-[var(--surface)] border border-[var(--border)] px-2 py-0.5 rounded flex items-center gap-1">🔒 Låst</span>
                      )}
                    </div>
                    <div className="mt-4">
                      <h3 className="text-lg font-bold text-[var(--brand-navy)] tracking-tight">{fullName || 'Ditt Namn'}</h3>
                      <div className="flex flex-wrap gap-2 items-center mt-1">
                        <span className="text-xs text-[var(--brand)] font-bold uppercase tracking-wider">{trade || 'Yrkesroll saknas'}</span>
                        <span className="w-1.5 h-1.5 rounded-full bg-[var(--border-strong)]" />
                        <span className="text-xs text-[var(--muted)] font-medium">📍 {city || 'Ort ej vald'}</span>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-2.5 mt-5">
                      <div className="bg-[var(--surface)] border border-[var(--border)] p-2 rounded-xl text-center">
                        <div className="text-[9px] text-[var(--muted)] uppercase tracking-widest font-semibold">Erfarenhet</div>
                        <div className="text-xs font-bold text-[var(--brand-navy)] mt-0.5">{experienceYears} år</div>
                      </div>
                      <div className={`border p-2 rounded-xl text-center ${availabilityInfo.bgClass}`}>
                        <div className="text-[9px] text-[var(--muted)] uppercase tracking-widest font-semibold">Start</div>
                        <div className={`text-xs font-bold mt-0.5 ${availabilityInfo.textClass}`}>{availabilityInfo.label.replace('Tillgänglig ', '')}</div>
                      </div>
                    </div>
                    {activeCertificates.length > 0 && (
                      <div className="mt-4 flex flex-wrap gap-1.5">
                        {activeCertificates.slice(0, 3).map((cert, idx) => (
                          <span key={idx} className="text-[9px] font-semibold text-[var(--muted)] bg-[var(--surface)] border border-[var(--border)] px-2 py-1 rounded-md">{cert}</span>
                        ))}
                        {activeCertificates.length > 3 && (
                          <span className="text-[9px] font-semibold text-[var(--muted)] bg-[var(--surface)] border border-[var(--border)] px-2 py-1 rounded-md">+{activeCertificates.length - 3} fler</span>
                        )}
                      </div>
                    )}
                    <div className="mt-5">
                      <div className="text-[10px] text-[var(--muted)] uppercase tracking-widest font-semibold mb-1">Beskrivning</div>
                      <p className="text-xs text-[var(--brand-navy)] leading-relaxed italic opacity-90 line-clamp-3">
                        &rdquo;{bio || 'Fyll i din biografi i formuläret till vänster.'}&rdquo;
                      </p>
                    </div>
                  </div>
                  <div className="border-t border-[var(--border)] pt-4 mt-6">
                    <div className="bg-[#1a3a5c] rounded-xl p-3 text-xs space-y-1.5 font-light text-slate-300">
                      <div className="flex justify-between"><span>E-post:</span><span className="font-medium text-white">{contactEmail || 'namn@domän.se'}</span></div>
                      <div className="flex justify-between"><span>Telefon:</span><span className="font-medium text-white">{phone || 'Ej angivet'}</span></div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="bg-white border border-[var(--border)] rounded-[20px] p-6 shadow-sm space-y-5">
                  <div className="flex flex-col items-center text-center pb-5 border-b border-[var(--border)]">
                    <div className="rounded-full border border-[var(--border-strong)] overflow-hidden flex items-center justify-center bg-[var(--surface)] shadow-md mb-3" style={{width:72,height:72}}>
                      {(avatarPreview || avatarUrl)
                        ? <img src={avatarPreview || avatarUrl!} alt="Avatar" style={{width:'100%',height:'100%',objectFit:'cover'}} />
                        : <span className="text-[var(--brand)] font-extrabold text-2xl">{getInitials(fullName)}</span>
                      }
                    </div>
                    <h3 className="text-xl font-bold text-[var(--brand-navy)]">{fullName || 'Ditt Namn'}</h3>
                    <p className="text-xs text-[var(--brand)] font-bold uppercase tracking-widest mt-1">{trade || 'Yrke ej satt'}</p>
                    <p className="text-[11px] text-[var(--muted)] mt-1">📍 {city || 'Ort ej vald'}</p>
                  </div>
                  <div className="space-y-2">
                    {[
                      { label: 'Erfarenhet', value: `${experienceYears} år` },
                      { label: 'Tillgänglighet', value: availabilityInfo.label },
                      { label: 'Ort', value: city || 'Ej angivet' },
                    ].map(row => (
                      <div key={row.label} className="flex justify-between items-center text-xs py-1.5 border-b border-[var(--border)]">
                        <span className="text-[var(--muted)]">{row.label}</span>
                        <span className="font-bold text-[var(--brand-navy)]">{row.value}</span>
                      </div>
                    ))}
                  </div>
                  {activeCertificates.length > 0 && (
                    <div>
                      <div className="text-[10px] text-[var(--muted)] uppercase tracking-widest font-semibold mb-2">Certifikat</div>
                      <div className="flex flex-wrap gap-1.5">
                        {activeCertificates.map((cert, idx) => (
                          <span key={idx} className="text-[10px] font-semibold text-[var(--brand-navy)] bg-[var(--surface)] border border-[var(--border-strong)] px-2.5 py-1 rounded-lg flex items-center gap-1"><span className="text-[var(--brand)]">✓</span> {cert}</span>
                        ))}
                      </div>
                    </div>
                  )}
                  {bio && (
                    <div>
                      <div className="text-[10px] text-[var(--muted)] uppercase tracking-widest font-semibold mb-2">Biografi</div>
                      <p className="text-sm text-[var(--brand-navy)] leading-relaxed bg-[var(--surface)] border border-[var(--border)] p-3 rounded-xl italic">{bio}</p>
                    </div>
                  )}
                  <div className="bg-[#1a3a5c] rounded-xl p-3 space-y-1.5 text-xs text-slate-300">
                    <div className="flex justify-between"><span>E-post:</span><span className="text-white font-medium">{contactEmail || '–'}</span></div>
                    <div className="flex justify-between"><span>Telefon:</span><span className="text-white font-medium">{phone || '–'}</span></div>
                  </div>
                </div>
              )}
            </div>

            {/* === PROFILSTYRKA === */}
            <div className="bg-white border border-[var(--border)] rounded-[20px] p-5">
              <div className="text-xs font-bold text-[var(--muted)] uppercase tracking-widest mb-3">Profilstyrka</div>
              {(() => {
                const fields = [
                  { label: 'Namn', done: !!fullName.trim() },
                  { label: 'Yrke', done: !!trade.trim() },
                  { label: 'Stad', done: !!city.trim() },
                  { label: 'Telefon', done: !!phone.trim() },
                  { label: 'Bio', done: bio.trim().length >= 30 },
                  { label: 'Profilbild', done: !!(avatarUrl || avatarPreview) },
                  { label: 'Erfarenhet', done: experienceYears > 0 },
                  { label: 'Certifikat', done: certificates.filter(c => c.trim()).length > 0 },
                ];
                const pct = Math.round((fields.filter(f => f.done).length / fields.length) * 100);
                const missing = fields.find(f => !f.done);
                const color = pct >= 80 ? '#16a34a' : pct >= 50 ? '#1a5fa8' : '#f0a020';
                return (
                  <>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-bold text-[var(--brand-navy)]">{pct}% komplett</span>
                      <span className="text-xs font-semibold px-2 py-0.5 rounded-full" style={{ background: pct >= 80 ? '#dcfce7' : pct >= 50 ? '#e6f1fb' : '#fff4e0', color }}>{pct >= 80 ? 'Utmärkt' : pct >= 50 ? 'Bra' : 'Påbörjad'}</span>
                    </div>
                    <div className="w-full h-2 bg-[var(--border)] rounded-full overflow-hidden mb-3">
                      <div className="h-full rounded-full transition-all duration-500" style={{ width: `${pct}%`, background: `linear-gradient(90deg, ${color}, ${color}aa)` }} />
                    </div>
                    <div className="grid grid-cols-4 gap-1.5 mb-3">
                      {fields.map(f => (
                        <div key={f.label} className={`text-center text-[10px] py-1 rounded-lg border ${f.done ? 'bg-[#e6f1fb] border-[#b8d0e8] text-[var(--brand)] font-semibold' : 'bg-[var(--surface)] border-[var(--border)] text-[var(--muted)]'}`}>
                          {f.done ? '✓ ' : ''}{f.label}
                        </div>
                      ))}
                    </div>
                    {missing && (
                      <div className="flex items-center gap-2 text-xs text-[var(--brand)] bg-[#e6f1fb] border border-[#b8d0e8] rounded-lg px-3 py-2">
                        <span>💡</span><span><strong>Tips:</strong> Lägg till {missing.label.toLowerCase()}</span>
                      </div>
                    )}
                  </>
                );
              })()}
            </div>

            {/* === VISNINGSSTATISTIK === */}
            <div className="bg-white border border-[var(--border)] rounded-[20px] p-5">
              <div className="text-xs font-bold text-[var(--muted)] uppercase tracking-widest mb-3">Visningsstatistik</div>
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-3xl font-bold text-[var(--brand-navy)]">{weeklyViews}</div>
                  <div className="text-xs text-[var(--muted)] mt-0.5">visningar denna vecka</div>
                </div>
                <div className="w-12 h-12 rounded-xl bg-[#e6f1fb] flex items-center justify-center">
                  <svg className="w-6 h-6 text-[var(--brand)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/>
                  </svg>
                </div>
              </div>
              <div className="w-full h-1.5 bg-[var(--border)] rounded-full overflow-hidden mt-3">
                <div className="h-full bg-[var(--brand)] rounded-full transition-all" style={{ width: `${Math.min(weeklyViews / 10 * 100, 100)}%` }} />
              </div>
            </div>

            {/* === PREMIUM VERKTYG === */}
            <div className="bg-white border border-[var(--border)] rounded-[20px] p-5">
              <div className="text-xs font-bold text-[var(--muted)] uppercase tracking-widest mb-3">Verktyg</div>
              <div className="grid grid-cols-2 gap-3">

                {/* Boost */}
                <div className={`rounded-xl p-4 border ${profileBoostEndsAt && new Date(profileBoostEndsAt) > new Date() ? 'bg-[#e6f1fb] border-[#b8d0e8]' : 'bg-[var(--surface)] border-[var(--border)]'}`}>
                  <div className="text-lg mb-1">⚡</div>
                  <div className="text-xs font-bold text-[var(--brand-navy)] mb-0.5">Framhäv profil</div>
                  {profileBoostEndsAt && new Date(profileBoostEndsAt) > new Date() ? (
                    <div className="text-[10px] text-[var(--brand)] font-semibold">✓ Aktiv t.o.m. {new Date(profileBoostEndsAt).toLocaleDateString('sv-SE')}</div>
                  ) : (
                    <>
                      <div className="text-[10px] text-[var(--muted)] mb-2">Syns högst upp · 49 kr/v</div>
                      <button onClick={() => purchaseBoost('week')} className="w-full py-1.5 bg-[var(--brand)] text-white text-[10px] font-bold rounded-lg hover:bg-[var(--brand-hover)] transition">Köp nu</button>
                    </>
                  )}
                </div>

                {/* Verified */}
                <div className={`rounded-xl p-4 border ${hasVerifiedBadge ? 'bg-[#e6f1fb] border-[#b8d0e8]' : 'bg-[var(--surface)] border-[var(--border)]'}`}>
                  <div className="text-lg mb-1">✅</div>
                  <div className="text-xs font-bold text-[var(--brand-navy)] mb-0.5">Verifierad</div>
                  {hasVerifiedBadge ? (
                    <div className="text-[10px] text-[var(--brand)] font-semibold">✓ Yrkesperson</div>
                  ) : (
                    <>
                      <div className="text-[10px] text-[var(--muted)] mb-2">Badgeverifiering · 99 kr</div>
                      <button onClick={requestVerification} className="w-full py-1.5 bg-[var(--brand)] text-white text-[10px] font-bold rounded-lg hover:bg-[var(--brand-hover)] transition">Verifiera</button>
                    </>
                  )}
                </div>

              </div>
            </div>

            {/* === CV UPLOAD === */}
            <div className="bg-white border border-[var(--border)] rounded-[20px] p-5">
              <div className="text-xs font-bold text-[var(--muted)] uppercase tracking-widest mb-3">CV & Personligt brev</div>
              <div className="space-y-3">
                {['CV (PDF)', 'Personligt brev'].map((label, i) => (
                  <div key={label}>
                    <div className="text-xs text-[var(--muted)] mb-1.5">{label}</div>
                    <label className="flex items-center justify-center w-full h-16 border border-dashed border-[var(--border-strong)] rounded-xl cursor-pointer hover:bg-[#e6f1fb] hover:border-[var(--brand)] transition-all group">
                      <div className="flex items-center gap-2 text-[var(--muted)] group-hover:text-[var(--brand)] transition-colors">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"/>
                        </svg>
                        <span className="text-xs font-medium">Ladda upp {label.toLowerCase()}</span>
                      </div>
                      <input type="file" accept=".pdf,.doc,.docx" className="hidden" />
                    </label>
                  </div>
                ))}
                <p className="text-[10px] text-[var(--muted)] text-center">Filer delas endast vid jobbansökan</p>
              </div>
            </div>

          </div>
        </div>
      </main>

      <ImageCropperModal
        imageSrc={selectedImageSrc}
        isOpen={isCropperOpen}
        onClose={() => setIsCropperOpen(false)}
        onCropComplete={handleCropComplete}
      />
    </div>
  );
}
