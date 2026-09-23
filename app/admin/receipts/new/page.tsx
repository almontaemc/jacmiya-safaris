"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  addReceipt, getInvoices, getSales, getExchangeRate, getInvoiceBalance,
} from "@/lib/adminStore";
import type { Invoice, Sale, PaymentMethod, PaymentPurpose } from "@/types/admin";
import { ArrowLeft, Info } from "lucide-react";

const METHODS: PaymentMethod[] = ["M-Pesa", "Bank Transfer", "Cash", "Card", "PayPal", "Cheque", "Other"];
const PURPOSES: PaymentPurpose[] = ["Deposit", "Balance Payment", "Full Payment", "Extra Services", "Other"];

function todayIso() { return new Date().toISOString().slice(0, 10); }

function NewReceiptForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const rate = getExchangeRate();
  const [saving, setSaving] = useState(false);

  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [sales, setSales] = useState<Sale[]>([]);
  const [selectedInvoiceId, setSelectedInvoiceId] = useState("");
  const [selectedSaleId, setSelectedSaleId] = useState("");

  const [clientName, setClientName] = useState("");
  const [clientEmail, setClientEmail] = useState("");
  const [clientPhone, setClientPhone] = useState("");
  const [amountKsh, setAmountKsh] = useState(0);
  const [amountUsd, setAmountUsd] = useState(0);
  const [method, setMethod] = useState<PaymentMethod>("M-Pesa");
  const [purpose, setPurpose] = useState<PaymentPurpose>("Full Payment");
  const [reference, setReference] = useState("");
  const [paymentDate, setPaymentDate] = useState(todayIso());
  const [notes, setNotes] = useState("");

  const presetInvoiceId = searchParams.get("invoiceId") ?? "";

  useEffect(() => {
    const allInvoices = getInvoices();
    setInvoices(allInvoices);
    setSales(getSales());
    if (presetInvoiceId) applyInvoice(presetInvoiceId, allInvoices);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Picking an invoice pre-fills the client and defaults the amount to whatever
  // is still outstanding — so the common "they paid the rest" case is one click.
  function applyInvoice(invoiceId: string, source: Invoice[] = invoices) {
    setSelectedInvoiceId(invoiceId);
    if (!invoiceId) return;
    const invoice = source.find((i) => i.id === invoiceId);
    if (!invoice) return;

    const balance = getInvoiceBalance(invoice);
    const paidAlready = invoice.amountUsd - balance.usd;

    setClientName(invoice.clientName);
    setClientEmail(invoice.clientEmail);
    setClientPhone(invoice.clientPhone);
    setSelectedSaleId(invoice.saleId ?? "");
    setAmountUsd(Math.max(balance.usd, 0));
    setAmountKsh(Math.max(balance.ksh, 0));
    setPurpose(paidAlready > 0 ? "Balance Payment" : "Full Payment");
  }

  function applySale(saleId: string) {
    setSelectedSaleId(saleId);
    if (!saleId) return;
    const sale = sales.find((s) => s.id === saleId);
    if (!sale) return;
    setClientName(sale.clientName);
    setClientEmail(sale.clientEmail);
    setClientPhone(sale.clientPhone);
  }

  function handleKsh(v: number) {
    setAmountKsh(v);
    setAmountUsd(rate > 0 ? Math.round(v / rate) : 0);
  }
  function handleUsd(v: number) {
    setAmountUsd(v);
    setAmountKsh(Math.round(v * rate));
  }

  const selectedInvoice = invoices.find((i) => i.id === selectedInvoiceId);
  const balance = selectedInvoice ? getInvoiceBalance(selectedInvoice) : null;
  const remainingAfter = balance ? balance.usd - amountUsd : null;

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (amountUsd <= 0 && amountKsh <= 0) {
      alert("Enter the amount received.");
      return;
    }
    setSaving(true);
    const receipt = addReceipt({
      invoiceId: selectedInvoiceId || undefined,
      saleId: selectedSaleId || undefined,
      clientName, clientEmail, clientPhone,
      amountKsh, amountUsd,
      method, purpose, reference, paymentDate, notes,
    });
    router.push(`/admin/receipts/${receipt.id}`);
  }

  const inputCls = "w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-800 bg-white placeholder-gray-400 focus:outline-none focus:border-blue-400 transition-colors";
  const labelCls = "block text-xs font-semibold text-gray-600 uppercase tracking-wider mb-1.5";

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/admin/receipts" className="p-2 rounded-lg hover:bg-gray-100 transition-colors text-gray-500"><ArrowLeft className="w-4 h-4" /></Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Record Payment</h1>
          <p className="text-gray-500 text-sm">Issues a numbered receipt and settles the invoice it pays for</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        <Card title="Paying Off an Invoice? (optional)">
          <select className={inputCls} value={selectedInvoiceId} onChange={(e) => applyInvoice(e.target.value)}>
            <option value="">— Standalone receipt, no invoice —</option>
            {invoices
              .filter((i) => i.status !== "Cancelled")
              .map((i) => {
                const bal = getInvoiceBalance(i);
                return (
                  <option key={i.id} value={i.id}>
                    {i.invoiceNumber} — {i.clientName} (USD {bal.usd.toLocaleString()} outstanding)
                  </option>
                );
              })}
          </select>

          {selectedInvoice && balance && (
            <div className="mt-3 bg-blue-50 border border-blue-100 rounded-xl px-4 py-3 text-sm text-gray-700 flex gap-2">
              <Info className="w-4 h-4 text-blue-500 flex-shrink-0 mt-0.5" />
              <div>
                <p><strong>{selectedInvoice.invoiceNumber}</strong> is for USD {selectedInvoice.amountUsd.toLocaleString()}, with USD {Math.max(balance.usd, 0).toLocaleString()} still outstanding.</p>
                {remainingAfter !== null && (
                  <p className="mt-1 text-xs text-gray-600">
                    {remainingAfter <= 0
                      ? "This payment clears it — the invoice will be marked Paid."
                      : `USD ${remainingAfter.toLocaleString()} will remain outstanding after this payment.`}
                  </p>
                )}
              </div>
            </div>
          )}

          {!selectedInvoiceId && (
            <p className="text-xs text-gray-400 mt-2">Leave blank for cash taken on the spot or any payment that was never invoiced.</p>
          )}
        </Card>

        <Card title="Related Booking (optional)">
          <select className={inputCls} value={selectedSaleId} onChange={(e) => applySale(e.target.value)}>
            <option value="">— None —</option>
            {sales.map((s) => <option key={s.id} value={s.id}>{s.bookingRef} — {s.clientName} ({s.tourTitle})</option>)}
          </select>
          <p className="text-xs text-gray-400 mt-2">For the record only — booking payment status stays yours to set on the booking itself.</p>
        </Card>

        <Card title="Received From">
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={labelCls}>Client Name *</label>
                <input className={inputCls} value={clientName} onChange={(e) => setClientName(e.target.value)} required />
              </div>
              <div>
                <label className={labelCls}>Email</label>
                <input type="email" className={inputCls} value={clientEmail} onChange={(e) => setClientEmail(e.target.value)} />
              </div>
            </div>
            <div>
              <label className={labelCls}>Phone</label>
              <input className={inputCls} value={clientPhone} onChange={(e) => setClientPhone(e.target.value)} placeholder="+254 700 000 000" />
            </div>
          </div>
        </Card>

        <Card title={`Payment Details (Rate: 1 USD = ${rate} KSH)`}>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={labelCls}>Amount Received (KSH)</label>
                <input type="number" min={0} className={inputCls} value={amountKsh || ""} onChange={(e) => handleKsh(Number(e.target.value))} />
              </div>
              <div>
                <label className={labelCls}>Amount Received (USD)</label>
                <input type="number" min={0} className={inputCls} value={amountUsd || ""} onChange={(e) => handleUsd(Number(e.target.value))} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={labelCls}>Payment Method *</label>
                <select className={inputCls} value={method} onChange={(e) => setMethod(e.target.value as PaymentMethod)} required>
                  {METHODS.map((m) => <option key={m} value={m}>{m}</option>)}
                </select>
              </div>
              <div>
                <label className={labelCls}>Payment For *</label>
                <select className={inputCls} value={purpose} onChange={(e) => setPurpose(e.target.value as PaymentPurpose)} required>
                  {PURPOSES.map((p) => <option key={p} value={p}>{p}</option>)}
                </select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={labelCls}>Date Received *</label>
                <input type="date" className={inputCls} value={paymentDate} onChange={(e) => setPaymentDate(e.target.value)} required />
              </div>
              <div>
                <label className={labelCls}>Transaction / Reference No.</label>
                <input className={inputCls} value={reference} onChange={(e) => setReference(e.target.value)} placeholder="M-Pesa code, bank ref, cheque no." />
              </div>
            </div>
          </div>
        </Card>

        <Card title="Notes">
          <textarea rows={3} className={`${inputCls} resize-none`} value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Anything worth noting about this payment — shown on the receipt." />
        </Card>

        <div className="flex gap-3 pt-2 pb-8">
          <button type="submit" disabled={saving} className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-3 rounded-xl text-sm transition-colors disabled:opacity-60">
            {saving ? "Saving…" : "Generate Receipt"}
          </button>
          <Link href="/admin/receipts" className="border border-gray-200 text-gray-600 hover:bg-gray-50 font-semibold px-6 py-3 rounded-xl text-sm transition-colors">Cancel</Link>
        </div>
      </form>
    </div>
  );
}

export default function NewReceiptPage() {
  return (
    <Suspense fallback={<div className="p-6 text-gray-400">Loading…</div>}>
      <NewReceiptForm />
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
