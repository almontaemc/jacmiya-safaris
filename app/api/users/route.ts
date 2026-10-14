import { NextResponse } from "next/server";
import { hashPassword, newId, toSessionUser } from "@/lib/server/auth";
import { db } from "@/lib/server/db";
import { handle, readJson } from "@/lib/server/respond";
import { isUniqueViolation, requireAdmin } from "@/lib/server/users";
import { password as validPassword, userFields } from "@/lib/server/validate";

export async function GET() {
  return handle(async () => {
    const { error } = await requireAdmin();
    if (error) return error;
    const rows = await db()`select * from users order by created_at`;
    return NextResponse.json({ users: rows.map((r) => toSessionUser(r as Parameters<typeof toSessionUser>[0])) });
  });
}

export async function POST(request: Request) {
  return handle(async () => {
    const { error } = await requireAdmin();
    if (error) return error;
    const body = await readJson(request);
    const f = userFields(body);
    const hash = await hashPassword(validPassword(body.password));
    const id = newId("u");
    try {
      await db()`
        insert into users (id, name, email, password_hash, role, job_title, access)
        values (${id}, ${f.name}, ${f.email}, ${hash}, ${f.role}, ${f.jobTitle}, ${f.access})
      `;
    } catch (err) {
      if (isUniqueViolation(err)) return NextResponse.json({ error: "A user with that email already exists." }, { status: 409 });
      throw err;
    }
    return NextResponse.json({ id }, { status: 201 });
  });
}

