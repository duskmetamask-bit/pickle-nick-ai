"use client";

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

interface AssessmentDisplayProps { compact?: boolean;
  content: string;
  onSave?: () => void;
  onDownloadTxt?: () => void;
  onDownloadPdf?: () => void;
  onDownloadDOCX?: () => void;
}

function AC9Pill({ code }: { code: string }) {
  return (
    <span style={{
      display: "inline-block", background: "#6366f1", color: "#fff",
      padding: "2px 10px", borderRadius: 20, fontSize: 10, fontWeight: 700,
      letterSpacing: "0.04em", fontFamily: "monospace",
    }}>{code}</span>
  );
}

function SectionCard({ accentColor, children }: { accentColor: string; children: React.ReactNode }) {
  return (
    <div style={{
      background: "#fff", borderRadius: 14,
      boxShadow: "0 2px 12px rgba(0,0,0,0.06)",
      border: "1px solid #f0f0f0", borderLeft: `4px solid ${accentColor}`,
      padding: "18px 22px", marginBottom: 12,
    }}>{children}</div>
  );
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div style={{
      fontSize: 10, fontWeight: 800, textTransform: "uppercase",
      letterSpacing: "0.12em", color: "#6366f1", marginBottom: 10,
    }}>{children}</div>
  );
}

