"use client";

import { ADMIN_SECTIONS } from "@/lib/adminAccess";
import type { AdminSection } from "@/types/admin";

/** `value` undefined means full access; an array limits the account to those sections. */
export default function AccessPicker({ value, onChange }: {
  value: AdminSection[] | undefined;
  onChange: (next: AdminSection[] | undefined) => void;
}) {
  const limited = value !== undefined;

  function toggle(key: AdminSection) {
    const current = value ?? [];
    onChange(current.includes(key) ? current.filter((k) => k !== key) : [...current, key]);
  }

  const optionCls = (on: boolean) =>
    `px-4 py-2 rounded-xl text-sm font-semibold border transition-colors ${on ? "bg-blue-600 text-white border-blue-600" : "bg-white text-gray-600 border-gray-200 hover:border-blue-300"}`;

  return (
    <div>
      <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wider mb-1.5">Access</label>
      <div className="flex flex-wrap gap-2">
        <button type="button" onClick={() => onChange(undefined)} className={optionCls(!limited)}>Full access</button>
        <button type="button" onClick={() => onChange(value ?? [])} className={optionCls(limited)}>Selected sections only</button>
      </div>

      {limited && (
        <div className="mt-3 grid grid-cols-2 sm:grid-cols-3 gap-2">
          {ADMIN_SECTIONS.filter((s) => s.key !== "users").map((s) => (
            <label key={s.key} className="flex items-center gap-2 text-sm text-gray-700 border border-gray-200 rounded-xl px-3 py-2 cursor-pointer hover:bg-gray-50">
              <input type="checkbox" checked={value.includes(s.key)} onChange={() => toggle(s.key)} className="accent-blue-600" />
              {s.label}
            </label>
          ))}
        </div>
      )}

      <p className="text-xs text-gray-400 mt-1.5">
        {limited
          ? "They will only see the ticked sections in the menu, and land on the first one when they sign in."
          : "Can open every section, including Users and Settings. Only full-access accounts can manage users."}
      </p>
    </div>
  );
}
