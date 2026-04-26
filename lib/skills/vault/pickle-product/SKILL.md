# pickle-product

## Purpose
This skill captures how to RUN PickleNickAI as a vertical AI agent product. It is NOT about teaching — it is about operating, improving, and growing PickleNickAI.

**This skill is for Yuki (and any ephemeral subagent working on PickleNickAI).**

---

## IDENTITY — What PickleNickAI IS

**What PickleNickAI is NOT:**
- NOT a SaaS product
- NOT a software app with features
- NOT a dashboard with menus
- NOT something teachers configure

**What PickleNickAI IS:**
- A vertical AI agent — expert intelligence in a box
- Teachers describe what they need → AI builds it
- The product is the teaching intelligence, not the UI
- The moat is the skills + AC9 knowledge + Australian teaching frameworks

**The interface is the agent. Everything else is just how you talk to it.**

---

## CORE MISTAKES — LEARN FROM YUKI'S FAILURES

### Mistake 1: Calling it SaaS (2026-04-21)
**What happened:** Yuki kept referring to PickleNickAI as "SaaS" in messages and documents.
**Why it was wrong:** SaaS implies software features, dashboards, configuration. PickleNickAI is intelligence. The product is the AI's knowledge, not an app's features.
**What to do:** Say "vertical AI agent" or "AI agent" — never "SaaS" when referring to PickleNickAI specifically.

### Mistake 2: Waiting for Teacher Feedback Before Improving (2026-04-21)
**What happened:** Yuki said "I'll improve the skills after teacher feedback."
**Why it was wrong:** Teacher feedback is ONE input. Not the only one. Competitive research, gap analysis, and proactive improvement happen WITHOUT waiting.
**What to do:** The weekly improvement cron runs EVERY WEEK regardless of whether teachers have complained. Improvements ship proactively.

### Mistake 3: One-Off Improvements Instead of Systematic Loop (2026-04-21)
**What happened:** Yuki made improvements during one session but didn't build a recurring system.
**Why it was wrong:** One improvements = slow decay. Skills go stale. Competitors pass you.
**What to do:** The improvement loop is a CRON. It runs every Monday at 10 AM AWST. Every week. Forever.

### Mistake 4: Not Logging Improvements to Vault (2026-04-20)
**What happened:** Yuki made verbal promises about improvements but didn't commit them to vault.
**Why it was wrong:** If it's not in the vault, it doesn't exist. Memory fades. Sessions end. Changes disappear.
**What to do:** Every improvement gets committed to git immediately. The vault is the source of truth.

### Mistake 5: Improving Without Research (2026-04-20)
**What happened:** Yuki improved skills based on assumptions rather than competitive research.
**Why it was wrong:** Improvements without research = building the wrong thing faster.
**What to do:** Before improving, check what competitors are doing. What features are they adding? What are teachers complaining about? Build what matters.

---

## PRODUCT IMPROVEMENT LOOP

### The Weekly Cycle (Every Monday 10 AM AWST)

```
Monday 10 AM: PickleNickAI Improvement Cron fires
        ↓
Phase 1: Competitive Teardown
- MagicSchool AI — what new features?
- Khanmigo — any updates?
- Diffit — new capabilities?
- New entrants — anyone in the market?
        ↓
Phase 2: Skills Gap Analysis
- Read all 4 skills (pickle-teaching, pickle-education, pickle-marking, pickle-writing)
- What's missing? What's weak? What's outdated?
        ↓
Phase 3: Teacher Feedback Review
- Read vault/shared/PROJECTS/pickle-nick-ai/feedback/
- Patterns in low ratings?
        ↓
Phase 4: Improve the Skills
- Add missing content
- Fix weak sections
- Update based on competitor research
- Commit each change immediately
        ↓
Phase 5: Post Summary to #builds
- What changed
- What competitors are doing
- Next week's focus
```

### Quality Bar

**PickleNickAI quality bar: avg 4.2/5 across all skill outputs before public launch.**

If a skill's average rating drops below 4.0 → immediate review sprint.

---

## COMPETITIVE INTELLIGENCE

### Key Competitors to Monitor Weekly

| Competitor | What to Watch | Their Standout Feature |
|------------|--------------|----------------------|
| MagicSchool AI | New features, pricing changes, teacher complaints | IEP Generator (legally compliant SMART goals) |
| Khanmigo | Updates, new integrations, teacher sentiment | Socratic tutoring model |
| Diffit | New differentiation features, pricing | One text → multiple reading levels |
| New entrants | Anyone building for teachers | — |

### What Makes PickleNickAI Different

**MagicSchool AI** = feature-rich, enterprise sales model, $99/yr
**Khanmigo** = free, nonprofit, Khan Academy content
**Diffit** = differentiation-only tool

**PickleNickAI = the only Australian-specific vertical teaching agent**
- AC9 curriculum, not CCSS or NGSS
- WA/SA/QLD/NSW/VIC/TAS/NT context
- AITSL standards alignment
- EAL/D strategies for Australian classrooms
- NCCD documentation support

