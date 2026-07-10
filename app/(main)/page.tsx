import Link from "next/link";
import FeaturedTours from "@/components/FeaturedTours";
import TestimonialsSection from "@/components/TestimonialsSection";
import HeroSlider from "@/components/HeroSlider";

const stats = [
  { value: "70+", label: "Destinations" },
  { value: "10+", label: "Years Experience" },
  { value: "500+", label: "Happy Travelers" },
  { value: "40%", label: "Summer Deals" },
];

const destinations = [
  { name: "Tanzania", country: "East Africa", tagline: "Serengeti, Ngorongoro & Zanzibar", image: "/images/tanzania-sm.jpg" },
  { name: "Kenya", country: "East Africa", tagline: "Masai Mara, Amboseli & Diani Beach", image: "/images/kenya.jpg" },
  { name: "Rwanda", country: "Central Africa", tagline: "Gorilla Trekking & Volcanoes NP", image: "/images/rwanda.jpg" },
];

const reasons = [
  { icon: "🌍", title: "Expert Local Guides", body: "Our guides are born and raised in East Africa — deeply knowledgeable about wildlife, culture, and the best hidden spots." },
  { icon: "💰", title: "Price Match Guarantee", body: "Find the same safari cheaper elsewhere? We'll match it within 48 hours of your booking. No questions asked." },
  { icon: "🦁", title: "70+ Destinations", body: "From the Serengeti to Zanzibar, we cover the full breadth of East Africa's most breathtaking landscapes." },
  { icon: "📞", title: "24/7 Support", body: "Our dedicated team is always reachable — before, during, and after your journey. You're never on your own." },
];

export default function Home() {
  return (
    <>
      <HeroSlider />

      <section className="bg-forest py-8 px-4">
        <div className="max-w-5xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
          {stats.map((s) => (
            <div key={s.label}>
              <div className="text-3xl font-bold text-savanna mb-1">{s.value}</div>
              <div className="text-cream/60 text-sm">{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      <section className="py-24 px-4 bg-cream">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-14">
            <span className="text-savanna text-sm font-semibold uppercase tracking-widest">Where We Go</span>
            <h2 className="font-serif text-3xl sm:text-4xl font-bold text-bark mt-2 mb-3">Our Featured Destinations</h2>
            <p className="text-earth max-w-xl mx-auto">Three of Africa&apos;s most spectacular wildlife destinations, curated for the discerning explorer.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {destinations.map((d) => (
              <Link href="/destinations" key={d.name} className="relative h-80 rounded-2xl overflow-hidden group block">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={d.image} alt={d.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                <div className="absolute inset-0 bg-gradient-to-t from-bark/80 to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-6">
                  <div className="text-savanna text-xs font-semibold uppercase tracking-widest mb-1">{d.country}</div>
                  <h3 className="font-serif text-cream text-2xl font-bold mb-1">{d.name}</h3>
                  <p className="text-cream/70 text-sm">{d.tagline}</p>
                </div>
              </Link>
            ))}
          </div>
          <div className="text-center mt-10">
            <Link href="/destinations" className="text-forest hover:text-savanna font-semibold text-sm transition-colors border-b border-forest hover:border-savanna pb-0.5">View All Destinations →</Link>
          </div>
        </div>
      </section>

      <FeaturedTours />

      <section className="py-24 px-4 bg-sand">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-14">
            <span className="text-savanna text-sm font-semibold uppercase tracking-widest">Our Promise</span>
            <h2 className="font-serif text-3xl sm:text-4xl font-bold text-bark mt-2">Why Travel With Jacmiya</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {reasons.map((r) => (
              <div key={r.title} className="bg-cream rounded-2xl p-6 shadow-sm">
                <div className="w-12 h-12 bg-forest/10 rounded-xl flex items-center justify-center mb-4 text-2xl">{r.icon}</div>
                <h3 className="font-serif font-bold text-bark mb-2">{r.title}</h3>
                <p className="text-earth text-sm leading-relaxed">{r.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <TestimonialsSection />

      <section className="relative py-28 px-4 overflow-hidden" style={{ backgroundImage: "url('/images/serengeti.jpg')", backgroundSize: "cover", backgroundPosition: "center" }}>
        <div className="absolute inset-0 bg-bark/75" />
        <div className="relative z-10 max-w-2xl mx-auto text-center">
          <span className="inline-block text-savanna text-sm font-semibold uppercase tracking-widest mb-4">Your Adventure Awaits</span>
          <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold text-cream mb-4 leading-tight">Ready for Your Safari?</h2>
          <p className="text-cream/70 mb-10 text-lg leading-relaxed">Tell us your dream destination and budget. We&apos;ll craft a bespoke safari experience just for you — with zero hidden fees.</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/contact" className="bg-savanna hover:bg-savanna-dark text-white font-semibold px-10 py-4 rounded-full text-lg transition-colors shadow-lg shadow-savanna/20 inline-block">Start Planning Today</Link>
            <a href="tel:+254116482995" className="border border-cream/40 hover:border-cream text-cream font-semibold px-10 py-4 rounded-full text-lg transition-colors inline-block">Call Us Now</a>
          </div>
        </div>
      </section>
    </>
  );
}
