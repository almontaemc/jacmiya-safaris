"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { api } from "@/lib/api";
import type { Voucher } from "@/types/admin";
import VoucherForm from "@/components/admin/VoucherForm";
import { ArrowLeft } from "lucide-react";

function NewVoucher() {
  const searchParams = useSearchParams();
  const copyId = searchParams.get("copy") ?? "";
  const saleId = searchParams.get("saleId") ?? "";
  const [source, setSource] = useState<Voucher | undefined>();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (!copyId) { setReady(true); return; }
    api<{ voucher: Voucher }>(`/api/vouchers/${copyId}`)
      .then(({ voucher }) => setSource(voucher))
      .catch(() => { /* copy source gone — start from a blank form */ })
      .finally(() => setReady(true));
  }, [copyId]);

  if (!ready) return null;

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/admin/vouchers" className="p-2 rounded-lg hover:bg-gray-100 transition-colors text-gray-500"><ArrowLeft className="w-4 h-4" /></Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">New Booking Voucher</h1>
          <p className="text-gray-500 text-sm">
            {source
              ? `Copied from voucher ${source.voucherNumber} — change the lodge and dates`
              : "One voucher per lodge or hotel, ready to print or save as PDF"}
          </p>
        </div>
      </div>
      <VoucherForm mode="create" initial={source} presetSaleId={saleId} />
    </div>
  );
}

export default function NewVoucherPage() {
  return (
    <Suspense fallback={<div className="p-6 text-gray-400">Loading…</div>}>
      <NewVoucher />
    </Suspense>
  );
}
