"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { isAuthenticated, logout } from "@/lib/adminStore";
import {
  LayoutDashboard, Map, Users, CalendarDays, LogOut,
  Menu, ChevronDown, ChevronRight, Target, DollarSign, Receipt,
  BarChart2, Star, Settings, Search, X,
} from "lucide-react";

const NAV = [
  { label: "Dashboard", href: "/admin", icon: LayoutDashboard },
  {
    label: "Tours", icon: Map,
    children: [
      { label: "All Tours", href: "/admin/tours" },
      { label: "Add Tour", href: "/admin/tours/new" },
    ],
  },
  {
    label: "Leads", icon: Target,
    children: [
      { label: "All Leads", href: "/admin/leads" },
      { label: "Add Lead", href: "/admin/leads/new" },
    ],
  },
  {
    label: "Sales", icon: DollarSign,
    children: [
      { label: "All Bookings", href: "/admin/sales" },
      { label: "Add Booking", href: "/admin/sales/new" },
    ],
  },
  {
    label: "Expenses", icon: Receipt,
    children: [
      { label: "All Expenses", href: "/admin/expenses" },
      { label: "Add Expense", href: "/admin/expenses/new" },
    ],
  },
  { label: "Reports", href: "/admin/reports", icon: BarChart2 },
  {
    label: "Reviews", icon: Star,
    children: [
      { label: "All Reviews", href: "/admin/reviews" },
      { label: "Add Review", href: "/admin/reviews/new" },
    ],
  },
  {
    label: "Human Resources", icon: Users,
    children: [
      { label: "HR Overview", href: "/admin/hr" },
      { label: "Staff", href: "/admin/hr/staff" },
      { label: "Leave Requests", href: "/admin/hr/leave" },
      { label: "Payroll", href: "/admin/hr/payroll" },
    ],
  },
  { label: "Settings", href: "/admin/settings", icon: Settings },
];

export default function AdminShell({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [expanded, setExpanded] = useState<string[]>(["Tours", "Leads", "Sales", "Expenses", "Reviews", "Human Resources"]);
  const [searchQuery, setSearchQuery] = useState("");
  const searchRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setMounted(true);
    if (!isAuthenticated() && pathname !== "/admin/login") {
      router.replace("/admin/login");
    }
  }, [pathname, router]);

  if (!mounted) return null;
  if (pathname === "/admin/login") return <>{children}</>;
  if (!isAuthenticated()) return null;

  function toggleSection(label: string) {
    setExpanded((prev) => prev.includes(label) ? prev.filter((l) => l !== label) : [...prev, label]);
  }

  function isActive(href: string) {
    if (href === "/admin") return pathname === "/admin";
    return pathname.startsWith(href);
  }

  function handleLogout() {
    logout();
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
      <div className="px-6 py-5 border-b border-white/10">
        <div className="flex items-center gap-3">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logo.png" alt="Jacmiya Safaris" className="h-10 w-auto" />
        </div>
        <p className="text-white/30 text-xs mt-2 uppercase tracking-widest">Admin Portal</p>
      </div>

      <nav className="flex-1 px-3 py-4 overflow-y-auto space-y-1">
        {NAV.map((item) => {
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
          <p className="text-white/80 text-sm font-medium">Jacmiya Admin</p>
          <p className="text-white/30 text-xs">jacmiya@jacmiyasafaris.com</p>
        </div>
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
          {/* Global search */}
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
          <span className="text-xs text-gray-400 hidden lg:block">Jacmiya Safaris Admin</span>
        </header>

        <main className="flex-1 overflow-y-auto p-4 lg:p-6">
          {children}
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
