import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        blush: {
          50: "#fff5f8",
          100: "#ffe9ef",
          200: "#ffd3df",
          300: "#f5b7c7",
          400: "#e18ea2",
          500: "#be6f87",
          600: "#99556a",
          700: "#70404f",
          800: "#4b2f39",
          900: "#2c1d23",
        },
      },
      boxShadow: {
        glow: "0 10px 40px rgba(190, 111, 135, 0.35)",
      },
      backgroundImage: {
        bloom:
          "radial-gradient(circle at 15% 20%, rgba(255, 255, 255, 0.45), transparent 45%), radial-gradient(circle at 80% 10%, rgba(245, 183, 199, 0.5), transparent 40%), linear-gradient(145deg, #2b1f24 0%, #5e3f4f 45%, #be6f87 100%)",
      },
      keyframes: {
        rise: {
          "0%": { opacity: "0", transform: "translateY(20px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
      },
      animation: {
        rise: "rise 700ms ease-out both",
      },
    },
  },
  plugins: [],
};

export default config;
