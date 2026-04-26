"use client";
import { useState, useRef, useEffect } from "react";

interface Message { role: "user" | "assistant"; content: string; streaming?: boolean; }
interface Profile { name: string; yearLevels: string[]; subjects: string[]; focusAreas?: string[]; school?: string; }

const QUICK_PROMPTS = [
  "Write a lesson plan on...",
  "Help me with a behaviour issue...",
  "Create a rubric for...",
  "Explain AC9 codes...",
];

function isStructuredContent(content: string): boolean {
  const indicators = ["WALT", "TIB", "WILF", "Lesson Plan", "Assessment", "Rubric", "Learning Intention", "Success Criteria", "AC9", "Hot Task", "Cold Task", "Exit Ticket", "Phase | Duration"];
  return indicators.some(ind => content.includes(ind));
}

function getContentType(content: string): string {
  if (content.includes("WALT") || content.includes("Lesson Plan")) return "lesson";
  if (content.includes("Rubric") || (content.includes("Excellent") && content.includes("Satisfactory"))) return "rubric";
  if (content.includes("Cold Task") || content.includes("Hot Task") || content.includes("Assessment")) return "assessment";
  return "other";
}

function downloadTxt(content: string, label: string) {
  const blob = new Blob([content], { type: "text/plain" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a"); a.href = url;
  a.download = `${label}_${new Date().toISOString().slice(0, 10)}.txt`; a.click();
  URL.revokeObjectURL(url);
}

function saveToProfile(content: string, label: string, contentType: string) {
  const savedDocs = JSON.parse(localStorage.getItem("pn-saved-docs") || "[]");
  savedDocs.unshift({ id: Date.now().toString(36), type: contentType, label, content, savedAt: Date.now() });
  localStorage.setItem("pn-saved-docs", JSON.stringify(savedDocs.slice(0, 50)));
  const btns = document.querySelectorAll(`[data-save-btn]`);
  btns.forEach(b => { const el = b as HTMLElement; el.textContent = "✓ Saved"; el.style.color = "var(--success)"; setTimeout(() => { el.textContent = "💾 Save"; el.style.color = ""; }, 1500); });
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

export default function ChatView({ profile }: { profile: Profile }) {
  const [messages, setMessages] = useState<Message[]>([{
    role: "assistant",
    content: `Hi ${profile.name}! I'm PickleNickAI — your personal AI teaching assistant for Australian F-6. I know the AC9 curriculum inside out, and I'm here to help with lesson plans, assessments, behaviour strategies, differentiation, unit design — anything.\n\nWhat would you like to work on today?`,
  }]);
  const [input, setInput] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const [sessionId] = useState(() => {
    if (typeof window !== "undefined") {
      let id = localStorage.getItem("pn-chat-session");
      if (!id) { id = Date.now().toString(36) + Math.random().toString(36).slice(2); localStorage.setItem("pn-chat-session", id); }
      return id;
    }
    return "";
  });

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages]);

  function send(text?: string) {
    const textToSend = (text ?? input).trim();
    if (!textToSend || isStreaming) return;

    const userMsg: Message = { role: "user", content: textToSend };
    setMessages(m => [...m, userMsg]);
    if (!text) setInput("");

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
              setMessages(m => m.map(msg => ({ ...msg, streaming: false })));
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
                    setMessages(m => m.map(msg => ({ ...msg, streaming: false })));
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

  function copyToClipboard(text: string) {
    navigator.clipboard.writeText(text);
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100dvh" }}>
      {/* Header */}
      <div style={{ padding: "16px 20px", borderBottom: "1px solid var(--border)", background: "var(--surface)", display: "flex", alignItems: "center", gap: 12 }}>
        <div style={{ background: "linear-gradient(135deg, #6366f1, #22d3ee)", width: 38, height: 38, borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 900, fontSize: 15, color: "#fff", flexShrink: 0 }}>PN</div>
        <div>
          <div style={{ fontWeight: 800, fontSize: 15 }}>PickleNickAI Chat</div>
          <div style={{ fontSize: 12, color: "var(--success)", display: "flex", alignItems: "center", gap: 4 }}>
            <div style={{ width: 7, height: 7, borderRadius: "50%", background: "var(--success)" }} />
            Online
          </div>
        </div>
      </div>

      {/* Messages */}
      <div style={{ flex: 1, overflowY: "auto", padding: "20px", display: "flex", flexDirection: "column", gap: 16 }}>
        {messages.map((msg, i) => {
          const isStructured = msg.role === "assistant" && !msg.streaming && isStructuredContent(msg.content);
          const contentType = isStructured ? getContentType(msg.content) : null;

          return (
            <div key={i} style={{ display: "flex", justifyContent: msg.role === "user" ? "flex-end" : "flex-start", alignItems: "flex-start" }}>
              {msg.role === "assistant" && (
                <div style={{ background: "linear-gradient(135deg, #6366f1, #22d3ee)", width: 30, height: 30, borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 900, fontSize: 12, color: "#fff", flexShrink: 0, marginRight: 10, marginTop: 4 }}>
                  PN
                </div>
              )}
              <div style={{ maxWidth: "78%" }}>
                <div style={{ padding: "12px 16px", borderRadius: msg.role === "user" ? "16px 16px 4px 16px" : "16px 16px 16px 4px", background: msg.role === "user" ? "var(--primary)" : "var(--surface2)", color: msg.role === "user" ? "#fff" : "var(--text)", fontSize: 14, lineHeight: 1.6, whiteSpace: "pre-wrap", wordBreak: "break-word" }}>
                  {msg.content}
                  {msg.streaming && <span style={{ opacity: 0.6, animation: "blink 1s step-start infinite" }}>|</span>}
                </div>

                {/* Export actions for structured content */}
                {isStructured && (
                  <div style={{ display: "flex", gap: 8, marginTop: 8, flexWrap: "wrap" }}>
                    <button
                      data-save-btn
                      onClick={() => saveToProfile(msg.content, contentType || "content", contentType || "content")}
                      style={{ padding: "6px 12px", background: "var(--surface2)", border: "1px solid var(--border)", borderRadius: 8, fontSize: 12, color: "var(--text2)", cursor: "pointer", display: "flex", alignItems: "center", gap: 5 }}
                    >
                      💾 Save
                    </button>
                    <button
                      onClick={() => downloadPdf(msg.content, contentType || "content")}
                      style={{ padding: "6px 12px", background: "var(--surface2)", border: "1px solid var(--border)", borderRadius: 8, fontSize: 12, color: "var(--text2)", cursor: "pointer", display: "flex", alignItems: "center", gap: 5 }}
                    >
                      📕 PDF
                    </button>
                    <button
                      onClick={() => downloadTxt(msg.content, contentType || "content")}
                      style={{ padding: "6px 12px", background: "var(--surface2)", border: "1px solid var(--border)", borderRadius: 8, fontSize: 12, color: "var(--text2)", cursor: "pointer", display: "flex", alignItems: "center", gap: 5 }}
                    >
                      📄 TXT
                    </button>
                    <button
                      onClick={() => copyToClipboard(msg.content)}
                      style={{ padding: "6px 12px", background: "var(--surface2)", border: "1px solid var(--border)", borderRadius: 8, fontSize: 12, color: "var(--text2)", cursor: "pointer", display: "flex", alignItems: "center", gap: 5 }}
                    >
                      📋 Copy
                    </button>
                  </div>
                )}
              </div>
            </div>
          );
        })}
        <div ref={bottomRef} />
      </div>

      {/* Quick prompts */}
      {messages.length === 1 && (
        <div style={{ padding: "0 20px 12px", display: "flex", gap: 8, flexWrap: "wrap" }}>
          {QUICK_PROMPTS.map(q => (
            <button key={q} onClick={() => send(q)} style={{ padding: "7px 14px", background: "var(--surface2)", border: "1px solid var(--border)", borderRadius: 20, fontSize: 13, color: "var(--text2)", cursor: "pointer" }}>
              {q}
            </button>
          ))}
        </div>
      )}

      {/* Streaming indicator */}
      {isStreaming && (
        <div style={{ padding: "0 20px 8px", display: "flex", alignItems: "center", gap: 8 }}>
          <div style={{ width: 6, height: 6, borderRadius: "50%", background: "var(--primary)", animation: "pulse 1.5s ease-in-out infinite" }} />
          <span style={{ fontSize: 12, color: "var(--text3)" }}>Generating response...</span>
        </div>
      )}

      {/* Input */}
      <div style={{ padding: "14px 20px", borderTop: "1px solid var(--border)", background: "var(--surface)", display: "flex", gap: 10, alignItems: "center" }}>
        <input
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === "Enter" && !e.shiftKey && (e.preventDefault(), send())}
          placeholder="Ask me anything about teaching..."
          disabled={isStreaming}
          style={{ flex: 1, padding: "11px 16px", background: "var(--surface2)", color: "var(--text)", border: "1px solid var(--border)", borderRadius: 24, fontSize: 14, outline: "none", opacity: isStreaming ? 0.6 : 1 }}
          onFocus={e => e.currentTarget.style.borderColor = "var(--primary)"}
          onBlur={e => e.currentTarget.style.borderColor = "var(--border)"}
        />
        <button
          onClick={() => send()}
          disabled={!input.trim() || isStreaming}
          style={{ width: 42, height: 42, background: input.trim() && !isStreaming ? "var(--primary)" : "var(--surface2)", color: input.trim() && !isStreaming ? "#fff" : "var(--text3)", border: "none", borderRadius: "50%", cursor: input.trim() && !isStreaming ? "pointer" : "not-allowed", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, fontSize: 18, transition: "all 0.2s" }}
        >
          ↑
        </button>
      </div>

      <style>{`
        @keyframes blink { 0%, 100% { opacity: 0.6; } 50% { opacity: 0; } }
        @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.4; } }
      `}</style>
    </div>
  );
}
