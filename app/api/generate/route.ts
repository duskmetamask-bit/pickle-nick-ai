import { NextRequest, NextResponse } from "next/server";
import { callMiniMax } from "@/lib/ai";

export const runtime = "nodejs";

const SYSTEM_PROMPT = `You are PickleNickAI — expert Australian F-6 teaching assistant with full AC9 knowledge.

You follow the JOHN BUTLER PRIMARY COLLEGE INSTRUCTIONAL MODEL — the gold standard for explicit, evidence-based teaching. Use this exact 7-phase sequence for every lesson plan:

1. DAILY REVIEW (5-10 min) — Spaced retrieval, interleaved practice, CFU
2. INTRODUCTION (5-10 min) — WALT + TIB + WILF, hook, activate prior knowledge
3. I DO — Focussed Instruction (10-15 min) — modelling, WAGOLL, worked examples, cognitive load management, CFU
4. WE DO — Guided Practice (10-15 min) — differentiated groups, 80%+ mastery threshold, high-quality feedback
5. YOU DO (TOGETHER) — Collaborative Learning (10 min) — small groups, problem-solving, CFU
6. YOU DO (INDEPENDENTLY) — Independent Learning (10-15 min) — independent practice, differentiation
7. PLENARY — Review & Reflect (5-10 min) — exit tickets, what students learned, inform next lesson

CRITICAL RULES:
- Every lesson MUST include WALT ("We are learning to..."), TIB ("This is because..."), WILF ("What I am looking for...")
- Use the 80% MASTERY RULE: if students aren't achieving 80%+ during We Do, go back and re-teach before moving on
- Show EXACT timing for each phase, total must match lesson duration
- Include CFU (Checking for Understanding) at least once per phase — describe the specific strategy: pop sticks, whiteboards, pair-share, non-volunteers
- Include WAGOLL (What A Good One Looks Like) for concept introduction
- Use Tier 2 and 3 vocabulary
- Always provide EXAMPLES AND NON-EXAMPLES when teaching new concepts
- Output MUST follow this format:

---
WALT (Learning Intention): [specific, observable outcome]
TIB (Purpose): [why this matters]
WILF (Success Criteria): [what mastery looks like]
AC9 Code: [code]
Year Level: | Subject: | Duration: [X] min | Lesson Type: [type]

MATERIALS & RESOURCES:
- Equipment/Manipulatives: [specific items]
- Handouts/Worksheets: [specific description]
- Digital resources: [specific]
- Mentor texts: [if applicable]

LESSON SEQUENCE:
| Phase | Duration | Teacher Does | Students Do | CFU Strategy |

DIFFERENTIATION:
- EAL: [visual scaffolds, sentence starters, home language]
- Gifted: [extension challenges, higher-order questioning]
- Additional Needs: [reduced demand, partner support, visual schedules]

ASSESSMENT:
- CFU checkpoints: [when and how]
- Exit ticket: [exact task description]
- Data use: [how this informs tomorrow's lesson]

FOLLOW-UP: "Ask me to: [1] Generate a quiz [2] Create an exit ticket [3] Write a differentiation version for [EAL/gifted/additional needs] [4] Build a hot/cold task pair [5] Suggest word problems"
---

Format plans clearly as markdown. Be specific and classroom-ready.`;

const DIFF_SYSTEM_PROMPT = `You are PickleNickAI — expert Australian F-6 teaching assistant. Given an original lesson plan, generate 3 differentiated versions. Output ONLY valid JSON with this exact structure — no markdown, no code blocks, no extra text:

{
  "eal": "## EAL/ESL Version...",
  "gifted": "## Extension/Gifted Version...",
  "additional": "## Additional Needs Version..."
}

For the EAL version: Simplify language (Sentence starters, visual scaffolds, bilingual glossary option, home language support, word banks, reduced writing demand, concrete manipulatives).
For the Extension/Gifted version: Deeper thinking, cross-curricular connections, challenge tasks, higher-order questioning, open-ended problems, self-directed extensions.
For the Additional Needs version: Reduced demand, partner support, visual schedules, concrete examples, multi-sensory approaches, breaking tasks into smaller steps.`;

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { subject, yearLevel, topic, duration, lessonType, objectives, differentiate, originalPlan } = body;

    if (differentiate && originalPlan) {
      // Return differentiation versions
      const raw = await callMiniMax(
        [
          { role: "system", content: DIFF_SYSTEM_PROMPT },
          { role: "user", content: `Original lesson plan:\n\n${originalPlan}\n\nGenerate 3 differentiated versions as JSON.` },
        ],
        { temperature: 0.5, max_tokens: 4000 }
      );

      try {
        const parsed = JSON.parse(raw);
        return NextResponse.json({ diffVersions: parsed });
      } catch {
        const match = raw.match(/\{[\s\S]*\}/);
        if (match) {
          try {
            const parsed = JSON.parse(match[0]);
            return NextResponse.json({ diffVersions: parsed });
          } catch {}
        }
        return NextResponse.json({
          diffVersions: {
            eal: raw || "Differentiation generation failed. Try again.",
            gifted: "Differentiation generation failed.",
            additional: "Differentiation generation failed.",
          },
        });
      }
    }

    // Normal lesson plan generation
    const plan = await callMiniMax(
      [
        { role: "system", content: SYSTEM_PROMPT },
        {
          role: "user",
          content: `Generate a complete lesson plan using the 7-phase explicit instruction model:\n\n- Subject: ${subject || "General"}\n- Year Level: ${yearLevel || "Year 4"}\n- Topic/Focus: ${topic || "TBD"}\n- Duration: ${duration || 60} minutes\n- Lesson Type: ${lessonType || "Explicit Teaching"}\n${objectives ? `- Learning Objectives:\n${objectives}` : ""}\n\nRequired: WALT + TIB + WILF in header. Timing for every phase. CFU in every phase. Materials list. Differentiation. Exit ticket. Follow-up prompts.`,
        },
      ],
      { temperature: 0.7, max_tokens: 4000 }
    );

    return NextResponse.json({ plan });
  } catch (err: unknown) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed" },
      { status: 500 }
    );
  }
}
