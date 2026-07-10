import { allTours } from "@/data/tours";
import type {
  AdminTour, StaffMember, LeaveRequest,
  Lead, FollowUp, Sale, Expense,
  PayrollRun, PayrollEntry,
  Review, AppSettings,
} from "@/types/admin";

const ADMIN_PASSWORD_KEY = "jm_admin_pwd";
const DEFAULT_PASSWORD = "Jacmiya@2026";
const TOURS_KEY = "jm_tours";
const STAFF_KEY = "jm_staff";
const LEAVE_KEY = "jm_leave";
const RATE_KEY = "jm_rate";
const LEADS_KEY = "jm_leads";
const SALES_KEY = "jm_sales";
const EXPENSES_KEY = "jm_expenses";
const PAYROLL_KEY = "jm_payroll";
const REVIEWS_KEY = "jm_reviews";
const SETTINGS_KEY = "jm_settings";
const BOOKING_SEQ_KEY = "jm_booking_seq";
const DEFAULT_RATE = 129;

// ─── Initial data ─────────────────────────────────────────────────────────────

const INITIAL_STAFF: StaffMember[] = [
  { id: "s1", name: "Jacmiya Wambua", email: "jacmiya@jacmiyasafaris.com", phone: "+254 716 482 995", role: "Founder & CEO", department: "Management", status: "Active", hireDate: "2014-01-01", salary: 250000, bio: "Founder of Jacmiya Safaris with over 20 years of safari expertise across East Africa." },
  { id: "s2", name: "James Mwangi", email: "james.mwangi@jacmiyasafaris.com", phone: "+254 712 345 678", role: "Head Safari Guide", department: "Guides", status: "Active", hireDate: "2018-03-15", salary: 85000, bio: "12 years guiding safaris across Kenya, Tanzania and Rwanda with deep wildlife knowledge." },
  { id: "s3", name: "Grace Njeri", email: "grace.njeri@jacmiyasafaris.com", phone: "+254 723 456 789", role: "Sales Manager", department: "Sales", status: "Active", hireDate: "2019-07-01", salary: 95000, bio: "Leads the sales team with outstanding client relationship and conversion skills." },
  { id: "s4", name: "David Kamau", email: "david.kamau@jacmiyasafaris.com", phone: "+254 734 567 890", role: "Senior Driver / Guide", department: "Drivers", status: "Active", hireDate: "2017-05-20", salary: 65000, bio: "Expert 4×4 safari driver with in-depth knowledge of Kenyan and Tanzanian routes." },
  { id: "s5", name: "Sarah Wanjiku", email: "sarah.wanjiku@jacmiyasafaris.com", phone: "+254 745 678 901", role: "Operations Coordinator", department: "Operations", status: "Active", hireDate: "2020-02-10", salary: 75000, bio: "Manages end-to-end logistics ensuring every safari runs like clockwork." },
  { id: "s6", name: "Peter Ochieng", email: "peter.ochieng@jacmiyasafaris.com", phone: "+254 756 789 012", role: "Safari Guide", department: "Guides", status: "On Leave", hireDate: "2021-08-01", salary: 70000, bio: "Wildlife photography safari specialist with extensive Tanzania experience." },
  { id: "s7", name: "Mary Njoroge", email: "mary.njoroge@jacmiyasafaris.com", phone: "+254 767 890 123", role: "Admin Assistant", department: "Admin", status: "Active", hireDate: "2022-01-15", salary: 55000, bio: "Handles administrative operations and ensures smooth office management." },
];

