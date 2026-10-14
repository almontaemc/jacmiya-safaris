import "server-only";
import { ADMIN_SECTIONS } from "@/lib/adminAccess";
import type { AdminSection, UserRole, Voucher, VoucherRoomType, VoucherStatus } from "@/types/admin";

/** Thrown for bad input; route handlers turn it into a 400 with this message. */
export class InputError extends Error {}

const ROLES: UserRole[] = ["Owner", "Admin", "Manager", "Staff"];
// Managing users is reserved for full-access accounts, so it can't be granted as a section.
const SECTION_KEYS: AdminSection[] = ADMIN_SECTIONS.map((s) => s.key).filter((k) => k !== "users");
const STATUSES: VoucherStatus[] = ["Confirm", "Amend", "Request"];
const ROOM_TYPES: VoucherRoomType[] = ["twinRooms", "singleRooms", "tripleRooms", "suitesCottages", "doubleTents", "singleTents"];
export const MIN_PASSWORD = 8;

function str(v: unknown, field: string, { required = false, max = 500 } = {}): string {
  const s = typeof v === "string" ? v.trim() : v == null ? "" : String(v).trim();
  if (required && !s) throw new InputError(`${field} is required.`);
  if (s.length > max) throw new InputError(`${field} is too long.`);
  return s;
}

function int(v: unknown, field: string, min = 0): number {
  const n = Number(v ?? 0);
  if (!Number.isInteger(n) || n < min) throw new InputError(`${field} must be a whole number of ${min} or more.`);
  return n;
}

function isoDate(v: unknown, field: string): string {
  const s = str(v, field, { required: true, max: 10 });
  if (!/^\d{4}-\d{2}-\d{2}$/.test(s) || Number.isNaN(Date.parse(s))) throw new InputError(`${field} is not a valid date.`);
  return s;
}

export function email(v: unknown): string {
  const s = str(v, "Email", { required: true, max: 200 }).toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s)) throw new InputError("Email is not valid.");
  return s;
}

export function password(v: unknown, field = "Password"): string {
  if (typeof v !== "string" || v.length < MIN_PASSWORD) throw new InputError(`${field} must be at least ${MIN_PASSWORD} characters.`);
  if (v.length > 200) throw new InputError(`${field} is too long.`);
  return v;
}

export function role(v: unknown): UserRole {
  if (!ROLES.includes(v as UserRole)) throw new InputError("Role is not valid.");
  return v as UserRole;
}

/** `undefined`/`null` = full access; otherwise a non-empty list of known sections. */
export function access(v: unknown): AdminSection[] | null {
  if (v == null) return null;
  if (!Array.isArray(v)) throw new InputError("Access must be a list of sections.");
  const list = [...new Set(v)].filter((k): k is AdminSection => SECTION_KEYS.includes(k as AdminSection));
  if (list.length === 0) throw new InputError("Tick at least one section, or choose Full access.");
  return list;
}

export function userFields(body: Record<string, unknown>) {
  return {
    name: str(body.name, "Name", { required: true, max: 120 }),
    email: email(body.email),
    role: role(body.role),
    jobTitle: str(body.jobTitle, "Job title", { max: 120 }) || null,
    access: access(body.access),
  };
}

export type VoucherInput = Omit<Voucher, "id" | "createdAt" | "updatedAt">;

export function voucherFields(body: Record<string, unknown>): VoucherInput {
  const status = body.status as VoucherStatus;
  if (!STATUSES.includes(status)) throw new InputError("Voucher type must be Confirm, Amend or Request.");

  const arrivalDate = isoDate(body.arrivalDate, "Arrival date");
  const departureDate = isoDate(body.departureDate, "Departure date");
  if (departureDate < arrivalDate) throw new InputError("Departure date is before the arrival date.");

  const rawRooms = (body.rooms ?? {}) as Record<string, unknown>;
  const rooms = Object.fromEntries(ROOM_TYPES.map((k) => [k, int(rawRooms[k], "Room quantity")])) as Record<VoucherRoomType, number>;

  return {
    voucherNumber: int(body.voucherNumber, "Voucher number", 1),
    saleId: str(body.saleId, "Booking", { max: 100 }) || undefined,
    status,
    issueDate: isoDate(body.issueDate, "Voucher date"),
    supplierName: str(body.supplierName, "Lodge / hotel", { required: true, max: 200 }),
    clientNames: str(body.clientNames, "Client names", { required: true, max: 300 }),
    adults: int(body.adults, "Adults"),
    children: int(body.children, "Children"),
    arrivalDate,
    arrivalTime: str(body.arrivalTime, "Arrival time", { max: 60 }),
    arrivalMethod: str(body.arrivalMethod, "Method of arrival", { max: 60 }),
    departureDate,
    departureTime: str(body.departureTime, "Departure time", { max: 60 }),
    departureMethod: str(body.departureMethod, "Method of departure", { max: 60 }),
    nights: int(body.nights, "Nights"),
    rooms,
    specialNotes: str(body.specialNotes, "Special notes", { max: 4000 }),
  };
}
