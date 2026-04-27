"use client";
import Link from "next/link";

const FEATURES = [
  {
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
      </svg>
    ),
    title: "AI Chat",
    desc: "Ask anything — lesson plans, assessments, behaviour, differentiation. Instant curriculum-aligned responses.",
    tag: "Core",
    tagColor: "#6366f1",
  },
  {
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>
      </svg>
    ),
    title: "Unit Library",
    desc: "Browse ready-to-use unit plans aligned to Australian Curriculum (AC9). Search by subject, year level, topic.",
    tag: "Library",
    tagColor: "#22d3ee",
  },
  {
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="9 11 12 14 22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/>
      </svg>
    ),
    title: "Auto-Marking",
    desc: "Upload a rubric and student work. Get instant, criterion-by-criterion feedback powered by AI vision.",
    tag: "AI",
    tagColor: "#34d399",
  },
  {
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
      </svg>
    ),
    title: "Lesson Planner",
    desc: "Generate complete lesson plans in seconds. Specify subject, year level, topic, duration, and lesson type.",
    tag: "Popular",
    tagColor: "#fbbf24",
  },
  {
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/>
      </svg>
    ),
    title: "Rubric Generator",
    desc: "Create detailed assessment rubrics for any subject, year level, and task type in minutes.",
    tag: "New",
    tagColor: "#a78bfa",
  },
  {
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/>
      </svg>
    ),
    title: "Curriculum Guide",
    desc: "Browse the full AC9 curriculum by subject and year level. Never miss a content descriptor.",
    tag: "AC9",
    tagColor: "#f472b6",
  },
];

const HOW_STEPS = [
  {
    n: "01",
    title: "Tell us about your class",
    desc: "Complete a 30-second onboarding — year levels and subjects you teach. PickleNickAI learns your context.",
  },
  {
    n: "02",
    title: "Chat with your AI assistant",
    desc: "Ask anything. Lesson plans, rubrics, assessments, behaviour strategies — all curriculum-aligned to AC9.",
  },
  {
    n: "03",
    title: "Get results instantly",
    desc: "Copy, export to PDF, or save to your library. No waiting, no forms. Just results.",
  },
];

const TESTIMONIALS = [
  { quote: "I used to spend hours on rubrics. PickleNickAI generated mine in 90 seconds.", name: "Rachel T.", role: "Year 3 Teacher, WA" },
  { quote: "Finally an AI that actually understands AC9 codes and the Australian curriculum.", name: "Marcus L.", role: "HASS Coordinator, NSW" },
  { quote: "My lesson plans are better and I save 3+ hours per week. Game changer.", name: "Sofia M.", role: "Year 5 Teacher, QLD" },
];

