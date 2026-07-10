"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getTours, getStaff, getLeave, getLeads, getSales, getExpenses } from "@/lib/adminStore";
import type { AdminTour, StaffMember, LeaveRequest, Lead, Sale, Expense } from "@/types/admin";
import { Map, Users, CalendarDays, TrendingUp, Plus, ArrowRight, Target, DollarSign, Receipt, TrendingDown } from "lucide-react";

function fmtKsh(n: number) { return `KSH ${n.toLocaleString()}`; }
function fmtUsd(n: number) { return `USD ${n.toLocaleString()}`; }

export default function AdminDashboard() {
  const [tours, setTours] = useState<AdminTour[]>([]);
  const [staff, setStaff] = useState<StaffMember[]>([]);
  const [leave, setLeave] = useState<LeaveRequest[]>([]);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [sales, setSales] = useState<Sale[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    setTours(getTours());
    setStaff(getStaff());
    setLeave(getLeave());
    setLeads(getLeads());
    setSales(getSales());
    setExpenses(getExpenses());
  }, []);

  if (!mounted) return <div className="p-6 text-gray-400">Loading…</div>;

  // P&L — current month
  const now = new Date();
  const thisMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
  const monthSales = sales.filter((s) => s.createdAt.startsWith(thisMonth));
  const monthExpenses = expenses.filter((e) => e.date.startsWith(thisMonth));
  const revenueKsh = monthSales.reduce((a, s) => a + s.amountKsh, 0);
  const revenueUsd = monthSales.reduce((a, s) => a + s.amountUsd, 0);
  const expKsh = monthExpenses.reduce((a, e) => a + e.amountKsh, 0);
  const expUsd = monthExpenses.reduce((a, e) => a + e.amountUsd, 0);
  const profitKsh = revenueKsh - expKsh;
  const profitUsd = revenueUsd - expUsd;

  // Leads stats
  const openLeads = leads.filter((l) => !["Won", "Lost"].includes(l.status)).length;
  const wonLeads = leads.filter((l) => l.status === "Won").length;
  const closedLeads = leads.filter((l) => ["Won", "Lost"].includes(l.status)).length;
  const convRate = closedLeads > 0 ? Math.round((wonLeads / closedLeads) * 100) : 0;

  const activeTours = tours.filter((t) => t.active).length;
  const activeStaff = staff.filter((s) => s.status === "Active").length;
  const onLeave = staff.filter((s) => s.status === "On Leave").length;
  const pendingLeave = leave.filter((l) => l.status === "Pending").length;

  const recentSales = [...sales].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).slice(0, 5);
  const hotLeads = leads.filter((l) => !["Won", "Lost"].includes(l.status)).sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()).slice(0, 5);
  const pendingRequests = leave.filter((l) => l.status === "Pending");

  const STATUS_COLOR: Record<string, string> = {
    New: "bg-blue-100 text-blue-700",
    Contacted: "bg-purple-100 text-purple-700",
    Quoted: "bg-amber-100 text-amber-700",
    Negotiating: "bg-orange-100 text-orange-700",
    Won: "bg-green-100 text-green-700",
    Lost: "bg-red-100 text-red-700",
  };
  const PAY_COLOR: Record<string, string> = {
    "Pending Deposit": "bg-amber-100 text-amber-700",
    "Deposit Paid": "bg-blue-100 text-blue-700",
    "Fully Paid": "bg-green-100 text-green-700",
    "Refunded": "bg-gray-100 text-gray-600",
    "Cancelled": "bg-red-100 text-red-700",
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-500 text-sm mt-0.5">Welcome back — here&apos;s what&apos;s happening at Jacmiya Safaris.</p>
      </div>

      {/* P&L Summary */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
          <div>
            <h2 className="font-semibold text-gray-800">Financial Summary</h2>
            <p className="text-xs text-gray-400 mt-0.5">Current month — {now.toLocaleString("default", { month: "long", year: "numeric" })}</p>
          </div>
          <div className="flex gap-2">
            <Link href="/admin/sales" className="text-xs text-blue-600 hover:text-blue-700 font-semibold border border-blue-200 rounded-lg px-3 py-1.5 transition-colors">Sales</Link>
            <Link href="/admin/expenses" className="text-xs text-gray-600 hover:text-gray-800 font-semibold border border-gray-200 rounded-lg px-3 py-1.5 transition-colors">Expenses</Link>
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 divide-y sm:divide-y-0 sm:divide-x divide-gray-100">
          <div className="px-6 py-5">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 bg-green-50 rounded-lg flex items-center justify-center"><TrendingUp className="w-4 h-4 text-green-600" /></div>
              <span className="text-sm font-medium text-gray-600">Revenue</span>
            </div>
            <div className="text-xl font-bold text-gray-900">{fmtKsh(revenueKsh)}</div>
            <div className="text-sm text-gray-500 mt-0.5">{fmtUsd(revenueUsd)}</div>
            <div className="text-xs text-gray-400 mt-1">{monthSales.length} booking{monthSales.length !== 1 ? "s" : ""}</div>
          </div>
          <div className="px-6 py-5">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 bg-red-50 rounded-lg flex items-center justify-center"><TrendingDown className="w-4 h-4 text-red-500" /></div>
              <span className="text-sm font-medium text-gray-600">Expenses</span>
            </div>
            <div className="text-xl font-bold text-gray-900">{fmtKsh(expKsh)}</div>
            <div className="text-sm text-gray-500 mt-0.5">{fmtUsd(expUsd)}</div>
            <div className="text-xs text-gray-400 mt-1">{monthExpenses.length} expense{monthExpenses.length !== 1 ? "s" : ""}</div>
          </div>
          <div className="px-6 py-5">
            <div className="flex items-center gap-2 mb-3">
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${profitKsh >= 0 ? "bg-emerald-50" : "bg-red-50"}`}>
                <DollarSign className={`w-4 h-4 ${profitKsh >= 0 ? "text-emerald-600" : "text-red-500"}`} />
              </div>
              <span className="text-sm font-medium text-gray-600">Net Profit</span>
            </div>
            <div className={`text-xl font-bold ${profitKsh >= 0 ? "text-emerald-700" : "text-red-600"}`}>{fmtKsh(profitKsh)}</div>
            <div className={`text-sm mt-0.5 ${profitUsd >= 0 ? "text-emerald-600" : "text-red-500"}`}>{fmtUsd(profitUsd)}</div>
            <div className="text-xs text-gray-400 mt-1">{profitKsh >= 0 ? "Profitable" : "Net loss"} this month</div>
          </div>
        </div>
      </div>

      {/* Lead stats + tour/staff stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-4">
        {[
          { label: "Open Leads", value: openLeads, icon: Target, color: "bg-purple-50 text-purple-700", href: "/admin/leads" },
          { label: "Conversion", value: `${convRate}%`, icon: TrendingUp, color: "bg-emerald-50 text-emerald-700", href: "/admin/leads" },
          { label: "Total Sales", value: sales.length, icon: DollarSign, color: "bg-blue-50 text-blue-700", href: "/admin/sales" },
          { label: "Expenses", value: expenses.length, icon: Receipt, color: "bg-orange-50 text-orange-700", href: "/admin/expenses" },
          { label: "Total Tours", value: tours.length, icon: Map, color: "bg-green-50 text-green-700", href: "/admin/tours" },
          { label: "Active Tours", value: activeTours, icon: Map, color: "bg-teal-50 text-teal-700", href: "/admin/tours" },
          { label: "Total Staff", value: staff.length, icon: Users, color: "bg-indigo-50 text-indigo-700", href: "/admin/hr/staff" },
          { label: "Pending Leave", value: pendingLeave, icon: CalendarDays, color: "bg-amber-50 text-amber-700", href: "/admin/hr/leave" },
        ].map((s) => (
          <Link key={s.label} href={s.href} className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 flex flex-col gap-2 hover:shadow-md transition-shadow lg:col-span-1 col-span-1">
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${s.color}`}><s.icon className="w-4 h-4" /></div>
            <div className="text-2xl font-bold text-gray-900">{s.value}</div>
            <div className="text-xs text-gray-500">{s.label}</div>
          </Link>
        ))}
      </div>

      {/* Quick actions */}
      <div className="flex flex-wrap gap-3">
        <Link href="/admin/leads/new" className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white text-sm font-semibold px-4 py-2.5 rounded-xl transition-colors"><Plus className="w-4 h-4" /> Add Lead</Link>
        <Link href="/admin/sales/new" className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold px-4 py-2.5 rounded-xl transition-colors"><Plus className="w-4 h-4" /> Add Booking</Link>
        <Link href="/admin/expenses/new" className="flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white text-sm font-semibold px-4 py-2.5 rounded-xl transition-colors"><Plus className="w-4 h-4" /> Log Expense</Link>
        <Link href="/admin/tours/new" className="flex items-center gap-2 bg-green-700 hover:bg-green-800 text-white text-sm font-semibold px-4 py-2.5 rounded-xl transition-colors"><Plus className="w-4 h-4" /> Add Tour</Link>
        {pendingLeave > 0 && (
          <Link href="/admin/hr/leave" className="flex items-center gap-2 bg-amber-500 hover:bg-amber-600 text-white text-sm font-semibold px-4 py-2.5 rounded-xl transition-colors">
            <CalendarDays className="w-4 h-4" /> Review Leaves <span className="bg-white/20 rounded-full px-2 py-0.5 text-xs">{pendingLeave}</span>
          </Link>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent sales */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100">
          <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
            <h2 className="font-semibold text-gray-800">Recent Bookings</h2>
            <Link href="/admin/sales" className="text-xs text-blue-600 hover:text-blue-700 flex items-center gap-1 font-medium">View all <ArrowRight className="w-3 h-3" /></Link>
          </div>
          {recentSales.length === 0 ? (
            <div className="px-5 py-10 text-center text-gray-400 text-sm">No bookings yet.</div>
          ) : (
            <div className="divide-y divide-gray-50">
              {recentSales.map((s) => (
                <div key={s.id} className="flex items-center gap-3 px-5 py-3.5">
                  <div className="w-9 h-9 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                    <span className="text-blue-700 font-bold text-sm">{s.clientName.charAt(0)}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-800 truncate">{s.clientName}</p>
                    <p className="text-xs text-gray-400 truncate">{s.tourTitle} · {s.pax} pax</p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <div className="text-xs font-semibold text-gray-800">USD {s.amountUsd.toLocaleString()}</div>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${PAY_COLOR[s.paymentStatus] ?? "bg-gray-100 text-gray-500"}`}>{s.paymentStatus}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Hot leads */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100">
          <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
            <h2 className="font-semibold text-gray-800">Active Leads</h2>
            <Link href="/admin/leads" className="text-xs text-purple-600 hover:text-purple-700 flex items-center gap-1 font-medium">View all <ArrowRight className="w-3 h-3" /></Link>
          </div>
          {hotLeads.length === 0 ? (
            <div className="px-5 py-10 text-center text-gray-400 text-sm">No active leads.</div>
          ) : (
            <div className="divide-y divide-gray-50">
              {hotLeads.map((l) => (
                <Link key={l.id} href={`/admin/leads/${l.id}`} className="flex items-center gap-3 px-5 py-3.5 hover:bg-gray-50 transition-colors block">
                  <div className="w-9 h-9 rounded-full bg-purple-100 flex items-center justify-center flex-shrink-0">
                    <span className="text-purple-700 font-bold text-sm">{l.name.charAt(0)}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-800 truncate">{l.name}</p>
                    <p className="text-xs text-gray-400 truncate">{l.destination} · {l.travelers}</p>
                  </div>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium flex-shrink-0 ${STATUS_COLOR[l.status]}`}>{l.status}</span>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Pending leave */}
      {pendingRequests.length > 0 && (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100">
          <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
            <h2 className="font-semibold text-gray-800">Pending Leave Requests</h2>
            <Link href="/admin/hr/leave" className="text-xs text-green-700 hover:text-green-800 flex items-center gap-1 font-medium">Review all <ArrowRight className="w-3 h-3" /></Link>
          </div>
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
        </div>
      )}
    </div>
  );
}
