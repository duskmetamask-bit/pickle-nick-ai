import { NextRequest, NextResponse } from "next/server";
import PptxGenJS from "pptxgenjs";

export const runtime = "nodejs";

function parseBoldMeta(text: string): Record<string, string> {
  const meta: Record<string, string> = {};
  const re = /\*\*(.+?):\*\*(.+)$/gm;
  let m;
  while ((m = re.exec(text)) !== null) {
    meta[m[1].trim().toLowerCase()] = m[2].trim();
  }
  return meta;
}

export async function POST(req: NextRequest) {
  try {
    const { content, title } = await req.json();

    if (!content) {
      return NextResponse.json({ error: "content is required" }, { status: 400 });
    }

    const pptx = new PptxGenJS();
    pptx.layout = "LAYOUT_16x9";
    pptx.title = title || "Unit Plan";
    pptx.author = "PickleNickAI";

    const primary = "6366F1";
    const accent = "22D3EE";
    const dark = "1E1B4B";
    const light = "F8FAFC";
    const mid = "64748B";

    // Title slide
    const slide1 = pptx.addSlide();
    slide1.background = { color: dark };
    slide1.addShape(pptx.ShapeType.rect, {
      x: 0, y: 0, w: 0.15, h: 5.625,
      fill: { color: accent },
    });
    slide1.addText("PICKLENICKAI", {
      x: 0.5, y: 0.4, w: 9, h: 0.4,
      fontSize: 11, color: accent, bold: true, charSpacing: 6,
    });
    const cleanTitle = (title || "Unit Plan").replace(/\*\*/g, "");
    slide1.addText(cleanTitle, {
      x: 0.5, y: 1.6, w: 8.5, h: 2,
      fontSize: 36, color: "FFFFFF", bold: true, valign: "top",
    });
    const meta = parseBoldMeta(content);
    const yearLevel = meta["year level"] || "";
    if (yearLevel) slide1.addText(yearLevel, { x: 0.5, y: 3.6, w: 9, h: 0.5, fontSize: 16, color: accent });

    // Content slides
    const lines = content.split("\n");
    let slideTitle = "Unit Overview";
    let textBlocks: string[] = [];
    let slideIndex = 1;

    function flushSlide(heading: string, textArr: string[]) {
      if (textArr.length === 0) return;
      const slide = pptx.addSlide();
      slide.background = { color: light };
      slide.addShape(pptx.ShapeType.rect, {
        x: 0, y: 0, w: 10, h: 0.9,
        fill: { color: primary },
      });
      slide.addText(heading.replace(/\*\*/g, ""), {
        x: 0.4, y: 0.15, w: 9.2, h: 0.6,
        fontSize: 18, color: "FFFFFF", bold: true,
      });

      const bulletItems = textArr
        .filter(l => l.trim())
        .map(l => l.replace(/^[-*]\s+/, "• ").replace(/\*\*/g, ""))
        .filter(l => l.trim());

      const chunks: string[] = [];
      let current = "";
      for (const item of bulletItems) {
        if (current.length + item.length > 700) { chunks.push(current); current = item + "\n"; }
        else current += item + "\n";
      }
      if (current) chunks.push(current);

      const visibleChunks = chunks.slice(0, 2);
      slide.addText(visibleChunks.join("\n"), {
        x: 0.5, y: 1.1, w: 9, h: 4,
        fontSize: 13, color: dark, valign: "top",
      });
      slideIndex++;
    }

    for (const line of lines) {
      const hMatch = line.match(/^(#{1,4})\s+(.+)$/);
      if (hMatch) {
        if (textBlocks.length > 0) flushSlide(slideTitle, textBlocks);
        textBlocks = [];
        const lvl = hMatch[1].length;
        const heading = hMatch[2].trim();
        if (lvl <= 2) slideTitle = heading;
        else textBlocks.push(heading);
      } else if (line.startsWith("|")) {
        textBlocks.push(line);
      } else if (line.trim()) {
        textBlocks.push(line);
      } else if (textBlocks.length > 2) {
        flushSlide(slideTitle, textBlocks);
        textBlocks = [];
      }
    }
    if (textBlocks.length > 0) flushSlide(slideTitle, textBlocks);

    // Final slide
    const finalSlide = pptx.addSlide();
    finalSlide.background = { color: dark };
    finalSlide.addText("PICKLENICKAI", {
      x: 0.5, y: 2.2, w: 9, h: 0.5,
      fontSize: 14, color: accent, bold: true, charSpacing: 6, align: "center",
    });
    finalSlide.addText("Created with PickleNickAI", {
      x: 0.5, y: 2.9, w: 9, h: 0.8,
      fontSize: 28, color: "FFFFFF", bold: true, align: "center",
    });

    const blob: Blob = await (pptx as unknown as { write: () => Promise<Blob> }).write();
    const arrayBuffer: ArrayBuffer = await blob.arrayBuffer();
    const uint8 = new Uint8Array(arrayBuffer);

    return new NextResponse(uint8, {
      headers: {
        "Content-Type": "application/vnd.openxmlformats-officedocument.presentationml.presentation",
        "Content-Disposition": `attachment; filename="${cleanTitle.replace(/[^a-z0-9]/gi, "-")}.pptx"`,
      },
    });

  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Export failed";
    console.error("[export/pptx]", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
