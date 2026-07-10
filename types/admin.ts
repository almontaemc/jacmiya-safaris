export interface ItineraryDay {
  day: number;
  title: string;
  description: string;
  meals?: string;
  accommodation?: string;
}

export interface AdminTour {
  id: number;
  title: string;
  destination: "Kenya" | "Tanzania" | "Rwanda";
  duration: string;
  days: number;
  priceksh: number;
  priceusd: number;
  groupSize: string;
  maxPax?: number;
  image: string;
  highlights: string[];
  includes: string[];
  badge: string;
  badgeColor: string;
  active: boolean;
  createdAt: string;
  updatedAt: string;
  description?: string;
  itinerary: ItineraryDay[];
}

export type Department =
  | "Management"
  | "Guides"
  | "Drivers"
  | "Sales"
  | "Operations"
  | "Admin"
  | "Hospitality";

export type StaffStatus = "Active" | "On Leave" | "Inactive";
export type LeaveType = "Annual" | "Sick" | "Personal" | "Maternity" | "Paternity" | "Compassionate";
export type LeaveStatus = "Pending" | "Approved" | "Rejected";

export interface StaffMember {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: string;
  department: Department;
  status: StaffStatus;
  hireDate: string;
  salary: number;
  nationalId?: string;
  emergencyContact?: string;
  emergencyPhone?: string;
  bio?: string;
}

export interface LeaveRequest {
  id: string;
  staffId: string;
  staffName: string;
  type: LeaveType;
  startDate: string;
  endDate: string;
  days: number;
  reason: string;
  status: LeaveStatus;
  requestedAt: string;
  reviewedAt?: string;
  reviewNote?: string;
}

// ─── Leads ────────────────────────────────────────────────────────────────────

export type LeadStatus = "New" | "Contacted" | "Quoted" | "Negotiating" | "Won" | "Lost";
export type LeadSource = "Website" | "Referral" | "Social Media" | "Phone" | "Walk-in" | "Email";

export interface FollowUp {
  id: string;
  date: string;
  note: string;
}

export interface Lead {
  id: string;
  name: string;
  email: string;
  phone: string;
  destination: string;
  travelDates: string;
  travelers: string;
  budget: string;
  message: string;
  tourInterest: string;
  source: LeadSource;
  status: LeadStatus;
  followUps: FollowUp[];
  nextFollowUp?: string;
  convertedSaleId?: string;
  createdAt: string;
  updatedAt: string;
}

// ─── Sales / Bookings ─────────────────────────────────────────────────────────

export type PaymentStatus = "Pending Deposit" | "Deposit Paid" | "Fully Paid" | "Refunded" | "Cancelled";

export interface Sale {
  id: string;
  bookingRef: string;
  leadId?: string;
  clientName: string;
  clientEmail: string;
  clientPhone: string;
  tourTitle: string;
  tourId?: number;
  travelFrom: string;
  travelTo: string;
  pax: number;
  amountKsh: number;
  amountUsd: number;
  depositKsh: number;
  depositUsd: number;
  paymentStatus: PaymentStatus;
  notes: string;
  createdAt: string;
  updatedAt: string;
}

// ─── Expenses ─────────────────────────────────────────────────────────────────

export type ExpenseCategory =
  | "Park Fees"
  | "Fuel"
  | "Accommodation"
  | "Staff Wages"
  | "Vehicle Maintenance"
  | "Marketing"
  | "Office"
  | "Other";

export interface Expense {
  id: string;
  date: string;
  category: ExpenseCategory;
  description: string;
  amountKsh: number;
  amountUsd: number;
  receiptRef: string;
  createdAt: string;
}

// ─── Payroll ──────────────────────────────────────────────────────────────────

export interface PayrollEntry {
  staffId: string;
  staffName: string;
  role: string;
  department: Department;
  baseSalary: number;
  bonus: number;
  deduction: number;
  netPay: number;
  notes: string;
}

export interface PayrollRun {
  id: string;
  month: string;
  label: string;
  entries: PayrollEntry[];
  totalBasicKsh: number;
  totalBonusKsh: number;
  totalDeductionKsh: number;
  totalNetKsh: number;
  totalNetUsd: number;
  rate: number;
  processedAt: string;
  notes: string;
  expenseId?: string;
}

// ─── Reviews / Testimonials ───────────────────────────────────────────────────

export type ReviewRating = 1 | 2 | 3 | 4 | 5;

export interface Review {
  id: string;
  clientName: string;
  clientCountry: string;
  tourTitle: string;
  rating: ReviewRating;
  body: string;
  travelDate: string;
  approved: boolean;
  featured: boolean;
  createdAt: string;
}

// ─── App Settings ─────────────────────────────────────────────────────────────

export interface AppSettings {
  companyName: string;
  companyEmail: string;
  companyPhone: string;
  companyAddress: string;
  companyWebsite: string;
  tagline: string;
}
