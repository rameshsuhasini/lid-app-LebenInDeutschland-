# LID Prep — Leben in Deutschland Exam App

A premium exam preparation app for Germany's naturalization test (*Einbürgerungstest*). Study all 460 official BAMF questions, simulate timed exams, track your progress, and arrive at the test ready.

---

## What Is the Einbürgerungstest?

The *Leben in Deutschland* test is required for German naturalization. The real exam consists of **33 questions** (30 general + 3 from your selected state), lasts **60 minutes**, and requires a minimum score of **17/33** to pass. All 460 official questions are sourced from BAMF (Bundesamt für Migration und Flüchtlinge).

---

## Features

- **Mock Exam** — Full simulation: 33 questions, 60-minute countdown, official pass threshold (17/33), confetti on pass
- **Practice Mode** — Filter by topic category, toggle state questions on/off, instant answer feedback with explanations
- **Flashcards** — 3D flip animation, Know / Don't Know tracking, configurable deck sizes (10 / 20 / 50 / All)
- **Browse All** — Search across all 460 questions, filter by category and Bundesland, bookmark questions
- **Progress Dashboard** — Exam readiness gauge, topic breakdown, streak tracker, exam history, bookmarks
- **DE / EN Language Toggle** — Full UI and question content switches between German and English; preference persists per session
- **State Selection** — Pick your Bundesland once on first launch; state-specific questions are included automatically everywhere
- **Dark Metallic Theme** — OLED-friendly near-black design with deep navy accent and German flag palette

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 16 (App Router, TypeScript, `src/` dir) |
| Styling | Tailwind CSS v3 + CSS custom properties |
| Animation | Framer Motion |
| State | Zustand (persisted to localStorage) |
| Charts | Recharts |
| Icons | Lucide React |
| Celebration | canvas-confetti |
| UI Primitives | shadcn/ui (Dialog + Progress only) |

---

## Getting Started

**Prerequisites:** Node.js 18+

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Start production server
npm start
```

The app runs at `http://localhost:3000`.

---

## Project Structure

```
src/
├── app/
│   ├── layout.tsx          # Root layout, fonts, metadata
│   ├── page.tsx            # Dashboard / home
│   ├── exam/page.tsx       # Mock exam (setup → exam → results → review)
│   ├── study/page.tsx      # Unified study hub (Practice, Flashcards, Browse tabs)
│   └── progress/page.tsx   # Progress dashboard
├── components/
│   ├── layout/
│   │   ├── Navbar.tsx      # Fixed top nav, language toggle, state switcher
│   │   ├── AppShell.tsx    # Onboarding gate + layout wrapper
│   │   └── PageWrapper.tsx # Framer Motion page transition wrapper
│   ├── onboarding/
│   │   └── StatePicker.tsx # First-launch Bundesland selection screen
│   └── ui/
│       ├── Button.tsx      # Button variants: primary, secondary, ghost, danger, success
│       ├── Badge.tsx       # Badge variants: default, accent, green, red
│       └── Card.tsx        # Card with optional hover and accent glass styles
├── data/
│   └── questions.json      # All 460 BAMF questions (DE + EN, with explanations)
└── lib/
    ├── store.ts            # Zustand store — progress, bookmarks, exam history, streak
    ├── i18n.ts             # DE/EN translation strings (flat key/value, no framework)
    ├── types.ts            # TypeScript interfaces: Question, ExamSession
    ├── utils.ts            # filterQuestions(), sampleExam(), calcReadiness(), formatTime()
    └── constants.ts        # CATEGORIES, BUNDESLAENDER, exam constants
```

---

## Question Data Format

Each of the 460 questions follows this structure:

```typescript
interface Question {
  id: number
  text_de: string         // German question text
  text_en: string         // English translation
  options_de: string[]    // 4 German answer options
  options_en: string[]    // 4 English answer options
  correctIndex: number    // 0–3
  category: string        // "Demokratie" | "Geschichte" | "Gesellschaft" |
                          // "Grundrechte" | "Landeskunde" | "Politik" | "Wirtschaft"
  state: string | null    // State name for state-specific questions, null if general
  stateCode: string | null// e.g. "BY" for Bayern, null if general
  explanation_de: string  // Explanation in German
  explanation_en: string  // Explanation in English
}
```

300 questions are general (state: null). The remaining 160 are state-specific — 10 per Bundesland across all 16 states.

---

## Exam Format

| Parameter | Value |
|---|---|
| Total questions | 33 (30 general + 3 from selected state) |
| Time limit | 60 minutes |
| Passing score | 17 / 33 |
| Question pool | 460 (300 general + 160 state-specific) |

---

## Global State (Zustand)

```typescript
{
  selectedState: string | null        // e.g. "Bayern"
  selectedStateCode: string | null    // e.g. "BY"
  hasCompletedOnboarding: boolean
  preferredLang: 'de' | 'en'
  progress: Record<number, 'correct' | 'wrong' | 'skipped'>
  bookmarks: number[]
  examHistory: ExamSession[]
  streak: number
  lastActiveDate: string | null
}
```

All state is persisted to `localStorage` via Zustand's persist middleware. No backend or database required.

---

## Design System

**Neo-Bauhaus Dark** — OLED black base with a deep navy accent and the German flag color palette.

```
Background:     #0E0E10   near-black
Surface:        #161618   cards
Raised:         #1E1E20   inputs / options
Navy accent:    #1E3FA8   primary actions, selected states
Accent hover:   #2952C8
German red:     #C0392B   wrong answers, brand
Green:          #34D058   correct answers
Text primary:   #F0F0F0
Text secondary: #888888
Text muted:     #555555
```

Fonts: **Syne** (headings) · **IBM Plex Sans** (body) · **IBM Plex Mono** (timer, numbers)

---

## Key Architectural Decisions

- **`filterQuestions()`** in `utils.ts` is the single source of truth for filtering across Practice, Flashcards, and Browse — no duplicated filter logic.
- **`getT(lang)`** in `i18n.ts` is a plain function (not a hook) returning a typed flat translation object, avoiding circular imports between the store and i18n modules.
- **No `useTransition`** on filter state — filtering 460 items takes <1ms; deferring updates with `startTransition` only adds perceived lag.
- **`key={mode}`** on `AnimatePresence` in the Study page causes each tab's component to fully remount on switch, giving each mode a clean state.
- **`<Suspense>`** wrapper around `StudyContent` is required because it calls `useSearchParams()`, which needs a suspense boundary in Next.js static pages.

---

## License

This project is for personal educational use. Question content is sourced from BAMF's official published question catalogue.
