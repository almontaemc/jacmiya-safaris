import Link from "next/link";
import HeroVideo from "./HeroVideo";

const trust = ["Expert Local Guides", "Price Match Guarantee", "70+ Destinations", "24/7 Support"];

export default function VideoHero() {
  return (
    // Fills the rest of the first screen below the 80px (h-20) navbar.
    <section className="relative h-[calc(100svh-5rem)] min-h-[560px] flex flex-col bg-bark overflow-hidden">

      {/* Fullscreen background video: 4K on large screens with fast connections, 1080p otherwise */}
      <HeroVideo poster="/hero-poster.jpg" />

      {/* Overlays: soften the bright sky and darken the left side for the text */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/35 via-black/15 to-black/50" />
      <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/25 to-transparent" />

      {/* Content */}
      <div className="relative z-10 flex-1 flex items-center">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
          <p className="text-savanna text-xs sm:text-sm font-semibold uppercase tracking-[0.25em] mb-5">
            Jacmiya Safaris &amp; Holiday Tours
          </p>
          <h1 className="font-serif text-5xl sm:text-6xl lg:text-7xl font-normal text-white leading-[1.05] mb-6 max-w-4xl">
            Discover Africa&apos;s Wild Heart
          </h1>
          <p className="text-white/85 text-lg sm:text-2xl max-w-2xl mb-10 leading-relaxed">
            Expert-guided safaris across Kenya, Tanzania and Rwanda.
          </p>
          <Link
            href="/contact"
            className="inline-block bg-savanna hover:bg-savanna-dark text-white font-semibold uppercase tracking-wider text-sm sm:text-base px-8 py-4 transition-colors shadow-lg shadow-black/20"
          >
            Let&apos;s plan your custom safari
          </Link>
        </div>
      </div>

      {/* Bottom trust strip */}
      <div className="relative z-10 border-t border-white/15 bg-black/25 backdrop-blur-sm">
        <ul className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 grid grid-cols-2 md:grid-cols-4 gap-y-2 gap-x-4 text-white/85 text-xs sm:text-sm tracking-wide">
          {trust.map((t) => (
            <li key={t} className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-savanna flex-shrink-0" />
              {t}
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
