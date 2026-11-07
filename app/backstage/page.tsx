"use client";

import { useMemo, useRef, useState, type FormEvent } from "react";

type Registrant = {
  name: string;
  nickname: string | null;
  email: string;
  department: string | null;
  team: string | number | null;
  created_at: string;
};

type Tab = "early" | "all";

const EARLY_BIRD_COUNT = 10;
const PAGE_SIZES = [10, 25, 50, 100];

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

// rows carry their overall registration rank so the "All" tab
// keeps correct numbering across pages and while searching
type RankedRow = Registrant & { rank: number };

function getPageItems(current: number, total: number): (number | "…")[] {
  if (total <= 7) {
    return Array.from({ length: total }, (_, i) => i + 1);
  }

  const items: (number | "…")[] = [1];
  const start = Math.max(2, current - 1);
  const end = Math.min(total - 1, current + 1);

  if (start > 2) items.push("…");
  for (let p = start; p <= end; p++) items.push(p);
  if (end < total - 1) items.push("…");
  items.push(total);

  return items;
}

function Pagination({
  page,
  totalPages,
  pageSize,
  totalRows,
  onPage,
  onPageSize,
}: {
  page: number;
  totalPages: number;
  pageSize: number;
  totalRows: number;
  onPage: (p: number) => void;
  onPageSize: (n: number) => void;
}) {
  const from = totalRows === 0 ? 0 : (page - 1) * pageSize + 1;
  const to = Math.min(page * pageSize, totalRows);

  const navBtn =
    "rounded-md border border-zinc-800 px-3 py-1.5 text-sm text-zinc-300 transition hover:border-zinc-500 hover:text-white disabled:cursor-not-allowed disabled:opacity-30 disabled:hover:border-zinc-800 disabled:hover:text-zinc-300";

  return (
    <div className="mt-6 flex flex-col items-center justify-between gap-4 sm:flex-row">
      <div className="flex items-center gap-3 font-mono text-xs text-zinc-500">
        <span>
          {from}–{to} of {totalRows}
        </span>
        <label className="flex items-center gap-2">
          <span className="hidden sm:inline">Rows</span>
          <select
            value={pageSize}
            onChange={(e) => onPageSize(Number(e.target.value))}
            className="rounded-md border border-zinc-800 bg-black px-2 py-1 text-zinc-300 outline-none focus:border-zinc-400"
          >
            {PAGE_SIZES.map((n) => (
              <option key={n} value={n}>
                {n}
              </option>
            ))}
          </select>
        </label>
      </div>

      <nav className="flex flex-wrap items-center justify-center gap-1.5" aria-label="Pagination">
        <button
          onClick={() => onPage(page - 1)}
          disabled={page <= 1}
          className={navBtn}
        >
          Prev
        </button>

        {getPageItems(page, totalPages).map((item, idx) =>
          item === "…" ? (
            <span
              key={`ellipsis-${idx}`}
              className="px-1.5 text-zinc-600"
              aria-hidden="true"
            >
              …
            </span>
          ) : (
            <button
              key={item}
              onClick={() => onPage(item)}
              aria-current={item === page ? "page" : undefined}
              className={`min-w-[2.25rem] rounded-md border px-2.5 py-1.5 text-sm transition ${
                item === page
                  ? "border-zinc-200 bg-zinc-200 font-semibold text-black"
                  : "border-zinc-800 text-zinc-400 hover:border-zinc-500 hover:text-white"
              }`}
            >
              {item}
            </button>
          )
        )}

        <button
          onClick={() => onPage(page + 1)}
          disabled={page >= totalPages}
          className={navBtn}
        >
          Next
        </button>
      </nav>
    </div>
  );
}

