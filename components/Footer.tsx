import Link from "next/link";
import { Phone, Mail } from "lucide-react";

const quickLinks = [
  { href: "/", label: "Home" },
  { href: "/about", label: "About Us" },
  { href: "/tours", label: "Travel Packages" },
  { href: "/destinations", label: "Destinations" },
  { href: "/contact", label: "Contact Us" },
];

const destinations = [
  { href: "/destinations", label: "Kenya Safari" },
  { href: "/destinations", label: "Tanzania Adventure" },
  { href: "/destinations", label: "Rwanda Gorilla Trek" },
  { href: "/tours", label: "Beach Holidays" },
  { href: "/tours", label: "Luxury Safaris" },
];

export default function Footer() {
  return (
    <footer className="bg-bark text-cream/60">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
          {/* Brand */}
          <div className="lg:col-span-1">
            <div className="mb-4">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/logo.png"
                alt="Jacmiya Safaris & Holiday Tours"
                className="h-20 w-auto"
              />
            </div>
            <p className="text-sm leading-relaxed max-w-xs mb-6">
              Your trusted partner for unforgettable wildlife adventures across East Africa. 70+ destinations, price-match guarantee, world-class guides.
            </p>
            <div className="flex gap-3">
              <a
                href="https://facebook.com"
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center hover:bg-savanna transition-colors text-cream font-bold text-sm"
                aria-label="Facebook"
              >
                f
              </a>
              <a
                href="https://twitter.com"
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center hover:bg-savanna transition-colors text-cream font-bold text-sm"
                aria-label="X / Twitter"
              >
                𝕏
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-cream font-semibold mb-5 uppercase tracking-wider text-xs">Quick Links</h4>
            <ul className="space-y-2.5">
              {quickLinks.map((l) => (
                <li key={l.href + l.label}>
                  <Link href={l.href} className="text-sm hover:text-savanna transition-colors">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Destinations */}
          <div>
            <h4 className="text-cream font-semibold mb-5 uppercase tracking-wider text-xs">Destinations</h4>
            <ul className="space-y-2.5">
              {destinations.map((d) => (
                <li key={d.label}>
                  <Link href={d.href} className="text-sm hover:text-savanna transition-colors">
                    {d.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-cream font-semibold mb-5 uppercase tracking-wider text-xs">Get In Touch</h4>
            <div className="space-y-3 mb-6">
              <a
                href="tel:+254116482995"
                className="flex items-center gap-3 text-sm hover:text-savanna transition-colors"
              >
                <Phone className="w-4 h-4 text-savanna flex-shrink-0" />
                +254 116 482 995
              </a>
              <a
                href="mailto:info@jacmiyasafaris.com"
                className="flex items-center gap-3 text-sm hover:text-savanna transition-colors"
              >
                <Mail className="w-4 h-4 text-savanna flex-shrink-0" />
                info@jacmiyasafaris.com
              </a>
            </div>
            <Link
              href="/contact"
              className="bg-savanna hover:bg-savanna-dark text-white text-sm font-semibold px-5 py-2.5 rounded-full inline-block transition-colors"
            >
              Plan Your Safari
            </Link>
          </div>
        </div>

        <div className="border-t border-white/10 mt-12 pt-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-cream/30">
          <span>© 2026 Jacmiya Safaris & Holiday Tours. All rights reserved.</span>
          <span>
            Crafted by{" "}
            <a href="https://techyhomesolutions.com" className="hover:text-savanna transition-colors">
              Techy Home Solutions
            </a>
          </span>
        </div>
      </div>
    </footer>
  );
}
