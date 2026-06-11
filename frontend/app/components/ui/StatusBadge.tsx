const STATUS_STYLES: Record<string, string> = {
  // Citas
  Confirmada: "bg-brand-100 text-brand-600",
  Pendiente: "bg-accent-100 text-accent-700",
  Cancelada: "bg-danger-50 text-danger-600",
  Completada: "bg-success-100 text-success-700",
  Atendida: "bg-success-100 text-success-700",
  "En curso": "bg-warning-100 text-warning-700",
  "En proceso": "bg-warning-100 text-warning-700",

  // Estados generales
  Activa: "bg-success-100 text-success-700",
  Activo: "bg-success-100 text-success-700",
  Inactiva: "bg-surface-200 text-surface-600",
  Inactivo: "bg-surface-200 text-surface-600",

  // Vacunas
  "Vacuna al día": "bg-success-100 text-success-700",
  "Al día": "bg-success-100 text-success-700",
  Vigente: "bg-success-100 text-success-700",
  "Vacuna próxima": "bg-warning-100 text-warning-700",
  "Por vencer": "bg-warning-100 text-warning-700",
  Próxima: "bg-warning-100 text-warning-700",
  "Vacuna vencida": "bg-danger-100 text-danger-700",
  Vencida: "bg-danger-100 text-danger-700",

  // Urgencia
  Urgente: "bg-accent-100 text-accent-700",
  Prioritaria: "bg-accent-100 text-accent-700",
};

const DEFAULT_STYLE = "bg-surface-200 text-surface-600";

interface StatusBadgeProps {
  status: string;
  className?: string;
}

export default function StatusBadge({ status, className = "" }: StatusBadgeProps) {
  const style = STATUS_STYLES[status] ?? DEFAULT_STYLE;

  return (
    <span
      className={`inline-flex items-center gap-1 rounded-lg px-2.5 py-1 text-xs font-semibold ${style} ${className}`}
    >
      {status}
    </span>
  );
}
