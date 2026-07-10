"use client";

import { use, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { getStaff, updateStaff } from "@/lib/adminStore";
import type { StaffMember, Department, StaffStatus } from "@/types/admin";
import { ArrowLeft } from "lucide-react";

export default function EditStaff({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const [member, setMember] = useState<StaffMember | null>(null);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    name: "", email: "", phone: "", role: "",
    department: "Guides" as Department, status: "Active" as StaffStatus,
    hireDate: "", salary: 0, nationalId: "", emergencyContact: "", emergencyPhone: "", bio: "",
  });

  useEffect(() => {
    const found = getStaff().find((s) => s.id === id);
    if (found) {
      setMember(found);
      setForm({
        name: found.name, email: found.email, phone: found.phone, role: found.role,
        department: found.department, status: found.status, hireDate: found.hireDate,
        salary: found.salary, nationalId: found.nationalId ?? "",
        emergencyContact: found.emergencyContact ?? "", emergencyPhone: found.emergencyPhone ?? "",
        bio: found.bio ?? "",
      });
    }
  }, [id]);

  if (!member) return <div className="p-6 text-gray-400">Staff member not found.</div>;

  function set(field: string, value: string | number) {
    setForm((p) => ({ ...p, [field]: value }));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    updateStaff(id, form);
    router.push("/admin/hr/staff");
  }

  const inputCls = "w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:border-blue-400 transition-colors";
  const labelCls = "block text-xs font-semibold text-gray-600 uppercase tracking-wider mb-1.5";

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/admin/hr/staff" className="p-2 rounded-lg hover:bg-gray-100 transition-colors text-gray-500">
          <ArrowLeft className="w-4 h-4" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Edit Staff Member</h1>
          <p className="text-gray-500 text-sm">{member.name}</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        <Card title="Personal Information">
          <div className="space-y-4">
            <div>
              <label className={labelCls}>Full Name *</label>
              <input className={inputCls} value={form.name} onChange={(e) => set("name", e.target.value)} required />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={labelCls}>Email *</label>
                <input type="email" className={inputCls} value={form.email} onChange={(e) => set("email", e.target.value)} required />
              </div>
              <div>
                <label className={labelCls}>Phone *</label>
                <input type="tel" className={inputCls} value={form.phone} onChange={(e) => set("phone", e.target.value)} required />
              </div>
            </div>
            <div>
              <label className={labelCls}>National ID</label>
              <input className={inputCls} value={form.nationalId} onChange={(e) => set("nationalId", e.target.value)} />
            </div>
          </div>
        </Card>

        <Card title="Employment Details">
          <div className="space-y-4">
            <div>
              <label className={labelCls}>Role / Job Title *</label>
              <input className={inputCls} value={form.role} onChange={(e) => set("role", e.target.value)} required />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={labelCls}>Department *</label>
                <select className={inputCls} value={form.department} onChange={(e) => set("department", e.target.value)}>
                  {(["Management", "Guides", "Drivers", "Sales", "Operations", "Admin", "Hospitality"] as Department[]).map((d) => <option key={d}>{d}</option>)}
                </select>
              </div>
              <div>
                <label className={labelCls}>Status *</label>
                <select className={inputCls} value={form.status} onChange={(e) => set("status", e.target.value)}>
                  <option>Active</option><option>On Leave</option><option>Inactive</option>
                </select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={labelCls}>Hire Date *</label>
                <input type="date" className={inputCls} value={form.hireDate} onChange={(e) => set("hireDate", e.target.value)} required />
              </div>
              <div>
                <label className={labelCls}>Monthly Salary (KSH)</label>
                <input type="number" min={0} className={inputCls} value={form.salary} onChange={(e) => set("salary", Number(e.target.value))} />
              </div>
            </div>
          </div>
        </Card>

        <Card title="Emergency Contact">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelCls}>Contact Name</label>
              <input className={inputCls} value={form.emergencyContact} onChange={(e) => set("emergencyContact", e.target.value)} />
            </div>
            <div>
              <label className={labelCls}>Contact Phone</label>
              <input type="tel" className={inputCls} value={form.emergencyPhone} onChange={(e) => set("emergencyPhone", e.target.value)} />
            </div>
          </div>
        </Card>

        <Card title="Bio">
          <textarea rows={3} className={`${inputCls} resize-none`} value={form.bio} onChange={(e) => set("bio", e.target.value)} />
        </Card>

        <div className="flex gap-3 pt-2">
          <button type="submit" disabled={saving} className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-3 rounded-xl text-sm transition-colors disabled:opacity-60">
            {saving ? "Saving…" : "Save Changes"}
          </button>
          <Link href="/admin/hr/staff" className="border border-gray-200 text-gray-600 hover:bg-gray-50 font-semibold px-6 py-3 rounded-xl text-sm transition-colors">Cancel</Link>
        </div>
      </form>
    </div>
  );
}

function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
      <h2 className="font-semibold text-gray-800 mb-4 pb-3 border-b border-gray-100">{title}</h2>
      {children}
    </div>
  );
}
