"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { getStaff, processPayroll, isMonthProcessed, getExchangeRate } from "@/lib/adminStore";
import type { PayrollEntry } from "@/types/admin";
import { ArrowLeft, AlertCircle, CheckCircle } from "lucide-react";

// Generate list of last 12 months for the month picker
function getMonthOptions() {
  const options: { value: string; label: string }[] = [];
  const now = new Date();
  for (let i = 0; i < 12; i++) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const value = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    const label = d.toLocaleString("default", { month: "long", year: "numeric" });
    options.push({ value, label });
  }
  return options;
}

export default function NewPayroll() {
  const router = useRouter();
  const monthOptions = getMonthOptions();
  const rate = getExchangeRate();

  const now = new Date();
  const defaultMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;

  const [month, setMonth] = useState(defaultMonth);
  const [entries, setEntries] = useState<PayrollEntry[]>([]);
  const [globalNote, setGlobalNote] = useState("");
  const [saving, setSaving] = useState(false);

  const alreadyProcessed = isMonthProcessed(month);
  const selectedLabel = monthOptions.find((m) => m.value === month)?.label ?? month;

  useEffect(() => {
    const staff = getStaff().filter((s) => s.status !== "Inactive");
    setEntries(
      staff.map((s) => ({
        staffId: s.id,
        staffName: s.name,
        role: s.role,
        department: s.department,
        baseSalary: s.salary,
        bonus: 0,
        deduction: 0,
        netPay: s.salary,
        notes: "",
      }))
    );
  }, []);

  function updateEntry(idx: number, field: "bonus" | "deduction" | "notes", value: string | number) {
    setEntries((prev) =>
      prev.map((e, i) => {
        if (i !== idx) return e;
        const updated = { ...e, [field]: value };
        updated.netPay = updated.baseSalary + Number(updated.bonus) - Number(updated.deduction);
        return updated;
      })
    );
  }

  const totals = useMemo(() => {
    const basicKsh = entries.reduce((a, e) => a + e.baseSalary, 0);
    const bonusKsh = entries.reduce((a, e) => a + Number(e.bonus), 0);
    const deductionKsh = entries.reduce((a, e) => a + Number(e.deduction), 0);
    const netKsh = entries.reduce((a, e) => a + e.netPay, 0);
    return { basicKsh, bonusKsh, deductionKsh, netKsh, netUsd: rate > 0 ? Math.round(netKsh / rate) : 0 };
  }, [entries, rate]);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (alreadyProcessed) return;
    setSaving(true);
    processPayroll({
      month,
      label: selectedLabel,
      entries,
      totalBasicKsh: totals.basicKsh,
      totalBonusKsh: totals.bonusKsh,
      totalDeductionKsh: totals.deductionKsh,
      totalNetKsh: totals.netKsh,
      totalNetUsd: totals.netUsd,
      rate,
      notes: globalNote,
    });
    router.push("/admin/hr/payroll");
  }

  const inputCls = "w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-800 bg-white placeholder-gray-400 focus:outline-none focus:border-emerald-400 transition-colors text-right";

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/admin/hr/payroll" className="p-2 rounded-lg hover:bg-gray-100 transition-colors text-gray-500">
          <ArrowLeft className="w-4 h-4" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Run Payroll</h1>
          <p className="text-gray-500 text-sm">Review and process staff wages for the selected month</p>
        </div>
      </div>

      {/* Month selector */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
        <div className="flex flex-col sm:flex-row sm:items-center gap-4">
          <div className="flex-1">
            <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wider mb-1.5">Payroll Month</label>
            <select
              value={month}
              onChange={(e) => setMonth(e.target.value)}
              className="border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-800 bg-white focus:outline-none focus:border-emerald-400 transition-colors w-64"
            >
              {monthOptions.map((m) => (
                <option key={m.value} value={m.value}>{m.label}</option>
              ))}
            </select>
          </div>
          <div className="flex-shrink-0 text-sm text-gray-500">
            Exchange rate: <span className="font-semibold text-gray-800">1 USD = {rate} KSH</span>
          </div>
        </div>

        {alreadyProcessed && (
          <div className="flex items-center gap-2 mt-4 bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 text-sm text-amber-800">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            Payroll for <strong>{selectedLabel}</strong> has already been processed. Select a different month or view the existing run.
          </div>
        )}
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Staff payroll table */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-100">
            <h2 className="font-semibold text-gray-800">Staff Wages — {selectedLabel}</h2>
            <p className="text-xs text-gray-400 mt-0.5">Inactive staff are excluded. Adjust bonuses and deductions per person.</p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100">
                  <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Staff Member</th>
                  <th className="text-right px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider w-36">Base Salary (KSH)</th>
                  <th className="text-right px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider w-32">Bonus (KSH)</th>
                  <th className="text-right px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider w-32">Deduction (KSH)</th>
                  <th className="text-right px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider w-36">Net Pay (KSH)</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Notes</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {entries.map((entry, i) => (
                  <tr key={entry.staffId} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center flex-shrink-0">
                          <span className="text-emerald-700 font-bold text-xs">{entry.staffName.charAt(0)}</span>
                        </div>
                        <div>
                          <div className="font-medium text-gray-800 text-sm">{entry.staffName}</div>
                          <div className="text-xs text-gray-400">{entry.role} · {entry.department}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3.5 text-right font-semibold text-gray-700">
                      {entry.baseSalary.toLocaleString()}
                    </td>
                    <td className="px-4 py-3.5">
                      <input
                        type="number"
                        min={0}
                        className={inputCls}
                        value={entry.bonus || ""}
                        placeholder="0"
                        onChange={(e) => updateEntry(i, "bonus", Number(e.target.value))}
                        disabled={alreadyProcessed}
                      />
                    </td>
                    <td className="px-4 py-3.5">
                      <input
                        type="number"
                        min={0}
                        className={inputCls}
                        value={entry.deduction || ""}
                        placeholder="0"
                        onChange={(e) => updateEntry(i, "deduction", Number(e.target.value))}
                        disabled={alreadyProcessed}
                      />
                    </td>
                    <td className="px-4 py-3.5 text-right">
                      <span className={`font-bold text-sm ${entry.netPay >= entry.baseSalary ? "text-emerald-700" : "text-red-600"}`}>
                        {entry.netPay.toLocaleString()}
                      </span>
                    </td>
                    <td className="px-4 py-3.5">
                      <input
                        type="text"
                        className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-800 bg-white placeholder-gray-400 focus:outline-none focus:border-emerald-400 transition-colors"
                        value={entry.notes}
                        placeholder="e.g. Performance bonus"
                        onChange={(e) => updateEntry(i, "notes", e.target.value)}
                        disabled={alreadyProcessed}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>

              {/* Totals row */}
              <tfoot>
                <tr className="bg-emerald-50 border-t-2 border-emerald-200">
                  <td className="px-5 py-4 font-bold text-gray-800">
                    Total — {entries.length} staff
                  </td>
                  <td className="px-4 py-4 text-right font-bold text-gray-700">
                    {totals.basicKsh.toLocaleString()}
                  </td>
                  <td className="px-4 py-4 text-right font-bold text-green-600">
                    {totals.bonusKsh > 0 ? `+${totals.bonusKsh.toLocaleString()}` : "—"}
                  </td>
                  <td className="px-4 py-4 text-right font-bold text-red-500">
                    {totals.deductionKsh > 0 ? `-${totals.deductionKsh.toLocaleString()}` : "—"}
                  </td>
                  <td className="px-4 py-4 text-right">
                    <div className="font-bold text-emerald-700 text-base">{totals.netKsh.toLocaleString()}</div>
                    <div className="text-xs text-gray-500">≈ USD {totals.netUsd.toLocaleString()}</div>
                  </td>
                  <td className="px-4 py-4" />
                </tr>
              </tfoot>
            </table>
          </div>
        </div>

        {/* Notes + process */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
          <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wider mb-1.5">Payroll Notes</label>
          <textarea
            rows={2}
            value={globalNote}
            onChange={(e) => setGlobalNote(e.target.value)}
            placeholder="e.g. July 2026 payroll — processed on time. Mid-year bonus included."
            className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:border-emerald-400 resize-none"
            disabled={alreadyProcessed}
          />
        </div>

        {/* Process banner */}
        {!alreadyProcessed && (
          <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-5">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <p className="text-sm font-semibold text-emerald-800">
                  Ready to process — Total payout: KSH {totals.netKsh.toLocaleString()} (USD {totals.netUsd.toLocaleString()})
                </p>
                <p className="text-xs text-emerald-700 mt-0.5">
                  This will create a <strong>Staff Wages</strong> expense entry for {selectedLabel} and lock this payroll run.
                </p>
              </div>
              <button
                type="submit"
                disabled={saving || alreadyProcessed || entries.length === 0}
                className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold px-6 py-3 rounded-xl text-sm transition-colors disabled:opacity-60 flex-shrink-0"
              >
                <CheckCircle className="w-4 h-4" />
                {saving ? "Processing…" : `Process ${selectedLabel} Payroll`}
              </button>
            </div>
          </div>
        )}

        <div className="pb-8">
          <Link href="/admin/hr/payroll" className="border border-gray-200 text-gray-600 hover:bg-gray-50 font-semibold px-6 py-3 rounded-xl text-sm transition-colors">
            Cancel
          </Link>
        </div>
      </form>
    </div>
  );
}
