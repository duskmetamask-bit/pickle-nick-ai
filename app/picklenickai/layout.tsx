"use client";

import { useState, useEffect } from "react";
import Onboarding from "@/components/Onboarding";
import Sidebar from "@/components/Sidebar";
import FloatingChatWidget from "@/components/FloatingChatWidget";
import LibraryView from "@/components/LibraryView";
import PlannerView from "@/components/PlannerView";
import RubricView from "@/components/RubricView";
import AutoMarkView from "@/components/AutoMarkView";
import CurriculumView from "@/components/CurriculumView";
import ProfileView from "@/components/ProfileView";
import WritingFeedbackView from "@/components/WritingFeedbackView";
import WorksheetView from "@/components/WorksheetView";

interface TeacherProfile {
  name: string;
  yearLevels: string[];
  subjects: string[];
  focusAreas?: string[];
  school?: string;
  state?: string;
}

type Tab = "chat" | "library" | "planner" | "rubric" | "automark" | "curriculum" | "profile" | "writing" | "worksheet";

// ─── Social Proof Banner ───────────────────────────────────────────
function SocialProofBanner() {
  return (
    <div style={{
      background: "linear-gradient(135deg, rgba(99,102,241,0.06) 0%, rgba(34,211,238,0.06) 100%)",
      borderBottom: "1px solid rgba(99,102,241,0.12)",
      padding: "10px 28px",
      display: "flex",
      gap: 20,
      alignItems: "center",
      overflowX: "auto",
      flexWrap: "wrap",
    }}>
      {[
        "AC9 Aligned",
        "Private Sessions",
        "Built for Australian Teachers",
        "Growing daily",
      ].map(item => (
        <span key={item} style={{ fontSize: 12, fontWeight: 600, color: "var(--text-2)", whiteSpace: "nowrap" }}>{item}</span>
      ))}
    </div>
  );
}

