"use client";

import { useRouter } from "next/navigation";
import React from "react";
import { Users, User, Clipboard, Shield, TrendingUp, TrendingDown, ArrowUpRight } from "lucide-react";

const StatsCards: React.FC = () => {
  const router = useRouter();
  const stats = [
    {
      title: "Total usuarios",
      value: "120",
      change: "+15%",
      icon: Users,
      bgColor: "bg-blue-100",
      iconColor: "text-blue-600",
      positive: true,
      href: "/admin/usuarios",
    },
    {
      title: "Veterinarios",
      value: "8",
      change: "+5%",
      icon: User,
      bgColor: "bg-emerald-100",
      iconColor: "text-emerald-600",
      positive: true,
      href: "/admin/veterinarios",
    },
    {
      title: "Recepcionistas",
      value: "5",
      change: "-2%",
      icon: Clipboard,
      bgColor: "bg-amber-100",
      iconColor: "text-amber-600",
      positive: false,
    },
    {
      title: "Administradores",
      value: "2",
      change: "-5%",
      icon: Shield,
      bgColor: "bg-rose-100",
      iconColor: "text-rose-600",
      positive: false,
    },
  ];

  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
      {stats.map((stat) => {
        const Icon = stat.icon;
        const isLink = stat.href !== undefined;

        return (
          <button
            key={stat.title}
            type="button"
            onClick={() => {
              if (stat.href) router.push(stat.href);
            }}
            className={
              `group text-left rounded-3xl border border-slate-200/70 bg-white p-6 shadow-sm shadow-slate-200/40 transition hover:shadow-xl dark:border-slate-700 dark:bg-slate-900 dark:shadow-slate-900/40 ${
                isLink ? "cursor-pointer hover:border-blue-300" : "cursor-default"
              }`
            }
          >
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-slate-600">{stat.title}</h3>
              <div className={`${stat.bgColor} rounded-full p-3`}>
                <Icon className={`h-6 w-6 ${stat.iconColor}`} />
              </div>
            </div>

            <div className="mt-4">
              <p className="text-3xl font-semibold tracking-tight text-slate-900">{stat.value}</p>
              <div className={`mt-2 flex items-center gap-2 text-sm font-medium ${stat.positive ? "text-emerald-600" : "text-rose-600"}`}>
                <ArrowUpRight className={`h-4 w-4 ${!stat.positive ? "rotate-180" : ""}`} />
                {stat.change} desde el mes pasado
              </div>
            </div>
          </button>
        );
      })}
    </div>
  );
};

export default StatsCards;