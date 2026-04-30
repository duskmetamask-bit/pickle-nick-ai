import { NextRequest, NextResponse } from "next/server";
import { join } from "path";

const OPENAI_API_KEY = process.env.OPENAI_API_KEY || process.env.NIM_API_KEY || "";
const SKILLS_DIR = join(process.cwd(), "lib/skills/vault");

function getSystemPrompt(): string {
  return `You are PickleNickAI — an expert Australian F-6 teaching assistant specialising in curriculum differentiation.

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
}

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

    const systemPrompt = getSystemPrompt();
    const userPrompt = `${context}\n\nContent to differentiate:\n${content}`;

    if (!OPENAI_API_KEY || OPENAI_API_KEY === "sk-build-placeholder" || OPENAI_API_KEY === "demo") {
      return NextResponse.json({
        eal: {
          modifiedContent: `[EAL/D version of content] — ${content.slice(0, 100)}...`,
          strategies: ["Use visual supports and graphic organisers", "Provide sentence starters and writing frames", "Build in pair/small group talk before individual tasks", "Scaffold vocabulary explicitly before reading"],
          activities: ["Partner dictation with word banks", "Sequencing activity with picture supports", "Bilingual glossary paired activity"],
        },
        gifted: {
          modifiedContent: `[Gifted extension of content] — ${content.slice(0, 100)}...`,
          strategies: ["Open-ended inquiry tasks with multiple entry points", "Cross-curricular connections and real-world applications", "Require synthesis, evaluation, and creation", "Allow student choice and self-direction"],
          activities: ["Design a project applying this concept", "Create a teaching resource for younger students", "Research real-world case study"],
        },
        additional: {
          modifiedContent: `[Additional needs version of content] — ${content.slice(0, 100)}...`,
          strategies: ["Break task into 3-4 small sequential steps", "Use concrete materials and visual schedules", "Provide frequent, specific positive feedback", "Reduce sensory distractions and cognitive load"],
          activities: ["Task analysis with concrete materials", "Colour-coded sequencing activity", "One-step-at-a-time check-in format"],
        },
      });
    }

    const response = await fetch("https://integrate.api.nvidia.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${OPENAI_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "deepseek-ai/deepseek-v3.2",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        temperature: 0.7,
        max_tokens: 1500,
      }),
    });

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }

    const data = await response.json();
    const text = data.choices?.[0]?.message?.content || "";

    // Try to parse as JSON
    let result;
    try {
      result = JSON.parse(text);
    } catch {
      // Try to extract JSON from markdown code blocks
      const match = text.match(/```(?:json)?\s*([\s\S]*?)```/) || text.match(/\{[\s\S]*\}/);
      if (match) {
        try {
          result = JSON.parse(match[1] || match[0]);
        } catch {
          return NextResponse.json({ error: "Failed to parse response" }, { status: 500 });
        }
      } else {
        return NextResponse.json({ error: "Failed to parse response" }, { status: 500 });
      }
    }

    return NextResponse.json(result);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Differentiation failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
