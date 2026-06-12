# LID App — Leben in Deutschland Exam Prep

## What This Is
A premium exam preparation app for Germany's naturalization test ("Leben in Deutschland" / "Einbürgerungstest"). Users study 460 questions, simulate timed exams, and track progress until exam-ready.

## Exam Facts
- 460 total questions: 300 general + 160 state-specific (10 per Bundesland × 16 states)
- Real exam: 33 questions (30 general + 3 from user's selected state), 60 min, need 17/33 to pass
- Format: multiple choice, 4 options, 1 correct answer
- Official source: BAMF (Bundesamt für Migration und Flüchtlinge)

## Tech Stack
- **Next.js 14** (App Router, TypeScript, `src/` dir)
- **Tailwind CSS v3** + CSS variables in `globals.css`
- **Framer Motion** — all animations
- **Zustand** — global state, persisted to localStorage
- **Recharts** — progress charts
- **Lucide React** — icons (SVG only, no emojis)
- **canvas-confetti** — exam pass celebration
- **shadcn/ui** — Dialog + Progress primitives only

## Design System: Neo-Bauhaus Dark
```
--bg-base:       #0D0D0D   OLED black background
--bg-surface:    #141414   card base
--bg-raised:     #1C1C1C   elevated elements
--border:        #2A2A2A   dividers
--gold:          #D4AF37   primary accent (German gold)
--gold-dim:      #8B7216   muted gold for borders/hover
--red:           #C0392B   wrong answers / German flag red
--green:         #22C55E   correct answers
--text-primary:  #F0F0F0
--text-secondary:#888888
--text-muted:    #555555
```
Fonts: **Syne** (headings) + **IBM Plex Sans** (body) + **IBM Plex Mono** (timer/numbers)

## Core UX: State Selection
- On first launch: user picks their Bundesland (16 states) — saved to Zustand store, persisted
- All modes use this saved state by default (no re-selecting per session)
- Navbar always shows selected state badge; clicking opens state-switcher modal
- Exam: 30 general + 3 from saved state automatically
- Practice/Flashcards: "Include [State] questions" toggle, ON by default

## Language Toggle
- Questions shown in German by default (matches real exam)
- Per-question DE/EN toggle; preference persists per session
- Exam simulator can hide toggle for pure German practice mode

## Data Structure
```typescript
interface Question {
  id: number
  text_de: string        // German question text
  text_en: string        // English translation
  options_de: string[]   // 4 German options
  options_en: string[]   // 4 English options
  correctIndex: number   // 0-3
  category: string       // topic category
  state: string | null   // state name, null if general
  stateCode: string | null // e.g. "BY", null if general
  explanation_de: string
  explanation_en: string
}
```

## Zustand Store Shape
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

## File Structure
```
src/
  app/
    layout.tsx, page.tsx (dashboard)
    exam/page.tsx
    practice/page.tsx
    flashcards/page.tsx
    browse/page.tsx
    progress/page.tsx
  components/
    layout/Navbar.tsx, PageWrapper.tsx
    onboarding/StatePicker.tsx
    exam/ExamSetup.tsx, ExamQuestion.tsx, ExamTimer.tsx, ExamResults.tsx, QuestionGrid.tsx
    flashcard/FlashCard.tsx, DeckProgress.tsx
    practice/PracticeQuestion.tsx, TopicFilter.tsx
    progress/ReadinessGauge.tsx, TopicChart.tsx, StreakCalendar.tsx, WeakTopics.tsx
    ui/Button.tsx, Badge.tsx, Card.tsx
  data/questions.json
  lib/store.ts, types.ts, utils.ts, constants.ts
```

## Key Patterns
- `sampleQuestions()` in utils.ts is the single source of truth for filtering — used by exam, practice, and flashcards
- `PageWrapper` component wraps every page for Framer Motion transitions
- All progress data flows through Zustand — no prop drilling
- Questions have `text_de`/`text_en` + `options_de`/`options_en` — toggle just switches which field to render
