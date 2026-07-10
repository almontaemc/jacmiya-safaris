"use client";

import { use, useEffect, useState } from "react";
import Link from "next/link";
import { getLeads, getTours, getSettings, getExchangeRate } from "@/lib/adminStore";
import type { Lead, AdminTour, AppSettings } from "@/types/admin";
import { ArrowLeft, Printer } from "lucide-react";

export default function QuotePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [lead, setLead] = useState<Lead | null>(null);
  const [tours, setTours] = useState<AdminTour[]>([]);
  const [settings, setSettings] = useState<AppSettings | null>(null);
  const [rate, setRate] = useState(129);
  const [quoteDate] = useState(new Date().toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" }));
  const [validUntil] = useState(() => {
    const d = new Date(); d.setDate(d.getDate() + 14);
    return d.toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" });
  });
  const [selectedTour, setSelectedTour] = useState<number | "">("");
  const [customPrice, setCustomPrice] = useState({ ksh: 0, usd: 0 });
  const [notes, setNotes] = useState("");

  useEffect(() => {
    const found = getLeads().find((l) => l.id === id);
    if (found) setLead(found);
    setTours(getTours().filter((t) => t.active));
    import("@/lib/adminStore").then((m) => {
      setSettings(m.getSettings());
      setRate(m.getExchangeRate());
    });
  }, [id]);

  const chosenTour = tours.find((t) => t.id === Number(selectedTour));

  const priceKsh = chosenTour ? chosenTour.priceksh : customPrice.ksh;
  const priceUsd = chosenTour ? chosenTour.priceusd : customPrice.usd;

  const quoteRef = `QT-${new Date().getFullYear()}-${id.replace(/\D/g, "").slice(-4).padStart(4, "0")}`;

  if (!lead) return <div className="p-6 text-gray-400">Lead not found.</div>;

  const companyName = settings?.companyName ?? "Jacmiya Safaris";
  const companyEmail = settings?.companyEmail ?? "info@jacmiyasafaris.com";
  const companyPhone = settings?.companyPhone ?? "+254 716 482 995";
  const companyAddress = settings?.companyAddress ?? "Nairobi, Kenya";
  const companyWebsite = settings?.companyWebsite ?? "https://jacmiya-safaris.vercel.app";

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Controls — hidden on print */}
      <div className="print:hidden flex items-center gap-3">
        <Link href={`/admin/leads/${id}`} className="p-2 rounded-lg hover:bg-gray-100 transition-colors text-gray-500">
          <ArrowLeft className="w-4 h-4" />
        </Link>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-gray-900">Generate Quote</h1>
          <p className="text-gray-500 text-sm">For {lead.name} · {lead.email}</p>
        </div>
        <button onClick={() => window.print()} className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold px-4 py-2.5 rounded-xl transition-colors">
          <Printer className="w-4 h-4" /> Print / PDF
        </button>
      </div>

      {/* Quote config — hidden on print */}
      <div className="print:hidden bg-white rounded-2xl shadow-sm border border-gray-100 p-5 space-y-4">
        <h2 className="font-semibold text-gray-800">Quote Configuration</h2>
        <div>
          <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wider mb-1.5">Select Tour (optional)</label>
          <select value={selectedTour} onChange={(e) => setSelectedTour(e.target.value === "" ? "" : Number(e.target.value))}
            className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-800 focus:outline-none focus:border-blue-400">
            <option value="">— Custom pricing —</option>
            {tours.map((t) => <option key={t.id} value={t.id}>{t.title} (USD {t.priceusd.toLocaleString()})</option>)}
          </select>
        </div>
        {!selectedTour && (
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wider mb-1.5">Custom Price (KSH)</label>
              <input type="number" min={0} value={customPrice.ksh || ""} onChange={(e) => setCustomPrice({ ksh: Number(e.target.value), usd: rate > 0 ? Math.round(Number(e.target.value) / rate) : customPrice.usd })}
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-blue-400" placeholder="e.g. 200000" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wider mb-1.5">Custom Price (USD)</label>
              <input type="number" min={0} value={customPrice.usd || ""} onChange={(e) => setCustomPrice({ usd: Number(e.target.value), ksh: Math.round(Number(e.target.value) * rate) })}
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-blue-400" placeholder="e.g. 1550" />
            </div>
          </div>
        )}
        <div>
          <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wider mb-1.5">Additional Quote Notes</label>
          <textarea rows={3} value={notes} onChange={(e) => setNotes(e.target.value)}
            className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:border-blue-400 resize-none"
            placeholder="Payment terms, special inclusions, visa notes, etc." />
        </div>
      </div>

      {/* ─── PRINTABLE QUOTE ─────────────────────────────────────── */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden" id="quote-document">
        {/* Header */}
        <div className="bg-[#3d5a3e] text-white px-8 py-6">
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-2xl font-bold">{companyName}</h1>
              <p className="text-white/70 text-sm mt-0.5">{companyAddress}</p>
              <p className="text-white/70 text-sm">{companyEmail} · {companyPhone}</p>
              <p className="text-white/60 text-xs mt-0.5">{companyWebsite}</p>
            </div>
            <div className="text-right">
              <div className="text-xs text-white/60 uppercase tracking-widest font-semibold">Safari Quotation</div>
              <div className="text-xl font-bold mt-1">{quoteRef}</div>
              <div className="text-sm text-white/70 mt-1">Issued: {quoteDate}</div>
              <div className="text-sm text-white/60">Valid until: {validUntil}</div>
            </div>
          </div>
        </div>

        <div className="px-8 py-6 space-y-6">
          {/* Prepared for */}
          <div className="grid grid-cols-2 gap-6">
            <div>
              <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Prepared For</div>
              <div className="font-bold text-gray-900 text-lg">{lead.name}</div>
              <div className="text-sm text-gray-600 mt-0.5">{lead.email}</div>
              {lead.phone && <div className="text-sm text-gray-600">{lead.phone}</div>}
            </div>
            <div>
              <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Safari Details</div>
              <div className="text-sm text-gray-700 space-y-1">
                <div><span className="text-gray-500">Destination:</span> {lead.destination || "TBC"}</div>
                <div><span className="text-gray-500">Travel Dates:</span> {lead.travelDates || "TBC"}</div>
                <div><span className="text-gray-500">Travellers:</span> {lead.travelers || "TBC"}</div>
                <div><span className="text-gray-500">Budget Range:</span> {lead.budget || "TBC"}</div>
              </div>
            </div>
          </div>

          {/* Tour package */}
          {(chosenTour || (priceKsh > 0 || priceUsd > 0)) && (
            <div>
              <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Proposed Package</div>
              <div className="border border-gray-200 rounded-xl overflow-hidden">
                <div className="bg-gray-50 px-5 py-3 border-b border-gray-200">
                  <div className="font-semibold text-gray-900">{chosenTour ? chosenTour.title : lead.tourInterest || "Custom Safari Package"}</div>
                  {chosenTour && (
                    <div className="text-xs text-gray-500 mt-0.5">{chosenTour.duration} · {chosenTour.groupSize} · {chosenTour.destination}</div>
                  )}
                </div>
                {chosenTour && chosenTour.highlights.length > 0 && (
                  <div className="px-5 py-4 border-b border-gray-100">
                    <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Highlights</div>
                    <div className="flex flex-wrap gap-2">
                      {chosenTour.highlights.slice(0, 8).map((h) => (
                        <span key={h} className="text-xs bg-green-50 text-green-700 px-2 py-1 rounded-full border border-green-100">{h}</span>
                      ))}
                    </div>
                  </div>
                )}
                {chosenTour && chosenTour.includes.length > 0 && (
                  <div className="px-5 py-4 border-b border-gray-100">
                    <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Included</div>
                    <div className="grid grid-cols-2 gap-1">
                      {chosenTour.includes.slice(0, 10).map((inc) => (
                        <div key={inc} className="flex items-center gap-1.5 text-xs text-gray-700">
                          <span className="text-green-500 font-bold">✓</span> {inc}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                <div className="px-5 py-4 bg-[#3d5a3e]/5">
                  <div className="flex items-center justify-between">
                    <div className="text-sm font-semibold text-gray-700">Package Price (per person)</div>
                    <div className="text-right">
                      {priceUsd > 0 && <div className="text-xl font-bold text-[#3d5a3e]">USD {priceUsd.toLocaleString()}</div>}
                      {priceKsh > 0 && <div className="text-sm text-gray-500">KSH {priceKsh.toLocaleString()}</div>}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Notes */}
          {(notes || lead.message) && (
            <div>
              <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Notes & Special Requirements</div>
              <div className="bg-amber-50 border border-amber-100 rounded-xl px-4 py-3 text-sm text-gray-700 space-y-1">
                {lead.message && <p>{lead.message}</p>}
                {notes && <p>{notes}</p>}
              </div>
            </div>
          )}

          {/* Payment terms */}
          <div>
            <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Payment Terms</div>
            <div className="text-sm text-gray-700 space-y-1">
              <p>• <strong>30% deposit</strong> required to confirm your booking</p>
              <p>• <strong>Remaining 70%</strong> due 30 days before travel date</p>
              <p>• Quote valid for <strong>14 days</strong> from date of issue</p>
              <p>• Prices quoted in USD; KSH equivalent at rate of 1 USD = {rate} KSH</p>
            </div>
          </div>

          {/* Footer */}
          <div className="border-t border-gray-200 pt-5 text-center text-xs text-gray-400">
            <p>Thank you for considering {companyName} for your safari adventure.</p>
            <p className="mt-0.5">To confirm this booking please contact us: <strong className="text-gray-600">{companyEmail}</strong> · <strong className="text-gray-600">{companyPhone}</strong></p>
          </div>
        </div>
      </div>

      <div className="pb-8 print:hidden">
        <Link href={`/admin/leads/${id}`} className="border border-gray-200 text-gray-600 hover:bg-gray-50 font-semibold px-6 py-3 rounded-xl text-sm transition-colors">
          ← Back to Lead
        </Link>
      </div>
    </div>
  );
}
