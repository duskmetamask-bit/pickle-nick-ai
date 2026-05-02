"use client";

import { useState } from "react";

interface DashboardProps {
  onNavigate?: (tab: string) => void;
}

// ─── Types ─────────────────────────────────────────────────────────
type ActivityType = "chat" | "lesson" | "export" | "rubric" | "worksheet" | "feedback" | "diff" | "writing";

interface ActivityItem {
  action: string;
  detail: string;
  time: string;
  type: ActivityType;
}

interface SkillUsage {
  name: string;
  uses: number;
  max: number;
  color: string;
}

interface QuickAction {
  label: string;
  icon: React.ReactNode;
  tab: string;
  primary?: boolean;
}

// ─── Mock data ──────────────────────────────────────────────────────
const STATS = [
  { label: "Total Sessions", value: "127", icon: <IconChat />, color: "#6366f1" },
  { label: "Lessons Generated", value: "43", icon: <IconLesson />, color: "#22d3ee" },
  { label: "Files Exported", value: "89", icon: <IconExport />, color: "#34d399" },
  { label: "Help Requests", value: "28", icon: <IconHelp />, color: "#f59e0b" },
];

const ACTIVITY: ActivityItem[] = [
  { action: "Lesson plan generated", detail: "Year 4 History — British Colonisation", time: "2 min ago", type: "lesson" },
  { action: "PDF exported", detail: "Science Assessment Rubric", time: "14 min ago", type: "export" },
  { action: "Chat session", detail: "28 min — behaviour support query", time: "41 min ago", type: "chat" },
  { action: "Rubric created", detail: "Year 2 Mathematics — Geometry", time: "1 hr ago", type: "rubric" },
  { action: "Worksheet generated", detail: "Year 5 English — Persuasive Text", time: "2 hr ago", type: "worksheet" },
  { action: "Feedback report", detail: "Year 3 Writing — Narrative", time: "3 hr ago", type: "feedback" },
  { action: "Differentiation plan", detail: "Year 1 Maths — Number Sense", time: "5 hr ago", type: "diff" },
];

const SKILLS: SkillUsage[] = [
  { name: "Lesson Planning", uses: 38, max: 38, color: "#6366f1" },
  { name: "Assessment Design", uses: 27, max: 38, color: "#22d3ee" },
  { name: "Differentiation Engine", uses: 19, max: 38, color: "#34d399" },
  { name: "Feedback Reports", uses: 14, max: 38, color: "#f59e0b" },
];

const QUICK_ACTIONS: QuickAction[] = [
  { label: "New Chat", icon: <IconChat />, tab: "chat", primary: true },
  { label: "Lesson Plan", icon: <IconLesson />, tab: "planner" },
  { label: "Upload Image", icon: <IconImage />, tab: "chat" },
  { label: "Help", icon: <IconHelp />, tab: "profile" },
];

// ─── SVG Icons (consistent stroke-based) ───────────────────────────
function IconChat() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
    </svg>
  );
}
function IconLesson() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
      <line x1="16" y1="2" x2="16" y2="6"/>
      <line x1="8" y1="2" x2="8" y2="6"/>
      <line x1="3" y1="10" x2="21" y2="10"/>
    </svg>
  );
}
function IconExport() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
      <polyline points="7 10 12 15 17 10"/>
      <line x1="12" y1="15" x2="12" y2="3"/>
    </svg>
  );
}
function IconHelp() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10"/>
      <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/>
      <line x1="12" y1="17" x2="12.01" y2="17"/>
    </svg>
  );
}
function IconImage() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
      <circle cx="8.5" cy="8.5" r="1.5"/>
      <polyline points="21 15 16 10 5 21"/>
    </svg>
  );
}
function IconCheck() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20 6 9 17 4 12"/>
    </svg>
  );
}

// ─── Helpers ─────────────────────────────────────────────────────────
function getDateLabel(): string {
  const days = ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"];
  const months = ["January","February","March","April","May","June","July","August","September","October","November","December"];
  const d = new Date();
  return `${days[d.getDay()]}, ${months[d.getMonth()]} ${d.getDate()} ${d.getFullYear()}`;
}

