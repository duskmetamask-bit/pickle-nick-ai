"use client";

import { useState, useEffect } from "react";

const YEAR_LEVELS = ["Pre-Primary", "Year 1", "Year 2", "Year 3", "Year 4", "Year 5", "Year 6"];
const SUBJECTS = ["Mathematics", "English", "Science", "HASS", "Technologies", "The Arts", "Health & Physical Education", "Languages"];
const FOCUS_AREAS = ["Lesson Planning", "Assessment Design", "Rubrics & Feedback", "Differentiation", "Behaviour Management", "Classroom Routines", "Parent Communication", "Reporting", "Unit Planning", "Inquiry Learning"];

interface SavedDoc { id: string; type: string; label: string; content: string; savedAt: number; }
interface ProfileData { name: string; yearLevels: string[]; subjects: string[]; focusAreas?: string[]; school?: string; }

const TYPE_LABELS: Record<string, { label: string; icon: string; color: string }> = {
  lesson: { label: "Lesson Plan", icon: "", color: "#6366f1" },
  rubric: { label: "Rubric", icon: "", color: "#16a34a" },
  assessment: { label: "Assessment", icon: "", color: "#ea580c" },
  unit: { label: "Unit", icon: "", color: "#9333ea" },
  worksheet: { label: "Worksheet", icon: "", color: "#f59e0b" },
  writing: { label: "Writing Feedback", icon: "", color: "#22d3ee" },
  other: { label: "Document", icon: "", color: "#64748b" },
};

