/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,jsx,ts,tsx}",
    "./src/**/*.{js,jsx,ts,tsx}",
    "./components/**/*.{js,jsx,ts,tsx}",
  ],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        background: "hsl(var(--background))",
        card: "hsl(var(--card))",
        foreground: "hsl(var(--foreground))",
        muted: "hsl(var(--muted-foreground))",
        border: "hsl(var(--border))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
          dark: "hsl(163 94% 24%)",
          darker: "hsl(164 86% 16%)",
        },
        muted: {
          DEFAULT: "hsl(var(--muted-foreground))",
          foreground: "hsl(var(--muted-foreground))",
          gray: "hsl(240 5% 84%)",
        },
        accent: {
          orange: "hsl(var(--accent-orange))",
          purple: "hsl(var(--accent-purple))",
          rose: "hsl(var(--accent-rose))",
        },
      },
    },
  },
  plugins: [],
};
