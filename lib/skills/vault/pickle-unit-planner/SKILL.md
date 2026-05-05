# PICKLE-UNIT-PLANNER — Unit Design Framework for Australian F-6

## Purpose

This skill teaches PickleNickAI how to design complete, curriculum-aligned unit plans for Australian F-6 teachers. A unit is a cohesive sequence of lessons (typically 8 weeks / 24 lessons) built around a single assessment focus. Units are the core product — teachers buy units, not individual lessons.

---

## What Is a Unit?

A unit is:
- **Duration:** 8–10 weeks (standard), 3–5 weeks (short/bolt-on units)
- **Lessons:** 3–5 per week × number of weeks
- **Cohesion:** All lessons build toward the same achievement standard
- **Assessment:** Cold task (pre) → instruction → Hot task (post)

### Cold Task
- Given to students in Week 1, BEFORE any instruction
- Samples the full achievement standard
- Purpose: reveals what students already know and can do
- Informs differentiation for the unit
- NOT used for grading — purely diagnostic

### Hot Task
- Given to students in the final week, AFTER all instruction
- Same assessment focus as cold task but different context/topic
- Compared against cold task to measure growth
- Used for grading

### The Rubric
- Built from the AC9 achievement standard for that year level/subject
- 4–6 assessment criteria
- A = above standard | B = at standard | C = at standard (lower) | D = below | E = well below
- Each cell contains a description of what student work looks like at that grade

---

## Unit Design Process

### Step 1 — Clarify the Assessment Focus
Ask: What should students know, understand, and be able to do by the end?
Find the AC9 achievement standard and relevant content descriptors for:
- Year level
- Subject (English/Maths/Science/HASS/Arts/Technologies)
- Topic

### Step 2 — Write the Cold Task
- Design a task that samples the full achievement standard
- Keep it short (one lesson or less)
- It should reveal prior knowledge and skill level
- Students do NOT know it's a pre-assessment — frame it naturally
- Example: "Before we start our unit on persuasive writing, let's see what you can already write. You have 30 minutes to..."

### Step 3 — Write the Hot Task
- Same assessment focus as cold task
- Different context, topic, or stimulus
- Same complexity and demands
- This is what students are graded on
- Example: cold task = persuasive letter about school uniform; hot task = persuasive speech about mobile phones

### Step 4 — Build the Rubric
- Start from the achievement standard
- Identify 4–6 things you're assessing (criteria)
- For each criterion, write 5 grade descriptions (A–E)
- A = what a student who exceeds the standard does
- E = what a student who is well below standard does
- Use the same rubric for cold and hot task marking

### Step 5 — Sequence Content Across Weeks
Use this scaffold for an 8-week unit:

| Weeks | Focus | Lesson Types |
|-------|-------|--------------|
| Week 1 | Foundation — vocabulary, background knowledge, cold task | Explicit + guided |
| Week 2 | Core skill 1 — key concept or strategy | Explicit → guided |
| Week 3 | Core skill 2 — building on week 2 | Explicit → guided → independent |
| Week 4 | Core skill 3 — application | Guided → collaborative → independent |
| Week 5 | Mid-unit check — analyse cold task data, re-teach gaps | Mixed |
| Week 6 | Extended application — complex or combined skills | Guided → collaborative |
| Week 7 | Refinement and fluency — practice, feedback, polish | Collaborative → independent |
| Week 8 | Hot task — demonstrate learning + reflection | Assessment + plenary |

For shorter units (3–5 weeks): compress Weeks 1–3 into foundation and core skill, Weeks 4–5 for application and hot task.

### Step 6 — Draft the Week-by-Week Breakdown
For each week, specify:
- Week theme (one phrase)
- AC9 content descriptors covered
- 3 lessons with lesson type (explicit/guided/collaborative/independent/assessment)
- Differentiation notes for that week

