"use client";

import { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import { getPayroll } from "@/lib/adminStore";
import type { PayrollRun, AppSettings } from "@/types/admin";
import { downloadCSV, downloadExcel, fmtDate, fmtK } from "@/lib/reportUtils";
import { ArrowLeft, Printer, FileText, FileSpreadsheet, ChevronDown, ChevronUp } from "lucide-react";

export default function PayrollReportPage() {
  const [runs, setRuns] = useState<PayrollRun[]>([]);
  const [yearFilter, setYearFilter] = useState<string>("all");
  const [expandedRun, setExpandedRun] = useState<string | null>(null);
  const [settings, setSettings] = useState<AppSettings | null>(null);

  useEffect(() => {
    setRuns(getPayroll());
    import("@/lib/adminStore").then((m) => setSettings(m.getSettings()));
  }, []);

  const years = useMemo(() => {
    const ys = [...new Set(runs.map((r) => r.month.slice(0, 4)))].sort().reverse();
    return ys;
  }, [runs]);

  const filtered = useMemo(() =>
    runs.filter((r) => yearFilter === "all" || r.month.startsWith(yearFilter))
      .sort((a, b) => b.month.localeCompare(a.month)),
    [runs, yearFilter]);

  const totalNetKsh = filtered.reduce((a, r) => a + r.totalNetKsh, 0);
  const totalBonusKsh = filtered.reduce((a, r) => a + r.totalBonusKsh, 0);
  const totalDeducKsh = filtered.reduce((a, r) => a + r.totalDeductionKsh, 0);
  const totalBasicKsh = filtered.reduce((a, r) => a + r.totalBasicKsh, 0);

  const companyName = settings?.companyName ?? "Jacmiya Safaris";
  const now = new Date().toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" });

  // Summary table export
  const SUM_HEADERS = ["Month", "Staff Count", "Basic (KSH)", "Bonuses (KSH)", "Deductions (KSH)", "Net Pay (KSH)", "Net Pay (USD)", "Rate", "Processed Date"];
  const SUM_ROWS: (string | number)[][] = filtered.map((r) => [
    r.label, r.entries.length, r.totalBasicKsh, r.totalBonusKsh,
    r.totalDeductionKsh, r.totalNetKsh, r.totalNetUsd, r.rate, fmtDate(r.processedAt),
  ]);

  // All entries export
  const ALL_HEADERS = ["Month", "Staff Name", "Role", "Department", "Basic (KSH)", "Bonus (KSH)", "Deduction (KSH)", "Net Pay (KSH)", "Notes"];
  const ALL_ROWS: (string | number)[][] = filtered.flatMap((r) =>
    r.entries.map((e) => [r.label, e.staffName, e.role, e.department, e.baseSalary, e.bonus, e.deduction, e.netPay, e.notes])
  );

  return (
    <div className="space-y-6">
      {/* Screen header */}
      <div className="flex items-center gap-3 print:hidden">
        <Link href="/admin/reports" className="p-2 rounded-lg hover:bg-gray-100 text-gray-500">
          <ArrowLeft className="w-4 h-4" />
        </Link>
        <div className="flex-1">
          <div className="text-xs text-gray-400 mb-0.5">Reports</div>
          <h1 className="text-2xl font-bold text-gray-900">Payroll Report</h1>
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
              <h2 className="text-base font-semibold text-gray-600 mt-0.5">Payroll & Salaries Report</h2>
            </div>
          </div>
          <div className="text-right text-sm text-gray-500">
            <div>Generated: {now}</div>
            <div>Year: {yearFilter === "all" ? "All Years" : yearFilter}</div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3 print:hidden">
        <div className="flex gap-1 bg-gray-100 rounded-xl p-1">
          <button onClick={() => setYearFilter("all")}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${yearFilter === "all" ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-700"}`}>
            All Years
          </button>
          {years.map((y) => (
            <button key={y} onClick={() => setYearFilter(y)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${yearFilter === y ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-700"}`}>
              {y}
            </button>
          ))}
        </div>
      </div>

      {/* Download buttons */}
      <div className="flex flex-wrap items-center gap-2 print:hidden">
        <span className="text-xs text-gray-400 font-medium">Summary:</span>
        <button onClick={() => window.print()}
          className="flex items-center gap-2 border border-gray-200 hover:bg-gray-50 text-gray-700 text-sm font-semibold px-4 py-2.5 rounded-xl transition-colors">
          <Printer className="w-4 h-4" /> Print / PDF
        </button>
        <button onClick={() => downloadCSV("jacmiya-payroll-summary.csv", SUM_HEADERS, SUM_ROWS)}
          className="flex items-center gap-2 border border-gray-200 hover:bg-gray-50 text-gray-700 text-sm font-semibold px-4 py-2.5 rounded-xl transition-colors">
          <FileText className="w-4 h-4" /> CSV Summary
        </button>
        <button onClick={() => downloadExcel("jacmiya-payroll-summary.xls", "Payroll Summary", SUM_HEADERS, SUM_ROWS)}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold px-4 py-2.5 rounded-xl transition-colors">
          <FileSpreadsheet className="w-4 h-4" /> Excel Summary
        </button>
        <span className="text-xs text-gray-400 font-medium ml-2">All entries:</span>
        <button onClick={() => downloadCSV("jacmiya-payroll-all-entries.csv", ALL_HEADERS, ALL_ROWS)}
          className="flex items-center gap-2 border border-gray-200 hover:bg-gray-50 text-gray-700 text-sm font-semibold px-4 py-2.5 rounded-xl transition-colors">
          <FileText className="w-4 h-4" /> CSV Detailed
        </button>
        <button onClick={() => downloadExcel("jacmiya-payroll-all-entries.xls", "Payroll Entries", ALL_HEADERS, ALL_ROWS)}
          className="flex items-center gap-2 border border-blue-200 bg-blue-50 hover:bg-blue-100 text-blue-700 text-sm font-semibold px-4 py-2.5 rounded-xl transition-colors">
          <FileSpreadsheet className="w-4 h-4" /> Excel Detailed
        </button>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: "Total Net Payroll", value: `KSH ${fmtK(totalNetKsh)}`, sub: `${filtered.length} payroll run${filtered.length !== 1 ? "s" : ""}` },
          { label: "Total Basic Pay", value: `KSH ${fmtK(totalBasicKsh)}`, sub: "Base salaries" },
          { label: "Total Bonuses", value: `KSH ${fmtK(totalBonusKsh)}`, sub: "Performance & incentive" },
          { label: "Total Deductions", value: `KSH ${fmtK(totalDeducKsh)}`, sub: "NHIF / NSSF / other" },
        ].map((c) => (
          <div key={c.label} className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
            <div className="text-xl font-bold text-gray-900">{c.value}</div>
            <div className="text-xs text-gray-500 mt-0.5">{c.label}</div>
            <div className="text-xs text-gray-400 mt-0.5">{c.sub}</div>
          </div>
        ))}
      </div>

      {/* Payroll runs table with expandable entries */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-100">
          <h2 className="font-semibold text-gray-800">Payroll Runs — {filtered.length} run{filtered.length !== 1 ? "s" : ""}</h2>
          <p className="text-xs text-gray-400 mt-0.5 print:hidden">Click a row to expand individual staff entries</p>
        </div>

        {filtered.length === 0 ? (
          <div className="text-center py-12 text-gray-400 text-sm">No payroll runs found for the selected period.</div>
        ) : (
          <div className="divide-y divide-gray-100">
            {filtered.map((run) => (
              <div key={run.id}>
                {/* Run summary row */}
                <button
                  onClick={() => setExpandedRun(expandedRun === run.id ? null : run.id)}
                  className="w-full text-left px-5 py-4 hover:bg-gray-50 transition-colors flex items-center gap-4 print:pointer-events-none">
                  <div className="flex-1 grid grid-cols-2 sm:grid-cols-6 gap-3 text-sm">
                    <div className="font-semibold text-gray-900">{run.label}</div>
                    <div className="text-gray-500">{run.entries.length} staff</div>
                    <div className="hidden sm:block text-gray-600">Basic: <span className="font-medium">{run.totalBasicKsh.toLocaleString()}</span></div>
                    <div className="hidden sm:block text-green-600">Bonus: <span className="font-medium">+{run.totalBonusKsh.toLocaleString()}</span></div>
                    <div className="hidden sm:block text-red-500">Deduct: <span className="font-medium">-{run.totalDeductionKsh.toLocaleString()}</span></div>
                    <div className="font-bold text-gray-900">NET: KSH {run.totalNetKsh.toLocaleString()}</div>
                  </div>
                  <div className="flex-shrink-0 print:hidden">
                    {expandedRun === run.id
                      ? <ChevronUp className="w-4 h-4 text-gray-400" />
                      : <ChevronDown className="w-4 h-4 text-gray-400" />}
                  </div>
                </button>

                {/* Individual entries */}
                {(expandedRun === run.id) && (
                  <div className="border-t border-gray-100 bg-gray-50 print:block">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-gray-200">
                          {["Staff Name", "Role", "Department", "Basic (KSH)", "Bonus (KSH)", "Deduction (KSH)", "Net Pay (KSH)", "Notes"].map((h) => (
                            <th key={h} className="text-left px-5 py-2.5 text-xs font-semibold text-gray-500 uppercase tracking-wider whitespace-nowrap">{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {run.entries.map((e) => (
                          <tr key={e.staffId} className="hover:bg-white transition-colors">
                            <td className="px-5 py-3 font-medium text-gray-900">{e.staffName}</td>
                            <td className="px-5 py-3 text-gray-600 text-xs">{e.role}</td>
                            <td className="px-5 py-3">
                              <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">{e.department}</span>
                            </td>
                            <td className="px-5 py-3 text-right text-gray-700">{e.baseSalary.toLocaleString()}</td>
                            <td className="px-5 py-3 text-right text-green-600">{e.bonus > 0 ? `+${e.bonus.toLocaleString()}` : "—"}</td>
                            <td className="px-5 py-3 text-right text-red-500">{e.deduction > 0 ? `-${e.deduction.toLocaleString()}` : "—"}</td>
                            <td className="px-5 py-3 text-right font-bold text-gray-900">{e.netPay.toLocaleString()}</td>
                            <td className="px-5 py-3 text-xs text-gray-400">{e.notes || "—"}</td>
                          </tr>
                        ))}
                        <tr className="border-t-2 border-gray-300 bg-white font-bold">
                          <td colSpan={3} className="px-5 py-3 text-gray-700">Run Total</td>
                          <td className="px-5 py-3 text-right">{run.totalBasicKsh.toLocaleString()}</td>
                          <td className="px-5 py-3 text-right text-green-700">+{run.totalBonusKsh.toLocaleString()}</td>
                          <td className="px-5 py-3 text-right text-red-600">-{run.totalDeductionKsh.toLocaleString()}</td>
                          <td className="px-5 py-3 text-right text-gray-900">{run.totalNetKsh.toLocaleString()}</td>
                          <td />
                        </tr>
                      </tbody>
                    </table>
                    {run.notes && (
                      <div className="px-5 py-3 border-t border-gray-100 text-xs text-gray-500">{run.notes}</div>
                    )}
                  </div>
                )}
              </div>
            ))}

            {/* Grand total */}
            {filtered.length > 1 && (
              <div className="px-5 py-4 bg-gray-50 border-t-2 border-gray-300">
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm font-bold">
                  <div>Grand Total — {filtered.length} runs</div>
                  <div className="text-gray-700">Basic: KSH {totalBasicKsh.toLocaleString()}</div>
                  <div className="text-green-700">+Bonus: KSH {totalBonusKsh.toLocaleString()}</div>
                  <div className="text-gray-900">NET: KSH {totalNetKsh.toLocaleString()}</div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      <div className="pb-8 print:hidden">
        <Link href="/admin/reports" className="border border-gray-200 text-gray-600 hover:bg-gray-50 font-semibold px-6 py-3 rounded-xl text-sm transition-colors">
          ← Back to Reports
        </Link>
      </div>
    </div>
  );
}