// ─── Testimonials ───────────────────────────────────────────────────
function Testimonials() {
  const testimonials = [
    { text: "Saved me 8 hours a week on lesson planning — absolutely worth every cent.", name: "Sarah T.", role: "Year 4 Teacher, Perth WA" },
    { text: "Finally an AI that actually knows AC9 codes. This is the tool I've been waiting for.", name: "Michael R.", role: "Year 6 Teacher, Melbourne VIC" },
    { text: "The rubric generator alone saves me hours every term. My feedback is so much more specific now.", name: "Priya K.", role: "Year 2 Teacher, Brisbane QLD" },
  ];
  return (
    <div style={{ borderTop: "1px solid var(--border-subtle)", padding: "32px 28px", background: "var(--surface)" }}>
      <h3 style={{ fontSize: 14, fontWeight: 800, color: "var(--text-2)", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 16, textAlign: "center" }}>
        What teachers are saying
      </h3>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 14 }}>
        {testimonials.map((t, i) => (
          <div key={i} style={{ background: "var(--surface-2)", border: "1px solid var(--border)", borderRadius: 14, padding: "1.1rem" }}>
            <div style={{ fontSize: 22, marginBottom: 8 }}>"</div>
            <p style={{ fontSize: 13, color: "var(--text)", lineHeight: 1.6, marginBottom: 10, fontStyle: "italic" }}>{t.text}</p>
            <div style={{ fontWeight: 700, fontSize: 12, color: "var(--primary)" }}>{t.name}</div>
            <div style={{ fontSize: 11, color: "var(--text-3)" }}>{t.role}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Pricing Modal ───────────────────────────────────────────────────
function PricingModal({ onClose, onUpgrade }: { onClose: () => void; onUpgrade: () => void }) {
  return (
    <div style={{
      position: "fixed", inset: 0, zIndex: 1000,
      background: "rgba(0,0,0,0.6)",
      display: "flex", alignItems: "center", justifyContent: "center",
      padding: "1rem",
    }}>
      <div style={{
        background: "var(--surface)",
        border: "1px solid var(--border)",
        borderRadius: 24,
        padding: "2rem 2.5rem",
        maxWidth: 480,
        width: "100%",
        boxShadow: "0 24px 64px rgba(0,0,0,0.5)",
      }}>
        <div style={{ textAlign: "center", marginBottom: "1.5rem" }}>
          <div style={{ fontSize: 40, marginBottom: "0.75rem" }}>Pro</div>
          <h2 style={{ fontSize: 20, fontWeight: 900, marginBottom: 6 }}>Upgrade to Pro</h2>
          <p style={{ color: "var(--text-2)", fontSize: 13, lineHeight: 1.6 }}>
            You've used your 5 free lesson plans this month. Upgrade to Pro for unlimited access.
          </p>
        </div>
        <div style={{ background: "rgba(99,102,241,0.08)", border: "1px solid rgba(99,102,241,0.2)", borderRadius: 16, padding: "1.25rem", marginBottom: "1.25rem" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
            <div>
              <div style={{ fontWeight: 800, fontSize: 16 }}>Pro Plan</div>
              <div style={{ color: "var(--text-2)", fontSize: 12 }}>Unlimited everything</div>
            </div>
            <div style={{ textAlign: "right" }}>
              <div style={{ fontWeight: 900, fontSize: 22, color: "var(--primary)" }}>$19</div>
              <div style={{ color: "var(--text-3)", fontSize: 11 }}>/month</div>
            </div>
          </div>
          <ul style={{ margin: 0, padding: "0 0 0 16px", fontSize: 12, color: "var(--text-2)", lineHeight: 1.8 }}>
            <li>Unlimited lesson plans</li>
            <li>Unlimited rubrics</li>
            <li>Writing feedback</li>
            <li>Worksheet generator</li>
            <li>Auto-marking</li>
            <li>AC9-aligned, always</li>
          </ul>
        </div>
        <button
          onClick={onUpgrade}
          style={{ width: "100%", padding: "13px", background: "var(--primary)", color: "#fff", border: "none", borderRadius: 12, fontWeight: 700, fontSize: 15, cursor: "pointer", marginBottom: "0.75rem" }}
        >
          Upgrade to Pro — $19/mo
        </button>
        <button
          onClick={onClose}
          style={{ width: "100%", padding: "11px", background: "transparent", color: "var(--text-2)", border: "1px solid var(--border)", borderRadius: 12, fontWeight: 600, fontSize: 13, cursor: "pointer" }}
        >
          Maybe later
        </button>
      </div>
    </div>
  );
}

// ─── Free Tier ─────────────────────────────────────────────────────
const FREE_LIMIT = 5;
const FREE_KEY = "pn-free-uses";
const PRO_KEY = "pn-is-pro";

function checkFreeTier() {
  if (typeof window === "undefined") return { allowed: true, uses: 0, isPro: false };
  const isPro = localStorage.getItem(PRO_KEY) === "true";
  if (isPro) return { allowed: true, uses: 0, isPro: true };
  const uses = parseInt(localStorage.getItem(FREE_KEY) || "0", 10);
  return { allowed: uses < FREE_LIMIT, uses, isPro: false };
}

function recordFreeUse() {
  const current = parseInt(localStorage.getItem(FREE_KEY) || "0", 10);
  localStorage.setItem(FREE_KEY, String(current + 1));
}

// ─── Chat Welcome ───────────────────────────────────────────────────
function ChatWelcome({ profile }: { profile: TeacherProfile }) {
  return (
    <div style={{ padding: "24px", maxWidth: 800 }}>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 22, fontWeight: 800, marginBottom: 6 }}>Hi {profile.name}!</h1>
        <p style={{ color: "var(--text-2)", fontSize: 14 }}>
          I am PickleNickAI — your AI teaching colleague. Ask me anything or use the chat widget in the bottom-right corner to get started.
        </p>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))", gap: 12 }}>
        {[
          { icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>, label: "Lesson Plans", desc: "AC9 aligned" },
          { icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/></svg>, label: "Rubrics", desc: "Criterion-based" },
          { icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"/></svg>, label: "Writing Feedback", desc: "Detailed & specific" },
          { icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 11 12 14 22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/></svg>, label: "Behaviour Support", desc: "BSPs & strategies" },
          { icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg>, label: "Assessments", desc: "Hot & cold tasks" },
          { icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>, label: "Parent Emails", desc: "Professional tone" },
        ].map(card => (
          <div key={card.label} style={{
            background: "var(--surface-2)", border: "1px solid var(--border)",
            borderRadius: 14, padding: "1rem", cursor: "pointer", transition: "all 0.15s",
          }}>
            <div style={{ width: 32, height: 32, borderRadius: 8, background: "rgba(99,102,241,0.1)", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 8, color: "var(--primary)" }}>{card.icon}</div>
            <div style={{ fontWeight: 700, fontSize: 13, marginBottom: 3 }}>{card.label}</div>
            <div style={{ fontSize: 11, color: "var(--text-3)" }}>{card.desc}</div>
          </div>
        ))}
      </div>
      <Testimonials />
    </div>
  );
}

// ─── Main Layout ────────────────────────────────────────────────────
export default function AppLayout() {
  const [profile, setProfile] = useState<TeacherProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<Tab>("chat");
  const [showPricing, setShowPricing] = useState(false);
  const [freeUses, setFreeUses] = useState(0);
  const [isPro, setIsPro] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("pn-profile");
      if (saved) {
        try { setProfile(JSON.parse(saved)); } catch {}
      }
      const { uses, isPro: pro } = checkFreeTier();
      setFreeUses(uses);
      setIsPro(pro);
      setLoading(false);
    }
  }, []);

  function handleOnboardingComplete(p: TeacherProfile) {
    localStorage.setItem("pn-profile", JSON.stringify(p));
    if (p.state) localStorage.setItem("pn-state", p.state);
    setProfile(p);
  }

  function handleUpgrade() {
    localStorage.setItem(PRO_KEY, "true");
    setIsPro(true);
    setShowPricing(false);
  }

  function handleTabChange(tab: Tab) {
    if (["planner", "rubric", "writing", "worksheet"].includes(tab)) {
      const { allowed } = checkFreeTier();
      if (!allowed) { setShowPricing(true); return; }
    }
    setActiveTab(tab);
  }

  // Free tier event bus
  useEffect(() => {
    const handler = (e: Event) => {
      const detail = (e as CustomEvent).detail;
      if (detail?.action === "generate") {
        const { allowed, uses } = checkFreeTier();
        if (!allowed) { setShowPricing(true); (e as CustomEvent).detail.result(false); }
        else { recordFreeUse(); setFreeUses(uses + 1); (e as CustomEvent).detail.result(true); }
      } else if (detail?.action === "check") {
        const r = checkFreeTier();
        (e as CustomEvent).detail.result(r);
      } else if (detail?.action === "upgrade") {
        handleUpgrade();
      }
    };
    window.addEventListener("pn-free-tier", handler);
    return () => window.removeEventListener("pn-free-tier", handler);
  }, []);

  if (loading) {
    return (
      <div style={{ background: "var(--bg)", minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ textAlign: "center" }}>
          <div style={{
            background: "linear-gradient(135deg, #6366f1, #22d3ee)",
            width: 56, height: 56, borderRadius: 16,
            display: "flex", alignItems: "center", justifyContent: "center",
            margin: "0 auto 16px", fontWeight: 900, fontSize: 18, color: "#fff",
          }}>PN</div>
          <p style={{ color: "var(--text2)", fontSize: 14 }}>Loading PickleNickAI...</p>
        </div>
      </div>
    );
  }

  if (!profile) {
    return <Onboarding onComplete={handleOnboardingComplete} />;
  }

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "var(--bg)" }}>
      {showPricing && <PricingModal onClose={() => setShowPricing(false)} onUpgrade={handleUpgrade} />}
      <Sidebar
        activeTab={activeTab}
        onTabChange={handleTabChange as (tab: string) => void}
        profile={profile}
        isPro={isPro}
        freeUses={freeUses}
      />
      <main style={{ flex: 1, marginLeft: 220, overflowY: "auto" }}>
        <SocialProofBanner />
        {activeTab === "chat" && <ChatWelcome profile={profile} />}
        {activeTab === "library" && <LibraryView />}
        {activeTab === "planner" && <PlannerView />}
        {activeTab === "rubric" && <RubricView />}
        {activeTab === "automark" && <AutoMarkView />}
        {activeTab === "curriculum" && <CurriculumView />}
        {activeTab === "profile" && <ProfileView />}
        {activeTab === "writing" && <WritingFeedbackView />}
        {activeTab === "worksheet" && <WorksheetView />}
      </main>

      <FloatingChatWidget profile={profile} initialCollapsed={activeTab !== "chat"} />
    </div>
  );
}