const INITIAL_LEAVE: LeaveRequest[] = [
  { id: "l1", staffId: "s6", staffName: "Peter Ochieng", type: "Annual", startDate: "2026-07-08", endDate: "2026-07-18", days: 10, reason: "Family vacation to Mombasa", status: "Approved", requestedAt: "2026-07-01T08:00:00.000Z", reviewedAt: "2026-07-02T10:00:00.000Z", reviewNote: "Approved. Enjoy your break!" },
  { id: "l2", staffId: "s4", staffName: "David Kamau", type: "Sick", startDate: "2026-07-09", endDate: "2026-07-10", days: 2, reason: "Medical appointment and recovery", status: "Pending", requestedAt: "2026-07-08T07:30:00.000Z" },
  { id: "l3", staffId: "s7", staffName: "Mary Njoroge", type: "Personal", startDate: "2026-07-15", endDate: "2026-07-15", days: 1, reason: "Attending a family event", status: "Pending", requestedAt: "2026-07-07T14:00:00.000Z" },
  { id: "l4", staffId: "s2", staffName: "James Mwangi", type: "Annual", startDate: "2026-08-01", endDate: "2026-08-07", days: 7, reason: "Annual leave — visiting family in Kisumu", status: "Approved", requestedAt: "2026-07-05T09:00:00.000Z", reviewedAt: "2026-07-06T11:00:00.000Z", reviewNote: "Approved. Coverage arranged." },
];

const INITIAL_LEADS: Lead[] = [
  { id: "lead_1", name: "Emily Richardson", email: "emily.r@gmail.com", phone: "+44 7911 123456", destination: "Kenya + Tanzania", travelDates: "August 2026", travelers: "Couple (2)", budget: "$2,000 – $4,000", message: "Looking for a romantic safari for our 10th anniversary. Love wildlife photography.", tourInterest: "Custom Safari", source: "Website", status: "Quoted", followUps: [{ id: "fu1", date: "2026-07-05T09:00:00.000Z", note: "Called Emily. Sent proposal for 7-day Mara & Serengeti package at $3,200pp." }], nextFollowUp: "2026-07-14", createdAt: "2026-07-03T08:30:00.000Z", updatedAt: "2026-07-05T09:00:00.000Z" },
  { id: "lead_2", name: "Robert Chen", email: "robert.chen@outlook.com", phone: "+1 415 555 0192", destination: "Rwanda", travelDates: "September 2026", travelers: "Small Group (3–5)", budget: "$4,000 – $7,000", message: "Family of 4 including 2 teenagers. Very interested in gorilla trekking.", tourInterest: "Rwanda Gorilla Trekking", source: "Referral", status: "Contacted", followUps: [{ id: "fu2", date: "2026-07-07T11:00:00.000Z", note: "Emailed itinerary options. Awaiting response." }], nextFollowUp: "2026-07-12", createdAt: "2026-07-06T14:00:00.000Z", updatedAt: "2026-07-07T11:00:00.000Z" },
  { id: "lead_3", name: "Amara Diallo", email: "amara.d@yahoo.com", phone: "+33 6 12 34 56 78", destination: "Kenya", travelDates: "October 2026", travelers: "Solo (1)", budget: "$1,000 – $2,000", message: "Solo traveller, interested in budget-friendly options and meeting other travellers.", tourInterest: "Budget Kenya Safari", source: "Social Media", status: "New", followUps: [], createdAt: "2026-07-09T16:45:00.000Z", updatedAt: "2026-07-09T16:45:00.000Z" },
  { id: "lead_4", name: "Marcus & Lisa Webb", email: "mwebb@corporate.com", phone: "+1 212 555 0134", destination: "Tanzania", travelDates: "July 2026", travelers: "Couple (2)", budget: "$7,000+", message: "Luxury safari for our honeymoon. Private guide, upmarket lodges preferred.", tourInterest: "Luxury Tanzania Safari", source: "Referral", status: "Won", followUps: [{ id: "fu3", date: "2026-06-28T10:00:00.000Z", note: "Deposit received. Confirmed 8-day luxury Serengeti package." }], convertedSaleId: "sale_1", createdAt: "2026-06-20T09:00:00.000Z", updatedAt: "2026-06-28T10:00:00.000Z" },
  { id: "lead_5", name: "James Oduya", email: "james.o@gmail.com", phone: "+254 722 334 455", destination: "Kenya", travelDates: "December 2026", travelers: "Group (6–12)", budget: "$1,000 – $2,000", message: "Corporate team building safari for 8 people.", tourInterest: "Group Safari", source: "Phone", status: "Negotiating", followUps: [{ id: "fu4", date: "2026-07-08T14:00:00.000Z", note: "Negotiating group discount. Client wants 15% off for 8 pax." }], nextFollowUp: "2026-07-11", createdAt: "2026-07-04T10:00:00.000Z", updatedAt: "2026-07-08T14:00:00.000Z" },
];

