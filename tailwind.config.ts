import type { Config } from "tailwindcss";

export default {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        bone: "#F5EFE6",
        ink: "#1A1611",
        saffron: "#D4A24C",
        clay: "#8B5E3C",
        rule: "#1A161114",
        heroBg: "#FAF7F0",
        goldPrimary: "#C9A227",
        goldDeep: "#8C6A1A",
        goldLight: "#E8D27A",
      },
      fontFamily: {
        display: ["var(--font-display)", "ui-serif", "Georgia", "serif"],
        body: ["var(--font-body)", "ui-sans-serif", "system-ui"],
        title: ["var(--font-title)", "var(--font-display)", "ui-serif", "serif"],
      },
    },
  },
  plugins: [],
} satisfies Config;
