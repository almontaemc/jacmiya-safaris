"use client";

import { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import { getStaff, getLeave } from "@/lib/adminStore";
import type { StaffMember, LeaveRequest, AppSettings } from "@/types/admin";
import { downloadCSV, downloadExcel, fmtDate, fmtK } from "@/lib/reportUtils";
import { ArrowLeft, Printer, FileText, FileSpreadsheet } from "lucide-react";

const DEPARTMENTS = ["Management", "Guides", "Drivers", "Sales", "Operations", "Admin"];

const LEAVE_STATUS_CLS: Record<string, string> = {
  Approved: "bg-green-100 text-green-700",
  Pending: "bg-amber-100 text-amber-700",
  Rejected: "bg-red-100 text-red-700",
};

const STAFF_STATUS_CLS: Record<string, string> = {
  Active: "bg-green-100 text-green-700",
  "On Leave": "bg-amber-100 text-amber-700",
  Inactive: "bg-red-100 text-red-700",
};

export default function HRReportPage() {
  const [staff, setStaff] = useState<StaffMember[]>([]);
  const [leave, setLeave] = useState<LeaveRequest[]>([]);
  const [deptFilter, setDeptFilter] = useState("All");
  const [staffStatusFilter, setStaffStatusFilter] = useState("All");
  const [leaveStatusFilter, setLeaveStatusFilter] = useState("All");
  const [settings, setSettings] = useState<AppSettings | null>(null);

  useEffect(() => {
    setStaff(getStaff());
    setLeave(getLeave());
    import("@/lib/adminStore").then((m) => setSettings(m.getSettings()));
  }, []);

  const filteredStaff = useMemo(() =>
    staff.filter((s) =>
      (deptFilter === "All" || s.department === deptFilter) &&
      (staffStatusFilter === "All" || s.status === staffStatusFilter)
    ), [staff, deptFilter, staffStatusFilter]);

  const filteredLeave = useMemo(() =>
    leave.filter((l) =>
      (deptFilter === "All" || staff.find((s) => s.id === l.staffId)?.department === deptFilter) &&
      (leaveStatusFilter === "All" || l.status === leaveStatusFilter)
    ), [leave, staff, deptFilter, leaveStatusFilter]);

  const totalSalaryKsh = filteredStaff.filter((s) => s.status === "Active").reduce((a, s) => a + s.salary, 0);
  const activeCount = filteredStaff.filter((s) => s.status === "Active").length;
  const onLeaveCount = filteredStaff.filter((s) => s.status === "On Leave").length;
  const totalLeaveDays = filteredLeave.filter((l) => l.status === "Approved").reduce((a, l) => a + l.days, 0);

  const companyName = settings?.companyName ?? "Jacmiya Safaris";
  const now = new Date().toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" });

  // Dept breakdown
  const deptCounts: Record<string, { count: number; salary: number }> = {};
  filteredStaff.forEach((s) => {
    if (!deptCounts[s.department]) deptCounts[s.department] = { count: 0, salary: 0 };
    deptCounts[s.department].count += 1;
    if (s.status === "Active") deptCounts[s.department].salary += s.salary;
  });

  // Staff CSV data
  const STAFF_HEADERS = ["Name", "Email", "Phone", "Role", "Department", "Status", "Hire Date", "Monthly Salary (KSH)"];
  const STAFF_ROWS: (string | number)[][] = filteredStaff.map((s) => [
    s.name, s.email, s.phone, s.role, s.department, s.status, s.hireDate, s.salary,
  ]);

  // Leave CSV data
  const LEAVE_HEADERS = ["Staff Name", "Leave Type", "Start Date", "End Date", "Days", "Reason", "Status", "Requested Date"];
  const LEAVE_ROWS: (string | number)[][] = filteredLeave.map((l) => [
    l.staffName, l.type, l.startDate, l.endDate, l.days, l.reason, l.status, fmtDate(l.requestedAt),
  ]);

  // Combined export
  const COMBINED_ROWS: (string | number)[][] = [
    ["=== STAFF ROSTER ==="], STAFF_HEADERS, ...STAFF_ROWS,
    [], ["=== LEAVE REQUESTS ==="], LEAVE_HEADERS, ...LEAVE_ROWS,
  ];

  return (
    <div className="space-y-6">
      {/* Screen header */}
      <div className="flex items-center gap-3 print:hidden">
        <Link href="/admin/reports" className="p-2 rounded-lg hover:bg-gray-100 text-gray-500">
          <ArrowLeft className="w-4 h-4" />
        </Link>
        <div className="flex-1">
          <div className="text-xs text-gray-400 mb-0.5">Reports</div>
          <h1 className="text-2xl font-bold text-gray-900">HR Report</h1>
        </div>
      </div>

      {/* Print header */}
      <div className="hidden print:block border-b border-gray-300 pb-5 mb-6">
        <div className="flex justify-between items-start">
          <div className="flex items-center gap-4">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/logo.png" alt={companyName} style={{ height: 56, width: "auto", background: "#fff" }} />
            <div>
              <h1 className="text-xl font-bold text-gray-900">{companyName}</h1>
              <h2 className="text-base font-semibold text-gray-600 mt-0.5">Human Resources Report</h2>
            </div>
          </div>
          <div className="text-right text-sm text-gray-500">
            <div>Generated: {now}</div>
            {deptFilter !== "All" && <div>Department: {deptFilter}</div>}
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3 print:hidden">
        <select value={deptFilter} onChange={(e) => setDeptFilter(e.target.value)}
          className="border border-gray-200 rounded-xl px-3 py-2 text-sm text-gray-700 focus:outline-none focus:border-amber-400">
          <option value="All">All Departments</option>
          {DEPARTMENTS.map((d) => <option key={d}>{d}</option>)}
        </select>
        <select value={staffStatusFilter} onChange={(e) => setStaffStatusFilter(e.target.value)}
          className="border border-gray-200 rounded-xl px-3 py-2 text-sm text-gray-700 focus:outline-none focus:border-amber-400">
          <option value="All">All Staff Status</option>
          <option>Active</option>
          <option>On Leave</option>
          <option>Inactive</option>
        </select>
        <select value={leaveStatusFilter} onChange={(e) => setLeaveStatusFilter(e.target.value)}
          className="border border-gray-200 rounded-xl px-3 py-2 text-sm text-gray-700 focus:outline-none focus:border-amber-400">
          <option value="All">All Leave Status</option>
          <option>Approved</option>
          <option>Pending</option>
          <option>Rejected</option>
        </select>
      </div>

      {/* Download buttons */}
      <div className="flex flex-wrap items-center gap-2 print:hidden">
        <button onClick={() => window.print()}
          className="flex items-center gap-2 border border-gray-200 hover:bg-gray-50 text-gray-700 text-sm font-semibold px-4 py-2.5 rounded-xl transition-colors">
          <Printer className="w-4 h-4" /> Print / PDF
        </button>
        <span className="text-xs text-gray-400">Staff:</span>
        <button onClick={() => downloadCSV("jacmiya-staff-report.csv", STAFF_HEADERS, STAFF_ROWS)}
          className="flex items-center gap-2 border border-gray-200 hover:bg-gray-50 text-gray-700 text-sm font-semibold px-4 py-2.5 rounded-xl transition-colors">
          <FileText className="w-4 h-4" /> CSV
        </button>
        <button onClick={() => downloadExcel("jacmiya-staff-report.xls", "Staff Roster", STAFF_HEADERS, STAFF_ROWS)}
          className="flex items-center gap-2 bg-amber-600 hover:bg-amber-700 text-white text-sm font-semibold px-4 py-2.5 rounded-xl transition-colors">
          <FileSpreadsheet className="w-4 h-4" /> Excel
        </button>
        <span className="text-xs text-gray-400">Leave:</span>
        <button onClick={() => downloadCSV("jacmiya-leave-report.csv", LEAVE_HEADERS, LEAVE_ROWS)}
          className="flex items-center gap-2 border border-gray-200 hover:bg-gray-50 text-gray-700 text-sm font-semibold px-4 py-2.5 rounded-xl transition-colors">
          <FileText className="w-4 h-4" /> CSV
        </button>
        <button onClick={() => downloadExcel("jacmiya-leave-report.xls", "Leave Requests", LEAVE_HEADERS, LEAVE_ROWS)}
          className="flex items-center gap-2 border border-amber-200 bg-amber-50 hover:bg-amber-100 text-amber-700 text-sm font-semibold px-4 py-2.5 rounded-xl transition-colors">
          <FileSpreadsheet className="w-4 h-4" /> Excel
        </button>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: "Total Staff", value: String(filteredStaff.length), sub: `${activeCount} active, ${onLeaveCount} on leave` },
          { label: "Monthly Wage Bill", value: `KSH ${fmtK(totalSalaryKsh)}`, sub: "Active staff only" },
          { label: "Leave Requests", value: String(filteredLeave.length), sub: `${filteredLeave.filter((l) => l.status === "Pending").length} pending approval` },
          { label: "Total Leave Days", value: String(totalLeaveDays), sub: "Approved leave days" },
        ].map((c) => (
          <div key={c.label} className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
            <div className="text-xl font-bold text-gray-900">{c.value}</div>
            <div className="text-xs text-gray-500 mt-0.5">{c.label}</div>
            <div className="text-xs text-gray-400 mt-0.5">{c.sub}</div>
          </div>
        ))}
      </div>

      {/* Department breakdown */}
      {Object.keys(deptCounts).length > 0 && (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
          <h2 className="font-semibold text-gray-800 mb-4">Staff by Department</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100">
                  {["Department", "Staff Count", "Monthly Salary Bill (KSH)"].map((h) => (
                    <th key={h} className="text-left px-4 py-2.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {Object.entries(deptCounts).sort((a, b) => b[1].count - a[1].count).map(([dept, { count, salary }]) => (
                  <tr key={dept} className="hover:bg-gray-50">
                    <td className="px-4 py-3 font-medium text-gray-900">{dept}</td>
                    <td className="px-4 py-3 text-gray-600">{count} staff</td>
                    <td className="px-4 py-3 text-gray-700 font-semibold">{salary.toLocaleString()}</td>
                  </tr>
                ))}
                <tr className="border-t-2 border-gray-200 font-bold bg-gray-50">
                  <td className="px-4 py-3 text-gray-700">TOTAL</td>
                  <td className="px-4 py-3">{filteredStaff.length}</td>
                  <td className="px-4 py-3">{totalSalaryKsh.toLocaleString()}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Staff roster table */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-100">
          <h2 className="font-semibold text-gray-800">Staff Roster — {filteredStaff.length} member{filteredStaff.length !== 1 ? "s" : ""}</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                {["Name", "Role", "Department", "Status", "Hire Date", "Salary (KSH/mo)"].map((h) => (
                  <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filteredStaff.length === 0 ? (
                <tr><td colSpan={6} className="text-center py-12 text-gray-400 text-sm">No staff match the selected filters.</td></tr>
              ) : filteredStaff.map((s) => (
                <tr key={s.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3">
                    <div className="font-medium text-gray-900">{s.name}</div>
                    <div className="text-xs text-gray-400">{s.email}</div>
                  </td>
                  <td className="px-4 py-3 text-gray-600 text-xs">{s.role}</td>
                  <td className="px-4 py-3">
                    <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">{s.department}</span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`text-xs font-semibold px-2 py-1 rounded-full ${STAFF_STATUS_CLS[s.status] ?? "bg-gray-100 text-gray-600"}`}>
                      {s.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-xs text-gray-500 whitespace-nowrap">{s.hireDate}</td>
                  <td className="px-4 py-3 text-right font-semibold text-gray-900">{s.salary.toLocaleString()}</td>
                </tr>
              ))}
              {filteredStaff.length > 0 && (
                <tr className="border-t-2 border-gray-200 bg-gray-50 font-bold">
                  <td colSpan={5} className="px-4 py-3 text-gray-700 text-sm">Monthly Wage Bill (Active)</td>
                  <td className="px-4 py-3 text-right text-gray-900">{totalSalaryKsh.toLocaleString()}</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Leave requests table */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-100">
          <h2 className="font-semibold text-gray-800">Leave Requests — {filteredLeave.length} request{filteredLeave.length !== 1 ? "s" : ""}</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                {["Staff Name", "Type", "Start Date", "End Date", "Days", "Reason", "Status", "Requested"].map((h) => (
                  <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filteredLeave.length === 0 ? (
                <tr><td colSpan={8} className="text-center py-12 text-gray-400 text-sm">No leave requests match the selected filters.</td></tr>
              ) : filteredLeave.sort((a, b) => b.requestedAt.localeCompare(a.requestedAt)).map((l) => (
                <tr key={l.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3 font-medium text-gray-900 whitespace-nowrap">{l.staffName}</td>
                  <td className="px-4 py-3">
                    <span className="text-xs bg-gray-100 text-gray-700 px-2 py-0.5 rounded-full">{l.type}</span>
                  </td>
                  <td className="px-4 py-3 text-xs text-gray-600 whitespace-nowrap">{l.startDate}</td>
                  <td className="px-4 py-3 text-xs text-gray-600 whitespace-nowrap">{l.endDate}</td>
                  <td className="px-4 py-3 text-center font-semibold text-gray-700">{l.days}</td>
                  <td className="px-4 py-3 text-xs text-gray-500 max-w-[160px]">
                    <div className="truncate">{l.reason}</div>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`text-xs font-semibold px-2 py-1 rounded-full ${LEAVE_STATUS_CLS[l.status] ?? "bg-gray-100 text-gray-600"}`}>
                      {l.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-xs text-gray-400 whitespace-nowrap">{fmtDate(l.requestedAt)}</td>
                </tr>
              ))}
              {filteredLeave.length > 0 && (
                <tr className="border-t-2 border-gray-200 bg-gray-50 font-bold">
                  <td colSpan={4} className="px-4 py-3 text-gray-700 text-sm">Total Approved Days</td>
                  <td className="px-4 py-3 text-center text-gray-900">{totalLeaveDays}</td>
                  <td colSpan={3} />
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="pb-8 print:hidden">
        <Link href="/admin/reports" className="border border-gray-200 text-gray-600 hover:bg-gray-50 font-semibold px-6 py-3 rounded-xl text-sm transition-colors">
          ← Back to Reports
        </Link>
      </div>
    </div>
  );
}
