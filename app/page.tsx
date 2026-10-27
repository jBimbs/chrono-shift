import Countdown from "@/components/Countdown";
import ReserveButton from "@/components/ReserveButton";

const FX_CSS = `
/* ---------- Light sweep ---------- */
.shine-text {
  pointer-events: none;
  user-select: none;
  color: transparent;
  -webkit-text-fill-color: transparent;
  background-image: linear-gradient(
    100deg,
    transparent 38%,
    rgba(255, 255, 255, 0.95) 50%,
    transparent 62%
  );
  background-size: 250% 100%;
  background-repeat: no-repeat;
  background-position: 100% 0;
  -webkit-background-clip: text;
  background-clip: text;
  filter: drop-shadow(0 0 14px rgba(255, 255, 255, 0.45));
  animation: shine-sweep 6s ease-in-out infinite;
}
@keyframes shine-sweep {
  0%   { background-position: 100% 0; }
  45%  { background-position: 0% 0; }
  100% { background-position: 0% 0; }
}

/* ---------- Headline glitch ---------- */
.glitch-wrap { position: relative; }

.glitch-base {
  animation: glitch-base 4.3s infinite steps(1);
}

.glitch-layer {
  position: absolute;
  inset: 0;
  display: block;
  pointer-events: none;
  user-select: none;
  mix-blend-mode: screen;
  opacity: 0;
  white-space: nowrap;
}
.glitch-cyan {
  color: #00f0ff;
  -webkit-text-fill-color: #00f0ff;
  animation: glitch-cyan 4.3s infinite steps(1);
}
.glitch-magenta {
  color: #ff2bd6;
  -webkit-text-fill-color: #ff2bd6;
  animation: glitch-magenta 4.3s infinite steps(1);
}

/* Hovering the title makes it glitch constantly */
.glitch-wrap:hover .glitch-base    { animation-duration: 0.6s; }
.glitch-wrap:hover .glitch-cyan    { animation-duration: 0.6s; }
.glitch-wrap:hover .glitch-magenta { animation-duration: 0.6s; }

@keyframes glitch-base {
  0%, 90%, 96%, 100% { transform: none; }
  91% { transform: translate(-3px, 1px) skewX(-5deg); }
  92% { transform: translate(4px, -1px) skewX(4deg); }
  93% { transform: translate(-2px, 0) skewX(0deg); }
  94% { transform: translate(3px, 1px) skewX(-3deg); }
  95% { transform: translate(-1px, 0); }
}
@keyframes glitch-cyan {
  0%, 90%, 97%, 100% { opacity: 0; transform: none; clip-path: inset(0 0 0 0); }
  91% { opacity: 1; transform: translate(-7px, 0);   clip-path: inset(8% 0 68% 0); }
  92% { opacity: 1; transform: translate(6px, 1px);  clip-path: inset(52% 0 22% 0); }
  93% { opacity: 1; transform: translate(-9px, -1px); clip-path: inset(28% 0 48% 0); }
  94% { opacity: 1; transform: translate(5px, 0);    clip-path: inset(72% 0 6% 0); }
  95% { opacity: 1; transform: translate(-4px, 1px); clip-path: inset(4% 0 82% 0); }
  96% { opacity: 1; transform: translate(3px, 0);    clip-path: inset(40% 0 38% 0); }
}
@keyframes glitch-magenta {
  0%, 90%, 97%, 100% { opacity: 0; transform: none; clip-path: inset(0 0 0 0); }
  91% { opacity: 1; transform: translate(7px, 0);    clip-path: inset(60% 0 12% 0); }
  92% { opacity: 1; transform: translate(-6px, -1px); clip-path: inset(14% 0 60% 0); }
  93% { opacity: 1; transform: translate(9px, 1px);  clip-path: inset(46% 0 30% 0); }
  94% { opacity: 1; transform: translate(-5px, 0);   clip-path: inset(6% 0 76% 0); }
  95% { opacity: 1; transform: translate(4px, -1px); clip-path: inset(78% 0 4% 0); }
  96% { opacity: 1; transform: translate(-3px, 0);   clip-path: inset(24% 0 52% 0); }
}

/* ---------- Whole-page glitch burst ---------- */
.glitch-page {
  animation: page-glitch 9s infinite steps(1);
}
@keyframes page-glitch {
  0%, 93%, 96.5%, 100% { transform: none; filter: none; }
  93.5% { transform: translateX(-5px); filter: hue-rotate(40deg) saturate(1.6); }
  94.5% { transform: translateX(6px) skewX(1deg); filter: hue-rotate(-30deg) contrast(1.2); }
  95.5% { transform: translate(-2px, 1px); filter: contrast(1.35) brightness(1.1); }
}

.glitch-bar {
  position: absolute;
  left: 0;
  right: 0;
  height: 3px;
  pointer-events: none;
  z-index: 40;
  background: rgba(255, 255, 255, 0.28);
  box-shadow: 0 0 12px rgba(0, 240, 255, 0.5);
  opacity: 0;
  animation: glitch-bar 9s infinite steps(1);
}
@keyframes glitch-bar {
  0%, 93%, 97%, 100% { opacity: 0; top: 0; }
  93.5% { opacity: 1; top: 18%; }
  94.2% { opacity: 1; top: 63%; }
  95%   { opacity: 1; top: 41%; }
  96%   { opacity: 1; top: 82%; }
}

/* ---------- Scanlines ---------- */
.scanlines {
  position: absolute;
  inset: 0;
  pointer-events: none;
  z-index: 30;
  background-image: repeating-linear-gradient(
    to bottom,
    rgba(255, 255, 255, 0.5) 0,
    rgba(255, 255, 255, 0.5) 1px,
    transparent 1px,
    transparent 3px
  );
  mix-blend-mode: overlay;
  opacity: 0.07;
  animation: scan-flicker 3s ease-in-out infinite;
}
@keyframes scan-flicker {
  0%, 100% { opacity: 0.06; }
  50% { opacity: 0.1; }
}

/* ---------- Reduced motion ---------- */
@media (prefers-reduced-motion: reduce) {
  .shine-text { animation: none; background-image: none; }
  .glitch-base, .glitch-page, .scanlines { animation: none; }
  .glitch-layer, .glitch-bar { display: none; }
}
`;

