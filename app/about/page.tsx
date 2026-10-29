"use client";

import { useState } from "react";
import type { JSX } from "react";

type Milestone = {
  year: string;
  text: string;
};

type Era = {
  id: string;
  year: string;
  title: string;
  color: string; // Tailwind arbitrary color for glow/accent
  icon: JSX.Element;
  milestones: Milestone[];
};

const ERAS: Era[] = [
  {
    id: "1980",
    year: "1980",
    title: "THE EARLY CONNECTIONS",
    color: "#e0b559",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" className="h-8 w-8">
        <rect x="3" y="4" width="18" height="12" rx="1" stroke="currentColor" strokeWidth="1.5" />
        <path d="M8 20h8M12 16v4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    ),
    milestones: [
      { year: "1987", text: "GE Info Services — quick connection mailboxes before the internet." },
      { year: "—", text: "BizLink managed hosted services." },
    ],
  },
  {
    id: "1990",
    year: "1990",
    title: "LOCAL & GLOBAL EXPANSION",
    color: "#6bb7e0",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" className="h-8 w-8">
        <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.5" />
        <path d="M12 12 L16 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    ),
    milestones: [
      { year: "1994", text: "EDI & customs data exchange systems introduced." },
      { year: "1998", text: "Launch of EDI gateway for customs." },
    ],
  },
  {
    id: "2000",
    year: "2000",
    title: "TRUSTED DIGITAL GATEWAY",
    color: "#6bb7e0",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" className="h-8 w-8">
        <path
          d="M12 3l7 3v6c0 4.5-3 7.5-7 9-4-1.5-7-4.5-7-9V6l7-3z"
          stroke="currentColor"
          strokeWidth="1.5"
        />
      </svg>
    ),
    milestones: [
      { year: "2000", text: "Accredited as the 1st VASP — PEZA, BOC & BIR." },
    ],
  },
  {
    id: "2010",
    year: "2010",
    title: "GOING GLOBAL",
    color: "#8f8fe0",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" className="h-8 w-8">
        <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.5" />
        <path d="M3 12h18M12 3c2.5 2.5 2.5 15.5 0 18M12 3c-2.5 2.5-2.5 15.5 0 18" stroke="currentColor" strokeWidth="1.5" />
      </svg>
    ),
    milestones: [
      { year: "2010", text: "Launch of international advance notice — ASEAN and beyond." },
    ],
  },
  {
    id: "2020",
    year: "2020",
    title: "THE AI ERA",
    color: "#a06be0",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" className="h-8 w-8">
        <circle cx="12" cy="10" r="6" stroke="currentColor" strokeWidth="1.5" />
        <path d="M9 10h.01M15 10h.01M9 21v-3a3 3 0 013-3 3 3 0 013 3v3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    ),
    milestones: [
      { year: "2026", text: "AI transformation across core services." },
    ],
  },
  {
    id: "2030",
    year: "2030",
    title: "THE NEXT CHAPTER",
    color: "#c06be0",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" className="h-8 w-8">
        <rect x="5" y="11" width="14" height="9" rx="1" stroke="currentColor" strokeWidth="1.5" />
        <path d="M8 11V8a4 4 0 018 0v3" stroke="currentColor" strokeWidth="1.5" />
      </svg>
    ),
    milestones: [{ year: "—", text: "The journey continues." }],
  },
];

