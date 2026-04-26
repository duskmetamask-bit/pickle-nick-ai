"use client";
import { useState } from "react";

const SUBJECTS = ["Mathematics", "English", "Science", "HASS", "Technologies", "The Arts", "Health & Physical Education"];
const YEAR_LEVELS = ["Year 1", "Year 2", "Year 3", "Year 4", "Year 5", "Year 6"];

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

export default function RubricView() {
  const [subject, setSubject] = useState("English");
  const [yearLevel, setYearLevel] = useState("Year 4");
  const [taskType, setTaskType] = useState("Narrative Writing");
  const [criteria, setCriteria] = useState("Writing structure, Vocabulary choices, Grammar and punctuation, Organisation and cohesion");
  const [result, setResult] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [feedback, setFeedback] = useState<"good" | "bad" | null>(null);

  async function generate() {
    setError(""); setLoading(true); setResult(""); setFeedback(null);
    try {
      const res = await fetch("/api/rubric", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ subject, yearLevel, taskType, criteria }),
      });
      const data = await res.json();
      if (data.rubric) {
        setResult(data.rubric);
        logUsage("rubric", "generate", `${subject} ${yearLevel} ${taskType}`);
      } else if (data.error) setError(data.error);
    } catch { setError("Failed to generate rubric."); }
    finally { setLoading(false); }
  }

  function download() {
    if (!result) return;
    logUsage("rubric", "export", `${subject} ${yearLevel} ${taskType}`);
    const blob = new Blob([result], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href = url;
    a.download = `Rubric_${subject}_${yearLevel}_${taskType}.txt`; a.click();
    URL.revokeObjectURL(url);
  }

  function handleFeedback(f: "good" | "bad") {
    setFeedback(f);
    logFeedback("rubric", f, `${subject} ${yearLevel} ${taskType}`);
  }

  return (
    <div style={{ minHeight: "100vh" }}>
      <div style={{ padding: "20px 28px", borderBottom: "1px solid var(--border)" }}>
        <h1 style={{ fontSize: 20, fontWeight: 800, marginBottom: 4 }}>Rubric Generator</h1>
        <p style={{ color: "var(--text2)", fontSize: 13 }}>Create detailed assessment rubrics with 4 levels</p>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", minHeight: "calc(100vh - 73px)" }}>
        <div style={{ padding: "24px 28px", borderRight: "1px solid var(--border)" }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 14 }}>
            <div>
              <label style={{ display: "block", fontSize: 11, fontWeight: 700, color: "var(--text2)", marginBottom: 6, textTransform: "uppercase", letterSpacing: "0.05em" }}>Subject</label>
              <select value={subject} onChange={e => setSubject(e.target.value)} style={{ width: "100%", padding: "10px 12px", background: "var(--surface2)", color: "var(--text)", border: "1px solid var(--border)", borderRadius: 10, fontSize: 14, outline: "none" }}>
                {SUBJECTS.map(s => <option key={s}>{s}</option>)}
              </select>
            </div>
            <div>
              <label style={{ display: "block", fontSize: 11, fontWeight: 700, color: "var(--text2)", marginBottom: 6, textTransform: "uppercase", letterSpacing: "0.05em" }}>Year Level</label>
              <select value={yearLevel} onChange={e => setYearLevel(e.target.value)} style={{ width: "100%", padding: "10px 12px", background: "var(--surface2)", color: "var(--text)", border: "1px solid var(--border)", borderRadius: 10, fontSize: 14, outline: "none" }}>
                {YEAR_LEVELS.map(y => <option key={y}>{y}</option>)}
              </select>
            </div>
          </div>
          <div style={{ marginBottom: 14 }}>
            <label style={{ display: "block", fontSize: 11, fontWeight: 700, color: "var(--text2)", marginBottom: 6, textTransform: "uppercase", letterSpacing: "0.05em" }}>Task Type</label>
            <input value={taskType} onChange={e => setTaskType(e.target.value)} placeholder="e.g. Persuasive Essay, Science Report" style={{ width: "100%", padding: "10px 14px", background: "var(--surface2)", color: "var(--text)", border: "1px solid var(--border)", borderRadius: 10, fontSize: 14, outline: "none" }} onFocus={e => e.currentTarget.style.borderColor = "var(--primary)"} onBlur={e => e.currentTarget.style.borderColor = "var(--border)"} />
          </div>
          <div style={{ marginBottom: 14 }}>
            <label style={{ display: "block", fontSize: 11, fontWeight: 700, color: "var(--text2)", marginBottom: 6, textTransform: "uppercase", letterSpacing: "0.05em" }}>Criteria</label>
            <textarea value={criteria} onChange={e => setCriteria(e.target.value)} placeholder="Comma-separated criteria..." rows={3} style={{ width: "100%", padding: "10px 14px", background: "var(--surface2)", color: "var(--text)", border: "1px solid var(--border)", borderRadius: 10, fontSize: 14, outline: "none", resize: "vertical" }} onFocus={e => e.currentTarget.style.borderColor = "var(--primary)"} onBlur={e => e.currentTarget.style.borderColor = "var(--border)"} />
          </div>
          {error && <div style={{ padding: "10px", background: "rgba(248,113,113,0.1)", border: "1px solid rgba(248,113,113,0.3)", borderRadius: 10, color: "var(--danger)", fontSize: 13, marginBottom: 14 }}>{error}</div>}
          <button onClick={generate} disabled={loading} style={{ width: "100%", padding: "13px", background: loading ? "var(--surface2)" : "var(--primary)", color: loading ? "var(--text3)" : "#fff", border: "none", borderRadius: 12, fontWeight: 700, fontSize: 15, cursor: loading ? "not-allowed" : "pointer" }}>
            {loading ? "Generating..." : "Generate Rubric"}
          </button>
        </div>
        <div style={{ padding: "24px 28px", display: "flex", flexDirection: "column" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
            <h2 style={{ fontSize: 16, fontWeight: 700 }}>Generated Rubric</h2>
            {result && (
              <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                {feedback === null ? (
                  <>
                    <span style={{ fontSize: 12, color: "var(--text3)", marginRight: 4 }}>Was this helpful?</span>
                    <button onClick={() => handleFeedback("good")} title="Good" style={{ background: "rgba(34,197,94,0.1)", border: "1px solid rgba(34,197,94,0.3)", borderRadius: 8, padding: "6px 10px", cursor: "pointer", fontSize: 16 }}>👍</button>
                    <button onClick={() => handleFeedback("bad")} title="Needs improvement" style={{ background: "rgba(248,113,113,0.1)", border: "1px solid rgba(248,113,113,0.3)", borderRadius: 8, padding: "6px 10px", cursor: "pointer", fontSize: 16 }}>👎</button>
                  </>
                ) : (
                  <span style={{ fontSize: 12, color: feedback === "good" ? "var(--success)" : "var(--danger)", fontWeight: 600 }}>
                    {feedback === "good" ? "✓ Thanks!" : "✓ We'll improve this"}
                  </span>
                )}
                <button onClick={download} style={{ padding: "7px 14px", background: "var(--surface2)", border: "1px solid var(--border)", borderRadius: 8, fontSize: 13, color: "var(--text2)", cursor: "pointer", marginLeft: 8 }}>Download</button>
              </div>
            )}
          </div>
          <div style={{ background: "var(--surface2)", border: "1px solid var(--border)", borderRadius: 14, padding: "1.25rem", flex: 1, fontSize: 13, lineHeight: 1.7, whiteSpace: "pre-wrap", color: result ? "var(--text)" : "var(--text3)", overflowY: "auto" }}>
            {result || "Your rubric will appear here after generation."}
          </div>
        </div>
      </div>
    </div>
  );
}