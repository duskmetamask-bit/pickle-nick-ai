import { NextRequest, NextResponse } from "next/server";
import { callMiniMax } from "@/lib/ai";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  try {
    const { subject, yearLevel, taskType, criteria } = await req.json();

    const rubric = await callMiniMax(
      [
        {
          role: "system",
          content:
            "You are PickleNickAI — an expert Australian F-6 teaching assistant. Generate detailed assessment rubrics with 4 levels (Beginning, Developing, Achieving, Exceeding) for each criterion. Use AC9 codes where relevant. Format as a clear markdown table.",
        },
        {
          role: "user",
          content: `Create a rubric for:\n- Subject: ${subject || "English"}\n- Year Level: ${yearLevel || "Year 4"}\n- Task Type: ${taskType || "Writing Task"}\n- Criteria: ${criteria || "Writing structure, Vocabulary, Grammar, Organisation"}\n\nFormat as a markdown table with columns:\n| Criterion | Beginning (1) | Developing (2) | Achieving (3) | Exceeding (4) |\nInclude specific, observable descriptors for each level. Use AC9 codes where relevant.`,
        },
      ],
      { temperature: 0.7, max_tokens: 2500 }
    );

    return NextResponse.json({ rubric });
  } catch (err: unknown) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed" },
      { status: 500 }
    );
  }
}
