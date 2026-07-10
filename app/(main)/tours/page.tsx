import type { Metadata } from "next";
import ToursClient from "@/components/ToursClient";

export const metadata: Metadata = {
  title: "Safari Packages | Jacmiya Safaris & Holiday Tours",
  description:
    "Browse all 13 hand-crafted safari packages across Kenya, Tanzania, and Rwanda. Search by destination, duration, and budget. Price-match guaranteed.",
};

export default function Tours() {
  return (
    <>
      <section
        className="relative py-28 px-4 text-center bg-bark overflow-hidden"
        style={{ backgroundImage: "url('https://jacmiyasafaris.com/wp-content/uploads/2017/01/Safari-in-Serengeti-National-Park-Tanzania-700x482.jpg')", backgroundSize: "cover", backgroundPosition: "center" }}
      >
        <div className="absolute inset-0 bg-bark/80" />
        <div className="relative z-10 max-w-3xl mx-auto">
          <span className="inline-block text-savanna text-sm font-semibold uppercase tracking-widest mb-4">13 Packages Available</span>
          <h1 className="font-serif text-4xl sm:text-5xl lg:text-6xl font-bold text-cream mb-4 leading-tight">Find Your Safari</h1>
          <p className="text-cream/70 text-lg max-w-xl mx-auto leading-relaxed">Search and filter all our packages by destination, duration, and budget. Switch between KSH and USD with the currency toggle.</p>
        </div>
      </section>

      <div className="bg-savanna py-3.5 px-4 text-center text-sm text-white font-medium">
        🏷️ Price-Match Guarantee — Found it cheaper? We&apos;ll match any quote within 48 hours.
      </div>

      <ToursClient />
    </>
  );
}
