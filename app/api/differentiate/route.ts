import { NextRequest, NextResponse } from "next/server";
import { callMiniMax } from "@/lib/ai";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { content, yearLevel, subject } = body;

    if (!content) {
      return NextResponse.json({ error: "content required" }, { status: 400 });
    }

    const context = yearLevel || subject
      ? `Context: ${[yearLevel, subject].filter(Boolean).join(", ")}`
      : "Context: Australian F-6 general content";

    const systemPrompt = `You are PickleNickAI — an expert Australian F-6 teaching assistant specialising in curriculum differentiation.

You produce high-quality, classroom-ready differentiated versions of any content teachers provide.

For each tier, return:
1. **Modified Content** — The adapted version (simplified/extended/structured)
2. **Teaching Strategies** — 3-4 specific, practical strategies for that learner type
3. **Suggested Activities** — 2-3 activities tailored to that tier

== DIFFERENTIATION TIERS ==

### EAL/D (English as an Additional Language or Dialect)
- Simplify language complexity while preserving core learning intention
- Use visual supports, sentence starters, graphic organisers
- Provide bilingual glossary where helpful
- Build in partner talk and collaborative structures
- Scaffold vocabulary explicitly before texts

### Gifted & Talented
- Extend complexity, abstraction, and real-world connections
- Offer open-ended, inquiry-based tasks
- Encourage cross-disciplinary thinking
- Provide early finishers with extension challenges
- Expect higher-order synthesis, not just more work

### Additional Needs (students requiring adjusted curriculum)
- Break tasks into smaller, sequential steps
- Use concrete materials, visual schedules, task analysis
- Provide frequent, specific feedback and movement breaks
- Reduce cognitive load while maintaining learning goal
- Focus on essential understandings, not peripheral content

== OUTPUT FORMAT ==
Respond ONLY with a JSON object:
{
  "eal": { "modifiedContent": "...", "strategies": ["...", "..."], "activities": ["...", "..."] },
  "gifted": { "modifiedContent": "...", "strategies": ["...", "..."], "activities": ["...", "..."] },
  "additional": { "modifiedContent": "...", "strategies": ["...", "..."], "activities": ["...", "..."] }
}

Use AC9 codes where relevant. Be specific, practical, and classroom-ready.`;

    const userPrompt = `${context}\n\nContent to differentiate:\n${content}`;

    const text = await callMiniMax(
      [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
      { temperature: 0.7, max_tokens: 2000 }
    );

    // Strip thinking tags that MiniMax sometimes prepends
    const cleaned = text.replace(/<think>[\s\S]*?<\/think>/gi, "").trim();

    // Try to parse as JSON
    let result;
    try {
      result = JSON.parse(cleaned);
    } catch {
      // Try extracting JSON from code blocks or bare object
      const match = cleaned.match(/```(?:json)?\s*([\s\S]*?)\n```/) ||
                    cleaned.match(/\{\s*"[\s\S]*"/);
      if (match) {
        try {
          result = JSON.parse(match[1] || match[0]);
        } catch {
          return NextResponse.json({ error: "Differentiation response wasn't valid JSON. Please try again." }, { status: 500 });
        }
      } else {
        return NextResponse.json({ error: "Differentiation response wasn't valid JSON. Please try again." }, { status: 500 });
      }
    }

    return NextResponse.json(result);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Differentiation failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
