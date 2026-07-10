import { Phone, Mail, MapPin, Clock } from "lucide-react";
import ContactForm from "@/components/ContactForm";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Contact Us | Jacmiya Safaris & Holiday Tours",
  description:
    "Get in touch with Jacmiya Safaris to plan your dream East Africa safari. We respond within 24 hours with a personalised itinerary and quote.",
};

export default function Contact() {
  return (
    <>
      <section
        className="relative py-28 px-4 text-center bg-bark overflow-hidden"
        style={{ backgroundImage: "url('/images/kenya.jpg')", backgroundSize: "cover", backgroundPosition: "center" }}
      >
        <div className="absolute inset-0 bg-bark/80" />
        <div className="relative z-10 max-w-3xl mx-auto">
          <span className="inline-block text-savanna text-sm font-semibold uppercase tracking-widest mb-4">Let&apos;s Plan Your Adventure</span>
          <h1 className="font-serif text-4xl sm:text-5xl lg:text-6xl font-bold text-cream mb-4 leading-tight">Get in Touch</h1>
          <p className="text-cream/70 text-lg max-w-xl mx-auto leading-relaxed">Fill in the form below and one of our safari experts will get back to you within 24 hours with a personalised proposal.</p>
        </div>
      </section>

      <section className="py-24 px-4 bg-cream">
        <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-12">
          <div className="lg:col-span-1 space-y-6">
            <div>
              <h2 className="font-serif text-2xl font-bold text-bark mb-6">Contact Details</h2>
              <div className="space-y-4">
                <a href="tel:+254116482995" className="flex items-center gap-4 bg-white rounded-xl p-4 border border-sand hover:border-savanna/40 transition-colors group">
                  <div className="w-10 h-10 bg-forest/10 rounded-full flex items-center justify-center flex-shrink-0 group-hover:bg-savanna transition-colors">
                    <Phone className="w-5 h-5 text-forest group-hover:text-white transition-colors" />
                  </div>
                  <div>
                    <div className="text-bark font-semibold text-sm">Phone</div>
                    <div className="text-earth text-sm">+254 116 482 995</div>
                  </div>
                </a>

                <a href="mailto:info@jacmiyasafaris.com" className="flex items-center gap-4 bg-white rounded-xl p-4 border border-sand hover:border-savanna/40 transition-colors group">
                  <div className="w-10 h-10 bg-forest/10 rounded-full flex items-center justify-center flex-shrink-0 group-hover:bg-savanna transition-colors">
                    <Mail className="w-5 h-5 text-forest group-hover:text-white transition-colors" />
                  </div>
                  <div>
                    <div className="text-bark font-semibold text-sm">Email</div>
                    <div className="text-earth text-sm">info@jacmiyasafaris.com</div>
                  </div>
                </a>

                <div className="flex items-center gap-4 bg-white rounded-xl p-4 border border-sand">
                  <div className="w-10 h-10 bg-forest/10 rounded-full flex items-center justify-center flex-shrink-0">
                    <MapPin className="w-5 h-5 text-forest" />
                  </div>
                  <div>
                    <div className="text-bark font-semibold text-sm">Location</div>
                    <div className="text-earth text-sm">Nairobi, Kenya</div>
                  </div>
                </div>

                <div className="flex items-center gap-4 bg-white rounded-xl p-4 border border-sand">
                  <div className="w-10 h-10 bg-forest/10 rounded-full flex items-center justify-center flex-shrink-0">
                    <Clock className="w-5 h-5 text-forest" />
                  </div>
                  <div>
                    <div className="text-bark font-semibold text-sm">Response Time</div>
                    <div className="text-earth text-sm">Within 24 hours</div>
                  </div>
                </div>
              </div>
            </div>

            <div>
              <h3 className="font-semibold text-bark text-xs uppercase tracking-wider mb-3">Follow Us</h3>
              <div className="flex gap-3">
                <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full bg-forest flex items-center justify-center hover:bg-savanna transition-colors text-cream font-bold text-sm" aria-label="Facebook">f</a>
                <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full bg-forest flex items-center justify-center hover:bg-savanna transition-colors text-cream font-bold text-sm" aria-label="X / Twitter">𝕏</a>
              </div>
            </div>

            <div className="bg-forest rounded-2xl p-6 text-center">
              <div className="text-3xl mb-2">🏷️</div>
              <h3 className="font-serif font-bold text-cream mb-1">Price-Match Guarantee</h3>
              <p className="text-cream/60 text-sm leading-relaxed">Found a better deal? Share it with us and we&apos;ll match it within 48 hours of your booking.</p>
            </div>
          </div>

          <div className="lg:col-span-2">
            <ContactForm />
          </div>
        </div>
      </section>
    </>
  );
}
