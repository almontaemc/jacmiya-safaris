import { NextResponse } from "next/server";
import { hashPassword, newId } from "@/lib/server/auth";
import { db } from "@/lib/server/db";
import { handle, readJson } from "@/lib/server/respond";
import { requireAdmin } from "@/lib/server/users";
import { access as validAccess, email as validEmail, InputError, MIN_PASSWORD, role as validRole, voucherFields } from "@/lib/server/validate";
import { insertVoucher } from "@/lib/server/vouchers";

/**
 * One-time move of users and vouchers from a browser backup (Settings →
 * Backup & Restore) into the shared database. Anything already in the
 * database — same email, same voucher number — is skipped, so running it
 * twice is harmless.
 */
export async function POST(request: Request) {
  return handle(async () => {
    const { user: me, error } = await requireAdmin();
    if (error) return error;
    const backup = await readJson(request);

    const result = { usersAdded: 0, usersSkipped: [] as string[], vouchersAdded: 0, vouchersSkipped: [] as string[] };

    const users = Array.isArray(backup.jm_users) ? backup.jm_users : [];
    for (const raw of users as Record<string, unknown>[]) {
      const label = String(raw?.email ?? raw?.name ?? "unknown");
      try {
        const email = validEmail(raw.email);
        const pwd = typeof raw.password === "string" ? raw.password : "";
        // The old shared-password Owner is replaced by the account created at setup.
        if (pwd.length < MIN_PASSWORD) throw new InputError("password shorter than 8 characters");
        const inserted = await db()`
          insert into users (id, name, email, password_hash, role, job_title, access, active)
          values (${newId("u")}, ${String(raw.name ?? email).trim()}, ${email}, ${await hashPassword(pwd)},
            ${validRole(raw.role)}, ${typeof raw.jobTitle === "string" && raw.jobTitle.trim() ? raw.jobTitle.trim() : null},
            ${validAccess(raw.access)}, ${raw.active !== false})
          on conflict (email) do nothing
          returning id
        `;
        if (inserted.length) result.usersAdded++;
        else result.usersSkipped.push(`${label} (already exists)`);
      } catch (err) {
        result.usersSkipped.push(`${label} (${err instanceof Error ? err.message : "invalid"})`);
      }
    }

    const vouchers = Array.isArray(backup.jm_vouchers) ? backup.jm_vouchers : [];
    for (const raw of vouchers as Record<string, unknown>[]) {
      const label = `voucher ${raw?.voucherNumber ?? "?"}`;
      try {
        const v = voucherFields(raw);
        const [{ taken }] = (await db()`select exists(select 1 from vouchers where voucher_number = ${v.voucherNumber}) as taken`) as { taken: boolean }[];
        if (taken) { result.vouchersSkipped.push(`${label} (number already used)`); continue; }
        await insertVoucher(newId("vch"), v, me.id, typeof raw.createdAt === "string" ? raw.createdAt : undefined);
        result.vouchersAdded++;
      } catch (err) {
        result.vouchersSkipped.push(`${label} (${err instanceof Error ? err.message : "invalid"})`);
      }
    }

    return NextResponse.json(result);
  });
}
