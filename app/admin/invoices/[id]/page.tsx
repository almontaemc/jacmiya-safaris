"use client";

import { use, useEffect, useState } from "react";
import Link from "next/link";
import { getInvoices, updateInvoice, getSettings, getInvoiceDisplayStatus } from "@/lib/adminStore";
import type { Invoice, InvoiceStatus, AppSettings } from "@/types/admin";
import { ArrowLeft, Printer, CheckCircle, Clock, AlertTriangle, XCircle } from "lucide-react";

const STATUSES: InvoiceStatus[] = ["Unpaid", "Paid", "Cancelled"];
const STATUS_COLOR: Record<InvoiceStatus | "Overdue", string> = {
  Unpaid: "bg-amber-100 text-amber-700",
  Overdue: "bg-red-100 text-red-700",
  Paid: "bg-green-100 text-green-700",
  Cancelled: "bg-gray-100 text-gray-600",
};
const STATUS_ICON: Record<InvoiceStatus | "Overdue", React.ElementType> = {
  Unpaid: Clock,
  Overdue: AlertTriangle,
  Paid: CheckCircle,
  Cancelled: XCircle,
};

function formatDate(iso: string) {
  if (!iso) return "TBC";
  return new Date(iso).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" });
}

export default function InvoiceDetail({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [invoice, setInvoice] = useState<Invoice | null>(null);
  const [settings, setSettings] = useState<AppSettings | null>(null);
  const [status, setStatus] = useState<InvoiceStatus>("Unpaid");
  const [notes, setNotes] = useState("");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  function load() {
    const found = getInvoices().find((i) => i.id === id);
    if (found) {
      setInvoice(found);
      setStatus(found.status);
      setNotes(found.notes);
    }
  }

  useEffect(() => {
    load();
    setSettings(getSettings());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  if (!invoice) return <div className="p-6 text-gray-400">Invoice not found.</div>;

  const companyName = settings?.companyName ?? "Jacmiya Safaris";
  const companyEmail = settings?.companyEmail ?? "info@jacmiyasafaris.com";
  const companyPhone = settings?.companyPhone ?? "+254 716 482 995";
  const companyAddress = settings?.companyAddress ?? "Nairobi, Kenya";
  const companyWebsite = settings?.companyWebsite ?? "https://jacmiya-safaris.vercel.app";

  const displayStatus = getInvoiceDisplayStatus(invoice);
  const StatusIcon = STATUS_ICON[displayStatus];

  function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    updateInvoice(id, { status, notes });
    setInvoice((prev) => (prev ? { ...prev, status, notes } : prev));
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Controls — hidden on print */}
      <div className="print:hidden flex items-center gap-3">
        <Link href="/admin/invoices" className="p-2 rounded-lg hover:bg-gray-100 transition-colors text-gray-500">
          <ArrowLeft className="w-4 h-4" />
        </Link>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-gray-900">{invoice.invoiceNumber}</h1>
          <p className="text-gray-500 text-sm">{invoice.clientName} · {invoice.clientEmail}</p>
        </div>
        <button onClick={() => window.print()} className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold px-4 py-2.5 rounded-xl transition-colors">
          <Printer className="w-4 h-4" /> Print / PDF
        </button>
      </div>

      <div className={`print:hidden flex items-center gap-2 w-fit px-4 py-2 rounded-full text-sm font-semibold ${STATUS_COLOR[displayStatus]}`}>
        <StatusIcon className="w-4 h-4" />
        {displayStatus}
      </div>

      {/* ─── PRINTABLE INVOICE ─────────────────────────────────────── */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden" id="invoice-document">
        <div className="bg-[#3d5a3e] text-white px-8 py-6">
          <div className="flex items-start justify-between gap-6">
            <div className="flex items-start gap-4">
              <div className="bg-white rounded-xl p-2 flex-shrink-0">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="/logo.png" alt="Jacmiya Safaris" className="h-14 w-auto" />
              </div>
              <div>
                <h1 className="text-2xl font-bold">{companyName}</h1>
                <p className="text-white/70 text-sm mt-0.5">{companyAddress}</p>
                <p className="text-white/70 text-sm">{companyEmail} · {companyPhone}</p>
                <p className="text-white/70 text-sm">Europe: rashmi@jacmiyasafaris.com · +41 76 686 11 93</p>
                <p className="text-white/60 text-xs mt-0.5">{companyWebsite}</p>
              </div>
            </div>
            <div className="text-right flex-shrink-0">
              <div className="text-xs text-white/60 uppercase tracking-widest font-semibold">Invoice</div>
              <div className="text-xl font-bold mt-1">{invoice.invoiceNumber}</div>
              <div className="text-sm text-white/70 mt-1">Issued: {formatDate(invoice.issueDate)}</div>
              <div className="text-sm text-white/60">Due: {formatDate(invoice.dueDate)}</div>
            </div>
          </div>
        </div>

        <div className="px-8 py-6 space-y-6">
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div>
              <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Bill To</div>
              <div className="font-bold text-gray-900 text-lg">{invoice.clientName}</div>
              <div className="text-sm text-gray-600 mt-0.5">{invoice.clientEmail}</div>
              {invoice.clientPhone && <div className="text-sm text-gray-600">{invoice.clientPhone}</div>}
            </div>
            <div className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold ${STATUS_COLOR[displayStatus]}`}>
              <StatusIcon className="w-4 h-4" />
              {displayStatus}
            </div>
          </div>

          <div className="border border-gray-200 rounded-xl overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Description</th>
                  <th className="text-right px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Qty</th>
                  <th className="text-right px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Unit (USD)</th>
                  <th className="text-right px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Total (USD)</th>
                  <th className="text-right px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Total (KSH)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {invoice.items.map((item) => (
                  <tr key={item.id}>
                    <td className="px-5 py-3 text-gray-700">{item.description}</td>
                    <td className="px-5 py-3 text-right text-gray-700">{item.quantity}</td>
                    <td className="px-5 py-3 text-right text-gray-700">{item.unitPriceUsd.toLocaleString()}</td>
                    <td className="px-5 py-3 text-right font-semibold text-gray-900">{(item.quantity * item.unitPriceUsd).toLocaleString()}</td>
                    <td className="px-5 py-3 text-right text-gray-500">{(item.quantity * item.unitPriceKsh).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="border-t-2 border-gray-200 bg-[#3d5a3e]/5 font-bold">
                  <td colSpan={3} className="px-5 py-4 text-gray-800">Total Due</td>
                  <td className="px-5 py-4 text-right text-base text-[#3d5a3e]">USD {invoice.amountUsd.toLocaleString()}</td>
                  <td className="px-5 py-4 text-right text-gray-600">KSH {invoice.amountKsh.toLocaleString()}</td>
                </tr>
              </tfoot>
            </table>
          </div>

          {invoice.notes && (
            <div>
              <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Notes</div>
              <div className="bg-amber-50 border border-amber-100 rounded-xl px-4 py-3 text-sm text-gray-700">{invoice.notes}</div>
            </div>
          )}

          <div className="border-t border-gray-200 pt-5 text-center text-xs text-gray-400">
            <p>Thank you for choosing {companyName}.</p>
            <p className="mt-0.5">Payment queries: <strong className="text-gray-600">{companyEmail}</strong> · <strong className="text-gray-600">{companyPhone}</strong></p>
          </div>
        </div>
      </div>

      {/* Update form — hidden on print */}
      <form onSubmit={handleSave} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 space-y-4 print:hidden">
        <h2 className="font-semibold text-gray-800">Update Invoice</h2>
        <div>
          <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wider mb-1.5">Status</label>
          <div className="flex flex-wrap gap-2">
            {STATUSES.map((s) => {
              const Icon = STATUS_ICON[s];
              return (
                <button key={s} type="button" onClick={() => setStatus(s)}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold border transition-colors ${status === s ? STATUS_COLOR[s] + " border-current" : "bg-white text-gray-500 border-gray-200 hover:border-gray-300"}`}>
                  <Icon className="w-3.5 h-3.5" /> {s}
                </button>
              );
            })}
          </div>
          {status === "Unpaid" && <p className="text-xs text-gray-400 mt-1.5">Automatically shows as &ldquo;Overdue&rdquo; once past the due date.</p>}
        </div>
        <div>
          <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wider mb-1.5">Notes</label>
          <textarea rows={3} value={notes} onChange={(e) => setNotes(e.target.value)}
            className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:border-blue-400 resize-none"
            placeholder="Payment instructions, bank details, terms…" />
        </div>
        <div className="flex items-center gap-3">
          <button type="submit" disabled={saving} className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-5 py-2.5 rounded-xl text-sm transition-colors disabled:opacity-60">
            {saving ? "Saving…" : "Save Changes"}
          </button>
          {saved && <span className="flex items-center gap-1.5 text-blue-600 text-sm font-medium"><CheckCircle className="w-4 h-4" /> Saved</span>}
        </div>
      </form>

      <div className="pb-8 print:hidden">
        <Link href="/admin/invoices" className="border border-gray-200 text-gray-600 hover:bg-gray-50 font-semibold px-6 py-3 rounded-xl text-sm transition-colors">
          ← Back to Invoices
        </Link>
      </div>
    </div>
  );
}
