import { NextResponse } from "next/server";
import { requireUser } from "@/lib/server/auth";
import { db } from "@/lib/server/db";
import { handle, readJson } from "@/lib/server/respond";
import { isUniqueViolation } from "@/lib/server/users";
import { voucherFields } from "@/lib/server/validate";
import { bumpVoucherCounter, getVoucher } from "@/lib/server/vouchers";

type Ctx = { params: Promise<{ id: string }> };

export async function GET(_req: Request, { params }: Ctx) {
  return handle(async () => {
    const { error } = await requireUser("vouchers");
    if (error) return error;
    const voucher = await getVoucher((await params).id);
    if (!voucher) return NextResponse.json({ error: "Voucher not found." }, { status: 404 });
    return NextResponse.json({ voucher });
  });
}

export async function PATCH(request: Request, { params }: Ctx) {
  return handle(async () => {
    const { error } = await requireUser("vouchers");
    if (error) return error;
    const { id } = await params;
    const v = voucherFields(await readJson(request));
    let updated;
    try {
      updated = await db()`
        update vouchers set
          voucher_number = ${v.voucherNumber}, sale_id = ${v.saleId ?? null}, status = ${v.status},
          issue_date = ${v.issueDate}, supplier_name = ${v.supplierName}, client_names = ${v.clientNames},
          adults = ${v.adults}, children = ${v.children},
          arrival_date = ${v.arrivalDate}, arrival_time = ${v.arrivalTime}, arrival_method = ${v.arrivalMethod},
          departure_date = ${v.departureDate}, departure_time = ${v.departureTime}, departure_method = ${v.departureMethod},
          nights = ${v.nights}, rooms = ${JSON.stringify(v.rooms)}::jsonb, special_notes = ${v.specialNotes},
          updated_at = now()
        where id = ${id}
        returning id
      `;
    } catch (err) {
      if (isUniqueViolation(err)) {
        return NextResponse.json({ error: `Voucher number ${v.voucherNumber} is already used — pick another.` }, { status: 409 });
      }
      throw err;
    }
    if (updated.length === 0) return NextResponse.json({ error: "Voucher not found." }, { status: 404 });
    await bumpVoucherCounter(v.voucherNumber);
    return NextResponse.json({ ok: true });
  });
}

export async function DELETE(_req: Request, { params }: Ctx) {
  return handle(async () => {
    const { error } = await requireUser("vouchers");
    if (error) return error;
    await db()`delete from vouchers where id = ${(await params).id}`;
    return NextResponse.json({ ok: true });
  });
}
