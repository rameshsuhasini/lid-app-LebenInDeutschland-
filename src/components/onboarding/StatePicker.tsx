"use client";
import { motion } from "framer-motion";
import { useState } from "react";
import { ArrowRight } from "lucide-react";
import { BUNDESLAENDER } from "@/lib/constants";
import { useStore } from "@/lib/store";
import { getT } from "@/lib/i18n";
import Button from "@/components/ui/Button";

export default function StatePicker() {
  const { completeOnboarding, preferredLang } = useStore();
  const t = getT(preferredLang);
  const [selected, setSelected] = useState<{ code: string; name: string } | null>(null);

  return (
    <div className="min-h-screen bg-bg flex flex-col items-center justify-center p-6 relative overflow-hidden">
      <div className="bg-dots fixed inset-0 pointer-events-none opacity-60" />
      <div className="flag-stripe fixed top-0 left-0 right-0 z-10" />

      <motion.div
        initial={{ opacity: 0, y: 32 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.4, 0, 0.2, 1] }}
        className="w-full max-w-xl relative z-10"
      >
        <div className="text-center mb-10">
          <motion.div
            initial={{ scale: 0.6, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.1, type: "spring", stiffness: 200, damping: 14 }}
            className="w-16 h-16 mx-auto mb-6 rounded-2xl bg-[#C0392B] flex items-center justify-center text-white font-syne font-extrabold text-2xl shadow-accent float"
          >
            L
          </motion.div>
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
            <p className="text-text-faint text-xs uppercase tracking-[0.2em] mb-3 font-semibold">{t.onboardingLabel}</p>
            <h1 className="font-syne font-extrabold text-4xl sm:text-5xl text-text-hi leading-tight mb-3">
              Leben in<br /><span className="text-gradient">Deutschland</span>
            </h1>
            <p className="text-text-lo text-sm max-w-xs mx-auto leading-relaxed">
              {t.onboardingSubtitle}
            </p>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.35 }}
          className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-8"
        >
          {BUNDESLAENDER.map((bl, i) => (
            <motion.button
              key={bl.code}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.35 + i * 0.02 }}
              onClick={() => setSelected(bl)}
              className={cn(
                "text-left px-3 py-3 rounded-2xl border transition-all duration-150 cursor-pointer",
                selected?.code === bl.code
                  ? "bg-[rgba(30,63,168,0.14)] border-[rgba(30,63,168,0.32)] shadow-accent"
                  : "bg-surface border-[rgba(255,255,255,0.08)] hover:border-[rgba(30,63,168,0.28)] hover:text-text-hi"
              )}
            >
              <span className={`font-mono text-[10px] font-bold block mb-0.5 ${selected?.code === bl.code ? "text-accent" : "text-text-faint"}`}>{bl.code}</span>
              <span className={`text-xs font-semibold leading-tight block ${selected?.code === bl.code ? "text-text-hi" : "text-text-lo"}`}>{bl.name}</span>
              <span className="text-[10px] text-text-faint block mt-0.5">{bl.capital}</span>
            </motion.button>
          ))}
        </motion.div>

        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }} className="flex flex-col items-center gap-2">
          <Button variant="primary" size="lg" glow disabled={!selected}
            onClick={() => selected && completeOnboarding(selected.code, selected.name)}
            className="min-w-[200px]"
          >
            {t.startPreparing} <ArrowRight size={16} />
          </Button>
          {selected && (
            <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-text-faint text-xs">
              {selected.name}
            </motion.p>
          )}
        </motion.div>
      </motion.div>
    </div>
  );
}

function cn(...c: (string | false | undefined | null)[]) { return c.filter(Boolean).join(" "); }
