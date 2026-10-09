"use client";

import { use, useEffect, useState } from "react";
import Link from "next/link";
import { getVouchers, getSettings, getSales } from "@/lib/adminStore";
import type { Voucher, AppSettings, Sale } from "@/types/admin";
import { VOUCHER_STATUSES, VOUCHER_ROOM_TYPES } from "@/components/admin/VoucherForm";
import { ArrowLeft, Printer, Edit3, Copy, Check, Phone, Mail, Globe } from "lucide-react";

function formatDate(iso: string) {
  if (!iso) return "";
  const [y, m, d] = iso.split("-");
  return `${d}/${m}/${y}`;
}

export default function VoucherDetail({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [voucher, setVoucher] = useState<Voucher | null>(null);
  const [sale, setSale] = useState<Sale | null>(null);
  const [settings, setSettings] = useState<AppSettings | null>(null);

  useEffect(() => {
    const found = getVouchers().find((v) => v.id === id) ?? null;
    setVoucher(found);
    setSale(found?.saleId ? getSales().find((s) => s.id === found.saleId) ?? null : null);
    setSettings(getSettings());
  }, [id]);

  // Same portrait-A4 swap the invoice and receipt documents use — the shared
  // admin print rule is landscape for wide report tables.
  useEffect(() => {
    const styleEl = document.getElementById("admin-print-style") as HTMLStyleElement | null;
    const sheet = styleEl?.sheet;
    if (!sheet) return;
    const mediaRule = Array.from(sheet.cssRules).find(
      (r): r is CSSMediaRule => r instanceof CSSMediaRule && r.media.mediaText.includes("print")
    );
    if (!mediaRule) return;
    const pageIdx = Array.from(mediaRule.cssRules).findIndex((r) => r instanceof CSSPageRule);
    if (pageIdx === -1) return;
    const original = mediaRule.cssRules[pageIdx].cssText;
    mediaRule.deleteRule(pageIdx);
    mediaRule.insertRule("@page { size: A4 portrait; margin: 1.2cm; }", pageIdx);
    return () => {
      try {
        mediaRule.deleteRule(pageIdx);
        mediaRule.insertRule(original, pageIdx);
      } catch { /* style tag already gone */ }
    };
  }, []);

  if (!voucher) return <div className="p-6 text-gray-400">Voucher not found.</div>;

  const companyName = settings?.companyName ?? "Jacmiya Safaris";
  const companyEmail = settings?.companyEmail ?? "info@jacmiyasafaris.com";
  const companyPhone = settings?.companyPhone ?? "+254 716 482 995";
  const companyWebsite = (settings?.companyWebsite ?? "https://www.jacmiyasafaris.com").replace(/^https?:\/\//, "");

  const pax = `${voucher.adults} adult${voucher.adults !== 1 ? "s" : ""}`
    + (voucher.children > 0 ? `, ${voucher.children} child${voucher.children !== 1 ? "ren" : ""}` : "");

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Controls — hidden on print */}
      <div className="print:hidden flex items-center gap-3 flex-wrap">
        <Link href="/admin/vouchers" className="p-2 rounded-lg hover:bg-gray-100 transition-colors text-gray-500">
          <ArrowLeft className="w-4 h-4" />
        </Link>
        <div className="flex-1 min-w-0">
          <h1 className="text-2xl font-bold text-gray-900">Voucher {voucher.voucherNumber}</h1>
          <p className="text-gray-500 text-sm">{voucher.supplierName} · {voucher.clientNames}</p>
        </div>
        <Link href={`/admin/vouchers/new?copy=${voucher.id}`} className="flex items-center gap-2 border border-gray-200 text-gray-600 hover:bg-gray-50 text-sm font-semibold px-4 py-2.5 rounded-xl transition-colors">
          <Copy className="w-4 h-4" /> Copy for another lodge
        </Link>
        <Link href={`/admin/vouchers/${voucher.id}/edit`} className="flex items-center gap-2 border border-gray-200 text-gray-600 hover:bg-gray-50 text-sm font-semibold px-4 py-2.5 rounded-xl transition-colors">
          <Edit3 className="w-4 h-4" /> Edit
        </Link>
        <button onClick={() => window.print()} className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold px-4 py-2.5 rounded-xl transition-colors">
          <Printer className="w-4 h-4" /> Print / PDF
        </button>
      </div>

      {/* ─── PRINTABLE VOUCHER — laid out like the paper voucher book ─── */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden" id="voucher-document">
        <div className="px-10 py-8 text-gray-900">
          <div className="flex items-center justify-between gap-6">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/logo.png" alt={companyName} className="h-28 w-auto" />
            <div className="border-l-2 border-gray-800 pl-4 space-y-1 text-base">
              <div className="flex items-center gap-2"><Phone className="w-4 h-4" /> {companyPhone}</div>
              <div className="flex items-center gap-2"><Mail className="w-4 h-4" /> {companyEmail}</div>
              <div className="flex items-center gap-2"><Globe className="w-4 h-4" /> {companyWebsite}</div>
            </div>
          </div>
          <p className="text-center text-sm font-semibold mt-3">
            Experts in Kenya Safari, Tanzania Safari &amp; Luxury Holiday Safaris
          </p>

          <div className="flex items-start justify-between gap-6 mt-8">
            <div className="flex-1 text-center pt-2">
              <span className="text-lg font-bold tracking-wide">BOOKING VOUCHER</span>
            </div>
            <div className="border-2 border-gray-800 px-5 py-3 w-56">
              <div className="text-xs font-bold text-center tracking-wide">VOUCHER NUMBER</div>
              <div className="text-2xl font-bold text-red-600 text-center border-b border-gray-800 pb-1">{voucher.voucherNumber}</div>
              <div className="text-sm mt-2">DATE <span className="font-semibold ml-1">{formatDate(voucher.issueDate)}</span></div>
            </div>
          </div>

          <div className="grid grid-cols-3 border-b-2 border-gray-800 mt-6 pb-2 text-sm">
            {VOUCHER_STATUSES.map((s) => (
              <div key={s} className="flex items-center gap-3">
                <span className={`uppercase ${voucher.status === s ? "font-bold" : "text-gray-500"}`}>{s}</span>
                <span className={`w-5 h-5 border flex items-center justify-center ${voucher.status === s ? "border-gray-800 bg-gray-800 text-white" : "border-gray-400"}`}>
                  {voucher.status === s && <Check className="w-4 h-4" />}
                </span>
              </div>
            ))}
          </div>

          <div className="mt-6 space-y-5 text-sm">
            <Line label="TO" value={voucher.supplierName} hint="Name of Lodge / Hotel / Others" large />
            <Line label="Name of Clients" value={`${voucher.clientNames} × ${pax}`} large />

            <div>
              <div className="font-semibold mb-2">Arrival</div>
              <div className="grid grid-cols-4 gap-4">
                <Line label="Date" value={formatDate(voucher.arrivalDate)} />
                <Line label="Time" value={voucher.arrivalTime} />
                <Line label="Method of Arrival" value={voucher.arrivalMethod} />
                <Line label="Total number of Nights" value={String(voucher.nights)} />
              </div>
            </div>

            <div>
              <div className="font-semibold mb-2">Departure</div>
              <div className="grid grid-cols-4 gap-4">
                <Line label="Date" value={formatDate(voucher.departureDate)} />
                <Line label="Time" value={voucher.departureTime} />
                <Line label="Method of Departure" value={voucher.departureMethod} />
              </div>
            </div>

            <div>
              <div className="font-semibold">Accommodation</div>
              <div className="text-gray-600 mb-2">Type of Rooms Required</div>
              <div className="grid grid-cols-3 gap-x-4 gap-y-3">
                {VOUCHER_ROOM_TYPES.map(({ key, label }) => (
                  <div key={key} className="flex items-end gap-2">
                    <span>{label}</span>
                    <span className="flex-1 border-b border-gray-800 text-center font-bold min-h-[1.5rem]">
                      {voucher.rooms[key] > 0 ? voucher.rooms[key] : ""}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <div className="font-semibold mb-2">Special Notes</div>
              <div className="border border-gray-800 px-4 py-3 min-h-[5rem] whitespace-pre-wrap font-medium">{voucher.specialNotes}</div>
            </div>
          </div>

          <div className="flex items-end justify-between mt-12 text-sm">
            <div className="text-xs text-gray-500">{sale && <>Booking ref: {sale.bookingRef}</>}</div>
            <div className="w-56 border-t border-gray-800 pt-1">For: {companyName}</div>
          </div>
        </div>
      </div>

      <div className="pb-8 print:hidden flex gap-3">
        <Link href="/admin/vouchers" className="border border-gray-200 text-gray-600 hover:bg-gray-50 font-semibold px-6 py-3 rounded-xl text-sm transition-colors">
          ← Back to Vouchers
        </Link>
        {sale && (
          <Link href={`/admin/sales/${sale.id}`} className="border border-gray-200 text-gray-600 hover:bg-gray-50 font-semibold px-6 py-3 rounded-xl text-sm transition-colors">
            View booking {sale.bookingRef}
          </Link>
        )}
      </div>
    </div>
  );
}

function Line({ label, value, hint, large }: { label: string; value: string; hint?: string; large?: boolean }) {
  return (
    <div>
      <div className="flex items-end gap-2">
        <span className="flex-shrink-0">{label}</span>
        <span className={`flex-1 border-b border-gray-800 font-bold text-blue-900 px-2 min-h-[1.5rem] ${large ? "text-base" : ""}`}>{value}</span>
      </div>
      {hint && <div className="text-xs text-gray-600 mt-1">{hint}</div>}
    </div>
  );
}
