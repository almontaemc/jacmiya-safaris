"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { api, ApiError } from "@/lib/api";
import { ADMIN_SECTIONS } from "@/lib/adminAccess";
import { useAdminUser, type SessionUser } from "@/components/admin/AdminSession";
import type { UserRole } from "@/types/admin";
import { Plus, Pencil, Trash2, ShieldCheck, Upload } from "lucide-react";

const ROLE_COLOR: Record<UserRole, string> = {
  Owner: "bg-purple-100 text-purple-700",
  Admin: "bg-blue-100 text-blue-700",
  Manager: "bg-amber-100 text-amber-700",
  Staff: "bg-gray-100 text-gray-600",
};

type ImportResult = { usersAdded: number; usersSkipped: string[]; vouchersAdded: number; vouchersSkipped: string[] };

export default function UsersPage() {
  const me = useAdminUser();
  const [users, setUsers] = useState<SessionUser[] | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [importing, setImporting] = useState(false);
  const [importResult, setImportResult] = useState<ImportResult | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const load = useCallback(async () => {
    try {
      setUsers((await api<{ users: SessionUser[] }>("/api/users")).users);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Could not load users.");
    }
  }, []);
  useEffect(() => { load(); }, [load]);

  async function run(action: () => Promise<unknown>) {
    setError("");
    try {
      await action();
      await load();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Something went wrong.");
    }
  }

  async function handleImport(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    setError("");
    setImportResult(null);
    setImporting(true);
    try {
      const backup = JSON.parse(await file.text());
      setImportResult(await api<ImportResult>("/api/import", { method: "POST", body: backup }));
      await load();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "That file isn't a valid backup.");
    } finally {
      setImporting(false);
    }
  }

  if (!users) return <div className="p-6 text-gray-400">{error || "Loading…"}</div>;

  return (
    <div className="space-y-5 max-w-4xl">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Admin Users</h1>
          <p className="text-gray-500 text-sm">{users.length} account{users.length !== 1 ? "s" : ""} with access to this admin panel</p>
        </div>
        <Link href="/admin/users/new" className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold px-4 py-2.5 rounded-xl transition-colors">
          <Plus className="w-4 h-4" /> Add User
        </Link>
      </div>

      {error && <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 text-sm">{error}</div>}

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 divide-y divide-gray-50">
        {users.map((user) => (
          <div key={user.id} className="px-5 py-4 flex items-center gap-4">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center flex-shrink-0">
              <span className="text-white font-bold text-sm">{user.name.charAt(0)}</span>
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <p className="text-sm font-semibold text-gray-800">{user.name}</p>
                {me?.id === user.id && (
                  <span className="flex items-center gap-1 text-xs bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-full font-medium">
                    <ShieldCheck className="w-3 h-3" /> You
                  </span>
                )}
                <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${ROLE_COLOR[user.role]}`}>{user.role}</span>
                <button onClick={() => run(() => api(`/api/users/${user.id}`, { method: "PATCH", body: { active: !user.active } }))}
                  className={`text-xs px-2 py-0.5 rounded-full font-medium transition-colors ${user.active ? "bg-green-100 text-green-700 hover:bg-green-200" : "bg-gray-100 text-gray-500 hover:bg-gray-200"}`}>
                  {user.active ? "Active" : "Inactive"}
                </button>
              </div>
              <p className="text-xs text-gray-500 mt-0.5">{user.jobTitle && `${user.jobTitle} · `}{user.email}</p>
              <p className="text-xs text-gray-400 mt-0.5">
                {user.access
                  ? `Access: ${ADMIN_SECTIONS.filter((s) => user.access!.includes(s.key)).map((s) => s.label).join(", ")}`
                  : "Full access"}
                {user.lastLogin && ` · Last login ${new Date(user.lastLogin).toLocaleString("en-GB", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })}`}
              </p>
            </div>
            <div className="flex items-center gap-1 flex-shrink-0">
              <Link href={`/admin/users/${user.id}/edit`} className="p-2 rounded-lg text-gray-400 hover:text-blue-600 hover:bg-blue-50 transition-colors" title="Edit">
                <Pencil className="w-4 h-4" />
              </Link>
              {confirmDelete === user.id ? (
                <div className="flex items-center gap-1">
                  <button onClick={() => { setConfirmDelete(null); run(() => api(`/api/users/${user.id}`, { method: "DELETE" })); }} className="text-xs bg-red-500 text-white px-2 py-1 rounded hover:bg-red-600 transition-colors">Confirm</button>
                  <button onClick={() => setConfirmDelete(null)} className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded hover:bg-gray-200 transition-colors">Cancel</button>
                </div>
              ) : (
                <button onClick={() => setConfirmDelete(user.id)} className="p-2 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors" title="Delete">
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 space-y-3">
        <h2 className="font-semibold text-gray-800">Bring in accounts and vouchers from an old backup</h2>
        <p className="text-sm text-gray-500">
          Before this update, accounts and vouchers were saved in each browser. Export a backup on that computer
          (Settings → Backup &amp; Restore → Export) and upload it here. Accounts with an email already listed above,
          and voucher numbers already used, are skipped — so it is safe to upload more than one backup.
        </p>
        <input ref={fileRef} type="file" accept=".json,application/json" onChange={handleImport} className="hidden" />
        <button onClick={() => fileRef.current?.click()} disabled={importing}
          className="flex items-center gap-2 border border-gray-200 text-gray-700 hover:bg-gray-50 text-sm font-semibold px-4 py-2.5 rounded-xl transition-colors disabled:opacity-60">
          <Upload className="w-4 h-4" /> {importing ? "Importing…" : "Upload backup file"}
        </button>
        {importResult && (
          <div className="bg-blue-50 border border-blue-100 rounded-xl px-4 py-3 text-sm text-gray-700 space-y-1">
            <p><strong>{importResult.usersAdded}</strong> account{importResult.usersAdded !== 1 ? "s" : ""} and <strong>{importResult.vouchersAdded}</strong> voucher{importResult.vouchersAdded !== 1 ? "s" : ""} imported.</p>
            {importResult.usersSkipped.length > 0 && <p className="text-xs text-gray-500">Accounts skipped: {importResult.usersSkipped.join("; ")}</p>}
            {importResult.vouchersSkipped.length > 0 && <p className="text-xs text-gray-500">Vouchers skipped: {importResult.vouchersSkipped.join("; ")}</p>}
          </div>
        )}
      </div>
    </div>
  );
}
