import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

export async function POST(req: NextRequest) {
  try {
    const { subject, yearLevel, taskType, criteria } = await req.json();

    if (!OPENAI_API_KEY || OPENAI_API_KEY === "sk-build-placeholder") {
      return NextResponse.json({ error: "OpenAI API key not configured" }, { status: 500 });
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
            content: "You are PickleNickAI — an expert Australian F-6 teaching assistant. Generate detailed assessment rubrics with 4 levels (Beginning, Developing, Achieving, Exceeding) for each criterion. Use AC9 codes where relevant. Format as a clear table.",
          },
          {
            role: "user",
            content: `Create a rubric for:\n- Subject: ${subject || "English"}\n- Year Level: ${yearLevel || "Year 4"}\n- Task Type: ${taskType || "Writing Task"}\n- Criteria: ${criteria || "Writing structure, Vocabulary, Grammar, Organisation"}\n\nFormat as a table with columns:\n| Criterion | Beginning (1) | Developing (2) | Achieving (3) | Exceeding (4) |\nInclude specific, observable descriptors for each level. Use AC9 codes where relevant.`,
          },
        ],
        temperature: 0.7,
        max_tokens: 2500,
      }),
    });

    const data = await response.json();
    const rubric = data.choices?.[0]?.message?.content || "";
    return NextResponse.json({ rubric });

  } catch (err: unknown) {
    return NextResponse.json({ error: err instanceof Error ? err.message : "Failed" }, { status: 500 });
  }
}