const INITIAL_SALES: Sale[] = [
  { id: "sale_1", bookingRef: "JM-2026-001", leadId: "lead_4", clientName: "Marcus & Lisa Webb", clientEmail: "mwebb@corporate.com", clientPhone: "+1 212 555 0134", tourTitle: "8-Day Luxury Serengeti & Ngorongoro", tourId: 5, travelFrom: "2026-07-15", travelTo: "2026-07-22", pax: 2, amountKsh: 1800000, amountUsd: 13953, depositKsh: 600000, depositUsd: 4650, paymentStatus: "Deposit Paid", notes: "Honeymoon couple. Private vehicle, luxury tented camps. Halal meal request noted.", createdAt: "2026-06-28T10:00:00.000Z", updatedAt: "2026-06-28T10:00:00.000Z" },
  { id: "sale_2", bookingRef: "JM-2026-002", clientName: "Sarah & Tom Johnson", clientEmail: "sarah.johnson@btinternet.com", clientPhone: "+44 7700 900123", tourTitle: "7-Day Masai Mara & Lake Nakuru", tourId: 3, travelFrom: "2026-08-10", travelTo: "2026-08-16", pax: 4, amountKsh: 1200000, amountUsd: 9302, depositKsh: 400000, depositUsd: 3100, paymentStatus: "Fully Paid", notes: "Family of 4 from UK. Vegetarian meals arranged.", createdAt: "2026-07-01T09:00:00.000Z", updatedAt: "2026-07-05T12:00:00.000Z" },
  { id: "sale_3", bookingRef: "JM-2026-003", clientName: "Priya Sharma", clientEmail: "priya.s@hotmail.com", clientPhone: "+91 98765 43210", tourTitle: "3-Day Amboseli Safari", tourId: 1, travelFrom: "2026-09-05", travelTo: "2026-09-07", pax: 2, amountKsh: 360000, amountUsd: 2791, depositKsh: 120000, depositUsd: 930, paymentStatus: "Pending Deposit", notes: "First safari for both guests.", createdAt: "2026-07-09T11:00:00.000Z", updatedAt: "2026-07-09T11:00:00.000Z" },
];

const INITIAL_EXPENSES: Expense[] = [
  { id: "exp_1", date: "2026-07-01", category: "Park Fees", description: "Masai Mara conservancy fees — Johnson group (4 pax × 3 nights)", amountKsh: 96000, amountUsd: 744, receiptRef: "KWS-2026-0701", createdAt: "2026-07-01T08:00:00.000Z" },
  { id: "exp_2", date: "2026-07-02", category: "Fuel", description: "Vehicle fuel — Nairobi to Mara round trip (2 vehicles)", amountKsh: 45000, amountUsd: 349, receiptRef: "FUEL-0702", createdAt: "2026-07-02T07:30:00.000Z" },
  { id: "exp_3", date: "2026-07-03", category: "Accommodation", description: "Staff accommodation at Mara — 3 nights (guide + driver)", amountKsh: 18000, amountUsd: 140, receiptRef: "ACC-MARA-0703", createdAt: "2026-07-03T10:00:00.000Z" },
  { id: "exp_4", date: "2026-07-05", category: "Marketing", description: "Google Ads — July campaign budget", amountKsh: 25000, amountUsd: 194, receiptRef: "GA-JUL2026", createdAt: "2026-07-05T09:00:00.000Z" },
  { id: "exp_5", date: "2026-07-07", category: "Office", description: "Office supplies and printing — July", amountKsh: 8500, amountUsd: 66, receiptRef: "OFF-JUL", createdAt: "2026-07-07T14:00:00.000Z" },
  { id: "exp_6", date: "2026-07-08", category: "Vehicle Maintenance", description: "Land Cruiser service & tyre rotation", amountKsh: 35000, amountUsd: 271, receiptRef: "VEH-SERV-0708", createdAt: "2026-07-08T11:00:00.000Z" },
];

