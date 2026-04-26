import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

export async function POST(req: NextRequest) {
  try {
    const { subject, yearLevel, topic, duration, lessonType, objectives, activities } = await req.json();

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
            content: `You are PickleNickAI — an expert Australian F-6 teaching assistant. Generate detailed, curriculum-aligned lesson plans following the Australian Curriculum v9 (AC9) format. Always include AC9 codes when relevant. Be specific, practical, and actionable. Format plans clearly with timing, resources, and differentiation.`,
          },
          {
            role: "user",
            content: `Generate a complete lesson plan:\n\n- Subject: ${subject || "General"}\n- Year Level: ${yearLevel || "Year 4"}\n- Topic/Focus: ${topic || "TBD"}\n- Duration: ${duration || 60} minutes\n- Lesson Type: ${lessonType || "Explicit Teaching"}\n${objectives ? `- Learning Objectives:\n${objectives}` : ""}\n${activities ? `- Suggested Activities:\n${activities}` : ""}\n\nFormat with clear sections:\n- Learning Objectives (AC9 codes)\n- Materials & Resources\n- Lesson Structure (with timing for each phase)\n- Differentiation strategies\n- Assessment opportunities`,
          },
        ],
        temperature: 0.7,
        max_tokens: 3000,
      }),
    });

    if (!response.ok) {
      return NextResponse.json({ error: `OpenAI error ${response.status}` }, { status: 500 });
    }

    const data = await response.json();
    const plan = data.choices?.[0]?.message?.content || "";
    return NextResponse.json({ plan });

  } catch (err: unknown) {
    return NextResponse.json({ error: err instanceof Error ? err.message : "Failed" }, { status: 500 });
  }
}
