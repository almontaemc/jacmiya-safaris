"use client";

import { useEffect, useState } from "react";
import { getLeave, updateLeave, addLeaveRequest, getStaff } from "@/lib/adminStore";
import type { LeaveRequest, LeaveStatus, LeaveType, StaffMember } from "@/types/admin";
import { Check, X, Plus, CalendarDays } from "lucide-react";

const STATUS_COLORS: Record<LeaveStatus, string> = {
  Pending: "bg-amber-100 text-amber-700",
  Approved: "bg-green-100 text-green-700",
  Rejected: "bg-red-100 text-red-600",
};

export default function LeaveManagement() {
  const [leave, setLeave] = useState<LeaveRequest[]>([]);
  const [staff, setStaff] = useState<StaffMember[]>([]);
  const [filter, setFilter] = useState<LeaveStatus | "All">("All");
  const [reviewNote, setReviewNote] = useState<Record<string, string>>({});
  const [showForm, setShowForm] = useState(false);
  const [newReq, setNewReq] = useState({
    staffId: "", type: "Annual" as LeaveType,
    startDate: "", endDate: "", reason: "",
  });
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    setLeave(getLeave());
    setStaff(getStaff());
  }, []);

  if (!mounted) return <div className="p-6 text-gray-400">Loading…</div>;

  function refresh() { setLeave(getLeave()); }

  function approve(id: string) {
    updateLeave(id, { status: "Approved", reviewedAt: new Date().toISOString(), reviewNote: reviewNote[id] ?? "" });
    refresh();
  }

  function reject(id: string) {
    updateLeave(id, { status: "Rejected", reviewedAt: new Date().toISOString(), reviewNote: reviewNote[id] ?? "" });
    refresh();
  }

  function calcDays(start: string, end: string): number {
    if (!start || !end) return 0;
    const diff = new Date(end).getTime() - new Date(start).getTime();
    return Math.max(1, Math.round(diff / 86400000) + 1);
  }

  function handleAddRequest(e: React.FormEvent) {
    e.preventDefault();
    const member = staff.find((s) => s.id === newReq.staffId);
    if (!member) return;
    addLeaveRequest({
      ...newReq,
      staffName: member.name,
      days: calcDays(newReq.startDate, newReq.endDate),
      status: "Pending",
    });
    setShowForm(false);
    setNewReq({ staffId: "", type: "Annual", startDate: "", endDate: "", reason: "" });
    refresh();
  }

  const filtered = filter === "All" ? leave : leave.filter((l) => l.status === filter);
  const pending = leave.filter((l) => l.status === "Pending").length;
  const inputCls = "w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:border-amber-400 transition-colors";

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Leave Requests</h1>
          <p className="text-gray-500 text-sm">{leave.length} total · {pending} pending</p>
        </div>
        <button onClick={() => setShowForm(!showForm)} className="flex items-center gap-2 bg-amber-500 hover:bg-amber-600 text-white text-sm font-semibold px-4 py-2.5 rounded-xl transition-colors">
          <Plus className="w-4 h-4" /> New Request
        </button>
      </div>

      {/* New request form */}
      {showForm && (
        <form onSubmit={handleAddRequest} className="bg-white rounded-2xl shadow-sm border border-amber-200 p-5 space-y-4">
          <h2 className="font-semibold text-gray-800 flex items-center gap-2">
            <CalendarDays className="w-4 h-4 text-amber-500" /> New Leave Request
          </h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wider mb-1.5">Staff Member *</label>
              <select className={inputCls} value={newReq.staffId} onChange={(e) => setNewReq((p) => ({ ...p, staffId: e.target.value }))} required>
                <option value="">Select staff…</option>
                {staff.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wider mb-1.5">Leave Type *</label>
              <select className={inputCls} value={newReq.type} onChange={(e) => setNewReq((p) => ({ ...p, type: e.target.value as LeaveType }))} required>
                {(["Annual", "Sick", "Personal", "Maternity", "Paternity", "Compassionate"] as LeaveType[]).map((t) => <option key={t}>{t}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wider mb-1.5">Start Date *</label>
              <input type="date" className={inputCls} value={newReq.startDate} onChange={(e) => setNewReq((p) => ({ ...p, startDate: e.target.value }))} required />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wider mb-1.5">End Date *</label>
              <input type="date" className={inputCls} value={newReq.endDate} onChange={(e) => setNewReq((p) => ({ ...p, endDate: e.target.value }))} required />
            </div>
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wider mb-1.5">Reason *</label>
            <textarea rows={2} className={`${inputCls} resize-none`} value={newReq.reason} onChange={(e) => setNewReq((p) => ({ ...p, reason: e.target.value }))} required />
          </div>
          {newReq.startDate && newReq.endDate && (
            <p className="text-xs text-amber-600 font-medium">Duration: {calcDays(newReq.startDate, newReq.endDate)} day(s)</p>
          )}
          <div className="flex gap-3">
            <button type="submit" className="bg-amber-500 hover:bg-amber-600 text-white font-semibold px-5 py-2.5 rounded-xl text-sm transition-colors">Submit Request</button>
            <button type="button" onClick={() => setShowForm(false)} className="border border-gray-200 text-gray-600 hover:bg-gray-50 font-semibold px-5 py-2.5 rounded-xl text-sm transition-colors">Cancel</button>
          </div>
        </form>
      )}

      {/* Filter tabs */}
      <div className="flex gap-2">
        {(["All", "Pending", "Approved", "Rejected"] as const).map((s) => (
          <button
            key={s}
            onClick={() => setFilter(s)}
            className={`px-4 py-2 rounded-xl text-sm font-semibold transition-colors ${filter === s ? "bg-gray-800 text-white" : "bg-white border border-gray-200 text-gray-600 hover:bg-gray-50"}`}
          >
            {s}
            {s === "Pending" && pending > 0 && <span className="ml-1.5 bg-amber-500 text-white text-xs rounded-full px-1.5 py-0.5">{pending}</span>}
          </button>
        ))}
      </div>

      {/* Requests list */}
      <div className="space-y-3">
        {filtered.map((req) => (
          <div key={req.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
            <div className="flex items-start justify-between gap-4 mb-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center flex-shrink-0">
                  <span className="text-white font-bold">{req.staffName.charAt(0)}</span>
                </div>
                <div>
                  <p className="font-semibold text-gray-800">{req.staffName}</p>
                  <p className="text-xs text-gray-500">{req.type} Leave · {req.days} day{req.days !== 1 ? "s" : ""}</p>
                </div>
              </div>
              <span className={`text-xs font-semibold px-3 py-1 rounded-full ${STATUS_COLORS[req.status]}`}>{req.status}</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-3 text-xs text-gray-500">
              <div><span className="font-medium text-gray-700 block">Start Date</span>{req.startDate}</div>
              <div><span className="font-medium text-gray-700 block">End Date</span>{req.endDate}</div>
              <div><span className="font-medium text-gray-700 block">Requested</span>{new Date(req.requestedAt).toLocaleDateString()}</div>
            </div>

            <p className="text-sm text-gray-600 bg-gray-50 rounded-xl px-4 py-2.5 mb-3">{req.reason}</p>

            {req.reviewNote && (
              <p className="text-xs text-gray-500 italic mb-3">Review note: {req.reviewNote}</p>
            )}

            {req.status === "Pending" && (
              <div className="space-y-2">
                <input
                  type="text"
                  placeholder="Add a review note (optional)…"
                  value={reviewNote[req.id] ?? ""}
                  onChange={(e) => setReviewNote((p) => ({ ...p, [req.id]: e.target.value }))}
                  className="w-full border border-gray-200 rounded-xl px-4 py-2 text-sm text-gray-700 placeholder-gray-400 focus:outline-none focus:border-amber-400 transition-colors"
                />
                <div className="flex gap-2">
                  <button onClick={() => approve(req.id)} className="flex items-center gap-1.5 bg-green-600 hover:bg-green-700 text-white text-sm font-semibold px-4 py-2 rounded-xl transition-colors">
                    <Check className="w-3.5 h-3.5" /> Approve
                  </button>
                  <button onClick={() => reject(req.id)} className="flex items-center gap-1.5 bg-red-500 hover:bg-red-600 text-white text-sm font-semibold px-4 py-2 rounded-xl transition-colors">
                    <X className="w-3.5 h-3.5" /> Reject
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}
        {filtered.length === 0 && (
          <div className="text-center py-16 text-gray-400">No leave requests in this category.</div>
        )}
      </div>
    </div>
  );
}
