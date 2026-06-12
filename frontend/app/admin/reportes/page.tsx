"use client";

import { useEffect, useState, useMemo } from "react";
import { motion } from "framer-motion";
import { Users, Stethoscope, PawPrint, CalendarDays, Clock } from "lucide-react";
import { fetchStatsAdmin } from "../../../lib/api/usuarios";
import { fetchMascotas } from "../../../lib/api/mascotas";
import { fetchCitas } from "../../../lib/api/citas";
import { StatusBadge } from "../../../lib/utils/status-badge";
import type { Appointment } from "../../../lib/recepcionista/types";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

const CHART_BAR_COLORS = {
  hoy: "#7C3AED",
  pasado: "#C4B5FD",
  proximo: "#EDE9FE",
};

interface AllStats {
  clientes: number;
  veterinarios: number;
  mascotas: number;
  citasHoy: number;
  citasPendientes: number;
}

export default function ReportesPage() {
  const [stats, setStats] = useState<AllStats | null>(null);
  const [citas, setCitas] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const hoy = new Date().toISOString().slice(0, 10);
    Promise.all([fetchStatsAdmin(), fetchMascotas(), fetchCitas()])
      .then(([usuarios, mascotas, c]) => {
        setCitas(c);
        setStats({
          clientes: usuarios.clientes,
          veterinarios: usuarios.veterinarios,
          mascotas: mascotas.length,
          citasHoy: c.filter((a) => a.date === hoy && a.status !== "Cancelada").length,
          citasPendientes: c.filter((a) => a.status === "Pendiente").length,
        });
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const indicators = [
    {
      title: "Total clientes",
      value: stats?.clientes,
      icon: Users,
      iconBg: "bg-blue-50 dark:bg-blue-500/10",
      valueCls: "text-blue-600 dark:text-blue-400",
    },
    {
      title: "Total veterinarios",
      value: stats?.veterinarios,
      icon: Stethoscope,
      iconBg: "bg-emerald-50 dark:bg-emerald-500/10",
      valueCls: "text-emerald-600 dark:text-emerald-400",
    },
    {
      title: "Total mascotas",
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
      title: "Citas pendientes",
      value: stats?.citasPendientes,
      icon: Clock,
      iconBg: "bg-rose-50 dark:bg-rose-500/10",
      valueCls: "text-rose-600 dark:text-rose-400",
    },
  ];

  // Datos para la gráfica de barras — citas programadas por día (últimos 30 días + próximos 14)
  const chartData = useMemo(() => {
    const hoy = new Date();
    const desde = new Date(hoy);
    desde.setDate(hoy.getDate() - 29);
    const hasta = new Date(hoy);
    hasta.setDate(hoy.getDate() + 14);

    // Generar rango de fechas
    const fechas: string[] = [];
    const cur = new Date(desde);
    while (cur <= hasta) {
      fechas.push(cur.toISOString().slice(0, 10));
      cur.setDate(cur.getDate() + 1);
    }

    // Contar citas por fecha (excluyendo canceladas)
    const conteo: Record<string, number> = {};
    citas
      .filter((c) => c.status !== "Cancelada")
      .forEach((c) => {
        if (c.date) conteo[c.date] = (conteo[c.date] ?? 0) + 1;
      });

    const todayStr = hoy.toISOString().slice(0, 10);
    const fechasConDatos = fechas.filter((f) => conteo[f] || f === todayStr);

    return fechasConDatos.map((f) => {
      const [, m, d] = f.split("-");
      const valor = conteo[f] ?? 0;
      return {
        date: `${d}/${m}`,
        hoy: f === todayStr ? valor : 0,
        pasado: f < todayStr ? valor : 0,
        proximo: f > todayStr ? valor : 0,
      };
    });
  }, [citas]);

  // Distribución de citas por estado
  const pendientes = citas.filter((c) => c.status === "Pendiente").length;
  const confirmadas = citas.filter((c) => c.status === "Confirmada").length;
  const finalizadas = citas.filter((c) => c.status === "Finalizada").length;
  const canceladas = citas.filter((c) => c.status === "Cancelada").length;
  const otras = citas.length - pendientes - confirmadas - finalizadas - canceladas;
  const total = citas.length || 1;

  const distribucion = [
    {
      label: "Pendientes",
      valor: pendientes,
      color: "bg-accent-400",
      text: "text-accent-700 dark:text-accent-300",
    },
    {
      label: "Confirmadas",
      valor: confirmadas,
      color: "bg-success-400",
      text: "text-success-700 dark:text-success-300",
    },
    {
      label: "Finalizadas",
      valor: finalizadas,
      color: "bg-brand-400",
      text: "text-brand-700 dark:text-brand-300",
    },
    {
      label: "Canceladas",
      valor: canceladas,
      color: "bg-danger-400",
      text: "text-danger-700 dark:text-danger-300",
    },
    {
      label: "Otras",
      valor: otras,
      color: "bg-surface-300",
      text: "text-surface-600 dark:text-surface-400",
    },
  ].filter((d) => d.valor > 0);

  return (
    <div className="admin-page">
      <section className="admin-card-padded">
        {/* Header */}
        <div>
          <p className="text-eyebrow">Reportes</p>
          <h1 className="text-page-title mt-2">Resumen del sistema</h1>
          <p className="text-subtitle mt-1">
            Indicadores en tiempo real obtenidos de la base de datos.
          </p>
        </div>

        {/* Indicadores */}
        <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
          {indicators.map((ind, i) => {
            const Icon = ind.icon;
            return (
              <motion.article
                key={ind.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: i * 0.07, ease: "easeOut" }}
                className="admin-card px-5 py-4 transition-all duration-200 hover:-translate-y-1 hover:shadow-card-hover"
              >
                <div
                  className={`mb-3 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${ind.iconBg}`}
                >
                  <Icon className={`h-4 w-4 ${ind.valueCls}`} />
                </div>
                <p className={`text-3xl font-bold leading-none tracking-tight ${ind.valueCls}`}>
                  {loading ? (
                    <span className="inline-block h-8 w-10 animate-pulse rounded-lg bg-slate-100 dark:bg-slate-800" />
                  ) : (
                    (ind.value ?? 0)
                  )}
                </p>
                <p className="mt-1.5 text-xs font-medium text-slate-500 dark:text-slate-400">
                  {ind.title}
                </p>
              </motion.article>
            );
          })}
        </div>

        {/* Gráfica de barras — citas programadas */}
        {!loading && citas.length > 0 && (
          <div className="mt-8">
            <div className="mb-1">
              <h2 className="text-section-title">Citas programadas por día</h2>
              <p className="mt-0.5 text-xs text-slate-400">Últimos 30 días y próximos 14</p>
            </div>
            <div className="mb-3 mt-3 flex items-center gap-4">
              <span className="flex items-center gap-1.5 text-[11px] text-slate-500 dark:text-slate-400">
                <span
                  className="inline-block h-2 w-2 rounded-full"
                  style={{ background: CHART_BAR_COLORS.hoy }}
                />
                Hoy
              </span>
              <span className="flex items-center gap-1.5 text-[11px] text-slate-500 dark:text-slate-400">
                <span
                  className="inline-block h-2 w-2 rounded-full"
                  style={{ background: CHART_BAR_COLORS.pasado }}
                />
                Pasado
              </span>
              <span className="flex items-center gap-1.5 text-[11px] text-slate-500 dark:text-slate-400">
                <span
                  className="inline-block h-2 w-2 rounded-full"
                  style={{ background: CHART_BAR_COLORS.proximo }}
                />
                Próximo
              </span>
            </div>
            <div className="h-60 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} barSize={22} barGap={4}>
                  <CartesianGrid vertical={false} stroke="var(--color-border)" />
                  <XAxis
                    dataKey="date"
                    tick={{ fontSize: 10, fill: "var(--color-muted)" }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis
                    tick={{ fontSize: 10, fill: "var(--color-muted)" }}
                    axisLine={false}
                    tickLine={false}
                    allowDecimals={false}
                  />
                  <Tooltip
                    cursor={{ fill: "transparent" }}
                    contentStyle={{
                      background: "var(--color-surface)",
                      border: "1px solid var(--color-border)",
                      borderRadius: 10,
                      fontSize: 12,
                      color: "var(--color-text)",
                    }}
                    formatter={(value) => [`${value} cita${Number(value) !== 1 ? "s" : ""}`, ""]}
                  />
                  <Bar
                    dataKey="hoy"
                    stackId="citas"
                    fill={CHART_BAR_COLORS.hoy}
                    radius={[6, 6, 6, 6]}
                  />
                  <Bar
                    dataKey="pasado"
                    stackId="citas"
                    fill={CHART_BAR_COLORS.pasado}
                    radius={[6, 6, 6, 6]}
                  />
                  <Bar
                    dataKey="proximo"
                    stackId="citas"
                    fill={CHART_BAR_COLORS.proximo}
                    radius={[6, 6, 6, 6]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {/* Distribución de citas */}
        {!loading && citas.length > 0 && (
          <div className="mt-8">
            <h2 className="mb-4 text-base font-semibold text-slate-900 dark:text-white">
              Distribución de citas por estado
            </h2>

            {/* Barra */}
            <div className="flex h-3 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
              {distribucion.map((d) => (
                <div
                  key={d.label}
                  className={`${d.color} transition-all`}
                  style={{ width: `${(d.valor / total) * 100}%` }}
                />
              ))}
            </div>

            {/* Leyenda */}
            <div className="mt-4 flex flex-wrap gap-x-6 gap-y-2">
              {distribucion.map((d) => (
                <div key={d.label} className="flex items-center gap-2 text-sm">
                  <span className={`h-2.5 w-2.5 rounded-full ${d.color}`} />
                  <span className="text-slate-500 dark:text-slate-400">{d.label}</span>
                  <span className={`font-semibold ${d.text}`}>{d.valor}</span>
                  <span className="text-slate-400">({Math.round((d.valor / total) * 100)}%)</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Citas recientes */}
        {!loading && citas.length > 0 && (
          <div className="mt-8">
            <h2 className="mb-3 text-base font-semibold text-slate-900 dark:text-white">
              Últimas citas registradas
            </h2>
            <div className="space-y-2">
              {citas.slice(0, 6).map((c) => {
                return (
                  <div
                    key={c.id}
                    className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-100 bg-slate-50 px-4 py-3 dark:border-slate-800 dark:bg-slate-800/50"
                  >
                    <div className="min-w-0">
                      <p className="font-medium text-slate-900 dark:text-white">{c.petName}</p>
                      <p className="text-xs text-slate-400">
                        {c.date} · {c.time || "—"} · {c.service || "—"}
                      </p>
                    </div>
                    <StatusBadge status={c.status} />
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
