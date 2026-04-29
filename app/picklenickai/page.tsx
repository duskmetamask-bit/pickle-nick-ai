"use client";

export default function Page() {
  return (
    <div style={{ background: "var(--bg)", minHeight: "100vh" }}>
      {/* Navigation */}
      <nav style={{
        position: "fixed", top: 0, left: 0, right: 0, zIndex: 100,
        background: "rgba(10,10,10,0.85)", backdropFilter: "blur(12px)",
        borderBottom: "1px solid var(--border-subtle)",
        padding: "0 28px",
        display: "flex", alignItems: "center", justifyContent: "space-between",
        height: 56,
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{
            width: 32, height: 32, borderRadius: 8,
            background: "linear-gradient(135deg, #6366f1, #818cf8)",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontWeight: 900, fontSize: 11, color: "#fff",
            boxShadow: "0 0 12px rgba(99,102,241,0.25)",
          }}>PN</div>
          <span style={{ fontWeight: 800, fontSize: 15, letterSpacing: "-0.01em" }}>PickleNickAI</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <a href="#" style={{ fontSize: 13, color: "var(--text-2)", fontWeight: 500 }}>Features</a>
          <a href="#pricing" style={{ fontSize: 13, color: "var(--text-2)", fontWeight: 500 }}>Pricing</a>
          <a href="#" style={{ fontSize: 13, color: "var(--text-2)", fontWeight: 500 }}>Resources</a>
          <button style={{
            padding: "8px 16px",
            background: "var(--primary)", color: "#fff",
            border: "none", borderRadius: "var(--radius-sm)",
            fontSize: 13, fontWeight: 600, cursor: "pointer",
          }}>Get Started</button>
        </div>
      </nav>

      {/* Hero */}
      <section style={{ padding: "120px 28px 80px", maxWidth: 860, margin: "0 auto", textAlign: "center" }}>
        {/* Badge */}
        <div style={{
          display: "inline-flex", alignItems: "center", gap: 6,
          padding: "6px 14px",
          background: "rgba(99,102,241,0.1)", border: "1px solid rgba(99,102,241,0.25)",
          borderRadius: 9999, marginBottom: 28,
        }}>
          <div style={{ width: 6, height: 6, borderRadius: "50%", background: "var(--success)" }} />
          <span style={{ fontSize: 12, fontWeight: 600, color: "var(--primary-hover)" }}>Built for Australian F–6 Teachers</span>
        </div>

        <h1 style={{ fontSize: "clamp(36px, 5vw, 56px)", fontWeight: 900, letterSpacing: "-0.03em", lineHeight: 1.1, marginBottom: 20 }}>
          Your AI Teaching Assistant<br />
          <span style={{ background: "linear-gradient(135deg, #6366f1, #22d3ee)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>for Australian F–6 Classrooms</span>
        </h1>

        <p style={{ fontSize: 18, color: "var(--text-2)", lineHeight: 1.65, maxWidth: 560, margin: "0 auto 36px" }}>
          Lesson plans, rubrics, behaviour support, AC9 alignment, report comments — all in one place. Trained on the Australian curriculum, built for real classrooms.
        </p>

        <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
          <button style={{
            padding: "14px 28px",
            background: "var(--primary)", color: "#fff",
            border: "none", borderRadius: "var(--radius)",
            fontSize: 15, fontWeight: 700, cursor: "pointer",
            boxShadow: "0 0 24px rgba(99,102,241,0.35)",
          }}>Start Free Trial</button>
          <button style={{
            padding: "14px 28px",
            background: "transparent", color: "var(--text-2)",
            border: "1px solid var(--border)", borderRadius: "var(--radius)",
            fontSize: 15, fontWeight: 600, cursor: "pointer",
          }}>See a Demo</button>
        </div>

        {/* Social proof numbers */}
        <div style={{
          display: "flex", gap: 40, justifyContent: "center",
          marginTop: 56, paddingTop: 40,
          borderTop: "1px solid var(--border-subtle)",
          flexWrap: "wrap",
        }}>
          {[
            { value: "2,400+", label: "Australian teachers" },
            { value: "180+", label: "Schools" },
            { value: "4.9", label: "Average rating" },
            { value: "AC9", label: "Fully aligned" },
          ].map(stat => (
            <div key={stat.label} style={{ textAlign: "center" }}>
              <div style={{ fontSize: 28, fontWeight: 900, color: "var(--text)", letterSpacing: "-0.02em" }}>{stat.value}</div>
              <div style={{ fontSize: 12, color: "var(--text-3)", fontWeight: 500, marginTop: 2 }}>{stat.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section style={{ padding: "0 28px 80px", maxWidth: 960, margin: "0 auto" }}>
        <div style={{ textAlign: "center", marginBottom: 48 }}>
          <h2 style={{ fontSize: 28, fontWeight: 800, letterSpacing: "-0.02em", marginBottom: 10 }}>Everything a great teacher needs</h2>
          <p style={{ fontSize: 15, color: "var(--text-2)" }}>One tool for lesson plans, assessments, behaviour support and more.</p>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 16 }}>
          {[
            {
              icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#6366f1" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>,
              title: "Lesson Plans",
              desc: "AC9-aligned lesson plans with WALT, success criteria, and phase-by-phase instructions in seconds.",
            },
            {
              icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#6366f1" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/></svg>,
              title: "Rubric Generator",
              desc: "Create detailed, criterion-referenced rubrics for any subject and year level in minutes.",
            },
            {
              icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#6366f1" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"/></svg>,
              title: "Writing Feedback",
              desc: "Detailed, specific feedback on student writing — strengths, areas to develop, and next steps.",
            },
            {
              icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#6366f1" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 11 12 14 22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/></svg>,
              title: "Auto-Marking",
              desc: "Paste student work, get detailed marking and feedback in seconds. Save hours every term.",
            },
            {
              icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#6366f1" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>,
              title: "Behaviour Support",
              desc: "Behaviour support plans, de-escalation strategies, and wellbeing checks tailored to your student.",
            },
            {
              icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#6366f1" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18"/><path d="M9 21V9"/></svg>,
              title: "Worksheet Generator",
              desc: "Generate targeted worksheets for any topic, year level, and ability range in seconds.",
            },
          ].map(feature => (
            <div key={feature.title} style={{
              background: "var(--surface)", border: "1px solid var(--border-subtle)",
              borderRadius: 14, padding: "1.25rem",
            }}>
              <div style={{
                width: 36, height: 36, borderRadius: 10,
                background: "rgba(99,102,241,0.1)",
                display: "flex", alignItems: "center", justifyContent: "center",
                marginBottom: 12,
              }}>{feature.icon}</div>
              <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 6 }}>{feature.title}</div>
              <div style={{ fontSize: 13, color: "var(--text-2)", lineHeight: 1.6 }}>{feature.desc}</div>
            </div>
          ))}
        </div>
      </section>

      {/* AC9 Banner */}
      <section style={{
        padding: "40px 28px",
        background: "var(--surface)",
        borderTop: "1px solid var(--border-subtle)",
        borderBottom: "1px solid var(--border-subtle)",
      }}>
        <div style={{ maxWidth: 960, margin: "0 auto", display: "flex", alignItems: "center", gap: 32, flexWrap: "wrap", justifyContent: "center" }}>
          <div style={{ fontWeight: 800, fontSize: 15, color: "var(--text)" }}>Curriculum aligned:</div>
          {[
            { label: "AC9 (Australian Curriculum v9)", short: "AC9" },
            { label: "AITSL Standards", short: "AITSL" },
            { label: "Western Australian Curriculum", short: "WA" },
            { label: "NSW Syllabus", short: "NSW" },
            { label: "VIC Curriculum", short: "VIC" },
          ].map(item => (
            <div key={item.label} style={{
              display: "flex", alignItems: "center", gap: 8,
              padding: "6px 12px",
              background: "rgba(99,102,241,0.08)", border: "1px solid rgba(99,102,241,0.2)",
              borderRadius: 8,
            }}>
              <div style={{ width: 5, height: 5, borderRadius: "50%", background: "var(--primary)" }} />
              <span style={{ fontSize: 12, fontWeight: 600, color: "var(--primary-hover)" }}>{item.short}</span>
              <span style={{ fontSize: 11, color: "var(--text-3)" }}>{item.label.replace(` (${item.short})`, "").replace(item.short, "")}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" style={{ padding: "80px 28px", maxWidth: 960, margin: "0 auto" }}>
        <div style={{ textAlign: "center", marginBottom: 40 }}>
          <h2 style={{ fontSize: 28, fontWeight: 800, letterSpacing: "-0.02em", marginBottom: 10 }}>Simple, honest pricing</h2>
          <p style={{ fontSize: 15, color: "var(--text-2)" }}>One plan. Everything included. Cancel anytime.</p>
        </div>

        <div style={{
          maxWidth: 440, margin: "0 auto",
          background: "var(--surface)",
          border: "1px solid rgba(99,102,241,0.3)",
          borderRadius: 20,
          padding: "2rem",
          boxShadow: "0 0 48px rgba(99,102,241,0.1)",
          position: "relative",
          overflow: "hidden",
        }}>
          {/* Glow accent */}
          <div style={{
            position: "absolute", top: 0, left: 0, right: 0, height: 3,
            background: "linear-gradient(90deg, #6366f1, #22d3ee)",
          }} />

          <div style={{ textAlign: "center", marginBottom: "1.5rem" }}>
            <div style={{ fontSize: 12, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--primary)", marginBottom: 8 }}>Pro Plan</div>
            <div style={{ display: "flex", alignItems: "baseline", gap: 4, justifyContent: "center" }}>
              <span style={{ fontSize: 52, fontWeight: 900, letterSpacing: "-0.03em" }}>$19</span>
              <span style={{ fontSize: 15, color: "var(--text-3)", fontWeight: 500 }}>/month</span>
            </div>
            <p style={{ fontSize: 13, color: "var(--text-2)", marginTop: 4 }}>billed monthly, per teacher</p>
          </div>

          <ul style={{ listStyle: "none", margin: "0 0 1.5rem", padding: 0, display: "flex", flexDirection: "column", gap: 10 }}>
            {[
              "Unlimited lesson plans",
              "Unlimited rubrics & assessments",
              "Writing feedback & auto-marking",
              "Worksheet generator",
              "Behaviour support plans",
              "Parent email & report comment tools",
              "AC9-aligned, always current",
              "Private sessions — your data stays yours",
            ].map(item => (
              <li key={item} style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 13, color: "var(--text)" }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#34d399" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12"/>
                </svg>
                {item}
              </li>
            ))}
          </ul>

          <button style={{
            width: "100%", padding: "14px",
            background: "var(--primary)", color: "#fff",
            border: "none", borderRadius: 12,
            fontSize: 15, fontWeight: 700, cursor: "pointer",
            boxShadow: "0 0 24px rgba(99,102,241,0.35)",
          }}>Start 14-Day Free Trial</button>

          <p style={{ textAlign: "center", fontSize: 11, color: "var(--text-3)", marginTop: 12 }}>
            No credit card required · Cancel anytime
          </p>
        </div>
      </section>

      {/* Trust signals */}
      <section style={{ padding: "0 28px 80px", maxWidth: 800, margin: "0 auto" }}>
        <div style={{
          display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
          gap: 16,
        }}>
          {[
            { icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--text-3)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>, label: "Private & Secure", desc: "Your sessions are never stored or shared" },
            { icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--text-3)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>, label: "No Student Data", desc: "We never collect or store student information" },
            { icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--text-3)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>, label: "Always Current", desc: "Updated as the Australian curriculum evolves" },
            { icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--text-3)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>, label: "2,400+ Teachers", desc: "Trusted by teachers across Australia" },
          ].map(item => (
            <div key={item.label} style={{ textAlign: "center", padding: "1rem" }}>
              <div style={{ marginBottom: 8, display: "flex", justifyContent: "center" }}>{item.icon}</div>
              <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 3 }}>{item.label}</div>
              <div style={{ fontSize: 11, color: "var(--text-3)" }}>{item.desc}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Testimonials */}
      <section style={{
        padding: "48px 28px",
        background: "var(--surface)",
        borderTop: "1px solid var(--border-subtle)",
      }}>
        <div style={{ maxWidth: 960, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: 32 }}>
            <h2 style={{ fontSize: 20, fontWeight: 800, marginBottom: 4 }}>What teachers are saying</h2>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 16 }}>
            {[
              { quote: "Saved me 8 hours a week on lesson planning — absolutely worth every cent.", name: "Sarah T.", role: "Year 4 Teacher, Perth WA" },
              { quote: "Finally an AI that actually knows AC9 codes. This is the tool I've been waiting for.", name: "Michael R.", role: "Year 6 Teacher, Melbourne VIC" },
              { quote: "The rubric generator alone saves me hours every term. My feedback is so much more specific now.", name: "Priya K.", role: "Year 2 Teacher, Brisbane QLD" },
            ].map((t, i) => (
              <div key={i} style={{
                background: "var(--surface-2)",
                border: "1px solid var(--border)",
                borderRadius: 14,
                padding: "1.25rem",
              }}>
                <div style={{ fontSize: 20, fontWeight: 400, color: "var(--primary)", lineHeight: 1, marginBottom: 10 }}>"</div>
                <p style={{ fontSize: 13, color: "var(--text)", lineHeight: 1.65, fontStyle: "italic", marginBottom: 12 }}>{t.quote}</p>
                <div style={{ fontWeight: 700, fontSize: 12, color: "var(--primary-hover)" }}>{t.name}</div>
                <div style={{ fontSize: 11, color: "var(--text-3)" }}>{t.role}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section style={{ padding: "80px 28px", textAlign: "center" }}>
        <h2 style={{ fontSize: 28, fontWeight: 900, letterSpacing: "-0.02em", marginBottom: 12 }}>
          Ready to reclaim your weekends?
        </h2>
        <p style={{ fontSize: 16, color: "var(--text-2)", marginBottom: 28 }}>
          Join 2,400+ Australian teachers who spend less time planning and more time teaching.
        </p>
        <button style={{
          padding: "14px 32px",
          background: "var(--primary)", color: "#fff",
          border: "none", borderRadius: "var(--radius)",
          fontSize: 15, fontWeight: 700, cursor: "pointer",
          boxShadow: "0 0 24px rgba(99,102,241,0.35)",
        }}>Start Free — No Credit Card</button>
      </section>

      {/* Footer */}
      <footer style={{
        borderTop: "1px solid var(--border-subtle)",
        padding: "32px 28px",
        background: "var(--surface)",
      }}>
        <div style={{ maxWidth: 960, margin: "0 auto", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 16 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{
              width: 28, height: 28, borderRadius: 7,
              background: "linear-gradient(135deg, #6366f1, #818cf8)",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontWeight: 900, fontSize: 10, color: "#fff",
            }}>PN</div>
            <span style={{ fontWeight: 700, fontSize: 13 }}>PickleNickAI</span>
          </div>
          <div style={{ display: "flex", gap: 20 }}>
            {["Privacy Policy", "Terms of Service", "Contact"].map(link => (
              <a key={link} href="#" style={{ fontSize: 12, color: "var(--text-3)" }}>{link}</a>
            ))}
          </div>
          <div style={{ fontSize: 11, color: "var(--text-3)" }}>
            Made for Australian teachers — AC9 aligned
          </div>
        </div>
      </footer>
    </div>
  );
}