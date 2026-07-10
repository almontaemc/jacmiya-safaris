"use client";

import { useEffect, useState } from "react";
import { getReviews } from "@/lib/adminStore";
import type { Review } from "@/types/admin";

const STATIC_FALLBACK = [
  { id: "s1", clientName: "Sarah M.", clientCountry: "United Kingdom", tourTitle: "Kenya Safari", rating: 5 as const, body: "Jacmiya Safaris exceeded every expectation. The guides were incredibly knowledgeable and passionate about wildlife. Seeing the Great Migration was a life-changing experience!", travelDate: "2026-03", approved: true, featured: true, createdAt: "" },
  { id: "s2", clientName: "James & Linda K.", clientCountry: "United States", tourTitle: "Tanzania Safari", rating: 5 as const, body: "Impeccable organisation and attention to detail. The accommodations were luxurious, the transport was comfortable, and the price was unbeatable compared to other operators.", travelDate: "2026-02", approved: true, featured: true, createdAt: "" },
  { id: "s3", clientName: "Amara N.", clientCountry: "Nairobi, Kenya", tourTitle: "Rwanda Gorilla Trek", rating: 5 as const, body: "As a local, I was skeptical — but Jacmiya showed me corners of East Africa I'd never seen. The Rwanda gorilla trek was the highlight of my life. Absolutely world-class.", travelDate: "2026-01", approved: true, featured: true, createdAt: "" },
];

function Stars({ rating }: { rating: number }) {
  return (
    <div className="flex gap-0.5 mb-4">
      {[1, 2, 3, 4, 5].map((s) => (
        <span key={s} className={`text-lg ${s <= rating ? "text-savanna" : "text-gray-200"}`}>★</span>
      ))}
    </div>
  );
}

export default function TestimonialsSection() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const approved = getReviews().filter((r) => r.approved);
    if (approved.length > 0) {
      // featured first, then any approved, up to 3
      const featured = approved.filter((r) => r.featured);
      const rest = approved.filter((r) => !r.featured);
      setReviews([...featured, ...rest].slice(0, 3));
    }
  }, []);

  const display: (Review | typeof STATIC_FALLBACK[0])[] =
    mounted && reviews.length > 0 ? reviews : STATIC_FALLBACK;

  return (
    <section className="py-24 px-4 bg-cream">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-14">
          <span className="text-savanna text-sm font-semibold uppercase tracking-widest">Traveler Stories</span>
          <h2 className="font-serif text-3xl sm:text-4xl font-bold text-bark mt-2">What Our Guests Say</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {display.map((r) => (
            <div key={r.id} className="bg-white rounded-2xl p-7 shadow-sm border border-sand flex flex-col">
              <Stars rating={r.rating} />
              <p className="text-earth text-sm leading-relaxed mb-6 italic flex-1">&ldquo;{r.body}&rdquo;</p>
              <div className="border-t border-sand pt-4">
                <div className="font-semibold text-bark text-sm">{r.clientName}</div>
                <div className="text-earth text-xs mt-0.5">{r.clientCountry}</div>
                {r.tourTitle && <div className="text-earth/60 text-xs mt-0.5">{r.tourTitle}</div>}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
