import { LucideIcon } from "lucide-react";

type StatCardProps = {
  title: string;
  value: string;
  detail: string;
  icon: LucideIcon;
  iconClass?: string;
};

export function StatCard({
  title,
  value,
  detail,
  icon: Icon,
  iconClass = "bg-[#eff6ff] text-[#2563eb]",
}: StatCardProps) {
  return (
    <article className="rounded-[20px] border border-[#e2e8f0] bg-white p-5 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-[#bfdbfe] hover:shadow-md">
      <div className="mb-4 flex items-center justify-between">
        <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${iconClass}`}>
          <Icon className="h-6 w-6" />
        </div>
      </div>

      <p className="text-sm font-bold text-[#64748b]">{title}</p>
      <h3 className="mt-2 text-3xl font-black text-[#1e293b]">{value}</h3>
      <p className="mt-1 text-xs font-semibold text-[#64748b]">{detail}</p>
    </article>
  );
}
