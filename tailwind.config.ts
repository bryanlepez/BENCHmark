import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        base: "#f6f6f6",
        ink: "#111111",
        line: "#d5d5d5"
      }
    }
  },
  plugins: []
};

export default config;
