import { getStatusStyle, type AppointmentStatus } from "./status";

export function StatusBadge({
  status,
  className = "",
}: {
  status: AppointmentStatus;
  className?: string;
}) {
  const s = getStatusStyle(status);
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-semibold ${s.badge} ${className}`}
    >
      <span className={`h-1.5 w-1.5 shrink-0 rounded-full ${s.dot}`} />
      {s.label || status}
    </span>
  );
}
