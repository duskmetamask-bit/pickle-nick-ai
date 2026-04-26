"use client";

import { useState, useEffect } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

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

export default function LibraryView() {
  const [search, setSearch] = useState("");
  const [subject, setSubject] = useState("");
  const [year, setYear] = useState("");
  const [units, setUnits] = useState<Unit[]>([]);
  const [loading, setLoading] = useState(true);
  const [exportLoading, setExportLoading] = useState("");
  const [selected, setSelected] = useState<Unit | null>(null);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [selectedLesson, setSelectedLesson] = useState<Lesson | null>(null);
  const [lessonsLoading, setLessonsLoading] = useState(false);

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

  const filtered = units.filter(u => {
    const matchSearch = !search ||
      u.title.toLowerCase().includes(search.toLowerCase()) ||
      u.description?.toLowerCase().includes(search.toLowerCase());
    const matchSubject = !subject || u.subject?.toLowerCase().includes(subject.toLowerCase());
    const matchYear = !year || u.yearLevel.includes(year);
    return matchSearch && matchSubject && matchYear;
  });

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

      {/* Main: list + detail */}
      <div style={{ flex: 1, display: "grid", gridTemplateColumns: "320px 1fr", overflow: "hidden" }}>
        {/* Unit list */}
        <div style={{ borderRight: "1px solid var(--border)", overflowY: "auto" }}>
          {loading ? (
            <div style={{ padding: 40, textAlign: "center", color: "var(--text2)" }}>Loading...</div>
          ) : filtered.length === 0 ? (
            <div style={{ padding: 40, textAlign: "center", color: "var(--text2)" }}>No units match.</div>
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
                <div style={{ display: "flex", gap: 7, flexShrink: 0 }}>
                  <button onClick={exportFullUnitPDF} disabled={!!exportLoading && exportLoading.startsWith("full")} style={{ padding: "7px 13px", background: exportLoading === "full-pdf" ? "var(--surface2)" : "var(--primary)", color: exportLoading === "full-pdf" ? "var(--text3)" : "#fff", border: "none", borderRadius: 9, fontSize: 12, fontWeight: 700, cursor: exportLoading.startsWith("full") ? "not-allowed" : "pointer", whiteSpace: "nowrap" }}>
                    {exportLoading === "full-pdf" ? "..." : "PDF"}
                  </button>
                  <button onClick={exportFullUnitPPTX} disabled={!!exportLoading && exportLoading.startsWith("full")} style={{ padding: "7px 13px", background: exportLoading === "full-pptx" ? "var(--surface2)" : "#22D3EE", color: exportLoading === "full-pptx" ? "var(--text3)" : "#0a0a0a", border: "none", borderRadius: 9, fontSize: 12, fontWeight: 700, cursor: exportLoading.startsWith("full") ? "not-allowed" : "pointer", whiteSpace: "nowrap" }}>
                    {exportLoading === "full-pptx" ? "..." : "PPTX"}
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
                            <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 10 }}>
                              <div style={{ display: "flex", gap: 5 }}>
                                <button
                                  onClick={() => exportLessonPDF(lesson)}
                                  style={{ padding: "6px 14px", background: "var(--primary)", color: "#fff", border: "none", borderRadius: 8, fontSize: 12, fontWeight: 700, cursor: "pointer" }}
                                >
                                  📄 Download PDF
                                </button>
                                <button
                                  onClick={() => exportLessonPPTX(lesson)}
                                  style={{ padding: "6px 14px", background: "#22D3EE", color: "#0a0a0a", border: "none", borderRadius: 8, fontSize: 12, fontWeight: 700, cursor: "pointer" }}
                                >
                                  📊 Download PPTX
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
              <div style={{ fontSize: 48, marginBottom: 16 }}>📚</div>
              <p style={{ fontSize: 16, fontWeight: 600, marginBottom: 8, color: "var(--text2)" }}>Select a unit to read it</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
