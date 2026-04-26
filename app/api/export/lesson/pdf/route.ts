import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  try {
    const { content, title, week, subject, yearLevel } = await req.json();
    if (!content) return NextResponse.json({ error: "content required" }, { status: 400 });

    const browser = await import("playwright").then(p => p.chromium.launch());
    const page = await browser.newPage();

    // Clean and format content for classroom use
    const html = `<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body {
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    padding: 36px 40px 40px;
    color: #1a1a2e;
    background: #fff;
    font-size: 12px;
    line-height: 1.7;
  }
  /* Header bar */
  .header-bar {
    background: #6366f1;
    color: #fff;
    padding: 10px 16px;
    border-radius: 8px 8px 0 0;
    margin: -36px -40px 24px;
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
  .header-bar .logo { font-weight: 900; font-size: 13px; letter-spacing: 1px; }
  .header-bar .meta { font-size: 11px; opacity: 0.85; }
  /* Meta row */
  .meta-row {
    display: flex;
    gap: 12px;
    flex-wrap: wrap;
    margin-bottom: 16px;
    padding: 10px 14px;
    background: #f0f1ff;
    border-radius: 8px;
    border: 1px solid #dde0ff;
  }
  .meta-item { font-size: 11px; }
  .meta-item .label { color: #6366f1; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em; }
  .meta-item .value { color: #1a1a2e; font-weight: 600; margin-top: 1px; }
  /* Sections */
  h1 { font-size: 20px; font-weight: 900; margin-bottom: 4px; color: #1a1a2e; }
  h2 {
    font-size: 14px; font-weight: 800; margin: 20px 0 8px;
    color: #1a1a2e; border-bottom: 2px solid #6366f1;
    padding-bottom: 5px;
  }
  h3 { font-size: 13px; font-weight: 700; margin: 12px 0 5px; color: #2d2d4a; }
  p { margin: 5px 0; }
  ul, ol { margin: 5px 0 5px 18px; }
  li { margin: 3px 0; }
  table { width: 100%; border-collapse: collapse; margin: 8px 0; font-size: 11px; border-radius: 8px; overflow: hidden; border: 1px solid #e5e7eb; }
  th {
    background: #6366f1; color: #fff; padding: 7px 10px;
    text-align: left; font-weight: 700; font-size: 11px;
  }
  td { padding: 6px 10px; border-bottom: 1px solid #e5e7eb; vertical-align: top; }
  tr:nth-child(even) td { background: #f9fafb; }
  tr:last-child td { border-bottom: none; }
  /* Highlight boxes */
  .highlight-box {
    background: #fffbeb;
    border: 1px solid #fcd34d;
    border-left: 4px solid #f59e0b;
    border-radius: 6px;
    padding: 8px 12px;
    margin: 8px 0;
    font-size: 11px;
  }
  .highlight-box.objectives { background: #f0fdf4; border-color: #86efac; border-left-color: #22c55e; }
  .highlight-box.differentiation { background: #f0f9ff; border-color: #7dd3fc; border-left-color: #0ea5e9; }
  .highlight-box.resources { background: #faf5ff; border-color: #d8b4fe; border-left-color: #a855f7; }
  .highlight-box .box-label { font-weight: 800; font-size: 10px; text-transform: uppercase; letter-spacing: 0.08em; margin-bottom: 4px; }
  .highlight-box.objectives .box-label { color: #16a34a; }
  .highlight-box.differentiation .box-label { color: #0284c7; }
  .highlight-box.resources .box-label { color: #9333ea; }
  .highlight-box.assessment .box-label { color: #ea580c; }
  /* Phase rows */
  .phase-row { display: flex; gap: 8px; margin: 6px 0; align-items: flex-start; }
  .phase-label {
    background: #6366f1; color: #fff;
    font-size: 10px; font-weight: 700;
    padding: 3px 8px;
    border-radius: 20px;
    flex-shrink: 0;
    min-width: 60px;
    text-align: center;
  }
  .phase-content { flex: 1; font-size: 12px; }
  strong { font-weight: 700; color: #1a1a2e; }
  hr { border: none; border-top: 1px solid #e5e7eb; margin: 14px 0; }
  /* Footer */
  .footer {
    margin-top: 24px;
    padding-top: 12px;
    border-top: 2px solid #6366f1;
    display: flex;
    justify-content: space-between;
    font-size: 10px;
    color: #9ca3af;
  }
  /* Typography */
  .lesson-title { font-size: 9px; text-transform: uppercase; letter-spacing: 0.1em; color: #6366f1; font-weight: 700; margin-bottom: 4px; }
  .week-label { font-size: 9px; text-transform: uppercase; letter-spacing: 0.08em; color: #9ca3af; margin-bottom: 6px; }
</style>
</head>
<body>

<div class="header-bar">
  <span class="logo">PICKLENICKAI</span>
  <span class="meta">Australian Curriculum v9 · F-6 Teaching Resource</span>
</div>

<div class="meta-row">
  ${subject ? `<div class="meta-item"><div class="label">Subject</div><div class="value">${subject}</div></div>` : ""}
  ${yearLevel ? `<div class="meta-item"><div class="label">Year Level</div><div class="value">${yearLevel}</div></div>` : ""}
  ${week ? `<div class="meta-item"><div class="label">Week</div><div class="value">${week}</div></div>` : ""}
  <div class="meta-item"><div class="label">Duration</div><div class="value">_______________ mins</div></div>
  <div class="meta-item"><div class="label">Date</div><div class="value">_______________</div></div>
  <div class="meta-item"><div class="label">Teacher</div><div class="value">_______________</div></div>
</div>

<div class="week-label">${week || ""}</div>
<div class="lesson-title">Lesson Plan</div>
<h1>${title || "Lesson"}</h1>

${content}

<div class="footer">
  <span>Created with PickleNickAI · picklenickai.com</span>
  <span>Australian Curriculum v9 aligned</span>
</div>

</body>
</html>`;

    await page.setContent(html, { waitUntil: "networkidle" });
    const pdfBuffer: Buffer = await page.pdf({
      format: "A4",
      printBackground: true,
      margin: { top: "12mm", bottom: "12mm", left: "12mm", right: "12mm" },
    });

    await browser.close();

    const safeName = (title || "lesson-plan").replace(/[^a-z0-9]/gi, "-");
    return new NextResponse(new Uint8Array(pdfBuffer), {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${safeName}.pdf"`,
      },
    });

  } catch (err: unknown) {
    return NextResponse.json({ error: err instanceof Error ? err.message : "Export failed" }, { status: 500 });
  }
}
