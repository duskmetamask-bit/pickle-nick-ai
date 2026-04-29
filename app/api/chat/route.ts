import { NextRequest, NextResponse } from "next/server";
import { readFileSync, existsSync, readdirSync } from "fs";
import { join } from "path";

const OPENAI_API_KEY = process.env.OPENAI_API_KEY || process.env.NIM_API_KEY || "";
const SKILLS_DIR = join(process.cwd(), "lib/skills/vault");

interface ChatMessage {
  role: "user" | "assistant" | "system";
  content: string;
}

interface TeacherProfile {
  name: string;
  yearLevels: string[];
  subjects: string[];
  state?: string;
}

function loadSkillContent(skillDir: string): string {
  const skillPath = join(skillDir, "SKILL.md");
  if (!existsSync(skillPath)) return "";
  try {
    return readFileSync(skillPath, "utf-8");
  } catch {
    return "";
  }
}

function loadAllSkills(): string {
  if (!existsSync(SKILLS_DIR)) return "";
  
  const skillDirs = readdirSync(SKILLS_DIR).filter(f => {
    const stat = require("fs").statSync(join(SKILLS_DIR, f));
    return stat.isDirectory();
  });
  
  const contents: string[] = [];
  for (const dir of skillDirs) {
    const content = loadSkillContent(join(SKILLS_DIR, dir));
    if (content) {
      contents.push(`\n\n=== ${dir.toUpperCase().replace("PICKLE-", "")} ===\n${content}`);
    }
  }
  return contents.join("\n");
}

