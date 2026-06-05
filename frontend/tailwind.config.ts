import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ["var(--font-geist-sans)", "system-ui", "sans-serif"],
        mono: ["var(--font-geist-mono)", "monospace"],
      },
      colors: {
        // Token principal de marca — azul pastel
        brand: {
          50:  "#eff6fc",
          100: "#ddedf9",
          200: "#bcdaf4",
          300: "#90c1ed",
          400: "#6aa8e4",
          500: "#5b9bd5",
          600: "#4a87c3",
          700: "#386da8",
          800: "#295488",
          900: "#1c3f69",
          950: "#112849",
        },
        // Superficies neutras
        surface: {
          50:  "#f8fafc",
          100: "#f1f5f9",
          200: "#e2e8f0",
          300: "#cbd5e1",
          400: "#94a3b8",
          500: "#64748b",
          600: "#475569",
          700: "#334155",
          800: "#1e293b",
          900: "#0f172a",
          950: "#020617",
        },
        // Acento veterinario — verde salud
        vet: {
          50:  "#ecfdf5",
          100: "#d1fae5",
          200: "#a7f3d0",
          400: "#34d399",
          500: "#10b981",
          600: "#059669",
          700: "#047857",
          900: "#064e3b",
        },
        // Semánticos
        success: "#10b981",
        warning: "#f59e0b",
        danger:  "#ef4444",
      },
      borderRadius: {
        "2xl": "1rem",
        "3xl": "1.25rem",
        "4xl": "1.5rem",
      },
      boxShadow: {
        // Niveles de elevación
        "xs":       "0 1px 2px rgba(15,23,42,0.04)",
        "sm":       "0 1px 3px rgba(15,23,42,0.06), 0 2px 8px rgba(15,23,42,0.04)",
        "card":     "0 1px 3px rgba(15,23,42,0.06), 0 4px 16px rgba(15,23,42,0.06)",
        "card-hover": "0 4px 20px rgba(15,23,42,0.10), 0 1px 4px rgba(15,23,42,0.06)",
        "md":       "0 4px 16px rgba(15,23,42,0.10)",
        "lg":       "0 8px 32px rgba(15,23,42,0.12)",
        "xl":       "0 16px 48px rgba(15,23,42,0.16)",
        // Sombras con color de marca (azul pastel)
        "brand":    "0 8px 24px rgba(74,135,195,0.22)",
        "brand-sm": "0 2px 8px rgba(74,135,195,0.16)",
        // Sombra para modales
        "modal":    "0 24px 64px rgba(15,23,42,0.20)",
      },
    },
  },
  plugins: [],
};

export default config;
