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
    { icon: '🔨', label: 'Snickare', count: 340 },
    { icon: '🔧', label: 'Elektriker', count: 280 },
    { icon: '👨‍🍳', label: 'Kockar', count: 420 },
    { icon: '💼', label: 'Bartenders', count: 160 },
    { icon: '✨', label: 'Städare', count: 310 },
    { icon: '🍽️', label: 'Servitrörer', count: 260 },
  ];

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=Inter:wght@300;400;500;600;700&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        .hw { font-family: 'Inter', sans-serif; color: #163a63; background: #f6f7f9; min-height: 100vh; }

        .hw-hero { position: relative; min-height: 80vh; display: flex; align-items: center; justify-content: center; text-align: center; overflow: hidden; }
        .hw-hero-bg { position: absolute; inset: 0; background-image: url('/hero.png'); background-size: cover; background-position: center 30%; transform: scale(1.08); animation: heroZoom 20s ease-in-out infinite alternate; }
        @keyframes heroZoom { 0% { transform: scale(1.08) translateY(0px); } 100% { transform: scale(1.13) translateY(-14px); } }
        .hw-hero-overlay { position: absolute; inset: 0; background: linear-gradient(160deg, rgba(10,25,50,.74) 0%, rgba(20,45,80,.62) 60%, rgba(10,25,50,.82) 100%); }
        .hw-hero-content { position: relative; z-index: 2; padding: 5rem 2rem; max-width: 760px; animation: fadeUp .9s ease-out both; }
        @keyframes fadeUp { from { opacity: 0; transform: translateY(28px); } to { opacity: 1; transform: translateY(0); } }
        .hw-badge { display: inline-flex; align-items: center; gap: 6px; font-size: 11px; font-weight: 600; letter-spacing: 1.2px; text-transform: uppercase; padding: 6px 18px; border-radius: 99px; background: rgba(255,255,255,.12); border: 1px solid rgba(255,255,255,.25); color: rgba(255,255,255,.9); margin-bottom: 1.75rem; backdrop-filter: blur(6px); }
        .hw-hero h1 { font-family: 'DM Serif Display', serif; font-size: clamp(42px, 6vw, 68px); line-height: 1.1; letter-spacing: -.5px; margin: 0 0 1.25rem; color: #fff; }
        .hw-hero h1 em { font-style: italic; color: #7ecff5; }
        .hw-hero > p { font-size: 18px; color: rgba(255,255,255,.8); max-width: 520px; margin: 0 auto 2.5rem; line-height: 1.65; font-weight: 300; }
        .hw-hero-btns { display: flex; gap: 14px; justify-content: center; flex-wrap: wrap; }
        .hw-btn { font-family: 'Inter', sans-serif; font-size: 14px; font-weight: 500; padding: 13px 28px; border-radius: 99px; cursor: pointer; text-decoration: none; display: inline-flex; align-items: center; gap: 8px; transition: all .2s; border: 1px solid transparent; }
        .hw-btn:hover { transform: translateY(-2px); box-shadow: 0 8px 24px rgba(0,0,0,.15); }
        .hw-btn-white { background: #fff; border-color: #fff; color: #163a63; }
        .hw-btn-white:hover { background: #f0f7fc; }
        .hw-btn-ghost { color: #fff; border-color: rgba(255,255,255,.4); background: transparent; }
        .hw-btn-ghost:hover { background: rgba(255,255,255,.15); }

        .hw-logos { background: #fff; border-bottom: 1px solid #ebf0f5; }
        .hw-logos-inner { max-width: 1280px; margin: 0 auto; padding: 0 1.5rem; text-align: center; }
        @media (min-width: 1024px) { .hw-logos-inner { padding: 0 2rem; } }
        .hw-logos-label { font-size: 11px; font-weight: 500; letter-spacing: 1px; text-transform: uppercase; color: #9ca3af; margin-bottom: 2rem; padding-top: 3rem; }
        .hw-logos-grid { display: flex; flex-wrap: wrap; justify-content: center; align-items: center; gap: 2rem; padding-bottom: 3rem; }
        @media (min-width: 768px) { .hw-logos-grid { gap: 4rem; } }
        .hw-logo-link { display: flex; flex-direction: column; align-items: center; justify-content: center; filter: grayscale(100%); opacity: 0.65; transition: all 0.3s ease; }
        .hw-logo-link:hover { filter: grayscale(0%); opacity: 1; }
        .hw-logo-img { height: 48px; width: auto; object-fit: contain; max-width: 140px; }

        .hw-section { padding: 7rem 1.5rem; }
        .hw-section.white { background: #fff; }
        .hw-section.gray { background: #f6f7f9; }
        .hw-section-header { text-align: center; max-width: 680px; margin: 0 auto 4rem; }
        .hw-eyebrow { font-size: 11px; font-weight: 600; letter-spacing: 1.5px; text-transform: uppercase; color: #163a63; margin-bottom: 1rem; opacity: 0.5; }
        .hw-title { font-family: 'DM Serif Display', serif; font-size: clamp(30px, 4vw, 42px); line-height: 1.2; color: #163a63; margin-bottom: 1rem; }
        .hw-sub { font-size: 16px; color: #5a7a9a; line-height: 1.6; }

        .hw-how-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 1.5rem; max-width: 1000px; margin: 0 auto; }
        @media (max-width: 768px) { .hw-how-grid { grid-template-columns: 1fr; max-width: 380px; } }
        .hw-how-card { background: #fff; border: 1px solid #ebf0f5; border-radius: 24px; padding: 2.5rem 2rem; text-align: center; position: relative; overflow: hidden; transition: all 0.3s ease; }
        .hw-how-card:hover { box-shadow: 0 16px 48px rgba(22,58,99,.08); transform: translateY(-4px); }
        .hw-how-num { font-family: 'DM Serif Display', serif; font-size: 88px; color: #eaf4fc; position: absolute; top: -15px; left: 24px; line-height: 1; pointer-events: none; user-select: none; }
        .hw-how-title { font-family: 'DM Serif Display', serif; font-size: 22px; color: #163a63; margin: 1.75rem 0 1rem; position: relative; }
        .hw-how-desc { font-size: 14px; color: #5a7a9a; line-height: 1.7; }

        .hw-trades-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 1.25rem; max-width: 880px; margin: 0 auto; }
        @media (max-width: 768px) { .hw-trades-grid { grid-template-columns: repeat(2, 1fr); } }
        @media (max-width: 480px) { .hw-trades-grid { grid-template-columns: 1fr; } }
        .hw-trade-card { background: #fff; border: 1px solid #ebf0f5; border-radius: 18px; padding: 2rem 1.5rem; text-align: center; text-decoration: none; color: inherit; transition: all 0.25s ease; }
        .hw-trade-card:hover { border-color: #163a63; box-shadow: 0 12px 36px rgba(22,58,99,.1); transform: translateY(-3px); }
        .hw-trade-icon-wrap { width: 60px; height: 60px; border-radius: 50%; background: #f0f6fc; display: flex; align-items: center; justify-content: center; margin: 0 auto 1rem; }
        .hw-trade-icon { font-size: 26px; }
        .hw-trade-name { font-size: 14px; font-weight: 600; color: #163a63; margin-bottom: 4px; }
        .hw-trade-count { font-size: 12px; color: #94a3b8; }

        .hw-premium { background: linear-gradient(135deg, #163a63 0%, #0f2a4a 100%); border-radius: 24px; max-width: 920px; margin: 0 auto; overflow: hidden; position: relative; }
        .hw-premium-glow { position: absolute; top: -80px; right: -80px; width: 320px; height: 320px; border-radius: 50%; background: radial-gradient(circle, rgba(245,158,11,.18) 0%, transparent 70%); pointer-events: none; }
        .hw-premium-inner { display: grid; grid-template-columns: 1fr auto; gap: 3rem; padding: 3.5rem; align-items: center; position: relative; }
        @media (max-width: 768px) { .hw-premium-inner { grid-template-columns: 1fr; text-align: center; } }
        .hw-premium-badge { display: inline-flex; align-items: center; gap: 6px; font-size: 11px; font-weight: 600; letter-spacing: 1px; text-transform: uppercase; color: #fbbf24; background: rgba(251,191,36,.15); padding: 4px 14px; border-radius: 99px; border: 1px solid rgba(251,191,36,.3); margin-bottom: 1rem; }
        .hw-premium h2 { font-family: 'DM Serif Display', serif; font-size: clamp(26px, 3vw, 34px); color: #fff; margin: 0 0 1rem; }
        .hw-premium-text { font-size: 14px; color: rgba(255,255,255,.7); margin: 0 0 1.75rem; line-height: 1.7; }
        .hw-premium-list { list-style: none; }
        .hw-premium-list li { display: flex; align-items: center; gap: 10px; font-size: 14px; color: rgba(255,255,255,.85); margin-bottom: 10px; }
        @media (max-width: 768px) { .hw-premium-list li { justify-content: center; } }
        .hw-premium-check { color: #4ade80; font-weight: 600; font-size: 16px; }
        .hw-premium-box { background: rgba(255,255,255,.08); border-radius: 20px; padding: 2rem; min-width: 230px; text-align: center; backdrop-filter: blur(8px); }
        .hw-premium-val { font-family: 'DM Serif Display', serif; font-size: 44px; color: #fff; line-height: 1; margin-bottom: 6px; }
        .hw-premium-val sub { font-size: 16px; font-weight: 400; }
        .hw-premium-period { font-size: 13px; color: rgba(255,255,255,.55); margin-bottom: 1.5rem; }
        .hw-premium-cta { display: flex; align-items: center; justify-content: center; gap: 8px; width: 100%; padding: 13px 20px; border-radius: 99px; background: #f0a020; border: none; color: #fff; font-family: 'Inter', sans-serif; font-size: 14px; font-weight: 600; cursor: pointer; text-decoration: none; transition: all .2s; }
        .hw-premium-cta:hover { background: #d48a10; transform: translateY(-1px); }
        .hw-premium-note { font-size: 11px; color: rgba(255,255,255,.35); margin-top: 12px; }

        .hw-jobs { padding: 7rem 1.5rem; background: #fff; }
        .hw-jobs-header { max-width: 1000px; margin: 0 auto 2.5rem; display: flex; justify-content: space-between; align-items: flex-end; flex-wrap: wrap; gap: 1rem; }
        .hw-jobs-header .hw-title { margin-bottom: 0; }
        .hw-jobs-grid { max-width: 1000px; margin: 0 auto; display: flex; flex-direction: column; gap: 12px; }
        .hw-job { display: flex; background: #fff; border-radius: 16px; overflow: hidden; text-decoration: none; color: inherit; border: 1px solid #ebf0f5; transition: all .25s; box-shadow: 0 1px 4px rgba(0,0,0,.04); }
        .hw-job:hover { border-color: #163a63; box-shadow: 0 10px 36px rgba(22,58,99,.1); transform: translateY(-2px); }
        .hw-job-accent { width: 4px; flex-shrink: 0; background: linear-gradient(180deg, #163a63, #1a4a7a); }
        .hw-job-body { flex: 1; padding: 1.25rem 1.5rem; display: flex; align-items: center; gap: 1.5rem; }
        .hw-job-main { flex: 1; min-width: 0; }
        .hw-job-title { font-size: 16px; font-weight: 600; color: #163a63; margin: 0 0 4px; }
        .hw-job-company { font-size: 13px; color: #64748b; margin: 0 0 6px; }
        .hw-job-meta { display: flex; flex-wrap: wrap; gap: 12px; font-size: 13px; color: #64748b; }
        .hw-job-meta span { display: flex; align-items: center; gap: 4px; }
        .hw-job-right { display: flex; align-items: center; gap: 1rem; flex-shrink: 0; }
        .hw-job-tag { font-size: 12px; font-weight: 500; padding: 5px 14px; background: #f0f6fc; color: #163a63; border-radius: 99px; border: 1px solid #e0eaf4; white-space: nowrap; }
        .hw-job-arrow { width: 34px; height: 34px; border-radius: 50%; background: #f0f6fc; display: flex; align-items: center; justify-content: center; transition: all .2s; color: #163a63; }
        .hw-job:hover .hw-job-arrow { background: #163a63; color: #fff; }
        .hw-view-all { display: inline-flex; align-items: center; gap: 6px; padding: 10px 22px; background: #fff; color: #163a63; border-radius: 99px; text-decoration: none; font-size: 13px; font-weight: 500; border: 1px solid #e0eaf4; transition: all .2s; }
        .hw-view-all:hover { background: #163a63; color: #fff; border-color: #163a63; }

        .hw-cta { background: linear-gradient(135deg, #163a63 0%, #0f2a4a 100%); padding: 8rem 2rem; text-align: center; }
        .hw-cta h2 { font-family: 'DM Serif Display', serif; font-size: clamp(30px, 4vw, 44px); color: #fff; margin: 0 0 .75rem; }
        .hw-cta > p { font-size: 18px; color: rgba(255,255,255,.65); margin: 0 0 2.5rem; font-weight: 300; }
        .hw-cta-btns { display: flex; gap: 14px; justify-content: center; flex-wrap: wrap; }
        .hw-cta .hw-btn-white { background: #fff; color: #163a63; }
        .hw-cta .hw-btn-white:hover { background: #f0f7fc; }

        .hw-footer { background: #fff; padding: 2rem; border-top: 1px solid #ebf0f5; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 1rem; }
        .hw-footer-text { font-size: 13px; color: #94a3b8; }

        @media (max-width: 768px) {
          .hw-hero { min-height: 65vh; }
          .hw-hero-btns { flex-direction: column; align-items: center; }
          .hw-section { padding: 5rem 1.25rem; }
          .hw-jobs-header { flex-direction: column; align-items: flex-start; }
          .hw-job-right { display: none; }
          .hw-footer { flex-direction: column; text-align: center; }
        }
      `}</style>

      <div className="hw">
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

        {companies.length > 0 && (
          <section className="hw-logos">
            <div className="hw-logos-inner">
              <p className="hw-logos-label">Företag som letar talang på plattformen</p>
              <div className="hw-logos-grid">
                {companies.map(c => (
                  <a key={c.id} href={"/company/" + c.id} className="hw-logo-link">
                    <img src={c.company_logo_url} alt={c.company_name || 'Company'} className="hw-logo-img" />
                  </a>
                ))}
              </div>
            </div>
          </section>
        )}

        <section className="hw-section white">
          <div className="hw-section-header">
            <p className="hw-eyebrow">Så fungerar det</p>
            <h2 className="hw-title">Tre enkla steg från sökning till anställning</h2>
            <p className="hw-sub">Ingen krångel, inga mellanhänder.</p>
          </div>
          <div className="hw-how-grid">
            {[
              { num: '01', title: 'Arbetare skapar profil', desc: 'Hantverkare och servicepersonal lägger upp sin profil med erfarenhet, certifikat och tillgänglighet.' },
              { num: '02', title: 'Arbetsgivare söker', desc: 'Filtrera efter yrke, stad och erfarenhet. Se direkt vem som är tillgänglig just nu.' },
              { num: '03', title: 'Kontakt på sekunder', desc: 'Premiumanvändare låser upp kontaktuppgifter och når kandidaten direkt — ingen mellanhand.' },
            ].map(f => (
              <div key={f.num} className="hw-how-card">
                <span className="hw-how-num">{f.num}</span>
                <h3 className="hw-how-title">{f.title}</h3>
                <p className="hw-how-desc">{f.desc}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="hw-section gray">
          <div className="hw-section-header">
            <p className="hw-eyebrow">Yrkeskategorier</p>
            <h2 className="hw-title">Populära yrkeskategorier</h2>
            <p className="hw-sub">Från snickare till bartenders — vi har Sveriges bredaste utbud av blåkragskompetens.</p>
          </div>
          <div className="hw-trades-grid">
            {TRADES.map(t => (
              <a key={t.label} href={"/employer/directory?trade=" + encodeURIComponent(t.label)} className="hw-trade-card">
                <div className="hw-trade-icon-wrap">
                  <span className="hw-trade-icon">{t.icon}</span>
                </div>
                <div className="hw-trade-name">{t.label}</div>
                <div className="hw-trade-count">{t.count} profiler</div>
              </a>
            ))}
          </div>
        </section>

        <section className="hw-section white">
          <div className="hw-premium">
            <div className="hw-premium-glow" />
            <div className="hw-premium-inner">
              <div>
                <div className="hw-premium-badge">⭐ Premium</div>
                <h2>Obegränsad tillgång till hela databasen</h2>
                <p className="hw-premium-text">Som Premium-arbetsgivare ser du alla kontaktuppgifter, kan filtrera obegränsat och får notifieringar när nya kandidater matchar dina behov.</p>
                <ul className="hw-premium-list">
                  {['Lås upp alla kontaktuppgifter', 'Spara favoritkandidater', 'Obegränsade sökningar', 'Notifieringar vid nya matchningar', 'Prioriterad support'].map(f => (
                    <li key={f}><span className="hw-premium-check">✓</span> {f}</li>
                  ))}
                </ul>
              </div>
              <div className="hw-premium-box">
                <div className="hw-premium-val">499<sub> kr</sub></div>
                <div className="hw-premium-period">/mån · ingen bindningstid</div>
                <a href="/register?role=employer" className="hw-premium-cta">⚡ Kom igång med Premium</a>
                <p className="hw-premium-note">14 dagars gratis provperiod. Ingen kortinformation krävs.</p>
              </div>
            </div>
          </div>
        </section>

        {recentJobs.length > 0 && (
          <section className="hw-jobs">
            <div className="hw-jobs-header">
              <div>
                <p className="hw-eyebrow">Lediga tjänster</p>
                <h2 className="hw-title">Senaste jobben</h2>
              </div>
              <a href="/jobs" className="hw-view-all">Se alla jobb →</a>
            </div>
            <div className="hw-jobs-grid">
              {recentJobs.map(job => (
                <a key={job.id} href={"/jobs/" + job.id} className="hw-job">
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
                      <span className="hw-job-tag">{job.employment_type === 'heltid' ? 'Heltid' : 'Deltid'}</span>
                      <div className="hw-job-arrow">→</div>
                    </div>
                  </div>
                </a>
              ))}
            </div>
          </section>
        )}

        <section className="hw-cta">
          <h2>Redo att hitta din nästa medarbetare?</h2>
          <p>Skapa ett företagskonto idag och börja söka bland tusentals kvalificerade yrkespersoner.</p>
          <div className="hw-cta-btns">
            <a href="/register?role=employer" className="hw-btn hw-btn-white">Jag söker personal →</a>
            <a href="/register?role=seeker" className="hw-btn hw-btn-ghost">Skapa gratis profil</a>
          </div>
        </section>

        <footer className="hw-footer">
          <p className="hw-footer-text">© 2024 ARBETSpoolen. Alla rättigheter förbehållna.</p>
          <p className="hw-footer-text">🇸🇪 Byggt för den svenska arbetsmarknaden</p>
        </footer>
      </div>
    </>
  );
}