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

function saveWritingToProfile(dimensions: Dimension[], overall: string, yearLevel: string, taskType: string) {
  const content = [
    `WRITING FEEDBACK — ${yearLevel} ${taskType}`,
    `Generated: ${new Date().toLocaleDateString("en-AU")}`,
    "",
    ...dimensions.map(d => `${d.name}: ${d.grade} (${d.score}/10) — ${d.feedback}`),
    "",
    `OVERALL: ${overall}`,
  ].join("\n");
  const savedDocs = JSON.parse(localStorage.getItem("pn-saved-docs") || "[]");
  savedDocs.unshift({ id: Date.now().toString(36), type: "writing", label: `Writing Feedback — ${yearLevel} ${taskType}`, content, savedAt: Date.now() });
  localStorage.setItem("pn-saved-docs", JSON.stringify(savedDocs.slice(0, 50)));
  const btns = document.querySelectorAll(`[data-save-btn]`);
  btns.forEach(b => {
    const el = b as HTMLElement;
    el.textContent = "✓ Saved";
    el.style.color = "var(--success)";
    setTimeout(() => { el.textContent = "Save"; el.style.color = ""; }, 1500);
  });
}

interface Dimension {
  name: string;
  score: string;
  grade: string;
  feedback: string;
}

const DIMENSIONS: string[] = [
  "Ideas & Content",
  "Text Structure",
  "Voice & Tone",
  "Word Choice",
  "Sentence Fluency",
  "Grammar & Punctuation",
  "Spelling",
  "Paragraphing",
  "Audience Awareness",
  "Overall Impact",
];

const TASK_TYPES = ["Narrative", "Persuasive", "Informative", "Description", "Recount", "Explanation", "Discussion"];
const YEAR_LEVELS = ["Year 1", "Year 2", "Year 3", "Year 4", "Year 5", "Year 6"];

function scoreToGrade(score: string): string {
  const n = parseFloat(score);
  if (isNaN(n)) return "—";
  if (n >= 9) return "A+";
  if (n >= 8) return "A";
  if (n >= 7) return "B+";
  if (n >= 6) return "B";
  if (n >= 5) return "C+";
  if (n >= 4) return "C";
  if (n >= 3) return "D";
  return "E";
}

function scoreColor(score: string): string {
  const n = parseFloat(score);
  if (isNaN(n)) return "var(--text-2)";
  if (n >= 8) return "var(--success)";
  if (n >= 6) return "#22D3EE";
  if (n >= 4) return "#F59E0B";
  return "var(--danger)";
}

