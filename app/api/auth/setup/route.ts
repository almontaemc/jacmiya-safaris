import { NextResponse } from "next/server";
import { hashPassword, newId, startSession } from "@/lib/server/auth";
import { db } from "@/lib/server/db";
import { handle, readJson } from "@/lib/server/respond";
import { email as validEmail, password as validPassword, InputError } from "@/lib/server/validate";

/**
 * Creates the first (Owner) account. Only works while the users table is
 * empty; the insert itself re-checks that, so two people racing can't both win.
 */
export async function POST(request: Request) {
  return handle(async () => {
    const body = await readJson(request);
    const name = typeof body.name === "string" ? body.name.trim() : "";
    if (!name) throw new InputError("Name is required.");
    const email = validEmail(body.email);
    const passwordHash = await hashPassword(validPassword(body.password));
    const id = newId("u");

    const inserted = await db()`
      insert into users (id, name, email, password_hash, role)
      select ${id}, ${name}, ${email}, ${passwordHash}, 'Owner'
      where not exists (select 1 from users)
      returning id
    `;
    if (inserted.length === 0) {
      return NextResponse.json({ error: "The owner account already exists — sign in instead." }, { status: 409 });
    }

    await startSession(id);
    return NextResponse.json({ ok: true });
  });
}
