import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

/** Extract individual lessons from unit markdown content */
export async function POST(req: NextRequest) {
  try {
    const { content, unitTitle } = await req.json();

    if (!content) {
      return NextResponse.json({ error: "content is required" }, { status: 400 });
    }

    const lessons: { id: string; title: string; week: string; content: string }[] = [];
    const lines = content.split("\n");

    let currentLesson: { id: string; title: string; week: string; content: string[] } | null = null;
    let currentWeek = "";
    let lessonCount = 0;

    for (const line of lines) {
      const weekMatch = line.match(/^##\s+WEEK\s+(\d+)\s+[—–-]?\s+(.+)$/i);
      const lessonMatch = line.match(/^###\s+Lesson\s+(\d+):\s+(.+)$/i);

      if (weekMatch) {
        currentWeek = `Week ${weekMatch[1]} — ${weekMatch[2].trim()}`;
      } else if (lessonMatch) {
        // Save previous lesson
        if (currentLesson) {
          lessons.push({
            id: currentLesson.id,
            title: currentLesson.title,
            week: currentLesson.week,
            content: currentLesson.content.join("\n"),
          });
        }
        lessonCount++;
        currentLesson = {
          id: `lesson-${lessonCount}`,
          title: `${currentWeek ? currentWeek + " — " : ""}Lesson ${lessonMatch[1]}: ${lessonMatch[2].trim()}`,
          week: currentWeek,
          content: [],
        };
      } else if (currentLesson) {
        currentLesson.content.push(line);
      }
    }

    // Push last lesson
    if (currentLesson) {
      lessons.push({
        id: currentLesson.id,
        title: currentLesson.title,
        week: currentLesson.week,
        content: currentLesson.content.join("\n"),
      });
    }

    return NextResponse.json({ lessons });

  } catch (err: unknown) {
    return NextResponse.json({ error: err instanceof Error ? err.message : "Failed" }, { status: 500 });
  }
}
