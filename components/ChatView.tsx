"use client";
import { useState, useRef, useEffect, useCallback } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import LessonPlanDisplay from "./LessonPlanDisplay";
import RubricDisplay from "./RubricDisplay";
import AssessmentDisplay from "./AssessmentDisplay";
import WritingFeedbackDisplay from "./WritingFeedbackDisplay";

interface Message { role: "user" | "assistant"; content: string; streaming?: boolean; contentType?: string | null; }
interface Profile { name: string; yearLevels: string[]; subjects: string[]; focusAreas?: string[]; school?: string; }

const QUICK_PROMPTS = [
  { label: "Behaviour support plan", prompt: "Create a behaviour support plan for a Year 4 student who..." },
  { label: "Report comment", prompt: "Write a report comment for a Year 5 student who..." },
  { label: "Parent email", prompt: "Write a parent email about..." },
  { label: "Lesson plan", prompt: "Write a lesson plan on..." },
  { label: "AC9 codes", prompt: "What are the AC9 codes for..." },
  { label: "Differentiation", prompt: "Help me differentiate this lesson for..." },
];

// ─── Smart Suggestions ─────────────────────────────────────────────
const SUGGESTION_RULES: { keywords: string[]; label: string; fill: string }[] = [
  { keywords: ["lesson plan", "walt", "tib", "walf", "lesson"],
    label: "Generate lesson plan", fill: "Write a complete lesson plan with WALT, TIB and WILF for" },
  { keywords: ["rubric", "assessment criteria", "marking criteria"],
    label: "Create rubric", fill: "Create an assessment rubric for" },
  { keywords: ["behaviour", "bsp", "behaviour support", "de-escalate"],
    label: "Behaviour support plan", fill: "Create a behaviour support plan for a Year" },
  { keywords: ["report comment", "report", "parent report"],
    label: "Write report comment", fill: "Write a report comment for a Year" },
  { keywords: ["differentiate", "eal", "gifted", "additional needs", "differentiation"],
    label: "Differentiate content", fill: "Differentiate this lesson for EAL/D learners," },
  { keywords: ["email parent", "parent email", "contact parent"],
    label: "Write parent email", fill: "Write a professional parent email about" },
  { keywords: ["ac9", "australian curriculum", "curriculum code"],
    label: "Look up AC9 codes", fill: "What are the AC9 codes for Year" },
  { keywords: ["worksheet", "activity", "task"],
    label: "Generate worksheet", fill: "Create a worksheet for" },
  { keywords: ["exit ticket", "exit pass", " AFL"],
    label: "Create exit ticket", fill: "Create an exit ticket for Year" },
  { keywords: ["cold task", "hot task", "pre-assessment", "post-assessment"],
    label: "Design assessment", fill: "Design a cold task and hot task for Year" },
];

function getSmartSuggestions(input: string): { label: string; fill: string }[] {
  if (input.length < 2) return [];
  const lower = input.toLowerCase();
  const matched: { label: string; fill: string }[] = [];
  for (const rule of SUGGESTION_RULES) {
    if (rule.keywords.some(k => lower.includes(k)) && !matched.find(m => m.label === rule.label)) {
      matched.push({ label: rule.label, fill: rule.fill });
    }
  }
  return matched.slice(0, 3);
}

// ─── Image Upload ───────────────────────────────────────────────────
interface ImageUploadState {
  file: File | null;
  preview: string;
  base64: string;
}

function useImageUpload() {
  const [image, setImage] = useState<ImageUploadState | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      alert("Image must be under 5MB");
      return;
    }
    const reader = new FileReader();
    reader.onload = (ev) => {
      const base64 = (ev.target?.result as string).split(",")[1] || "";
      setImage({ file, preview: ev.target?.result as string, base64 });
    };
    reader.readAsDataURL(file);
  }

  function removeImage() {
    setImage(null);
    if (inputRef.current) inputRef.current.value = "";
  }

  return { image, inputRef, handleFileChange, removeImage };
}

// ─── Download helpers ───────────────────────────────────────────────
function downloadTxt(content: string, label: string) {
  const blob = new Blob([content], { type: "text/plain" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a"); a.href = url;
  a.download = `${label}_${new Date().toISOString().slice(0, 10)}.txt`; a.click();
  URL.revokeObjectURL(url);
}

async function downloadPdf(content: string, label: string) {
  try {
    const res = await fetch("/api/export/chat-to-pdf", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content, label }),
    });
    if (!res.ok) throw new Error("PDF generation failed");
    const blob = await res.blob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href = url;
    a.download = `${label}_${new Date().toISOString().slice(0, 10)}.pdf`; a.click();
    URL.revokeObjectURL(url);
  } catch {
    alert("PDF export failed — try downloading as text instead");
  }
}

