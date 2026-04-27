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

const DropZone = ({
  label,
  icon,
  file,
  onFile,
}: {
  label: string;
  icon: React.ReactNode;
  file: File | null;
  onFile: (f: File) => void;
}) => {
  const [dragging, setDragging] = useState(false);

  return (
    <div>
      <div style={{ fontSize: 11, fontWeight: 700, color: "var(--text-3)", marginBottom: 8, textTransform: "uppercase", letterSpacing: "0.05em" }}>{label}</div>
      <div
        onDragOver={e => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={e => { e.preventDefault(); setDragging(false); const f = e.dataTransfer.files[0]; if (f) onFile(f); }}
        onClick={() => {
          const i = document.createElement("input");
          i.type = "file";
          i.accept = "image/*,application/pdf";
          i.onchange = e => { const f = (e.target as HTMLInputElement).files?.[0]; if (f) onFile(f); };
          i.click();
        }}
        style={{
          background: dragging ? "var(--primary-dim)" : "var(--surface)",
          border: `2px dashed ${dragging ? "var(--primary)" : "var(--border-subtle)"}`,
          borderRadius: "var(--radius-lg)",
          padding: "2rem 1.5rem",
          textAlign: "center",
          cursor: "pointer",
          transition: "all 0.15s",
        }}
      >
        <div style={{ fontSize: 28, marginBottom: 8, display: "flex", justifyContent: "center" }}>{icon}</div>
        {file ? (
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--success)" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>
            <span style={{ color: "var(--success)", fontSize: 13, fontWeight: 600 }}>{file.name}</span>
          </div>
        ) : (
          <div style={{ color: "var(--text-2)", fontSize: 13 }}>Drag & drop or click to upload</div>
        )}
      </div>
    </div>
  );
};

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
    <div style={{ minHeight: "100vh", background: "var(--bg)" }}>
      <div style={{ padding: "20px 28px", borderBottom: "1px solid var(--border-subtle)", display: "flex", alignItems: "center", gap: 12 }}>
        <div style={{
          width: 36, height: 36, borderRadius: 10,
          background: "var(--success-dim)", border: "1px solid rgba(52,211,153,0.2)",
          display: "flex", alignItems: "center", justifyContent: "center",
          color: "var(--success)", fontSize: 16,
        }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points="9 11 12 14 22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/>
          </svg>
        </div>
        <div>
          <h1 style={{ fontSize: 18, fontWeight: 800, letterSpacing: "-0.01em", marginBottom: 2 }}>Auto-Marking</h1>
          <p style={{ color: "var(--text-2)", fontSize: 12 }}>Upload a rubric and student work — get instant AI feedback</p>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", minHeight: "calc(100vh - 74px)" }}>
        {/* Upload panel */}
        <div style={{ padding: "24px 28px", borderRight: "1px solid var(--border-subtle)" }}>
          <DropZone
            label="Step 1: Upload Rubric"
            icon={
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="var(--primary-hover)" strokeWidth="1.5">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                <polyline points="14 2 14 8 20 8"/>
                <line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/>
                <polyline points="10 9 9 9 8 9"/>
              </svg>
            }
            file={rubricFile}
            onFile={setRubricFile}
          />

          <div style={{ marginTop: 16 }}>
            <DropZone
              label="Step 2: Upload Student Work"
              icon={
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth="1.5">
                  <path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"/>
                </svg>
              }
              file={workFile}
              onFile={setWorkFile}
            />
          </div>

          {error && (
            <div style={{ marginTop: 16, padding: "10px 14px", background: "var(--danger-dim)", border: "1px solid rgba(248,113,113,0.2)", borderRadius: "var(--radius)", color: "var(--danger)", fontSize: 13 }}>
              {error}
            </div>
          )}

          <button
            onClick={analyze}
            disabled={loading || !rubricFile || !workFile}
            style={{
              width: "100%", marginTop: 20,
              padding: "12px",
              background: loading ? "var(--surface)" : !rubricFile || !workFile ? "var(--surface)" : "var(--success)",
              color: !rubricFile || !workFile ? "var(--text-3)" : loading ? "var(--text-3)" : "#fff",
              border: "none", borderRadius: "var(--radius)",
              fontWeight: 700, fontSize: 14,
              cursor: !rubricFile || !workFile || loading ? "not-allowed" : "pointer",
              display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
              transition: "all 0.15s",
            }}
          >
            {loading ? (
              <>
                <div style={{ width: 14, height: 14, border: "2px solid rgba(255,255,255,0.3)", borderTopColor: "#fff", borderRadius: "50%", animation: "spin 0.7s linear infinite" }} />
                Analyzing...
              </>
            ) : "Analyze Student Work"}
          </button>
        </div>

        {/* Result panel */}
        <div style={{ padding: "24px 28px", display: "flex", flexDirection: "column" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
            <h2 style={{ fontSize: 15, fontWeight: 700 }}>Feedback</h2>
            {result && (
              <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                {feedback === null ? (
                  <>
                    <span style={{ fontSize: 12, color: "var(--text-3)" }}>Was this helpful?</span>
                    <button onClick={() => handleFeedback("good")} style={{ background: "var(--success-dim)", border: "1px solid rgba(52,211,153,0.2)", borderRadius: 8, padding: "5px 10px", cursor: "pointer", fontSize: 16 }}>👍</button>
                    <button onClick={() => handleFeedback("bad")} style={{ background: "var(--danger-dim)", border: "1px solid rgba(248,113,113,0.2)", borderRadius: 8, padding: "5px 10px", cursor: "pointer", fontSize: 16 }}>👎</button>
                  </>
                ) : (
                  <span style={{ fontSize: 12, color: feedback === "good" ? "var(--success)" : "var(--text-3)", fontWeight: 600 }}>
                    {feedback === "good" ? "✓ Thanks!" : "✓ Noted"}
                  </span>
                )}
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
            color: result ? "var(--text)" : "var(--text-3)",
          }}>
            {result || "Results will appear here after analysis. Each criterion will be graded with specific, actionable feedback for the student."}
          </div>
        </div>
      </div>
    </div>
  );
}