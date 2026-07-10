"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { addLead } from "@/lib/adminStore";
import type { LeadStatus, LeadSource } from "@/types/admin";
import { ArrowLeft } from "lucide-react";

const SOURCES: LeadSource[] = ["Website", "Referral", "Social Media", "Phone", "Walk-in", "Email"];
const STATUSES: LeadStatus[] = ["New", "Contacted", "Quoted", "Negotiating", "Won", "Lost"];

export default function NewLead() {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    name: "", email: "", phone: "", destination: "", travelDates: "",
    travelers: "", budget: "", message: "", tourInterest: "",
    source: "Phone" as LeadSource, status: "New" as LeadStatus,
  });

  function setF<K extends keyof typeof form>(k: K, v: typeof form[K]) {
    setForm((p) => ({ ...p, [k]: v }));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    addLead({ ...form, followUps: [] });
    router.push("/admin/leads");
  }

  const inputCls = "w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-800 bg-white placeholder-gray-400 focus:outline-none focus:border-purple-400 transition-colors";
  const labelCls = "block text-xs font-semibold text-gray-600 uppercase tracking-wider mb-1.5";

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/admin/leads" className="p-2 rounded-lg hover:bg-gray-100 transition-colors text-gray-500"><ArrowLeft className="w-4 h-4" /></Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Add Lead</h1>
          <p className="text-gray-500 text-sm">Manually record a new enquiry</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        <Card title="Contact Details">
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={labelCls}>Name *</label>
                <input className={inputCls} value={form.name} onChange={(e) => setF("name", e.target.value)} placeholder="Full name" required />
              </div>
              <div>
                <label className={labelCls}>Email *</label>
                <input type="email" className={inputCls} value={form.email} onChange={(e) => setF("email", e.target.value)} placeholder="email@example.com" required />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={labelCls}>Phone</label>
                <input className={inputCls} value={form.phone} onChange={(e) => setF("phone", e.target.value)} placeholder="+254 700 000 000" />
              </div>
              <div>
                <label className={labelCls}>Source *</label>
                <select className={inputCls} value={form.source} onChange={(e) => setF("source", e.target.value as LeadSource)}>
                  {SOURCES.map((s) => <option key={s}>{s}</option>)}
                </select>
              </div>
            </div>
          </div>
        </Card>

        <Card title="Safari Interest">
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={labelCls}>Destination</label>
                <select className={inputCls} value={form.destination} onChange={(e) => setF("destination", e.target.value)}>
                  <option value="">Select…</option>
                  <option>Kenya</option><option>Tanzania</option><option>Rwanda</option>
                  <option>Kenya + Tanzania</option><option>Multi-Country</option><option>Not Sure</option>
                </select>
              </div>
              <div>
                <label className={labelCls}>Group Size</label>
                <select className={inputCls} value={form.travelers} onChange={(e) => setF("travelers", e.target.value)}>
                  <option value="">Select…</option>
                  <option>Solo (1)</option><option>Couple (2)</option>
                  <option>Small Group (3–5)</option><option>Group (6–12)</option><option>Large Group (12+)</option>
                </select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={labelCls}>Travel Dates</label>
                <input className={inputCls} value={form.travelDates} onChange={(e) => setF("travelDates", e.target.value)} placeholder="e.g. August 2026" />
              </div>
              <div>
                <label className={labelCls}>Budget (USD pp)</label>
                <select className={inputCls} value={form.budget} onChange={(e) => setF("budget", e.target.value)}>
                  <option value="">Select…</option>
                  <option>Under $1,000</option><option>$1,000 – $2,000</option>
                  <option>$2,000 – $4,000</option><option>$4,000 – $7,000</option>
                  <option>$7,000+</option><option>Flexible</option>
                </select>
              </div>
            </div>
            <div>
              <label className={labelCls}>Tour of Interest</label>
              <input className={inputCls} value={form.tourInterest} onChange={(e) => setF("tourInterest", e.target.value)} placeholder="e.g. 7-Day Masai Mara Safari or Custom Safari" />
            </div>
            <div>
              <label className={labelCls}>Message / Notes</label>
              <textarea rows={3} className={`${inputCls} resize-none`} value={form.message} onChange={(e) => setF("message", e.target.value)} placeholder="What did the client say or ask about?" />
            </div>
          </div>
        </Card>

        <Card title="Pipeline Status">
          <div>
            <label className={labelCls}>Current Status *</label>
            <div className="flex flex-wrap gap-2">
              {STATUSES.map((s) => (
                <button key={s} type="button" onClick={() => setF("status", s)}
                  className={`px-4 py-2 rounded-xl text-sm font-semibold border transition-colors ${form.status === s ? "bg-purple-600 text-white border-purple-600" : "bg-white text-gray-600 border-gray-200 hover:border-purple-300"}`}>
                  {s}
                </button>
              ))}
            </div>
          </div>
        </Card>

        <div className="flex gap-3 pt-2 pb-8">
          <button type="submit" disabled={saving} className="bg-purple-600 hover:bg-purple-700 text-white font-semibold px-6 py-3 rounded-xl text-sm transition-colors disabled:opacity-60">
            {saving ? "Saving…" : "Save Lead"}
          </button>
          <Link href="/admin/leads" className="border border-gray-200 text-gray-600 hover:bg-gray-50 font-semibold px-6 py-3 rounded-xl text-sm transition-colors">Cancel</Link>
        </div>
      </form>
    </div>
  );
}

function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
      <h2 className="font-semibold text-gray-800 mb-4 pb-3 border-b border-gray-100">{title}</h2>
      {children}
    </div>
  );
}
