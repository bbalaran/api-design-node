import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
    "./lib/**/*.{js,ts,jsx,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        success: "#15803d",
        warning: "#d97706",
        danger: "#b91c1c"
      }
    }
  },
  plugins: []
};

export default config;
