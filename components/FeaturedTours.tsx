"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useCurrency, formatPrice } from "@/context/CurrencyContext";
import { getTours } from "@/lib/adminStore";
import type { AdminTour } from "@/types/admin";

export default function FeaturedTours() {
  const { currency, setCurrency } = useCurrency();
  const [featured, setFeatured] = useState<AdminTour[]>([]);

  useEffect(() => {
    const active = getTours().filter((t) => t.active);
    // Show first 4 active tours
    setFeatured(active.slice(0, 4));
  }, []);

  return (
    <section className="py-24 px-4 bg-forest">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-14">
          <div>
            <span className="text-savanna text-sm font-semibold uppercase tracking-widest">Hand-Picked</span>
            <h2 className="font-serif text-3xl sm:text-4xl font-bold text-cream mt-2">Popular Safari Packages</h2>
            <p className="text-cream/60 mt-2 max-w-md">Curated tours for every type of traveler — from budget adventures to luxury expeditions.</p>
          </div>
          <div className="flex rounded-xl border border-white/20 overflow-hidden flex-shrink-0 self-start sm:self-auto">
            {(["USD", "KSH"] as const).map((c) => (
              <button key={c} onClick={() => setCurrency(c)} className={`px-5 py-2 text-sm font-semibold transition-colors ${currency === c ? "bg-savanna text-white" : "bg-transparent text-cream/60 hover:text-cream hover:bg-white/10"}`}>{c}</button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {featured.map((t) => (
            <Link
              key={t.id}
              href={`/tours/${t.id}`}
              className="bg-forest-dark/60 border border-white/10 rounded-2xl overflow-hidden hover:border-savanna/40 transition-all hover:-translate-y-1 flex flex-col group"
            >
              <div className="relative h-48 flex-shrink-0">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={t.image} alt={t.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                <div className="absolute top-3 left-3">
                  <span className="bg-savanna text-white text-xs font-semibold px-3 py-1 rounded-full">{t.destination}</span>
                </div>
              </div>
              <div className="p-5 flex flex-col flex-1">
                <h3 className="font-serif text-cream font-bold mb-1 leading-tight text-sm flex-1">{t.title}</h3>
                <p className="text-cream/50 text-xs mb-3">{t.duration}</p>
                <div className="flex items-center justify-between mt-auto">
                  <div>
                    <div className="text-savanna font-bold text-sm">{formatPrice(t.priceksh, t.priceusd, currency)}</div>
                    <div className="text-cream/40 text-xs">per person</div>
                  </div>
                  <span className="bg-savanna/20 group-hover:bg-savanna text-savanna group-hover:text-white text-xs font-semibold px-3 py-1.5 rounded-full transition-colors">
                    Details →
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>

        <div className="text-center mt-10">
          <Link href="/tours" className="text-savanna hover:text-cream font-semibold text-sm transition-colors border-b border-savanna hover:border-cream pb-0.5">
            View All Packages →
          </Link>
        </div>
      </div>
    </section>
  );
}
