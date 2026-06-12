import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        bg:      "#FFFFFF",
        surface: "#F9FAFB",
        raised:  "#F3F4F6",
        brand:   "#C0392B",
        accent:  "#1D4ED8",
        "accent-hi":  "#2563EB",
        "accent-dim": "rgba(29,78,216,0.10)",
        "text-hi":    "#111111",
        "text-lo":    "#555555",
        "text-faint": "#999999",
        "c-red":   "#C0392B",
        "c-green": "#1D8B3C",
      },
      fontFamily: {
        syne: ["Syne", "sans-serif"],
        plex: ["IBM Plex Sans", "sans-serif"],
        mono: ["IBM Plex Mono", "monospace"],
      },
      boxShadow: {
        "card":       "0 1px 3px rgba(0,0,0,0.07), 0 0 0 1px rgba(17,17,17,0.07)",
        "card-hover": "0 8px 24px rgba(0,0,0,0.10), 0 0 0 1px rgba(29,78,216,0.22)",
        "accent":     "0 0 24px rgba(29,78,216,0.18)",
      },
    },
  },
  plugins: [],
};
export default config;
