import { Resend } from "resend";
import { NextResponse } from "next/server";

const NOTIFY_TO = "info@jacmiyasafaris.com";
const FROM = "Jacmiya Safaris <onboarding@resend.dev>";

export async function POST(req: Request) {
  if (!process.env.RESEND_API_KEY) {
    return NextResponse.json({ ok: false, error: "Email service not configured" }, { status: 503 });
  }
  const resend = new Resend(process.env.RESEND_API_KEY);

  const body = await req.json() as {
    clientName: string;
    clientEmail: string;
    clientPhone?: string;
    bookingRef: string;
    tourTitle: string;
    travelFrom?: string;
    travelTo?: string;
    pax: number;
    amountKsh: number;
    amountUsd: number;
    depositKsh: number;
    depositUsd: number;
    paymentStatus: string;
    notes?: string;
    companyName?: string;
    companyPhone?: string;
    companyEmail?: string;
  };

  const {
    clientName, clientEmail, clientPhone, bookingRef,
    tourTitle, travelFrom, travelTo, pax,
    amountKsh, amountUsd, depositKsh, depositUsd,
    paymentStatus, notes,
    companyName = "Jacmiya Safaris",
    companyPhone = "+254 116 482 995",
    companyEmail: replyEmail = NOTIFY_TO,
  } = body;

  const balanceKsh = amountKsh - depositKsh;
  const balanceUsd = amountUsd - depositUsd;
  const isFullyPaid = paymentStatus === "Fully Paid";

  const html = `
    <div style="font-family:Arial,sans-serif;max-width:620px;margin:0 auto;background:#f9fafb;padding:24px;">
      <div style="background:#3d5a3e;padding:28px;border-radius:12px 12px 0 0;">
        <div style="display:flex;justify-content:space-between;align-items:flex-start;">
          <div>
            <h1 style="color:#fff;margin:0;font-size:22px;font-weight:bold;">${companyName}</h1>
            <p style="color:rgba(255,255,255,0.65);margin:4px 0 0;font-size:13px;">Nairobi, Kenya · ${replyEmail}</p>
          </div>
          <div style="text-align:right;">
            <p style="color:rgba(255,255,255,0.6);margin:0;font-size:11px;text-transform:uppercase;letter-spacing:0.08em;">Booking Confirmation</p>
            <p style="color:#fff;margin:4px 0 0;font-size:20px;font-weight:bold;">${bookingRef}</p>
          </div>
        </div>
      </div>

      <div style="background:#fff;padding:28px;border-radius:0 0 12px 12px;border:1px solid #e5e7eb;border-top:none;">
        <h2 style="color:#1f2937;margin:0 0 8px;font-size:18px;">Dear ${clientName},</h2>
        <p style="color:#4b5563;font-size:14px;line-height:1.7;margin:0 0 24px;">
          Thank you for booking with <strong>${companyName}</strong>! We're thrilled to be part of your East Africa adventure.
          Below is your booking confirmation — please keep this for your records.
        </p>

        <div style="background:#f0fdf4;border:1px solid #bbf7d0;border-radius:10px;padding:20px;margin-bottom:20px;">
          <p style="margin:0 0 12px;font-size:12px;color:#166534;font-weight:600;text-transform:uppercase;letter-spacing:0.05em;">Your Safari Package</p>
          <p style="margin:0 0 4px;font-size:17px;font-weight:bold;color:#1f2937;">${tourTitle}</p>
          ${travelFrom ? `<p style="margin:4px 0;font-size:13px;color:#4b5563;">Travel dates: <strong>${travelFrom}</strong> to <strong>${travelTo || "TBC"}</strong></p>` : ""}
          <p style="margin:4px 0;font-size:13px;color:#4b5563;">Travellers: <strong>${pax}</strong></p>
          ${clientPhone ? `<p style="margin:4px 0;font-size:13px;color:#4b5563;">Phone: ${clientPhone}</p>` : ""}
        </div>

        <p style="margin:0 0 10px;font-size:12px;color:#6b7280;font-weight:600;text-transform:uppercase;letter-spacing:0.05em;">Payment Summary</p>
        <table style="width:100%;border-collapse:collapse;margin-bottom:20px;">
          <thead>
            <tr style="background:#f9fafb;">
              <th style="text-align:left;padding:10px 12px;font-size:12px;color:#6b7280;border-bottom:1px solid #e5e7eb;">Description</th>
              <th style="text-align:right;padding:10px 12px;font-size:12px;color:#6b7280;border-bottom:1px solid #e5e7eb;">KSH</th>
              <th style="text-align:right;padding:10px 12px;font-size:12px;color:#6b7280;border-bottom:1px solid #e5e7eb;">USD</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td style="padding:10px 12px;font-size:13px;color:#374151;border-bottom:1px solid #f3f4f6;">Total Package (${pax} pax)</td>
              <td style="padding:10px 12px;font-size:13px;color:#1f2937;font-weight:600;text-align:right;border-bottom:1px solid #f3f4f6;">${amountKsh.toLocaleString()}</td>
              <td style="padding:10px 12px;font-size:13px;color:#1f2937;font-weight:600;text-align:right;border-bottom:1px solid #f3f4f6;">${amountUsd.toLocaleString()}</td>
            </tr>
            <tr>
              <td style="padding:10px 12px;font-size:13px;color:#374151;border-bottom:1px solid #f3f4f6;">Deposit Received</td>
              <td style="padding:10px 12px;font-size:13px;color:#059669;text-align:right;border-bottom:1px solid #f3f4f6;">(${depositKsh.toLocaleString()})</td>
              <td style="padding:10px 12px;font-size:13px;color:#059669;text-align:right;border-bottom:1px solid #f3f4f6;">(${depositUsd.toLocaleString()})</td>
            </tr>
            <tr style="background:${isFullyPaid ? "#f0fdf4" : "#fffbeb"};">
              <td style="padding:12px;font-size:14px;font-weight:700;color:#1f2937;">Balance Due</td>
              <td style="padding:12px;font-size:14px;font-weight:700;text-align:right;color:${isFullyPaid ? "#059669" : "#d97706"};">
                ${isFullyPaid ? "PAID IN FULL" : `KSH ${balanceKsh.toLocaleString()}`}
              </td>
              <td style="padding:12px;font-size:14px;font-weight:700;text-align:right;color:${isFullyPaid ? "#059669" : "#d97706"};">
                ${isFullyPaid ? "—" : `USD ${balanceUsd.toLocaleString()}`}
              </td>
            </tr>
          </tbody>
        </table>

        ${!isFullyPaid ? `
        <div style="background:#fffbeb;border:1px solid #fde68a;border-radius:8px;padding:14px;margin-bottom:20px;">
          <p style="margin:0;font-size:13px;color:#92400e;">
            <strong>Payment reminder:</strong> The remaining balance of <strong>KSH ${balanceKsh.toLocaleString()} / USD ${balanceUsd.toLocaleString()}</strong>
            is due at least 30 days before your travel date.
            Please contact us to arrange payment: <a href="mailto:${replyEmail}" style="color:#3d5a3e;">${replyEmail}</a>
          </p>
        </div>` : ""}

        ${notes ? `
        <div style="background:#f9fafb;border:1px solid #e5e7eb;border-radius:8px;padding:14px;margin-bottom:20px;">
          <p style="margin:0 0 4px;font-size:11px;color:#6b7280;font-weight:600;text-transform:uppercase;">Special Notes</p>
          <p style="margin:0;font-size:13px;color:#374151;">${notes}</p>
        </div>` : ""}

        <div style="text-align:center;margin:24px 0 8px;">
          <a href="tel:${companyPhone.replace(/\s/g, "")}" style="display:inline-block;background:#3d5a3e;color:#fff;text-decoration:none;padding:12px 28px;border-radius:50px;font-size:15px;font-weight:600;">
            Call Us: ${companyPhone}
          </a>
        </div>

        <hr style="border:none;border-top:1px solid #e5e7eb;margin:24px 0 16px;">
        <p style="color:#9ca3af;font-size:12px;text-align:center;margin:0;">
          ${companyName} · Nairobi, Kenya<br>
          ${replyEmail} · ${companyPhone}<br><br>
          This booking confirmation was sent to ${clientEmail}.<br>
          Booking reference: <strong>${bookingRef}</strong>
        </p>
      </div>
    </div>
  `;

  try {
    const [clientResult, staffResult] = await Promise.allSettled([
      resend.emails.send({
        from: FROM,
        to: clientEmail,
        replyTo: replyEmail,
        subject: `Booking Confirmed — ${bookingRef} | ${tourTitle} | ${companyName}`,
        html,
      }),
      resend.emails.send({
        from: FROM,
        to: NOTIFY_TO,
        replyTo: clientEmail,
        subject: `Booking confirmation sent to ${clientName} — ${bookingRef}`,
        html: `<p>Booking confirmation email was sent to <strong>${clientEmail}</strong> for booking <strong>${bookingRef}</strong> (${tourTitle}).</p>`,
      }),
    ]);

    return NextResponse.json({
      ok: clientResult.status === "fulfilled",
      staffOk: staffResult.status === "fulfilled",
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error("[booking-confirmation/route] email error:", msg);
    return NextResponse.json({ ok: false, error: msg }, { status: 500 });
  }
}
