export interface AdminTour {
  id: number;
  title: string;
  destination: "Kenya" | "Tanzania" | "Rwanda";
  duration: string;
  days: number;
  priceksh: number;
  priceusd: number;
  groupSize: string;
  image: string;
  highlights: string[];
  includes: string[];
  badge: string;
  badgeColor: string;
  active: boolean;
  createdAt: string;
  updatedAt: string;
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
