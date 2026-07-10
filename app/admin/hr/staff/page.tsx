"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getStaff, deleteStaff } from "@/lib/adminStore";
import type { StaffMember, Department, StaffStatus } from "@/types/admin";
import { Plus, Pencil, Trash2, Search, Phone, Mail } from "lucide-react";

const STATUS_COLORS: Record<StaffStatus, string> = {
  Active: "bg-green-100 text-green-700",
  "On Leave": "bg-amber-100 text-amber-700",
  Inactive: "bg-gray-100 text-gray-500",
};

const DEPT_COLORS: Record<Department, string> = {
  Management: "bg-purple-100 text-purple-700",
  Guides: "bg-green-100 text-green-700",
  Drivers: "bg-blue-100 text-blue-700",
  Sales: "bg-amber-100 text-amber-700",
  Operations: "bg-orange-100 text-orange-700",
  Admin: "bg-gray-100 text-gray-600",
  Hospitality: "bg-pink-100 text-pink-700",
};

export default function StaffPage() {
  const [staff, setStaff] = useState<StaffMember[]>([]);
  const [query, setQuery] = useState("");
  const [deptFilter, setDeptFilter] = useState<Department | "All">("All");
  const [statusFilter, setStatusFilter] = useState<StaffStatus | "All">("All");
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    setStaff(getStaff());
  }, []);

  if (!mounted) return <div className="p-6 text-gray-400">Loading…</div>;

  function handleDelete(id: string) {
    deleteStaff(id);
    setStaff(getStaff());
    setConfirmDelete(null);
  }

  const filtered = staff.filter((s) => {
    if (query && !s.name.toLowerCase().includes(query.toLowerCase()) && !s.role.toLowerCase().includes(query.toLowerCase())) return false;
    if (deptFilter !== "All" && s.department !== deptFilter) return false;
    if (statusFilter !== "All" && s.status !== statusFilter) return false;
    return true;
  });

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Staff Directory</h1>
          <p className="text-gray-500 text-sm">{staff.length} team members</p>
        </div>
        <Link href="/admin/hr/staff/new" className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold px-4 py-2.5 rounded-xl transition-colors">
          <Plus className="w-4 h-4" /> Add Staff
        </Link>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input type="text" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search staff…" className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm text-gray-700 placeholder-gray-400 focus:outline-none focus:border-blue-400 transition-colors" />
        </div>
        <select value={deptFilter} onChange={(e) => setDeptFilter(e.target.value as Department | "All")} className="border border-gray-200 rounded-xl px-3 py-2.5 text-sm text-gray-700 bg-white focus:outline-none focus:border-blue-400 transition-colors">
          <option value="All">All Departments</option>
          {(["Management", "Guides", "Drivers", "Sales", "Operations", "Admin", "Hospitality"] as Department[]).map((d) => <option key={d}>{d}</option>)}
        </select>
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value as StaffStatus | "All")} className="border border-gray-200 rounded-xl px-3 py-2.5 text-sm text-gray-700 bg-white focus:outline-none focus:border-blue-400 transition-colors">
          <option value="All">All Statuses</option>
          <option>Active</option><option>On Leave</option><option>Inactive</option>
        </select>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {filtered.map((member) => (
          <div key={member.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 hover:shadow-md transition-all">
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center flex-shrink-0">
                  <span className="text-white font-bold text-lg">{member.name.charAt(0)}</span>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-800 text-sm leading-snug">{member.name}</h3>
                  <p className="text-xs text-gray-500">{member.role}</p>
                </div>
              </div>
              <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${STATUS_COLORS[member.status]}`}>{member.status}</span>
            </div>

            <div className="flex flex-wrap gap-1.5 mb-3">
              <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${DEPT_COLORS[member.department]}`}>{member.department}</span>
              <span className="text-xs text-gray-400 px-2 py-0.5">Since {member.hireDate.slice(0, 4)}</span>
            </div>

            {member.bio && <p className="text-xs text-gray-500 leading-relaxed mb-3 line-clamp-2">{member.bio}</p>}

            <div className="space-y-1 mb-4">
              <a href={`tel:${member.phone}`} className="flex items-center gap-2 text-xs text-gray-500 hover:text-blue-600 transition-colors">
                <Phone className="w-3 h-3" />{member.phone}
              </a>
              <a href={`mailto:${member.email}`} className="flex items-center gap-2 text-xs text-gray-500 hover:text-blue-600 transition-colors truncate">
                <Mail className="w-3 h-3" />{member.email}
              </a>
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-gray-100">
              <span className="text-xs text-gray-400">KSH {member.salary.toLocaleString()}/mo</span>
              <div className="flex gap-1.5">
                <Link href={`/admin/hr/staff/${member.id}/edit`} className="p-1.5 rounded-lg text-gray-400 hover:text-blue-600 hover:bg-blue-50 transition-colors" title="Edit">
                  <Pencil className="w-3.5 h-3.5" />
                </Link>
                {confirmDelete === member.id ? (
                  <div className="flex items-center gap-1">
                    <button onClick={() => handleDelete(member.id)} className="text-xs bg-red-500 text-white px-2 py-0.5 rounded hover:bg-red-600 transition-colors">Yes</button>
                    <button onClick={() => setConfirmDelete(null)} className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded hover:bg-gray-200 transition-colors">No</button>
                  </div>
                ) : (
                  <button onClick={() => setConfirmDelete(member.id)} className="p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors" title="Delete">
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
        {filtered.length === 0 && (
          <div className="col-span-full text-center py-16 text-gray-400">No staff found matching your filters.</div>
        )}
      </div>
    </div>
  );
}
