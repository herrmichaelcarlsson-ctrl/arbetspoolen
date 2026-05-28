"use client";

import { CompanyBanner } from "@/components/CompanyBanner";

export default function Home() {
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