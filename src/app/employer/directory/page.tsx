'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { CandidateProfile, Profile } from '@/types';

import { FLAT_TRADES as SWEDISH_TRADES, SWEDISH_CITIES } from '@/lib/constants';

function EmployerDirectoryContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Authentication & Employer Profile States
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [employerProfile, setEmployerProfile] = useState<Profile | null>(null);
  const [isAuthLoading, setIsAuthLoading] = useState(true);

  // Candidates & Search States
  const [candidates, setCandidates] = useState<CandidateProfile[]>([]);
  const [isFetchingCandidates, setIsFetchingCandidates] = useState(true);
  const [candidatesError, setCandidatesError] = useState<string | null>(null);

  // Filter States
  const [selectedTrade, setSelectedTrade] = useState<string>('');
  const [selectedCity, setSelectedCity] = useState<string>('');
  const [minExperience, setMinExperience] = useState<number>(0);

  // Stripe Action States
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [checkoutError, setCheckoutError] = useState<string | null>(null);
  
  // Alert banner states from redirect query params
  const [showSuccessBanner, setShowSuccessBanner] = useState(false);
  const [showCancelBanner, setShowCancelBanner] = useState(false);

  // Check URL parameters for Stripe redirect feedback
  useEffect(() => {
    if (searchParams.get('payment_success') === 'true') {
      setShowSuccessBanner(true);
      // Clean query parameters from URL
      router.replace('/employer/directory');
    }
    if (searchParams.get('payment_cancelled') === 'true') {
      setShowCancelBanner(true);
      router.replace('/employer/directory');
    }
  }, [searchParams, router]);

  // 1. Fetch Current User and their Profile status
  useEffect(() => {
    const fetchUserAndProfile = async () => {
      try {
        setIsAuthLoading(true);
        const { data: { user }, error: userError } = await supabase.auth.getUser();

        if (userError || !user) {
          setCurrentUser(null);
          setEmployerProfile(null);
          return;
        }

        setCurrentUser(user);

        // Fetch custom profile data
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();

        if (!profileError && profile) {
          setEmployerProfile(profile);
        }
      } catch (err) {
        console.error('Error fetching user profile:', err);
      } finally {
        setIsAuthLoading(false);
      }
    };

    fetchUserAndProfile();
  }, []);

  // 2. Fetch Candidate Profiles from Supabase joined with contact details
  const fetchCandidates = async () => {
    setIsFetchingCandidates(true);
    setCandidatesError(null);
    try {
      // Query profiles table for job seekers
      let query = supabase
        .from('profiles')
        .select('*, profile_contact_details(*)')
        .eq('role', 'job_seeker');

      // Apply DB filters if selected
      if (selectedTrade) {
        query = query.eq('trade', selectedTrade);
      }
      if (selectedCity) {
        query = query.eq('city', selectedCity);
      }
      if (minExperience > 0) {
        query = query.gte('experience_years', minExperience);
      }

      // Sort by newest created candidate
      query = query.order('created_at', { ascending: false });

      const { data, error } = await query;

      if (error) {
        throw new Error(error.message);
      }

      setCandidates(data || []);
    } catch (err: any) {
      setCandidatesError(err.message || 'Kunde inte hämta kandidater.');
    } finally {
      setIsFetchingCandidates(false);
    }
  };

  // Re-fetch when filters change
  useEffect(() => {
    fetchCandidates();
  }, [selectedTrade, selectedCity, minExperience]);

  // Handle Stripe Subscription checkout trigger
  const handleInitiateUpgrade = async () => {
    if (!currentUser) {
      router.push('/login?redirect=/employer/directory');
      return;
    }

    setCheckoutLoading(true);
    setCheckoutError(null);

    try {
      const response = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': currentUser.id,
        },
        body: JSON.stringify({ userId: currentUser.id }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Något gick fel när betalningssessionen skapades.');
      }

      // Redirect to Stripe Checkout page
      if (data.url) {
        window.location.href = data.url;
      } else {
        throw new Error('Ingen betalningslänk returnerades.');
      }
    } catch (err: any) {
      setCheckoutError(err.message || 'Kunde inte initiera betalningen. Försök igen.');
    } finally {
      setCheckoutLoading(false);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/');
  };

  // Determine if viewing user currently has active premium permissions
  const hasPremium = employerProfile?.role === 'employer' && employerProfile.is_premium;

  return (
    <>
      <style>{`
        .dir-wrap { color: #1a3a5c; min-height: 60vh; display: flex; flex-direction: column; }
        
        .rb-btn { font-family: inherit; font-size: 13px; padding: 8px 18px; border-radius: 99px; border: 1px solid #b8d0e8; background: transparent; color: #1a3a5c; cursor: pointer; transition: all 0.2s ease; text-decoration: none; display: inline-flex; align-items: center; gap: 6px; font-weight: 500; }
        .rb-btn:hover { background: #eaf3fb; }
        .rb-btn-primary { background: #1a5fa8; border-color: #1a5fa8; color: #fff; }
        .rb-btn-primary:hover { background: #134a85; border-color: #134a85; }
        .rb-btn-premium { background: #f0a020; border-color: #f0a020; color: #fff; }
        .rb-btn-premium:hover { background: #d48a10; border-color: #d48a10; }
        
        /* MAIN LAYOUT */
        .dir-body { flex: 1; display: grid; grid-template-columns: 300px 1fr; gap: 2rem; padding: 2rem; max-width: 1400px; margin: 0 auto; width: 100%; box-sizing: border-box; }
        
        /* FILTER PANEL */
        .filter-panel { background: #fff; border: 1px solid #e0eaf4; border-radius: 20px; padding: 1.75rem; height: fit-content; position: sticky; top: 88px; box-shadow: 0 1px 3px rgba(0,0,0,0.05); }
        .filter-panel h2 { font-size: 16px; font-weight: 700; color: #0f172a; margin: 0 0 1.5rem; display: flex; align-items: center; gap: 8px; }
        .filter-group { margin-bottom: 1.25rem; }
        .filter-label { display: block; font-size: 11px; font-weight: 600; letter-spacing: 0.8px; text-transform: uppercase; color: #64748b; margin-bottom: 6px; }
        
        .filter-select, .filter-input { width: 100%; padding: 10px 12px; font-family: 'DM Sans', sans-serif; font-size: 14px; color: #0f172a; background: #f8fafc; border: 1px solid #cbd5e1; border-radius: 10px; outline: none; transition: all 0.15s ease; box-sizing: border-box; }
        .filter-select:focus, .filter-input:focus { border-color: #1a5fa8; background: #fff; box-shadow: 0 0 0 3px rgba(26, 95, 168, 0.1); }
        
        /* RANGE SLIDER */
        .slider-container { display: flex; align-items: center; gap: 10px; margin-top: 6px; }
        .slider-val { font-size: 14px; font-weight: 700; color: #1a5fa8; min-width: 45px; text-align: right; }
        .slider { flex: 1; -webkit-appearance: none; appearance: none; height: 6px; border-radius: 99px; background: #e2e8f0; outline: none; }
        .slider::-webkit-slider-thumb { -webkit-appearance: none; appearance: none; width: 16px; height: 16px; border-radius: 50%; background: #1a5fa8; cursor: pointer; transition: transform 0.1s; }
        .slider::-webkit-slider-thumb:hover { transform: scale(1.2); }
        
        /* CANDIDATES DIRECTORY */
        .candidates-area { display: flex; flex-direction: column; gap: 1.5rem; }
        .dir-header-summary { display: flex; align-items: center; justify-content: space-between; margin-bottom: 0.5rem; }
        .dir-title { font-family: 'DM Serif Display', serif; font-size: 28px; color: #1a3a5c; margin: 0; }
        .dir-count { font-size: 14px; color: #64748b; }
        
        /* BANNERS */
        .banner { padding: 1rem 1.5rem; border-radius: 12px; font-size: 14px; line-height: 1.5; margin-bottom: 1.5rem; display: flex; align-items: flex-start; gap: 10px; }
        .banner-success { background: #ecfdf5; border: 1px solid #10b981; color: #065f46; }
        .banner-cancel { background: #fffbeb; border: 1px solid #f59e0b; color: #92400e; }
        .banner-error { background: #fef2f2; border: 1px solid #ef4444; color: #991b1b; }
        
        /* PAYWALL HEADER CARD */
        .paywall-header-card {
          background: linear-gradient(135deg, #1a3a5c 0%, #134a85 100%);
          border-radius: 20px;
          padding: 2rem;
          color: #fff;
          margin-bottom: 2rem;
          position: relative;
          overflow: hidden;
          box-shadow: 0 10px 25px -5px rgba(15, 23, 42, 0.15);
        }
        .paywall-glow { position: absolute; top: -30%; right: -10%; width: 250px; height: 250px; border-radius: 50%; background: radial-gradient(circle, rgba(245, 158, 11, 0.3) 0%, transparent 70%); pointer-events: none; }
        .paywall-header-card h3 { font-family: 'DM Serif Display', serif; font-size: 22px; color: #fef08a; margin: 0 0 0.5rem; display: flex; align-items: center; gap: 8px; }
        .paywall-header-card p { font-size: 14px; color: #94a3b8; margin: 0 0 1.5rem; max-width: 600px; line-height: 1.6; }
        
        /* CANDIDATE CARD */
        .candidate-card { background: #fff; border: 1px solid #e0eaf4; border-radius: 20px; padding: 1.75rem; box-shadow: 0 1px 3px rgba(0,0,0,0.02); transition: all 0.25s ease; position: relative; }
        .candidate-card:hover { transform: translateY(-3px); box-shadow: 0 12px 20px -8px rgba(0,0,0,0.08); border-color: #cbd5e1; }
        .candidate-premium { border-color: #f59e0b; background: linear-gradient(to bottom, #fffdfa 0%, #fff 100%); }
        .candidate-premium:hover { border-color: #d97706; }
        
        .card-header { display: flex; align-items: flex-start; justify-content: space-between; gap: 1rem; margin-bottom: 1.25rem; }
        .card-profile-info { display: flex; gap: 1rem; }
        
        .avatar { width: 56px; height: 56px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 18px; font-weight: 700; flex-shrink: 0; background: #e2e8f0; color: #475569; overflow: hidden; border: 2px solid #fff; box-shadow: 0 2px 8px rgba(0,0,0,0.06); }
        .avatar img { width: 100%; height: 100%; object-fit: cover; }
        
        .candidate-name { font-size: 16px; font-weight: 700; color: #0f172a; display: flex; align-items: center; gap: 6px; }
        .candidate-meta { font-size: 13px; color: #64748b; margin-top: 4px; }
        
        .badge-premium-pill { background: #fef3c7; color: #d97706; font-size: 10px; font-weight: 700; padding: 2px 8px; border-radius: 99px; text-transform: uppercase; border: 1px solid #fde68a; }
        .badge-available { background: #d1fae5; color: #065f46; font-size: 11px; font-weight: 600; padding: 3px 10px; border-radius: 99px; }
        
        .trade-tag { display: inline-flex; align-items: center; gap: 4px; font-size: 12px; padding: 4px 12px; border-radius: 99px; background: #f1f5f9; color: #475569; border: 1px solid #e2e8f0; margin-right: 6px; font-weight: 500; }
        .city-tag { display: inline-flex; align-items: center; gap: 4px; font-size: 12px; padding: 4px 12px; border-radius: 99px; background: #eaf3fb; color: #1a5fa8; border: 1px solid #b8d0e8; font-weight: 500; }
        
        .candidate-bio { font-size: 14px; color: #475569; line-height: 1.6; margin: 1.25rem 0; word-break: break-word; }
        
        /* LOCKED PANEL */
        .locked-details-container { background: #f8fafc; border: 1px dashed #cbd5e1; border-radius: 12px; padding: 1rem 1.25rem; display: flex; align-items: center; justify-content: space-between; gap: 1rem; margin-top: 1rem; }
        .locked-info-mask { display: flex; flex-direction: column; gap: 6px; flex: 1; }
        .locked-text-blur { filter: blur(5px); font-size: 13px; color: #94a3b8; user-select: none; max-width: 250px; font-family: monospace; }
        
        .lock-badge { font-size: 12px; font-weight: 600; color: #475569; display: flex; align-items: center; gap: 6px; background: #fff; padding: 6px 12px; border-radius: 8px; border: 1px solid #e2e8f0; box-shadow: 0 1px 2px rgba(0,0,0,0.02); }
        .unlock-btn-inline { background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%); color: #fff; border: none; padding: 8px 16px; border-radius: 8px; font-size: 12px; font-weight: 700; cursor: pointer; transition: transform 0.15s ease; display: inline-flex; align-items: center; gap: 4px; box-shadow: 0 2px 4px rgba(217, 119, 6, 0.15); }
        .unlock-btn-inline:hover { transform: translateY(-1px); background: linear-gradient(135deg, #fbbf24 0%, #ea580c 100%); }
        
        /* UNLOCKED DETAILS */
        .unlocked-details-container { background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 12px; padding: 1.25rem; margin-top: 1rem; display: flex; flex-direction: column; gap: 8px; }
        .contact-item { display: flex; align-items: center; gap: 8px; font-size: 13px; color: #166534; font-weight: 500; }
        .contact-btn { display: inline-flex; align-items: center; gap: 4px; font-size: 12px; font-weight: 600; color: #1a5fa8; text-decoration: none; padding: 4px 10px; border-radius: 6px; border: 1px solid #cbd5e1; background: #fff; transition: background 0.15s; }
        .contact-btn:hover { background: #f1f5f9; }
        
        /* LOADING SPINNER */
        .loading-screen { display: flex; align-items: center; justify-content: center; min-height: 400px; width: 100%; flex-direction: column; gap: 12px; }
        .spinner { width: 36px; height: 36px; border: 3px solid #e2e8f0; border-top-color: #1a5fa8; border-radius: 50%; animation: spin 0.8s linear infinite; }
        @keyframes spin { to { transform: rotate(360deg); } }
        
        /* EMPTY STATE */
        .empty-state { text-align: center; padding: 4rem 2rem; background: #fff; border-radius: 20px; border: 1px solid #e2e8f0; grid-column: span 2; }
        .empty-state h3 { font-family: 'DM Serif Display', serif; font-size: 20px; color: #0f172a; margin: 0 0 0.5rem; }
        .empty-state p { font-size: 14px; color: #64748b; margin: 0 0 1.5rem; }
        
        @media (max-width: 900px) {
          .dir-body { grid-template-columns: 1fr; gap: 1.5rem; padding: 1rem; }
          .filter-panel { position: relative; top: 0; width: 100%; }
        }
      `}</style>

      <div className="dir-wrap">
        <div className="dir-body">
          
          {/* Sidebar Filtering Controls */}
          <aside className="filter-panel">
            <h2>
              <span>🔍</span> Filtrera sökning
            </h2>
            
            <div className="filter-group">
              <label className="filter-label">Yrkeskategori</label>
              <select 
                value={selectedTrade} 
                onChange={(e) => setSelectedTrade(e.target.value)}
                className="filter-select"
              >
                <option value="">Alla yrken (Sverige)</option>
                {SWEDISH_TRADES.map((trade) => (
                  <option key={trade} value={trade}>{trade}</option>
                ))}
              </select>
            </div>

            <div className="filter-group">
              <label className="filter-label">Stad / Ort</label>
              <select 
                value={selectedCity} 
                onChange={(e) => setSelectedCity(e.target.value)}
                className="filter-select"
              >
                <option value="">Hela Sverige</option>
                {SWEDISH_CITIES.map((city) => (
                  <option key={city} value={city}>{city}</option>
                ))}
              </select>
            </div>

            <div className="filter-group">
              <label className="filter-label" style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>Min erfarenhet</span>
                <span className="text-slate-500 font-bold">{minExperience} år</span>
              </label>
              <div className="slider-container">
                <input 
                  type="range" 
                  min="0" 
                  max="20" 
                  value={minExperience}
                  onChange={(e) => setMinExperience(parseInt(e.target.value))}
                  className="slider"
                />
              </div>
            </div>

            {/* Quick reset option */}
            {(selectedTrade || selectedCity || minExperience > 0) && (
              <button 
                onClick={() => { setSelectedTrade(''); setSelectedCity(''); setMinExperience(0); }}
                className="w-full mt-4 py-2 border border-dashed border-red-300 text-red-600 hover:bg-red-50 font-medium text-xs rounded-lg transition"
              >
                Nollställ alla filter
              </button>
            )}
          </aside>

          {/* Directory Listings Area */}
          <main className="candidates-area">
            
            {/* Header info */}
            <div className="dir-header-summary flex-wrap gap-3">
              <div>
                <h1 className="dir-title">Hitta kompetens</h1>
                <div className="dir-count">
                  {!isFetchingCandidates && `${candidates.length} matchande profiler`}
                </div>
              </div>
            </div>

            {/* Redirect Feedback Banners */}
            {showSuccessBanner && (
              <div className="banner banner-success">
                <span className="text-lg">🎉</span>
                <div>
                  <strong>Ditt köp lyckades!</strong> Din profil är nu uppgraderad till **Premium**. Du har fullständig behörighet till alla kontaktuppgifter och fullständiga namn i databasen under 30 dagar. Välkommen!
                </div>
              </div>
            )}

            {showCancelBanner && (
              <div className="banner banner-cancel">
                <span className="text-lg">⚠</span>
                <div>
                  <strong>Betalningen avbröts.</strong> Du slutförde inte köpet i Stripe Checkout. Inga pengar har dragits. Du är välkommen att prova igen när du vill.
                </div>
              </div>
            )}

            {checkoutError && (
              <div className="banner banner-error">
                <span className="text-lg">✖</span>
                <div>
                  <strong>Tekniskt fel:</strong> {checkoutError}
                </div>
              </div>
            )}

            {/* Top Upgrade CTA Paywall Banner (For non-premium users) */}
            {!isAuthLoading && !hasPremium && (
              <div className="paywall-header-card">
                <div className="paywall-glow" />
                <h3>🔒 Lås upp hela databasen</h3>
                <p>
                  Vill du kontakta hantverkare, bartenders eller kockar direkt? Uppgradera till **Premium Employer Access** för 499 kr/månad (ingen bindningstid) för att låsa upp fullständiga namn, kontaktuppgifter och telefonnummer direkt på denna sida.
                </p>
                <button 
                  onClick={handleInitiateUpgrade}
                  disabled={checkoutLoading}
                  className="rb-btn rb-btn-premium"
                >
                  {checkoutLoading ? 'Öppnar Stripe...' : 'Uppgradera till Premium — 499 kr/mån'}
                </button>
              </div>
            )}

            {/* Candidate Listings Grid */}
            {isFetchingCandidates ? (
              <div className="loading-screen">
                <div className="spinner" />
                <span className="text-sm font-medium text-slate-500">Söker igenom databasen...</span>
              </div>
            ) : candidatesError ? (
              <div className="banner banner-error">
                <strong>Ett fel uppstod:</strong> {candidatesError}
              </div>
            ) : candidates.length === 0 ? (
              <div className="empty-state">
                <h3>Inga kandidater matchar sökningen</h3>
                <p>Proba att nollställa eller justera dina filter till vänster för att se fler resultat.</p>
                <button 
                  onClick={() => { setSelectedTrade(''); setSelectedCity(''); setMinExperience(0); }}
                  className="rb-btn rb-btn-primary"
                >
                  Visa alla kandidater
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {candidates.map((candidate) => {
                  const hasDetails = candidate.profile_contact_details !== null && typeof candidate.profile_contact_details === 'object';
                  const details = candidate.profile_contact_details;
                  
                  // In modern Swedish design, we use nice visual gradients or images
                  const hasCustomAvatar = false; // We can load sample portraits from Unsplash depending on index
                  
                  // Assign a beautiful gender-neutral initial/color fallback
                  const initial = details?.full_name ? details.full_name.charAt(0) : 'U';
                  const indexColors = ['#f43f5e', '#ec4899', '#d946ef', '#a855f7', '#8b5cf6', '#6366f1', '#3b82f6', '#0ea5e9', '#06b6d4', '#14b8a6', '#10b981'];
                  const randColor = indexColors[candidate.id.charCodeAt(0) % indexColors.length];

                  return (
                    <div 
                      key={candidate.id} 
                      className={`candidate-card ${hasDetails ? 'candidate-premium' : ''}`}
                      onClick={() => router.push(`/employer/candidate/${candidate.id}`)}
                      style={{ cursor: 'pointer' }}
                    >
                      <div className="card-header">
                        <div className="card-profile-info">
                          <div 
                            className="avatar"
                            style={!candidate.avatar_url ? { backgroundColor: randColor, color: '#fff' } : {}}
                          >
                            {candidate.avatar_url
                              ? <img src={candidate.avatar_url} alt={initial} />
                              : initial
                            }
                          </div>
                          <div>
                            <div className="candidate-name">
                              {hasDetails && details ? (
                                <>
                                  {details.full_name}
                                  <span className="badge-premium-pill ml-2">Upplåst</span>
                                </>
                              ) : (
                                <>
                                  Dolt namn
                                  <span className="text-slate-400 font-normal text-xs ml-1">(Låst)</span>
                                </>
                              )}
                            </div>
                            <div className="candidate-meta">
                              Erfarenhet: <span className="font-bold text-slate-800">{candidate.experience_years} år</span> · 
                              Tillgänglighet: <span className="font-bold text-slate-800">{candidate.availability || 'Ospecificerat'}</span>
                            </div>
                          </div>
                        </div>

                        <span className="badge-available">
                          Aktiv Sökande
                        </span>
                      </div>

                      {/* Display Selected Trade and City Tags */}
                      <div className="flex flex-wrap gap-1">
                        {candidate.trade && (
                          <span className="trade-tag">🔧 {candidate.trade}</span>
                        )}
                        {candidate.city && (
                          <span className="city-tag">📍 {candidate.city}</span>
                        )}
                      </div>

                      <div className="candidate-bio">
                        {candidate.bio || 'Kandidaten har inte skrivit någon biobeskrivning ännu.'}
                      </div>

                      {/* Premium conditional contact box */}
                      {hasDetails && details ? (
                        <div className="unlocked-details-container">
                          <div className="font-bold text-xs uppercase text-green-800 tracking-wider mb-1">
                            ✔ Premium Kontaktuppgifter
                          </div>
                          <div className="contact-item">
                            <span>📧 E-post:</span>
                            <a href={`mailto:${details.contact_email}`} className="text-blue-600 hover:underline">
                              {details.contact_email}
                            </a>
                            <a href={`mailto:${details.contact_email}`} className="contact-btn ml-2">
                              Skicka e-post
                            </a>
                          </div>
                          {details.contact_phone && (
                            <div className="contact-item">
                              <span>📞 Telefon:</span>
                              <a href={`tel:${details.contact_phone}`} className="text-blue-600 hover:underline">
                                {details.contact_phone}
                              </a>
                              <a href={`tel:${details.contact_phone}`} className="contact-btn ml-2">
                                Ring direkt
                              </a>
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className="locked-details-container">
                          <div className="locked-info-mask">
                            <div className="filter-label" style={{ margin: 0, fontSize: '10px' }}>
                              E-post & Telefonnummer
                            </div>
                            <div className="locked-text-blur">
                              dolt-namn-hemlig@gmail.com · 070-xxxxxxx
                            </div>
                          </div>
                          
                          <div className="flex gap-2">
                            <span className="lock-badge">
                              🔒 Premium låst
                            </span>
                            <button 
                              onClick={handleInitiateUpgrade}
                              disabled={checkoutLoading}
                              className="unlock-btn-inline"
                            >
                              Lås upp kontakt
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </main>
        </div>

      </div>
    </>
  );
}

export default function EmployerDirectoryPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-slate-500 font-medium">Laddar sökkatalogen...</p>
        </div>
      </div>
    }>
      <EmployerDirectoryContent />
    </Suspense>
  );
}