const INITIAL_REVIEWS: Review[] = [
  { id: "rev_1", clientName: "Marcus & Lisa Webb", clientCountry: "USA", tourTitle: "8-Day Luxury Serengeti & Ngorongoro", rating: 5, body: "An absolutely magical honeymoon experience. Jacmiya and the team exceeded every expectation — from the private sundowners on the Serengeti plains to the incredible wildlife sightings in Ngorongoro. Couldn't recommend more highly!", travelDate: "2026-07-15", approved: true, featured: true, createdAt: "2026-07-23T10:00:00.000Z" },
  { id: "rev_2", clientName: "Sarah Johnson", clientCountry: "United Kingdom", tourTitle: "7-Day Masai Mara & Lake Nakuru", rating: 5, body: "The whole family had the trip of a lifetime. Our guide James was extraordinary — so knowledgeable about the wildlife and made even our teenagers passionate about conservation. The lodges were stunning and the wildebeest migration was breathtaking.", travelDate: "2026-08-10", approved: true, featured: true, createdAt: "2026-08-18T09:00:00.000Z" },
  { id: "rev_3", clientName: "David Müller", clientCountry: "Germany", tourTitle: "5-Day Kenya Highlights Safari", rating: 5, body: "Perfect organisation from start to finish. Everything was seamless — airport transfers, park entries, accommodation. Saw all of the Big Five on the very first day! The team's passion for wildlife and conservation is inspiring.", travelDate: "2026-05-20", approved: true, featured: false, createdAt: "2026-05-28T14:00:00.000Z" },
  { id: "rev_4", clientName: "Priya & Raj Sharma", clientCountry: "India", tourTitle: "3-Day Amboseli Safari", rating: 4, body: "Wonderful experience for our first safari. The elephant herds against the backdrop of Kilimanjaro were simply stunning. Grace in the sales team was very helpful in tailoring the package to our needs. Will definitely be back for a longer trip!", travelDate: "2026-06-05", approved: true, featured: false, createdAt: "2026-06-12T11:00:00.000Z" },
  { id: "rev_5", clientName: "Chen Family", clientCountry: "Singapore", tourTitle: "Rwanda Gorilla Trekking & Akagera", rating: 5, body: "Words cannot describe the gorilla trekking experience. Coming face to face with a silverback in his natural habitat was the most profound wildlife encounter of our lives. Our guide was phenomenal. A truly bucket-list trip!", travelDate: "2026-03-12", approved: false, featured: false, createdAt: "2026-03-20T08:00:00.000Z" },
];

const DEFAULT_SETTINGS: AppSettings = {
  companyName: "Jacmiya Safaris",
  companyEmail: "info@jacmiyasafaris.com",
  companyPhone: "+254 716 482 995",
  companyAddress: "Nairobi, Kenya",
  companyWebsite: "https://jacmiya-safaris.vercel.app",
  tagline: "Discover the Wild Heart of Africa",
};

