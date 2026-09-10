"use client";

import { useEffect, useState } from "react";

const TARGET_DATE = new Date("2026-12-14T00:00:00");
type TimeLeft = {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
};

function getTimeLeft(): TimeLeft {
  const diff = Math.max(0, TARGET_DATE.getTime() - Date.now());
  const totalSeconds = Math.floor(diff / 1000);
  return {
    days: Math.floor(totalSeconds / 86400),
    hours: Math.floor((totalSeconds % 86400) / 3600),
    minutes: Math.floor((totalSeconds % 3600) / 60),
    seconds: totalSeconds % 60,
  };
}

function pad(n: number) {
  return n.toString().padStart(2, "0");
}

function UnitBox({ value, label }: { value: number; label: string }) {
  const digits = pad(value).split("");
  return (
    <div className="flex flex-col items-center gap-4">
      <div className="flex h-24 w-36 items-center justify-center gap-1 border border-white/15 bg-white/[0.02] sm:h-28 sm:w-40">
        {digits.map((d, i) => (
          <span key={i} className="digit-tile font-display text-5xl font-bold sm:text-6xl">
            {d}
          </span>
        ))}
      </div>
      <span className="text-xs font-medium tracking-[0.35em] text-white/40">{label}</span>
    </div>
  );
}

function Sep() {
  return (
    <div className="flex flex-col items-center justify-center gap-2 self-start pt-8">
      <span className="h-1 w-1 rounded-full bg-white/25" />
      <span className="h-1 w-1 rounded-full bg-white/25" />
    </div>
  );
}

export default function Countdown() {
  const [time, setTime] = useState<TimeLeft | null>(null);

  useEffect(() => {
    setTime(getTimeLeft());
    const id = setInterval(() => setTime(getTimeLeft()), 1000);
    return () => clearInterval(id);
  }, []);

  const t = time ?? { days: 0, hours: 0, minutes: 0, seconds: 0 };

  return (
    <div className="flex items-start justify-center gap-3 sm:gap-4">
      <UnitBox value={t.days} label="DAYS" />
      <Sep />
      <UnitBox value={t.hours} label="HOURS" />
      <Sep />
      <UnitBox value={t.minutes} label="MINUTES" />
      <Sep />
      <UnitBox value={t.seconds} label="SECONDS" />
    </div>
  );
}