function RegistrantList({ rows }: { rows: RankedRow[] }) {
  if (rows.length === 0) {
    return <p className="mt-16 text-center text-zinc-500">Nothing to show.</p>;
  }

  return (
    <>
      {/* Desktop table */}
      <div className="mt-6 hidden overflow-hidden rounded-2xl border border-zinc-800 md:block">
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
            {rows.map((b) => (
              <tr
                key={b.email}
                className="bg-black/40 transition hover:bg-zinc-900/60"
              >
                <td className="px-4 py-3 font-mono text-zinc-400">
                  {String(b.rank).padStart(2, "0")}
                </td>
                <td className="px-4 py-3 font-medium text-zinc-100">
                  {b.name}
                  {b.rank <= EARLY_BIRD_COUNT && (
                    <span className="ml-2 rounded border border-zinc-600 px-1.5 py-0.5 font-mono text-[9px] uppercase tracking-widest text-zinc-300">
                      Early
                    </span>
                  )}
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
                <td className="px-4 py-3 text-zinc-300">{b.team ?? "—"}</td>
                <td className="px-4 py-3 font-mono text-xs text-zinc-500">
                  {formatDate(b.created_at)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile cards */}
      <ul className="mt-6 space-y-3 md:hidden">
        {rows.map((b) => (
          <li
            key={b.email}
            className="rounded-xl border border-zinc-800 bg-zinc-950/80 p-4"
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="font-medium text-zinc-100">
                  {b.name}
                  {b.rank <= EARLY_BIRD_COUNT && (
                    <span className="ml-2 rounded border border-zinc-600 px-1.5 py-0.5 font-mono text-[9px] uppercase tracking-widest text-zinc-300">
                      Early
                    </span>
                  )}
                </p>
                {b.nickname && (
                  <p className="text-sm text-zinc-500">“{b.nickname}”</p>
                )}
              </div>
              <span className="font-mono text-lg text-zinc-500">
                {String(b.rank).padStart(2, "0")}
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
  );
}

export default function BackstagePage() {
  const mainRef = useRef<HTMLElement>(null);

  const [password, setPassword] = useState("");
  const [registrations, setRegistrations] = useState<Registrant[] | null>(
    null
  );
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [tab, setTab] = useState<Tab>("early");
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

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
        setRegistrations(null);
        return;
      }

      setRegistrations(data.registrations);
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
    setRegistrations(null);
    setPassword("");
    setTotal(0);
    setError("");
    setQuery("");
    setTab("early");
    setPage(1);
  }

  function changeTab(next: Tab) {
    setTab(next);
    setPage(1);
  }

  function changeQuery(value: string) {
    setQuery(value);
    setPage(1);
  }

  function changePageSize(size: number) {
    setPageSize(size);
    setPage(1);
  }

  function goToPage(p: number) {
    setPage(p);
    mainRef.current?.scrollTo({ top: 0, behavior: "smooth" });
  }

  const ranked: RankedRow[] = useMemo(
    () => (registrations ?? []).map((r, i) => ({ ...r, rank: i + 1 })),
    [registrations]
  );

  const filteredRows = useMemo(() => {
    if (tab === "early") return ranked.slice(0, EARLY_BIRD_COUNT);

    const q = query.trim().toLowerCase();
    if (!q) return ranked;

    return ranked.filter((r) =>
      [r.name, r.nickname, r.email, r.department, r.team]
        .filter((v) => v !== null && v !== undefined)
        .some((v) => String(v).toLowerCase().includes(q))
    );
  }, [ranked, tab, query]);

  const totalPages = Math.max(1, Math.ceil(filteredRows.length / pageSize));
  const currentPage = Math.min(page, totalPages);

  const visibleRows = useMemo(() => {
    if (tab === "early") return filteredRows;
    const start = (currentPage - 1) * pageSize;
    return filteredRows.slice(start, start + pageSize);
  }, [filteredRows, tab, currentPage, pageSize]);

  const unlocked = registrations !== null;

  return (
    <main
      ref={mainRef}
      className="relative z-10 h-dvh overflow-y-auto overscroll-contain bg-[#050505] px-4 py-10 text-zinc-200 sm:px-8"
    >
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
                  REGISTRATIONS
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

            {/* Tabs */}
            <div className="mt-8 flex flex-wrap items-center justify-between gap-3">
              <div className="inline-flex rounded-lg border border-zinc-800 bg-zinc-950 p-1">
                <button
                  onClick={() => changeTab("early")}
                  className={`rounded-md px-4 py-1.5 text-sm transition ${
                    tab === "early"
                      ? "bg-zinc-200 font-semibold text-black"
                      : "text-zinc-400 hover:text-zinc-200"
                  }`}
                >
                  Early Birds
                </button>
                <button
                  onClick={() => changeTab("all")}
                  className={`rounded-md px-4 py-1.5 text-sm transition ${
                    tab === "all"
                      ? "bg-zinc-200 font-semibold text-black"
                      : "text-zinc-400 hover:text-zinc-200"
                  }`}
                >
                  All Registrations ({total})
                </button>
              </div>

              {tab === "all" && (
                <input
                  type="search"
                  value={query}
                  onChange={(e) => changeQuery(e.target.value)}
                  placeholder="Search name, email, team…"
                  className="w-full rounded-lg border border-zinc-800 bg-black px-3 py-2 text-sm text-zinc-100 outline-none transition focus:border-zinc-400 sm:w-72"
                />
              )}
            </div>

            {tab === "all" && query && (
              <p className="mt-3 font-mono text-xs text-zinc-500">
                {filteredRows.length} of {total} match
              </p>
            )}

            <RegistrantList rows={visibleRows} />

            {tab === "all" && filteredRows.length > 0 && (
              <Pagination
                page={currentPage}
                totalPages={totalPages}
                pageSize={pageSize}
                totalRows={filteredRows.length}
                onPage={goToPage}
                onPageSize={changePageSize}
              />
            )}

            <div className="h-10" />
          </>
        )}
      </div>
    </main>
  );
}