"use client";

import { useMemo, useState, type KeyboardEvent } from "react";
import { TEAMS } from "@/lib/teams";

export default function TeamsPage() {
  const [activeYear, setActiveYear] = useState(TEAMS[0].year);
  const [query, setQuery] = useState("");
  const q = query.trim().toLowerCase();

  const activeTeam = TEAMS.find((t) => t.year === activeYear) ?? TEAMS[0];

  const totalPeople = useMemo(
    () => TEAMS.reduce((sum, t) => sum + t.members.length, 0),
    []
  );

  // search across every era; keep each person's number within their team
  const results = useMemo(() => {
    if (!q) return [];
    return TEAMS.flatMap((t) =>
      t.members
        .map((name, i) => ({ name, n: i + 1, year: t.year, title: t.title }))
        .filter((m) => m.name.toLowerCase().includes(q))
    );
  }, [q]);

  function selectTab(year: string) {
    setActiveYear(year);
    setQuery("");
  }

  function handleTabKeyDown(e: KeyboardEvent<HTMLButtonElement>, index: number) {
    let next = index;
    if (e.key === "ArrowRight") next = (index + 1) % TEAMS.length;
    else if (e.key === "ArrowLeft") next = (index - 1 + TEAMS.length) % TEAMS.length;
    else if (e.key === "Home") next = 0;
    else if (e.key === "End") next = TEAMS.length - 1;
    else return;

    e.preventDefault();
    selectTab(TEAMS[next].year);
    document.getElementById(`tab-${TEAMS[next].year}`)?.focus();
  }

  const searching = q.length > 0;

  return (
    <main className="relative z-10 h-dvh overflow-y-auto overscroll-contain bg-[#050505]/100 px-4 pb-16 pt-24 text-zinc-200 sm:px-8 sm:pt-28">
      <div className="mx-auto w-full max-w-5xl">
        <header className="text-center">
          <p className="font-mono text-[11px] uppercase tracking-[0.4em] text-zinc-500">
            ChronoShift · Teams
          </p>
          <h1 className="mt-3 bg-gradient-to-b from-white via-zinc-300 to-zinc-500 bg-clip-text text-3xl font-semibold tracking-[0.2em] text-transparent sm:text-5xl">
            FIND YOUR ERA
          </h1>
          <p className="mx-auto mt-4 max-w-xl text-sm text-zinc-400 sm:text-base">
            {TEAMS.length} eras. {totalPeople} travelers. Pick an era, or search
            your name to see where you’re shifting.
          </p>

          <div className="mx-auto mt-6 w-full max-w-md">
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search your name…"
              aria-label="Search for a name"
              className="w-full rounded-xl border border-zinc-800 bg-black/70 px-4 py-3 text-center text-zinc-100 outline-none backdrop-blur transition placeholder:text-zinc-600 focus:border-zinc-400"
            />
            {searching && (
              <p className="mt-2 font-mono text-xs text-zinc-500">
                {results.length} {results.length === 1 ? "match" : "matches"}
              </p>
            )}
          </div>
        </header>

        {/* Tabs */}
        <div
          role="tablist"
          aria-label="Eras"
          className={`mx-auto mt-8 flex w-max max-w-full gap-2 overflow-x-auto rounded-xl border border-zinc-800 bg-zinc-950/80 p-1.5 backdrop-blur transition ${
            searching ? "opacity-40" : ""
          }`}
        >
          {TEAMS.map((team, i) => {
            const selected = !searching && team.year === activeYear;
            return (
              <button
                key={team.year}
                id={`tab-${team.year}`}
                role="tab"
                type="button"
                aria-selected={selected}
                aria-controls="teams-panel"
                tabIndex={team.year === activeYear ? 0 : -1}
                onClick={() => selectTab(team.year)}
                onKeyDown={(e) => handleTabKeyDown(e, i)}
                className={`shrink-0 rounded-lg px-4 py-2 font-mono text-sm tracking-widest transition sm:px-6 ${
                  selected
                    ? "bg-gradient-to-b from-zinc-100 to-zinc-400 font-semibold text-black"
                    : "text-zinc-400 hover:text-zinc-100"
                }`}
              >
                {team.year}
              </button>
            );
          })}
        </div>

        {/* Panel */}
        <section
          id="teams-panel"
          role="tabpanel"
          aria-labelledby={`tab-${activeTeam.year}`}
          className="mt-8"
        >
          {searching ? (
            results.length === 0 ? (
              <p className="mt-12 text-center text-zinc-500">
                No one found with that name. Try a different spelling.
              </p>
            ) : (
              <ul className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                {results.map((m) => (
                  <li key={`${m.year}-${m.name}`}>
                    <button
                      type="button"
                      onClick={() => selectTab(m.year)}
                      className="flex w-full items-center justify-between gap-3 rounded-lg border border-zinc-800 bg-zinc-950/80 px-4 py-3 text-left transition hover:border-zinc-500"
                    >
                      <span className="text-sm text-zinc-100">{m.name}</span>
                      <span className="shrink-0 rounded-full border border-zinc-700 px-2.5 py-0.5 font-mono text-[11px] tracking-widest text-zinc-300">
                        {m.year}
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
            )
          ) : (
            <div className="rounded-2xl border border-zinc-800 bg-zinc-950/80 p-5 backdrop-blur sm:p-8">
              <div className="flex flex-wrap items-end justify-between gap-3 border-b border-zinc-900 pb-5">
                <div>
                  <h2 className="bg-gradient-to-b from-white via-zinc-300 to-zinc-500 bg-clip-text text-5xl font-semibold tracking-widest text-transparent sm:text-6xl">
                    {activeTeam.year}
                  </h2>
                  <p className="mt-2 font-mono text-xs uppercase tracking-[0.3em] text-zinc-500">
                    {activeTeam.title}
                  </p>
                </div>
                <span className="rounded-full border border-zinc-800 px-3 py-1 font-mono text-xs text-zinc-400">
                  {activeTeam.members.length} members
                </span>
              </div>

              <ol className="mt-5 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                {activeTeam.members.map((name, i) => (
                  <li
                    key={name}
                    className="flex items-baseline gap-3 rounded-lg border border-zinc-900 bg-black/40 px-4 py-3"
                  >
                    <span className="w-6 shrink-0 text-right font-mono text-xs text-zinc-600">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <span className="text-sm text-zinc-100">{name}</span>
                  </li>
                ))}
              </ol>
            </div>
          )}
        </section>
      </div>
    </main>
  );
}