"use client";

import { useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { addLead } from "@/lib/adminStore";

export default function ContactForm() {
  return (
    <Suspense fallback={<div className="bg-white rounded-2xl p-8 border border-sand shadow-sm min-h-[500px]" />}>
      <ContactFormInner />
    </Suspense>
  );
}

function ContactFormInner() {
  const searchParams = useSearchParams();
  const [submitted, setSubmitted] = useState(false);
  const [sending, setSending] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    destination: "",
    travelers: "",
    dates: "",
    budget: "",
    message: "",
  });

  const tourParam = searchParams.get("tour") ?? "";

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSending(true);

    // 1. Save as lead in localStorage (always works, no network needed)
    addLead({
      name: formData.name,
      email: formData.email,
      phone: formData.phone,
      destination: formData.destination,
      travelDates: formData.dates,
      travelers: formData.travelers,
      budget: formData.budget,
      message: formData.message,
      tourInterest: tourParam || "Custom Safari",
      source: "Website",
      status: "New",
      followUps: [],
    });

    // 2. Send email notification (best-effort — don't block success on failure)
    try {
      await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          destination: formData.destination,
          travelers: formData.travelers,
          dates: formData.dates,
          budget: formData.budget,
          message: formData.message,
          tourInterest: tourParam || "Custom Safari",
        }),
      });
    } catch {
      // Silent fail — lead is already saved, email is best-effort
    }

    setSending(false);
    setSubmitted(true);
  }

  if (submitted) {
    return (
      <div className="bg-white rounded-2xl p-10 border border-sand text-center shadow-sm h-full flex flex-col items-center justify-center min-h-[500px]">
        <div className="text-5xl mb-4">🦁</div>
        <h3 className="font-serif text-2xl font-bold text-bark mb-3">Safari Request Received!</h3>
        <p className="text-earth text-lg leading-relaxed max-w-md">
          Thank you, <span className="font-semibold text-bark">{formData.name}</span>! One of our expert guides will reach out within 24 hours with a tailored proposal just for you.
        </p>
        <p className="text-earth text-sm mt-4">
          In the meantime, feel free to call us at{" "}
          <a href="tel:+254116482995" className="text-savanna font-semibold">+254 116 482 995</a>
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-2xl p-8 border border-sand shadow-sm space-y-5">
      <h2 className="font-serif text-2xl font-bold text-bark mb-2">Plan Your Safari</h2>
      {tourParam && (
        <div className="bg-savanna/10 border border-savanna/30 rounded-xl px-4 py-3 text-sm text-bark">
          Enquiring about: <span className="font-semibold">{tourParam}</span>
        </div>
      )}
      <p className="text-earth text-sm mb-6">The more details you share, the better we can tailor your experience.</p>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-bark font-semibold text-xs uppercase tracking-wider mb-1.5">Full Name *</label>
          <input type="text" name="name" required value={formData.name} onChange={handleChange} placeholder="Jane Doe" className="w-full border border-sand rounded-xl px-4 py-3 text-sm text-bark placeholder-earth/60 focus:outline-none focus:border-savanna transition-colors" />
        </div>
        <div>
          <label className="block text-bark font-semibold text-xs uppercase tracking-wider mb-1.5">Email Address *</label>
          <input type="email" name="email" required value={formData.email} onChange={handleChange} placeholder="jane@example.com" className="w-full border border-sand rounded-xl px-4 py-3 text-sm text-bark placeholder-earth/60 focus:outline-none focus:border-savanna transition-colors" />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-bark font-semibold text-xs uppercase tracking-wider mb-1.5">Phone Number</label>
          <input type="tel" name="phone" value={formData.phone} onChange={handleChange} placeholder="+254 700 000 000" className="w-full border border-sand rounded-xl px-4 py-3 text-sm text-bark placeholder-earth/60 focus:outline-none focus:border-savanna transition-colors" />
        </div>
        <div>
          <label className="block text-bark font-semibold text-xs uppercase tracking-wider mb-1.5">Number of Travelers *</label>
          <select name="travelers" required value={formData.travelers} onChange={handleChange} className="w-full border border-sand rounded-xl px-4 py-3 text-sm text-bark focus:outline-none focus:border-savanna transition-colors bg-white">
            <option value="">Select…</option>
            <option>Solo (1)</option>
            <option>Couple (2)</option>
            <option>Small Group (3–5)</option>
            <option>Group (6–12)</option>
            <option>Large Group (12+)</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-bark font-semibold text-xs uppercase tracking-wider mb-1.5">Preferred Destination *</label>
          <select name="destination" required value={formData.destination} onChange={handleChange} className="w-full border border-sand rounded-xl px-4 py-3 text-sm text-bark focus:outline-none focus:border-savanna transition-colors bg-white">
            <option value="">Select…</option>
            <option>Kenya</option>
            <option>Tanzania</option>
            <option>Rwanda</option>
            <option>Kenya + Tanzania</option>
            <option>Multi-Country</option>
            <option>Not Sure — Need Advice</option>
          </select>
        </div>
        <div>
          <label className="block text-bark font-semibold text-xs uppercase tracking-wider mb-1.5">Preferred Travel Dates</label>
          <input type="text" name="dates" value={formData.dates} onChange={handleChange} placeholder="e.g. August 2026, flexible" className="w-full border border-sand rounded-xl px-4 py-3 text-sm text-bark placeholder-earth/60 focus:outline-none focus:border-savanna transition-colors" />
        </div>
      </div>

      <div>
        <label className="block text-bark font-semibold text-xs uppercase tracking-wider mb-1.5">Budget Per Person (USD)</label>
        <select name="budget" value={formData.budget} onChange={handleChange} className="w-full border border-sand rounded-xl px-4 py-3 text-sm text-bark focus:outline-none focus:border-savanna transition-colors bg-white">
          <option value="">Select…</option>
          <option>Under $1,000</option>
          <option>$1,000 – $2,000</option>
          <option>$2,000 – $4,000</option>
          <option>$4,000 – $7,000</option>
          <option>$7,000+</option>
          <option>Flexible / Need Guidance</option>
        </select>
      </div>

      <div>
        <label className="block text-bark font-semibold text-xs uppercase tracking-wider mb-1.5">Tell Us More</label>
        <textarea name="message" rows={4} value={formData.message} onChange={handleChange} placeholder="E.g. We're celebrating our anniversary, love wildlife photography, interested in gorilla trekking…" className="w-full border border-sand rounded-xl px-4 py-3 text-sm text-bark placeholder-earth/60 focus:outline-none focus:border-savanna transition-colors resize-none" />
      </div>

      <button type="submit" disabled={sending} className="w-full bg-savanna hover:bg-savanna-dark text-white font-semibold py-3.5 rounded-full text-base transition-colors shadow-md shadow-savanna/20 disabled:opacity-70 disabled:cursor-not-allowed">
        {sending ? "Sending…" : "Send My Safari Request →"}
      </button>
      <p className="text-earth text-xs text-center pt-1">We respond within 24 hours. No spam, no pressure — ever.</p>
    </form>
  );
}
