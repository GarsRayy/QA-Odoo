import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: "#3B82F6", // Modern Blue
          foreground: "#FFFFFF",
        },
        secondary: "#0F172A",
        accent: "#10B981",
        danger: "#F43F5E",
        warning: "#F59E0B",
        muted: "#64748B",
        border: "#E2E8F0",
      },
      borderRadius: {
        '3xl': '1.5rem',
        '4xl': '2rem',
        '5xl': '2.5rem',
      }
    },
  },
  plugins: [],
};
export default config;
