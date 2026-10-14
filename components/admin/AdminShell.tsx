"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { api } from "@/lib/api";
import { AdminSessionProvider, type SessionUser } from "@/components/admin/AdminSession";
import { canAccessPath, canAccessSection, hasFullAccess, homePathFor } from "@/lib/adminAccess";
import type { AdminSection } from "@/types/admin";
import {
  LayoutDashboard, Map, Users, CalendarDays, LogOut,
  Menu, ChevronDown, ChevronRight, Target, DollarSign, Receipt,
  BarChart2, Star, Settings, Search, X, FileText, UserCog, BadgeCheck, Ticket, KeyRound,
} from "lucide-react";

const NAV = [
  { label: "Dashboard", href: "/admin", section: "dashboard" as AdminSection, icon: LayoutDashboard },
  {
    label: "Tours", section: "tours" as AdminSection, icon: Map,
    children: [
      { label: "All Tours", href: "/admin/tours" },
      { label: "Add Tour", href: "/admin/tours/new" },
    ],
  },
  {
    label: "Leads", section: "leads" as AdminSection, icon: Target,
    children: [
      { label: "All Leads", href: "/admin/leads" },
      { label: "Add Lead", href: "/admin/leads/new" },
    ],
  },
  {
    label: "Sales", section: "sales" as AdminSection, icon: DollarSign,
    children: [
      { label: "All Bookings", href: "/admin/sales" },
      { label: "Add Booking", href: "/admin/sales/new" },
    ],
  },
  {
    label: "Invoices", section: "invoices" as AdminSection, icon: FileText,
    children: [
      { label: "All Invoices", href: "/admin/invoices" },
      { label: "New Invoice", href: "/admin/invoices/new" },
    ],
  },
  {
    label: "Receipts", section: "receipts" as AdminSection, icon: BadgeCheck,
    children: [
      { label: "All Receipts", href: "/admin/receipts" },
      { label: "Record Payment", href: "/admin/receipts/new" },
    ],
  },
  {
    label: "Vouchers", section: "vouchers" as AdminSection, icon: Ticket,
    children: [
      { label: "All Vouchers", href: "/admin/vouchers" },
      { label: "New Voucher", href: "/admin/vouchers/new" },
    ],
  },
  {
    label: "Expenses", section: "expenses" as AdminSection, icon: Receipt,
    children: [
      { label: "All Expenses", href: "/admin/expenses" },
      { label: "Add Expense", href: "/admin/expenses/new" },
    ],
  },
  {
    label: "Reports", section: "reports" as AdminSection, icon: BarChart2,
    children: [
      { label: "Overview", href: "/admin/reports" },
      { label: "Sales Report", href: "/admin/reports/sales" },
      { label: "Expenses Report", href: "/admin/reports/expenses" },
      { label: "Payroll Report", href: "/admin/reports/payroll" },
      { label: "Leads Report", href: "/admin/reports/leads" },
      { label: "HR Report", href: "/admin/reports/hr" },
    ],
  },
  {
    label: "Reviews", section: "reviews" as AdminSection, icon: Star,
    children: [
      { label: "All Reviews", href: "/admin/reviews" },
      { label: "Add Review", href: "/admin/reviews/new" },
    ],
  },
  {
    label: "Human Resources", section: "hr" as AdminSection, icon: Users,
    children: [
      { label: "HR Overview", href: "/admin/hr" },
      { label: "Staff", href: "/admin/hr/staff" },
      { label: "Leave Requests", href: "/admin/hr/leave" },
      { label: "Payroll", href: "/admin/hr/payroll" },
    ],
  },
  {
    label: "Users", section: "users" as AdminSection, icon: UserCog,
    children: [
      { label: "All Users", href: "/admin/users" },
      { label: "Add User", href: "/admin/users/new" },
    ],
  },
  { label: "Settings", href: "/admin/settings", section: "settings" as AdminSection, icon: Settings },
];

