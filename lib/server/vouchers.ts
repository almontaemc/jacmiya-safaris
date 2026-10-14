import "server-only";
import { db } from "./db";
import type { VoucherInput } from "./validate";
import type { Voucher } from "@/types/admin";

// Dates come back as text so the client keeps getting plain "YYYY-MM-DD" strings.
export const VOUCHER_SELECT = `
  id, voucher_number, sale_id, status, issue_date::text, supplier_name, client_names,
  adults, children, arrival_date::text, arrival_time, arrival_method,
  departure_date::text, departure_time, departure_method, nights, rooms, special_notes,
  created_at, updated_at
`;

type VoucherRow = {
  id: string; voucher_number: number; sale_id: string | null; status: Voucher["status"];
  issue_date: string; supplier_name: string; client_names: string; adults: number; children: number;
  arrival_date: string; arrival_time: string; arrival_method: string;
  departure_date: string; departure_time: string; departure_method: string;
  nights: number; rooms: Voucher["rooms"]; special_notes: string; created_at: string; updated_at: string;
};

export function toVoucher(r: VoucherRow): Voucher {
  return {
    id: r.id,
    voucherNumber: r.voucher_number,
    saleId: r.sale_id ?? undefined,
    status: r.status,
    issueDate: r.issue_date,
    supplierName: r.supplier_name,
    clientNames: r.client_names,
    adults: r.adults,
    children: r.children,
    arrivalDate: r.arrival_date,
    arrivalTime: r.arrival_time,
    arrivalMethod: r.arrival_method,
    departureDate: r.departure_date,
    departureTime: r.departure_time,
    departureMethod: r.departure_method,
    nights: r.nights,
    rooms: r.rooms,
    specialNotes: r.special_notes,
    createdAt: new Date(r.created_at).toISOString(),
    updatedAt: new Date(r.updated_at).toISOString(),
  };
}

export async function listVouchers(): Promise<Voucher[]> {
  const rows = await db().query(`select ${VOUCHER_SELECT} from vouchers order by voucher_number desc`);
  return (rows as VoucherRow[]).map(toVoucher);
}

export async function getVoucher(id: string): Promise<Voucher | null> {
  const rows = await db().query(`select ${VOUCHER_SELECT} from vouchers where id = $1`, [id]);
  return rows[0] ? toVoucher(rows[0] as VoucherRow) : null;
}

/**
 * Next number = one past the highest ever used. The counter remembers numbers
 * of deleted vouchers so a number is never handed out twice.
 */
export async function nextVoucherNumber(): Promise<number> {
  const [{ next }] = (await db()`
    select greatest(
      coalesce((select value from counters where name = 'voucher'), 0),
      coalesce((select max(voucher_number) from vouchers), 0)
    ) + 1 as next
  `) as { next: number }[];
  return next;
}

export async function bumpVoucherCounter(number: number): Promise<void> {
  await db()`
    insert into counters (name, value) values ('voucher', ${number})
    on conflict (name) do update set value = greatest(counters.value, excluded.value)
  `;
}

export async function insertVoucher(id: string, v: VoucherInput, createdBy: string | null, createdAt?: string): Promise<void> {
  await db()`
    insert into vouchers (
      id, voucher_number, sale_id, status, issue_date, supplier_name, client_names, adults, children,
      arrival_date, arrival_time, arrival_method, departure_date, departure_time, departure_method,
      nights, rooms, special_notes, created_by, created_at, updated_at
    ) values (
      ${id}, ${v.voucherNumber}, ${v.saleId ?? null}, ${v.status}, ${v.issueDate}, ${v.supplierName}, ${v.clientNames},
      ${v.adults}, ${v.children}, ${v.arrivalDate}, ${v.arrivalTime}, ${v.arrivalMethod},
      ${v.departureDate}, ${v.departureTime}, ${v.departureMethod}, ${v.nights}, ${JSON.stringify(v.rooms)}::jsonb,
      ${v.specialNotes}, ${createdBy}, ${createdAt ?? new Date().toISOString()}, now()
    )
  `;
  await bumpVoucherCounter(v.voucherNumber);
}
