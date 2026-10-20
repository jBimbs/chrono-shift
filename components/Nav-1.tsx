import Link from "next/link";

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
  return (
    <header className="relative z-10 flex items-center justify-between bg-[#050505] border-b border-white/[0.08] px-6 py-5 sm:px-10">
      <Link href="/" className="flex items-center gap-3">
        <img
          src="/ins-logo.png"
          alt="ChronoShift logo"
          className="relative z-10 mb-s h-1 w-auto sm:h-10"
        />
      </Link>

      <nav className="hidden gap-10 text-xs font-medium tracking-[0.3em] text-white/50 sm:flex">
        {NAV_LINKS.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className="transition-colors hover:text-white/90"
          >
            {link.label}
          </Link>
        ))}
      </nav>

      <span className="text-xs tracking-[0.25em] text-white/40">
        {dateLabel}
      </span>
    </header>
  );
}