import nodemailer from "nodemailer";
import { NextResponse } from "next/server";

const NOTIFY_TO = "info@jacmiyasafaris.com";

function createTransport() {
  const port = Number(process.env.SMTP_PORT ?? 587);
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST ?? "mail.jacmiyasafaris.com",
    port,
    secure: port === 465,
    auth: {
      user: process.env.SMTP_USER ?? NOTIFY_TO,
      pass: process.env.SMTP_PASS,
    },
  });
}

export async function POST(req: Request) {
  if (!process.env.SMTP_PASS) {
    return NextResponse.json({ ok: false, error: "Email service not configured" }, { status: 503 });
  }

  const body = await req.json() as {
    name: string;
    email: string;
    phone?: string;
    destination?: string;
    travelers?: string;
    dates?: string;
    budget?: string;
    message?: string;
    tourInterest?: string;
  };

  const { name, email, phone, destination, travelers, dates, budget, message, tourInterest } = body;

  const rows = [
    ["Name", name],
    ["Email", email],
    ["Phone", phone || "—"],
    ["Tour of Interest", tourInterest || "Custom Safari"],
    ["Destination", destination || "—"],
    ["Travellers", travelers || "—"],
    ["Travel Dates", dates || "—"],
    ["Budget (USD/pp)", budget || "—"],
  ];

  const tableRows = rows.map(([label, value]) =>
    `<tr><td style="padding:6px 12px;color:#6b7280;font-size:13px;white-space:nowrap;">${label}</td><td style="padding:6px 12px;color:#111827;font-size:13px;font-weight:500;">${value}</td></tr>`
  ).join("");

  const staffHtml = `
    <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;background:#f9fafb;padding:24px;">
      <div style="background:#3d5a3e;padding:24px 28px;border-radius:12px 12px 0 0;">
        <h1 style="color:#fff;margin:0;font-size:20px;">New Safari Enquiry</h1>
        <p style="color:rgba(255,255,255,0.7);margin:4px 0 0;font-size:13px;">Submitted via jacmiyasafaris.com</p>
      </div>
      <div style="background:#fff;padding:24px 28px;border-radius:0 0 12px 12px;border:1px solid #e5e7eb;border-top:none;">
        <table style="width:100%;border-collapse:collapse;">
          ${tableRows}
        </table>
        ${message ? `
        <div style="margin-top:16px;padding:16px;background:#f3f4f6;border-radius:8px;">
          <p style="margin:0 0 6px;font-size:12px;color:#6b7280;font-weight:600;text-transform:uppercase;letter-spacing:0.05em;">Message</p>
          <p style="margin:0;font-size:13px;color:#374151;line-height:1.6;">${message}</p>
        </div>` : ""}
        <div style="margin-top:20px;padding-top:16px;border-top:1px solid #e5e7eb;">
          <a href="mailto:${email}" style="display:inline-block;background:#3d5a3e;color:#fff;text-decoration:none;padding:10px 20px;border-radius:8px;font-size:13px;font-weight:600;">Reply to ${name}</a>
          ${phone ? `<a href="tel:${phone}" style="display:inline-block;margin-left:8px;background:#fff;color:#3d5a3e;text-decoration:none;padding:10px 20px;border-radius:8px;font-size:13px;font-weight:600;border:1px solid #3d5a3e;">Call ${phone}</a>` : ""}
        </div>
      </div>
    </div>
  `;

  const clientHtml = `
    <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;background:#f9fafb;padding:24px;">
      <div style="background:#3d5a3e;padding:32px 28px;border-radius:12px 12px 0 0;text-align:center;">
        <h1 style="color:#fff;margin:0 0 6px;font-size:26px;font-weight:bold;">Jacmiya Safaris</h1>
        <p style="color:rgba(255,255,255,0.7);margin:0;font-size:14px;">Discover the Wild Heart of Africa</p>
      </div>
      <div style="background:#fff;padding:32px 28px;border-radius:0 0 12px 12px;border:1px solid #e5e7eb;border-top:none;">
        <h2 style="color:#1f2937;margin:0 0 12px;font-size:20px;">Thank you, ${name}!</h2>
        <p style="color:#4b5563;font-size:15px;line-height:1.7;margin:0 0 16px;">
          We've received your safari enquiry and our team is already working on a personalised proposal for you.
          You can expect to hear from us within <strong>24 hours</strong>.
        </p>
        <div style="background:#f0fdf4;border:1px solid #bbf7d0;border-radius:10px;padding:20px;margin:20px 0;">
          <p style="margin:0 0 10px;font-size:13px;color:#166534;font-weight:600;text-transform:uppercase;letter-spacing:0.05em;">Your Enquiry Summary</p>
          <table style="width:100%;border-collapse:collapse;">
            ${tableRows}
          </table>
        </div>
        <p style="color:#4b5563;font-size:14px;line-height:1.7;margin:16px 0;">
          In the meantime, feel free to browse our tours or give us a call:
        </p>
        <div style="text-align:center;margin:24px 0;">
          <a href="https://jacmiyasafaris.com/tours" style="display:inline-block;background:#3d5a3e;color:#fff;text-decoration:none;padding:12px 28px;border-radius:50px;font-size:15px;font-weight:600;margin:0 6px 8px;">Browse Tours</a>
          <a href="tel:+254116482995" style="display:inline-block;background:#fff;color:#3d5a3e;text-decoration:none;padding:12px 28px;border-radius:50px;font-size:15px;font-weight:600;border:2px solid #3d5a3e;margin:0 6px 8px;">+254 116 482 995</a>
        </div>
        <hr style="border:none;border-top:1px solid #e5e7eb;margin:24px 0;">
        <p style="color:#9ca3af;font-size:12px;text-align:center;margin:0;">
          Jacmiya Safaris · Nairobi, Kenya · info@jacmiyasafaris.com<br>
          You received this because you submitted an enquiry on our website.
        </p>
      </div>
    </div>
  `;

  try {
    const transport = createTransport();
    const [staffResult, clientResult] = await Promise.allSettled([
      transport.sendMail({
        from: `"Jacmiya Safaris" <${NOTIFY_TO}>`,
        to: NOTIFY_TO,
        replyTo: email,
        subject: `New Safari Enquiry — ${name} (${destination || tourInterest || "Custom"})`,
        html: staffHtml,
      }),
      transport.sendMail({
        from: `"Jacmiya Safaris" <${NOTIFY_TO}>`,
        to: email,
        replyTo: NOTIFY_TO,
        subject: `Your Jacmiya Safaris Enquiry — We'll be in touch within 24 hours`,
        html: clientHtml,
      }),
    ]);

    return NextResponse.json({
      ok: staffResult.status === "fulfilled",
      autoReplyOk: clientResult.status === "fulfilled",
      staffError: staffResult.status === "rejected" ? (staffResult.reason as Error)?.message : null,
      clientError: clientResult.status === "rejected" ? (clientResult.reason as Error)?.message : null,
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error("[contact/route] email error:", msg);
    return NextResponse.json({ ok: false, error: msg }, { status: 500 });
  }
}
