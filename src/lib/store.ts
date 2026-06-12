"use client";
import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { ExamSession, Lang } from "./types";
import { getTodayKey } from "./utils";

interface AppState {
  // Onboarding & Settings
  hasCompletedOnboarding: boolean;
  selectedState: string | null;
  selectedStateCode: string | null;
  preferredLang: Lang;

  // Progress: questionId → result
  progress: Record<number, "correct" | "wrong" | "skipped">;

  // Bookmarks
  bookmarks: number[];

  // Exam history
  examHistory: ExamSession[];

  // Streak
  streak: number;
  lastActiveDate: string | null;
  activityLog: Record<string, number>; // date → questions answered

  // Actions
  completeOnboarding: (stateCode: string, stateName: string) => void;
  setSelectedState: (code: string, name: string) => void;
  setLang: (lang: Lang) => void;
  recordAnswer: (questionId: number, result: "correct" | "wrong" | "skipped") => void;
  toggleBookmark: (questionId: number) => void;
  saveExamSession: (session: ExamSession) => void;
  updateStreak: () => void;
  resetProgress: () => void;
}

export const useStore = create<AppState>()(
  persist(
    (set, get) => ({
      hasCompletedOnboarding: false,
      selectedState: null,
      selectedStateCode: null,
      preferredLang: "en",
      progress: {},
      bookmarks: [],
      examHistory: [],
      streak: 0,
      lastActiveDate: null,
      activityLog: {},

      completeOnboarding: (stateCode, stateName) =>
        set({ hasCompletedOnboarding: true, selectedStateCode: stateCode, selectedState: stateName }),

      setSelectedState: (code, name) =>
        set({ selectedStateCode: code, selectedState: name }),

      setLang: (lang) => set({ preferredLang: lang }),

      recordAnswer: (questionId, result) => {
        const today = getTodayKey();
        const log = { ...get().activityLog };
        log[today] = (log[today] ?? 0) + 1;
        set((s) => ({
          progress: { ...s.progress, [questionId]: result },
          activityLog: log,
        }));
        get().updateStreak();
      },

      toggleBookmark: (questionId) =>
        set((s) => ({
          bookmarks: s.bookmarks.includes(questionId)
            ? s.bookmarks.filter((id) => id !== questionId)
            : [...s.bookmarks, questionId],
        })),

      saveExamSession: (session) =>
        set((s) => ({ examHistory: [session, ...s.examHistory].slice(0, 20) })),

      updateStreak: () => {
        const { lastActiveDate, streak } = get();
        const today = getTodayKey();
        if (lastActiveDate === today) return;
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        const yKey = yesterday.toISOString().slice(0, 10);
        const newStreak = lastActiveDate === yKey ? streak + 1 : 1;
        set({ streak: newStreak, lastActiveDate: today });
      },

      resetProgress: () =>
        set({ progress: {}, examHistory: [], streak: 0, lastActiveDate: null, activityLog: {} }),
    }),
    { name: "lid-app-store" }
  )
);
