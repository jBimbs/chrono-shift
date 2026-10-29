"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { OPEN_AT, LOCKED_PATHS } from "@/lib/event-config";

type NavProps = {
  dateLabel?: string;
};

const NAV_LINKS = [
  { href: "/", label: "HOME" },
  { href: "/about", label: "ABOUT" },
  { href: "/venue", label: "VENUE" },
  { href: "/rsvp", label: "RSVP" },
  { href: "/wall", label: "YEAR END WALL" },
];

export default function Nav({ dateLabel = "DEC 14 · 2026" }: NavProps) {
  const [open, setOpen] = useState(false); // has the event opened?
  const [menuOpen, setMenuOpen] = useState(false); // mobile menu

  useEffect(() => {
    const check = () => setOpen(Date.now() >= OPEN_AT);
    check();
    const id = setInterval(check, 30_000);
    return () => clearInterval(id);
  }, []);

  // Close the mobile menu when the screen grows or Escape is pressed
  useEffect(() => {
    const mq = window.matchMedia("(min-width: 640px)");
    const onChange = () => {
      if (mq.matches) setMenuOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setMenuOpen(false);
    };
    mq.addEventListener("change", onChange);
    window.addEventListener("keydown", onKey);
    return () => {
      mq.removeEventListener("change", onChange);
      window.removeEventListener("keydown", onKey);
    };
  }, []);

  return (
    <header className="relative z-50 flex items-center justify-between border-b border-white/[0.08] bg-[#050505] px-5 py-4 sm:px-10 sm:py-5">
      <Link href="/" className="flex items-center gap-3" onClick={() => setMenuOpen(false)}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/ins-logo.png"
          alt="ChronoShift logo"
          className="relative z-10 h-8 w-auto sm:h-10"
        />
      </Link>

      <nav className="hidden gap-10 text-xs font-medium tracking-[0.3em] text-white/50 sm:flex">
        {NAV_LINKS.map((link) => {
          const isLocked = !open && LOCKED_PATHS.includes(link.href);

          return isLocked ? (
            <span
              key={link.href}
              aria-disabled="true"
              title="Opens October 30"
              className="cursor-not-allowed text-white/25"
            >
              {link.label}
            </span>
          ) : (
            <Link
              key={link.href}
              href={link.href}
              className="transition-colors hover:text-white/90"
            >
              {link.label}
            </Link>
          );
        })}
      </nav>

      <div className="flex items-center gap-4">
        <span className="text-[10px] tracking-[0.2em] text-white/40 sm:text-xs sm:tracking-[0.25em]">
          {dateLabel}
        </span>

        <button
          type="button"
          onClick={() => setMenuOpen((v) => !v)}
          aria-label={menuOpen ? "Close menu" : "Open menu"}
          aria-expanded={menuOpen}
          aria-controls="mobile-nav"
          className="flex h-10 w-10 items-center justify-center border border-white/15 text-white/70 transition-colors hover:border-white/40 hover:text-white sm:hidden"
        >
          <svg
            width="18"
            height="18"
            viewBox="0 0 18 18"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="square"
            aria-hidden="true"
          >
            {menuOpen ? (
              <path d="M3 3l12 12M15 3L3 15" />
            ) : (
              <path d="M2 5h14M2 9h14M2 13h14" />
            )}
          </svg>
        </button>
      </div>

      {menuOpen && (
        <nav
          id="mobile-nav"
          className="absolute left-0 right-0 top-full flex flex-col border-b border-white/[0.08] bg-[#050505] px-5 py-2 sm:hidden"
        >
          {NAV_LINKS.map((link) => {
            const isLocked = !open && LOCKED_PATHS.includes(link.href);

            return isLocked ? (
              <span
                key={link.href}
                aria-disabled="true"
                className="flex items-center justify-between border-b border-white/[0.06] py-4 text-xs font-medium tracking-[0.3em] text-white/25 last:border-b-0"
              >
                {link.label}
                <span className="text-[10px] tracking-[0.2em]">OPENS OCT 30</span>
              </span>
            ) : (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMenuOpen(false)}
                className="border-b border-white/[0.06] py-4 text-xs font-medium tracking-[0.3em] text-white/70 transition-colors last:border-b-0 hover:text-white"
              >
                {link.label}
              </Link>
            );
          })}
        </nav>
      )}
    </header>
  );
}