"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { addVoucher, updateVoucher, getSales, peekNextVoucherNumber } from "@/lib/adminStore";
import type { Sale, Voucher, VoucherStatus, VoucherRoomType } from "@/types/admin";

export const VOUCHER_STATUSES: VoucherStatus[] = ["Confirm", "Amend", "Request"];

export const VOUCHER_ROOM_TYPES: { key: VoucherRoomType; label: string }[] = [
  { key: "twinRooms", label: "Twin Rooms" },
  { key: "singleRooms", label: "Single Rooms" },
  { key: "tripleRooms", label: "Triple Rooms" },
  { key: "suitesCottages", label: "Suites / Cottages" },
  { key: "doubleTents", label: "Double Tents" },
  { key: "singleTents", label: "Single Tents" },
];

const TRAVEL_METHODS = ["Road", "Air", "Rail", "Boat"];
const TIME_SUGGESTIONS = ["B/fast", "Lunch", "Dinner", "Morning", "Afternoon", "Evening"];
const EMPTY_ROOMS: Record<VoucherRoomType, number> = {
  twinRooms: 0, singleRooms: 0, tripleRooms: 0, suitesCottages: 0, doubleTents: 0, singleTents: 0,
};

function todayIso() { return new Date().toISOString().slice(0, 10); }

function nightsBetween(from: string, to: string): number {
  if (!from || !to) return 0;
  const diff = Math.round((new Date(to).getTime() - new Date(from).getTime()) / 86_400_000);
  return Math.max(diff, 0);
}

/**
 * Shared by the new and edit pages. `initial` is the voucher being edited, or
 * the one being copied when `mode` is "create" (one booking usually needs a
 * voucher per lodge, so copying the last one is the common path).
 */
