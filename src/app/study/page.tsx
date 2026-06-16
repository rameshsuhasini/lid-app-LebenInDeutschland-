"use client";
import React, { useState, useMemo, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { useStore } from "@/lib/store";
import { getT } from "@/lib/i18n";
import { filterQuestions, weightedShuffle, cn } from "@/lib/utils";
import { CATEGORIES, BUNDESLAENDER } from "@/lib/constants";
import questions from "@/data/questions.json";
import PageWrapper from "@/components/layout/PageWrapper";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Badge from "@/components/ui/Badge";
import type { Question } from "@/lib/types";
import {
  CheckCircle2, XCircle, Bookmark, BookmarkCheck,
  ChevronRight, ChevronDown, RotateCcw, BookOpen,
  SlidersHorizontal, Eye, Search, Layers, CreditCard,
} from "lucide-react";

const allQ = questions as Question[];
const PER_PAGE = 15;
type StudyMode = "practice" | "flashcards" | "browse";

// ── Shared two-column setup layout ─────────────────────────────────────────
function SetupLayout({
  t, includeState, setIncludeState,
  selectedState, selectedStateCode,
  selectedCats, toggleCat, clearCats,
  filtered, extra, onStart, startLabel,
}: {
  t: ReturnType<typeof getT>;
  includeState: boolean; setIncludeState: (v: boolean) => void;
  selectedState: string | null; selectedStateCode: string | null;
  selectedCats: string[]; toggleCat: (c: string) => void; clearCats: () => void;
  filtered: Question[]; extra?: React.ReactNode;
  onStart: () => void; startLabel: string;
}) {
  return (
    <div className="grid lg:grid-cols-[1fr_260px] gap-6 items-start">
      <div className="space-y-5">
        <Card>
          <button onClick={() => setIncludeState(!includeState)} className="flex items-center justify-between w-full cursor-pointer">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-raised flex items-center justify-center shrink-0">
                <BookOpen size={14} className="text-text-lo" />
              </div>
              <div>
                <div className="text-sm font-semibold text-text-hi">
                  {t.includeStateQ.replace("{state}", selectedState ?? t.noStateSelected)}
                </div>
                <div className="text-xs text-text-faint mt-0.5">{selectedStateCode ?? t.noStateSelected}</div>
              </div>
            </div>
            <div className={`w-10 h-5 rounded-full transition-colors relative shrink-0 ${includeState ? "bg-accent" : "bg-raised border border-[rgba(255,255,255,0.12)]"}`}>
              <div className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow-sm transition-transform ${includeState ? "translate-x-5" : "translate-x-0.5"}`} />
            </div>
          </button>
        </Card>

        {extra}

        <div>
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <SlidersHorizontal size={13} className="text-text-faint" />
              <span className="text-xs font-semibold text-text-lo uppercase tracking-wide">{t.filterByTopic}</span>
            </div>
            {selectedCats.length > 0 && (
              <button onClick={clearCats} className="text-xs text-text-faint hover:text-accent transition-colors cursor-pointer">{t.clearAll}</button>
            )}
          </div>
          <div className="flex flex-wrap gap-2">
            {CATEGORIES.map(c => (
              <button key={c} onClick={() => toggleCat(c)}
                className={cn(
                  "text-xs px-3 py-2 rounded-xl border cursor-pointer transition-colors font-medium",
                  selectedCats.includes(c)
                    ? "bg-[rgba(30,63,168,0.14)] border-[rgba(30,63,168,0.28)] text-accent"
                    : "bg-surface border-[rgba(255,255,255,0.08)] text-text-lo hover:text-text-hi hover:border-[rgba(30,63,168,0.28)]"
                )}
              >{c}</button>
            ))}
          </div>
        </div>
      </div>

      <div className="space-y-3">
        <Card accent className="text-center py-5">
          <div className="font-mono font-bold text-5xl text-accent mb-1">{filtered.length}</div>
          <div className="text-xs text-text-faint mb-4">{t.questionsInDeck}</div>
          <div className="border-t border-[rgba(255,255,255,0.06)] pt-4 space-y-2.5">
            <div className="flex justify-between text-xs">
              <span className="text-text-faint">{t.general}</span>
              <span className="font-semibold text-text-hi">{filtered.filter(q => !q.state).length}</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-text-faint">{selectedState ?? t.general}</span>
              <span className="font-semibold text-text-hi">{filtered.filter(q => !!q.state).length}</span>
            </div>
            {selectedCats.length > 0 && (
              <div className="flex justify-between text-xs">
                <span className="text-text-faint">{selectedCats.length} {t.topicsSelected}</span>
              </div>
            )}
          </div>
        </Card>
        <Button variant="primary" glow size="lg" className="w-full" disabled={filtered.length === 0} onClick={onStart}>
          {startLabel} <ChevronRight size={14} />
        </Button>
      </div>
    </div>
  );
}

// ── Practice Mode ──────────────────────────────────────────────────────────
function PracticeMode() {
  const { selectedState, selectedStateCode, preferredLang, progress, recordAnswer, toggleBookmark, bookmarks } = useStore();
  const lang = preferredLang;
  const t = getT(lang);

  const [phase, setPhase] = useState<"setup" | "practice" | "done">("setup");
  const [includeState, setIncludeState] = useState(true);
  const [selectedCats, setSelectedCats] = useState<string[]>([]);
  const [deck, setDeck] = useState<Question[]>([]);
  const [idx, setIdx] = useState(0);
  const [chosen, setChosen] = useState<number | null>(null);
  const [sessionCorrect, setSessionCorrect] = useState(0);
  const [sessionWrong, setSessionWrong] = useState(0);

  const filtered = useMemo(() => filterQuestions(allQ, {
    stateCode: includeState ? selectedStateCode ?? undefined : undefined,
    categories: selectedCats.length ? selectedCats : undefined,
    includeGeneral: true,
  }), [includeState, selectedCats, selectedStateCode]);

  const start = () => {
    const shuffled = weightedShuffle(filtered, progress);
    setDeck(shuffled); setIdx(0); setChosen(null);
    setSessionCorrect(0); setSessionWrong(0);
    setPhase("practice");
  };

  const next = () => {
    setChosen(null);
    if (idx + 1 >= deck.length) { setPhase("done"); return; }
    setIdx(i => i + 1);
  };

  const pick = (oi: number) => {
    if (chosen !== null) return;
    setChosen(oi);
    const q = deck[idx];
    const correct = oi === q.correctIndex;
    recordAnswer(q.id, correct ? "correct" : "wrong");
    if (correct) setSessionCorrect(c => c + 1); else setSessionWrong(w => w + 1);
  };

  const toggleCat = (c: string) => setSelectedCats(prev => prev.includes(c) ? prev.filter(x => x !== c) : [...prev, c]);

  if (phase === "setup") return (
    <SetupLayout
      t={t}
      includeState={includeState} setIncludeState={setIncludeState}
      selectedState={selectedState} selectedStateCode={selectedStateCode}
      selectedCats={selectedCats} toggleCat={toggleCat} clearCats={() => setSelectedCats([])}
      filtered={filtered} onStart={start} startLabel={t.startPractice}
    />
  );

  if (phase === "done") return (
    <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="text-center pt-6">
      <div className="font-syne font-extrabold text-5xl text-text-hi mb-2">
        {sessionCorrect}<span className="text-text-faint text-2xl">/{deck.length}</span>
      </div>
      <p className="text-text-lo text-sm mb-6">{t.sessionComplete} · {Math.round((sessionCorrect / deck.length) * 100)}% {t.accuracy}</p>
      <div className="flex gap-2 justify-center">
        <Button variant="secondary" onClick={start}><RotateCcw size={13} /> {t.newSession}</Button>
        <Button variant="ghost" onClick={() => setPhase("setup")}>{t.changeFilters}</Button>
      </div>
    </motion.div>
  );

  const q = deck[idx];
  const answered = chosen !== null;

  return (
    <div className="pt-2">
      <div className="flex items-center gap-3 mb-6">
        <div className="flex-1 h-1 bg-raised rounded-full overflow-hidden">
          <motion.div className="h-full bg-accent rounded-full" animate={{ width: `${(idx / deck.length) * 100}%` }} />
        </div>
        <span className="text-xs font-mono text-text-faint">{idx + 1}/{deck.length}</span>
        <div className="flex items-center gap-2">
          <span className="text-xs text-c-green font-semibold">{sessionCorrect} {t.practiceCorrect}</span>
          <span className="text-xs text-c-red font-semibold">{sessionWrong} {t.practiceWrong}</span>
        </div>
      </div>

      <AnimatePresence mode="wait">
        <motion.div key={q.id} initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -14 }} transition={{ duration: 0.2 }}>
          <div className="flex items-center justify-between mb-3">
            <Badge variant="default">{q.category}</Badge>
            <button onClick={() => toggleBookmark(q.id)} className="cursor-pointer text-text-faint hover:text-accent transition-colors">
              {bookmarks.includes(q.id) ? <BookmarkCheck size={15} className="text-accent" /> : <Bookmark size={15} />}
            </button>
          </div>
          <p className="font-syne font-bold text-xl text-text-hi mb-5 leading-snug">{lang === "de" ? q.text_de : q.text_en}</p>

          <div className="space-y-2.5 mb-4">
            {(lang === "de" ? q.options_de : q.options_en).map((opt, oi) => {
              let cls = "bg-surface border-[rgba(255,255,255,0.08)] hover:border-[rgba(30,63,168,0.30)] hover:text-text-hi text-text-lo";
              if (answered) {
                if (oi === q.correctIndex) cls = "option-correct";
                else if (oi === chosen) cls = "option-wrong";
                else cls = "border-[rgba(255,255,255,0.05)] text-text-faint bg-raised";
              }
              return (
                <motion.button key={oi}
                  initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: oi * 0.04 }}
                  onClick={() => pick(oi)}
                  className={`w-full text-left px-4 py-3.5 rounded-2xl border text-sm transition-all duration-150 leading-snug ${answered ? "" : "cursor-pointer"} ${cls}`}
                >
                  <span className="font-mono text-[10px] text-text-faint mr-2">{String.fromCharCode(65 + oi)}</span>{opt}
                </motion.button>
              );
            })}
          </div>

          {answered && (
            <AnimatePresence>
              <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="mb-4">
                <div className={`flex items-center gap-2 mb-2 text-sm font-semibold ${chosen === q.correctIndex ? "text-c-green" : "text-c-red"}`}>
                  {chosen === q.correctIndex ? <CheckCircle2 size={15} /> : <XCircle size={15} />}
                  {chosen === q.correctIndex ? t.answerCorrect : t.answerWrong}
                </div>
                {q.explanation_de && (
                  <p className="text-xs text-text-lo leading-relaxed bg-raised px-4 py-3 rounded-2xl border border-[rgba(255,255,255,0.06)]">
                    {lang === "de" ? q.explanation_de : q.explanation_en}
                  </p>
                )}
                <Button variant="primary" className="w-full mt-3" onClick={next}>
                  {idx + 1 < deck.length ? <>{t.next} <ChevronRight size={13} /></> : t.finish}
                </Button>
              </motion.div>
            </AnimatePresence>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

// ── Flashcards Mode ────────────────────────────────────────────────────────
function FlashcardsMode() {
  const { selectedState, selectedStateCode, preferredLang, progress } = useStore();
  const lang = preferredLang;
  const t = getT(lang);

  const [phase, setPhase] = useState<"setup" | "cards" | "done">("setup");
  const [includeState, setIncludeState] = useState(true);
  const [selectedCats, setSelectedCats] = useState<string[]>([]);
  const [deckSize, setDeckSize] = useState<number | "all">(20);
  const [deck, setDeck] = useState<Question[]>([]);
  const [idx, setIdx] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [known, setKnown] = useState(0);
  const [unknown, setUnknown] = useState(0);

  const filtered = useMemo(() => filterQuestions(allQ, {
    stateCode: includeState ? selectedStateCode ?? undefined : undefined,
    categories: selectedCats.length ? selectedCats : undefined,
    includeGeneral: true,
  }), [includeState, selectedCats, selectedStateCode]);

  const start = () => {
    let pool = weightedShuffle(filtered, progress);
    if (deckSize !== "all") pool = pool.slice(0, deckSize);
    setDeck(pool); setIdx(0); setFlipped(false); setKnown(0); setUnknown(0);
    setPhase("cards");
  };

  const advance = (knew: boolean) => {
    if (knew) setKnown(k => k + 1); else setUnknown(u => u + 1);
    setFlipped(false);
    if (idx + 1 >= deck.length) { setPhase("done"); return; }
    setIdx(i => i + 1);
  };

  const toggleCat = (c: string) => setSelectedCats(prev => prev.includes(c) ? prev.filter(x => x !== c) : [...prev, c]);

  const deckSizeSelector = (
    <div>
      <p className="text-xs text-text-faint mb-2">{t.deckSize}</p>
      <div className="flex gap-2">
        {([10, 20, 50, "all"] as const).map(n => (
          <button key={n} onClick={() => setDeckSize(n)}
            className={cn("flex-1 py-2 rounded-xl border text-sm font-semibold cursor-pointer transition-colors",
              deckSize === n
                ? "bg-[rgba(30,63,168,0.14)] border-[rgba(30,63,168,0.28)] text-accent"
                : "bg-surface border-[rgba(255,255,255,0.08)] text-text-lo hover:text-text-hi"
            )}
          >{n === "all" ? (lang === "de" ? "Alle" : "All") : n}</button>
        ))}
      </div>
    </div>
  );

  if (phase === "setup") return (
    <SetupLayout
      t={t}
      includeState={includeState} setIncludeState={setIncludeState}
      selectedState={selectedState} selectedStateCode={selectedStateCode}
      selectedCats={selectedCats} toggleCat={toggleCat} clearCats={() => setSelectedCats([])}
      filtered={filtered} extra={deckSizeSelector}
      onStart={start} startLabel={t.startFlashcards}
    />
  );

  if (phase === "done") return (
    <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="text-center pt-6">
      <div className="font-syne font-extrabold text-5xl text-text-hi mb-3">
        {known}<span className="text-text-faint text-2xl">/{deck.length}</span>
      </div>
      <div className="flex gap-3 justify-center mb-6 text-sm">
        <span className="text-c-green flex items-center gap-1"><CheckCircle2 size={14} />{known} {t.knowLabel}</span>
        <span className="text-c-red flex items-center gap-1"><XCircle size={14} />{unknown} {t.toReview}</span>
      </div>
      <div className="flex gap-2 justify-center">
        <Button variant="secondary" onClick={start}><RotateCcw size={13} /> {t.again}</Button>
        <Button variant="ghost" onClick={() => setPhase("setup")}>{t.changeDeck}</Button>
      </div>
    </motion.div>
  );

  const q = deck[idx];

  return (
    <div className="pt-2">
      <div className="flex items-center gap-3 mb-6">
        <div className="flex-1 h-1 bg-raised rounded-full overflow-hidden">
          <motion.div className="h-full bg-accent rounded-full" animate={{ width: `${(idx / deck.length) * 100}%` }} />
        </div>
        <span className="text-xs font-mono text-text-faint">{idx + 1}/{deck.length}</span>
      </div>

      <div className="relative mb-6" style={{ perspective: "1200px", height: "300px" }}>
        <AnimatePresence mode="wait">
          <motion.div
            key={`${q.id}-${flipped ? "back" : "front"}`}
            initial={{ rotateY: flipped ? -90 : 90, opacity: 0 }}
            animate={{ rotateY: 0, opacity: 1 }}
            exit={{ rotateY: flipped ? 90 : -90, opacity: 0 }}
            transition={{ duration: 0.28, ease: [0.4, 0, 0.2, 1] }}
            className="absolute inset-0"
            style={{ backfaceVisibility: "hidden", transformPerspective: 1200 }}
          >
            <div className={`w-full h-full rounded-3xl p-7 flex flex-col border ${flipped ? "bg-[rgba(30,63,168,0.12)] border-[rgba(30,63,168,0.28)]" : "bg-surface border-[rgba(255,255,255,0.08)] shadow-card"}`}>
              <div className="flex items-center justify-between mb-4">
                <Badge variant={flipped ? "accent" : "default"}>{flipped ? t.faceBack : t.faceFront}</Badge>
                <span className="text-xs text-text-faint">{q.category}</span>
              </div>
              {flipped ? (
                <div className="flex-1 flex flex-col justify-center">
                  <p className="text-text-hi font-semibold text-base leading-relaxed mb-3">
                    {lang === "de" ? q.options_de[q.correctIndex] : q.options_en[q.correctIndex]}
                  </p>
                  {q.explanation_de && (
                    <p className="text-xs text-text-lo leading-relaxed">{lang === "de" ? q.explanation_de : q.explanation_en}</p>
                  )}
                </div>
              ) : (
                <div className="flex-1 flex items-center justify-center">
                  <p className="font-syne font-bold text-lg text-text-hi text-center leading-snug">
                    {lang === "de" ? q.text_de : q.text_en}
                  </p>
                </div>
              )}
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      {!flipped ? (
        <Button variant="secondary" className="w-full" onClick={() => setFlipped(true)}>
          <Eye size={14} /> {t.revealAnswer}
        </Button>
      ) : (
        <div className="flex gap-3">
          <Button variant="ghost" className="flex-1 border border-[rgba(192,57,43,0.28)] text-c-red hover:bg-[rgba(192,57,43,0.08)]" onClick={() => advance(false)}>
            <XCircle size={14} /> {t.dontKnow}
          </Button>
          <Button variant="ghost" className="flex-1 border border-[rgba(29,139,60,0.28)] text-c-green hover:bg-[rgba(29,139,60,0.08)]" onClick={() => advance(true)}>
            <CheckCircle2 size={14} /> {t.know}
          </Button>
        </div>
      )}
    </div>
  );
}

// ── Browse Mode ────────────────────────────────────────────────────────────
function BrowseMode() {
  const { preferredLang, bookmarks, toggleBookmark, selectedStateCode } = useStore();
  const lang = preferredLang;
  const t = getT(lang);

  const [search, setSearch] = useState("");
  const [cat, setCat] = useState("");
  const [stateFilter, setStateFilter] = useState("");
  const [bookmarkedOnly, setBookmarkedOnly] = useState(false);
  const [page, setPage] = useState(1);
  const [expanded, setExpanded] = useState<number | null>(null);

  const filtered = useMemo(() => allQ.filter(q => {
    if (bookmarkedOnly && !bookmarks.includes(q.id)) return false;
    if (cat && q.category !== cat) return false;
    if (stateFilter === "__general__" && q.state !== null) return false;
    if (stateFilter && stateFilter !== "__general__" && q.stateCode !== stateFilter) return false;
    if (search) {
      const s = search.toLowerCase();
      if (!q.text_de.toLowerCase().includes(s) && !q.text_en.toLowerCase().includes(s)) return false;
    }
    return true;
  }), [search, cat, stateFilter, bookmarkedOnly, bookmarks]);

  const totalPages = Math.ceil(filtered.length / PER_PAGE);
  const pageQ = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE);
  const resetPage = () => setPage(1);

  return (
    <div className="pt-2">
      <div className="relative mb-3">
        <Search size={13} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-faint" />
        <input value={search} onChange={e => { setSearch(e.target.value); resetPage(); }}
          placeholder={t.searchPlaceholder}
          className="w-full bg-surface border border-[rgba(255,255,255,0.08)] text-text-hi placeholder:text-text-faint rounded-2xl pl-9 pr-4 py-2.5 text-sm outline-none focus:border-[rgba(30,63,168,0.35)] transition-colors"
        />
      </div>

      <div className="flex flex-wrap gap-2 mb-4">
        <select value={cat} onChange={e => { setCat(e.target.value); resetPage(); }}
          className="bg-surface border border-[rgba(255,255,255,0.08)] text-text-lo rounded-xl px-3 py-1.5 text-xs outline-none focus:border-[rgba(30,63,168,0.35)] cursor-pointer">
          <option value="">{t.allCategories}</option>
          {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
        <select value={stateFilter} onChange={e => { setStateFilter(e.target.value); resetPage(); }}
          className="bg-surface border border-[rgba(255,255,255,0.08)] text-text-lo rounded-xl px-3 py-1.5 text-xs outline-none focus:border-[rgba(30,63,168,0.35)] cursor-pointer">
          <option value="">{t.allRegions}</option>
          <option value="__general__">{t.generalOnly}</option>
          {BUNDESLAENDER.map(b => <option key={b.code} value={b.code}>{b.name}</option>)}
        </select>
        <button onClick={() => { setBookmarkedOnly(b => !b); resetPage(); }}
          className={cn("flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-xl border cursor-pointer transition-colors",
            bookmarkedOnly ? "bg-[rgba(30,63,168,0.14)] border-[rgba(30,63,168,0.28)] text-accent" : "bg-surface border-[rgba(255,255,255,0.08)] text-text-lo hover:text-text-hi")}>
          <Bookmark size={11} /> {t.bookmarked}
        </button>
        {(search || cat || stateFilter || bookmarkedOnly) && (
          <button onClick={() => { setSearch(""); setCat(""); setStateFilter(""); setBookmarkedOnly(false); resetPage(); }}
            className="text-xs text-text-faint hover:text-accent px-2 cursor-pointer transition-colors">{t.clearAll}</button>
        )}
      </div>

      <div className="flex items-center justify-between mb-4">
        <span className="text-xs text-text-faint">{filtered.length} {t.questionsCount}</span>
        {selectedStateCode && (
          <button onClick={() => { setStateFilter(selectedStateCode); resetPage(); }} className="text-xs text-accent hover:underline cursor-pointer">
            {t.myState} ({selectedStateCode})
          </button>
        )}
      </div>

      <div className="space-y-2 mb-6">
        {pageQ.length === 0 && <div className="text-center py-12 text-text-faint text-sm">{t.noMatch}</div>}
        {pageQ.map(q => {
          const isOpen = expanded === q.id;
          return (
            <Card key={q.id} hover className="overflow-hidden">
              <div role="button" tabIndex={0}
                onClick={() => setExpanded(isOpen ? null : q.id)}
                onKeyDown={e => e.key === "Enter" && setExpanded(isOpen ? null : q.id)}
                className="w-full text-left cursor-pointer">
                <div className="flex items-start justify-between gap-3 p-1">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <Badge variant="default">{q.category}</Badge>
                      {q.stateCode && <Badge variant="accent">{q.stateCode}</Badge>}
                    </div>
                    <p className={`text-sm leading-snug ${isOpen ? "text-text-hi" : "text-text-lo truncate"}`}>
                      {lang === "de" ? q.text_de : q.text_en}
                    </p>
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0 mt-0.5">
                    <button onClick={e => { e.stopPropagation(); toggleBookmark(q.id); }}
                      className="cursor-pointer text-text-faint hover:text-accent transition-colors p-1">
                      {bookmarks.includes(q.id) ? <BookmarkCheck size={14} className="text-accent" /> : <Bookmark size={14} />}
                    </button>
                    <ChevronDown size={13} className={`text-text-faint transition-transform ${isOpen ? "rotate-180" : ""}`} />
                  </div>
                </div>
              </div>
              <AnimatePresence>
                {isOpen && (
                  <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.2 }}>
                    <div className="border-t border-[rgba(255,255,255,0.06)] pt-3 mt-3 space-y-1.5">
                      {(lang === "de" ? q.options_de : q.options_en).map((opt, oi) => (
                        <div key={oi} className={`text-xs px-3 py-2 rounded-xl border ${oi === q.correctIndex ? "option-correct" : "border-[rgba(255,255,255,0.06)] text-text-faint"}`}>
                          <span className="font-mono mr-2">{String.fromCharCode(65 + oi)}</span>{opt}
                        </div>
                      ))}
                      {q.explanation_de && (
                        <p className="text-xs text-text-faint pt-2 leading-relaxed border-t border-[rgba(255,255,255,0.06)] mt-2">
                          {lang === "de" ? q.explanation_de : q.explanation_en}
                        </p>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </Card>
          );
        })}
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 mb-8">
          <Button variant="ghost" disabled={page === 1} onClick={() => setPage(p => p - 1)}>{t.prev}</Button>
          <span className="text-xs text-text-faint">{page} / {totalPages}</span>
          <Button variant="ghost" disabled={page === totalPages} onClick={() => setPage(p => p + 1)}>{t.next}</Button>
        </div>
      )}
    </div>
  );
}

// ── Main Study Page ────────────────────────────────────────────────────────
function StudyContent() {
  const searchParams = useSearchParams();
  const { preferredLang } = useStore();
  const t = getT(preferredLang);

  const raw = searchParams.get("mode") as StudyMode | null;
  const valid = ["practice", "flashcards", "browse"] as const;
  const [mode, setMode] = useState<StudyMode>(
    raw && valid.includes(raw) ? raw : "practice"
  );

  const MODES = [
    { id: "practice"   as const, label: t.tabPractice,   Icon: Layers },
    { id: "flashcards" as const, label: t.tabFlashcards, Icon: CreditCard },
    { id: "browse"     as const, label: t.tabBrowse,     Icon: Search },
  ];

  return (
    <PageWrapper>
      <div className="px-4 sm:px-8 lg:px-16 pt-6 pb-10">
        <div className="mb-6">
          <p className="text-[11px] text-text-faint uppercase tracking-[0.14em] font-semibold mb-1">{t.studyHubLabel}</p>
          <h1 className="font-syne font-extrabold text-4xl text-text-hi mb-1">{t.studyTitle}</h1>
          <p className="text-text-lo text-sm">{t.studySubtitle}</p>
        </div>

        <div className="flex gap-2 mb-8 pb-4 border-b border-[rgba(255,255,255,0.06)]">
          {MODES.map(({ id, label, Icon }) => (
            <button key={id} onClick={() => setMode(id)}
              className={cn(
                "flex items-center gap-2 px-4 py-2 rounded-xl border text-sm font-semibold cursor-pointer transition-colors",
                mode === id
                  ? "bg-[rgba(30,63,168,0.14)] border-[rgba(30,63,168,0.28)] text-accent"
                  : "bg-surface border-[rgba(255,255,255,0.08)] text-text-lo hover:text-text-hi hover:border-[rgba(30,63,168,0.28)]"
              )}
            >
              <Icon size={14} />
              <span className="hidden sm:inline">{label}</span>
            </button>
          ))}
        </div>

        <AnimatePresence mode="wait">
          <motion.div key={mode} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.15 }}>
            {mode === "practice"   && <PracticeMode />}
            {mode === "flashcards" && <FlashcardsMode />}
            {mode === "browse"     && <BrowseMode />}
          </motion.div>
        </AnimatePresence>
      </div>
    </PageWrapper>
  );
}

export default function StudyPage() {
  return (
    <Suspense>
      <StudyContent />
    </Suspense>
  );
}
