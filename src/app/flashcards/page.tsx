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
import { CheckCircle2, XCircle, RotateCcw, Eye } from "lucide-react";

const allQ = questions as Question[];

type Phase = "setup" | "cards" | "done";

export default function FlashcardsPage() {
  const { selectedState, selectedStateCode, preferredLang } = useStore();
  const lang = preferredLang;

  const [phase, setPhase] = useState<Phase>("setup");
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
    let pool = [...filtered].sort(() => Math.random() - 0.5);
    if (deckSize !== "all") pool = pool.slice(0, deckSize);
    setDeck(pool);
    setIdx(0);
    setFlipped(false);
    setKnown(0);
    setUnknown(0);
    setPhase("cards");
  };

  const advance = (knew: boolean) => {
    if (knew) setKnown(k => k + 1); else setUnknown(u => u + 1);
    setFlipped(false);
    if (idx + 1 >= deck.length) { setPhase("done"); return; }
    setIdx(i => i + 1);
  };

  const toggleCat = (c: string) => setSelectedCats(prev => prev.includes(c) ? prev.filter(x => x !== c) : [...prev, c]);

  if (phase === "setup") return (
    <PageWrapper>
      <div className="max-w-lg mx-auto px-4 pt-6">
        <div className="mb-8">
          <p className="text-[11px] text-text-faint uppercase tracking-[0.14em] font-semibold mb-2">Flashcard Studio</p>
          <h1 className="font-syne font-extrabold text-4xl text-text-hi mb-2">Flashcards</h1>
          <p className="text-text-lo text-sm">Flip cards · Mark Know / Don&apos;t Know · Repeat weak spots</p>
        </div>

        <Card className="mb-4">
          <button onClick={() => setIncludeState(b => !b)} className="flex items-center justify-between w-full cursor-pointer">
            <div>
              <div className="text-sm font-semibold text-text-hi">Include {selectedState ?? "state"} cards</div>
              <div className="text-xs text-text-lo mt-0.5">{selectedStateCode ?? "No state selected"}</div>
            </div>
            <div className={`w-10 h-5 rounded-full transition-colors relative ${includeState ? "bg-accent" : "bg-raised border border-[rgba(17,17,17,0.15)]"}`}>
              <div className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow-sm transition-transform ${includeState ? "translate-x-5" : "translate-x-0.5"}`} />
            </div>
          </button>
        </Card>

        <p className="text-xs text-text-faint mb-2">Deck size</p>
        <div className="flex gap-2 mb-5">
          {([10, 20, 50, "all"] as const).map(n => (
            <button key={n} onClick={() => setDeckSize(n)}
              className={cn("flex-1 py-2 rounded-xl border text-sm font-semibold cursor-pointer transition-all",
                deckSize === n
                  ? "bg-[rgba(184,134,11,0.10)] border-[rgba(184,134,11,0.28)] text-accent"
                  : "bg-white border-[rgba(17,17,17,0.10)] text-text-lo hover:text-text-hi"
              )}
            >{n === "all" ? "All" : n}</button>
          ))}
        </div>

        <p className="text-xs text-text-faint mb-2">Filter by topic (optional)</p>
        <div className="flex flex-wrap gap-1.5 mb-6">
          {CATEGORIES.map(c => (
            <button key={c} onClick={() => toggleCat(c)}
              className={cn("text-xs px-3 py-1.5 rounded-xl border cursor-pointer transition-all",
                selectedCats.includes(c)
                  ? "bg-[rgba(184,134,11,0.10)] border-[rgba(184,134,11,0.28)] text-accent"
                  : "bg-white border-[rgba(17,17,17,0.10)] text-text-lo hover:text-text-hi hover:border-[rgba(184,134,11,0.22)]"
              )}
            >{c}</button>
          ))}
        </div>

        <Button variant="primary" glow size="lg" className="w-full" disabled={filtered.length === 0} onClick={start}>
          Start Flashcards
        </Button>
      </div>
    </PageWrapper>
  );

  if (phase === "done") return (
    <PageWrapper>
      <div className="max-w-lg mx-auto px-4 pt-6 text-center">
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}>
          <div className="font-syne font-extrabold text-5xl text-text-hi mb-3">{known}<span className="text-text-faint text-2xl">/{deck.length}</span></div>
          <div className="flex gap-3 justify-center mb-6 text-sm">
            <span className="text-c-green flex items-center gap-1"><CheckCircle2 size={14} />{known} know</span>
            <span className="text-c-red flex items-center gap-1"><XCircle size={14} />{unknown} to review</span>
          </div>
          <div className="flex gap-2 justify-center">
            <Button variant="secondary" onClick={start}><RotateCcw size={13} /> Again</Button>
            <Button variant="ghost" onClick={() => setPhase("setup")}>Change deck</Button>
          </div>
        </motion.div>
      </div>
    </PageWrapper>
  );

  const q = deck[idx];
  const progressPct = ((idx) / deck.length) * 100;

  return (
    <PageWrapper>
      <div className="max-w-lg mx-auto px-4 pt-4">
        {/* Progress */}
        <div className="flex items-center gap-3 mb-6">
          <div className="flex-1 h-1 bg-raised rounded-full overflow-hidden">
            <motion.div className="h-full bg-accent rounded-full" animate={{ width: `${progressPct}%` }} />
          </div>
          <span className="text-xs font-mono text-text-faint">{idx + 1}/{deck.length}</span>
        </div>

        {/* Card with 3D flip */}
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
              <div className={`w-full h-full rounded-3xl p-7 flex flex-col border ${flipped ? "bg-[rgba(184,134,11,0.06)] border-[rgba(184,134,11,0.28)]" : "bg-white border-[rgba(17,17,17,0.10)] shadow-card"}`}>
                <div className="flex items-center justify-between mb-4">
                  <Badge variant={flipped ? "accent" : "default"}>{flipped ? "Answer" : "Question"}</Badge>
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
            <Eye size={14} /> Reveal Answer
          </Button>
        ) : (
          <div className="flex gap-3">
            <Button variant="ghost" className="flex-1 border border-[rgba(192,57,43,0.28)] text-c-red hover:bg-[rgba(192,57,43,0.08)]" onClick={() => advance(false)}>
              <XCircle size={14} /> Don&apos;t Know
            </Button>
            <Button variant="ghost" className="flex-1 border border-[rgba(29,139,60,0.28)] text-c-green hover:bg-[rgba(29,139,60,0.08)]" onClick={() => advance(true)}>
              <CheckCircle2 size={14} /> Know
            </Button>
          </div>
        )}
      </div>
    </PageWrapper>
  );
}
