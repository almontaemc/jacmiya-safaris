import "server-only";
import { NextResponse } from "next/server";
import { db } from "./db";
import { requireUser } from "./auth";
import { hasFullAccess } from "@/lib/adminAccess";

/** Postgres unique-violation, e.g. an email that is already taken. */
export function isUniqueViolation(err: unknown): boolean {
  return typeof err === "object" && err !== null && (err as { code?: string }).code === "23505";
}

/**
 * Whether at least one active full-access account would remain if `excludeId`
 * were removed, deactivated or limited — so nobody can lock the business out.
 */
export async function otherFullAccessAdminExists(excludeId: string): Promise<boolean> {
  const [{ count }] = (await db()`
    select count(*)::int as count from users
    where active and access is null and id <> ${excludeId}
  `) as { count: number }[];
  return count > 0;
}

/** User management is for full-access accounts only — anyone else could grant themselves more. */
export async function requireAdmin() {
  const guard = await requireUser();
  if (guard.error) return guard;
  if (!hasFullAccess(guard.user)) {
    return { error: NextResponse.json({ error: "Only full-access accounts can manage users." }, { status: 403 }) };
  }
  return guard;
}
