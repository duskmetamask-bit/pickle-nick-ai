"use client";
import { useState } from "react";

const YEAR_LEVELS = ["Pre-Primary", "Year 1", "Year 2", "Year 3", "Year 4", "Year 5", "Year 6"];
const SUBJECTS = ["Mathematics", "English", "Science", "HASS", "Technologies", "The Arts", "Health & Physical Education", "Languages"];
const TERMS = ["Term 1", "Term 2", "Term 3", "Term 4"];
const PHASES = [
  { id: "cold", label: "Cold Task", description: "Pre-assessment to gauge prior knowledge", color: "#6366f1" },
  { id: "plan", label: "Plan & Sequence", description: "Design unit based on cold task data", color: "#22d3ee" },
  { id: "teach", label: "Teach", description: "Deliver instruction with monitoring", color: "#16a34a" },
  { id: "hot", label: "Hot Task", description: "Post-assessment to measure growth", color: "#ea580c" },
  { id: "mark", label: "Mark & Moderate", description: "Grade and cross-moderate with colleagues", color: "#db2777" },
  { id: "feedback", label: "Feedback", description: "Give feedback and set next steps", color: "#9333ea" },
  { id: "report", label: "Report", description: "Write report comments and assign grades", color: "#0891b2" },
];

function logWorkflow(type: string, phase: string, action: string) {
  const key = `pn-workflow`;
  const existing = JSON.parse(localStorage.getItem(key) || "[]");
  existing.push({ type, phase, action, ts: Date.now() });
  localStorage.setItem(key, JSON.stringify(existing.slice(-100)));
}

// ─── TERM PLANNING ───────────────────────────────────────────────────────────

