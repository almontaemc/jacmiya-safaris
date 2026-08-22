"use client";

import { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import { getInvoices, deleteInvoice, getInvoiceDisplayStatus } from "@/lib/adminStore";
import type { Invoice, InvoiceStatus } from "@/types/admin";
import { Plus, Trash2, FileText, AlertTriangle, TrendingUp } from "lucide-react";

type DisplayStatus = InvoiceStatus | "Overdue";
const FILTERS: DisplayStatus[] = ["Unpaid", "Overdue", "Paid", "Cancelled"];
const STATUS_COLOR: Record<DisplayStatus, string> = {
  Unpaid: "bg-amber-100 text-amber-700",
  Overdue: "bg-red-100 text-red-700",
  Paid: "bg-green-100 text-green-700",
  Cancelled: "bg-gray-100 text-gray-600",
};

export default function InvoicesPage() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [filter, setFilter] = useState<"All" | DisplayStatus>("All");

  function load() { setInvoices(getInvoices()); }
  useEffect(() => { load(); }, []);

  const sorted = useMemo(() => [...invoices].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()), [invoices]);
  const withStatus = useMemo(() => sorted.map((inv) => ({ inv, status: getInvoiceDisplayStatus(inv) })), [sorted]);
  const filtered = useMemo(() => filter === "All" ? withStatus : withStatus.filter((x) => x.status === filter), [withStatus, filter]);

  const totalUsd = invoices.reduce((a, i) => a + i.amountUsd, 0);
  const totalKsh = invoices.reduce((a, i) => a + i.amountKsh, 0);
  const outstanding = withStatus.filter((x) => x.status === "Unpaid" || x.status === "Overdue");
  const outstandingUsd = outstanding.reduce((a, x) => a + x.inv.amountUsd, 0);
  const overdueCount = withStatus.filter((x) => x.status === "Overdue").length;

  function handleDelete(id: string) {
    if (!confirm("Delete this invoice?")) return;
    deleteInvoice(id);
    load();
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Invoices</h1>
          <p className="text-gray-500 text-sm mt-0.5">Generate, send, and track client invoices</p>
        </div>
        <Link href="/admin/invoices/new" className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold px-4 py-2.5 rounded-xl transition-colors">
          <Plus className="w-4 h-4" /> New Invoice
        </Link>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-8 h-8 bg-blue-50 rounded-lg flex items-center justify-center"><FileText className="w-4 h-4 text-blue-600" /></div>
            <span className="text-sm font-medium text-gray-600">Total Invoiced</span>
          </div>
          <div className="text-xl font-bold text-gray-900">USD {totalUsd.toLocaleString()}</div>
          <div className="text-sm text-gray-500 mt-0.5">KSH {totalKsh.toLocaleString()}</div>
          <div className="text-xs text-gray-400 mt-1">{invoices.length} invoice{invoices.length !== 1 ? "s" : ""}</div>
        </div>
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-8 h-8 bg-amber-50 rounded-lg flex items-center justify-center"><TrendingUp className="w-4 h-4 text-amber-600" /></div>
            <span className="text-sm font-medium text-gray-600">Outstanding</span>
          </div>
          <div className="text-xl font-bold text-gray-900">USD {outstandingUsd.toLocaleString()}</div>
          <div className="text-xs text-gray-400 mt-1">{outstanding.length} unpaid invoice{outstanding.length !== 1 ? "s" : ""}</div>
        </div>
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-8 h-8 bg-red-50 rounded-lg flex items-center justify-center"><AlertTriangle className="w-4 h-4 text-red-600" /></div>
            <span className="text-sm font-medium text-gray-600">Overdue</span>
          </div>
          <div className="text-xl font-bold text-gray-900">{overdueCount}</div>
          <div className="text-xs text-gray-400 mt-1">past their due date</div>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100">
        <div className="flex gap-1 px-5 py-4 border-b border-gray-100 flex-wrap">
          {(["All", ...FILTERS] as const).map((s) => (
            <button key={s} onClick={() => setFilter(s)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${filter === s ? "bg-blue-600 text-white" : "text-gray-600 hover:bg-gray-100"}`}>
              {s} ({s === "All" ? withStatus.length : withStatus.filter((x) => x.status === s).length})
            </button>
          ))}
        </div>

        <div className="divide-y divide-gray-50">
          {filtered.length === 0 && <div className="py-16 text-center text-gray-400 text-sm">No invoices found.</div>}
          {filtered.map(({ inv, status }) => (
            <div key={inv.id} className="px-5 py-4 flex items-start gap-4">
              <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                <span className="text-blue-700 font-bold text-sm">{inv.clientName.charAt(0)}</span>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <Link href={`/admin/invoices/${inv.id}`} className="text-sm font-semibold text-gray-800 hover:text-blue-600">{inv.invoiceNumber}</Link>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${STATUS_COLOR[status]}`}>{status}</span>
                  {inv.saleId && <span className="text-xs bg-purple-50 text-purple-600 px-2 py-0.5 rounded-full">From Booking</span>}
                </div>
                <p className="text-sm text-gray-700 mt-1 font-medium">{inv.clientName}</p>
                <p className="text-xs text-gray-500">{inv.clientEmail} {inv.clientPhone && `· ${inv.clientPhone}`}</p>
                <p className="text-xs text-gray-400 mt-0.5">Issued {inv.issueDate} · Due {inv.dueDate}</p>
              </div>
              <div className="text-right flex-shrink-0">
                <div className="text-sm font-bold text-gray-800">USD {inv.amountUsd.toLocaleString()}</div>
                <div className="text-xs text-gray-500">KSH {inv.amountKsh.toLocaleString()}</div>
                <div className="flex items-center gap-1 mt-2 justify-end">
                  <Link href={`/admin/invoices/${inv.id}`} className="text-xs font-semibold text-blue-600 hover:text-blue-700 px-2 py-1">View</Link>
                  <button onClick={() => handleDelete(inv.id)} className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"><Trash2 className="w-4 h-4" /></button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
