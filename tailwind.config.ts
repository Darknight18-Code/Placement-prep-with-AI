import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
      },
      // --- ADDED ANIMATIONS FOR THE WAVY LIGHT ---
      animation: {
        "wave-slow": "wave 8s infinite linear",
      },
      keyframes: {
        wave: {
          "0%": { transform: "translateX(-50%) translateY(-50%) rotate(0deg)" },
          "50%": { transform: "translateX(-30%) translateY(-40%) rotate(180deg)" },
          "100%": { transform: "translateX(-50%) translateY(-50%) rotate(360deg)" },
        },
         shimmer: {
          '100%': { transform: 'translateX(100%)' },
        },
      },
     
    },
  },
  plugins: [],
};
export default config;