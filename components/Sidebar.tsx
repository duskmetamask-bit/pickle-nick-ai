"use client";
import { motion, AnimatePresence } from "framer-motion";

// ── Icons (must be declared before NAV array to avoid TDZ) ──────────────────
const IconGrid     = () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>;
const IconChat     = () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>;
const IconDiff     = () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="8" height="8" rx="1.5"/><rect x="8" y="8" width="8" height="8" rx="1.5" fill="currentColor" fillOpacity="0.15"/><rect x="14" y="14" width="8" height="8" rx="1.5" fill="currentColor" fillOpacity="0.3"/></svg>;
const IconBook     = () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg>;
const IconCalendar = () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>;
const IconList     = () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/></svg>;
const IconCheck    = () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 11 12 14 22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/></svg>;
const IconPencil   = () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"/></svg>;
const IconGrid2    = () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18"/><path d="M9 21V9"/></svg>;
const IconBook2    = () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg>;
const IconUser     = () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>;
const IconCLeft    = () => <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"/></svg>;
const IconCRight   = () => <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"/></svg>;
const IconSun      = () => <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>;
const IconMoon     = () => <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>;
const IconLogout   = () => <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>;
const IconCmd      = () => <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>;

// ── Navigation (icons declared above to avoid TDZ) ───────────────────────────
const NAV = [
  { id: "dashboard",    label: "Dashboard",        icon: <IconGrid /> },
  { id: "chat",         label: "Chat",              icon: <IconChat /> },
  { id: "differentiate",label: "Differentiate",     icon: <IconDiff /> },
  { id: "library",      label: "Unit Library",       icon: <IconBook /> },
  { id: "planner",      label: "Lesson Planner",     icon: <IconCalendar /> },
  { id: "rubric",       label: "Rubric Generator",   icon: <IconList /> },
  { id: "automark",     label: "Auto-Marking",       icon: <IconCheck /> },
  { id: "writing",      label: "Writing Feedback",   icon: <IconPencil /> },
  { id: "worksheet",    label: "Worksheet Gen",       icon: <IconGrid2 /> },
  { id: "curriculum",   label: "Curriculum",          icon: <IconBook2 /> },
  { id: "profile",      label: "My Profile",          icon: <IconUser /> },
];

// ── Types ─────────────────────────────────────────────────────────────────────
interface Props {
  activeTab: string;
  onTabChange: (tab: string) => void;
  profile: { name: string; subjects?: string[] };
  isPro?: boolean;
  freeUses?: number;
  theme?: string;
  onToggleTheme?: () => void;
  onOpenCmdMenu?: () => void;
  collapsed?: boolean;
  onToggleCollapse?: () => void;
}

const FREE = 5;

// ── Shared style tokens ────────────────────────────────────────────────────────
const C = {
  glassBg:   "linear-gradient(180deg, rgba(13,13,22,0.98) 0%, rgba(17,17,28,0.99) 100%)",
  glass:     "blur(24px)",
  border:    "1px solid rgba(255,255,255,0.055)",
  shadow:    "4px 0 40px rgba(0,0,0,0.55), inset 0 0 50px rgba(99,102,241,0.02)",
  topGlow:   "radial-gradient(ellipse at 50% 0%, rgba(99,102,241,0.08) 0%, transparent 60%)",
  accentBg:  "linear-gradient(135deg, rgba(99,102,241,0.22) 0%, rgba(168,85,247,0.14) 100%)",
  accent:    "#c7d2fe",
  dim:       "rgba(148,163,184,0.78)",
  inactive:  "transparent",
};

