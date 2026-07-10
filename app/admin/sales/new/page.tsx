"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { addSale, updateLead, getTours, getExchangeRate } from "@/lib/adminStore";
import type { PaymentStatus } from "@/types/admin";
import { ArrowLeft } from "lucide-react";

const PAY_STATUSES: PaymentStatus[] = ["Pending Deposit", "Deposit Paid", "Fully Paid", "Refunded", "Cancelled"];

function NewSaleForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [saving, setSaving] = useState(false);
  const [tourOptions, setTourOptions] = useState<{ id: number; title: string }[]>([]);
  const rate = getExchangeRate();

  const [form, setForm] = useState({
    clientName: searchParams.get("name") ?? "",
    clientEmail: searchParams.get("email") ?? "",
    clientPhone: searchParams.get("phone") ?? "",
    tourTitle: searchParams.get("tour") ?? "",
    tourId: 0,
    travelFrom: "", travelTo: "",
    pax: 1, amountKsh: 0, amountUsd: 0,
    depositKsh: 0, depositUsd: 0,
    paymentStatus: "Pending Deposit" as PaymentStatus,
    notes: "",
  });

  const leadId = searchParams.get("leadId") ?? "";

  useEffect(() => {
    setTourOptions(getTours().filter((t) => t.active).map((t) => ({ id: t.id, title: t.title })));
  }, []);

  function setF<K extends keyof typeof form>(k: K, v: typeof form[K]) {
    setForm((p) => ({ ...p, [k]: v }));
  }

  function handleTourSelect(title: string) {
    const found = tourOptions.find((t) => t.title === title);
    setForm((p) => ({ ...p, tourTitle: title, tourId: found?.id ?? 0 }));
  }

  function handleAmtKsh(v: number) {
    setForm((p) => ({ ...p, amountKsh: v, amountUsd: rate > 0 ? Math.round(v / rate) : p.amountUsd }));
  }
  function handleAmtUsd(v: number) {
    setForm((p) => ({ ...p, amountUsd: v, amountKsh: Math.round(v * rate) }));
  }
  function handleDepKsh(v: number) {
    setForm((p) => ({ ...p, depositKsh: v, depositUsd: rate > 0 ? Math.round(v / rate) : p.depositUsd }));
  }
  function handleDepUsd(v: number) {
    setForm((p) => ({ ...p, depositUsd: v, depositKsh: Math.round(v * rate) }));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    const sale = addSale({ ...form, leadId: leadId || undefined });
    if (leadId) updateLead(leadId, { status: "Won", convertedSaleId: sale.id });
    router.push("/admin/sales");
  }

  const inputCls = "w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-800 bg-white placeholder-gray-400 focus:outline-none focus:border-blue-400 transition-colors";
  const labelCls = "block text-xs font-semibold text-gray-600 uppercase tracking-wider mb-1.5";

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/admin/sales" className="p-2 rounded-lg hover:bg-gray-100 transition-colors text-gray-500"><ArrowLeft className="w-4 h-4" /></Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Add Booking</h1>
          <p className="text-gray-500 text-sm">{leadId ? "Converting lead to confirmed booking" : "Record a new confirmed booking"}</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        <Card title="Client Details">
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={labelCls}>Client Name *</label>
                <input className={inputCls} value={form.clientName} onChange={(e) => setF("clientName", e.target.value)} required />
              </div>
              <div>
                <label className={labelCls}>Email *</label>
                <input type="email" className={inputCls} value={form.clientEmail} onChange={(e) => setF("clientEmail", e.target.value)} required />
              </div>
            </div>
            <div>
              <label className={labelCls}>Phone</label>
              <input className={inputCls} value={form.clientPhone} onChange={(e) => setF("clientPhone", e.target.value)} placeholder="+254 700 000 000" />
            </div>
          </div>
        </Card>

        <Card title="Tour & Dates">
          <div className="space-y-4">
            <div>
              <label className={labelCls}>Tour *</label>
              <select className={inputCls} value={form.tourTitle} onChange={(e) => handleTourSelect(e.target.value)} required>
                <option value="">Select a tour…</option>
                {tourOptions.map((t) => <option key={t.id} value={t.title}>{t.title}</option>)}
                <option value="Custom Safari">Custom Safari</option>
              </select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={labelCls}>Travel From *</label>
                <input type="date" className={inputCls} value={form.travelFrom} onChange={(e) => setF("travelFrom", e.target.value)} required />
              </div>
              <div>
                <label className={labelCls}>Travel To *</label>
                <input type="date" className={inputCls} value={form.travelTo} onChange={(e) => setF("travelTo", e.target.value)} required />
              </div>
            </div>
            <div>
              <label className={labelCls}>Number of Pax *</label>
              <input type="number" min={1} className={inputCls} value={form.pax} onChange={(e) => setF("pax", Number(e.target.value))} required />
            </div>
          </div>
        </Card>

        <Card title={`Financials (Rate: 1 USD = ${rate} KSH)`}>
          <div className="space-y-4">
            <div>
              <p className="text-xs text-gray-500 mb-3">Total booking amount</p>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={labelCls}>Total (KSH) *</label>
                  <input type="number" min={0} className={inputCls} value={form.amountKsh || ""} onChange={(e) => handleAmtKsh(Number(e.target.value))} required />
                </div>
                <div>
                  <label className={labelCls}>Total (USD) *</label>
                  <input type="number" min={0} className={inputCls} value={form.amountUsd || ""} onChange={(e) => handleAmtUsd(Number(e.target.value))} required />
                </div>
              </div>
            </div>
            <div>
              <p className="text-xs text-gray-500 mb-3">Deposit received</p>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={labelCls}>Deposit (KSH)</label>
                  <input type="number" min={0} className={inputCls} value={form.depositKsh || ""} onChange={(e) => handleDepKsh(Number(e.target.value))} />
                </div>
                <div>
                  <label className={labelCls}>Deposit (USD)</label>
                  <input type="number" min={0} className={inputCls} value={form.depositUsd || ""} onChange={(e) => handleDepUsd(Number(e.target.value))} />
                </div>
              </div>
            </div>
            {form.amountKsh > 0 && (
              <div className="bg-blue-50 rounded-xl px-4 py-3 text-xs text-blue-700 space-y-1">
                <div>Balance (KSH): {(form.amountKsh - form.depositKsh).toLocaleString()}</div>
                <div>Balance (USD): {(form.amountUsd - form.depositUsd).toLocaleString()}</div>
              </div>
            )}
          </div>
        </Card>

        <Card title="Payment Status & Notes">
          <div className="space-y-4">
            <div>
              <label className={labelCls}>Payment Status *</label>
              <div className="flex flex-wrap gap-2">
                {PAY_STATUSES.map((ps) => (
                  <button key={ps} type="button" onClick={() => setF("paymentStatus", ps)}
                    className={`px-4 py-2 rounded-xl text-sm font-semibold border transition-colors ${form.paymentStatus === ps ? "bg-blue-600 text-white border-blue-600" : "bg-white text-gray-600 border-gray-200 hover:border-blue-300"}`}>
                    {ps}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className={labelCls}>Notes</label>
              <textarea rows={3} className={`${inputCls} resize-none`} value={form.notes} onChange={(e) => setF("notes", e.target.value)} placeholder="Special requests, dietary needs, notes for the team…" />
            </div>
          </div>
        </Card>

        <div className="flex gap-3 pt-2 pb-8">
          <button type="submit" disabled={saving} className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-3 rounded-xl text-sm transition-colors disabled:opacity-60">
            {saving ? "Saving…" : "Save Booking"}
          </button>
          <Link href="/admin/sales" className="border border-gray-200 text-gray-600 hover:bg-gray-50 font-semibold px-6 py-3 rounded-xl text-sm transition-colors">Cancel</Link>
        </div>
      </form>
    </div>
  );
}

export default function NewSalePage() {
  return (
    <Suspense fallback={<div className="p-6 text-gray-400">Loading…</div>}>
      <NewSaleForm />
    </Suspense>
  );
}

function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
      <h2 className="font-semibold text-gray-800 mb-4 pb-3 border-b border-gray-100">{title}</h2>
      {children}
    </div>
  );
}
