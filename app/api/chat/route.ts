import { NextRequest, NextResponse } from "next/server";
import { readFileSync, existsSync, readdirSync, statSync } from "fs";
import { join } from "path";

const MINIMAX_API_KEY = process.env.MINIMAX_API_KEY || "";
const MINIMAX_MODEL = process.env.MINIMAX_MODEL || "MiniMax-M2.7";
const NIM_API_KEY = process.env.NIM_API_KEY || process.env.OPENAI_API_KEY || "";
const NIM_MODEL = process.env.NIM_MODEL || "deepseek-ai/deepseek-v4-pro";
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

interface ProviderConfig {
  name: "MiniMax" | "NVIDIA NIM";
  endpoint: string;
  apiKey: string;
  model: string;
}

function getProvider(): ProviderConfig | null {
  if (MINIMAX_API_KEY) {
    return {
      name: "MiniMax",
      endpoint: "https://api.minimax.io/v1/chat/completions",
      apiKey: MINIMAX_API_KEY,
      model: MINIMAX_MODEL,
    };
  }

  if (NIM_API_KEY) {
    return {
      name: "NVIDIA NIM",
      endpoint: "https://integrate.api.nvidia.com/v1/chat/completions",
      apiKey: NIM_API_KEY,
      model: NIM_MODEL,
    };
  }

  return null;
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

  const skillDirs = readdirSync(SKILLS_DIR).filter((f) => {
    try {
      return statSync(join(SKILLS_DIR, f)).isDirectory();
    } catch {
      return false;
    }
  });

  // Sort: unit-planner first (it frames all planning requests), then alphabetical
  skillDirs.sort((a, b) => {
    if (a === "pickle-unit-planner") return -1;
    if (b === "pickle-unit-planner") return 1;
    return a.localeCompare(b);
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

function normaliseProfile(profile?: Partial<TeacherProfile>): TeacherProfile {
  return {
    name: profile?.name?.trim() || "Teacher",
    yearLevels: Array.isArray(profile?.yearLevels) && profile.yearLevels.length ? profile.yearLevels : ["Year 3-6"],
    subjects: Array.isArray(profile?.subjects) && profile.subjects.length ? profile.subjects : ["General"],
    state: profile?.state,
  };
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

  return `You are PickleNickAI — an expert Australian F-6 teaching assistant with strong Australian Curriculum v9 (AC9) knowledge.${stateInfo}

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
- 80% MASTERY RULE: if students are not at 80% during We Do, go back and re-teach before moving on

EVIDENCE BASE: Rosenshine's Explicit Instruction, Cognitive Load Theory (Sweller), Hattie's Visible Learning, Dylan Wiliam's Formative Assessment, HITS (Victoria DE), Gradual Release of Responsibility, AERO "Teach Explicitly".

== TEACHER CONTEXT ==
- Teacher: ${profile.name}
- Year levels: ${profile.yearLevels.join(", ")}
- Subjects: ${profile.subjects.join(", ")}
- Curriculum: Australian Curriculum v9 (AC9)${stateInfo}

== LESSON PLAN REQUIREMENTS ==
Every lesson plan MUST include:
- WALT + TIB + WILF in header
- Phase timing table with Duration | Teacher Does | Students Do | Resources | CFU
- CFU in every phase
- Examples and non-examples
- Specific materials list
- Differentiation for EAL/D, gifted, and additional needs
- Exit ticket
- Follow-up prompts

== RUBRIC REQUIREMENTS ==
- 4 levels: Excellent/Good/Satisfactory/Needs Improvement
- Multiple criteria per level
- A-E alternative grading where useful
- For English writing, include spreadsheet-ready criteria: Paragraphing, Punctuation, Spelling, Cohesion, Persuasive Devices, Vocabulary, Sentence Structure, Audience, Ideas, Text Structure

== ASSESSMENT ==
- Cold task = pre-assessment
- Hot task = post-assessment
- Show growth comparison
- Always suggest follow-up actions

== SKILLS KNOWLEDGE BASE ==
${skillsContent || "Full PickleNickAI skills loaded from vault."}

== RULES ==
- Give practical, actionable, classroom-ready responses
- Use exact AC9 codes when you are confident; if unsure, say to verify against official curriculum documents
- Be specific to ${profile.name}'s context — not generic advice
- Include timing, resources, differentiation in all plans
- Be honest about limitations and uncertainty
- Teach writing using modelling, scaffolding, feedback, and practice
- Teach narrative: Orientation → Complication → Resolution
- Teach persuasive: Introduction (thesis) → Argument 1 → Argument 2 → Argument 3 → Conclusion

When responding with lesson plans, rubrics, or assessments, structure your response with clear ## section headers and markdown tables where useful.`;
}

function demoReply(messages: ChatMessage[]): string {
  const lastMsg = messages[messages.length - 1]?.content || "";
  return `PickleNickAI demo mode is running with teaching skills loaded.\n\nYour question: "${lastMsg.slice(0, 100)}"\n\nI can help with lesson planning, assessment design, rubrics, writing feedback, differentiation, behaviour strategies, parent communication, and AC9 curriculum alignment. Add MINIMAX_API_KEY to enable real AI responses.`;
}

function sse(data: unknown): Uint8Array {
  return new TextEncoder().encode(`data: ${JSON.stringify(data)}\n\n`);
}

function streamText(text: string): Response {
  const stream = new ReadableStream({
    start(controller) {
      for (const char of text) controller.enqueue(sse({ type: "text", content: char }));
      controller.enqueue(sse({ type: "done" }));
      controller.close();
    },
  });
  return new Response(stream, {
    headers: { "Content-Type": "text/event-stream", "Cache-Control": "no-cache", Connection: "keep-alive" },
  });
}

async function callProvider(provider: ProviderConfig, allMessages: ChatMessage[], wantsStreaming: boolean): Promise<Response> {
  const response = await fetch(provider.endpoint, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${provider.apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: provider.model,
      messages: allMessages.map((m) => ({ role: m.role, content: m.content })),
      temperature: 0.7,
      max_tokens: 2000,
      stream: wantsStreaming,
    }),
  });

  if (!response.ok) {
    const err = await response.text();
    throw new Error(`${provider.name} error: ${response.status} — ${err}`);
  }

  return response;
}

async function providerStreamToPickleNickSSE(response: Response): Promise<Response> {
  if (!response.body) throw new Error("No response body from chat provider");

  const stream = new ReadableStream({
    async start(controller) {
      const reader = response.body!.getReader();
      const decoder = new TextDecoder();
      let buffer = "";
      let doneSent = false;

      try {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });
          const events = buffer.split("\n\n");
          buffer = events.pop() || "";

          for (const event of events) {
            const dataLines = event
              .split("\n")
              .filter((line) => line.startsWith("data:"))
              .map((line) => line.replace(/^data:\s?/, ""));

            for (const data of dataLines) {
              if (!data) continue;
              if (data === "[DONE]") {
                controller.enqueue(sse({ type: "done" }));
                doneSent = true;
                continue;
              }

              try {
                const parsed = JSON.parse(data);
                const content = parsed.choices?.[0]?.delta?.content ?? parsed.choices?.[0]?.message?.content ?? "";
                if (content) controller.enqueue(sse({ type: "text", content }));
              } catch {
                // Ignore provider keep-alive or partial metadata lines.
              }
            }
          }
        }

        if (!doneSent) controller.enqueue(sse({ type: "done" }));
        controller.close();
      } catch (streamErr) {
        controller.enqueue(sse({ type: "error", content: streamErr instanceof Error ? streamErr.message : "Stream failed" }));
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: { "Content-Type": "text/event-stream", "Cache-Control": "no-cache", Connection: "keep-alive" },
  });
}

