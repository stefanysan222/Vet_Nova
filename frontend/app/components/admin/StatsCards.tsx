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
      iconBg: "bg-blue-50 dark:bg-blue-500/10",
      valueCls: "text-blue-600 dark:text-blue-400",
    },
    {
      title: "Veterinarios",
      value: stats?.veterinarios,
      icon: Stethoscope,
      iconBg: "bg-emerald-50 dark:bg-emerald-500/10",
      valueCls: "text-emerald-600 dark:text-emerald-400",
    },
    {
      title: "Mascotas",
      value: stats?.mascotas,
      icon: PawPrint,
      iconBg: "bg-orange-50 dark:bg-orange-500/10",
      valueCls: "text-orange-600 dark:text-orange-400",
    },
    {
      title: "Citas hoy",
      value: stats?.citasHoy,
      icon: CalendarDays,
      iconBg: "bg-purple-50 dark:bg-purple-500/10",
      valueCls: "text-purple-600 dark:text-purple-400",
    },
    {
      title: "Pendientes",
      value: stats?.citasPendientes,
      icon: Clock,
      iconBg: "bg-rose-50 dark:bg-rose-500/10",
      valueCls: "text-rose-600 dark:text-rose-400",
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
            className="admin-card px-5 py-4 transition-all duration-200 hover:-translate-y-1 hover:shadow-card-hover"
          >
            {/* Icono */}
            <div
              className={`mb-3 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${card.iconBg}`}
            >
              <Icon className={`h-4 w-4 ${card.valueCls}`} />
            </div>

            {/* Número */}
            <p className={`text-3xl font-bold leading-none tracking-tight ${card.valueCls}`}>
              {isLoading ? (
                <span className="inline-block h-8 w-10 animate-pulse rounded-lg bg-slate-100 dark:bg-slate-800" />
              ) : (
                (card.value ?? 0)
              )}
            </p>

            {/* Label */}
            <p className="mt-1.5 text-xs font-medium text-slate-500 dark:text-slate-400">
              {card.title}
            </p>
          </motion.article>
        );
      })}
    </div>
  );
};

export default StatsCards;