function TermPlanning() {
  const [subject, setSubject] = useState("Mathematics");
  const [yearLevel, setYearLevel] = useState("Year 4");
  const [term, setTerm] = useState("Term 1");
  const [units, setUnits] = useState<{ topic: string; weeks: number; assessment: string }[]>([]);
  const [result, setResult] = useState("");
  const [loading, setLoading] = useState(false);

  function addUnit() {
    setUnits([...units, { topic: "", weeks: 4, assessment: "" }]);
  }

  function updateUnit(i: number, field: string, value: string | number) {
    const updated = [...units];
    updated[i] = { ...updated[i], [field]: value };
    setUnits(updated);
  }

  async function generate() {
    if (units.length === 0) { alert("Add at least one unit"); return; }
    setLoading(true);
    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [{
            role: "user",
            content: `I need a ${term} term plan for Year ${yearLevel} ${subject}.\n\nMy units this term:\n${units.map((u, i) => `${i + 1}. ${u.topic} (${u.weeks} weeks) — Assessment: ${u.assessment}`).join("\n")}\n\nPlease give me:\n1. A ${term} overview table (Week | Unit | Focus | Key Dates)\n2. Assessment calendar for the term\n3. Report writing schedule (when to write comments for each unit)\n4. Any buffer weeks flagged\n\nFormat as a clear markdown table I can use in planning.`,
          }],
          sessionId: "term-planning",
          profile: { name: "Teacher", yearLevels: [yearLevel], subjects: [subject] },
          stream: false,
        }),
      });
      const data = await res.json();
      if (data.reply) { setResult(data.reply); logWorkflow("term-planning", "generate", `${subject} ${yearLevel} ${term}`); }
    } catch { alert("Generation failed"); }
    finally { setLoading(false); }
  }

  return (
    <div style={{ padding: "24px 28px" }}>
      <h2 style={{ fontSize: 18, fontWeight: 800, marginBottom: 4 }}>Term Planning Workflow</h2>
      <p style={{ color: "var(--text2)", fontSize: 13, marginBottom: 20 }}>Plan your entire term — units, assessments, report timeline. Start with what you know, fill in the rest.</p>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12, marginBottom: 20 }}>
        <div>
          <label style={{ display: "block", fontSize: 11, fontWeight: 700, color: "var(--text2)", marginBottom: 6, textTransform: "uppercase" }}>Subject</label>
          <select value={subject} onChange={e => setSubject(e.target.value)} style={{ width: "100%", padding: "10px 12px", background: "var(--surface2)", color: "var(--text)", border: "1px solid var(--border)", borderRadius: 10, fontSize: 14 }}>
            {SUBJECTS.map(s => <option key={s}>{s}</option>)}
          </select>
        </div>
        <div>
          <label style={{ display: "block", fontSize: 11, fontWeight: 700, color: "var(--text2)", marginBottom: 6, textTransform: "uppercase" }}>Year Level</label>
          <select value={yearLevel} onChange={e => setYearLevel(e.target.value)} style={{ width: "100%", padding: "10px 12px", background: "var(--surface2)", color: "var(--text)", border: "1px solid var(--border)", borderRadius: 10, fontSize: 14 }}>
            {YEAR_LEVELS.map(y => <option key={y}>{y}</option>)}
          </select>
        </div>
        <div>
          <label style={{ display: "block", fontSize: 11, fontWeight: 700, color: "var(--text2)", marginBottom: 6, textTransform: "uppercase" }}>Term</label>
          <select value={term} onChange={e => setTerm(e.target.value)} style={{ width: "100%", padding: "10px 12px", background: "var(--surface2)", color: "var(--text)", border: "1px solid var(--border)", borderRadius: 10, fontSize: 14 }}>
            {TERMS.map(t => <option key={t}>{t}</option>)}
          </select>
        </div>
      </div>

      <div style={{ marginBottom: 16 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
          <h3 style={{ fontSize: 14, fontWeight: 700 }}>Units This Term ({units.length})</h3>
          <button onClick={addUnit} style={{ padding: "7px 14px", background: "var(--surface2)", border: "1px solid var(--border)", borderRadius: 8, fontSize: 13, cursor: "pointer" }}>+ Add Unit</button>
        </div>
        {units.map((u, i) => (
          <div key={i} style={{ display: "grid", gridTemplateColumns: "2fr 1fr 2fr auto", gap: 10, marginBottom: 8, padding: "12px", background: "var(--surface2)", border: "1px solid var(--border)", borderRadius: 10 }}>
            <input value={u.topic} onChange={e => updateUnit(i, "topic", e.target.value)} placeholder="Unit topic (e.g. Fractions)" style={{ padding: "8px 10px", background: "var(--bg)", color: "var(--text)", border: "1px solid var(--border)", borderRadius: 8, fontSize: 13 }} />
            <select value={u.weeks} onChange={e => updateUnit(i, "weeks", Number(e.target.value))} style={{ padding: "8px 10px", background: "var(--bg)", color: "var(--text)", border: "1px solid var(--border)", borderRadius: 8, fontSize: 13 }}>
              {[2, 3, 4, 5, 6, 7, 8].map(w => <option key={w}>{w} weeks</option>)}
            </select>
            <input value={u.assessment} onChange={e => updateUnit(i, "assessment", e.target.value)} placeholder="Assessment type (e.g. Written test)" style={{ padding: "8px 10px", background: "var(--bg)", color: "var(--text)", border: "1px solid var(--border)", borderRadius: 8, fontSize: 13 }} />
            <button onClick={() => setUnits(units.filter((_, j) => j !== i))} style={{ padding: "8px", background: "rgba(248,113,113,0.1)", border: "1px solid rgba(248,113,113,0.3)", borderRadius: 8, cursor: "pointer", fontSize: 14, color: "var(--danger)" }}>✕</button>
          </div>
        ))}
        {units.length === 0 && <p style={{ color: "var(--text3)", fontSize: 13 }}>No units added yet. Click "+ Add Unit" to start planning.</p>}
      </div>

      <button onClick={generate} disabled={loading || units.length === 0} style={{ padding: "12px 24px", background: loading ? "var(--surface2)" : "var(--primary)", color: loading ? "var(--text3)" : "#fff", border: "none", borderRadius: 12, fontWeight: 700, fontSize: 14, cursor: loading ? "not-allowed" : "pointer" }}>
        {loading ? "Generating Term Plan..." : "Generate Term Plan"}
      </button>

      {result && (
        <div style={{ marginTop: 20, background: "var(--surface2)", border: "1px solid var(--border)", borderRadius: 14, padding: "1.5rem" }}>
          <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 12 }}>
            <button onClick={() => { const b = new Blob([result], { type: "text/plain" }); const u = URL.createObjectURL(b); const a = document.createElement("a"); a.href = u; a.download = `TermPlan_${term}_${yearLevel}_${subject}.txt`; a.click(); URL.revokeObjectURL(u); }} style={{ padding: "7px 14px", background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 8, fontSize: 13, cursor: "pointer" }}>Download Plan</button>
          </div>
          <pre style={{ fontSize: 13, lineHeight: 1.7, whiteSpace: "pre-wrap", color: "var(--text)" }}>{result}</pre>
        </div>
      )}
    </div>
  );
}

