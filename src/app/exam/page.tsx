"use client";
import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Timer, ChevronLeft, ChevronRight, Flag, CheckCircle2, XCircle, RotateCcw, Eye, Home } from "lucide-react";
import { useStore } from "@/lib/store";
import { getT } from "@/lib/i18n";
import questions from "@/data/questions.json";
import { sampleExam, formatTime } from "@/lib/utils";
import { EXAM_DURATION_SEC, EXAM_TOTAL, PASSING_SCORE } from "@/lib/constants";
import PageWrapper from "@/components/layout/PageWrapper";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Badge from "@/components/ui/Badge";
import type { Question, ExamSession } from "@/lib/types";
import Link from "next/link";

const allQ = questions as Question[];

type Phase = "setup" | "exam" | "results" | "review";

export default function ExamPage() {
  const { selectedState, selectedStateCode, preferredLang, saveExamSession } = useStore();
  const lang = preferredLang;
  const t = getT(lang);
  const [phase, setPhase] = useState<Phase>("setup");
  const [examQ, setExamQ] = useState<Question[]>([]);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [current, setCurrent] = useState(0);
  const [timeLeft, setTimeLeft] = useState(EXAM_DURATION_SEC);
  const [session, setSession] = useState<ExamSession | null>(null);

  const startExam = useCallback(() => {
    const q = sampleExam(allQ, selectedStateCode ?? "");
    setExamQ(q);
    setAnswers({});
    setCurrent(0);
    setTimeLeft(EXAM_DURATION_SEC);
    setPhase("exam");
  }, [selectedStateCode]);

  useEffect(() => {
    if (phase !== "exam") return;
    if (timeLeft <= 0) { submitExam(); return; }
    const t = setInterval(() => setTimeLeft(s => s - 1), 1000);
    return () => clearInterval(t);
  });

  const submitExam = useCallback(() => {
    let score = 0;
    examQ.forEach((q, i) => { if (answers[i] === q.correctIndex) score++; });
    const passed = score >= PASSING_SCORE;
    const s: ExamSession = {
      id: Date.now().toString(),
      date: new Date().toISOString(),
      stateCode: selectedStateCode ?? "",
      stateName: selectedState ?? "",
      answers: Object.fromEntries(Object.entries(answers).map(([k, v]) => [examQ[+k].id, v])),
      questions: examQ.map(q => q.id),
      score, passed,
      durationSeconds: EXAM_DURATION_SEC - timeLeft,
    };
    saveExamSession(s);
    setSession(s);
    setPhase("results");
    if (passed) {
      import("canvas-confetti").then(m => m.default({ particleCount: 160, spread: 80, origin: { y: 0.6 }, colors: ["#1E3FA8", "#2952C8", "#C0392B"] }));
    }
  }, [examQ, answers, selectedStateCode, selectedState, timeLeft, saveExamSession]);

  if (phase === "setup") return (
    <PageWrapper>
      <div className="px-4 sm:px-8 lg:px-16 pt-6">
        <div className="mb-8">
          <p className="text-[11px] text-text-faint uppercase tracking-[0.14em] font-semibold mb-2">{t.examLabel}</p>
          <h1 className="font-syne font-extrabold text-4xl text-text-hi mb-2">{t.examTitle}</h1>
          <p className="text-text-lo text-sm">{t.examSubtitle}</p>
        </div>
        <Card accent className="mb-4 space-y-3">
          <div className="flex justify-between text-sm">
            <span className="text-text-lo">{t.examGeneral}</span>
            <span className="text-text-hi font-semibold">30</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-text-lo">{t.examStateQ} ({selectedState ?? "-"})</span>
            <span className="text-text-hi font-semibold">3</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-text-lo">{t.examTimeLimit}</span>
            <span className="font-mono text-text-hi font-semibold">60:00</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-text-lo">{t.examPassing}</span>
            <span className="text-text-hi font-semibold">{PASSING_SCORE}/{EXAM_TOTAL}</span>
          </div>
        </Card>
        <Button variant="primary" size="lg" glow className="w-full" onClick={startExam}>
          {t.startExam}
        </Button>
      </div>
    </PageWrapper>
  );

  if (phase === "results" && session) return (
    <PageWrapper>
      <div className="px-4 sm:px-8 lg:px-16 pt-6">
        <motion.div initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} className="text-center mb-8">
          <motion.div
            initial={{ scale: 0 }} animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 180, damping: 14, delay: 0.1 }}
            className={`w-20 h-20 rounded-full mx-auto mb-5 flex items-center justify-center ${session.passed ? "bg-[rgba(29,139,60,0.12)] border border-[rgba(29,139,60,0.28)]" : "bg-[rgba(192,57,43,0.12)] border border-[rgba(192,57,43,0.28)]"}`}
          >
            {session.passed ? <CheckCircle2 size={36} className="text-c-green" /> : <XCircle size={36} className="text-c-red" />}
          </motion.div>
          <Badge variant={session.passed ? "green" : "red"} className="mb-3">{session.passed ? t.passed : t.failed}</Badge>
          <div className="font-syne font-extrabold text-6xl text-text-hi">{session.score}<span className="text-text-faint text-3xl">/{EXAM_TOTAL}</span></div>
          <p className="text-text-lo text-sm mt-2">{Math.round((session.score / EXAM_TOTAL) * 100)}% {t.correctPct} · {formatTime(session.durationSeconds)} {t.elapsed}</p>
        </motion.div>
        <div className="flex gap-2">
          <Button variant="secondary" className="flex-1" onClick={() => setPhase("review")}>
            <Eye size={14} /> {t.review}
          </Button>
          <Button variant="secondary" className="flex-1" onClick={() => setPhase("setup")}>
            <RotateCcw size={14} /> {t.again}
          </Button>
          <Link href="/">
            <Button variant="ghost"><Home size={14} /></Button>
          </Link>
        </div>
      </div>
    </PageWrapper>
  );

  if (phase === "review" && session) return (
    <PageWrapper>
      <div className="px-4 sm:px-8 lg:px-16 pt-6">
        <div className="flex items-center gap-3 mb-6">
          <Button variant="ghost" onClick={() => setPhase("results")}><ChevronLeft size={14} /> {t.back}</Button>
          <h2 className="font-syne font-bold text-lg text-text-hi">{t.reviewTitle}</h2>
        </div>
        <div className="space-y-3">
          {examQ.map((q, i) => {
            const given = answers[i];
            const correct = q.correctIndex;
            const isRight = given === correct;
            return (
              <Card key={q.id} className="p-4">
                <div className="flex items-start justify-between gap-2 mb-3">
                  <p className="text-sm text-text-hi leading-relaxed">{lang === "de" ? q.text_de : q.text_en}</p>
                  <Badge variant={isRight ? "green" : "red"} className="shrink-0">{isRight ? "OK" : "X"}</Badge>
                </div>
                <div className="space-y-1.5">
                  {(lang === "de" ? q.options_de : q.options_en).map((opt, oi) => (
                    <div key={oi} className={`text-xs px-3 py-1.5 rounded-xl border ${oi === correct ? "option-correct" : oi === given && !isRight ? "option-wrong" : "border-[rgba(255,255,255,0.07)] text-text-faint"}`}>
                      {opt}
                    </div>
                  ))}
                </div>
                {q.explanation_de && (
                  <p className="text-xs text-text-faint mt-3 pt-3 border-t border-[rgba(255,255,255,0.06)] leading-relaxed">
                    {lang === "de" ? q.explanation_de : q.explanation_en}
                  </p>
                )}
              </Card>
            );
          })}
        </div>
      </div>
    </PageWrapper>
  );

  if (phase !== "exam" || !examQ.length) return null;
  const q = examQ[current];
  const urgent = timeLeft < 300;

  return (
    <div className="min-h-screen bg-bg relative">
      <div className="bg-dots fixed inset-0 pointer-events-none opacity-60" />
      {/* Top bar */}
      <div className="fixed top-0 left-0 right-0 z-[60] bg-[#0E0E10]/92 backdrop-blur-xl border-b border-[rgba(255,255,255,0.07)]">
        <div className="px-4 sm:px-8 lg:px-16 h-14 flex items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-sm">
            <span className="font-mono font-bold text-text-hi">{current + 1}</span>
            <span className="text-text-faint">/ {EXAM_TOTAL}</span>
          </div>
          <div className="flex-1 max-w-48 h-1 bg-raised rounded-full overflow-hidden">
            <motion.div className="h-full bg-accent rounded-full" animate={{ width: `${((current + 1) / EXAM_TOTAL) * 100}%` }} />
          </div>
          <div className={`flex items-center gap-1.5 font-mono font-bold text-sm ${urgent ? "timer-urgent text-c-red" : "text-text-hi"}`}>
            <Timer size={13} className={urgent ? "animate-pulse" : ""} />
            {formatTime(timeLeft)}
          </div>
        </div>
      </div>

      <div className="px-4 sm:px-8 lg:px-16 pt-20 pb-32">
        <AnimatePresence mode="wait">
          <motion.div key={current} initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }} transition={{ duration: 0.22 }}>
            <Badge variant="default" className="mb-4">{q.category}</Badge>
            <p className="font-syne font-bold text-xl text-text-hi mb-6 leading-snug">{lang === "de" ? q.text_de : q.text_en}</p>
            <div className="space-y-2.5">
              {(lang === "de" ? q.options_de : q.options_en).map((opt, oi) => (
                <motion.button key={oi}
                  initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: oi * 0.05 }}
                  onClick={() => answers[current] === undefined && setAnswers(a => ({ ...a, [current]: oi }))}
                  className={`w-full text-left px-4 py-3.5 rounded-2xl border text-sm cursor-pointer transition-all duration-150 leading-snug ${answers[current] === oi ? "option-selected" : "bg-surface border-[rgba(255,255,255,0.08)] hover:border-[rgba(30,63,168,0.35)] hover:text-text-hi text-text-lo"}`}
                >
                  <span className="font-mono text-[10px] text-text-faint mr-2">{String.fromCharCode(65 + oi)}</span>{opt}
                </motion.button>
              ))}
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Bottom nav */}
      <div className="fixed bottom-0 left-0 right-0 z-[60] bg-[#0E0E10]/92 backdrop-blur-xl border-t border-[rgba(255,255,255,0.07)] px-4 py-3">
        <div className="flex items-center justify-between gap-3">
          <Button variant="ghost" disabled={current === 0} onClick={() => setCurrent(c => c - 1)}>
            <ChevronLeft size={15} />
          </Button>
          <div className="flex gap-1 flex-wrap justify-center max-w-xs">
            {examQ.map((_, i) => (
              <button key={i} onClick={() => setCurrent(i)}
                className={`w-6 h-6 rounded-md text-[10px] font-mono font-bold cursor-pointer transition-colors ${i === current ? "bg-accent text-white" : answers[i] !== undefined ? "bg-raised text-accent border border-[rgba(30,63,168,0.25)]" : "bg-surface text-text-faint hover:bg-raised border border-[rgba(255,255,255,0.07)]"}`}
              >{i + 1}</button>
            ))}
          </div>
          {current < EXAM_TOTAL - 1
            ? <Button variant="secondary" onClick={() => setCurrent(c => c + 1)}><ChevronRight size={15} /></Button>
            : <Button variant="primary" onClick={submitExam}><Flag size={13} /> {t.submit}</Button>
          }
        </div>
      </div>
    </div>
  );
}
