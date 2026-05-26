"use client";

export default function Home() {
  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=DM+Sans:wght@300;400;500&display=swap');

        .rb-wrap { font-family: 'DM Sans', sans-serif; color: #111; background: #fff; min-height: 100vh; }

        /* NAV */
        .rb-nav { display: flex; align-items: center; justify-content: space-between; padding: 0.75rem 2rem; background: rgba(255,255,255,0.92); backdrop-filter: blur(12px); -webkit-backdrop-filter: blur(12px); border-bottom: 1px solid rgba(224,234,244,0.8); position: sticky; top: 0; z-index: 100; }
        .rb-logo img { display: block; height: 60px; width: auto; }
        .rb-nav-links { display: flex; gap: 8px; }
        .rb-btn { font-family: 'DM Sans', sans-serif; font-size: 13px; padding: 7px 16px; border-radius: 99px; border: 1px solid #b8d0e8; background: transparent; color: #1a3a5c; cursor: pointer; transition: background 0.15s; text-decoration: none; display: inline-flex; align-items: center; gap: 6px; }
        .rb-btn:hover { background: #eaf3fb; }
        .rb-btn-primary { background: #1a5fa8; border-color: #1a5fa8; color: #fff; font-weight: 500; }
        .rb-btn-primary:hover { background: #134a85; border-color: #134a85; }

        /* HERO */
        .rb-hero {
          position: relative;
          min-height: 88vh;
          display: flex;
          align-items: center;
          justify-content: center;
          text-align: center;
          overflow: hidden;
        }
        .rb-hero-bg {
          position: absolute;
          inset: 0;
          background-image: url('/hero.png');
          background-size: cover;
          background-position: center 30%;
          transform: scale(1.08);
          animation: heroZoom 18s ease-in-out infinite alternate;
          will-change: transform;
        }
        @keyframes heroZoom {
          0%   { transform: scale(1.08) translateY(0px); }
          100% { transform: scale(1.15) translateY(-18px); }
        }
        .rb-hero-overlay {
          position: absolute;
          inset: 0;
          background: linear-gradient(
            to bottom,
            rgba(10, 25, 50, 0.55) 0%,
            rgba(10, 25, 50, 0.45) 50%,
            rgba(10, 25, 50, 0.70) 100%
          );
        }
        .rb-hero-content {
          position: relative;
          z-index: 2;
          padding: 4rem 2rem;
          max-width: 680px;
          animation: heroFadeUp 1s ease-out both;
        }
        @keyframes heroFadeUp {
          from { opacity: 0; transform: translateY(28px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .rb-badge { display: inline-block; font-size: 12px; font-weight: 500; letter-spacing: 0.5px; text-transform: uppercase; padding: 4px 14px; border-radius: 99px; background: rgba(255,255,255,0.18); border: 1px solid rgba(255,255,255,0.3); color: #fff; margin-bottom: 1.5rem; backdrop-filter: blur(4px); }
        .rb-hero h1 { font-family: 'DM Serif Display', serif; font-size: clamp(36px, 6vw, 58px); line-height: 1.12; letter-spacing: -1px; margin: 0 0 1rem; color: #fff; text-shadow: 0 2px 20px rgba(0,0,0,0.3); }
        .rb-hero h1 em { font-style: italic; color: #7ecff5; }
        .rb-hero p { font-size: 17px; color: rgba(255,255,255,0.85); max-width: 460px; margin: 0 auto 2.25rem; line-height: 1.65; }
        .rb-hero-btns { display: flex; gap: 12px; justify-content: center; flex-wrap: wrap; }
        .rb-hero-btns .rb-btn { font-size: 15px; padding: 12px 28px; }
        .rb-btn-white { background: #fff; border-color: #fff; color: #1a3a5c; font-weight: 500; }
        .rb-btn-white:hover { background: #e6f1fb; border-color: #e6f1fb; }
        .rb-btn-orange { background: #f0a020; border-color: #f0a020; color: #fff; font-weight: 500; }
        .rb-btn-orange:hover { background: #d48a10; border-color: #d48a10; }

        /* STATS */
        .rb-stats { display: grid; grid-template-columns: repeat(3, 1fr); gap: 1px; border: 1px solid #e0eaf4; border-radius: 16px; overflow: hidden; margin: 2.5rem 2rem; background: #e0eaf4; }
        .rb-stat { background: #fff; padding: 1.5rem; text-align: center; }
        .rb-stat-num { font-family: 'DM Serif Display', serif; font-size: 30px; color: #1a5fa8; line-height: 1; margin-bottom: 4px; }
        .rb-stat-label { font-size: 13px; color: #4a6480; }

        /* CARDS */
        .rb-section { padding: 1rem 2rem 2.5rem; }
        .rb-section-label { font-size: 11px; font-weight: 500; letter-spacing: 1px; text-transform: uppercase; color: #9ca3af; margin-bottom: 1rem; }
        .rb-cards { display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 12px; }
        .rb-card { background: #fff; border: 1px solid #e0eaf4; border-radius: 16px; padding: 1.25rem; }
        .rb-card-header { display: flex; align-items: center; gap: 10px; margin-bottom: 10px; }
        .rb-avatar { width: 48px; height: 48px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 13px; font-weight: 500; flex-shrink: 0; overflow: hidden; }
        .rb-avatar img { width: 100%; height: 100%; object-fit: cover; border-radius: 50%; }
        .rb-card-name { font-size: 14px; font-weight: 500; color: #1a3a5c; }
        .rb-card-title { font-size: 12px; color: #4a6480; }
        .rb-tag { display: inline-flex; align-items: center; gap: 4px; font-size: 11px; padding: 3px 9px; border-radius: 99px; border: 1px solid #e0eaf4; color: #4a6480; margin: 3px 3px 0 0; }
        .rb-locked { display: flex; align-items: center; gap: 6px; font-size: 12px; margin-top: 10px; padding: 7px 10px; border-radius: 8px; background: #f5f9fd; color: #9ca3af; border: 1px dashed #b8d0e8; }
        .rb-contact-blur { filter: blur(4px); font-size: 12px; color: #4a6480; user-select: none; }

        /* HOW IT WORKS */
        .rb-how { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
        .rb-how-col { background: #f5f9fd; border-radius: 16px; padding: 1.5rem; }
        .rb-how-col h3 { font-size: 14px; font-weight: 500; margin: 0 0 1rem; display: flex; align-items: center; gap: 8px; color: #1a3a5c; }
        .rb-step { display: flex; gap: 10px; margin-bottom: 12px; align-items: flex-start; }
        .rb-step-num { width: 22px; height: 22px; border-radius: 50%; background: #1a5fa8; color: #fff; font-size: 11px; font-weight: 500; display: flex; align-items: center; justify-content: center; flex-shrink: 0; margin-top: 1px; }
        .rb-step-text { font-size: 13px; color: #4a6480; line-height: 1.55; }
        .rb-step-text strong { color: #1a3a5c; font-weight: 500; }

        /* CTA */
        .rb-cta { margin: 0.5rem 2rem 2.5rem; background: #1a3a5c; border-radius: 20px; padding: 2.5rem; text-align: center; }
        .rb-cta h2 { font-family: 'DM Serif Display', serif; font-size: 28px; color: #a8d4f0; margin: 0 0 0.5rem; }
        .rb-cta p { font-size: 15px; color: #6ab0d8; margin: 0 0 1.75rem; }
        .rb-cta-btns { display: flex; gap: 10px; justify-content: center; flex-wrap: wrap; }
        .rb-cta .rb-btn { border-color: #2a9fd6; color: #a8d4f0; font-size: 14px; padding: 10px 22px; }
        .rb-cta .rb-btn:hover { background: rgba(255,255,255,0.08); }
        .rb-btn-cta-white { background: #fff !important; color: #1a3a5c !important; border-color: #fff !important; font-weight: 500; }
        .rb-btn-cta-white:hover { background: #e6f1fb !important; }

        /* FOOTER */
        .rb-footer { padding: 1.25rem 2rem; border-top: 1px solid #e0eaf4; display: flex; justify-content: space-between; align-items: center; }
        .rb-footer-text { font-size: 12px; color: #9ca3af; }

        @media (max-width: 600px) {
          .rb-nav { padding: 0.75rem 1rem; }
          .rb-stats { margin: 1.5rem 1rem; }
          .rb-section { padding: 1rem 1rem 2rem; }
          .rb-how { grid-template-columns: 1fr; }
          .rb-cta { margin: 0.5rem 1rem 2rem; padding: 1.75rem 1.25rem; }
          .rb-footer { flex-direction: column; gap: 6px; text-align: center; }
        }
      `}</style>

      <div className="rb-wrap">

        <nav className="rb-nav">
          <div className="rb-logo">
            <img src="/logo.png" alt="ARBETSpoolen" />
          </div>
          <div className="rb-nav-links">
            <a href="/register?role=seeker" className="rb-btn">För arbetssökare</a>
            <a href="/register?role=employer" className="rb-btn">För arbetsgivare</a>
            <a href="/login" className="rb-btn rb-btn-primary">Logga in</a>
          </div>
        </nav>

        {/* HERO med bakgrundsbild och zoom-animation */}
        <section className="rb-hero">
          <div className="rb-hero-bg" />
          <div className="rb-hero-overlay" />
          <div className="rb-hero-content">
            <div className="rb-badge">🇸🇪 Sverige</div>
            <h1>
              Talangen hittar <em>dig</em>,<br />inte tvärtom.
            </h1>
            <p>
              En omvänd jobbplattform där skickliga yrkespersoner listar sig
              själva — och arbetsgivare söker bland dem.
            </p>
            <div className="rb-hero-btns">
              <a href="/register?role=seeker" className="rb-btn rb-btn-white">
                ✦ Skapa profil — gratis
              </a>
              <a href="/seeker/dashboard" className="rb-btn rb-btn-orange">
                🔍 Sök kandidater
              </a>
            </div>
          </div>
        </section>

        <div className="rb-stats">
          <div className="rb-stat">
            <div className="rb-stat-num">2 400+</div>
            <div className="rb-stat-label">Aktiva profiler</div>
          </div>
          <div className="rb-stat">
            <div className="rb-stat-num">180+</div>
            <div className="rb-stat-label">Yrkeskategorier</div>
          </div>
          <div className="rb-stat">
            <div className="rb-stat-num">100%</div>
            <div className="rb-stat-label">Gratis för yrkespersoner</div>
          </div>
        </div>

        <section className="rb-section">
          <div className="rb-section-label">Exempel ur katalogen</div>
          <div className="rb-cards">

            <div className="rb-card">
              <div className="rb-card-header">
                <div className="rb-avatar">
                  <img src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=96&h=96&fit=crop&crop=face" alt="Snickare" />
                </div>
                <div>
                  <div className="rb-card-name">Erfaren Snickare</div>
                  <div className="rb-card-title">Stockholm · 12 år erfarenhet</div>
                </div>
              </div>
              <span className="rb-tag">🔧 Snickeri</span>
              <span className="rb-tag">📅 Tillgänglig nu</span>
              <div className="rb-locked">
                🔒 <span className="rb-contact-blur">anna.eriksson@mail.se · 070-xxx xx xx</span>
              </div>
            </div>

            <div className="rb-card">
              <div className="rb-card-header">
                <div className="rb-avatar">
                  <img src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=96&h=96&fit=crop&crop=face" alt="Bartender" />
                </div>
                <div>
                  <div className="rb-card-name">Bartender, Göteborg</div>
                  <div className="rb-card-title">Göteborg · 6 år erfarenhet</div>
                </div>
              </div>
              <span className="rb-tag">🍸 Bartender</span>
              <span className="rb-tag">📅 2 veckors varsel</span>
              <div className="rb-locked">
                🔒 <span className="rb-contact-blur">bjorn.m@mail.se · 073-xxx xx xx</span>
              </div>
            </div>

            <div className="rb-card" style={{ borderColor: "#1a5fa8", borderWidth: "2px", position: "relative" }}>
              <div style={{ position: "absolute", top: "-11px", left: "14px", background: "#f0a020", color: "#fff", fontSize: "10px", fontWeight: 500, padding: "2px 10px", borderRadius: "99px" }}>
                Premium
              </div>
              <div className="rb-card-header">
                <div className="rb-avatar">
                  <img src="https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=96&h=96&fit=crop&crop=face" alt="Karin Andersson" />
                </div>
                <div>
                  <div className="rb-card-name">Karin Andersson</div>
                  <div className="rb-card-title">Malmö · 9 år erfarenhet</div>
                </div>
              </div>
              <span className="rb-tag">👨‍🍳 Kock</span>
              <span className="rb-tag">📅 Tillgänglig nu</span>
              <div style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "12px", marginTop: "10px", color: "#1a5fa8" }}>
                ✉️ karin.a@gmail.com
              </div>
            </div>

          </div>
        </section>

        <section className="rb-section">
          <div className="rb-section-label">Hur det fungerar & Priser</div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "12px" }}>

            <div className="rb-how-col" style={{ display: "flex", flexDirection: "column" }}>
              <h3>👤 Yrkesperson</h3>
              <div className="rb-step">
                <div className="rb-step-num">1</div>
                <div className="rb-step-text"><strong>Registrera dig gratis</strong> och fyll i din profil på 5 minuter</div>
              </div>
              <div className="rb-step">
                <div className="rb-step-num">2</div>
                <div className="rb-step-text"><strong>Beskriv din kompetens</strong> — yrke, stad, erfarenhet, tillgänglighet</div>
              </div>
              <div className="rb-step">
                <div className="rb-step-num">3</div>
                <div className="rb-step-text"><strong>Bli hittad</strong> av arbetsgivare som söker just din profil</div>
              </div>
              <div style={{ paddingTop: "1.25rem", borderTop: "1px solid #e0eaf4", marginTop: "auto" }}>
                <div style={{ fontSize: "11px", fontWeight: 500, textTransform: "uppercase", letterSpacing: "0.5px", color: "#4a6480", marginBottom: "6px" }}>Pris</div>
                <div style={{ fontFamily: "'DM Serif Display', serif", fontSize: "26px", color: "#1a3a5c", lineHeight: 1, marginBottom: "6px" }}>Gratis</div>
                <div style={{ fontSize: "12px", color: "#4a6480", marginBottom: "12px" }}>För alltid gratis för yrkespersoner.</div>
                <a href="/register?role=seeker" className="rb-btn rb-btn-primary" style={{ justifyContent: "center", fontSize: "13px" }}>Kom igång →</a>
              </div>
            </div>

            <div className="rb-how-col" style={{ display: "flex", flexDirection: "column", border: "2px solid #1a5fa8" }}>
              <h3>🏢 Arbetsgivare</h3>
              <div className="rb-step">
                <div className="rb-step-num">1</div>
                <div className="rb-step-text"><strong>Sök i katalogen</strong> — filtrera på yrke och stad</div>
              </div>
              <div className="rb-step">
                <div className="rb-step-num">2</div>
                <div className="rb-step-text"><strong>Uppgradera till Premium</strong> för att se kontaktuppgifter</div>
              </div>
              <div className="rb-step">
                <div className="rb-step-num">3</div>
                <div className="rb-step-text"><strong>Kontakta direkt</strong> — inga mellanhänder, inga avgifter per kontakt</div>
              </div>
              <div style={{ paddingTop: "1.25rem", borderTop: "1px solid #e0eaf4", marginTop: "auto" }}>
                <div style={{ fontSize: "11px", fontWeight: 500, textTransform: "uppercase", letterSpacing: "0.5px", color: "#4a6480", marginBottom: "6px" }}>Pris</div>
                <div style={{ display: "flex", alignItems: "flex-end", gap: "4px", marginBottom: "6px" }}>
                  <div style={{ fontFamily: "'DM Serif Display', serif", fontSize: "26px", color: "#1a3a5c", lineHeight: 1 }}>499</div>
                  <div style={{ fontSize: "13px", color: "#4a6480", marginBottom: "3px" }}>kr/mån</div>
                </div>
                <div style={{ fontSize: "12px", color: "#4a6480", marginBottom: "12px" }}>Full tillgång till kandidatpoolen.</div>
                <a href="/register?role=employer" className="rb-btn rb-btn-primary" style={{ justifyContent: "center", fontSize: "13px" }}>Testa gratis →</a>
              </div>
            </div>

            <div className="rb-how-col" style={{ display: "flex", flexDirection: "column" }}>
              <h3>⭐ Varför ARBETSpoolen?</h3>
              <div className="rb-step">
                <div className="rb-step-num" style={{ background: "#f0a020" }}>✓</div>
                <div className="rb-step-text"><strong>Inga mellanhänder</strong> — kontakt direkt med kandidaten</div>
              </div>
              <div className="rb-step">
                <div className="rb-step-num" style={{ background: "#f0a020" }}>✓</div>
                <div className="rb-step-text"><strong>Fokus på Sverige</strong> — lokalt och relevant</div>
              </div>
              <div className="rb-step">
                <div className="rb-step-num" style={{ background: "#f0a020" }}>✓</div>
                <div className="rb-step-text"><strong>Snabbt och enkelt</strong> — profil på 5 minuter</div>
              </div>
              <div className="rb-step">
                <div className="rb-step-num" style={{ background: "#f0a020" }}>✓</div>
                <div className="rb-step-text"><strong>Gratis för yrkespersoner</strong> — alltid</div>
              </div>
              <div style={{ paddingTop: "1.25rem", borderTop: "1px solid #e0eaf4", marginTop: "auto", fontSize: "12px", color: "#4a6480", lineHeight: 1.6 }}>
                Fokus på bristbranscher som <strong>bygg, restaurang och service</strong> i hela Sverige.
              </div>
            </div>

          </div>
        </section>

        <div className="rb-cta">
          <h2>Redo att komma igång?</h2>
          <p>Gratis för yrkespersoner. Enkel månadsavgift för arbetsgivare.</p>
          <div className="rb-cta-btns">
            <a href="/register?role=seeker" className="rb-btn rb-btn-cta-white">Skapa profil gratis</a>
            <a href="/register?role=employer" className="rb-btn">Se priser för arbetsgivare</a>
          </div>
        </div>

        <footer className="rb-footer">
          <div className="rb-footer-text">© 2026 ARBETSpoolen · Sverige</div>
          <div className="rb-footer-text">Byggd med Next.js · Supabase · Stripe</div>
        </footer>

      </div>
    </>
  );
}
