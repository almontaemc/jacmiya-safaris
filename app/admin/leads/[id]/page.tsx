"use client";

import { use, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { getLeads, updateLead, addFollowUp, addSale } from "@/lib/adminStore";
import type { Lead, LeadStatus, LeadSource } from "@/types/admin";
import { ArrowLeft, Send, Trophy } from "lucide-react";

const SOURCES: LeadSource[] = ["Website", "Referral", "Social Media", "Phone", "Walk-in", "Email"];
const STATUSES: LeadStatus[] = ["New", "Contacted", "Quoted", "Negotiating", "Won", "Lost"];
const STATUS_COLOR: Record<LeadStatus, string> = {
  New: "bg-blue-100 text-blue-700 border-blue-200",
  Contacted: "bg-purple-100 text-purple-700 border-purple-200",
  Quoted: "bg-amber-100 text-amber-700 border-amber-200",
  Negotiating: "bg-orange-100 text-orange-700 border-orange-200",
  Won: "bg-green-100 text-green-700 border-green-200",
  Lost: "bg-red-100 text-red-700 border-red-200",
};

export default function LeadDetail({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const [lead, setLead] = useState<Lead | null>(null);
  const [saving, setSaving] = useState(false);
  const [noteText, setNoteText] = useState("");
  const [convertSaving, setConvertSaving] = useState(false);
  const [form, setForm] = useState({
    name: "", email: "", phone: "", destination: "", travelDates: "",
    travelers: "", budget: "", message: "", tourInterest: "",
    source: "Website" as LeadSource, status: "New" as LeadStatus,
  });

  function load() {
    const found = getLeads().find((l) => l.id === id);
    if (found) {
      setLead(found);
      setForm({
        name: found.name, email: found.email, phone: found.phone,
        destination: found.destination, travelDates: found.travelDates,
        travelers: found.travelers, budget: found.budget,
        message: found.message, tourInterest: found.tourInterest,
        source: found.source, status: found.status,
      });
    }
  }

  useEffect(() => { load(); }, [id]);

  if (!lead) return <div className="p-6 text-gray-400">Lead not found.</div>;

  function setF<K extends keyof typeof form>(k: K, v: typeof form[K]) {
    setForm((p) => ({ ...p, [k]: v }));
  }

  function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    updateLead(id, form);
    router.push("/admin/leads");
  }

  function handleAddNote() {
    if (!noteText.trim()) return;
    addFollowUp(id, noteText.trim());
    setNoteText("");
    load();
  }

  function handleConvertToSale() {
    if (!lead) return;
    if (!confirm("Promote this lead to a confirmed booking? You can fill in the full booking details on the next page.")) return;
    setConvertSaving(true);
    updateLead(id, { status: "Won" });
    router.push(`/admin/sales/new?leadId=${id}&name=${encodeURIComponent(lead.name)}&email=${encodeURIComponent(lead.email)}&phone=${encodeURIComponent(lead.phone)}&tour=${encodeURIComponent(lead.tourInterest)}`);
  }

  const inputCls = "w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-800 bg-white placeholder-gray-400 focus:outline-none focus:border-purple-400 transition-colors";
  const labelCls = "block text-xs font-semibold text-gray-600 uppercase tracking-wider mb-1.5";

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/admin/leads" className="p-2 rounded-lg hover:bg-gray-100 transition-colors text-gray-500"><ArrowLeft className="w-4 h-4" /></Link>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-gray-900">{lead.name}</h1>
          <p className="text-gray-500 text-sm">{lead.email}</p>
        </div>
        <span className={`text-sm px-3 py-1 rounded-full font-semibold border ${STATUS_COLOR[lead.status]}`}>{lead.status}</span>
      </div>

      {/* Convert to sale */}
      {lead.status !== "Won" && lead.status !== "Lost" && (
        <div className="bg-green-50 border border-green-200 rounded-2xl p-5 flex items-center justify-between gap-4">
          <div>
            <p className="text-sm font-semibold text-green-800">Ready to convert?</p>
            <p className="text-xs text-green-700 mt-0.5">Mark as Won and create a confirmed booking from this lead.</p>
          </div>
          <button onClick={handleConvertToSale} disabled={convertSaving}
            className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white text-sm font-semibold px-4 py-2.5 rounded-xl transition-colors flex-shrink-0 disabled:opacity-60">
            <Trophy className="w-4 h-4" /> Convert to Booking
          </button>
        </div>
      )}

      {lead.convertedSaleId && (
        <div className="bg-blue-50 border border-blue-200 rounded-2xl p-5 flex items-center justify-between">
          <p className="text-sm text-blue-800 font-medium">This lead has been converted to a booking.</p>
          <Link href={`/admin/sales`} className="text-xs text-blue-600 font-semibold hover:underline">View Booking →</Link>
        </div>
      )}

      {/* Follow-up log */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100">
        <div className="px-5 py-4 border-b border-gray-100">
          <h2 className="font-semibold text-gray-800">Follow-up Log</h2>
        </div>
        <div className="p-5 space-y-3">
          {(lead.followUps ?? []).length === 0 && (
            <p className="text-sm text-gray-400 text-center py-4">No follow-ups yet. Log your first interaction below.</p>
          )}
          {[...(lead.followUps ?? [])].reverse().map((fu) => (
            <div key={fu.id} className="bg-gray-50 rounded-xl p-4 border border-gray-100">
              <p className="text-xs text-gray-400 mb-1">{new Date(fu.date).toLocaleString()}</p>
              <p className="text-sm text-gray-700">{fu.note}</p>
            </div>
          ))}
          <div className="flex gap-2 pt-2">
            <textarea
              rows={2}
              value={noteText}
              onChange={(e) => setNoteText(e.target.value)}
              placeholder="Log a call, email, or meeting note…"
              className="flex-1 border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:border-purple-400 resize-none"
              onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleAddNote(); } }}
            />
            <button onClick={handleAddNote} disabled={!noteText.trim()}
              className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-xl transition-colors disabled:opacity-40 flex items-center gap-1.5 text-sm font-semibold self-end">
              <Send className="w-4 h-4" />
            </button>
          </div>
          <p className="text-xs text-gray-400">Press Enter to save note</p>
        </div>
      </div>

      {/* Edit form */}
      <form onSubmit={handleSave} className="space-y-5">
        <Card title="Pipeline Status">
          <div className="flex flex-wrap gap-2">
            {STATUSES.map((s) => (
              <button key={s} type="button" onClick={() => setF("status", s)}
                className={`px-4 py-2 rounded-xl text-sm font-semibold border transition-colors ${form.status === s ? "bg-purple-600 text-white border-purple-600" : "bg-white text-gray-600 border-gray-200 hover:border-purple-300"}`}>
                {s}
              </button>
            ))}
          </div>
        </Card>

        <Card title="Contact Details">
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={labelCls}>Name</label>
                <input className={inputCls} value={form.name} onChange={(e) => setF("name", e.target.value)} required />
              </div>
              <div>
                <label className={labelCls}>Email</label>
                <input type="email" className={inputCls} value={form.email} onChange={(e) => setF("email", e.target.value)} required />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={labelCls}>Phone</label>
                <input className={inputCls} value={form.phone} onChange={(e) => setF("phone", e.target.value)} />
              </div>
              <div>
                <label className={labelCls}>Source</label>
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
                <input className={inputCls} value={form.travelDates} onChange={(e) => setF("travelDates", e.target.value)} />
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
              <input className={inputCls} value={form.tourInterest} onChange={(e) => setF("tourInterest", e.target.value)} />
            </div>
            <div>
              <label className={labelCls}>Message / Notes</label>
              <textarea rows={3} className={`${inputCls} resize-none`} value={form.message} onChange={(e) => setF("message", e.target.value)} />
            </div>
          </div>
        </Card>

        <div className="flex gap-3 pt-2 pb-8">
          <button type="submit" disabled={saving} className="bg-purple-600 hover:bg-purple-700 text-white font-semibold px-6 py-3 rounded-xl text-sm transition-colors disabled:opacity-60">
            {saving ? "Saving…" : "Save Changes"}
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
