"use client";
import { motion } from "framer-motion";
import Link from "next/link";
import { BookOpen, Layers, CreditCard, Search, BarChart2, Flame, CheckCircle, Target, ChevronRight, Trophy } from "lucide-react";
import { useStore } from "@/lib/store";
import questions from "@/data/questions.json";
import { calcReadiness } from "@/lib/utils";
import PageWrapper from "@/components/layout/PageWrapper";
import Card from "@/components/ui/Card";
import Badge from "@/components/ui/Badge";
import type { Question } from "@/lib/types";

const allQ = questions as Question[];

const MODES = [
  { href: "/exam",       label: "Mock Exam",     desc: "33 questions · 60 min · Official format",          icon: BookOpen,  accent: true  },
  { href: "/practice",   label: "Practice",      desc: "Topic filters · Instant feedback · Explanations",  icon: Layers,    accent: false },
  { href: "/flashcards", label: "Flashcards",    desc: "Flip cards · Know / Don't Know · Spaced rep.",      icon: CreditCard,accent: false },
  { href: "/browse",     label: "Browse All",    desc: "Search 460 questions · Filter · Bookmark",         icon: Search,    accent: false },
];

const item = {
  initial: { opacity: 0, y: 14 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.38, ease: [0.4, 0, 0.2, 1] } },
};

export default function Dashboard() {
  const { selectedState, selectedStateCode, progress, streak, examHistory } = useStore();
  const totalAnswered = Object.keys(progress).length;
  const readiness = calcReadiness(progress, allQ.length);
  const lastExam = examHistory[0];

  return (
    <PageWrapper>
      <div className="max-w-3xl mx-auto px-4 sm:px-6">

        {/* Hero */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.45 }} className="pt-4 pb-10">
          {selectedStateCode && (
            <Badge variant="accent" className="mb-4">{selectedState} · {selectedStateCode}</Badge>
          )}
          <h1 className="font-syne font-extrabold text-5xl sm:text-6xl leading-none text-text-hi mb-3">
            Citizenship<br /><span className="text-gradient">Prep.</span>
          </h1>
          <p className="text-text-lo text-base max-w-sm leading-relaxed">
            Master the German naturalization test. {allQ.filter(q => !q.state).length} general + {allQ.filter(q => q.stateCode === selectedStateCode).length} {selectedState ?? "state"} questions.
          </p>
        </motion.div>

        {/* Stats */}
        <motion.div
          initial="initial" animate="animate"
          variants={{ animate: { transition: { staggerChildren: 0.07 } } }}
          className="grid grid-cols-3 gap-3 mb-8"
        >
          {[
            { label: "Answered", value: totalAnswered, icon: CheckCircle },
            { label: "Day streak", value: `${streak}d`,  icon: Flame },
            { label: "Readiness", value: `${readiness}%`, icon: Target },
          ].map(({ label, value, icon: Icon }) => (
            <motion.div key={label} variants={item}>
              <Card className="text-center py-5 px-3">
                <Icon size={16} className="text-accent mx-auto mb-2" />
                <div className="font-mono font-bold text-2xl text-text-hi mb-0.5">{value}</div>
                <div className="text-xs text-text-faint">{label}</div>
              </Card>
            </motion.div>
          ))}
        </motion.div>

        {/* Last exam */}
        {lastExam && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }} className="mb-6">
            <Link href="/progress">
              <Card hover className="flex items-center justify-between p-4">
                <div className="flex items-center gap-3">
                  <Trophy size={16} className="text-accent shrink-0" />
                  <div>
                    <div className="text-[11px] text-text-faint mb-0.5">{new Date(lastExam.date).toLocaleDateString()} · {lastExam.stateName}</div>
                    <div className="font-syne font-bold text-sm text-text-hi">{lastExam.score}/33 · {lastExam.passed ? "Passed" : "Failed"}</div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant={lastExam.passed ? "green" : "red"}>{lastExam.passed ? "PASS" : "FAIL"}</Badge>
                  <ChevronRight size={13} className="text-text-faint" />
                </div>
              </Card>
            </Link>
          </motion.div>
        )}

        {/* Modes */}
        <p className="text-[11px] text-text-faint uppercase tracking-[0.14em] font-semibold mb-3">Study Modes</p>
        <motion.div
          initial="initial" animate="animate"
          variants={{ animate: { transition: { staggerChildren: 0.07, delayChildren: 0.1 } } }}
          className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6"
        >
          {MODES.map(({ href, label, desc, icon: Icon, accent }) => (
            <motion.div key={href} variants={item} whileHover={{ y: -3, transition: { duration: 0.15 } }} whileTap={{ scale: 0.98 }}>
              <Link href={href}>
                <Card hover accent={accent} className="flex flex-col gap-3 h-full group">
                  <div className="flex items-center justify-between">
                    <div className={`w-9 h-9 rounded-xl flex items-center justify-center transition-transform duration-200 group-hover:scale-105 ${accent ? "bg-[rgba(184,134,11,0.15)] text-accent" : "bg-raised text-text-lo"}`}>
                      <Icon size={18} />
                    </div>
                    {accent && <Badge variant="accent">Start here</Badge>}
                  </div>
                  <div>
                    <div className="font-syne font-bold text-sm text-text-hi mb-0.5">{label}</div>
                    <div className="text-xs text-text-lo leading-relaxed">{desc}</div>
                  </div>
                  <div className="flex items-center gap-1 text-[11px] text-text-faint mt-auto pt-2 border-t border-[rgba(17,17,17,0.06)] group-hover:text-accent transition-colors">
                    Open <ChevronRight size={11} className="transition-transform duration-150 group-hover:translate-x-0.5" />
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
                  <div className="text-sm font-semibold text-text-hi">Overall Progress</div>
                  <div className="text-xs text-text-lo">{totalAnswered} of {allQ.length} questions attempted</div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-24 h-1 bg-raised rounded-full overflow-hidden">
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
