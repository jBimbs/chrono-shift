"use client";

import { useState } from "react";

// EDIT THIS LIST: replace with your company's real departments
const DEPARTMENTS = [
  "Development",
  "Network",
  "Customer Support",
  "Business Solutions",
  "Finance and Admin/HR",
  "Sales and Marketing",
  "ELMIS",
];

// Display info for each team (keys must match the team names in Supabase)
const ERAS: Record<string, { tagline: string; color: string }> = {
  "1980": { tagline: "The Early Connections", color: "#f5a524" },
  "1990": { tagline: "EDI & Local Expansion", color: "#ec4899" },
  "2000": { tagline: "Trusted Digital Gateway", color: "#3b82f6" },
  "2010": { tagline: "Going Global", color: "#22d3ee" },
  "2020": { tagline: "The AI Era", color: "#6366f1" },
  "2030": { tagline: "The Next Chapter", color: "#a855f7" },
};

const inputClass =
  "w-full border border-white/15 bg-white/[0.02] px-4 py-3 text-sm text-white outline-none placeholder:text-white/25 focus:border-white/40 lg:py-2.5";
const labelClass =
  "text-xs font-medium tracking-[0.25em] text-white/40";

export default function RegisterPage() {
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [team, setTeam] = useState<string | null>(null);
  const [alreadyRegistered, setAlreadyRegistered] = useState(false);
  const [department, setDepartment] = useState("");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const name = formData.get("name");
    const nickname = formData.get("nickname");
    const email = formData.get("email");
    const departmentValue = formData.get("department");

    try {
      const res = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          nickname,
          email,
          department: departmentValue,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error ?? "Something went wrong. Please try again.");
        return;
      }

      setTeam(data.team ?? null);
      setAlreadyRegistered(Boolean(data.alreadyRegistered));
      setSubmitted(true);
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  const era = team ? ERAS[team] : null;

  return (
    <main className="page-main bg-[#050505]">
      <div className="starfield" />

      <section className="hero-vignette relative z-10 flex flex-1 items-center justify-center px-6 py-16 lg:py-0">
        <div className="grid w-full max-w-5xl items-center gap-10 lg:grid-cols-2 lg:gap-16">
          {/* Title block */}
          <div className="flex flex-col items-center text-center lg:items-start lg:text-left">
            <div className="mb-8 flex items-center gap-4 text-[11px] font-medium tracking-[0.4em] text-white/45 lg:mb-5">
              <span className="h-px w-10 bg-white/20" />
              RESERVE YOUR SPOT
              <span className="h-px w-10 bg-white/20 lg:hidden" />
            </div>

            <h1 className="font-display text-[10vw] font-black leading-[0.95] tracking-tight sm:text-6xl lg:text-[min(4.5rem,11vh)]">
              <span className="metal-text">REGISTER</span>
            </h1>

            <p className="mt-6 max-w-md text-sm tracking-wide text-white/50 lg:mt-4">
              December 14, 2026 · Time TBA · Makati City
            </p>
          </div>

          {/* Form / success */}
          {submitted ? (
            <div className="w-full border border-white/15 px-6 py-8 text-center text-sm tracking-wide text-white/70 lg:text-left">
              <p>
                {alreadyRegistered
                  ? "Welcome back. You're already registered."
                  : "You're on the list."}
              </p>

              {team && (
                <>
                  <p className="mt-6 text-[11px] tracking-[0.4em] text-white/40">
                    YOUR ERA
                  </p>
                  <p
                    className="mt-2 font-display text-5xl font-black tracking-tight"
                    style={{
                      color: era?.color ?? "#ffffff",
                      textShadow: `0 0 28px ${era?.color ?? "#ffffff"}80`,
                    }}
                  >
                    {team}
                  </p>
                  {era && (
                    <p className="mt-2 text-xs tracking-[0.3em] text-white/60">
                      {era.tagline.toUpperCase()}
                    </p>
                  )}
                </>
              )}

              <p className="mt-6 text-white/50">
                Confirmation details will follow closer to the date.
              </p>
            </div>
          ) : (
            <form
              onSubmit={handleSubmit}
              className="flex w-full flex-col gap-4 text-left lg:gap-3"
            >
              <div className="flex items-start gap-3 border border-white/15 bg-white/[0.03] px-4 py-2.5">
                <svg
                  className="mt-0.5 h-4 w-4 shrink-0 text-white/50"
                  viewBox="0 0 20 20"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  aria-hidden="true"
                >
                  <circle cx="10" cy="10" r="8" />
                  <path d="M10 9v5" strokeLinecap="round" />
                  <circle cx="10" cy="6.25" r="0.5" fill="currentColor" />
                </svg>
                <p className="text-xs leading-relaxed tracking-wide text-white/55">
                  If you&apos;re already registered, just enter your company
                  email address to see your designated team.
                </p>
              </div>

              <div className="grid gap-4 sm:grid-cols-2 lg:gap-3">
                <div className="flex flex-col gap-2">
                  <label htmlFor="name" className={labelClass}>
                    FULL NAME
                  </label>
                  <input
                    id="name"
                    name="name"
                    type="text"
                    className={inputClass}
                    placeholder="Jane Doe"
                  />
                </div>

                <div className="flex flex-col gap-2">
                  <label htmlFor="nickname" className={labelClass}>
                    NICKNAME <span className="text-white/25">(OPTIONAL)</span>
                  </label>
                  <input
                    id="nickname"
                    name="nickname"
                    type="text"
                    maxLength={24}
                    title="Shown on the Wall of Thoughts instead of your full name"
                    className={inputClass}
                    placeholder="Shown on the wall"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <label htmlFor="email" className={labelClass}>
                  COMPANY EMAIL
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  pattern="^[a-zA-Z0-9._%+-]+@(intercommerce\.com\.ph|ictechnologies\.ph)$"
                  title="Please use your @intercommerce.com.ph or @ictechnologies.ph email address"
                  className={inputClass}
                  placeholder="jane@intercommerce.com.ph"
                />
              </div>

              <div className="flex flex-col gap-2">
                <label htmlFor="department" className={labelClass}>
                  DEPARTMENT
                </label>
                <div className="relative">
                  <select
                    id="department"
                    name="department"
                    value={department}
                    onChange={(e) => setDepartment(e.target.value)}
                    className={`w-full appearance-none border border-white/15 bg-[#050505] px-4 py-3 pr-10 text-sm outline-none focus:border-white/40 lg:py-2.5 ${
                      department ? "text-white" : "text-white/25"
                    }`}
                  >
                    <option
                      value=""
                      disabled
                      className="bg-[#050505] text-white/40"
                    >
                      Choose your department
                    </option>
                    {DEPARTMENTS.map((dept) => (
                      <option
                        key={dept}
                        value={dept}
                        className="bg-[#050505] text-white"
                      >
                        {dept}
                      </option>
                    ))}
                  </select>
                  <svg
                    className="pointer-events-none absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-white/40"
                    viewBox="0 0 20 20"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    aria-hidden="true"
                  >
                    <path
                      d="M5 8l5 5 5-5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </div>
              </div>

              {error && <p className="text-sm text-red-400/80">{error}</p>}

              <button
                type="submit"
                disabled={loading}
                className="metal-button mt-2 px-10 py-4 text-sm font-semibold tracking-[0.2em] text-black transition-transform hover:scale-[1.02] disabled:opacity-50 disabled:hover:scale-100 lg:py-3"
              >
                {loading ? "SUBMITTING..." : "CONFIRM REGISTRATION"}
              </button>
            </form>
          )}
        </div>
      </section>

      <footer className="relative z-10 flex items-center justify-between border-t border-white/[0.08] bg-[#050505] px-6 py-6 text-[11px] tracking-[0.15em] text-white/35 sm:px-10 lg:py-3">
        <span>© 2026 INTERCOMMERCE</span>
        <span>TIME IS A CONSTRUCT</span>
      </footer>
    </main>
  );
}