function downloadDoc(doc: SavedDoc) {
  const blob = new Blob([doc.content], { type: "text/plain" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a"); a.href = url;
  a.download = `${doc.label}_${new Date(doc.savedAt).toISOString().slice(0,10)}.txt`; a.click();
  URL.revokeObjectURL(url);
}

function deleteDoc(id: string, setDocs: React.Dispatch<React.SetStateAction<SavedDoc[]>>) {
  const existing = JSON.parse(localStorage.getItem("pn-saved-docs") || "[]") as SavedDoc[];
  const updated = existing.filter(d => d.id !== id);
  localStorage.setItem("pn-saved-docs", JSON.stringify(updated));
  setDocs(updated);
}

export default function ProfileView() {
  const [name, setName] = useState("");
  const [years, setYears] = useState<string[]>([]);
  const [subjects, setSubjects] = useState<string[]>([]);
  const [focus, setFocus] = useState<string[]>([]);
  const [school, setSchool] = useState("");
  const [saved, setSaved] = useState(false);
  const [savedDocs, setSavedDocs] = useState<SavedDoc[]>([]);
  const [activeSection, setActiveSection] = useState<"profile" | "documents">("profile");

  useEffect(() => {
    const p = localStorage.getItem("pn-profile");
    if (p) {
      try {
        const parsed = JSON.parse(p) as ProfileData;
        setName(parsed.name || "");
        setYears(parsed.yearLevels || []);
        setSubjects(parsed.subjects || []);
        setFocus(parsed.focusAreas || []);
        setSchool(parsed.school || "");
      } catch {}
    }
    const docs = JSON.parse(localStorage.getItem("pn-saved-docs") || "[]") as SavedDoc[];
    setSavedDocs(docs);
  }, []);

  function toggle(arr: string[], item: string, set: (v: string[]) => void) {
    set(arr.includes(item) ? arr.filter(x => x !== item) : [...arr, item]);
  }

  function save() {
    const p: ProfileData = { name, yearLevels: years, subjects, focusAreas: focus, school };
    localStorage.setItem("pn-profile", JSON.stringify(p));
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  return (
    <div style={{ minHeight: "100vh" }}>
      {/* Header */}
      <div style={{ padding: "20px 28px", borderBottom: "1px solid var(--border-subtle)" }}>
        <h1 style={{ fontSize: 20, fontWeight: 800, letterSpacing: "-0.01em", marginBottom: 4 }}>My Profile</h1>
        <p style={{ color: "var(--text-2)", fontSize: 13 }}>Your info and saved documents</p>
      </div>

      {/* Section tabs */}
      <div style={{ display: "flex", borderBottom: "1px solid var(--border-subtle)", padding: "0 28px" }}>
        {(["profile", "documents"] as const).map(sec => (
          <button
            key={sec}
            onClick={() => setActiveSection(sec)}
            style={{
              padding: "14px 20px", background: "transparent", border: "none",
              borderBottom: `2px solid ${activeSection === sec ? "var(--primary)" : "transparent"}`,
              color: activeSection === sec ? "var(--text)" : "var(--text-2)",
              fontSize: 13, fontWeight: activeSection === sec ? 600 : 400,
              cursor: "pointer", display: "flex", alignItems: "center", gap: 8,
              transition: "color 0.15s",
            }}
          >
            {sec === "profile" ? (
              <>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                Profile
              </>
            ) : (
              <>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/></svg>
                Saved ({savedDocs.length})
              </>
            )}
          </button>
        ))}
      </div>

      {activeSection === "profile" ? (
        <div style={{ padding: "28px", maxWidth: 640 }}>
          {/* Name */}
          <div style={{ marginBottom: 24 }}>
            <label style={{ display: "block", fontSize: 11, fontWeight: 700, color: "var(--text-3)", marginBottom: 8, textTransform: "uppercase", letterSpacing: "0.06em" }}>
              Your Name
            </label>
            <input
              value={name}
              onChange={e => setName(e.target.value)}
              style={{
                width: "100%", padding: "11px 14px",
                background: "var(--surface)", color: "var(--text)",
                border: "1px solid var(--border-subtle)",
                borderRadius: "var(--radius)",
                fontSize: 15, outline: "none",
                transition: "border-color 0.15s",
              }}
              onFocus={e => e.currentTarget.style.borderColor = "var(--primary)"}
              onBlur={e => e.currentTarget.style.borderColor = "var(--border-subtle)"}
            />
          </div>

          {/* School */}
          <div style={{ marginBottom: 24 }}>
            <label style={{ display: "block", fontSize: 11, fontWeight: 700, color: "var(--text-3)", marginBottom: 8, textTransform: "uppercase", letterSpacing: "0.06em" }}>
              School / Setting <span style={{ color: "var(--text-3)", fontWeight: 400, textTransform: "none" }}>— optional</span>
            </label>
            <input
              value={school}
              onChange={e => setSchool(e.target.value)}
              placeholder="e.g. Perth Primary School"
              style={{
                width: "100%", padding: "11px 14px",
                background: "var(--surface)", color: "var(--text)",
                border: "1px solid var(--border-subtle)",
                borderRadius: "var(--radius)",
                fontSize: 15, outline: "none",
                transition: "border-color 0.15s",
              }}
              onFocus={e => e.currentTarget.style.borderColor = "var(--primary)"}
              onBlur={e => e.currentTarget.style.borderColor = "var(--border-subtle)"}
            />
          </div>

          {/* Year levels */}
          <div style={{ marginBottom: 24 }}>
            <label style={{ display: "block", fontSize: 11, fontWeight: 700, color: "var(--text-3)", marginBottom: 8, textTransform: "uppercase", letterSpacing: "0.06em" }}>
              Year Levels You Teach
            </label>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
              {YEAR_LEVELS.map(yl => {
                const sel = years.includes(yl);
                return (
                  <button
                    key={yl}
                    onClick={() => toggle(years, yl, setYears)}
                    style={{
                      padding: "7px 14px",
                      background: sel ? "var(--primary-dim)" : "var(--surface)",
                      color: sel ? "var(--primary-hover)" : "var(--text-2)",
                      border: `1px solid ${sel ? "rgba(99,102,241,0.3)" : "var(--border-subtle)"}`,
                      borderRadius: "var(--radius-full)",
                      fontSize: 13, fontWeight: sel ? 600 : 400,
                      cursor: "pointer",
                      transition: "all 0.12s",
                    }}
                  >
                    {yl}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Subjects */}
          <div style={{ marginBottom: 24 }}>
            <label style={{ display: "block", fontSize: 11, fontWeight: 700, color: "var(--text-3)", marginBottom: 8, textTransform: "uppercase", letterSpacing: "0.06em" }}>
              Subjects You Teach
            </label>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
              {SUBJECTS.map(sub => {
                const sel = subjects.includes(sub);
                return (
                  <button
                    key={sub}
                    onClick={() => toggle(subjects, sub, setSubjects)}
                    style={{
                      padding: "7px 14px",
                      background: sel ? "var(--primary-dim)" : "var(--surface)",
                      color: sel ? "var(--primary-hover)" : "var(--text-2)",
                      border: `1px solid ${sel ? "rgba(99,102,241,0.3)" : "var(--border-subtle)"}`,
                      borderRadius: "var(--radius-full)",
                      fontSize: 13, fontWeight: sel ? 600 : 400,
                      cursor: "pointer",
                      transition: "all 0.12s",
                    }}
                  >
                    {sub}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Focus areas */}
          <div style={{ marginBottom: 32 }}>
            <label style={{ display: "block", fontSize: 11, fontWeight: 700, color: "var(--text-3)", marginBottom: 8, textTransform: "uppercase", letterSpacing: "0.06em" }}>
              Areas You Want Help With
            </label>
            <p style={{ color: "var(--text-3)", fontSize: 12, marginBottom: 10 }}>PickleNickAI will prioritise these areas</p>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
              {FOCUS_AREAS.map(area => {
                const sel = focus.includes(area);
                return (
                  <button
                    key={area}
                    onClick={() => toggle(focus, area, setFocus)}
                    style={{
                      padding: "7px 14px",
                      background: sel ? "var(--accent-dim)" : "var(--surface)",
                      color: sel ? "var(--accent)" : "var(--text-2)",
                      border: `1px solid ${sel ? "rgba(34,211,238,0.3)" : "var(--border-subtle)"}`,
                      borderRadius: "var(--radius-full)",
                      fontSize: 13, fontWeight: sel ? 600 : 400,
                      cursor: "pointer",
                      transition: "all 0.12s",
                    }}
                  >
                    {area}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Save button */}
          <button
            onClick={save}
            style={{
              padding: "12px 28px",
              background: saved ? "var(--success)" : "var(--primary)",
              color: "#fff",
              border: "none",
              borderRadius: "var(--radius)",
              fontWeight: 700, fontSize: 14,
              cursor: "pointer",
              transition: "all 0.15s",
              display: "inline-flex", alignItems: "center", gap: 8,
            }}
          >
            {saved ? (
              <>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>
                Saved!
              </>
            ) : "Save Profile"}
          </button>
        </div>
      ) : (
        /* Saved Documents */
        <div style={{ padding: "24px 28px" }}>
          {savedDocs.length === 0 ? (
            <div style={{ textAlign: "center", padding: "60px 20px" }}>
              <div style={{ fontSize: 40, marginBottom: 12 }}>📂</div>
              <div style={{ fontSize: 16, fontWeight: 700, marginBottom: 8, color: "var(--text-2)" }}>No saved documents yet</div>
              <div style={{ fontSize: 13, color: "var(--text-3)" }}>
                Use the <strong style={{ fontWeight: 600, color: "var(--text-2)" }}>Save</strong> button on any chat response to save it here
              </div>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {savedDocs.map(doc => {
                const typeInfo = TYPE_LABELS[doc.type] || TYPE_LABELS.other;
                return (
                  <div key={doc.id} style={{
                    background: "var(--surface)",
                    border: "1px solid var(--border-subtle)",
                    borderRadius: "var(--radius-lg)",
                    padding: "16px 20px",
                    display: "flex", alignItems: "flex-start", gap: 14,
                    transition: "border-color 0.12s",
                  }}>
                    <div style={{
                      width: 40, height: 40, borderRadius: 10,
                      background: `${typeInfo.color}15`,
                      display: "flex", alignItems: "center", justifyContent: "center",
                      fontSize: 18, flexShrink: 0,
                    }}>
                      {typeInfo.icon}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 2, color: "var(--text)" }}>
                        <span style={{ color: typeInfo.color, fontSize: 12, fontWeight: 600 }}>{typeInfo.label}</span>
                        {": "}{doc.label}
                      </div>
                      <div style={{ fontSize: 12, color: "var(--text-3)" }}>
                        Saved {new Date(doc.savedAt).toLocaleDateString("en-AU", { day: "numeric", month: "short", year: "numeric" })}
                      </div>
                      <div style={{ fontSize: 12, color: "var(--text-3)", marginTop: 4, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        {doc.content.slice(0, 120)}...
                      </div>
                    </div>
                    <div style={{ display: "flex", gap: 6, flexShrink: 0 }}>
                      <button
                        onClick={() => downloadDoc(doc)}
                        style={{
                          padding: "6px 12px",
                          background: "var(--surface-2)",
                          border: "1px solid var(--border)",
                          borderRadius: "var(--radius-sm)",
                          fontSize: 12, color: "var(--text-2)",
                          cursor: "pointer",
                          transition: "all 0.12s",
                        }}
                      >
                        Download
                      </button>
                      <button
                        onClick={() => deleteDoc(doc.id, setSavedDocs)}
                        style={{
                          padding: "6px 10px",
                          background: "var(--danger-dim)",
                          border: "1px solid rgba(248,113,113,0.2)",
                          borderRadius: "var(--radius-sm)",
                          fontSize: 12, color: "var(--danger)",
                          cursor: "pointer",
                          transition: "all 0.12s",
                        }}
                      >
                        ✕
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}