export default function VoucherForm({ mode, initial, presetSaleId }: {
  mode: "create" | "edit";
  initial?: Voucher;
  presetSaleId?: string;
}) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [sales, setSales] = useState<Sale[]>([]);

  const [voucherNumber, setVoucherNumber] = useState(initial && mode === "edit" ? initial.voucherNumber : 0);
  const [saleId, setSaleId] = useState(initial?.saleId ?? "");
  const [status, setStatus] = useState<VoucherStatus>(initial && mode === "edit" ? initial.status : "Confirm");
  const [issueDate, setIssueDate] = useState(initial && mode === "edit" ? initial.issueDate : todayIso());
  const [supplierName, setSupplierName] = useState(initial?.supplierName ?? "");
  const [clientNames, setClientNames] = useState(initial?.clientNames ?? "");
  const [adults, setAdults] = useState(initial?.adults ?? 2);
  const [children, setChildren] = useState(initial?.children ?? 0);
  const [arrivalDate, setArrivalDate] = useState(initial?.arrivalDate ?? "");
  const [arrivalTime, setArrivalTime] = useState(initial?.arrivalTime ?? "");
  const [arrivalMethod, setArrivalMethod] = useState(initial?.arrivalMethod ?? "Road");
  const [departureDate, setDepartureDate] = useState(initial?.departureDate ?? "");
  const [departureTime, setDepartureTime] = useState(initial?.departureTime ?? "");
  const [departureMethod, setDepartureMethod] = useState(initial?.departureMethod ?? "Road");
  const [nights, setNights] = useState(initial?.nights ?? 0);
  const [rooms, setRooms] = useState<Record<VoucherRoomType, number>>({ ...EMPTY_ROOMS, ...initial?.rooms });
  const [specialNotes, setSpecialNotes] = useState(initial?.specialNotes ?? "");

  useEffect(() => {
    const allSales = getSales();
    setSales(allSales);
    if (mode === "create") {
      setVoucherNumber(peekNextVoucherNumber());
      if (presetSaleId && !initial) applySale(presetSaleId, allSales);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function applySale(id: string, source: Sale[] = sales) {
    setSaleId(id);
    if (!id) return;
    const sale = source.find((s) => s.id === id);
    if (!sale) return;
    setClientNames(sale.clientName);
    setAdults(sale.pax);
    setChildren(0);
  }

  function handleArrival(v: string) {
    setArrivalDate(v);
    setNights(nightsBetween(v, departureDate));
  }
  function handleDeparture(v: string) {
    setDepartureDate(v);
    setNights(nightsBetween(arrivalDate, v));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (departureDate < arrivalDate) {
      alert("Departure date is before the arrival date.");
      return;
    }
    setSaving(true);
    const data = {
      voucherNumber, saleId: saleId || undefined, status, issueDate, supplierName,
      clientNames, adults, children,
      arrivalDate, arrivalTime, arrivalMethod,
      departureDate, departureTime, departureMethod,
      nights, rooms, specialNotes,
    };
    if (mode === "edit" && initial) {
      updateVoucher(initial.id, data);
      router.push(`/admin/vouchers/${initial.id}`);
    } else {
      router.push(`/admin/vouchers/${addVoucher(data).id}`);
    }
  }

  const inputCls = "w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-800 bg-white placeholder-gray-400 focus:outline-none focus:border-blue-400 transition-colors";
  const labelCls = "block text-xs font-semibold text-gray-600 uppercase tracking-wider mb-1.5";
  const cancelHref = mode === "edit" && initial ? `/admin/vouchers/${initial.id}` : "/admin/vouchers";

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <datalist id="voucher-times">
        {TIME_SUGGESTIONS.map((t) => <option key={t} value={t} />)}
      </datalist>

      <Card title="Voucher">
        <div className="space-y-4">
          <div>
            <label className={labelCls}>Type *</label>
            <div className="flex gap-2">
              {VOUCHER_STATUSES.map((s) => (
                <button key={s} type="button" onClick={() => setStatus(s)}
                  className={`px-4 py-2 rounded-xl text-sm font-semibold border transition-colors ${status === s ? "bg-blue-600 border-blue-600 text-white" : "border-gray-200 text-gray-600 hover:bg-gray-50"}`}>
                  {s}
                </button>
              ))}
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelCls}>Voucher Number *</label>
              <input type="number" min={1} className={inputCls} value={voucherNumber || ""} onChange={(e) => setVoucherNumber(Number(e.target.value))} required />
              {mode === "create" && (
                <p className="text-xs text-gray-400 mt-1.5">Next in sequence. Change it to carry on from the paper voucher book.</p>
              )}
            </div>
            <div>
              <label className={labelCls}>Voucher Date *</label>
              <input type="date" className={inputCls} value={issueDate} onChange={(e) => setIssueDate(e.target.value)} required />
            </div>
          </div>
          <div>
            <label className={labelCls}>To — Lodge / Hotel / Other *</label>
            <input className={inputCls} value={supplierName} onChange={(e) => setSupplierName(e.target.value)} placeholder="Ziwa Bush Lodge" required />
          </div>
        </div>
      </Card>

      <Card title="Related Booking (optional)">
        <select className={inputCls} value={saleId} onChange={(e) => applySale(e.target.value)}>
          <option value="">— Standalone voucher, no booking —</option>
          {sales.map((s) => <option key={s.id} value={s.id}>{s.bookingRef} — {s.clientName} ({s.tourTitle})</option>)}
        </select>
        <p className="text-xs text-gray-400 mt-2">Picking a booking fills in the client name and number of guests.</p>
      </Card>

      <Card title="Clients">
        <div className="grid grid-cols-4 gap-4">
          <div className="col-span-4 sm:col-span-2">
            <label className={labelCls}>Name of Clients *</label>
            <input className={inputCls} value={clientNames} onChange={(e) => setClientNames(e.target.value)} required />
          </div>
          <div className="col-span-2 sm:col-span-1">
            <label className={labelCls}>Adults *</label>
            <input type="number" min={0} className={inputCls} value={adults} onChange={(e) => setAdults(Number(e.target.value))} required />
          </div>
          <div className="col-span-2 sm:col-span-1">
            <label className={labelCls}>Children</label>
            <input type="number" min={0} className={inputCls} value={children} onChange={(e) => setChildren(Number(e.target.value))} />
          </div>
        </div>
      </Card>

      <Card title="Arrival & Departure">
        <div className="space-y-4">
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className={labelCls}>Arrival Date *</label>
              <input type="date" className={inputCls} value={arrivalDate} onChange={(e) => handleArrival(e.target.value)} required />
            </div>
            <div>
              <label className={labelCls}>Arrival Time</label>
              <input list="voucher-times" className={inputCls} value={arrivalTime} onChange={(e) => setArrivalTime(e.target.value)} placeholder="Lunch, 14:00…" />
            </div>
            <div>
              <label className={labelCls}>Method of Arrival</label>
              <select className={inputCls} value={arrivalMethod} onChange={(e) => setArrivalMethod(e.target.value)}>
                {TRAVEL_METHODS.map((m) => <option key={m} value={m}>{m}</option>)}
              </select>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className={labelCls}>Departure Date *</label>
              <input type="date" className={inputCls} value={departureDate} min={arrivalDate || undefined} onChange={(e) => handleDeparture(e.target.value)} required />
            </div>
            <div>
              <label className={labelCls}>Departure Time</label>
              <input list="voucher-times" className={inputCls} value={departureTime} onChange={(e) => setDepartureTime(e.target.value)} placeholder="B/fast, 10:00…" />
            </div>
            <div>
              <label className={labelCls}>Method of Departure</label>
              <select className={inputCls} value={departureMethod} onChange={(e) => setDepartureMethod(e.target.value)}>
                {TRAVEL_METHODS.map((m) => <option key={m} value={m}>{m}</option>)}
              </select>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className={labelCls}>Total Number of Nights</label>
              <input type="number" min={0} className={inputCls} value={nights} onChange={(e) => setNights(Number(e.target.value))} />
              <p className="text-xs text-gray-400 mt-1.5">Worked out from the dates — adjust if needed.</p>
            </div>
          </div>
        </div>
      </Card>

      <Card title="Accommodation — Rooms Required">
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          {VOUCHER_ROOM_TYPES.map(({ key, label }) => (
            <div key={key}>
              <label className={labelCls}>{label}</label>
              <input type="number" min={0} className={inputCls} value={rooms[key] || ""} placeholder="0"
                onChange={(e) => setRooms((prev) => ({ ...prev, [key]: Number(e.target.value) }))} />
            </div>
          ))}
        </div>
      </Card>

      <Card title="Special Notes">
        <textarea rows={3} className={`${inputCls} resize-none`} value={specialNotes} onChange={(e) => setSpecialNotes(e.target.value)} placeholder="Room allocation, dietary needs, celebrations — shown on the voucher." />
      </Card>

      <div className="flex gap-3 pt-2 pb-8">
        <button type="submit" disabled={saving} className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-3 rounded-xl text-sm transition-colors disabled:opacity-60">
          {saving ? "Saving…" : mode === "edit" ? "Save Changes" : "Generate Voucher"}
        </button>
        <Link href={cancelHref} className="border border-gray-200 text-gray-600 hover:bg-gray-50 font-semibold px-6 py-3 rounded-xl text-sm transition-colors">Cancel</Link>
      </div>
    </form>
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
