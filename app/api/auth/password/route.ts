import { NextResponse } from "next/server";
import { endAllSessions, findUserById, hashPassword, requireUser, verifyPassword } from "@/lib/server/auth";
import { db } from "@/lib/server/db";
import { handle, readJson } from "@/lib/server/respond";
import { password as validPassword } from "@/lib/server/validate";

/** Any signed-in account can change its own password. Other devices are signed out. */
export async function POST(request: Request) {
  return handle(async () => {
    const { user, error } = await requireUser();
    if (error) return error;
    const body = await readJson(request);

    const row = await findUserById(user.id);
    const current = typeof body.currentPassword === "string" ? body.currentPassword : "";
    if (!row || !(await verifyPassword(current, row.password_hash))) {
      return NextResponse.json({ error: "Current password is incorrect." }, { status: 400 });
    }

    const hash = await hashPassword(validPassword(body.newPassword, "New password"));
    await db()`update users set password_hash = ${hash} where id = ${user.id}`;
    await endAllSessions(user.id, true);
    return NextResponse.json({ ok: true });
  });
}
