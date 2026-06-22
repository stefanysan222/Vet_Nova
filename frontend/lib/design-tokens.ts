// Fuente única de verdad de los design tokens de VetNova en valores crudos (JS/TS).
//
// Estos valores DEBEN coincidir exactamente con frontend/tailwind.config.ts.
// Úsalo solo cuando se necesite el valor crudo en JS (gráficas Chart.js/Recharts,
// mapas de color por estado de cita/cliente, canvas, etc.). Para JSX/Tailwind,
// sigue usando las clases utilitarias (bg-brand-600, shadow-card, etc.), NO este archivo.

export const colors = {
  brand: {
    50: "#EEF0FE",
    100: "#E0E7FF",
    200: "#C7D2FE",
    300: "#A5B4FC",
    400: "#818CF8",
    500: "#6366F1",
    600: "#5457E5",
    700: "#4347C9",
    800: "#3739A3",
    900: "#2D2F82",
    950: "#1B1C50",
  },
  accent: {
    50: "#FFF1F2",
    100: "#FFE4E6",
    200: "#FECDD3",
    300: "#FDA4AF",
    400: "#FB8FA0",
    500: "#FB7185",
    600: "#F43F5E",
    700: "#E11D48",
    800: "#BE123C",
    900: "#9F1239",
    950: "#4C0519",
  },
  surface: {
    50: "#F8F8FC",
    100: "#F1F1F8",
    200: "#E4E4F0",
    300: "#CBCBE0",
    400: "#9D9DBE",
    500: "#71719C",
    600: "#54547A",
    700: "#3D3D5C",
    800: "#25253D",
    900: "#15152B",
    950: "#0F172A",
  },
  success: {
    50: "#ECFDF5",
    100: "#D1FAE5",
    200: "#A7F3D0",
    300: "#6EE7B7",
    400: "#34D399",
    500: "#10B981",
    600: "#059669",
    700: "#047857",
    800: "#065F46",
    900: "#064E3B",
  },
  warning: {
    50: "#FFFBEB",
    100: "#FEF3C7",
    200: "#FDE68A",
    300: "#FCD34D",
    400: "#FBBF24",
    500: "#F59E0B",
    600: "#D97706",
    700: "#B45309",
    800: "#92400E",
    900: "#78350F",
  },
  danger: {
    50: "#FEF2F2",
    100: "#FEE2E2",
    200: "#FECACA",
    300: "#FCA5A5",
    400: "#F87171",
    500: "#EF4444",
    600: "#DC2626",
    700: "#B91C1C",
    800: "#991B1B",
    900: "#7F1D1D",
  },
} as const;

export const radius = {
  "2xl": "1rem",
  "3xl": "1.25rem",
  "4xl": "1.5rem",
} as const;

export const shadows = {
  xs: "0 1px 2px rgba(15,23,42,0.04)",
  sm: "0 1px 3px rgba(15,23,42,0.05), 0 2px 6px rgba(15,23,42,0.04)",
  card: "0 1px 2px rgba(15,23,42,0.04), 0 8px 24px rgba(99,102,241,0.06)",
  cardHover: "0 4px 16px rgba(99,102,241,0.10), 0 1px 4px rgba(15,23,42,0.05)",
  md: "0 6px 20px rgba(15,23,42,0.08)",
  lg: "0 12px 32px rgba(15,23,42,0.10)",
  xl: "0 20px 50px rgba(15,23,42,0.14)",
  brand: "0 10px 28px rgba(99,102,241,0.25)",
  brandSm: "0 2px 10px rgba(99,102,241,0.18)",
  modal: "0 24px 64px rgba(15,23,42,0.18)",
} as const;

// Breakpoints estándar de Tailwind (sin overrides en tailwind.config.ts).
export const breakpoints = {
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
  "2xl": 1536,
} as const;

// Mapa de color por estado de cita — útil para gráficas (Recharts/Chart.js)
// donde no se pueden usar clases Tailwind. Mantener en sync con
// frontend/lib/utils/status.ts (que define las clases para JSX).
export const statusColors: Record<string, string> = {
  Pendiente: colors.warning[500],
  "Pendiente de confirmación": colors.warning[500],
  Confirmada: colors.success[500],
  "En espera": "#3B82F6",
  "En atención": "#3B82F6",
  "En proceso": "#3B82F6",
  Finalizada: colors.surface[400],
  Completada: colors.surface[400],
  Atendida: colors.surface[400],
  Cancelada: colors.danger[500],
  "No asistió": colors.danger[500],
  Reprogramada: "#A855F7",
};

export const designTokens = { colors, radius, shadows, breakpoints, statusColors } as const;

export default designTokens;
