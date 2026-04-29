"use client";

import { useState } from "react";

const YEAR_LEVELS = ["Pre-Primary", "Year 1", "Year 2", "Year 3", "Year 4", "Year 5", "Year 6"];
const SUBJECTS = ["Mathematics", "English", "Science", "HASS", "Technologies", "The Arts", "Health & Physical Education", "Languages"];
const STATES = ["Western Australia (WA)", "New South Wales (NSW)", "Victoria (VIC)", "Queensland (QLD)", "South Australia (SA)", "Tasmania (TAS)", "Northern Territory (NT)", "Australian Capital Territory (ACT)"];
const STATE_CODES: Record<string, string> = {
  "Western Australia (WA)": "WA",
  "New South Wales (NSW)": "NSW",
  "Victoria (VIC)": "VIC",
  "Queensland (QLD)": "QLD",
  "South Australia (SA)": "SA",
  "Tasmania (TAS)": "TAS",
  "Northern Territory (NT)": "NT",
  "Australian Capital Territory (ACT)": "ACT",
};

interface OnboardingProps {
  onComplete: (profile: { name: string; yearLevels: string[]; subjects: string[]; state: string }) => void;
}

export default function Onboarding({ onComplete }: OnboardingProps) {
  const [step, setStep] = useState(0);
  const [name, setName] = useState("");
  const [years, setYears] = useState<string[]>([]);
  const [subjects, setSubjects] = useState<string[]>([]);
  const [state, setState] = useState("");
  const [error, setError] = useState("");

  function toggle(arr: string[], item: string, set: (v: string[]) => void) {
    set(arr.includes(item) ? arr.filter(x => x !== item) : [...arr, item]);
  }

  function handleNext() {
    if (step === 0 && !name.trim()) { setError("Please enter your name"); return; }
    if (step === 1 && years.length === 0) { setError("Select at least one year level"); return; }
    if (step === 2 && subjects.length === 0) { setError("Select at least one subject"); return; }
    if (step === 3 && !state) { setError("Select your state/territory"); return; }
    setError("");
    setStep(s => s + 1);
  }

  function handleFinish() {
    const stateCode = STATE_CODES[state] || state;
    onComplete({ name: name.trim(), yearLevels: years, subjects, state: stateCode });
  }

  return (
    <div style={{
      minHeight: "100vh",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      padding: "2rem",
      background: "var(--bg)",
    }}>
      <div style={{
        background: "var(--surface)",
        border: "1px solid var(--border)",
        borderRadius: 24,
        padding: "2.5rem",
        width: "100%",
        maxWidth: 520,
        boxShadow: "0 24px 64px rgba(0,0,0,0.4)",
      }}>
        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: "2rem" }}>
          <div style={{
            background: "linear-gradient(135deg, #6366f1, #22d3ee)",
            width: 56, height: 56, borderRadius: 16,
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 24, margin: "0 auto 1rem",
            fontWeight: 900, color: "#fff",
          }}>PN</div>
          <h1 style={{ fontSize: 22, fontWeight: 900, marginBottom: 6 }}>Welcome to PickleNickAI</h1>
          <p style={{ color: "var(--text2)", fontSize: 14 }}>Let's set up your personal AI teaching assistant.</p>
        </div>

        {/* Progress */}
        <div style={{ display: "flex", gap: 6, marginBottom: "2rem" }}>
          {[0, 1, 2, 3].map(i => (
            <div key={i} style={{
              flex: 1, height: 4, borderRadius: 2,
              background: i <= step ? "var(--primary)" : "var(--border)",
              transition: "background 0.3s",
            }} />
          ))}
        </div>

        {/* Step 0 — Name */}
        {step === 0 && (
          <div>
            <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "var(--text2)", marginBottom: 8, textTransform: "uppercase", letterSpacing: "0.05em" }}>
              What's your name?
            </label>
            <input
              value={name}
              onChange={e => setName(e.target.value)}
              onKeyDown={e => e.key === "Enter" && handleNext()}
              placeholder="e.g. Sarah"
              autoFocus
              style={{
                width: "100%", padding: "14px 16px",
                background: "var(--surface2)", color: "var(--text)",
                border: "1px solid var(--border)", borderRadius: 12,
                fontSize: 16, outline: "none",
              }}
              onFocus={e => e.currentTarget.style.borderColor = "var(--primary)"}
              onBlur={e => e.currentTarget.style.borderColor = "var(--border)"}
            />
          </div>
        )}

        {/* Step 1 — Year Levels */}
        {step === 1 && (
          <div>
            <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "var(--text2)", marginBottom: 8, textTransform: "uppercase", letterSpacing: "0.05em" }}>
              Year levels you teach
            </label>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(100px, 1fr))", gap: 8 }}>
              {YEAR_LEVELS.map(yl => {
                const sel = years.includes(yl);
                return (
                  <button
                    key={yl}
                    onClick={() => toggle(years, yl, setYears)}
                    style={{
                      padding: "10px 8px",
                      background: sel ? "rgba(99,102,241,0.15)" : "var(--surface2)",
                      color: sel ? "var(--primary-hover)" : "var(--text2)",
                      border: `1px solid ${sel ? "var(--primary)" : "var(--border)"}`,
                      borderRadius: 10, fontSize: 13, fontWeight: sel ? 600 : 400,
                      cursor: "pointer", transition: "all 0.15s",
                    }}
                  >
                    {yl}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Step 2 — Subjects */}
        {step === 2 && (
          <div>
            <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "var(--text2)", marginBottom: 8, textTransform: "uppercase", letterSpacing: "0.05em" }}>
              Subjects you teach
            </label>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
              {SUBJECTS.map(sub => {
                const sel = subjects.includes(sub);
                return (
                  <button
                    key={sub}
                    onClick={() => toggle(subjects, sub, setSubjects)}
                    style={{
                      padding: "12px",
                      background: sel ? "rgba(99,102,241,0.15)" : "var(--surface2)",
                      color: sel ? "var(--primary-hover)" : "var(--text2)",
                      border: `1px solid ${sel ? "var(--primary)" : "var(--border)"}`,
                      borderRadius: 10, fontSize: 13, fontWeight: sel ? 600 : 400,
                      cursor: "pointer", transition: "all 0.15s", textAlign: "center",
                    }}
                  >
                    {sub}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Step 3 — State */}
        {step === 3 && (
          <div>
            <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "var(--text2)", marginBottom: 8, textTransform: "uppercase", letterSpacing: "0.05em" }}>
              Which state or territory do you teach in?
            </label>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
              {STATES.map(s => {
                const sel = state === s;
                return (
                  <button
                    key={s}
                    onClick={() => setState(s)}
                    style={{
                      padding: "12px",
                      background: sel ? "rgba(99,102,241,0.15)" : "var(--surface2)",
                      color: sel ? "var(--primary-hover)" : "var(--text2)",
                      border: `1px solid ${sel ? "var(--primary)" : "var(--border)"}`,
                      borderRadius: 10, fontSize: 13, fontWeight: sel ? 600 : 400,
                      cursor: "pointer", transition: "all 0.15s", textAlign: "center",
                    }}
                  >
                    {s}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Step 4 — Done */}
        {step === 4 && (
          <div style={{ textAlign: "center", padding: "1rem 0" }}>
            <div style={{
              background: "linear-gradient(135deg, #6366f1, #818cf8)",
              width: 56, height: 56, borderRadius: 16,
              display: "flex", alignItems: "center", justifyContent: "center",
              fontWeight: 900, fontSize: 18, color: "#fff",
              margin: "0 auto 1rem",
              boxShadow: "0 0 20px rgba(99,102,241,0.3)",
            }}>PN</div>
            <h2 style={{ fontSize: 20, fontWeight: 800, marginBottom: 8 }}>You're all set, {name}!</h2>
            <p style={{ color: "var(--text2)", fontSize: 14, lineHeight: 1.6 }}>
              Your AI teaching assistant is ready{state ? ` — ${state.replace(/\s*\([^)]+\)/, '')} Mode` : ''}. Ask me anything about lesson plans, assessments, behaviour strategies, differentiation, or the Australian curriculum.
            </p>
          </div>
        )}

        {/* Error */}
        {error && (
          <div style={{
            marginTop: "1rem", padding: "10px 14px",
            background: "rgba(248,113,113,0.1)", border: "1px solid rgba(248,113,113,0.3)",
            borderRadius: 10, color: "var(--danger)", fontSize: 13,
          }}>
            {error}
          </div>
        )}

        {/* Nav */}
        <div style={{ display: "flex", gap: 12, marginTop: "2rem" }}>
          {step > 0 && step < 4 && (
            <button
              onClick={() => setStep(s => s - 1)}
              style={{
                flex: "0 0 auto", padding: "12px 20px",
                background: "var(--surface2)", color: "var(--text2)",
                border: "1px solid var(--border)", borderRadius: 10, fontWeight: 600, fontSize: 14,
              }}
            >
              Back
            </button>
          )}
          {step < 4 ? (
            <button
              onClick={handleNext}
              style={{
                flex: 1, padding: "12px",
                background: "var(--primary)", color: "#fff",
                border: "none", borderRadius: 10, fontWeight: 700, fontSize: 15,
              }}
            >
              {step === 3 ? "Let's go" : "Next"}
            </button>
          ) : (
            <button
              onClick={handleFinish}
              style={{
                flex: 1, padding: "12px",
                background: "var(--primary)", color: "#fff",
                border: "none", borderRadius: 10, fontWeight: 700, fontSize: 15,
              }}
            >
              Start chatting
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
