"use client";

import { use, useEffect, useState } from "react";
import Link from "next/link";
import { getSales, updateSale, getSettings } from "@/lib/adminStore";
import type { Sale, PaymentStatus, AppSettings } from "@/types/admin";
import { ArrowLeft, Printer, CheckCircle, Clock, AlertCircle, XCircle, RefreshCw, Mail } from "lucide-react";

const PAYMENT_STATUSES: PaymentStatus[] = ["Pending Deposit", "Deposit Paid", "Fully Paid", "Refunded", "Cancelled"];
const PAY_COLOR: Record<PaymentStatus, string> = {
  "Pending Deposit": "bg-amber-100 text-amber-700",
  "Deposit Paid": "bg-blue-100 text-blue-700",
  "Fully Paid": "bg-green-100 text-green-700",
  "Refunded": "bg-gray-100 text-gray-600",
  "Cancelled": "bg-red-100 text-red-700",
};
const PAY_ICON: Record<PaymentStatus, React.ElementType> = {
  "Pending Deposit": Clock,
  "Deposit Paid": AlertCircle,
  "Fully Paid": CheckCircle,
  "Refunded": RefreshCw,
  "Cancelled": XCircle,
};

export default function SaleDetail({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [sale, setSale] = useState<Sale | null>(null);
  const [settings, setSettings] = useState<AppSettings | null>(null);
  const [status, setStatus] = useState<PaymentStatus>("Pending Deposit");
  const [notes, setNotes] = useState("");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [emailing, setEmailing] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const [emailError, setEmailError] = useState("");

  function load() {
    const found = getSales().find((s) => s.id === id);
    if (found) {
      setSale(found);
      setStatus(found.paymentStatus);
      setNotes(found.notes);
    }
  }

  useEffect(() => {
    load();
    import("@/lib/adminStore").then((m) => setSettings(m.getSettings()));
  }, [id]);

  if (!sale) return <div className="p-6 text-gray-400">Booking not found.</div>;

  const companyName = settings?.companyName ?? "Jacmiya Safaris";
  const companyEmail = settings?.companyEmail ?? "info@jacmiyasafaris.com";
  const companyPhone = settings?.companyPhone ?? "+254 716 482 995";
  const companyAddress = settings?.companyAddress ?? "Nairobi, Kenya";

  const balanceKsh = sale.amountKsh - sale.depositKsh;
  const balanceUsd = sale.amountUsd - sale.depositUsd;
  const nights = sale.travelFrom && sale.travelTo
    ? Math.max(0, Math.round((new Date(sale.travelTo).getTime() - new Date(sale.travelFrom).getTime()) / 86400000))
    : 0;

  async function handleEmailClient() {
    if (!sale) return;
    setEmailing(true);
    setEmailError("");
    try {
      const res = await fetch("/api/booking-confirmation", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          clientName: sale.clientName,
          clientEmail: sale.clientEmail,
          clientPhone: sale.clientPhone,
          bookingRef: sale.bookingRef,
          tourTitle: sale.tourTitle,
          travelFrom: sale.travelFrom,
          travelTo: sale.travelTo,
          pax: sale.pax,
          amountKsh: sale.amountKsh,
          amountUsd: sale.amountUsd,
          depositKsh: sale.depositKsh,
          depositUsd: sale.depositUsd,
          paymentStatus: sale.paymentStatus,
          notes: sale.notes,
          companyName: companyName,
          companyPhone: settings?.companyPhone ?? "+254 116 482 995",
          companyEmail: settings?.companyEmail ?? "info@jacmiyasafaris.com",
        }),
      });
      const data = await res.json();
      if (data.ok) {
        setEmailSent(true);
        setTimeout(() => setEmailSent(false), 5000);
      } else {
        setEmailError("Failed to send — check that RESEND_API_KEY is set in Vercel.");
      }
    } catch {
      setEmailError("Network error sending email.");
    }
    setEmailing(false);
  }

  function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    updateSale(id, { paymentStatus: status, notes });
    setSale((prev) => prev ? { ...prev, paymentStatus: status, notes } : prev);
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  }

  const StatusIcon = PAY_ICON[status];

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3 print:hidden">
        <Link href="/admin/sales" className="p-2 rounded-lg hover:bg-gray-100 transition-colors text-gray-500">
          <ArrowLeft className="w-4 h-4" />
        </Link>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-gray-900">{sale.bookingRef}</h1>
          <p className="text-gray-500 text-sm">{sale.clientName} · {sale.tourTitle}</p>
        </div>
        <button onClick={handleEmailClient} disabled={emailing}
          className="flex items-center gap-2 border border-blue-200 text-blue-700 bg-blue-50 hover:bg-blue-100 text-sm font-semibold px-4 py-2.5 rounded-xl transition-colors disabled:opacity-60">
          <Mail className="w-4 h-4" />
          {emailing ? "Sending…" : emailSent ? "Sent ✓" : "Email Client"}
        </button>
        <button onClick={() => window.print()} className="flex items-center gap-2 border border-gray-200 text-gray-600 hover:bg-gray-50 text-sm font-semibold px-4 py-2.5 rounded-xl transition-colors">
          <Printer className="w-4 h-4" /> Print Confirmation
        </button>
      </div>
      {emailError && (
        <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-sm text-red-700 print:hidden">
          {emailError}
        </div>
      )}

      {/* Print header */}
      <div className="hidden print:block mb-8 border-b border-gray-300 pb-6">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{companyName}</h1>
            <p className="text-gray-600 text-sm">{companyAddress}</p>
            <p className="text-gray-600 text-sm">{companyEmail} · {companyPhone}</p>
          </div>
          <div className="text-right">
            <div className="text-sm font-bold text-gray-500 uppercase tracking-widest">Booking Confirmation</div>
            <div className="text-2xl font-bold text-gray-900 mt-1">{sale.bookingRef}</div>
          </div>
        </div>
      </div>

      {/* Status badge */}
      {(() => { const SIcon = PAY_ICON[sale.paymentStatus]; return (
        <div className={`flex items-center gap-2 w-fit px-4 py-2 rounded-full text-sm font-semibold ${PAY_COLOR[sale.paymentStatus]}`}>
          <SIcon className="w-4 h-4" />
          {sale.paymentStatus}
        </div>
      ); })()}

      {/* Client + Trip info */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
          <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Client Details</h2>
          <div className="space-y-2.5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                <span className="text-blue-700 font-bold">{sale.clientName.charAt(0)}</span>
              </div>
              <div>
                <div className="font-semibold text-gray-900">{sale.clientName}</div>
                <div className="text-xs text-gray-400">{sale.pax} traveller{sale.pax !== 1 ? "s" : ""}</div>
              </div>
            </div>
            <div className="text-sm text-gray-600 space-y-1 pt-1">
              <div>{sale.clientEmail}</div>
              <div>{sale.clientPhone}</div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
          <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Trip Details</h2>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between"><span className="text-gray-500">Tour</span><span className="font-medium text-gray-800 text-right max-w-[60%]">{sale.tourTitle}</span></div>
            <div className="flex justify-between"><span className="text-gray-500">From</span><span className="font-medium text-gray-800">{sale.travelFrom || "TBC"}</span></div>
            <div className="flex justify-between"><span className="text-gray-500">To</span><span className="font-medium text-gray-800">{sale.travelTo || "TBC"}</span></div>
            {nights > 0 && <div className="flex justify-between"><span className="text-gray-500">Duration</span><span className="font-medium text-gray-800">{nights} night{nights !== 1 ? "s" : ""}</span></div>}
            <div className="flex justify-between"><span className="text-gray-500">Pax</span><span className="font-medium text-gray-800">{sale.pax}</span></div>
            <div className="flex justify-between"><span className="text-gray-500">Ref</span><span className="font-mono text-xs text-gray-600 font-semibold">{sale.bookingRef}</span></div>
          </div>
        </div>
      </div>

      {/* Payment breakdown */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-100">
          <h2 className="font-semibold text-gray-800">Payment Summary</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Description</th>
                <th className="text-right px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">KSH</th>
                <th className="text-right px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">USD</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              <tr>
                <td className="px-5 py-3 text-gray-700">Total Package ({sale.pax} pax × {sale.tourTitle})</td>
                <td className="px-5 py-3 text-right font-semibold text-gray-900">{sale.amountKsh.toLocaleString()}</td>
                <td className="px-5 py-3 text-right font-semibold text-gray-900">{sale.amountUsd.toLocaleString()}</td>
              </tr>
              <tr>
                <td className="px-5 py-3 text-gray-600">Deposit Paid</td>
                <td className="px-5 py-3 text-right text-green-600">({sale.depositKsh.toLocaleString()})</td>
                <td className="px-5 py-3 text-right text-green-600">({sale.depositUsd.toLocaleString()})</td>
              </tr>
            </tbody>
            <tfoot>
              <tr className={`border-t-2 font-bold ${balanceKsh <= 0 ? "bg-green-50 border-green-200" : "bg-amber-50 border-amber-200"}`}>
                <td className="px-5 py-4 text-gray-800">Balance Due</td>
                <td className={`px-5 py-4 text-right text-base ${balanceKsh <= 0 ? "text-green-700" : "text-amber-700"}`}>
                  {balanceKsh <= 0 ? "PAID IN FULL" : `KSH ${balanceKsh.toLocaleString()}`}
                </td>
                <td className={`px-5 py-4 text-right ${balanceKsh <= 0 ? "text-green-600" : "text-amber-600"}`}>
                  {balanceUsd <= 0 ? "—" : `USD ${balanceUsd.toLocaleString()}`}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

      {/* Notes on print */}
      {sale.notes && (
        <div className="bg-gray-50 rounded-2xl border border-gray-100 p-5">
          <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Notes</h3>
          <p className="text-sm text-gray-700">{sale.notes}</p>
        </div>
      )}

      {/* Print footer */}
      <div className="hidden print:block mt-8 pt-6 border-t border-gray-200 text-xs text-gray-500 text-center">
        <p>Thank you for choosing {companyName}. For queries: {companyEmail} · {companyPhone}</p>
        <p className="mt-1">This document was generated on {new Date().toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })}</p>
      </div>

      {/* Edit form — hidden on print */}
      <form onSubmit={handleSave} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 space-y-4 print:hidden">
        <h2 className="font-semibold text-gray-800">Update Booking</h2>
        <div>
          <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wider mb-1.5">Payment Status</label>
          <div className="flex flex-wrap gap-2">
            {PAYMENT_STATUSES.map((s) => {
              const Icon = PAY_ICON[s];
              return (
                <button key={s} type="button" onClick={() => setStatus(s)}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold border transition-colors ${status === s ? PAY_COLOR[s] + " border-current" : "bg-white text-gray-500 border-gray-200 hover:border-gray-300"}`}>
                  <Icon className="w-3.5 h-3.5" /> {s}
                </button>
              );
            })}
          </div>
        </div>
        <div>
          <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wider mb-1.5">Notes</label>
          <textarea rows={3} value={notes} onChange={(e) => setNotes(e.target.value)}
            className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:border-emerald-400 resize-none"
            placeholder="Special requirements, meal preferences, internal notes…" />
        </div>
        <div className="flex items-center gap-3">
          <button type="submit" disabled={saving} className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold px-5 py-2.5 rounded-xl text-sm transition-colors disabled:opacity-60">
            {saving ? "Saving…" : "Save Changes"}
          </button>
          {saved && <span className="flex items-center gap-1.5 text-emerald-600 text-sm font-medium"><CheckCircle className="w-4 h-4" /> Saved</span>}
        </div>
      </form>

      <div className="pb-8 print:hidden">
        <Link href="/admin/sales" className="border border-gray-200 text-gray-600 hover:bg-gray-50 font-semibold px-6 py-3 rounded-xl text-sm transition-colors">
          ← Back to Bookings
        </Link>
      </div>
    </div>
  );
}
