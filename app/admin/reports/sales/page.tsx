"use client";

import { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import { getSales } from "@/lib/adminStore";
import type { Sale, PaymentStatus, AppSettings } from "@/types/admin";
import {
  downloadCSV, downloadExcel, getDateRange, inRange, fmtDate, fmtK,
  PRESET_LABELS, type DatePreset,
} from "@/lib/reportUtils";
import { ArrowLeft, Printer, FileText, FileSpreadsheet } from "lucide-react";

const PAYMENT_STATUSES: PaymentStatus[] = ["Pending Deposit", "Deposit Paid", "Fully Paid", "Refunded", "Cancelled"];

const STATUS_CLS: Record<PaymentStatus, string> = {
  "Pending Deposit": "bg-amber-100 text-amber-700",
  "Deposit Paid": "bg-blue-100 text-blue-700",
  "Fully Paid": "bg-green-100 text-green-700",
  "Refunded": "bg-gray-100 text-gray-600",
  "Cancelled": "bg-red-100 text-red-700",
};

export default function SalesReportPage() {
  const [all, setAll] = useState<Sale[]>([]);
  const [preset, setPreset] = useState<DatePreset>("this-year");
  const [statusFilter, setStatusFilter] = useState<string>("All");
  const [settings, setSettings] = useState<AppSettings | null>(null);

  useEffect(() => {
    setAll(getSales());
    import("@/lib/adminStore").then((m) => setSettings(m.getSettings()));
  }, []);

  const { from, to } = useMemo(() => getDateRange(preset), [preset]);

  const filtered = useMemo(() =>
    all.filter((s) =>
      inRange(s.createdAt, from, to) &&
      (statusFilter === "All" || s.paymentStatus === statusFilter)
    ), [all, from, to, statusFilter]);

  const totalRevKsh = filtered.reduce((a, s) => a + s.amountKsh, 0);
  const totalRevUsd = filtered.reduce((a, s) => a + s.amountUsd, 0);
  const totalDepKsh = filtered.reduce((a, s) => a + s.depositKsh, 0);
  const totalBalKsh = filtered.reduce((a, s) => a + (s.amountKsh - s.depositKsh), 0);

  const companyName = settings?.companyName ?? "Jacmiya Safaris";
  const now = new Date().toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" });

  const HEADERS = [
    "Booking Ref", "Client Name", "Client Email", "Client Phone",
    "Tour", "Travel From", "Travel To", "Pax",
    "Amount (KSH)", "Amount (USD)", "Deposit (KSH)", "Deposit (USD)",
    "Balance (KSH)", "Payment Status", "Created Date",
  ];
  const ROWS: (string | number)[][] = filtered.map((s) => [
    s.bookingRef, s.clientName, s.clientEmail, s.clientPhone,
    s.tourTitle, s.travelFrom || "—", s.travelTo || "—", s.pax,
    s.amountKsh, s.amountUsd, s.depositKsh, s.depositUsd,
    s.amountKsh - s.depositKsh, s.paymentStatus, fmtDate(s.createdAt),
  ]);

  function handleCSV() { downloadCSV("jacmiya-sales-report.csv", HEADERS, ROWS); }
  function handleExcel() { downloadExcel("jacmiya-sales-report.xls", "Sales Report", HEADERS, ROWS); }

  return (
    <div className="space-y-6">
      {/* Screen header */}
      <div className="flex items-center gap-3 print:hidden">
        <Link href="/admin/reports" className="p-2 rounded-lg hover:bg-gray-100 text-gray-500">
          <ArrowLeft className="w-4 h-4" />
        </Link>
        <div className="flex-1">
          <div className="text-xs text-gray-400 mb-0.5">Reports</div>
          <h1 className="text-2xl font-bold text-gray-900">Sales Report</h1>
        </div>
      </div>

      {/* Print header */}
      <div className="hidden print:block border-b border-gray-300 pb-5">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-xl font-bold text-gray-900">{companyName}</h1>
            <h2 className="text-base font-semibold text-gray-700 mt-1">Sales & Bookings Report</h2>
          </div>
          <div className="text-right text-sm text-gray-500">
            <div>Generated: {now}</div>
            <div>Filter: {PRESET_LABELS[preset]}{statusFilter !== "All" ? ` · ${statusFilter}` : ""}</div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3 print:hidden">
        <div className="flex gap-1 bg-gray-100 rounded-xl p-1">
          {(Object.keys(PRESET_LABELS) as DatePreset[]).map((p) => (
            <button key={p} onClick={() => setPreset(p)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${preset === p ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-700"}`}>
              {PRESET_LABELS[p]}
            </button>
          ))}
        </div>
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}
          className="border border-gray-200 rounded-xl px-3 py-2 text-sm text-gray-700 focus:outline-none focus:border-emerald-400">
          <option value="All">All Statuses</option>
          {PAYMENT_STATUSES.map((s) => <option key={s}>{s}</option>)}
        </select>
      </div>

      {/* Download buttons */}
      <div className="flex items-center gap-2 print:hidden">
        <button onClick={() => window.print()}
          className="flex items-center gap-2 border border-gray-200 hover:bg-gray-50 text-gray-700 text-sm font-semibold px-4 py-2.5 rounded-xl transition-colors">
          <Printer className="w-4 h-4" /> Print / PDF
        </button>
        <button onClick={handleCSV}
          className="flex items-center gap-2 border border-gray-200 hover:bg-gray-50 text-gray-700 text-sm font-semibold px-4 py-2.5 rounded-xl transition-colors">
          <FileText className="w-4 h-4" /> CSV
        </button>
        <button onClick={handleExcel}
          className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold px-4 py-2.5 rounded-xl transition-colors">
          <FileSpreadsheet className="w-4 h-4" /> Excel
        </button>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: "Total Revenue", value: `KSH ${fmtK(totalRevKsh)}`, sub: `USD ${totalRevUsd.toLocaleString()}` },
          { label: "Deposits Received", value: `KSH ${fmtK(totalDepKsh)}`, sub: `${filtered.filter((s) => s.paymentStatus === "Fully Paid").length} fully paid` },
          { label: "Outstanding Balance", value: `KSH ${fmtK(totalBalKsh)}`, sub: `${filtered.filter((s) => s.paymentStatus === "Pending Deposit").length} pending deposit` },
          { label: "Bookings", value: String(filtered.length), sub: filtered.length > 0 ? `Avg KSH ${Math.round(totalRevKsh / filtered.length).toLocaleString()}` : "No bookings" },
        ].map((c) => (
          <div key={c.label} className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
            <div className="text-xl font-bold text-gray-900">{c.value}</div>
            <div className="text-xs text-gray-500 mt-0.5">{c.label}</div>
            <div className="text-xs text-gray-400 mt-0.5">{c.sub}</div>
          </div>
        ))}
      </div>

      {/* Data table */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-100">
          <h2 className="font-semibold text-gray-800">Booking Details — {filtered.length} record{filtered.length !== 1 ? "s" : ""}</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                {["Ref", "Client", "Tour", "Travel Dates", "Pax", "Amount KSH", "Amount USD", "Deposit KSH", "Balance KSH", "Status", "Created"].map((h) => (
                  <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filtered.length === 0 ? (
                <tr><td colSpan={11} className="text-center py-12 text-gray-400 text-sm">No bookings match the selected filters.</td></tr>
              ) : filtered.map((s) => (
                <tr key={s.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3 font-mono text-xs font-semibold text-gray-700 whitespace-nowrap">{s.bookingRef}</td>
                  <td className="px-4 py-3">
                    <div className="font-medium text-gray-900 whitespace-nowrap">{s.clientName}</div>
                    <div className="text-xs text-gray-400">{s.clientEmail}</div>
                  </td>
                  <td className="px-4 py-3 text-gray-700 max-w-[140px]">
                    <div className="truncate">{s.tourTitle}</div>
                  </td>
                  <td className="px-4 py-3 text-xs text-gray-600 whitespace-nowrap">
                    {s.travelFrom || "—"} → {s.travelTo || "—"}
                  </td>
                  <td className="px-4 py-3 text-center text-gray-700">{s.pax}</td>
                  <td className="px-4 py-3 text-right font-semibold text-gray-900 whitespace-nowrap">{s.amountKsh.toLocaleString()}</td>
                  <td className="px-4 py-3 text-right text-gray-500 whitespace-nowrap">{s.amountUsd.toLocaleString()}</td>
                  <td className="px-4 py-3 text-right text-emerald-600 whitespace-nowrap">{s.depositKsh.toLocaleString()}</td>
                  <td className="px-4 py-3 text-right text-amber-600 whitespace-nowrap">{(s.amountKsh - s.depositKsh).toLocaleString()}</td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <span className={`text-xs font-semibold px-2 py-1 rounded-full ${STATUS_CLS[s.paymentStatus]}`}>
                      {s.paymentStatus}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-xs text-gray-400 whitespace-nowrap">{fmtDate(s.createdAt)}</td>
                </tr>
              ))}
            </tbody>
            {filtered.length > 0 && (
              <tfoot>
                <tr className="border-t-2 border-gray-200 bg-gray-50 font-bold">
                  <td colSpan={5} className="px-4 py-3 text-gray-700 text-sm">TOTALS ({filtered.length})</td>
                  <td className="px-4 py-3 text-right text-gray-900">{totalRevKsh.toLocaleString()}</td>
                  <td className="px-4 py-3 text-right text-gray-600">{totalRevUsd.toLocaleString()}</td>
                  <td className="px-4 py-3 text-right text-emerald-700">{totalDepKsh.toLocaleString()}</td>
                  <td className="px-4 py-3 text-right text-amber-700">{totalBalKsh.toLocaleString()}</td>
                  <td colSpan={2} />
                </tr>
              </tfoot>
            )}
          </table>
        </div>
      </div>

      <div className="pb-8 print:hidden">
        <Link href="/admin/reports" className="border border-gray-200 text-gray-600 hover:bg-gray-50 font-semibold px-6 py-3 rounded-xl text-sm transition-colors">
          ← Back to Reports
        </Link>
      </div>
    </div>
  );
}
