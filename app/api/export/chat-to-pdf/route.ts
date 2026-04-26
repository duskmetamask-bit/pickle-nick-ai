import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  try {
    const { content, label } = await req.json();
    if (!content) return NextResponse.json({ error: "No content" }, { status: 400 });

    const html = `<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<style>
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; padding: 40px 50px; color: #1a1a2e; font-size: 13px; line-height: 1.6; }
  .header { border-bottom: 3px solid #6366f1; padding-bottom: 16px; margin-bottom: 24px; }
  .header-title { font-size: 22px; font-weight: 900; color: #1a1a2e; }
  .header-sub { font-size: 12px; color: #64748b; margin-top: 4px; }
  .badge { display: inline-block; background: linear-gradient(135deg, #6366f1, #22d3ee); color: white; padding: 4px 12px; border-radius: 20px; font-size: 11px; font-weight: 700; margin-bottom: 16px; }
  pre { white-space: pre-wrap; word-break: break-word; font-family: inherit; font-size: 13px; line-height: 1.7; color: #334155; }
  .footer { margin-top: 40px; padding-top: 16px; border-top: 1px solid #e2e8f0; font-size: 11px; color: #94a3b8; display: flex; justify-content: space-between; }
  table { width: 100%; border-collapse: collapse; margin: 12px 0; font-size: 12px; }
  th { background: #6366f1; color: white; padding: 8px 12px; text-align: left; font-weight: 700; }
  td { padding: 8px 12px; border: 1px solid #e2e8f0; vertical-align: top; }
  tr:nth-child(even) td { background: #f8fafc; }
  h1, h2, h3 { color: #1e293b; margin: 16px 0 8px; }
  h1 { font-size: 18px; } h2 { font-size: 15px; } h3 { font-size: 13px; }
  strong { color: #6366f1; }
</style>
</head>
<body>
<div class="header">
  <div class="badge">PickleNickAI</div>
  <div class="header-title">${(label || "Lesson Plan").charAt(0).toUpperCase() + (label || "Lesson Plan").slice(1)}</div>
  <div class="header-sub">Generated ${new Date().toLocaleDateString('en-AU', { day: 'numeric', month: 'long', year: 'numeric' })} · Australian Curriculum v9 (AC9)</div>
</div>
<pre>${content.replace(/</g, "&lt;").replace(/>/g, "&gt;")}</pre>
<div class="footer">
  <span>PickleNickAI — Teacher's AI Assistant</span>
  <span>picklenickai.com</span>
</div>
</body>
</html>`;

    const { chromium } = await import("playwright");
    const browser = await chromium.launch();
    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: "networkidle" });
    const pdf = await page.pdf({ format: "A4", printBackground: true, margin: { top: "20px", bottom: "20px", left: "20px", right: "20px" } });
    await browser.close();

    const pdfBuffer = Buffer.from(pdf);
    return new NextResponse(pdfBuffer, {
      headers: { "Content-Type": "application/pdf", "Content-Disposition": "attachment" },
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "PDF generation failed";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}