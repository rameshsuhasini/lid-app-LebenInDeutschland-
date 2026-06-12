import type { Question } from "./types";
import { EXAM_GENERAL, EXAM_STATE } from "./constants";

export function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export function sampleExam(questions: Question[], stateCode: string): Question[] {
  const general = shuffle(questions.filter((q) => q.state === null)).slice(0, EXAM_GENERAL);
  const state = shuffle(questions.filter((q) => q.stateCode === stateCode)).slice(0, EXAM_STATE);
  return shuffle([...general, ...state]);
}

export function filterQuestions(
  questions: Question[],
  opts: {
    categories?: string[];
    stateCode?: string | null;
    includeGeneral?: boolean;
    includeState?: boolean;
    searchText?: string;
  }
): Question[] {
  let result = [...questions];

  if (opts.categories && opts.categories.length > 0) {
    result = result.filter((q) => opts.categories!.includes(q.category));
  }

  if (opts.includeGeneral === false) {
    result = result.filter((q) => q.state !== null);
  }
  if (opts.includeState === false) {
    result = result.filter((q) => q.state === null);
  }
  if (opts.stateCode) {
    result = result.filter((q) => q.state === null || q.stateCode === opts.stateCode);
  }

  if (opts.searchText) {
    const q = opts.searchText.toLowerCase();
    result = result.filter(
      (item) =>
        item.text_de.toLowerCase().includes(q) ||
        item.text_en.toLowerCase().includes(q)
    );
  }

  return result;
}

export function calcReadiness(
  progress: Record<number, "correct" | "wrong" | "skipped">,
  total: number
): number {
  if (total === 0) return 0;
  const correct = Object.values(progress).filter((v) => v === "correct").length;
  return Math.round((correct / total) * 100);
}

export function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60).toString().padStart(2, "0");
  const s = (seconds % 60).toString().padStart(2, "0");
  return `${m}:${s}`;
}

export function getTodayKey(): string {
  return new Date().toISOString().slice(0, 10);
}

export function getWeekDates(): string[] {
  const today = new Date();
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(today);
    d.setDate(today.getDate() - (6 - i));
    return d.toISOString().slice(0, 10);
  });
}

export function generateId(): string {
  return Math.random().toString(36).slice(2, 10);
}

export function getStateByCode(stateCode: string, bundeslaender: { code: string; name: string }[]) {
  return bundeslaender.find((b) => b.code === stateCode) ?? null;
}

export function cn(...classes: (string | undefined | false | null)[]): string {
  return classes.filter(Boolean).join(" ");
}