export default function ChronoShiftHero() {
  return (
    <main className="glitch-page page-main relative bg-[#050505] max-lg:min-h-screen max-lg:overflow-x-hidden">
      <style dangerouslySetInnerHTML={{ __html: FX_CSS }} />
      <div className="starfield" />
      <div className="particles" aria-hidden />
      <div className="scanlines" aria-hidden />
      <div className="glitch-bar" aria-hidden />

      {/* Silver clock background overlay */}
      <div className="clock-overlay" aria-hidden="true" />

      <section className="hero-vignette relative z-10 flex flex-col items-center px-6 pb-20 pt-20 text-center sm:pt-28 lg:min-h-0 lg:flex-1 lg:justify-center lg:pb-[2vh] lg:pt-[3vh]">
        {/* Logo — replace src with your actual logo path once you have the file in /public */}

        <div className="mb-8 flex items-center gap-4 text-[11px] font-medium tracking-[0.4em] text-white/45 lg:mb-[2vh]">
          <span className="h-px w-10 bg-white/20" />
          YEAR-END PARTY
          <span className="h-px w-10 bg-white/20" />
        </div>

        {/* Ghost watermark text behind the headline */}
        <div
          aria-hidden
          className="pointer-events-none absolute top-24 left-1/2 -z-10 w-[140%] -translate-x-1/2 select-none whitespace-nowrap font-display text-[22vw] font-black leading-none ghost-text sm:top-28"
        >
          CHRONOSHIFT
        </div>

        <h1 className="glitch-wrap relative font-display font-black leading-[0.95] tracking-tight">
          <span className="glitch-base metal-text block whitespace-nowrap text-[13vw] sm:text-[7rem] lg:text-[min(8rem,13vh)]">
            CHRONOSHIFT
          </span>

          {/* RGB-split glitch layers */}
          <span
            aria-hidden
            className="glitch-layer glitch-cyan text-[13vw] sm:text-[7rem] lg:text-[min(8rem,13vh)]"
          >
            CHRONOSHIFT
          </span>
          <span
            aria-hidden
            className="glitch-layer glitch-magenta text-[13vw] sm:text-[7rem] lg:text-[min(8rem,13vh)]"
          >
            CHRONOSHIFT
          </span>

          {/* Light passing through the letters */}
          <span
            aria-hidden
            className="shine-text absolute inset-0 block whitespace-nowrap text-[13vw] sm:text-[7rem] lg:text-[min(8rem,13vh)]"
          >
            CHRONOSHIFT
          </span>
        </h1>

        <div className="mt-10 border border-white/15 px-6 py-3 text-xs font-medium tracking-[0.2em] text-white/60 sm:text-sm lg:mt-[3vh]">
          DECEMBER 14, 2026 · REGISTRATION STARTS AT 6PM&nbsp;&nbsp;|&nbsp;&nbsp;Enderun College Atrium and The Courtyard
        </div>
      </section>

      <section className="relative z-10 flex flex-col items-center px-6 pb-24 lg:pb-[3vh]">
        <Countdown />
        <div className="mt-16 mb-10 flex items-center gap-4 text-[11px] font-medium tracking-[0.4em] text-white/45 lg:mb-[2vh] lg:mt-[3vh]">
          <span className="h-px w-10 bg-white/20" />
          UNTIL THE SHIFT
          <span className="h-px w-10 bg-white/20" />
        </div>
        <ReserveButton />
      </section>

      <footer className="relative z-10 flex items-center justify-between border-t border-white/[0.08] px-6 py-6 text-[11px] tracking-[0.15em] text-white/35 sm:px-10 lg:py-3">
        <span>© 2026 INTERCOMMERCE</span>
        <span>TIME IS A CONSTRUCT</span>
      </footer>
    </main>
  );
}