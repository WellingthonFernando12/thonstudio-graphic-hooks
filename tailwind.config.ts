import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "#000000",
        panel: "#181818",
        panelSoft: "#1d1d1d",
        text: "#f0f0f0",
        muted: "#8f8f8f",
        line: "rgba(255,255,255,0.09)",
        green: "#5fd78d",
        blue: "#3b9bff",
      },
      borderRadius: {
        xl: "18px",
        "2xl": "24px",
        "3xl": "28px",
      },
      fontFamily: {
        sans: [
          "Inter",
          "ui-sans-serif",
          "system-ui",
          "-apple-system",
          "BlinkMacSystemFont",
          "Segoe UI",
          "sans-serif",
        ],
      },
      boxShadow: {
        premium: "0 24px 80px rgba(0,0,0,.34)",
        card: "0 18px 48px rgba(0,0,0,.16)",
      },
    },
  },
  plugins: [],
};

export default config;
