"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";

const slides = [
  { src: "/images/hero-home.jpg",   position: "center 60%", label: "The Great Migration" },
  { src: "/images/wildlife-3.jpg",  position: "center 40%", label: "Lions of the Mara"   },
  { src: "/images/wildlife-2.jpg",  position: "center 50%", label: "Zebras of the Serengeti" },
  { src: "/images/kenya.jpg",       position: "center 45%", label: "Kenya's Big Five"    },
  { src: "/images/serengeti.jpg",   position: "center 50%", label: "Serengeti Plains"    },
  { src: "/images/wildlife-1.jpg",  position: "center 40%", label: "East Africa's Wild Heart" },
];

const INTERVAL = 5000;

export default function HeroSlider() {
  const [current, setCurrent] = useState(0);
  const [prev, setPrev] = useState<number | null>(null);
  const [fading, setFading] = useState(false);

  const goTo = useCallback((idx: number) => {
    if (idx === current) return;
    setPrev(current);
    setFading(true);
    setCurrent(idx);
    setTimeout(() => { setPrev(null); setFading(false); }, 900);
  }, [current]);

  const next = useCallback(() => goTo((current + 1) % slides.length), [current, goTo]);
  const prev_ = useCallback(() => goTo((current - 1 + slides.length) % slides.length), [current, goTo]);

  useEffect(() => {
    const id = setInterval(next, INTERVAL);
    return () => clearInterval(id);
  }, [next]);

  return (
    <section className="relative min-h-[92vh] flex items-end pb-20 bg-bark overflow-hidden">

      {/* Slide backgrounds — stack with crossfade */}
      {slides.map((slide, i) => (
        <div
          key={slide.src}
          aria-hidden={i !== current}
          className="absolute inset-0 bg-cover transition-opacity duration-900 ease-in-out"
          style={{
            backgroundImage: `url('${slide.src}')`,
            backgroundPosition: slide.position,
            backgroundSize: "cover",
            opacity: i === current ? 1 : (i === prev && fading ? 0 : 0),
            zIndex: i === current ? 1 : (i === prev ? 0 : 0),
          }}
        />
      ))}

      {/* Gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-bark/90 via-bark/40 to-bark/10 z-10" />

      {/* Content */}
      <div className="relative z-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div className="inline-flex items-center gap-2 bg-savanna/20 backdrop-blur-sm border border-savanna/40 rounded-full px-4 py-1.5 text-savanna text-sm mb-6">
          <span className="w-2 h-2 bg-savanna rounded-full animate-pulse" />
          Est. in Kenya — Experts in East Africa
        </div>
        <h1 className="font-serif text-5xl sm:text-6xl lg:text-7xl font-bold text-cream leading-tight mb-6">
          Discover Africa&apos;s<br /><span className="text-savanna">Wild Heart</span>
        </h1>
        <p className="text-cream/70 text-lg sm:text-xl max-w-2xl mb-10 leading-relaxed">
          Expert-guided safaris across Kenya, Tanzania, and Rwanda. 70+ breathtaking destinations, price-match guarantee, and memories that last a lifetime.
        </p>
        <div className="flex flex-col sm:flex-row gap-4">
          <Link href="/tours" className="bg-savanna hover:bg-savanna-dark text-white font-semibold px-8 py-3.5 rounded-full text-lg transition-colors shadow-lg shadow-savanna/20 text-center">
            Explore Tours
          </Link>
          <Link href="/contact" className="border border-cream/40 hover:border-cream/80 text-cream font-semibold px-8 py-3.5 rounded-full text-lg transition-colors backdrop-blur-sm text-center">
            Plan Your Safari
          </Link>
        </div>

        {/* Slide label + dots + arrows */}
        <div className="flex items-center gap-4 mt-10">
          {/* Prev */}
          <button
            onClick={prev_}
            aria-label="Previous image"
            className="w-9 h-9 rounded-full border border-cream/30 hover:border-savanna/70 flex items-center justify-center text-cream/60 hover:text-savanna transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          {/* Dots */}
          <div className="flex items-center gap-2">
            {slides.map((_, i) => (
              <button
                key={i}
                onClick={() => goTo(i)}
                aria-label={`Go to slide ${i + 1}`}
                className={`rounded-full transition-all duration-300 ${
                  i === current
                    ? "w-6 h-2 bg-savanna"
                    : "w-2 h-2 bg-cream/30 hover:bg-cream/60"
                }`}
              />
            ))}
          </div>

          {/* Next */}
          <button
            onClick={next}
            aria-label="Next image"
            className="w-9 h-9 rounded-full border border-cream/30 hover:border-savanna/70 flex items-center justify-center text-cream/60 hover:text-savanna transition-colors"
          >
            <ChevronRight className="w-4 h-4" />
          </button>

          {/* Slide label */}
          <span className="text-cream/40 text-xs uppercase tracking-widest hidden sm:block">
            {slides[current].label}
          </span>
        </div>
      </div>
    </section>
  );
}
