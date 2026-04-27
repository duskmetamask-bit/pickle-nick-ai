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

export default function PlannerView() {
  const SUBJECTS = ["Mathematics", "English", "Science", "HASS", "Technologies", "The Arts", "Health & Physical Education", "Languages"];
  const YEAR_LEVELS = ["Pre-Primary", "Year 1", "Year 2", "Year 3", "Year 4", "Year 5", "Year 6"];
  const LESSON_TYPES = ["Explicit Teaching", "Inquiry-Based", "Guided Practice", "Independent Task", "Flipped Classroom"];
  const DURATIONS = [30, 45, 50, 60, 70, 90];

  const [subject, setSubject] = useState("Mathematics");
  const [yearLevel, setYearLevel] = useState("Year 4");
  const [topic, setTopic] = useState("");
  const [duration, setDuration] = useState(60);
  const [lessonType, setLessonType] = useState("Explicit Teaching");
  const [objectives, setObjectives] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState("");
  const [error, setError] = useState("");
  const [feedback, setFeedback] = useState<"good" | "bad" | null>(null);

  async function generate() {
    if (!topic.trim()) { setError("Please enter a topic"); return; }
    setError(""); setLoading(true); setResult(""); setFeedback(null);
    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ subject, yearLevel, topic, duration, lessonType, objectives }),
      });
      const data = await res.json();
      if (data.plan) { setResult(data.plan); logUsage("lesson-plan", "generate", `${subject} ${yearLevel} ${topic}`); }
      else if (data.error) setError(data.error);
    } catch { setError("Generation failed. Please try again."); }
    finally { setLoading(false); }
  }

  function download() {
    if (!result) return;
    logUsage("lesson-plan", "export", `${subject} ${yearLevel} ${topic}`);
    const blob = new Blob([result], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href = url;
    a.download = `LessonPlan_${subject}_${yearLevel}_${topic.slice(0, 20)}.txt`; a.click();
    URL.revokeObjectURL(url);
  }

  function handleFeedback(f: "good" | "bad") {
    setFeedback(f);
    logFeedback("lesson-plan", f, `${subject} ${yearLevel} ${topic}`);
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
            <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
            <line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/>
            <line x1="3" y1="10" x2="21" y2="10"/>
          </svg>
        </div>
        <div>
          <h1 style={{ fontSize: 18, fontWeight: 800, letterSpacing: "-0.01em", marginBottom: 2 }}>Lesson Planner</h1>
          <p style={{ color: "var(--text-2)", fontSize: 12 }}>Generate AC9-aligned lesson plans in seconds</p>
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
            <label style={{ display: "block", fontSize: 11, fontWeight: 700, color: "var(--text-3)", marginBottom: 6, textTransform: "uppercase", letterSpacing: "0.05em" }}>Topic / Focus</label>
            <input value={topic} onChange={e => setTopic(e.target.value)} placeholder="e.g. Multiplication, Narrative Writing..." style={inputStyle}
              onFocus={e => e.currentTarget.style.borderColor = "var(--primary)"}
              onBlur={e => e.currentTarget.style.borderColor = "var(--border-subtle)"}
            />
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 14 }}>
            <div>
              <label style={{ display: "block", fontSize: 11, fontWeight: 700, color: "var(--text-3)", marginBottom: 6, textTransform: "uppercase", letterSpacing: "0.05em" }}>Duration (min)</label>
              <select value={duration} onChange={e => setDuration(Number(e.target.value))} style={inputStyle}>
                {DURATIONS.map(d => <option key={d}>{d}</option>)}
              </select>
            </div>
            <div>
              <label style={{ display: "block", fontSize: 11, fontWeight: 700, color: "var(--text-3)", marginBottom: 6, textTransform: "uppercase", letterSpacing: "0.05em" }}>Lesson Type</label>
              <select value={lessonType} onChange={e => setLessonType(e.target.value)} style={inputStyle}>
                {LESSON_TYPES.map(l => <option key={l}>{l}</option>)}
              </select>
            </div>
          </div>

          <div style={{ marginBottom: 20 }}>
            <label style={{ display: "block", fontSize: 11, fontWeight: 700, color: "var(--text-3)", marginBottom: 6, textTransform: "uppercase", letterSpacing: "0.05em" }}>Learning Objectives <span style={{ fontWeight: 400, textTransform: "none", color: "var(--text-3)" }}>— optional</span></label>
            <textarea value={objectives} onChange={e => setObjectives(e.target.value)} placeholder="Students will be able to..." rows={2} style={{ ...inputStyle, resize: "vertical" }}
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
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5"/><path d="M2 12l10 5 10-5"/></svg>
                Generate Lesson Plan
              </>
            )}
          </button>
        </div>

        {/* Result */}
        <div style={{ padding: "24px 28px", display: "flex", flexDirection: "column" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
            <h2 style={{ fontSize: 15, fontWeight: 700 }}>Generated Lesson Plan</h2>
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
                <button onClick={download} style={{ padding: "6px 14px", background: "var(--surface)", border: "1px solid var(--border-subtle)", borderRadius: "var(--radius-sm)", fontSize: 13, fontWeight: 600, color: "var(--text-2)", cursor: "pointer", display: "flex", alignItems: "center", gap: 5 }}>
                  ↓ Download
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
            {result || "Your lesson plan will appear here after generation."}
          </div>
        </div>
      </div>
    </div>
  );
}