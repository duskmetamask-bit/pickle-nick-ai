import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

const SUBJECT_THEMES: Record<string, { primary: string; secondary: string; bg: string; accent: string; label: string }> = {
  mathematics: { primary: "#2563eb", secondary: "#DBEAFE", bg: "#EFF6FF", accent: "#1d4ed8", label: "Mathematics" },
  english: { primary: "#7C3AED", secondary: "#EDE9FE", bg: "#F5F3FF", accent: "#6d28d9", label: "English" },
  science: { primary: "#16A34A", secondary: "#DCFCE7", bg: "#F0FDF4", accent: "#15803d", label: "Science" },
  hass: { primary: "#EA580C", secondary: "#FEEBC8", bg: "#FFFAF0", accent: "#c2410c", label: "HASS" },
  technologies: { primary: "#0891B2", secondary: "#CFFAFE", bg: "#ECFEFF", accent: "#0e7490", label: "Technologies" },
  "the arts": { primary: "#DB2777", secondary: "#FCE7F3", bg: "#FDF2F8", accent: "#be185d", label: "The Arts" },
  "health & physical education": { primary: "#0D9488", secondary: "#CCFBF1", bg: "#F0FDFA", accent: "#0f766e", label: "Health & PE" },
  languages: { primary: "#9333EA", secondary: "#F3E8FF", bg: "#FAF5FF", accent: "#7e22ce", label: "Languages" },
};

function getTheme(subject?: string) {
  const key = (subject || "general").toLowerCase();
  return SUBJECT_THEMES[key] || { primary: "#6366f1", secondary: "#e0e7ff", bg: "#f5f6ff", accent: "#4338ca" };
}

export async function POST(req: NextRequest) {
  try {
    const { content, title, week, subject, yearLevel } = await req.json();
    if (!content) return NextResponse.json({ error: "content required" }, { status: 400 });

    const theme = getTheme(subject);
    const safeName = (title || "lesson-plan").replace(/[^a-z0-9]/gi, "-");

    const browser = await import("playwright").then(p => p.chromium.launch());
    const page = await browser.newPage();

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
  .header-bar {
    background: ${theme.primary};
    color: #fff;
    padding: 10px 16px;
    margin: -36px -40px 24px;
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
  .header-bar .logo { font-weight: 900; font-size: 13px; letter-spacing: 1px; }
  .header-bar .meta { font-size: 11px; opacity: 0.85; }
  .subject-badge {
    background: ${theme.secondary};
    color: ${theme.accent};
    font-size: 10px;
    font-weight: 800;
    padding: 3px 10px;
    border-radius: 20px;
    display: inline-block;
    margin-bottom: 10px;
    text-transform: uppercase;
    letter-spacing: 0.08em;
  }
  .meta-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 8px;
    margin-bottom: 18px;
  }
  .meta-cell {
    background: ${theme.bg};
    border: 1.5px solid ${theme.secondary};
    border-radius: 8px;
    padding: 7px 10px;
  }
  .meta-cell .meta-label {
    font-size: 9px;
    font-weight: 800;
    text-transform: uppercase;
    letter-spacing: 0.08em;
    color: ${theme.accent};
    margin-bottom: 2px;
  }
  .meta-cell .meta-value {
    font-size: 12px;
    font-weight: 600;
    color: #1a1a2e;
    min-height: 16px;
  }
  .meta-cell .meta-line {
    border-bottom: 1.5px solid ${theme.secondary};
    height: 14px;
  }
  h1 {
    font-size: 22px;
    font-weight: 900;
    margin: 0 0 4px;
    color: #1a1a2e;
    line-height: 1.2;
  }
  h2 {
    font-size: 13px;
    font-weight: 800;
    margin: 18px 0 7px;
    color: ${theme.accent};
    text-transform: uppercase;
    letter-spacing: 0.06em;
    border-bottom: 2px solid ${theme.primary};
    padding-bottom: 4px;
  }
  h3 { font-size: 12px; font-weight: 700; margin: 10px 0 4px; color: #2d2d4a; }
  p { margin: 5px 0; }
  ul, ol { margin: 5px 0 5px 18px; }
  li { margin: 3px 0; }
  table { width: 100%; border-collapse: collapse; margin: 8px 0; font-size: 11px; border-radius: 8px; overflow: hidden; border: 1px solid #e5e7eb; }
  th { background: ${theme.primary}; color: #fff; padding: 7px 10px; text-align: left; font-weight: 700; font-size: 11px; }
  td { padding: 6px 10px; border-bottom: 1px solid #e5e7eb; vertical-align: top; }
  tr:nth-child(even) td { background: #f9fafb; }
  tr:last-child td { border-bottom: none; }
  .callout {
    border-radius: 8px;
    padding: 9px 12px;
    margin: 8px 0;
    font-size: 11px;
  }
  .callout.obj { background: #f0fdf4; border: 1.5px solid #86efac; }
  .callout.diff { background: #f0f9ff; border: 1.5px solid #7dd3fc; }
  .callout.res { background: #faf5ff; border: 1.5px solid #d8b4fe; }
  .callout.assess { background: #fff7ed; border: 1.5px solid #fed7aa; }
  .callout-label {
    font-weight: 800;
    font-size: 9px;
    text-transform: uppercase;
    letter-spacing: 0.1em;
    margin-bottom: 3px;
  }
  .callout.obj .callout-label { color: #15803d; }
  .callout.diff .callout-label { color: #0284c7; }
  .callout.res .callout-label { color: #7e22ce; }
  .callout.assess .callout-label { color: #c2410c; }
  .phase-tag {
    display: inline-block;
    background: ${theme.primary};
    color: #fff;
    font-size: 9px;
    font-weight: 700;
    padding: 2px 8px;
    border-radius: 20px;
    margin-right: 6px;
  }
  strong { font-weight: 700; color: #1a1a2e; }
  hr { border: none; border-top: 1px solid ${theme.secondary}; margin: 14px 0; }
  .footer {
    margin-top: 22px;
    padding-top: 10px;
    border-top: 2px solid ${theme.primary};
    display: flex;
    justify-content: space-between;
    font-size: 10px;
    color: ${theme.accent};
    opacity: 0.7;
  }
</style>
</head>
<body>

<div class="header-bar">
  <span class="logo">PICKLENICKAI</span>
  <span class="meta">Australian Curriculum v9 · F-6 Teaching Resource</span>
</div>

<div style="margin-bottom: 12px">
  <div class="subject-badge">${theme.label}</div>
</div>

<h1>${title || "Lesson Plan"}</h1>

<div class="meta-grid">
  <div class="meta-cell">
    <div class="meta-label">Subject</div>
    <div class="meta-value">${subject || "—"}</div>
  </div>
  <div class="meta-cell">
    <div class="meta-label">Year Level</div>
    <div class="meta-value">${yearLevel || "—"}</div>
  </div>
  <div class="meta-cell">
    <div class="meta-label">Week</div>
    <div class="meta-value">${week || "—"}</div>
  </div>
  <div class="meta-cell">
    <div class="meta-label">Duration (mins)</div>
    <div class="meta-line"></div>
  </div>
  <div class="meta-cell">
    <div class="meta-label">Date</div>
    <div class="meta-line"></div>
  </div>
  <div class="meta-cell">
    <div class="meta-label">Teacher</div>
    <div class="meta-line"></div>
  </div>
</div>

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
