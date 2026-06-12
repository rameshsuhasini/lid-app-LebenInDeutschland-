"use client";
import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useStore } from "@/lib/store";
import { filterQuestions, cn } from "@/lib/utils";
import { CATEGORIES } from "@/lib/constants";
import questions from "@/data/questions.json";
import PageWrapper from "@/components/layout/PageWrapper";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Badge from "@/components/ui/Badge";
import type { Question } from "@/lib/types";
import { CheckCircle2, XCircle, Bookmark, BookmarkCheck, ChevronRight, RotateCcw } from "lucide-react";

const allQ = questions as Question[];

type Phase = "setup" | "practice" | "done";

export default function PracticePage() {
  const { selectedState, selectedStateCode, preferredLang, progress, recordAnswer, toggleBookmark, bookmarks } = useStore();
  const lang = preferredLang;

  const [phase, setPhase] = useState<Phase>("setup");
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
    const shuffled = [...filtered].sort(() => Math.random() - 0.5);
    setDeck(shuffled);
    setIdx(0);
    setChosen(null);
    setSessionCorrect(0);
    setSessionWrong(0);
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
    <PageWrapper>
      <div className="max-w-lg mx-auto px-4 pt-6">
        <div className="mb-8">
          <p className="text-[11px] text-text-faint uppercase tracking-[0.14em] font-semibold mb-2">Practice Mode</p>
          <h1 className="font-syne font-extrabold text-4xl text-text-hi mb-2">Practice</h1>
          <p className="text-text-lo text-sm">Instant feedback · Explanations · Custom filters</p>
        </div>

        {/* State toggle */}
        <Card className="mb-4">
          <button
            onClick={() => setIncludeState(b => !b)}
            className="flex items-center justify-between w-full cursor-pointer"
          >
            <div>
              <div className="text-sm font-semibold text-text-hi">Include {selectedState ?? "state"} questions</div>
              <div className="text-xs text-text-lo mt-0.5">{selectedStateCode ?? "No state selected"}</div>
            </div>
            <div className={`w-10 h-5 rounded-full transition-colors relative ${includeState ? "bg-accent" : "bg-raised border border-[rgba(17,17,17,0.15)]"}`}>
              <div className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow-sm transition-transform ${includeState ? "translate-x-5" : "translate-x-0.5"}`} />
            </div>
          </button>
        </Card>

        {/* Category pills */}
        <p className="text-xs text-text-faint mb-2">Filter by topic (optional)</p>
        <div className="flex flex-wrap gap-1.5 mb-6">
          {CATEGORIES.map(c => (
            <button key={c} onClick={() => toggleCat(c)}
              className={cn(
                "text-xs px-3 py-1.5 rounded-xl border cursor-pointer transition-all",
                selectedCats.includes(c)
                  ? "bg-[rgba(184,134,11,0.10)] border-[rgba(184,134,11,0.28)] text-accent"
                  : "bg-white border-[rgba(17,17,17,0.10)] text-text-lo hover:text-text-hi hover:border-[rgba(184,134,11,0.22)]"
              )}
            >{c}</button>
          ))}
        </div>

        <div className="flex items-center justify-between mb-4">
          <span className="text-xs text-text-faint">{filtered.length} questions in deck</span>
          {selectedCats.length > 0 && (
            <button onClick={() => setSelectedCats([])} className="text-xs text-text-faint hover:text-accent cursor-pointer">Clear filters</button>
          )}
        </div>
        <Button variant="primary" glow size="lg" className="w-full" disabled={filtered.length === 0} onClick={start}>
          Start Practice
        </Button>
      </div>
    </PageWrapper>
  );

  if (phase === "done") return (
    <PageWrapper>
      <div className="max-w-lg mx-auto px-4 pt-6 text-center">
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}>
          <div className="font-syne font-extrabold text-5xl text-text-hi mb-2">{sessionCorrect}<span className="text-text-faint text-2xl">/{deck.length}</span></div>
          <p className="text-text-lo text-sm mb-6">Session complete · {Math.round((sessionCorrect / deck.length) * 100)}% accuracy</p>
          <div className="flex gap-2 justify-center">
            <Button variant="secondary" onClick={() => { start(); }}>
              <RotateCcw size={13} /> New session
            </Button>
            <Button variant="ghost" onClick={() => setPhase("setup")}>Change filters</Button>
          </div>
        </motion.div>
      </div>
    </PageWrapper>
  );

  const q = deck[idx];
  const answered = chosen !== null;

  return (
    <PageWrapper>
      <div className="max-w-2xl mx-auto px-4 pt-4">
        {/* Progress */}
        <div className="flex items-center gap-3 mb-6">
          <div className="flex-1 h-1 bg-raised rounded-full overflow-hidden">
            <motion.div className="h-full bg-accent rounded-full" animate={{ width: `${(idx / deck.length) * 100}%` }} />
          </div>
          <span className="text-xs font-mono text-text-faint">{idx + 1}/{deck.length}</span>
          <div className="flex items-center gap-2">
            <span className="text-xs text-c-green font-semibold">{sessionCorrect} correct</span>
            <span className="text-xs text-c-red font-semibold">{sessionWrong} wrong</span>
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
                let cls = "bg-white border-[rgba(17,17,17,0.10)] hover:border-[rgba(184,134,11,0.3)] hover:text-text-hi text-text-lo";
                if (answered) {
                  if (oi === q.correctIndex) cls = "option-correct";
                  else if (oi === chosen) cls = "option-wrong";
                  else cls = "border-[rgba(17,17,17,0.06)] text-text-faint bg-raised";
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
                    {chosen === q.correctIndex ? "Correct!" : "Incorrect"}
                  </div>
                  {q.explanation_de && (
                    <p className="text-xs text-text-lo leading-relaxed bg-raised px-4 py-3 rounded-2xl border border-[rgba(17,17,17,0.07)]">
                      {lang === "de" ? q.explanation_de : q.explanation_en}
                    </p>
                  )}
                  <Button variant="primary" className="w-full mt-3" onClick={next}>
                    {idx + 1 < deck.length ? <>Next <ChevronRight size={13} /></> : "Finish"}
                  </Button>
                </motion.div>
              </AnimatePresence>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </PageWrapper>
  );
}
