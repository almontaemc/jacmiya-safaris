"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { addReview } from "@/lib/adminStore";
import type { ReviewRating } from "@/types/admin";
import { ArrowLeft, Star } from "lucide-react";

export default function NewReview() {
  const router = useRouter();
  const [form, setForm] = useState({
    clientName: "",
    clientCountry: "",
    tourTitle: "",
    rating: 5 as ReviewRating,
    body: "",
    travelDate: "",
    approved: true,
    featured: false,
  });
  const [saving, setSaving] = useState(false);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    addReview(form);
    router.push("/admin/reviews");
  }

  const inputCls = "w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:border-amber-400 transition-colors";
  const labelCls = "block text-xs font-semibold text-gray-600 uppercase tracking-wider mb-1.5";

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/admin/reviews" className="p-2 rounded-lg hover:bg-gray-100 transition-colors text-gray-500">
          <ArrowLeft className="w-4 h-4" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Add Review</h1>
          <p className="text-gray-500 text-sm">Manually add a client testimonial</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 space-y-5">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className={labelCls}>Client Name *</label>
            <input required value={form.clientName} onChange={(e) => setForm({ ...form, clientName: e.target.value })} className={inputCls} placeholder="e.g. Sarah Johnson" />
          </div>
          <div>
            <label className={labelCls}>Country *</label>
            <input required value={form.clientCountry} onChange={(e) => setForm({ ...form, clientCountry: e.target.value })} className={inputCls} placeholder="e.g. United Kingdom" />
          </div>
        </div>

        <div>
          <label className={labelCls}>Tour Title *</label>
          <input required value={form.tourTitle} onChange={(e) => setForm({ ...form, tourTitle: e.target.value })} className={inputCls} placeholder="e.g. 7-Day Masai Mara & Lake Nakuru" />
        </div>

        <div>
          <label className={labelCls}>Travel Date</label>
          <input type="month" value={form.travelDate} onChange={(e) => setForm({ ...form, travelDate: e.target.value })} className={inputCls} />
        </div>

        <div>
          <label className={labelCls}>Rating *</label>
          <div className="flex gap-2">
            {([1, 2, 3, 4, 5] as ReviewRating[]).map((r) => (
              <button key={r} type="button" onClick={() => setForm({ ...form, rating: r })}
                className="p-1.5 rounded-lg hover:bg-amber-50 transition-colors">
                <Star className={`w-7 h-7 ${r <= form.rating ? "text-amber-400 fill-amber-400" : "text-gray-200 fill-gray-200"}`} />
              </button>
            ))}
            <span className="self-center text-sm text-gray-500 ml-1">{form.rating} star{form.rating !== 1 ? "s" : ""}</span>
          </div>
        </div>

        <div>
          <label className={labelCls}>Review Text *</label>
          <textarea required rows={5} value={form.body} onChange={(e) => setForm({ ...form, body: e.target.value })}
            className={`${inputCls} resize-none`}
            placeholder="The client's review in their own words…" />
        </div>

        <div className="flex gap-6 pt-1">
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" checked={form.approved} onChange={(e) => setForm({ ...form, approved: e.target.checked })}
              className="w-4 h-4 rounded border-gray-300 text-emerald-600 focus:ring-emerald-400" />
            <span className="text-sm text-gray-700">Publish immediately</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" checked={form.featured} onChange={(e) => setForm({ ...form, featured: e.target.checked })}
              className="w-4 h-4 rounded border-gray-300 text-amber-500 focus:ring-amber-400" />
            <span className="text-sm text-gray-700">Feature on homepage</span>
          </label>
        </div>

        <div className="flex gap-3 pt-2">
          <button type="submit" disabled={saving} className="bg-amber-500 hover:bg-amber-600 text-white font-semibold px-6 py-2.5 rounded-xl text-sm transition-colors disabled:opacity-60">
            {saving ? "Saving…" : "Add Review"}
          </button>
          <Link href="/admin/reviews" className="border border-gray-200 text-gray-600 hover:bg-gray-50 font-semibold px-6 py-2.5 rounded-xl text-sm transition-colors">
            Cancel
          </Link>
        </div>
      </form>
    </div>
  );
}
