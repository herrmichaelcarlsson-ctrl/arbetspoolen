"use client";

import { useState, useEffect } from 'react';
import { supabase } from "@/lib/supabase";
import { JobListingWithEmployer } from "@/types";

export default function Home() {
  const [recentJobs, setRecentJobs] = useState<JobListingWithEmployer[]>([]);
  const [companies, setCompanies] = useState<any[]>([]);

  useEffect(() => {
    const fetchRecentJobs = async () => {
      const { data } = await supabase
        .from('job_listings')
        .select(`*, employer:profiles!employer_id(company_name)`)
        .order('created_at', { ascending: false })
        .limit(5);
      if (data) {
        setRecentJobs(data.map((item: any) => ({
          ...item,
          company_name: item.employer?.company_name || null,
        })));
      }
    };
    const fetchCompanies = async () => {
      const { data } = await supabase
        .from('profiles')
        .select('id, company_name, company_logo_url')
        .not('company_logo_url', 'is', null)
        .eq('role', 'employer')
        .limit(12);
      if (data) setCompanies(data);
    };
    fetchRecentJobs();
    fetchCompanies();
  }, []);

  const TRADES = [
    { icon: '🪚', label: 'Snickare', count: 340 },
    { icon: '⚡', label: 'Elektriker', count: 280 },
    { icon: '👨‍🍳', label: 'Kockar', count: 420 },
    { icon: '🍸', label: 'Bartenders', count: 160 },
    { icon: '🧹', label: 'Städare', count: 310 },
    { icon: '🍽️', label: 'Servitriser', count: 260 },
    { icon: '🔧', label: 'VVS', count: 190 },
    { icon: '🚚', label: 'Förare', count: 220 },
    { icon: '🏗️', label: 'Byggnads', count: 300 },
    { icon: '🖌️', label: 'Målare', count: 140 },
    { icon: '🧱', label: 'Murare', count: 110 },
    { icon: '🔥', label: 'Svetsare', count: 95 },
  ];

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=DM+Sans:wght@300;400;500;600;700&display=swap');
        * { box-sizing: border-box; }
        .hw { font-family: 'DM Sans', sans-serif; color: #1a3a5c; background: #fff; }

        /* HERO */
        .hw-hero {
          position: relative; min-height: 72vh;
          display: flex; align-items: center; justify-content: center;
          text-align: center; overflow: hidden;
        }
        .hw-hero-bg {
          position: absolute; inset: 0;
          background-image: url('/hero.png');
          background-size: cover; background-position: center 30%;
          transform: scale(1.08);
          animation: heroZoom 20s ease-in-out infinite alternate;
        }
        @keyframes heroZoom {
          0%   { transform: scale(1.08) translateY(0px); }
          100% { transform: scale(1.13) translateY(-14px); }
        }
        .hw-hero-overlay {
          position: absolute; inset: 0;
          background: linear-gradient(160deg, rgba(10,25,50,.74) 0%, rgba(20,45,80,.62) 60%, rgba(10,25,50,.82) 100%);
        }
        .hw-hero-content {
          position: relative; z-index: 2;
          padding: 5rem 2rem; max-width: 740px;
          animation: fadeUp .9s ease-out both;
        }
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(28px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .hw-badge {
          display: inline-flex; align-items: center; gap: 6px;
          font-size: 11px; font-weight: 600; letter-spacing: 1.2px; text-transform: uppercase;
          padding: 6px 18px; border-radius: 99px;
          background: rgba(255,255,255,.12); border: 1px solid rgba(255,255,255,.25);
          color: rgba(255,255,255,.9); margin-bottom: 1.75rem; backdrop-filter: blur(6px);
        }
        .hw-hero h1 {
          font-family: 'DM Serif Display', serif;
          font-size: clamp(36px, 5.5vw, 56px); line-height: 1.1;
          letter-spacing: -.5px; margin: 0 0 1.25rem; color: #fff;
        }
        .hw-hero h1 em { font-style: italic; color: #7ecff5; }
        .hw-hero p {
          font-size: 18px; color: rgba(255,255,255,.8);
          max-width: 500px; margin: 0 auto 2.5rem;
          line-height: 1.65; font-weight: 300;
        }
        .hw-hero-btns { display: flex; gap: 14px; justify-content: center; flex-wrap: wrap; }
        .hw-btn {
          font-family: 'DM Sans', sans-serif; font-size: 14px; font-weight: 500;
          padding: 12px 26px; border-radius: 99px;
          cursor: pointer; text-decoration: none;
          display: inline-flex; align-items: center; gap: 7px;
          transition: all .2s; border: 1px solid transparent;
        }
        .hw-btn:hover { transform: translateY(-1px); box-shadow: 0 4px 14px rgba(0,0,0,.12); }
        .hw-btn-primary { background: #1a5fa8; border-color: #1a5fa8; color: #fff; }
        .hw-btn-primary:hover { background: #1558a0; }
        .hw-btn-white { background: #fff; border-color: #fff; color: #1a3a5c; }
        .hw-btn-white:hover { background: #f0f7fc; }
        .hw-btn-ghost { color: #fff; border-color: rgba(255,255,255,.35); background: transparent; }
        .hw-btn-ghost:hover { background: rgba(255,255,255,.1); }
        .hw-btn-outline { background: transparent; border-color: #b8d0e8; color: #1a3a5c; }
        .hw-btn-outline:hover { background: #eaf3fb; }

        /* COMPANY LOGOS */
        .hw-logos {
          max-width: 1200px;
          margin: 0 auto;
          padding: 0 2rem 2rem;
          text-align: center;
        }
        .hw-logos-label {
          font-size: 11px;
          font-weight: 500;
          letter-spacing: 1px;
          text-transform: uppercase;
          color: #9ca3af;
          margin-bottom: 2rem;
        }
        .hw-logos-grid {
          display: flex;
          flex-wrap: wrap;
          justify-content: center;
          align-items: center;
          gap: 2rem;
        }
        @media (min-width: 768px) {
          .hw-logos-grid { gap: 4rem; }
        }
        .hw-logo-link {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          filter: grayscale(100%);
          opacity: 0.7;
          transition: all 0.3s ease;
        }
        .hw-logo-link:hover {
          filter: grayscale(0%);
          opacity: 1;
        }
        .hw-logo-img {
          height: 48px;
          width: auto;
          object-fit: contain;
          max-width: 140px;
        }

        /* TRUST */
        .hw-trust { background: #fff; padding: 2rem 2rem; border-bottom: 1px solid #e8eef4; }
        .hw-trust-inner {
          max-width: 900px; margin: 0 auto;
          display: flex; justify-content: center; gap: 3.5rem; flex-wrap: wrap;
        }
        .hw-stat { text-align: center; }
        .hw-stat strong {
          display: block; font-family: 'DM Serif Display', serif;
          font-size: 30px; color: #1a3a5c; line-height: 1; margin-bottom: 4px;
        }
        .hw-stat span { font-size: 13px; color: #64748b; }

        /* HOW IT WORKS - 3 cards */
        .hw-section { padding: 5rem 2rem; }
        .hw-section.bg-gray { background: #f8fafc; }
        .hw-section-header { text-align: center; margin-bottom: 3rem; }
        .hw-eyebrow {
          font-size: 11px; font-weight: 600; letter-spacing: 1.5px; text-transform: uppercase;
          color: #1a5fa8; margin-bottom: .75rem;
        }
        .hw-title {
          font-family: 'DM Serif Display', serif;
          font-size: clamp(24px, 3vw, 32px); color: #1a3a5c; margin: 0; line-height: 1.2;
        }
        .hw-sub { font-size: 15px; color: #64748b; margin: .75rem auto 0; max-width: 500px; line-height: 1.6; }

        .hw-features { display: grid; grid-template-columns: repeat(3,1fr); gap: 20px; max-width: 960px; margin: 0 auto; }
        .hw-feature {
          background: #fff; border: 1px solid #e8eef4; border-radius: 16px;
          padding: 1.75rem; transition: all .2s;
        }
        .hw-feature:hover { border-color: #1a5fa8; box-shadow: 0 6px 20px rgba(26,95,168,.07); transform: translateY(-2px); }
        .hw-feature-icon {
          width: 44px; height: 44px; border-radius: 12px;
          background: #eaf3fb; display: flex; align-items: center;
          justify-content: center; font-size: 20px; margin-bottom: 1rem;
        }
        .hw-feature h3 { font-size: 15px; font-weight: 600; color: #1a3a5c; margin: 0 0 8px; }
        .hw-feature p { font-size: 13px; color: #64748b; line-height: 1.6; margin: 0; }

        /* TRADES GRID */
        .hw-trades { display: grid; grid-template-columns: repeat(6,1fr); gap: 12px; max-width: 960px; margin: 0 auto; }
        .hw-trade {
          background: #fff; border: 1px solid #e8eef4; border-radius: 12px;
          padding: 1.25rem .75rem; text-align: center;
          text-decoration: none; color: inherit; transition: all .2s;
        }
        .hw-trade:hover { border-color: #1a5fa8; background: #eaf3fb; transform: translateY(-2px); }
        .hw-trade-icon { font-size: 24px; margin-bottom: 6px; }
        .hw-trade-name { font-size: 12px; font-weight: 600; color: #1a3a5c; margin-bottom: 3px; }
        .hw-trade-count { font-size: 11px; color: #94a3b8; }

        /* PREMIUM BLOCK */
        .hw-premium {
          background: linear-gradient(135deg, #1a3a5c 0%, #0f2744 100%);
          border-radius: 24px; overflow: hidden; position: relative;
          max-width: 960px; margin: 0 auto;
        }
        .hw-premium-glow {
          position: absolute; top: -60px; right: -60px;
          width: 300px; height: 300px; border-radius: 50%;
          background: radial-gradient(circle, rgba(245,158,11,.2) 0%, transparent 70%);
          pointer-events: none;
        }
        .hw-premium-inner { display: grid; grid-template-columns: 1fr auto; gap: 3rem; padding: 3rem; align-items: center; }
        .hw-premium-eyebrow {
          display: inline-flex; align-items: center; gap: 6px;
          font-size: 11px; font-weight: 600; letter-spacing: 1px; text-transform: uppercase;
          color: #fbbf24; background: rgba(251,191,36,.15);
          padding: 4px 12px; border-radius: 99px; border: 1px solid rgba(251,191,36,.3);
          margin-bottom: 1rem;
        }
        .hw-premium h2 {
          font-family: 'DM Serif Display', serif;
          font-size: clamp(22px, 3vw, 30px); color: #fff; margin: 0 0 .75rem; line-height: 1.2;
        }
        .hw-premium > .hw-premium-inner > div > p {
          font-size: 14px; color: rgba(255,255,255,.7); margin: 0 0 1.5rem; line-height: 1.6;
        }
        .hw-premium-features { list-style: none; padding: 0; margin: 0 0 1.75rem; display: flex; flex-direction: column; gap: 8px; }
        .hw-premium-features li { display: flex; align-items: center; gap: 8px; font-size: 13px; color: rgba(255,255,255,.85); }
        .hw-premium-features li::before { content: ''; width: 16px; height: 16px; border-radius: 50%; background: rgba(34,197,94,.3); border: 1px solid rgba(34,197,94,.5); flex-shrink: 0; display: flex; align-items: center; justify-content: center; }
        .hw-check { color: #4ade80; font-size: 12px; }
        .hw-premium-price-box {
          background: rgba(255,255,255,.08); border: 1px solid rgba(255,255,255,.15);
          border-radius: 20px; padding: 2rem 2.5rem;
          text-align: center; backdrop-filter: blur(8px); min-width: 220px;
        }
        .hw-price-val {
          font-family: 'DM Serif Display', serif;
          font-size: 52px; color: #fff; line-height: 1;
          margin-bottom: 4px;
        }
        .hw-price-val sub { font-size: 18px; font-family: 'DM Sans', sans-serif; font-weight: 400; color: rgba(255,255,255,.7); }
        .hw-price-period { font-size: 13px; color: rgba(255,255,255,.6); margin-bottom: 1.5rem; }
        .hw-cta-btn {
          display: flex; align-items: center; justify-content: center; gap: 8px;
          width: 100%; padding: 13px 20px; border-radius: 99px;
          background: #f0a020; border: none; color: #fff;
          font-family: 'DM Sans', sans-serif; font-size: 14px; font-weight: 600;
          cursor: pointer; text-decoration: none; transition: all .2s;
        }
        .hw-cta-btn:hover { background: #d48a10; transform: translateY(-1px); }
        .hw-price-note { font-size: 11px; color: rgba(255,255,255,.45); margin-top: 10px; }

        /* JOB LISTINGS */
        .hw-jobs { padding: 4rem 2rem; background: #f8fafc; }
        .hw-jobs-header {
          max-width: 960px; margin: 0 auto 2rem;
          display: flex; justify-content: space-between; align-items: flex-end;
          flex-wrap: wrap; gap: 1rem;
        }
        .hw-jobs-grid { max-width: 960px; margin: 0 auto; display: flex; flex-direction: column; gap: 10px; }
        .hw-job {
          display: flex; background: #fff; border-radius: 14px;
          overflow: hidden; text-decoration: none; color: inherit;
          border: 1px solid #e8eef4; transition: all .22s;
          box-shadow: 0 1px 3px rgba(0,0,0,.04);
        }
        .hw-job:hover { border-color: #1a5fa8; box-shadow: 0 6px 22px rgba(26,95,168,.1); transform: translateY(-2px); }
        .hw-job-accent { width: 4px; flex-shrink: 0; background: linear-gradient(180deg, #1a5fa8, #2d7dd2); }
        .hw-job-body { flex: 1; padding: 1rem 1.25rem; display: flex; align-items: center; gap: 1.5rem; }
        .hw-job-main { flex: 1; min-width: 0; }
        .hw-job-title { font-size: 15px; font-weight: 600; color: #1a3a5c; margin: 0 0 3px; }
        .hw-job-company { font-size: 13px; color: #64748b; margin: 0 0 6px; }
        .hw-job-meta { display: flex; flex-wrap: wrap; gap: 10px; font-size: 13px; color: #64748b; }
        .hw-job-right { display: flex; align-items: center; gap: 1.25rem; flex-shrink: 0; }
        .hw-job-tag { font-size: 12px; font-weight: 500; padding: 4px 12px; background: #f1f5f9; color: #475569; border-radius: 99px; border: 1px solid #e2e8f0; white-space: nowrap; }
        .hw-job-arrow { width: 30px; height: 30px; border-radius: 50%; background: #f1f5f9; display: flex; align-items: center; justify-content: center; transition: all .2s; color: #64748b; }
        .hw-job:hover .hw-job-arrow { background: #1a5fa8; color: #fff; }
        .hw-view-all {
          display: inline-flex; align-items: center; gap: 6px;
          padding: 9px 20px; background: #fff; color: #1a5fa8;
          border-radius: 99px; text-decoration: none; font-size: 13px; font-weight: 500;
          border: 1px solid #e8eef4; transition: all .2s;
        }
        .hw-view-all:hover { background: #1a5fa8; color: #fff; border-color: #1a5fa8; }

        /* FINAL CTA */
        .hw-cta { background: linear-gradient(135deg, #1a3a5c 0%, #0f2744 100%); padding: 6rem 2rem; text-align: center; }
        .hw-cta h2 { font-family: 'DM Serif Display', serif; font-size: clamp(28px,4vw,40px); color: #fff; margin: 0 0 .75rem; }
        .hw-cta > p { font-size: 17px; color: rgba(255,255,255,.7); margin: 0 0 2.25rem; font-weight: 300; }
        .hw-cta-btns { display: flex; gap: 14px; justify-content: center; flex-wrap: wrap; }
        .hw-cta .hw-btn { font-size: 15px; padding: 14px 30px; border-color: rgba(255,255,255,.3); color: #fff; }
        .hw-cta .hw-btn:hover { background: rgba(255,255,255,.1); }
        .hw-cta .hw-btn-white { background: #fff; color: #1a3a5c; border-color: #fff; }
        .hw-cta .hw-btn-white:hover { background: #f0f7fc; }

        /* FOOTER */
        .hw-footer { padding: 1.5rem 2rem; border-top: 1px solid #e8eef4; display: flex; justify-content: space-between; align-items: center; background: #f8fafc; }
        .hw-footer-text { font-size: 13px; color: #94a3b8; }

        @media (max-width: 900px) {
          .hw-features { grid-template-columns: 1fr; }
          .hw-trades { grid-template-columns: repeat(3,1fr); }
          .hw-premium-inner { grid-template-columns: 1fr; gap: 2rem; }
          .hw-premium-price-box { min-width: auto; }
        }
        @media (max-width: 640px) {
          .hw-hero { min-height: 65vh; }
          .hw-hero-btns { flex-direction: column; align-items: center; }
          .hw-trust-inner { gap: 2rem; }
          .hw-trades { grid-template-columns: repeat(2,1fr); }
          .hw-section { padding: 3.5rem 1.25rem; }
          .hw-jobs { padding: 3rem 1.25rem; }
          .hw-job-right { display: none; }
          .hw-footer { flex-direction: column; gap: 8px; text-align: center; }
        }
      `}</style>

      <div className="hw">

        {/* ── HERO ── */}
        <section className="hw-hero">
          <div className="hw-hero-bg" />
          <div className="hw-hero-overlay" />
          <div className="hw-hero-content">
            <div className="hw-badge">🇸🇪 Svensk arbetsmarknad</div>
            <h1>Hitta rätt personal <em>direkt</em></h1>
            <p>ARBETSpoolen kopplar arbetsgivare direkt med kvalificerade yrkespersoner — inga mellanhänder, inga onödiga avgifter.</p>
            <div className="hw-hero-btns">
              <a href="/register?role=employer" className="hw-btn hw-btn-white">Jag söker personal →</a>
              <a href="/register?role=seeker" className="hw-btn hw-btn-ghost">Skapa gratis profil</a>
            </div>
          </div>
        </section>

        {/* ── TRUST ── */}
        <section className="hw-trust">
          <div className="hw-trust-inner">
            {[
              { num: '500+', label: 'Verifierade profiler' },
              { num: '12', label: 'Branscher' },
              { num: '100%', label: 'Gratis för yrkesperson' },
              { num: '499 kr', label: 'Per månad för arbetsgivare' },
            ].map(s => (
              <div key={s.label} className="hw-stat">
                <strong>{s.num}</strong>
                <span>{s.label}</span>
              </div>
            ))}
          </div>
        </section>

        {/* ── LOGOS ── */}
        {companies.length > 0 && (
          <section className="hw-logos">
            <p className="hw-logos-label">Företag som letar talang på plattformen</p>
            <div className="hw-logos-grid">
              {companies.map(c => (
                <a key={c.id} href={`/company/${c.id}`} className="hw-logo-link">
                  <img src={c.company_logo_url} alt={c.company_name || 'Company'} className="hw-logo-img" />
                </a>
              ))}
            </div>
          </section>
        )}

        {/* ── HOW IT WORKS ── */}
        <section className="hw-section">
          <div className="hw-section-header">
            <p className="hw-eyebrow">Så fungerar det</p>
            <h2 className="hw-title">Tre enkla steg från sökning till anställning</h2>
            <p className="hw-sub">Ingen krångel, inga mellanhänder.</p>
          </div>
          <div className="hw-features">
            {[
              { icon: '👤', title: 'Arbetare skapar profil', desc: 'Hantverkare och servicepersonal lägger upp sin profil med erfarenhet, certifikat och tillgänglighet.' },
              { icon: '🔍', title: 'Arbetsgivare söker', desc: 'Filtrera efter yrke, stad och erfarenhet. Se direkt vem som är tillgänglig just nu.' },
              { icon: '⚡', title: 'Kontakt på sekunder', desc: 'Premiumanvändare låser upp kontaktuppgifter och når kandidaten direkt — ingen mellanhand.' },
            ].map(f => (
              <div key={f.title} className="hw-feature">
                <div className="hw-feature-icon">{f.icon}</div>
                <h3>{f.title}</h3>
                <p>{f.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ── TRADES ── */}
        <section className="hw-section bg-gray">
          <div className="hw-section-header">
            <p className="hw-eyebrow">Yrkeskategorier</p>
            <h2 className="hw-title">Populära yrkeskategorier</h2>
            <p className="hw-sub">Från snickare till bartenders — vi har Sveriges bredaste utbud av blåkragskompetens.</p>
          </div>
          <div className="hw-trades">
            {TRADES.map(t => (
              <a key={t.label} href={`/employer/directory?trade=${encodeURIComponent(t.label)}`} className="hw-trade">
                <div className="hw-trade-icon">{t.icon}</div>
                <div className="hw-trade-name">{t.label}</div>
                <div className="hw-trade-count">{t.count} profiler</div>
              </a>
            ))}
          </div>
        </section>

        {/* ── PREMIUM BLOCK ── */}
        <section className="hw-section">
          <div className="hw-premium">
            <div className="hw-premium-glow" />
            <div className="hw-premium-inner">
              <div>
                <div className="hw-premium-eyebrow">⭐ Premium</div>
                <h2>Obegränsad tillgång till hela databasen</h2>
                <p style={{ fontSize: 14, color: 'rgba(255,255,255,.7)', margin: '0 0 1.5rem', lineHeight: 1.6 }}>
                  Som Premium-arbetsgivare ser du alla kontaktuppgifter, kan filtrera obegränsat och får notifieringar när nya kandidater matchar dina behov.
                </p>
                <ul className="hw-premium-features">
                  {[
                    'Lås upp alla kontaktuppgifter',
                    'Spara favoritkandidater',
                    'Obegränsade sökningar',
                    'Notifieringar vid nya matchningar',
                    'Prioriterad support',
                  ].map(f => (
                    <li key={f}>
                      <span className="hw-check">✓</span> {f}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="hw-premium-price-box">
                <div className="hw-price-val">499<sub> kr</sub></div>
                <div className="hw-price-period">/mån · ingen bindningstid</div>
                <a href="/register?role=employer" className="hw-cta-btn">
                  ⚡ Kom igång med Premium
                </a>
                <p className="hw-price-note">14 dagars gratis provperiod. Ingen kortinformation krävs.</p>
              </div>
            </div>
          </div>
        </section>

        {/* ── JOB LISTINGS ── */}
        {recentJobs.length > 0 && (
          <section className="hw-jobs">
            <div className="hw-jobs-header">
              <div>
                <p className="hw-eyebrow">Lediga tjänster</p>
                <h2 className="hw-title" style={{ margin: 0 }}>Senaste jobben</h2>
              </div>
              <a href="/jobs" className="hw-view-all">
                Se alla jobb
                <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </a>
            </div>
            <div className="hw-jobs-grid">
              {recentJobs.map(job => (
                <a key={job.id} href={`/jobs/${job.id}`} className="hw-job">
                  <div className="hw-job-accent" />
                  <div className="hw-job-body">
                    <div className="hw-job-main">
                      <h3 className="hw-job-title">{job.title}</h3>
                      {job.company_name && <p className="hw-job-company">{job.company_name}</p>}
                      <div className="hw-job-meta">
                        {job.city && <span>📍 {job.city}</span>}
                        {job.employment_type && <span>💼 {job.employment_type === 'heltid' ? 'Heltid' : job.employment_type}</span>}
                        {job.salary_text && <span>💰 {job.salary_text}</span>}
                      </div>
                    </div>
                    <div className="hw-job-right">
                      {job.trade && <span className="hw-job-tag">{job.trade}</span>}
                      <div className="hw-job-arrow">
                        <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </div>
                    </div>
                  </div>
                </a>
              ))}
            </div>
          </section>
        )}

        {/* ── FINAL CTA ── */}
        <section className="hw-cta">
          <h2>Redo att hitta din nästa medarbetare?</h2>
          <p>Skapa ett konto idag — det tar bara några minuter.</p>
          <div className="hw-cta-btns">
            <a href="/register?role=employer" className="hw-btn hw-btn-white">Jag vill anställa</a>
            <a href="/register?role=seeker" className="hw-btn">Jag söker jobb</a>
          </div>
        </section>

        <footer className="hw-footer">
          <div className="hw-footer-text">© 2026 ARBETSpoolen · Sverige</div>
          <div className="hw-footer-text">Byggd med Next.js · Supabase · Stripe</div>
        </footer>

      </div>
    </>
  );
}
