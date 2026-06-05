// Colores de estado unificados para los tres roles — admin, cliente, veterinario

export type AppointmentStatus =
  | "Pendiente"
  | "Confirmada"
  | "En espera"
  | "En atención"
  | "Finalizada"
  | "Cancelada"
  | "No asistió"
  | "Reprogramada"
  | string;

interface StatusStyle {
  badge: string;   // clases para badge
  dot: string;     // color del punto
  label: string;   // etiqueta en español
}

const STATUS_MAP: Record<string, StatusStyle> = {
  Pendiente: {
    badge: "bg-amber-50 text-amber-700 border border-amber-200 dark:bg-amber-950/40 dark:text-amber-400 dark:border-amber-800",
    dot:   "bg-amber-500",
    label: "Pendiente",
  },
  "Pendiente de confirmación": {
    badge: "bg-amber-50 text-amber-700 border border-amber-200 dark:bg-amber-950/40 dark:text-amber-400 dark:border-amber-800",
    dot:   "bg-amber-500",
    label: "Pendiente de confirmación",
  },
  Confirmada: {
    badge: "bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-800",
    dot:   "bg-emerald-500",
    label: "Confirmada",
  },
  "En espera": {
    badge: "bg-blue-50 text-blue-700 border border-blue-200 dark:bg-blue-950/40 dark:text-blue-400 dark:border-blue-800",
    dot:   "bg-blue-500",
    label: "En espera",
  },
  "En atención": {
    badge: "bg-blue-50 text-blue-700 border border-blue-200 dark:bg-blue-950/40 dark:text-blue-400 dark:border-blue-800",
    dot:   "bg-blue-500",
    label: "En atención",
  },
  "En proceso": {
    badge: "bg-blue-50 text-blue-700 border border-blue-200 dark:bg-blue-950/40 dark:text-blue-400 dark:border-blue-800",
    dot:   "bg-blue-500",
    label: "En proceso",
  },
  Finalizada: {
    badge: "bg-slate-100 text-slate-600 border border-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700",
    dot:   "bg-slate-400",
    label: "Finalizada",
  },
  Completada: {
    badge: "bg-slate-100 text-slate-600 border border-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700",
    dot:   "bg-slate-400",
    label: "Completada",
  },
  Atendida: {
    badge: "bg-slate-100 text-slate-600 border border-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700",
    dot:   "bg-slate-400",
    label: "Atendida",
  },
  Cancelada: {
    badge: "bg-red-50 text-red-700 border border-red-200 dark:bg-red-950/40 dark:text-red-400 dark:border-red-800",
    dot:   "bg-red-500",
    label: "Cancelada",
  },
  "No asistió": {
    badge: "bg-red-50 text-red-700 border border-red-200 dark:bg-red-950/40 dark:text-red-400 dark:border-red-800",
    dot:   "bg-red-500",
    label: "No asistió",
  },
  Reprogramada: {
    badge: "bg-purple-50 text-purple-700 border border-purple-200 dark:bg-purple-950/40 dark:text-purple-400 dark:border-purple-800",
    dot:   "bg-purple-500",
    label: "Reprogramada",
  },
};

const FALLBACK: StatusStyle = {
  badge: "bg-slate-100 text-slate-600 border border-slate-200 dark:bg-slate-800 dark:text-slate-400",
  dot:   "bg-slate-400",
  label: "Desconocido",
};

export function getStatusStyle(status: AppointmentStatus): StatusStyle {
  return STATUS_MAP[status] ?? FALLBACK;
}

// Nota: este archivo es .ts puro — el componente React vive en status-badge.tsx
export function statusBadgeClasses(status: AppointmentStatus, className = "") {
  const s = getStatusStyle(status);
  return `inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ${s.badge} ${className}`;
}
