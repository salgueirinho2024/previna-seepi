import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: "#eafcf2",
          100: "#d1f7e0",
          500: "#00c853",
          600: "#00a845",
          700: "#00863a",
          800: "#046b32",
        },
        ink: {
          100: "#e4e9e7",
          300: "#93a29c",
          500: "#5b6b65",
          700: "#33433d",
          800: "#1c2b26",
          900: "#0f1a17",
        },
      },
      boxShadow: {
        card: "0 1px 2px 0 rgba(15, 26, 23, 0.05), 0 1px 3px 0 rgba(15, 26, 23, 0.06)",
      },
    },
  },
  plugins: [],
};
export default config;
