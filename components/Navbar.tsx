"use client";

import Link from "next/link";
import { useState, useRef, useEffect } from "react";
import { Menu, X, Phone, ChevronDown, Search, Check, Star } from "lucide-react";
import { useCurrency, type Currency } from "@/context/CurrencyContext";

const links = [
  { href: "/", label: "Home" },
  { href: "/about", label: "About Us" },
  { href: "/tours", label: "Tours" },
  { href: "/destinations", label: "Destinations" },
  { href: "/contact", label: "Contact" },
];

const currencies: { value: Currency; label: string; sub: string }[] = [
  { value: "KSH", label: "KSH", sub: "Kenyan Shilling" },
  { value: "USD", label: "USD", sub: "US Dollar" },
];

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [currencyOpen, setCurrencyOpen] = useState(false);
  const { currency, setCurrency } = useCurrency();
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setCurrencyOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  function selectCurrency(c: Currency) {
    setCurrency(c);
    setCurrencyOpen(false);
  }

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white border-b border-sand shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-36">

          {/* Brand */}
          <Link href="/" className="flex items-center flex-shrink-0">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/logo.png"
              alt="Jacmiya Safaris & Holiday Tours"
              className="h-32 w-auto"
            />
          </Link>

          {/* Desktop nav links */}
          <div className="hidden lg:flex items-center gap-6">
            {links.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                className="text-bark/70 hover:text-savanna text-sm font-medium transition-colors tracking-wide"
              >
                {l.label}
              </Link>
            ))}
            {/* Search Tours */}
            <Link
              href="/tours"
              className="flex items-center gap-1.5 text-bark/70 hover:text-savanna text-sm font-medium transition-colors tracking-wide"
            >
              <Search className="w-3.5 h-3.5" />
              Search Tours
            </Link>
            {/* Leave a Review */}
            <Link
              href="/reviews/new"
              className="flex items-center gap-1.5 text-bark/70 hover:text-savanna text-sm font-medium transition-colors tracking-wide"
            >
              <Star className="w-3.5 h-3.5" />
              Leave a Review
            </Link>
          </div>

          {/* Right side: currency + phone + CTA + mobile toggle */}
          <div className="flex items-center gap-2">

            {/* Currency dropdown */}
            <div className="relative hidden md:block" ref={dropdownRef}>
              <button
                onClick={() => setCurrencyOpen(!currencyOpen)}
                className="flex items-center gap-1.5 text-bark/70 hover:text-savanna text-sm font-semibold transition-colors border border-bark/20 hover:border-savanna/50 rounded-full px-3 py-1.5"
                aria-label="Change currency"
              >
                <span>{currency}</span>
                <ChevronDown
                  className={`w-3.5 h-3.5 transition-transform duration-200 ${currencyOpen ? "rotate-180" : ""}`}
                />
              </button>

              {currencyOpen && (
                <div className="absolute right-0 top-full mt-2 bg-white border border-sand rounded-xl overflow-hidden shadow-2xl w-48 z-50">
                  <div className="px-3 py-2 border-b border-sand">
                    <p className="text-bark/40 text-xs uppercase tracking-widest">Select Currency</p>
                  </div>
                  {currencies.map((c) => (
                    <button
                      key={c.value}
                      onClick={() => selectCurrency(c.value)}
                      className={`w-full text-left px-4 py-3 text-sm transition-colors flex items-center justify-between gap-3 ${
                        currency === c.value
                          ? "text-savanna bg-savanna/10"
                          : "text-bark/70 hover:text-bark hover:bg-sand/30"
                      }`}
                    >
                      <div>
                        <span className="font-semibold">{c.label}</span>
                        <span className="text-xs ml-2 opacity-60">{c.sub}</span>
                      </div>
                      {currency === c.value && <Check className="w-4 h-4 text-savanna flex-shrink-0" />}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Phone (desktop) */}
            <a
              href="tel:+254116482995"
              className="hidden xl:flex items-center gap-1.5 text-bark/50 hover:text-savanna text-xs transition-colors"
            >
              <Phone className="w-3 h-3" />
              +254 116 482 995
            </a>

            {/* Book Now CTA */}
            <Link
              href="/contact"
              className="hidden md:inline-flex bg-savanna hover:bg-savanna-dark text-white font-semibold px-5 py-2 rounded-full text-sm transition-colors shadow-md"
            >
              Book Now
            </Link>

            {/* Mobile hamburger */}
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="lg:hidden text-bark p-1 ml-1"
              aria-label="Toggle menu"
            >
              {menuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile drawer */}
      {menuOpen && (
        <div className="lg:hidden bg-white border-t border-sand px-4 py-5 flex flex-col gap-1">
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              onClick={() => setMenuOpen(false)}
              className="text-bark/80 hover:text-savanna py-2.5 text-sm font-medium border-b border-sand last:border-0 transition-colors"
            >
              {l.label}
            </Link>
          ))}

          {/* Search Tours mobile */}
          <Link
            href="/tours"
            onClick={() => setMenuOpen(false)}
            className="flex items-center gap-2 text-bark/80 hover:text-savanna py-2.5 text-sm font-medium border-b border-sand transition-colors"
          >
            <Search className="w-4 h-4" />
            Search Tours
          </Link>
          {/* Leave a Review mobile */}
          <Link
            href="/reviews/new"
            onClick={() => setMenuOpen(false)}
            className="flex items-center gap-2 text-bark/80 hover:text-savanna py-2.5 text-sm font-medium border-b border-sand transition-colors"
          >
            <Star className="w-4 h-4" />
            Leave a Review
          </Link>

          {/* Currency toggle mobile */}
          <div className="pt-3">
            <p className="text-bark/40 text-xs uppercase tracking-widest mb-2">Currency</p>
            <div className="flex gap-2">
              {currencies.map((c) => (
                <button
                  key={c.value}
                  onClick={() => { setCurrency(c.value); setMenuOpen(false); }}
                  className={`flex-1 py-2.5 rounded-full text-sm font-semibold border transition-colors ${
                    currency === c.value
                      ? "bg-savanna border-savanna text-white"
                      : "border-bark/20 text-bark/70 hover:border-savanna/50 hover:text-bark"
                  }`}
                >
                  {c.label}
                </button>
              ))}
            </div>
          </div>

          <Link
            href="/contact"
            onClick={() => setMenuOpen(false)}
            className="bg-savanna text-white font-semibold px-5 py-3 rounded-full text-sm text-center mt-3"
          >
            Book Now
          </Link>

          <a
            href="tel:+254116482995"
            className="text-bark/50 text-xs text-center mt-1 flex items-center justify-center gap-1.5"
          >
            <Phone className="w-3 h-3" />
            +254 116 482 995
          </a>
        </div>
      )}
    </nav>
  );
}
