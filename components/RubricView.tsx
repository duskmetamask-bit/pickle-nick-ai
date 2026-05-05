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

function saveRubricToProfile(content: string, label: string) {
  const savedDocs = JSON.parse(localStorage.getItem("pn-saved-docs") || "[]");
  savedDocs.unshift({ id: Date.now().toString(36), type: "rubric", label, content, savedAt: Date.now() });
  localStorage.setItem("pn-saved-docs", JSON.stringify(savedDocs.slice(0, 50)));
  const btns = document.querySelectorAll(`[data-save-btn]`);
  btns.forEach(b => {
    const el = b as HTMLElement;
    el.textContent = "✓ Saved";
    el.style.color = "var(--success)";
    setTimeout(() => { el.textContent = "Save"; el.style.color = ""; }, 1500);
  });
}

export default function RubricView() {
  const SUBJECTS = ["Mathematics", "English", "Science", "HASS", "Technologies", "The Arts", "Health & Physical Education"];
  const YEAR_LEVELS = ["Year 1", "Year 2", "Year 3", "Year 4", "Year 5", "Year 6"];

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
      if (data.rubric) { setResult(data.rubric); logUsage("rubric", "generate", `${subject} ${yearLevel} ${taskType}`); }
      else if (data.error) setError(data.error);
    } catch { setError("Failed to generate rubric."); }
    finally { setLoading(false); }
  }

  function download(format: "txt" | "pdf" | "pptx" | "docx") {
    if (!result) return;
    logUsage("rubric", "export", `${format} ${subject} ${yearLevel} ${taskType}`);
    if (format === "txt") {
      const blob = new Blob([result], { type: "text/plain" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a"); a.href = url;
      a.download = `Rubric_${subject}_${yearLevel}_${taskType}.txt`; a.click();
      URL.revokeObjectURL(url);
    } else {
      const endpoint = format === "pdf" ? "chat-to-pdf" : format;
      fetch(`/api/export/${endpoint}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: result, title: `Rubric_${subject}_${yearLevel}_${taskType}` }),
      })
        .then(res => { if (!res.ok) throw new Error(`${format.toUpperCase()} export failed`); return res.blob(); })
        .then(blob => {
          const url = URL.createObjectURL(blob);
          const a = document.createElement("a"); a.href = url;
          a.download = `Rubric_${subject}_${yearLevel}_${taskType}.${format === "docx" ? "docx" : format === "pptx" ? "pptx" : "pdf"}`; a.click();
          URL.revokeObjectURL(url);
        })
        .catch((err) => {
          alert(err instanceof Error ? err.message : "Export failed — try TXT instead");
          const blob = new Blob([result], { type: "text/plain" });
          const url = URL.createObjectURL(blob);
          const a = document.createElement("a"); a.href = url;
          a.download = `Rubric_${subject}_${yearLevel}_${taskType}.txt`; a.click();
          URL.revokeObjectURL(url);
        });
    }
  }

  function handleFeedback(f: "good" | "bad") {
    setFeedback(f);
    logFeedback("rubric", f, `${subject} ${yearLevel} ${taskType}`);
  }

  const inputStyle: React.CSSProperties = {
    width: "100%", padding: "10px 14px",
    background: "var(--surface)", color: "var(--text)",
    border: "1px solid var(--border-subtle)",
    borderRadius: "var(--radius)", fontSize: 14, outline: "none",
    transition: "border-color 0.15s",
  };

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg)" }}>
      <div style={{ padding: "20px 28px", borderBottom: "1px solid var(--border-subtle)", display: "flex", alignItems: "center", gap: 12 }}>
        <div style={{
          width: 36, height: 36, borderRadius: 10,
          background: "var(--primary-dim)", border: "1px solid rgba(99,102,241,0.2)",
          display: "flex", alignItems: "center", justifyContent: "center",
          color: "var(--primary-hover)", fontSize: 16,
        }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/>
            <line x1="8" y1="18" x2="21" y2="18"/>
            <line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/>
            <line x1="3" y1="18" x2="3.01" y2="18"/>
          </svg>
        </div>
        <div>
          <h1 style={{ fontSize: 18, fontWeight: 800, letterSpacing: "-0.01em", marginBottom: 2 }}>Rubric Generator</h1>
          <p style={{ color: "var(--text-2)", fontSize: 12 }}>Create detailed assessment rubrics with 4 levels</p>
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

          <div style={{ marginBottom: 14 }}>
            <label style={{ display: "block", fontSize: 11, fontWeight: 700, color: "var(--text-3)", marginBottom: 6, textTransform: "uppercase", letterSpacing: "0.05em" }}>Task Type</label>
            <input value={taskType} onChange={e => setTaskType(e.target.value)} placeholder="e.g. Persuasive Essay, Science Report" style={inputStyle}
              onFocus={e => e.currentTarget.style.borderColor = "var(--primary)"}
              onBlur={e => e.currentTarget.style.borderColor = "var(--border-subtle)"}
            />
          </div>

          <div style={{ marginBottom: 20 }}>
            <label style={{ display: "block", fontSize: 11, fontWeight: 700, color: "var(--text-3)", marginBottom: 6, textTransform: "uppercase", letterSpacing: "0.05em" }}>Criteria</label>
            <textarea value={criteria} onChange={e => setCriteria(e.target.value)} placeholder="Comma-separated criteria..." rows={3} style={{ ...inputStyle, resize: "vertical" }}
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
            background: loading ? "var(--surface)" : "var(--primary)",
            color: loading ? "var(--text-3)" : "#fff",
            border: "none", borderRadius: "var(--radius)",
            fontWeight: 700, fontSize: 14,
            cursor: loading ? "not-allowed" : "pointer",
            display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
            transition: "all 0.15s",
          }}>
            {loading ? (
              <>
                <div style={{ width: 14, height: 14, border: "2px solid rgba(255,255,255,0.3)", borderTopColor: "#fff", borderRadius: "50%", animation: "spin 0.7s linear infinite" }} />
                Generating...
              </>
            ) : (
              <>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="9 11 12 14 22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/></svg>
                Generate Rubric
              </>
            )}
          </button>
        </div>

        {/* Result */}
        <div style={{ padding: "24px 28px", display: "flex", flexDirection: "column" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
            <h2 style={{ fontSize: 15, fontWeight: 700 }}>Generated Rubric</h2>
            {result && (
              <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                {feedback === null ? (
                  <>
                    <span style={{ fontSize: 12, color: "var(--text-3)" }}>Helpful?</span>
                    <button onClick={() => handleFeedback("good")} style={{ background: "var(--success-dim)", border: "1px solid rgba(52,211,153,0.2)", borderRadius: 8, padding: "5px 10px", cursor: "pointer", fontSize: 16 }}>👍</button>
                    <button onClick={() => handleFeedback("bad")} style={{ background: "var(--danger-dim)", border: "1px solid rgba(248,113,113,0.2)", borderRadius: 8, padding: "5px 10px", cursor: "pointer", fontSize: 16 }}>👎</button>
                  </>
                ) : (
                  <span style={{ fontSize: 12, color: feedback === "good" ? "var(--success)" : "var(--text-3)", fontWeight: 600 }}>
                    {feedback === "good" ? "✓ Saved" : "✓ Noted"}
                  </span>
                )}
                <button
                  onClick={() => saveRubricToProfile(result, `Rubric_${subject}_${yearLevel}_${taskType}`)}
                  data-save-btn
                  style={{ padding: "6px 12px", background: "var(--surface)", border: "1px solid var(--border-subtle)", borderRadius: "var(--radius-sm)", fontSize: 12, fontWeight: 600, color: "var(--text-2)", cursor: "pointer", display: "flex", alignItems: "center", gap: 4 }}
                >
                  Save
                </button>
                <button onClick={() => download("txt")} style={{ padding: "6px 12px", background: "var(--surface)", border: "1px solid var(--border-subtle)", borderRadius: "var(--radius-sm)", fontSize: 12, fontWeight: 600, color: "var(--text-2)", cursor: "pointer", display: "flex", alignItems: "center", gap: 4 }}>
                  TXT
                </button>
                <button onClick={() => download("pdf")} style={{ padding: "6px 12px", background: "var(--surface)", border: "1px solid var(--border-subtle)", borderRadius: "var(--radius-sm)", fontSize: 12, fontWeight: 600, color: "var(--text-2)", cursor: "pointer", display: "flex", alignItems: "center", gap: 4 }}>
                  PDF
                </button>
                <button onClick={() => download("pptx")} style={{ padding: "6px 12px", background: "var(--surface)", border: "1px solid var(--border-subtle)", borderRadius: "var(--radius-sm)", fontSize: 12, fontWeight: 600, color: "var(--text-2)", cursor: "pointer", display: "flex", alignItems: "center", gap: 4 }}>
                  📑 PPTX
                </button>
                <button onClick={() => download("docx")} style={{ padding: "6px 12px", background: "var(--surface)", border: "1px solid var(--border-subtle)", borderRadius: "var(--radius-sm)", fontSize: 12, fontWeight: 600, color: "var(--text-2)", cursor: "pointer", display: "flex", alignItems: "center", gap: 4 }}>
                  DOCX
                </button>
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
            {result || "Your rubric will appear here after generation."}
          </div>
        </div>
      </div>
    </div>
  );
}