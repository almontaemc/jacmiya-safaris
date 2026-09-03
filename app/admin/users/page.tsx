"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getUsers, updateUser, deleteUser, getCurrentUser } from "@/lib/adminStore";
import type { AdminUser, UserRole } from "@/types/admin";
import { Plus, Pencil, Trash2, ShieldCheck } from "lucide-react";

const ROLE_COLOR: Record<UserRole, string> = {
  Owner: "bg-purple-100 text-purple-700",
  Admin: "bg-blue-100 text-blue-700",
  Manager: "bg-amber-100 text-amber-700",
  Staff: "bg-gray-100 text-gray-600",
};

export default function UsersPage() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);
  const currentUser = getCurrentUser();

  function load() { setUsers(getUsers()); }
  useEffect(() => { setMounted(true); load(); }, []);

  if (!mounted) return <div className="p-6 text-gray-400">Loading…</div>;

  const activeCount = users.filter((u) => u.active).length;

  function toggleActive(user: AdminUser) {
    if (user.active && activeCount <= 1) {
      alert("At least one active user is required — activate another account before deactivating this one.");
      return;
    }
    updateUser(user.id, { active: !user.active });
    load();
  }

  function handleDelete(user: AdminUser) {
    if (currentUser?.id === user.id) {
      alert("You can't delete the account you're currently signed in with.");
      setConfirmDelete(null);
      return;
    }
    if (user.active && activeCount <= 1) {
      alert("At least one active user is required — you can't delete the last active account.");
      setConfirmDelete(null);
      return;
    }
    deleteUser(user.id);
    load();
    setConfirmDelete(null);
  }

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

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 divide-y divide-gray-50">
        {users.map((user) => (
          <div key={user.id} className="px-5 py-4 flex items-center gap-4">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center flex-shrink-0">
              <span className="text-white font-bold text-sm">{user.name.charAt(0)}</span>
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <p className="text-sm font-semibold text-gray-800">{user.name}</p>
                {currentUser?.id === user.id && (
                  <span className="flex items-center gap-1 text-xs bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-full font-medium">
                    <ShieldCheck className="w-3 h-3" /> You
                  </span>
                )}
                <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${ROLE_COLOR[user.role]}`}>{user.role}</span>
                <button onClick={() => toggleActive(user)}
                  className={`text-xs px-2 py-0.5 rounded-full font-medium transition-colors ${user.active ? "bg-green-100 text-green-700 hover:bg-green-200" : "bg-gray-100 text-gray-500 hover:bg-gray-200"}`}>
                  {user.active ? "Active" : "Inactive"}
                </button>
              </div>
              <p className="text-xs text-gray-500 mt-0.5">{user.email}</p>
              {user.lastLogin && <p className="text-xs text-gray-400 mt-0.5">Last login {new Date(user.lastLogin).toLocaleString("en-GB", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })}</p>}
            </div>
            <div className="flex items-center gap-1 flex-shrink-0">
              <Link href={`/admin/users/${user.id}/edit`} className="p-2 rounded-lg text-gray-400 hover:text-blue-600 hover:bg-blue-50 transition-colors" title="Edit">
                <Pencil className="w-4 h-4" />
              </Link>
              {confirmDelete === user.id ? (
                <div className="flex items-center gap-1">
                  <button onClick={() => handleDelete(user)} className="text-xs bg-red-500 text-white px-2 py-1 rounded hover:bg-red-600 transition-colors">Confirm</button>
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

      <p className="text-xs text-gray-400">
        Roles are shown for reference — every active account currently has full admin access. Accounts are stored in this browser only (no shared server), so a new user can only log in from this same browser/device — to let them log in from their own device, export a backup here (Settings &rarr; Backup &amp; Restore) and have them import it once on theirs.
      </p>
    </div>
  );
}