const INITIAL_PAYROLL: PayrollRun[] = [
  {
    id: "pay_1",
    month: "2026-06",
    label: "June 2026",
    entries: [
      { staffId: "s1", staffName: "Jacmiya Wambua",  role: "Founder & CEO",            department: "Management", baseSalary: 250000, bonus: 0,     deduction: 0, netPay: 250000, notes: "" },
      { staffId: "s2", staffName: "James Mwangi",    role: "Head Safari Guide",         department: "Guides",     baseSalary: 85000,  bonus: 5000,  deduction: 0, netPay: 90000,  notes: "Performance bonus" },
      { staffId: "s3", staffName: "Grace Njeri",     role: "Sales Manager",             department: "Sales",      baseSalary: 95000,  bonus: 15000, deduction: 0, netPay: 110000, notes: "Sales target bonus" },
      { staffId: "s4", staffName: "David Kamau",     role: "Senior Driver / Guide",     department: "Drivers",    baseSalary: 65000,  bonus: 0,     deduction: 0, netPay: 65000,  notes: "" },
      { staffId: "s5", staffName: "Sarah Wanjiku",   role: "Operations Coordinator",    department: "Operations", baseSalary: 75000,  bonus: 0,     deduction: 0, netPay: 75000,  notes: "" },
      { staffId: "s6", staffName: "Peter Ochieng",   role: "Safari Guide",              department: "Guides",     baseSalary: 70000,  bonus: 0,     deduction: 0, netPay: 70000,  notes: "" },
      { staffId: "s7", staffName: "Mary Njoroge",    role: "Admin Assistant",           department: "Admin",      baseSalary: 55000,  bonus: 0,     deduction: 0, netPay: 55000,  notes: "" },
    ],
    totalBasicKsh: 695000,
    totalBonusKsh: 20000,
    totalDeductionKsh: 0,
    totalNetKsh: 715000,
    totalNetUsd: 5543,
    rate: 129,
    processedAt: "2026-07-01T09:00:00.000Z",
    notes: "June 2026 payroll — processed on time.",
  },
];

// ─── Auth ────────────────────────────────────────────────────────────────────

export function getAdminPassword(): string {
  if (typeof window === "undefined") return DEFAULT_PASSWORD;
  return localStorage.getItem(ADMIN_PASSWORD_KEY) ?? DEFAULT_PASSWORD;
}

export function checkPassword(pwd: string): boolean { return pwd === getAdminPassword(); }
export function isAuthenticated(): boolean {
  if (typeof window === "undefined") return false;
  return sessionStorage.getItem("jm_admin") === "yes";
}
export function login(): void { sessionStorage.setItem("jm_admin", "yes"); }
export function logout(): void { sessionStorage.removeItem("jm_admin"); }

export function changeAdminPassword(newPwd: string): void {
  localStorage.setItem(ADMIN_PASSWORD_KEY, newPwd);
}

// ─── Settings ─────────────────────────────────────────────────────────────────

export function getSettings(): AppSettings {
  if (typeof window === "undefined") return DEFAULT_SETTINGS;
  const raw = localStorage.getItem(SETTINGS_KEY);
  if (raw) return { ...DEFAULT_SETTINGS, ...JSON.parse(raw) };
  return DEFAULT_SETTINGS;
}

export function saveSettings(settings: AppSettings): void {
  localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
}

// ─── Exchange Rate ────────────────────────────────────────────────────────────

export function getExchangeRate(): number {
  if (typeof window === "undefined") return DEFAULT_RATE;
  const r = localStorage.getItem(RATE_KEY);
  return r ? Number(r) : DEFAULT_RATE;
}

export function setExchangeRate(rate: number): void {
  localStorage.setItem(RATE_KEY, String(rate));
}

// ─── Booking Reference ───────────────────────────────────────────────────────

export function generateBookingRef(): string {
  if (typeof window === "undefined") return "JM-XXXX-001";
  const year = new Date().getFullYear();
  const seq = Number(localStorage.getItem(BOOKING_SEQ_KEY) ?? "0") + 1;
  localStorage.setItem(BOOKING_SEQ_KEY, String(seq));
  return `JM-${year}-${String(seq).padStart(3, "0")}`;
}

// ─── Backup & Restore ─────────────────────────────────────────────────────────

const ALL_KEYS = [TOURS_KEY, STAFF_KEY, LEAVE_KEY, RATE_KEY, LEADS_KEY, SALES_KEY, EXPENSES_KEY, PAYROLL_KEY, REVIEWS_KEY, SETTINGS_KEY, BOOKING_SEQ_KEY, ADMIN_PASSWORD_KEY];

