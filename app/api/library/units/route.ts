import { NextResponse } from "next/server";
import { readdir, readFile } from "fs/promises";
import { join } from "path";

const UNITS_DIR = join(process.cwd(), "data", "units");

function slugToTitle(slug: string): string {
  return slug.replace(/-/g, " ").replace(/\b\w/g, (c: string) => c.toUpperCase()).replace(/\.md$/, "");
}

function parseBoldMeta(content: string): Record<string, string> {
  const meta: Record<string, string> = {};
  const lines = content.split("\n");
  for (const line of lines) {
    const m = line.match(/^\*\*(.+?):\*\*(.+)$/);
    if (m) {
      const key = m[1].trim().toLowerCase().replace(/\s+/g, "_");
      meta[key] = m[2].trim();
    }
  }
  return meta;
}

function extractTitle(content: string): string {
  const m = content.match(/^#\s+(.+)$/m);
  return m ? m[1].trim() : "";
}

function extractSubject(content: string): string {
  const m = content.match(/\*\*Curriculum Link:\*\*([^\n]+?)v9/);
  if (m) return m[1].replace(/\*\*/g, "").trim();
  const fn = content.slice(0, 200);
  if (/science|scientific/i.test(fn)) return "Science";
  if (/math/i.test(fn)) return "Mathematics";
  if (/grammar|punctuation|writing|reading|literac|english/i.test(fn)) return "English";
  if (/hass|history|geography|civics|economic/i.test(fn)) return "HASS";
  if (/technolog|design|digital/i.test(fn)) return "Technologies";
  if (/art|music|creative/i.test(fn)) return "The Arts";
  if (/health|physical|sport/i.test(fn)) return "Health & Physical Education";
  return "General";
}

export async function GET() {
  try {
    const files = await readdir(UNITS_DIR);
    const mdFiles = files.filter(f => f.endsWith(".md")).slice(0, 100);

    const units = await Promise.all(
      mdFiles.map(async (file) => {
        try {
          const content = await readFile(join(UNITS_DIR, file), "utf-8");
          const meta = parseBoldMeta(content);
          const title = extractTitle(content) || meta.title || slugToTitle(file);
          const subject = extractSubject(content);
          const rawContent = content.replace(/^---[\s\S]*?---\n/, "").replace(/[#*_`]/g, "").trim();

          return {
            id: file.replace(".md", ""),
            title,
            subject,
            yearLevel: (meta.year_level || meta.year__level || "F-6").replace(/^(Years?\s*|Year\s*)/i, ""),
            duration: meta.unit_duration || "",
            curriculum: meta.curriculum_link || "",
            description: rawContent.slice(0, 300),
            content,
          };
        } catch {
          return {
            id: file.replace(".md", ""),
            title: slugToTitle(file),
            subject: "General",
            yearLevel: "F-6",
            duration: "",
            curriculum: "",
            description: "",
            content: "",
          };
        }
      })
    );

    return NextResponse.json({ units });
  } catch {
    return NextResponse.json({ units: [] });
  }
}
