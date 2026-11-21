/* eslint-disable @next/next/no-img-element */

// TODO(client): confirm these are lodges Jacmiya actually works with before publishing.
// Starting list copied from the Sidai Trails site; edit names, links and logos here.
export const LODGE_PARTNERS = [
  { name: "Sopa Lodges", url: "https://www.sopalodges.com", logo: "/images/partners/sopa-lodges.png" },
  { name: "Soroi Collection", url: "https://soroi.com", logo: "/images/partners/soroi-collection.webp" },
  { name: "Sentrim Hotels & Lodges", url: "https://www.sentrim-hotels.com", logo: "/images/partners/sentrim-hotels-lodges.svg" },
  { name: "Enashipai Resort & Spa", url: "https://www.enashipai.com", logo: "/images/partners/enashipai-resort-spa.jpg" },
  { name: "The Wilder Group", url: "https://www.wilder-group.com", logo: "/images/partners/wilder-group.svg" },
  { name: "Elewana Collection", url: "https://www.elewanacollection.com", logo: "/images/partners/elewana-collection.png" },
];

/** "Preferred lodge partners" logo grid (two rows of three on large screens), each logo on a white tile. */
export default function LodgePartners({ className = "" }: { className?: string }) {
  return (
    <section className={`py-24 px-4 ${className}`} aria-label="Our preferred lodge partners">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <span className="text-savanna text-sm font-semibold uppercase tracking-widest">Where You&apos;ll Stay</span>
          <h2 className="font-serif text-3xl sm:text-4xl font-bold text-bark mt-2 mb-3">Our Preferred Lodge Partners</h2>
          <p className="text-earth max-w-xl mx-auto">
            Trusted lodges and camps we work with across East Africa, chosen for their comfort, warm service and care for the places they call home.
          </p>
        </div>
        <ul className="mx-auto grid max-w-4xl grid-cols-2 gap-4 sm:gap-6 lg:grid-cols-3">
          {LODGE_PARTNERS.map((p) => (
            <li key={p.name}>
              <a
                href={p.url}
                target="_blank"
                rel="noopener"
                className="flex h-36 sm:h-40 items-center justify-center rounded-xl border border-sand bg-white p-5 transition hover:-translate-y-0.5 hover:border-savanna/50 hover:shadow-md"
              >
                <img src={p.logo} alt={`${p.name} logo`} loading="lazy" className="max-h-20 max-w-full w-auto h-auto object-contain" />
                <span className="sr-only">{p.name} (opens in a new tab)</span>
              </a>
              <p className="mt-2 text-center text-sm text-earth">{p.name}</p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