export function exportAllData(): string {
  const data: Record<string, unknown> = { _exportedAt: new Date().toISOString(), _version: "1" };
  ALL_KEYS.forEach((key) => {
    const val = localStorage.getItem(key);
    if (val) data[key] = JSON.parse(val);
  });
  return JSON.stringify(data, null, 2);
}

export function importAllData(json: string): void {
  const data = JSON.parse(json) as Record<string, unknown>;
  ALL_KEYS.forEach((key) => {
    if (data[key] !== undefined) {
      localStorage.setItem(key, JSON.stringify(data[key]));
    }
  });
}

// ─── Tours ───────────────────────────────────────────────────────────────────

export function getTours(): AdminTour[] {
  if (typeof window === "undefined") return [];
  const raw = localStorage.getItem(TOURS_KEY);
  if (raw) {
    const tours = JSON.parse(raw) as AdminTour[];
    const needsMigration = tours.some((t) => !t.itinerary);
    if (needsMigration) {
      const migrated = tours.map((t) => ({
        ...t,
        itinerary: t.itinerary ?? (allTours.find((st) => st.id === t.id)?.itinerary ?? []),
        description: t.description ?? allTours.find((st) => st.id === t.id)?.description,
      }));
      localStorage.setItem(TOURS_KEY, JSON.stringify(migrated));
      return migrated;
    }
    return tours;
  }
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
  const newTour: AdminTour = { ...tour, id: Math.max(0, ...tours.map((t) => t.id)) + 1, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() };
  saveTours([...tours, newTour]);
  return newTour;
}

export function updateTour(id: number, updates: Partial<AdminTour>): void {
  const tours = getTours();
  const idx = tours.findIndex((t) => t.id === id);
  if (idx !== -1) { tours[idx] = { ...tours[idx], ...updates, updatedAt: new Date().toISOString() }; saveTours(tours); }
}

export function deleteTour(id: number): void { saveTours(getTours().filter((t) => t.id !== id)); }

// ─── Staff ───────────────────────────────────────────────────────────────────

export function getStaff(): StaffMember[] {
  if (typeof window === "undefined") return [];
  const raw = localStorage.getItem(STAFF_KEY);
  if (raw) return JSON.parse(raw) as StaffMember[];
  localStorage.setItem(STAFF_KEY, JSON.stringify(INITIAL_STAFF));
  return INITIAL_STAFF;
}

export function saveStaff(staff: StaffMember[]): void { localStorage.setItem(STAFF_KEY, JSON.stringify(staff)); }

export function addStaff(member: Omit<StaffMember, "id">): StaffMember {
  const newMember: StaffMember = { ...member, id: `s${Date.now()}` };
  saveStaff([...getStaff(), newMember]);
  return newMember;
}

export function updateStaff(id: string, updates: Partial<StaffMember>): void {
  const staff = getStaff();
  const idx = staff.findIndex((s) => s.id === id);
  if (idx !== -1) { staff[idx] = { ...staff[idx], ...updates }; saveStaff(staff); }
}

export function deleteStaff(id: string): void { saveStaff(getStaff().filter((s) => s.id !== id)); }

// ─── Leave ───────────────────────────────────────────────────────────────────

export function getLeave(): LeaveRequest[] {
  if (typeof window === "undefined") return [];
  const raw = localStorage.getItem(LEAVE_KEY);
  if (raw) return JSON.parse(raw) as LeaveRequest[];
  localStorage.setItem(LEAVE_KEY, JSON.stringify(INITIAL_LEAVE));
  return INITIAL_LEAVE;
}

export function saveLeave(leave: LeaveRequest[]): void { localStorage.setItem(LEAVE_KEY, JSON.stringify(leave)); }

export function addLeaveRequest(req: Omit<LeaveRequest, "id" | "requestedAt">): LeaveRequest {
  const newReq: LeaveRequest = { ...req, id: `l${Date.now()}`, requestedAt: new Date().toISOString() };
  saveLeave([...getLeave(), newReq]);
  return newReq;
}

