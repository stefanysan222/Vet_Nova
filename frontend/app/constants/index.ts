// Shared constants for VetNova application

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