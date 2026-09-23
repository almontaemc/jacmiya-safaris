"use client";

import { use, useEffect, useState } from "react";
import Link from "next/link";
import {
  getReceipts, updateReceipt, getSettings, getInvoices, getInvoiceBalance, getInvoicePaid,
} from "@/lib/adminStore";
import type { Receipt, Invoice, AppSettings } from "@/types/admin";
import { ArrowLeft, Printer, CheckCircle, BadgeCheck } from "lucide-react";

function formatDate(iso: string) {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" });
}

export default function ReceiptDetail({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [receipt, setReceipt] = useState<Receipt | null>(null);
  const [invoice, setInvoice] = useState<Invoice | null>(null);
  const [settings, setSettings] = useState<AppSettings | null>(null);
  const [reference, setReference] = useState("");
  const [notes, setNotes] = useState("");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  function load() {
    const found = getReceipts().find((r) => r.id === id);
    if (!found) return;
    setReceipt(found);
    setReference(found.reference);
    setNotes(found.notes);
    setInvoice(found.invoiceId ? getInvoices().find((i) => i.id === found.invoiceId) ?? null : null);
  }

  useEffect(() => {
    load();
    setSettings(getSettings());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  // Same portrait-A4 swap the invoice document uses — the shared admin print rule
  // is landscape for wide report tables, which would waste half the page here.
  useEffect(() => {
    const styleEl = document.getElementById("admin-print-style") as HTMLStyleElement | null;
    const sheet = styleEl?.sheet;
    if (!sheet) return;
    const mediaRule = Array.from(sheet.cssRules).find(
      (r): r is CSSMediaRule => r instanceof CSSMediaRule && r.media.mediaText.includes("print")
    );
    if (!mediaRule) return;
    const pageIdx = Array.from(mediaRule.cssRules).findIndex((r) => r instanceof CSSPageRule);
    if (pageIdx === -1) return;
    const original = mediaRule.cssRules[pageIdx].cssText;
    mediaRule.deleteRule(pageIdx);
    mediaRule.insertRule("@page { size: A4 portrait; margin: 1.2cm; }", pageIdx);
    return () => {
      try {
        mediaRule.deleteRule(pageIdx);
        mediaRule.insertRule(original, pageIdx);
      } catch { /* style tag already gone */ }
    };
  }, []);

  if (!receipt) return <div className="p-6 text-gray-400">Receipt not found.</div>;

  const companyName = settings?.companyName ?? "Jacmiya Safaris";
  const companyEmail = settings?.companyEmail ?? "info@jacmiyasafaris.com";
  const companyPhone = settings?.companyPhone ?? "+254 716 482 995";
  const companyAddress = settings?.companyAddress ?? "Nairobi, Kenya";
  const companyWebsite = settings?.companyWebsite ?? "https://www.jacmiyasafaris.com";

  const paid = invoice ? getInvoicePaid(invoice.id) : null;
  const balance = invoice ? getInvoiceBalance(invoice) : null;
  const settled = balance !== null && balance.usd <= 0;

  function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    updateReceipt(id, { reference, notes });
    setReceipt((prev) => (prev ? { ...prev, reference, notes } : prev));
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Controls — hidden on print */}
      <div className="print:hidden flex items-center gap-3">
        <Link href="/admin/receipts" className="p-2 rounded-lg hover:bg-gray-100 transition-colors text-gray-500">
          <ArrowLeft className="w-4 h-4" />
        </Link>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-gray-900">{receipt.receiptNumber}</h1>
          <p className="text-gray-500 text-sm">{receipt.clientName}{receipt.clientEmail && ` · ${receipt.clientEmail}`}</p>
        </div>
        <button onClick={() => window.print()} className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold px-4 py-2.5 rounded-xl transition-colors">
          <Printer className="w-4 h-4" /> Print / PDF
        </button>
      </div>

      <div className="print:hidden flex items-center gap-2 w-fit px-4 py-2 rounded-full text-sm font-semibold bg-green-100 text-green-700">
        <CheckCircle className="w-4 h-4" />
        Payment Received
      </div>

      {/* ─── PRINTABLE RECEIPT ─────────────────────────────────────── */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden" id="receipt-document">
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
              <div className="text-xs text-white/60 uppercase tracking-widest font-semibold">Receipt</div>
              <div className="text-xl font-bold mt-1">{receipt.receiptNumber}</div>
              <div className="text-sm text-white/70 mt-1">Received: {formatDate(receipt.paymentDate)}</div>
              {invoice && <div className="text-sm text-white/60">For invoice {invoice.invoiceNumber}</div>}
            </div>
          </div>
        </div>

        <div className="px-8 py-6 space-y-6">
          <div className="flex items-start justify-between flex-wrap gap-3">
            <div>
              <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Received From</div>
              <div className="font-bold text-gray-900 text-lg">{receipt.clientName}</div>
              {receipt.clientEmail && <div className="text-sm text-gray-600 mt-0.5">{receipt.clientEmail}</div>}
              {receipt.clientPhone && <div className="text-sm text-gray-600">{receipt.clientPhone}</div>}
            </div>
            <div className="text-right">
              <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Amount Received</div>
              <div className="text-2xl font-bold text-[#3d5a3e]">USD {receipt.amountUsd.toLocaleString()}</div>
              <div className="text-sm text-gray-500">KSH {receipt.amountKsh.toLocaleString()}</div>
            </div>
          </div>

          <div className="border border-gray-200 rounded-xl overflow-hidden">
            <table className="w-full text-sm">
              <tbody className="divide-y divide-gray-100">
                <tr>
                  <td className="px-5 py-3 text-gray-500 w-1/3">Payment for</td>
                  <td className="px-5 py-3 font-medium text-gray-800">
                    {receipt.purpose}
                    {invoice && <span className="text-gray-500"> — invoice {invoice.invoiceNumber}</span>}
                  </td>
                </tr>
                <tr>
                  <td className="px-5 py-3 text-gray-500">Payment method</td>
                  <td className="px-5 py-3 font-medium text-gray-800">{receipt.method}</td>
                </tr>
                {receipt.reference && (
                  <tr>
                    <td className="px-5 py-3 text-gray-500">Reference</td>
                    <td className="px-5 py-3 font-medium text-gray-800">{receipt.reference}</td>
                  </tr>
                )}
                <tr>
                  <td className="px-5 py-3 text-gray-500">Date received</td>
                  <td className="px-5 py-3 font-medium text-gray-800">{formatDate(receipt.paymentDate)}</td>
                </tr>
              </tbody>
            </table>
          </div>

          {invoice && paid && balance && (
            <div>
              <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                Invoice {invoice.invoiceNumber} Summary
              </div>
              <div className="border border-gray-200 rounded-xl overflow-hidden">
                <table className="w-full text-sm">
                  <tbody className="divide-y divide-gray-100">
                    <tr>
                      <td className="px-5 py-3 text-gray-600">Invoice total</td>
                      <td className="px-5 py-3 text-right text-gray-800">USD {invoice.amountUsd.toLocaleString()}</td>
                      <td className="px-5 py-3 text-right text-gray-500">KSH {invoice.amountKsh.toLocaleString()}</td>
                    </tr>
                    <tr>
                      <td className="px-5 py-3 text-gray-600">Total received to date</td>
                      <td className="px-5 py-3 text-right text-green-700 font-semibold">USD {paid.usd.toLocaleString()}</td>
                      <td className="px-5 py-3 text-right text-gray-500">KSH {paid.ksh.toLocaleString()}</td>
                    </tr>
                    <tr className="bg-[#3d5a3e]/5 font-bold">
                      <td className="px-5 py-4 text-gray-800">Balance remaining</td>
                      <td className="px-5 py-4 text-right text-[#3d5a3e]">USD {Math.max(balance.usd, 0).toLocaleString()}</td>
                      <td className="px-5 py-4 text-right text-gray-600">KSH {Math.max(balance.ksh, 0).toLocaleString()}</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {settled && (
                <div className="mt-4 flex items-center gap-2 w-fit border-2 border-green-600 text-green-700 rounded-lg px-4 py-2 font-bold tracking-widest text-sm">
                  <BadgeCheck className="w-4 h-4" /> PAID IN FULL
                </div>
              )}
            </div>
          )}

          {receipt.notes && (
            <div>
              <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Notes</div>
              <div className="bg-amber-50 border border-amber-100 rounded-xl px-4 py-3 text-sm text-gray-700">{receipt.notes}</div>
            </div>
          )}

          <div className="border-t border-gray-200 pt-5 text-center text-xs text-gray-400">
            <p>This receipt confirms payment received by {companyName}. Thank you.</p>
            <p className="mt-0.5">Payment queries: <strong className="text-gray-600">{companyEmail}</strong> · <strong className="text-gray-600">{companyPhone}</strong></p>
          </div>
        </div>
      </div>

      {/* Update form — hidden on print */}
      <form onSubmit={handleSave} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 space-y-4 print:hidden">
        <h2 className="font-semibold text-gray-800">Update Receipt</h2>
        <p className="text-xs text-gray-400 -mt-2">
          Amounts are locked once a receipt is issued — delete and re-record the payment if a figure is wrong.
        </p>
        <div>
          <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wider mb-1.5">Transaction / Reference No.</label>
          <input value={reference} onChange={(e) => setReference(e.target.value)}
            className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:border-blue-400"
            placeholder="M-Pesa code, bank ref, cheque no." />
        </div>
        <div>
          <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wider mb-1.5">Notes</label>
          <textarea rows={3} value={notes} onChange={(e) => setNotes(e.target.value)}
            className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:border-blue-400 resize-none"
            placeholder="Anything worth noting about this payment…" />
        </div>
        <div className="flex items-center gap-3">
          <button type="submit" disabled={saving} className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-5 py-2.5 rounded-xl text-sm transition-colors disabled:opacity-60">
            {saving ? "Saving…" : "Save Changes"}
          </button>
          {saved && <span className="flex items-center gap-1.5 text-blue-600 text-sm font-medium"><CheckCircle className="w-4 h-4" /> Saved</span>}
        </div>
      </form>

      <div className="pb-8 print:hidden flex gap-3">
        <Link href="/admin/receipts" className="border border-gray-200 text-gray-600 hover:bg-gray-50 font-semibold px-6 py-3 rounded-xl text-sm transition-colors">
          ← Back to Receipts
        </Link>
        {invoice && (
          <Link href={`/admin/invoices/${invoice.id}`} className="border border-gray-200 text-gray-600 hover:bg-gray-50 font-semibold px-6 py-3 rounded-xl text-sm transition-colors">
            View invoice {invoice.invoiceNumber}
          </Link>
        )}
      </div>
    </div>
  );
}
