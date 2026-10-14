import { NextResponse } from "next/server";
import { endSession } from "@/lib/server/auth";
import { handle } from "@/lib/server/respond";

export async function POST() {
  return handle(async () => {
    await endSession();
    return NextResponse.json({ ok: true });
  });
}
