// Shared constants for VetNova application

// Landing page styles (used by Button, Hero, Stats, Services components)
export const LANDING_STYLES = {
  button: {
    primary:
      "inline-flex items-center justify-center rounded-3xl bg-blue-600 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-500/10 transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60",
    secondary:
      "inline-flex items-center justify-center rounded-3xl border border-slate-200 bg-white px-6 py-3 text-sm font-semibold text-slate-900 shadow-sm transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-60",
  },
  section: "mx-auto max-w-6xl px-5 py-16 sm:px-6 lg:px-8",
  container: "mx-auto max-w-7xl px-5 sm:px-6 lg:px-8",
  text: {
    caption: "text-sm font-semibold uppercase tracking-[0.28em] text-blue-600",
    heading: "mt-4 text-3xl font-semibold tracking-tight text-slate-900 sm:text-4xl",
    subheading: "mt-6 text-xl font-semibold text-slate-900",
    body: "mt-3 text-sm leading-7 text-slate-600",
  },
} as const;

// Colors
export const COLORS = {
  primary: {
    50: 'blue-50',
    100: 'blue-100',
    200: 'blue-200',
    600: 'blue-600',
    700: 'blue-700',
  },
  gray: {
    50: 'gray-50',
    100: 'gray-100',
    200: 'gray-200',
    500: 'gray-500',
    600: 'gray-600',
    900: 'gray-900',
  },
  white: 'white',
} as const;

// Common styles
export const COMMON_STYLES = {
  container: "mx-auto max-w-7xl px-6 sm:px-8 lg:px-12",
  section: "mt-20",
  card: "rounded-[2rem] border border-gray-200/80 bg-white shadow-lg shadow-gray-200/50 transition hover:shadow-xl hover:shadow-gray-200/40",
  button: {
    primary: "inline-flex items-center justify-center rounded-full bg-blue-600 px-7 py-3 text-sm font-semibold text-white transition hover:bg-blue-700",
    secondary: "inline-flex items-center justify-center rounded-full border border-gray-300 bg-white px-7 py-3 text-sm font-semibold text-gray-900 transition hover:border-gray-400 hover:bg-gray-50",
  },
  text: {
    heading: "text-3xl font-semibold tracking-tight text-gray-900 sm:text-4xl",
    subheading: "text-xl font-semibold text-gray-900",
    body: "text-gray-600",
    caption: "text-sm uppercase tracking-[0.3em] text-blue-600",
  },
} as const;