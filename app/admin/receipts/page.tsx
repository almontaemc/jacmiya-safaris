"use client";

import { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import { getReceipts, deleteReceipt, getInvoices } from "@/lib/adminStore";
import type { Receipt, PaymentMethod, Invoice } from "@/types/admin";
import { Plus, Trash2, BadgeCheck, Wallet, CalendarClock } from "lucide-react";

const METHODS: PaymentMethod[] = ["M-Pesa", "Bank Transfer", "Cash", "Card", "PayPal", "Cheque", "Other"];

const METHOD_COLOR: Record<PaymentMethod, string> = {
  "M-Pesa": "bg-green-100 text-green-700",
  "Bank Transfer": "bg-blue-100 text-blue-700",
  Cash: "bg-amber-100 text-amber-700",
  Card: "bg-purple-100 text-purple-700",
  PayPal: "bg-sky-100 text-sky-700",
  Cheque: "bg-indigo-100 text-indigo-700",
  Other: "bg-gray-100 text-gray-600",
};

function isThisMonth(iso: string) {
  if (!iso) return false;
  const d = new Date(iso);
  const now = new Date();
  return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
}

export default function ReceiptsPage() {
  const [receipts, setReceipts] = useState<Receipt[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [filter, setFilter] = useState<"All" | PaymentMethod>("All");

  function load() {
    setReceipts(getReceipts());
    setInvoices(getInvoices());
  }
  useEffect(() => { load(); }, []);

  const sorted = useMemo(
    () => [...receipts].sort((a, b) => new Date(b.paymentDate).getTime() - new Date(a.paymentDate).getTime()),
    [receipts]
  );
  const filtered = useMemo(
    () => (filter === "All" ? sorted : sorted.filter((r) => r.method === filter)),
    [sorted, filter]
  );

  const totalUsd = receipts.reduce((a, r) => a + r.amountUsd, 0);
  const totalKsh = receipts.reduce((a, r) => a + r.amountKsh, 0);
  const thisMonth = receipts.filter((r) => isThisMonth(r.paymentDate));
  const thisMonthUsd = thisMonth.reduce((a, r) => a + r.amountUsd, 0);

  function invoiceNumberFor(invoiceId?: string) {
    if (!invoiceId) return null;
    return invoices.find((i) => i.id === invoiceId)?.invoiceNumber ?? null;
  }

  function handleDelete(id: string) {
    if (!confirm("Delete this receipt? If it was paying off an invoice, that invoice goes back to Unpaid.")) return;
    deleteReceipt(id);
    load();
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Receipts</h1>
          <p className="text-gray-500 text-sm mt-0.5">Money received — issue a receipt every time a client pays</p>
        </div>
        <Link href="/admin/receipts/new" className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold px-4 py-2.5 rounded-xl transition-colors">
          <Plus className="w-4 h-4" /> Record Payment
        </Link>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-8 h-8 bg-green-50 rounded-lg flex items-center justify-center"><Wallet className="w-4 h-4 text-green-600" /></div>
            <span className="text-sm font-medium text-gray-600">Total Collected</span>
          </div>
          <div className="text-xl font-bold text-gray-900">USD {totalUsd.toLocaleString()}</div>
          <div className="text-sm text-gray-500 mt-0.5">KSH {totalKsh.toLocaleString()}</div>
        </div>
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-8 h-8 bg-blue-50 rounded-lg flex items-center justify-center"><CalendarClock className="w-4 h-4 text-blue-600" /></div>
            <span className="text-sm font-medium text-gray-600">This Month</span>
          </div>
          <div className="text-xl font-bold text-gray-900">USD {thisMonthUsd.toLocaleString()}</div>
          <div className="text-xs text-gray-400 mt-1">{thisMonth.length} payment{thisMonth.length !== 1 ? "s" : ""} received</div>
        </div>
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-8 h-8 bg-amber-50 rounded-lg flex items-center justify-center"><BadgeCheck className="w-4 h-4 text-amber-600" /></div>
            <span className="text-sm font-medium text-gray-600">Receipts Issued</span>
          </div>
          <div className="text-xl font-bold text-gray-900">{receipts.length}</div>
          <div className="text-xs text-gray-400 mt-1">{receipts.filter((r) => !r.invoiceId).length} without an invoice</div>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100">
        <div className="flex gap-1 px-5 py-4 border-b border-gray-100 flex-wrap">
          {(["All", ...METHODS] as const).map((m) => (
            <button key={m} onClick={() => setFilter(m)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${filter === m ? "bg-blue-600 text-white" : "text-gray-600 hover:bg-gray-100"}`}>
              {m} ({m === "All" ? receipts.length : receipts.filter((r) => r.method === m).length})
            </button>
          ))}
        </div>

        <div className="divide-y divide-gray-50">
          {filtered.length === 0 && (
            <div className="py-16 text-center text-gray-400 text-sm">
              No receipts yet. Record a payment to issue the first one.
            </div>
          )}
          {filtered.map((r) => {
            const invNo = invoiceNumberFor(r.invoiceId);
            return (
              <div key={r.id} className="px-5 py-4 flex items-start gap-4">
                <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                  <span className="text-green-700 font-bold text-sm">{r.clientName.charAt(0)}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <Link href={`/admin/receipts/${r.id}`} className="text-sm font-semibold text-gray-800 hover:text-blue-600">{r.receiptNumber}</Link>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${METHOD_COLOR[r.method]}`}>{r.method}</span>
                    <span className="text-xs bg-gray-50 text-gray-600 px-2 py-0.5 rounded-full">{r.purpose}</span>
                    {invNo
                      ? <span className="text-xs bg-purple-50 text-purple-600 px-2 py-0.5 rounded-full">{invNo}</span>
                      : <span className="text-xs bg-gray-50 text-gray-400 px-2 py-0.5 rounded-full">Standalone</span>}
                  </div>
                  <p className="text-sm text-gray-700 mt-1 font-medium">{r.clientName}</p>
                  <p className="text-xs text-gray-500">{r.clientEmail} {r.clientPhone && `· ${r.clientPhone}`}</p>
                  <p className="text-xs text-gray-400 mt-0.5">
                    Paid {r.paymentDate}{r.reference && ` · Ref ${r.reference}`}
                  </p>
                </div>
                <div className="text-right flex-shrink-0">
                  <div className="text-sm font-bold text-green-700">USD {r.amountUsd.toLocaleString()}</div>
                  <div className="text-xs text-gray-500">KSH {r.amountKsh.toLocaleString()}</div>
                  <div className="flex items-center gap-1 mt-2 justify-end">
                    <Link href={`/admin/receipts/${r.id}`} className="text-xs font-semibold text-blue-600 hover:text-blue-700 px-2 py-1">View</Link>
                    <button onClick={() => handleDelete(r.id)} className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"><Trash2 className="w-4 h-4" /></button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
