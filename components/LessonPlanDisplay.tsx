"use client";

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

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

interface LessonPlanDisplayProps {
  content: string;
  onSave?: () => void;
  onDownloadTxt?: () => void;
  onDownloadPdf?: () => void;
  onDownloadDOCX?: () => void;
  onDownloadPPTX?: () => void;
  onSaveToGoogleDrive?: () => void;
  compact?: boolean;
}

export default function LessonPlanDisplay({ content, onSave, onDownloadTxt, onDownloadPdf, onDownloadDOCX, onDownloadPPTX, onSaveToGoogleDrive, compact }: LessonPlanDisplayProps) {
  const lines = content.split("\n");
  let title = "Lesson Plan";
  let walt = "";
  let tib = "";
  let wilf = "";
  const phases: { name: string; duration: string; teacher: string; students: string; resources: string; cfu: string }[] = [];
  let materials = "";
  let differentiation = "";
  let exitTicket = "";

  // Parse title
  const titleMatch = content.match(/^#\s+(.+?)\n/im);
  if (titleMatch) title = titleMatch[1].trim();

  // Parse WALT / TIB / WILF
  const waltMatch = content.match(/\*\*WALT[\s:]*\*\*(.+?)(?:\n|$)/i) || content.match(/WALT[\s:—]*(.+?)(?:\n|$)/i);
  const tibMatch = content.match(/\*\*TIB[\s:]*\*\*(.+?)(?:\n|$)/i) || content.match(/TIB[\s:—]*(.+?)(?:\n|$)/i);
  const wilfMatch = content.match(/\*\*WILF[\s:]*\*\*(.+?)(?:\n|$)/i) || content.match(/WILF[\s:—]*(.+?)(?:\n|$)/i);
  if (waltMatch) walt = waltMatch[1].replace(/^\s*[*_]+\s*/, "").trim();
  if (tibMatch) tib = tibMatch[1].replace(/^\s*[*_]+\s*/, "").trim();
  if (wilfMatch) wilf = wilfMatch[1].replace(/^\s*[*_]+\s*/, "").trim();

  // Parse AC9 codes
  const ac9Codes = content.match(/AC9\w{1,3}\d{1,2}-\d{2}/g) || [];

  // Parse phase table — look for rows with Duration | Teacher | Students | Resources | CFU
  const tableRows = content.match(/\|[^\n]+\|/g) || [];
  for (const row of tableRows) {
    const cells = row.split("|").map(c => c.replace(/[*#\n]/g, "").trim()).filter(c => c);
    if (cells.length >= 4 && (cells[0].match(/\d+\s*min/i) || cells[0].match(/Phase/i))) {
      phases.push({
        name: cells[0] || "",
        duration: cells[1] || "",
        teacher: cells[2] || "",
        students: cells[3] || "",
        resources: cells[4] || "",
        cfu: cells[5] || "",
      });
    }
  }

  // Parse Materials
  const matsMatch = content.match(/\*\*Materials?[\s:]*\*\*(.+?)[\s\S]*?(?:\n\n|\*\*|## )/i);
  if (matsMatch) materials = matsMatch[1].trim();

  // Parse Differentiation
  const diffMatch = content.match(/\*\*Differentiation[\s:]*\*\*(.+?)[\s\S]*?(?:\n\n|## |---)/i);
  if (diffMatch) differentiation = diffMatch[1].trim();

  // Parse Exit Ticket
  const exitMatch = content.match(/\*\*Exit Ticket[\s:]*\*\*(.+?)[\s\S]*?(?:\n\n|## )/i);
  if (exitMatch) exitTicket = exitMatch[1].trim();

  const cp = compact;
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
            {onDownloadPPTX && <button onClick={onDownloadPPTX} style={{ padding: "7px 16px", background: "#22D3EE", color: "#0a0a0a", border: "none", borderRadius: 24, fontSize: 12, fontWeight: 700, cursor: "pointer", boxShadow: "0 2px 8px rgba(0,0,0,0.15)" }}>📑 PPTX</button>}
            {onSaveToGoogleDrive && <button onClick={onSaveToGoogleDrive} style={{ padding: "7px 16px", background: "#1DB954", color: "#fff", border: "none", borderRadius: 24, fontSize: 12, fontWeight: 700, cursor: "pointer", boxShadow: "0 2px 8px rgba(0,0,0,0.15)", display: "inline-flex", alignItems: "center", gap: 6 }}>📁 Google Drive</button>}
          </div>
          <div style={{ display: "flex", alignItems: "flex-start", gap: 14, flexWrap: "wrap" }}>
            <div style={{ flex: 1 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
                <div style={{ background: "rgba(255,255,255,0.15)", borderRadius: 10, padding: "6px 10px", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
                </div>
                <div>
                  <div style={{ fontSize: 10, fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.15em", color: "rgba(255,255,255,0.6)", marginBottom: 3 }}>PickleNickAI</div>
                  <div style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", color: "rgba(255,255,255,0.5)" }}>Lesson Plan</div>
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

          {/* WALT / TIB / WILF */}
          {(walt || tib || wilf) && (
            <SectionCard accentColor="#6366f1">
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
                <div style={{ background: "#eef2ff", borderRadius: 8, padding: "6px 8px", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#6366f1" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                </div>
                <SectionLabel>Learning Intentions</SectionLabel>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {walt && (
                  <div style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
                    <span style={{ background: "#6366f1", color: "#fff", padding: "2px 10px", borderRadius: 20, fontSize: 10, fontWeight: 800, whiteSpace: "nowrap", minWidth: 60 }}>WALT</span>
                    <span style={{ fontSize: 14, color: "#1e293b", lineHeight: 1.6, fontWeight: 500 }}>{walt}</span>
                  </div>
                )}
                {tib && (
                  <div style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
                    <span style={{ background: "#8b5cf6", color: "#fff", padding: "2px 10px", borderRadius: 20, fontSize: 10, fontWeight: 800, whiteSpace: "nowrap", minWidth: 60 }}>TIB</span>
                    <span style={{ fontSize: 14, color: "#1e293b", lineHeight: 1.6, fontStyle: "italic" }}>{tib}</span>
                  </div>
                )}
                {wilf && (
                  <div style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
                    <span style={{ background: "#22d3ee", color: "#0a0a0a", padding: "2px 10px", borderRadius: 20, fontSize: 10, fontWeight: 800, whiteSpace: "nowrap", minWidth: 60 }}>WILF</span>
                    <span style={{ fontSize: 14, color: "#1e293b", lineHeight: 1.6 }}>{wilf}</span>
                  </div>
                )}
              </div>
            </SectionCard>
          )}

          {/* Phase Table */}
          {phases.length > 0 && (
            <SectionCard accentColor="#22d3ee">
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
                <div style={{ background: "#ecfeff", borderRadius: 8, padding: "6px 8px", fontSize: 15 }}>⏱️</div>
                <SectionLabel>Lesson Structure</SectionLabel>
              </div>
              <div style={{ borderRadius: 12, overflow: "hidden", border: "1px solid #e0e7ff", boxShadow: "0 1px 4px rgba(0,0,0,0.04)" }}>
                <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
                  <thead>
                    <tr style={{ background: "#f5f3ff" }}>
                      {["Phase", "Duration", "Teacher Does", "Students Do", "Resources", "CFU"].map(h => (
                        <th key={h} style={{ padding: "9px 12px", textAlign: "left", fontWeight: 700, fontSize: 10, textTransform: "uppercase", letterSpacing: "0.08em", color: "#6366f1", borderBottom: "2px solid #e0e7ff" }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {phases.slice(0, 12).map((row, i) => (
                      <tr key={i} style={{ background: i % 2 === 0 ? "#fff" : "#fafafa", borderBottom: i < Math.min(phases.length, 12) - 1 ? "1px solid #f0f0f0" : "none" }}>
                        <td style={{ padding: "10px 12px", fontWeight: 700, color: "#6366f1", fontSize: 12 }}>{row.name}</td>
                        <td style={{ padding: "10px 12px", color: "#1e293b", fontSize: 12, fontWeight: 600 }}>{row.duration}</td>
                        <td style={{ padding: "10px 12px", color: "#374151", fontSize: 12 }}>{row.teacher}</td>
                        <td style={{ padding: "10px 12px", color: "#374151", fontSize: 12 }}>{row.students}</td>
                        <td style={{ padding: "10px 12px", color: "#374151", fontSize: 12 }}>{row.resources}</td>
                        <td style={{ padding: "10px 12px", color: "#7c3aed", fontSize: 12 }}>{row.cfu}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </SectionCard>
          )}

          {/* Materials */}
          {materials && (
            <SectionCard accentColor="#f59e0b">
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
                <div style={{ background: "#fef3c7", borderRadius: 8, padding: "6px 8px", fontSize: 15 }}>📦</div>
                <SectionLabel>Materials</SectionLabel>
              </div>
              <div style={{ background: "#fffbeb", borderRadius: 10, padding: "14px 16px" }}>
                <ReactMarkdown remarkPlugins={[remarkGfm]}>{materials}</ReactMarkdown>
              </div>
            </SectionCard>
          )}

          {/* Differentiation */}
          {differentiation && (
            <SectionCard accentColor="#10b981">
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
                <div style={{ background: "#d1fae5", borderRadius: 8, padding: "6px 8px", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                </div>
                <SectionLabel>Differentiation</SectionLabel>
              </div>
              <div style={{ background: "#f0fdf4", borderRadius: 10, padding: "14px 16px" }}>
                <ReactMarkdown remarkPlugins={[remarkGfm]}>{differentiation}</ReactMarkdown>
              </div>
            </SectionCard>
          )}

          {/* Exit Ticket */}
          {exitTicket && (
            <SectionCard accentColor="#ec4899">
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
                <div style={{ background: "#fce7f3", borderRadius: 8, padding: "6px 8px", fontSize: 15 }}>🎫</div>
                <SectionLabel>Exit Ticket</SectionLabel>
              </div>
              <div style={{ background: "#fdf2f8", borderRadius: 10, padding: "14px 16px" }}>
                <ReactMarkdown remarkPlugins={[remarkGfm]}>{exitTicket}</ReactMarkdown>
              </div>
            </SectionCard>
          )}

          {/* AC9 Codes strip */}
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