### Step 7 — Draft Individual Lessons
Use the `pickle-lesson-standard` skill for each lesson. Every lesson follows the 7-phase John Butler model:
1. Daily Review (5–10 min)
2. Introduction — WALT + TIB + WILF (5–10 min)
3. I Do — Focussed Instruction (10–15 min)
4. We Do — Guided Practice (10–15 min)
5. You Do (Together) — Collaborative Learning (10 min)
6. You Do (Independently) — Independent Learning (10–15 min)
7. Plenary — Review & Reflect (5–10 min)

### Step 8 — Add Differentiation
For each week, note differentiation for:
- **EAL/D learners:** visual word walls, sentence starters, home language support, reduced language demands
- **Gifted learners:** extension challenges, open-ended tasks, higher-order questioning, faster pace
- **Additional needs:** reduced demand, visual schedules, partner support, pre-scored materials

---

## Unit Plan Output Format

```
# [Unit Title] — [Subject] [Year Level]
**Duration:** [X] weeks | [Y] lessons | [Term] [Year]
**AC9 Achievement Standard:** [full text of achievement standard]
**AC9 Content Descriptors:** [list relevant codes]
**Mentor Text:** [Book Title]([Author]) — [1-sentence why it's perfect for this unit]

---

## Unit Overview
[2–3 sentence description of what students will learn and be able to do]

---

## Assessment Overview

### Cold Task (Week 1 — Pre-Assessment)
**Task:** [Full description of what students do]
**Duration:** [X] minutes
**Success Criteria:** [3–5 specific criteria]
**What It Reveals:** [what the cold task data tells the teacher about the class]

### Hot Task (Week [X] — Post-Assessment)
**Task:** [Full description of what students do]
**Duration:** [X] minutes
**Success Criteria:** [3–5 specific criteria]
**Comparison:** [how hot task will be compared to cold task to measure growth]

---

## 8-Week Unit Overview
| Week | Focus | AC9 Codes | Lesson 1 | Lesson 2 | Lesson 3 |
|------|-------|-----------|----------|----------|----------|
| 1 | [Foundation/vocabulary] | AC9... | Explicit | Guided | Guided |
| 2 | [Core skill 1] | AC9... | Explicit | Guided | Independent |
| ... | | | | | |

---

## Week-by-Week Breakdown

### Week 1: [Theme Name]
**AC9 Codes:** [list]
**Focus:** [what this week is about in 1–2 sentences]
**Cold Task:** Given this week

#### Lesson 1: [Lesson Title] — Explicit Instruction Focus
[WALT/TIB/WILF header block]
[Full 7-phase lesson plan — use pickle-lesson-standard format]

#### Lesson 2: [Lesson Title] — Guided Practice Focus
[Full 7-phase lesson plan]

#### Lesson 3: [Lesson Title] — Guided/Collaborative Focus
[Full 7-phase lesson plan]

**Week 1 Differentiation:**
| Strategy | EAL/D | Gifted | Additional Needs |
|----------|-------|--------|-----------------|

---

### [Repeat for each week...]

---

## Assessment Rubric

| Criterion | A (Excellent) | B (Good) | C (Satisfactory) | D (Needs Support) | E (Well Below) |
|-----------|---------------|----------|-----------------|------------------|---------------|
| [Criterion 1 — e.g. Ideas] | [Description of A-grade work] | [Description] | [Description] | [Description] | [Description] |
| [Criterion 2 — e.g. Text Structure] | | | | | |
| [Criterion 3 — e.g. Paragraphing] | | | | | |
| [Criterion 4 — e.g. Language] | | | | | |

---

## Resources

### Mentor Texts
- [Book 1] — [why it's used this unit]
- [Book 2] — [why it's used this unit]

### Materials Needed
- [specific resource 1]
- [specific resource 2]
- [digital tool or platform]

---

## Differentiation Summary

| Week | EAL/D | Gifted | Additional Needs |
|------|-------|--------|-----------------|
| Week 1 | [strategy] | [strategy] | [strategy] |
| Week 2 | | | |
| ... | | | |

---

## Follow-Up Prompts
"Ask me to: [1] Generate a quiz for this unit [2] Create an exit ticket for Week [X] [3] Write a specific lesson plan for Week [X] Lesson [Y] [4] Generate the hot task rubric in spreadsheet format [5] Create a parent information letter for this unit"
