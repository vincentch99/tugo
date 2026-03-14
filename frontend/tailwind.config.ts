import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        navy: {
          50: "#e8edf5",
          100: "#c5d0e6",
          200: "#9aafd4",
          300: "#6f8ec2",
          400: "#4d74b3",
          500: "#2b5aa4",
          600: "#24519c",
          700: "#1b4592",
          800: "#133988",
          900: "#0A1628",
          950: "#060d18",
        },
        ocean: {
          50: "#e0f4fe",
          100: "#b3e3fc",
          200: "#80d1fa",
          300: "#4dbff8",
          400: "#26b1f6",
          500: "#0EA5E9",
          600: "#0c94d3",
          700: "#0980ba",
          800: "#076da1",
          900: "#044d75",
        },
        gold: {
          50: "#fffbeb",
          100: "#fef3c7",
          200: "#fde68a",
          300: "#fcd34d",
          400: "#fbbf24",
          500: "#F59E0B",
          600: "#d97706",
          700: "#b45309",
          800: "#92400e",
          900: "#78350f",
        },
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
      },
    },
  },
  plugins: [],
};

export default config;
