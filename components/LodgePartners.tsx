/* eslint-disable @next/next/no-img-element */
import Link from "next/link";

// Client-approved list (Nov 2026). Logos are display-only (no outbound links, per client). Files live in /public/images/partners.
export const LODGE_PARTNERS = [
  { name: "Serena Hotels", logo: "/images/partners/serena-hotels.svg" },
  { name: "Sarova Hotels & Resorts", logo: "/images/partners/sarova-hotels.svg" },
  { name: "Elewana Collection", logo: "/images/partners/elewana-collection.png" },
  { name: "Saruni Basecamp", logo: "/images/partners/saruni-basecamp.png" },
  { name: "Kicheche Safari Camps", logo: "/images/partners/kicheche-safari-camps.png" },
  { name: "Sopa Lodges", logo: "/images/partners/sopa-lodges.png" },
  { name: "Soroi Collection", logo: "/images/partners/soroi-collection.webp" },
  { name: "The Wilder Group", logo: "/images/partners/wilder-group.svg" },
  { name: "Enashipai Resort & Spa", logo: "/images/partners/enashipai-resort-spa.jpg" },
];

/**
 * Lodge partners: copy on the left, one white "ledger" panel on the right with the logos
 * in a 3×3 grid split by hairlines (no separate cards, no captions).
 */
export default function LodgePartners({ className = "" }: { className?: string }) {
  return (
    <section className={`py-24 px-4 ${className}`} aria-labelledby="lodge-partners-title">
      <div className="max-w-7xl mx-auto grid gap-12 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:items-center">
        <div>
          <span className="text-savanna text-sm font-semibold uppercase tracking-widest">Where You&apos;ll Stay</span>
          <h2 id="lodge-partners-title" className="font-serif text-3xl sm:text-4xl font-bold text-bark mt-2 mb-5">
            Lodges &amp; camps we trust
          </h2>
          <div className="h-1 w-16 bg-savanna mb-6" aria-hidden="true" />
          <p className="text-earth leading-relaxed max-w-md">
            From classic Serena and Sarova lodges to intimate conservancy camps, we book the properties we know first-hand,
            matched to your budget, your pace and the wildlife you most want to see.
          </p>
          <p className="mt-6 font-serif text-5xl font-bold text-forest">
            {LODGE_PARTNERS.length}
            <span className="ml-3 align-middle font-sans text-sm font-semibold uppercase tracking-widest text-earth">
              partner collections
            </span>
          </p>
          <Link
            href="/contact"
            className="mt-8 inline-flex items-center gap-2 border-b-2 border-savanna pb-1 font-semibold text-bark transition hover:text-savanna"
          >
            Ask us about a lodge <span aria-hidden="true">→</span>
          </Link>
        </div>

        <ul className="grid grid-cols-3 overflow-hidden rounded-sm bg-white shadow-[0_20px_50px_-25px_rgba(26,16,8,0.35)] ring-1 ring-sand">
          {LODGE_PARTNERS.map((p, i) => (
            <li
              key={p.name}
              className={`${i % 3 !== 2 ? "border-r" : ""} ${i < 6 ? "border-b" : ""} border-sand/70`}
            >
              <div title={p.name} className="flex h-24 sm:h-32 lg:h-36 items-center justify-center p-3 sm:p-6">
                <img
                  src={p.logo}
                  alt={p.name}
                  loading="lazy"
                  className="max-h-12 sm:max-h-16 lg:max-h-20 max-w-full w-auto h-auto object-contain"
                />
              </div>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
