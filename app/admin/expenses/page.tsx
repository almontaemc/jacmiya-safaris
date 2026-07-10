"use client";

import { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import { getExpenses, deleteExpense } from "@/lib/adminStore";
import type { Expense, ExpenseCategory } from "@/types/admin";
import { Plus, Trash2, Receipt } from "lucide-react";

const CATEGORIES: ExpenseCategory[] = ["Park Fees", "Fuel", "Accommodation", "Staff Wages", "Vehicle Maintenance", "Marketing", "Office", "Other"];
const CAT_COLOR: Record<ExpenseCategory, string> = {
  "Park Fees": "bg-green-100 text-green-700",
  "Fuel": "bg-orange-100 text-orange-700",
  "Accommodation": "bg-blue-100 text-blue-700",
  "Staff Wages": "bg-purple-100 text-purple-700",
  "Vehicle Maintenance": "bg-red-100 text-red-700",
  "Marketing": "bg-pink-100 text-pink-700",
  "Office": "bg-gray-100 text-gray-600",
  "Other": "bg-slate-100 text-slate-600",
};

export default function ExpensesPage() {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [catFilter, setCatFilter] = useState<"All" | ExpenseCategory>("All");
  const [monthFilter, setMonthFilter] = useState("");

  function load() {
    const data = getExpenses();
    setExpenses(data);
    if (!monthFilter && data.length > 0) {
      const latest = data.reduce((a, b) => a.date > b.date ? a : b).date.slice(0, 7);
      setMonthFilter(latest);
    }
  }
  useEffect(() => { load(); }, []);

  const months = useMemo(() => {
    const set = new Set(expenses.map((e) => e.date.slice(0, 7)));
    return [...set].sort().reverse();
  }, [expenses]);

  const filtered = useMemo(() => {
    return expenses
      .filter((e) => {
        if (catFilter !== "All" && e.category !== catFilter) return false;
        if (monthFilter && !e.date.startsWith(monthFilter)) return false;
        return true;
      })
      .sort((a, b) => b.date.localeCompare(a.date));
  }, [expenses, catFilter, monthFilter]);

  const totalKsh = filtered.reduce((a, e) => a + e.amountKsh, 0);
  const totalUsd = filtered.reduce((a, e) => a + e.amountUsd, 0);

  const byCategory = useMemo(() => {
    const map: Record<string, number> = {};
    filtered.forEach((e) => { map[e.category] = (map[e.category] ?? 0) + e.amountKsh; });
    return Object.entries(map).sort((a, b) => b[1] - a[1]);
  }, [filtered]);

  function handleDelete(id: string) {
    if (!confirm("Delete this expense?")) return;
    deleteExpense(id);
    load();
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Expenses</h1>
          <p className="text-gray-500 text-sm mt-0.5">Track all operational costs</p>
        </div>
        <Link href="/admin/expenses/new" className="flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white text-sm font-semibold px-4 py-2.5 rounded-xl transition-colors">
          <Plus className="w-4 h-4" /> Log Expense
        </Link>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="sm:col-span-2 bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 bg-orange-50 rounded-lg flex items-center justify-center"><Receipt className="w-4 h-4 text-orange-600" /></div>
            <div>
              <p className="text-sm font-medium text-gray-600">
                {monthFilter ? new Date(monthFilter + "-01").toLocaleString("default", { month: "long", year: "numeric" }) : "All time"}
                {catFilter !== "All" ? ` · ${catFilter}` : ""}
              </p>
            </div>
          </div>
          <div className="text-2xl font-bold text-gray-900">KSH {totalKsh.toLocaleString()}</div>
          <div className="text-sm text-gray-500 mt-0.5">USD {totalUsd.toLocaleString()}</div>
          <div className="text-xs text-gray-400 mt-1">{filtered.length} expense{filtered.length !== 1 ? "s" : ""}</div>
        </div>
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">By Category</p>
          <div className="space-y-2">
            {byCategory.slice(0, 5).map(([cat, ksh]) => (
              <div key={cat} className="flex items-center justify-between text-xs">
                <span className={`px-2 py-0.5 rounded-full ${CAT_COLOR[cat as ExpenseCategory] ?? "bg-gray-100 text-gray-500"}`}>{cat}</span>
                <span className="font-semibold text-gray-700">KSH {ksh.toLocaleString()}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100">
        <div className="flex flex-wrap items-center gap-3 px-5 py-4 border-b border-gray-100">
          <select value={monthFilter} onChange={(e) => setMonthFilter(e.target.value)} className="border border-gray-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:border-orange-400">
            <option value="">All months</option>
            {months.map((m) => <option key={m} value={m}>{new Date(m + "-01").toLocaleString("default", { month: "long", year: "numeric" })}</option>)}
          </select>
          <div className="flex gap-1 flex-wrap">
            <button onClick={() => setCatFilter("All")} className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${catFilter === "All" ? "bg-orange-500 text-white" : "text-gray-600 hover:bg-gray-100"}`}>All</button>
            {CATEGORIES.map((c) => (
              <button key={c} onClick={() => setCatFilter(c)} className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${catFilter === c ? "bg-orange-500 text-white" : "text-gray-600 hover:bg-gray-100"}`}>{c}</button>
            ))}
          </div>
        </div>

        <div className="divide-y divide-gray-50">
          {filtered.length === 0 && <div className="py-16 text-center text-gray-400 text-sm">No expenses found.</div>}
          {filtered.map((e) => (
            <div key={e.id} className="flex items-center gap-4 px-5 py-4 hover:bg-gray-50 transition-colors">
              <div className="flex-shrink-0">
                <div className="w-10 h-10 bg-orange-50 rounded-xl flex items-center justify-center"><Receipt className="w-4 h-4 text-orange-500" /></div>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <p className="text-sm font-semibold text-gray-800 truncate">{e.description}</p>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium flex-shrink-0 ${CAT_COLOR[e.category]}`}>{e.category}</span>
                </div>
                <div className="flex items-center gap-3 mt-0.5">
                  <p className="text-xs text-gray-400">{e.date}</p>
                  {e.receiptRef && <p className="text-xs text-gray-300">Ref: {e.receiptRef}</p>}
                </div>
              </div>
              <div className="text-right flex-shrink-0">
                <div className="text-sm font-bold text-gray-800">KSH {e.amountKsh.toLocaleString()}</div>
                <div className="text-xs text-gray-500">USD {e.amountUsd.toLocaleString()}</div>
              </div>
              <button onClick={() => handleDelete(e.id)} className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors flex-shrink-0">
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