export default function AssessmentDisplay({ content, onSave, onDownloadTxt, onDownloadPdf, onDownloadDOCX, compact }: AssessmentDisplayProps) {
  const cp = compact;
  const ac9Codes = content.match(/AC9\w{1,3}\d{1,2}-\d{2}/g) || [];

  const titleMatch = content.match(/^#\s+(.+?)\n/im);
  const title = titleMatch ? titleMatch[1].trim() : "Assessment Task";

  // Look for Cold Task / Hot Task sections
  const coldMatch = content.match(/\*\*Cold Task[\s:]*\*\*(.+?)[\s\S]*?(?:\*\*Follow-up|## |---)/i);
  const hotMatch = content.match(/\*\*Hot Task[\s:]*\*\*(.+?)[\s\S]*?(?:\*\*Follow-up|## |---)/i);
  const cold = coldMatch ? coldMatch[1].trim() : "";
  const hot = hotMatch ? hotMatch[1].trim() : "";

  // Look for Learning Intentions / Success Criteria
  const liMatch = content.match(/\*\*Learning Intention[s]?[\s:]*\*\*(.+?)(?:\*\*|## |---)/is);
  const scMatch = content.match(/\*\*Success Criteria[\s:]*\*\*(.+?)(?:\*\*|## |---)/is);
  const li = liMatch ? liMatch[1].trim() : "";
  const sc = scMatch ? scMatch[1].trim() : "";

  return (
    <div style={{ fontFamily: "'Inter', system-ui, -apple-system, sans-serif", maxWidth: cp ? 340 : 820, margin: "0 auto" }}>
      <div style={{ background: "#fff", borderRadius: 20, boxShadow: "0 4px 24px rgba(0,0,0,0.08)", overflow: "hidden" }}>

        {/* HEADER */}
        <div style={{ background: "linear-gradient(135deg, #1e1b4b 0%, #312e81 100%)", padding: cp ? "12px 14px 10px" : "24px 28px 20px" }}>
          <div style={{ display: "flex", justifyContent: "flex-end", gap: 8, marginBottom: 16 }}>
            {onSave && <button onClick={onSave} data-save-btn style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "7px 16px", background: "rgba(255,255,255,0.12)", color: "#fff", border: "1px solid rgba(255,255,255,0.25)", borderRadius: 24, fontSize: 12, fontWeight: 600, cursor: "pointer", backdropFilter: "blur(8px)" }}>💾 Save</button>}
            {onDownloadTxt && <button onClick={onDownloadTxt} style={{ padding: "7px 16px", background: "rgba(255,255,255,0.12)", color: "#fff", border: "1px solid rgba(255,255,255,0.25)", borderRadius: 24, fontSize: 12, fontWeight: 600, cursor: "pointer" }}>📄 TXT</button>}
            {onDownloadPdf && <button onClick={onDownloadPdf} style={{ padding: "7px 16px", background: "#fff", color: "#312e81", border: "none", borderRadius: 24, fontSize: 12, fontWeight: 700, cursor: "pointer", boxShadow: "0 2px 8px rgba(0,0,0,0.15)" }}>📕 PDF</button>}
            {onDownloadDOCX && <button onClick={onDownloadDOCX} style={{ padding: "7px 16px", background: "#4F46E5", color: "#fff", border: "none", borderRadius: 24, fontSize: 12, fontWeight: 700, cursor: "pointer", boxShadow: "0 2px 8px rgba(0,0,0,0.15)" }}>📘 DOCX</button>}
          </div>
          <div style={{ display: "flex", alignItems: "flex-start", gap: 14, flexWrap: "wrap" }}>
            <div style={{ flex: 1 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
                <div style={{ background: "rgba(255,255,255,0.15)", borderRadius: 10, padding: "6px 10px", fontSize: 18 }}>📝</div>
                <div>
                  <div style={{ fontSize: 10, fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.15em", color: "rgba(255,255,255,0.6)", marginBottom: 3 }}>PickleNickAI</div>
                  <div style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", color: "rgba(255,255,255,0.5)" }}>Assessment Task</div>
                </div>
              </div>
              <h2 style={{ fontSize: 20, fontWeight: 800, color: "#fff", margin: 0, lineHeight: 1.3, letterSpacing: "-0.02em" }}>{title}</h2>
            </div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 5, alignItems: "flex-start" }}>
              {ac9Codes.slice(0, 4).map(code => <AC9Pill key={code} code={code} />)}
            </div>
          </div>
        </div>

        {/* BODY */}
        <div style={{ padding: cp ? "12px 14px" : "24px 28px" }}>

          {/* Cold Task */}
          {cold && (
            <SectionCard accentColor="#3b82f6">
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
                <div style={{ background: "#dbeafe", borderRadius: 8, padding: "6px 8px", fontSize: 15 }}>❄️</div>
                <SectionLabel>Cold Task — Pre-Assessment</SectionLabel>
              </div>
              <div style={{ background: "#eff6ff", borderRadius: 10, padding: "14px 16px" }}>
                <ReactMarkdown remarkPlugins={[remarkGfm]}>{cold}</ReactMarkdown>
              </div>
            </SectionCard>
          )}

          {/* Hot Task */}
          {hot && (
            <SectionCard accentColor="#ef4444">
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
                <div style={{ background: "#fee2e2", borderRadius: 8, padding: "6px 8px", fontSize: 15 }}>🔥</div>
                <SectionLabel>Hot Task — Post-Assessment</SectionLabel>
              </div>
              <div style={{ background: "#fef2f2", borderRadius: 10, padding: "14px 16px" }}>
                <ReactMarkdown remarkPlugins={[remarkGfm]}>{hot}</ReactMarkdown>
              </div>
            </SectionCard>
          )}

          {/* Learning Intention + Success Criteria */}
          {(li || sc) && (
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 12 }}>
              {li && (
                <SectionCard accentColor="#8b5cf6">
                  <SectionLabel>Learning Intention</SectionLabel>
                  <p style={{ fontSize: 14, lineHeight: 1.7, color: "#1e293b", margin: 0, fontWeight: 500 }}>{li}</p>
                </SectionCard>
              )}
              {sc && (
                <SectionCard accentColor="#10b981">
                  <SectionLabel>Success Criteria</SectionLabel>
                  <p style={{ fontSize: 14, lineHeight: 1.7, color: "#1e293b", margin: 0 }}>{sc}</p>
                </SectionCard>
              )}
            </div>
          )}

          {/* AC9 strip */}
          {ac9Codes.length > 0 && (
            <div style={{ background: "#f5f3ff", borderRadius: 12, padding: "12px 16px", display: "flex", flexWrap: "wrap", gap: 8, alignItems: "center" }}>
              <span style={{ fontSize: 10, fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.1em", color: "#6366f1", marginRight: 4 }}>AC9:</span>
              {ac9Codes.map(code => <AC9Pill key={code} code={code} />)}
            </div>
          )}

          {/* Fallback — raw content if no sections detected */}
          {!cold && !hot && (
            <SectionCard accentColor="#6366f1">
              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                components={{
                  h1: ({ children }) => <h1 style={{ fontSize: 20, fontWeight: 900, margin: "0 0 12px", color: "#1e293b" }}>{children}</h1>,
                  h2: ({ children }) => <h2 style={{ fontSize: 16, fontWeight: 800, margin: "18px 0 10px", color: "#1e293b", borderBottom: "2px solid #e0e7ff", paddingBottom: 6 }}>{children}</h2>,
                  h3: ({ children }) => <h3 style={{ fontSize: 14, fontWeight: 700, margin: "14px 0 6px", color: "#374151" }}>{children}</h3>,
                  p: ({ children }) => <p style={{ margin: "6px 0", lineHeight: 1.8, fontSize: 14, color: "#475569" }}>{children}</p>,
                  table: ({ children }) => <div style={{ overflowX: "auto", margin: "10px 0", borderRadius: 10, border: "1px solid #e5e7eb" }}><table style={{ width: "100%", borderCollapse: "collapse" }}>{children}</table></div>,
                  thead: ({ children }) => <thead style={{ background: "#f5f3ff" }}>{children}</thead>,
                  th: ({ children }) => <th style={{ padding: "8px 12px", color: "#6366f1", fontWeight: 700, fontSize: 11, textTransform: "uppercase", letterSpacing: "0.08em", borderBottom: "2px solid #e0e7ff" }}>{children}</th>,
                  td: ({ children }) => <td style={{ padding: "8px 12px", borderBottom: "1px solid #f0f0f0", fontSize: 13, color: "#374151" }}>{children}</td>,
                  tr: ({ children }) => <tr style={{ borderBottom: "1px solid #f0f0f0" }}>{children}</tr>,
                }}
              >{content}</ReactMarkdown>
            </SectionCard>
          )}
        </div>

        {/* FOOTER */}
        <div style={{ borderTop: "1px solid #f0f0f0", padding: "10px 28px", display: "flex", justifyContent: "space-between", alignItems: "center", background: "#fafafa" }}>
          <span style={{ fontSize: 11, color: "#9ca3af", fontWeight: 600 }}>Generated by PickleNickAI</span>
          <span style={{ fontSize: 11, color: "#d1d5db" }}>{new Date().toLocaleDateString("en-AU", { day: "numeric", month: "long", year: "numeric" })}</span>
        </div>
      </div>
    </div>
  );
}
