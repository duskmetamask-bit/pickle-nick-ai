"use client";

import { useState, useEffect, useRef } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

// ─── UnitPlanDisplay ──────────────────────────────────────────────────────────
function parseUnitPlan(raw: string) {
  if (!raw) return null;

  const titleMatch = raw.match(/^#\s+(.+?)\n/im) || raw.match(/Unit\s*Plan[:\s]*([^\n]{3,60})/i);
  const title = titleMatch ? titleMatch[1].trim() : "Unit Plan";

  const ac9Codes = raw.match(/AC9\w{1,3}\d{1,2}-\d{2}/g) || [];

  const durMatch = raw.match(/(\d+)\s*(weeks?|lessons?|hours?)/i);
  const duration = durMatch ? durMatch[0].trim() : "";

  const strandMatch = raw.match(/Strands?[:\s]+([^\n]{3,80})/i);
  const strands = strandMatch ? strandMatch[1].trim() : "";

  const assessMatch = raw.match(/(?:Assessment|Evaluation)[:\s]*([^\n]{10,200})/i);
  const assessment = assessMatch ? assessMatch[1].replace(/\*\*/g, "").trim() : "";

  const lessonRows: { lesson: string; focus: string; ac9: string }[] = [];
  const lessonBlocks = raw.match(/(?:Lesson|Week)[\s\d]{0,10}(?:\d{1,2})[\s:\|][^\n]{5,100}/gi) || [];
  for (const block of lessonBlocks) {
    const parts = block.split(/[\t\|]/).map(p => p.replace(/[#\*]/g, "").trim()).filter(p => p && p.length < 80);
    if (parts.length >= 2) {
      const ac9M = block.match(/(AC9\w{1,3}\d{1,2}-\d{2})/);
      lessonRows.push({ lesson: parts[0] || "", focus: parts[1] || "", ac9: ac9M ? ac9M[1] : "" });
    }
  }

  return { title, ac9Codes, duration, strands, assessment, lessonRows, raw };
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

function UnitSectionCard({ accentColor, children }: { accentColor: string; children: React.ReactNode }) {
  return (
    <div style={{
      background: "#fff", borderRadius: 14,
      boxShadow: "0 2px 12px rgba(0,0,0,0.06)",
      border: "1px solid #f0f0f0", borderLeft: `4px solid ${accentColor}`,
      padding: "20px 24px", marginBottom: 14,
    }}>{children}</div>
  );
}

function UnitSectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div style={{
      fontSize: 10, fontWeight: 800, textTransform: "uppercase",
      letterSpacing: "0.12em", color: "#6366f1", marginBottom: 10,
    }}>{children}</div>
  );
}

function UnitPlanDisplay({ content, onSave, onDownloadTxt, onDownloadPdf, onDownloadPPTX, onDownloadDOCX }: {
  content: string;
  onSave?: () => void;
  onDownloadTxt?: () => void;
  onDownloadPdf?: () => void;
  onDownloadPPTX?: () => void;
  onDownloadDOCX?: () => void;
}) {
  const parsed = parseUnitPlan(content);
  const hasContent = parsed && (parsed.lessonRows.length > 0 || parsed.strands || parsed.assessment);

  if (!hasContent) {
    return (
      <div style={{ fontFamily: "'Inter', system-ui, sans-serif" }}>
        <ReactMarkdown
          remarkPlugins={[remarkGfm]}
          components={{
            h1: ({ children }) => <h1 style={{ fontSize: 22, fontWeight: 900, margin: "0 0 12px", color: "#1e293b" }}>{children}</h1>,
            h2: ({ children }) => <h2 style={{ fontSize: 16, fontWeight: 800, margin: "18px 0 10px", color: "#1e293b", borderBottom: "2px solid #e0e7ff", paddingBottom: 6 }}>{children}</h2>,
            h3: ({ children }) => <h3 style={{ fontSize: 14, fontWeight: 700, margin: "14px 0 6px", color: "#374151" }}>{children}</h3>,
            p: ({ children }) => <p style={{ margin: "6px 0", lineHeight: 1.8, fontSize: 14, color: "#475569" }}>{children}</p>,
            ul: ({ children }) => <ul style={{ margin: "8px 0 8px 20px" }}>{children}</ul>,
            ol: ({ children }) => <ol style={{ margin: "8px 0 8px 20px" }}>{children}</ol>,
            li: ({ children }) => <li style={{ margin: "3px 0", fontSize: 14, color: "#475569" }}>{children}</li>,
            strong: ({ children }) => <strong style={{ fontWeight: 700, color: "#1e293b" }}>{children}</strong>,
            blockquote: ({ children }) => <blockquote style={{ borderLeft: "4px solid #6366f1", paddingLeft: 14, margin: "10px 0", color: "#475569", fontStyle: "italic" }}>{children}</blockquote>,
            table: ({ children }) => <div style={{ overflowX: "auto", margin: "10px 0", borderRadius: 10, border: "1px solid #e5e7eb", overflow: "hidden" }}><table style={{ width: "100%", borderCollapse: "collapse" }}>{children}</table></div>,
            thead: ({ children }) => <thead style={{ background: "#f5f3ff" }}>{children}</thead>,
            th: ({ children }) => <th style={{ padding: "8px 12px", color: "#6366f1", fontWeight: 700, fontSize: 11, textTransform: "uppercase", letterSpacing: "0.08em", borderBottom: "2px solid #e0e7ff" }}>{children}</th>,
            td: ({ children }) => <td style={{ padding: "8px 12px", borderBottom: "1px solid #f0f0f0", fontSize: 13, color: "#374151" }}>{children}</td>,
            tr: ({ children }) => <tr style={{ borderBottom: "1px solid #f0f0f0" }}>{children}</tr>,
          }}
        >{content}</ReactMarkdown>
      </div>
    );
  }

  return (
    <div style={{ fontFamily: "'Inter', system-ui, -apple-system, sans-serif", maxWidth: 800, margin: "0 auto" }}>
      <div style={{ background: "#fff", borderRadius: 20, boxShadow: "0 4px 24px rgba(0,0,0,0.08)", overflow: "hidden" }}>

        {/* HEADER */}
        <div style={{ background: "linear-gradient(135deg, #1e1b4b 0%, #312e81 100%)", padding: "28px 32px 24px" }}>
          <div style={{ display: "flex", justifyContent: "flex-end", gap: 8, marginBottom: 20 }}>
            {onSave && (
              <button onClick={onSave} data-save-btn style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "7px 16px", background: "rgba(255,255,255,0.12)", color: "#fff", border: "1px solid rgba(255,255,255,0.25)", borderRadius: 24, fontSize: 12, fontWeight: 600, cursor: "pointer", backdropFilter: "blur(8px)" }}>Save</button>
            )}
            {onDownloadTxt && <button onClick={onDownloadTxt} style={{ padding: "7px 16px", background: "rgba(255,255,255,0.12)", color: "#fff", border: "1px solid rgba(255,255,255,0.25)", borderRadius: 24, fontSize: 12, fontWeight: 600, cursor: "pointer" }}>TXT</button>}
            {onDownloadPdf && <button onClick={onDownloadPdf} style={{ padding: "7px 16px", background: "#fff", color: "#312e81", border: "none", borderRadius: 24, fontSize: 12, fontWeight: 700, cursor: "pointer", boxShadow: "0 2px 8px rgba(0,0,0,0.15)" }}>PDF</button>}
            {onDownloadPPTX && <button onClick={onDownloadPPTX} style={{ padding: "7px 16px", background: "#22D3EE", color: "#0a0a0a", border: "none", borderRadius: 24, fontSize: 12, fontWeight: 700, cursor: "pointer", boxShadow: "0 2px 8px rgba(0,0,0,0.15)" }}>📑 PPTX</button>}
            {onDownloadDOCX && <button onClick={onDownloadDOCX} style={{ padding: "7px 16px", background: "#4F46E5", color: "#fff", border: "none", borderRadius: 24, fontSize: 12, fontWeight: 700, cursor: "pointer", boxShadow: "0 2px 8px rgba(0,0,0,0.15)" }}>DOCX</button>}
          </div>

          <div style={{ display: "flex", alignItems: "flex-start", gap: 16, flexWrap: "wrap" }}>
            <div style={{ flex: 1 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
                <div style={{ background: "rgba(255,255,255,0.15)", borderRadius: 10, padding: "6px 10px", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
                </div>
                <div>
                  <div style={{ fontSize: 10, fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.15em", color: "rgba(255,255,255,0.6)", marginBottom: 3 }}>PickleNickAI</div>
                  <div style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", color: "rgba(255,255,255,0.5)" }}>Unit Plan</div>
                </div>
              </div>
              <h2 style={{ fontSize: 22, fontWeight: 800, color: "#fff", margin: 0, lineHeight: 1.3, letterSpacing: "-0.02em" }}>{parsed.title}</h2>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 8, alignItems: "flex-end" }}>
              {parsed.duration && (
                <div style={{ background: "rgba(255,255,255,0.12)", border: "1px solid rgba(255,255,255,0.2)", borderRadius: 20, padding: "4px 12px", display: "flex", alignItems: "center", gap: 5 }}>
                  <span style={{ fontSize: 13 }}>⏱️</span><span style={{ fontSize: 12, fontWeight: 600, color: "#fff" }}>{parsed.duration}</span>
                </div>
              )}
              {parsed.strands && (
                <div style={{ background: "rgba(255,255,255,0.12)", border: "1px solid rgba(255,255,255,0.2)", borderRadius: 20, padding: "4px 12px", display: "flex", alignItems: "center", gap: 5 }}>
                  <span style={{ fontSize: 13 }}>🧭</span><span style={{ fontSize: 12, fontWeight: 600, color: "#fff" }}>{parsed.strands}</span>
                </div>
              )}
              <div style={{ display: "flex", flexWrap: "wrap", gap: 5, justifyContent: "flex-end" }}>
                {parsed.ac9Codes.slice(0, 4).map(code => <AC9Pill key={code} code={code} />)}
              </div>
            </div>
          </div>
        </div>

        {/* BODY */}
        <div style={{ padding: "28px 32px" }}>

          {/* Scope & Sequence Table */}
          {parsed.lessonRows.length > 0 && (
            <UnitSectionCard accentColor="#6366f1">
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
                <div style={{ background: "#eef2ff", borderRadius: 8, padding: "6px 8px", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#6366f1" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
                </div>
                <UnitSectionLabel>Scope & Sequence</UnitSectionLabel>
              </div>
              <div style={{ borderRadius: 12, overflow: "hidden", border: "1px solid #f0f0f0", boxShadow: "0 1px 4px rgba(0,0,0,0.04)" }}>
                <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
                  <thead>
                    <tr style={{ background: "#f5f3ff" }}>
                      {["#", "Focus / Content", "AC9 Code"].map(h => (
                        <th key={h} style={{ padding: "10px 16px", textAlign: "left", fontWeight: 700, fontSize: 10, textTransform: "uppercase", letterSpacing: "0.1em", color: "#6366f1", borderBottom: "2px solid #e0e7ff" }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {parsed.lessonRows.slice(0, 25).map((row, i) => (
                      <tr key={i} style={{ background: i % 2 === 0 ? "#fff" : "#fafafa", borderBottom: i < Math.min(parsed.lessonRows.length, 25) - 1 ? "1px solid #f0f0f0" : "none" }}>
                        <td style={{ padding: "11px 16px", fontWeight: 700, color: "#6366f1", fontSize: 13 }}>{row.lesson || `Lesson ${i + 1}`}</td>
                        <td style={{ padding: "11px 16px", color: "#1e293b", fontSize: 13 }}>{row.focus}</td>
                        <td style={{ padding: "11px 16px" }}>
                          {row.ac9 ? <AC9Pill code={row.ac9} /> : <span style={{ color: "#d1d5db", fontSize: 12 }}>—</span>}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </UnitSectionCard>
          )}

          {/* Assessment */}
          {parsed.assessment && (
            <UnitSectionCard accentColor="#22d3ee">
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
                <div style={{ background: "#ecfeff", borderRadius: 8, padding: "6px 8px", fontSize: 16 }}>📈</div>
                <UnitSectionLabel>Assessment Approach</UnitSectionLabel>
              </div>
              <div style={{ background: "#ecfeff", borderRadius: 12, padding: "16px 20px" }}>
                <p style={{ fontSize: 15, lineHeight: 1.7, color: "#155e75", margin: 0, fontWeight: 500 }}>{parsed.assessment}</p>
              </div>
            </UnitSectionCard>
          )}

          {/* Unit Overview */}
          {(parsed.strands || parsed.duration || (parsed.ac9Codes && parsed.ac9Codes.length > 0)) && (
            <UnitSectionCard accentColor="#8b5cf6">
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
                <div style={{ background: "#ede9fe", borderRadius: 8, padding: "6px 8px", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#8b5cf6" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="4" y1="9" x2="20" y2="9"/><line x1="4" y1="15" x2="20" y2="15"/><line x1="10" y1="3" x2="8" y2="21"/><line x1="16" y1="3" x2="14" y2="21"/></svg>
                </div>
                <UnitSectionLabel>Unit Details</UnitSectionLabel>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: 12 }}>
                {parsed.duration && (
                  <div style={{ background: "#fafafa", borderRadius: 10, padding: "12px 14px", border: "1px solid #f0f0f0" }}>
                    <div style={{ fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", color: "#9ca3af", marginBottom: 4 }}>Duration</div>
                    <div style={{ fontSize: 14, fontWeight: 700, color: "#1e293b" }}>{parsed.duration}</div>
                  </div>
                )}
                {parsed.strands && (
                  <div style={{ background: "#fafafa", borderRadius: 10, padding: "12px 14px", border: "1px solid #f0f0f0" }}>
                    <div style={{ fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", color: "#9ca3af", marginBottom: 4 }}>Strands</div>
                    <div style={{ fontSize: 14, fontWeight: 600, color: "#1e293b" }}>{parsed.strands}</div>
                  </div>
                )}
                {parsed.ac9Codes.length > 0 && (
                  <div style={{ background: "#fafafa", borderRadius: 10, padding: "12px 14px", border: "1px solid #f0f0f0" }}>
                    <div style={{ fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", color: "#9ca3af", marginBottom: 6 }}>AC9 Codes</div>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
                      {parsed.ac9Codes.slice(0, 4).map(c => <AC9Pill key={c} code={c} />)}
                    </div>
                  </div>
                )}
              </div>
            </UnitSectionCard>
          )}
        </div>

        {/* FOOTER */}
        <div style={{ borderTop: "1px solid #f0f0f0", padding: "12px 32px", display: "flex", justifyContent: "space-between", alignItems: "center", background: "#fafafa" }}>
          <span style={{ fontSize: 11, color: "#9ca3af", fontWeight: 600 }}>Generated by PickleNickAI</span>
          <span style={{ fontSize: 11, color: "#d1d5db" }}>{new Date().toLocaleDateString("en-AU", { day: "numeric", month: "long", year: "numeric" })}</span>
        </div>
      </div>
    </div>
  );
}


const SUBJECTS = ["Mathematics", "English", "Science", "HASS", "Technologies", "The Arts", "Health & PE", "Languages"];
const YEAR_LEVELS = ["F", "1", "2", "3", "4", "5", "6"];

function normalizeSubject(s: string): string {
  const lower = s.toLowerCase();
  if (lower.includes("math")) return "Mathematics";
  if (lower.includes("english") || lower.includes("australian curriculum english")) return "English";
  if (lower.includes("science") || lower.includes("australian curriculum science")) return "Science";
  if (lower.includes("hass") || lower.includes("history") || lower.includes("geography") || lower.includes("australian curriculum hass")) return "HASS";
  if (lower.includes("technolog")) return "Technologies";
  if (lower.includes("art")) return "The Arts";
  if (lower.includes("health") || lower.includes("physical")) return "Health & PE";
  return "General";
}

interface Unit {
  id: string;
  title: string;
  subject: string;
  yearLevel: string;
  duration: string;
  curriculum: string;
  description: string;
  content?: string;
}

interface Lesson {
  id: string;
  title: string;
  week: string;
  content: string;
}

interface ChatMessage { role: "user" | "assistant"; content: string; streaming?: boolean; }

function saveUnitToProfile(content: string, label: string) {
  const savedDocs = JSON.parse(localStorage.getItem("pn-saved-docs") || "[]");
  savedDocs.unshift({ id: `unit-${Date.now().toString(36)}`, type: "unit", label, content, savedAt: Date.now() });
  localStorage.setItem("pn-saved-docs", JSON.stringify(savedDocs.slice(0, 50)));
  const btns = document.querySelectorAll(`[data-save-btn]`);
  btns.forEach(b => {
    const el = b as HTMLElement;
    el.textContent = "✓ Saved"; el.style.color = "var(--success)";
    setTimeout(() => { el.textContent = "Save Unit"; el.style.color = ""; }, 1500);
  });
}

async function downloadPdf(content: string, label: string) {
  try {
    const res = await fetch("/api/export/chat-to-pdf", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ content, label }) });
    if (!res.ok) throw new Error();
    const blob = await res.blob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href = url; a.download = `${label}_${new Date().toISOString().slice(0,10)}.pdf`; a.click();
    URL.revokeObjectURL(url);
  } catch { alert("PDF export failed"); }
}

function downloadTxt(content: string, label: string) {
  const blob = new Blob([content], { type: "text/plain" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a"); a.href = url; a.download = `${label}_${new Date().toISOString().slice(0,10)}.txt`; a.click();
  URL.revokeObjectURL(url);
}

async function downloadPPTX(content: string, label: string) {
  try {
    const res = await fetch("/api/export/pptx", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ content, title: label }) });
    if (!res.ok) throw new Error();
    const blob = await res.blob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href = url; a.download = `${label.replace(/[^a-z0-9]/gi, "-")}.pptx`; a.click();
    URL.revokeObjectURL(url);
  } catch { alert("PPTX export failed"); }
}

async function downloadDOCX(content: string, label: string) {
  try {
    const res = await fetch("/api/export/docx", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ content, title: label }) });
    if (!res.ok) throw new Error();
    const blob = await res.blob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href = url; a.download = `${label.replace(/[^a-z0-9]/gi, "-")}.docx`; a.click();
    URL.revokeObjectURL(url);
  } catch { alert("DOCX export failed"); }
}

function isStructuredContent(content: string): boolean {
  const indicators = ["WALT", "TIB", "WILF", "Lesson", "Assessment", "Rubric", "Learning Intention", "Success Criteria", "AC9", "Hot Task", "Cold Task", "Exit Ticket", "Phase | Duration", "Duration", "Overview", "Curriculum", "Tuning In", "Reflection", "Week"];
  return indicators.some(ind => content.includes(ind));
}

function saveChatUnit(content: string) {
  const match = content.match(/^#\s+(.+?)\n/i);
  const label = match ? match[1].trim() : "AI Unit";
  saveUnitToProfile(content, label);
}

function exportChatUnitTxt(content: string) {
  const match = content.match(/^#\s+(.+?)\n/i);
  downloadTxt(content, match ? match[1].trim() : "Unit");
}

function exportChatUnitPdf(content: string) {
  const match = content.match(/^#\s+(.+?)\n/i);
  downloadPdf(content, match ? match[1].trim() : "Unit");
}

function exportChatUnitPPTX(content: string) {
  const match = content.match(/^#\s+(.+?)\n/i);
  downloadPPTX(content, match ? match[1].trim() : "Unit");
}

function exportChatUnitDOCX(content: string) {
  const match = content.match(/^#\s+(.+?)\n/i);
  downloadDOCX(content, match ? match[1].trim() : "Unit");
}

export default function LibraryView() {
  const [search, setSearch] = useState("");
  const [subject, setSubject] = useState("");
  const [year, setYear] = useState("");
  const [units, setUnits] = useState<Unit[]>([]);
  const [loading, setLoading] = useState(true);
  const [exportLoading, setExportLoading] = useState("");
  const [unitSaved, setUnitSaved] = useState(false);
  const [lessonSaved, setLessonSaved] = useState<string | null>(null);
  const [selected, setSelected] = useState<Unit | null>(null);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [selectedLesson, setSelectedLesson] = useState<Lesson | null>(null);
  const [lessonsLoading, setLessonsLoading] = useState(false);

  // Chat state
  const [chatInput, setChatInput] = useState("");
  const [isChatStreaming, setIsChatStreaming] = useState(false);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const chatBottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => { chatBottomRef.current?.scrollIntoView({ behavior: "smooth" }); }, [chatMessages]);

  useEffect(() => {
    fetch("/api/library/units")
      .then(r => r.json())
      .then(d => { setUnits(d.units || []); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  // Extract lessons when a unit is selected
  useEffect(() => {
    if (!selected?.content) { setLessons([]); setSelectedLesson(null); return; }
    setLessonsLoading(true);
    setSelectedLesson(null);
    fetch("/api/lessons", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content: selected.content, title: selected.title }),
    })
      .then(r => r.json())
      .then(d => { setLessons(d.lessons || []); setLessonsLoading(false); })
      .catch(() => setLessonsLoading(false));
  }, [selected?.id]);

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
        systemHint: "You are a curriculum expert. The teacher is asking for a unit outline with multiple lessons (scope and sequence style). Generate a comprehensive unit outline with clearly structured lessons, AC9 alignment, and teacher-facing details. Format with clear headings, duration estimates, and learning sequence.",
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

  const filtered = units.filter(u => {
    const matchSearch = !search ||
      u.title.toLowerCase().includes(search.toLowerCase()) ||
      u.description?.toLowerCase().includes(search.toLowerCase());
    const matchSubject = !subject || u.subject?.toLowerCase().includes(subject.toLowerCase());
    const matchYear = !year || u.yearLevel.includes(year);
    return matchSearch && matchSubject && matchYear;
  });

  function saveUnit() {
    if (!selected?.content) return;
    const savedDocs = JSON.parse(localStorage.getItem("pn-saved-docs") || "[]");
    savedDocs.unshift({ id: `unit-${selected.id}`, type: "unit", label: selected.title, content: selected.content, savedAt: Date.now() });
    localStorage.setItem("pn-saved-docs", JSON.stringify(savedDocs.slice(0, 50)));
    setUnitSaved(true);
    setTimeout(() => setUnitSaved(false), 2000);
  }

  function saveLesson(lesson: Lesson) {
    const savedDocs = JSON.parse(localStorage.getItem("pn-saved-docs") || "[]");
    savedDocs.unshift({ id: `lesson-${lesson.id}`, type: "lesson", label: `${selected?.title} — ${lesson.title}`, content: lesson.content, savedAt: Date.now() });
    localStorage.setItem("pn-saved-docs", JSON.stringify(savedDocs.slice(0, 50)));
    setLessonSaved(lesson.id);
    setTimeout(() => setLessonSaved(null), 2000);
  }

  function exportLessonTXT(lesson: Lesson) {
    if (!lesson.content) return;
    const blob = new Blob([lesson.content], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href = url;
    a.download = `${lesson.title.replace(/[^a-z0-9]/gi, "-")}.txt`; a.click();
    URL.revokeObjectURL(url);
  }

  function exportFullUnitTXT() {
    if (!selected?.content) return;
    const blob = new Blob([selected.content], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href = url;
    a.download = `${selected.title.replace(/[^a-z0-9]/gi, "-")}.txt`; a.click();
    URL.revokeObjectURL(url);
  }

  async function exportLessonPDF(lesson: Lesson) {
    setExportLoading(`pdf-${lesson.id}`);
    try {
      const res = await fetch("/api/export/lesson/pdf", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          content: lesson.content,
          title: lesson.title,
          week: lesson.week,
          subject: selected?.subject,
          yearLevel: selected?.yearLevel,
        }),
      });
      if (!res.ok) throw new Error();
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a"); a.href = url;
      a.download = `${lesson.title.replace(/[^a-z0-9]/gi, "-")}.pdf`; a.click();
      URL.revokeObjectURL(url);
    } catch { alert("PDF export failed"); }
    finally { setExportLoading(""); }
  }

  async function exportLessonPPTX(lesson: Lesson) {
    setExportLoading(`pptx-${lesson.id}`);
    try {
      const res = await fetch("/api/export/pptx", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: lesson.content, title: lesson.title }),
      });
      if (!res.ok) throw new Error();
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a"); a.href = url;
      a.download = `${lesson.title.replace(/[^a-z0-9]/gi, "-")}.pptx`; a.click();
      URL.revokeObjectURL(url);
    } catch { alert("PPTX export failed"); }
    finally { setExportLoading(""); }
  }

  function exportFullUnitPDF() {
    if (!selected?.content) return;
    setExportLoading("full-pdf");
    fetch("/api/export/pdf", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content: selected.content, title: selected.title }),
    })
      .then(r => r.blob())
      .then(blob => {
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a"); a.href = url;
        a.download = `${selected.title.replace(/[^a-z0-9]/gi, "-")}.pdf`; a.click();
        URL.revokeObjectURL(url);
      })
      .catch(() => alert("PDF export failed"))
      .finally(() => setExportLoading(""));
  }

  function exportFullUnitPPTX() {
    if (!selected?.content) return;
    setExportLoading("full-pptx");
    fetch("/api/export/pptx", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content: selected.content, title: selected.title }),
    })
      .then(r => r.blob())
      .then(blob => {
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a"); a.href = url;
        a.download = `${selected.title.replace(/[^a-z0-9]/gi, "-")}.pptx`; a.click();
        URL.revokeObjectURL(url);
      })
      .catch(() => alert("PPTX export failed"))
      .finally(() => setExportLoading(""));
  }

  function exportFullUnitDOCX() {
    if (!selected?.content) return;
    setExportLoading("full-docx");
    fetch("/api/export/docx", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content: selected.content, title: selected.title }),
    })
      .then(r => r.blob())
      .then(blob => {
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a"); a.href = url;
        a.download = `${selected.title.replace(/[^a-z0-9]/gi, "-")}.docx`; a.click();
        URL.revokeObjectURL(url);
      })
      .catch(() => alert("DOCX export failed"))
      .finally(() => setExportLoading(""));
  }

  return (
    <div style={{ height: "100vh", display: "flex", flexDirection: "column" }}>
      {/* Header */}
      <div style={{ padding: "20px 28px", borderBottom: "1px solid var(--border)" }}>
        <h1 style={{ fontSize: 20, fontWeight: 800, marginBottom: 4 }}>Unit Library</h1>
        <p style={{ color: "var(--text2)", fontSize: 13 }}>{units.length} curriculum-aligned unit plans · click any to read full</p>
      </div>

      {/* Search + Filters */}
      <div style={{ padding: "14px 28px", borderBottom: "1px solid var(--border)", display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center" }}>
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search units..."
          style={{ flex: "1 1 220px", padding: "9px 14px", background: "var(--surface2)", color: "var(--text)", border: "1px solid var(--border)", borderRadius: 10, fontSize: 14, outline: "none", minWidth: 0 }}
          onFocus={e => e.currentTarget.style.borderColor = "var(--primary)"}
          onBlur={e => e.currentTarget.style.borderColor = "var(--border)"}
        />
        <select value={subject} onChange={e => setSubject(e.target.value)} style={{ padding: "9px 12px", background: "var(--surface2)", color: "var(--text)", border: "1px solid var(--border)", borderRadius: 10, fontSize: 13, outline: "none" }}>
          <option value="">All subjects</option>
          {SUBJECTS.map(s => <option key={s} value={s}>{s}</option>)}
        </select>
        <select value={year} onChange={e => setYear(e.target.value)} style={{ padding: "9px 12px", background: "var(--surface2)", color: "var(--text)", border: "1px solid var(--border)", borderRadius: 10, fontSize: 13, outline: "none" }}>
          <option value="">All years</option>
          {YEAR_LEVELS.map(y => <option key={y} value={y}>Year {y}</option>)}
        </select>
        {(search || subject || year) && (
          <button onClick={() => { setSearch(""); setSubject(""); setYear(""); }} style={{ padding: "9px 14px", background: "transparent", color: "var(--danger)", border: "1px solid var(--danger)", borderRadius: 10, fontSize: 13, cursor: "pointer" }}>Clear</button>
        )}
      </div>

      {/* AI Chat Input */}
      <div style={{ padding: "14px 28px", borderBottom: "1px solid var(--border)", background: "var(--surface2)" }}>
        <div style={{ display: "flex", gap: 8, marginBottom: chatMessages.length > 0 ? 12 : 0, alignItems: "center" }}>
          <span style={{ fontSize: 13, fontWeight: 700, color: "var(--primary)", whiteSpace: "nowrap" }}>💬 Ask for a unit plan:</span>
          <input
            value={chatInput}
            onChange={e => setChatInput(e.target.value)}
            onKeyDown={e => { if (e.key === "Enter") sendChatMessage(); }}
            placeholder="e.g. Write me a Year 4 fractions unit..."
            disabled={isChatStreaming}
            style={{ flex: 1, padding: "8px 14px", background: "var(--surface)", color: "var(--text)", border: "1px solid var(--border)", borderRadius: 10, fontSize: 13, outline: "none" }}
            onFocus={e => e.currentTarget.style.borderColor = "var(--primary)"}
            onBlur={e => e.currentTarget.style.borderColor = "var(--border)"}
          />
          <button
            onClick={sendChatMessage}
            disabled={!chatInput.trim() || isChatStreaming}
            style={{ padding: "8px 16px", background: chatInput.trim() && !isChatStreaming ? "var(--primary)" : "var(--surface)", color: chatInput.trim() && !isChatStreaming ? "#fff" : "var(--text3)", border: "none", borderRadius: 10, fontSize: 13, fontWeight: 700, cursor: chatInput.trim() && !isChatStreaming ? "pointer" : "not-allowed", whiteSpace: "nowrap" }}
          >
            {isChatStreaming ? "..." : "Send →"}
          </button>
          {chatMessages.length > 0 && (
            <button onClick={() => { setChatMessages([]); setChatInput(""); }} style={{ padding: "8px 12px", background: "transparent", color: "var(--text3)", border: "1px solid var(--border)", borderRadius: 10, fontSize: 12, cursor: "pointer" }}>Clear</button>
          )}
        </div>

        {/* Chat messages */}
        {chatMessages.length > 0 && (
          <div style={{ maxHeight: 320, overflowY: "auto", display: "flex", flexDirection: "column", gap: 10 }}>
            {chatMessages.map((msg, i) => {
              const isStructured = msg.role === "assistant" && !msg.streaming && isStructuredContent(msg.content);
              return (
                <div key={i} style={{ display: "flex", flexDirection: msg.role === "user" ? "row-reverse" : "row", gap: 8, alignItems: "flex-start" }}>
                  {msg.role === "assistant" && <div style={{ background: "linear-gradient(135deg,#6366f1,#818cf8)", width: 24, height: 24, borderRadius: 6, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 900, fontSize: 10, color: "#fff", flexShrink: 0, marginTop: 1 }}>PN</div>}
                  <div style={{ maxWidth: "78%", width: "100%", background: msg.role === "user" ? "var(--primary)" : "var(--surface)", color: msg.role === "user" ? "#fff" : "var(--text)", padding: msg.role === "assistant" && !msg.streaming && isStructuredContent(msg.content) ? "0" : "9px 13px", borderRadius: msg.role === "user" ? "12px 12px 4px 12px" : "12px 12px 12px 4px", fontSize: 13, lineHeight: 1.6, border: msg.role === "assistant" ? "1px solid var(--border)" : "none", whiteSpace: "pre-wrap", wordBreak: "break-word" }}>
                    {msg.role === "assistant" && !msg.streaming && isStructuredContent(msg.content) ? (
                      <UnitPlanDisplay
                        content={msg.content}
                        onSave={() => saveChatUnit(msg.content)}
                        onDownloadTxt={() => exportChatUnitTxt(msg.content)}
                        onDownloadPdf={() => exportChatUnitPdf(msg.content)}
                        onDownloadPPTX={() => exportChatUnitPPTX(msg.content)}
                        onDownloadDOCX={() => exportChatUnitDOCX(msg.content)}
                      />
                    ) : (
                      <>{msg.content}{msg.streaming && <span style={{ opacity: 0.5 }}>▍</span>}</>
                    )}
                  </div>
                  {msg.role === "user" && <div style={{ width: 24, height: 24, borderRadius: 6, background: "var(--primary-dim)", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: 10, color: "var(--primary-hover)", flexShrink: 0, marginTop: 1 }}>T</div>}
                </div>
              );
            })}
            {isChatStreaming && chatMessages[chatMessages.length - 1]?.role === "user" && (
              <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                <div style={{ background: "linear-gradient(135deg,#6366f1,#818cf8)", width: 24, height: 24, borderRadius: 6, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 900, fontSize: 10, color: "#fff" }}>PN</div>
                <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <div style={{ width: 5, height: 5, borderRadius: "50%", background: "var(--primary)", animation: "pulse-dot 1.5s ease-in-out infinite" }} />
                  <span style={{ fontSize: 12, color: "var(--text3)" }}>Generating...</span>
                </div>
              </div>
            )}
            {/* Action buttons for non-structured responses */}
            {(() => {
              const lastAssistant = [...chatMessages].reverse().find(m => m.role === "assistant" && !m.streaming);
              if (!lastAssistant || isStructuredContent(lastAssistant.content)) return null;
              return (
                <div style={{ display: "flex", gap: 6, flexWrap: "wrap", paddingLeft: 32 }}>
                  <button onClick={() => saveChatUnit(lastAssistant.content)} data-save-btn style={{ padding: "5px 12px", background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 8, fontSize: 12, fontWeight: 700, color: "var(--text2)", cursor: "pointer" }}>Save Unit</button>
                  <button onClick={() => exportChatUnitTxt(lastAssistant.content)} style={{ padding: "5px 12px", background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 8, fontSize: 12, fontWeight: 700, color: "var(--text2)", cursor: "pointer" }}>TXT</button>
                  <button onClick={() => exportChatUnitPdf(lastAssistant.content)} style={{ padding: "5px 12px", background: "var(--primary)", color: "#fff", border: "none", borderRadius: 8, fontSize: 12, fontWeight: 700, cursor: "pointer" }}>PDF</button>
                  <button onClick={() => exportChatUnitPPTX(lastAssistant.content)} style={{ padding: "5px 12px", background: "#22D3EE", color: "#0a0a0a", border: "none", borderRadius: 8, fontSize: 12, fontWeight: 700, cursor: "pointer" }}>📑 PPTX</button>
                </div>
              );
            })()}
            <div ref={chatBottomRef} />
          </div>
        )}
      </div>

      {/* Main: list + detail */}
      <div style={{ flex: 1, display: "grid", gridTemplateColumns: "320px 1fr", overflow: "hidden" }}>
        {/* Unit list */}
        <div style={{ borderRight: "1px solid var(--border)", overflowY: "auto" }}>
          {loading ? (
            <div style={{ padding: 24 }}>
              {[1,2,3,4,5].map(i => (
                <div key={i} style={{ padding: "12px 15px", borderBottom: "1px solid var(--border)" }}>
                  <div style={{ height: 14, background: "var(--surface2)", borderRadius: 6, marginBottom: 8, width: "85%" }} />
                  <div style={{ height: 10, background: "var(--surface2)", borderRadius: 6, width: "45%" }} />
                </div>
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <div style={{ padding: 60, textAlign: "center" }}>
              <div style={{ fontSize: 40, marginBottom: 12, color: "var(--primary)" }}>Find</div>
              <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 6, color: "var(--text2)" }}>No units found</div>
              <div style={{ fontSize: 13, color: "var(--text3)", marginBottom: 16 }}>
                {search || subject || year ? "Try different filters or clear your search" : "No units are available yet"}
              </div>
              {(search || subject || year) && (
                <button onClick={() => { setSearch(""); setSubject(""); setYear(""); }} style={{ padding: "8px 16px", background: "var(--surface2)", border: "1px solid var(--border)", borderRadius: 10, fontSize: 13, color: "var(--text2)", cursor: "pointer" }}>Clear filters</button>
              )}
            </div>
          ) : (
            filtered.map(u => (
              <div
                key={u.id}
                onClick={() => { setSelected(u); setSelectedLesson(null); }}
                style={{
                  padding: "11px 15px",
                  borderBottom: "1px solid var(--border)",
                  cursor: "pointer",
                  background: selected?.id === u.id ? "rgba(99,102,241,0.08)" : "transparent",
                  borderLeft: selected?.id === u.id ? "3px solid var(--primary)" : "3px solid transparent",
                }}
              >
                <div style={{ fontWeight: 700, fontSize: 13, marginBottom: 3, color: selected?.id === u.id ? "var(--primary)" : "var(--text)", lineHeight: 1.3 }}>{u.title}</div>
                <div style={{ display: "flex", gap: 5, flexWrap: "wrap" }}>
                  <span style={{ background: "rgba(99,102,241,0.12)", color: "var(--primary)", padding: "1px 7px", borderRadius: 10, fontSize: 10, fontWeight: 600 }}>{normalizeSubject(u.subject)}</span>
                  <span style={{ background: "var(--surface2)", color: "var(--text2)", padding: "1px 7px", borderRadius: 10, fontSize: 10 }}>{u.yearLevel}</span>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Unit detail */}
        <div style={{ overflowY: "auto", padding: "20px 28px", maxWidth: 920 }}>
          {selected ? (
            <div>
              {/* Badges */}
              <div style={{ display: "flex", gap: 7, flexWrap: "wrap", marginBottom: 10 }}>
                <span style={{ background: "rgba(99,102,241,0.12)", color: "var(--primary)", padding: "3px 10px", borderRadius: 20, fontSize: 11, fontWeight: 700 }}>{normalizeSubject(selected.subject)}</span>
                <span style={{ background: "var(--surface2)", color: "var(--text2)", padding: "3px 10px", borderRadius: 20, fontSize: 11 }}>{selected.yearLevel}</span>
                {selected.duration && <span style={{ background: "var(--surface2)", color: "var(--text2)", padding: "3px 10px", borderRadius: 20, fontSize: 11 }}>{selected.duration}</span>}
              </div>

              {/* Title + export whole unit */}
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 14, gap: 10 }}>
                <h1 style={{ fontSize: 20, fontWeight: 900, lineHeight: 1.25 }}>{selected.title}</h1>
                <div style={{ display: "flex", gap: 7, flexShrink: 0, flexWrap: "wrap", justifyContent: "flex-end" }}>
                  <button
                    onClick={saveUnit}
                    data-save-btn
                    style={{ padding: "7px 13px", background: unitSaved ? "var(--success)" : "var(--surface2)", color: unitSaved ? "#fff" : "var(--text2)", border: "1px solid var(--border)", borderRadius: 9, fontSize: 12, fontWeight: 700, cursor: "pointer", whiteSpace: "nowrap" }}
                  >
                    {unitSaved ? "✓ Saved" : "Save"}
                  </button>
                  <button onClick={exportFullUnitTXT} style={{ padding: "7px 13px", background: "var(--surface2)", color: "var(--text2)", border: "1px solid var(--border)", borderRadius: 9, fontSize: 12, fontWeight: 700, cursor: "pointer", whiteSpace: "nowrap" }}>
                    TXT
                  </button>
                  <button onClick={exportFullUnitPDF} disabled={!!exportLoading && exportLoading.startsWith("full")} style={{ padding: "7px 13px", background: exportLoading === "full-pdf" ? "var(--surface2)" : "var(--primary)", color: exportLoading === "full-pdf" ? "var(--text3)" : "#fff", border: "none", borderRadius: 9, fontSize: 12, fontWeight: 700, cursor: exportLoading.startsWith("full") ? "not-allowed" : "pointer", whiteSpace: "nowrap" }}>
                    {exportLoading === "full-pdf" ? "..." : "PDF"}
                  </button>
                  <button onClick={exportFullUnitPPTX} disabled={!!exportLoading && exportLoading.startsWith("full")} style={{ padding: "7px 13px", background: exportLoading === "full-pptx" ? "var(--surface2)" : "#22D3EE", color: exportLoading === "full-pptx" ? "var(--text3)" : "#0a0a0a", border: "none", borderRadius: 9, fontSize: 12, fontWeight: 700, cursor: exportLoading.startsWith("full") ? "not-allowed" : "pointer", whiteSpace: "nowrap" }}>
                    {exportLoading === "full-pptx" ? "..." : "PPTX"}
                  </button>
                  <button onClick={exportFullUnitDOCX} disabled={!!exportLoading && exportLoading.startsWith("full")} style={{ padding: "7px 13px", background: exportLoading === "full-docx" ? "var(--surface2)" : "#4F46E5", color: exportLoading === "full-docx" ? "var(--text3)" : "#fff", border: "none", borderRadius: 9, fontSize: 12, fontWeight: 700, cursor: exportLoading.startsWith("full") ? "not-allowed" : "pointer", whiteSpace: "nowrap" }}>
                    {exportLoading === "full-docx" ? "..." : "DOCX"}
                  </button>
                </div>
              </div>

              {selected.curriculum && <p style={{ color: "var(--primary)", fontSize: 11, fontWeight: 600, marginBottom: 14 }}>{selected.curriculum}</p>}

              {/* Lesson list */}
              {lessonsLoading ? (
                <div style={{ padding: "20px 0", color: "var(--text2)", fontSize: 13 }}>Loading lessons...</div>
              ) : lessons.length > 0 ? (
                <div style={{ marginBottom: 20 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
                    <h2 style={{ fontSize: 14, fontWeight: 700 }}>{lessons.length} Individual Lessons</h2>
                    <span style={{ fontSize: 11, color: "var(--text3)" }}>click to preview · export individually</span>
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                    {lessons.map((lesson, i) => (
                      <div
                        key={lesson.id}
                        style={{
                          border: "1px solid var(--border)",
                          borderRadius: 12,
                          overflow: "hidden",
                          background: selectedLesson?.id === lesson.id ? "rgba(99,102,241,0.05)" : "var(--surface)",
                        }}
                      >
                        <div
                          onClick={() => setSelectedLesson(selectedLesson?.id === lesson.id ? null : lesson)}
                          style={{ padding: "11px 14px", cursor: "pointer", display: "flex", justifyContent: "space-between", alignItems: "center" }}
                        >
                          <div style={{ display: "flex", gap: 8, alignItems: "center", flex: 1, minWidth: 0 }}>
                            <span style={{ fontSize: 11, color: "var(--primary)", fontWeight: 700, flexShrink: 0, minWidth: 28 }}>{i + 1}</span>
                            <span style={{ fontSize: 13, fontWeight: 600, color: "var(--text)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{lesson.title}</span>
                          </div>
                          <div style={{ display: "flex", gap: 5, flexShrink: 0 }}>
                            <button
                              onClick={(e) => { e.stopPropagation(); exportLessonTXT(lesson); }}
                              style={{ padding: "5px 10px", background: "var(--surface2)", color: "var(--text2)", border: "1px solid var(--border)", borderRadius: 7, fontSize: 11, fontWeight: 600, cursor: "pointer" }}
                            >
                              TXT
                            </button>
                            <button
                              onClick={(e) => { e.stopPropagation(); exportLessonPDF(lesson); }}
                              disabled={!!exportLoading && exportLoading === `pdf-${lesson.id}`}
                              style={{ padding: "5px 10px", background: "var(--surface2)", color: "var(--text2)", border: "1px solid var(--border)", borderRadius: 7, fontSize: 11, fontWeight: 600, cursor: "pointer" }}
                            >
                              PDF
                            </button>
                            <button
                              onClick={(e) => { e.stopPropagation(); exportLessonPPTX(lesson); }}
                              disabled={!!exportLoading && exportLoading === `pptx-${lesson.id}`}
                              style={{ padding: "5px 10px", background: "#22D3EE", color: "#0a0a0a", border: "none", borderRadius: 7, fontSize: 11, fontWeight: 600, cursor: "pointer" }}
                            >
                              PPTX
                            </button>
                          </div>
                        </div>

                        {/* Expanded lesson preview */}
                        {selectedLesson?.id === lesson.id && (
                          <div style={{ borderTop: "1px solid var(--border)", padding: "14px", background: "var(--surface2)" }}>
                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
                              <button
                                onClick={() => saveLesson(lesson)}
                                data-save-btn
                                style={{ padding: "6px 14px", background: lessonSaved === lesson.id ? "var(--success)" : "var(--surface)", color: lessonSaved === lesson.id ? "#fff" : "var(--text2)", border: "1px solid var(--border)", borderRadius: 8, fontSize: 12, fontWeight: 700, cursor: "pointer" }}
                              >
                                {lessonSaved === lesson.id ? "✓ Saved" : "Save Lesson"}
                              </button>
                              <div style={{ display: "flex", gap: 5 }}>
                                <button onClick={() => exportLessonTXT(lesson)} style={{ padding: "6px 12px", background: "var(--surface)", color: "var(--text2)", border: "1px solid var(--border)", borderRadius: 8, fontSize: 12, fontWeight: 600, cursor: "pointer" }}>TXT</button>
                                <button
                                  onClick={() => exportLessonPDF(lesson)}
                                  style={{ padding: "6px 12px", background: "var(--primary)", color: "#fff", border: "none", borderRadius: 8, fontSize: 12, fontWeight: 700, cursor: "pointer" }}
                                >
                                  PDF
                                </button>
                                <button
                                  onClick={() => exportLessonPPTX(lesson)}
                                  style={{ padding: "6px 12px", background: "#22D3EE", color: "#0a0a0a", border: "none", borderRadius: 8, fontSize: 12, fontWeight: 700, cursor: "pointer" }}
                                >
                                  📑 PPTX
                                </button>
                              </div>
                            </div>
                            <div style={{ lineHeight: 1.7, fontSize: 13, color: "var(--text)", maxHeight: 400, overflowY: "auto" }}>
                              <ReactMarkdown remarkPlugins={[remarkGfm]}>{lesson.content}</ReactMarkdown>
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              ) : null}

              {/* Full unit markdown content */}
              <div style={{ lineHeight: 1.7, fontSize: 14, color: "var(--text)", borderTop: lessons.length > 0 ? "1px solid var(--border)" : "none", paddingTop: lessons.length > 0 ? 20 : 0 }}>
                <ReactMarkdown
                  remarkPlugins={[remarkGfm]}
                  components={{
                    h1: ({ children }) => <h1 style={{ fontSize: 20, fontWeight: 900, margin: "20px 0 10px", color: "var(--text)" }}>{children}</h1>,
                    h2: ({ children }) => <h2 style={{ fontSize: 16, fontWeight: 800, margin: "18px 0 8px", color: "var(--text)", borderBottom: "1px solid var(--border)", paddingBottom: 5 }}>{children}</h2>,
                    h3: ({ children }) => <h3 style={{ fontSize: 14, fontWeight: 700, margin: "14px 0 6px", color: "var(--text)" }}>{children}</h3>,
                    p: ({ children }) => <p style={{ margin: "6px 0", lineHeight: 1.7 }}>{children}</p>,
                    ul: ({ children }) => <ul style={{ margin: "6px 0 6px 20px", paddingLeft: 4 }}>{children}</ul>,
                    ol: ({ children }) => <ol style={{ margin: "6px 0 6px 20px", paddingLeft: 4 }}>{children}</ol>,
                    li: ({ children }) => <li style={{ margin: "3px 0" }}>{children}</li>,
                    strong: ({ children }) => <strong style={{ fontWeight: 700 }}>{children}</strong>,
                    blockquote: ({ children }) => <blockquote style={{ borderLeft: "3px solid var(--primary)", paddingLeft: 12, margin: "10px 0", color: "var(--text2)", fontStyle: "italic" }}>{children}</blockquote>,
                    table: ({ children }) => <div style={{ overflowX: "auto", margin: "10px 0" }}><table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>{children}</table></div>,
                    thead: ({ children }) => <thead style={{ background: "var(--primary)" }}>{children}</thead>,
                    th: ({ children }) => <th style={{ padding: "7px 10px", color: "#fff", fontWeight: 700, textAlign: "left", fontSize: 12 }}>{children}</th>,
                    td: ({ children }) => <td style={{ padding: "6px 10px", borderBottom: "1px solid var(--border)", verticalAlign: "top" }}>{children}</td>,
                    tr: ({ children }) => <tr style={{ borderBottom: "1px solid var(--border)" }}>{children}</tr>,
                    hr: () => <hr style={{ border: "none", borderTop: "1px solid var(--border)", margin: "14px 0" }} />,
                  }}
                >
                  {selected.content || ""}
                </ReactMarkdown>
              </div>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "100%", color: "var(--text3)", textAlign: "center" }}>
              <div style={{ fontSize: 40, marginBottom: 16, color: "var(--primary)", fontWeight: 800 }}>Unit Library</div>
              <p style={{ fontSize: 16, fontWeight: 600, marginBottom: 8, color: "var(--text2)" }}>Select a unit to read it</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
