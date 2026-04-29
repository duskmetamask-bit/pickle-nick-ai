# PickleNickAI

**Premium AI Teaching Assistant for Australian F-6 Teachers**

PickleNickAI is a Next.js web app that provides Australian primary school teachers with an intelligent teaching assistant. Teachers pay $19/month to have a conversation with their personal AI colleague — lesson planning, assessment, rubrics, writing feedback, behaviour strategies, and more.

**Live:** [pickle-nick-ai.vercel.app/picklenickai](https://pickle-nick-ai.vercel.app/picklenickai)

---

## How It Works

PickleNickAI is a **pure LLM application** — the web app is the product. No separate agent runs behind the scenes.

1. Teacher opens the web app and starts a session
2. UI sends messages to `/api/chat` along with teacher profile (name, year levels, subjects, state)
3. API route loads all 19 skills from `lib/skills/vault/` and builds a system prompt
4. System prompt + conversation sent to **DeepSeek V3.2 via NVIDIA NIM**
5. Response streamed back to the UI in real-time

---

## Architecture

```
[Teacher] → [Next.js Web App] → [NVIDIA NIM / DeepSeek V3.2] → [Response]
                ↑
        [19 skills loaded from lib/skills/vault/]
```

- **LLM:** DeepSeek V3.2 (`deepseek-ai/deepseek-v3.2`) via `integrate.api.nvidia.com`
- **Skills:** 19 curated knowledge bases in `lib/skills/vault/`, auto-loaded per request
- **Sessions:** Per-teacher, isolated, no student data stored
- **Streaming:** Server-Sent Events for real-time chat responses

---

## Features

| Feature | Route | Powered by |
|---------|-------|------------|
| Conversational AI | `POST /api/chat` | DeepSeek V3.2 + skills |
| Lesson plan generation | `POST /api/generate` | DeepSeek V3.2 |
| Rubric generation | `POST /api/rubric` | DeepSeek V3.2 |
| Auto-marking | `POST /api/auto-mark` | DeepSeek V3.2 |
| Writing feedback | `POST /api/writing-feedback` | DeepSeek V3.2 (10-dimension analysis) |
| Worksheet generation | `POST /api/worksheet` | DeepSeek V3.2 |
| Unit library | `POST /api/library/units` | Static data |
| Export to PDF/DOCX/PPT | `POST /api/export/*` | File generation |

---

## The Skills System

PickleNickAI's intelligence comes from 19 skills in `lib/skills/vault/`:

- **Core:** `pickle-lesson-standard` — John Butler Instructional Model (7-phase explicit teaching)
- **Curriculum:** maths, science, HASS, arts, technologies, writing
- **Assessment:** assessment, marking, standards, reporting
- **Practice:** teaching, differentiation, behaviour, wellbeing
- **Admin:** parent communication, resources, legal, product

Adding a new skill: create `lib/skills/vault/pickle-[topic]/SKILL.md` — it's auto-loaded next deploy.

See [SOUL.md](./SOUL.md) for the full product identity and behaviours.
See [SKILLS.md](./SKILLS.md) for the technical skills architecture.

---

## Instructional Model

Every lesson plan follows the **John Butler Primary College Instructional Model** — a 7-phase explicit teaching sequence:

1. Daily Review (5-10 min)
2. Introduction — WALT + TIB + WILF (5-10 min)
3. I Do — Focussed Instruction (10-15 min)
4. We Do — Guided Practice (10-15 min)
5. You Do (Together) — Collaborative Learning (10 min)
6. You Do (Independently) — Independent Learning (10-15 min)
7. Plenary — Review & Reflect (5-10 min)

Key rules: CFU in every phase, 80% mastery threshold in We Do, WAGOLL for new concepts.

---

## Setup

```bash
# Install dependencies
npm install

# Set environment variables
cp .env.example .env.local
# Add OPENAI_API_KEY (NVIDIA NIM key)

# Run development server
npm run dev

# Build for production
npm run build
```

## Environment Variables

```bash
OPENAI_API_KEY=         # NVIDIA NIM key (primary)
NIM_API_KEY=            # NVIDIA NIM key (fallback)
GOOGLE_CLIENT_ID=       # Google OAuth client ID (for Google Drive export)
GOOGLE_CLIENT_SECRET=   # Google OAuth client secret (for Google Drive export)
NEXT_PUBLIC_APP_URL=    # Your app URL (e.g. https://pickle-nick-ai.vercel.app)
```

If not set, the app runs in demo mode with placeholder responses.

---

## Google Drive Integration

Teachers can save generated content (lesson plans, rubrics, assessments, writing feedback) directly to their Google Drive.

### Setup

1. Go to [console.cloud.google.com](https://console.cloud.google.com)
2. Create a new project (or select existing)
3. Enable **Google Drive API** (`APIs & Services > Library`)
4. Go to **APIs & Services > Credentials**
5. Click **Create Credentials > OAuth client ID**
6. Application type: **Web application**
7. Add authorized redirect URI:
   ```
   https://pickle-nick-ai.vercel.app/api/auth/google/callback
   ```
   (or your custom domain)
8. Copy the **Client ID** and **Client Secret**
9. Add them to your environment variables or Vercel project settings

### How It Works

- Teacher clicks "Save to Google Drive" on any generated content
- App redirects to Google OAuth consent screen (`drive.file` scope — can only access files created by this app)
- After consent, teacher is redirected back and tokens stored in browser
- File is uploaded to teacher's Google Drive and a shareable link shown
- Tokens persist in localStorage — teacher stays connected across sessions

### Scopes Used

| Scope | Purpose |
|-------|---------|
| `drive.file` | Create and manage files created by this app only |
| `userinfo.profile` | Get teacher's name for display |
| `userinfo.email` | Get teacher's email (for future features) |

---

## Tech Stack

- **Framework:** Next.js 14 (App Router)
- **LLM:** DeepSeek V3.2 via NVIDIA NIM
- **Styling:** CSS (custom)
- **Deployment:** Vercel

---

## Future (Phase 2)

Planned features:
- Email onboarding for new teachers
- Reminder emails for lesson planning / assessment deadlines
- Proactive suggestions based on session history
- Telegram interface for alternative access

---

*PickleNickAI — your personal AI teaching colleague.*