// ─── REPORTING WORKFLOW ──────────────────────────────────────────────────────

function ReportingWorkflow() {
  const [students, setStudents] = useState("");
  const [yearLevel, setYearLevel] = useState("Year 4");
  const [term, setTerm] = useState("Term 1");
  const [subject, setSubject] = useState("Mathematics");
  const [result, setResult] = useState("");
  const [loading, setLoading] = useState(false);

  async function generate() {
    if (!students.trim()) { alert("Enter student names"); return; }
    setLoading(true);
    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [{
            role: "user",
            content: `Write semester report comments for ${yearLevel} ${subject} (${term}).\n\nStudents:\n${students}\n\nFor each student provide:\n1. A grade (A-E or Excellent/Good/Satisfactory/Needs Improvement)\n2. A 2-3 sentence comment covering: strength, area to develop, next step\n3. An AC9 content descriptor reference where relevant\n\nFormat as a table: Student | Grade | Comment | AC9 Code\n\nMake comments specific to ${subject} — not generic. Use ${yearLevel} achievement standard language.`,
          }],
          sessionId: "reporting",
          profile: { name: "Teacher", yearLevels: [yearLevel], subjects: [subject] },
          stream: false,
        }),
      });
      const data = await res.json();
      if (data.reply) { setResult(data.reply); logWorkflow("reporting", "generate", `${students.split("\n").length} students, ${yearLevel} ${subject}`); }
    } catch { alert("Generation failed"); }
    finally { setLoading(false); }
  }

  return (
    <div style={{ padding: "24px 28px" }}>
      <h2 style={{ fontSize: 18, fontWeight: 800, marginBottom: 4 }}>Reporting Workflow</h2>
      <p style={{ color: "var(--text2)", fontSize: 13, marginBottom: 20 }}>Generate semester report comments — student by student, subject by subject. One textarea, done.</p>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12, marginBottom: 16 }}>
        <div>
          <label style={{ display: "block", fontSize: 11, fontWeight: 700, color: "var(--text2)", marginBottom: 6, textTransform: "uppercase" }}>Year Level</label>
          <select value={yearLevel} onChange={e => setYearLevel(e.target.value)} style={{ width: "100%", padding: "10px 12px", background: "var(--surface2)", color: "var(--text)", border: "1px solid var(--border)", borderRadius: 10, fontSize: 14 }}>
            {YEAR_LEVELS.map(y => <option key={y}>{y}</option>)}
          </select>
        </div>
        <div>
          <label style={{ display: "block", fontSize: 11, fontWeight: 700, color: "var(--text2)", marginBottom: 6, textTransform: "uppercase" }}>Term</label>
          <select value={term} onChange={e => setTerm(e.target.value)} style={{ width: "100%", padding: "10px 12px", background: "var(--surface2)", color: "var(--text)", border: "1px solid var(--border)", borderRadius: 10, fontSize: 14 }}>
            {TERMS.map(t => <option key={t}>{t}</option>)}
          </select>
        </div>
        <div>
          <label style={{ display: "block", fontSize: 11, fontWeight: 700, color: "var(--text2)", marginBottom: 6, textTransform: "uppercase" }}>Subject</label>
          <select value={subject} onChange={e => setSubject(e.target.value)} style={{ width: "100%", padding: "10px 12px", background: "var(--surface2)", color: "var(--text)", border: "1px solid var(--border)", borderRadius: 10, fontSize: 14 }}>
            {SUBJECTS.map(s => <option key={s}>{s}</option>)}
          </select>
        </div>
      </div>

      <div style={{ marginBottom: 16 }}>
        <label style={{ display: "block", fontSize: 11, fontWeight: 700, color: "var(--text2)", marginBottom: 6, textTransform: "uppercase" }}>Student Names (one per line)</label>
        <textarea
          value={students}
          onChange={e => setStudents(e.target.value)}
          placeholder={"Alice Thompson\nBenjamin Chen\nChloe O'Brien\n..."}
          rows={6}
          style={{ width: "100%", padding: "12px", background: "var(--surface2)", color: "var(--text)", border: "1px solid var(--border)", borderRadius: 10, fontSize: 13, resize: "vertical" }}
        />
        <p style={{ color: "var(--text3)", fontSize: 12, marginTop: 6 }}>{students ? students.split("\n").filter(s => s.trim()).length : 0} students</p>
      </div>

      <button onClick={generate} disabled={loading || !students.trim()} style={{ padding: "12px 24px", background: loading ? "var(--surface2)" : "var(--primary)", color: loading ? "var(--text3)" : "#fff", border: "none", borderRadius: 12, fontWeight: 700, fontSize: 14, cursor: loading ? "not-allowed" : "pointer" }}>
        {loading ? "Generating Comments..." : "Generate All Report Comments"}
      </button>

      {result && (
        <div style={{ marginTop: 20, background: "var(--surface2)", border: "1px solid var(--border)", borderRadius: 14, padding: "1.5rem" }}>
          <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 12 }}>
            <button onClick={() => { const b = new Blob([result], { type: "text/plain" }); const u = URL.createObjectURL(b); const a = document.createElement("a"); a.href = u; a.download = `Reports_${term}_${yearLevel}_${subject}.txt`; a.click(); URL.revokeObjectURL(u); }} style={{ padding: "7px 14px", background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 8, fontSize: 13, cursor: "pointer" }}>Download Reports</button>
          </div>
          <pre style={{ fontSize: 13, lineHeight: 1.7, whiteSpace: "pre-wrap", color: "var(--text)" }}>{result}</pre>
        </div>
      )}
    </div>
  );
}

