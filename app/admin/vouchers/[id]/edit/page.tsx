"use client";

import { use, useEffect, useState } from "react";
import Link from "next/link";
import { api } from "@/lib/api";
import type { Voucher } from "@/types/admin";
import VoucherForm from "@/components/admin/VoucherForm";
import { ArrowLeft } from "lucide-react";

export default function EditVoucherPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [voucher, setVoucher] = useState<Voucher | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    api<{ voucher: Voucher }>(`/api/vouchers/${id}`)
      .then(({ voucher: found }) => setVoucher(found))
      .catch(() => setVoucher(null))
      .finally(() => setReady(true));
  }, [id]);

  if (!ready) return null;
  if (!voucher) return <div className="p-6 text-gray-400">Voucher not found.</div>;

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <Link href={`/admin/vouchers/${voucher.id}`} className="p-2 rounded-lg hover:bg-gray-100 transition-colors text-gray-500"><ArrowLeft className="w-4 h-4" /></Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Edit Voucher {voucher.voucherNumber}</h1>
          <p className="text-gray-500 text-sm">{voucher.supplierName} · {voucher.clientNames}</p>
        </div>
      </div>
      <VoucherForm mode="edit" initial={voucher} />
    </div>
  );
}
