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

export default function AutoMarkView() {
  const [rubricFile, setRubricFile] = useState<File | null>(null);
  const [workFile, setWorkFile] = useState<File | null>(null);
  const [result, setResult] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [feedback, setFeedback] = useState<"good" | "bad" | null>(null);

  async function analyze() {
    if (!rubricFile || !workFile) { setError("Please upload both a rubric and student work"); return; }
    setError(""); setLoading(true); setResult(""); setFeedback(null);
    const formData = new FormData();
    formData.append("rubric", rubricFile);
    formData.append("work", workFile);
    try {
      const res = await fetch("/api/auto-mark", { method: "POST", body: formData });
      const data = await res.json();
      if (data.result) {
        setResult(data.result);
        logUsage("auto-mark", "analyze", `${rubricFile.name} vs ${workFile.name}`);
      } else if (data.error) setError(data.error);
    } catch { setError("Analysis failed. Please try again."); }
    finally { setLoading(false); }
  }

  function handleFeedback(f: "good" | "bad") {
    setFeedback(f);
    logFeedback("auto-mark", f, `${rubricFile?.name || "rubric"} vs ${workFile?.name || "work"}`);
  }

  return (
    <div style={{ minHeight: "100vh" }}>
      <div style={{ padding: "20px 28px", borderBottom: "1px solid var(--border)" }}>
        <h1 style={{ fontSize: 20, fontWeight: 800, marginBottom: 4 }}>Auto-Marking</h1>
        <p style={{ color: "var(--text2)", fontSize: 13 }}>Upload a rubric and student work — get instant AI feedback</p>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", minHeight: "calc(100vh - 73px)" }}>
        <div style={{ padding: "24px 28px", borderRight: "1px solid var(--border)" }}>
          <div style={{ marginBottom: 20 }}>
            <h2 style={{ fontSize: 13, fontWeight: 700, marginBottom: 8 }}>Step 1: Upload Rubric</h2>
            <div
              onDragOver={e => e.preventDefault()}
              onDrop={e => { e.preventDefault(); const f = e.dataTransfer.files[0]; if (f) setRubricFile(f); }}
              onClick={() => { const i = document.createElement("input"); i.type = "file"; i.accept = "image/*,application/pdf"; i.onchange = e => { const f = (e.target as HTMLInputElement).files?.[0]; if (f) setRubricFile(f); }; i.click(); }}
              style={{ background: "var(--surface2)", border: "2px dashed var(--border)", borderRadius: 14, padding: "2rem", textAlign: "center", cursor: "pointer" }}
            >
              <div style={{ fontSize: 28, marginBottom: 8 }}>📄</div>
              {rubricFile ? <div style={{ color: "var(--success)", fontSize: 13, fontWeight: 600 }}>{rubricFile.name}</div> : <div style={{ color: "var(--text2)", fontSize: 13 }}>Drag & drop or click to upload</div>}
            </div>
          </div>
          <div style={{ marginBottom: 20 }}>
            <h2 style={{ fontSize: 13, fontWeight: 700, marginBottom: 8 }}>Step 2: Upload Student Work</h2>
            <div
              onDragOver={e => e.preventDefault()}
              onDrop={e => { e.preventDefault(); const f = e.dataTransfer.files[0]; if (f) setWorkFile(f); }}
              onClick={() => { const i = document.createElement("input"); i.type = "file"; i.accept = "image/*,application/pdf"; i.onchange = e => { const f = (e.target as HTMLInputElement).files?.[0]; if (f) setWorkFile(f); }; i.click(); }}
              style={{ background: "var(--surface2)", border: "2px dashed var(--border)", borderRadius: 14, padding: "2rem", textAlign: "center", cursor: "pointer" }}
            >
              <div style={{ fontSize: 28, marginBottom: 8 }}>✍️</div>
              {workFile ? <div style={{ color: "var(--success)", fontSize: 13, fontWeight: 600 }}>{workFile.name}</div> : <div style={{ color: "var(--text2)", fontSize: 13 }}>Drag & drop or click to upload</div>}
            </div>
          </div>
          {error && <div style={{ padding: "10px", background: "rgba(248,113,113,0.1)", border: "1px solid rgba(248,113,113,0.3)", borderRadius: 10, color: "var(--danger)", fontSize: 13, marginBottom: 14 }}>{error}</div>}
          <button onClick={analyze} disabled={loading || !rubricFile || !workFile} style={{ width: "100%", padding: "13px", background: loading ? "var(--surface2)" : "var(--primary)", color: (loading || !rubricFile || !workFile) ? "var(--text3)" : "#fff", border: "none", borderRadius: 12, fontWeight: 700, fontSize: 15, cursor: (loading || !rubricFile || !workFile) ? "not-allowed" : "pointer" }}>
            {loading ? "Analyzing..." : "Analyze Student Work"}
          </button>
        </div>
        <div style={{ padding: "24px 28px", display: "flex", flexDirection: "column" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
            <h2 style={{ fontSize: 16, fontWeight: 700 }}>Feedback</h2>
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
              </div>
            )}
          </div>
          <div style={{ background: "var(--surface2)", border: "1px solid var(--border)", borderRadius: 14, padding: "1.5rem", flex: 1, fontSize: 13, lineHeight: 1.8, whiteSpace: "pre-wrap", color: result ? "var(--text)" : "var(--text3)", overflowY: "auto" }}>
            {result || "Results will appear here after analysis. Each criterion will be graded with specific feedback."}
          </div>
        </div>
      </div>
    </div>
  );
}