// ─── ASSESSMENT WORKFLOW ─────────────────────────────────────────────────────

function AssessmentWorkflow() {
  const [activePhase, setActivePhase] = useState("cold");
  const [result, setResult] = useState("");
  const [loading, setLoading] = useState(false);
  const [context, setContext] = useState({ subject: "Mathematics", yearLevel: "Year 4", topic: "" });

  const phase = PHASES.find(p => p.id === activePhase)!;

  async function generate() {
    if (!context.topic.trim()) { alert("Enter a topic"); return; }
    setLoading(true);
    const prompts: Record<string, string> = {
      cold: `Create a cold task (pre-assessment) for ${context.yearLevel} ${context.subject} — topic: "${context.topic}".\n\nInclude:\n1. The task description (what students do)\n2. Success criteria (what a student achieving at standard looks like)\n3. AC9 content descriptor being assessed\n4. Marking guide (key correct responses / demonstrations)\n5. How to use the data (what to look for, how to group students)`,
      plan: `Design a unit sequence for ${context.yearLevel} ${context.subject} — topic: "${context.topic}".\n\nCold task data shows: [students have prior knowledge of X, struggle with Y]\n\nProvide:\n1. Week-by-week sequence (4-8 weeks)\n2. Learning intentions per week with AC9 codes\n3. Assessment checkpoints\n4. Differentiation plan based on likely cold task gaps\n5. Resources needed`,
      teach: `Create a direct instruction plan for a ${context.subject} lesson on "${context.topic}" (${context.yearLevel}).\n\nFormat with TIMING COLUMNS:\n- Hook: X min\n- I Do (explicit teaching): X min\n- We Do (guided practice): X min\n- You Do (independent): X min\n- Reflect: X min\n\nInclude: success criteria, key questions, common misconceptions, check for understanding`,
      hot: `Create a hot task (post-assessment) for ${context.yearLevel} ${context.subject} — topic: "${context.topic}".\n\nMust be parallel to cold task (same format, different content) so you can measure growth.\n\nInclude:\n1. Task parallel to cold task\n2. AC9 code (should match cold task code)\n3. Marking guide\n4. Growth comparison rubric (show what improvement looks like A-E)`,
      mark: `Create a marking guide and moderation protocol for ${context.yearLevel} ${context.subject} — topic: "${context.topic}".\n\n1. Full marking rubric (A-E) with descriptors for each criterion\n2. Cross-moderation checklist (how to calibrate with colleagues)\n3. Common errors to look for\n4. How to give written feedback that is specific and actionable`,
      feedback: `Create a feedback framework for ${context.yearLevel} ${context.subject} — topic: "${context.topic}".\n\n1. How to frame feedback (start with strength, then specific next step)\n2. 3 example feedback comments (different achievement levels)\n3. Self-assessment prompt students can use\n4. Student goal-setting template\n5. How to follow up (conference, written, verbal)`,
      report: `Write report comment bank for ${context.yearLevel} ${context.subject} — topic: "${context.topic}".\n\nFor each achievement level (A, B, C, D, E) give:\n1. 2-sentence comment (strength + next step)\n2. AC9 content descriptor\n3. One specific thing the student can do to improve\n\nMake comments specific to ${context.topic}, not generic.`,
    };

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [{ role: "user", content: prompts[activePhase] }],
          sessionId: "assessment-workflow",
          profile: { name: "Teacher", yearLevels: [context.yearLevel], subjects: [context.subject] },
          stream: false,
        }),
      });
      const data = await res.json();
      if (data.reply) { setResult(data.reply); logWorkflow("assessment", activePhase, context.topic); }
    } catch { alert("Generation failed"); }
    finally { setLoading(false); }
  }

  return (
    <div style={{ padding: "24px 28px" }}>
      <h2 style={{ fontSize: 18, fontWeight: 800, marginBottom: 4 }}>Assessment Workflow</h2>
      <p style={{ color: "var(--text2)", fontSize: 13, marginBottom: 20 }}>Follow the full assess → plan → teach → report cycle. Pick your phase and get exactly what you need.</p>

      {/* Phase selector */}
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 20 }}>
        {PHASES.map(p => (
          <button
            key={p.id}
            onClick={() => { setActivePhase(p.id); setResult(""); }}
            style={{
              padding: "10px 16px",
              background: activePhase === p.id ? p.color : "var(--surface2)",
              color: activePhase === p.id ? "#fff" : "var(--text2)",
              border: "none",
              borderRadius: 20,
              fontSize: 13,
              fontWeight: activePhase === p.id ? 700 : 400,
              cursor: "pointer",
            }}
          >
            {p.label}
          </button>
        ))}
      </div>

      {/* Context inputs */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 2fr", gap: 12, marginBottom: 16 }}>
        <div>
          <label style={{ display: "block", fontSize: 11, fontWeight: 700, color: "var(--text2)", marginBottom: 6, textTransform: "uppercase" }}>Subject</label>
          <select value={context.subject} onChange={e => setContext({ ...context, subject: e.target.value })} style={{ width: "100%", padding: "10px 12px", background: "var(--surface2)", color: "var(--text)", border: "1px solid var(--border)", borderRadius: 10, fontSize: 14 }}>
            {SUBJECTS.map(s => <option key={s}>{s}</option>)}
          </select>
        </div>
        <div>
          <label style={{ display: "block", fontSize: 11, fontWeight: 700, color: "var(--text2)", marginBottom: 6, textTransform: "uppercase" }}>Year Level</label>
          <select value={context.yearLevel} onChange={e => setContext({ ...context, yearLevel: e.target.value })} style={{ width: "100%", padding: "10px 12px", background: "var(--surface2)", color: "var(--text)", border: "1px solid var(--border)", borderRadius: 10, fontSize: 14 }}>
            {YEAR_LEVELS.map(y => <option key={y}>{y}</option>)}
          </select>
        </div>
        <div>
          <label style={{ display: "block", fontSize: 11, fontWeight: 700, color: "var(--text2)", marginBottom: 6, textTransform: "uppercase" }}>Topic</label>
          <input value={context.topic} onChange={e => setContext({ ...context, topic: e.target.value })} placeholder={"e.g. Fractions, Narrative Writing, Ecosystems..."} style={{ width: "100%", padding: "10px 14px", background: "var(--surface2)", color: "var(--text)", border: "1px solid var(--border)", borderRadius: 10, fontSize: 14 }} onFocus={e => e.currentTarget.style.borderColor = "var(--primary)"} onBlur={e => e.currentTarget.style.borderColor = "var(--border)"} />
        </div>
      </div>

      {/* Phase description */}
      <div style={{ padding: "12px 16px", background: `${phase.color}15`, border: `1px solid ${phase.color}40`, borderRadius: 12, marginBottom: 16 }}>
        <span style={{ fontSize: 13, fontWeight: 700, color: phase.color }}>{phase.label}:</span>
        <span style={{ fontSize: 13, color: "var(--text2)", marginLeft: 8 }}>{phase.description}</span>
      </div>

      <button onClick={generate} disabled={loading || !context.topic.trim()} style={{ padding: "12px 24px", background: loading ? "var(--surface2)" : phase.color, color: "#fff", border: "none", borderRadius: 12, fontWeight: 700, fontSize: 14, cursor: loading ? "not-allowed" : "pointer" }}>
        {loading ? `Generating ${phase.label}...` : `Generate ${phase.label}`}
      </button>

      {result && (
        <div style={{ marginTop: 20, background: "var(--surface2)", border: "1px solid var(--border)", borderRadius: 14, padding: "1.5rem" }}>
          <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 12 }}>
            <button onClick={() => { const b = new Blob([result], { type: "text/plain" }); const u = URL.createObjectURL(b); const a = document.createElement("a"); a.href = u; a.download = `${phase.label}_${context.yearLevel}_${context.subject}.txt`; a.click(); URL.revokeObjectURL(u); }} style={{ padding: "7px 14px", background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 8, fontSize: 13, cursor: "pointer" }}>Download</button>
          </div>
          <pre style={{ fontSize: 13, lineHeight: 1.7, whiteSpace: "pre-wrap", color: "var(--text)" }}>{result}</pre>
        </div>
      )}
    </div>
  );
}