async function downloadDOCX(content: string, label: string) {
  try {
    const res = await fetch("/api/export/docx", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content, title: label }),
    });
    if (!res.ok) throw new Error("DOCX generation failed");
    const blob = await res.blob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href = url;
    a.download = `${label}_${new Date().toISOString().slice(0, 10)}.docx`; a.click();
    URL.revokeObjectURL(url);
  } catch {
    alert("DOCX export failed");
  }
}

// ─── Content detection ─────────────────────────────────────────────
function isStructuredContent(content: string): boolean {
  const indicators = ["WALT", "TIB", "WILF", "Lesson Plan", "Assessment", "Rubric", "Learning Intention", "Success Criteria", "AC9", "Hot Task", "Cold Task", "Exit Ticket", "Phase | Duration"];
  return indicators.some(ind => content.includes(ind));
}

function getContentType(content: string): string {
  if ((content.includes("WALT") || content.includes("Lesson Plan")) && (content.includes("Phase") || content.includes("Duration") || content.includes("Teacher Does"))) return "lesson";
  if (content.includes("Rubric") && content.includes("Excellent")) return "rubric";
  if (content.includes("Cold Task") || content.includes("Hot Task")) return "assessment";
  if (content.includes("Writing Feedback") || (content.includes("Strengths") && content.includes("Areas to Develop"))) return "feedback";
  if (content.includes("WALT") || content.includes("Lesson Plan")) return "lesson";
  return "other";
}

