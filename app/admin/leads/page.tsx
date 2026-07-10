"use client";

import { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import { getLeads, deleteLead } from "@/lib/adminStore";
import type { Lead, LeadStatus } from "@/types/admin";
import { Plus, Search, Trash2, ExternalLink } from "lucide-react";

const STATUSES: LeadStatus[] = ["New", "Contacted", "Quoted", "Negotiating", "Won", "Lost"];
const STATUS_COLOR: Record<LeadStatus, string> = {
  New: "bg-blue-100 text-blue-700",
  Contacted: "bg-purple-100 text-purple-700",
  Quoted: "bg-amber-100 text-amber-700",
  Negotiating: "bg-orange-100 text-orange-700",
  Won: "bg-green-100 text-green-700",
  Lost: "bg-red-100 text-red-700",
};
const SOURCE_COLOR: Record<string, string> = {
  Website: "bg-blue-50 text-blue-600",
  Referral: "bg-green-50 text-green-700",
  "Social Media": "bg-pink-50 text-pink-600",
  Phone: "bg-amber-50 text-amber-700",
  "Walk-in": "bg-teal-50 text-teal-700",
  Email: "bg-purple-50 text-purple-700",
};

export default function LeadsPage() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [tab, setTab] = useState<"All" | LeadStatus>("All");
  const [query, setQuery] = useState("");

  function load() { setLeads(getLeads()); }
  useEffect(() => { load(); }, []);

  const filtered = useMemo(() => {
    const q = query.toLowerCase();
    return leads.filter((l) => {
      if (tab !== "All" && l.status !== tab) return false;
      if (q && !l.name.toLowerCase().includes(q) && !l.email.toLowerCase().includes(q) && !l.destination.toLowerCase().includes(q)) return false;
      return true;
    }).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }, [leads, tab, query]);

  function handleDelete(id: string) {
    if (!confirm("Delete this lead?")) return;
    deleteLead(id);
    load();
  }

  const counts = useMemo(() => {
    const map: Record<string, number> = { All: leads.length };
    STATUSES.forEach((s) => { map[s] = leads.filter((l) => l.status === s).length; });
    return map;
  }, [leads]);

  const openCount = leads.filter((l) => !["Won", "Lost"].includes(l.status)).length;
  const wonCount = leads.filter((l) => l.status === "Won").length;
  const closedCount = leads.filter((l) => ["Won", "Lost"].includes(l.status)).length;
  const convRate = closedCount > 0 ? Math.round((wonCount / closedCount) * 100) : 0;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Leads</h1>
          <p className="text-gray-500 text-sm mt-0.5">Track and manage all client enquiries</p>
        </div>
        <Link href="/admin/leads/new" className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white text-sm font-semibold px-4 py-2.5 rounded-xl transition-colors">
          <Plus className="w-4 h-4" /> Add Lead
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: "Total Leads", value: leads.length, color: "text-gray-900" },
          { label: "Open", value: openCount, color: "text-purple-700" },
          { label: "Won", value: wonCount, color: "text-green-700" },
          { label: "Conversion", value: `${convRate}%`, color: "text-blue-700" },
        ].map((s) => (
          <div key={s.label} className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 text-center">
            <div className={`text-2xl font-bold ${s.color}`}>{s.value}</div>
            <div className="text-xs text-gray-500 mt-1">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Tabs + search */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100">
        <div className="flex items-center gap-3 px-5 py-4 border-b border-gray-100 flex-wrap">
          <div className="flex gap-1 flex-wrap flex-1">
            {(["All", ...STATUSES] as const).map((s) => (
              <button key={s} onClick={() => setTab(s)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${tab === s ? "bg-purple-600 text-white" : "text-gray-600 hover:bg-gray-100"}`}>
                {s} <span className={`ml-1 text-xs ${tab === s ? "opacity-70" : "opacity-50"}`}>({counts[s] ?? 0})</span>
              </button>
            ))}
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
            <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search…" className="pl-8 pr-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-purple-400 w-44" />
          </div>
        </div>

        <div className="divide-y divide-gray-50">
          {filtered.length === 0 && (
            <div className="py-16 text-center text-gray-400 text-sm">No leads found.</div>
          )}
          {filtered.map((l) => (
            <div key={l.id} className="flex items-center gap-4 px-5 py-4 hover:bg-gray-50 transition-colors">
              <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center flex-shrink-0">
                <span className="text-purple-700 font-bold text-sm">{l.name.charAt(0)}</span>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <p className="text-sm font-semibold text-gray-800">{l.name}</p>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${STATUS_COLOR[l.status]}`}>{l.status}</span>
                  <span className={`text-xs px-2 py-0.5 rounded-full ${SOURCE_COLOR[l.source] ?? "bg-gray-100 text-gray-500"}`}>{l.source}</span>
                </div>
                <p className="text-xs text-gray-500 mt-0.5">{l.email} {l.phone && `· ${l.phone}`}</p>
                <p className="text-xs text-gray-400 mt-0.5">{l.destination} · {l.travelers} · {l.travelDates} · {l.budget}</p>
              </div>
              <div className="text-right flex-shrink-0 hidden sm:block">
                <p className="text-xs font-medium text-gray-600">{l.tourInterest}</p>
                <p className="text-xs text-gray-400 mt-0.5">{l.followUps?.length ?? 0} follow-up{(l.followUps?.length ?? 0) !== 1 ? "s" : ""}</p>
                <p className="text-xs text-gray-300 mt-0.5">{new Date(l.createdAt).toLocaleDateString()}</p>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                <Link href={`/admin/leads/${l.id}`} className="p-2 text-gray-400 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-colors">
                  <ExternalLink className="w-4 h-4" />
                </Link>
                <button onClick={() => handleDelete(l.id)} className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
