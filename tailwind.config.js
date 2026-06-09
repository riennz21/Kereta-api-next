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
          DEFAULT: "#f37021",
          dark: "#c6520f",
          soft: "#fff0e2",
        },
        navy: {
          DEFAULT: "#0f2743",
          soft: "#173b64",
        },
        cream: {
          50: "#fffaf4",
          100: "#fef9f3",
          200: "#f8f1e8",
          300: "#f3ece2",
        },
        surface: {
          DEFAULT: "rgba(255, 255, 255, 0.9)",
          solid: "#ffffff",
          muted: "#f8f2eb",
        },
        green: {
          DEFAULT: "#1f9d63",
        },
        red: {
          DEFAULT: "#d74c3c",
        },
        gold: {
          DEFAULT: "#d7a43a",
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
        "brand-lg": "0 22px 45px rgba(15, 39, 67, 0.12)",
        "brand-md": "0 12px 24px rgba(15, 39, 67, 0.09)",
        "brand-sm": "0 8px 16px rgba(15, 39, 67, 0.06)",
        "brand-orange": "0 14px 22px rgba(243, 112, 33, 0.22)",
      },
    },
  },
  plugins: [],
};
