"use client";

import { useState, useEffect } from 'react';
import { CompanyBanner } from "@/components/CompanyBanner";
import { supabase } from "@/lib/supabase";
import { JobListingWithEmployer } from "@/types";

export default function Home() {
  const [recentJobs, setRecentJobs] = useState<JobListingWithEmployer[]>([]);

  useEffect(() => {
    const fetchRecentJobs = async () => {
      const { data } = await supabase
        .from('job_listings')
        .select(`
          *,
          employer_details:employer_company_details(company_name)
        `)
        .order('created_at', { ascending: false })
        .limit(5);
      
      if (data) {
        const transformed = data.map((item: any) => ({
          ...item,
          company_name: item.employer_details?.company_name || null,
        }));
        setRecentJobs(transformed);
      }
    };
    fetchRecentJobs();
  }, []);
  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=DM+Sans:wght@300;400;500;600;700&display=swap');

        .rb-wrap { font-family: 'DM Sans', sans-serif; color: #111; background: #fff; }

        /* HERO */
        .rb-hero {
          position: relative;
          min-height: 70vh;
          display: flex;
          align-items: center;
          justify-content: center;
          text-align: center;
          overflow: hidden;
          background: linear-gradient(135deg, #0f2744 0%, #1a3a5c 50%, #0d2137 100%);
        }
        .rb-hero-bg {
          position: absolute;
          inset: 0;
          background-image: url('/hero.png');
          background-size: cover;
          background-position: center 30%;
          transform: scale(1.08);
          animation: heroZoom 20s ease-in-out infinite alternate;
          will-change: transform;
        }
        @keyframes heroZoom {
          0%   { transform: scale(1.08) translateY(0px); }
          100% { transform: scale(1.12) translateY(-12px); }
        }
        .rb-hero-overlay {
          position: absolute;
          inset: 0;
          background: linear-gradient(135deg, rgba(15, 39, 68, 0.75) 0%, rgba(26, 58, 92, 0.65) 100%);
        }
        .rb-hero-content {
          position: relative;
          z-index: 2;
          padding: 4rem 2rem;
          max-width: 720px;
          animation: heroFadeUp 0.8s ease-out both;
        }
        @keyframes heroFadeUp {
          from { opacity: 0; transform: translateY(24px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .rb-badge { 
          display: inline-flex;
          align-items: center;
          gap: 6px;
          font-size: 11px; 
          font-weight: 600; 
          letter-spacing: 1px; 
          text-transform: uppercase; 
          padding: 6px 16px; 
          border-radius: 99px; 
          background: rgba(26, 95, 168, 0.4); 
          border: 1px solid rgba(255,255,255,0.25); 
          color: #7ecff5; 
          margin-bottom: 1.75rem; 
        }
        .rb-hero h1 { 
          font-family: 'DM Serif Display', serif; 
          font-size: clamp(38px, 5.5vw, 56px); 
          line-height: 1.1; 
          letter-spacing: -0.5px; 
          margin: 0 0 1.25rem; 
          color: #fff; 
        }
        .rb-hero h1 em { font-style: italic; color: #7ecff5; }
        .rb-hero p { 
          font-size: 18px; 
          color: rgba(255,255,255,0.8); 
          max-width: 500px; 
          margin: 0 auto 2.5rem; 
          line-height: 1.6;
          font-weight: 300;
        }
        .rb-hero-btns { display: flex; gap: 14px; justify-content: center; flex-wrap: wrap; }
        .rb-btn { 
          font-family: 'DM Sans', sans-serif; 
          font-size: 14px; 
          padding: 11px 24px; 
          border-radius: 99px; 
          border: 1px solid #b8d0e8; 
          background: transparent; 
          color: #1a3a5c; 
          cursor: pointer; 
          transition: all 0.2s; 
          text-decoration: none; 
          display: inline-flex; 
          align-items: center; 
          gap: 6px; 
          font-weight: 500; 
        }
        .rb-btn:hover { transform: translateY(-1px); box-shadow: 0 4px 12px rgba(0,0,0,0.1); }
        .rb-btn-primary { background: #1a5fa8; border-color: #1a5fa8; color: #fff; }
        .rb-btn-primary:hover { background: #1558a0; }
        .rb-btn-white { background: #fff; border-color: #fff; color: #1a3a5c; }
        .rb-btn-white:hover { background: #f0f7fc; }

        /* TRUST BAR */
        .rb-trust { 
          background: #f8fafc; 
          padding: 1.5rem 2rem; 
          border-bottom: 1px solid #e8eef4;
          text-align: center;
        }
        .rb-trust > p { 
          font-size: 13px; 
          color: #64748b; 
          margin: 0 0 1rem;
          font-weight: 500;
        }
        .rb-trust-stats { 
          display: flex; 
          justify-content: center; 
          gap: 3rem; 
          flex-wrap: wrap;
        }
        .rb-trust-stat { text-align: center; }
        .rb-trust-stat strong { 
          display: block; 
          font-family: 'DM Serif Display', serif; 
          font-size: 28px; 
          color: #1a3a5c;
          line-height: 1;
          margin-bottom: 4px;
        }
        .rb-trust-stat span { font-size: 12px; color: #64748b; }

        /* SECTIONS */
        .rb-section { padding: 4rem 2rem; }
        .rb-section-header { text-align: center; margin-bottom: 2.5rem; }
        .rb-section-label { 
          font-size: 11px; 
          font-weight: 600; 
          letter-spacing: 1.5px; 
          text-transform: uppercase; 
          color: #1a5fa8; 
          margin-bottom: 0.75rem; 
        }
        .rb-section-title { 
          font-family: 'DM Serif Display', serif; 
          font-size: clamp(24px, 3vw, 32px); 
          color: #1a3a5c; 
          margin: 0;
          line-height: 1.2;
        }
        .rb-section-sub { 
          font-size: 15px; 
          color: #64748b; 
          margin: 0.75rem auto 0;
          max-width: 480px;
        }

        /* PROFILE CARDS */
        .rb-cards { 
          display: grid; 
          grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); 
          gap: 20px; 
          max-width: 1000px; 
          margin: 0 auto;
        }
        .rb-card { 
          background: #fff; 
          border: 1px solid #e8eef4; 
          border-radius: 16px; 
          padding: 1.5rem; 
          transition: all 0.2s;
        }
        .rb-card:hover {
          border-color: #1a5fa8;
          box-shadow: 0 4px 20px rgba(26, 95, 168, 0.08);
          transform: translateY(-2px);
        }
        .rb-card.premium {
          border-color: #1a5fa8;
          border-width: 2px;
          position: relative;
        }
        .rb-premium-badge {
          position: absolute;
          top: -10px;
          right: 16px;
          background: #f0a020;
          color: #fff;
          font-size: 10px;
          font-weight: 600;
          padding: 3px 10px;
          border-radius: 99px;
          text-transform: uppercase;
        }
        .rb-card-header { display: flex; align-items: center; gap: 14px; margin-bottom: 14px; }
        .rb-avatar { 
          width: 52px; 
          height: 52px; 
          border-radius: 50%; 
          overflow: hidden;
          flex-shrink: 0;
        }
        .rb-avatar img { width: 100%; height: 100%; object-fit: cover; }
        .rb-card-info { flex: 1; min-width: 0; }
        .rb-card-name { font-size: 15px; font-weight: 600; color: #1a3a5c; margin-bottom: 2px; }
        .rb-card-meta { font-size: 13px; color: #64748b; }
        .rb-card-tags { display: flex; flex-wrap: wrap; gap: 6px; margin-bottom: 14px; }
        .rb-tag { 
          font-size: 12px; 
          padding: 4px 10px; 
          border-radius: 6px; 
          background: #f1f5f9; 
          color: #475569;
        }
        .rb-contact { 
          display: flex; 
          align-items: center; 
          gap: 6px; 
          font-size: 13px; 
          color: #1a5fa8; 
          font-weight: 500;
        }
        .rb-locked { 
          display: flex; 
          align-items: center; 
          gap: 6px; 
          font-size: 12px; 
          color: #94a3b8;
        }

        /* HOW IT WORKS */
        .rb-how-grid { 
          display: grid; 
          grid-template-columns: repeat(2, 1fr); 
          gap: 24px; 
          max-width: 900px; 
          margin: 0 auto;
        }
        .rb-how-col { 
          background: #f8fafc; 
          border-radius: 20px; 
          padding: 2rem;
        }
        .rb-how-header { 
          display: flex; 
          align-items: center; 
          gap: 12px; 
          margin-bottom: 1.5rem;
          padding-bottom: 1rem;
          border-bottom: 1px solid #e8eef4;
        }
        .rb-how-icon {
          width: 44px;
          height: 44px;
          border-radius: 12px;
          background: #1a5fa8;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 20px;
        }
        .rb-how-col h3 { 
          font-size: 16px; 
          font-weight: 600; 
          margin: 0; 
          color: #1a3a5c; 
        }
        .rb-how-sub { font-size: 13px; color: #64748b; margin: 4px 0 0; }
        .rb-step { display: flex; gap: 14px; margin-bottom: 14px; align-items: flex-start; }
        .rb-step-num { 
          width: 26px; 
          height: 26px; 
          border-radius: 50%; 
          background: #1a5fa8; 
          color: #fff; 
          font-size: 12px; 
          font-weight: 600; 
          display: flex; 
          align-items: center; 
          justify-content: center; 
          flex-shrink: 0; 
          margin-top: 1px;
        }
        .rb-step-text { font-size: 14px; color: #475569; line-height: 1.55; }
        .rb-step-text strong { color: #1a3a5c; font-weight: 600; }
        .rb-how-price { 
          margin-top: 1.5rem; 
          padding-top: 1.25rem; 
          border-top: 1px solid #e8eef4;
        }
        .rb-price-tag { 
          font-size: 11px; 
          font-weight: 600; 
          text-transform: uppercase; 
          letter-spacing: 0.5px; 
          color: #64748b;
          margin-bottom: 4px;
        }
        .rb-price-value { 
          font-family: 'DM Serif Display', serif; 
          font-size: 28px; 
          color: #1a3a5c; 
          line-height: 1;
          margin-bottom: 4px;
        }
        .rb-price-value span { font-size: 14px; color: #64748b; font-family: 'DM Sans', sans-serif; }
        .rb-price-note { font-size: 12px; color: #94a3b8; margin-bottom: 12px; }
        .rb-how-col .rb-btn { width: 100%; justify-content: center; }

        /* CTA */
        .rb-cta { 
          background: linear-gradient(135deg, #1a3a5c 0%, #0f2744 100%);
          padding: 5rem 2rem;
          text-align: center;
        }
        .rb-cta h2 { 
          font-family: 'DM Serif Display', serif; 
          font-size: clamp(28px, 4vw, 38px); 
          color: #fff; 
          margin: 0 0 0.75rem;
        }
        .rb-cta > p { 
          font-size: 17px; 
          color: rgba(255,255,255,0.7); 
          margin: 0 0 2rem;
          font-weight: 300;
        }
        .rb-cta-btns { display: flex; gap: 14px; justify-content: center; flex-wrap: wrap; }
        .rb-cta .rb-btn { 
          border-color: #4a90c2; 
          color: #fff; 
          font-size: 15px; 
          padding: 13px 28px;
        }
        .rb-cta .rb-btn:hover { background: rgba(255,255,255,0.1); transform: translateY(-1px); }
        .rb-cta .rb-btn-white { background: #fff; color: #1a3a5c; border-color: #fff; }
        .rb-cta .rb-btn-white:hover { background: #f0f7fc; }

        /* JOB LISTINGS */
        .job-listings-section { padding: 4rem 2rem; }
        .job-listings-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 2rem;
          flex-wrap: wrap;
          gap: 1rem;
        }
        .job-listings-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
          gap: 16px;
        }
        .job-card-home {
          background: #fff;
          border: 1px solid #e8eef4;
          border-radius: 14px;
          padding: 1.25rem;
          text-decoration: none;
          color: inherit;
          display: block;
          transition: all 0.2s;
          position: relative;
        }
        .job-card-home:hover {
          border-color: #1a5fa8;
          box-shadow: 0 4px 16px rgba(26, 95, 168, 0.08);
          transform: translateY(-2px);
        }
        .job-card-home .job-badges {
          display: flex;
          gap: 6px;
          margin-bottom: 10px;
        }
        .job-card-home .badge {
          font-size: 10px;
          font-weight: 600;
          padding: 2px 8px;
          border-radius: 99px;
          text-transform: uppercase;
        }
        .job-card-home .badge-urgent { background: #dc2626; color: #fff; }
        .job-card-home .badge-premium { background: #f0a020; color: #fff; }
        .job-card-home .job-card-title {
          font-size: 15px;
          font-weight: 600;
          color: #1a3a5c;
          margin: 0 0 6px;
          line-height: 1.3;
        }
        .job-card-home .job-card-company {
          font-size: 13px;
          color: #64748b;
          margin: 0 0 10px;
        }
        .job-card-home .job-card-meta {
          display: flex;
          flex-wrap: wrap;
          gap: 10px;
          font-size: 12px;
          color: #64748b;
          margin-bottom: 12px;
        }
        .job-card-home .job-card-footer {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding-top: 10px;
          border-top: 1px solid #f1f5f9;
        }
        .job-card-home .job-trade {
          font-size: 11px;
          padding: 3px 8px;
          background: #f1f5f9;
          color: #475569;
          border-radius: 4px;
        }
        .job-card-home .job-time {
          font-size: 11px;
          color: #94a3b8;
        }
        .view-all-jobs {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 10px 20px;
          background: #f8fafc;
          color: #1a5fa8;
          border-radius: 99px;
          text-decoration: none;
          font-size: 14px;
          font-weight: 500;
          border: 1px solid #e8eef4;
          transition: all 0.2s;
        }
        .view-all-jobs:hover {
          background: #1a5fa8;
          color: #fff;
          border-color: #1a5fa8;
        }

        /* JOB LISTINGS SECTION - Full width scrollable cards */
        .job-listings-section { padding: 3rem 0; }
        .job-listings-header {
          max-width: 1200px;
          margin: 0 auto 1.5rem;
          padding: 0 2rem;
          display: flex;
          justify-content: space-between;
          align-items: flex-end;
        }
        .job-listings-grid {
          max-width: 1200px;
          margin: 0 auto;
          padding: 0 2rem;
          display: flex;
          flex-direction: column;
          gap: 12px;
        }
        .job-card-home {
          display: flex;
          background: #fff;
          border-radius: 16px;
          overflow: hidden;
          text-decoration: none;
          color: inherit;
          transition: all 0.25s ease;
          box-shadow: 0 1px 3px rgba(0,0,0,0.04), 0 4px 12px rgba(0,0,0,0.03);
          border: 1px solid #eef2f7;
        }
        .job-card-home:hover {
          transform: translateY(-2px);
          box-shadow: 0 6px 24px rgba(26, 95, 168, 0.1);
          border-color: #1a5fa8;
        }
        .job-card-home-accent {
          width: 5px;
          background: linear-gradient(180deg, #1a5fa8 0%, #2d7dd2 100%);
          flex-shrink: 0;
        }
        .job-card-home:hover .job-card-home-accent {
          background: linear-gradient(180deg, #1558a0 0%, #1a5fa8 100%);
        }
        .job-card-home-content {
          flex: 1;
          padding: 1rem 1.25rem;
          display: flex;
          align-items: center;
          gap: 1.5rem;
        }
        .job-card-home-main { flex: 1; min-width: 0; }
        .job-card-home-badges { display: flex; gap: 6px; flex-shrink: 0; }
        .job-card-home .badge {
          display: flex;
          align-items: center;
          gap: 4px;
          font-size: 10px;
          font-weight: 600;
          padding: 4px 10px;
          border-radius: 99px;
          text-transform: uppercase;
        }
        .job-card-home .badge svg { width: 12px; height: 12px; }
        .job-card-home .badge-premium { background: linear-gradient(135deg, #f0a020, #e09515); color: #fff; }
        .job-card-home .badge-urgent { background: linear-gradient(135deg, #ef4444, #dc2626); color: #fff; }
        .job-card-home-title {
          font-size: 16px;
          font-weight: 600;
          color: #1a3a5c;
          margin: 0 0 4px;
          line-height: 1.3;
        }
        .job-card-home-company {
          font-size: 13px;
          color: #64748b;
          margin: 0;
        }
        .job-card-home-meta {
          display: flex;
          flex-wrap: wrap;
          gap: 12px;
          font-size: 13px;
          color: #475569;
          margin-top: 6px;
        }
        .job-card-home-meta span {
          display: flex;
          align-items: center;
          gap: 4px;
        }
        .job-card-home-meta svg { width: 14px; height: 14px; color: #94a3b8; }
        .job-card-home-right {
          display: flex;
          align-items: center;
          gap: 1.5rem;
          flex-shrink: 0;
        }
        .job-card-home-tag {
          font-size: 12px;
          font-weight: 500;
          padding: 5px 12px;
          background: linear-gradient(135deg, #f8fafc, #f1f5f9);
          color: #475569;
          border-radius: 99px;
          border: 1px solid #e2e8f0;
          white-space: nowrap;
        }
        .job-card-home-time {
          font-size: 12px;
          color: #94a3b8;
          white-space: nowrap;
        }
        .job-card-home-arrow {
          width: 32px;
          height: 32px;
          border-radius: 50%;
          background: #f1f5f9;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.2s;
          color: #64748b;
        }
        .job-card-home-arrow svg { width: 16px; height: 16px; }
        .job-card-home:hover .job-card-home-arrow {
          background: #1a5fa8;
          color: #fff;
        }
        @media (max-width: 900px) {
          .job-card-home-content { flex-wrap: wrap; }
          .job-card-home-right { width: 100%; justify-content: space-between; margin-top: 8px; }
        }
        @media (max-width: 640px) {
          .job-listings-header { padding: 0 1rem; }
          .job-listings-grid { padding: 0 1rem; }
          .job-card-home-meta { gap: 8px; }
          .job-card-home-right { gap: 1rem; }
        }

        /* FOOTER */
        .rb-footer { 
          padding: 1.5rem 2rem; 
          border-top: 1px solid #e8eef4; 
          display: flex; 
          justify-content: space-between; 
          align-items: center;
          background: #f8fafc;
        }
        .rb-footer-text { font-size: 13px; color: #94a3b8; }

        @media (max-width: 768px) {
          .rb-hero { min-height: 60vh; }
          .rb-hero-btns { flex-direction: column; align-items: center; }
          .rb-trust-stats { gap: 2rem; }
          .rb-how-grid { grid-template-columns: 1fr; }
          .rb-section { padding: 3rem 1.25rem; }
          .job-listings-section { padding: 3rem 1rem; }
          .job-listings-header { flex-direction: column; align-items: flex-start; gap: 1rem; padding: 0 1rem; }
          .rb-footer { flex-direction: column; gap: 8px; text-align: center; }
        }
      `}</style>

      <div className="rb-wrap">

        {/* HERO */}
        <section className="rb-hero">
          <div className="rb-hero-bg" />
          <div className="rb-hero-overlay" />
          <div className="rb-hero-content">
            <div className="rb-badge">🇸🇪 Svensk arbetsmarknad</div>
            <h1>Hitta rätt personal <em>direkt</em></h1>
            <p>ARBETSpoolen kopplar arbetsgivare direkt med kvalificerade yrkespersoner — inga mellanhänder, inga onödiga avgifter.</p>
            <div className="rb-hero-btns">
              <a href="/register?role=employer" className="rb-btn rb-btn-white">Jag söker personal →</a>
              <a href="/register?role=seeker" className="rb-btn" style={{ color: '#fff', borderColor: 'rgba(255,255,255,0.3)' }}>Skapa gratis profil</a>
            </div>
          </div>
        </section>

        {/* TRUST / STATS */}
        <section className="rb-trust">
          <p>Vi har hjälpt hundratals arbetsgivare och yrkespersoner i hela Sverige</p>
          <div className="rb-trust-stats">
            <div className="rb-trust-stat">
              <strong>500+</strong>
              <span>Verifierade profiler</span>
            </div>
            <div className="rb-trust-stat">
              <strong>12</strong>
              <span>Branscher</span>
            </div>
            <div className="rb-trust-stat">
              <strong>100%</strong>
              <span>Gratis för arbetare</span>
            </div>
          </div>
        </section>

        {/* FEATURED PROFILES */}
        <section className="rb-section">
          <div className="rb-section-header">
            <p className="rb-section-label">Utvalda profiler</p>
            <h2 className="rb-section-title">Klara att anställa</h2>
            <p className="rb-section-sub">Verifierade yrkespersoner redo att börja — inom bygg, restaurang, service och fler branscher.</p>
          </div>

          <div className="rb-cards">
            <div className="rb-card">
              <div className="rb-card-header">
                <div className="rb-avatar">
                  <img src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=104&h=104&fit=crop&crop=face" alt="Erik Johansson" />
                </div>
                <div className="rb-card-info">
                  <div className="rb-card-name">Erik Johansson</div>
                  <div className="rb-card-meta">Bygg & Anläggning · Stockholm</div>
                </div>
              </div>
              <div className="rb-card-tags">
                <span className="rb-tag">🛠️ Snickare</span>
                <span className="rb-tag">📅 8 års erfarenhet</span>
              </div>
              <div className="rb-locked">🔒 Kontaktuppgifter låst</div>
            </div>

            <div className="rb-card premium">
              <span className="rb-premium-badge">Premium</span>
              <div className="rb-card-header">
                <div className="rb-avatar">
                  <img src="https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=104&h=104&fit=crop&crop=face" alt="Karin Andersson" />
                </div>
                <div className="rb-card-info">
                  <div className="rb-card-name">Karin Andersson</div>
                  <div className="rb-card-meta">Restaurang & Service · Malmö</div>
                </div>
              </div>
              <div className="rb-card-tags">
                <span className="rb-tag">👨‍🍳 Kock</span>
                <span className="rb-tag">📅 Tillgänglig nu</span>
              </div>
              <div className="rb-contact">✉️ karin.a@gmail.com</div>
            </div>

            <div className="rb-card">
              <div className="rb-card-header">
                <div className="rb-avatar">
                  <img src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=104&h=104&fit=crop&crop=face" alt="Marcus Lindberg" />
                </div>
                <div className="rb-card-info">
                  <div className="rb-card-name">Marcus Lindberg</div>
                  <div className="rb-card-meta">Transport & Logistik · Göteborg</div>
                </div>
              </div>
              <div className="rb-card-tags">
                <span className="rb-tag">🚚 Yrkesförare</span>
                <span className="rb-tag">📅 2 veckors varsel</span>
              </div>
              <div className="rb-locked">🔒 Kontaktuppgifter låst</div>
            </div>
          </div>

          <div style={{ textAlign: 'center', marginTop: '2.5rem' }}>
            <a href="/register?role=employer" className="rb-btn rb-btn-primary" style={{ padding: '12px 28px' }}>
              Se fler kandidater →
            </a>
          </div>
        </section>

        {/* HOW IT WORKS */}
        <section className="rb-section" style={{ background: '#f8fafc' }}>
          <div className="rb-section-header">
            <p className="rb-section-label">Så fungerar det</p>
            <h2 className="rb-section-title">Enkelt för båda parter</h2>
          </div>

          <div className="rb-how-grid">
            <div className="rb-how-col">
              <div className="rb-how-header">
                <div className="rb-how-icon">👤</div>
                <div>
                  <h3>För yrkespersoner</h3>
                  <p className="rb-how-sub">Gratis att synas — betala ingenting</p>
                </div>
              </div>
              <div className="rb-step">
                <div className="rb-step-num">1</div>
                <div className="rb-step-text"><strong>Skapa din profil</strong> på 5 minuter med yrke, erfarenhet och tillgänglighet</div>
              </div>
              <div className="rb-step">
                <div className="rb-step-num">2</div>
                <div className="rb-step-text"><strong>Fyll i kontaktuppgifter</strong> så arbetsgivare kan nå dig direkt</div>
              </div>
              <div className="rb-step">
                <div className="rb-step-num">3</div>
                <div className="rb-step-text"><strong>Bli kontaktad</strong> av arbetsgivare som behöver din kompetens</div>
              </div>
              <div className="rb-how-price">
                <p className="rb-price-tag">Pris</p>
                <p className="rb-price-value">Gratis <span>/ för alltid</span></p>
                <p className="rb-price-note">Inga dolda avgifter — ever</p>
                <a href="/register?role=seeker" className="rb-btn rb-btn-primary">Kom igång gratis →</a>
              </div>
            </div>

            <div className="rb-how-col">
              <div className="rb-how-header">
                <div className="rb-how-icon">🏢</div>
                <div>
                  <h3>För arbetsgivare</h3>
                  <p className="rb-how-sub">Beta av bara premium</p>
                </div>
              </div>
              <div className="rb-step">
                <div className="rb-step-num">1</div>
                <div className="rb-step-text"><strong>Skapa konto</strong> och bläddra bland verifierade yrkespersoner</div>
              </div>
              <div className="rb-step">
                <div className="rb-step-num">2</div>
                <div className="rb-step-text"><strong>Filtrera</strong> på yrke, stad och erfarenhet för att hitta rätt</div>
              </div>
              <div className="rb-step">
                <div className="rb-step-num">3</div>
                <div className="rb-step-text"><strong>Kontakta direkt</strong> — ring eller maila utan mellanhänder</div>
              </div>
              <div className="rb-how-price">
                <p className="rb-price-tag">Pris</p>
                <p className="rb-price-value">499 kr <span>/ månad</span></p>
                <p className="rb-price-note">Full tillgång till alla kontaktuppgifter</p>
                <a href="/register?role=employer" className="rb-btn rb-btn-primary">Prova gratis →</a>
              </div>
            </div>
          </div>
        </section>

        {/* JOB LISTINGS SECTION */}
        {recentJobs.length > 0 && (
          <section className="job-listings-section" style={{ background: '#f8fafc' }}>
            <div className="job-listings-header">
              <div>
                <p className="rb-section-label">Lediga tjänster</p>
                <h2 className="rb-section-title" style={{ margin: 0 }}>Senaste jobben</h2>
              </div>
              <a href="/jobs" className="view-all-jobs">
                Se alla jobb
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </a>
            </div>
            <div className="job-listings-grid">
              {recentJobs.map((job) => (
                <a key={job.id} href={`/jobs/${job.id}`} className="job-card-home">
                  <div className="job-card-home-accent" />
                  <div className="job-card-home-content">
                    <div className="job-card-home-main">
                      <div className="job-card-home-badges">
                        {job.is_premium && (
                          <span className="badge badge-premium">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 20 20">
                              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                            </svg>
                            Premium
                          </span>
                        )}
                        {job.is_urgent && (
                          <span className="badge badge-urgent">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 18.657A8 8 0 016.343 7.343S7 9 9 10c0-2 .5-5 2.986-7C14 5 16.09 5.777 17.656 7.343A7.975 7.975 0 0120 13a7.975 7.975 0 01-2.343 5.657z" />
                            </svg>
                            Brådskande
                          </span>
                        )}
                      </div>
                      <h3 className="job-card-home-title">{job.title}</h3>
                      {job.company_name && <p className="job-card-home-company">{job.company_name}</p>}
                      <div className="job-card-home-meta">
                        <span>
                          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                          </svg>
                          {job.city}
                        </span>
                        <span>
                          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                          </svg>
                          {job.employment_type === 'heltid' ? 'Heltid' : job.employment_type}
                        </span>
                        {job.salary_text && (
                          <span>
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            {job.salary_text}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="job-card-home-right">
                      <span className="job-card-home-tag">{job.trade}</span>
                      <span className="job-card-home-time">Nyligen</span>
                      <div className="job-card-home-arrow">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
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

        {/* FINAL CTA */}
        <section className="rb-cta">
          <h2>Redo att hitta din nästa medarbetare?</h2>
          <p>Skapa ett konto idag — det tar bara några minuter.</p>
          <div className="rb-cta-btns">
            <a href="/register?role=employer" className="rb-btn rb-btn-white">Jag vill anställa</a>
            <a href="/register?role=seeker" className="rb-btn">Jag söker jobb</a>
          </div>
        </section>

        <footer className="rb-footer">
          <div className="rb-footer-text">© 2026 ARBETSpoolen · Sverige</div>
          <div className="rb-footer-text">Byggd med Next.js · Supabase · Stripe</div>
        </footer>

      </div>
    </>
  );
}