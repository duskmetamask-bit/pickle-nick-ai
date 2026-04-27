"use client";

import { useState } from "react";

const NAV_ITEMS = [
  {
    id: "chat", label: "Chat", icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
      </svg>
    ),
  },
  {
    id: "library", label: "Unit Library", icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>
      </svg>
    ),
  },
  {
    id: "planner", label: "Lesson Planner", icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
      </svg>
    ),
  },
  {
    id: "rubric", label: "Rubric Generator", icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/>
        <line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/>
      </svg>
    ),
  },
  {
    id: "automark", label: "Auto-Marking", icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="9 11 12 14 22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/>
      </svg>
    ),
  },
  {
    id: "curriculum", label: "Curriculum", icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/>
        <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/>
      </svg>
    ),
  },
  {
    id: "profile", label: "My Profile", icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
        <circle cx="12" cy="7" r="4"/>
      </svg>
    ),
  },
];

interface Props {
  activeTab: string;
  onTabChange: (tab: string) => void;
  profile: { name: string; subjects: string[] };
}

export default function Sidebar({ activeTab, onTabChange, profile }: Props) {
  const [hovered, setHovered] = useState<string | null>(null);

  return (
    <div style={{
      width: 220,
      minHeight: "100vh",
      background: "var(--surface)",
      borderRight: "1px solid var(--border-subtle)",
      display: "flex",
      flexDirection: "column",
      position: "fixed",
      left: 0,
      top: 0,
      bottom: 0,
      zIndex: 50,
    }}>
      {/* Logo */}
      <div style={{
        padding: "18px 16px",
        borderBottom: "1px solid var(--border-subtle)",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{
            width: 32, height: 32, borderRadius: 8,
            background: "linear-gradient(135deg, #6366f1, #818cf8)",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontWeight: 900, fontSize: 12, color: "#fff",
            flexShrink: 0,
            boxShadow: "0 0 16px rgba(99,102,241,0.3)",
          }}>PN</div>
          <div>
            <div style={{ fontWeight: 800, fontSize: 14, color: "var(--text)", letterSpacing: "-0.01em" }}>
              PickleNickAI
            </div>
            <div style={{ fontSize: 10, color: "var(--text-3)", fontWeight: 500 }}>
              Teacher Assistant
            </div>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav style={{
        flex: 1, padding: "10px 8px",
        display: "flex", flexDirection: "column", gap: 2,
        overflowY: "auto",
      }}>
        {NAV_ITEMS.map(item => {
          const isActive = activeTab === item.id;
          const isHovered = hovered === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onTabChange(item.id)}
              onMouseEnter={() => setHovered(item.id)}
              onMouseLeave={() => setHovered(null)}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                padding: "9px 10px",
                background: isActive
                  ? "var(--primary-dim)"
                  : isHovered
                    ? "rgba(255,255,255,0.04)"
                    : "transparent",
                color: isActive ? "var(--primary-hover)" : isHovered ? "var(--text)" : "var(--text-2)",
                border: "none",
                borderRadius: "var(--radius-sm)",
                cursor: "pointer",
                fontSize: 13,
                fontWeight: isActive ? 600 : 500,
                textAlign: "left",
                width: "100%",
                transition: "all 0.12s",
              }}
            >
              <span style={{ opacity: isActive ? 1 : 0.7, flexShrink: 0 }}>{item.icon}</span>
              <span>{item.label}</span>
              {isActive && (
                <div style={{
                  marginLeft: "auto",
                  width: 5, height: 5, borderRadius: "50%",
                  background: "var(--primary)",
                }} />
              )}
            </button>
          );
        })}
      </nav>

      {/* Divider + Profile */}
      <div style={{ borderTop: "1px solid var(--border-subtle)", padding: "12px 16px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{
            width: 32, height: 32, borderRadius: "50%",
            background: "linear-gradient(135deg, #6366f1, #22d3ee)",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontWeight: 700, fontSize: 12, color: "#fff",
            flexShrink: 0,
          }}>
            {profile.name ? profile.name[0].toUpperCase() : "T"}
          </div>
          <div style={{ minWidth: 0, flex: 1 }}>
            <div style={{
              fontWeight: 600, fontSize: 13, color: "var(--text)",
              overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
            }}>
              {profile.name || "Teacher"}
            </div>
            <div style={{
              fontSize: 11, color: "var(--text-3)",
              overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
            }}>
              {profile.subjects?.slice(0, 2).join(", ") || "F–6"}
            </div>
          </div>
          <button
            onClick={() => {
              localStorage.removeItem("pn-profile");
              window.location.reload();
            }}
            title="Sign out"
            style={{
              background: "none", border: "none",
              color: "var(--text-3)", cursor: "pointer",
              padding: 4, fontSize: 14,
              display: "flex", alignItems: "center",
              borderRadius: 4,
            }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
              <polyline points="16 17 21 12 16 7"/>
              <line x1="21" y1="12" x2="9" y2="12"/>
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}