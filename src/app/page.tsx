"use client";

import { LinkButton } from "@/components/ui/Button";

export default function Home() {
  return (
    <>
      <section className="relative min-h-[88vh] flex items-center justify-center text-center overflow-hidden bg-white">
        <div
          className="absolute inset-0 bg-cover bg-center scale-[1.08]"
          style={{ backgroundImage: "url('/hero.png')", backgroundPosition: "center 30%" }}
        />
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(to bottom, rgba(10,25,50,0.55) 0%, rgba(10,25,50,0.45) 50%, rgba(10,25,50,0.70) 100%)",
          }}
        />
        <div className="relative z-10 px-6 py-20 max-w-[680px]">
          <div className="inline-block text-xs font-medium tracking-wide uppercase px-3.5 py-1 rounded-full bg-white/20 border border-white/30 text-white mb-6 backdrop-blur-sm">
            🇸🇪 Sverige
          </div>
          <h1 className="font-serif text-[clamp(36px,6vw,58px)] leading-[1.12] tracking-tight text-white mb-4 drop-shadow-lg">
            Talangen hittar <em className="italic text-[var(--brand-accent)]">dig</em>,
            <br />
            inte tvärtom.
          </h1>
          <p className="text-[17px] text-white/85 max-w-[460px] mx-auto mb-9 leading-relaxed">
            En omvänd jobbplattform där skickliga yrkespersoner listar sig
            själva — och arbetsgivare söker bland dem.
          </p>
          <div className="flex flex-wrap gap-3 justify-center">
            <LinkButton
              href="/register?role=job_seeker"
              className="!bg-white !text-[var(--brand-navy)] !border-white hover:!bg-[#e6f1fb]"
              size="lg"
            >
              ✦ Skapa profil — gratis
            </LinkButton>
            <LinkButton href="/employer/directory" variant="premium" size="lg">
              🔍 Sök kandidater
            </LinkButton>
          </div>
        </div>
      </section>

      <div className="mx-8 sm:mx-10 my-10 max-w-7xl lg:mx-auto">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-px rounded-2xl overflow-hidden border border-[var(--border)] bg-[var(--border)]">
          {[
            { num: "2 400+", label: "Aktiva profiler" },
            { num: "180+", label: "Yrkeskategorier" },
            { num: "100%", label: "Gratis för yrkespersoner" },
          ].map((s) => (
            <div key={s.label} className="bg-white p-6 text-center">
              <div className="font-serif text-[30px] text-[var(--brand)] leading-none mb-1">
                {s.num}
              </div>
              <div className="text-[13px] text-[var(--muted)]">{s.label}</div>
            </div>
          ))}
        </div>
      </div>

      <section className="px-6 sm:px-8 pb-10 max-w-7xl mx-auto">
        <div className="text-[11px] font-medium tracking-widest uppercase text-[#9ca3af] mb-4">
          Exempel ur katalogen
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          <ExampleCard
            name="Erfaren Snickare"
            meta="Stockholm · 12 år erfarenhet"
            tags={["🔧 Snickeri", "📅 Tillgänglig nu"]}
            locked
          />
          <ExampleCard
            name="Bartender, Göteborg"
            meta="Göteborg · 6 år erfarenhet"
            tags={["🍸 Bartender", "📅 2 veckors varsel"]}
            locked
          />
          <ExampleCard
            name="Karin Andersson"
            meta="Malmö · 9 år erfarenhet"
            tags={["👨‍🍳 Kock", "📅 Tillgänglig nu"]}
            premium
            contact="✉️ karin.a@gmail.com"
          />
        </div>
      </section>

      <section className="px-6 sm:px-8 pb-12 max-w-7xl mx-auto">
        <div className="text-[11px] font-medium tracking-widest uppercase text-[#9ca3af] mb-4">
          Hur det fungerar & Priser
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
          <HowCol
            title="👤 Yrkesperson"
            steps={[
              ["Registrera dig gratis", "och fyll i din profil på 5 minuter"],
              ["Beskriv din kompetens", "— yrke, stad, erfarenhet, tillgänglighet"],
              ["Bli hittad", "av arbetsgivare som söker just din profil"],
            ]}
            price="Gratis"
            priceNote="För alltid gratis för yrkespersoner."
            ctaHref="/register?role=job_seeker"
            ctaLabel="Kom igång →"
          />
          <HowCol
            title="🏢 Arbetsgivare"
            highlight
            steps={[
              ["Sök i katalogen", "— filtrera på yrke och stad"],
              ["Uppgradera till Premium", "för att se kontaktuppgifter"],
              ["Kontakta direkt", "— inga mellanhänder, inga avgifter per kontakt"],
            ]}
            price="499"
            priceSuffix="kr/mån"
            priceNote="Full tillgång till kandidatpoolen."
            ctaHref="/register?role=employer"
            ctaLabel="Testa gratis →"
          />
          <HowCol
            title="⭐ Varför ARBETSpoolen?"
            checks={[
              "Inga mellanhänder — kontakt direkt med kandidaten",
              "Fokus på Sverige — lokalt och relevant",
              "Snabbt och enkelt — profil på 5 minuter",
              "Gratis för yrkespersoner — alltid",
            ]}
            footerNote="Fokus på bristbranscher som bygg, restaurang och service i hela Sverige."
          />
        </div>
      </section>

      <div className="mx-6 sm:mx-8 mb-12 max-w-7xl lg:mx-auto rounded-[20px] bg-[var(--brand-navy)] p-10 text-center">
        <h2 className="font-serif text-[28px] text-[#a8d4f0] mb-2">Redo att komma igång?</h2>
        <p className="text-[15px] text-[#6ab0d8] mb-7">
          Gratis för yrkespersoner. Enkel månadsavgift för arbetsgivare.
        </p>
        <div className="flex flex-wrap gap-2.5 justify-center">
          <LinkButton
            href="/register?role=job_seeker"
            className="!bg-white !text-[var(--brand-navy)] !border-white hover:!bg-[#e6f1fb]"
          >
            Skapa profil gratis
          </LinkButton>
          <LinkButton href="/register?role=employer" variant="outline" className="!border-[#2a9fd6] !text-[#a8d4f0] hover:!bg-white/10">
            Se priser för arbetsgivare
          </LinkButton>
        </div>
      </div>
    </>
  );
}