This is the moat. Competitors are US-focused. PickleNickAI owns Australia.

---

## SKILL ECOSYSTEM

### What Each Skill Does

| Skill | What It Covers | Owner |
|-------|---------------|-------|
| `pickle-teaching` | Pedagogical frameworks (Gradual Release, 5E, WIEP, DI), behaviour management, AITSL, trauma-informed, UDL | Yuki |
| `pickle-education` | AC9 curriculum F-6, WA context, SCSA, cross-curriculum priorities, EAL/D, NCCD, PAT interpretation | Yuki |
| `pickle-marking` | Rubric design, A-E grades, feedback writing (Hattie & Timperley), PAT scaled scores | Yuki |
| `pickle-writing` | All text types, writing process, Writing Workshop, Showing vs Telling | Yuki |
| `pickle-product` | This skill — how to run, improve, and operate PickleNickAI | Yuki |

### Skill Loading Order

When PickleNickAI generates content:
1. Load `pickle-product` first (knows how to run)
2. Load `pickle-education` (curriculum context)
3. Load `pickle-teaching` (pedagogical frameworks)
4. Load `pickle-marking` OR `pickle-writing` (depending on the task)
5. Generate

---

## AC9 CURRICULUM KNOWLEDGE

### Why This Matters

The biggest risk for PickleNickAI is hallucinating AC9 codes. Teachers will lose trust immediately if a code is wrong.

**Non-negotiable rules:**
1. NEVER generate an AC9 code that doesn't exist
2. ALWAYS cite the code when making curriculum claims
3. If uncertain: say "I'm less confident about [X] — verify against official AC9"

### AC9 Code Format

```
AC[version][year][learning area][strand][number]
```

Examples:
- AC9E4LY01 = Year 4, English, Language strand, descriptor 01
- AC9M5N02 = Year 5, Mathematics, Number strand, descriptor 02
- AC9SC3S01 = Year 3, Science, Science strand, descriptor 01

### Valid AC9 Learning Area Codes

| Code | Learning Area |
|------|--------------|
| E | English |
| M | Mathematics |
| SC | Science |
| HA | Humanities and Social Sciences |
| TE | Technologies |
| AR | The Arts |
| HE | Health and Physical Education |
| LA | Languages |

### Year Level Coverage Priority

| Priority | Learning Area | Why |
|----------|--------------|-----|
| P0 | English | Highest teacher demand |
| P0 | Mathematics | Highest teacher demand |
| P1 | Science | Growing teacher interest |
| P1 | HASS | Growing teacher interest |
| P2 | Technologies | Lower priority for now |
| P2 | The Arts | Lower priority for now |
| P2 | Health & Physical Education | Lower priority for now |
| P3 | Languages | Varies by school |

---

## IMPROVEMENT TRIGGERS

### Automatic (Cron-Based)
- Weekly: Competitor teardown + skills gap analysis (Monday 10 AM)
- Weekly: Output quality review (avg rating per skill)
- Monthly: Knowledge base staleness check (any skill not updated in 90+ days)

### Manual (Yuki Triggers)
- New competitor enters the market
- Major competitor feature launch
- Teacher feedback pattern shows specific gap
- Dusk requests specific improvement
- AC9 curriculum update detected

---

## VAULT STRUCTURE FOR PICKLENICKAI

```
vault/shared/PROJECTS/pickle-nick-ai/
├── PROJECT-PLAN.md          ← The source of truth for what to build
├── design-system/           ← CSS variables, typography, components
├── feedback/                ← Teacher ratings and comments
│   └── YYYY-MM-DD.md        ← Dated feedback logs
└── competitive-intel/       ← Weekly competitor research
    └── YYYY-MM-DD.md

vault/shared/skills/
├── pickle-product/          ← This skill
├── pickle-teaching/          ← Pedagogical frameworks
├── pickle-education/         ← AC9 + WA context
├── pickle-marking/           ← Assessment + feedback
└── pickle-writing/           ← Writing instruction

vault/YUKI/
├── daily/                    ← Session logs
├── mistakes/                 ← Dated mistake logs
└── improvement-log/          ← Weekly improvement sprint logs
```

---

## WHAT PICKLENICKAI IS NOT

PickleNickAI is NOT:
- A lesson plan database
- A worksheet generator
- A content library
- A teacher management tool
- A student information system

PickleNickAI IS:
- An expert teacher in a box
- A co-pilot that knows AC9, pedagogy, and Australian teaching context
- A tool that turns "I need a Year 4 narrative writing unit" into a complete, curriculum-aligned resource in seconds

---

## FILE LOCATION

This skill lives at: `vault/shared/skills/pickle-product/SKILL.md`

**Related skills:**
- `pickle-teaching` — Pedagogical knowledge
- `pickle-education` — Curriculum knowledge
- `pickle-marking` — Assessment knowledge
- `pickle-writing` — Writing instruction knowledge

---

*Last updated: 2026-04-21 | Author: Yuki | Version: 1.0*
*Purpose: How to RUN PickleNickAI as a vertical AI agent product*
