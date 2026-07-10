"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getTours, getStaff, getLeave } from "@/lib/adminStore";
import type { AdminTour, StaffMember, LeaveRequest } from "@/types/admin";
import { Map, Users, CalendarDays, TrendingUp, Plus, ArrowRight } from "lucide-react";

export default function AdminDashboard() {
  const [tours, setTours] = useState<AdminTour[]>([]);
  const [staff, setStaff] = useState<StaffMember[]>([]);
  const [leave, setLeave] = useState<LeaveRequest[]>([]);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    setTours(getTours());
    setStaff(getStaff());
    setLeave(getLeave());
  }, []);

  if (!mounted) return <div className="p-6 text-gray-400">Loading…</div>;

  const activeTours = tours.filter((t) => t.active).length;
  const activeStaff = staff.filter((s) => s.status === "Active").length;
  const onLeave = staff.filter((s) => s.status === "On Leave").length;
  const pendingLeave = leave.filter((l) => l.status === "Pending").length;

  const stats = [
    { label: "Total Tours", value: tours.length, sub: `${activeTours} active`, icon: Map, color: "bg-green-50 text-green-700", accent: "bg-green-500" },
    { label: "Total Staff", value: staff.length, sub: `${activeStaff} active`, icon: Users, color: "bg-blue-50 text-blue-700", accent: "bg-blue-500" },
    { label: "On Leave", value: onLeave, sub: "staff members", icon: CalendarDays, color: "bg-amber-50 text-amber-700", accent: "bg-amber-500" },
    { label: "Pending Leaves", value: pendingLeave, sub: "awaiting review", icon: TrendingUp, color: "bg-red-50 text-red-700", accent: "bg-red-500" },
  ];

  const recentTours = [...tours].sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()).slice(0, 5);
  const pendingRequests = leave.filter((l) => l.status === "Pending");

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-500 text-sm mt-0.5">Welcome back — here&apos;s what&apos;s happening at Jacmiya Safaris.</p>
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
              <div className="text-xs font-medium text-gray-600 mt-0.5">{s.label}</div>
              <div className="text-xs text-gray-400">{s.sub}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Quick actions */}
      <div className="flex flex-wrap gap-3">
        <Link href="/admin/tours/new" className="flex items-center gap-2 bg-green-700 hover:bg-green-800 text-white text-sm font-semibold px-4 py-2.5 rounded-xl transition-colors">
          <Plus className="w-4 h-4" /> Add Tour
        </Link>
        <Link href="/admin/hr/staff/new" className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold px-4 py-2.5 rounded-xl transition-colors">
          <Plus className="w-4 h-4" /> Add Staff
        </Link>
        <Link href="/admin/hr/leave" className="flex items-center gap-2 bg-amber-500 hover:bg-amber-600 text-white text-sm font-semibold px-4 py-2.5 rounded-xl transition-colors">
          <CalendarDays className="w-4 h-4" /> Review Leaves {pendingLeave > 0 && <span className="bg-white/20 rounded-full px-2 py-0.5 text-xs">{pendingLeave}</span>}
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent tours */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100">
          <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
            <h2 className="font-semibold text-gray-800">Recent Tours</h2>
            <Link href="/admin/tours" className="text-xs text-green-700 hover:text-green-800 flex items-center gap-1 font-medium">View all <ArrowRight className="w-3 h-3" /></Link>
          </div>
          <div className="divide-y divide-gray-50">
            {recentTours.map((t) => (
              <div key={t.id} className="flex items-center gap-3 px-5 py-3.5 hover:bg-gray-50 transition-colors">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={t.image} alt={t.title} className="w-10 h-10 rounded-lg object-cover flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-800 truncate">{t.title}</p>
                  <p className="text-xs text-gray-400">{t.destination} · {t.duration}</p>
                </div>
                <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${t.active ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"}`}>
                  {t.active ? "Active" : "Hidden"}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Pending leave requests */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100">
          <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
            <h2 className="font-semibold text-gray-800">Leave Requests</h2>
            <Link href="/admin/hr/leave" className="text-xs text-green-700 hover:text-green-800 flex items-center gap-1 font-medium">Review all <ArrowRight className="w-3 h-3" /></Link>
          </div>
          {pendingRequests.length === 0 ? (
            <div className="px-5 py-10 text-center text-gray-400 text-sm">No pending leave requests.</div>
          ) : (
            <div className="divide-y divide-gray-50">
              {pendingRequests.map((r) => (
                <div key={r.id} className="flex items-center gap-3 px-5 py-3.5">
                  <div className="w-9 h-9 rounded-full bg-amber-100 flex items-center justify-center flex-shrink-0">
                    <span className="text-amber-700 font-bold text-sm">{r.staffName.charAt(0)}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-800">{r.staffName}</p>
                    <p className="text-xs text-gray-400">{r.type} · {r.days} day{r.days !== 1 ? "s" : ""} · {r.startDate}</p>
                  </div>
                  <span className="text-xs px-2 py-0.5 rounded-full font-medium bg-amber-100 text-amber-700">Pending</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Staff by department */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100">
        <div className="px-5 py-4 border-b border-gray-100">
          <h2 className="font-semibold text-gray-800">Staff by Department</h2>
        </div>
        <div className="px-5 py-4 grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
          {(["Management", "Guides", "Drivers", "Sales", "Operations", "Admin", "Hospitality"] as const).map((dept) => {
            const count = staff.filter((s) => s.department === dept).length;
            return (
              <div key={dept} className="text-center p-3 rounded-xl bg-gray-50">
                <div className="text-xl font-bold text-gray-800">{count}</div>
                <div className="text-xs text-gray-500 mt-0.5">{dept}</div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
