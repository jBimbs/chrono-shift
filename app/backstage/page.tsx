"use client";

import { useState } from "react";
import { ERAS } from "@/lib/eras";

type EarlyBird = {
  name: string;
  nickname: string | null;
  email: string;
  department: string;
  team: string | null;
  created_at: string;
};

// This page is allowed to scroll even when the other pages are locked
const UNLOCK_CSS = `
html, body { height: auto !important; overflow: auto !important; }
.app-shell { height: auto !important; overflow: visible !important; }
`;

function formatTime(iso: string) {
  return new Date(iso).toLocaleString("en-PH", {
    timeZone: "Asia/Manila",
    dateStyle: "medium",
    timeStyle: "medium",
  });
}

export default function BackstagePage() {
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [birds, setBirds] = useState<EarlyBird[] | null>(null);
  const [total, setTotal] = useState(0);

  async function load(e?: React.FormEvent) {
    e?.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await fetch("/api/admin/early-birds", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error ?? "Something went wrong.");
        setBirds(null);
        return;
      }

      setBirds(data.earlyBirds);
      setTotal(data.total);
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  function signOut() {
    setBirds(null);
    setPassword("");
  }

  return (
    <main className="relative flex-1 bg-[#050505]">
      <style dangerouslySetInnerHTML={{ __html: UNLOCK_CSS }} />
      <div className="starfield" />

      <section className="relative z-10 mx-auto w-full max-w-4xl px-6 py-16">
        <div className="mb-10 flex items-center gap-4 text-[11px] font-medium tracking-[0.4em] text-white/45">
          <span className="h-px w-10 bg-white/20" />
          BACKSTAGE
          <span className="h-px w-10 bg-white/20" />
        </div>

        <h1 className="font-display text-4xl font-black tracking-tight sm:text-5xl">
          <span className="metal-text">EARLY BIRDS</span>
        </h1>

        {!birds ? (
          <form onSubmit={load} className="mt-10 flex max-w-sm flex-col gap-4">
            <label
              htmlFor="admin-password"
              className="text-xs font-medium tracking-[0.25em] text-white/40"
            >
              ADMIN PASSWORD
            </label>
            <input
              id="admin-password"
              type="password"
              required
              autoComplete="off"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="border border-white/15 bg-white/[0.02] px-4 py-3 text-sm text-white outline-none focus:border-white/40"
            />
            {error && <p className="text-sm text-red-400/80">{error}</p>}
            <button
              type="submit"
              disabled={loading}
              className="metal-button px-10 py-3 text-sm font-semibold tracking-[0.2em] text-black disabled:opacity-50"
            >
              {loading ? "CHECKING..." : "ENTER"}
            </button>
          </form>
        ) : (
          <div className="mt-8">
            <div className="mb-4 flex items-center justify-between text-xs tracking-[0.2em] text-white/45">
              <span>
                FIRST {birds.length} OF {total} REGISTERED
              </span>
              <span className="flex gap-6">
                <button
                  onClick={() => load()}
                  disabled={loading}
                  className="hover:text-white/80 disabled:opacity-50"
                >
                  {loading ? "REFRESHING..." : "REFRESH"}
                </button>
                <button onClick={signOut} className="hover:text-white/80">
                  SIGN OUT
                </button>
              </span>
            </div>

            {birds.length === 0 ? (
              <p className="border border-white/15 px-6 py-8 text-sm text-white/50">
                No one has registered yet.
              </p>
            ) : (
              <div className="overflow-x-auto border border-white/15">
                <table className="w-full min-w-[640px] text-left text-sm">
                  <thead className="border-b border-white/15 text-[11px] tracking-[0.2em] text-white/40">
                    <tr>
                      <th className="px-4 py-3 font-medium">#</th>
                      <th className="px-4 py-3 font-medium">NAME</th>
                      <th className="px-4 py-3 font-medium">EMAIL</th>
                      <th className="px-4 py-3 font-medium">DEPARTMENT</th>
                      <th className="px-4 py-3 font-medium">ERA</th>
                      <th className="px-4 py-3 font-medium">REGISTERED (PHT)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {birds.map((b, i) => {
                      const color = (b.team && ERAS[b.team]?.color) || "#ffffff";
                      return (
                        <tr
                          key={b.email}
                          className="border-b border-white/[0.06] last:border-0"
                        >
                          <td className="px-4 py-3 font-semibold text-white/60">
                            {i + 1}
                          </td>
                          <td className="px-4 py-3 text-white/85">
                            {b.name}
                            {b.nickname && (
                              <span className="ml-2 text-white/40">
                                “{b.nickname}”
                              </span>
                            )}
                          </td>
                          <td className="px-4 py-3 text-white/60">{b.email}</td>
                          <td className="px-4 py-3 text-white/60">
                            {b.department}
                          </td>
                          <td
                            className="px-4 py-3 font-semibold"
                            style={{ color }}
                          >
                            {b.team ?? "-"}
                          </td>
                          <td className="px-4 py-3 text-white/50">
                            {formatTime(b.created_at)}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </section>
    </main>
  );
}