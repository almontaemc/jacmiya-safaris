"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { addInvoice, getSales, getExchangeRate } from "@/lib/adminStore";
import type { Sale, InvoiceItem } from "@/types/admin";
import { ArrowLeft, Plus, Trash2 } from "lucide-react";

function todayIso() { return new Date().toISOString().slice(0, 10); }
function plusDaysIso(days: number) { const d = new Date(); d.setDate(d.getDate() + days); return d.toISOString().slice(0, 10); }
function newItem(): InvoiceItem { return { id: `item_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`, description: "", quantity: 1, unitPriceKsh: 0, unitPriceUsd: 0 }; }

function NewInvoiceForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const rate = getExchangeRate();
  const [saving, setSaving] = useState(false);
  const [sales, setSales] = useState<Sale[]>([]);
  const [selectedSaleId, setSelectedSaleId] = useState("");

  const [clientName, setClientName] = useState("");
  const [clientEmail, setClientEmail] = useState("");
  const [clientPhone, setClientPhone] = useState("");
  const [issueDate, setIssueDate] = useState(todayIso());
  const [dueDate, setDueDate] = useState(plusDaysIso(14));
  const [notes, setNotes] = useState("");
  const [items, setItems] = useState<InvoiceItem[]>([newItem()]);

  const presetSaleId = searchParams.get("saleId") ?? "";

  useEffect(() => {
    const allSales = getSales();
    setSales(allSales);
    if (presetSaleId) applySale(presetSaleId, allSales);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function applySale(saleId: string, source: Sale[] = sales) {
    setSelectedSaleId(saleId);
    if (!saleId) return;
    const sale = source.find((s) => s.id === saleId);
    if (!sale) return;
    setClientName(sale.clientName);
    setClientEmail(sale.clientEmail);
    setClientPhone(sale.clientPhone);
    const balanceKsh = sale.amountKsh - sale.depositKsh;
    const balanceUsd = sale.amountUsd - sale.depositUsd;
    setItems([{ id: newItem().id, description: sale.tourTitle, quantity: 1, unitPriceKsh: balanceKsh, unitPriceUsd: balanceUsd }]);
  }

  function updateItem(id: string, updates: Partial<InvoiceItem>) {
    setItems((prev) => prev.map((it) => (it.id === id ? { ...it, ...updates } : it)));
  }

  function handleUnitKsh(id: string, v: number) {
    updateItem(id, { unitPriceKsh: v, unitPriceUsd: rate > 0 ? Math.round(v / rate) : 0 });
  }
  function handleUnitUsd(id: string, v: number) {
    updateItem(id, { unitPriceUsd: v, unitPriceKsh: Math.round(v * rate) });
  }

  function addRow() { setItems((prev) => [...prev, newItem()]); }
  function removeRow(id: string) { setItems((prev) => (prev.length > 1 ? prev.filter((it) => it.id !== id) : prev)); }

  const totalKsh = items.reduce((a, it) => a + it.quantity * it.unitPriceKsh, 0);
  const totalUsd = items.reduce((a, it) => a + it.quantity * it.unitPriceUsd, 0);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    const invoice = addInvoice({
      saleId: selectedSaleId || undefined,
      clientName, clientEmail, clientPhone,
      issueDate, dueDate,
      items,
      amountKsh: totalKsh,
      amountUsd: totalUsd,
      status: "Unpaid",
      notes,
    });
    router.push(`/admin/invoices/${invoice.id}`);
  }

  const inputCls = "w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-800 bg-white placeholder-gray-400 focus:outline-none focus:border-blue-400 transition-colors";
  const labelCls = "block text-xs font-semibold text-gray-600 uppercase tracking-wider mb-1.5";

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/admin/invoices" className="p-2 rounded-lg hover:bg-gray-100 transition-colors text-gray-500"><ArrowLeft className="w-4 h-4" /></Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">New Invoice</h1>
          <p className="text-gray-500 text-sm">Link to a booking, or fill in client details directly</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        <Card title="Link to Booking (optional)">
          <select className={inputCls} value={selectedSaleId} onChange={(e) => applySale(e.target.value)}>
            <option value="">— Manual entry, no booking —</option>
            {sales.map((s) => <option key={s.id} value={s.id}>{s.bookingRef} — {s.clientName} ({s.tourTitle})</option>)}
          </select>
          {selectedSaleId && <p className="text-xs text-gray-400 mt-2">Client details and outstanding balance pre-filled from this booking. Everything below stays editable.</p>}
        </Card>

        <Card title="Client Details">
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={labelCls}>Client Name *</label>
                <input className={inputCls} value={clientName} onChange={(e) => setClientName(e.target.value)} required />
              </div>
              <div>
                <label className={labelCls}>Email *</label>
                <input type="email" className={inputCls} value={clientEmail} onChange={(e) => setClientEmail(e.target.value)} required />
              </div>
            </div>
            <div>
              <label className={labelCls}>Phone</label>
              <input className={inputCls} value={clientPhone} onChange={(e) => setClientPhone(e.target.value)} placeholder="+254 700 000 000" />
            </div>
          </div>
        </Card>

        <Card title="Invoice Dates">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelCls}>Issue Date *</label>
              <input type="date" className={inputCls} value={issueDate} onChange={(e) => setIssueDate(e.target.value)} required />
            </div>
            <div>
              <label className={labelCls}>Due Date *</label>
              <input type="date" className={inputCls} value={dueDate} onChange={(e) => setDueDate(e.target.value)} required />
            </div>
          </div>
        </Card>

        <Card title={`Line Items (Rate: 1 USD = ${rate} KSH)`}>
          <div className="space-y-4">
            {items.map((item, i) => (
              <div key={item.id} className="border border-gray-100 rounded-xl p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-gray-500">Item {i + 1}</span>
                  {items.length > 1 && (
                    <button type="button" onClick={() => removeRow(item.id)} className="p-1 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
                <div>
                  <label className={labelCls}>Description *</label>
                  <input className={inputCls} value={item.description} onChange={(e) => updateItem(item.id, { description: e.target.value })} placeholder="e.g. 5-Day Masai Mara Safari" required />
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className={labelCls}>Qty</label>
                    <input type="number" min={1} className={inputCls} value={item.quantity} onChange={(e) => updateItem(item.id, { quantity: Number(e.target.value) })} required />
                  </div>
                  <div>
                    <label className={labelCls}>Unit Price (KSH)</label>
                    <input type="number" min={0} className={inputCls} value={item.unitPriceKsh || ""} onChange={(e) => handleUnitKsh(item.id, Number(e.target.value))} />
                  </div>
                  <div>
                    <label className={labelCls}>Unit Price (USD)</label>
                    <input type="number" min={0} className={inputCls} value={item.unitPriceUsd || ""} onChange={(e) => handleUnitUsd(item.id, Number(e.target.value))} />
                  </div>
                </div>
                <div className="text-xs text-gray-400 text-right">Line total: USD {(item.quantity * item.unitPriceUsd).toLocaleString()} · KSH {(item.quantity * item.unitPriceKsh).toLocaleString()}</div>
              </div>
            ))}
            <button type="button" onClick={addRow} className="flex items-center gap-2 text-sm font-semibold text-blue-600 hover:text-blue-700">
              <Plus className="w-4 h-4" /> Add Line Item
            </button>

            <div className="bg-blue-50 rounded-xl px-4 py-3 flex items-center justify-between">
              <span className="text-sm font-semibold text-gray-700">Total Due</span>
              <div className="text-right">
                <div className="text-base font-bold text-blue-700">USD {totalUsd.toLocaleString()}</div>
                <div className="text-xs text-gray-500">KSH {totalKsh.toLocaleString()}</div>
              </div>
            </div>
          </div>
        </Card>

        <Card title="Notes">
          <textarea rows={3} className={`${inputCls} resize-none`} value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Payment instructions, bank details, terms…" />
        </Card>

        <div className="flex gap-3 pt-2 pb-8">
          <button type="submit" disabled={saving} className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-3 rounded-xl text-sm transition-colors disabled:opacity-60">
            {saving ? "Saving…" : "Generate Invoice"}
          </button>
          <Link href="/admin/invoices" className="border border-gray-200 text-gray-600 hover:bg-gray-50 font-semibold px-6 py-3 rounded-xl text-sm transition-colors">Cancel</Link>
        </div>
      </form>
    </div>
  );
}

export default function NewInvoicePage() {
  return (
    <Suspense fallback={<div className="p-6 text-gray-400">Loading…</div>}>
      <NewInvoiceForm />
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
