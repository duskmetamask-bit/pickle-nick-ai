"use client";
import { useState, useRef, useEffect } from "react";

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

function isStructuredContent(content: string): boolean {
  const indicators = ["WALT", "TIB", "WILF", "Lesson Plan", "Assessment", "Rubric", "Learning Intention", "Success Criteria", "AC9", "Hot Task", "Cold Task", "Exit Ticket", "Phase | Duration", "Duration", "Overview", "Tuning In", "Reflection", "Introduction", "Explicit Teaching", "Conclusion"];
  return indicators.some(ind => content.includes(ind));
}

// ─── LessonPlanDisplay ───────────────────────────────────────────────────────

function parseLessonPlan(raw: string) {
  if (!raw) return null;

  const titleMatch = raw.match(/(?:Lesson\s*Plan[\s\n]*)?(Year\s*\d[\s\w\u2013\u2014]*)/i);
  const title = titleMatch ? titleMatch[1].trim() : "Lesson Plan";

  const durMatch = raw.match(/(\d+)\s*min/i);
  const duration = durMatch ? durMatch[1] + " min" : "";

  const typeMatch = raw.match(/(Explicit\s*Teaching|Inquiry[- ]Based|Guided\s*Practice|Independent\s*Task|Flipped\s*Classroom)/i);
  const lessonType = typeMatch ? typeMatch[1] : "";

  const ac9Codes = raw.match(/AC9\w{1,3}\d{1,2}-\d{2}/g) || [];

  const waltMatch = raw.match(/(?:WALT[:\s]+)([\s\S]*?)(?=TIB|\n\n|$)/i);
  const walt = waltMatch ? waltMatch[1].replace(/\*\*/g, "").trim() : "";

  const tibMatch = raw.match(/(?:TIB[:\s]+|Purpose[\s:]+)([\s\S]*?)(?=Success|WILF|\n\n|WALT|$)/i);
  const tib = tibMatch ? tibMatch[1].replace(/\*\*/g, "").trim() : "";

  const wilfSection = raw.match(/(?:WILF[:\s]*|Success\s*Criteria[:\s]*)([\s\S]*?)(?=Phase|Materials|Resources|Differentiation|Exit|\n\n)/i);
  const wilfItems = wilfSection
    ? wilfSection[1].split(/[\n•\-\*]/)
        .map(l => l.replace(/\*\*/g, "").trim())
        .filter(l => l && l.length > 3)
    : [];

  const phases: { name: string; time: string; teacher: string; students: string }[] = [];
  const phaseBlocks = raw.match(/(?:Phase|Timing|Input|Process|Activity)[\s\S]{0,40}?(?:Hook|Tuning\s*In|I\s*Do|We\s*Do|You\s*Do|Plenary|Conclusion|Explicit|Guided|Independent|Reflection)[\s\S]{0,200}?(?=\n\n|Materials|Resources|Differentiation|Exit|$)/gi) || [];
  const phaseNames = ["Hook", "Tuning In", "I Do", "We Do", "You Do", "Plenary", "Conclusion", "Explicit Teaching", "Guided Practice", "Independent", "Reflection"];
  for (const block of phaseBlocks) {
    for (const pname of phaseNames) {
      if (block.toLowerCase().includes(pname.toLowerCase())) {
        const timeM = block.match(/(\d+)\s*min/);
        const teacherM = block.match(/(?:Teacher[:\s]*|Teacher's\s*Role[:\s]*)([^\n\-]{3,30})/i);
        const studentM = block.match(/(?:Students?[:\s]*|Students?'\s*Role[:\s]*)([^\n\-]{3,30})/i);
        phases.push({ name: pname, time: timeM ? timeM[1] + " min" : "", teacher: teacherM ? teacherM[1].trim() : "", students: studentM ? studentM[1].trim() : "" });
        break;
      }
    }
  }

  const matSection = raw.match(/(?:Materials|Resources)[:\s]*\n?([\s\S]*?)(?=Differentiation|Exit|Success|$)/i);
  const materials: string[] = [];
  if (matSection) {
    matSection[1].split(/[\n•\-\*]/).forEach(l => {
      const t = l.replace(/\*\*/g, "").trim();
      if (t && t.length > 2) materials.push(t);
    });
  }

  const diffEAL = raw.match(/(?:EAL|ESL)[\s:]*([^\n\-]{10,200})/i);
  const diffExt = raw.match(/(?:Extension|Gifted|Accelerate)[\s:]*([^\n\-]{10,200})/i);
  const diffSupport = raw.match(/(?:Support|Additional)[\s:]*([^\n\-]{10,200})/i);

  const exitMatch = raw.match(/(?:Exit\s*Ticket|Exit\s*Slip)[:\s]*([^\n]{10,200})/i);
  const exitTicket = exitMatch ? exitMatch[1].replace(/\*\*/g, "").trim() : "";

  return { title, duration, lessonType, ac9Codes, walt, tib, wilfItems, phases, materials, diffEAL: diffEAL ? diffEAL[1].trim() : "", diffExt: diffExt ? diffExt[1].trim() : "", diffSupport: diffSupport ? diffSupport[1].trim() : "", exitTicket };
}

function AC9Pill({ code }: { code: string }) {
  return (
    <span style={{
      display: "inline-block",
      background: "#6366f1",
      color: "#fff",
      padding: "2px 10px",
      borderRadius: 20,
      fontSize: 10,
      fontWeight: 700,
      letterSpacing: "0.04em",
      fontFamily: "monospace",
    }}>
      {code}
    </span>
  );
}

// Premium section card with left accent border
function SectionCard({ accentColor, children, style }: { accentColor: string; children: React.ReactNode; style?: React.CSSProperties }) {
  return (
    <div style={{
      background: "#fff",
      borderRadius: 14,
      boxShadow: "0 2px 12px rgba(0,0,0,0.06)",
      border: "1px solid #f0f0f0",
      borderLeft: `4px solid ${accentColor}`,
      padding: "20px 24px",
      marginBottom: 14,
      ...style,
    }}>
      {children}
    </div>
  );
}

// Section label — premium style
function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div style={{
      fontSize: 10,
      fontWeight: 800,
      textTransform: "uppercase",
      letterSpacing: "0.12em",
      color: "#6366f1",
      marginBottom: 10,
    }}>
      {children}
    </div>
  );
}

function PhaseIcon({ name }: { name: string }) {
  const icons: Record<string, string> = {
    "Hook": "H", "Tuning In": "T", "I Do": "1", "We Do": "2", "You Do": "3",
    "Plenary": "P", "Conclusion": "C", "Explicit Teaching": "E", "Guided Practice": "G",
    "Independent": "I", "Reflection": "R",
  };
  return <span style={{ fontSize: 12, fontWeight: 700, color: "var(--text-3)" }}>{icons[name] || "L"}</span>;
}

function LessonPlanDisplay({ content, onSave, onDownload }: { content: string; onSave?: () => void; onDownload?: (fmt: "txt" | "pdf" | "pptx" | "docx" | "google-docs") => void }) {
  const parsed = parseLessonPlan(content);
  const hasContent = parsed && (parsed.walt || parsed.phases.length > 0 || parsed.materials.length > 0);

  if (!hasContent) {
    return (
      <div style={{
        whiteSpace: "pre-wrap",
        fontFamily: "'Courier New', monospace",
        fontSize: 13,
        lineHeight: 1.8,
        color: "#374151",
        background: "#fff",
        border: "1px solid #e5e7eb",
        borderRadius: 16,
        padding: "24px",
        boxShadow: "0 4px 24px rgba(0,0,0,0.06)",
      }}>
        {content}
      </div>
    );
  }

  return (
    <div style={{ fontFamily: "'Inter', system-ui, -apple-system, sans-serif", maxWidth: 800, margin: "0 auto" }}>

      {/* ── Document Card ─────────────────────────────────────────── */}
      <div style={{
        background: "#fff",
        borderRadius: 20,
        boxShadow: "0 4px 24px rgba(0,0,0,0.08)",
        overflow: "hidden",
      }}>

        {/* ── HEADER ───────────────────────────────────────────── */}
        <div style={{
          background: "linear-gradient(135deg, #1e1b4b 0%, #312e81 100%)",
          padding: "28px 32px 24px",
        }}>
          {/* Toolbar row */}
          <div style={{ display: "flex", justifyContent: "flex-end", gap: 8, marginBottom: 20 }}>
            {onSave && (
              <button
                onClick={onSave}
                data-save-btn
                style={{
                  display: "inline-flex", alignItems: "center", gap: 6,
                  padding: "7px 16px",
                  background: "rgba(255,255,255,0.12)",
                  color: "#fff",
                  border: "1px solid rgba(255,255,255,0.25)",
                  borderRadius: 24,
                  fontSize: 12, fontWeight: 600,
                  cursor: "pointer",
                  backdropFilter: "blur(8px)",
                  transition: "all 0.15s",
                }}
              >
                Save
              </button>
            )}
            {onDownload && (
              <>
                <button
                  onClick={() => onDownload("txt")}
                  style={{ padding: "7px 16px", background: "rgba(255,255,255,0.12)", color: "#fff", border: "1px solid rgba(255,255,255,0.25)", borderRadius: 24, fontSize: 12, fontWeight: 600, cursor: "pointer", backdropFilter: "blur(8px)" }}
                >
                  TXT
                </button>
                <button
                  onClick={() => onDownload("pdf")}
                  style={{ padding: "7px 16px", background: "#fff", color: "#312e81", border: "none", borderRadius: 24, fontSize: 12, fontWeight: 700, cursor: "pointer", boxShadow: "0 2px 8px rgba(0,0,0,0.15)" }}
                >
                  PDF
                </button>
                <button
                  onClick={() => onDownload("pptx")}
                  style={{ padding: "7px 16px", background: "#22D3EE", color: "#0a0a0a", border: "none", borderRadius: 24, fontSize: 12, fontWeight: 700, cursor: "pointer", boxShadow: "0 2px 8px rgba(0,0,0,0.15)" }}
                >
                  📑 PPTX
                </button>
                <button
                  onClick={() => onDownload("docx")}
                  style={{ padding: "7px 16px", background: "#4F46E5", color: "#fff", border: "none", borderRadius: 24, fontSize: 12, fontWeight: 700, cursor: "pointer", boxShadow: "0 2px 8px rgba(0,0,0,0.15)" }}
                >
                  DOCX
                </button>
                <button
                  onClick={() => onDownload("google-docs")}
                  style={{ padding: "7px 16px", background: "#4285F4", color: "#fff", border: "none", borderRadius: 24, fontSize: 12, fontWeight: 700, cursor: "pointer", boxShadow: "0 2px 8px rgba(0,0,0,0.15)", display: "flex", alignItems: "center", gap: 5 }}
                >
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><path d="M6 18h12v-2H6v2zm0-6h12v-2H6v2zm0-8v2h12V4H6z"/></svg>
                  Google Docs
                </button>
              </>
            )}
          </div>

          {/* Title + meta */}
          <div style={{ display: "flex", alignItems: "flex-start", gap: 16, flexWrap: "wrap" }}>
            <div style={{ flex: 1 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
                <div style={{ background: "rgba(255,255,255,0.15)", borderRadius: 10, padding: "6px 10px", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
                </div>
                <div>
                  <div style={{ fontSize: 10, fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.15em", color: "rgba(255,255,255,0.6)", marginBottom: 3 }}>
                    PickleNickAI
                  </div>
                  <div style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", color: "rgba(255,255,255,0.5)" }}>
                    Lesson Plan
                  </div>
                </div>
              </div>
              <h2 style={{ fontSize: 22, fontWeight: 800, color: "#fff", margin: 0, lineHeight: 1.3, letterSpacing: "-0.02em" }}>
                {parsed.title}
              </h2>
            </div>

            {/* Meta badges */}
            <div style={{ display: "flex", flexDirection: "column", gap: 8, alignItems: "flex-end" }}>
              {parsed.duration && (
                <div style={{ background: "rgba(255,255,255,0.12)", border: "1px solid rgba(255,255,255,0.2)", borderRadius: 20, padding: "4px 12px", display: "flex", alignItems: "center", gap: 5 }}>
                  <span style={{ fontSize: 13 }}>⏱️</span>
                  <span style={{ fontSize: 12, fontWeight: 600, color: "#fff" }}>{parsed.duration}</span>
                </div>
              )}
              {parsed.lessonType && (
                <div style={{ background: "rgba(255,255,255,0.12)", border: "1px solid rgba(255,255,255,0.2)", borderRadius: 20, padding: "4px 12px", display: "flex", alignItems: "center", gap: 5 }}>
                  <span style={{ fontSize: 13 }}>📐</span>
                  <span style={{ fontSize: 12, fontWeight: 600, color: "#fff" }}>{parsed.lessonType}</span>
                </div>
              )}
              <div style={{ display: "flex", flexWrap: "wrap", gap: 5, justifyContent: "flex-end" }}>
                {parsed.ac9Codes.slice(0, 4).map(code => (
                  <AC9Pill key={code} code={code} />
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* ── BODY ─────────────────────────────────────────────── */}
        <div style={{ padding: "28px 32px" }}>

          {/* Learning Intention */}
          {(parsed.walt || parsed.tib) && (
            <SectionCard accentColor="#6366f1">
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
                <div style={{ background: "#eef2ff", borderRadius: 8, padding: "6px 8px", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#6366f1" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                </div>
                <SectionLabel>Learning Intention</SectionLabel>
              </div>

              {parsed.walt && (
                <div style={{ marginBottom: parsed.tib ? 12 : 0 }}>
                  <div style={{ display: "flex", alignItems: "flex-start", gap: 10 }}>
                    <div style={{
                      background: "#eef2ff",
                      color: "#4338ca",
                      fontSize: 10, fontWeight: 800,
                      textTransform: "uppercase",
                      letterSpacing: "0.1em",
                      padding: "3px 10px",
                      borderRadius: 20,
                      whiteSpace: "nowrap",
                      flexShrink: 0,
                      marginTop: 2,
                    }}>WALT</div>
                    <p style={{ fontSize: 15, lineHeight: 1.7, color: "#1e293b", margin: 0 }}>
                      {parsed.walt}
                    </p>
                  </div>
                </div>
              )}

              {parsed.tib && (
                <div style={{ display: "flex", alignItems: "flex-start", gap: 10 }}>
                  <div style={{
                    background: "#eef2ff",
                    color: "#4338ca",
                    fontSize: 10, fontWeight: 800,
                    textTransform: "uppercase",
                    letterSpacing: "0.1em",
                    padding: "3px 10px",
                    borderRadius: 20,
                    whiteSpace: "nowrap",
                    flexShrink: 0,
                    marginTop: 2,
                  }}>TIB</div>
                  <p style={{ fontSize: 14, lineHeight: 1.7, color: "#475569", margin: 0, fontStyle: "italic" }}>
                    {parsed.tib}
                  </p>
                </div>
              )}
            </SectionCard>
          )}

          {/* Success Criteria / WILF */}
          {parsed.wilfItems.length > 0 && (
            <SectionCard accentColor="#22c55e">
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
                <div style={{ background: "#f0fdf4", borderRadius: 8, padding: "6px 8px", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                </div>
                <SectionLabel>Success Criteria — What I'm Looking For</SectionLabel>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {parsed.wilfItems.slice(0, 8).map((item, i) => (
                  <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: 12 }}>
                    <div style={{
                      width: 22, height: 22, borderRadius: 6,
                      background: "#f0fdf4",
                      border: "2px solid #22c55e",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      flexShrink: 0, marginTop: 1,
                      fontSize: 11, color: "#22c55e", fontWeight: 800,
                    }}>
                      ✓
                    </div>
                    <span style={{ fontSize: 14, lineHeight: 1.7, color: "#1e293b" }}>
                      {item.replace(/^\s*[-•*]\s*/, "")}
                    </span>
                  </div>
                ))}
              </div>
            </SectionCard>
          )}

          {/* Lesson Structure / Phase Table */}
          {parsed.phases.length > 0 && (
            <SectionCard accentColor="#f59e0b">
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
                <div style={{ background: "#fef3c7", borderRadius: 8, padding: "6px 8px", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
                </div>
                <SectionLabel>Lesson Structure</SectionLabel>
              </div>
              <div style={{ borderRadius: 12, overflow: "hidden", border: "1px solid #f0f0f0", boxShadow: "0 1px 4px rgba(0,0,0,0.04)" }}>
                <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
                  <thead>
                    <tr style={{ background: "#f5f3ff" }}>
                      {["Phase", "Duration", "Teacher", "Students"].map((h, i) => (
                        <th key={h} style={{
                          padding: "10px 16px",
                          textAlign: "left",
                          fontWeight: 700,
                          fontSize: 10,
                          textTransform: "uppercase",
                          letterSpacing: "0.1em",
                          color: "#6366f1",
                          borderBottom: "2px solid #e0e7ff",
                          ...(i === 0 ? { width: 130 } : {}),
                        }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {parsed.phases.map((p, i) => (
                      <tr key={i} style={{
                        background: i % 2 === 0 ? "#fff" : "#fafafa",
                        borderBottom: i < parsed.phases.length - 1 ? "1px solid #f0f0f0" : "none",
                      }}>
                        <td style={{ padding: "12px 16px" }}>
                          <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
                            <PhaseIcon name={p.name} />
                            <span style={{ fontWeight: 700, color: "#1e293b", fontSize: 13 }}>{p.name}</span>
                          </div>
                        </td>
                        <td style={{ padding: "12px 16px" }}>
                          <span style={{
                            background: "#fef3c7",
                            color: "#92400e",
                            fontWeight: 700,
                            fontSize: 11,
                            padding: "2px 8px",
                            borderRadius: 12,
                          }}>
                            {p.time || "—"}
                          </span>
                        </td>
                        <td style={{ padding: "12px 16px", color: "#475569", fontSize: 13 }}>{p.teacher || "—"}</td>
                        <td style={{ padding: "12px 16px", color: "#475569", fontSize: 13 }}>{p.students || "—"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </SectionCard>
          )}

          {/* Materials */}
          {parsed.materials.length > 0 && (
            <SectionCard accentColor="#f97316">
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
                <div style={{ background: "#fff7ed", borderRadius: 8, padding: "6px 8px", fontSize: 16 }}>📦</div>
                <SectionLabel>Resources & Materials</SectionLabel>
              </div>
              <div style={{
                background: "#fff7ed",
                borderRadius: 12,
                padding: "14px 18px",
                display: "flex",
                flexWrap: "wrap",
                gap: 8,
              }}>
                {parsed.materials.slice(0, 10).map((m, i) => (
                  <div key={i} style={{
                    background: "#fff",
                    border: "1px solid #fed7aa",
                    borderRadius: 8,
                    padding: "5px 12px",
                    fontSize: 13,
                    color: "#9a3412",
                    display: "flex",
                    alignItems: "center",
                    gap: 6,
                  }}>
                    <span style={{ fontSize: 12 }}>•</span>
                    {m}
                  </div>
                ))}
              </div>
            </SectionCard>
          )}

          {/* Differentiation */}
          {(parsed.diffEAL || parsed.diffExt || parsed.diffSupport) && (
            <SectionCard accentColor="#8b5cf6">
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
                <div style={{ background: "#ede9fe", borderRadius: 8, padding: "6px 8px", fontSize: 16 }}>💡</div>
                <SectionLabel>Differentiation</SectionLabel>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {parsed.diffEAL && (
                  <div style={{ background: "#ede9fe", borderRadius: 12, padding: "14px 18px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
                      <span style={{ fontSize: 16 }}>🌍</span>
                      <span style={{ fontWeight: 800, fontSize: 11, textTransform: "uppercase", letterSpacing: "0.1em", color: "#7c3aed" }}>EAL / ESL Learners</span>
                    </div>
                    <p style={{ fontSize: 14, lineHeight: 1.7, color: "#4c1d95", margin: 0 }}>{parsed.diffEAL}</p>
                  </div>
                )}
                {parsed.diffExt && (
                  <div style={{ background: "#fef3c7", borderRadius: 12, padding: "14px 18px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
                      <span style={{ fontSize: 16 }}>🚀</span>
                      <span style={{ fontWeight: 800, fontSize: 11, textTransform: "uppercase", letterSpacing: "0.1em", color: "#b45309" }}>Extension / Gifted</span>
                    </div>
                    <p style={{ fontSize: 14, lineHeight: 1.7, color: "#92400e", margin: 0 }}>{parsed.diffExt}</p>
                  </div>
                )}
                {parsed.diffSupport && (
                  <div style={{ background: "#cffafe", borderRadius: 12, padding: "14px 18px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
                      <span style={{ fontSize: 16 }}>💛</span>
                      <span style={{ fontWeight: 800, fontSize: 11, textTransform: "uppercase", letterSpacing: "0.1em", color: "#0e7490" }}>Additional Support</span>
                    </div>
                    <p style={{ fontSize: 14, lineHeight: 1.7, color: "#155e75", margin: 0 }}>{parsed.diffSupport}</p>
                  </div>
                )}
              </div>
            </SectionCard>
          )}

          {/* Exit Ticket */}
          {parsed.exitTicket && (
            <SectionCard accentColor="#ef4444">
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
                <div style={{ background: "#fef2f2", borderRadius: 8, padding: "6px 8px", fontSize: 16 }}>🚪</div>
                <SectionLabel>Exit Ticket</SectionLabel>
              </div>
              <div style={{
                background: "#fef2f2",
                borderRadius: 12,
                padding: "16px 20px",
                border: "1px solid #fecaca",
              }}>
                <p style={{
                  fontSize: 15,
                  lineHeight: 1.7,
                  color: "#991b1b",
                  margin: 0,
                  fontStyle: "italic",
                  fontWeight: 500,
                }}>
                  "{parsed.exitTicket}"
                </p>
              </div>
            </SectionCard>
          )}
        </div>

        {/* ── FOOTER ───────────────────────────────────────────── */}
        <div style={{
          borderTop: "1px solid #f0f0f0",
          padding: "12px 32px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          background: "#fafafa",
        }}>
          <span style={{ fontSize: 11, color: "#9ca3af", fontWeight: 600 }}>
            Generated by PickleNickAI
          </span>
          <span style={{ fontSize: 11, color: "#d1d5db" }}>
            {new Date().toLocaleDateString("en-AU", { day: "numeric", month: "long", year: "numeric" })}
          </span>
        </div>
      </div>
    </div>
  );
}

// ─── PlannerView ──────────────────────────────────────────────────────────────

interface ChatMessage { role: "user" | "assistant"; content: string; streaming?: boolean; }

function savePlanToProfile(content: string, label: string) {
  const savedDocs = JSON.parse(localStorage.getItem("pn-saved-docs") || "[]");
  savedDocs.unshift({ id: Date.now().toString(36), type: "lesson", label, content, savedAt: Date.now() });
  localStorage.setItem("pn-saved-docs", JSON.stringify(savedDocs.slice(0, 50)));
  const btns = document.querySelectorAll(`[data-save-btn]`);
  btns.forEach(b => { const el = b as HTMLElement; el.textContent = "✓ Saved"; el.style.color = "var(--success)"; setTimeout(() => { el.textContent = "Save"; el.style.color = ""; }, 1500); });
}

function downloadChatPlanTxt(content: string) {
  const blob = new Blob([content], { type: "text/plain" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a"); a.href = url; a.download = `LessonPlan_${new Date().toISOString().slice(0,10)}.txt`; a.click();
  URL.revokeObjectURL(url);
}

async function downloadChatPlanPdf(content: string) {
  try {
    const res = await fetch("/api/export/chat-to-pdf", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ content, label: "LessonPlan" }) });
    if (!res.ok) throw new Error();
    const blob = await res.blob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href = url; a.download = `LessonPlan_${new Date().toISOString().slice(0,10)}.pdf`; a.click();
    URL.revokeObjectURL(url);
  } catch { alert("PDF export failed"); }
}

async function downloadChatPlanPPTX(content: string) {
  try {
    const res = await fetch("/api/export/pptx", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ content, title: "LessonPlan" }) });
    if (!res.ok) throw new Error();
    const blob = await res.blob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href = url; a.download = `LessonPlan_${new Date().toISOString().slice(0,10)}.pptx`; a.click();
    URL.revokeObjectURL(url);
  } catch { alert("PPTX export failed"); }
}

async function downloadChatPlanDOCX(content: string) {
  try {
    const res = await fetch("/api/export/docx", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ content, title: "LessonPlan" }) });
    if (!res.ok) throw new Error();
    const blob = await res.blob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href = url; a.download = `LessonPlan_${new Date().toISOString().slice(0,10)}.docx`; a.click();
    URL.revokeObjectURL(url);
  } catch { alert("DOCX export failed"); }
}

async function downloadChatPlanGoogleDocs(content: string, label = "LessonPlan") {
  try {
    const token = localStorage.getItem("pn_gdrive_access_token");
    const refreshToken = localStorage.getItem("pn_gdrive_refresh_token");

    if (!token && !refreshToken) {
      // Trigger OAuth flow via popup
      const width = 600, height = 700;
      const left = window.screenX + (window.outerWidth - width) / 2;
      const top = window.screenY + (window.outerHeight - height) / 2;
      const popup = window.open(
        `/api/auth/google?redirect=popup`,
        "google_auth",
        `width=${width},height=${height},left=${left},top=${top},toolbar=no,menubar=no`
      );

      const done = new Promise<string>((resolve, reject) => {
        const handler = (e: MessageEvent) => {
          if (e.data?.type === "gdrive_connected") {
            cleanup();
            resolve("connected");
          }
        };
        const poll = setInterval(() => {
          if (!popup || popup.closed) { cleanup(); reject(new Error("Popup closed")); }
        }, 500);
        const cleanup = () => { window.removeEventListener("message", handler); clearInterval(poll); };
        window.addEventListener("message", handler);
      });

      try { await done; } catch { alert("Google authorization failed. Please try again."); return; }
      return downloadChatPlanGoogleDocs(content, label);
    }

    const res = await fetch("/api/export/google-docs", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content, title: label, accessToken: token, refreshToken }),
    });

    if (res.status === 401) {
      // Token expired — clear and retry
      localStorage.removeItem("pn_gdrive_access_token");
      localStorage.removeItem("pn_gdrive_refresh_token");
      return downloadChatPlanGoogleDocs(content, label);
    }

    const data = await res.json();
    if (data.needsAuth) {
      // Redirect to Google OAuth
      window.open(data.authUrl, "_blank");
      return;
    }
    if (data.documentUrl) {
      // Open Google Docs link in new tab
      window.open(data.documentUrl, "_blank");
    } else {
      alert("Google Docs export failed. Please try again.");
    }
  } catch { alert("Google Docs export failed"); }
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

  const [diffLoading, setDiffLoading] = useState(false);
  const [diffOpen, setDiffOpen] = useState(false);
  const [diffTab, setDiffTab] = useState<"eal" | "gifted" | "additional">("eal");
  const [diffVersions, setDiffVersions] = useState<{ eal: string; gifted: string; additional: string }>({ eal: "", gifted: "", additional: "" });

  const [chatInput, setChatInput] = useState("");
  const [isChatStreaming, setIsChatStreaming] = useState(false);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const chatBottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => { chatBottomRef.current?.scrollIntoView({ behavior: "smooth" }); }, [chatMessages]);

  function sendChatMessage() {
    const text = chatInput.trim();
    if (!text || isChatStreaming) return;
    const profile = { name: localStorage.getItem("pn-name") || "Teacher", yearLevels: [], subjects: [], focusAreas: [] };
    const userMsg: ChatMessage = { role: "user", content: text };
    setChatMessages(m => [...m, userMsg]);
    setChatInput("");
    const assistantMsg: ChatMessage = { role: "assistant", content: "", streaming: true };
    setChatMessages(m => [...m, assistantMsg]);
    setIsChatStreaming(true);
    fetch("/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        messages: [...chatMessages, userMsg],
        sessionId: localStorage.getItem("pn-chat-session") || Date.now().toString(36),
        profile,
        systemHint: "You are a lesson planning expert. The teacher is asking for a lesson plan. Generate a detailed, AC9-aligned lesson plan with WALT/TIB/WILF, phases (Tuning In, Explicit Teaching, etc.), duration estimates, resources, and assessment. Use the same format as a form-generated lesson plan.",
      }),
    })
      .then(res => {
        if (!res.body) throw new Error("No response body");
        const reader = res.body.getReader();
        const decoder = new TextDecoder();
        function processChunk() {
          reader.read().then(({ done, value }) => {
            if (done) { setIsChatStreaming(false); setChatMessages(m => m.map(msg => ({ ...msg, streaming: false }))); return; }
            const chunk = decoder.decode(value, { stream: true });
            const lines = chunk.split("\n");
            let accumulated = "";
            for (const line of lines) {
              if (line.startsWith("data: ")) {
                try {
                  const parsed = JSON.parse(line.slice(6));
                  if (parsed.type === "text") accumulated += parsed.content;
                  else if (parsed.type === "done" || parsed.type === "error") { setIsChatStreaming(false); setChatMessages(m => m.map(msg => ({ ...msg, streaming: false }))); return; }
                } catch {}
              }
            }
            if (accumulated) setChatMessages(m => { const last = m[m.length - 1]; if (last?.streaming) return [...m.slice(0, -1), { ...last, content: last.content + accumulated }]; return m; });
            processChunk();
          }).catch(() => { setIsChatStreaming(false); setChatMessages(m => m.map(msg => ({ ...msg, streaming: false }))); });
        }
        processChunk();
      })
      .catch(() => { setChatMessages(m => [...m.slice(0, -1), { role: "user", content: text }, { role: "assistant", content: "Sorry — something went wrong. Please try again.", streaming: false }]); setIsChatStreaming(false); });
  }

  async function generate() {
    if (!topic.trim()) { setError("Please enter a topic"); return; }
    setError(""); setLoading(true); setResult(""); setFeedback(null); setDiffVersions({ eal: "", gifted: "", additional: "" }); setDiffOpen(false);
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

  async function generateDifferentiations() {
    if (!result) return;
    setDiffLoading(true);
    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ subject, yearLevel, topic, duration, lessonType, objectives, differentiate: true, originalPlan: result }),
      });
      const data = await res.json();
      if (data.diffVersions) { setDiffVersions(data.diffVersions); setDiffOpen(true); setDiffTab("eal"); logUsage("lesson-plan", "differentiate", `${subject} ${yearLevel} ${topic}`); }
    } catch { /* silent fail */ }
    finally { setDiffLoading(false); }
  }

  function download(format: "txt" | "pdf" | "pptx" | "docx" | "google-docs", content?: string) {
    if (format === "google-docs") {
      downloadChatPlanGoogleDocs(content || result, `LessonPlan_${subject}_${yearLevel}`);
      return;
    }
    const text = content || result;
    if (!text) return;
    logUsage("lesson-plan", "export", `${format} ${subject} ${yearLevel} ${topic}`);
    if (format === "txt") {
      const blob = new Blob([text], { type: "text/plain" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a"); a.href = url;
      a.download = `LessonPlan_${subject}_${yearLevel}_${topic.slice(0, 20)}.txt`; a.click();
      URL.revokeObjectURL(url);
    } else {
      const endpoint = format === "pdf" ? "chat-to-pdf" : format;
      fetch(`/api/export/${endpoint}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: text, title: `LessonPlan_${subject}_${yearLevel}` }),
      })
        .then(res => { if (!res.ok) throw new Error(`${format.toUpperCase()} export failed`); return res.blob(); })
        .then(blob => {
          const url = URL.createObjectURL(blob);
          const a = document.createElement("a"); a.href = url;
          a.download = `LessonPlan_${subject}_${yearLevel}_${topic.slice(0, 20)}.${format === "docx" ? "docx" : format === "pptx" ? "pptx" : "pdf"}`; a.click();
          URL.revokeObjectURL(url);
        })
        .catch((err) => {
          alert(err instanceof Error ? err.message : "Export failed — try TXT instead");
          const blob = new Blob([text], { type: "text/plain" });
          const url = URL.createObjectURL(blob);
          const a = document.createElement("a"); a.href = url;
          a.download = `LessonPlan_${subject}_${yearLevel}_${topic.slice(0, 20)}.txt`; a.click();
          URL.revokeObjectURL(url);
        });
    }
  }

  function handleFeedback(f: "good" | "bad") {
    setFeedback(f);
    logFeedback("lesson-plan", f, `${subject} ${yearLevel} ${topic}`);
  }

  function savePlan() {
    if (!result) return;
    const savedDocs = JSON.parse(localStorage.getItem("pn-saved-docs") || "[]");
    savedDocs.unshift({ id: Date.now().toString(36), type: "lesson", label: `Lesson Plan — ${subject} ${yearLevel} ${topic}`, content: result, savedAt: Date.now() });
    localStorage.setItem("pn-saved-docs", JSON.stringify(savedDocs.slice(0, 50)));
    const btns = document.querySelectorAll(`[data-save-btn]`);
    btns.forEach(b => { const el = b as HTMLElement; el.textContent = "✓ Saved"; el.style.color = "var(--success)"; setTimeout(() => { el.textContent = "Save"; el.style.color = ""; }, 1500); });
  }

  const inputStyle: React.CSSProperties = {
    width: "100%", padding: "10px 14px",
    background: "var(--surface)", color: "var(--text)",
    border: "1px solid var(--border-subtle)",
    borderRadius: "var(--radius)", fontSize: 14, outline: "none",
    transition: "border-color 0.15s",
  };

  const DIFF_TABS = [
    { id: "eal" as const, label: "🌍 EAL / ESL", color: "#7c3aed" },
    { id: "gifted" as const, label: "🚀 Extension / Gifted", color: "#b45309" },
    { id: "additional" as const, label: "💛 Additional Needs", color: "#0e7490" },
  ];

  const diffLabel: Record<string, string> = { eal: "EAL Version", gifted: "Extension Version", additional: "Additional Needs Version" };

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg)" }}>
      <div style={{ padding: "20px 28px", borderBottom: "1px solid var(--border-subtle)", display: "flex", alignItems: "center", gap: 12 }}>
        <div style={{ width: 36, height: 36, borderRadius: 10, background: "var(--primary-dim)", border: "1px solid rgba(99,102,241,0.2)", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--primary-hover)", fontSize: 16 }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
          </svg>
        </div>
        <div>
          <h1 style={{ fontSize: 18, fontWeight: 800, letterSpacing: "-0.01em", marginBottom: 2 }}>Lesson Planner</h1>
          <p style={{ color: "var(--text-2)", fontSize: 12 }}>Generate AC9-aligned lesson plans in seconds</p>
        </div>
      </div>

      {/* AI Chat Input */}
      <div style={{ padding: "14px 28px", borderBottom: "1px solid var(--border-subtle)", background: "var(--bg)" }}>
        <div style={{ display: "flex", gap: 8, marginBottom: chatMessages.length > 0 ? 12 : 0, alignItems: "center" }}>
          <span style={{ fontSize: 13, fontWeight: 700, color: "var(--primary)", whiteSpace: "nowrap" }}>💬 Ask for a lesson plan:</span>
          <input
            value={chatInput}
            onChange={e => setChatInput(e.target.value)}
            onKeyDown={e => { if (e.key === "Enter") sendChatMessage(); }}
            placeholder="e.g. Write me a Year 4 multiplication lesson plan..."
            disabled={isChatStreaming}
            style={{ flex: 1, padding: "8px 14px", background: "var(--surface)", color: "var(--text)", border: "1px solid var(--border)", borderRadius: 10, fontSize: 13, outline: "none" }}
            onFocus={e => e.currentTarget.style.borderColor = "var(--primary)"}
            onBlur={e => e.currentTarget.style.borderColor = "var(--border)"}
          />
          <button
            onClick={sendChatMessage}
            disabled={!chatInput.trim() || isChatStreaming}
            style={{ padding: "8px 16px", background: chatInput.trim() && !isChatStreaming ? "var(--primary)" : "var(--surface)", color: chatInput.trim() && !isChatStreaming ? "#fff" : "var(--text-3)", border: "none", borderRadius: 10, fontSize: 13, fontWeight: 700, cursor: chatInput.trim() && !isChatStreaming ? "pointer" : "not-allowed", whiteSpace: "nowrap" }}
          >
            {isChatStreaming ? "..." : "Send →"}
          </button>
          {chatMessages.length > 0 && (
            <button onClick={() => { setChatMessages([]); setChatInput(""); }} style={{ padding: "8px 12px", background: "transparent", color: "var(--text-3)", border: "1px solid var(--border)", borderRadius: 10, fontSize: 12, cursor: "pointer" }}>Clear</button>
          )}
          {chatMessages.length > 0 && (
            <button onClick={() => downloadChatPlanGoogleDocs(chatMessages[chatMessages.length - 1]?.content || "", "Chat Lesson Plan")} style={{ padding: "8px 12px", background: "#4285F4", color: "#fff", border: "none", borderRadius: 10, fontSize: 12, fontWeight: 600, cursor: "pointer", display: "flex", alignItems: "center", gap: 5 }}>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor"><path d="M6 18h12v-2H6v2zm0-6h12v-2H6v2zm0-8v2h12V4H6z"/></svg>
              Google Docs
            </button>
          )}
        </div>

        {chatMessages.length > 0 && (
          <div style={{ maxHeight: 320, overflowY: "auto", display: "flex", flexDirection: "column", gap: 10, padding: "4px 0" }}>
            {chatMessages.map((msg, i) => (
              <div key={i} style={{ display: "flex", flexDirection: msg.role === "user" ? "row-reverse" : "row", gap: 10, alignItems: "flex-start" }}>
                {msg.role === "assistant" && (
                  <div style={{ background: "linear-gradient(135deg,#6366f1,#818cf8)", width: 28, height: 28, borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 900, fontSize: 10, color: "#fff", flexShrink: 0, marginTop: 2 }}>PN</div>
                )}
                <div style={{
                  maxWidth: "72%",
                  background: msg.role === "user" ? "var(--primary)" : "#fff",
                  color: msg.role === "user" ? "#fff" : "var(--text)",
                  padding: msg.role === "assistant" && !msg.streaming && isStructuredContent(msg.content) ? "0" : "10px 14px",
                  borderRadius: msg.role === "user" ? "14px 14px 4px 14px" : "14px 14px 14px 4px",
                  fontSize: 13, lineHeight: 1.6,
                  border: msg.role === "assistant" && !(msg.role === "assistant" && !msg.streaming && isStructuredContent(msg.content)) ? "1px solid var(--border)" : "none",
                  boxShadow: msg.role === "user" ? "none" : "0 2px 8px rgba(0,0,0,0.06)",
                  wordBreak: "break-word",
                }}>
                  {msg.role === "assistant" && !msg.streaming && isStructuredContent(msg.content) ? (
                    <LessonPlanDisplay
                      content={msg.content}
                      onSave={() => savePlanToProfile(msg.content, "Chat Lesson Plan")}
                      onDownload={(fmt) => download(fmt)}
                    />
                  ) : (
                    <>{msg.content}{msg.streaming && <span style={{ opacity: 0.5 }}>▍</span>}</>
                  )}
                </div>
                {msg.role === "user" && (
                  <div style={{ width: 28, height: 28, borderRadius: 8, background: "var(--primary-dim)", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: 10, color: "var(--primary-hover)", flexShrink: 0, marginTop: 2 }}>T</div>
                )}
              </div>
            ))}
            {isChatStreaming && chatMessages[chatMessages.length - 1]?.role === "user" && (
              <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                <div style={{ background: "linear-gradient(135deg,#6366f1,#818cf8)", width: 28, height: 28, borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 900, fontSize: 10, color: "#fff" }}>PN</div>
                <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <div style={{ width: 6, height: 6, borderRadius: "50%", background: "#6366f1", animation: "pulse-dot 1.5s ease-in-out infinite" }} />
                  <span style={{ fontSize: 12, color: "var(--text-3)" }}>Generating lesson plan...</span>
                </div>
              </div>
            )}
            {(() => {
              const lastAssistant = [...chatMessages].reverse().find(m => m.role === "assistant" && !m.streaming);
              if (!lastAssistant || isStructuredContent(lastAssistant.content)) return null;
              return (
                <div style={{ display: "flex", gap: 6, flexWrap: "wrap", paddingLeft: 38 }}>
                  <button onClick={() => savePlanToProfile(lastAssistant.content, "Chat Lesson Plan")} data-save-btn style={{ padding: "5px 12px", background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 20, fontSize: 12, fontWeight: 600, color: "var(--text-2)", cursor: "pointer" }}>Save</button>
                  <button onClick={() => downloadChatPlanTxt(lastAssistant.content)} style={{ padding: "5px 12px", background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 20, fontSize: 12, fontWeight: 600, color: "var(--text-2)", cursor: "pointer" }}>TXT</button>
                  <button onClick={() => downloadChatPlanPdf(lastAssistant.content)} style={{ padding: "5px 12px", background: "#6366f1", color: "#fff", border: "none", borderRadius: 20, fontSize: 12, fontWeight: 600, cursor: "pointer" }}>PDF</button>
                  <button onClick={() => downloadChatPlanPPTX(lastAssistant.content)} style={{ padding: "5px 12px", background: "#22D3EE", color: "#0a0a0a", border: "none", borderRadius: 20, fontSize: 12, fontWeight: 600, cursor: "pointer" }}>📑 PPTX</button>
                  <button onClick={() => downloadChatPlanDOCX(lastAssistant.content)} style={{ padding: "5px 12px", background: "#4F46E5", color: "#fff", border: "none", borderRadius: 20, fontSize: 12, fontWeight: 600, cursor: "pointer" }}>DOCX</button>
                </div>
              );
            })()}
            <div ref={chatBottomRef} />
          </div>
        )}
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
          }}>
            {loading ? (
              <><div style={{ width: 14, height: 14, border: "2px solid rgba(255,255,255,0.3)", borderTopColor: "#fff", borderRadius: "50%", animation: "spin 0.7s linear infinite" }} />Generating...</>
            ) : (
              <><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5"/><path d="M2 12l10 5 10-5"/></svg>Generate Lesson Plan</>
            )}
          </button>
        </div>

        {/* Result */}
        <div style={{ padding: "24px 28px", display: "flex", flexDirection: "column", background: "#f8f9fa" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
            <h2 style={{ fontSize: 15, fontWeight: 700 }}>Generated Lesson Plan</h2>
            {result && (
              <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                {feedback === null ? (
                  <><span style={{ fontSize: 12, color: "var(--text-3)" }}>Helpful?</span>
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

          <div style={{ flex: 1, overflowY: "auto" }}>
            {result ? (
              <LessonPlanDisplay content={result} onSave={savePlan} onDownload={(fmt) => download(fmt)} />
            ) : (
              <div style={{ background: "#fff", border: "1px solid #e5e7eb", borderRadius: 20, textAlign: "center", paddingTop: 80, paddingBottom: 80, boxShadow: "0 4px 24px rgba(0,0,0,0.06)" }}>
                <div style={{ background: "rgba(99,102,241,0.15)", borderRadius: 10, padding: "10px 14px", display: "inline-flex", alignItems: "center", justifyContent: "center" }}>
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#6366f1" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
                </div>
                <div style={{ fontWeight: 700, fontSize: 16, color: "#1e293b", marginBottom: 6 }}>Your lesson plan will appear here</div>
                <div style={{ fontSize: 13, color: "#9ca3af" }}>Fill in the form → click Generate</div>
              </div>
            )}
          </div>

          {result && (
            <div style={{ marginTop: 12 }}>
              {!diffOpen ? (
                <button onClick={generateDifferentiations} disabled={diffLoading} style={{
                  width: "100%", padding: "10px",
                  background: diffLoading ? "var(--surface)" : "rgba(99,102,241,0.08)",
                  color: diffLoading ? "var(--text-3)" : "var(--primary)",
                  border: "1px solid rgba(99,102,241,0.2)",
                  borderRadius: "var(--radius)",
                  fontWeight: 700, fontSize: 13,
                  cursor: diffLoading ? "not-allowed" : "pointer",
                  display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                }}>
                  {diffLoading ? (
                    <><div style={{ width: 12, height: 12, border: "2px solid rgba(99,102,241,0.3)", borderTopColor: "var(--primary)", borderRadius: "50%", animation: "spin 0.7s linear infinite" }} />Generating differentiated versions...</>
                  ) : (
                    <><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><path d="M8 12h8M12 8v8"/></svg>Generate Differentiated Versions</>
                  )}
                </button>
              ) : (
                <div style={{ border: "1px solid rgba(99,102,241,0.15)", borderRadius: 12, overflow: "hidden" }}>
                  <div style={{ display: "flex", background: "rgba(99,102,241,0.05)", borderBottom: "1px solid rgba(99,102,241,0.1)" }}>
                    {DIFF_TABS.map(tab => (
                      <button key={tab.id} onClick={() => setDiffTab(tab.id)} style={{
                        flex: 1, padding: "8px 6px",
                        background: diffTab === tab.id ? `${tab.color}15` : "transparent",
                        color: diffTab === tab.id ? tab.color : "var(--text-3)",
                        border: "none",
                        borderBottom: diffTab === tab.id ? `2px solid ${tab.color}` : "2px solid transparent",
                        fontSize: 11, fontWeight: 700,
                        cursor: "pointer",
                      }}>{tab.label}</button>
                    ))}
                  </div>
                  <div style={{ padding: "14px" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 10, alignItems: "center" }}>
                      <span style={{ fontSize: 12, fontWeight: 700, color: "var(--text-2)" }}>{diffLabel[diffTab]}</span>
                      <div style={{ display: "flex", gap: 5 }}>
                        <button onClick={() => download("txt", diffVersions[diffTab])} style={{ padding: "4px 10px", background: "var(--surface-2)", border: "1px solid var(--border)", borderRadius: 7, fontSize: 11, fontWeight: 600, color: "var(--text-2)", cursor: "pointer" }}>TXT</button>
                        <button onClick={() => download("pdf", diffVersions[diffTab])} style={{ padding: "4px 10px", background: "var(--surface-2)", border: "1px solid var(--border)", borderRadius: 7, fontSize: 11, fontWeight: 600, color: "var(--text-2)", cursor: "pointer" }}>PDF</button>
                        <button onClick={() => download("docx", diffVersions[diffTab])} style={{ padding: "4px 10px", background: "var(--surface-2)", border: "1px solid var(--border)", borderRadius: 7, fontSize: 11, fontWeight: 600, color: "var(--text-2)", cursor: "pointer" }}>DOCX</button>
                      </div>
                    </div>
                    <div style={{ fontSize: 12, lineHeight: 1.7, whiteSpace: "pre-wrap", color: "var(--text-2)", maxHeight: 300, overflowY: "auto" }}>
                      {diffVersions[diffTab] || "Loading..."}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
