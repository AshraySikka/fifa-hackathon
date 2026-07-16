/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        pitch: {
          950: "#070C09",
          900: "#0A0F0D",
          800: "#111A15",
          700: "#182620",
          600: "#22352C",
        },
        signal: {
          DEFAULT: "#22E584",
          dim: "#159E5C",
          glow: "#5FFFAF",
        },
        chalk: "#F4F7F5",
        flag: "#FF5D5D",
      },
      fontFamily: {
        display: ["'Space Grotesk'", "sans-serif"],
        body: ["'Inter'", "sans-serif"],
        mono: ["'JetBrains Mono'", "monospace"],
      },
      backgroundImage: {
        "pitch-lines": "repeating-linear-gradient(0deg, rgba(34,229,132,0.035) 0px, rgba(34,229,132,0.035) 1px, transparent 1px, transparent 64px)",
      },
      boxShadow: {
        floodlight: "0 0 40px -8px rgba(34,229,132,0.35)",
      },
    },
  },
  plugins: [],
};
