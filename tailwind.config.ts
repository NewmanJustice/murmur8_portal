import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx,js,jsx,mdx}",
    "./pages/**/*.{ts,tsx,js,jsx,mdx}",
    "./components/**/*.{ts,tsx,js,jsx,mdx}",
    "./src/**/*.{ts,tsx,js,jsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        starling: {
          ink: "#0B1020",
          night: "#111827",
          dusk: "#1E293B",
          blue: "#1E5A7A",
          slate: "#334155",
          silver: "#94A3B8",
          cloud: "#F8FAFC",
          mist: "#EAF6FF",
          sky: "#38BDF8",
          cyan: "#BAE6FD",
        },
        agent: {
          alex: "#38BDF8",
          cass: "#A78BFA",
          nigel: "#F59E0B",
          codey: "#2DD4BF",
        },
      },
      fontFamily: {
        sans: [
          "Inter",
          "ui-sans-serif",
          "system-ui",
          "-apple-system",
          "BlinkMacSystemFont",
          "Segoe UI",
          "sans-serif",
        ],
        mono: [
          "JetBrains Mono",
          "SFMono-Regular",
          "Consolas",
          "ui-monospace",
          "monospace",
        ],
      },
      borderRadius: {
        brand: "1rem",
        "brand-lg": "1.5rem",
        "brand-xl": "2rem",
      },
      boxShadow: {
        brand: "0 24px 80px rgba(15, 23, 42, 0.12)",
        glow: "0 0 48px rgba(56, 189, 248, 0.24)",
        "glow-soft": "0 0 80px rgba(186, 230, 253, 0.42)",
      },
      backgroundImage: {
        "starling-radial":
          "radial-gradient(circle at top right, rgba(56,189,248,0.20), transparent 34%), radial-gradient(circle at bottom left, rgba(186,230,253,0.55), transparent 32%)",
        "hero-dark":
          "radial-gradient(circle at 70% 20%, rgba(56,189,248,0.22), transparent 30%), linear-gradient(135deg, #0B1020 0%, #111827 48%, #1E293B 100%)",
      },
    },
  },
  plugins: [],
};

export default config;
