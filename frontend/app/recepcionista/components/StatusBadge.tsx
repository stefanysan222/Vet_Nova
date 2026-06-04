import { AppointmentStatus, statusStyles } from "../data";

type StatusBadgeProps = {
  status: AppointmentStatus | string;
};

export function StatusBadge({ status }: StatusBadgeProps) {
  const className =
    statusStyles[status as AppointmentStatus] ??
    "border-[#e2e8f0] bg-[#f8fafc] text-[#64748b]";

  return (
    <span
      className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-black ${className}`}
    >
      {status}
    </span>
  );
}
