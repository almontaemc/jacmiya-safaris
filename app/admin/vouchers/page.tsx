"use client";

import { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import { getVouchers, deleteVoucher, getSales } from "@/lib/adminStore";
import type { Voucher, VoucherStatus, Sale } from "@/types/admin";
import { VOUCHER_STATUSES } from "@/components/admin/VoucherForm";
import { Plus, Trash2, Copy, Ticket, CalendarClock, Hotel } from "lucide-react";

const STATUS_COLOR: Record<VoucherStatus, string> = {
  Confirm: "bg-green-100 text-green-700",
  Amend: "bg-amber-100 text-amber-700",
  Request: "bg-blue-100 text-blue-700",
};

function todayIso() { return new Date().toISOString().slice(0, 10); }

export default function VouchersPage() {
  const [vouchers, setVouchers] = useState<Voucher[]>([]);
  const [sales, setSales] = useState<Sale[]>([]);
  const [filter, setFilter] = useState<"All" | VoucherStatus>("All");

  function load() {
    setVouchers(getVouchers());
    setSales(getSales());
  }
  useEffect(() => { load(); }, []);

  const sorted = useMemo(() => [...vouchers].sort((a, b) => b.voucherNumber - a.voucherNumber), [vouchers]);
  const filtered = useMemo(
    () => (filter === "All" ? sorted : sorted.filter((v) => v.status === filter)),
    [sorted, filter]
  );

  const upcoming = vouchers.filter((v) => v.arrivalDate >= todayIso());
  const lodges = new Set(vouchers.map((v) => v.supplierName.trim().toLowerCase())).size;

  function bookingRefFor(saleId?: string) {
    if (!saleId) return null;
    return sales.find((s) => s.id === saleId)?.bookingRef ?? null;
  }

  function handleDelete(v: Voucher) {
    if (!confirm(`Delete voucher ${v.voucherNumber}? Its number will not be reused.`)) return;
    deleteVoucher(v.id);
    load();
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Booking Vouchers</h1>
          <p className="text-gray-500 text-sm mt-0.5">Confirmations, amendments and requests sent to lodges and hotels</p>
        </div>
        <Link href="/admin/vouchers/new" className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold px-4 py-2.5 rounded-xl transition-colors">
          <Plus className="w-4 h-4" /> New Voucher
        </Link>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-8 h-8 bg-green-50 rounded-lg flex items-center justify-center"><Ticket className="w-4 h-4 text-green-600" /></div>
            <span className="text-sm font-medium text-gray-600">Vouchers Issued</span>
          </div>
          <div className="text-xl font-bold text-gray-900">{vouchers.length}</div>
        </div>
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-8 h-8 bg-blue-50 rounded-lg flex items-center justify-center"><CalendarClock className="w-4 h-4 text-blue-600" /></div>
            <span className="text-sm font-medium text-gray-600">Upcoming Arrivals</span>
          </div>
          <div className="text-xl font-bold text-gray-900">{upcoming.length}</div>
        </div>
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-8 h-8 bg-amber-50 rounded-lg flex items-center justify-center"><Hotel className="w-4 h-4 text-amber-600" /></div>
            <span className="text-sm font-medium text-gray-600">Lodges &amp; Hotels</span>
          </div>
          <div className="text-xl font-bold text-gray-900">{lodges}</div>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100">
        <div className="flex gap-1 px-5 py-4 border-b border-gray-100 flex-wrap">
          {(["All", ...VOUCHER_STATUSES] as const).map((s) => (
            <button key={s} onClick={() => setFilter(s)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${filter === s ? "bg-blue-600 text-white" : "text-gray-600 hover:bg-gray-100"}`}>
              {s} ({s === "All" ? vouchers.length : vouchers.filter((v) => v.status === s).length})
            </button>
          ))}
        </div>

        <div className="divide-y divide-gray-50">
          {filtered.length === 0 && (
            <div className="py-16 text-center text-gray-400 text-sm">
              No vouchers yet. Create one for each lodge or hotel on a booking.
            </div>
          )}
          {filtered.map((v) => {
            const bookingRef = bookingRefFor(v.saleId);
            return (
              <div key={v.id} className="px-5 py-4 flex items-start gap-4">
                <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                  <span className="text-green-700 font-bold text-xs">{v.voucherNumber}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <Link href={`/admin/vouchers/${v.id}`} className="text-sm font-semibold text-gray-800 hover:text-blue-600">{v.supplierName}</Link>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${STATUS_COLOR[v.status]}`}>{v.status}</span>
                    {bookingRef
                      ? <span className="text-xs bg-purple-50 text-purple-600 px-2 py-0.5 rounded-full">{bookingRef}</span>
                      : <span className="text-xs bg-gray-50 text-gray-400 px-2 py-0.5 rounded-full">Standalone</span>}
                  </div>
                  <p className="text-sm text-gray-700 mt-1 font-medium">{v.clientNames}</p>
                  <p className="text-xs text-gray-500">
                    {v.adults} adult{v.adults !== 1 ? "s" : ""}{v.children > 0 && `, ${v.children} child${v.children !== 1 ? "ren" : ""}`}
                    {" · "}{v.arrivalDate} → {v.departureDate} · {v.nights} night{v.nights !== 1 ? "s" : ""}
                  </p>
                </div>
                <div className="flex items-center gap-1 flex-shrink-0">
                  <Link href={`/admin/vouchers/${v.id}`} className="text-xs font-semibold text-blue-600 hover:text-blue-700 px-2 py-1">View</Link>
                  <Link href={`/admin/vouchers/new?copy=${v.id}`} title="Copy for another lodge" className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"><Copy className="w-4 h-4" /></Link>
                  <button onClick={() => handleDelete(v)} className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"><Trash2 className="w-4 h-4" /></button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
