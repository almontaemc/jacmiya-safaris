"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { api, ApiError } from "@/lib/api";
import { homePathFor } from "@/lib/adminAccess";
import type { SessionUser } from "@/components/admin/AdminSession";
import { Eye, EyeOff, Lock, Mail, User } from "lucide-react";

type Mode = "checking" | "login" | "setup";

export default function AdminLogin() {
  const router = useRouter();
  const [mode, setMode] = useState<Mode>("checking");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [show, setShow] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // Already signed in → straight in. Empty database → offer to create the owner.
  useEffect(() => {
    fetch("/api/auth/me", { cache: "no-store" })
      .then(async (res) => {
        const data = await res.json().catch(() => ({}));
        if (res.ok && data.user) router.replace(homePathFor(data.user));
        else setMode(data.needsSetup ? "setup" : "login");
      })
      .catch(() => setMode("login"));
  }, [router]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (mode === "setup") {
      if (password.length < 8) { setError("Password must be at least 8 characters."); return; }
      if (password !== confirm) { setError("Passwords do not match."); return; }
    }
    setLoading(true);
    try {
      if (mode === "setup") {
        await api("/api/auth/setup", { method: "POST", body: { name, email, password } });
        router.replace("/admin");
      } else {
        const { user } = await api<{ user: SessionUser }>("/api/auth/login", { method: "POST", body: { email, password } });
        router.replace(homePathFor(user));
      }
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Could not reach the server. Check your connection and try again.");
      setLoading(false);
    }
  }

  const inputCls = "w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:border-green-500 transition-colors";
  const labelCls = "block text-gray-700 text-xs font-semibold uppercase tracking-wider mb-2";

  return (
    <div className="min-h-screen flex items-center justify-center px-4" style={{ background: "linear-gradient(135deg, #1A2E12 0%, #2C4A1E 50%, #1A1008 100%)" }}>
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logo.png" alt="Jacmiya Safaris" className="h-20 w-auto mx-auto mb-4" />
          <h1 className="text-white text-xl font-semibold">Admin Portal</h1>
          <p className="text-white/40 text-sm mt-1">
            {mode === "setup" ? "First-time setup — create the owner account" : "Sign in to manage your website"}
          </p>
        </div>

        {mode !== "checking" && (
          <form onSubmit={handleSubmit} className="bg-white rounded-2xl p-8 shadow-2xl space-y-5">
            {mode === "setup" && (
              <div>
                <label className={labelCls}>Your Name</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input value={name} onChange={(e) => setName(e.target.value)} required className={inputCls} />
                </div>
              </div>
            )}

            <div>
              <label className={labelCls}>Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@jacmiyasafaris.com" required autoComplete="username" className={inputCls} />
              </div>
            </div>

            <div>
              <label className={labelCls}>Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type={show ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  autoComplete={mode === "setup" ? "new-password" : "current-password"}
                  className={`${inputCls} pr-10`}
                />
                <button type="button" onClick={() => setShow(!show)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600" aria-label={show ? "Hide password" : "Show password"}>
                  {show ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {mode === "setup" && (
              <div>
                <label className={labelCls}>Confirm Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input type={show ? "text" : "password"} value={confirm} onChange={(e) => setConfirm(e.target.value)} required autoComplete="new-password" className={inputCls} />
                </div>
                <p className="text-xs text-gray-400 mt-1.5">At least 8 characters. This account will have full access.</p>
              </div>
            )}

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg px-4 py-3 text-red-600 text-sm">{error}</div>
            )}

            <button
              type="submit"
              disabled={loading || !email || !password}
              className="w-full py-3 rounded-xl text-sm font-semibold text-white transition-colors disabled:opacity-60"
              style={{ backgroundColor: "#2C4A1E" }}
            >
              {loading ? "Please wait…" : mode === "setup" ? "Create Owner Account" : "Sign In"}
            </button>

            <p className="text-center text-gray-400 text-xs">Authorised access only</p>
          </form>
        )}
      </div>
    </div>
  );
}
