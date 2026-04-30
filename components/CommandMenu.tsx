"use client";
import { useState, useEffect, useRef, useCallback } from "react";

interface Command {
  id: string;
  label: string;
  icon: React.ReactNode;
  shortcut?: string;
  action: () => void;
}

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onNavigate: (tab: string) => void;
  onUpgrade: () => void;
}

const COMMAND_MENU_ICON = (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
  </svg>
);

export default function CommandMenu({ isOpen, onClose, onNavigate, onUpgrade }: Props) {
  const [query, setQuery] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  const commands: Command[] = [
    {
      id: "open-chat",
      label: "Open Chat",
      shortcut: "Enter",
      icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>,
      action: () => { onNavigate("chat"); onClose(); },
    },
    {
      id: "new-lesson-plan",
      label: "New Lesson Plan",
      shortcut: "P",
      icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>,
      action: () => { onNavigate("planner"); onClose(); },
    },
    {
      id: "new-rubric",
      label: "New Rubric",
      shortcut: "R",
      icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/></svg>,
      action: () => { onNavigate("rubric"); onClose(); },
    },
    {
      id: "differentiate",
      label: "Differentiate Content",
      icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="2" width="8" height="8" rx="1.5"/><rect x="8" y="8" width="8" height="8" rx="1.5" fill="currentColor" fillOpacity="0.15"/><rect x="14" y="14" width="8" height="8" rx="1.5" fill="currentColor" fillOpacity="0.3"/></svg>,
      action: () => { onNavigate("differentiate"); onClose(); },
    },
    {
      id: "voice-mode",
      label: "Voice Mode",
      icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" y1="19" x2="12" y2="23"/><line x1="8" y1="23" x2="16" y2="23"/></svg>,
      action: () => { window.dispatchEvent(new CustomEvent("pn-activate-voice")); onClose(); },
    },
    {
      id: "unit-library",
      label: "Unit Library",
      icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg>,
      action: () => { onNavigate("library"); onClose(); },
    },
    {
      id: "my-profile",
      label: "My Profile",
      icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>,
      action: () => { onNavigate("profile"); onClose(); },
    },
    {
      id: "upgrade-pro",
      label: "Upgrade to Pro",
      icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>,
      action: () => { onUpgrade(); onClose(); },
    },
  ];

  const filtered = commands.filter(c =>
    c.label.toLowerCase().includes(query.toLowerCase())
  );

  const execute = useCallback((cmd: Command) => {
    cmd.action();
  }, []);

  // Keyboard navigation
  useEffect(() => {
    if (!isOpen) return;

    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") { onClose(); return; }
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setSelectedIndex(i => Math.min(i + 1, filtered.length - 1));
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setSelectedIndex(i => Math.max(i - 1, 0));
      } else if (e.key === "Enter") {
        e.preventDefault();
        if (filtered[selectedIndex]) execute(filtered[selectedIndex]);
      }
    }

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [isOpen, selectedIndex, filtered, execute, onClose]);

  // Focus input when opened
  useEffect(() => {
    if (isOpen) {
      setQuery("");
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  // Reset selection when query changes
  useEffect(() => {
    setSelectedIndex(0);
  }, [query]);

  if (!isOpen) return null;

  return (
    <div
      style={{
        position: "fixed", inset: 0, zIndex: 1000,
        background: "rgba(0,0,0,0.5)",
        display: "flex", alignItems: "flex-start", justifyContent: "center",
        paddingTop: "15vh",
        animation: "fade-in 0.15s var(--ease)",
      }}
      onClick={onClose}
    >
      <div
        style={{
          background: "var(--surface)",
          border: "1px solid var(--border)",
          borderRadius: "var(--radius-lg)",
          width: "100%",
          maxWidth: 480,
          boxShadow: "var(--shadow-xl)",
          overflow: "hidden",
          animation: "slide-up 0.15s var(--ease)",
        }}
        onClick={e => e.stopPropagation()}
      >
        {/* Search input */}
        <div style={{
          display: "flex",
          alignItems: "center",
          gap: 12,
          padding: "14px 16px",
          borderBottom: "1px solid var(--border-subtle)",
        }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--text-3)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
          </svg>
          <input
            ref={inputRef}
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Type a command or search..."
            style={{
              flex: 1,
              background: "transparent",
              border: "none",
              outline: "none",
              fontSize: 14,
              color: "var(--text)",
              fontFamily: "var(--font)",
            }}
          />
          <kbd style={{
            padding: "2px 6px",
            background: "var(--surface-2)",
            border: "1px solid var(--border)",
            borderRadius: 4,
            fontSize: 11,
            color: "var(--text-3)",
            fontFamily: "monospace",
          }}>ESC</kbd>
        </div>

        {/* Commands list */}
        <div style={{ maxHeight: 320, overflowY: "auto", padding: "6px" }}>
          {filtered.length === 0 && (
            <div style={{ padding: "24px", textAlign: "center", color: "var(--text-3)", fontSize: 13 }}>
              No commands found
            </div>
          )}
          {filtered.map((cmd, i) => (
            <button
              key={cmd.id}
              onClick={() => execute(cmd)}
              onMouseEnter={() => setSelectedIndex(i)}
              style={{
                width: "100%",
                display: "flex",
                alignItems: "center",
                gap: 10,
                padding: "9px 10px",
                background: i === selectedIndex ? "var(--primary-dim)" : "transparent",
                border: "none",
                borderRadius: "var(--radius-sm)",
                cursor: "pointer",
                textAlign: "left",
                color: i === selectedIndex ? "var(--primary-hover)" : "var(--text)",
                fontSize: 13,
                fontWeight: i === selectedIndex ? 600 : 400,
                transition: "all 0.1s",
              }}
            >
              <span style={{ color: i === selectedIndex ? "var(--primary)" : "var(--text-3)", flexShrink: 0 }}>
                {cmd.icon}
              </span>
              <span style={{ flex: 1 }}>{cmd.label}</span>
              {cmd.shortcut && (
                <kbd style={{
                  padding: "2px 6px",
                  background: i === selectedIndex ? "var(--primary)" : "var(--surface-2)",
                  border: "1px solid var(--border)",
                  borderRadius: 4,
                  fontSize: 10,
                  color: i === selectedIndex ? "#fff" : "var(--text-3)",
                  fontFamily: "monospace",
                }}>{cmd.shortcut}</kbd>
              )}
            </button>
          ))}
        </div>

        {/* Footer hint */}
        <div style={{
          borderTop: "1px solid var(--border-subtle)",
          padding: "8px 14px",
          display: "flex",
          alignItems: "center",
          gap: 12,
          fontSize: 11,
          color: "var(--text-3)",
        }}>
          <span>
            <kbd style={{ fontFamily: "monospace", background: "var(--surface-2)", padding: "1px 4px", borderRadius: 3 }}>↑↓</kbd> navigate
          </span>
          <span>
            <kbd style={{ fontFamily: "monospace", background: "var(--surface-2)", padding: "1px 4px", borderRadius: 3 }}>↵</kbd> select
          </span>
          <span>
            <kbd style={{ fontFamily: "monospace", background: "var(--surface-2)", padding: "1px 4px", borderRadius: 3 }}>ESC</kbd> close
          </span>
        </div>
      </div>
    </div>
  );
}
