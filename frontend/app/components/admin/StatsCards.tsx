"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Users, User, Clipboard, Shield, ArrowUpRight } from "lucide-react";
import { fetchStatsAdmin } from "../../../lib/api/usuarios";

interface Stats {
  totalUsuarios: number;
  veterinarios: number;
  recepcionistas: number;
  administradores: number;
}

const StatsCards: React.FC = () => {
  const router = useRouter();
  const [stats, setStats] = useState<Stats | null>(null);

  useEffect(() => {
    fetchStatsAdmin()
      .then(setStats)
      .catch(() => setStats({ totalUsuarios: 0, veterinarios: 0, recepcionistas: 0, administradores: 0 }));
  }, []);

  const cards = [
    {
      title: "Total usuarios",
      value: stats ? String(stats.totalUsuarios) : "—",
      icon: Users,
      bgColor: "bg-blue-100",
      iconColor: "text-blue-600",
      href: "/admin/usuarios",
    },
    {
      title: "Veterinarios",
      value: stats ? String(stats.veterinarios) : "—",
      icon: User,
      bgColor: "bg-emerald-100",
      iconColor: "text-emerald-600",
      href: "/admin/veterinarios",
    },
    {
      title: "Recepcionistas",
      value: stats ? String(stats.recepcionistas) : "—",
      icon: Clipboard,
      bgColor: "bg-amber-100",
      iconColor: "text-amber-600",
    },
    {
      title: "Administradores",
      value: stats ? String(stats.administradores) : "—",
      icon: Shield,
      bgColor: "bg-rose-100",
      iconColor: "text-rose-600",
    },
  ];

  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
      {cards.map((card) => {
        const Icon = card.icon;
        const isLink = card.href !== undefined;

        return (
          <button
            key={card.title}
            type="button"
            onClick={() => { if (card.href) router.push(card.href); }}
            className={
              `group text-left rounded-3xl border border-slate-200/70 bg-white p-6 shadow-sm shadow-slate-200/40 transition hover:shadow-xl dark:border-slate-700 dark:bg-slate-900 dark:shadow-slate-900/40 ${
                isLink ? "cursor-pointer hover:border-blue-300" : "cursor-default"
              }`
            }
          >
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-slate-600">{card.title}</h3>
              <div className={`${card.bgColor} rounded-full p-3`}>
                <Icon className={`h-6 w-6 ${card.iconColor}`} />
              </div>
            </div>

            <div className="mt-4">
              <p className="text-3xl font-semibold tracking-tight text-slate-900 dark:text-white">{card.value}</p>
              {isLink && (
                <div className="mt-2 flex items-center gap-1 text-sm font-medium text-blue-600">
                  <ArrowUpRight className="h-4 w-4" />
                  Ver todos
                </div>
              )}
            </div>
          </button>
        );
      })}
    </div>
  );
};

export default StatsCards;
