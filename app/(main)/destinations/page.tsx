import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Destinations | Jacmiya Safaris & Holiday Tours",
  description:
    "Explore East Africa's finest safari destinations — Kenya, Tanzania, and Rwanda. Wildlife, landscapes, culture, and beaches all in one region.",
};

const destinations = [
  {
    country: "Kenya",
    tagline: "The Home of the Safari",
    image: "/images/kenya.jpg",
    heroImage: "/images/wildlife-1.jpg",
    description: "Kenya is where the safari was born. From the iconic Masai Mara — where the Great Migration thunders across the Mara River — to the snow-capped peaks of Mount Kenya and the white sands of Diani Beach, this is a country of jaw-dropping contrasts.",
    highlights: [
      { name: "Masai Mara", detail: "Witness the Great Wildebeest Migration (July–Oct)" },
      { name: "Amboseli NP", detail: "Elephant herds against the backdrop of Kilimanjaro" },
      { name: "Tsavo East & West", detail: "Kenya's largest national park — raw and wild" },
      { name: "Diani Beach", detail: "Palm-fringed Indian Ocean beach, perfect post-safari" },
      { name: "Lake Nakuru", detail: "Flamingos and rhinos in the Great Rift Valley" },
      { name: "Nairobi", detail: "Africa's only national park inside a capital city" },
    ],
    bestTime: "July – October (Great Migration) | January – February (dry season)",
    travelTip: "Combine 4–5 days in Masai Mara with 2 days at Diani Beach for the ultimate Kenya experience.",
  },
  {
    country: "Tanzania",
    tagline: "The Land of Endless Plains",
    image: "/images/tanzania-sm.jpg",
    heroImage: "/images/tanzania.jpg",
    description: "Tanzania is home to the Serengeti — arguably the world's greatest wildlife spectacle. Add the Ngorongoro Crater (the world's largest inactive caldera), Tarangire's baobab forests, and the paradise island of Zanzibar, and you have a destination that rivals anywhere on earth.",
    highlights: [
      { name: "Serengeti NP", detail: "Year-round Big Five sightings and the Great Migration" },
      { name: "Ngorongoro Crater", detail: "Over 30,000 animals in a single caldera" },
      { name: "Tarangire NP", detail: "Enormous elephant herds and ancient baobab trees" },
      { name: "Zanzibar", detail: "Turquoise waters, Stone Town history, and spice farms" },
      { name: "Lake Manyara", detail: "Tree-climbing lions and vast flamingo flocks" },
      { name: "Ruaha NP", detail: "Off-the-beaten-path wilderness for serious safari-goers" },
    ],
    bestTime: "June – October (dry season) | January – February (calving season in Serengeti)",
    travelTip: "End any Tanzania safari with 3 nights in Zanzibar — the beaches and spice markets are unmissable.",
  },
  {
    country: "Rwanda",
    tagline: "The Land of a Thousand Hills",
    image: "/images/rwanda.jpg",
    heroImage: "/images/rwanda.jpg",
    description: "Rwanda is Africa's most extraordinary comeback story — a country that has transformed itself into one of the continent's cleanest, safest, and most remarkable destinations. The star attraction? Trekking through mist-shrouded volcanic forests to encounter mountain gorillas face to face.",
    highlights: [
      { name: "Volcanoes NP", detail: "The world's premier mountain gorilla trekking destination" },
      { name: "Nyungwe Forest", detail: "Chimpanzee tracking and stunning canopy walks" },
      { name: "Akagera NP", detail: "Rwanda's savanna — Big Five, hippos, and crocodiles" },
      { name: "Lake Kivu", detail: "Dramatic lakeside scenery and laid-back beach resorts" },
      { name: "Kigali City", detail: "Africa's cleanest, most walkable capital city" },
      { name: "Golden Monkey Trek", detail: "Playful, rare monkeys in the Virunga volcanoes" },
    ],
    bestTime: "June – September & December – February (dry seasons)",
    travelTip: "Book your gorilla permits well in advance — they sell out months ahead, especially in peak season.",
  },
];

