"use client";

import { useState, useEffect, useRef } from "react";
import {
  getSettings, saveSettings, getExchangeRate, setExchangeRate,
  getAdminPassword, changeAdminPassword, exportAllData, importAllData,
} from "@/lib/adminStore";
import type { AppSettings } from "@/types/admin";
import { Building2, Lock, RefreshCw, Database, CheckCircle, AlertCircle, Download, Upload } from "lucide-react";

const TABS = ["General", "Security", "Exchange Rate", "Backup & Restore"] as const;
type Tab = typeof TABS[number];

export default function SettingsPage() {
  const [tab, setTab] = useState<Tab>("General");
  const [mounted, setMounted] = useState(false);
  const [saved, setSaved] = useState(false);

  // General
  const [settings, setSettings] = useState<AppSettings>({
    companyName: "", companyEmail: "", companyPhone: "",
    companyAddress: "", companyWebsite: "", tagline: "",
  });

  // Security
  const [currentPwd, setCurrentPwd] = useState("");
  const [newPwd, setNewPwd] = useState("");
  const [confirmPwd, setConfirmPwd] = useState("");
  const [pwdError, setPwdError] = useState("");
  const [pwdSuccess, setPwdSuccess] = useState(false);

  // Exchange rate
  const [rate, setRate] = useState(129);
  const [rateSaved, setRateSaved] = useState(false);

  // Backup
  const [importError, setImportError] = useState("");
  const [importSuccess, setImportSuccess] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setMounted(true);
    setSettings(getSettings());
    setRate(getExchangeRate());
  }, []);

  if (!mounted) return <div className="p-6 text-gray-400">Loading…</div>;

  function handleSaveGeneral(e: React.FormEvent) {
    e.preventDefault();
    saveSettings(settings);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  }

  function handleChangePassword(e: React.FormEvent) {
    e.preventDefault();
    setPwdError("");
    if (currentPwd !== getAdminPassword()) { setPwdError("Current password is incorrect."); return; }
    if (newPwd.length < 8) { setPwdError("New password must be at least 8 characters."); return; }
    if (newPwd !== confirmPwd) { setPwdError("Passwords do not match."); return; }
    changeAdminPassword(newPwd);
    setCurrentPwd(""); setNewPwd(""); setConfirmPwd("");
    setPwdSuccess(true);
    setTimeout(() => setPwdSuccess(false), 3000);
  }

  function handleSaveRate(e: React.FormEvent) {
    e.preventDefault();
    setExchangeRate(rate);
    setRateSaved(true);
    setTimeout(() => setRateSaved(false), 3000);
  }

  function handleExport() {
    const json = exportAllData();
    const blob = new Blob([json], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `jacmiya-backup-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }

  function handleImport(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const json = ev.target?.result as string;
        importAllData(json);
        setImportSuccess(true);
        setImportError("");
        setTimeout(() => { setImportSuccess(false); window.location.reload(); }, 2000);
      } catch {
        setImportError("Invalid backup file. Please select a valid Jacmiya backup JSON.");
      }
    };
    reader.readAsText(file);
  }

  const inputCls = "w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:border-emerald-400 transition-colors";
  const labelCls = "block text-xs font-semibold text-gray-600 uppercase tracking-wider mb-1.5";

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
        <p className="text-gray-500 text-sm mt-0.5">Manage company information, security, and system preferences</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-gray-100 p-1 rounded-xl w-fit">
        {TABS.map((t) => (
          <button key={t} onClick={() => setTab(t)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${tab === t ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-700"}`}>
            {t}
          </button>
        ))}
      </div>

      {/* General */}
      {tab === "General" && (
        <form onSubmit={handleSaveGeneral} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 space-y-5">
          <div className="flex items-center gap-3 mb-1">
            <div className="w-8 h-8 bg-emerald-50 rounded-lg flex items-center justify-center">
              <Building2 className="w-4 h-4 text-emerald-600" />
            </div>
            <h2 className="font-semibold text-gray-800">Company Information</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className={labelCls}>Company Name</label>
              <input value={settings.companyName} onChange={(e) => setSettings({ ...settings, companyName: e.target.value })} className={inputCls} placeholder="Jacmiya Safaris" />
            </div>
            <div>
              <label className={labelCls}>Tagline</label>
              <input value={settings.tagline} onChange={(e) => setSettings({ ...settings, tagline: e.target.value })} className={inputCls} placeholder="Discover the Wild Heart of Africa" />
            </div>
            <div>
              <label className={labelCls}>Email</label>
              <input type="email" value={settings.companyEmail} onChange={(e) => setSettings({ ...settings, companyEmail: e.target.value })} className={inputCls} placeholder="info@jacmiyasafaris.com" />
            </div>
            <div>
              <label className={labelCls}>Phone</label>
              <input value={settings.companyPhone} onChange={(e) => setSettings({ ...settings, companyPhone: e.target.value })} className={inputCls} placeholder="+254 716 482 995" />
            </div>
            <div>
              <label className={labelCls}>Address</label>
              <input value={settings.companyAddress} onChange={(e) => setSettings({ ...settings, companyAddress: e.target.value })} className={inputCls} placeholder="Nairobi, Kenya" />
            </div>
            <div>
              <label className={labelCls}>Website</label>
              <input value={settings.companyWebsite} onChange={(e) => setSettings({ ...settings, companyWebsite: e.target.value })} className={inputCls} placeholder="https://jacmiyasafaris.com" />
            </div>
          </div>
          <div className="flex items-center gap-3 pt-2">
            <button type="submit" className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold px-6 py-2.5 rounded-xl text-sm transition-colors">Save Changes</button>
            {saved && (
              <span className="flex items-center gap-1.5 text-emerald-600 text-sm font-medium">
                <CheckCircle className="w-4 h-4" /> Saved
              </span>
            )}
          </div>
        </form>
      )}

      {/* Security */}
      {tab === "Security" && (
        <form onSubmit={handleChangePassword} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 space-y-5">
          <div className="flex items-center gap-3 mb-1">
            <div className="w-8 h-8 bg-blue-50 rounded-lg flex items-center justify-center">
              <Lock className="w-4 h-4 text-blue-600" />
            </div>
            <h2 className="font-semibold text-gray-800">Change Admin Password</h2>
          </div>
          <div className="space-y-4 max-w-sm">
            <div>
              <label className={labelCls}>Current Password</label>
              <input type="password" value={currentPwd} onChange={(e) => setCurrentPwd(e.target.value)} className={inputCls} required />
            </div>
            <div>
              <label className={labelCls}>New Password</label>
              <input type="password" value={newPwd} onChange={(e) => setNewPwd(e.target.value)} className={inputCls} required minLength={8} />
              <p className="text-xs text-gray-400 mt-1">Minimum 8 characters</p>
            </div>
            <div>
              <label className={labelCls}>Confirm New Password</label>
              <input type="password" value={confirmPwd} onChange={(e) => setConfirmPwd(e.target.value)} className={inputCls} required />
            </div>
          </div>
          {pwdError && (
            <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 text-sm">
              <AlertCircle className="w-4 h-4 flex-shrink-0" /> {pwdError}
            </div>
          )}
          {pwdSuccess && (
            <div className="flex items-center gap-2 bg-green-50 border border-green-200 text-green-700 rounded-xl px-4 py-3 text-sm">
              <CheckCircle className="w-4 h-4 flex-shrink-0" /> Password changed successfully.
            </div>
          )}
          <button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-2.5 rounded-xl text-sm transition-colors">Update Password</button>
        </form>
      )}

      {/* Exchange Rate */}
      {tab === "Exchange Rate" && (
        <form onSubmit={handleSaveRate} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 space-y-5">
          <div className="flex items-center gap-3 mb-1">
            <div className="w-8 h-8 bg-amber-50 rounded-lg flex items-center justify-center">
              <RefreshCw className="w-4 h-4 text-amber-600" />
            </div>
            <h2 className="font-semibold text-gray-800">USD / KSH Exchange Rate</h2>
          </div>
          <p className="text-sm text-gray-500">This rate is used across the entire admin system for price auto-conversion, reporting, and payroll calculations.</p>
          <div className="flex items-end gap-4 max-w-xs">
            <div className="flex-1">
              <label className={labelCls}>1 USD = ? KSH</label>
              <input
                type="number"
                min={1}
                step="0.01"
                value={rate}
                onChange={(e) => setRate(Number(e.target.value))}
                className={inputCls}
              />
            </div>
          </div>
          <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 text-sm text-amber-800">
            Currently: <strong>1 USD = {getExchangeRate()} KSH</strong>. Update this whenever the rate changes significantly.
          </div>
          <div className="flex items-center gap-3">
            <button type="submit" className="bg-amber-500 hover:bg-amber-600 text-white font-semibold px-6 py-2.5 rounded-xl text-sm transition-colors">Save Rate</button>
            {rateSaved && (
              <span className="flex items-center gap-1.5 text-emerald-600 text-sm font-medium">
                <CheckCircle className="w-4 h-4" /> Rate updated
              </span>
            )}
          </div>
        </form>
      )}

      {/* Backup & Restore */}
      {tab === "Backup & Restore" && (
        <div className="space-y-4">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-8 h-8 bg-purple-50 rounded-lg flex items-center justify-center">
                <Database className="w-4 h-4 text-purple-600" />
              </div>
              <h2 className="font-semibold text-gray-800">Export Data</h2>
            </div>
            <p className="text-sm text-gray-500 mb-4">Download a complete backup of all system data — tours, leads, sales, expenses, staff, payroll, and reviews — as a JSON file. Store it safely.</p>
            <button onClick={handleExport} className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white font-semibold px-5 py-2.5 rounded-xl text-sm transition-colors">
              <Download className="w-4 h-4" /> Download Backup
            </button>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-8 h-8 bg-orange-50 rounded-lg flex items-center justify-center">
                <Upload className="w-4 h-4 text-orange-600" />
              </div>
              <h2 className="font-semibold text-gray-800">Restore from Backup</h2>
            </div>
            <p className="text-sm text-gray-500 mb-1">Upload a previously exported JSON backup file to restore all data. <strong className="text-red-600">This will overwrite all current data.</strong></p>
            <p className="text-xs text-gray-400 mb-4">Only use a backup file generated by this system.</p>
            <input ref={fileRef} type="file" accept=".json" onChange={handleImport} className="hidden" />
            <button onClick={() => fileRef.current?.click()} className="flex items-center gap-2 border border-orange-300 text-orange-600 hover:bg-orange-50 font-semibold px-5 py-2.5 rounded-xl text-sm transition-colors">
              <Upload className="w-4 h-4" /> Choose Backup File
            </button>
            {importError && (
              <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 text-sm mt-3">
                <AlertCircle className="w-4 h-4 flex-shrink-0" /> {importError}
              </div>
            )}
            {importSuccess && (
              <div className="flex items-center gap-2 bg-green-50 border border-green-200 text-green-700 rounded-xl px-4 py-3 text-sm mt-3">
                <CheckCircle className="w-4 h-4 flex-shrink-0" /> Data restored successfully. Reloading…
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