export async function POST(req: NextRequest) {
  let shouldStream = true;

  try {
    const body = await req.json();
    const { messages, sessionId, profile, stream } = body;
    shouldStream = stream !== false;

    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json({ error: "messages array required" }, { status: 400 });
    }

    if (!sessionId) {
      return NextResponse.json({ error: "sessionId required" }, { status: 400 });
    }

    const safeMessages: ChatMessage[] = messages
      .filter((m: Partial<ChatMessage>) => (m.role === "user" || m.role === "assistant") && typeof m.content === "string")
      .map((m: ChatMessage) => ({ role: m.role, content: m.content }));

    const teacherProfile = normaliseProfile(profile);
    const allMessages: ChatMessage[] = [
      { role: "system", content: buildSystemPrompt(teacherProfile) },
      ...safeMessages,
    ];

    const provider = getProvider();
    if (!provider) {
      const reply = demoReply(safeMessages);
      return shouldStream ? streamText(reply) : NextResponse.json({ reply, provider: "demo" });
    }

    const providerResponse = await callProvider(provider, allMessages, shouldStream);

    if (!shouldStream) {
      const data = await providerResponse.json();
      const reply = data.choices?.[0]?.message?.content || "";
      return NextResponse.json({ reply, provider: provider.name, model: provider.model });
    }

    return providerStreamToPickleNickSSE(providerResponse);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Chat failed";
    console.error("[chat/route]", message);

    if (!shouldStream) return NextResponse.json({ error: message }, { status: 500 });

    const errorStream = new ReadableStream({
      start(controller) {
        controller.enqueue(sse({ type: "error", content: message }));
        controller.close();
      },
    });
    return new Response(errorStream, { status: 500, headers: { "Content-Type": "text/event-stream" } });
  }
}
