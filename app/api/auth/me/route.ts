import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/server/auth";
import { db } from "@/lib/server/db";
import { handle } from "@/lib/server/respond";

/** The signed-in account, or — when nobody is signed in — whether the owner account still needs creating. */
export async function GET() {
  return handle(async () => {
    const user = await getSessionUser();
    if (user) return NextResponse.json({ user });
    const [{ count }] = (await db()`select count(*)::int as count from users`) as { count: number }[];
    return NextResponse.json({ user: null, needsSetup: count === 0 }, { status: 401 });
  });
}