// ── Component ─────────────────────────────────────────────────────────────────
export default function Sidebar({
  activeTab, onTabChange, profile,
  isPro = false, freeUses = 0,
  theme = "dark", onToggleTheme, onOpenCmdMenu,
  collapsed = false, onToggleCollapse,
}: Props) {
  return (
    <motion.div
      animate={{ width: collapsed ? 60 : 220 }}
      transition={{ duration: 0.22, ease: [0.25, 0.1, 0.25, 1] }}
      style={{
        minHeight: "100vh", background: C.glassBg,
        backdropFilter: C.glass, WebkitBackdropFilter: C.glass,
        borderRight: C.border, display: "flex", flexDirection: "column",
        position: "fixed", left: 0, top: 0, bottom: 0, zIndex: 50,
        overflow: "hidden", boxShadow: C.shadow,
      }}
    >
      {/* Ambient glow */}
      <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: "45%", background: C.topGlow, pointerEvents: "none" }} />

      {/* Header */}
      <div style={{
        padding: collapsed ? "18px 0 12px" : "18px 14px 12px",
        borderBottom: "1px solid rgba(255,255,255,0.05)",
        display: "flex", flexDirection: "column", alignItems: "center", gap: collapsed ? 0 : 10,
        position: "relative", zIndex: 1,
      }}>
        {/* Logo */}
        <div style={{ display: "flex", alignItems: "center", gap: 9, width: "100%", justifyContent: collapsed ? "center" : "flex-start" }}>
          <motion.div whileHover={{ scale: 1.1, rotate: -3 }} transition={{ type: "spring", stiffness: 400 }}
            style={{ width: 30, height: 30, borderRadius: 9, background: "linear-gradient(135deg, #6366f1 0%, #a855f7 50%, #22d3ee 100%)",
              display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 900, fontSize: 10.5, color: "#fff",
              flexShrink: 0, boxShadow: "0 0 18px rgba(99,102,241,0.45), 0 0 36px rgba(168,85,247,0.2)" }}>
            PN
          </motion.div>
          <AnimatePresence>
            {!collapsed && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.14 }} style={{ minWidth: 0 }}>
                <div style={{ fontWeight: 800, fontSize: 13.5, color: "#f1f5f9", letterSpacing: "-0.01em" }}>PickleNickAI</div>
                <div style={{ fontSize: 9.5, color: "rgba(148,163,184,0.65)", fontWeight: 500 }}>Teacher Assistant</div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Theme + Cmd */}
        <div style={{ display: "flex", flexDirection: "column", gap: 3, width: "100%" }}>
          <AnimatePresence>
            {!collapsed && onToggleTheme && (
              <motion.button onClick={onToggleTheme} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                whileHover={{ scale: 1.02, backgroundColor: "rgba(255,255,255,0.05)" }} whileTap={{ scale: 0.97 }}
                title={theme === "dark" ? "Light mode" : "Dark mode"}
                style={{ width: "100%", display: "flex", alignItems: "center", justifyContent: "center", gap: 5, padding: "6px 7px",
                  background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 7, cursor: "pointer",
                  color: "rgba(148,163,184,0.82)", fontSize: 10.5, fontWeight: 600 }}>
                {theme === "dark" ? <IconSun /> : <IconMoon />}
                {theme === "dark" ? "Light Mode" : "Dark Mode"}
              </motion.button>
            )}
          </AnimatePresence>
          <motion.button onClick={onOpenCmdMenu}
            whileHover={{ scale: 1.02, backgroundColor: "rgba(99,102,241,0.18)" }} whileTap={{ scale: 0.97 }}
            title="Command menu (Cmd+K)"
            style={{ width: collapsed ? 34 : "100%", display: "flex", alignItems: "center", justifyContent: "center", gap: 5, padding: "6px 7px",
              background: "linear-gradient(135deg, rgba(99,102,241,0.18) 0%, rgba(168,85,247,0.12) 100%)",
              border: "1px solid rgba(99,102,241,0.28)", borderRadius: 7, cursor: "pointer",
              color: "#a5b4fc", fontSize: 10.5, fontWeight: 600, boxShadow: "0 0 14px rgba(99,102,241,0.08)" }}>
            <IconCmd />
            {!collapsed && "Cmd+K"}
          </motion.button>
        </div>
      </div>

      {/* Collapse toggle */}
      <motion.button onClick={onToggleCollapse}
        whileHover={{ scale: 1.1, backgroundColor: "rgba(99,102,241,0.35)" }} whileTap={{ scale: 0.92 }}
        title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        style={{ position: "absolute", top: 70, right: -11, width: 22, height: 22, borderRadius: "50%",
          background: "linear-gradient(135deg, rgba(26,26,44,0.98) 0%, rgba(36,36,58,0.98) 100%)",
          backdropFilter: "blur(10px)", border: "1px solid rgba(99,102,241,0.35)",
          display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: "#a5b4fc", zIndex: 60,
          boxShadow: "0 3px 14px rgba(0,0,0,0.38), 0 0 18px rgba(99,102,241,0.14)" }}>
        {collapsed ? <IconCRight /> : <IconCLeft />}
      </motion.button>

      {/* Nav */}
      <nav style={{ flex: 1, padding: "8px 7px", display: "flex", flexDirection: "column", gap: 2, overflowY: "auto", overflowX: "hidden", position: "relative", zIndex: 1 }}>
        {NAV.map((item) => {
          const isActive = activeTab === item.id;
          return (
            <motion.button key={item.id} onClick={() => onTabChange(item.id)}
              whileHover={{ scale: 1.03, backgroundColor: isActive ? "rgba(99,102,241,0.22)" : "rgba(255,255,255,0.04)" }}
              whileTap={{ scale: 0.97 }}
              style={{
                display: "flex", alignItems: "center", gap: 9,
                padding: collapsed ? "8px 0" : "8px 9px",
                justifyContent: collapsed ? "center" : "flex-start",
                background: isActive ? C.accentBg : C.inactive,
                color: isActive ? C.accent : C.dim,
                border: "none", borderRadius: 9, cursor: "pointer", fontSize: 12.5,
                fontWeight: isActive ? 600 : 500, textAlign: "left", width: "100%", position: "relative",
                boxShadow: isActive ? "0 0 20px rgba(99,102,241,0.12), inset 0 0 12px rgba(99,102,241,0.04)" : "none",
                borderLeft: isActive ? "2px solid rgba(99,102,241,0.55)" : "2px solid transparent",
                transition: "background 0.15s, color 0.15s",
              }}>
              <span style={{ flexShrink: 0, display: "flex", filter: isActive ? "drop-shadow(0 0 5px rgba(99,102,241,0.5))" : "none", transition: "filter 0.15s" }}>
                {item.icon}
              </span>
              <AnimatePresence>
                {!collapsed && (
                  <motion.span initial={{ opacity: 0, width: 0 }} animate={{ opacity: 1, width: "auto" }}
                    exit={{ opacity: 0, width: 0 }} transition={{ duration: 0.14 }}
                    style={{ overflow: "hidden", whiteSpace: "nowrap" }}>
                    {item.label}
                  </motion.span>
                )}
              </AnimatePresence>
              {isActive && (
                <motion.div layoutId="sidebar-active-dot" style={{
                  marginLeft: "auto", width: 5.5, height: 5.5, borderRadius: "50%",
                  background: "linear-gradient(135deg, #6366f1 0%, #a855f7 100%)",
                  boxShadow: "0 0 7px rgba(99,102,241,0.65)",
                }} />
              )}
            </motion.button>
          );
        })}
      </nav>

      {/* Free usage bar */}
      {!isPro && freeUses > 0 && (
        <AnimatePresence>
          {!collapsed && (
            <motion.div initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
              transition={{ duration: 0.14 }}
              style={{ borderTop: "1px solid rgba(255,255,255,0.05)", padding: "9px 14px", position: "relative", zIndex: 1 }}>
              <div style={{ fontSize: 9.5, color: "rgba(148,163,184,0.68)", marginBottom: 4, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.04em" }}>
                Free — {FREE - freeUses} uses left
              </div>
              <div style={{ background: "rgba(255,255,255,0.05)", borderRadius: 5, height: 3.5, overflow: "hidden", border: "1px solid rgba(255,255,255,0.03)" }}>
                <motion.div animate={{ width: `${(freeUses / FREE) * 100}%` }}
                  transition={{ duration: 0.5, ease: [0.25, 0.1, 0.25, 1] }}
                  style={{ height: "100%",
                    background: freeUses >= FREE ? "linear-gradient(90deg, #ef4444, #f87171)" : "linear-gradient(90deg, #6366f1, #a855f7)",
                    boxShadow: `0 0 9px ${freeUses >= FREE ? "rgba(239,68,68,0.5)" : "rgba(99,102,241,0.5)"}`,
                  }} />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      )}

      {/* Profile + Sign out */}
      <div style={{
        borderTop: "1px solid rgba(255,255,255,0.05)", padding: collapsed ? "9px 0" : "9px 14px",
        display: "flex", flexDirection: "column", alignItems: "center", gap: 5,
        position: "relative", zIndex: 1, background: "rgba(255,255,255,0.012)",
      }}>
        <div style={{
          display: "flex", alignItems: "center", gap: 7, width: "100%",
          justifyContent: collapsed ? "center" : "flex-start",
          padding: collapsed ? 0 : "5px 6px",
          background: "rgba(255,255,255,0.025)", borderRadius: 9, border: "1px solid rgba(255,255,255,0.045)",
        }}>
          <div style={{
            width: 28, height: 28, borderRadius: "50%",
            background: "linear-gradient(135deg, #6366f1 0%, #a855f7 50%, #22d3ee 100%)",
            display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: 10.5, color: "#fff", flexShrink: 0,
            boxShadow: "0 0 11px rgba(99,102,241,0.3)",
          }}>
            {profile.name?.[0]?.toUpperCase() ?? "T"}
          </div>
          <AnimatePresence>
            {!collapsed && (
              <motion.div initial={{ opacity: 0, width: 0 }} animate={{ opacity: 1, width: "auto" }}
                exit={{ opacity: 0, width: 0 }} transition={{ duration: 0.14 }}
                style={{ minWidth: 0, flex: 1, overflow: "hidden" }}>
                <div style={{ fontWeight: 600, fontSize: 12, color: "#e2e8f0", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  {profile.name || "Teacher"}
                </div>
                <div style={{ fontSize: 10.5, color: "rgba(148,163,184,0.62)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  {profile.subjects?.slice(0, 2).join(", ") || "F–6"}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
        <motion.button onClick={() => { localStorage.removeItem("pn-profile"); window.location.reload(); }}
          whileHover={{ scale: 1.08, color: "#f87171" }} whileTap={{ scale: 0.9 }}
          title="Sign out"
          style={{ background: "none", border: "none", color: "rgba(148,163,184,0.48)", cursor: "pointer", padding: "2px 4px", fontSize: 12.5, display: "flex", alignItems: "center", borderRadius: 4 }}>
          <IconLogout />
          {!collapsed && <span style={{ marginLeft: 3, fontSize: 10.5, fontWeight: 600 }}>Sign out</span>}
        </motion.button>
      </div>
    </motion.div>
  );
}
