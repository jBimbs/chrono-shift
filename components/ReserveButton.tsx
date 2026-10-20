"use client";

import { useEffect, useState } from "react";

// Oct 30, 2026 00:00 Manila time (UTC+8)
const OPEN_AT = new Date("2026-10-30T00:00:00+08:00").getTime();

const baseClass =
  "metal-button px-10 py-4 text-sm font-semibold tracking-[0.2em] text-black";

export default function ReserveButton() {
  const [open, setOpen] = useState<boolean | null>(null);

  useEffect(() => {
    const check = () => setOpen(Date.now() >= OPEN_AT);
    check();
    const id = setInterval(check, 30_000);
    return () => clearInterval(id);
  }, []);

  // Avoid hydration flash: render the locked state until the client knows
  if (open) {
    return (
      <a
        href="/rsvp"
        className={`${baseClass} transition-transform hover:scale-[1.02]`}
      >
        RESERVE ACCESS
      </a>
    );
  }

  return (
    <div className="flex flex-col items-center gap-3">
      <button
        type="button"
        disabled
        aria-disabled="true"
        className={`${baseClass} cursor-not-allowed opacity-40 grayscale`}
      >
         RESERVE ACCESS
      </button>
      <span className="text-[11px] font-medium tracking-[0.3em] text-white/45">
        OPENS OCTOBER 30
      </span>
    </div>
  );
}