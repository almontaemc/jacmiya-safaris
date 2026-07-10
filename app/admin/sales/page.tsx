"use client";

import { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import { getSales, deleteSale, updateSale } from "@/lib/adminStore";
import type { Sale, PaymentStatus } from "@/types/admin";
import { Plus, Trash2, Edit3, TrendingUp, TrendingDown, DollarSign } from "lucide-react";

const PAY_STATUSES: PaymentStatus[] = ["Pending Deposit", "Deposit Paid", "Fully Paid", "Refunded", "Cancelled"];
const PAY_COLOR: Record<PaymentStatus, string> = {
  "Pending Deposit": "bg-amber-100 text-amber-700",
  "Deposit Paid": "bg-blue-100 text-blue-700",
  "Fully Paid": "bg-green-100 text-green-700",
  "Refunded": "bg-gray-100 text-gray-600",
  "Cancelled": "bg-red-100 text-red-700",
};

export default function SalesPage() {
  const [sales, setSales] = useState<Sale[]>([]);
  const [filter, setFilter] = useState<"All" | PaymentStatus>("All");

  function load() { setSales(getSales()); }
  useEffect(() => { load(); }, []);

  const sorted = useMemo(() => [...sales].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()), [sales]);
  const filtered = useMemo(() => filter === "All" ? sorted : sorted.filter((s) => s.paymentStatus === filter), [sorted, filter]);

  const totalRevKsh = sales.reduce((a, s) => a + s.amountKsh, 0);
  const totalRevUsd = sales.reduce((a, s) => a + s.amountUsd, 0);
  const depositKsh = sales.reduce((a, s) => a + s.depositKsh, 0);
  const depositUsd = sales.reduce((a, s) => a + s.depositUsd, 0);
  const balanceKsh = totalRevKsh - depositKsh;
  const balanceUsd = totalRevUsd - depositUsd;

  function handleDelete(id: string) {
    if (!confirm("Delete this booking?")) return;
    deleteSale(id);
    load();
  }

  function handlePaymentChange(id: string, status: PaymentStatus) {
    updateSale(id, { paymentStatus: status });
    load();
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Sales & Bookings</h1>
          <p className="text-gray-500 text-sm mt-0.5">All confirmed bookings and revenue tracking</p>
        </div>
        <Link href="/admin/sales/new" className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold px-4 py-2.5 rounded-xl transition-colors">
          <Plus className="w-4 h-4" /> Add Booking
        </Link>
      </div>

      {/* Revenue summary */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-8 h-8 bg-green-50 rounded-lg flex items-center justify-center"><TrendingUp className="w-4 h-4 text-green-600" /></div>
            <span className="text-sm font-medium text-gray-600">Total Revenue</span>
          </div>
          <div className="text-xl font-bold text-gray-900">KSH {totalRevKsh.toLocaleString()}</div>
          <div className="text-sm text-gray-500 mt-0.5">USD {totalRevUsd.toLocaleString()}</div>
          <div className="text-xs text-gray-400 mt-1">{sales.length} booking{sales.length !== 1 ? "s" : ""}</div>
        </div>
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-8 h-8 bg-blue-50 rounded-lg flex items-center justify-center"><DollarSign className="w-4 h-4 text-blue-600" /></div>
            <span className="text-sm font-medium text-gray-600">Deposits Received</span>
          </div>
          <div className="text-xl font-bold text-gray-900">KSH {depositKsh.toLocaleString()}</div>
          <div className="text-sm text-gray-500 mt-0.5">USD {depositUsd.toLocaleString()}</div>
          <div className="text-xs text-gray-400 mt-1">{totalRevKsh > 0 ? Math.round((depositKsh / totalRevKsh) * 100) : 0}% of total revenue</div>
        </div>
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-8 h-8 bg-amber-50 rounded-lg flex items-center justify-center"><TrendingDown className="w-4 h-4 text-amber-600" /></div>
            <span className="text-sm font-medium text-gray-600">Balance Outstanding</span>
          </div>
          <div className="text-xl font-bold text-gray-900">KSH {balanceKsh.toLocaleString()}</div>
          <div className="text-sm text-gray-500 mt-0.5">USD {balanceUsd.toLocaleString()}</div>
          <div className="text-xs text-gray-400 mt-1">{sales.filter((s) => s.paymentStatus !== "Fully Paid" && s.paymentStatus !== "Refunded" && s.paymentStatus !== "Cancelled").length} pending bookings</div>
        </div>
      </div>

      {/* Filter tabs */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100">
        <div className="flex gap-1 px-5 py-4 border-b border-gray-100 flex-wrap">
          {(["All", ...PAY_STATUSES] as const).map((s) => (
            <button key={s} onClick={() => setFilter(s)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${filter === s ? "bg-blue-600 text-white" : "text-gray-600 hover:bg-gray-100"}`}>
              {s} ({s === "All" ? sales.length : sales.filter((b) => b.paymentStatus === s).length})
            </button>
          ))}
        </div>

        <div className="divide-y divide-gray-50">
          {filtered.length === 0 && <div className="py-16 text-center text-gray-400 text-sm">No bookings found.</div>}
          {filtered.map((s) => (
            <div key={s.id} className="px-5 py-4">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                  <span className="text-blue-700 font-bold text-sm">{s.clientName.charAt(0)}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="text-sm font-semibold text-gray-800">{s.clientName}</p>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${PAY_COLOR[s.paymentStatus]}`}>{s.paymentStatus}</span>
                    {s.leadId && <span className="text-xs bg-purple-50 text-purple-600 px-2 py-0.5 rounded-full">From Lead</span>}
                  </div>
                  <p className="text-xs text-gray-500 mt-0.5">{s.clientEmail} {s.clientPhone && `· ${s.clientPhone}`}</p>
                  <p className="text-sm text-gray-700 mt-1 font-medium truncate">{s.tourTitle}</p>
                  <p className="text-xs text-gray-400 mt-0.5">{s.travelFrom} → {s.travelTo} · {s.pax} pax</p>
                  {s.notes && <p className="text-xs text-gray-400 mt-1 italic">{s.notes}</p>}
                </div>
                <div className="text-right flex-shrink-0">
                  <div className="text-sm font-bold text-gray-800">USD {s.amountUsd.toLocaleString()}</div>
                  <div className="text-xs text-gray-500">KSH {s.amountKsh.toLocaleString()}</div>
                  <div className="text-xs text-gray-400 mt-1">Deposit: USD {s.depositUsd.toLocaleString()}</div>
                  <div className="text-xs text-gray-300">Balance: USD {(s.amountUsd - s.depositUsd).toLocaleString()}</div>
                </div>
              </div>
              <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-50">
                <div className="flex gap-1 flex-wrap">
                  {PAY_STATUSES.map((ps) => (
                    <button key={ps} onClick={() => handlePaymentChange(s.id, ps)}
                      className={`text-xs px-2.5 py-1 rounded-lg border transition-colors ${s.paymentStatus === ps ? "bg-blue-600 text-white border-blue-600" : "bg-white text-gray-500 border-gray-200 hover:border-blue-300"}`}>
                      {ps}
                    </button>
                  ))}
                </div>
                <div className="flex gap-2">
                  <Link href={`/admin/sales/${s.id}/edit`} className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"><Edit3 className="w-4 h-4" /></Link>
                  <button onClick={() => handleDelete(s.id)} className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"><Trash2 className="w-4 h-4" /></button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
