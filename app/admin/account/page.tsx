"use client";

import { useState } from "react";
import { api, ApiError } from "@/lib/api";
import { useAdminUser } from "@/components/admin/AdminSession";
import { CheckCircle, KeyRound } from "lucide-react";

export default function AccountPage() {
  const user = useAdminUser();
  const [current, setCurrent] = useState("");
  const [next, setNext] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSaved(false);
    if (next.length < 8) { setError("New password must be at least 8 characters."); return; }
    if (next !== confirm) { setError("New passwords do not match."); return; }
    setSaving(true);
    try {
      await api("/api/auth/password", { method: "POST", body: { currentPassword: current, newPassword: next } });
      setCurrent(""); setNext(""); setConfirm("");
      setSaved(true);
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
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Change Password</h1>
        <p className="text-gray-500 text-sm">{user?.name} · {user?.email}</p>
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 space-y-4">
        <div>
          <label className={labelCls}>Current Password</label>
          <input type="password" className={inputCls} value={current} onChange={(e) => setCurrent(e.target.value)} required autoComplete="current-password" />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className={labelCls}>New Password</label>
            <input type="password" className={inputCls} value={next} onChange={(e) => setNext(e.target.value)} required minLength={8} autoComplete="new-password" />
          </div>
          <div>
            <label className={labelCls}>Confirm New Password</label>
            <input type="password" className={inputCls} value={confirm} onChange={(e) => setConfirm(e.target.value)} required autoComplete="new-password" />
          </div>
        </div>
        <p className="text-xs text-gray-400 -mt-2">At least 8 characters. Any other device signed in to this account will be signed out.</p>

        {error && <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 text-sm">{error}</div>}

        <div className="flex items-center gap-3 pt-2">
          <button type="submit" disabled={saving} className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-2.5 rounded-xl text-sm transition-colors disabled:opacity-60">
            <KeyRound className="w-4 h-4" /> {saving ? "Saving…" : "Change Password"}
          </button>
          {saved && <span className="flex items-center gap-1.5 text-emerald-600 text-sm font-medium"><CheckCircle className="w-4 h-4" /> Password changed</span>}
        </div>
      </form>
    </div>
  );
}
