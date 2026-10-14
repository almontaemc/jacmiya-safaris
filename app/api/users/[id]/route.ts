import { NextResponse } from "next/server";
import { endAllSessions, findUserById, hashPassword, toSessionUser } from "@/lib/server/auth";
import { db } from "@/lib/server/db";
import { handle, readJson } from "@/lib/server/respond";
import { isUniqueViolation, otherFullAccessAdminExists, requireAdmin } from "@/lib/server/users";
import { password as validPassword, userFields } from "@/lib/server/validate";

type Ctx = { params: Promise<{ id: string }> };

const LOCKOUT = "At least one active full-access account is required — give another account full access first.";

export async function GET(_req: Request, { params }: Ctx) {
  return handle(async () => {
    const { error } = await requireAdmin();
    if (error) return error;
    const row = await findUserById((await params).id);
    if (!row) return NextResponse.json({ error: "User not found." }, { status: 404 });
    return NextResponse.json({ user: toSessionUser(row) });
  });
}

/** Edit details/access, reset a password, or flip `active`. */
export async function PATCH(request: Request, { params }: Ctx) {
  return handle(async () => {
    const { user: me, error } = await requireAdmin();
    if (error) return error;
    const { id } = await params;
    const existing = await findUserById(id);
    if (!existing) return NextResponse.json({ error: "User not found." }, { status: 404 });
    const body = await readJson(request);

    // Active toggle on its own (from the users list).
    if (Object.keys(body).length === 1 && typeof body.active === "boolean") {
      if (!body.active) {
        if (id === me.id) return NextResponse.json({ error: "You can't deactivate the account you're signed in with." }, { status: 400 });
        if (existing.access === null && !(await otherFullAccessAdminExists(id))) return NextResponse.json({ error: LOCKOUT }, { status: 400 });
        await endAllSessions(id);
      }
      await db()`update users set active = ${body.active} where id = ${id}`;
      return NextResponse.json({ ok: true });
    }

    const f = userFields(body);
    if (existing.access === null && f.access !== null) {
      if (id === me.id) return NextResponse.json({ error: "You can't limit your own access — you would lose the Users page." }, { status: 400 });
      if (!(await otherFullAccessAdminExists(id))) return NextResponse.json({ error: LOCKOUT }, { status: 400 });
    }

    try {
      await db()`
        update users set name = ${f.name}, email = ${f.email}, role = ${f.role},
          job_title = ${f.jobTitle}, access = ${f.access}
        where id = ${id}
      `;
    } catch (err) {
      if (isUniqueViolation(err)) return NextResponse.json({ error: "A user with that email already exists." }, { status: 409 });
      throw err;
    }

    if (typeof body.newPassword === "string" && body.newPassword) {
      const hash = await hashPassword(validPassword(body.newPassword, "New password"));
      await db()`update users set password_hash = ${hash} where id = ${id}`;
      // Their other devices must sign in again with the new password.
      await endAllSessions(id, id === me.id);
    }
    return NextResponse.json({ ok: true });
  });
}

export async function DELETE(_req: Request, { params }: Ctx) {
  return handle(async () => {
    const { user: me, error } = await requireAdmin();
    if (error) return error;
    const { id } = await params;
    if (id === me.id) return NextResponse.json({ error: "You can't delete the account you're signed in with." }, { status: 400 });
    const existing = await findUserById(id);
    if (!existing) return NextResponse.json({ error: "User not found." }, { status: 404 });
    if (existing.active && existing.access === null && !(await otherFullAccessAdminExists(id))) {
      return NextResponse.json({ error: LOCKOUT }, { status: 400 });
    }
    await db()`delete from users where id = ${id}`;
    return NextResponse.json({ ok: true });
  });
}