function ExampleCard({
  name,
  meta,
  tags,
  locked,
  premium,
  contact,
}: {
  name: string;
  meta: string;
  tags: string[];
  locked?: boolean;
  premium?: boolean;
  contact?: string;
}) {
  return (
    <div
      className={`rounded-2xl border bg-white p-5 relative ${
        premium ? "border-[var(--brand)] border-2" : "border-[var(--border)]"
      }`}
    >
      {premium && (
        <span className="absolute -top-2.5 left-3.5 bg-[var(--brand-orange)] text-white text-[10px] font-medium px-2.5 py-0.5 rounded-full">
          Premium
        </span>
      )}
      <div className="flex items-center gap-2.5 mb-2.5">
        <div className="w-12 h-12 rounded-full bg-[var(--surface)] border border-[var(--border)]" />
        <div>
          <div className="text-sm font-medium text-[var(--brand-navy)]">{name}</div>
          <div className="text-xs text-[var(--muted)]">{meta}</div>
        </div>
      </div>
      <div className="flex flex-wrap gap-1">
        {tags.map((t) => (
          <span
            key={t}
            className="inline-flex text-[11px] px-2 py-0.5 rounded-full border border-[var(--border)] text-[var(--muted)]"
          >
            {t}
          </span>
        ))}
      </div>
      {locked && (
        <div className="flex items-center gap-1.5 text-xs mt-2.5 p-2 rounded-lg bg-[var(--surface)] border border-dashed border-[var(--border-strong)] text-[#9ca3af]">
          🔒 <span className="blur-[4px] select-none">anna@mail.se · 070-xxx xx xx</span>
        </div>
      )}
      {contact && (
        <div className="text-xs mt-2.5 text-[var(--brand)]">{contact}</div>
      )}
    </div>
  );
}

function HowCol({
  title,
  steps,
  checks,
  price,
  priceSuffix,
  priceNote,
  ctaHref,
  ctaLabel,
  highlight,
  footerNote,
}: {
  title: string;
  steps?: [string, string][];
  checks?: string[];
  price?: string;
  priceSuffix?: string;
  priceNote?: string;
  ctaHref?: string;
  ctaLabel?: string;
  highlight?: boolean;
  footerNote?: string;
}) {
  return (
    <div
      className={`rounded-2xl p-6 flex flex-col bg-[var(--surface)] ${
        highlight ? "border-2 border-[var(--brand)]" : "border border-[var(--border)]"
      }`}
    >
      <h3 className="text-sm font-medium text-[var(--brand-navy)] mb-4 flex items-center gap-2">
        {title}
      </h3>
      {steps?.map(([strong, rest], i) => (
        <div key={i} className="flex gap-2.5 mb-3 items-start">
          <span className="w-[22px] h-[22px] rounded-full bg-[var(--brand)] text-white text-[11px] font-medium flex items-center justify-center shrink-0 mt-0.5">
            {i + 1}
          </span>
          <p className="text-[13px] text-[var(--muted)] leading-snug">
            <strong className="text-[var(--brand-navy)] font-medium">{strong}</strong> {rest}
          </p>
        </div>
      ))}
      {checks?.map((c) => (
        <div key={c} className="flex gap-2.5 mb-3 items-start">
          <span className="w-[22px] h-[22px] rounded-full bg-[var(--brand-orange)] text-white text-[11px] flex items-center justify-center shrink-0">
            ✓
          </span>
          <p className="text-[13px] text-[var(--muted)] leading-snug">
            <strong className="text-[var(--brand-navy)] font-medium">{c.split(" — ")[0]}</strong>
            {c.includes(" — ") ? ` — ${c.split(" — ")[1]}` : ""}
          </p>
        </div>
      ))}
      {price && (
        <div className="pt-5 border-t border-[var(--border)] mt-auto">
          <div className="text-[11px] font-medium uppercase tracking-wide text-[var(--muted)] mb-1.5">
            Pris
          </div>
          <div className="flex items-end gap-1 mb-1.5">
            <span className="font-serif text-[26px] text-[var(--brand-navy)] leading-none">
              {price}
            </span>
            {priceSuffix && (
              <span className="text-[13px] text-[var(--muted)] mb-0.5">{priceSuffix}</span>
            )}
          </div>
          {priceNote && <p className="text-xs text-[var(--muted)] mb-3">{priceNote}</p>}
          {ctaHref && ctaLabel && (
            <LinkButton href={ctaHref} variant="primary" className="w-full justify-center text-[13px]">
              {ctaLabel}
            </LinkButton>
          )}
        </div>
      )}
      {footerNote && (
        <p className="pt-5 border-t border-[var(--border)] mt-auto text-xs text-[var(--muted)] leading-relaxed">
          {footerNote}
        </p>
      )}
    </div>
  );
}
