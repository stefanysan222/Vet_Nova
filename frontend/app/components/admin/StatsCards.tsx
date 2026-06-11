"use client";

import { useEffect, useState } from "react";
import { Users, Stethoscope, PawPrint, CalendarDays, Clock } from "lucide-react";
import { motion } from "framer-motion";
import { fetchStatsAdmin } from "../../../lib/api/usuarios";
import { fetchMascotas } from "../../../lib/api/mascotas";
import { fetchCitas } from "../../../lib/api/citas";

interface AllStats {
  clientes: number;
  veterinarios: number;
  mascotas: number;
  citasHoy: number;
  citasPendientes: number;
}

const StatsCards: React.FC<{ refreshTrigger?: number }> = ({ refreshTrigger = 0 }) => {
  const [stats, setStats] = useState<AllStats | null>(null);

  useEffect(() => {
    const hoy = new Date().toISOString().slice(0, 10);
    Promise.all([fetchStatsAdmin(), fetchMascotas(), fetchCitas()])
      .then(([usuarios, mascotas, citas]) => {
        setStats({
          clientes: usuarios.clientes,
          veterinarios: usuarios.veterinarios,
          mascotas: mascotas.length,
          citasHoy: citas.filter((c) => c.date === hoy && c.status !== "Cancelada").length,
          citasPendientes: citas.filter((c) => c.status === "Pendiente").length,
        });
      })
      .catch(() =>
        setStats({ clientes: 0, veterinarios: 0, mascotas: 0, citasHoy: 0, citasPendientes: 0 }),
      );
  }, [refreshTrigger]);

  const cards = [
    {
      title: "Total clientes",
      value: stats?.clientes,
      icon: Users,
      accentBar: "bg-brand-500",
      iconBg: "bg-brand-50 text-brand-600 dark:bg-brand-950/50 dark:text-brand-400",
      valueCls: "text-brand-700 dark:text-brand-300",
    },
    {
      title: "Veterinarios",
      value: stats?.veterinarios,
      icon: Stethoscope,
      accentBar: "bg-success-500",
      iconBg: "bg-success-50 text-success-600 dark:bg-success-950/50 dark:text-success-400",
      valueCls: "text-success-700 dark:text-success-300",
    },
    {
      title: "Mascotas",
      value: stats?.mascotas,
      icon: PawPrint,
      accentBar: "bg-warning-500",
      iconBg: "bg-warning-50 text-warning-600 dark:bg-warning-950/50 dark:text-warning-400",
      valueCls: "text-warning-700 dark:text-warning-300",
    },
    {
      title: "Citas hoy",
      value: stats?.citasHoy,
      icon: CalendarDays,
      accentBar: "bg-brand-400",
      iconBg: "bg-brand-50 text-brand-500 dark:bg-brand-950/50 dark:text-brand-300",
      valueCls: "text-brand-600 dark:text-brand-200",
    },
    {
      title: "Pendientes",
      value: stats?.citasPendientes,
      icon: Clock,
      accentBar: "bg-accent-500",
      iconBg: "bg-accent-50 text-accent-600 dark:bg-accent-950/50 dark:text-accent-400",
      valueCls: "text-accent-700 dark:text-accent-300",
    },
  ];

  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
      {cards.map((card, i) => {
        const Icon = card.icon;
        const isLoading = stats === null;
        return (
          <motion.article
            key={card.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: i * 0.07 }}
            className="group relative overflow-hidden rounded-2xl border border-slate-200/70 bg-white shadow-sm transition-all duration-200 hover:-translate-y-1 hover:shadow-md dark:border-slate-700 dark:bg-slate-900"
          >
            {/* Borde de acento izquierdo */}
            <div className={`absolute inset-y-0 left-0 w-1 rounded-l-2xl ${card.accentBar}`} />

            <div className="px-5 py-4 pl-6">
              {/* Icono + valor en la misma fila */}
              <div className="flex items-start justify-between gap-2">
                <div
                  className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${card.iconBg}`}
                >
                  <Icon className="h-4 w-4" />
                </div>
              </div>

              {/* Número */}
              <p className={`mt-3 text-3xl font-bold tracking-tight ${card.valueCls}`}>
                {isLoading ? (
                  <span className="inline-block h-8 w-10 animate-pulse rounded-lg bg-slate-100 dark:bg-slate-800" />
                ) : (
                  (card.value ?? 0)
                )}
              </p>

              {/* Label */}
              <p className="mt-1 text-xs font-medium text-slate-500 dark:text-slate-400">
                {card.title}
              </p>
            </div>
          </motion.article>
        );
      })}
    </div>
  );
};

export default StatsCards;
