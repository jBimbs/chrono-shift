import Countdown from "@/components/Countdown";

export default function ChronoShiftHero() {
  return (
    <main className="relative min-h-screen overflow-x-hidden bg-[#050505]">
      <div className="starfield" />

      <section className="hero-vignette relative z-10 flex flex-col items-center px-6 pb-20 pt-20 text-center sm:pt-28">
        {/* Logo — replace src with your actual logo path once you have the file in /public */}
        <img
          src="/ins-logo.png"
          alt="ChronoShift logo"
          className="relative z-10 mb-6 h-14 w-auto sm:h-16"
        />

        <div className="mb-8 flex items-center gap-4 text-[11px] font-medium tracking-[0.4em] text-white/45">
          <span className="h-px w-10 bg-white/20" />
          YEAR-END EVENT
          <span className="h-px w-10 bg-white/20" />
        </div>

        {/* Ghost watermark text behind the headline */}
        <div
          aria-hidden
          className="pointer-events-none absolute top-24 left-1/2 -z-10 w-[140%] -translate-x-1/2 select-none whitespace-nowrap font-display text-[22vw] font-black leading-none ghost-text sm:top-28"
        >
          CHRONOSHIFT
        </div>

        <h1 className="font-display font-black leading-[0.95] tracking-tight">
          <span className="metal-text block whitespace-nowrap text-[13vw] sm:text-[7rem] lg:text-[8rem]">
            CHRONOSHIFT
          </span>
        </h1>

        <div className="mt-10 border border-white/15 px-6 py-3 text-xs font-medium tracking-[0.2em] text-white/60 sm:text-sm">
          DECEMBER 14, 2026 · TIME TBA&nbsp;&nbsp;|&nbsp;&nbsp;MAKATI CITY
        </div>
      </section>

      <section className="relative z-10 flex flex-col items-center px-6 pb-24">
        <Countdown />
        <div className="mt-16 mb-10 flex items-center gap-4 text-[11px] font-medium tracking-[0.4em] text-white/45">
          <span className="h-px w-10 bg-white/20" />
          UNTIL THE SHIFT
          <span className="h-px w-10 bg-white/20" />
        </div>
        <a href="/rsvp" className="metal-button px-10 py-4 text-sm font-semibold tracking-[0.2em] text-black transition-transform hover:scale-[1.02]">
          RESERVE ACCESS
        </a>
      </section>

      <footer className="relative z-10 flex items-center justify-between border-t border-white/[0.08] px-6 py-6 text-[11px] tracking-[0.15em] text-white/35 sm:px-10">
        <span>© 2026 INTERCOMMERCE</span>
        <span>TIME IS A CONSTRUCT</span>
      </footer>
    </main>
  );
}