// ─── Activity type badge ────────────────────────────────────────────
function ActivityBadge({ type }: { type: ActivityType }) {
  const map: Record<ActivityType, { label: string; bg: string; color: string }> = {
    chat:     { label: "Chat",         bg: "rgba(99,102,241,0.10)", color: "#6366f1" },
    lesson:   { label: "Lesson",       bg: "rgba(34,211,238,0.10)",  color: "#22d3ee" },
    export:   { label: "Export",       bg: "rgba(52,211,153,0.10)",  color: "#34d399" },
    rubric:   { label: "Rubric",       bg: "rgba(99,102,241,0.10)",  color: "#6366f1" },
    worksheet:{ label: "Worksheet",   bg: "rgba(245,158,11,0.10)",  color: "#f59e0b" },
    feedback: { label: "Feedback",    bg: "rgba(99,102,241,0.10)",  color: "#6366f1" },
    diff:     { label: "Differentiation", bg: "rgba(34,211,238,0.10)", color: "#22d3ee" },
    writing:  { label: "Writing",     bg: "rgba(245,158,11,0.10)",  color: "#f59e0b" },
  };
  const s = map[type] || map.chat;
  return (
    <span style={{
      display: "inline-flex", alignItems: "center",
      padding: "2px 7px", borderRadius: 9999,
      background: s.bg, color: s.color,
      fontSize: 9, fontWeight: 700,
      textTransform: "uppercase", letterSpacing: "0.04em",
    }}>
      {s.label}
    </span>
  );
}

