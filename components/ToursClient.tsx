"use client";

import { useState, useMemo, useEffect } from "react";
import Link from "next/link";
import { Search, X } from "lucide-react";
import { useCurrency, formatPrice } from "@/context/CurrencyContext";
import { getTours } from "@/lib/adminStore";
import type { AdminTour } from "@/types/admin";

type Destination = "All" | "Kenya" | "Tanzania" | "Rwanda";
type Duration = "All" | "1-4" | "5-7" | "8-10" | "11+";

const DEST_OPTIONS: Destination[] = ["All", "Kenya", "Tanzania", "Rwanda"];
const DUR_OPTIONS: { label: string; value: Duration }[] = [
  { label: "Any Duration", value: "All" },
  { label: "1–4 Days", value: "1-4" },
  { label: "5–7 Days", value: "5-7" },
  { label: "8–10 Days", value: "8-10" },
  { label: "11+ Days", value: "11+" },
];

function matchesDuration(days: number, dur: Duration): boolean {
  if (dur === "All") return true;
  if (dur === "1-4") return days <= 4;
  if (dur === "5-7") return days >= 5 && days <= 7;
  if (dur === "8-10") return days >= 8 && days <= 10;
  return days >= 11;
}

function TourCard({ tour }: { tour: AdminTour }) {
  const { currency } = useCurrency();
  return (
    <Link
      href={`/tours/${tour.id}`}
      className="bg-white rounded-2xl overflow-hidden shadow-sm border border-sand hover:shadow-lg transition-all hover:-translate-y-0.5 flex flex-col group"
    >
      <div className="relative h-52 flex-shrink-0">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={tour.image} alt={tour.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
        <div className="absolute inset-0 bg-gradient-to-t from-bark/60 to-transparent" />
        <div className="absolute top-3 left-3 flex gap-2 flex-wrap">
          <span className={`${tour.badgeColor} text-white text-xs font-semibold px-2.5 py-1 rounded-full`}>{tour.badge}</span>
          <span className="bg-white/20 backdrop-blur-sm text-white text-xs font-semibold px-2.5 py-1 rounded-full">{tour.destination}</span>
        </div>
        <div className="absolute bottom-3 left-4 right-4">
          <h3 className="font-serif text-cream font-bold leading-snug text-sm">{tour.title}</h3>
        </div>
      </div>

      <div className="p-5 flex flex-col flex-1">
        <div className="flex gap-4 text-xs text-earth mb-4 pb-4 border-b border-sand">
          <span>⏱ {tour.duration}</span>
          <span>👥 {tour.groupSize}</span>
        </div>

        <ul className="grid grid-cols-2 gap-y-1 gap-x-2 mb-4">
          {tour.highlights.slice(0, 4).map((h) => (
            <li key={h} className="flex items-start gap-1.5 text-earth text-xs">
              <span className="text-savanna mt-0.5 flex-shrink-0">✓</span>
              {h}
            </li>
          ))}
        </ul>

        <div className="flex flex-wrap gap-1.5 mb-5">
          {tour.includes.slice(0, 4).map((item) => (
            <span key={item} className="bg-forest/10 text-forest text-xs px-2 py-0.5 rounded-full">{item}</span>
          ))}
          {tour.includes.length > 4 && (
            <span className="bg-gray-100 text-gray-500 text-xs px-2 py-0.5 rounded-full">+{tour.includes.length - 4} more</span>
          )}
        </div>

        <div className="mt-auto flex items-center justify-between pt-4 border-t border-sand">
          <div>
            <span className="text-xs text-earth uppercase tracking-wide">From</span>
            <div className="text-savanna font-bold text-lg leading-tight">
              {formatPrice(tour.priceksh, tour.priceusd, currency)}
            </div>
            <div className="text-earth text-xs">per person</div>
          </div>
          <span className="bg-savanna group-hover:bg-savanna-dark text-white font-semibold px-4 py-2 rounded-full text-sm transition-colors shadow-sm">
            View Details →
          </span>
        </div>
      </div>
    </Link>
  );
}

export default function ToursClient() {
  const [tours, setTours] = useState<AdminTour[]>([]);
  const [query, setQuery] = useState("");
  const [dest, setDest] = useState<Destination>("All");
  const [dur, setDur] = useState<Duration>("All");
  const { currency, setCurrency } = useCurrency();

  useEffect(() => {
    setTours(getTours().filter((t) => t.active));
  }, []);

  const filtered = useMemo(() => {
    const q = query.toLowerCase().trim();
    return tours.filter((t) => {
      if (q && !t.title.toLowerCase().includes(q) && !t.destination.toLowerCase().includes(q)) return false;
      if (dest !== "All" && t.destination !== dest) return false;
      if (!matchesDuration(t.days, dur)) return false;
      return true;
    });
  }, [query, dest, dur, tours]);

  function clearFilters() { setQuery(""); setDest("All"); setDur("All"); }
  const hasFilters = query || dest !== "All" || dur !== "All";

  return (
    <section className="py-16 px-4 bg-cream min-h-[60vh]">
      <div className="max-w-7xl mx-auto">
        <div className="bg-white rounded-2xl border border-sand shadow-sm p-5 mb-10">
          <div className="flex flex-col md:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-earth" />
              <input type="text" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search tours, destinations…" className="w-full pl-10 pr-4 py-2.5 border border-sand rounded-xl text-sm text-bark placeholder-earth/60 focus:outline-none focus:border-savanna transition-colors" />
              {query && <button onClick={() => setQuery("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-earth hover:text-bark"><X className="w-4 h-4" /></button>}
            </div>
            <select value={dest} onChange={(e) => setDest(e.target.value as Destination)} className="border border-sand rounded-xl px-4 py-2.5 text-sm text-bark focus:outline-none focus:border-savanna transition-colors bg-white md:w-44">
              {DEST_OPTIONS.map((d) => <option key={d} value={d}>{d === "All" ? "All Destinations" : d}</option>)}
            </select>
            <select value={dur} onChange={(e) => setDur(e.target.value as Duration)} className="border border-sand rounded-xl px-4 py-2.5 text-sm text-bark focus:outline-none focus:border-savanna transition-colors bg-white md:w-44">
              {DUR_OPTIONS.map((d) => <option key={d.value} value={d.value}>{d.label}</option>)}
            </select>
            <div className="flex rounded-xl border border-sand overflow-hidden flex-shrink-0">
              {(["USD", "KSH"] as const).map((c) => (
                <button key={c} onClick={() => setCurrency(c)} className={`px-4 py-2.5 text-sm font-semibold transition-colors ${currency === c ? "bg-savanna text-white" : "bg-white text-earth hover:bg-sand/50"}`}>{c}</button>
              ))}
            </div>
          </div>
          {hasFilters && (
            <div className="flex items-center gap-3 mt-3 pt-3 border-t border-sand">
              <span className="text-xs text-earth">Showing <span className="font-semibold text-bark">{filtered.length}</span> of {tours.length} tours</span>
              <button onClick={clearFilters} className="text-xs text-savanna hover:text-savanna-dark font-semibold flex items-center gap-1"><X className="w-3 h-3" /> Clear filters</button>
            </div>
          )}
        </div>

        {!hasFilters && tours.length > 0 && (
          <p className="text-earth text-sm mb-6">Showing all <span className="font-semibold text-bark">{tours.length} safari packages</span></p>
        )}

        {filtered.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {filtered.map((tour) => <TourCard key={tour.id} tour={tour} />)}
          </div>
        ) : (
          <div className="text-center py-24">
            <div className="text-5xl mb-4">🔍</div>
            <h3 className="font-serif text-xl font-bold text-bark mb-2">No tours match your search</h3>
            <p className="text-earth text-sm mb-6">Try adjusting your filters or search term.</p>
            <button onClick={clearFilters} className="bg-savanna hover:bg-savanna-dark text-white font-semibold px-6 py-2.5 rounded-full text-sm transition-colors">Clear All Filters</button>
          </div>
        )}

        <div className="mt-16 bg-forest rounded-2xl p-10 text-center">
          <span className="text-savanna text-sm font-semibold uppercase tracking-widest">Can&apos;t Find What You&apos;re Looking For?</span>
          <h3 className="font-serif text-2xl sm:text-3xl font-bold text-cream mt-3 mb-3">We Build Custom Safaris</h3>
          <p className="text-cream/60 max-w-xl mx-auto mb-8 leading-relaxed">Tell us your dates, budget, and dream destinations. Our team will design a bespoke itinerary just for you — at no extra charge.</p>
          <Link href="/contact" className="bg-savanna hover:bg-savanna-dark text-white font-semibold px-8 py-3.5 rounded-full text-base transition-colors inline-block">Request a Custom Package</Link>
        </div>
      </div>
    </section>
  );
}