export default function AboutPage() {
  const [openId, setOpenId] = useState<string | null>(null);

  return (
    <main className="relative min-h-screen overflow-x-hidden bg-[#050505]">
      <div className="starfield" />

      <section className="relative z-10 flex flex-col items-center px-5 pb-24 pt-16 text-center sm:px-6 sm:pb-32 sm:pt-28">
        <p className="mb-4 text-[11px] font-medium tracking-[0.4em] text-white/45">
          INTERCOMMERCE NETWORK SERVICES, INC.
        </p>

        <h1 className="font-display text-[9vw] font-black leading-[0.95] tracking-tight sm:text-6xl">
          <span className="metal-text">OUR JOURNEY THROUGH TIME</span>
        </h1>

        <p className="mt-4 text-xs font-medium tracking-[0.3em] text-white/40 sm:text-sm">
          FROM CONNECTIONS TO INTELLIGENCE
        </p>

        {/* Trailer */}
        <div className="relative mt-12 w-full max-w-4xl sm:mt-16">
          <div className="relative aspect-video w-full overflow-hidden border border-white/15 bg-black shadow-[0_0_40px_rgba(255,255,255,0.08)]">
            <video
  className="h-full w-full object-cover"
  src="/images/Trailer.mp4"
  poster="https://libmvhwcvwjadzflpezo.supabase.co/storage/v1/object/public/videos/trailer-poster.jpg"
  controls
  playsInline
  preload="metadata"
/>
          </div>
          <p className="mt-3 text-[10px] font-medium tracking-[0.3em] text-white/35">
            OFFICIAL TRAILER
          </p>
        </div>

        {/* Timeline: stacked on phones, 2 columns on tablets, a rail on laptops */}
        <div className="relative mt-20 w-full max-w-6xl sm:mt-28">
          {/* rail above the cards (laptop only) */}
          <div
            aria-hidden
            className="absolute left-0 right-0 top-[5px] hidden h-px bg-gradient-to-r from-[#e0b559] via-[#6bb7e0] to-[#c06be0] opacity-60 lg:block"
          />

          <div className="flex flex-col gap-6 sm:grid sm:grid-cols-2 sm:gap-6 lg:flex lg:flex-row lg:items-start lg:justify-between lg:gap-4">
            {ERAS.map((era, i) => {
              const isOpen = openId === era.id;
              const stemClass = i % 2 === 0 ? "lg:h-6" : "lg:h-[5.5rem]";

              return (
                <div key={era.id} className="flex flex-1 flex-col items-center">
                  {/* dot on the rail */}
                  <span
                    aria-hidden
                    className="hidden h-[11px] w-[11px] rounded-full ring-4 ring-[#050505] lg:block"
                    style={{ backgroundColor: era.color, boxShadow: `0 0 12px ${era.color}` }}
                  />
                  {/* stem down to the card */}
                  <span
                    aria-hidden
                    className={`hidden w-px lg:block ${stemClass}`}
                    style={{ background: `linear-gradient(${era.color}, ${era.color}22)` }}
                  />

                  <button
                    type="button"
                    onClick={() => setOpenId(isOpen ? null : era.id)}
                    className="group relative flex w-full flex-col items-center gap-4 border border-white/10 bg-white/[0.02] px-5 py-8 text-center transition-all duration-300 hover:border-white/25 hover:bg-white/[0.04]"
                    style={{
                      boxShadow: isOpen ? `0 0 30px ${era.color}33` : undefined,
                    }}
                    aria-expanded={isOpen}
                  >
                    <span
                      className="flex h-14 w-14 items-center justify-center rounded-full border"
                      style={{ color: era.color, borderColor: `${era.color}55` }}
                    >
                      {era.icon}
                    </span>

                    <span
                      className="font-display text-3xl font-black"
                      style={{ color: era.color }}
                    >
                      {era.year}
                    </span>

                    <span className="text-[11px] font-medium tracking-[0.2em] text-white/60">
                      {era.title}
                    </span>

                    <span className="text-[10px] tracking-[0.15em] text-white/25">
                      {isOpen ? "TAP TO COLLAPSE" : "TAP FOR DETAILS"}
                    </span>

                    <div
                      className={`grid w-full overflow-hidden text-left transition-all duration-300 ${
                        isOpen ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
                      }`}
                    >
                      <div className="min-h-0">
                        <ul className="mt-2 flex flex-col gap-3 border-t border-white/10 pt-4">
                          {era.milestones.map((m, idx) => (
                            <li key={idx} className="text-xs leading-relaxed text-white/50">
                              <span className="font-semibold text-white/70">{m.year}</span>{" "}
                              {m.text}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <footer className="relative z-10 flex flex-col items-center gap-1 border-t border-white/[0.08] bg-[#050505] px-6 py-6 text-[11px] tracking-[0.15em] text-white/35 sm:flex-row sm:justify-between sm:px-10">
        <span>© 2026 CHRONOSHIFT EVENTS</span>
        <span>TIME IS A CONSTRUCT</span>
      </footer>
    </main>
  );
}