export function updateLeave(id: string, updates: Partial<LeaveRequest>): void {
  const leave = getLeave();
  const idx = leave.findIndex((l) => l.id === id);
  if (idx !== -1) { leave[idx] = { ...leave[idx], ...updates }; saveLeave(leave); }
}

// ─── Leads ───────────────────────────────────────────────────────────────────

export function getLeads(): Lead[] {
  if (typeof window === "undefined") return [];
  const raw = localStorage.getItem(LEADS_KEY);
  if (raw) return JSON.parse(raw) as Lead[];
  localStorage.setItem(LEADS_KEY, JSON.stringify(INITIAL_LEADS));
  return INITIAL_LEADS;
}

export function saveLeads(leads: Lead[]): void { localStorage.setItem(LEADS_KEY, JSON.stringify(leads)); }

export function addLead(lead: Omit<Lead, "id" | "createdAt" | "updatedAt">): Lead {
  const newLead: Lead = { ...lead, id: `lead_${Date.now()}`, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() };
  saveLeads([...getLeads(), newLead]);
  return newLead;
}

export function updateLead(id: string, updates: Partial<Lead>): void {
  const leads = getLeads();
  const idx = leads.findIndex((l) => l.id === id);
  if (idx !== -1) { leads[idx] = { ...leads[idx], ...updates, updatedAt: new Date().toISOString() }; saveLeads(leads); }
}

export function deleteLead(id: string): void { saveLeads(getLeads().filter((l) => l.id !== id)); }

export function addFollowUp(leadId: string, note: string): void {
  const fu: FollowUp = { id: `fu_${Date.now()}`, date: new Date().toISOString(), note };
  const leads = getLeads();
  const idx = leads.findIndex((l) => l.id === leadId);
  if (idx !== -1) {
    leads[idx].followUps = [...(leads[idx].followUps ?? []), fu];
    leads[idx].updatedAt = new Date().toISOString();
    saveLeads(leads);
  }
}

// ─── Sales ───────────────────────────────────────────────────────────────────

export function getSales(): Sale[] {
  if (typeof window === "undefined") return [];
  const raw = localStorage.getItem(SALES_KEY);
  if (raw) {
    const sales = JSON.parse(raw) as Sale[];
    // Migrate old sales without bookingRef
    const needsMigration = sales.some((s) => !s.bookingRef);
    if (needsMigration) {
      const migrated = sales.map((s, i) => ({
        ...s,
        bookingRef: s.bookingRef ?? `JM-2026-${String(i + 1).padStart(3, "0")}`,
      }));
      localStorage.setItem(SALES_KEY, JSON.stringify(migrated));
      return migrated;
    }
    return sales;
  }
  localStorage.setItem(SALES_KEY, JSON.stringify(INITIAL_SALES));
  localStorage.setItem(BOOKING_SEQ_KEY, String(INITIAL_SALES.length));
  return INITIAL_SALES;
}

export function saveSales(sales: Sale[]): void { localStorage.setItem(SALES_KEY, JSON.stringify(sales)); }

