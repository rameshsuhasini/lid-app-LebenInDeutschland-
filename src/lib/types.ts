export interface Question {
  id: number;
  text_de: string;
  text_en: string;
  options_de: string[];
  options_en: string[];
  correctIndex: number;
  category: string;
  state: string | null;
  stateCode: string | null;
  explanation_de: string;
  explanation_en: string;
}

export interface ExamSession {
  id: string;
  date: string;
  stateCode: string;
  stateName: string;
  answers: Record<number, number>; // questionId → selected option index
  questions: number[]; // ordered list of question IDs
  score: number;
  passed: boolean;
  durationSeconds: number;
}

export interface QuestionResult {
  questionId: number;
  selectedIndex: number;
  correct: boolean;
}

export type AnswerState = "unanswered" | "correct" | "wrong";

export interface Bundesland {
  code: string;
  name: string;
  capital: string;
  color: string;
}

export type Lang = "de" | "en";
