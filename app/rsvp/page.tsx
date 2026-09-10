"use client";

import { useState } from "react";

export default function RegisterPage() {
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const name = formData.get("name");
    const email = formData.get("email");

    try {
      const res = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error ?? "Something went wrong. Please try again.");
        return;
      }

      setSubmitted(true);
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="relative min-h-screen overflow-x-hidden bg-[#050505]">
      <div className="starfield" />

      <section className="hero-vignette relative z-10 flex flex-col items-center px-6 py-20 text-center sm:py-28">
        <div className="mb-8 flex items-center gap-4 text-[11px] font-medium tracking-[0.4em] text-white/45">
          <span className="h-px w-10 bg-white/20" />
          RESERVE YOUR SPOT
          <span className="h-px w-10 bg-white/20" />
        </div>

        <h1 className="font-display text-[10vw] font-black leading-[0.95] tracking-tight sm:text-6xl">
          <span className="metal-text">REGISTER</span>
        </h1>

        <p className="mt-6 max-w-md text-sm tracking-wide text-white/50">
          December 14, 2026 · Time TBA · Makati City
        </p>

        {submitted ? (
          <div className="mt-12 w-full max-w-md border border-white/15 px-6 py-8 text-sm tracking-wide text-white/70">
            You&apos;re on the list. Confirmation details will follow closer to the date.
          </div>
        ) : (
          <form
        onSubmit={handleSubmit}
        className="mt-12 flex w-full max-w-md flex-col gap-5 text-left"
        >
        <div className="flex flex-col gap-2">
            <label
            htmlFor="name"
            className="text-xs font-medium tracking-[0.25em] text-white/40"
            >
            FULL NAME
            </label>
            <input
            id="name"
            name="name"
            type="text"
            required
            className="border border-white/15 bg-white/[0.02] px-4 py-3 text-sm text-white outline-none placeholder:text-white/25 focus:border-white/40"
            placeholder="Jane Doe"
            />
        </div>

        <div className="flex flex-col gap-2">
            <label
            htmlFor="email"
            className="text-xs font-medium tracking-[0.25em] text-white/40"
            >
            EMAIL
            </label>
            <input
            id="email"
            name="email"
            type="email"
            required
            pattern="^[a-zA-Z0-9._%+-]+@intercommerce\.com\.ph$"
            title="Please use your @intercommerce.com.ph email address"
            className="border border-white/15 bg-white/[0.02] px-4 py-3 text-sm text-white outline-none placeholder:text-white/25 focus:border-white/40"
            placeholder="jane@intercommerce.com.ph"
            />
            <span className="text-xs text-white/30">
            Must be a valid @intercommerce.com.ph address.
            </span>
        </div>

        {error && (
  <p className="text-sm text-red-400/80">{error}</p>
)}

<button
  type="submit"
  disabled={loading}
  className="metal-button mt-4 px-10 py-4 text-sm font-semibold tracking-[0.2em] text-black transition-transform hover:scale-[1.02] disabled:opacity-50 disabled:hover:scale-100"
>
  {loading ? "SUBMITTING..." : "CONFIRM REGISTRATION"}
</button>
        </form>
        )}
      </section>

      <footer className="relative z-10 flex items-center justify-between border-t border-white/[0.08] bg-[#050505] px-6 py-6 text-[11px] tracking-[0.15em] text-white/35 sm:px-10">
        <span>© 2026 INTERCOMMERCE</span>
        <span>TIME IS A CONSTRUCT</span>
      </footer>
    </main>
  );
}