function buildSystemPrompt(profile: TeacherProfile): string {
  const skillsContent = loadAllSkills();
  
  const stateContext: Record<string, string> = {
    WA: "Western Australia — SCSA guidelines, WA Department of Education priorities, HASS emphasis",
    NSW: "New South Wales — NESA syllabus, NSW DoE resources, literacy/numeracy focus",
    VIC: "Victoria — Victorian Curriculum F-10, DE Victoria resources, FISO improvement framework",
    QLD: "Queensland — QCAA AC9 implementation, Queensland Department of Education",
    SA: "South Australia — SACE framework, Department for Education SA",
    TAS: "Tasmania — Tasmanian Curriculum Standards, Department for Education Tasmania",
    NT: "Northern Territory — NT Department of Education, local Indigenous cultural contexts",
    ACT: "ACT — ACT Education Directorate, BSSS framework",
  };
  
  const stateInfo = profile.state && stateContext[profile.state] 
    ? `\nSTATE CONTEXT (${profile.state}): ${stateContext[profile.state]}`
    : "";

  return `You are PickleNickAI — expert Australian F-6 teaching assistant with full AC9 knowledge.${stateInfo}

You follow the JOHN BUTLER PRIMARY COLLEGE INSTRUCTIONAL MODEL for explicit, evidence-based teaching.

== CORE INSTRUCTIONAL MODEL ==
7-Phase Sequence:
1. Daily Review (5-10 min) — spaced retrieval, interleaved practice, CFU
2. Introduction (5-10 min) — WALT + TIB + WILF, hook, activate prior knowledge
3. I Do — Focussed Instruction (10-15 min) — modelling, WAGOLL, worked examples, cognitive load management, CFU
4. We Do — Guided Practice (10-15 min) — differentiated groups, 80%+ mastery threshold, high-quality feedback
5. You Do (Together) — Collaborative Learning (10 min) — small groups, problem-solving, CFU
6. You Do (Independently) — Independent Learning (10-15 min) — independent practice, differentiation
7. Plenary — Review & Reflect (5-10 min) — exit tickets, what students learned, inform next lesson

KEY TERMS:
- WALT = "We are learning to..." (learning intention)
- TIB = "This is because..." (purpose and relevance)  
- WILF = "What I am looking for..." (success criteria)
- CFU = Checking for Understanding (pop sticks, whiteboards, pair-share, non-volunteers)
- WAGOLL = What A Good One Looks Like
- 80% MASTERY RULE: if students not at 80% during We Do, go back and re-teach before moving on

EVIDENCE BASE: Rosenshine's Explicit Instruction, Cognitive Load Theory (Sweller), Hattie's Visible Learning, Dylan William's Formative Assessment, HITS (Victoria DE), Gradual Release of Responsibility, AERO "Teach Explicitly".

== TEACHER CONTEXT ==
- Teacher: ${profile.name}
- Year levels: ${profile.yearLevels.join(", ")}
- Subjects: ${profile.subjects.join(", ")}
- Curriculum: Australian Curriculum v9 (AC9)${stateInfo}

== LESSON PLAN REQUIREMENTS ==
Every lesson plan MUST include:
- WALT + TIB + WILF in header
- Phase timing columns (Duration | Teacher Does | Students Do | Resources | CFU)
- CFU in EVERY phase
- Examples AND non-examples
- Materials list (specific, not generic)
- Differentiation: EAL/D, gifted, additional needs
- Exit ticket
- Follow-up prompts

== RUBRIC REQUIREMENTS ==
- 4 levels: Excellent/Good/Satisfactory/Needs Improvement
- Multiple criteria per level
- A-E alternative grading
- 11-criterion spreadsheet format for English: Paragraphing, Punctuation, Spelling, Cohesion, Persuasive Devices, Vocabulary, Sentence Structure, Audience, Ideas, Text Structure
- Max 4 points per criterion = 48 total

== ASSESSMENT ==
- Cold task = pre-assessment
- Hot task = post-assessment  
- Show growth comparison
- Always suggest follow-up actions

== SKILLS KNOWLEDGE BASE ==
${skillsContent || "Full PickleNickAI skills loaded from vault."}

== RULES ==
- Give practical, actionable, classroom-ready responses
- Use exact AC9 codes (format: AC9[E/M/S/H/T][F/1-6][L/M/S/etc][01-99])
- Be specific to ${profile.name}'s context — not generic advice
- Include timing, resources, differentiation in all plans
- Be honest about limitations and uncertainty
- Teach writing using: Modelling, Scaffolding, Feedback, Practice
- Teach narrative: Orientation → Complication → Resolution
- Teach persuasive: Introduction (thesis) → Argument 1 → Argument 2 → Argument 3 → Conclusion

Remember: ${profile.name} is a real Australian teacher. Give real, useful, specific, classroom-ready advice.

When responding with lesson plans, rubrics, or assessments, structure your response with clear section headers starting with ## (which the UI will render beautifully). Use WALT/TIB/WILF format for lesson plans. Use proper markdown tables for rubrics.`;
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { messages, sessionId, profile, stream: wantsStream } = body;
    const wantsStreaming = wantsStream !== false;  // default to streaming

    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json({ error: "messages array required" }, { status: 400 });
    }

    if (!sessionId) {
      return NextResponse.json({ error: "sessionId required" }, { status: 400 });
    }

    const teacherProfile: TeacherProfile = profile || { 
      name: "Teacher", 
      yearLevels: ["Year 3-6"], 
      subjects: ["General"],
      state: undefined
    };

    const systemPrompt: ChatMessage = {
      role: "system",
      content: buildSystemPrompt(teacherProfile),
    };

    const allMessages: ChatMessage[] = [systemPrompt, ...messages];

    // Demo mode — no real API key
    if (!OPENAI_API_KEY || OPENAI_API_KEY === "sk-build-placeholder" || OPENAI_API_KEY === "demo") {
      const lastMsg = allMessages[allMessages.length - 1]?.content || "";
      const demoText = `PickleNickAI is running with full skill knowledge loaded.\n\nYour question: "${lastMsg.slice(0, 80)}..."\n\nI'm ready to help with:\n• Lesson planning (tell me year level, subject, topic)\n• Assessment design (rubrics, success criteria, AC9 codes)\n• Writing feedback (narrative, persuasive, informative)\n• Behaviour strategies\n• Differentiation (EAL/D, gifted, additional needs)\n• Unit planning\n\nWhat would you like help with?`;
      
      if (!wantsStreaming) {
        return NextResponse.json({ reply: demoText });
      }

      const demoStream = new ReadableStream({
        start(controller) {
          const encoder = new TextEncoder();
          // Simulate streaming
          const chars = demoText.split("");
          let i = 0;
          const interval = setInterval(() => {
            if (i >= chars.length) {
              controller.enqueue(encoder.encode(`data: ${JSON.stringify({ type: "done" })}\n\n`));
              controller.close();
              clearInterval(interval);
              return;
            }
            controller.enqueue(encoder.encode(`data: ${JSON.stringify({ type: "text", content: chars[i] })}\n\n`));
            i++;
          }, 10);
        }
      });
      return new Response(demoStream, {
        headers: { "Content-Type": "text/event-stream", "Cache-Control": "no-cache", "Connection": "keep-alive" },
      });
    }

    // Real streaming response from OpenAI
    const response = await fetch("https://integrate.api.nvidia.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${OPENAI_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "deepseek-ai/deepseek-v3.2",
        messages: allMessages.map(m => ({ role: m.role, content: m.content })),
        temperature: 0.7,
        max_tokens: 2000,
        stream: wantsStreaming,
      }),
    });

    if (!response.ok) {
      const err = await response.text();
      throw new Error(`OpenAI error: ${response.status} — ${err}`);
    }

    // Non-streaming mode for workflow tools
    if (!wantsStreaming) {
      const data = await response.json();
      const reply = data.choices?.[0]?.message?.content || "";
      return NextResponse.json({ reply });
    }

    if (!response.body) {
      throw new Error("No response body from OpenAI");
    }

    const openAIStream = new ReadableStream({
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

    return new Response(openAIStream, {
      headers: { "Content-Type": "text/event-stream", "Cache-Control": "no-cache", "Connection": "keep-alive" },
    });

  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Chat failed";
    console.error("[chat/route]", message);
    const errorStream = new ReadableStream({
      start(controller) {
        const encoder = new TextEncoder();
        controller.enqueue(encoder.encode(`data: ${JSON.stringify({ type: "error", content: message })}\n\n`));
        controller.close();
      }
    });
    return new Response(errorStream, {
      headers: { "Content-Type": "text/event-stream" },
    });
  }
}
