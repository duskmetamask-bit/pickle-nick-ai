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
  body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; padding: 40px 48px; color: #1a1a2e; background: #fff; font-size: 13px; line-height: 1.7; }
  h1 { font-size: 20px; font-weight: 900; margin: 0 0 6px; color: #1a1a2e; }
  h2 { font-size: 15px; font-weight: 800; margin: 16px 0 6px; color: #1a1a2e; border-bottom: 1px solid #e5e7eb; padding-bottom: 4px; }
  h3 { font-size: 13px; font-weight: 700; margin: 12px 0 4px; color: #2d2d4a; }
  p { margin: 5px 0; }
  ul, ol { margin: 5px 0 5px 18px; }
  li { margin: 3px 0; }
  table { width: 100%; border-collapse: collapse; margin: 8px 0; font-size: 12px; }
  th { background: #6366f1; color: #fff; padding: 7px 10px; text-align: left; font-weight: 700; }
  td { padding: 6px 10px; border-bottom: 1px solid #e5e7eb; vertical-align: top; }
  tr:nth-child(even) td { background: #f9fafb; }
  .meta { color: #6366f1; font-size: 11px; font-weight: 600; margin-bottom: 12px; }
  strong { font-weight: 700; }
  .divider { border: none; border-top: 2px solid #6366f1; margin: 16px 0; }
</style>
</head>
<body>
${content}
</body>
</html>`;

    await page.setContent(html, { waitUntil: "networkidle" });
    const pdfBuffer: Buffer = await page.pdf({
      format: "A4",
      printBackground: true,
      margin: { top: "15mm", bottom: "15mm", left: "12mm", right: "12mm" },
    });

    await browser.close();

    return new NextResponse(new Uint8Array(pdfBuffer), {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${(title || "lesson-plan").replace(/[^a-z0-9]/gi, "-")}.pdf"`,
      },
    });

  } catch (err: unknown) {
    return NextResponse.json({ error: err instanceof Error ? err.message : "Export failed" }, { status: 500 });
  }
}
