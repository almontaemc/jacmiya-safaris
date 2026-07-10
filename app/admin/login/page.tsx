"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { checkPassword, login } from "@/lib/adminStore";
import { Eye, EyeOff, Lock } from "lucide-react";

export default function AdminLogin() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [show, setShow] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    setTimeout(() => {
      if (checkPassword(password)) {
        login();
        router.replace("/admin");
      } else {
        setError("Incorrect password. Please try again.");
        setLoading(false);
      }
    }, 400);
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4" style={{ background: "linear-gradient(135deg, #1A2E12 0%, #2C4A1E 50%, #1A1008 100%)" }}>
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logo.png" alt="Jacmiya Safaris" className="h-20 w-auto mx-auto mb-4" />
          <h1 className="text-white text-xl font-semibold">Admin Portal</h1>
          <p className="text-white/40 text-sm mt-1">Sign in to manage your website</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-white rounded-2xl p-8 shadow-2xl">
          <div className="mb-5">
            <label className="block text-gray-700 text-xs font-semibold uppercase tracking-wider mb-2">
              Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type={show ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter admin password"
                required
                className="w-full pl-10 pr-10 py-3 border border-gray-200 rounded-xl text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:border-green-500 transition-colors"
              />
              <button
                type="button"
                onClick={() => setShow(!show)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {show ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {error && (
            <div className="mb-4 bg-red-50 border border-red-200 rounded-lg px-4 py-3 text-red-600 text-sm">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading || !password}
            className="w-full py-3 rounded-xl text-sm font-semibold text-white transition-colors disabled:opacity-60"
            style={{ backgroundColor: "#2C4A1E" }}
          >
            {loading ? "Signing in…" : "Sign In"}
          </button>

          <p className="text-center text-gray-400 text-xs mt-5">
            Default password: <span className="font-mono">Jacmiya@2026</span>
          </p>
        </form>
      </div>
    </div>
  );
}
