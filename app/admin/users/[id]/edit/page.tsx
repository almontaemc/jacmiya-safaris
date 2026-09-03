"use client";

import { use, useEffect, useState } from "react";
import Link from "next/link";
import { getUsers, updateUser, getCurrentUser } from "@/lib/adminStore";
import type { AdminUser, UserRole } from "@/types/admin";
import { ArrowLeft, CheckCircle } from "lucide-react";

const ROLES: UserRole[] = ["Owner", "Admin", "Manager", "Staff"];

export default function EditUserPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [user, setUser] = useState<AdminUser | null>(null);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<UserRole>("Staff");
  const [newPassword, setNewPassword] = useState("");
  const [error, setError] = useState("");
  const [saved, setSaved] = useState(false);
  const currentUser = getCurrentUser();

  useEffect(() => {
    const found = getUsers().find((u) => u.id === id);
    if (found) {
      setUser(found);
      setName(found.name);
      setEmail(found.email);
      setRole(found.role);
    }
  }, [id]);

  if (!user) return <div className="p-6 text-gray-400">User not found.</div>;

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    const emailTaken = getUsers().some((u) => u.id !== id && u.email.toLowerCase() === email.trim().toLowerCase());
    if (emailTaken) { setError("A user with that email already exists."); return; }
    if (newPassword && newPassword.length < 8) { setError("New password must be at least 8 characters."); return; }

    const updates: Partial<AdminUser> = { name: name.trim(), email: email.trim(), role };
    if (newPassword) updates.password = newPassword;
    updateUser(id, updates);
    setNewPassword("");
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  }

  const inputCls = "w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-800 bg-white placeholder-gray-400 focus:outline-none focus:border-blue-400 transition-colors";
  const labelCls = "block text-xs font-semibold text-gray-600 uppercase tracking-wider mb-1.5";

  return (
    <div className="max-w-xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/admin/users" className="p-2 rounded-lg hover:bg-gray-100 transition-colors text-gray-500"><ArrowLeft className="w-4 h-4" /></Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Edit User</h1>
          <p className="text-gray-500 text-sm">{user.email}{currentUser?.id === user.id ? " · this is you" : ""}</p>
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
        <div>
          <label className={labelCls}>New Password</label>
          <input type="password" className={inputCls} value={newPassword} onChange={(e) => setNewPassword(e.target.value)} placeholder="Leave blank to keep current password" minLength={8} />
        </div>

        {error && <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 text-sm">{error}</div>}

        <div className="flex items-center gap-3 pt-2">
          <button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-2.5 rounded-xl text-sm transition-colors">Save Changes</button>
          {saved && <span className="flex items-center gap-1.5 text-emerald-600 text-sm font-medium"><CheckCircle className="w-4 h-4" /> Saved</span>}
        </div>
      </form>

      <Link href="/admin/users" className="inline-block border border-gray-200 text-gray-600 hover:bg-gray-50 font-semibold px-6 py-2.5 rounded-xl text-sm transition-colors">
        ← Back to Users
      </Link>
    </div>
  );
}
