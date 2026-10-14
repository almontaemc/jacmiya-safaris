import { NextResponse } from "next/server";
import { findUserByEmail, startSession, toSessionUser, verifyPassword } from "@/lib/server/auth";
import { handle, readJson } from "@/lib/server/respond";

const WRONG = "Incorrect email or password.";

export async function POST(request: Request) {
  return handle(async () => {
    const body = await readJson(request);
    const email = typeof body.email === "string" ? body.email : "";
    const password = typeof body.password === "string" ? body.password : "";
    if (!email || !password) return NextResponse.json({ error: WRONG }, { status: 401 });

    const row = await findUserByEmail(email);
    if (!row || !(await verifyPassword(password, row.password_hash))) {
      return NextResponse.json({ error: WRONG }, { status: 401 });
    }
    if (!row.active) {
      return NextResponse.json({ error: "This account has been deactivated. Ask the owner to reactivate it." }, { status: 403 });
    }

    await startSession(row.id);
    return NextResponse.json({ user: toSessionUser(row) });
  });
}