// ─── MAIN EXPORT ─────────────────────────────────────────────────────────────

export default function WorkflowsView() {
  const [tab, setTab] = useState<"term" | "report" | "assess">("term");

  return (
    <div style={{ minHeight: "100vh" }}>
      <div style={{ padding: "20px 28px", borderBottom: "1px solid var(--border)" }}>
        <h1 style={{ fontSize: 20, fontWeight: 800, marginBottom: 4 }}>Teacher Workflows</h1>
        <p style={{ color: "var(--text2)", fontSize: 13 }}>End-to-end workflows — from term planning to report comments</p>
      </div>

      {/* Tab bar */}
      <div style={{ display: "flex", gap: 0, borderBottom: "1px solid var(--border)", padding: "0 28px" }}>
        {([
          { id: "term", label: "Term Planning", icon: "" },
          { id: "report", label: "Reporting", icon: "" },
          { id: "assess", label: "Assessment Cycle", icon: "" },
        ] as const).map(t => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            style={{
              padding: "14px 20px",
              background: "transparent",
              color: tab === t.id ? "var(--primary)" : "var(--text2)",
              border: "none",
              borderBottom: `2px solid ${tab === t.id ? "var(--primary)" : "transparent"}`,
              fontSize: 14,
              fontWeight: tab === t.id ? 700 : 500,
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: 8,
            }}
          >
            <span>{t.icon}</span> {t.label}
          </button>
        ))}
      </div>

      {/* Content */}
      <div style={{ overflowY: "auto" }}>
        {tab === "term" && <TermPlanning />}
        {tab === "report" && <ReportingWorkflow />}
        {tab === "assess" && <AssessmentWorkflow />}
      </div>
    </div>
  );
}