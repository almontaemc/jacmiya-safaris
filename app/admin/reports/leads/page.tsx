"use client";

import { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import { getLeads } from "@/lib/adminStore";
import type { Lead, LeadStatus, LeadSource, AppSettings } from "@/types/admin";
import {
  downloadCSV, downloadExcel, getDateRange, inRange, fmtDate, fmtK,
  PRESET_LABELS, type DatePreset,
} from "@/lib/reportUtils";
import { ArrowLeft, Printer, FileText, FileSpreadsheet } from "lucide-react";

const STATUSES: LeadStatus[] = ["New", "Contacted", "Quoted", "Negotiating", "Won", "Lost"];
const SOURCES: LeadSource[] = ["Website", "Referral", "Social Media", "Phone", "Walk-in", "Email"];

const STATUS_CLS: Record<LeadStatus, string> = {
  New: "bg-blue-100 text-blue-700",
  Contacted: "bg-purple-100 text-purple-700",
  Quoted: "bg-amber-100 text-amber-700",
  Negotiating: "bg-orange-100 text-orange-700",
  Won: "bg-green-100 text-green-700",
  Lost: "bg-red-100 text-red-700",
};

const STATUS_COLORS = ["bg-blue-500", "bg-purple-500", "bg-amber-500", "bg-orange-500", "bg-emerald-500", "bg-red-400"];

export default function LeadsReportPage() {
  const [all, setAll] = useState<Lead[]>([]);
  const [preset, setPreset] = useState<DatePreset>("this-year");
  const [statusFilter, setStatusFilter] = useState<string>("All");
  const [sourceFilter, setSourceFilter] = useState<string>("All");
  const [settings, setSettings] = useState<AppSettings | null>(null);

  useEffect(() => {
    setAll(getLeads());
    import("@/lib/adminStore").then((m) => setSettings(m.getSettings()));
  }, []);

  const { from, to } = useMemo(() => getDateRange(preset), [preset]);

  const filtered = useMemo(() =>
    all.filter((l) =>
      inRange(l.createdAt, from, to) &&
      (statusFilter === "All" || l.status === statusFilter) &&
      (sourceFilter === "All" || l.source === sourceFilter)
    ), [all, from, to, statusFilter, sourceFilter]);

  // Stats
  const won = filtered.filter((l) => l.status === "Won").length;
  const lost = filtered.filter((l) => l.status === "Lost").length;
  const closed = won + lost;
  const convRate = closed > 0 ? Math.round((won / closed) * 100) : 0;
  const activeLeads = filtered.filter((l) => !["Won", "Lost"].includes(l.status)).length;

  // Status breakdown
  const statusCounts = STATUSES.map((s) => ({ status: s, count: filtered.filter((l) => l.status === s).length }));
  const maxStatus = Math.max(...statusCounts.map((s) => s.count), 1);

  // Source breakdown
  const sourceCounts: Record<string, number> = {};
  filtered.forEach((l) => { sourceCounts[l.source] = (sourceCounts[l.source] ?? 0) + 1; });
  const sourceBreakdown = Object.entries(sourceCounts).sort((a, b) => b[1] - a[1]);

  const companyName = settings?.companyName ?? "Jacmiya Safaris";
  const now = new Date().toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" });

  const HEADERS = [
    "Name", "Email", "Phone", "Destination", "Tour Interest", "Source",
    "Status", "Travel Dates", "Group Size", "Budget", "Follow-ups",
    "Next Follow-up", "Created Date",
  ];
  const ROWS: (string | number)[][] = filtered.map((l) => [
    l.name, l.email, l.phone, l.destination, l.tourInterest, l.source,
    l.status, l.travelDates, l.travelers, l.budget,
    (l.followUps ?? []).length, l.nextFollowUp || "—", fmtDate(l.createdAt),
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
          <h1 className="text-2xl font-bold text-gray-900">Leads Report</h1>
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
              <h2 className="text-base font-semibold text-gray-600 mt-0.5">Leads & Pipeline Report</h2>
            </div>
          </div>
          <div className="text-right text-sm text-gray-500">
            <div>Generated: {now}</div>
            <div>Filter: {PRESET_LABELS[preset]}</div>
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
          className="border border-gray-200 rounded-xl px-3 py-2 text-sm text-gray-700 focus:outline-none focus:border-purple-400">
          <option value="All">All Statuses</option>
          {STATUSES.map((s) => <option key={s}>{s}</option>)}
        </select>
        <select value={sourceFilter} onChange={(e) => setSourceFilter(e.target.value)}
          className="border border-gray-200 rounded-xl px-3 py-2 text-sm text-gray-700 focus:outline-none focus:border-purple-400">
          <option value="All">All Sources</option>
          {SOURCES.map((s) => <option key={s}>{s}</option>)}
        </select>
      </div>

      {/* Download buttons */}
      <div className="flex items-center gap-2 print:hidden">
        <button onClick={() => window.print()}
          className="flex items-center gap-2 border border-gray-200 hover:bg-gray-50 text-gray-700 text-sm font-semibold px-4 py-2.5 rounded-xl transition-colors">
          <Printer className="w-4 h-4" /> Print / PDF
        </button>
        <button onClick={() => downloadCSV("jacmiya-leads-report.csv", HEADERS, ROWS)}
          className="flex items-center gap-2 border border-gray-200 hover:bg-gray-50 text-gray-700 text-sm font-semibold px-4 py-2.5 rounded-xl transition-colors">
          <FileText className="w-4 h-4" /> CSV
        </button>
        <button onClick={() => downloadExcel("jacmiya-leads-report.xls", "Leads Report", HEADERS, ROWS)}
          className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white text-sm font-semibold px-4 py-2.5 rounded-xl transition-colors">
          <FileSpreadsheet className="w-4 h-4" /> Excel
        </button>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: "Total Leads", value: String(filtered.length), sub: `${activeLeads} active in pipeline` },
          { label: "Won", value: String(won), sub: `${lost} lost, ${closed} closed total` },
          { label: "Conversion Rate", value: `${convRate}%`, sub: `${won} of ${closed} closed leads` },
          { label: "Top Source", value: sourceBreakdown[0]?.[0] ?? "—", sub: sourceBreakdown[0] ? `${sourceBreakdown[0][1]} lead${sourceBreakdown[0][1] !== 1 ? "s" : ""}` : "" },
        ].map((c) => (
          <div key={c.label} className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
            <div className="text-xl font-bold text-gray-900">{c.value}</div>
            <div className="text-xs text-gray-500 mt-0.5">{c.label}</div>
            <div className="text-xs text-gray-400 mt-0.5">{c.sub}</div>
          </div>
        ))}
      </div>

      {/* Pipeline + Source side by side */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
          <h2 className="font-semibold text-gray-800 mb-4">Pipeline Breakdown</h2>
          <div className="space-y-3">
            {statusCounts.map(({ status, count }, i) => (
              <div key={status} className="flex items-center gap-3">
                <div className="w-20 text-xs text-gray-500 text-right">{status}</div>
                <div className="flex-1 bg-gray-100 rounded-full h-5 overflow-hidden">
                  <div className={`h-full rounded-full ${STATUS_COLORS[i]}`}
                    style={{ width: `${count > 0 ? Math.max((count / maxStatus) * 100, 5) : 0}%` }} />
                </div>
                <div className="w-8 text-xs font-bold text-gray-700 text-right">{count}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
          <h2 className="font-semibold text-gray-800 mb-4">Lead Source Breakdown</h2>
          {sourceBreakdown.length === 0 ? (
            <div className="text-gray-400 text-sm text-center py-8">No leads in selected period.</div>
          ) : (
            <div className="space-y-3">
              {sourceBreakdown.map(([source, count]) => {
                const pct = filtered.length > 0 ? Math.round((count / filtered.length) * 100) : 0;
                return (
                  <div key={source} className="flex items-center gap-3">
                    <div className="w-24 text-xs text-gray-500 text-right truncate">{source}</div>
                    <div className="flex-1 bg-gray-100 rounded-full h-4 overflow-hidden">
                      <div className="h-full rounded-full bg-purple-400"
                        style={{ width: `${Math.max(pct, 2)}%` }} />
                    </div>
                    <div className="w-12 text-right text-xs text-gray-500">
                      <span className="font-bold text-gray-700">{count}</span> · {pct}%
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Data table */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-100">
          <h2 className="font-semibold text-gray-800">Lead Details — {filtered.length} record{filtered.length !== 1 ? "s" : ""}</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                {["Name", "Contact", "Destination", "Tour Interest", "Source", "Status", "Travel Dates", "Budget", "Follow-ups", "Created"].map((h) => (
                  <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filtered.length === 0 ? (
                <tr><td colSpan={10} className="text-center py-12 text-gray-400 text-sm">No leads match the selected filters.</td></tr>
              ) : filtered.sort((a, b) => b.createdAt.localeCompare(a.createdAt)).map((l) => (
                <tr key={l.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3">
                    <div className="font-medium text-gray-900 whitespace-nowrap">{l.name}</div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="text-xs text-gray-600">{l.email}</div>
                    <div className="text-xs text-gray-400">{l.phone}</div>
                  </td>
                  <td className="px-4 py-3 text-gray-600 text-xs whitespace-nowrap">{l.destination || "—"}</td>
                  <td className="px-4 py-3 text-gray-600 text-xs max-w-[120px]">
                    <div className="truncate">{l.tourInterest || "—"}</div>
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">{l.source}</span>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <span className={`text-xs font-semibold px-2 py-1 rounded-full ${STATUS_CLS[l.status]}`}>
                      {l.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-xs text-gray-500 whitespace-nowrap">{l.travelDates || "—"}</td>
                  <td className="px-4 py-3 text-xs text-gray-500 whitespace-nowrap">{l.budget || "—"}</td>
                  <td className="px-4 py-3 text-center text-sm text-gray-600">{(l.followUps ?? []).length}</td>
                  <td className="px-4 py-3 text-xs text-gray-400 whitespace-nowrap">{fmtDate(l.createdAt)}</td>
                </tr>
              ))}
            </tbody>
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
