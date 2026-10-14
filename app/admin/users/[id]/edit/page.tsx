"use client";

import { use, useEffect, useState } from "react";
import Link from "next/link";
import { api, ApiError } from "@/lib/api";
import { useAdminUser, type SessionUser } from "@/components/admin/AdminSession";
import type { AdminSection, UserRole } from "@/types/admin";
import AccessPicker from "@/components/admin/AccessPicker";
import { ArrowLeft, CheckCircle } from "lucide-react";

const ROLES: UserRole[] = ["Owner", "Admin", "Manager", "Staff"];

export default function EditUserPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const me = useAdminUser();
  const [user, setUser] = useState<SessionUser | null>(null);
  const [loadError, setLoadError] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<UserRole>("Staff");
  const [jobTitle, setJobTitle] = useState("");
  const [access, setAccess] = useState<AdminSection[] | undefined>(undefined);
  const [newPassword, setNewPassword] = useState("");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    api<{ user: SessionUser }>(`/api/users/${id}`)
      .then(({ user: found }) => {
        setUser(found);
        setName(found.name);
        setEmail(found.email);
        setRole(found.role);
        setJobTitle(found.jobTitle ?? "");
        setAccess(found.access);
      })
      .catch((err) => setLoadError(err instanceof ApiError ? err.message : "Could not load this user."));
  }, [id]);

  if (!user) return <div className="p-6 text-gray-400">{loadError || "Loading…"}</div>;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (newPassword && newPassword.length < 8) { setError("New password must be at least 8 characters."); return; }
    if (access && access.length === 0) { setError("Tick at least one section, or choose Full access."); return; }
    setSaving(true);
    try {
      await api(`/api/users/${id}`, {
        method: "PATCH",
        body: { name, email, role, jobTitle, access: access ?? null, ...(newPassword ? { newPassword } : {}) },
      });
      setNewPassword("");
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Could not reach the server.");
    } finally {
      setSaving(false);
    }
  }

  const inputCls = "w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-800 bg-white placeholder-gray-400 focus:outline-none focus:border-blue-400 transition-colors";
  const labelCls = "block text-xs font-semibold text-gray-600 uppercase tracking-wider mb-1.5";

  return (
    <div className="max-w-xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/admin/users" className="p-2 rounded-lg hover:bg-gray-100 transition-colors text-gray-500"><ArrowLeft className="w-4 h-4" /></Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Edit User</h1>
          <p className="text-gray-500 text-sm">{user.email}{me?.id === user.id ? " · this is you" : ""}</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 space-y-4">
        <div>
          <label className={labelCls}>Name *</label>
          <input className={inputCls} value={name} onChange={(e) => setName(e.target.value)} required />
        </div>
        <div>
          <label className={labelCls}>Email *</label>
          <input type="email" className={inputCls} value={email} onChange={(e) => setEmail(e.target.value)} required />
        </div>
        <div>
          <label className={labelCls}>Job Title</label>
          <input className={inputCls} value={jobTitle} onChange={(e) => setJobTitle(e.target.value)} placeholder="e.g. Reservations Manager" />
        </div>
        <div>
          <label className={labelCls}>Role</label>
          <div className="flex flex-wrap gap-2">
            {ROLES.map((r) => (
              <button key={r} type="button" onClick={() => setRole(r)}
                className={`px-4 py-2 rounded-xl text-sm font-semibold border transition-colors ${role === r ? "bg-blue-600 text-white border-blue-600" : "bg-white text-gray-600 border-gray-200 hover:border-blue-300"}`}>
                {r}
              </button>
            ))}
          </div>
        </div>
        <AccessPicker value={access} onChange={setAccess} />
        <div>
          <label className={labelCls}>New Password</label>
          <input type="password" className={inputCls} value={newPassword} onChange={(e) => setNewPassword(e.target.value)} placeholder="Leave blank to keep current password" minLength={8} autoComplete="new-password" />
          <p className="text-xs text-gray-400 mt-1.5">Setting a new password signs them out on their other devices.</p>
        </div>

        {error && <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 text-sm">{error}</div>}

        <div className="flex items-center gap-3 pt-2">
          <button type="submit" disabled={saving} className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-2.5 rounded-xl text-sm transition-colors disabled:opacity-60">
            {saving ? "Saving…" : "Save Changes"}
          </button>
          {saved && <span className="flex items-center gap-1.5 text-emerald-600 text-sm font-medium"><CheckCircle className="w-4 h-4" /> Saved</span>}
        </div>
      </form>

      <Link href="/admin/users" className="inline-block border border-gray-200 text-gray-600 hover:bg-gray-50 font-semibold px-6 py-2.5 rounded-xl text-sm transition-colors">
        ← Back to Users
      </Link>
    </div>
  );
}
