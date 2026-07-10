"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getSales, getExpenses, getLeads, getTours } from "@/lib/adminStore";
import type { Sale, Expense, Lead, AdminTour } from "@/types/admin";
import { TrendingUp, TrendingDown, DollarSign, Target, BarChart2, FileBarChart2, Receipt, Users, ArrowRight } from "lucide-react";

function fmtK(n: number) {
  if (n >= 1000000) return `${(n / 1000000).toFixed(1)}M`;
  if (n >= 1000) return `${(n / 1000).toFixed(0)}K`;
  return String(n);
}

function getLast6Months() {
  const months: { value: string; label: string }[] = [];
  const now = new Date();
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    months.push({
      value: `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`,
      label: d.toLocaleString("default", { month: "short", year: "2-digit" }),
    });
  }
  return months;
}

function BarChart({ data, maxVal, colorClass }: { data: number[]; maxVal: number; colorClass: string }) {
  return (
    <div className="flex items-end gap-2 h-28">
      {data.map((v, i) => {
        const pct = maxVal > 0 ? (v / maxVal) * 100 : 0;
        return (
          <div key={i} className="flex-1 flex flex-col items-center gap-1">
            <div className="w-full flex flex-col justify-end" style={{ height: "100px" }}>
              <div className={`w-full rounded-t-md ${colorClass}`} style={{ height: `${Math.max(pct, 2)}%` }} />
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default function ReportsPage() {
  const [sales, setSales] = useState<Sale[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [tours, setTours] = useState<AdminTour[]>([]);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    setSales(getSales());
    setExpenses(getExpenses());
    setLeads(getLeads());
    setTours(getTours());
  }, []);

  if (!mounted) return <div className="p-6 text-gray-400">Loading…</div>;

  const months = getLast6Months();

  // Monthly revenue & expense data
  const monthlyRevenue = months.map((m) =>
    sales.filter((s) => s.createdAt.startsWith(m.value)).reduce((a, s) => a + s.amountKsh, 0)
  );
  const monthlyExpenses = months.map((m) =>
    expenses.filter((e) => e.date.startsWith(m.value)).reduce((a, e) => a + e.amountKsh, 0)
  );
  const monthlyProfit = monthlyRevenue.map((r, i) => r - monthlyExpenses[i]);

  const maxBarVal = Math.max(...monthlyRevenue, ...monthlyExpenses, 1);

  // Lead funnel
  const FUNNEL_STAGES = ["New", "Contacted", "Quoted", "Negotiating", "Won", "Lost"] as const;
  const FUNNEL_COLORS: Record<string, string> = {
    New: "bg-blue-500", Contacted: "bg-purple-500", Quoted: "bg-amber-500",
    Negotiating: "bg-orange-500", Won: "bg-emerald-500", Lost: "bg-red-400",
  };
  const funnelCounts = FUNNEL_STAGES.map((s) => leads.filter((l) => l.status === s).length);
  const maxFunnel = Math.max(...funnelCounts, 1);

  // Top tours by revenue
  const tourRevenue: Record<string, { title: string; ksh: number; bookings: number }> = {};
  sales.forEach((s) => {
    const key = s.tourTitle;
    if (!tourRevenue[key]) tourRevenue[key] = { title: s.tourTitle, ksh: 0, bookings: 0 };
    tourRevenue[key].ksh += s.amountKsh;
    tourRevenue[key].bookings += 1;
  });
  const topTours = Object.values(tourRevenue).sort((a, b) => b.ksh - a.ksh).slice(0, 5);
  const maxTourRev = Math.max(...topTours.map((t) => t.ksh), 1);

  // Expense breakdown by category
  const expByCategory: Record<string, number> = {};
  expenses.forEach((e) => { expByCategory[e.category] = (expByCategory[e.category] ?? 0) + e.amountKsh; });
  const totalExpKsh = Object.values(expByCategory).reduce((a, v) => a + v, 0);
  const expCategories = Object.entries(expByCategory).sort((a, b) => b[1] - a[1]);

  // Summary totals
  const totalRevKsh = sales.reduce((a, s) => a + s.amountKsh, 0);
  const totalExpKshAll = expenses.reduce((a, e) => a + e.amountKsh, 0);
  const netProfit = totalRevKsh - totalExpKshAll;
  const wonLeads = leads.filter((l) => l.status === "Won").length;
  const closedLeads = leads.filter((l) => ["Won", "Lost"].includes(l.status)).length;
  const convRate = closedLeads > 0 ? Math.round((wonLeads / closedLeads) * 100) : 0;

  const CAT_COLORS = ["bg-emerald-500", "bg-blue-500", "bg-amber-500", "bg-orange-500", "bg-purple-500", "bg-red-400", "bg-teal-500", "bg-gray-400"];

  const SECTION_CARDS = [
    { label: "Sales Report", href: "/admin/reports/sales", icon: DollarSign, desc: "Bookings, revenue & payments", color: "text-emerald-700 bg-emerald-50 border-emerald-200" },
    { label: "Expenses Report", href: "/admin/reports/expenses", icon: Receipt, desc: "All expenditure by category", color: "text-red-700 bg-red-50 border-red-200" },
    { label: "Payroll Report", href: "/admin/reports/payroll", icon: Users, desc: "Staff salaries & payroll runs", color: "text-blue-700 bg-blue-50 border-blue-200" },
    { label: "Leads Report", href: "/admin/reports/leads", icon: Target, desc: "Pipeline & conversion rates", color: "text-purple-700 bg-purple-50 border-purple-200" },
    { label: "HR Report", href: "/admin/reports/hr", icon: FileBarChart2, desc: "Staff roster & leave summary", color: "text-amber-700 bg-amber-50 border-amber-200" },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Reports & Analytics</h1>
        <p className="text-gray-500 text-sm mt-0.5">Performance overview across revenue, leads, and operations</p>
      </div>

      {/* Section report cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        {SECTION_CARDS.map((c) => (
          <Link key={c.label} href={c.href}
            className={`group rounded-2xl p-4 border ${c.color} hover:shadow-md transition-all`}>
            <div className="flex items-center justify-between mb-2">
              <c.icon className="w-5 h-5 opacity-80" />
              <ArrowRight className="w-3.5 h-3.5 opacity-50 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all" />
            </div>
            <div className="font-semibold text-sm">{c.label}</div>
            <div className="text-xs mt-0.5 opacity-70">{c.desc}</div>
          </Link>
        ))}
      </div>

      {/* KPI row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: "Total Revenue", value: `KSH ${fmtK(totalRevKsh)}`, sub: `${sales.length} bookings`, icon: TrendingUp, color: "bg-emerald-50 text-emerald-600" },
          { label: "Total Expenses", value: `KSH ${fmtK(totalExpKshAll)}`, sub: `${expenses.length} entries`, icon: TrendingDown, color: "bg-red-50 text-red-500" },
          { label: "Net Profit", value: `KSH ${fmtK(netProfit)}`, sub: netProfit >= 0 ? "In profit" : "Net loss", icon: DollarSign, color: netProfit >= 0 ? "bg-blue-50 text-blue-600" : "bg-red-50 text-red-600" },
          { label: "Conversion Rate", value: `${convRate}%`, sub: `${wonLeads} of ${closedLeads} closed`, icon: Target, color: "bg-purple-50 text-purple-600" },
        ].map((k) => (
          <div key={k.label} className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center mb-3 ${k.color}`}>
              <k.icon className="w-4 h-4" />
            </div>
            <div className="text-xl font-bold text-gray-900">{k.value}</div>
            <div className="text-xs text-gray-500 mt-0.5">{k.label}</div>
            <div className="text-xs text-gray-400 mt-0.5">{k.sub}</div>
          </div>
        ))}
      </div>

      {/* Monthly P&L chart */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
        <div className="flex items-center gap-2 mb-1">
          <BarChart2 className="w-4 h-4 text-gray-400" />
          <h2 className="font-semibold text-gray-800">Monthly P&L — Last 6 Months</h2>
        </div>
        <div className="flex gap-4 mb-4 text-xs text-gray-500">
          <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded bg-emerald-400 inline-block" /> Revenue</span>
          <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded bg-red-400 inline-block" /> Expenses</span>
        </div>
        <div className="flex gap-2 items-end h-32">
          {months.map((m, i) => (
            <div key={m.value} className="flex-1 flex flex-col items-center gap-1">
              <div className="w-full flex items-end gap-0.5" style={{ height: "100px" }}>
                <div className="flex-1 bg-emerald-400 rounded-t-sm" style={{ height: `${Math.max((monthlyRevenue[i] / maxBarVal) * 100, 2)}%` }} title={`KSH ${monthlyRevenue[i].toLocaleString()}`} />
                <div className="flex-1 bg-red-400 rounded-t-sm" style={{ height: `${Math.max((monthlyExpenses[i] / maxBarVal) * 100, 2)}%` }} title={`KSH ${monthlyExpenses[i].toLocaleString()}`} />
              </div>
              <div className="text-xs text-gray-400">{m.label}</div>
            </div>
          ))}
        </div>
        <div className="grid grid-cols-6 mt-3 text-center">
          {months.map((m, i) => (
            <div key={m.value} className="text-xs">
              <div className={`font-semibold ${monthlyProfit[i] >= 0 ? "text-emerald-600" : "text-red-500"}`}>
                {monthlyProfit[i] >= 0 ? "+" : ""}{fmtK(monthlyProfit[i])}
              </div>
              <div className="text-gray-400">net</div>
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Lead funnel */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
          <h2 className="font-semibold text-gray-800 mb-4">Lead Pipeline</h2>
          <div className="space-y-3">
            {FUNNEL_STAGES.map((stage, i) => (
              <div key={stage} className="flex items-center gap-3">
                <div className="w-20 text-xs text-gray-500 text-right">{stage}</div>
                <div className="flex-1 bg-gray-100 rounded-full h-5 overflow-hidden">
                  <div
                    className={`h-full rounded-full ${FUNNEL_COLORS[stage]} transition-all`}
                    style={{ width: `${Math.max((funnelCounts[i] / maxFunnel) * 100, funnelCounts[i] > 0 ? 5 : 0)}%` }}
                  />
                </div>
                <div className="w-8 text-xs font-bold text-gray-700 text-right">{funnelCounts[i]}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Top tours */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
          <h2 className="font-semibold text-gray-800 mb-4">Top Tours by Revenue</h2>
          {topTours.length === 0 ? (
            <div className="text-center text-gray-400 text-sm py-8">No booking data yet.</div>
          ) : (
            <div className="space-y-3">
              {topTours.map((t, i) => (
                <div key={t.title} className="flex items-center gap-3">
                  <div className="w-5 h-5 rounded-full bg-emerald-100 flex items-center justify-center flex-shrink-0">
                    <span className="text-emerald-700 font-bold text-xs">{i + 1}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-gray-800 truncate">{t.title}</div>
                    <div className="text-xs text-gray-400">{t.bookings} booking{t.bookings !== 1 ? "s" : ""}</div>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <div className="font-bold text-gray-900 text-sm">KSH {fmtK(t.ksh)}</div>
                    <div className="w-20 bg-gray-100 rounded-full h-1.5 mt-1">
                      <div className="bg-emerald-500 h-1.5 rounded-full" style={{ width: `${(t.ksh / maxTourRev) * 100}%` }} />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Expense breakdown */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
        <h2 className="font-semibold text-gray-800 mb-4">Expense Breakdown by Category</h2>
        {expCategories.length === 0 ? (
          <div className="text-center text-gray-400 text-sm py-8">No expense data yet.</div>
        ) : (
          <div className="space-y-3">
            {expCategories.map(([cat, ksh], i) => {
              const pct = totalExpKsh > 0 ? Math.round((ksh / totalExpKsh) * 100) : 0;
              return (
                <div key={cat} className="flex items-center gap-3">
                  <div className="w-28 text-xs text-gray-500 text-right truncate">{cat}</div>
                  <div className="flex-1 bg-gray-100 rounded-full h-4 overflow-hidden">
                    <div className={`h-full rounded-full ${CAT_COLORS[i % CAT_COLORS.length]}`} style={{ width: `${Math.max(pct, 2)}%` }} />
                  </div>
                  <div className="w-20 text-right flex-shrink-0">
                    <div className="text-xs font-bold text-gray-700">KSH {fmtK(ksh)}</div>
                    <div className="text-xs text-gray-400">{pct}%</div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
