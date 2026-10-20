"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { ERAS } from "@/lib/eras";
import { REACTIONS } from "@/lib/reactions";

type Thought = {
  id: string;
  message: string;
  team: string | null;
  author: string;
  imageUrl: string | null;
  createdAt: string;
  reactions: Record<string, number>;
  myReaction: string | null;
  commentCount: number;
};

type Comment = {
  id: string;
  message: string;
  author: string;
  team: string | null;
  createdAt: string;
};

const MAX_LEN = 280;
const MAX_COMMENT = 300;
const REFRESH_MS = 30_000;
const MAX_DIM = 1600;
const MAX_PICK_BYTES = 12 * 1024 * 1024;
const EMAIL_RE = /^[a-zA-Z0-9._%+-]+@intercommerce\.com\.ph$/i;
const EMAIL_KEY = "wall-email";

// Floating layout: every card drifts at the same speed and gets its own
// vertical slot, so cards never catch up to each other.
const SLOT_PX = 250; // vertical space reserved per card (taller than the tallest card)
const SPEED_PX_S = 28; // drift speed in px per second, same for every card

function timeAgo(iso: string) {
  const seconds = Math.max(
    0,
    Math.floor((Date.now() - new Date(iso).getTime()) / 1000)
  );
  if (seconds < 60) return "just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

function eraColor(team: string | null) {
  return (team ? ERAS[team]?.color : null) ?? "#ffffff";
}

function hashId(id: string) {
  let h = 0;
  for (let i = 0; i < id.length; i++) {
    h = (h * 31 + id.charCodeAt(i)) | 0;
  }
  return Math.abs(h);
}

// Shrinks big photos so uploads stay fast (GIFs are left untouched)
async function prepareImage(file: File): Promise<File> {
  if (file.type === "image/gif") return file;
  try {
    const bmp = await createImageBitmap(file);
    const scale = Math.min(1, MAX_DIM / Math.max(bmp.width, bmp.height));
    const w = Math.round(bmp.width * scale);
    const h = Math.round(bmp.height * scale);
    const canvas = document.createElement("canvas");
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext("2d");
    if (!ctx) return file;
    ctx.fillStyle = "#000";
    ctx.fillRect(0, 0, w, h);
    ctx.drawImage(bmp, 0, 0, w, h);
    bmp.close?.();
    const blob = await new Promise<Blob | null>((resolve) =>
      canvas.toBlob(resolve, "image/jpeg", 0.85)
    );
    if (!blob) return file;
    return new File([blob], "photo.jpg", { type: "image/jpeg" });
  } catch {
    return file;
  }
}

function applyReaction(t: Thought, emoji: string): Thought {
  const reactions = { ...t.reactions };
  if (t.myReaction) {
    reactions[t.myReaction] = Math.max(0, (reactions[t.myReaction] ?? 0) - 1);
  }
  const next = t.myReaction === emoji ? null : emoji;
  if (next) reactions[next] = (reactions[next] ?? 0) + 1;
  return { ...t, reactions, myReaction: next };
}

function Avatar({ name, team }: { name: string; team: string | null }) {
  const color = eraColor(team);
  return (
    <div
      className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border text-sm font-semibold"
      style={{
        borderColor: `${color}88`,
        background: `${color}1a`,
        color,
      }}
    >
      {name.trim().charAt(0).toUpperCase() || "?"}
    </div>
  );
}

function CommentSection({
  thoughtId,
  email,
  onNotice,
  onCountChange,
}: {
  thoughtId: string;
  email: string;
  onNotice: (msg: string) => void;
  onCountChange: (count: number) => void;
}) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch(`/api/thoughts/${thoughtId}/comments`, {
          cache: "no-store",
        });
        const data = await res.json();
        if (!cancelled && res.ok) {
          setComments(data.comments ?? []);
          onCountChange((data.comments ?? []).length);
        }
      } catch {
        /* ignore */
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [thoughtId]);

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!EMAIL_RE.test(email)) {
      onNotice("Enter your company email in the box to comment.");
      return;
    }
    if (!text.trim()) return;

    setSending(true);
    try {
      const res = await fetch(`/api/thoughts/${thoughtId}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, message: text }),
      });
      const data = await res.json();
      if (!res.ok) {
        onNotice(data.error ?? "Could not post your comment.");
        return;
      }
      const next = [...comments, data.comment as Comment];
      setComments(next);
      onCountChange(next.length);
      setText("");
    } catch {
      onNotice("Network error. Please try again.");
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="border-t border-white/[0.08] px-5 pb-5 pt-4">
      {loading ? (
        <p className="text-xs tracking-wide text-white/35">Loading comments...</p>
      ) : comments.length === 0 ? (
        <p className="text-xs tracking-wide text-white/35">
          No comments yet. Say something.
        </p>
      ) : (
        <ul className="flex flex-col gap-3">
          {comments.map((c) => (
            <li key={c.id} className="flex gap-3">
              <Avatar name={c.author} team={c.team} />
              <div className="min-w-0 flex-1 border border-white/10 bg-white/[0.03] px-3 py-2">
                <div className="flex items-center justify-between gap-2 text-[10px] tracking-[0.15em]">
                  <span className="truncate text-white/60">
                    {c.author.toUpperCase()}
                  </span>
                  <span className="shrink-0 text-white/30">
                    {timeAgo(c.createdAt)}
                  </span>
                </div>
                <p className="mt-1 whitespace-pre-wrap break-words text-[13px] leading-relaxed text-white/75">
                  {c.message}
                </p>
              </div>
            </li>
          ))}
        </ul>
      )}

      <form onSubmit={submit} className="mt-4 flex gap-2">
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          maxLength={MAX_COMMENT}
          placeholder="Write a comment..."
          className="min-w-0 flex-1 border border-white/15 bg-white/[0.02] px-3 py-2 text-sm text-white outline-none placeholder:text-white/25 focus:border-white/40"
        />
        <button
          type="submit"
          disabled={sending || !text.trim()}
          className="border border-white/20 px-4 py-2 text-[11px] font-semibold tracking-[0.2em] text-white/70 transition-colors hover:border-white/50 hover:text-white disabled:opacity-40"
        >
          {sending ? "..." : "SEND"}
        </button>
      </form>
    </div>
  );
}

// Full post (shown inside the popup when a floating card is opened)
function PostCard({
  thought,
  email,
  onReact,
  onNotice,
  onCommentCount,
}: {
  thought: Thought;
  email: string;
  onReact: (id: string, emoji: string) => void;
  onNotice: (msg: string) => void;
  onCommentCount: (id: string, count: number) => void;
}) {
  const [showComments, setShowComments] = useState(false);
  const color = eraColor(thought.team);
  const totalReactions = Object.values(thought.reactions).reduce(
    (a, b) => a + b,
    0
  );

  return (
    <article
      className="border bg-black"
      style={{ borderColor: `${color}55`, boxShadow: `0 0 40px ${color}22` }}
    >
      <div className="flex items-center gap-3 px-5 pt-5">
        <Avatar name={thought.author} team={thought.team} />
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold tracking-wide text-white/85">
            {thought.author}
          </p>
          <p className="flex items-center gap-2 text-[10px] tracking-[0.15em] text-white/35">
            {thought.team && (
              <span style={{ color }} className="font-semibold">
                {thought.team}
              </span>
            )}
            <span>{timeAgo(thought.createdAt)}</span>
          </p>
        </div>
      </div>

      <p className="whitespace-pre-wrap break-words px-5 pt-4 text-sm leading-relaxed tracking-wide text-white/80">
        {thought.message}
      </p>

      {thought.imageUrl && (
        <div className="mt-4 border-y border-white/[0.08] bg-black">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={thought.imageUrl}
            alt="Attached to this thought"
            loading="lazy"
            className="mx-auto max-h-[420px] w-full object-contain"
          />
        </div>
      )}

      <div className="flex items-center justify-between px-5 pt-4 text-[11px] tracking-[0.12em] text-white/40">
        <span>
          {totalReactions > 0
            ? `${totalReactions} ${totalReactions === 1 ? "REACTION" : "REACTIONS"}`
            : ""}
        </span>
        <button
          type="button"
          onClick={() => setShowComments((v) => !v)}
          className="hover:text-white/70"
        >
          {thought.commentCount}{" "}
          {thought.commentCount === 1 ? "COMMENT" : "COMMENTS"}
        </button>
      </div>

      <div className="flex flex-wrap items-center gap-2 px-5 pb-4 pt-3">
        {REACTIONS.map((emoji) => {
          const count = thought.reactions[emoji] ?? 0;
          const mine = thought.myReaction === emoji;
          return (
            <button
              key={emoji}
              type="button"
              onClick={() => onReact(thought.id, emoji)}
              aria-pressed={mine}
              className={`flex items-center gap-1.5 border px-3 py-1.5 text-sm transition-colors ${
                mine
                  ? "border-white/60 bg-white/15 text-white"
                  : "border-white/15 text-white/60 hover:border-white/40"
              }`}
            >
              <span>{emoji}</span>
              {count > 0 && <span className="text-xs">{count}</span>}
            </button>
          );
        })}
        <button
          type="button"
          onClick={() => setShowComments((v) => !v)}
          className="ml-auto border border-white/15 px-3 py-1.5 text-[11px] font-semibold tracking-[0.2em] text-white/60 transition-colors hover:border-white/40 hover:text-white"
        >
          {showComments ? "HIDE" : "COMMENT"}
        </button>
      </div>

      {showComments && (
        <CommentSection
          thoughtId={thought.id}
          email={email}
          onNotice={onNotice}
          onCountChange={(count) => onCommentCount(thought.id, count)}
        />
      )}
    </article>
  );
}

// A card that rises through the panel. All cards share one speed and are
// evenly spaced along the loop, so they never catch up to each other.
function FloatingCard({
  thought,
  onOpen,
  lane,
  slot,
  perLane,
  duration,
}: {
  thought: Thought;
  onOpen: (id: string) => void;
  lane: number; // 0 = left, 1 = right
  slot: number; // position within its lane
  perLane: number; // cards per lane
  duration: number; // seconds for one full loop (same for all cards)
}) {
  const h = hashId(thought.id);
  const r = (shift: number) => ((h >> shift) & 255) / 255;

  // Evenly spaced start; right lane is offset by half a slot to stagger
  const riseDelay = -((slot + lane * 0.5) / perLane) * duration;

  // Small sideways drift that stays inside the lane
  const left = lane * 50 + 2 + r(3) * 3;
  const swayDuration = 8 + r(16) * 8;
  const swayDelay = -r(2) * swayDuration;
  const dx = (r(20) - 0.5) * 20;

  const color = eraColor(thought.team);
  const totalReactions = Object.values(thought.reactions).reduce(
    (a, b) => a + b,
    0
  );

  return (
    <div
      className="float-lane pointer-events-none absolute inset-x-0 top-full"
      style={{
        animation: `rise ${duration}s linear ${riseDelay}s infinite`,
      }}
    >
      <div
        className="absolute top-0"
        style={{ left: `${left}%`, width: "clamp(140px, 40%, 240px)" }}
      >
        <button
          type="button"
          onClick={() => onOpen(thought.id)}
          className="float-card pointer-events-auto block w-full border bg-black/75 p-3 text-left backdrop-blur-sm transition-colors hover:bg-black/90"
          style={
            {
              borderColor: `${color}55`,
              boxShadow: `0 0 24px ${color}18`,
              "--dx": `${dx}px`,
              animation: `sway ${swayDuration}s ease-in-out ${swayDelay}s infinite alternate`,
            } as React.CSSProperties
          }
        >
          <div className="flex items-center gap-2">
            <div
              className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border text-[10px] font-semibold"
              style={{
                borderColor: `${color}88`,
                background: `${color}1a`,
                color,
              }}
            >
              {thought.author.trim().charAt(0).toUpperCase() || "?"}
            </div>
            <span className="truncate text-[11px] font-semibold tracking-wide text-white/75">
              {thought.author}
            </span>
            {thought.team && (
              <span
                className="ml-auto shrink-0 text-[9px] font-semibold tracking-[0.1em]"
                style={{ color }}
              >
                {thought.team}
              </span>
            )}
          </div>

          <p className="mt-2 line-clamp-4 break-words text-[12px] leading-relaxed text-white/70">
            {thought.message}
          </p>

          {thought.imageUrl && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={thought.imageUrl}
              alt=""
              loading="lazy"
              className="mt-2 h-20 w-full border border-white/10 object-cover"
            />
          )}

          <div className="mt-2 flex items-center justify-between text-[10px] tracking-[0.12em] text-white/35">
            <span>
              {totalReactions > 0
                ? `${totalReactions} ♥`
                : timeAgo(thought.createdAt)}
            </span>
            <span>
              {thought.commentCount > 0 ? `${thought.commentCount} 💬` : ""}
            </span>
          </div>
        </button>
      </div>
    </div>
  );
}

export default function WallPage() {
  const [thoughts, setThoughts] = useState<Thought[]>([]);
  const [wallLoading, setWallLoading] = useState(true);
  const [wallError, setWallError] = useState<string | null>(null);

  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [image, setImage] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [posting, setPosting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  const [activeId, setActiveId] = useState<string | null>(null);

  const emailRef = useRef("");
  const fileRef = useRef<HTMLInputElement>(null);
  const noticeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Measure the floating panel so the loop is always tall enough
  const panelRef = useRef<HTMLElement>(null);
  const [panelH, setPanelH] = useState(700);

  useEffect(() => {
    const el = panelRef.current;
    if (!el) return;
    const ro = new ResizeObserver(() => setPanelH(el.clientHeight));
    ro.observe(el);
    setPanelH(el.clientHeight);
    return () => ro.disconnect();
  }, []);

  const perLane = Math.max(1, Math.ceil(thoughts.length / 2));
  // Loop is at least as long as the panel (+ room to exit), and long enough
  // that every card in a lane gets its own SLOT_PX of space
  const loopPx = Math.max(panelH + 300, perLane * SLOT_PX);
  const loopDuration = loopPx / SPEED_PX_S;

  const showNotice = useCallback((msg: string) => {
    setNotice(msg);
    if (noticeTimer.current) clearTimeout(noticeTimer.current);
    noticeTimer.current = setTimeout(() => setNotice(null), 4000);
  }, []);

  // Load the newest thoughts (the server returns the latest 15)
  const refresh = useCallback(async () => {
    try {
      const params = new URLSearchParams();
      if (EMAIL_RE.test(emailRef.current)) {
        params.set("email", emailRef.current.trim().toLowerCase());
      }
      const res = await fetch(`/api/thoughts?${params.toString()}`, {
        cache: "no-store",
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Could not load the wall.");
      setThoughts(data.thoughts as Thought[]);
      setWallError(null);
    } catch (err) {
      setWallError(
        err instanceof Error ? err.message : "Could not load the wall."
      );
    } finally {
      setWallLoading(false);
    }
  }, []);

  // Restore the saved email, then load
  useEffect(() => {
    const saved = window.localStorage.getItem(EMAIL_KEY) ?? "";
    if (saved) {
      setEmail(saved);
      emailRef.current = saved;
    }
    refresh();
    const id = setInterval(refresh, REFRESH_MS);
    return () => clearInterval(id);
  }, [refresh]);

  // Preview URL for the chosen image
  useEffect(() => {
    if (!image) {
      setPreview(null);
      return;
    }
    const url = URL.createObjectURL(image);
    setPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [image]);

  // Close the popup with Escape
  useEffect(() => {
    if (!activeId) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setActiveId(null);
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [activeId]);

  function handleEmailChange(value: string) {
    setEmail(value);
    emailRef.current = value;
    if (EMAIL_RE.test(value)) {
      window.localStorage.setItem(EMAIL_KEY, value.trim());
    }
  }

  // Reload so "my reaction" highlights match the entered email
  function handleEmailBlur() {
    if (EMAIL_RE.test(email)) refresh();
  }

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setFormError("Please choose an image file.");
      return;
    }
    if (file.size > MAX_PICK_BYTES) {
      setFormError("That image is too large (12MB max).");
      return;
    }

    setFormError(null);
    setImage(await prepareImage(file));
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setFormError(null);
    setSuccess(false);
    setPosting(true);

    try {
      const body = new FormData();
      body.set("email", email);
      body.set("message", message);
      if (image) body.set("image", image);

      const res = await fetch("/api/thoughts", { method: "POST", body });
      const data = await res.json();

      if (!res.ok) {
        setFormError(data.error ?? "Something went wrong. Please try again.");
        return;
      }

      setThoughts((prev) => [data.thought, ...prev]);
      setMessage("");
      setImage(null);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch {
      setFormError("Network error. Please try again.");
    } finally {
      setPosting(false);
    }
  }

  async function handleReact(id: string, emoji: string) {
    if (!EMAIL_RE.test(email)) {
      showNotice("Enter your company email in the box to react.");
      return;
    }

    setThoughts((prev) =>
      prev.map((t) => (t.id === id ? applyReaction(t, emoji) : t))
    );

    try {
      const res = await fetch(`/api/thoughts/${id}/react`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, emoji }),
      });
      if (!res.ok) {
        const data = await res.json();
        showNotice(data.error ?? "Could not save your reaction.");
        refresh();
      }
    } catch {
      showNotice("Network error. Please try again.");
      refresh();
    }
  }

  function handleCommentCount(id: string, count: number) {
    setThoughts((prev) =>
      prev.map((t) => (t.id === id ? { ...t, commentCount: count } : t))
    );
  }

  const activeThought = activeId
    ? thoughts.find((t) => t.id === activeId) ?? null
    : null;

  return (
    <main className="relative flex min-h-screen flex-col bg-[#050505] pt-20 lg:h-screen lg:overflow-hidden">
      <div className="starfield" />

      {notice && (
        <div className="fixed left-1/2 top-24 z-[60] w-[calc(100%-3rem)] max-w-md -translate-x-1/2 border border-white/20 bg-black/90 px-4 py-3 text-center text-xs tracking-wide text-white/80 backdrop-blur">
          {notice}
        </div>
      )}

      <div className="relative z-10 grid flex-1 grid-cols-1 lg:min-h-0 lg:grid-cols-2">
        {/* LEFT HALF: heading + composer */}
        <section className="flex flex-col overflow-y-auto px-4 py-8 sm:px-8 lg:border-r lg:border-white/[0.08] lg:px-10">
          <div className="mx-auto my-auto flex w-full max-w-xl flex-col gap-6">
            <div className="flex flex-col items-center text-center">
              <div className="mb-4 flex items-center gap-4 text-[11px] font-medium tracking-[0.4em] text-white/45">
                <span className="h-px w-8 bg-white/20" />
                LEAVE YOUR MARK
                <span className="h-px w-8 bg-white/20" />
              </div>

              <h1 className="font-display text-[10vw] font-black leading-[0.95] tracking-tight sm:text-5xl">
                <span className="metal-text">WALL OF THOUGHTS</span>
              </h1>

              <p className="mt-4 max-w-md text-sm tracking-wide text-white/50">
                Share a memory, a photo, or a hope for the next chapter.
              </p>
            </div>

            <form
              onSubmit={handleSubmit}
              className="flex flex-col gap-4 border border-white/15 bg-black/70 p-5 text-left backdrop-blur-sm"
            >
              <div className="flex flex-col gap-2">
                <label
                  htmlFor="wall-email"
                  className="text-xs font-medium tracking-[0.25em] text-white/40"
                >
                  COMPANY EMAIL
                </label>
                <input
                  id="wall-email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => handleEmailChange(e.target.value)}
                  onBlur={handleEmailBlur}
                  pattern="^[a-zA-Z0-9._%+-]+@intercommerce\.com\.ph$"
                  title="Please use your @intercommerce.com.ph email address"
                  className="border border-white/15 bg-white/[0.02] px-4 py-3 text-sm text-white outline-none placeholder:text-white/25 focus:border-white/40"
                  placeholder="jane@intercommerce.com.ph"
                />
                <span className="text-xs text-white/30">
                  Only registered employees can post, react, or comment.{" "}
                  <Link
                    href="/rsvp"
                    className="text-white/50 underline underline-offset-2 hover:text-white/80"
                  >
                    Register here
                  </Link>
                  .
                </span>
              </div>

              <div className="flex flex-col gap-2">
                <label
                  htmlFor="wall-message"
                  className="text-xs font-medium tracking-[0.25em] text-white/40"
                >
                  YOUR THOUGHT
                </label>
                <textarea
                  id="wall-message"
                  required
                  rows={3}
                  maxLength={MAX_LEN}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className="resize-none border border-white/15 bg-white/[0.02] px-4 py-3 text-sm text-white outline-none placeholder:text-white/25 focus:border-white/40"
                  placeholder="What's on your mind?"
                />
                <span className="self-end text-xs text-white/30">
                  {message.length}/{MAX_LEN}
                </span>
              </div>

              {preview && (
                <div className="relative border border-white/15 bg-black">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={preview}
                    alt="Selected attachment"
                    className="mx-auto max-h-40 w-full object-contain"
                  />
                  <button
                    type="button"
                    onClick={() => setImage(null)}
                    aria-label="Remove image"
                    className="absolute right-2 top-2 border border-white/30 bg-black/80 px-2 py-1 text-xs text-white/80 hover:text-white"
                  >
                    ✕
                  </button>
                </div>
              )}

              {formError && (
                <p className="text-sm text-red-400/80">{formError}</p>
              )}
              {success && (
                <p className="text-sm text-white/70">Posted. It's on the wall.</p>
              )}

              <div className="flex items-center gap-3">
                <input
                  ref={fileRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp,image/gif"
                  onChange={handleFile}
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={() => fileRef.current?.click()}
                  className="border border-white/20 px-4 py-3 text-[11px] font-semibold tracking-[0.2em] text-white/70 transition-colors hover:border-white/50 hover:text-white"
                >
                  {image ? "CHANGE PHOTO" : "ADD PHOTO"}
                </button>
                <button
                  type="submit"
                  disabled={posting}
                  className="metal-button ml-auto px-8 py-3 text-sm font-semibold tracking-[0.2em] text-black transition-transform hover:scale-[1.02] disabled:opacity-50 disabled:hover:scale-100"
                >
                  {posting ? "POSTING..." : "POST"}
                </button>
              </div>
            </form>
          </div>
        </section>

        {/* RIGHT HALF: thoughts scrolling through space */}
        <section
          ref={panelRef}
          className="float-field relative h-[75vh] overflow-hidden lg:h-auto"
          style={
            {
              "--loop": `${loopPx}px`,
              maskImage:
                "linear-gradient(to bottom, transparent 0%, black 10%, black 90%, transparent 100%)",
              WebkitMaskImage:
                "linear-gradient(to bottom, transparent 0%, black 10%, black 90%, transparent 100%)",
            } as React.CSSProperties
          }
        >
          {wallLoading ? (
            <p className="absolute inset-0 flex items-center justify-center text-sm tracking-wide text-white/40">
              Loading the wall...
            </p>
          ) : wallError ? (
            <p className="absolute inset-0 flex items-center justify-center px-6 text-center text-sm tracking-wide text-red-400/80">
              {wallError}
            </p>
          ) : thoughts.length === 0 ? (
            <p className="absolute inset-0 flex items-center justify-center px-6 text-center text-sm tracking-wide text-white/40">
              The wall is empty. Be the first to leave a thought.
            </p>
          ) : (
            thoughts.map((t, i) => (
              <FloatingCard
                key={t.id}
                thought={t}
                onOpen={setActiveId}
                lane={i % 2}
                slot={Math.floor(i / 2)}
                perLane={perLane}
                duration={loopDuration}
              />
            ))
          )}
        </section>
      </div>

      <footer className="relative z-10 flex shrink-0 items-center justify-between border-t border-white/[0.08] bg-[#050505] px-6 py-4 text-[11px] tracking-[0.15em] text-white/35 sm:px-10">
        <span>© 2026 INTERCOMMERCE</span>
        <span>TIME IS A CONSTRUCT</span>
      </footer>

      {/* Popup for an opened thought */}
      {activeThought && (
        <div
          className="fixed inset-0 z-[45] flex items-start justify-center overflow-y-auto bg-black/80 px-4 py-24 backdrop-blur-sm"
          onClick={() => setActiveId(null)}
        >
          <div
            className="relative w-full max-w-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => setActiveId(null)}
              aria-label="Close"
              className="absolute -top-10 right-0 border border-white/30 bg-black/80 px-3 py-1 text-xs tracking-[0.2em] text-white/80 hover:text-white"
            >
              CLOSE ✕
            </button>
            <PostCard
              thought={activeThought}
              email={email}
              onReact={handleReact}
              onNotice={showNotice}
              onCommentCount={handleCommentCount}
            />
          </div>
        </div>
      )}
    </main>
  );
}