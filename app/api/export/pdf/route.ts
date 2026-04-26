import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  try {
    const { content, title } = await req.json();

    if (!content) {
      return NextResponse.json({ error: "content is required" }, { status: 400 });
    }

    const browser = await import("playwright").then(p => p.chromium.launch());
    const page = await browser.newPage();

    const html = `
<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; padding: 48px 56px; color: #1a1a2e; background: #fff; font-size: 13px; line-height: 1.7; }
  h1 { font-size: 22px; font-weight: 900; margin-bottom: 8px; color: #1a1a2e; }
  h2 { font-size: 16px; font-weight: 800; margin: 20px 0 8px; color: #1a1a2e; border-bottom: 1px solid #e5e7eb; padding-bottom: 6px; }
  h3 { font-size: 14px; font-weight: 700; margin: 14px 0 6px; color: #2d2d4a; }
  p { margin: 6px 0; }
  ul, ol { margin: 6px 0 6px 20px; }
  li { margin: 3px 0; }
  table { width: 100%; border-collapse: collapse; margin: 10px 0; font-size: 12px; }
  th { background: #6366f1; color: #fff; padding: 8px 10px; text-align: left; font-weight: 700; }
  td { padding: 7px 10px; border-bottom: 1px solid #e5e7eb; vertical-align: top; }
  tr:nth-child(even) td { background: #f9fafb; }
  .badge { display: inline-block; background: rgba(99,102,241,0.12); color: #6366f1; padding: 2px 10px; border-radius: 20px; font-size: 11px; font-weight: 600; margin-right: 6px; }
  .header { margin-bottom: 24px; padding-bottom: 16px; border-bottom: 2px solid #6366f1; }
  strong { font-weight: 700; color: #1a1a2e; }
</style>
</head>
<body>
<div class="header">
  <h1>${(title || "Unit Plan").replace(/<[^>]+>/g, "")}</h1>
</div>
${content}
</body>
</html>`;

    await page.setContent(html, { waitUntil: "networkidle" });
    const pdfBuffer: Buffer = await page.pdf({
      format: "A4",
      printBackground: true,
      margin: { top: "20mm", bottom: "20mm", left: "15mm", right: "15mm" },
    });

    await browser.close();

    return new NextResponse(new Uint8Array(pdfBuffer), {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${(title || "unit-plan").replace(/[^a-z0-9]/gi, "-")}.pdf"`,
      },
    });

  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Export failed";
    console.error("[export/pdf]", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
