import AdminShell from "@/components/admin/AdminShell";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <style>{`
        @media print {
          @page { size: A4 landscape; margin: 1.2cm; }
          /* Hide sidebar, header, controls */
          aside, nav, header,
          .print\\:hidden { display: none !important; }
          /* Make overflow containers fully visible */
          .overflow-x-auto,
          .overflow-hidden { overflow: visible !important; }
          /* Reset shadows and border-radius for clean print */
          .shadow-sm, .shadow { box-shadow: none !important; }
          .rounded-2xl, .rounded-xl { border-radius: 0 !important; }
          /* Compact table typography */
          table { font-size: 9pt !important; width: 100% !important; border-collapse: collapse !important; }
          th, td { padding: 5px 7px !important; white-space: normal !important; }
          .whitespace-nowrap { white-space: normal !important; }
          .truncate { overflow: visible !important; white-space: normal !important; text-overflow: clip !important; }
          [class*="max-w-\\["] { max-width: none !important; }
          /* Ensure background colours print */
          * { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
          /* Full width layout */
          body, main { width: 100% !important; max-width: 100% !important; padding: 0 !important; margin: 0 !important; }
        }
      `}</style>
      <AdminShell>{children}</AdminShell>
    </>
  );
}
