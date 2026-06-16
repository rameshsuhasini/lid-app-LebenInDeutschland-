"use client";
import { useMemo, useRef } from "react";
import { motion, useInView } from "framer-motion";
import { RadialBarChart, RadialBar } from "recharts";
import { useStore } from "@/lib/store";
import { getT } from "@/lib/i18n";
import { CATEGORIES } from "@/lib/constants";
import { calcReadiness } from "@/lib/utils";
import questions from "@/data/questions.json";
import PageWrapper from "@/components/layout/PageWrapper";
import Card from "@/components/ui/Card";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import type { Question } from "@/lib/types";
import { Flame, Target, CheckCircle2, XCircle, BookmarkCheck, Trophy, RotateCcw } from "lucide-react";

const allQ = questions as Question[];

export default function ProgressPage() {
  const { progress, streak, examHistory, bookmarks, resetProgress, preferredLang } = useStore();
  const lang = preferredLang;
  const t = getT(lang);

  const totalAnswered = Object.keys(progress).length;
  const readiness = calcReadiness(progress, allQ.length);
  const correctCount = Object.values(progress).filter(v => v === "correct").length;
  const wrongCount = Object.values(progress).filter(v => v === "wrong").length;

  const catStats = useMemo(() => CATEGORIES.map(cat => {
    const catQ = allQ.filter(q => q.category === cat);
    const answered = catQ.filter(q => progress[q.id]);
    const correct = catQ.filter(q => progress[q.id] === "correct");
    return {
      name: cat,
      total: catQ.length,
      answered: answered.length,
      correct: correct.length,
      pct: answered.length ? Math.round((correct.length / answered.length) * 100) : null,
    };
  }).sort((a, b) => (a.pct ?? 101) - (b.pct ?? 101)), [progress]);

  const radialData = [{ value: readiness, fill: "#1E3FA8" }];

  const bookmarkedQ = allQ.filter(q => bookmarks.includes(q.id));

  const catRef = useRef(null);
  const catInView = useInView(catRef, { once: true, margin: "-50px" });

  const item = {
    initial: { opacity: 0, y: 10 },
    animate: (i: number) => ({ opacity: 1, y: 0, transition: { delay: i * 0.04 } }),
  };

  return (
    <PageWrapper>
      <div className="px-4 sm:px-8 lg:px-16 pt-4">
        <div className="mb-8">
          <p className="text-[11px] text-text-faint uppercase tracking-[0.14em] font-semibold mb-1">{t.progressLabel}</p>
          <h1 className="font-syne font-extrabold text-3xl text-text-hi">{t.progressTitle}</h1>
        </div>

        {/* Readiness + Stats */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          <Card accent className="flex flex-col items-center justify-center py-6">
            <div className="relative w-28 h-28 mb-3">
              <RadialBarChart width={112} height={112} innerRadius="70%" outerRadius="100%" startAngle={220} endAngle={-40} data={radialData} barSize={8}>
                <RadialBar background={{ fill: "rgba(255,255,255,0.06)" }} dataKey="value" cornerRadius={8} />
              </RadialBarChart>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="font-syne font-extrabold text-2xl text-accent">{readiness}%</span>
                <span className="text-[10px] text-text-faint">{t.ready}</span>
              </div>
            </div>
            <div className="flex items-center gap-1 text-xs text-text-lo"><Target size={11} className="text-accent" /> {t.examReadiness}</div>
          </Card>

          <div className="grid grid-rows-3 gap-2">
            {[
              { icon: Flame, val: `${streak}d`, label: t.streakLabel, cls: "text-accent" },
              { icon: CheckCircle2, val: correctCount, label: t.correctLabel, cls: "text-c-green" },
              { icon: XCircle, val: wrongCount, label: t.wrongLabel, cls: "text-c-red" },
            ].map(({ icon: Icon, val, label, cls }) => (
              <Card key={label} className="flex items-center gap-3 py-3 px-4">
                <Icon size={14} className={cls} />
                <div>
                  <div className={`font-syne font-bold text-base ${cls}`}>{val}</div>
                  <div className="text-[10px] text-text-faint">{label}</div>
                </div>
              </Card>
            ))}
          </div>
        </div>

        <div className="flex items-center justify-between mb-1">
          <span className="text-xs text-text-faint">{totalAnswered} {t.questionsAttempted.replace("{total}", String(allQ.length))}</span>
        </div>
        <div className="h-1.5 bg-raised rounded-full overflow-hidden mb-6">
          <motion.div className="h-full bg-accent rounded-full progress-fill" animate={{ width: `${(totalAnswered / allQ.length) * 100}%` }} />
        </div>

        {/* Category breakdown */}
        <p className="text-[11px] text-text-faint uppercase tracking-[0.14em] font-semibold mb-3">{t.topicBreakdown}</p>
        <div ref={catRef} className="space-y-2 mb-8">
          {catStats.map((c, i) => (
            <motion.div key={c.name} custom={i} initial="initial" animate={catInView ? "animate" : "initial"} variants={item}>
              <Card className="py-3 px-4">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs text-text-hi font-medium">{c.name}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] text-text-faint">{c.answered}/{c.total}</span>
                    {c.pct !== null && (
                      <Badge variant={c.pct >= 70 ? "green" : c.pct >= 40 ? "accent" : "red"}>{c.pct}%</Badge>
                    )}
                  </div>
                </div>
                <div className="h-1 bg-raised rounded-full overflow-hidden">
                  <motion.div
                    className="h-full rounded-full"
                    style={{ background: c.pct === null ? "transparent" : c.pct >= 70 ? "#1D8B3C" : c.pct >= 40 ? "#1E3FA8" : "#C0392B" }}
                    animate={{ width: catInView && c.pct !== null ? `${c.pct}%` : "0%" }}
                    transition={{ delay: i * 0.04, duration: 0.5 }}
                  />
                </div>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Exam history */}
        {examHistory.length > 0 && (
          <>
            <p className="text-[11px] text-text-faint uppercase tracking-[0.14em] font-semibold mb-3">{t.examHistory}</p>
            <div className="space-y-2 mb-8">
              {examHistory.slice(0, 5).map((s, i) => (
                <motion.div key={s.id} custom={i} initial="initial" animate="animate" variants={item}>
                  <Card className="flex items-center justify-between py-3 px-4">
                    <div className="flex items-center gap-3">
                      <Trophy size={13} className={s.passed ? "text-c-green" : "text-c-red"} />
                      <div>
                        <div className="text-xs text-text-hi font-semibold">{s.score}/33 {s.stateName ? `· ${s.stateName}` : ""}</div>
                        <div className="text-[10px] text-text-faint">{new Date(s.date).toLocaleDateString()}</div>
                      </div>
                    </div>
                    <Badge variant={s.passed ? "green" : "red"}>{s.passed ? t.passLabel : t.failLabel}</Badge>
                  </Card>
                </motion.div>
              ))}
            </div>
          </>
        )}

        {/* Bookmarks */}
        {bookmarkedQ.length > 0 && (
          <>
            <p className="text-[11px] text-text-faint uppercase tracking-[0.14em] font-semibold mb-3">{t.bookmarkedSection} ({bookmarkedQ.length})</p>
            <div className="space-y-2 mb-8">
              {bookmarkedQ.slice(0, 5).map(q => (
                <Card key={q.id} className="py-3 px-4">
                  <div className="flex items-start gap-2">
                    <BookmarkCheck size={13} className="text-accent mt-0.5 shrink-0" />
                    <p className="text-xs text-text-lo leading-relaxed truncate">{lang === "de" ? q.text_de : q.text_en}</p>
                  </div>
                </Card>
              ))}
            </div>
          </>
        )}

        {/* Reset */}
        <div className="pb-10 flex justify-end">
          <Button variant="danger" onClick={() => { if (confirm(t.resetConfirm)) resetProgress(); }}>
            <RotateCcw size={13} /> {t.resetProgress}
          </Button>
        </div>
      </div>
    </PageWrapper>
  );
}

