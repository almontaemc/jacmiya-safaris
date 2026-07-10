// Client-side report download utilities (no external dependencies)

export function downloadCSV(filename: string, headers: string[], rows: (string | number)[][]) {
  const esc = (v: string | number) => `"${String(v).replace(/"/g, '""')}"`;
  const csv = [headers.map(esc).join(","), ...rows.map((r) => r.map(esc).join(","))].join("\n");
  trigger(new Blob(["﻿" + csv], { type: "text/csv;charset=utf-8;" }), filename);
}

export function downloadExcel(
  filename: string,
  sheetName: string,
  headers: string[],
  rows: (string | number)[][]
) {
  const x = (v: string | number) =>
    String(v)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  const cell = (v: string | number, s?: string) =>
    `<Cell${s ? ` ss:StyleID="${s}"` : ""}><Data ss:Type="${typeof v === "number" ? "Number" : "String"}">${x(v)}</Data></Cell>`;
  const xml = `<?xml version="1.0" encoding="UTF-8"?><?mso-application progid="Excel.Sheet"?>
<Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet" xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet">
  <Styles>
    <Style ss:ID="h"><Font ss:Bold="1" ss:Color="#FFFFFF"/><Interior ss:Color="#3D5A3E" ss:Pattern="Solid"/></Style>
    <Style ss:ID="ft"><Font ss:Bold="1"/><Interior ss:Color="#F3F4F6" ss:Pattern="Solid"/></Style>
  </Styles>
  <Worksheet ss:Name="${sheetName}"><Table>
    <Row>${headers.map((h) => cell(h, "h")).join("")}</Row>
    ${rows.map((r) => `<Row>${r.map((v) => cell(v)).join("")}</Row>`).join("\n    ")}
  </Table></Worksheet>
</Workbook>`;
  trigger(new Blob([xml], { type: "application/vnd.ms-excel;charset=utf-8;" }), filename);
}

function trigger(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = Object.assign(document.createElement("a"), { href: url, download: filename });
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export type DatePreset = "this-month" | "last-month" | "this-quarter" | "this-year" | "all";

export function getDateRange(preset: DatePreset): { from: string; to: string } {
  const d = new Date();
  const y = d.getFullYear(), m = d.getMonth();
  if (preset === "this-month") return { from: toDate(y, m, 1), to: toDate(y, m + 1, 0) };
  if (preset === "last-month") return { from: toDate(y, m - 1, 1), to: toDate(y, m, 0) };
  if (preset === "this-quarter") {
    const q = Math.floor(m / 3);
    return { from: toDate(y, q * 3, 1), to: toDate(y, q * 3 + 3, 0) };
  }
  if (preset === "this-year") return { from: `${y}-01-01`, to: `${y}-12-31` };
  return { from: "2000-01-01", to: "2099-12-31" };
}

function toDate(year: number, month: number, day: number): string {
  return new Date(year, month, day).toISOString().slice(0, 10);
}

export function inRange(dateStr: string, from: string, to: string): boolean {
  if (!dateStr) return true;
  const d = dateStr.slice(0, 10);
  return d >= from && d <= to;
}

export function fmtDate(iso: string): string {
  if (!iso) return "—";
  try {
    return new Date(iso).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
  } catch {
    return iso.slice(0, 10);
  }
}

export function fmtK(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(0)}K`;
  return String(n);
}

export const PRESET_LABELS: Record<DatePreset, string> = {
  "this-month": "This Month",
  "last-month": "Last Month",
  "this-quarter": "This Quarter",
  "this-year": "This Year",
  "all": "All Time",
};
