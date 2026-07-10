import Link from "next/link";
import type { Metadata } from "next";
import { Handshake, Leaf, Star, Heart, MapPin, Users, Award, Globe } from "lucide-react";

export const metadata: Metadata = {
  title: "About Us | Jacmiya Safaris & Holiday Tours",
  description:
    "Learn about Jacmiya Safaris — East Africa's trusted safari operator. Our story, mission, and commitment to unforgettable wildlife experiences.",
};

const values = [
  { icon: Handshake, title: "Integrity", body: "We operate with full transparency — no hidden fees, no surprise costs. What we quote is what you pay." },
  { icon: Leaf, title: "Sustainability", body: "We partner with eco-conscious lodges and support local conservation programs to protect the wildlife we celebrate." },
  { icon: Star, title: "Excellence", body: "From first enquiry to last goodbye, every touchpoint is crafted to exceed expectations." },
  { icon: Heart, title: "Passion", body: "We're not just selling tours — we're sharing a love for Africa that's been with us since day one." },
];

const milestones = [
  { year: "2021", event: "Founded in Nairobi with a single vehicle and a big dream." },
  { year: "2016", event: "Expanded to Tanzania — first Serengeti migration tour sold out in days." },
  { year: "2019", event: "Launched Rwanda gorilla trekking packages after years of local partnership." },
  { year: "2022", event: "Crossed 500 happy travelers milestone and launched our price-match guarantee." },
  { year: "2026", event: "Now operating across 70+ destinations with a fully revamped digital experience." },
];

const teamStats = [
  { icon: Users, stat: "20+", label: "Expert Guides" },
  { icon: MapPin, stat: "70+", label: "Destinations" },
  { icon: Award, stat: "500+", label: "Happy Travelers" },
  { icon: Globe, stat: "3", label: "Countries" },
];

