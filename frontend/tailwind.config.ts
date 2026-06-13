import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Premium dark-blue brand palette
        ink: {
          50: "#f4f6fb",
          100: "#e6ebf5",
          200: "#c6d2e9",
          300: "#9fb2d7",
          400: "#6f8bc0",
          500: "#4c69a8",
          600: "#3a528a",
          700: "#2f4170",
          800: "#1f2c50",
          900: "#0f172a",
          950: "#080d1c",
        },
        brand: {
          50: "#eef4ff",
          100: "#d9e6ff",
          200: "#bcd3ff",
          300: "#8eb6ff",
          400: "#598dff",
          500: "#3366ff",
          600: "#1f4cf5",
          700: "#1a3ce0",
          800: "#1c33b5",
          900: "#1d318f",
          950: "#161f57",
        },
      },
      fontFamily: {
        sans: ["var(--font-inter)", "system-ui", "sans-serif"],
      },
      borderRadius: {
        "4xl": "2rem",
      },
      boxShadow: {
        premium: "0 20px 60px -20px rgba(31, 44, 80, 0.35)",
        glow: "0 0 0 1px rgba(51,102,255,0.15), 0 20px 50px -20px rgba(51,102,255,0.45)",
        card: "0 1px 3px rgba(15,23,42,0.06), 0 12px 32px -12px rgba(15,23,42,0.12)",
      },
      backgroundImage: {
        "grid-light":
          "linear-gradient(to right, rgba(15,23,42,0.04) 1px, transparent 1px), linear-gradient(to bottom, rgba(15,23,42,0.04) 1px, transparent 1px)",
      },
      keyframes: {
        "fade-up": {
          "0%": { opacity: "0", transform: "translateY(16px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-10px)" },
        },
        shimmer: {
          "100%": { transform: "translateX(100%)" },
        },
      },
      animation: {
        "fade-up": "fade-up 0.6s ease-out both",
        float: "float 6s ease-in-out infinite",
        shimmer: "shimmer 2s infinite",
      },
    },
  },
  plugins: [],
};

export default config;