export default function Home() {
  return (
    <div style={{ background: "var(--bg)", color: "var(--text)", minHeight: "100vh" }}>

      {/* Nav */}
      <nav style={{
        position: "sticky", top: 0, zIndex: 100,
        borderBottom: "1px solid var(--border-subtle)",
        background: "rgba(10,10,10,0.85)",
        backdropFilter: "blur(16px)",
        WebkitBackdropFilter: "blur(16px)",
      }}>
        <div style={{
          maxWidth: 1100, margin: "0 auto",
          padding: "0 24px",
          height: 60, display: "flex", alignItems: "center", justifyContent: "space-between",
        }}>
          {/* Logo */}
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{
              width: 34, height: 34, borderRadius: 9,
              background: "linear-gradient(135deg, #6366f1, #818cf8)",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontWeight: 900, fontSize: 12, color: "#fff",
              boxShadow: "0 0 20px rgba(99,102,241,0.4)",
            }}>PN</div>
            <span style={{ fontWeight: 800, fontSize: 16, letterSpacing: "-0.02em" }}>PickleNickAI</span>
          </div>

          {/* Nav links */}
          <div style={{ display: "flex", alignItems: "center", gap: 28 }}>
            <span style={{ fontSize: 14, color: "var(--text-2)", display: "none" }}>Features</span>
            <span style={{ fontSize: 14, color: "var(--text-2)", display: "none" }}>Pricing</span>
            <span style={{ fontSize: 14, color: "var(--text-2)", display: "none" }}>Blog</span>
          </div>

          {/* CTA */}
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <Link href="/picklenickai" style={{
              padding: "8px 18px",
              background: "var(--primary)",
              color: "#fff",
              borderRadius: "var(--radius)",
              fontWeight: 700, fontSize: 14,
              transition: "all 0.15s",
              boxShadow: "0 0 0 0 rgba(99,102,241,0.4)",
            }}>Open App</Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section style={{
        maxWidth: 1100, margin: "0 auto",
        padding: "100px 24px 80px",
        textAlign: "center",
      }}>
        {/* Badge */}
        <div style={{
          display: "inline-flex", alignItems: "center", gap: 8,
          padding: "6px 14px", borderRadius: "var(--radius-full)",
          background: "var(--primary-dim)",
          border: "1px solid rgba(99,102,241,0.2)",
          fontSize: 13, fontWeight: 600, color: "var(--primary-hover)",
          marginBottom: 28,
        }}>
          <div style={{ width: 6, height: 6, borderRadius: "50%", background: "var(--primary)", animation: "pulse-dot 2s ease-in-out infinite" }} />
          Built for Australian F–6 Teachers
        </div>

        <h1 style={{
          fontSize: "clamp(2.5rem, 6vw, 4rem)",
          fontWeight: 900, letterSpacing: "-0.035em", lineHeight: 1.05,
          marginBottom: 24,
          maxWidth: 760, margin: "0 auto 24px",
        }}>
          Your AI Teaching Assistant<br/>
          <span style={{
            background: "linear-gradient(135deg, #6366f1, #818cf8, #22d3ee)",
            WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
            backgroundClip: "text",
          }}>for Australian F–6</span>
        </h1>

        <p style={{
          fontSize: 18, color: "var(--text-2)", lineHeight: 1.65,
          maxWidth: 520, margin: "0 auto 40px",
        }}>
          Cut admin. Boost capability. Become the best teacher possible.
          Chat with an AI that knows AC9 inside out.
        </p>

        {/* CTAs */}
        <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
          <Link href="/picklenickai" style={{
            padding: "14px 32px",
            background: "var(--primary)",
            color: "#fff", borderRadius: "var(--radius)",
            fontWeight: 700, fontSize: 15,
            display: "inline-flex", alignItems: "center", gap: 8,
            boxShadow: "0 0 40px rgba(99,102,241,0.25)",
            transition: "all 0.2s",
          }}>
            Start free — it&apos;s instant
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
          </Link>
          <Link href="/picklenickai#how" style={{
            padding: "14px 28px",
            background: "var(--surface-2)",
            color: "var(--text-2)", borderRadius: "var(--radius)",
            fontWeight: 600, fontSize: 15,
            border: "1px solid var(--border)",
          }}>
            See how it works
          </Link>
        </div>

        {/* Social proof */}
        <div style={{ marginTop: 48, display: "flex", alignItems: "center", justifyContent: "center", gap: 20 }}>
          <div style={{ display: "flex" }}>
            {["TC", "MR", "SH", "JK", "AL"].map((init, i) => (
              <div key={i} style={{
                width: 30, height: 30, borderRadius: "50%",
                background: `hsl(${i * 60 + 220}, 70%, 50%)`,
                border: "2px solid var(--bg)",
                marginLeft: i === 0 ? 0 : -8,
                display: "flex", alignItems: "center", justifyContent: "center",
                fontWeight: 700, fontSize: 10, color: "#fff",
              }}>{init}</div>
            ))}
          </div>
          <p style={{ fontSize: 13, color: "var(--text-3)" }}>
            <span style={{ color: "var(--text-2)", fontWeight: 600 }}>840+</span> Australian teachers onboarded
          </p>
        </div>
      </section>

      {/* Feature grid */}
      <section style={{
        borderTop: "1px solid var(--border-subtle)",
        borderBottom: "1px solid var(--border-subtle)",
        background: "var(--surface)",
        padding: "80px 24px",
      }}>
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: 52 }}>
            <h2 style={{ fontSize: 28, fontWeight: 800, letterSpacing: "-0.02em", marginBottom: 12 }}>
              Everything a teacher needs
            </h2>
            <p style={{ fontSize: 16, color: "var(--text-2)" }}>
              One AI. Six tools. Zero friction.
            </p>
          </div>

          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
            gap: 16,
          }}>
            {FEATURES.map((f) => (
              <div key={f.title} style={{
                background: "var(--bg)",
                border: "1px solid var(--border-subtle)",
                borderRadius: "var(--radius-lg)",
                padding: "24px",
                transition: "all 0.2s",
                cursor: "default",
              }}>
                <div style={{
                  width: 44, height: 44, borderRadius: 10,
                  background: "var(--primary-dim)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  color: "var(--primary-hover)",
                  marginBottom: 16,
                }}>
                  {f.icon}
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
                  <h3 style={{ fontWeight: 700, fontSize: 16 }}>{f.title}</h3>
                  <span style={{
                    padding: "2px 8px", borderRadius: "var(--radius-full)",
                    background: `${f.tagColor}18`, color: f.tagColor,
                    fontSize: 11, fontWeight: 600,
                  }}>{f.tag}</span>
                </div>
                <p style={{ color: "var(--text-2)", fontSize: 14, lineHeight: 1.6 }}>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section id="how" style={{ padding: "80px 24px" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto", display: "grid", gridTemplateColumns: "1fr 1fr", gap: 64, alignItems: "center" }}>
          {/* Left */}
          <div>
            <p style={{ fontSize: 13, fontWeight: 700, color: "var(--primary)", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 16 }}>
              How it works
            </p>
            <h2 style={{ fontSize: 28, fontWeight: 800, letterSpacing: "-0.02em", marginBottom: 40 }}>
              From question to result<br/>in under 60 seconds
            </h2>
            <div style={{ display: "flex", flexDirection: "column", gap: 28 }}>
              {HOW_STEPS.map((step) => (
                <div key={step.n} style={{ display: "flex", gap: 20 }}>
                  <div style={{
                    width: 48, height: 48, borderRadius: 12,
                    background: "var(--primary-dim)",
                    border: "1px solid rgba(99,102,241,0.2)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontWeight: 800, fontSize: 14, color: "var(--primary-hover)",
                    flexShrink: 0, fontFamily: "monospace",
                  }}>{step.n}</div>
                  <div>
                    <h3 style={{ fontWeight: 700, fontSize: 16, marginBottom: 4 }}>{step.title}</h3>
                    <p style={{ color: "var(--text-2)", fontSize: 14, lineHeight: 1.6 }}>{step.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right — demo card */}
          <div style={{
            background: "var(--surface)",
            border: "1px solid var(--border)",
            borderRadius: "var(--radius-lg)",
            padding: "28px",
            boxShadow: "0 0 60px rgba(0,0,0,0.5), 0 0 120px rgba(99,102,241,0.06)",
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 20 }}>
              <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#f87171" }} />
              <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#fbbf24" }} />
              <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#34d399" }} />
              <span style={{ fontSize: 12, color: "var(--text-3)", marginLeft: 6 }}>chat.picklenickai.com</span>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              <div style={{ padding: "10px 14px", background: "var(--surface-2)", borderRadius: "var(--radius)", fontSize: 13, color: "var(--text-2)", border: "1px solid var(--border-subtle)" }}>
                Write me a WALT, TIB and WILF for Year 4 Science — Energy transfers
              </div>
              <div style={{ padding: "12px 16px", background: "var(--primary-dim)", border: "1px solid rgba(99,102,241,0.15)", borderRadius: "var(--radius)", fontSize: 13, color: "var(--text)" }}>
                <p style={{ marginBottom: 8, fontWeight: 600 }}>Here&apos;s what I&apos;ll create for you:</p>
                <p style={{ color: "var(--text-2)" }}><span style={{ color: "var(--primary-hover)", fontWeight: 600 }}>WALT:</span> Investigate how energy transfers through different forms...</p>
                <p style={{ color: "var(--text-2)", marginTop: 4 }}><span style={{ color: "var(--primary-hover)", fontWeight: 600 }}>TIB:</span> Understanding energy helps us explain everyday phenomena...</p>
                <p style={{ color: "var(--text-2)", marginTop: 4 }}><span style={{ color: "var(--primary-hover)", fontWeight: 600 }}>WILF:</span> ☐ Explain 3 energy transfers ☐ Use scientific language ☐ Draw energy chain diagrams...</p>
              </div>
            </div>

            <div style={{ marginTop: 16, display: "flex", gap: 8 }}>
              <button style={{ padding: "6px 12px", background: "var(--surface-2)", border: "1px solid var(--border)", borderRadius: "var(--radius-sm)", fontSize: 12, color: "var(--text-2)" }}>Save</button>
              <button style={{ padding: "6px 12px", background: "var(--surface-2)", border: "1px solid var(--border)", borderRadius: "var(--radius-sm)", fontSize: 12, color: "var(--text-2)" }}>Copy</button>
              <button style={{ padding: "6px 12px", background: "var(--primary-dim)", border: "1px solid rgba(99,102,241,0.2)", borderRadius: "var(--radius-sm)", fontSize: 12, color: "var(--primary-hover)" }}>Export PDF</button>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section style={{
        borderTop: "1px solid var(--border-subtle)",
        padding: "80px 24px",
        background: "var(--surface)",
      }}>
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          <h2 style={{ fontSize: 28, fontWeight: 800, letterSpacing: "-0.02em", textAlign: "center", marginBottom: 48 }}>
            Australian teachers love it
          </h2>
          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
            gap: 16,
          }}>
            {TESTIMONIALS.map((t) => (
              <div key={t.name} style={{
                background: "var(--bg)",
                border: "1px solid var(--border-subtle)",
                borderRadius: "var(--radius-lg)",
                padding: "24px",
              }}>
                <p style={{ fontSize: 15, color: "var(--text)", lineHeight: 1.6, marginBottom: 16, fontStyle: "italic" }}>&ldquo;{t.quote}&rdquo;</p>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <div style={{
                    width: 36, height: 36, borderRadius: "50%",
                    background: "linear-gradient(135deg, #6366f1, #22d3ee)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontWeight: 700, fontSize: 12, color: "#fff",
                  }}>{t.name.split(" ").map(n => n[0]).join("")}</div>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: 13 }}>{t.name}</div>
                    <div style={{ fontSize: 12, color: "var(--text-3)" }}>{t.role}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing teaser */}
      <section style={{ padding: "80px 24px", textAlign: "center" }}>
        <div style={{ maxWidth: 560, margin: "0 auto" }}>
          <h2 style={{ fontSize: 28, fontWeight: 800, letterSpacing: "-0.02em", marginBottom: 12 }}>
            Simple pricing
          </h2>
          <p style={{ fontSize: 16, color: "var(--text-2)", marginBottom: 32 }}>
            One plan. Everything included. No seat limits, no feature gates.
          </p>
          <div style={{
            display: "inline-flex", alignItems: "baseline", gap: 8,
            padding: "28px 48px",
            background: "var(--surface)",
            border: "1px solid var(--border)",
            borderRadius: "var(--radius-lg)",
            boxShadow: "0 0 60px rgba(99,102,241,0.08)",
          }}>
            <span style={{ fontSize: 48, fontWeight: 900, letterSpacing: "-0.04em" }}>$19</span>
            <span style={{ fontSize: 16, color: "var(--text-2)" }}>/month per teacher</span>
          </div>
          <p style={{ marginTop: 16, fontSize: 13, color: "var(--text-3)" }}>14-day free trial · Cancel anytime</p>
        </div>
      </section>

      {/* Footer */}
      <footer style={{
        borderTop: "1px solid var(--border-subtle)",
        padding: "40px 24px",
      }}>
        <div style={{ maxWidth: 1100, margin: "0 auto", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 16 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{
              width: 28, height: 28, borderRadius: 7,
              background: "linear-gradient(135deg, #6366f1, #818cf8)",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontWeight: 900, fontSize: 11, color: "#fff",
            }}>PN</div>
            <span style={{ fontWeight: 800, fontSize: 14 }}>PickleNickAI</span>
          </div>
          <div style={{ display: "flex", gap: 24 }}>
            <span style={{ fontSize: 13, color: "var(--text-3)" }}>Privacy</span>
            <span style={{ fontSize: 13, color: "var(--text-3)" }}>Terms</span>
            <span style={{ fontSize: 13, color: "var(--text-3)" }}>Contact</span>
          </div>
          <p style={{ fontSize: 12, color: "var(--text-3)" }}>© 2025 PickleNickAI. Built for Australian teachers.</p>
        </div>
      </footer>
    </div>
  );
}