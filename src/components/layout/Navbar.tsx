"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, BookOpen, Layers, CreditCard, Search, BarChart2, MapPin } from "lucide-react";
import { useStore } from "@/lib/store";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { BUNDESLAENDER } from "@/lib/constants";

const links = [
  { href: "/",           label: "Home",     icon: LayoutDashboard },
  { href: "/exam",       label: "Exam",     icon: BookOpen },
  { href: "/practice",   label: "Practice", icon: Layers },
  { href: "/flashcards", label: "Cards",    icon: CreditCard },
  { href: "/browse",     label: "Browse",   icon: Search },
  { href: "/progress",   label: "Progress", icon: BarChart2 },
];

export default function Navbar() {
  const pathname = usePathname();
  const { selectedState, selectedStateCode, setSelectedState, preferredLang, setLang } = useStore();
  const [open, setOpen] = useState(false);

  return (
    <>
      <nav className="fixed top-4 left-1/2 -translate-x-1/2 z-[60] w-[calc(100%-2rem)] max-w-4xl">
        <div className="glass shadow-card rounded-2xl px-4 py-2.5 flex items-center justify-between gap-2">
          <Link href="/" className="flex items-center gap-2 shrink-0">
            <span className="w-7 h-7 rounded-xl bg-[#C0392B] flex items-center justify-center text-white text-xs font-extrabold font-syne float">L</span>
            <span className="font-syne font-bold text-sm text-[#111111] hidden sm:block tracking-wide">LID Prep</span>
          </Link>

          <div className="flex items-center gap-0.5 overflow-x-auto">
            {links.map(({ href, label, icon: Icon }) => {
              const active = pathname === href;
              return (
                <Link key={href} href={href}
                  className={cn(
                    "flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium transition-all duration-150 cursor-pointer whitespace-nowrap",
                    active
                      ? "bg-[rgba(184,134,11,0.10)] text-accent border border-[rgba(184,134,11,0.22)]"
                      : "text-text-faint hover:text-text-lo hover:bg-raised"
                  )}
                >
                  <Icon size={12} />
                  <span className="hidden md:block">{label}</span>
                </Link>
              );
            })}
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            <button
              onClick={() => setLang(preferredLang === "de" ? "en" : "de")}
              className="text-xs font-mono font-bold px-2 py-1 rounded-lg border border-[rgba(17,17,17,0.12)] bg-raised text-text-lo hover:text-accent hover:border-[rgba(184,134,11,0.3)] transition-all cursor-pointer"
            >
              {preferredLang.toUpperCase()}
            </button>
            <button
              onClick={() => setOpen(true)}
              className="flex items-center gap-1 text-xs px-2.5 py-1.5 rounded-xl border border-[rgba(17,17,17,0.12)] bg-raised text-text-lo hover:text-accent hover:border-[rgba(184,134,11,0.3)] transition-all cursor-pointer"
            >
              <MapPin size={10} />
              <span className="font-mono font-bold">{selectedStateCode ?? "--"}</span>
            </button>
          </div>
        </div>
      </nav>

      {open && (
        <div className="fixed inset-0 z-[100] bg-[#FAFAF8]/80 backdrop-blur-xl flex items-center justify-center p-4" onClick={() => setOpen(false)}>
          <div className="bg-white shadow-card-hover rounded-3xl p-6 w-full max-w-lg max-h-[80vh] overflow-y-auto border border-[rgba(17,17,17,0.10)]" onClick={e => e.stopPropagation()}>
            <h2 className="font-syne font-bold text-base text-text-hi mb-4">Change Bundesland</h2>
            <div className="grid grid-cols-2 gap-2">
              {BUNDESLAENDER.map(bl => (
                <button key={bl.code}
                  onClick={() => { setSelectedState(bl.code, bl.name); setOpen(false); }}
                  className={cn(
                    "text-left px-3 py-2.5 rounded-xl border text-sm transition-all cursor-pointer",
                    selectedStateCode === bl.code
                      ? "bg-[rgba(184,134,11,0.10)] border-[rgba(184,134,11,0.28)] text-accent font-semibold"
                      : "border-[rgba(17,17,17,0.10)] text-text-lo hover:text-text-hi hover:border-[rgba(184,134,11,0.22)] bg-raised"
                  )}
                >
                  <span className="font-mono text-[10px] block text-text-faint">{bl.code}</span>
                  {bl.name}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
