import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        bg:      "#FAFAF8",
        surface: "#FFFFFF",
        raised:  "#F0EFEC",
        brand:   "#C0392B",
        accent:  "#B8860B",
        "accent-hi":  "#D4AF37",
        "accent-dim": "rgba(184,134,11,0.10)",
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
        "card-hover": "0 8px 24px rgba(0,0,0,0.10), 0 0 0 1px rgba(184,134,11,0.22)",
        "accent":     "0 0 24px rgba(184,134,11,0.18)",
      },
    },
  },
  plugins: [],
};
export default config;
