# PickleNickAI — Full Feature Spec
## Build Date: 2026-04-30

---

## VISION

Make PickleNickAI the most premium, feature-rich AI teaching tool in Australia. Not just "works" — feels like a professional tool teachers are proud to pay for. Every interaction should feel fast, smart, and considered.

---

## DESIGN SYSTEM

### Color Palette
- Primary: `#6366f1` (indigo)
- Primary Hover: `#818cf8`
- Primary Dim: `rgba(99,102,241,0.08)`
- Background: `#f8fafc` (cool white)
- Surface: `#ffffff`
- Surface-2: `#f1f5f9`
- Text: `#1e293b`
- Text-2: `#64748b`
- Text-3: `#94a3b8`
- Border: `#e2e8f0`
- Border Subtle: `#f1f5f9`
- Success: `#34d399`
- Danger: `#ef4444`
- Warning: `#f59e0b`

### Typography
- Font: Inter (imported from Google Fonts)
- Headings: 800 weight, letter-spacing -0.03em
- Body: 14-15px, line-height 1.6
- Section spacing: 80-120px between major sections

### Spacing (from Vercel/Craft)
- Compact → Spacious: minimum 24px internal card padding
- Section padding: 80-120px vertical
- Grid gaps: 16-24px
- Max content width: 1100px

### Animation Spec (from Linear/Craft)
- Hover glow: 150ms, box-shadow expands + shifts to primary color
- Press feedback: 50ms, scale(0.97)
- Staggered reveal: 100ms delay between items, 300ms duration, ease-out
- Page transitions: 250-350ms crossfade
- Easing: `cubic-bezier(0.25, 0.1, 0.25, 1)`
- Skeleton loading: gray pulse animation

---

## FEATURE 1: VOICE MODE

**What it is:** Teacher taps mic icon, speaks their lesson idea, PickleNickAI transcribes + generates a structured lesson plan in real-time.

**UX Flow:**
1. Floating chat widget has a prominent mic button (bottom-left of input area)
2. Tap to activate → visual "listening" state (animated waveform ring)
3. Speech transcribed in real-time as text appears in the input field
4. Tap "Generate Plan" → sends to `/api/chat`
5. Structured lesson plan appears in ChatView with full LessonPlanDisplay

**Technical:**
- Use Web Speech API (SpeechRecognition) for real-time transcription
- Fallback: if browser doesn't support it, show "Voice not supported" tooltip
- Mic icon: `🎤` → SVG microphone icon (no emoji)
- States: idle (gray mic), listening (pulsing blue ring), processing (spinner), done

**Visual details:**
- Listening state: ring animation around mic icon, waveform visualization
- Auto-stop after 30s silence
- "Listening..." label appears above input while active

---

## FEATURE 2: DIFFERENTIATION ENGINE

**What it is:** Dedicated mode where teacher pastes any content and gets instant 3-tier differentiated versions: EAL/D support, Gifted extension, Additional Needs adjustment.

**UX Flow:**
1. New sidebar item: "Differentiate" with icon (layered squares)
2. Opens DifferentiateView with:
   - Large text area: "Paste your content here (lesson plan, text, worksheet excerpt, resource)"
   - "Differentiate" button (primary, prominent)
   - Below: 3 output cards side-by-side: EAL/D | Gifted | Additional Needs
3. Each card has copy button and "Use in Chat" button

**Output format:**
Each tier shows:
- Modified/simplified version of content
- Specific teaching strategies for that learner type
- Suggested activities or adjustments

**Technical:**
- `/api/differentiate` endpoint that takes `content` + `yearLevel` + `subject`
- LLM prompt engineered for AC9 alignment + practical strategies

---

## FEATURE 3: COMMAND MENU (⌘K)

**What it is:** Keyboard shortcut opens a command palette for instant navigation and actions.

**UX Flow:**
1. Press `Cmd+K` (Mac) / `Ctrl+K` (Windows) anywhere in the app
2. Modal overlay appears with search input
3. Type to filter commands
4. Arrow keys to navigate, Enter to select

**Commands list:**
- `Open Chat` → switches to chat tab
- `New Lesson Plan` → opens PlannerView
- `New Rubric` → opens RubricView
- `Differentiate Content` → opens DifferentiateView
- `Voice Mode` → activates voice input
- `Check Curriculum Coverage` → opens Curriculum Gap Analyzer
- `Generate Report Comment` → opens Report Generator
- `Unit Library` → opens LibraryView
- `My Profile` → opens ProfileView
- `Upgrade to Pro` → opens pricing modal

