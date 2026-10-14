import type { AdminSection } from "@/types/admin";

/** Every admin area, in sidebar order, with the URL it lives under. */
export const ADMIN_SECTIONS: { key: AdminSection; label: string; href: string }[] = [
  { key: "dashboard", label: "Dashboard", href: "/admin" },
  { key: "tours", label: "Tours", href: "/admin/tours" },
  { key: "leads", label: "Leads", href: "/admin/leads" },
  { key: "sales", label: "Sales", href: "/admin/sales" },
  { key: "invoices", label: "Invoices", href: "/admin/invoices" },
  { key: "receipts", label: "Receipts", href: "/admin/receipts" },
  { key: "vouchers", label: "Vouchers", href: "/admin/vouchers" },
  { key: "expenses", label: "Expenses", href: "/admin/expenses" },
  { key: "reports", label: "Reports", href: "/admin/reports" },
  { key: "reviews", label: "Reviews", href: "/admin/reviews" },
  { key: "hr", label: "Human Resources", href: "/admin/hr" },
  { key: "users", label: "Users", href: "/admin/users" },
  { key: "settings", label: "Settings", href: "/admin/settings" },
];

type WithAccess = { access?: AdminSection[] } | null | undefined;

/** No access list means full access (the Owner, and anyone signed in with the shared password). */
export function hasFullAccess(user: WithAccess): boolean {
  return !user?.access;
}

export function canAccessSection(user: WithAccess, section: AdminSection): boolean {
  return hasFullAccess(user) || user!.access!.includes(section);
}

function sectionForPath(pathname: string): AdminSection | null {
  if (pathname === "/admin") return "dashboard";
  const match = ADMIN_SECTIONS.find((s) => s.href !== "/admin" && (pathname === s.href || pathname.startsWith(`${s.href}/`)));
  return match?.key ?? null;
}

/** Pages outside every section (global search) are for full-access accounts only. */
export function canAccessPath(user: WithAccess, pathname: string): boolean {
  // Every account can sign in and change its own password.
  if (pathname === "/admin/login" || pathname === "/admin/account" || hasFullAccess(user)) return true;
  const section = sectionForPath(pathname);
  return section !== null && canAccessSection(user, section);
}

/** Where to send someone after login, or when they open a page they can't use. */
export function homePathFor(user: WithAccess): string {
  if (hasFullAccess(user)) return "/admin";
  const first = ADMIN_SECTIONS.find((s) => user!.access!.includes(s.key));
  return first?.href ?? "/admin/login";
}
