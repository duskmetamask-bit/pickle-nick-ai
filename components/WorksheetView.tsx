"use client";
import { useState } from "react";

function logFeedback(type: string, quality: "good" | "bad", context: string) {
  const key = `pn-feedback-${type}`;
  const existing = JSON.parse(localStorage.getItem(key) || "[]");
  existing.push({ quality, context, ts: Date.now() });
  localStorage.setItem(key, JSON.stringify(existing.slice(-50)));
}

function logUsage(type: string, action: string, context: string) {
  const key = `pn-usage`;
  const existing = JSON.parse(localStorage.getItem(key) || "[]");
  existing.push({ type, action, context, ts: Date.now() });
  localStorage.setItem(key, JSON.stringify(existing.slice(-100)));
}

const SUBJECTS = ["Mathematics", "English", "Science", "HASS", "Technologies", "The Arts", "Health & Physical Education"];
const YEAR_LEVELS = ["Pre-Primary", "Year 1", "Year 2", "Year 3", "Year 4", "Year 5", "Year 6"];
const WORKSHEET_TYPES = ["Worksheet", "Quiz", "Activity", "Exit Ticket", "Homework", "Revision"];

export default function WorksheetView() {
  const [subject, setSubject] = useState("Mathematics");
  const [yearLevel, setYearLevel] = useState("Year 4");
  const [topic, setTopic] = useState("");
  const [worksheetType, setWorksheetType] = useState("Worksheet");
  const [additionalNotes, setAdditionalNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState("");
  const [error, setError] = useState("");
  const [feedback, setFeedback] = useState<"good" | "bad" | null>(null);

  async function generate() {
    if (!topic.trim()) { setError("Please enter a topic"); return; }

    // Check free tier
    const allowed = await new Promise<boolean>(resolve => {
      window.dispatchEvent(new CustomEvent("pn-free-tier", {
        detail: { action: "generate", result: resolve }
      }));
    });
    if (!allowed) { setLoading(false); return; }

    setError(""); setLoading(true); setResult(""); setFeedback(null);
    try {
      const res = await fetch("/api/worksheet", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ subject, yearLevel, topic, worksheetType, additionalNotes }),
      });
      const data = await res.json();
      if (data.worksheet) { setResult(data.worksheet); logUsage("worksheet", "generate", `${subject} ${yearLevel} ${topic}`); }
      else if (data.error) setError(data.error);
    } catch { setError("Generation failed. Please try again."); }
    finally { setLoading(false); }
  }

  function download(format: "txt" | "pdf" | "pptx" | "docx") {
    if (!result) return;
    logUsage("worksheet", "export", `${format} ${subject} ${yearLevel} ${topic}`);
    if (format === "txt") {
      const blob = new Blob([result], { type: "text/plain" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a"); a.href = url;
      a.download = `Worksheet_${subject}_${yearLevel}_${topic.slice(0, 20)}.txt`; a.click();
      URL.revokeObjectURL(url);
    } else {
      const endpoint = format === "pdf" ? "chat-to-pdf" : format;
      fetch(`/api/export/${endpoint}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: result, title: `Worksheet_${subject}_${yearLevel}_${topic.slice(0, 20)}` }),
      })
        .then(res => { if (!res.ok) throw new Error(); return res.blob(); })
        .then(blob => {
          const url = URL.createObjectURL(blob);
          const a = document.createElement("a"); a.href = url;
          a.download = `Worksheet_${subject}_${yearLevel}_${topic.slice(0, 20)}.${format}`; a.click();
          URL.revokeObjectURL(url);
        })
        .catch(() => {
          const blob = new Blob([result], { type: "text/plain" });
          const url = URL.createObjectURL(blob);
          const a = document.createElement("a"); a.href = url;
          a.download = `Worksheet_${subject}_${yearLevel}_${topic.slice(0, 20)}.txt`; a.click();
          URL.revokeObjectURL(url);
        });
    }
  }

  function handleFeedback(f: "good" | "bad") {
    setFeedback(f);
    logFeedback("worksheet", f, `${subject} ${yearLevel} ${topic}`);
  }

  const inputStyle: React.CSSProperties = {
    width: "100%", padding: "10px 14px",
    background: "var(--surface)", color: "var(--text)",
    border: "1px solid var(--border-subtle)",
    borderRadius: "var(--radius)", fontSize: 14, outline: "none",
  };

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg)" }}>
      <div style={{ padding: "20px 28px", borderBottom: "1px solid var(--border-subtle)", display: "flex", alignItems: "center", gap: 12 }}>
        <div style={{
          width: 36, height: 36, borderRadius: 10,
          background: "var(--warning-dim)", border: "1px solid rgba(245,158,11,0.2)",
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: 16,
        }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--warning)" strokeWidth="2">
            <rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18"/><path d="M9 21V9"/>
          </svg>
        </div>
        <div>
          <h1 style={{ fontSize: 18, fontWeight: 800, letterSpacing: "-0.01em", marginBottom: 2 }}>Worksheet Generator</h1>
          <p style={{ color: "var(--text-2)", fontSize: 12 }}>Create printable worksheets, quizzes, activities and exit tickets</p>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", minHeight: "calc(100vh - 74px)" }}>
        {/* Form */}
        <div style={{ padding: "24px 28px", borderRight: "1px solid var(--border-subtle)" }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 14 }}>
            <div>
              <label style={{ display: "block", fontSize: 11, fontWeight: 700, color: "var(--text-3)", marginBottom: 6, textTransform: "uppercase", letterSpacing: "0.05em" }}>Subject</label>
              <select value={subject} onChange={e => setSubject(e.target.value)} style={inputStyle}>
                {SUBJECTS.map(s => <option key={s}>{s}</option>)}
              </select>
            </div>
            <div>
              <label style={{ display: "block", fontSize: 11, fontWeight: 700, color: "var(--text-3)", marginBottom: 6, textTransform: "uppercase", letterSpacing: "0.05em" }}>Year Level</label>
              <select value={yearLevel} onChange={e => setYearLevel(e.target.value)} style={inputStyle}>
                {YEAR_LEVELS.map(y => <option key={y}>{y}</option>)}
              </select>
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 14 }}>
            <div>
              <label style={{ display: "block", fontSize: 11, fontWeight: 700, color: "var(--text-3)", marginBottom: 6, textTransform: "uppercase", letterSpacing: "0.05em" }}>Type</label>
              <select value={worksheetType} onChange={e => setWorksheetType(e.target.value)} style={inputStyle}>
                {WORKSHEET_TYPES.map(t => <option key={t}>{t}</option>)}
              </select>
            </div>
            <div>
              <label style={{ display: "block", fontSize: 11, fontWeight: 700, color: "var(--text-3)", marginBottom: 6, textTransform: "uppercase", letterSpacing: "0.05em" }}>Topic</label>
              <input value={topic} onChange={e => setTopic(e.target.value)} placeholder="e.g. Fractions..." style={inputStyle}
                onFocus={e => e.currentTarget.style.borderColor = "var(--primary)"}
                onBlur={e => e.currentTarget.style.borderColor = "var(--border-subtle)"}
              />
            </div>
          </div>

          <div style={{ marginBottom: 20 }}>
            <label style={{ display: "block", fontSize: 11, fontWeight: 700, color: "var(--text-3)", marginBottom: 6, textTransform: "uppercase", letterSpacing: "0.05em" }}>
              Additional Notes <span style={{ fontWeight: 400, textTransform: "none", color: "var(--text-3)" }}>— optional</span>
            </label>
            <textarea value={additionalNotes} onChange={e => setAdditionalNotes(e.target.value)} placeholder="Number of questions, difficulty level, specific skills to target..." rows={3} style={{ ...inputStyle, resize: "vertical" }}
              onFocus={e => e.currentTarget.style.borderColor = "var(--primary)"}
              onBlur={e => e.currentTarget.style.borderColor = "var(--border-subtle)"}
            />
          </div>

          {error && (
            <div style={{ padding: "10px 14px", background: "var(--danger-dim)", border: "1px solid rgba(248,113,113,0.2)", borderRadius: "var(--radius)", color: "var(--danger)", fontSize: 13, marginBottom: 14 }}>
              {error}
            </div>
          )}

          <button onClick={generate} disabled={loading} style={{
            width: "100%", padding: "12px",
            background: loading ? "var(--surface)" : "var(--warning)",
            color: loading ? "var(--text-3)" : "#0a0a0a",
            border: "none", borderRadius: "var(--radius)",
            fontWeight: 700, fontSize: 14,
            cursor: loading ? "not-allowed" : "pointer",
            display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
          }}>
            {loading ? (
              <>
                <div style={{ width: 14, height: 14, border: "2px solid rgba(0,0,0,0.2)", borderTopColor: "#0a0a0a", borderRadius: "50%", animation: "spin 0.7s linear infinite" }} />
                Generating...
              </>
            ) : (
              <>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18"/><path d="M9 21V9"/></svg>
                Generate Worksheet
              </>
            )}
          </button>
        </div>

        {/* Result */}
        <div style={{ padding: "24px 28px", display: "flex", flexDirection: "column" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
            <h2 style={{ fontSize: 15, fontWeight: 700 }}>Generated Worksheet</h2>
            {result && (
              <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                <button onClick={() => download("txt")} style={{ padding: "6px 12px", background: "var(--surface)", border: "1px solid var(--border-subtle)", borderRadius: "var(--radius-sm)", fontSize: 12, fontWeight: 600, color: "var(--text-2)", cursor: "pointer" }}>TXT</button>
                <button onClick={() => download("pdf")} style={{ padding: "6px 12px", background: "var(--surface)", border: "1px solid var(--border-subtle)", borderRadius: "var(--radius-sm)", fontSize: 12, fontWeight: 600, color: "var(--text-2)", cursor: "pointer" }}>PDF</button>
                <button onClick={() => download("docx")} style={{ padding: "6px 12px", background: "#4F46E5", color: "#fff", border: "none", borderRadius: "var(--radius-sm)", fontSize: 12, fontWeight: 700, cursor: "pointer" }}>DOCX</button>
                <button onClick={() => download("pptx")} style={{ padding: "6px 12px", background: "var(--surface)", border: "1px solid var(--border-subtle)", borderRadius: "var(--radius-sm)", fontSize: 12, fontWeight: 600, color: "var(--text-2)", cursor: "pointer" }}>📑 PPTX</button>
              </div>
            )}
          </div>

          <div style={{
            flex: 1, background: "var(--surface)",
            border: "1px solid var(--border-subtle)",
            borderRadius: "var(--radius-lg)",
            padding: "1.25rem",
            overflowY: "auto",
            fontSize: 13, lineHeight: 1.75,
            whiteSpace: "pre-wrap",
            color: result ? "var(--text)" : "var(--text-3)",
          }}>
            {result || "Your worksheet will appear here after generation. Designed for easy printing — column layout."}
          </div>
        </div>
      </div>
    </div>
  );
}
