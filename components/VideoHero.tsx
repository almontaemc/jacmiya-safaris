import Link from "next/link";

export default function VideoHero() {
  return (
    <section className="relative min-h-[92vh] flex items-center bg-bark overflow-hidden">
      {/* Subtle background texture */}
      <div className="absolute inset-0 bg-gradient-to-br from-bark via-bark/95 to-forest/60" />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full py-16 lg:py-0">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 items-center">

          {/* Text */}
          <div>
            <div className="inline-flex items-center gap-2 bg-savanna/20 backdrop-blur-sm border border-savanna/40 rounded-full px-4 py-1.5 text-savanna text-sm mb-6">
              <span className="w-2 h-2 bg-savanna rounded-full animate-pulse" />
              Est. in Kenya — Experts in East Africa
            </div>
            <h1 className="font-serif text-5xl sm:text-6xl lg:text-7xl font-bold text-cream leading-tight mb-6">
              Discover Africa&apos;s<br />
              <span className="text-savanna">Wild Heart</span>
            </h1>
            <p className="text-cream/70 text-lg sm:text-xl max-w-lg mb-10 leading-relaxed">
              Expert-guided safaris across Kenya, Tanzania, and Rwanda. 70+ breathtaking destinations, price-match guarantee, and memories that last a lifetime.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link
                href="/tours"
                className="bg-savanna hover:bg-savanna-dark text-white font-semibold px-8 py-3.5 rounded-full text-lg transition-colors shadow-lg shadow-savanna/20 text-center"
              >
                Explore Tours
              </Link>
              <Link
                href="/contact"
                className="border border-cream/40 hover:border-cream/80 text-cream font-semibold px-8 py-3.5 rounded-full text-lg transition-colors backdrop-blur-sm text-center"
              >
                Plan Your Safari
              </Link>
            </div>
          </div>

          {/* Video */}
          <div className="flex justify-center lg:justify-end">
            <div
              className="relative rounded-3xl overflow-hidden shadow-2xl ring-1 ring-white/10"
              style={{ width: "min(340px, 85vw)", aspectRatio: "9/16" }}
            >
              <video
                src="/hero-video.mp4"
                className="absolute inset-0 w-full h-full object-cover"
                autoPlay
                muted
                loop
                playsInline
              />
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
