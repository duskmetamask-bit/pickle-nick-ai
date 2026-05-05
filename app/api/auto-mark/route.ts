import { NextRequest, NextResponse } from "next/server";
import { callMiniMax } from "@/lib/ai";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const rubric = formData.get("rubric") as File | null;
    const work = formData.get("work") as File | null;
    const rubricText = formData.get("rubricText") as string | null;
    const workText = formData.get("workText") as string | null;
    const question = formData.get("question") as string | null;
    const type = formData.get("type") as string | null;

    // Allow text inputs directly (for simple math/text questions)
    const rText = rubricText || (rubric ? await rubric.text() : "");
    const wText = workText || (work ? await work.text() : "");

    if (!rText && !rubric) {
      return NextResponse.json({ error: "Rubric text or file required" }, { status: 400 });
    }
    if (!wText && !work) {
      return NextResponse.json({ error: "Work text or file required" }, { status: 400 });
    }

    const questionContext = question ? `\nStudent Question: ${question}\nType: ${type || "general"}\n` : "";

    const result = await callMiniMax(
      [
        {
          role: "system",
          content:
            "You are PickleNickAI — an expert Australian F-6 teaching assistant and assessor. Mark student work against a rubric and provide detailed, constructive feedback. Be specific about what the student did well, what needs improvement, and how to improve. Format feedback clearly with criterion-by-criterion grades. Respond in clear, teacher-friendly language.",
        },
        {
          role: "user",
          content: `Mark the following student work against this rubric.${questionContext}\n\n=== RUBRIC ===\n${rText}\n\n=== STUDENT WORK ===\n${wText}\n\nProvide feedback in this format:\n- Criterion: [name]\n- Grade: [Beginning/Developing/Achieving/Exceeding]\n- Strengths: [what they did well]\n- Areas for Improvement: [what needs work]\n- Next Steps: [specific advice]`,
        },
      ],
      { temperature: 0.5, max_tokens: 3000 }
    );

    return NextResponse.json({ result });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Analysis failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