export default function Destinations() {
  return (
    <>
      <section
        className="relative py-28 px-4 text-center bg-bark overflow-hidden"
        style={{ backgroundImage: "url('/images/tanzania.jpg')", backgroundSize: "cover", backgroundPosition: "center 40%" }}
      >
        <div className="absolute inset-0 bg-bark/75" />
        <div className="relative z-10 max-w-3xl mx-auto">
          <span className="inline-block text-savanna text-sm font-semibold uppercase tracking-widest mb-4">East Africa Awaits</span>
          <h1 className="font-serif text-4xl sm:text-5xl lg:text-6xl font-bold text-cream mb-4 leading-tight">Our Destinations</h1>
          <p className="text-cream/70 text-lg max-w-xl mx-auto leading-relaxed">Three extraordinary countries. Infinite wild encounters. One company that knows every corner of them.</p>
        </div>
      </section>

      {destinations.map((dest, index) => (
        <section key={dest.country} className={`py-24 px-4 ${index % 2 === 0 ? "bg-cream" : "bg-sand"}`}>
          <div className="max-w-7xl mx-auto">
            <div className="relative rounded-2xl overflow-hidden mb-12">
              <div className="relative h-72 sm:h-96">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={dest.heroImage} alt={dest.country} className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-r from-bark/80 via-bark/40 to-transparent" />
                <div className="absolute inset-0 flex items-center px-10">
                  <div>
                    <div className="text-savanna text-xs font-semibold uppercase tracking-widest mb-2">Destination</div>
                    <h2 className="font-serif text-4xl sm:text-5xl font-bold text-cream mb-2">{dest.country}</h2>
                    <p className="text-cream/70 text-lg italic">{dest.tagline}</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
              <div className="lg:col-span-1">
                <p className="text-earth leading-relaxed mb-6">{dest.description}</p>
                <div className="bg-white rounded-xl p-5 border border-sand mb-4">
                  <h4 className="text-bark font-semibold text-xs uppercase tracking-wider mb-2">Best Time to Visit</h4>
                  <p className="text-earth text-sm leading-relaxed">{dest.bestTime}</p>
                </div>
                <div className="bg-forest/10 rounded-xl p-5 border border-forest/20">
                  <h4 className="text-forest font-semibold text-xs uppercase tracking-wider mb-2">💡 Pro Tip</h4>
                  <p className="text-bark text-sm leading-relaxed">{dest.travelTip}</p>
                </div>
              </div>

              <div className="lg:col-span-2">
                <h3 className="font-serif text-xl font-bold text-bark mb-6">Top Highlights in {dest.country}</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {dest.highlights.map((h) => (
                    <div key={h.name} className="bg-white rounded-xl p-5 border border-sand hover:border-savanna/40 transition-colors">
                      <div className="flex items-start gap-3">
                        <span className="text-savanna text-lg mt-0.5 flex-shrink-0">◆</span>
                        <div>
                          <h4 className="font-semibold text-bark text-sm mb-1">{h.name}</h4>
                          <p className="text-earth text-xs leading-relaxed">{h.detail}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="mt-6 flex gap-3">
                  <Link href="/tours" className="bg-savanna hover:bg-savanna-dark text-white font-semibold px-6 py-2.5 rounded-full text-sm transition-colors">View {dest.country} Tours</Link>
                  <Link href="/contact" className="border border-forest text-forest hover:bg-forest hover:text-cream font-semibold px-6 py-2.5 rounded-full text-sm transition-colors">Ask an Expert</Link>
                </div>
              </div>
            </div>
          </div>
        </section>
      ))}

      <section className="py-20 px-4 bg-forest text-center">
        <div className="max-w-2xl mx-auto">
          <h2 className="font-serif text-3xl sm:text-4xl font-bold text-cream mb-4">Which Destination Calls to You?</h2>
          <p className="text-cream/60 mb-8 text-lg leading-relaxed">Tell us your interests and we&apos;ll recommend the perfect destination and itinerary for your dream African safari.</p>
          <Link href="/contact" className="bg-savanna hover:bg-savanna-dark text-white font-semibold px-10 py-4 rounded-full text-lg transition-colors inline-block shadow-lg shadow-savanna/20">Get a Personalized Recommendation</Link>
        </div>
      </section>
    </>
  );
}