// ─── Stat Card ──────────────────────────────────────────────────────
function StatCard({ stat }: { stat: typeof STATS[0] }) {
  const [hovered, setHovered] = useState(false);
  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: "var(--surface)",
        border: "1px solid var(--border-subtle)",
        borderRadius: 12,
        padding: "0.85rem 1rem",
        display: "flex", flexDirection: "column", gap: 6,
        transition: "all 0.15s ease",
        transform: hovered ? "translateY(-2px)" : "none",
        boxShadow: hovered ? "0 4px 16px rgba(0,0,0,0.06)" : "none",
        cursor: "default",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <span style={{ fontSize: 10, color: "var(--text-3)", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.06em" }}>
          {stat.label}
        </span>
        <span style={{ color: stat.color, opacity: 0.7 }}>{stat.icon}</span>
      </div>
      <div style={{ fontSize: 24, fontWeight: 800, letterSpacing: "-0.02em", color: stat.color }}>
        {stat.value}
      </div>
    </div>
  );
}

// ─── Main Component ──────────────────────────────────────────────────
export default function DashboardView({ onNavigate }: DashboardProps) {
  const navigate = (tab: string) => {
    if (onNavigate) onNavigate(tab);
  };

  return (
    <div style={{ padding: "24px 28px", maxWidth: 1200, margin: "0 auto" }}>
      {/* Header */}
      <div style={{ marginBottom: 20 }}>
        <h1 style={{ fontSize: 18, fontWeight: 800, letterSpacing: "-0.02em", marginBottom: 3, color: "var(--text)" }}>
          Dashboard
        </h1>
        <p style={{ fontSize: 12, color: "var(--text-3)" }}>
          {getDateLabel()}
        </p>
      </div>

      {/* Stats row */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 10, marginBottom: 20 }}>
        {STATS.map(stat => (
          <StatCard key={stat.label} stat={stat} />
        ))}
      </div>

      {/* Main content grid */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 300px", gap: 16, alignItems: "start" }}>

        {/* Left column */}
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>

          {/* Popular Skills */}
          <div style={{
            background: "var(--surface)",
            border: "1px solid var(--border-subtle)",
            borderRadius: 12,
            padding: "1.1rem",
          }}>
            <div style={{ fontSize: 12, fontWeight: 700, marginBottom: 14, color: "var(--text)" }}>
              Most Used Skills
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {SKILLS.map(skill => (
                <div key={skill.name}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 5 }}>
                    <span style={{ fontSize: 12, fontWeight: 600, color: "var(--text)" }}>{skill.name}</span>
                    <span style={{ fontSize: 11, color: "var(--text-3)" }}>{skill.uses} uses</span>
                  </div>
                  <div style={{ height: 5, background: "var(--border-subtle)", borderRadius: 9999, overflow: "hidden" }}>
                    <div style={{
                      height: "100%",
                      width: `${(skill.uses / skill.max) * 100}%`,
                      background: skill.color,
                      borderRadius: 9999,
                      transition: "width 0.5s ease",
                      opacity: 0.75,
                    }} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Recent Activity */}
          <div style={{
            background: "var(--surface)",
            border: "1px solid var(--border-subtle)",
            borderRadius: 12,
            padding: "1.1rem",
          }}>
            <div style={{ fontSize: 12, fontWeight: 700, marginBottom: 14, color: "var(--text)" }}>
              Recent Activity
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 11 }}>
              {ACTIVITY.map((item, i) => (
                <div key={i} style={{ display: "flex", flexDirection: "column", gap: 3 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                    <ActivityBadge type={item.type} />
                    <span style={{ fontSize: 12, fontWeight: 600, color: "var(--text)" }}>{item.action}</span>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between" }}>
                    <span style={{ fontSize: 11, color: "var(--text-2)" }}>{item.detail}</span>
                    <span style={{ fontSize: 10, color: "var(--text-3)" }}>{item.time}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right column */}
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>

          {/* Quick Actions */}
          <div style={{
            background: "var(--surface)",
            border: "1px solid var(--border-subtle)",
            borderRadius: 12,
            padding: "1rem",
          }}>
            <div style={{ fontSize: 12, fontWeight: 700, marginBottom: 12, color: "var(--text)" }}>
              Quick Actions
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
              {QUICK_ACTIONS.map(action => {
                const [hovered, setHovered] = useState(false);
                return (
                  <button
                    key={action.label}
                    onClick={() => navigate(action.tab)}
                    onMouseEnter={() => setHovered(true)}
                    onMouseLeave={() => setHovered(false)}
                    style={{
                      display: "flex", alignItems: "center", gap: 9,
                      padding: "9px 12px",
                      background: action.primary
                        ? "linear-gradient(135deg, #6366f1, #818cf8)"
                        : hovered ? "var(--surface-2)" : "transparent",
                      color: action.primary ? "#fff" : "var(--text)",
                      border: action.primary ? "none" : "1px solid var(--border-subtle)",
                      borderRadius: 9,
                      fontSize: 12, fontWeight: 600,
                      cursor: "pointer",
                      transition: "all 0.15s ease",
                      boxShadow: action.primary && hovered ? "0 4px 12px rgba(99,102,241,0.3)" : "none",
                    }}
                  >
                    <span style={{ opacity: action.primary ? 1 : 0.7 }}>{action.icon}</span>
                    {action.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Getting Started Card */}
          <div style={{
            background: "linear-gradient(135deg, rgba(99,102,241,0.06) 0%, rgba(34,211,238,0.04) 100%)",
            border: "1px solid rgba(99,102,241,0.15)",
            borderRadius: 12,
            padding: "1.1rem",
          }}>
            <div style={{ fontSize: 12, fontWeight: 700, marginBottom: 8, color: "var(--text)" }}>
              Getting Started
            </div>
            <p style={{ fontSize: 11, color: "var(--text-2)", lineHeight: 1.65, marginBottom: 12 }}>
              Start a chat and ask me anything about lesson planning, behaviour support, assessment design, or AC9 curriculum alignment.
            </p>
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              {[
                "Try: 'Generate a Year 3 Maths lesson on Fractions'",
                "Try: 'Create a behaviour support plan template'",
                "Try: 'Build a rubric for Year 5 Persuasive Writing'",
              ].map((tip, i) => (
                <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: 6 }}>
                  <span style={{ color: "#6366f1", fontSize: 10, marginTop: 1, flexShrink: 0 }}><IconCheck /></span>
                  <span style={{ fontSize: 10, color: "var(--text-3)", lineHeight: 1.5 }}>{tip}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}