**Visual:**
- Modal: dark overlay, centered input, white card with results
- Each result: icon + label + keyboard shortcut hint (right-aligned)
- Selected item: primary-colored background
- Animation: fade + scale in (150ms)

---

## FEATURE 4: SMART SUGGESTIONS (AS YOU TYPE)

**What it is:** While typing in the chat input, the AI surfaces contextual suggestions before you hit send. Not autocomplete — smart action prompts.

**UX Flow:**
1. After 2+ characters typed in chat input, suggestions appear above the send button
2. 2-3 quick action chips appear: "Generate lesson plan", "Create rubric", "Help me differentiate"
3. Tap chip → auto-fills input with relevant prompt
4. If typing looks like a lesson plan request → suggest "Generate lesson plan with WALT/TIB/WILF"
5. If typing about a student → suggest "Create behaviour support plan"

**Technical:**
- Debounce: 300ms after typing stops
- Match against keyword patterns (lesson plan keywords, rubric, behaviour, AC9 codes)
- Each suggestion is a clickable pill/chip
- Suggestions dismiss when input is cleared

**Visual:**
- Pills appear with slide-up animation (150ms)
- Pill style: `background: var(--surface-2)`, `border: 1px solid var(--border)`, `border-radius: 20px`, `font-size: 12px`
- Hover: primary color border, cursor pointer

---

## FEATURE 5: IMAGE UPLOAD + AI ANALYSIS

**What it is:** Teacher uploads a photo of student work (math, writing, whiteboard) and gets instant AI analysis with feedback and next steps.

**UX Flow:**
1. ChatView has a paperclip icon in the input area (left side)
2. Tap → file picker opens (images only: jpg, png, webp, heic)
3. Preview thumbnail appears in input area
4. Optional text prompt below image: "Analyze this and tell me the common misconceptions"
5. Send → AI processes image via vision, returns analysis
6. Response shown as structured card with: Assessment | Misconceptions | Suggested Questions | Next Steps

**Technical:**
- File input accepts: `image/jpeg, image/png, image/webp, image/heic`
- Max file size: 5MB (client-side check)
- Convert HEIC to JPEG before sending if needed (use library or warn user)
- Send to `/api/chat` with `imageBase64` in payload
- Backend decodes and sends to LLM vision endpoint

**Visual:**
- Image thumbnail: rounded corners, max-height 80px in input area
- Remove image button (X) top-right of thumbnail
- Loading state: "Analyzing image..." with spinner
- Response card: has "Image Analysis" badge, sections clearly labeled

---

## FEATURE 6: STUDENT PROGRESS TRACKER

**What it is:** Teacher uploads assessment data across a term. AI maps AC9 codes against student performance, generates visual progression for each student.

**UX Flow:**
1. New sidebar item: "Progress" (chart icon)
2. Opens ProgressView with:
   - "Upload Assessments" drop zone (CSV or photo of grades)
   - Student list (fetched from localStorage or uploaded)
   - Per-student: AC9 code coverage map with progress indicators
   - Visual: colored bars per AC9 code showing expected vs achieved
3. "Generate Report" → creates a printable progression summary

**Technical:**
- Accept CSV upload (student name, AC9 code, grade/achievement level)
- Or accept photos of mark books → OCR processing (future)
- Store in localStorage for now
- Visual using CSS bars (no chart library needed for MVP)

**Visual:**
- Progress bar per AC9 code: red (<50%), yellow (50-80%), green (>80%)
- Student cards with aggregated progress
- "Coverage gaps" highlighted in red

---

## FEATURE 7: LIVE CO-TEACHING MODE

**What it is:** A mode toggle that keeps PickleNickAI in a persistent "ready" state during class. Teacher can ask quick questions without breaking stride.

**UX Flow:**
1. New toggle in sidebar: "Live Mode" (lightning bolt icon)
2. When toggled ON:
   - Floating chat widget stays expanded and prominent
   - "During Class Mode" label appears
   - Quick question presets appear as chips: "De-escalate", "Extend Students", "Check Understanding"
   - Input placeholder: "Quick question during class..."
3. Teacher can keep it open while teaching, ask instant questions
4. Toggle OFF to return to normal

**Visual:**
- Toggle switch with lightning icon
- When active: floating widget has blue glow ring
- Preset chips: small, quick-tap buttons
- "During Class Mode" badge in sidebar

---

## FEATURE 8: CURRICULUM GAP ANALYZER

**What it is:** Teacher inputs topics they've covered. AI compares against AC9 scope and sequence for their year level and state, shows what's missing.