// ─── Main component ─────────────────────────────────────────────────
export default function ChatView({ profile }: { profile: Profile }) {
  const initialMessage = `Hi ${profile.name}! I'm PickleNickAI — your teaching colleague who never sleeps.

Ask me anything a knowledgeable teacher would know:
• Lesson plans, unit outlines, worksheets
• Behaviour support, de-escalation, wellbeing strategies
• Rubrics, assessment tasks, feedback
• Parent emails, report comments, communications
• AC9 codes, curriculum alignment, scope & sequence
• WA mandatory reporting, AITSL standards, state requirements
• Differentiation for EAL/D, Gifted, Additional Needs

What can I help you with today?`;

  const [input, setInput] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const [showChips, setShowChips] = useState(true);
  const [suggestions, setSuggestions] = useState<{ label: string; fill: string }[]>([]);
  const bottomRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const { image, inputRef: imageInputRef, handleFileChange, removeImage } = useImageUpload();

  const [sessionId] = useState(() => {
    if (typeof window !== "undefined") {
      let id = localStorage.getItem("pn-chat-session");
      if (!id) { id = Date.now().toString(36) + Math.random().toString(36).slice(2); localStorage.setItem("pn-chat-session", id); }
      return id;
    }
    return "";
  });

  const [messages, setMessages] = useState<Message[]>([{
    role: "assistant",
    content: initialMessage,
  }]);

  // Smart suggestions debounce
  useEffect(() => {
    const timer = setTimeout(() => {
      setSuggestions(getSmartSuggestions(input));
    }, 300);
    return () => clearTimeout(timer);
  }, [input]);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages]);

  function fillSuggestion(fill: string) {
    setInput(fill + " ");
    textareaRef.current?.focus();
    setSuggestions([]);
  }

  function send(text?: string) {
    const textToSend = (text ?? input).trim();
    if (!textToSend && !image) return;

    const userMsg: Message = { role: "user", content: textToSend };
    setMessages(m => [...m, userMsg]);
    if (!text) setInput("");
    setShowChips(false);
    setSuggestions([]);
    const imageBase64 = image?.base64 || undefined;
    if (!text) removeImage();

    const assistantMsg: Message = { role: "assistant", content: "", streaming: true };
    setMessages(m => [...m, assistantMsg]);
    setIsStreaming(true);

    const controller = new AbortController();

    fetch("/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ messages: [...messages, userMsg], sessionId, profile, imageBase64 }),
      signal: controller.signal,
    })
      .then(res => {
        if (!res.body) throw new Error("No response body");
        const reader = res.body.getReader();
        const decoder = new TextDecoder();

        function processChunk() {
          reader.read().then(({ done, value }) => {
            if (done) {
              setIsStreaming(false);
              setMessages(m => {
                const last = m[m.length - 1];
                if (!last || last.role !== "assistant") return m.map(msg => ({ ...msg, streaming: false }));
                const ct = getContentType(last.content);
                return [...m.slice(0, -1), { ...last, streaming: false, contentType: ct !== "other" ? ct : null }];
              });
              return;
            }
            const chunk = decoder.decode(value, { stream: true });
            const lines = chunk.split("\n");
            let accumulated = "";
            for (const line of lines) {
              if (line.startsWith("data: ")) {
                const data = line.slice(6);
                try {
                  const parsed = JSON.parse(data);
                  if (parsed.type === "text") accumulated += parsed.content;
                  else if (parsed.type === "done" || parsed.type === "error") {
                    setIsStreaming(false);
                    setMessages(m => {
                      const last = m[m.length - 1];
                      if (!last || last.role !== "assistant") return m.map(msg => ({ ...msg, streaming: false }));
                      const ct = getContentType(last.content);
                      return [...m.slice(0, -1), { ...last, streaming: false, contentType: ct !== "other" ? ct : null }];
                    });
                    return;
                  }
                } catch {}
              }
            }
            if (accumulated) {
              setMessages(m => {
                const last = m[m.length - 1];
                if (last?.streaming) return [...m.slice(0, -1), { ...last, content: last.content + accumulated }];
                return m;
              });
            }
            processChunk();
          }).catch(() => { setIsStreaming(false); setMessages(m => m.map(msg => ({ ...msg, streaming: false }))); });
        }
        processChunk();
      })
      .catch(err => {
        if (err.name !== "AbortError") {
          setMessages(m => [...m, { role: "assistant", content: "Sorry — something went wrong. Please try again.", streaming: false }]);
        }
        setIsStreaming(false);
        setMessages(m => m.map(msg => ({ ...msg, streaming: false })));
      });
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100dvh" }}>
      {/* Chat header */}
      <div style={{
        padding: "16px 24px",
        borderBottom: "1px solid var(--border-subtle)",
        background: "var(--bg)",
        display: "flex", alignItems: "center", justifyContent: "space-between",
        flexShrink: 0,
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{
            background: "linear-gradient(135deg, #6366f1, #818cf8)",
            width: 36, height: 36, borderRadius: 10,
            display: "flex", alignItems: "center", justifyContent: "center",
            fontWeight: 900, fontSize: 13, color: "#fff",
            boxShadow: "0 0 16px rgba(99,102,241,0.3)",
            flexShrink: 0,
          }}>PN</div>
          <div>
            <div style={{ fontWeight: 700, fontSize: 14, letterSpacing: "-0.01em" }}>PickleNickAI</div>
            <div style={{ fontSize: 12, color: "var(--success)", display: "flex", alignItems: "center", gap: 5 }}>
              <div style={{ width: 6, height: 6, borderRadius: "50%", background: "var(--success)", animation: "pulse-dot 2s ease-in-out infinite" }} />
              Online · AC9 aligned
            </div>
          </div>
        </div>

        {/* New chat */}
        <button
          onClick={() => {
            setMessages([{ role: "assistant", content: `Hi ${profile.name}! I'm PickleNickAI. What would you like to work on today?` }]);
          }}
          style={{
            display: "flex", alignItems: "center", gap: 6,
            padding: "7px 14px",
            background: "var(--surface-2)",
            border: "1px solid var(--border)",
            borderRadius: "var(--radius-sm)",
            fontSize: 13, fontWeight: 500, color: "var(--text-2)",
            cursor: "pointer",
          }}
        >
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
          </svg>
          New chat
        </button>
      </div>

      {/* Messages */}
      <div style={{
        flex: 1, overflowY: "auto",
        padding: "24px",
        display: "flex", flexDirection: "column", gap: 20,
      }}>
        {messages.map((msg, i) => {
          const isStructured = msg.role === "assistant" && !msg.streaming && isStructuredContent(msg.content);

          return (
            <div key={i} style={{
              display: "flex",
              justifyContent: msg.role === "user" ? "flex-end" : "flex-start",
              alignItems: "flex-start",
              gap: 10,
              animation: "fade-in 0.2s ease-out",
            }}>
              {/* Avatar — assistant only */}
              {msg.role === "assistant" && (
                <div style={{
                  background: "linear-gradient(135deg, #6366f1, #818cf8)",
                  width: 28, height: 28, borderRadius: 8,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontWeight: 900, fontSize: 11, color: "#fff",
                  flexShrink: 0, marginTop: 2,
                  boxShadow: "0 0 12px rgba(99,102,241,0.3)",
                }}>PN</div>
              )}

              <div style={{ maxWidth: msg.contentType ? "90%" : "72%" }}>
                {msg.contentType && msg.role === "assistant" && !msg.streaming ? (
                  <>
                    {msg.contentType === "lesson" && (
                      <LessonPlanDisplay
                        content={msg.content}
                        onDownloadTxt={() => downloadTxt(msg.content, "lesson-plan")}
                        onDownloadPdf={() => downloadPdf(msg.content, "lesson-plan")}
                        onDownloadDOCX={() => downloadDOCX(msg.content, "lesson-plan")}
                      />
                    )}
                    {msg.contentType === "rubric" && (
                      <RubricDisplay
                        content={msg.content}
                        onDownloadTxt={() => downloadTxt(msg.content, "rubric")}
                        onDownloadPdf={() => downloadPdf(msg.content, "rubric")}
                        onDownloadDOCX={() => downloadDOCX(msg.content, "rubric")}
                      />
                    )}
                    {msg.contentType === "assessment" && (
                      <AssessmentDisplay
                        content={msg.content}
                        onDownloadTxt={() => downloadTxt(msg.content, "assessment")}
                        onDownloadPdf={() => downloadPdf(msg.content, "assessment")}
                        onDownloadDOCX={() => downloadDOCX(msg.content, "assessment")}
                      />
                    )}
                    {msg.contentType === "feedback" && (
                      <WritingFeedbackDisplay
                        content={msg.content}
                        onDownloadTxt={() => downloadTxt(msg.content, "feedback")}
                        onDownloadPdf={() => downloadPdf(msg.content, "feedback")}
                        onDownloadDOCX={() => downloadDOCX(msg.content, "feedback")}
                      />
                    )}
                    {msg.contentType === "other" && (
                      <div style={{ padding: "12px 16px", borderRadius: "14px 14px 14px 4px", background: "var(--surface-2)", color: "var(--text)", fontSize: 14, lineHeight: 1.65, border: "1px solid var(--border-subtle)" }}>
                        <ReactMarkdown remarkPlugins={[remarkGfm]}>{msg.content}</ReactMarkdown>
                      </div>
                    )}
                  </>
                ) : (
                  <div style={{
                    padding: "12px 16px",
                    borderRadius: msg.role === "user"
                      ? "14px 14px 4px 14px"
                      : "14px 14px 14px 4px",
                    background: msg.role === "user"
                      ? "var(--primary)"
                      : "var(--surface-2)",
                    color: msg.role === "user" ? "#fff" : "var(--text)",
                    fontSize: 14, lineHeight: 1.65,
                    whiteSpace: "pre-wrap", wordBreak: "break-word",
                    border: msg.role === "assistant" ? "1px solid var(--border-subtle)" : "none",
                  }}>
                    {msg.content}
                    {msg.streaming && (
                      <span style={{ opacity: 0.5, animation: "blink-cursor 0.8s step-start infinite" }}>▍</span>
                    )}
                  </div>
                )}

                {/* Action bar for structured content */}
                {msg.contentType && !msg.streaming && msg.role === "assistant" && (
                  <div style={{
                    display: "flex", gap: 6, flexWrap: "wrap",
                  }}>
                    {[
                      { label: "Copy", action: () => navigator.clipboard.writeText(msg.content) },
                      { label: "PDF", action: () => downloadPdf(msg.content, msg.contentType || "content") },
                      { label: "TXT", action: () => downloadTxt(msg.content, msg.contentType || "content") },
                      { label: "DOCX", action: () => downloadDOCX(msg.content, msg.contentType || "content") },
                    ].map(btn => (
                      <button
                        key={btn.label}
                        onClick={btn.action}
                        style={{
                          padding: "5px 10px",
                          background: "var(--surface)",
                          border: "1px solid var(--border)",
                          borderRadius: "var(--radius-sm)",
                          fontSize: 12, color: "var(--text-2)",
                          cursor: "pointer",
                          display: "flex", alignItems: "center", gap: 4,
                          transition: "all 0.12s",
                        }}
                      >
                        {btn.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          );
        })}

        {/* Streaming indicator */}
        {isStreaming && messages[messages.length - 1]?.streaming && (
          <div style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
            <div style={{
              background: "linear-gradient(135deg, #6366f1, #818cf8)",
              width: 28, height: 28, borderRadius: 8,
              display: "flex", alignItems: "center", justifyContent: "center",
              fontWeight: 900, fontSize: 11, color: "#fff",
              flexShrink: 0, marginTop: 2,
            }}>PN</div>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <div style={{
                width: 6, height: 6, borderRadius: "50%",
                background: "var(--primary)",
                animation: "pulse-dot 1.5s ease-in-out infinite",
              }} />
              <span style={{ fontSize: 13, color: "var(--text-3)" }}>Generating...</span>
            </div>
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* Quick prompts — shown only on first exchange */}
      {messages.length === 1 && showChips && (
        <div style={{ padding: "0 24px 12px", display: "flex", gap: 8, flexWrap: "wrap" }}>
          {QUICK_PROMPTS.map(q => (
            <button
              key={q.label}
              onClick={() => { send(q.prompt); setShowChips(false); }}
              style={{
                padding: "7px 14px",
                background: "var(--surface)",
                border: "1px solid var(--border)",
                borderRadius: "var(--radius-full)",
                fontSize: 12, color: "var(--text-2)",
                cursor: "pointer",
                transition: "all 0.12s",
              }}
            >
              {q.label}
            </button>
          ))}
        </div>
      )}

      {/* Smart Suggestions */}
      {suggestions.length > 0 && (
        <div style={{
          padding: "0 24px 8px",
          display: "flex", gap: 8, flexWrap: "wrap",
          animation: "fade-in 0.15s var(--ease)",
        }}>
          {suggestions.map(s => (
            <button
              key={s.label}
              onClick={() => fillSuggestion(s.fill)}
              style={{
                padding: "6px 12px",
                background: "var(--surface)",
                border: "1px solid var(--primary)",
                borderRadius: "var(--radius-full)",
                fontSize: 12, color: "var(--primary)",
                cursor: "pointer",
                transition: "all 0.12s",
                fontWeight: 500,
              }}
            >
              {s.label}
            </button>
          ))}
        </div>
      )}

      {/* Input */}
      <div style={{
        padding: "14px 24px 20px",
        borderTop: "1px solid var(--border-subtle)",
        background: "var(--bg)",
      }}>
        {/* Image preview */}
        {image && (
          <div style={{ marginBottom: 10, position: "relative", display: "inline-block" }}>
            <img
              src={image.preview}
              alt="Upload preview"
              style={{
                height: 72, width: "auto",
                borderRadius: "var(--radius)",
                border: "1px solid var(--border)",
                maxWidth: "100%",
              }}
            />
            <button
              onClick={removeImage}
              style={{
                position: "absolute", top: -6, right: -6,
                width: 20, height: 20, borderRadius: "50%",
                background: "var(--danger)", border: "none",
                color: "#fff", fontSize: 10, cursor: "pointer",
                display: "flex", alignItems: "center", justifyContent: "center",
                boxShadow: "var(--shadow-sm)",
              }}
            >
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
            </button>
          </div>
        )}

        <div style={{
          display: "flex", gap: 10, alignItems: "flex-end",
          background: "var(--surface)",
          border: "1px solid var(--border)",
          borderRadius: "var(--radius-lg)",
          padding: "6px 6px 6px 16px",
          transition: "border-color 0.15s",
        }}>
          {/* Paperclip for image upload */}
          <input
            ref={imageInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp,image/heic"
            onChange={handleFileChange}
            style={{ display: "none" }}
          />
          <button
            onClick={() => imageInputRef.current?.click()}
            title="Upload image"
            style={{
              background: "none", border: "none",
              color: image ? "var(--primary)" : "var(--text-3)",
              cursor: "pointer",
              display: "flex", alignItems: "center",
              padding: "4px",
              flexShrink: 0,
              transition: "color 0.15s",
            }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48"/>
            </svg>
          </button>

          <textarea
            ref={textareaRef}
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                send();
              }
            }}
            placeholder="Ask about lesson plans, rubrics, behaviour, AC9..."
            disabled={isStreaming}
            rows={1}
            style={{
              flex: 1,
              background: "transparent",
              color: "var(--text)",
              border: "none",
              outline: "none",
              fontSize: 14,
              lineHeight: 1.5,
              resize: "none",
              padding: "8px 0",
              maxHeight: 120,
              overflowY: "auto",
            }}
          />
          <button
            onClick={() => send()}
            disabled={(!input.trim() && !image) || isStreaming}
            style={{
              width: 38, height: 38,
              background: input.trim() || image ? "var(--primary)" : "var(--surface-2)",
              color: input.trim() || image ? "#fff" : "var(--text-3)",
              border: "none",
              borderRadius: "var(--radius)",
              cursor: input.trim() || image ? "pointer" : "not-allowed",
              display: "flex", alignItems: "center", justifyContent: "center",
              flexShrink: 0,
              transition: "all 0.15s",
            }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <line x1="12" y1="19" x2="12" y2="5"/><polyline points="5 12 12 5 19 12"/>
            </svg>
          </button>
        </div>

        <p style={{ fontSize: 11, color: "var(--text-3)", textAlign: "center", marginTop: 8 }}>
          PickleNickAI may produce inaccurate information. Always verify against official AC9 curriculum documents.
        </p>
      </div>
    </div>
  );
}
