"use client";
import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useStore } from "@/lib/store";
import { CATEGORIES, BUNDESLAENDER } from "@/lib/constants";
import { cn } from "@/lib/utils";
import questions from "@/data/questions.json";
import PageWrapper from "@/components/layout/PageWrapper";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Badge from "@/components/ui/Badge";
import type { Question } from "@/lib/types";
import { Search, Bookmark, BookmarkCheck, ChevronDown } from "lucide-react";

const allQ = questions as Question[];
const PER_PAGE = 15;

export default function BrowsePage() {
  const { preferredLang, bookmarks, toggleBookmark, selectedStateCode } = useStore();
  const lang = preferredLang;

  const [search, setSearch] = useState("");
  const [cat, setCat] = useState("");
  const [stateFilter, setStateFilter] = useState("");
  const [bookmarkedOnly, setBookmarkedOnly] = useState(false);
  const [page, setPage] = useState(1);
  const [expanded, setExpanded] = useState<number | null>(null);

  const filtered = useMemo(() => {
    return allQ.filter(q => {
      if (bookmarkedOnly && !bookmarks.includes(q.id)) return false;
      if (cat && q.category !== cat) return false;
      if (stateFilter === "__general__" && q.state !== null) return false;
      if (stateFilter && stateFilter !== "__general__" && q.stateCode !== stateFilter) return false;
      if (search) {
        const s = search.toLowerCase();
        const textDe = q.text_de.toLowerCase();
        const textEn = q.text_en.toLowerCase();
        if (!textDe.includes(s) && !textEn.includes(s)) return false;
      }
      return true;
    });
  }, [search, cat, stateFilter, bookmarkedOnly, bookmarks]);

  const totalPages = Math.ceil(filtered.length / PER_PAGE);
  const pageQ = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE);

  const resetPage = () => setPage(1);

  return (
    <PageWrapper>
      <div className="max-w-2xl mx-auto px-4 pt-4">
        <div className="mb-6">
          <p className="text-[11px] text-text-faint uppercase tracking-[0.14em] font-semibold mb-1">Question Browser</p>
          <h1 className="font-syne font-extrabold text-3xl text-text-hi">Browse All</h1>
        </div>

        {/* Search */}
        <div className="relative mb-3">
          <Search size={13} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-faint" />
          <input
            value={search} onChange={e => { setSearch(e.target.value); resetPage(); }}
            placeholder="Search questions…"
            className="w-full bg-white border border-[rgba(17,17,17,0.10)] text-text-hi placeholder:text-text-faint rounded-2xl pl-9 pr-4 py-2.5 text-sm outline-none focus:border-[rgba(184,134,11,0.35)] transition-colors shadow-sm"
          />
        </div>

        {/* Filters row */}
        <div className="flex flex-wrap gap-2 mb-4">
          <select value={cat} onChange={e => { setCat(e.target.value); resetPage(); }}
            className="bg-white border border-[rgba(17,17,17,0.10)] text-text-lo rounded-xl px-3 py-1.5 text-xs outline-none focus:border-[rgba(184,134,11,0.35)] cursor-pointer">
            <option value="">All categories</option>
            {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
          </select>

          <select value={stateFilter} onChange={e => { setStateFilter(e.target.value); resetPage(); }}
            className="bg-white border border-[rgba(17,17,17,0.10)] text-text-lo rounded-xl px-3 py-1.5 text-xs outline-none focus:border-[rgba(184,134,11,0.35)] cursor-pointer">
            <option value="">All regions</option>
            <option value="__general__">General only</option>
            {BUNDESLAENDER.map(b => <option key={b.code} value={b.code}>{b.name}</option>)}
          </select>

          <button
            onClick={() => { setBookmarkedOnly(b => !b); resetPage(); }}
            className={cn("flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-xl border cursor-pointer transition-all", bookmarkedOnly ? "bg-[rgba(184,134,11,0.10)] border-[rgba(184,134,11,0.28)] text-accent" : "bg-white border-[rgba(17,17,17,0.10)] text-text-lo hover:text-text-hi")}
          >
            <Bookmark size={11} /> Bookmarked
          </button>

          {(search || cat || stateFilter || bookmarkedOnly) && (
            <button onClick={() => { setSearch(""); setCat(""); setStateFilter(""); setBookmarkedOnly(false); resetPage(); }}
              className="text-xs text-text-faint hover:text-accent px-2 cursor-pointer transition-colors">
              Clear all
            </button>
          )}
        </div>

        <div className="flex items-center justify-between mb-4">
          <span className="text-xs text-text-faint">{filtered.length} question{filtered.length !== 1 ? "s" : ""}</span>
          {selectedStateCode && (
            <button onClick={() => { setStateFilter(selectedStateCode); resetPage(); }} className="text-xs text-accent hover:underline cursor-pointer">My state ({selectedStateCode})</button>
          )}
        </div>

        {/* Question list */}
        <div className="space-y-2 mb-6">
          {pageQ.length === 0 && (
            <div className="text-center py-12 text-text-faint text-sm">No questions match your filters.</div>
          )}
          {pageQ.map((q) => {
            const isOpen = expanded === q.id;
            return (
              <Card key={q.id} hover className="overflow-hidden">
                <div
                  role="button"
                  tabIndex={0}
                  onClick={() => setExpanded(isOpen ? null : q.id)}
                  onKeyDown={e => e.key === "Enter" && setExpanded(isOpen ? null : q.id)}
                  className="w-full text-left cursor-pointer"
                >
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
                      <div className="border-t border-[rgba(17,17,17,0.07)] pt-3 mt-3 space-y-1.5">
                        {(lang === "de" ? q.options_de : q.options_en).map((opt, oi) => (
                          <div key={oi} className={`text-xs px-3 py-2 rounded-xl border ${oi === q.correctIndex ? "option-correct" : "border-[rgba(17,17,17,0.07)] text-text-faint"}`}>
                            <span className="font-mono mr-2">{String.fromCharCode(65 + oi)}</span>{opt}
                          </div>
                        ))}
                        {q.explanation_de && (
                          <p className="text-xs text-text-faint pt-2 leading-relaxed border-t border-[rgba(17,17,17,0.07)] mt-2">
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

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-2 mb-8">
            <Button variant="ghost" disabled={page === 1} onClick={() => setPage(p => p - 1)}>Prev</Button>
            <span className="text-xs text-text-faint">{page} / {totalPages}</span>
            <Button variant="ghost" disabled={page === totalPages} onClick={() => setPage(p => p + 1)}>Next</Button>
          </div>
        )}
      </div>
    </PageWrapper>
  );
}

