"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { getLeads, getSales, getStaff, getExpenses, getTours } from "@/lib/adminStore";
import type { Lead, Sale, StaffMember, Expense, AdminTour } from "@/types/admin";
import { Target, DollarSign, Users, Receipt, Map, Search } from "lucide-react";

function highlight(text: string, query: string) {
  if (!query) return text;
  const idx = text.toLowerCase().indexOf(query.toLowerCase());
  if (idx === -1) return text;
  return (
    <>
      {text.slice(0, idx)}
      <mark className="bg-amber-200 text-amber-900 rounded px-0.5">{text.slice(idx, idx + query.length)}</mark>
      {text.slice(idx + query.length)}
    </>
  );
}

interface SearchResults {
  leads: Lead[];
  sales: Sale[];
  staff: StaffMember[];
  expenses: Expense[];
  tours: AdminTour[];
}

function SearchInner() {
  const searchParams = useSearchParams();
  const q = searchParams.get("q") ?? "";
  const [results, setResults] = useState<SearchResults>({ leads: [], sales: [], staff: [], expenses: [], tours: [] });
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!q || !mounted) return;
    const ql = q.toLowerCase();
    setResults({
      leads: getLeads().filter((l) =>
        [l.name, l.email, l.phone, l.destination, l.tourInterest, l.message].some((v) => v?.toLowerCase().includes(ql))
      ),
      sales: getSales().filter((s) =>
        [s.clientName, s.clientEmail, s.clientPhone, s.tourTitle, s.bookingRef, s.notes].some((v) => v?.toLowerCase().includes(ql))
      ),
      staff: getStaff().filter((s) =>
        [s.name, s.email, s.role, s.department].some((v) => v?.toLowerCase().includes(ql))
      ),
      expenses: getExpenses().filter((e) =>
        [e.description, e.category, e.receiptRef].some((v) => v?.toLowerCase().includes(ql))
      ),
      tours: getTours().filter((t) =>
        [t.title, t.destination, t.description].some((v) => v?.toLowerCase().includes(ql))
      ),
    });
  }, [q, mounted]);

  const total = results.leads.length + results.sales.length + results.staff.length + results.expenses.length + results.tours.length;

  if (!q) {
    return (
      <div className="text-center py-20">
        <Search className="w-10 h-10 text-gray-200 mx-auto mb-4" />
        <p className="text-gray-400 text-sm">Use the search bar at the top to find leads, bookings, staff, expenses, and tours.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Search Results</h1>
        <p className="text-gray-500 text-sm mt-0.5">
          {total} result{total !== 1 ? "s" : ""} for &ldquo;<strong>{q}</strong>&rdquo;
        </p>
      </div>

      {total === 0 && (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 py-20 text-center">
          <Search className="w-10 h-10 text-gray-200 mx-auto mb-3" />
          <p className="text-gray-500 text-sm">No results found for &ldquo;<strong>{q}</strong>&rdquo;</p>
          <p className="text-gray-400 text-xs mt-1">Try different keywords or check spelling.</p>
        </div>
      )}

      {/* Leads */}
      {results.leads.length > 0 && (
        <Section title="Leads" icon={Target} count={results.leads.length} iconColor="text-purple-600 bg-purple-50">
          {results.leads.map((l) => (
            <Link key={l.id} href={`/admin/leads/${l.id}`} className="flex items-center gap-3 px-5 py-3.5 hover:bg-gray-50 transition-colors">
              <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center flex-shrink-0">
                <span className="text-purple-700 font-bold text-xs">{l.name.charAt(0)}</span>
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium text-gray-800">{highlight(l.name, q)}</div>
                <div className="text-xs text-gray-400">{highlight(l.email, q)} · {highlight(l.destination, q)}</div>
              </div>
              <span className="text-xs text-gray-400 flex-shrink-0">{l.status}</span>
            </Link>
          ))}
        </Section>
      )}

      {/* Sales */}
      {results.sales.length > 0 && (
        <Section title="Bookings" icon={DollarSign} count={results.sales.length} iconColor="text-blue-600 bg-blue-50">
          {results.sales.map((s) => (
            <Link key={s.id} href={`/admin/sales/${s.id}`} className="flex items-center gap-3 px-5 py-3.5 hover:bg-gray-50 transition-colors">
              <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                <span className="text-blue-700 font-bold text-xs">{s.clientName.charAt(0)}</span>
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium text-gray-800">{highlight(s.clientName, q)}</div>
                <div className="text-xs text-gray-400">{highlight(s.bookingRef, q)} · {highlight(s.tourTitle, q)}</div>
              </div>
              <span className="text-xs text-gray-400 flex-shrink-0">{s.paymentStatus}</span>
            </Link>
          ))}
        </Section>
      )}

      {/* Tours */}
      {results.tours.length > 0 && (
        <Section title="Tours" icon={Map} count={results.tours.length} iconColor="text-emerald-600 bg-emerald-50">
          {results.tours.map((t) => (
            <Link key={t.id} href={`/admin/tours/${t.id}/edit`} className="flex items-center gap-3 px-5 py-3.5 hover:bg-gray-50 transition-colors">
              <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center flex-shrink-0">
                <Map className="w-4 h-4 text-emerald-700" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium text-gray-800">{highlight(t.title, q)}</div>
                <div className="text-xs text-gray-400">{t.destination} · {t.duration}</div>
              </div>
              <span className={`text-xs px-2 py-0.5 rounded-full ${t.active ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"}`}>{t.active ? "Active" : "Inactive"}</span>
            </Link>
          ))}
        </Section>
      )}

      {/* Staff */}
      {results.staff.length > 0 && (
        <Section title="Staff" icon={Users} count={results.staff.length} iconColor="text-indigo-600 bg-indigo-50">
          {results.staff.map((s) => (
            <Link key={s.id} href="/admin/hr/staff" className="flex items-center gap-3 px-5 py-3.5 hover:bg-gray-50 transition-colors">
              <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center flex-shrink-0">
                <span className="text-indigo-700 font-bold text-xs">{s.name.charAt(0)}</span>
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium text-gray-800">{highlight(s.name, q)}</div>
                <div className="text-xs text-gray-400">{highlight(s.role, q)} · {s.department}</div>
              </div>
              <span className={`text-xs px-2 py-0.5 rounded-full ${s.status === "Active" ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"}`}>{s.status}</span>
            </Link>
          ))}
        </Section>
      )}

      {/* Expenses */}
      {results.expenses.length > 0 && (
        <Section title="Expenses" icon={Receipt} count={results.expenses.length} iconColor="text-orange-600 bg-orange-50">
          {results.expenses.map((e) => (
            <Link key={e.id} href="/admin/expenses" className="flex items-center gap-3 px-5 py-3.5 hover:bg-gray-50 transition-colors">
              <div className="w-8 h-8 rounded-full bg-orange-100 flex items-center justify-center flex-shrink-0">
                <Receipt className="w-4 h-4 text-orange-600" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium text-gray-800">{highlight(e.description, q)}</div>
                <div className="text-xs text-gray-400">{e.category} · {e.date}</div>
              </div>
              <span className="text-xs font-semibold text-gray-700 flex-shrink-0">KSH {e.amountKsh.toLocaleString()}</span>
            </Link>
          ))}
        </Section>
      )}
    </div>
  );
}

function Section({ title, icon: Icon, count, iconColor, children }: {
  title: string; icon: React.ElementType; count: number; iconColor: string; children: React.ReactNode;
}) {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
      <div className="px-5 py-3.5 border-b border-gray-100 flex items-center gap-2">
        <div className={`w-6 h-6 rounded-md flex items-center justify-center ${iconColor}`}>
          <Icon className="w-3.5 h-3.5" />
        </div>
        <span className="font-semibold text-gray-800 text-sm">{title}</span>
        <span className="text-xs text-gray-400 ml-1">({count})</span>
      </div>
      <div className="divide-y divide-gray-50">{children}</div>
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={<div className="p-6 text-gray-400">Loading…</div>}>
      <SearchInner />
    </Suspense>
  );
}
