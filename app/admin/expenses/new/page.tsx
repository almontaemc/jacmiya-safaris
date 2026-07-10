"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { addExpense, getExchangeRate } from "@/lib/adminStore";
import type { ExpenseCategory } from "@/types/admin";
import { ArrowLeft } from "lucide-react";

const CATEGORIES: ExpenseCategory[] = ["Park Fees", "Fuel", "Accommodation", "Staff Wages", "Vehicle Maintenance", "Marketing", "Office", "Other"];

export default function NewExpense() {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const rate = getExchangeRate();
  const [form, setForm] = useState({
    date: new Date().toISOString().slice(0, 10),
    category: "Park Fees" as ExpenseCategory,
    description: "",
    amountKsh: 0,
    amountUsd: 0,
    receiptRef: "",
  });

  function setF<K extends keyof typeof form>(k: K, v: typeof form[K]) {
    setForm((p) => ({ ...p, [k]: v }));
  }

  function handleKsh(v: number) {
    setForm((p) => ({ ...p, amountKsh: v, amountUsd: rate > 0 ? Math.round(v / rate) : p.amountUsd }));
  }
  function handleUsd(v: number) {
    setForm((p) => ({ ...p, amountUsd: v, amountKsh: Math.round(v * rate) }));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    addExpense(form);
    router.push("/admin/expenses");
  }

  const inputCls = "w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-800 bg-white placeholder-gray-400 focus:outline-none focus:border-orange-400 transition-colors";
  const labelCls = "block text-xs font-semibold text-gray-600 uppercase tracking-wider mb-1.5";

  return (
    <div className="max-w-xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/admin/expenses" className="p-2 rounded-lg hover:bg-gray-100 transition-colors text-gray-500"><ArrowLeft className="w-4 h-4" /></Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Log Expense</h1>
          <p className="text-gray-500 text-sm">Record an operational cost</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 space-y-5">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className={labelCls}>Date *</label>
            <input type="date" className={inputCls} value={form.date} onChange={(e) => setF("date", e.target.value)} required />
          </div>
          <div>
            <label className={labelCls}>Category *</label>
            <select className={inputCls} value={form.category} onChange={(e) => setF("category", e.target.value as ExpenseCategory)}>
              {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
            </select>
          </div>
        </div>

        <div>
          <label className={labelCls}>Description *</label>
          <input className={inputCls} value={form.description} onChange={(e) => setF("description", e.target.value)} placeholder="e.g. Masai Mara conservancy fees — 4 pax × 2 nights" required />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className={labelCls}>Amount (KSH) *</label>
            <input type="number" min={0} className={inputCls} value={form.amountKsh || ""} onChange={(e) => handleKsh(Number(e.target.value))} placeholder="e.g. 45000" required />
            <p className="text-xs text-gray-400 mt-1">Auto-converts to USD at rate {rate}</p>
          </div>
          <div>
            <label className={labelCls}>Amount (USD) *</label>
            <input type="number" min={0} className={inputCls} value={form.amountUsd || ""} onChange={(e) => handleUsd(Number(e.target.value))} placeholder="e.g. 349" required />
            <p className="text-xs text-gray-400 mt-1">Auto-converts to KSH at rate {rate}</p>
          </div>
        </div>

        <div>
          <label className={labelCls}>Receipt / Reference</label>
          <input className={inputCls} value={form.receiptRef} onChange={(e) => setF("receiptRef", e.target.value)} placeholder="e.g. KWS-2026-0710 (optional)" />
        </div>

        <div className="flex gap-3 pt-2">
          <button type="submit" disabled={saving} className="bg-orange-500 hover:bg-orange-600 text-white font-semibold px-6 py-3 rounded-xl text-sm transition-colors disabled:opacity-60">
            {saving ? "Saving…" : "Log Expense"}
          </button>
          <Link href="/admin/expenses" className="border border-gray-200 text-gray-600 hover:bg-gray-50 font-semibold px-6 py-3 rounded-xl text-sm transition-colors">Cancel</Link>
        </div>
      </form>
    </div>
  );
}
