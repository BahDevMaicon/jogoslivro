/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        parchment: {
          50: "#f7f0dd",
          100: "#efe3c3",
          200: "#e2cf9e",
          300: "#d3b676",
          400: "#c39c52",
          500: "#a97f3d",
          600: "#8a6531",
          700: "#6b4d27",
          800: "#4c371d",
          900: "#2e2113",
        },
        ember: {
          400: "#5aa9e8",
          500: "#3a86d1",
          600: "#2568ab",
        },
        nightwood: {
          800: "#17212e",
          900: "#10161f",
          950: "#0a0e15",
        },
        moss: {
          400: "#8bb06a",
          500: "#6b9149",
          600: "#4f7135",
        },
        azure: {
          400: "#7badd1",
          500: "#5389b0",
          600: "#3b698c",
        },
        wine: {
          400: "#c97080",
          500: "#a8475a",
          600: "#822f40",
        },
        amethyst: {
          400: "#af92d6",
          500: "#8d6bb8",
          600: "#6d4d94",
        },
      },
      fontFamily: {
        serif: ["'Cormorant Garamond'", "Georgia", "serif"],
        display: ["'Cinzel'", "Georgia", "serif"],
        "book-garamond": ["'Cormorant Garamond'", "Georgia", "serif"],
        "book-eb": ["'EB Garamond'", "Georgia", "serif"],
        "book-baskerville": ["'Libre Baskerville'", "Georgia", "serif"],
      },
      boxShadow: {
        parchment: "0 4px 20px rgba(0,0,0,0.45)",
        page: "0 2px 10px rgba(0,0,0,0.3), 0 12px 32px rgba(0,0,0,0.4)",
      },
    },
  },
  plugins: [],
};
