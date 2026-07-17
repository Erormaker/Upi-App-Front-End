import daisyui from "daisyui";

/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Outfit", "Inter", "sans-serif"],
      },
    },
  },
  plugins: [daisyui],
  daisyui: {
    themes: [
      {
        payflowLight: {
          "primary": "#0F52BA",          // Premium Blue
          "secondary": "#D4AF37",        // Gold Yellow
          "accent": "#E6B800",           // Amber Gold
          "neutral": "#1F2937",          // Slate Dark
          "base-100": "#F8FAFC",         // Off White / Soft Blue-gray
          "base-200": "#F1F5F9",         // Card bg
          "base-300": "#E2E8F0",
          "info": "#0284C7",
          "success": "#16A34A",
          "warning": "#CA8A04",
          "error": "#DC2626",
        },
        payflowDark: {
          "primary": "#3B82F6",          // Electric Blue
          "secondary": "#F59E0B",        // Bright Gold Yellow
          "accent": "#D4AF37",           // Gold Accent
          "neutral": "#111827",          // Dark Gray
          "base-100": "#0F172A",         // Deep Space Navy
          "base-200": "#1E293B",         // Slate Navy Card Bg
          "base-300": "#334155",         // Borders
          "info": "#38BDF8",
          "success": "#4ADE80",
          "warning": "#FBBF24",
          "error": "#F87171",
        },
      },
    ],
  },
}

