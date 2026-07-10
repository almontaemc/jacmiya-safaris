"use client";

import { use, useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Users, Clock, MapPin, Check } from "lucide-react";
import { getTours } from "@/lib/adminStore";
import type { AdminTour } from "@/types/admin";
import { useCurrency, formatPrice } from "@/context/CurrencyContext";

export default function TourDetail({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [tour, setTour] = useState<AdminTour | null>(null);
  const [mounted, setMounted] = useState(false);
  const [activeTab, setActiveTab] = useState<"overview" | "itinerary">("overview");
  const { currency, setCurrency } = useCurrency();

  useEffect(() => {
    setMounted(true);
    const found = getTours().find((t) => t.id === Number(id));
    setTour(found ?? null);
  }, [id]);

  if (!mounted) return <div className="min-h-screen bg-cream" />;

  if (!tour) {
    return (
      <div className="min-h-screen bg-cream flex items-center justify-center text-center p-8">
        <div>
          <div className="text-6xl mb-4">🔍</div>
          <h1 className="font-serif text-2xl font-bold text-bark mb-2">Tour Not Found</h1>
          <p className="text-earth mb-6">This tour may have been removed or the link is incorrect.</p>
          <Link href="/tours" className="bg-savanna hover:bg-savanna-dark text-white font-semibold px-6 py-3 rounded-full transition-colors">Browse All Tours</Link>
        </div>
      </div>
    );
  }

  const enquiryUrl = `/contact?tour=${encodeURIComponent(tour.title)}`;

  return (
    <>
      {/* ── Hero ── */}
      <section className="relative h-[65vh] min-h-[420px] bg-bark overflow-hidden">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={tour.image} alt={tour.title} className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-bark/95 via-bark/50 to-bark/10" />
        <div className="absolute bottom-0 left-0 right-0 px-4 pb-10 pt-8">
          <div className="max-w-5xl mx-auto">
            <Link href="/tours" className="inline-flex items-center gap-2 text-cream/60 hover:text-cream text-sm mb-5 transition-colors">
              <ArrowLeft className="w-4 h-4" /> Back to All Tours
            </Link>
            <div className="flex flex-wrap gap-2 mb-3">
              <span className={`${tour.badgeColor} text-white text-xs font-semibold px-3 py-1 rounded-full`}>{tour.badge}</span>
              <span className="bg-white/20 backdrop-blur-sm text-white text-xs font-semibold px-3 py-1 rounded-full">{tour.destination}</span>
            </div>
            <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold text-cream leading-tight max-w-3xl mb-4">{tour.title}</h1>
            <div className="flex flex-wrap gap-5 text-cream/70 text-sm">
              <span className="flex items-center gap-2"><Clock className="w-4 h-4 text-savanna" />{tour.duration}</span>
              <span className="flex items-center gap-2"><Users className="w-4 h-4 text-savanna" />{tour.groupSize}</span>
              <span className="flex items-center gap-2"><MapPin className="w-4 h-4 text-savanna" />{tour.destination}, East Africa</span>
            </div>
          </div>
        </div>
      </section>

      {/* ── Main Content ── */}
      <section className="py-12 px-4 bg-cream">
        <div className="max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">

          {/* ── Left: tabs + content ── */}
          <div className="lg:col-span-2">
            {/* Tabs */}
            <div className="flex border-b border-sand mb-8">
              {(["overview", "itinerary"] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-5 py-3 text-sm font-semibold capitalize transition-colors border-b-2 -mb-px ${activeTab === tab ? "border-savanna text-savanna" : "border-transparent text-earth hover:text-bark"}`}
                >
                  {tab === "itinerary" ? `Itinerary (${tour.itinerary?.length ?? 0} days)` : "Overview"}
                </button>
              ))}
            </div>

            {activeTab === "overview" ? (
              <div className="space-y-8">
                {tour.description && (
                  <div>
                    <h2 className="font-serif text-xl font-bold text-bark mb-3">About This Tour</h2>
                    <p className="text-earth leading-relaxed">{tour.description}</p>
                  </div>
                )}

                <div>
                  <h2 className="font-serif text-xl font-bold text-bark mb-4">Tour Highlights</h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {tour.highlights.map((h) => (
                      <div key={h} className="flex items-start gap-3 bg-white rounded-xl p-3 border border-sand">
                        <Check className="w-4 h-4 text-savanna mt-0.5 flex-shrink-0" />
                        <span className="text-earth text-sm">{h}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h2 className="font-serif text-xl font-bold text-bark mb-4">What&apos;s Included</h2>
                  <div className="flex flex-wrap gap-2">
                    {tour.includes.map((item) => (
                      <span key={item} className="bg-forest/10 text-forest text-sm px-3 py-1.5 rounded-full border border-forest/20">{item}</span>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <div>
                <h2 className="font-serif text-xl font-bold text-bark mb-6">Day-by-Day Itinerary</h2>
                {tour.itinerary && tour.itinerary.length > 0 ? (
                  <div className="relative">
                    <div className="absolute left-5 top-5 bottom-5 w-px bg-sand" />
                    <div className="space-y-4">
                      {tour.itinerary.map((day) => (
                        <div key={day.day} className="flex gap-5">
                          <div className="flex-shrink-0 z-10">
                            <div className="w-10 h-10 bg-savanna rounded-full flex items-center justify-center text-white font-bold text-sm shadow-sm">{day.day}</div>
                          </div>
                          <div className="bg-white rounded-2xl p-5 border border-sand flex-1 shadow-sm">
                            <h3 className="font-semibold text-bark mb-2 leading-snug">Day {day.day}: {day.title}</h3>
                            <p className="text-earth text-sm leading-relaxed mb-3">{day.description}</p>
                            {(day.meals || day.accommodation) && (
                              <div className="flex flex-wrap gap-4 text-xs pt-3 border-t border-sand">
                                {day.meals && (
                                  <span className="flex items-center gap-1.5 text-bark/70">
                                    <span className="text-base">🍽️</span>
                                    <span><span className="font-medium">Meals:</span> {day.meals}</span>
                                  </span>
                                )}
                                {day.accommodation && (
                                  <span className="flex items-center gap-1.5 text-bark/70">
                                    <span className="text-base">🏕️</span>
                                    <span><span className="font-medium">Stay:</span> {day.accommodation}</span>
                                  </span>
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="bg-sand/40 rounded-2xl p-8 text-center">
                    <p className="text-earth mb-4">Detailed itinerary available on request.</p>
                    <Link href={enquiryUrl} className="text-savanna font-semibold hover:underline">Contact us for the full day-by-day breakdown →</Link>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* ── Right: booking card ── */}
          <div className="lg:col-span-1">
            <div className="sticky top-32 space-y-4">
              {/* Price + Book card */}
              <div className="bg-white rounded-2xl border border-sand shadow-sm p-6">
                <div className="flex items-start justify-between mb-1">
                  <div>
                    <span className="text-xs text-earth uppercase tracking-wide">From</span>
                    <div className="text-savanna font-bold text-3xl leading-tight">{formatPrice(tour.priceksh, tour.priceusd, currency)}</div>
                    <span className="text-earth text-xs">per person</span>
                  </div>
                  <div className="flex rounded-xl border border-sand overflow-hidden text-xs mt-1">
                    {(["USD", "KSH"] as const).map((c) => (
                      <button key={c} onClick={() => setCurrency(c)} className={`px-3 py-1.5 font-semibold transition-colors ${currency === c ? "bg-savanna text-white" : "bg-white text-earth hover:bg-sand/50"}`}>{c}</button>
                    ))}
                  </div>
                </div>
                <div className="text-xs text-gray-400 mb-4">
                  {currency === "USD"
                    ? `≈ KSH ${tour.priceksh.toLocaleString()}`
                    : `≈ USD ${tour.priceusd.toLocaleString()}`}
                </div>
                <Link href={enquiryUrl} className="w-full block bg-savanna hover:bg-savanna-dark text-white font-semibold py-3.5 rounded-xl text-center text-sm transition-colors shadow-sm mb-3">
                  Enquire / Book Now
                </Link>
                <a href="tel:+254116482995" className="w-full block border border-forest text-forest hover:bg-forest hover:text-cream font-semibold py-3 rounded-xl text-center text-sm transition-colors">
                  📞 Call Us: +254 116 482 995
                </a>
              </div>

              {/* Quick info */}
              <div className="bg-white rounded-2xl border border-sand shadow-sm p-6">
                <h3 className="font-semibold text-bark text-sm mb-4 pb-2 border-b border-sand">Quick Info</h3>
                {[
                  { label: "Destination", value: tour.destination, icon: "🌍" },
                  { label: "Duration", value: tour.duration, icon: "⏱️" },
                  { label: "Group Size", value: tour.groupSize, icon: "👥" },
                  { label: "Tour Type", value: tour.badge, icon: "🏷️" },
                ].map(({ label, value, icon }) => (
                  <div key={label} className="flex items-center justify-between text-sm py-2 border-b border-sand/50 last:border-0">
                    <span className="text-earth">{icon} {label}</span>
                    <span className="font-medium text-bark">{value}</span>
                  </div>
                ))}
              </div>

              {/* Price match */}
              <div className="bg-forest/10 rounded-2xl border border-forest/20 p-5 text-center">
                <div className="text-2xl mb-1">🏷️</div>
                <p className="text-forest font-semibold text-sm mb-1">Price-Match Guarantee</p>
                <p className="text-bark/60 text-xs leading-relaxed">Found it cheaper? We&apos;ll match any quote within 48 hours.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="py-16 px-4 bg-forest text-center">
        <div className="max-w-xl mx-auto">
          <span className="text-savanna text-sm font-semibold uppercase tracking-widest">Your Adventure Awaits</span>
          <h2 className="font-serif text-2xl sm:text-3xl font-bold text-cream mt-2 mb-3">Ready to Book This Tour?</h2>
          <p className="text-cream/60 mb-6 leading-relaxed">Our safari experts will respond within 24 hours with availability and a confirmed quote.</p>
          <Link href={enquiryUrl} className="bg-savanna hover:bg-savanna-dark text-white font-semibold px-8 py-3.5 rounded-full text-base transition-colors inline-block shadow-lg shadow-savanna/20">
            Request a Quote →
          </Link>
        </div>
      </section>
    </>
  );
}