export default function AdminShell({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [expanded, setExpanded] = useState<string[]>(["Tours", "Leads", "Sales", "Invoices", "Receipts", "Vouchers", "Expenses", "Reports", "Reviews", "Human Resources", "Users"]);
  const [searchQuery, setSearchQuery] = useState("");
  const searchRef = useRef<HTMLInputElement>(null);
  const [currentUser, setCurrentUser] = useState<SessionUser | null>(null);
  const isLogin = pathname === "/admin/login";

  // Ask the server who is signed in on every navigation, so access changed on
  // the Users page (or a deactivated account) takes effect straight away.
  useEffect(() => {
    if (isLogin) return;
    let cancelled = false;
    api<{ user: SessionUser }>("/api/auth/me")
      .then(({ user }) => { if (!cancelled) setCurrentUser(user); })
      .catch(() => { if (!cancelled) router.replace("/admin/login"); });
    return () => { cancelled = true; };
  }, [pathname, isLogin, router]);

  const allowed = currentUser !== null && canAccessPath(currentUser, pathname);
  const homePath = homePathFor(currentUser);

  useEffect(() => {
    if (currentUser && !allowed) router.replace(homePath);
  }, [currentUser, allowed, homePath, router]);

  if (isLogin) return <>{children}</>;
  if (!currentUser || !allowed) return null;

  const visibleNav = NAV.filter((item) => canAccessSection(currentUser, item.section));
  const fullAccess = hasFullAccess(currentUser);

  function toggleSection(label: string) {
    setExpanded((prev) => prev.includes(label) ? prev.filter((l) => l !== label) : [...prev, label]);
  }

  function isActive(href: string) {
    if (href === "/admin" || href === "/admin/reports") return pathname === href;
    return pathname.startsWith(href);
  }

  async function handleLogout() {
    await api("/api/auth/logout", { method: "POST" }).catch(() => {});
    router.push("/admin/login");
  }

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    const q = searchQuery.trim();
    if (!q) return;
    router.push(`/admin/search?q=${encodeURIComponent(q)}`);
    setSearchQuery("");
  }

  const Sidebar = (
    <aside className="w-64 flex-shrink-0 bg-bark flex flex-col h-full">
      <div className="px-4 py-4 border-b border-white/10">
        <div className="bg-white rounded-xl px-3 py-2 flex items-center justify-center">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logo.png" alt="Jacmiya Safaris" className="h-14 w-auto" />
        </div>
        <p className="text-white/30 text-xs mt-2 uppercase tracking-widest text-center">Admin Portal</p>
      </div>

      <nav className="flex-1 px-3 py-4 overflow-y-auto space-y-1">
        {visibleNav.map((item) => {
          if (!item.children) {
            return (
              <Link key={item.href} href={item.href!} onClick={() => setSidebarOpen(false)}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${isActive(item.href!) ? "bg-savanna/20 text-savanna" : "text-white/60 hover:text-white hover:bg-white/5"}`}>
                <item.icon className="w-4 h-4 flex-shrink-0" />
                {item.label}
              </Link>
            );
          }

          const open = expanded.includes(item.label);
          const anyChildActive = item.children.some((c) => isActive(c.href));

          return (
            <div key={item.label}>
              <button onClick={() => toggleSection(item.label)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${anyChildActive ? "text-savanna" : "text-white/60 hover:text-white hover:bg-white/5"}`}>
                <item.icon className="w-4 h-4 flex-shrink-0" />
                <span className="flex-1 text-left">{item.label}</span>
                {open ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
              </button>
              {open && (
                <div className="ml-7 mt-1 space-y-0.5">
                  {item.children.map((child) => (
                    <Link key={child.href} href={child.href} onClick={() => setSidebarOpen(false)}
                      className={`block px-3 py-2 rounded-lg text-sm transition-colors ${isActive(child.href) ? "bg-savanna/20 text-savanna font-semibold" : "text-white/50 hover:text-white hover:bg-white/5"}`}>
                      {child.label}
                    </Link>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </nav>

      <div className="px-3 py-4 border-t border-white/10">
        <div className="px-3 py-2 mb-1">
          <p className="text-white/80 text-sm font-medium">{currentUser?.name ?? "Jacmiya Admin"}</p>
          <p className="text-white/30 text-xs">{currentUser?.email ?? "jacmiya@jacmiyasafaris.com"}</p>
          {currentUser && <p className="text-white/20 text-[10px] uppercase tracking-wider mt-0.5">{currentUser.jobTitle || currentUser.role}</p>}
        </div>
        <Link href="/admin/account" onClick={() => setSidebarOpen(false)} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-white/50 hover:text-white hover:bg-white/5 transition-colors">
          <KeyRound className="w-4 h-4" />
          Change Password
        </Link>
        <button onClick={handleLogout} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-white/50 hover:text-red-400 hover:bg-white/5 transition-colors">
          <LogOut className="w-4 h-4" />
          Sign Out
        </button>
      </div>
    </aside>
  );

  return (
    <div className="flex h-screen overflow-hidden" style={{ backgroundColor: "#f8f7f4" }}>
      <div className="hidden lg:flex">{Sidebar}</div>

      {sidebarOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div className="flex">{Sidebar}</div>
          <div className="flex-1 bg-black/40" onClick={() => setSidebarOpen(false)} />
        </div>
      )}

      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="bg-white border-b border-gray-200 px-4 lg:px-6 py-3 flex items-center gap-4 flex-shrink-0">
          <button onClick={() => setSidebarOpen(true)} className="lg:hidden text-gray-500 hover:text-gray-700" aria-label="Open menu">
            <Menu className="w-5 h-5" />
          </button>
          <div className="flex-1">
            <Breadcrumb pathname={pathname} />
          </div>
          {/* Global search — it reaches every section, so full-access accounts only */}
          {fullAccess && (
          <form onSubmit={handleSearch} className="hidden sm:flex items-center gap-2 bg-gray-100 rounded-xl px-3 py-1.5 w-56">
            <Search className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
            <input
              ref={searchRef}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search…"
              className="bg-transparent text-sm text-gray-700 placeholder-gray-400 focus:outline-none flex-1 min-w-0"
            />
            {searchQuery && (
              <button type="button" onClick={() => setSearchQuery("")} className="text-gray-400 hover:text-gray-600">
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </form>
          )}
          <span className="text-xs text-gray-400 hidden lg:block">Jacmiya Safaris Admin</span>
        </header>

        <main className="flex-1 overflow-y-auto p-4 lg:p-6">
          <AdminSessionProvider value={currentUser}>{children}</AdminSessionProvider>
        </main>
      </div>
    </div>
  );
}

function Breadcrumb({ pathname }: { pathname: string }) {
  const parts = pathname.replace("/admin", "").split("/").filter(Boolean);
  return (
    <div className="flex items-center gap-1.5 text-sm">
      <Link href="/admin" className="text-gray-400 hover:text-gray-600 transition-colors">Admin</Link>
      {parts.map((part, i) => (
        <span key={i} className="flex items-center gap-1.5">
          <span className="text-gray-300">/</span>
          <span className={`capitalize ${i === parts.length - 1 ? "text-gray-700 font-medium" : "text-gray-400"}`}>
            {part.replace(/-/g, " ")}
          </span>
        </span>
      ))}
    </div>
  );
}
