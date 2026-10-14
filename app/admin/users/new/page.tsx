"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { api, ApiError } from "@/lib/api";
import type { AdminSection, UserRole } from "@/types/admin";
import AccessPicker from "@/components/admin/AccessPicker";
import { ArrowLeft } from "lucide-react";

const ROLES: UserRole[] = ["Owner", "Admin", "Manager", "Staff"];

export default function NewUserPage() {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [role, setRole] = useState<UserRole>("Staff");
  const [jobTitle, setJobTitle] = useState("");
  const [access, setAccess] = useState<AdminSection[] | undefined>(undefined);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (password.length < 8) { setError("Password must be at least 8 characters."); return; }
    if (password !== confirmPassword) { setError("Passwords do not match."); return; }
    if (access && access.length === 0) { setError("Tick at least one section, or choose Full access."); return; }
    setSaving(true);
    try {
      await api("/api/users", { method: "POST", body: { name, email, password, role, jobTitle, access: access ?? null } });
      router.push("/admin/users");
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Could not reach the server.");
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
          <h1 className="text-2xl font-bold text-gray-900">Add User</h1>
          <p className="text-gray-500 text-sm">They sign in with this email and password, from any device</p>
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
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className={labelCls}>Password *</label>
            <input type="password" className={inputCls} value={password} onChange={(e) => setPassword(e.target.value)} required minLength={8} autoComplete="new-password" />
          </div>
          <div>
            <label className={labelCls}>Confirm Password *</label>
            <input type="password" className={inputCls} value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required autoComplete="new-password" />
          </div>
        </div>
        <p className="text-xs text-gray-400 -mt-2">Minimum 8 characters. They can change it later under Change Password.</p>

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

        {error && <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 text-sm">{error}</div>}

        <div className="flex gap-3 pt-2">
          <button type="submit" disabled={saving} className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-2.5 rounded-xl text-sm transition-colors disabled:opacity-60">
            {saving ? "Creating…" : "Create User"}
          </button>
          <Link href="/admin/users" className="border border-gray-200 text-gray-600 hover:bg-gray-50 font-semibold px-6 py-2.5 rounded-xl text-sm transition-colors">Cancel</Link>
        </div>
      </form>
    </div>
  );
}
