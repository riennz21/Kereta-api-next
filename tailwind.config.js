/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          DEFAULT: "#4f46e5",
          dark: "#4338ca",
          soft: "#eef2ff",
        },
        navy: {
          DEFAULT: "#0f172a",
          soft: "#1e293b",
        },
        accent: {
          50: "#fffbeb",
          100: "#fef3c7",
          200: "#fde68a",
          300: "#fcd34d",
          400: "#fbbf24",
          500: "#f59e0b",
          600: "#d97706",
          700: "#b45309",
          800: "#92400e",
          900: "#78350f",
        },
        green: {
          DEFAULT: "#10b981",
        },
        red: {
          DEFAULT: "#ef4444",
        },
        gold: {
          DEFAULT: "#f59e0b",
        },
      },
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', "sans-serif"],
        display: ['"Space Grotesk"', '"Plus Jakarta Sans"', "sans-serif"],
      },
      borderRadius: {
        "2xl": "16px",
        "3xl": "24px",
        "4xl": "28px",
      },
      boxShadow: {
        "brand-lg": "0 20px 40px rgba(15, 23, 42, 0.10)",
        "brand-md": "0 10px 20px rgba(15, 23, 42, 0.08)",
        "brand-sm": "0 4px 12px rgba(15, 23, 42, 0.05)",
        "brand-indigo": "0 10px 18px rgba(79, 70, 229, 0.20)",
        "accent-lg": "0 20px 40px rgba(79, 70, 229, 0.12)",
        "accent-md": "0 10px 20px rgba(79, 70, 229, 0.08)",
        "accent-sm": "0 4px 12px rgba(79, 70, 229, 0.06)",
      },
      animation: {
        "fade-in": "fade-in 0.3s ease-out",
        "slide-up": "slide-up 0.3s ease-out",
        "slide-down": "slide-down 0.2s ease-out",
        "pulse-soft": "pulse-soft 2s ease-in-out infinite",
      },
      keyframes: {
        "fade-in": {
          "0%": { opacity: "0", transform: "translateY(8px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "slide-up": {
          "0%": { opacity: "0", transform: "translateY(16px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "slide-down": {
          "0%": { opacity: "0", transform: "translateY(-8px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "pulse-soft": {
          "0%, 100%": { boxShadow: "0 10px 18px rgba(79, 70, 229, 0.20)" },
          "50%": { boxShadow: "0 12px 24px rgba(79, 70, 229, 0.30), 0 0 0 4px rgba(79, 70, 229, 0.10)" },
        },
      },
    },
  },
  plugins: [],
};
