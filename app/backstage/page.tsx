"use client";

import { useState, type FormEvent } from "react";

type EarlyBird = {
  name: string;
  nickname: string | null;
  email: string;
  department: string | null;
  team: string | number | null;
  created_at: string;
};

function formatDate(iso: string) {
  return new Date(iso).toLocaleString("en-PH", {
    timeZone: "Asia/Manila",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
  });
}

export default function BackstagePage() {
  const [password, setPassword] = useState("");
  const [earlyBirds, setEarlyBirds] = useState<EarlyBird[] | null>(null);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function load(pw: string) {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/admin/early-birds", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password: pw }),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Something went wrong.");
        setEarlyBirds(null);
        return;
      }

      setEarlyBirds(data.earlyBirds);
      setTotal(data.total);
    } catch {
      setError("Could not reach the server.");
    } finally {
      setLoading(false);
    }
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!password) return;
    load(password);
  }

  function lock() {
    setEarlyBirds(null);
    setPassword("");
    setTotal(0);
    setError("");
  }

  const unlocked = earlyBirds !== null;

  return (
    <main className="min-h-screen bg-[#050505] text-zinc-200 px-4 py-10 sm:px-8">
      <div className="mx-auto w-full max-w-5xl">
        {!unlocked ? (
          <div className="mx-auto mt-[12vh] w-full max-w-sm">
            <p className="text-center font-mono text-[11px] uppercase tracking-[0.4em] text-zinc-500">
              Restricted
            </p>
            <h1 className="mt-3 text-center text-3xl font-semibold tracking-[0.2em] text-zinc-100">
              BACKSTAGE
            </h1>

            <form
              onSubmit={handleSubmit}
              className="mt-8 rounded-2xl border border-zinc-800 bg-zinc-950/80 p-6 backdrop-blur"
            >
              <label
                htmlFor="admin-password"
                className="block font-mono text-xs uppercase tracking-widest text-zinc-500"
              >
                Access code
              </label>
              <input
                id="admin-password"
                type="password"
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="mt-2 w-full rounded-lg border border-zinc-800 bg-black px-3 py-2.5 text-zinc-100 outline-none transition focus:border-zinc-400"
                placeholder="••••••••"
                autoFocus
              />

              {error && (
                <p className="mt-3 text-sm text-red-400" role="alert">
                  {error}
                </p>
              )}

              <button
                type="submit"
                disabled={loading || !password}
                className="mt-5 w-full rounded-lg bg-gradient-to-b from-zinc-100 to-zinc-400 px-4 py-2.5 font-semibold text-black transition hover:from-white hover:to-zinc-300 disabled:cursor-not-allowed disabled:opacity-40"
              >
                {loading ? "Verifying…" : "Enter"}
              </button>
            </form>
          </div>
        ) : (
          <>
            <header className="flex flex-wrap items-end justify-between gap-4">
              <div>
                <p className="font-mono text-[11px] uppercase tracking-[0.4em] text-zinc-500">
                  ChronoShift · Admin
                </p>
                <h1 className="mt-2 text-2xl font-semibold tracking-[0.15em] text-zinc-100 sm:text-3xl">
                  EARLY BIRDS
                </h1>
              </div>

              <div className="flex items-center gap-3">
                <div className="rounded-lg border border-zinc-800 bg-zinc-950 px-4 py-2 text-right">
                  <p className="font-mono text-[10px] uppercase tracking-widest text-zinc-500">
                    Total registered
                  </p>
                  <p className="text-xl font-semibold text-zinc-100">{total}</p>
                </div>
                <button
                  onClick={() => load(password)}
                  disabled={loading}
                  className="rounded-lg border border-zinc-700 px-4 py-2 text-sm text-zinc-300 transition hover:border-zinc-400 hover:text-white disabled:opacity-40"
                >
                  {loading ? "Refreshing…" : "Refresh"}
                </button>
                <button
                  onClick={lock}
                  className="rounded-lg border border-zinc-800 px-4 py-2 text-sm text-zinc-500 transition hover:border-zinc-600 hover:text-zinc-300"
                >
                  Lock
                </button>
              </div>
            </header>

            {error && (
              <p className="mt-4 text-sm text-red-400" role="alert">
                {error}
              </p>
            )}

            {earlyBirds.length === 0 ? (
              <p className="mt-16 text-center text-zinc-500">
                No registrations yet.
              </p>
            ) : (
              <>
                {/* Desktop table */}
                <div className="mt-8 hidden overflow-hidden rounded-2xl border border-zinc-800 md:block">
                  <table className="w-full text-left text-sm">
                    <thead className="bg-zinc-950 font-mono text-[11px] uppercase tracking-widest text-zinc-500">
                      <tr>
                        <th className="px-4 py-3">#</th>
                        <th className="px-4 py-3">Name</th>
                        <th className="px-4 py-3">Nickname</th>
                        <th className="px-4 py-3">Email</th>
                        <th className="px-4 py-3">Department</th>
                        <th className="px-4 py-3">Team</th>
                        <th className="px-4 py-3">Registered</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-900">
                      {earlyBirds.map((b, i) => (
                        <tr
                          key={b.email}
                          className="bg-black/40 transition hover:bg-zinc-900/60"
                        >
                          <td className="px-4 py-3 font-mono text-zinc-400">
                            {String(i + 1).padStart(2, "0")}
                          </td>
                          <td className="px-4 py-3 font-medium text-zinc-100">
                            {b.name}
                          </td>
                          <td className="px-4 py-3 text-zinc-400">
                            {b.nickname || "—"}
                          </td>
                          <td className="px-4 py-3 font-mono text-xs text-zinc-400">
                            {b.email}
                          </td>
                          <td className="px-4 py-3 text-zinc-400">
                            {b.department || "—"}
                          </td>
                          <td className="px-4 py-3 text-zinc-300">
                            {b.team ?? "—"}
                          </td>
                          <td className="px-4 py-3 font-mono text-xs text-zinc-500">
                            {formatDate(b.created_at)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Mobile cards */}
                <ul className="mt-8 space-y-3 md:hidden">
                  {earlyBirds.map((b, i) => (
                    <li
                      key={b.email}
                      className="rounded-xl border border-zinc-800 bg-zinc-950/80 p-4"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="font-medium text-zinc-100">{b.name}</p>
                          {b.nickname && (
                            <p className="text-sm text-zinc-500">
                              “{b.nickname}”
                            </p>
                          )}
                        </div>
                        <span className="font-mono text-lg text-zinc-500">
                          {String(i + 1).padStart(2, "0")}
                        </span>
                      </div>
                      <p className="mt-2 break-all font-mono text-xs text-zinc-400">
                        {b.email}
                      </p>
                      <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-xs text-zinc-500">
                        <span>{b.department || "—"}</span>
                        <span>Team: {b.team ?? "—"}</span>
                        <span>{formatDate(b.created_at)}</span>
                      </div>
                    </li>
                  ))}
                </ul>
              </>
            )}
          </>
        )}
      </div>
    </main>
  );
}