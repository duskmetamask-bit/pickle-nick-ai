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
  { label: "Lesson plan", prompt: "Write a lesson plan on..." },
  { label: "AC9 codes", prompt: "What are the AC9 codes for..." },
  { label: "Differentiation", prompt: "Help me differentiate this lesson for..." },
  { label: "Report comment", prompt: "Write a report comment for..." },
];

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

interface FloatingChatWidgetProps {
  profile: Profile;
  initialCollapsed?: boolean;
}

export default function FloatingChatWidget({ profile, initialCollapsed = true }: FloatingChatWidgetProps) {
  const [isExpanded, setIsExpanded] = useState(!initialCollapsed);
  const [isMinimized, setIsMinimized] = useState(false);
  const [input, setInput] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const [showChips, setShowChips] = useState(true);
  const [unread, setUnread] = useState(0);
  const bottomRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const wasExpandedRef = useRef(isExpanded);

  const [sessionId] = useState(() => {
    if (typeof window !== "undefined") {
      let id = localStorage.getItem("pn-chat-session");
      if (!id) { id = Date.now().toString(36) + Math.random().toString(36).slice(2); localStorage.setItem("pn-chat-session", id); }
      return id;
    }
    return "";
  });

  const initialMessage = `Hi ${profile.name}! I'm PickleNickAI — ask me anything about lesson plans, rubrics, behaviour support, AC9 codes, and more.`;
  const [messages, setMessages] = useState<Message[]>([{
    role: "assistant",
    content: initialMessage,
  }]);

  // Track unread messages when minimized
  useEffect(() => {
    if (isMinimized && messages.length > 1) {
      const lastMsg = messages[messages.length - 1];
      if (lastMsg.role === "assistant" && !lastMsg.streaming) {
        setUnread(u => u + 1);
      }
    }
  }, [messages, isMinimized]);

  // Auto-scroll
  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages]);

  // Expand on new message when minimized
  useEffect(() => {
    if (isMinimized && messages.length > 1) {
      const lastMsg = messages[messages.length - 1];
      if (lastMsg.role === "assistant" && !lastMsg.streaming) {
        setIsMinimized(false);
        setIsExpanded(true);
        setUnread(0);
      }
    }
  }, [messages, isMinimized]);

  const send = useCallback((text?: string) => {
    const textToSend = (text ?? input).trim();
    if (!textToSend || isStreaming) return;

    const userMsg: Message = { role: "user", content: textToSend };
    setMessages(m => [...m, userMsg]);
    if (!text) setInput("");
    setShowChips(false);

    const assistantMsg: Message = { role: "assistant", content: "", streaming: true };
    setMessages(m => [...m, assistantMsg]);
    setIsStreaming(true);

    const controller = new AbortController();

    fetch("/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ messages: [...messages, userMsg], sessionId, profile }),
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
  }, [input, isStreaming, messages, sessionId, profile]);

  // ── Collapsed button ────────────────────────────────────────────────
  if (!isExpanded) {
    return (
      <button
        onClick={() => { setIsExpanded(true); setUnread(0); }}
        style={{
          position: "fixed",
          bottom: 24,
          right: 24,
          width: 56,
          height: 56,
          borderRadius: "50%",
          background: "linear-gradient(135deg, #6366f1, #818cf8)",
          border: "none",
          cursor: "pointer",
          zIndex: 9999,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          boxShadow: "0 4px 24px rgba(99,102,241,0.4), 0 0 0 0 rgba(99,102,241,0.4)",
          transition: "transform 0.2s ease, box-shadow 0.2s ease",
        }}
        onMouseEnter={e => {
          e.currentTarget.style.transform = "scale(1.08)";
          e.currentTarget.style.boxShadow = "0 6px 32px rgba(99,102,241,0.5)";
        }}
        onMouseLeave={e => {
          e.currentTarget.style.transform = "scale(1)";
          e.currentTarget.style.boxShadow = "0 4px 24px rgba(99,102,241,0.4)";
        }}
        aria-label="Open chat"
      >
        {/* Chat icon */}
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
        </svg>

        {/* Unread badge */}
        {unread > 0 && (
          <div style={{
            position: "absolute",
            top: -2,
            right: -2,
            width: 20,
            height: 20,
            borderRadius: "50%",
            background: "#f87171",
            color: "#fff",
            fontSize: 11,
            fontWeight: 700,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            border: "2px solid #0a0a0a",
          }}>
            {unread > 9 ? "9+" : unread}
          </div>
        )}

        {/* Pulse ring animation */}
        <div style={{
          position: "absolute",
          inset: -4,
          borderRadius: "50%",
          border: "2px solid rgba(99,102,241,0.3)",
          animation: "pulse-ring 2s ease-out infinite",
          pointerEvents: "none",
        }} />
      </button>
    );
  }

  // ── Expanded widget ─────────────────────────────────────────────────
  return (
    <div
      style={{
        position: "fixed",
        bottom: 24,
        right: 24,
        width: 380,
        height: 560,
        background: "var(--surface)",
        border: "1px solid var(--border)",
        borderRadius: 16,
        boxShadow: "0 24px 80px rgba(0,0,0,0.6), 0 0 0 1px rgba(255,255,255,0.05)",
        zIndex: 9999,
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
        animation: "slide-up 0.2s ease-out",
      }}
    >
      {/* Header */}
      <div style={{
        padding: "12px 16px",
        borderBottom: "1px solid var(--border-subtle)",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        background: "var(--surface)",
        flexShrink: 0,
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{
            background: "linear-gradient(135deg, #6366f1, #818cf8)",
            width: 32,
            height: 32,
            borderRadius: 9,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontWeight: 900,
            fontSize: 12,
            color: "#fff",
            boxShadow: "0 0 14px rgba(99,102,241,0.35)",
          }}>PN</div>
          <div>
            <div style={{ fontWeight: 700, fontSize: 13, letterSpacing: "-0.01em" }}>PickleNickAI</div>
            <div style={{ fontSize: 11, color: "var(--success)", display: "flex", alignItems: "center", gap: 4 }}>
              <div style={{ width: 5, height: 5, borderRadius: "50%", background: "var(--success)" }} />
              Online
            </div>
          </div>
        </div>

        <div style={{ display: "flex", gap: 6 }}>
          {/* New chat */}
          <button
            onClick={() => setMessages([{ role: "assistant", content: `Hi ${profile.name}! I'm PickleNickAI. What would you like to work on today?` }])}
            title="New chat"
            style={{
              width: 30,
              height: 30,
              borderRadius: 8,
              background: "var(--surface-2)",
              border: "1px solid var(--border)",
              color: "var(--text-2)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
              fontSize: 13,
            }}
          >
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
            </svg>
          </button>

          {/* Minimize */}
          <button
            onClick={() => { setIsExpanded(false); setIsMinimized(true); }}
            title="Minimize"
            style={{
              width: 30,
              height: 30,
              borderRadius: 8,
              background: "var(--surface-2)",
              border: "1px solid var(--border)",
              color: "var(--text-2)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
              fontSize: 13,
            }}
          >
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <line x1="5" y1="12" x2="19" y2="12"/>
            </svg>
          </button>
        </div>
      </div>

      {/* Messages */}
      <div style={{
        flex: 1,
        overflowY: "auto",
        padding: "12px",
        display: "flex",
        flexDirection: "column",
        gap: 10,
      }}>
        {messages.map((msg, i) => {
          const isStructured = msg.role === "assistant" && !msg.streaming && isStructuredContent(msg.content);

          return (
            <div key={i} style={{
              display: "flex",
              justifyContent: msg.role === "user" ? "flex-end" : "flex-start",
              alignItems: "flex-start",
              gap: 7,
              animation: "fade-in 0.15s ease-out",
            }}>
              {msg.role === "assistant" && (
                <div style={{
                  background: "linear-gradient(135deg, #6366f1, #818cf8)",
                  width: 22,
                  height: 22,
                  borderRadius: 6,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontWeight: 900,
                  fontSize: 9,
                  color: "#fff",
                  flexShrink: 0,
                  marginTop: 2,
                }}>PN</div>
              )}

              <div style={{ maxWidth: msg.contentType ? "95%" : "80%" }}>
                {msg.contentType && msg.role === "assistant" && !msg.streaming ? (
                  <>
                    {msg.contentType === "lesson" && (
                      <LessonPlanDisplay
                        content={msg.content}
                        compact
                        onDownloadTxt={() => downloadTxt(msg.content, "lesson-plan")}
                        onDownloadPdf={() => downloadPdf(msg.content, "lesson-plan")}
                        onDownloadDOCX={() => downloadDOCX(msg.content, "lesson-plan")}
                      />
                    )}
                    {msg.contentType === "rubric" && (
                      <RubricDisplay
                        content={msg.content}
                        compact
                        onDownloadTxt={() => downloadTxt(msg.content, "rubric")}
                        onDownloadPdf={() => downloadPdf(msg.content, "rubric")}
                        onDownloadDOCX={() => downloadDOCX(msg.content, "rubric")}
                      />
                    )}
                    {msg.contentType === "assessment" && (
                      <AssessmentDisplay
                        content={msg.content}
                        compact
                        onDownloadTxt={() => downloadTxt(msg.content, "assessment")}
                        onDownloadPdf={() => downloadPdf(msg.content, "assessment")}
                        onDownloadDOCX={() => downloadDOCX(msg.content, "assessment")}
                      />
                    )}
                    {msg.contentType === "feedback" && (
                      <WritingFeedbackDisplay
                        content={msg.content}
                        compact
                        onDownloadTxt={() => downloadTxt(msg.content, "feedback")}
                        onDownloadPdf={() => downloadPdf(msg.content, "feedback")}
                        onDownloadDOCX={() => downloadDOCX(msg.content, "feedback")}
                      />
                    )}
                    {msg.contentType === "other" && (
                      <div style={{ padding: "9px 12px", borderRadius: "11px 11px 11px 3px", background: "var(--surface-2)", color: "var(--text)", fontSize: 12.5, lineHeight: 1.6, border: "1px solid var(--border-subtle)" }}>
                        <ReactMarkdown remarkPlugins={[remarkGfm]}>{msg.content}</ReactMarkdown>
                      </div>
                    )}
                  </>
                ) : (
                  <div style={{
                    padding: "9px 12px",
                    borderRadius: msg.role === "user"
                      ? "12px 12px 3px 12px"
                      : "12px 12px 12px 3px",
                    background: msg.role === "user"
                      ? "var(--primary)"
                      : "var(--surface-2)",
                    color: msg.role === "user" ? "#fff" : "var(--text)",
                    fontSize: 12.5,
                    lineHeight: 1.6,
                    whiteSpace: "pre-wrap",
                    wordBreak: "break-word",
                    border: msg.role === "assistant" ? "1px solid var(--border-subtle)" : "none",
                  }}>
                    {msg.content}
                    {msg.streaming && (
                      <span style={{ opacity: 0.5, animation: "blink-cursor 0.8s step-start infinite" }}>▍</span>
                    )}
                  </div>
                )}

                {/* Action bar */}
                {msg.contentType && !msg.streaming && msg.role === "assistant" && (
                  <div style={{ display: "flex", gap: 4, marginTop: 5, flexWrap: "wrap" }}>
                    {[
                      { label: "Copy", action: () => navigator.clipboard.writeText(msg.content) },
                      { label: "PDF", action: () => downloadPdf(msg.content, msg.contentType || "content") },
                      { label: "TXT", action: () => downloadTxt(msg.content, msg.contentType || "content") },
                    ].map(btn => (
                      <button
                        key={btn.label}
                        onClick={btn.action}
                        style={{
                          padding: "3px 8px",
                          background: "var(--surface)",
                          border: "1px solid var(--border)",
                          borderRadius: "var(--radius-sm)",
                          fontSize: 11,
                          color: "var(--text-2)",
                          cursor: "pointer",
                          display: "flex",
                          alignItems: "center",
                          gap: 3,
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

        {isStreaming && messages[messages.length - 1]?.streaming && (
          <div style={{ display: "flex", gap: 7, alignItems: "flex-start" }}>
            <div style={{
              background: "linear-gradient(135deg, #6366f1, #818cf8)",
              width: 22,
              height: 22,
              borderRadius: 6,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontWeight: 900,
              fontSize: 9,
              color: "#fff",
              flexShrink: 0,
            }}>PN</div>
            <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
              <div style={{ width: 5, height: 5, borderRadius: "50%", background: "var(--primary)", animation: "pulse-dot 1.5s ease-in-out infinite" }} />
              <span style={{ fontSize: 11, color: "var(--text-3)" }}>Generating...</span>
            </div>
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* Quick prompts */}
      {messages.length === 1 && showChips && (
        <div style={{ padding: "0 10px 8px", display: "flex", gap: 5, flexWrap: "wrap" }}>
          {QUICK_PROMPTS.map(q => (
            <button
              key={q.label}
              onClick={() => { send(q.prompt); setShowChips(false); }}
              style={{
                padding: "5px 10px",
                background: "var(--surface-2)",
                border: "1px solid var(--border)",
                borderRadius: "var(--radius-full)",
                fontSize: 11,
                color: "var(--text-2)",
                cursor: "pointer",
              }}
            >
              {q.label}
            </button>
          ))}
        </div>
      )}

      {/* Input */}
      <div style={{
        padding: "10px 12px 12px",
        borderTop: "1px solid var(--border-subtle)",
        background: "var(--surface)",
        flexShrink: 0,
      }}>
        <div style={{
          display: "flex",
          gap: 8,
          alignItems: "flex-end",
          background: "var(--surface-2)",
          border: "1px solid var(--border)",
          borderRadius: "var(--radius)",
          padding: "5px 5px 5px 12px",
        }}>
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
            placeholder="Ask me anything..."
            disabled={isStreaming}
            rows={1}
            style={{
              flex: 1,
              background: "transparent",
              color: "var(--text)",
              border: "none",
              outline: "none",
              fontSize: 13,
              lineHeight: 1.5,
              resize: "none",
              padding: "6px 0",
              maxHeight: 80,
              overflowY: "auto",
            }}
          />
          <button
            onClick={() => send()}
            disabled={!input.trim() || isStreaming}
            style={{
              width: 32,
              height: 32,
              background: input.trim() && !isStreaming ? "var(--primary)" : "var(--surface)",
              color: input.trim() && !isStreaming ? "#fff" : "var(--text-3)",
              border: "none",
              borderRadius: "var(--radius-sm)",
              cursor: input.trim() && !isStreaming ? "pointer" : "not-allowed",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
              transition: "all 0.15s",
            }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <line x1="12" y1="19" x2="12" y2="5"/><polyline points="5 12 12 5 19 12"/>
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}
