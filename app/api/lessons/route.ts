import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

/** Parse unit content into individual lesson fragments */
export async function POST(req: NextRequest) {
  try {
    const { content } = await req.json();
    if (!content) return NextResponse.json({ error: "content required" }, { status: 400 });

    const lessons: { id: string; title: string; week: string; content: string }[] = [];
    const lines = content.split("\n");
    let current: { id: string; title: string; week: string; content: string[] } | null = null;
    let week = "";
    let count = 0;

    for (const line of lines) {
      const wm = line.match(/^##\s+WEEK\s+(\d+)\s+[—–-]?\s*(.+)$/i);
      if (wm) week = `Week ${wm[1]} — ${wm[2].trim()}`;
      const lm = line.match(/^###\s+Lesson\s+(\d+):\s+(.+)$/i);
      if (lm) {
        if (current) lessons.push({ id: current.id, title: current.title, week: current.week, content: current.content.join("\n") });
        count++;
        current = { id: `l-${count}`, title: `${week ? week + " — " : ""}Lesson ${lm[1]}: ${lm[2].trim()}`, week, content: [] };
      } else if (current) {
        current.content.push(line);
      }
    }
    if (current) lessons.push({ id: current.id, title: current.title, week: current.week, content: current.content.join("\n") });

    return NextResponse.json({ lessons });
  } catch (err: unknown) {
    return NextResponse.json({ error: err instanceof Error ? err.message : "Failed" }, { status: 500 });
  }
}