**UX Flow:**
1. New sidebar item: "Coverage" (map icon)
2. Opens CoverageView with:
   - Year level selector (dropdown)
   - State selector (WA/NSW/VIC — pre-filled from profile)
   - Text area: "List the topics you've covered this term"
   - "Analyze Coverage" button
3. Results: two-column layout
   - Left: topics covered (green checkmarks)
   - Right: missing topics (red alerts) with suggested lessons to fill gaps

**Technical:**
- Store AC9 scope & sequence data locally (JSON files in `/data`)
- Match teacher input against codes using fuzzy string matching
- Show missing content descriptors with suggested activities

**Visual:**
- Two cards side-by-side: "Covered" (green border) vs "Missing" (red border)
- Missing items have "Generate Lesson" button next to them
- Progress ring showing overall coverage percentage

---

## FEATURE 9: TERM REPORT GENERATOR

**What it is:** AI generates a professionally-worded parent update for a student, based on their term's work and AC9 achievement standards.

**UX Flow:**
1. New sidebar item: "Reports" (document icon)
2. Opens ReportView with:
   - Student name input
   - Year level (pre-filled)
   - Select term (T1/T2/T3/T4)
   - "Upload student work samples" (optional — photos)
   - Text area: brief notes on student progress
   - "Generate Report" button
3. Output: formatted letter-style document with:
   - AC9 achievement summary
   - Strengths (3 bullet points)
   - Areas to develop (2 bullet points)
   - Suggested home activities
   - Professional, warm tone
4. Actions: Copy, Download as DOCX, Save to library

**Technical:**
- `/api/generate-report` endpoint
- LLM uses AC9 achievement level language (exceeding, meeting, developing)
- Tone: professional but warm, suitable for parent communication

---

## FEATURE 10: VISUAL REDESIGN + ANIMATIONS

### Landing Page (app/page.tsx)
- Enable nav links (Features, Pricing, Blog) — link to anchor sections
- Add scroll-triggered fade-in animations on sections (Intersection Observer)
- Increase section padding: 80px minimum between sections
- Feature cards: hover with subtle lift + shadow (150ms ease)
- Social proof numbers: count-up animation on page load
- Hero CTA: hover scale(1.02) with glow pulse
- Testimonial cards: stagger-reveal on scroll (100ms delay each)

### App Layout (app/picklenickai/layout.tsx)
- Page transitions: fade between views (250ms)
- Sidebar items: hover background fade (100ms)
- Active tab indicator: slide animation (200ms)
- Cards throughout: hover lift with shadow deepening
- Loading states: skeleton screens with pulse animation

### Floating Chat Widget
- Already has pulse animation on generating state
- Expand/collapse: smooth height transition (300ms ease)
- New message: slide-up animation (200ms)
- Send button: pulse glow when input is not empty

### General Micro-interactions
- All buttons: `transform: scale(0.97)` on mousedown, snap back on release
- All interactive cards: `box-shadow` transition on hover
- Focus states: primary color ring (2px) instead of default blue
- Scroll behavior: `scroll-behavior: smooth`

---

## TECHNICAL NOTES

### API Routes Needed
- `POST /api/chat` — already exists, add image support
- `POST /api/differentiate` — new, returns 3-tier differentiation
- `POST /api/analyze-image` — new, vision analysis of uploaded images
- `POST /api/analyze-coverage` — new, curriculum gap analysis
- `POST /api/generate-report` — new, term report generation

### Data Files Needed
- `data/ac9-scopes.json` — AC9 scope & sequence by year level and state
- `data/differentiation-guide.json` — EAL/D, Gifted, Additional Needs strategies

### Browser APIs Used
- Web Speech API (SpeechRecognition) — Voice Mode
- FileReader API — Image upload
- localStorage — Student data, session persistence

### Libraries Needed
- `@types/web-speech-api` if available, or manual types
- Possibly `heic2any` for HEIC conversion (optional, can warn unsupported format)

---

## PRIORITY ORDER

1. Smart Suggestions (low effort, high impact — quick win)
2. ⌘K Command Menu (premium feel, fast build)
3. Voice Mode (differentiator)
4. Differentiation Engine (teacher value)
5. Image Upload + Analysis (high utility)
6. Visual Redesign (marketing impact)
7. Curriculum Gap Analyzer (medium)
8. Term Report Generator (medium)
9. Student Progress Tracker (larger build)
10. Live Co-Teaching Mode (context-aware)

---

## NO EMOJI RULE

All icons must be SVG. No emoji anywhere in UI.