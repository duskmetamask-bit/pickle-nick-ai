import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const rubric = formData.get("rubric") as File | null;
    const work = formData.get("work") as File | null;

    if (!rubric || !work) {
      return NextResponse.json({ error: "Both rubric and work files are required" }, { status: 400 });
    }

    const rubricText = await rubric.text();
    const workText = await work.text();

    const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
    if (!OPENAI_API_KEY || OPENAI_API_KEY === "sk-build-placeholder") {
      return NextResponse.json({
        result: `AUTO-MARKING RESULTS\n========================\n\nNote: OpenAI API key not configured. Set OPENAI_API_KEY in your .env file for full AI analysis.\n\nFiles received:\n- Rubric: ${rubric.name}\n- Student work: ${work.name}\n\nPENDING: Vision model integration for image/PDF analysis.\n\nTo enable full auto-marking:\n1. Set OPENAI_API_KEY in .env\n2. Consider NIM_API_KEY for vision (image upload analysis)`,
      });
    }

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${OPENAI_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content: `You are PickleNickAI — an expert Australian F-6 teaching assistant and assessor. Mark student work against a rubric and provide detailed, constructive feedback. Be specific about what the student did well, what needs improvement, and how to improve. Format feedback clearly with criterion-by-criterion grades.`,
          },
          {
            role: "user",
            content: `Mark the following student work against this rubric.\n\n=== RUBRIC ===\n${rubricText}\n\n=== STUDENT WORK ===\n${workText}\n\nProvide feedback in this format:\n- Criterion: [name]\n- Grade: [Beginning/Developing/Achieving/Exceeding]\n- Strengths: [what they did well]\n- Areas for Improvement: [what needs work]\n- Next Steps: [specific advice]`,
          },
        ],
        temperature: 0.5,
        max_tokens: 3000,
      }),
    });

    if (!response.ok) {
      const err = await response.text();
      return NextResponse.json({ error: `OpenAI error ${response.status}` }, { status: 500 });
    }

    const data = await response.json();
    const result = data.choices?.[0]?.message?.content || "No feedback generated.";
    return NextResponse.json({ result });

  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Analysis failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
