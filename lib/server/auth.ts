import "server-only";
import { createHash, randomBytes, scrypt as scryptCb, timingSafeEqual } from "node:crypto";
import { promisify } from "node:util";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { db } from "./db";
import { canAccessSection } from "@/lib/adminAccess";
import type { AdminSection, AdminUser } from "@/types/admin";

const scrypt = promisify(scryptCb) as (pwd: string, salt: Buffer, len: number) => Promise<Buffer>;

export const SESSION_COOKIE = "jm_session";
const SESSION_DAYS = 7;

/** The signed-in account as the rest of the app sees it — never includes the password hash. */
export type SessionUser = Omit<AdminUser, "password">;

// ─── Passwords ───────────────────────────────────────────────────────────────

export async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(16);
  const hash = await scrypt(password, salt, 64);
  return `scrypt$${salt.toString("base64")}$${hash.toString("base64")}`;
}

export async function verifyPassword(password: string, stored: string): Promise<boolean> {
  const [scheme, saltB64, hashB64] = stored.split("$");
  if (scheme !== "scrypt" || !saltB64 || !hashB64) return false;
  const expected = Buffer.from(hashB64, "base64");
  const actual = await scrypt(password, Buffer.from(saltB64, "base64"), expected.length);
  return timingSafeEqual(actual, expected);
}

// ─── Rows ────────────────────────────────────────────────────────────────────

type UserRow = {
  id: string; name: string; email: string; password_hash: string; role: AdminUser["role"];
  job_title: string | null; access: AdminSection[] | null; active: boolean;
  created_at: string; last_login: string | null;
};

export function toSessionUser(row: UserRow): SessionUser {
  return {
    id: row.id,
    name: row.name,
    email: row.email,
    role: row.role,
    jobTitle: row.job_title ?? undefined,
    access: row.access ?? undefined,
    active: row.active,
    createdAt: new Date(row.created_at).toISOString(),
    lastLogin: row.last_login ? new Date(row.last_login).toISOString() : undefined,
  };
}

export async function findUserByEmail(email: string): Promise<UserRow | null> {
  const rows = (await db()`select * from users where email = ${email.trim().toLowerCase()}`) as UserRow[];
  return rows[0] ?? null;
}

export async function findUserById(id: string): Promise<UserRow | null> {
  const rows = (await db()`select * from users where id = ${id}`) as UserRow[];
  return rows[0] ?? null;
}

// ─── Sessions ────────────────────────────────────────────────────────────────

function hashToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}

export async function startSession(userId: string): Promise<void> {
  const token = randomBytes(32).toString("base64url");
  const expires = new Date(Date.now() + SESSION_DAYS * 86_400_000);
  await db()`insert into sessions (token_hash, user_id, expires_at) values (${hashToken(token)}, ${userId}, ${expires.toISOString()})`;
  await db()`update users set last_login = now() where id = ${userId}`;
  (await cookies()).set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    expires,
  });
}

export async function endSession(): Promise<void> {
  const store = await cookies();
  const token = store.get(SESSION_COOKIE)?.value;
  if (token) await db()`delete from sessions where token_hash = ${hashToken(token)}`;
  store.delete(SESSION_COOKIE);
}

/** Signs the account out everywhere, e.g. after a password change or deactivation. */
export async function endAllSessions(userId: string, exceptCurrent = false): Promise<void> {
  const token = exceptCurrent ? (await cookies()).get(SESSION_COOKIE)?.value : undefined;
  if (token) {
    await db()`delete from sessions where user_id = ${userId} and token_hash <> ${hashToken(token)}`;
  } else {
    await db()`delete from sessions where user_id = ${userId}`;
  }
}

export async function getSessionUser(): Promise<SessionUser | null> {
  const token = (await cookies()).get(SESSION_COOKIE)?.value;
  if (!token) return null;
  const rows = (await db()`
    select u.* from sessions s join users u on u.id = s.user_id
    where s.token_hash = ${hashToken(token)} and s.expires_at > now() and u.active
  `) as UserRow[];
  return rows[0] ? toSessionUser(rows[0]) : null;
}

// ─── Route guards ────────────────────────────────────────────────────────────

type Guarded = { user: SessionUser; error?: undefined } | { user?: undefined; error: NextResponse };

/** For route handlers: the signed-in user if they may use `section`, otherwise a 401/403 response. */
export async function requireUser(section?: AdminSection): Promise<Guarded> {
  const user = await getSessionUser();
  if (!user) return { error: NextResponse.json({ error: "Please sign in again." }, { status: 401 }) };
  if (section && !canAccessSection(user, section)) {
    return { error: NextResponse.json({ error: "Your account doesn't have access to this section." }, { status: 403 }) };
  }
  return { user };
}

export function newId(prefix: string): string {
  return `${prefix}_${randomBytes(8).toString("hex")}`;
}
