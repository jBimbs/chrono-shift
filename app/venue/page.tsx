"use client";

import { useEffect, useState } from "react";

const VENUE_NAME = "Enderun Colleges";
const VENUE_ADDRESS =
  "1100 Campus Avenue, McKinley Hill, Fort Bonifacio, Taguig City, 1634 Metro Manila, Philippines";
const GMAPS_URL = "https://maps.app.goo.gl/CVxE9tfD7JUDokwRA";

// Save your 6 venue photos into /public with these exact filenames,
// or rename these to match whatever you saved them as.
const IMAGES = [
  "/venue1.jpg",
  "/venue-2.jpg",
  "/venue3.jpg",
  "/venue4.jpg",
  "/venue5.jpg",
  "/venue6.jpg",
];

function ImageSlider() {
  const [index, setIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  function prev() {
    setIndex((i) => (i === 0 ? IMAGES.length - 1 : i - 1));
  }

  function next() {
    setIndex((i) => (i === IMAGES.length - 1 ? 0 : i + 1));
  }

  useEffect(() => {
    if (isPaused) return;
    const id = setInterval(next, 4000);
    return () => clearInterval(id);
  }, [isPaused]);

  return (
    <div
      className="relative w-full overflow-hidden border border-white/10 bg-white/[0.02]"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      <div className="relative aspect-[4/3] w-full sm:aspect-square">
        <img
          src={IMAGES[index]}
          alt={`Venue photo ${index + 1}`}
          className="h-full w-full object-cover transition-opacity duration-500"
        />
      </div>

      {/* Prev / Next controls */}
      <button
        type="button"
        onClick={prev}
        aria-label="Previous image"
        className="absolute left-3 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center border border-white/20 bg-black/50 text-white/80 backdrop-blur transition-colors hover:bg-black/70"
      >
        ‹
      </button>
      <button
        type="button"
        onClick={next}
        aria-label="Next image"
        className="absolute right-3 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center border border-white/20 bg-black/50 text-white/80 backdrop-blur transition-colors hover:bg-black/70"
      >
        ›
      </button>

      {/* Dots */}
      <div className="absolute bottom-3 left-1/2 flex -translate-x-1/2 gap-2">
        {IMAGES.map((_, i) => (
          <button
            key={i}
            type="button"
            onClick={() => setIndex(i)}
            aria-label={`Go to image ${i + 1}`}
            className={`h-1.5 w-1.5 rounded-full transition-all ${
              i === index ? "w-4 bg-white" : "bg-white/30"
            }`}
          />
        ))}
      </div>
    </div>
  );
}
function VenueDetails() {
  const [open, setOpen] = useState(false);

  return (
    <div className="border-t border-white/10 pt-4">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-2 text-xs font-medium tracking-[0.25em] text-white/45 transition-colors hover:text-white/75"
      >
        {open ? "SEE LESS" : "SEE MORE"}
        <span
          className={`inline-block transition-transform duration-300 ${
            open ? "rotate-180" : ""
          }`}
        >
          ▾
        </span>
      </button>

      <div
        className={`grid overflow-hidden transition-all duration-300 ${
          open ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
        }`}
      >
        <div className="min-h-0 pt-4">
          <p className="text-sm leading-relaxed tracking-wide text-white/50">
            Placeholder venue details go here — parking information, entrance
            instructions, nearby landmarks, dress code, or anything else
            guests should know before arriving. Replace this text once the
            real details are ready.
          </p>
        </div>
      </div>
    </div>
  );
}
export default function VenuePage() {
  return (
    <main className="relative min-h-screen overflow-x-hidden bg-[#050505]">
      <div className="starfield" />

      <section className="relative z-10 px-6 py-20 sm:px-10 sm:py-28">
        <div className="mx-auto flex max-w-5xl items-center gap-4 pb-14 text-center sm:pb-16">
          <span className="h-px flex-1 bg-white/20" />
          <span className="text-[11px] font-medium tracking-[0.4em] text-white/45">
            THE LOCATION
          </span>
          <span className="h-px flex-1 bg-white/20" />
        </div>

        <div className="mx-auto grid max-w-5xl grid-cols-1 gap-10 sm:grid-cols-2 sm:gap-14">
          {/* Left: image slider */}
          <ImageSlider />

          {/* Right: details */}
          <div className="flex flex-col justify-center gap-6 text-left">
            <h1 className="font-display text-4xl font-black leading-tight sm:text-5xl">
              <span className="metal-text">{VENUE_NAME}</span>
            </h1>

            <p className="text-sm leading-relaxed tracking-wide text-white/55 sm:text-base">
              {VENUE_ADDRESS}
            </p>
            <VenueDetails />
<a href={GMAPS_URL} target="_blank" rel="noopener noreferrer" className="metal-button mt-2 inline-flex w-fit items-center gap-2 px-8 py-4 text-sm font-semibold tracking-[0.2em] text-black transition-transform hover:scale-[1.02]">
  OPEN IN GOOGLE MAPS
</a>
          </div>
        </div>
      </section>

      <footer className="relative z-10 flex items-center justify-between border-t border-white/[0.08] bg-[#050505] px-6 py-6 text-[11px] tracking-[0.15em] text-white/35 sm:px-10">
        <span>© 2026 CHRONOSHIFT EVENTS</span>
        <span>TIME IS A CONSTRUCT</span>
      </footer>
    </main>
  );
}