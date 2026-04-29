"use client";

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

interface RubricDisplayProps { compact?: boolean;
  content: string;
  onSave?: () => void;
  onDownloadTxt?: () => void;
  onDownloadPdf?: () => void;
  onDownloadDOCX?: () => void;
}

const LEVELS = [
  { label: "Excellent", color: "#059669", bg: "#d1fae5", textColor: "#065f46" },
  { label: "Good", color: "#3b82f6", bg: "#dbeafe", textColor: "#1e40af" },
  { label: "Satisfactory", color: "#f59e0b", bg: "#fef3c7", textColor: "#92400e" },
  { label: "Needs Improvement", color: "#ef4444", bg: "#fee2e2", textColor: "#991b1b" },
];

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

function AC9Pill({ code }: { code: string }) {
  return (
    <span style={{
      display: "inline-block", background: "#6366f1", color: "#fff",
      padding: "2px 10px", borderRadius: 20, fontSize: 10, fontWeight: 700,
      letterSpacing: "0.04em", fontFamily: "monospace",
    }}>{code}</span>
  );
}

export default function RubricDisplay({ content, onSave, onDownloadTxt, onDownloadPdf, onDownloadDOCX, compact }: RubricDisplayProps) {
  const cp = compact;
  const lines = content.split("\n");
  let title = "Assessment Rubric";

  const titleMatch = content.match(/^#\s+(.+?)\n/im) || content.match(/\*\*Rubric[:\s]*\*\*(.+?)(?:\n|$)/i);
  if (titleMatch) title = titleMatch[1].replace(/^\s*[*_]+\s*/, "").trim();

  const ac9Codes = content.match(/AC9\w{1,3}\d{1,2}-\d{2}/g) || [];

  // Try to parse rubric table
  const tableRows: string[] = (content.match(/\|[^\n]+\|/g) || []).map(r => r.replace(/[#*\n]/g, ""));
  const headerRow = tableRows.find(r => r.includes("Excellent") || r.includes("Good") || r.includes("Satisfactory") || r.includes("Needs")) || "";
  let headerIdx = tableRows.indexOf(headerRow || "");

  let criteria: string[] = [];
  const levelData: Record<string, string[]> = { Excellent: [], Good: [], Satisfactory: [], "Needs Improvement": [] };
  let parsingCriteria = false;
  let currentCriteria = "";

  for (let i = headerIdx + 1; i < tableRows.length; i++) {
    const cells = tableRows[i].split("|").map(c => c.replace(/[*#\n]/g, "").trim()).filter(c => c);
    if (cells.length < 2) continue;
    if (cells[0] && !cells[0].match(/\d/i) && !cells[0].match(/Excellent|Good|Satisfactory|Needs/i)) {
      if (currentCriteria && criteria.length > 0) {
        // already have criteria
      }
      currentCriteria = cells[0];
      if (!criteria.includes(currentCriteria)) criteria.push(currentCriteria);
    }
    // map level content
    for (const level of LEVELS) {
      const idx = LEVELS.indexOf(level);
      if (cells[idx + 1]) {
        levelData[level.label].push(cells[idx + 1]);
      }
    }
  }

  // If we can't parse the table, just render as markdown
  const hasTable = headerRow && criteria.length > 0;

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
                <div style={{ background: "rgba(255,255,255,0.15)", borderRadius: 10, padding: "6px 10px", fontSize: 18 }}>📊</div>
                <div>
                  <div style={{ fontSize: 10, fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.15em", color: "rgba(255,255,255,0.6)", marginBottom: 3 }}>PickleNickAI</div>
                  <div style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", color: "rgba(255,255,255,0.5)" }}>Assessment Rubric</div>
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
          {hasTable ? (
            <SectionCard accentColor="#6366f1">
              <div style={{ borderRadius: 12, overflow: "hidden", border: "1px solid #e0e7ff", boxShadow: "0 1px 4px rgba(0,0,0,0.04)" }}>
                <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
                  <thead>
                    <tr style={{ background: "#f5f3ff" }}>
                      <th style={{ padding: "10px 14px", textAlign: "left", fontWeight: 700, fontSize: 10, textTransform: "uppercase", letterSpacing: "0.08em", color: "#6366f1", borderBottom: "2px solid #e0e7ff", minWidth: 120 }}>Criterion</th>
                      {LEVELS.map(l => (
                        <th key={l.label} style={{ padding: "10px 14px", textAlign: "left", fontWeight: 700, fontSize: 10, textTransform: "uppercase", letterSpacing: "0.08em", color: l.textColor, borderBottom: "2px solid #e0e7ff", background: l.bg }}>{l.label}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {criteria.map((crit, i) => (
                      <tr key={crit} style={{ background: i % 2 === 0 ? "#fff" : "#fafafa", borderBottom: i < criteria.length - 1 ? "1px solid #f0f0f0" : "none" }}>
                        <td style={{ padding: "10px 14px", fontWeight: 700, color: "#1e293b", fontSize: 12, borderRight: "1px solid #f0f0f0" }}>{crit}</td>
                        {LEVELS.map(l => (
                          <td key={l.label} style={{ padding: "10px 14px", color: "#374151", fontSize: 12, background: i % 2 === 0 ? l.bg.replace(")", ", 0.3)").replace("d1fae5", "#f0fdf4").replace("dbeafe", "#eff6ff").replace("fef3c7", "#fffbeb").replace("fee2e2", "#fef2f2") : "#fff" }}>{levelData[l.label][i] || "—"}</td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </SectionCard>
          ) : (
            <SectionCard accentColor="#6366f1">
              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                components={{
                  h1: ({ children }) => <h1 style={{ fontSize: 20, fontWeight: 900, margin: "0 0 12px", color: "#1e293b" }}>{children}</h1>,
                  h2: ({ children }) => <h2 style={{ fontSize: 16, fontWeight: 800, margin: "18px 0 10px", color: "#1e293b", borderBottom: "2px solid #e0e7ff", paddingBottom: 6 }}>{children}</h2>,
                  h3: ({ children }) => <h3 style={{ fontSize: 14, fontWeight: 700, margin: "14px 0 6px", color: "#374151" }}>{children}</h3>,
                  p: ({ children }) => <p style={{ margin: "6px 0", lineHeight: 1.8, fontSize: 14, color: "#475569" }}>{children}</p>,
                  table: ({ children }) => <div style={{ overflowX: "auto", margin: "10px 0", borderRadius: 10, border: "1px solid #e5e7eb", overflow: "hidden" }}><table style={{ width: "100%", borderCollapse: "collapse" }}>{children}</table></div>,
                  thead: ({ children }) => <thead style={{ background: "#f5f3ff" }}>{children}</thead>,
                  th: ({ children }) => <th style={{ padding: "8px 12px", color: "#6366f1", fontWeight: 700, fontSize: 11, textTransform: "uppercase", letterSpacing: "0.08em", borderBottom: "2px solid #e0e7ff" }}>{children}</th>,
                  td: ({ children }) => <td style={{ padding: "8px 12px", borderBottom: "1px solid #f0f0f0", fontSize: 13, color: "#374151" }}>{children}</td>,
                  tr: ({ children }) => <tr style={{ borderBottom: "1px solid #f0f0f0" }}>{children}</tr>,
                }}
              >{content}</ReactMarkdown>
            </SectionCard>
          )}

          {/* AC9 */}
          {ac9Codes.length > 0 && (
            <div style={{ background: "#f5f3ff", borderRadius: 12, padding: "12px 16px", display: "flex", flexWrap: "wrap", gap: 8, alignItems: "center" }}>
              <span style={{ fontSize: 10, fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.1em", color: "#6366f1", marginRight: 4 }}>AC9:</span>
              {ac9Codes.map(code => <AC9Pill key={code} code={code} />)}
            </div>
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
