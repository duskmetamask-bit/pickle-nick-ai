import { NextRequest, NextResponse } from "next/server";

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

interface ChatMessage {
  role: "user" | "assistant" | "system";
  content: string;
}

function buildSystemPrompt(profile: { name: string; yearLevels: string[]; subjects: string[] }): string {
  return `You are PickleNickAI — expert Australian F-6 teaching assistant with full AC9 knowledge. You follow the JOHN BUTLER PRIMARY COLLEGE INSTRUCTIONAL MODEL for explicit, evidence-based teaching.

INSTRUCTIONAL MODEL — 7-Phase Sequence:
1. Daily Review (5-10 min) — spaced retrieval, interleaved practice, CFU
2. Introduction (5-10 min) — WALT + TIB + WILF, hook, activate prior knowledge
3. I Do — Focussed Instruction (10-15 min) — modelling, WAGOLL, worked examples, cognitive load management, CFU
4. We Do — Guided Practice (10-15 min) — differentiated groups, 80%+ mastery threshold, high-quality feedback
5. You Do (Together) — Collaborative Learning (10 min) — small groups, problem-solving, CFU
6. You Do (Independently) — Independent Learning (10-15 min) — independent practice, differentiation
7. Plenary — Review & Reflect (5-10 min) — exit tickets, what students learned, inform next lesson

KEY TERMS (always use):
- WALT = "We are learning to..." (learning intention)
- TIB = "This is because..." (purpose and relevance)
- WILF = "What I am looking for..." (success criteria)
- CFU = Checking for Understanding (pop sticks, whiteboards, pair-share, non-volunteers)
- WAGOLL = What A Good One Looks Like
- 80% MASTERY RULE: if students not at 80% during We Do, go back and re-teach before moving on

EVIDENCE BASE: Rosenshine's Explicit Instruction, Cognitive Load Theory (Sweller), Hattie's Visible Learning, Dylan William's Formative Assessment, HITS (Victoria DE), Gradual Release of Responsibility, AERO "Teach Explicitly".

CONTEXT:
- Teacher: ${profile.name}
- Year levels: ${profile.yearLevels.join(", ")}
- Subjects: ${profile.subjects.join(", ")}
- Curriculum: Australian Curriculum v9 (AC9)

LESSON PLANS must include: WALT + TIB + WILF, phase timing columns, CFU in every phase, examples + non-examples, materials list, differentiation (EAL/gifted/additional needs), exit ticket, follow-up prompts.

RUBRICS must include: 4 levels (Excellent/Good/Satisfactory/Needs Improvement), multiple criteria, A-E alternative.

ASSESSMENT SPREADSHEET CRITERIA (for English/Persuasive Writing):
Paragraphing, Punctuation, Spelling, Cohesion, Persuasive Devices, Vocabulary, Sentence Structure, Audience, Ideas, Text Structure. Max 4 points per criterion = 48 total. Cold task = pre-assessment. Hot task = post-assessment. Show growth comparison.

Always suggest follow-up actions after every substantive response.

GUIDELINES:
- Give practical, actionable, classroom-ready responses
- Use exact AC9 codes (format: AC9[E/M/S/H/T][F/1-6][L/M/S/etc][01-99])
- Be specific to ${profile.name}'s context — not generic advice
- Include timing, resources, differentiation in all plans
- Be honest about limitations and uncertainty

TOPICS:
- Lesson planning and unit design (7-phase explicit instruction format)
- Assessment and rubric creation (with 11-criterion spreadsheet format for English)
- Formative assessment / CFU strategies
- Behaviour management
- Differentiation (EAL, gifted, additional needs)
- Classroom setup and routines
- Parent communication
- Reporting (with AC9 achievement standard language)
- Australian Curriculum content descriptors
- Quiz/exit ticket generation
- Word problem generation for maths
- Hot/cold task design for pre-post assessment

Remember: ${profile.name} is a real teacher. Give real, useful, specific, classroom-ready advice.`;
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { messages, sessionId, profile } = body;

    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json({ error: "messages array required" }, { status: 400 });
    }

    if (!sessionId) {
      return NextResponse.json({ error: "sessionId required" }, { status: 400 });
    }

    const teacherProfile = profile || { name: "Teacher", yearLevels: ["Year 3-6"], subjects: ["General"] };
    const systemPrompt: ChatMessage = {
      role: "system",
      content: buildSystemPrompt(teacherProfile),
    };

    const allMessages: ChatMessage[] = [systemPrompt, ...messages];

    // Demo mode — no real API key
    if (!OPENAI_API_KEY || OPENAI_API_KEY === "sk-build-placeholder") {
      const lastMsg = allMessages[allMessages.length - 1]?.content || "";
      const demoText = `I'm ready to help with your teaching question about "${lastMsg.slice(0, 50)}..."\n\n**To enable full AI responses:**\n1. Get an OpenAI API key from https://platform.openai.com/api-keys\n2. Add it to the \`.env\` file: \`OPENAI_API_KEY=sk-...\`\n3. Restart the server with \`pm2 restart pickle-nick\`\n\nIn the meantime, I can help with:\n- Lesson planning (tell me year level, subject, topic)\n- Assessment design (rubrics, success criteria)\n- Behaviour strategies\n- Differentiation approaches\n- Australian Curriculum (AC9) codes`;
      
      const stream = new ReadableStream({
        start(controller) {
          const encoder = new TextEncoder();
          controller.enqueue(encoder.encode(`data: ${JSON.stringify({ type: "text", content: demoText })}\n\n`));
          controller.close();
        }
      });
      return new Response(stream, {
        headers: { "Content-Type": "text/event-stream", "Cache-Control": "no-cache", "Connection": "keep-alive" },
      });
    }

    // Real streaming response from OpenAI
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${OPENAI_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: allMessages.map(m => ({ role: m.role, content: m.content })),
        temperature: 0.7,
        max_tokens: 2000,
        stream: true,
      }),
    });

    if (!response.ok) {
      const err = await response.text();
      throw new Error(`OpenAI error: ${response.status} — ${err}`);
    }

    if (!response.body) {
      throw new Error("No response body from OpenAI");
    }

    const stream = new ReadableStream({
      async start(controller) {
        const reader = response.body!.getReader();
        const decoder = new TextDecoder();
        const encoder = new TextEncoder();

        try {
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;

            const chunk = decoder.decode(value, { stream: true });
            const lines = chunk.split("\n");

            for (const line of lines) {
              if (line.startsWith("data: ")) {
                const data = line.slice(6);
                if (data === "[DONE]") {
                  controller.enqueue(encoder.encode(`data: ${JSON.stringify({ type: "done" })}\n\n`));
                } else {
                  try {
                    const parsed = JSON.parse(data);
                    const content = parsed.choices?.[0]?.delta?.content;
                    if (content) {
                      controller.enqueue(encoder.encode(`data: ${JSON.stringify({ type: "text", content })}\n\n`));
                    }
                  } catch {}
                }
              }
            }
          }
          controller.close();
        } catch (streamErr) {
          controller.error(streamErr);
        }
      },
    });

    return new Response(stream, {
      headers: { "Content-Type": "text/event-stream", "Cache-Control": "no-cache", "Connection": "keep-alive" },
    });

  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Chat failed";
    console.error("[chat/route]", message);
    const stream = new ReadableStream({
      start(controller) {
        const encoder = new TextEncoder();
        controller.enqueue(encoder.encode(`data: ${JSON.stringify({ type: "error", content: message })}\n\n`));
        controller.close();
      }
    });
    return new Response(stream, {
      headers: { "Content-Type": "text/event-stream" },
    });
  }
}
