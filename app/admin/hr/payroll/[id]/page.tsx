"use client";

import { use, useEffect, useState } from "react";
import Link from "next/link";
import { getPayrollRun } from "@/lib/adminStore";
import type { PayrollRun } from "@/types/admin";
import { ArrowLeft, Printer, Banknote, TrendingUp, Users, Minus } from "lucide-react";

export default function PayrollRunDetail({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [run, setRun] = useState<PayrollRun | null>(null);

  useEffect(() => {
    setRun(getPayrollRun(id) ?? null);
  }, [id]);

  if (!run) return <div className="p-6 text-gray-400">Payroll run not found.</div>;

  const processedDate = new Date(run.processedAt).toLocaleDateString("en-GB", {
    day: "numeric", month: "long", year: "numeric",
  });

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header — hidden on print */}
      <div className="flex items-center gap-3 print:hidden">
        <Link href="/admin/hr/payroll" className="p-2 rounded-lg hover:bg-gray-100 transition-colors text-gray-500">
          <ArrowLeft className="w-4 h-4" />
        </Link>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-gray-900">{run.label} Payroll</h1>
          <p className="text-gray-500 text-sm">Processed on {processedDate}</p>
        </div>
        <button
          onClick={() => window.print()}
          className="flex items-center gap-2 border border-gray-200 text-gray-600 hover:bg-gray-50 text-sm font-semibold px-4 py-2.5 rounded-xl transition-colors"
        >
          <Printer className="w-4 h-4" /> Print / Export
        </button>
      </div>

      {/* Print header — only visible on print */}
      <div className="hidden print:block mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Jacmiya Safaris — Payroll Summary</h1>
        <p className="text-gray-600">{run.label} · Processed: {processedDate}</p>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: "Basic Pay", value: `KSH ${run.totalBasicKsh.toLocaleString()}`, icon: Banknote, color: "bg-gray-50 text-gray-600" },
          { label: "Total Bonuses", value: run.totalBonusKsh > 0 ? `+KSH ${run.totalBonusKsh.toLocaleString()}` : "None", icon: TrendingUp, color: "bg-green-50 text-green-600" },
          { label: "Deductions", value: run.totalDeductionKsh > 0 ? `-KSH ${run.totalDeductionKsh.toLocaleString()}` : "None", icon: Minus, color: "bg-red-50 text-red-500" },
          { label: "Net Total", value: `KSH ${run.totalNetKsh.toLocaleString()}`, icon: Users, color: "bg-emerald-50 text-emerald-700" },
        ].map((s) => (
          <div key={s.label} className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center mb-3 ${s.color}`}>
              <s.icon className="w-4 h-4" />
            </div>
            <div className="font-bold text-gray-900 text-sm">{s.value}</div>
            <div className="text-xs text-gray-500 mt-0.5">{s.label}</div>
          </div>
        ))}
      </div>

      <div className="bg-emerald-50 border border-emerald-200 rounded-2xl px-5 py-4 flex flex-wrap items-center justify-between gap-3">
        <div>
          <span className="text-xs text-emerald-700 font-semibold uppercase tracking-wider">Net Payout</span>
          <div className="text-3xl font-bold text-emerald-800 mt-0.5">KSH {run.totalNetKsh.toLocaleString()}</div>
        </div>
        <div className="text-right">
          <div className="text-lg font-bold text-emerald-700">USD {run.totalNetUsd.toLocaleString()}</div>
          <div className="text-xs text-emerald-600 mt-0.5">at rate 1 USD = {run.rate} KSH</div>
          <div className="text-xs text-emerald-600">{run.entries.length} staff members</div>
        </div>
      </div>

      {/* Individual entries */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-100">
          <h2 className="font-semibold text-gray-800">Individual Payslips</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Staff Member</th>
                <th className="text-right px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Basic (KSH)</th>
                <th className="text-right px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Bonus</th>
                <th className="text-right px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Deduction</th>
                <th className="text-right px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Net Pay (KSH)</th>
                <th className="text-right px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Net (USD)</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Notes</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {run.entries.map((e) => (
                <tr key={e.staffId} className="hover:bg-gray-50/50 transition-colors">
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center flex-shrink-0">
                        <span className="text-emerald-700 font-bold text-xs">{e.staffName.charAt(0)}</span>
                      </div>
                      <div>
                        <div className="font-medium text-gray-800">{e.staffName}</div>
                        <div className="text-xs text-gray-400">{e.role} · {e.department}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-4 text-right text-gray-600">{e.baseSalary.toLocaleString()}</td>
                  <td className="px-4 py-4 text-right text-green-600 font-medium">
                    {e.bonus > 0 ? `+${e.bonus.toLocaleString()}` : "—"}
                  </td>
                  <td className="px-4 py-4 text-right text-red-500 font-medium">
                    {e.deduction > 0 ? `-${e.deduction.toLocaleString()}` : "—"}
                  </td>
                  <td className="px-4 py-4 text-right font-bold text-gray-900">{e.netPay.toLocaleString()}</td>
                  <td className="px-4 py-4 text-right text-gray-500 text-xs">
                    {run.rate > 0 ? Math.round(e.netPay / run.rate).toLocaleString() : "—"}
                  </td>
                  <td className="px-4 py-4 text-gray-500 text-xs">{e.notes || "—"}</td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="bg-emerald-50 border-t-2 border-emerald-200 font-bold">
                <td className="px-5 py-4 text-gray-800">Total ({run.entries.length} staff)</td>
                <td className="px-4 py-4 text-right text-gray-700">{run.totalBasicKsh.toLocaleString()}</td>
                <td className="px-4 py-4 text-right text-green-600">
                  {run.totalBonusKsh > 0 ? `+${run.totalBonusKsh.toLocaleString()}` : "—"}
                </td>
                <td className="px-4 py-4 text-right text-red-500">
                  {run.totalDeductionKsh > 0 ? `-${run.totalDeductionKsh.toLocaleString()}` : "—"}
                </td>
                <td className="px-4 py-4 text-right text-emerald-700 text-base">{run.totalNetKsh.toLocaleString()}</td>
                <td className="px-4 py-4 text-right text-emerald-600">{run.totalNetUsd.toLocaleString()}</td>
                <td className="px-4 py-4" />
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

      {/* Notes & metadata */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {run.notes && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Payroll Notes</h3>
            <p className="text-sm text-gray-700">{run.notes}</p>
          </div>
        )}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
          <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Run Details</h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between"><span className="text-gray-500">Month</span><span className="font-medium text-gray-800">{run.label}</span></div>
            <div className="flex justify-between"><span className="text-gray-500">Processed</span><span className="font-medium text-gray-800">{processedDate}</span></div>
            <div className="flex justify-between"><span className="text-gray-500">Exchange Rate</span><span className="font-medium text-gray-800">1 USD = {run.rate} KSH</span></div>
            <div className="flex justify-between"><span className="text-gray-500">Run ID</span><span className="text-xs text-gray-400 font-mono">{run.id}</span></div>
            {run.expenseId && (
              <div className="flex justify-between"><span className="text-gray-500">Expense Entry</span>
                <Link href="/admin/expenses" className="text-xs text-blue-600 hover:underline font-medium">View in Expenses →</Link>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="pb-8 print:hidden">
        <Link href="/admin/hr/payroll" className="border border-gray-200 text-gray-600 hover:bg-gray-50 font-semibold px-6 py-3 rounded-xl text-sm transition-colors">
          ← Back to Payroll
        </Link>
      </div>
    </div>
  );
}
