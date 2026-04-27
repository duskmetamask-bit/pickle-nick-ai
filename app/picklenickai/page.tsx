"use client";

import { useState } from "react";
import Onboarding from "@/components/Onboarding";
import Sidebar from "@/components/Sidebar";
import ChatView from "@/components/ChatView";
import LibraryView from "@/components/LibraryView";
import PlannerView from "@/components/PlannerView";
import RubricView from "@/components/RubricView";
import AutoMarkView from "@/components/AutoMarkView";
import CurriculumView from "@/components/CurriculumView";
import ProfileView from "@/components/ProfileView";

interface TeacherProfile {
  name: string;
  yearLevels: string[];
  subjects: string[];
  focusAreas?: string[];
  school?: string;
}

type Tab = "chat" | "library" | "planner" | "rubric" | "automark" | "curriculum" | "profile";

export default function PickleNickAIApp() {
  const [profile, setProfile] = useState<TeacherProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<Tab>("chat");

  useState(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("pn-profile");
      if (saved) {
        try { setProfile(JSON.parse(saved)); } catch {}
      }
      setLoading(false);
    }
  });

  function handleOnboardingComplete(p: TeacherProfile) {
    localStorage.setItem("pn-profile", JSON.stringify(p));
    setProfile(p);
  }

  if (loading) {
    return (
      <div style={{
        background: "var(--bg)", minHeight: "100vh",
        display: "flex", alignItems: "center", justifyContent: "center",
      }}>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 16 }}>
          <div style={{
            width: 48, height: 48, borderRadius: 14,
            background: "linear-gradient(135deg, #6366f1, #818cf8)",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontWeight: 900, fontSize: 16, color: "#fff",
            boxShadow: "0 0 30px rgba(99,102,241,0.4)",
          }}>PN</div>
          <p style={{ color: "var(--text-2)", fontSize: 14 }}>Loading PickleNickAI...</p>
        </div>
      </div>
    );
  }

  if (!profile) {
    return <Onboarding onComplete={handleOnboardingComplete} />;
  }

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "var(--bg)" }}>
      <Sidebar activeTab={activeTab} onTabChange={(tab) => setActiveTab(tab as Tab)} profile={profile} />
      <main style={{
        flex: 1,
        marginLeft: 220,
        minHeight: "100vh",
        overflowY: "auto",
      }}>
        {activeTab === "chat" && <ChatView profile={profile} />}
        {activeTab === "library" && <LibraryView />}
        {activeTab === "planner" && <PlannerView />}
        {activeTab === "rubric" && <RubricView />}
        {activeTab === "automark" && <AutoMarkView />}
        {activeTab === "curriculum" && <CurriculumView />}
        {activeTab === "profile" && <ProfileView />}
      </main>
    </div>
  );
}