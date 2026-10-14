import { NextResponse } from "next/server";
import { requireUser } from "@/lib/server/auth";
import { handle } from "@/lib/server/respond";
import { nextVoucherNumber } from "@/lib/server/vouchers";

export async function GET() {
  return handle(async () => {
    const { error } = await requireUser("vouchers");
    if (error) return error;
    return NextResponse.json({ next: await nextVoucherNumber() });
  });
}
