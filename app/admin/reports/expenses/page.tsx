"use client";

import { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import { getExpenses } from "@/lib/adminStore";
import type { Expense, AppSettings } from "@/types/admin";
import {
  downloadCSV, downloadExcel, getDateRange, inRange, fmtDate, fmtK,
  PRESET_LABELS, type DatePreset,
} from "@/lib/reportUtils";
import { ArrowLeft, Printer, FileText, FileSpreadsheet } from "lucide-react";

const EXPENSE_CATEGORIES = [
  "Park Fees", "Accommodation", "Fuel", "Food & Beverage",
  "Marketing", "Office", "Vehicle Maintenance", "Staff Welfare",
  "Communication", "Professional Fees", "Utilities", "Other",
];

const CAT_COLORS = [
  "bg-emerald-500", "bg-blue-500", "bg-amber-500", "bg-orange-500",
  "bg-purple-500", "bg-red-400", "bg-teal-500", "bg-pink-500",
  "bg-cyan-500", "bg-indigo-500", "bg-lime-500", "bg-gray-400",
];

export default function ExpensesReportPage() {
  const [all, setAll] = useState<Expense[]>([]);
  const [preset, setPreset] = useState<DatePreset>("this-year");
  const [catFilter, setCatFilter] = useState("All");
  const [settings, setSettings] = useState<AppSettings | null>(null);

  useEffect(() => {
    setAll(getExpenses());
    import("@/lib/adminStore").then((m) => setSettings(m.getSettings()));
  }, []);

  const { from, to } = useMemo(() => getDateRange(preset), [preset]);

  const filtered = useMemo(() =>
    all.filter((e) =>
      inRange(e.date, from, to) &&
      (catFilter === "All" || e.category === catFilter)
    ), [all, from, to, catFilter]);

  const totalKsh = filtered.reduce((a, e) => a + e.amountKsh, 0);
  const totalUsd = filtered.reduce((a, e) => a + e.amountUsd, 0);

  // Category breakdown from ALL filtered items
  const byCat: Record<string, number> = {};
  filtered.forEach((e) => { byCat[e.category] = (byCat[e.category] ?? 0) + e.amountKsh; });
  const catBreakdown = Object.entries(byCat).sort((a, b) => b[1] - a[1]);
  const maxCat = Math.max(...catBreakdown.map(([, v]) => v), 1);

  // All unique categories present in data
  const activeCats = [...new Set(all.map((e) => e.category))].sort();

  const companyName = settings?.companyName ?? "Jacmiya Safaris";
  const now = new Date().toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" });

  const HEADERS = ["Date", "Category", "Description", "Amount (KSH)", "Amount (USD)", "Receipt Ref", "Created Date"];
  const ROWS: (string | number)[][] = filtered.map((e) => [
    e.date, e.category, e.description, e.amountKsh, e.amountUsd, e.receiptRef || "—", fmtDate(e.createdAt),
  ]);

  return (
    <div className="space-y-6">
      {/* Screen header */}
      <div className="flex items-center gap-3 print:hidden">
        <Link href="/admin/reports" className="p-2 rounded-lg hover:bg-gray-100 text-gray-500">
          <ArrowLeft className="w-4 h-4" />
        </Link>
        <div className="flex-1">
          <div className="text-xs text-gray-400 mb-0.5">Reports</div>
          <h1 className="text-2xl font-bold text-gray-900">Expenses Report</h1>
        </div>
      </div>

      {/* Print header */}
      <div className="hidden print:block border-b border-gray-300 pb-5 mb-6">
        <div className="flex justify-between items-start">
          <div className="flex items-center gap-4">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/logo.png" alt={companyName} style={{ height: 56, width: "auto", background: "#fff" }} />
            <div>
              <h1 className="text-xl font-bold text-gray-900">{companyName}</h1>
              <h2 className="text-base font-semibold text-gray-600 mt-0.5">Expenses Report</h2>
            </div>
          </div>
          <div className="text-right text-sm text-gray-500">
            <div>Generated: {now}</div>
            <div>Filter: {PRESET_LABELS[preset]}{catFilter !== "All" ? ` · ${catFilter}` : ""}</div>
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
        <select value={catFilter} onChange={(e) => setCatFilter(e.target.value)}
          className="border border-gray-200 rounded-xl px-3 py-2 text-sm text-gray-700 focus:outline-none focus:border-red-400">
          <option value="All">All Categories</option>
          {activeCats.map((c) => <option key={c}>{c}</option>)}
        </select>
      </div>

      {/* Download buttons */}
      <div className="flex items-center gap-2 print:hidden">
        <button onClick={() => window.print()}
          className="flex items-center gap-2 border border-gray-200 hover:bg-gray-50 text-gray-700 text-sm font-semibold px-4 py-2.5 rounded-xl transition-colors">
          <Printer className="w-4 h-4" /> Print / PDF
        </button>
        <button onClick={() => downloadCSV("jacmiya-expenses-report.csv", HEADERS, ROWS)}
          className="flex items-center gap-2 border border-gray-200 hover:bg-gray-50 text-gray-700 text-sm font-semibold px-4 py-2.5 rounded-xl transition-colors">
          <FileText className="w-4 h-4" /> CSV
        </button>
        <button onClick={() => downloadExcel("jacmiya-expenses-report.xls", "Expenses Report", HEADERS, ROWS)}
          className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white text-sm font-semibold px-4 py-2.5 rounded-xl transition-colors">
          <FileSpreadsheet className="w-4 h-4" /> Excel
        </button>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: "Total Expenses", value: `KSH ${fmtK(totalKsh)}`, sub: `USD ${totalUsd.toLocaleString()}` },
          { label: "Entries", value: String(filtered.length), sub: `Avg KSH ${filtered.length > 0 ? Math.round(totalKsh / filtered.length).toLocaleString() : 0}` },
          { label: "Top Category", value: catBreakdown[0]?.[0] ?? "—", sub: catBreakdown[0] ? `KSH ${fmtK(catBreakdown[0][1])}` : "" },
          { label: "Categories", value: String(catBreakdown.length), sub: `${PRESET_LABELS[preset]}` },
        ].map((c) => (
          <div key={c.label} className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
            <div className="text-xl font-bold text-gray-900">{c.value}</div>
            <div className="text-xs text-gray-500 mt-0.5">{c.label}</div>
            <div className="text-xs text-gray-400 mt-0.5">{c.sub}</div>
          </div>
        ))}
      </div>

      {/* Category breakdown chart */}
      {catBreakdown.length > 0 && (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
          <h2 className="font-semibold text-gray-800 mb-4">Breakdown by Category</h2>
          <div className="space-y-3">
            {catBreakdown.map(([cat, ksh], i) => {
              const pct = totalKsh > 0 ? Math.round((ksh / totalKsh) * 100) : 0;
              return (
                <div key={cat} className="flex items-center gap-3">
                  <div className="w-32 text-xs text-gray-500 text-right truncate">{cat}</div>
                  <div className="flex-1 bg-gray-100 rounded-full h-4 overflow-hidden">
                    <div className={`h-full rounded-full ${CAT_COLORS[i % CAT_COLORS.length]}`}
                      style={{ width: `${Math.max((ksh / maxCat) * 100, 2)}%` }} />
                  </div>
                  <div className="w-28 text-right flex-shrink-0">
                    <span className="text-xs font-bold text-gray-700">KSH {fmtK(ksh)}</span>
                    <span className="text-xs text-gray-400 ml-1.5">{pct}%</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Data table */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-100">
          <h2 className="font-semibold text-gray-800">Expense Entries — {filtered.length} record{filtered.length !== 1 ? "s" : ""}</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                {["Date", "Category", "Description", "Amount (KSH)", "Amount (USD)", "Receipt Ref"].map((h) => (
                  <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filtered.length === 0 ? (
                <tr><td colSpan={6} className="text-center py-12 text-gray-400 text-sm">No expenses match the selected filters.</td></tr>
              ) : filtered.sort((a, b) => b.date.localeCompare(a.date)).map((e) => (
                <tr key={e.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3 text-gray-600 whitespace-nowrap text-xs font-medium">{e.date}</td>
                  <td className="px-4 py-3">
                    <span className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded-full font-medium">{e.category}</span>
                  </td>
                  <td className="px-4 py-3 text-gray-700">{e.description}</td>
                  <td className="px-4 py-3 text-right font-semibold text-gray-900 whitespace-nowrap">{e.amountKsh.toLocaleString()}</td>
                  <td className="px-4 py-3 text-right text-gray-500 whitespace-nowrap">{e.amountUsd.toLocaleString()}</td>
                  <td className="px-4 py-3 text-xs text-gray-400 font-mono">{e.receiptRef || "—"}</td>
                </tr>
              ))}
            </tbody>
            {filtered.length > 0 && (
              <tfoot>
                <tr className="border-t-2 border-gray-200 bg-gray-50 font-bold">
                  <td colSpan={3} className="px-4 py-3 text-gray-700 text-sm">TOTALS ({filtered.length})</td>
                  <td className="px-4 py-3 text-right text-gray-900">{totalKsh.toLocaleString()}</td>
                  <td className="px-4 py-3 text-right text-gray-600">{totalUsd.toLocaleString()}</td>
                  <td />
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
