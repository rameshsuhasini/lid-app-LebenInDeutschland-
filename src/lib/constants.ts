import type { Bundesland } from "./types";

export const BUNDESLAENDER: Bundesland[] = [
  { code: "BW", name: "Baden-Württemberg", capital: "Stuttgart", color: "#FFD700" },
  { code: "BY", name: "Bayern", capital: "München", color: "#4A90D9" },
  { code: "BE", name: "Berlin", capital: "Berlin", color: "#E74C3C" },
  { code: "BB", name: "Brandenburg", capital: "Potsdam", color: "#E74C3C" },
  { code: "HB", name: "Bremen", capital: "Bremen", color: "#E74C3C" },
  { code: "HH", name: "Hamburg", capital: "Hamburg", color: "#E74C3C" },
  { code: "HE", name: "Hessen", capital: "Wiesbaden", color: "#E74C3C" },
  { code: "MV", name: "Mecklenburg-Vorpommern", capital: "Schwerin", color: "#4A90D9" },
  { code: "NI", name: "Niedersachsen", capital: "Hannover", color: "#FFD700" },
  { code: "NW", name: "Nordrhein-Westfalen", capital: "Düsseldorf", color: "#4A90D9" },
  { code: "RP", name: "Rheinland-Pfalz", capital: "Mainz", color: "#E74C3C" },
  { code: "SL", name: "Saarland", capital: "Saarbrücken", color: "#4A90D9" },
  { code: "SN", name: "Sachsen", capital: "Dresden", color: "#4A90D9" },
  { code: "ST", name: "Sachsen-Anhalt", capital: "Magdeburg", color: "#FFD700" },
  { code: "SH", name: "Schleswig-Holstein", capital: "Kiel", color: "#4A90D9" },
  { code: "TH", name: "Thüringen", capital: "Erfurt", color: "#E74C3C" },
];

export const CATEGORIES = [
  "Recht und Staat",
  "Politik",
  "Wahlen",
  "Geschichte",
  "Gesellschaft und Familie",
  "Grundrechte",
  "Verfassungsgrundsätze",
  "Zivilgesellschaft",
];

export const EXAM_TOTAL = 33;
export const EXAM_GENERAL = 30;
export const EXAM_STATE = 3;
export const EXAM_DURATION_SEC = 60 * 60; // 60 minutes
export const PASSING_SCORE = 17;
