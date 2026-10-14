import { NextResponse } from "next/server";
import { newId, requireUser } from "@/lib/server/auth";
import { handle, readJson } from "@/lib/server/respond";
import { isUniqueViolation } from "@/lib/server/users";
import { voucherFields } from "@/lib/server/validate";
import { insertVoucher, listVouchers } from "@/lib/server/vouchers";

export async function GET() {
  return handle(async () => {
    const { error } = await requireUser("vouchers");
    if (error) return error;
    return NextResponse.json({ vouchers: await listVouchers() });
  });
}

export async function POST(request: Request) {
  return handle(async () => {
    const { user, error } = await requireUser("vouchers");
    if (error) return error;
    const v = voucherFields(await readJson(request));
    const id = newId("vch");
    try {
      await insertVoucher(id, v, user.id);
    } catch (err) {
      if (isUniqueViolation(err)) {
        return NextResponse.json({ error: `Voucher number ${v.voucherNumber} is already used — pick another.` }, { status: 409 });
      }
      throw err;
    }
    return NextResponse.json({ id }, { status: 201 });
  });
}
