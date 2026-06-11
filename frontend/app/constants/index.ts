// Shared design constants — VetNova

export const LANDING_STYLES = {
  button: {
    primary:
      "inline-flex items-center justify-center rounded-xl bg-brand-600 px-6 py-3 text-sm font-semibold text-white shadow-brand transition hover:bg-brand-700 disabled:cursor-not-allowed disabled:opacity-60",
    secondary:
      "inline-flex items-center justify-center rounded-xl border border-surface-200 bg-white px-6 py-3 text-sm font-semibold text-surface-900 shadow-card transition hover:bg-surface-50 disabled:cursor-not-allowed disabled:opacity-60",
  },
  section: "mx-auto max-w-6xl px-5 py-16 sm:px-6 lg:px-8",
  container: "mx-auto max-w-7xl px-5 sm:px-6 lg:px-8",
  text: {
    caption: "text-sm font-semibold uppercase tracking-[0.28em] text-brand-600",
    heading: "mt-4 text-3xl font-semibold tracking-tight text-surface-900 sm:text-4xl",
    subheading: "mt-5 text-lg font-semibold text-surface-900",
    body: "mt-3 text-sm leading-7 text-surface-500",
  },
} as const;

export const COMMON_STYLES = {
  container: "mx-auto max-w-7xl px-6 sm:px-8 lg:px-12",
  section: "mt-20",
  card: "rounded-2xl border border-surface-200 bg-white shadow-card transition hover:shadow-card-hover",
  button: {
    primary:
      "inline-flex items-center justify-center rounded-xl bg-brand-600 px-7 py-3 text-sm font-semibold text-white transition hover:bg-brand-700",
    secondary:
      "inline-flex items-center justify-center rounded-xl border border-surface-200 bg-white px-7 py-3 text-sm font-semibold text-surface-900 transition hover:bg-surface-50",
  },
  text: {
    heading: "text-3xl font-semibold tracking-tight text-surface-900 sm:text-4xl",
    subheading: "text-lg font-semibold text-surface-900",
    body: "text-surface-500",
    caption: "text-sm uppercase tracking-[0.3em] text-brand-600",
  },
} as const;
