"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { Search, X } from "lucide-react";
import { useCurrency, formatPrice } from "@/context/CurrencyContext";
import { allTours, type Tour } from "@/data/tours";

type Destination = "All" | "Kenya" | "Tanzania" | "Rwanda";
type Duration = "All" | "1-4" | "5-7" | "8-10";

const DEST_OPTIONS: Destination[] = ["All", "Kenya", "Tanzania", "Rwanda"];
const DUR_OPTIONS: { label: string; value: Duration }[] = [
  { label: "Any Duration", value: "All" },
  { label: "1–4 Days", value: "1-4" },
  { label: "5–7 Days", value: "5-7" },
  { label: "8–10 Days", value: "8-10" },
];

function matchesDuration(days: number, dur: Duration): boolean {
  if (dur === "All") return true;
  if (dur === "1-4") return days <= 4;
  if (dur === "5-7") return days >= 5 && days <= 7;
  return days >= 8;
}

function TourCard({ tour }: { tour: Tour }) {
  const { currency } = useCurrency();
  return (
    <div className="bg-white rounded-2xl overflow-hidden shadow-sm border border-sand hover:shadow-lg transition-all hover:-translate-y-0.5 flex flex-col">
      {/* Image */}
      <div className="relative h-52 flex-shrink-0">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={tour.image} alt={tour.title} className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-bark/60 to-transparent" />
        <div className="absolute top-3 left-3 flex gap-2 flex-wrap">
          <span className={`${tour.badgeColor} text-white text-xs font-semibold px-2.5 py-1 rounded-full`}>
            {tour.badge}
          </span>
          <span className="bg-white/20 backdrop-blur-sm text-white text-xs font-semibold px-2.5 py-1 rounded-full">
            {tour.destination}
          </span>
        </div>
        <div className="absolute bottom-3 left-4 right-4">
          <h3 className="font-serif text-cream font-bold leading-snug text-sm">{tour.title}</h3>
        </div>
      </div>

      {/* Body */}
      <div className="p-5 flex flex-col flex-1">
        <div className="flex gap-4 text-xs text-earth mb-4 pb-4 border-b border-sand">
          <span>⏱ {tour.duration}</span>
          <span>👥 {tour.groupSize}</span>
        </div>

        {/* Highlights */}
        <ul className="grid grid-cols-2 gap-y-1 gap-x-2 mb-4">
          {tour.highlights.map((h) => (
            <li key={h} className="flex items-start gap-1.5 text-earth text-xs">
              <span className="text-savanna mt-0.5 flex-shrink-0">✓</span>
              {h}
            </li>
          ))}
        </ul>

        {/* Includes */}
        <div className="flex flex-wrap gap-1.5 mb-5">
          {tour.includes.map((item) => (
            <span key={item} className="bg-forest/10 text-forest text-xs px-2 py-0.5 rounded-full">
              {item}
            </span>
          ))}
        </div>

        {/* Price + CTA */}
        <div className="mt-auto flex items-center justify-between pt-4 border-t border-sand">
          <div>
            <span className="text-xs text-earth uppercase tracking-wide">From</span>
            <div className="text-savanna font-bold text-lg leading-tight">
              {formatPrice(tour.priceksh, tour.priceusd, currency)}
            </div>
            <div className="text-earth text-xs">per person</div>
          </div>
          <Link
            href="/contact"
            className="bg-savanna hover:bg-savanna-dark text-white font-semibold px-4 py-2 rounded-full text-sm transition-colors shadow-sm"
          >
            Book This Tour
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function ToursClient() {
  const [query, setQuery] = useState("");
  const [dest, setDest] = useState<Destination>("All");
  const [dur, setDur] = useState<Duration>("All");
  const { currency, setCurrency } = useCurrency();

  const filtered = useMemo(() => {
    const q = query.toLowerCase().trim();
    return allTours.filter((t) => {
      if (q && !t.title.toLowerCase().includes(q) && !t.destination.toLowerCase().includes(q)) return false;
      if (dest !== "All" && t.destination !== dest) return false;
      if (!matchesDuration(t.days, dur)) return false;
      return true;
    });
  }, [query, dest, dur]);

  function clearFilters() {
    setQuery("");
    setDest("All");
    setDur("All");
  }

  const hasFilters = query || dest !== "All" || dur !== "All";

  return (
    <section className="py-16 px-4 bg-cream min-h-[60vh]">
      <div className="max-w-7xl mx-auto">

        {/* Search & filter bar */}
        <div className="bg-white rounded-2xl border border-sand shadow-sm p-5 mb-10">
          <div className="flex flex-col md:flex-row gap-3">
            {/* Text search */}
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-earth" />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search tours, destinations…"
                className="w-full pl-10 pr-4 py-2.5 border border-sand rounded-xl text-sm text-bark placeholder-earth/60 focus:outline-none focus:border-savanna transition-colors"
              />
              {query && (
                <button
                  onClick={() => setQuery("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-earth hover:text-bark"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Destination filter */}
            <select
              value={dest}
              onChange={(e) => setDest(e.target.value as Destination)}
              className="border border-sand rounded-xl px-4 py-2.5 text-sm text-bark focus:outline-none focus:border-savanna transition-colors bg-white md:w-44"
            >
              {DEST_OPTIONS.map((d) => (
                <option key={d} value={d}>{d === "All" ? "All Destinations" : d}</option>
              ))}
            </select>

            {/* Duration filter */}
            <select
              value={dur}
              onChange={(e) => setDur(e.target.value as Duration)}
              className="border border-sand rounded-xl px-4 py-2.5 text-sm text-bark focus:outline-none focus:border-savanna transition-colors bg-white md:w-44"
            >
              {DUR_OPTIONS.map((d) => (
                <option key={d.value} value={d.value}>{d.label}</option>
              ))}
            </select>

            {/* Currency toggle */}
            <div className="flex rounded-xl border border-sand overflow-hidden flex-shrink-0">
              {(["KSH", "USD"] as const).map((c) => (
                <button
                  key={c}
                  onClick={() => setCurrency(c)}
                  className={`px-4 py-2.5 text-sm font-semibold transition-colors ${
                    currency === c
                      ? "bg-savanna text-white"
                      : "bg-white text-earth hover:bg-sand/50"
                  }`}
                >
                  {c}
                </button>
              ))}
            </div>
          </div>

          {/* Active filters summary */}
          {hasFilters && (
            <div className="flex items-center gap-3 mt-3 pt-3 border-t border-sand">
              <span className="text-xs text-earth">
                Showing <span className="font-semibold text-bark">{filtered.length}</span> of {allTours.length} tours
              </span>
              <button
                onClick={clearFilters}
                className="text-xs text-savanna hover:text-savanna-dark font-semibold flex items-center gap-1"
              >
                <X className="w-3 h-3" /> Clear filters
              </button>
            </div>
          )}
        </div>

        {/* Results count (when no active filters) */}
        {!hasFilters && (
          <p className="text-earth text-sm mb-6">
            Showing all <span className="font-semibold text-bark">{allTours.length} safari packages</span>
          </p>
        )}

        {/* Tours grid */}
        {filtered.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {filtered.map((tour) => (
              <TourCard key={tour.id} tour={tour} />
            ))}
          </div>
        ) : (
          <div className="text-center py-24">
            <div className="text-5xl mb-4">🔍</div>
            <h3 className="font-serif text-xl font-bold text-bark mb-2">No tours match your search</h3>
            <p className="text-earth text-sm mb-6">Try adjusting your filters or search term.</p>
            <button
              onClick={clearFilters}
              className="bg-savanna hover:bg-savanna-dark text-white font-semibold px-6 py-2.5 rounded-full text-sm transition-colors"
            >
              Clear All Filters
            </button>
          </div>
        )}

        {/* Custom tour CTA */}
        <div className="mt-16 bg-forest rounded-2xl p-10 text-center">
          <span className="text-savanna text-sm font-semibold uppercase tracking-widest">
            Can&apos;t Find What You&apos;re Looking For?
          </span>
          <h3 className="font-serif text-2xl sm:text-3xl font-bold text-cream mt-3 mb-3">
            We Build Custom Safaris
          </h3>
          <p className="text-cream/60 max-w-xl mx-auto mb-8 leading-relaxed">
            Tell us your dates, budget, and dream destinations. Our team will design a bespoke
            itinerary just for you — at no extra charge.
          </p>
          <Link
            href="/contact"
            className="bg-savanna hover:bg-savanna-dark text-white font-semibold px-8 py-3.5 rounded-full text-base transition-colors inline-block"
          >
            Request a Custom Package
          </Link>
        </div>
      </div>
    </section>
  );
}