export function addSale(sale: Omit<Sale, "id" | "bookingRef" | "createdAt" | "updatedAt">): Sale {
  const newSale: Sale = {
    ...sale,
    id: `sale_${Date.now()}`,
    bookingRef: generateBookingRef(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  saveSales([...getSales(), newSale]);
  return newSale;
}

export function updateSale(id: string, updates: Partial<Sale>): void {
  const sales = getSales();
  const idx = sales.findIndex((s) => s.id === id);
  if (idx !== -1) { sales[idx] = { ...sales[idx], ...updates, updatedAt: new Date().toISOString() }; saveSales(sales); }
}

export function deleteSale(id: string): void { saveSales(getSales().filter((s) => s.id !== id)); }

// ─── Expenses ─────────────────────────────────────────────────────────────────

export function getExpenses(): Expense[] {
  if (typeof window === "undefined") return [];
  const raw = localStorage.getItem(EXPENSES_KEY);
  if (raw) return JSON.parse(raw) as Expense[];
  localStorage.setItem(EXPENSES_KEY, JSON.stringify(INITIAL_EXPENSES));
  return INITIAL_EXPENSES;
}

export function saveExpenses(expenses: Expense[]): void { localStorage.setItem(EXPENSES_KEY, JSON.stringify(expenses)); }

export function addExpense(expense: Omit<Expense, "id" | "createdAt">): Expense {
  const newExp: Expense = { ...expense, id: `exp_${Date.now()}`, createdAt: new Date().toISOString() };
  saveExpenses([...getExpenses(), newExp]);
  return newExp;
}

export function updateExpense(id: string, updates: Partial<Expense>): void {
  const expenses = getExpenses();
  const idx = expenses.findIndex((e) => e.id === id);
  if (idx !== -1) { expenses[idx] = { ...expenses[idx], ...updates }; saveExpenses(expenses); }
}

export function deleteExpense(id: string): void { saveExpenses(getExpenses().filter((e) => e.id !== id)); }

// ─── Payroll ──────────────────────────────────────────────────────────────────

export function getPayroll(): PayrollRun[] {
  if (typeof window === "undefined") return [];
  const raw = localStorage.getItem(PAYROLL_KEY);
  if (raw) return JSON.parse(raw) as PayrollRun[];
  localStorage.setItem(PAYROLL_KEY, JSON.stringify(INITIAL_PAYROLL));
  return INITIAL_PAYROLL;
}

export function savePayroll(runs: PayrollRun[]): void { localStorage.setItem(PAYROLL_KEY, JSON.stringify(runs)); }

export function getPayrollRun(id: string): PayrollRun | undefined { return getPayroll().find((r) => r.id === id); }

export function isMonthProcessed(month: string): boolean { return getPayroll().some((r) => r.month === month); }

export function processPayroll(run: Omit<PayrollRun, "id" | "processedAt">): PayrollRun {
  const newRun: PayrollRun = { ...run, id: `pay_${Date.now()}`, processedAt: new Date().toISOString() };
  const expense = addExpense({
    date: run.month + "-01",
    category: "Staff Wages",
    description: `Payroll — ${run.label} (${run.entries.length} staff)`,
    amountKsh: run.totalNetKsh,
    amountUsd: run.totalNetUsd,
    receiptRef: `PAYROLL-${run.month}`,
  });
  newRun.expenseId = expense.id;
  savePayroll([...getPayroll(), newRun]);
  return newRun;
}

export function deletePayrollRun(id: string): void { savePayroll(getPayroll().filter((r) => r.id !== id)); }

// ─── Reviews ──────────────────────────────────────────────────────────────────

export function getReviews(): Review[] {
  if (typeof window === "undefined") return [];
  const raw = localStorage.getItem(REVIEWS_KEY);
  if (raw) return JSON.parse(raw) as Review[];
  localStorage.setItem(REVIEWS_KEY, JSON.stringify(INITIAL_REVIEWS));
  return INITIAL_REVIEWS;
}

export function saveReviews(reviews: Review[]): void { localStorage.setItem(REVIEWS_KEY, JSON.stringify(reviews)); }

export function addReview(review: Omit<Review, "id" | "createdAt">): Review {
  const newReview: Review = { ...review, id: `rev_${Date.now()}`, createdAt: new Date().toISOString() };
  saveReviews([...getReviews(), newReview]);
  return newReview;
}

export function updateReview(id: string, updates: Partial<Review>): void {
  const reviews = getReviews();
  const idx = reviews.findIndex((r) => r.id === id);
  if (idx !== -1) { reviews[idx] = { ...reviews[idx], ...updates }; saveReviews(reviews); }
}

export function deleteReview(id: string): void { saveReviews(getReviews().filter((r) => r.id !== id)); }

// ─── Tour capacity helpers ────────────────────────────────────────────────────

export function getBookedPaxForTour(tourId: number, travelFrom: string): number {
  return getSales()
    .filter((s) => s.tourId === tourId && s.travelFrom === travelFrom && !["Cancelled", "Refunded"].includes(s.paymentStatus))
    .reduce((a, s) => a + s.pax, 0);
}