export default function WritingFeedbackView() {
  const [studentWriting, setStudentWriting] = useState("");
  const [yearLevel, setYearLevel] = useState("Year 4");
  const [taskType, setTaskType] = useState("Narrative");
  const [loading, setLoading] = useState(false);
  const [dimensions, setDimensions] = useState<Dimension[]>([]);
  const [overallFeedback, setOverallFeedback] = useState("");
  const [error, setError] = useState("");
  const [feedback, setFeedback] = useState<"good" | "bad" | null>(null);

  async function markWriting() {
    if (!studentWriting.trim()) { setError("Please paste student writing first"); return; }
    setError(""); setLoading(true); setDimensions([]); setOverallFeedback(""); setFeedback(null);

    // Check free tier
    const allowed = await new Promise<boolean>(resolve => {
      window.dispatchEvent(new CustomEvent("pn-free-tier", {
        detail: { action: "generate", result: resolve }
      }));
    });
    if (!allowed) {
      setLoading(false);
      return;
    }

    try {
      const res = await fetch("/api/writing-feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: studentWriting, yearLevel, taskType }),
      });
      const data = await res.json();
      if (data.dimensions) {
        setDimensions(data.dimensions);
        setOverallFeedback(data.overallFeedback || "");
        logUsage("writing-feedback", "mark", `${yearLevel} ${taskType}`);
      } else if (data.error) {
        setError(data.error);
      }
    } catch { setError("Analysis failed. Please try again."); }
    finally { setLoading(false); }
  }

  function downloadTxt() {
    if (!dimensions.length && !overallFeedback) return;
    const lines = [
      `WRITING FEEDBACK REPORT`,
      `========================`,
      `Year Level: ${yearLevel}`,
      `Task Type: ${taskType}`,
      ``,
      ...dimensions.map(d => `${d.name}: ${d.grade} (${d.score}/10)\n  ${d.feedback}`),
      ``,
      `OVERALL: ${overallFeedback}`,
    ].join("\n");
    const blob = new Blob([lines], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href = url;
    a.download = `WritingFeedback_${yearLevel}_${taskType}.txt`; a.click();
    URL.revokeObjectURL(url);
  }

  function downloadPdf() {
    if (!dimensions.length) return;
    fetch("/api/export/pdf", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        content: [
          "# Writing Feedback Report",
          `**Year Level:** ${yearLevel}  |  **Task Type:** ${taskType}`,
          "",
          ...dimensions.map(d => `## ${d.name} — ${d.grade} (${d.score}/10)\n${d.feedback}`),
          "",
          `## Overall Feedback\n${overallFeedback}`,
        ].join("\n"),
        title: `WritingFeedback_${yearLevel}_${taskType}`,
      }),
    })
      .then(res => res.blob())
      .then(blob => {
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a"); a.href = url;
        a.download = `WritingFeedback_${yearLevel}_${taskType}.pdf`; a.click();
        URL.revokeObjectURL(url);
      })
      .catch(() => {});
  }

  function handleFeedback(f: "good" | "bad") {
    setFeedback(f);
    logFeedback("writing-feedback", f, `${yearLevel} ${taskType}`);
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
          background: "var(--accent-dim)", border: "1px solid rgba(34,211,238,0.2)",
          display: "flex", alignItems: "center", justifyContent: "center",
          color: "var(--accent)", fontSize: 16,
        }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"/>
          </svg>
        </div>
        <div>
          <h1 style={{ fontSize: 18, fontWeight: 800, letterSpacing: "-0.01em", marginBottom: 2 }}>Writing Feedback</h1>
          <p style={{ color: "var(--text-2)", fontSize: 12 }}>Get detailed 10-dimension rubric analysis of student writing</p>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", minHeight: "calc(100vh - 74px)" }}>
        {/* Input panel */}
        <div style={{ padding: "24px 28px", borderRight: "1px solid var(--border-subtle)" }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 14 }}>
            <div>
              <label style={{ display: "block", fontSize: 11, fontWeight: 700, color: "var(--text-3)", marginBottom: 6, textTransform: "uppercase", letterSpacing: "0.05em" }}>Year Level</label>
              <select value={yearLevel} onChange={e => setYearLevel(e.target.value)} style={inputStyle}>
                {YEAR_LEVELS.map(y => <option key={y}>{y}</option>)}
              </select>
            </div>
            <div>
              <label style={{ display: "block", fontSize: 11, fontWeight: 700, color: "var(--text-3)", marginBottom: 6, textTransform: "uppercase", letterSpacing: "0.05em" }}>Task Type</label>
              <select value={taskType} onChange={e => setTaskType(e.target.value)} style={inputStyle}>
                {TASK_TYPES.map(t => <option key={t}>{t}</option>)}
              </select>
            </div>
          </div>

          <div style={{ marginBottom: 16 }}>
            <label style={{ display: "block", fontSize: 11, fontWeight: 700, color: "var(--text-3)", marginBottom: 6, textTransform: "uppercase", letterSpacing: "0.05em" }}>
              Student Writing
            </label>
            <textarea
              value={studentWriting}
              onChange={e => setStudentWriting(e.target.value)}
              placeholder="Paste student writing here..."
              rows={18}
              style={{ ...inputStyle, resize: "vertical", fontFamily: "inherit", lineHeight: 1.7 }}
              onFocus={e => e.currentTarget.style.borderColor = "var(--primary)"}
              onBlur={e => e.currentTarget.style.borderColor = "var(--border-subtle)"}
            />
          </div>

          {error && (
            <div style={{ padding: "10px 14px", background: "var(--danger-dim)", border: "1px solid rgba(248,113,113,0.2)", borderRadius: "var(--radius)", color: "var(--danger)", fontSize: 13, marginBottom: 14 }}>
              {error}
            </div>
          )}

          <button onClick={markWriting} disabled={loading} style={{
            width: "100%", padding: "12px",
            background: loading ? "var(--surface)" : "var(--accent)",
            color: loading ? "var(--text-3)" : "#0a0a0a",
            border: "none", borderRadius: "var(--radius)",
            fontWeight: 700, fontSize: 14,
            cursor: loading ? "not-allowed" : "pointer",
            display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
          }}>
            {loading ? (
              <>
                <div style={{ width: 14, height: 14, border: "2px solid rgba(0,0,0,0.2)", borderTopColor: "#0a0a0a", borderRadius: "50%", animation: "spin 0.7s linear infinite" }} />
                Analysing...
              </>
            ) : (
              <>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"/></svg>
                Mark My Writing
              </>
            )}
          </button>
        </div>

        {/* Result panel */}
        <div style={{ padding: "24px 28px", display: "flex", flexDirection: "column" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
            <h2 style={{ fontSize: 15, fontWeight: 700 }}>10-Dimension Analysis</h2>
            {dimensions.length > 0 && (
              <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                <button
                  onClick={() => saveWritingToProfile(dimensions, overallFeedback, yearLevel, taskType)}
                  data-save-btn
                  style={{ padding: "6px 12px", background: "var(--surface)", border: "1px solid var(--border-subtle)", borderRadius: "var(--radius-sm)", fontSize: 12, fontWeight: 600, color: "var(--text-2)", cursor: "pointer" }}
                >Save</button>
                <button onClick={downloadTxt} style={{ padding: "6px 12px", background: "var(--surface)", border: "1px solid var(--border-subtle)", borderRadius: "var(--radius-sm)", fontSize: 12, fontWeight: 600, color: "var(--text-2)", cursor: "pointer" }}>TXT</button>
                <button onClick={downloadPdf} style={{ padding: "6px 12px", background: "var(--surface)", border: "1px solid var(--border-subtle)", borderRadius: "var(--radius-sm)", fontSize: 12, fontWeight: 600, color: "var(--text-2)", cursor: "pointer" }}>PDF</button>
              </div>
            )}
          </div>

          <div style={{ flex: 1, overflowY: "auto" }}>
            {dimensions.length === 0 && !loading && (
              <div style={{
                background: "var(--surface)", border: "1px solid var(--border-subtle)",
                borderRadius: "var(--radius-lg)", padding: "2rem",
                textAlign: "center", color: "var(--text-3)", fontSize: 13,
              }}>
                Paste student writing and click "Mark My Writing" to get a 10-dimension rubric analysis with specific, actionable feedback.
              </div>
            )}

            {dimensions.length > 0 && (
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {dimensions.map((dim, i) => (
                  <div key={i} style={{
                    background: "var(--surface)",
                    border: "1px solid var(--border-subtle)",
                    borderRadius: 12,
                    padding: "12px 14px",
                  }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                      <span style={{ fontWeight: 700, fontSize: 13, color: "var(--text)" }}>{dim.name}</span>
                      <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                        <span style={{ fontSize: 11, color: "var(--text-3)" }}>{dim.score}/10</span>
                        <span style={{
                          fontWeight: 900, fontSize: 13,
                          color: scoreColor(dim.score),
                          background: `${scoreColor(dim.score)}18`,
                          padding: "2px 8px", borderRadius: 8,
                        }}>
                          {dim.grade}
                        </span>
                      </div>
                    </div>
                    <p style={{ fontSize: 12, color: "var(--text-2)", lineHeight: 1.6, margin: 0 }}>{dim.feedback}</p>
                  </div>
                ))}

                {overallFeedback && (
                  <div style={{
                    background: "rgba(99,102,241,0.06)",
                    border: "1px solid rgba(99,102,241,0.15)",
                    borderRadius: 12,
                    padding: "14px",
                    marginTop: 4,
                  }}>
                    <div style={{ fontWeight: 800, fontSize: 13, marginBottom: 6, color: "var(--primary)" }}>Overall Feedback</div>
                    <p style={{ fontSize: 12, color: "var(--text-2)", lineHeight: 1.7, margin: 0 }}>{overallFeedback}</p>
                  </div>
                )}

                {feedback === null ? (
                  <div style={{ display: "flex", gap: 8, justifyContent: "center", marginTop: 8 }}>
                    <span style={{ fontSize: 12, color: "var(--text-3)", alignSelf: "center" }}>Was this helpful?</span>
                    <button onClick={() => handleFeedback("good")} style={{ background: "var(--success-dim)", border: "1px solid rgba(52,211,153,0.2)", borderRadius: 8, padding: "5px 10px", cursor: "pointer", fontSize: 16 }}>👍</button>
                    <button onClick={() => handleFeedback("bad")} style={{ background: "var(--danger-dim)", border: "1px solid rgba(248,113,113,0.2)", borderRadius: 8, padding: "5px 10px", cursor: "pointer", fontSize: 16 }}>👎</button>
                  </div>
                ) : (
                  <div style={{ textAlign: "center", fontSize: 12, color: "var(--success)", fontWeight: 600, marginTop: 8 }}>
                    ✓ {feedback === "good" ? "Thanks for the feedback!" : "Noted — we'll keep improving."}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
