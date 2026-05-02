import { NextResponse } from "next/server";

function getResend() {
  if (!process.env.RESEND_API_KEY) return null;
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const { Resend } = require("resend");
  return new Resend(process.env.RESEND_API_KEY);
}

const EMAIL_HTML = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
</head>
<body style="margin:0;padding:0;background:#f8f7ff;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
  <div style="padding:32px 0;">
    <div style="max-width:560px;margin:0 auto;background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(99,102,241,0.08);">
      <!-- Header -->
      <div style="background:linear-gradient(135deg,#6366f1,#818cf8);padding:28px 32px;text-align:center;">
        <div style="display:inline-block;width:48px;height:48px;border-radius:12px;background:rgba(255,255,255,0.2);color:#fff;font-weight:900;font-size:18px;line-height:48px;margin-bottom:12px;">PN</div>
        <h1 style="color:#ffffff;font-size:22px;font-weight:800;letter-spacing:-0.02em;margin:0;">Welcome to PickleNickAI</h1>
        <p style="color:rgba(255,255,255,0.8);font-size:13px;margin-top:6px;margin-bottom:0;">Your AI teaching assistant for Australian F–6 classrooms</p>
      </div>

      <!-- Body -->
      <div style="padding:28px 32px;">
        <p style="font-size:14px;color:#4a4a6a;line-height:1.7;margin:0 0 16px;">
          Hi TEACHER_NAME,<br/><br/>
          Welcome aboard! PickleNickAI is your personal AI teaching colleague — trained on the Australian curriculum (AC9), ready to help with lesson plans, rubrics, behaviour support, writing feedback, and more.
        </p>

        <p style="font-size:14px;font-weight:700;color:#1a1a2e;margin-bottom:8px;">Here's what you can ask me:</p>
        <ul style="list-style:none;padding:0;margin:0 0 20px;display:flex;flex-direction:column;gap:8px;">
          ${["Lesson plans for any year level and subject", "Criterion-referenced rubrics aligned to AC9", "Behaviour support plans and strategies", "Writing feedback and auto-marking", "Worksheet generator for any topic", "Report comments and parent emails"].map(item => `
            <li style="display:flex;align-items:flex-start;gap:10px;font-size:13px;color:#4a4a6a;">
              <span style="width:16px;height:16px;border-radius:50%;background:rgba(99,102,241,0.1);display:inline-flex;align-items:center;justify-content:center;flex-shrink:0;margin-top:2px;">
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#6366f1" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
                  <polyline points="20 6 9 17 4 12"/>
                </svg>
              </span>
              ${item}
            </li>
          `).join('')}
        </ul>

        <!-- Tip box -->
        <div style="background:#f0f0ff;border:1px solid rgba(99,102,241,0.15);border-radius:10px;padding:14px 16px;margin-bottom:20px;">
          <p style="font-size:11px;font-weight:700;color:#6366f1;text-transform:uppercase;letter-spacing:0.06em;margin:0 0 6px;">💡 Getting started tip</p>
          <p style="font-size:13px;color:#4a4a6a;line-height:1.6;margin:0;">
            Try starting with: <em>"Generate a Year 4 History lesson plan on British Colonisation"</em> — or anything else you need. Be as specific as you like about year level, subject, and what you need.
          </p>
        </div>

        <a href="DASHBOARD_URL" style="display:inline-block;background:linear-gradient(135deg,#6366f1,#818cf8);color:#fff;font-weight:700;font-size:14px;padding:12px 24px;border-radius:10px;text-decoration:none;margin-top:8px;">Open Your Dashboard →</a>
      </div>

      <!-- Footer -->
      <div style="background:#f8f7ff;padding:20px 32px;text-align:center;border-top:1px solid rgba(99,102,241,0.08);">
        <p style="font-size:11px;color:#9090b0;margin:0;">Your sessions are private — no student data is ever stored. Built for Australian teachers.</p>
      </div>
    </div>
  </div>
</body>
</html>`;

export async function POST(req: Request) {
  try {
    const { to, name } = await req.json();

    if (!to || !name) {
      return NextResponse.json({ error: "Missing to or name" }, { status: 400 });
    }

    if (!process.env.RESEND_API_KEY) {
      console.warn("RESEND_API_KEY not configured, skipping welcome email");
      return NextResponse.json({ skipped: true });
    }

    const resend = getResend();
    if (!resend) return NextResponse.json({ skipped: true });

    const dashboardUrl = process.env.NEXT_PUBLIC_APP_URL
      ? `${process.env.NEXT_PUBLIC_APP_URL}/picklenickai`
      : "https://pickle-nick-ai.vercel.app/picklenickai";

    const html = EMAIL_HTML
      .replace("TEACHER_NAME", name)
      .replace("DASHBOARD_URL", dashboardUrl);

    const { error } = await resend.emails.send({
      from: "PickleNickAI <hello@picklenickai.com>",
      to,
      subject: `Welcome to PickleNickAI, ${name}! 🎉`,
      html,
    });

    if (error) {
      console.error("Resend error:", error);
      return NextResponse.json({ error }, { status: 500 });
    }

    return NextResponse.json({ success: true, sentTo: to });
  } catch (err) {
    console.error("Welcome email error:", err);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}