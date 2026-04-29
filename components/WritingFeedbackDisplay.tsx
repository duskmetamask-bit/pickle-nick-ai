"use client";

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

interface WritingFeedbackDisplayProps { compact?: boolean;
  content: string;
  onSave?: () => void;
  onDownloadTxt?: () => void;
  onDownloadPdf?: () => void;
  onDownloadDOCX?: () => void;
  onSaveToGoogleDrive?: () => void;
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

export default function WritingFeedbackDisplay({ content, onSave, onDownloadTxt, onDownloadPdf, onDownloadDOCX, onSaveToGoogleDrive, compact }: WritingFeedbackDisplayProps) {
  const cp = compact;
  const titleMatch = content.match(/^#\s+(.+?)\n/im);
  const title = titleMatch ? titleMatch[1].trim() : "Writing Feedback";

  // Extract Strengths section
  const strengthMatch = content.match(/\*\*Strengths?[\s:]*\*\*(.+?)(?:\*\*Areas?|\*\*Next Steps|\*\*To Improve|## |---)/is);
  const strengths = strengthMatch ? strengthMatch[1].trim() : "";

  // Extract Areas to Develop / Areas for Improvement
  const areasMatch = content.match(/\*\*Areas? (?:to Develop|for Improvement|to Improve)[\s:]*\*\*(.+?)(?:\*\*Next Steps|\*\*Strengths|## |---)/is);
  const areas = areasMatch ? areasMatch[1].trim() : "";

  // Extract Next Steps
  const nextMatch = content.match(/\*\*Next Steps[\s:]*\*\*(.+?)(?:\*\*|\#\#|---)/is);
  const nextSteps = nextMatch ? nextMatch[1].trim() : "";

  const hasStructured = strengths || areas || nextSteps;

  return (
    <div style={{ fontFamily: "'Inter', system-ui, -apple-system, sans-serif", maxWidth: cp ? 340 : 820, margin: "0 auto" }}>
      <div style={{ background: "#fff", borderRadius: 20, boxShadow: "0 4px 24px rgba(0,0,0,0.08)", overflow: "hidden" }}>

        {/* HEADER */}
        <div style={{ background: "linear-gradient(135deg, #1e1b4b 0%, #312e81 100%)", padding: cp ? "12px 14px 10px" : "24px 28px 20px" }}>
          <div style={{ display: "flex", justifyContent: "flex-end", gap: 8, marginBottom: 16 }}>
            {onSave && <button onClick={onSave} data-save-btn style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "7px 16px", background: "rgba(255,255,255,0.12)", color: "#fff", border: "1px solid rgba(255,255,255,0.25)", borderRadius: 24, fontSize: 12, fontWeight: 600, cursor: "pointer", backdropFilter: "blur(8px)" }}>Save</button>}
            {onDownloadTxt && <button onClick={onDownloadTxt} style={{ padding: "7px 16px", background: "rgba(255,255,255,0.12)", color: "#fff", border: "1px solid rgba(255,255,255,0.25)", borderRadius: 24, fontSize: 12, fontWeight: 600, cursor: "pointer" }}>TXT</button>}
            {onDownloadPdf && <button onClick={onDownloadPdf} style={{ padding: "7px 16px", background: "#fff", color: "#312e81", border: "none", borderRadius: 24, fontSize: 12, fontWeight: 700, cursor: "pointer", boxShadow: "0 2px 8px rgba(0,0,0,0.15)" }}>PDF</button>}
            {onDownloadDOCX && <button onClick={onDownloadDOCX} style={{ padding: "7px 16px", background: "#4F46E5", color: "#fff", border: "none", borderRadius: 24, fontSize: 12, fontWeight: 700, cursor: "pointer", boxShadow: "0 2px 8px rgba(0,0,0,0.15)" }}>DOCX</button>}
            {onSaveToGoogleDrive && <button onClick={onSaveToGoogleDrive} style={{ padding: "7px 16px", background: "#1DB954", color: "#fff", border: "none", borderRadius: 24, fontSize: 12, fontWeight: 700, cursor: "pointer", boxShadow: "0 2px 8px rgba(0,0,0,0.15)", display: "inline-flex", alignItems: "center", gap: 6 }}>📁 Google Drive</button>}
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 0 }}>
            <div style={{ background: "rgba(255,255,255,0.15)", borderRadius: 10, padding: "6px 10px", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"/></svg>
            </div>
            <div>
              <div style={{ fontSize: 10, fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.15em", color: "rgba(255,255,255,0.6)", marginBottom: 3 }}>PickleNickAI</div>
              <div style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", color: "rgba(255,255,255,0.5)" }}>Writing Feedback</div>
            </div>
          </div>
          <h2 style={{ fontSize: 20, fontWeight: 800, color: "#fff", margin: "8px 0 0", lineHeight: 1.3, letterSpacing: "-0.02em" }}>{title}</h2>
        </div>

        {/* BODY */}
        <div style={{ padding: cp ? "12px 14px" : "24px 28px" }}>

          {hasStructured ? (
            <>
              {/* Strengths */}
              {strengths && (
                <SectionCard accentColor="#10b981">
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
                    <div style={{ background: "#d1fae5", borderRadius: 8, padding: "6px 8px", display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                    </div>
                    <SectionLabel>Strengths</SectionLabel>
                  </div>
                  <div style={{ background: "#f0fdf4", borderRadius: 10, padding: "14px 16px" }}>
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>{strengths}</ReactMarkdown>
                  </div>
                </SectionCard>
              )}

              {/* Areas to Develop */}
              {areas && (
                <SectionCard accentColor="#f59e0b">
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
                    <div style={{ background: "#fef3c7", borderRadius: 8, padding: "6px 8px", display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                    </div>
                    <SectionLabel>Areas to Develop</SectionLabel>
                  </div>
                  <div style={{ background: "#fffbeb", borderRadius: 10, padding: "14px 16px" }}>
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>{areas}</ReactMarkdown>
                  </div>
                </SectionCard>
              )}

              {/* Next Steps */}
              {nextSteps && (
                <SectionCard accentColor="#6366f1">
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
                    <div style={{ background: "#eef2ff", borderRadius: 8, padding: "6px 8px", fontSize: 15 }}>🚀</div>
                    <SectionLabel>Next Steps</SectionLabel>
                  </div>
                  <div style={{ background: "#eef2ff", borderRadius: 10, padding: "14px 16px" }}>
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>{nextSteps}</ReactMarkdown>
                  </div>
                </SectionCard>
              )}
            </>
          ) : (
            <SectionCard accentColor="#6366f1">
              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                components={{
                  h1: ({ children }) => <h1 style={{ fontSize: 20, fontWeight: 900, margin: "0 0 12px", color: "#1e293b" }}>{children}</h1>,
                  h2: ({ children }) => <h2 style={{ fontSize: 16, fontWeight: 800, margin: "18px 0 10px", color: "#1e293b", borderBottom: "2px solid #e0e7ff", paddingBottom: 6 }}>{children}</h2>,
                  h3: ({ children }) => <h3 style={{ fontSize: 14, fontWeight: 700, margin: "14px 0 6px", color: "#374151" }}>{children}</h3>,
                  p: ({ children }) => <p style={{ margin: "6px 0", lineHeight: 1.8, fontSize: 14, color: "#475569" }}>{children}</p>,
                  ul: ({ children }) => <ul style={{ margin: "8px 0 8px 20px" }}>{children}</ul>,
                  ol: ({ children }) => <ol style={{ margin: "8px 0 8px 20px" }}>{children}</ol>,
                  li: ({ children }) => <li style={{ margin: "3px 0", fontSize: 14, color: "#475569" }}>{children}</li>,
                  strong: ({ children }) => <strong style={{ fontWeight: 700, color: "#1e293b" }}>{children}</strong>,
                  blockquote: ({ children }) => <blockquote style={{ borderLeft: "4px solid #6366f1", paddingLeft: 14, margin: "10px 0", color: "#475569", fontStyle: "italic" }}>{children}</blockquote>,
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
