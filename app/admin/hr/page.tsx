"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getStaff, getLeave } from "@/lib/adminStore";
import type { StaffMember, LeaveRequest, Department } from "@/types/admin";
import { Users, CalendarDays, UserCheck, UserX, ArrowRight, Plus } from "lucide-react";

const DEPTS: Department[] = ["Management", "Guides", "Drivers", "Sales", "Operations", "Admin", "Hospitality"];
const DEPT_COLORS: Record<Department, string> = {
  Management: "bg-purple-100 text-purple-700",
  Guides: "bg-green-100 text-green-700",
  Drivers: "bg-blue-100 text-blue-700",
  Sales: "bg-amber-100 text-amber-700",
  Operations: "bg-orange-100 text-orange-700",
  Admin: "bg-gray-100 text-gray-600",
  Hospitality: "bg-pink-100 text-pink-700",
};

export default function HROverview() {
  const [staff, setStaff] = useState<StaffMember[]>([]);
  const [leave, setLeave] = useState<LeaveRequest[]>([]);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    setStaff(getStaff());
    setLeave(getLeave());
  }, []);

  if (!mounted) return <div className="p-6 text-gray-400">Loading…</div>;

  const active = staff.filter((s) => s.status === "Active").length;
  const onLeave = staff.filter((s) => s.status === "On Leave").length;
  const inactive = staff.filter((s) => s.status === "Inactive").length;
  const pending = leave.filter((l) => l.status === "Pending").length;

  const stats = [
    { label: "Total Staff", value: staff.length, icon: Users, color: "bg-blue-50 text-blue-700" },
    { label: "Active", value: active, icon: UserCheck, color: "bg-green-50 text-green-700" },
    { label: "On Leave", value: onLeave, icon: CalendarDays, color: "bg-amber-50 text-amber-700" },
    { label: "Inactive", value: inactive, icon: UserX, color: "bg-gray-50 text-gray-600" },
  ];

  const recentLeave = [...leave].sort((a, b) => new Date(b.requestedAt).getTime() - new Date(a.requestedAt).getTime()).slice(0, 5);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Human Resources</h1>
          <p className="text-gray-500 text-sm mt-0.5">Overview of your team and leave management</p>
        </div>
        <Link href="/admin/hr/staff/new" className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold px-4 py-2.5 rounded-xl transition-colors">
          <Plus className="w-4 h-4" /> Add Staff
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((s) => (
          <div key={s.label} className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 flex items-start gap-4">
            <div className={`w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 ${s.color}`}>
              <s.icon className="w-5 h-5" />
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-900">{s.value}</div>
              <div className="text-xs font-medium text-gray-500 mt-0.5">{s.label}</div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Dept breakdown */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100">
          <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
            <h2 className="font-semibold text-gray-800">Staff by Department</h2>
            <Link href="/admin/hr/staff" className="text-xs text-blue-600 hover:text-blue-700 flex items-center gap-1 font-medium">
              View all <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
          <div className="p-5 space-y-3">
            {DEPTS.map((dept) => {
              const count = staff.filter((s) => s.department === dept).length;
              const pct = staff.length ? Math.round((count / staff.length) * 100) : 0;
              return (
                <div key={dept}>
                  <div className="flex items-center justify-between mb-1">
                    <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${DEPT_COLORS[dept]}`}>{dept}</span>
                    <span className="text-xs text-gray-500">{count} staff</span>
                  </div>
                  <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                    <div className="h-full bg-blue-400 rounded-full transition-all" style={{ width: `${pct}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Recent leave */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100">
          <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
            <h2 className="font-semibold text-gray-800">
              Recent Leave Requests
              {pending > 0 && <span className="ml-2 bg-amber-100 text-amber-700 text-xs font-semibold px-2 py-0.5 rounded-full">{pending} pending</span>}
            </h2>
            <Link href="/admin/hr/leave" className="text-xs text-blue-600 hover:text-blue-700 flex items-center gap-1 font-medium">
              Review <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
          <div className="divide-y divide-gray-50">
            {recentLeave.map((r) => (
              <div key={r.id} className="flex items-center gap-3 px-5 py-3.5">
                <div className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0">
                  <span className="text-gray-600 font-bold text-sm">{r.staffName.charAt(0)}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-800">{r.staffName}</p>
                  <p className="text-xs text-gray-400">{r.type} · {r.days} day{r.days !== 1 ? "s" : ""} · from {r.startDate}</p>
                </div>
                <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                  r.status === "Approved" ? "bg-green-100 text-green-700" :
                  r.status === "Rejected" ? "bg-red-100 text-red-600" :
                  "bg-amber-100 text-amber-700"
                }`}>{r.status}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Quick links */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Link href="/admin/hr/staff" className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 hover:border-blue-200 hover:shadow-md transition-all group">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-semibold text-gray-800 mb-1">Staff Directory</p>
              <p className="text-sm text-gray-500">Manage employee records, roles, and contact info</p>
            </div>
            <ArrowRight className="w-5 h-5 text-gray-300 group-hover:text-blue-500 transition-colors" />
          </div>
        </Link>
        <Link href="/admin/hr/leave" className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 hover:border-amber-200 hover:shadow-md transition-all group">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-semibold text-gray-800 mb-1">Leave Management</p>
              <p className="text-sm text-gray-500">Review, approve, and reject leave requests</p>
            </div>
            <ArrowRight className="w-5 h-5 text-gray-300 group-hover:text-amber-500 transition-colors" />
          </div>
        </Link>
      </div>
    </div>
  );
}
