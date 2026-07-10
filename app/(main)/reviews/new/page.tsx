"use client";

import { useState } from "react";
import Link from "next/link";
import { Star, Send, CheckCircle, ArrowLeft } from "lucide-react";
import { addReview } from "@/lib/adminStore";
import type { ReviewRating } from "@/types/admin";

const TOUR_OPTIONS = [
  "Masai Mara Safari",
  "Serengeti & Ngorongoro",
  "Amboseli National Park",
  "Tsavo East & West",
  "Rwanda Gorilla Trekking",
  "Mount Kenya Hiking",
  "Diani Beach Holiday",
  "Lake Nakuru & Bogoria",
  "Samburu National Reserve",
  "Other / Custom Safari",
];

export default function SubmitReviewPage() {
  const [rating, setRating] = useState<ReviewRating | 0>(0);
  const [hovered, setHovered] = useState(0);
  const [form, setForm] = useState({
    clientName: "",
    clientCountry: "",
    tourTitle: "",
    travelDate: "",
    body: "",
  });
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!rating) return;
    setSubmitting(true);
    try {
      addReview({
        clientName: form.clientName,
        clientCountry: form.clientCountry,
        tourTitle: form.tourTitle || "Jacmiya Safaris Experience",
        rating: rating as ReviewRating,
        body: form.body,
        travelDate: form.travelDate,
        approved: false,
        featured: false,
      });
      // Best-effort email notification to staff
      fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.clientName,
          email: "noreply@jacmiyasafaris.com",
          message: `New review submitted by ${form.clientName} (${form.clientCountry}) — ${rating}/5 stars for "${form.tourTitle || "General experience"}": ${form.body}`,
          tourInterest: "Review Submission",
        }),
      }).catch(() => {});
      setSubmitted(true);
    } finally {
      setSubmitting(false);
    }
  }

  if (submitted) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-4 py-20 bg-cream">
        <div className="max-w-md w-full text-center">
          <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-10 h-10 text-green-600" />
          </div>
          <h1 className="font-serif text-3xl font-bold text-bark mb-3">Thank You!</h1>
          <p className="text-earth leading-relaxed mb-2">
            Your review has been submitted and will appear on our website after a quick review by our team.
          </p>
          <p className="text-earth/60 text-sm mb-8">We truly appreciate you sharing your experience with us.</p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link href="/" className="bg-savanna text-white font-semibold px-6 py-3 rounded-full text-sm transition-colors hover:bg-savanna-dark">Back to Home</Link>
            <Link href="/tours" className="border border-forest text-forest font-semibold px-6 py-3 rounded-full text-sm transition-colors hover:bg-forest hover:text-cream">Browse Tours</Link>
          </div>
        </div>
      </div>
    );
  }

  const displayRating = hovered || rating;

  return (
    <>
      <section
        className="relative py-24 px-4 text-center bg-bark"
        style={{ backgroundImage: "url('/images/tanzania.jpg')", backgroundSize: "cover", backgroundPosition: "center 40%" }}
      >
        <div className="absolute inset-0 bg-bark/80" />
        <div className="relative z-10 max-w-2xl mx-auto">
          <span className="inline-block text-savanna text-sm font-semibold uppercase tracking-widest mb-3">Share Your Experience</span>
          <h1 className="font-serif text-4xl sm:text-5xl font-bold text-cream mb-3 leading-tight">Leave a Review</h1>
          <p className="text-cream/70 text-base max-w-lg mx-auto">Your feedback helps future travelers and inspires our team to keep doing what we love.</p>
        </div>
      </section>

      <section className="py-16 px-4 bg-cream">
        <div className="max-w-2xl mx-auto">
          <Link href="/" className="inline-flex items-center gap-2 text-earth/60 hover:text-savanna text-sm mb-8 transition-colors">
            <ArrowLeft className="w-4 h-4" /> Back to Home
          </Link>

          <form onSubmit={handleSubmit} className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8 sm:p-10 space-y-6">

            {/* Star rating */}
            <div>
              <label className="block text-bark text-sm font-semibold mb-3">Your Rating <span className="text-red-500">*</span></label>
              <div className="flex gap-2">
                {[1, 2, 3, 4, 5].map((n) => (
                  <button
                    key={n}
                    type="button"
                    onClick={() => setRating(n as ReviewRating)}
                    onMouseEnter={() => setHovered(n)}
                    onMouseLeave={() => setHovered(0)}
                    className="focus:outline-none transition-transform hover:scale-110"
                    aria-label={`${n} star${n !== 1 ? "s" : ""}`}
                  >
                    <Star
                      className={`w-9 h-9 transition-colors ${n <= displayRating ? "text-amber-400 fill-amber-400" : "text-gray-200 fill-gray-200"}`}
                    />
                  </button>
                ))}
              </div>
              {rating > 0 && (
                <p className="text-sm mt-2 text-earth/60">
                  {["", "Poor", "Fair", "Good", "Great", "Excellent"][rating]}
                </p>
              )}
            </div>

            {/* Name */}
            <div>
              <label htmlFor="clientName" className="block text-bark text-sm font-semibold mb-1.5">Your Name <span className="text-red-500">*</span></label>
              <input
                id="clientName"
                name="clientName"
                type="text"
                required
                value={form.clientName}
                onChange={handleChange}
                placeholder="e.g. John & Mary Smith"
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm text-bark placeholder-gray-400 focus:outline-none focus:border-savanna transition-colors"
              />
            </div>

            {/* Country */}
            <div>
              <label htmlFor="clientCountry" className="block text-bark text-sm font-semibold mb-1.5">Country <span className="text-red-500">*</span></label>
              <input
                id="clientCountry"
                name="clientCountry"
                type="text"
                required
                value={form.clientCountry}
                onChange={handleChange}
                placeholder="e.g. United Kingdom"
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm text-bark placeholder-gray-400 focus:outline-none focus:border-savanna transition-colors"
              />
            </div>

            {/* Tour */}
            <div>
              <label htmlFor="tourTitle" className="block text-bark text-sm font-semibold mb-1.5">Tour / Experience</label>
              <select
                id="tourTitle"
                name="tourTitle"
                value={form.tourTitle}
                onChange={handleChange}
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm text-bark focus:outline-none focus:border-savanna transition-colors"
              >
                <option value="">Select a tour (optional)</option>
                {TOUR_OPTIONS.map((t) => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>

            {/* Travel date */}
            <div>
              <label htmlFor="travelDate" className="block text-bark text-sm font-semibold mb-1.5">Travel Date</label>
              <input
                id="travelDate"
                name="travelDate"
                type="date"
                value={form.travelDate}
                onChange={handleChange}
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm text-bark focus:outline-none focus:border-savanna transition-colors"
              />
            </div>

            {/* Review body */}
            <div>
              <label htmlFor="body" className="block text-bark text-sm font-semibold mb-1.5">Your Review <span className="text-red-500">*</span></label>
              <textarea
                id="body"
                name="body"
                required
                rows={5}
                value={form.body}
                onChange={handleChange}
                placeholder="Tell future travelers about your experience — the highlights, the wildlife, the guides, the lodges…"
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm text-bark placeholder-gray-400 focus:outline-none focus:border-savanna transition-colors resize-none"
              />
              <p className="text-xs text-earth/50 mt-1">{form.body.length} characters</p>
            </div>

            <p className="text-xs text-earth/50">
              Reviews are moderated before appearing on the website. We do not share your personal details publicly beyond your name and country.
            </p>

            <button
              type="submit"
              disabled={!rating || !form.clientName || !form.clientCountry || !form.body || submitting}
              className="w-full flex items-center justify-center gap-2 bg-savanna hover:bg-savanna-dark text-white font-semibold py-4 rounded-xl text-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-md"
            >
              <Send className="w-4 h-4" />
              {submitting ? "Submitting…" : "Submit Review"}
            </button>
          </form>
        </div>
      </section>
    </>
  );
}
