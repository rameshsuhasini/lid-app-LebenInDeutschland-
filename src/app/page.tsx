"use client";
import { motion } from "framer-motion";
import Link from "next/link";
import { BookOpen, Layers, CreditCard, Search, BarChart2, Flame, CheckCircle, Target, ChevronRight } from "lucide-react";
import { useStore } from "@/lib/store";
import { getT } from "@/lib/i18n";
import questions from "@/data/questions.json";
import { calcReadiness } from "@/lib/utils";
import PageWrapper from "@/components/layout/PageWrapper";
import Card from "@/components/ui/Card";
import Badge from "@/components/ui/Badge";
import type { Question } from "@/lib/types";

const allQ = questions as Question[];

const item = {
  initial: { opacity: 0, y: 14 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.38, ease: [0.4, 0, 0.2, 1] } },
};

export default function Dashboard() {
  const { selectedState, selectedStateCode, progress, streak, preferredLang } = useStore();
  const t = getT(preferredLang);
  const totalAnswered = Object.keys(progress).length;
  const readiness = calcReadiness(progress, allQ.length);

  const MODES = [
    { href: "/exam",                  label: t.modeExam,       desc: t.modeExamDesc,       icon: BookOpen,   accent: true  },
    { href: "/study?mode=practice",   label: t.modePractice,   desc: t.modePracticeDesc,   icon: Layers,     accent: false },
    { href: "/study?mode=flashcards", label: t.modeFlashcards, desc: t.modeFlashcardsDesc, icon: CreditCard, accent: false },
    { href: "/study?mode=browse",     label: t.modeBrowse,     desc: t.modeBrowseDesc,     icon: Search,     accent: false },
  ];

  return (
    <PageWrapper>
      <div className="h-[calc(100vh-4rem)] flex flex-col gap-4 px-4 sm:px-8 lg:px-16 py-6 overflow-hidden">

        {/* Hero */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.45 }}>
          {selectedStateCode && (
            <Badge variant="accent" className="mb-3">{selectedState} · {selectedStateCode}</Badge>
          )}
          <h1 className="font-syne font-extrabold text-4xl sm:text-5xl leading-none text-text-hi mb-2">
            Einbürgerung.<br /><span className="text-gradient">Ready.</span>
          </h1>
          <p className="text-text-lo text-sm leading-relaxed">
            {allQ.filter(q => !q.state).length} general + {allQ.filter(q => q.stateCode === selectedStateCode).length} {selectedState ?? "state"} questions
          </p>
        </motion.div>

        {/* Stats */}
        <motion.div
          initial="initial" animate="animate"
          variants={{ animate: { transition: { staggerChildren: 0.07 } } }}
          className="grid grid-cols-3 gap-3"
        >
          {[
            { label: t.statAnswered,  value: totalAnswered,    icon: CheckCircle },
            { label: t.statStreak,   value: `${streak}d`,     icon: Flame },
            { label: t.statReadiness,value: `${readiness}%`,  icon: Target },
          ].map(({ label, value, icon: Icon }) => (
            <motion.div key={label} variants={item}>
              <Card className="text-center py-3 px-3">
                <Icon size={15} className="text-accent mx-auto mb-1.5" />
                <div className="font-mono font-bold text-xl text-text-hi mb-0.5">{value}</div>
                <div className="text-xs text-text-faint">{label}</div>
              </Card>
            </motion.div>
          ))}
        </motion.div>

        {/* Modes — fills remaining space */}
        <motion.div
          initial="initial" animate="animate"
          variants={{ animate: { transition: { staggerChildren: 0.07, delayChildren: 0.1 } } }}
          className="flex-1 grid grid-cols-2 lg:grid-cols-4 gap-3 min-h-0"
        >
          {MODES.map(({ href, label, desc, icon: Icon, accent }) => (
            <motion.div key={href} variants={item} whileHover={{ y: -3, transition: { duration: 0.15 } }} whileTap={{ scale: 0.98 }} className="min-h-0">
              <Link href={href} className="h-full block">
                <Card hover accent={accent} className="flex flex-col gap-3 h-full group">
                  <div className="flex items-center justify-between">
                    <div className={`w-9 h-9 rounded-xl flex items-center justify-center transition-transform duration-200 group-hover:scale-105 ${accent ? "bg-[rgba(29,78,216,0.10)] text-accent" : "bg-raised text-text-lo"}`}>
                      <Icon size={18} />
                    </div>
                    {accent && <Badge variant="accent">Start here</Badge>}
                  </div>
                  <div>
                    <div className="font-syne font-bold text-sm text-text-hi mb-0.5">{label}</div>
                    <div className="text-xs text-text-lo leading-relaxed">{desc}</div>
                  </div>
                  <div className="flex items-center gap-1 text-[11px] text-text-faint mt-auto pt-2 border-t border-[rgba(17,17,17,0.06)] group-hover:text-accent transition-colors">
                    {t.openLink} <ChevronRight size={11} className="transition-transform duration-150 group-hover:translate-x-0.5" />
                  </div>
                </Card>
              </Link>
            </motion.div>
          ))}
        </motion.div>

        {/* Progress row */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }}>
          <Link href="/progress">
            <Card hover className="flex items-center justify-between p-4 group">
              <div className="flex items-center gap-3">
                <BarChart2 size={15} className="text-accent shrink-0" />
                <div>
                  <div className="text-sm font-semibold text-text-hi">{t.overallProgress}</div>
                  <div className="text-xs text-text-lo">{totalAnswered} {t.questionsAttempted.replace("{total}", String(allQ.length))}</div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-32 h-1.5 bg-raised rounded-full overflow-hidden">
                  <div className="h-full bg-accent progress-fill rounded-full" style={{ width: `${Math.min((totalAnswered / allQ.length) * 100, 100)}%` }} />
                </div>
                <ChevronRight size={13} className="text-text-faint group-hover:text-accent transition-colors" />
              </div>
            </Card>
          </Link>
        </motion.div>

      </div>
    </PageWrapper>
  );
}
