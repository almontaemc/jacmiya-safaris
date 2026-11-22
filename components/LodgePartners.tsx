/* eslint-disable @next/next/no-img-element */

// Lodges Jacmiya has issued booking vouchers to (admin vouchers, Oct–Nov 2026) that have an
// official website and logo. Edit names, links and logos here; logo files live in /public/images/partners.
export const LODGE_PARTNERS = [
  { name: "Enkorok Mara Camp", url: "https://enkorokmaracamp.com", logo: "/images/partners/enkorok-mara-camp.svg" },
  { name: "Saruni Basecamp", url: "https://sarunibasecamp.com", logo: "/images/partners/saruni-basecamp.png" },
  { name: "Zebra Plains Collection", url: "https://zebraplainscollection.com", logo: "/images/partners/zebra-plains-collection.png" },
  { name: "Lake Nakuru Lodge", url: "https://lakenakurulodge.com", logo: "/images/partners/lake-nakuru-lodge.png" },
  { name: "Ziwa Bush Lodge", url: "https://www.ziwalodge.com", logo: "/images/partners/ziwa-bush-lodge.jpg" },
  { name: "Serena Hotels", url: "https://www.serenahotels.com", logo: "/images/partners/serena-hotels.svg" },
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
