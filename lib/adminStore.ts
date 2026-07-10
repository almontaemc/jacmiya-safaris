import { allTours } from "@/data/tours";
import type { AdminTour, StaffMember, LeaveRequest } from "@/types/admin";

const ADMIN_PASSWORD = "Jacmiya@2026";
const TOURS_KEY = "jm_tours";
const STAFF_KEY = "jm_staff";
const LEAVE_KEY = "jm_leave";

const INITIAL_STAFF: StaffMember[] = [
  {
    id: "s1",
    name: "Jacmiya Wambua",
    email: "jacmiya@jacmiyasafaris.com",
    phone: "+254 716 482 995",
    role: "Founder & CEO",
    department: "Management",
    status: "Active",
    hireDate: "2014-01-01",
    salary: 250000,
    bio: "Founder of Jacmiya Safaris with over 20 years of safari expertise across East Africa.",
  },
  {
    id: "s2",
    name: "James Mwangi",
    email: "james.mwangi@jacmiyasafaris.com",
    phone: "+254 712 345 678",
    role: "Head Safari Guide",
    department: "Guides",
    status: "Active",
    hireDate: "2018-03-15",
    salary: 85000,
    bio: "12 years guiding safaris across Kenya, Tanzania and Rwanda with deep wildlife knowledge.",
  },
  {
    id: "s3",
    name: "Grace Njeri",
    email: "grace.njeri@jacmiyasafaris.com",
    phone: "+254 723 456 789",
    role: "Sales Manager",
    department: "Sales",
    status: "Active",
    hireDate: "2019-07-01",
    salary: 95000,
    bio: "Leads the sales team with outstanding client relationship and conversion skills.",
  },
  {
    id: "s4",
    name: "David Kamau",
    email: "david.kamau@jacmiyasafaris.com",
    phone: "+254 734 567 890",
    role: "Senior Driver / Guide",
    department: "Drivers",
    status: "Active",
    hireDate: "2017-05-20",
    salary: 65000,
    bio: "Expert 4×4 safari driver with in-depth knowledge of Kenyan and Tanzanian routes.",
  },
  {
    id: "s5",
    name: "Sarah Wanjiku",
    email: "sarah.wanjiku@jacmiyasafaris.com",
    phone: "+254 745 678 901",
    role: "Operations Coordinator",
    department: "Operations",
    status: "Active",
    hireDate: "2020-02-10",
    salary: 75000,
    bio: "Manages end-to-end logistics ensuring every safari runs like clockwork.",
  },
  {
    id: "s6",
    name: "Peter Ochieng",
    email: "peter.ochieng@jacmiyasafaris.com",
    phone: "+254 756 789 012",
    role: "Safari Guide",
    department: "Guides",
    status: "On Leave",
    hireDate: "2021-08-01",
    salary: 70000,
    bio: "Wildlife photography safari specialist with extensive Tanzania experience.",
  },
  {
    id: "s7",
    name: "Mary Njoroge",
    email: "mary.njoroge@jacmiyasafaris.com",
    phone: "+254 767 890 123",
    role: "Admin Assistant",
    department: "Admin",
    status: "Active",
    hireDate: "2022-01-15",
    salary: 55000,
    bio: "Handles administrative operations and ensures smooth office management.",
  },
];

const INITIAL_LEAVE: LeaveRequest[] = [
  {
    id: "l1",
    staffId: "s6",
    staffName: "Peter Ochieng",
    type: "Annual",
    startDate: "2026-07-08",
    endDate: "2026-07-18",
    days: 10,
    reason: "Family vacation to Mombasa",
    status: "Approved",
    requestedAt: "2026-07-01T08:00:00.000Z",
    reviewedAt: "2026-07-02T10:00:00.000Z",
    reviewNote: "Approved. Enjoy your break!",
  },
  {
    id: "l2",
    staffId: "s4",
    staffName: "David Kamau",
    type: "Sick",
    startDate: "2026-07-09",
    endDate: "2026-07-10",
    days: 2,
    reason: "Medical appointment and recovery",
    status: "Pending",
    requestedAt: "2026-07-08T07:30:00.000Z",
  },
  {
    id: "l3",
    staffId: "s7",
    staffName: "Mary Njoroge",
    type: "Personal",
    startDate: "2026-07-15",
    endDate: "2026-07-15",
    days: 1,
    reason: "Attending a family event",
    status: "Pending",
    requestedAt: "2026-07-07T14:00:00.000Z",
  },
  {
    id: "l4",
    staffId: "s2",
    staffName: "James Mwangi",
    type: "Annual",
    startDate: "2026-08-01",
    endDate: "2026-08-07",
    days: 7,
    reason: "Annual leave — visiting family in Kisumu",
    status: "Approved",
    requestedAt: "2026-07-05T09:00:00.000Z",
    reviewedAt: "2026-07-06T11:00:00.000Z",
    reviewNote: "Approved. Coverage arranged.",
  },
];

