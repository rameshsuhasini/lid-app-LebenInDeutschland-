import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        bg:      "#0E0E10",
        surface: "#161618",
        raised:  "#1E1E20",
        brand:   "#C0392B",
        accent:  "#1E3FA8",
        "accent-hi":  "#2952C8",
        "accent-dim": "rgba(30,63,168,0.14)",
        "text-hi":    "#F0F0F0",
        "text-lo":    "#888888",
        "text-faint": "#555555",
        "c-red":   "#E05252",
        "c-green": "#34D058",
      },
      fontFamily: {
        syne: ["Syne", "sans-serif"],
        plex: ["IBM Plex Sans", "sans-serif"],
        mono: ["IBM Plex Mono", "monospace"],
      },
      boxShadow: {
        "card":       "0 1px 3px rgba(0,0,0,0.40), 0 0 0 1px rgba(255,255,255,0.06)",
        "card-hover": "0 8px 32px rgba(0,0,0,0.55), 0 0 0 1px rgba(30,63,168,0.30)",
        "accent":     "0 0 24px rgba(30,63,168,0.32)",
      },
    },
  },
  plugins: [],
};
export default config;
