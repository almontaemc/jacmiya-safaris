"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { getPayroll, deletePayrollRun, isMonthProcessed } from "@/lib/adminStore";
import type { PayrollRun } from "@/types/admin";
import { Plus, Eye, Trash2, Banknote, Users, TrendingUp, AlertCircle } from "lucide-react";

export default function PayrollPage() {
  const router = useRouter();
  const [runs, setRuns] = useState<PayrollRun[]>([]);

  function load() {
    setRuns([...getPayroll()].sort((a, b) => b.month.localeCompare(a.month)));
  }
  useEffect(() => { load(); }, []);

  const now = new Date();
  const currentMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
  const currentLabel = now.toLocaleString("default", { month: "long", year: "numeric" });
  const alreadyRun = isMonthProcessed(currentMonth);

  const totalYearKsh = runs
    .filter((r) => r.month.startsWith(String(now.getFullYear())))
    .reduce((a, r) => a + r.totalNetKsh, 0);
  const totalYearUsd = runs
    .filter((r) => r.month.startsWith(String(now.getFullYear())))
    .reduce((a, r) => a + r.totalNetUsd, 0);

  const lastRun = runs[0];

  function handleDelete(id: string) {
    if (!confirm("Delete this payroll run? This will NOT reverse any expense entries.")) return;
    deletePayrollRun(id);
    load();
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Payroll</h1>
          <p className="text-gray-500 text-sm mt-0.5">Process monthly staff wages and track payroll history</p>
        </div>
        {alreadyRun ? (
          <div className="flex items-center gap-2 bg-green-50 border border-green-200 text-green-700 text-sm font-medium px-4 py-2.5 rounded-xl">
            <AlertCircle className="w-4 h-4" />
            {currentLabel} already processed
          </div>
        ) : (
          <Link href="/admin/hr/payroll/new"
            className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold px-4 py-2.5 rounded-xl transition-colors">
            <Plus className="w-4 h-4" /> Run Payroll — {currentLabel}
          </Link>
        )}
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-8 h-8 bg-emerald-50 rounded-lg flex items-center justify-center">
              <TrendingUp className="w-4 h-4 text-emerald-600" />
            </div>
            <span className="text-sm font-medium text-gray-600">Wages This Year</span>
          </div>
          <div className="text-xl font-bold text-gray-900">KSH {totalYearKsh.toLocaleString()}</div>
          <div className="text-sm text-gray-500 mt-0.5">USD {totalYearUsd.toLocaleString()}</div>
          <div className="text-xs text-gray-400 mt-1">{runs.filter((r) => r.month.startsWith(String(now.getFullYear()))).length} payroll run{runs.length !== 1 ? "s" : ""}</div>
        </div>

        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-8 h-8 bg-blue-50 rounded-lg flex items-center justify-center">
              <Banknote className="w-4 h-4 text-blue-600" />
            </div>
            <span className="text-sm font-medium text-gray-600">Last Payroll</span>
          </div>
          {lastRun ? (
            <>
              <div className="text-xl font-bold text-gray-900">KSH {lastRun.totalNetKsh.toLocaleString()}</div>
              <div className="text-sm text-gray-500 mt-0.5">{lastRun.label}</div>
              <div className="text-xs text-gray-400 mt-1">{lastRun.entries.length} staff members</div>
            </>
          ) : (
            <div className="text-sm text-gray-400">No payroll runs yet</div>
          )}
        </div>

        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-8 h-8 bg-purple-50 rounded-lg flex items-center justify-center">
              <Users className="w-4 h-4 text-purple-600" />
            </div>
            <span className="text-sm font-medium text-gray-600">Total Runs</span>
          </div>
          <div className="text-xl font-bold text-gray-900">{runs.length}</div>
          <div className="text-sm text-gray-500 mt-0.5">payroll runs on record</div>
          <div className="text-xs text-gray-400 mt-1">
            {alreadyRun ? `${currentLabel} ✓ processed` : `${currentLabel} — pending`}
          </div>
        </div>
      </div>

      {/* Run Payroll CTA if not yet done */}
      {!alreadyRun && (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5 flex items-center justify-between gap-4">
          <div>
            <p className="text-sm font-semibold text-amber-800">{currentLabel} payroll has not been processed yet</p>
            <p className="text-xs text-amber-700 mt-0.5">Run payroll to automatically log staff wages as an expense entry and keep your P&amp;L accurate.</p>
          </div>
          <Link href="/admin/hr/payroll/new"
            className="flex items-center gap-2 bg-amber-500 hover:bg-amber-600 text-white text-sm font-semibold px-4 py-2.5 rounded-xl transition-colors flex-shrink-0">
            <Banknote className="w-4 h-4" /> Run Now
          </Link>
        </div>
      )}

      {/* History table */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100">
        <div className="px-5 py-4 border-b border-gray-100">
          <h2 className="font-semibold text-gray-800">Payroll History</h2>
        </div>

        {runs.length === 0 ? (
          <div className="py-20 text-center text-gray-400 text-sm">No payroll runs yet. Process your first payroll above.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Month</th>
                  <th className="text-right px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Staff</th>
                  <th className="text-right px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Basic Pay</th>
                  <th className="text-right px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Bonuses</th>
                  <th className="text-right px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Deductions</th>
                  <th className="text-right px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Net Total</th>
                  <th className="text-right px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Processed</th>
                  <th className="px-5 py-3"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {runs.map((run) => (
                  <tr key={run.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-5 py-4">
                      <div className="font-semibold text-gray-800">{run.label}</div>
                      {run.notes && <div className="text-xs text-gray-400 mt-0.5 max-w-xs truncate">{run.notes}</div>}
                    </td>
                    <td className="px-5 py-4 text-right text-gray-600">{run.entries.length}</td>
                    <td className="px-5 py-4 text-right text-gray-600">KSH {run.totalBasicKsh.toLocaleString()}</td>
                    <td className="px-5 py-4 text-right text-green-600 font-medium">
                      {run.totalBonusKsh > 0 ? `+KSH ${run.totalBonusKsh.toLocaleString()}` : "—"}
                    </td>
                    <td className="px-5 py-4 text-right text-red-500 font-medium">
                      {run.totalDeductionKsh > 0 ? `-KSH ${run.totalDeductionKsh.toLocaleString()}` : "—"}
                    </td>
                    <td className="px-5 py-4 text-right">
                      <div className="font-bold text-gray-900">KSH {run.totalNetKsh.toLocaleString()}</div>
                      <div className="text-xs text-gray-400">USD {run.totalNetUsd.toLocaleString()}</div>
                    </td>
                    <td className="px-5 py-4 text-right text-xs text-gray-400">
                      {new Date(run.processedAt).toLocaleDateString()}
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center justify-end gap-2">
                        <Link href={`/admin/hr/payroll/${run.id}`}
                          className="p-2 text-gray-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors">
                          <Eye className="w-4 h-4" />
                        </Link>
                        <button onClick={() => handleDelete(run.id)}
                          className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