export default function About() {
  return (
    <>
      <section
        className="relative py-32 px-4 text-center bg-bark overflow-hidden"
        style={{ backgroundImage: "url('/images/tanzania.jpg')", backgroundSize: "cover", backgroundPosition: "center 30%" }}
      >
        <div className="absolute inset-0 bg-bark/75" />
        <div className="relative z-10 max-w-3xl mx-auto">
          <span className="inline-block text-savanna text-sm font-semibold uppercase tracking-widest mb-4">Our Story</span>
          <h1 className="font-serif text-4xl sm:text-5xl lg:text-6xl font-bold text-cream mb-4 leading-tight">More Than a Safari Company</h1>
          <p className="text-cream/70 text-lg max-w-xl mx-auto leading-relaxed">We are storytellers, conservationists, and passionate guides — united by one belief: Africa deserves to be experienced, not just seen.</p>
        </div>
      </section>

      <section className="py-24 px-4 bg-cream">
        <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <div>
            <span className="text-savanna text-sm font-semibold uppercase tracking-widest">Who We Are</span>
            <h2 className="font-serif text-3xl sm:text-4xl font-bold text-bark mt-2 mb-6 leading-tight">Born From a Love of the Wild</h2>
            <div className="space-y-4 text-earth leading-relaxed">
              <p>Jacmiya Safaris was founded in 2021 in Nairobi with the belief that every traveler deserves a deeply personal, expertly guided encounter with East Africa&apos;s natural world.</p>
              <p>What began as one vehicle and a notebook full of dream itineraries has grown into one of Kenya&apos;s most trusted safari operators — with a portfolio spanning 70+ destinations across Kenya, Tanzania, and Rwanda.</p>
              <p>We combine deep local knowledge with world-class hospitality. Every guide on our team is a trained naturalist and a genuine storyteller. We don&apos;t just show you the Big Five — we help you understand the ecosystems, the communities, and the conservation battles that shape the Africa you&apos;re visiting.</p>
            </div>
            <div className="mt-8 flex gap-4">
              <Link href="/tours" className="bg-savanna hover:bg-savanna-dark text-white font-semibold px-6 py-3 rounded-full text-sm transition-colors">Browse Our Tours</Link>
              <Link href="/contact" className="border border-forest text-forest hover:bg-forest hover:text-cream font-semibold px-6 py-3 rounded-full text-sm transition-colors">Talk to Us</Link>
            </div>
          </div>
          <div className="relative">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/images/tanzania-sm.jpg" alt="Safari landscape" className="rounded-2xl w-full h-96 object-cover shadow-xl" />
            <div className="absolute -bottom-6 -left-6 bg-forest rounded-2xl p-5 shadow-xl hidden sm:block">
              <div className="text-savanna text-3xl font-bold">5+</div>
              <div className="text-cream text-sm mt-0.5">Years in Business</div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-24 px-4 bg-forest">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-14">
            <span className="text-savanna text-sm font-semibold uppercase tracking-widest">Our Journey</span>
            <h2 className="font-serif text-3xl sm:text-4xl font-bold text-cream mt-2">Our Journey So Far</h2>
          </div>
          <div className="relative">
            <div className="absolute left-6 top-0 bottom-0 w-px bg-white/20" />
            <div className="space-y-8">
              {milestones.map((m) => (
                <div key={m.year} className="flex gap-6 items-start pl-2">
                  <div className="relative flex-shrink-0">
                    <div className="w-10 h-10 rounded-full bg-savanna flex items-center justify-center text-white font-bold text-xs z-10 relative">{m.year.slice(2)}</div>
                  </div>
                  <div className="pt-1.5">
                    <div className="text-savanna font-bold text-sm mb-1">{m.year}</div>
                    <p className="text-cream/70 text-sm leading-relaxed">{m.event}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="py-24 px-4 bg-sand">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-14">
            <span className="text-savanna text-sm font-semibold uppercase tracking-widest">What Drives Us</span>
            <h2 className="font-serif text-3xl sm:text-4xl font-bold text-bark mt-2">Our Core Values</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {values.map((v) => (
              <div key={v.title} className="bg-cream rounded-2xl p-7 shadow-sm text-center">
                <div className="w-14 h-14 rounded-2xl bg-forest/10 flex items-center justify-center mx-auto mb-4">
                  <v.icon className="w-7 h-7 text-forest" strokeWidth={1.5} />
                </div>
                <h3 className="font-serif font-bold text-bark mb-2 text-lg">{v.title}</h3>
                <p className="text-earth text-sm leading-relaxed">{v.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Team section — generalized */}
      <section className="py-24 px-4 bg-cream">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-14">
            <span className="text-savanna text-sm font-semibold uppercase tracking-widest">The Humans Behind the Magic</span>
            <h2 className="font-serif text-3xl sm:text-4xl font-bold text-bark mt-2">Our Team</h2>
            <p className="text-earth mt-4 max-w-2xl mx-auto leading-relaxed">
              Behind every unforgettable safari is a passionate team of Nairobi-based guides, operations specialists, and guest experience managers who live and breathe East Africa. Our crew brings decades of combined field expertise, from the Maasai Mara to the slopes of Kilimanjaro.
            </p>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
            {teamStats.map((t) => (
              <div key={t.label} className="bg-sand rounded-2xl p-6 text-center shadow-sm">
                <div className="w-12 h-12 rounded-xl bg-forest/10 flex items-center justify-center mx-auto mb-3">
                  <t.icon className="w-6 h-6 text-forest" strokeWidth={1.5} />
                </div>
                <div className="text-2xl font-bold text-bark">{t.stat}</div>
                <div className="text-earth text-sm mt-0.5">{t.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* SafariBookings partnership */}
      <section className="py-20 px-4 bg-forest/5 border-y border-forest/10">
        <div className="max-w-5xl mx-auto">
          <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-10 flex flex-col lg:flex-row items-center gap-10">
            <div className="flex-shrink-0 w-20 h-20 rounded-2xl bg-[#ff6600]/10 flex items-center justify-center">
              <Globe className="w-10 h-10 text-[#ff6600]" strokeWidth={1.5} />
            </div>
            <div className="flex-1 text-center lg:text-left">
              <span className="inline-block text-[#ff6600] text-xs font-bold uppercase tracking-widest mb-2">Verified Partner</span>
              <h2 className="font-serif text-2xl sm:text-3xl font-bold text-bark mb-3">Proud Partner of SafariBookings</h2>
              <p className="text-earth leading-relaxed mb-5">
                Jacmiya Safaris is a verified operator on <strong>SafariBookings</strong> — the world&apos;s largest online marketplace for African safari tours. Our partnership means independent expert reviews, transparent pricing, and added trust for every traveler.
              </p>
              <a
                href="https://www.safaribookings.com/p7940"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 bg-[#ff6600] hover:bg-[#e55a00] text-white font-semibold px-6 py-3 rounded-full text-sm transition-colors shadow-md"
              >
                <Globe className="w-4 h-4" />
                View Us on SafariBookings
              </a>
            </div>
          </div>
        </div>
      </section>

      <section className="py-20 px-4 bg-forest text-center">
        <div className="max-w-2xl mx-auto">
          <h2 className="font-serif text-3xl sm:text-4xl font-bold text-cream mb-4">Ready to Explore With Us?</h2>
          <p className="text-cream/60 mb-8 text-lg leading-relaxed">Get in touch and let&apos;s design your perfect East African adventure together.</p>
          <Link href="/contact" className="bg-savanna hover:bg-savanna-dark text-white font-semibold px-10 py-4 rounded-full text-lg transition-colors inline-block shadow-lg shadow-savanna/20">Plan Your Safari</Link>
        </div>
      </section>
    </>
  );
}