// ─── Auth ────────────────────────────────────────────────────────────────────

export function checkPassword(pwd: string): boolean {
  return pwd === ADMIN_PASSWORD;
}

export function isAuthenticated(): boolean {
  if (typeof window === "undefined") return false;
  return sessionStorage.getItem("jm_admin") === "yes";
}

export function login(): void {
  sessionStorage.setItem("jm_admin", "yes");
}

export function logout(): void {
  sessionStorage.removeItem("jm_admin");
}

// ─── Tours ───────────────────────────────────────────────────────────────────

export function getTours(): AdminTour[] {
  if (typeof window === "undefined") return [];
  const raw = localStorage.getItem(TOURS_KEY);
  if (raw) return JSON.parse(raw) as AdminTour[];
  const initial: AdminTour[] = allTours.map((t) => ({
    ...t,
    active: true,
    createdAt: "2026-01-01T00:00:00.000Z",
    updatedAt: new Date().toISOString(),
  }));
  localStorage.setItem(TOURS_KEY, JSON.stringify(initial));
  return initial;
}

export function saveTours(tours: AdminTour[]): void {
  localStorage.setItem(TOURS_KEY, JSON.stringify(tours));
}

export function addTour(tour: Omit<AdminTour, "id" | "createdAt" | "updatedAt">): AdminTour {
  const tours = getTours();
  const newTour: AdminTour = {
    ...tour,
    id: Math.max(0, ...tours.map((t) => t.id)) + 1,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  saveTours([...tours, newTour]);
  return newTour;
}

export function updateTour(id: number, updates: Partial<AdminTour>): void {
  const tours = getTours();
  const idx = tours.findIndex((t) => t.id === id);
  if (idx !== -1) {
    tours[idx] = { ...tours[idx], ...updates, updatedAt: new Date().toISOString() };
    saveTours(tours);
  }
}

export function deleteTour(id: number): void {
  saveTours(getTours().filter((t) => t.id !== id));
}

// ─── Staff ───────────────────────────────────────────────────────────────────

export function getStaff(): StaffMember[] {
  if (typeof window === "undefined") return [];
  const raw = localStorage.getItem(STAFF_KEY);
  if (raw) return JSON.parse(raw) as StaffMember[];
  localStorage.setItem(STAFF_KEY, JSON.stringify(INITIAL_STAFF));
  return INITIAL_STAFF;
}

export function saveStaff(staff: StaffMember[]): void {
  localStorage.setItem(STAFF_KEY, JSON.stringify(staff));
}

export function addStaff(member: Omit<StaffMember, "id">): StaffMember {
  const newMember: StaffMember = { ...member, id: `s${Date.now()}` };
  saveStaff([...getStaff(), newMember]);
  return newMember;
}

export function updateStaff(id: string, updates: Partial<StaffMember>): void {
  const staff = getStaff();
  const idx = staff.findIndex((s) => s.id === id);
  if (idx !== -1) {
    staff[idx] = { ...staff[idx], ...updates };
    saveStaff(staff);
  }
}

export function deleteStaff(id: string): void {
  saveStaff(getStaff().filter((s) => s.id !== id));
}

// ─── Leave ───────────────────────────────────────────────────────────────────

export function getLeave(): LeaveRequest[] {
  if (typeof window === "undefined") return [];
  const raw = localStorage.getItem(LEAVE_KEY);
  if (raw) return JSON.parse(raw) as LeaveRequest[];
  localStorage.setItem(LEAVE_KEY, JSON.stringify(INITIAL_LEAVE));
  return INITIAL_LEAVE;
}

export function saveLeave(leave: LeaveRequest[]): void {
  localStorage.setItem(LEAVE_KEY, JSON.stringify(leave));
}

export function addLeaveRequest(req: Omit<LeaveRequest, "id" | "requestedAt">): LeaveRequest {
  const newReq: LeaveRequest = {
    ...req,
    id: `l${Date.now()}`,
    requestedAt: new Date().toISOString(),
  };
  saveLeave([...getLeave(), newReq]);
  return newReq;
}

export function updateLeave(id: string, updates: Partial<LeaveRequest>): void {
  const leave = getLeave();
  const idx = leave.findIndex((l) => l.id === id);
  if (idx !== -1) {
    leave[idx] = { ...leave[idx], ...updates };
    saveLeave(leave);
  }
}
