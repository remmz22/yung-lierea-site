import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: {
          950: "#04050d",
          900: "#070919",
          800: "#0b0e24",
          700: "#11142e",
        },
        neon: {
          purple: "#a855f7",
          violet: "#c4b5fd",
          cyan: "#22d3ee",
          aqua: "#67e8f9",
          pink: "#f472b6",
          rose: "#fda4af",
        },
      },
      fontFamily: {
        display: ["var(--font-display)", "system-ui", "sans-serif"],
        body: ["var(--font-body)", "system-ui", "sans-serif"],
      },
      boxShadow: {
        glow: "0 0 24px rgba(168,85,247,.35), 0 0 64px rgba(168,85,247,.15)",
        "glow-cyan": "0 0 24px rgba(34,211,238,.35), 0 0 64px rgba(34,211,238,.12)",
        "glow-pink": "0 0 24px rgba(244,114,182,.35), 0 0 64px rgba(244,114,182,.12)",
        card: "0 8px 32px rgba(0,0,0,.45)",
      },
      keyframes: {
        floaty: {
          "0%,100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-12px)" },
        },
        bounceSoft: {
          "0%,100%": { transform: "translateY(0)", opacity: ".9" },
          "50%": { transform: "translateY(8px)", opacity: ".4" },
        },
        auroraShift: {
          "0%,100%": { transform: "translate(-8%, -4%) scale(1)" },
          "33%": { transform: "translate(6%, 8%) scale(1.15)" },
          "66%": { transform: "translate(-4%, 10%) scale(.95)" },
        },
        eqBar: {
          "0%,100%": { transform: "scaleY(.25)" },
          "50%": { transform: "scaleY(1)" },
        },
        pulseDot: {
          "0%,100%": { boxShadow: "0 0 0 0 rgba(52,211,153,.55)" },
          "70%": { boxShadow: "0 0 0 12px rgba(52,211,153,0)" },
        },
        spinSlow: {
          from: { transform: "rotate(0deg)" },
          to: { transform: "rotate(360deg)" },
        },
        marquee: {
          from: { transform: "translateX(0)" },
          to: { transform: "translateX(-50%)" },
        },
      },
      animation: {
        floaty: "floaty 7s ease-in-out infinite",
        "bounce-soft": "bounceSoft 2s ease-in-out infinite",
        aurora: "auroraShift 22s ease-in-out infinite",
        "aurora-rev": "auroraShift 28s ease-in-out infinite reverse",
        "spin-slow": "spinSlow 14s linear infinite",
        marquee: "marquee 28s linear infinite",
        "pulse-dot": "pulseDot 2s ease-out infinite",
      },
    },
  },
  plugins: [],
};

export default config;
