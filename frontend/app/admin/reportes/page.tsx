"use client";

import { useEffect, useState, useMemo } from "react";
import { motion } from "framer-motion";
import { Users, Stethoscope, PawPrint, CalendarDays, Clock } from "lucide-react";
import { fetchStatsAdmin } from "../../../lib/api/usuarios";
import { fetchMascotas } from "../../../lib/api/mascotas";
import { fetchCitas } from "../../../lib/api/citas";
import { StatusBadge } from "../../../lib/utils/status-badge";
import type { Appointment } from "../../../lib/recepcionista/types";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Tooltip,
  Legend,
} from "chart.js";
import { Bar } from "react-chartjs-2";

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip, Legend);

const valueLabelsPlugin = {
  id: "valueLabels",
  afterDatasetsDraw(chart: ChartJS) {
    const { ctx } = chart;
    const meta = chart.getDatasetMeta(0);
    meta.data.forEach((bar, i) => {
      const value = chart.data.datasets[0].data[i] as number;
      if (value > 0) {
        ctx.save();
        ctx.fillStyle = "#475569";
        ctx.font = "bold 11px system-ui, sans-serif";
        ctx.textAlign = "center";
        ctx.textBaseline = "bottom";
        ctx.fillText(String(value), bar.x, bar.y - 4);
        ctx.restore();
      }
    });
  },
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
      accent: "bg-brand-50 text-brand-600 dark:bg-brand-950/40 dark:text-brand-400",
      accentBar: "bg-brand-500",
      border: "border-brand-100 dark:border-brand-900/40",
    },
    {
      title: "Total veterinarios",
      value: stats?.veterinarios,
      icon: Stethoscope,
      accent: "bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400",
      accentBar: "bg-emerald-500",
      border: "border-emerald-100 dark:border-emerald-900/40",
    },
    {
      title: "Total mascotas",
      value: stats?.mascotas,
      icon: PawPrint,
      accent: "bg-amber-50 text-amber-600 dark:bg-amber-950/40 dark:text-amber-400",
      accentBar: "bg-amber-500",
      border: "border-amber-100 dark:border-amber-900/40",
    },
    {
      title: "Citas hoy",
      value: stats?.citasHoy,
      icon: CalendarDays,
      accent: "bg-violet-50 text-violet-600 dark:bg-violet-950/40 dark:text-violet-400",
      accentBar: "bg-violet-500",
      border: "border-violet-100 dark:border-violet-900/40",
    },
    {
      title: "Citas pendientes",
      value: stats?.citasPendientes,
      icon: Clock,
      accent: "bg-rose-50 text-rose-600 dark:bg-rose-950/40 dark:text-rose-400",
      accentBar: "bg-rose-500",
      border: "border-rose-100 dark:border-rose-900/40",
    },
  ];

  // Datos para la gráfica de barras — citas programadas por día (últimos 30 días + próximos 14)
  const chartData = useMemo(() => {
    const hoy = new Date();
    const desde = new Date(hoy); desde.setDate(hoy.getDate() - 29);
    const hasta = new Date(hoy); hasta.setDate(hoy.getDate() + 14);

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
      .forEach((c) => { if (c.date) conteo[c.date] = (conteo[c.date] ?? 0) + 1; });

    // Filtrar solo fechas que tienen citas o son hoy
    const todayStr = hoy.toISOString().slice(0, 10);
    const fechasConDatos = fechas.filter((f) => conteo[f] || f === todayStr);

    const labels = fechasConDatos.map((f) => {
      const [, m, d] = f.split("-");
      return `${d}/${m}`;
    });

    const todayIndex = fechasConDatos.indexOf(todayStr);
    const backgroundColors = fechasConDatos.map((f) =>
      f === todayStr ? "#4a87c3" : f < todayStr ? "#90c1ed" : "#bcdaf4"
    );

    return {
      labels,
      todayIndex,
      datasets: [{
        label: "Citas",
        data: fechasConDatos.map((f) => conteo[f] ?? 0),
        backgroundColor: backgroundColors,
        borderRadius: 6,
        borderSkipped: false,
      }],
    };
  }, [citas]);

  // Distribución de citas por estado
  const pendientes  = citas.filter((c) => c.status === "Pendiente").length;
  const confirmadas = citas.filter((c) => c.status === "Confirmada").length;
  const finalizadas = citas.filter((c) => c.status === "Finalizada").length;
  const canceladas  = citas.filter((c) => c.status === "Cancelada").length;
  const otras       = citas.length - pendientes - confirmadas - finalizadas - canceladas;
  const total       = citas.length || 1;

  const distribucion = [
    { label: "Pendientes",  valor: pendientes,  color: "bg-amber-400",   text: "text-amber-700 dark:text-amber-300" },
    { label: "Confirmadas", valor: confirmadas, color: "bg-emerald-400", text: "text-emerald-700 dark:text-emerald-300" },
    { label: "Finalizadas", valor: finalizadas, color: "bg-brand-400",    text: "text-brand-700 dark:text-brand-300" },
    { label: "Canceladas",  valor: canceladas,  color: "bg-rose-400",    text: "text-rose-700 dark:text-rose-300" },
    { label: "Otras",       valor: otras,       color: "bg-slate-300",   text: "text-slate-600 dark:text-slate-400" },
  ].filter((d) => d.valor > 0);

  return (
    <div className="px-5 pb-12 pt-6 sm:px-6 lg:px-10">
      <section className="rounded-2xl border border-slate-200/60 bg-white p-6 shadow-card dark:border-slate-700 dark:bg-slate-900">

        {/* Header */}
        <div>
          <p className="text-eyebrow">Reportes</p>
          <h1 className="mt-2 text-page-title">Resumen del sistema</h1>
          <p className="mt-1 text-subtitle">
            Indicadores en tiempo real obtenidos de la base de datos.
          </p>
        </div>

        {/* Indicadores */}
        <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
          {indicators.map((ind, i) => {
            const Icon = ind.icon;
            return (
              <motion.article
                key={ind.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: i * 0.07, ease: "easeOut" }}
                className={`relative overflow-hidden rounded-2xl border ${ind.border} bg-white shadow-sm transition-all duration-200 hover:-translate-y-1 hover:shadow-md dark:bg-slate-800/50`}
              >
                <div className={`absolute inset-y-0 left-0 w-1 rounded-l-2xl ${ind.accentBar}`} />
                <div className="px-5 py-4 pl-6">
                  <div className={`mb-3 inline-flex h-9 w-9 items-center justify-center rounded-xl ${ind.accent}`}>
                    <Icon className="h-4 w-4" />
                  </div>
                  <p className="mt-1 text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
                    {loading ? (
                      <span className="inline-block h-8 w-10 animate-pulse rounded-lg bg-slate-100 dark:bg-slate-800" />
                    ) : (ind.value ?? 0)}
                  </p>
                  <p className="mt-1 text-xs font-medium text-slate-500 dark:text-slate-400">{ind.title}</p>
                </div>
              </motion.article>
            );
          })}
        </div>

        {/* Gráfica de barras — citas programadas */}
        {!loading && citas.length > 0 && (
          <div className="mt-8">
            <div className="mb-4">
              <h2 className="text-base font-semibold text-slate-900 dark:text-white">
                Citas programadas por día
              </h2>
              <p className="mt-0.5 text-xs text-slate-400 dark:text-slate-500">
                Últimos 30 días y próximos 14 ·{" "}
                <span className="inline-flex items-center gap-1">
                  <span className="inline-block h-2 w-2 rounded-sm bg-brand-600" /> Hoy
                </span>{" "}
                <span className="inline-flex items-center gap-1 ml-3">
                  <span className="inline-block h-2 w-2 rounded-sm bg-brand-300" /> Pasado
                </span>{" "}
                <span className="inline-flex items-center gap-1 ml-3">
                  <span className="inline-block h-2 w-2 rounded-sm bg-brand-100" /> Próximo
                </span>
              </p>
            </div>
            <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-800/50">
              <div className="h-60 w-full">
                <Bar
                  data={chartData}
                  plugins={[valueLabelsPlugin]}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                      legend: { display: false },
                      tooltip: {
                        backgroundColor: "rgba(15,23,42,0.9)",
                        padding: 12,
                        cornerRadius: 10,
                        titleColor: "#e2e8f0",
                        bodyColor: "#94a3b8",
                        callbacks: {
                          title: (items) => {
                            const idx = items[0]?.dataIndex ?? 0;
                            return `Fecha: ${chartData.labels[idx] ?? ""}`;
                          },
                          label: (item) =>
                            `  ${item.raw} cita${Number(item.raw) !== 1 ? "s" : ""}`,
                        },
                      },
                    },
                    scales: {
                      y: {
                        beginAtZero: true,
                        suggestedMax: 5,
                        ticks: { stepSize: 1, color: "#94a3b8", font: { size: 11 } },
                        grid: { color: "rgba(226,232,240,0.6)" },
                        border: { display: false },
                      },
                      x: {
                        ticks: { color: "#94a3b8", font: { size: 10 }, maxRotation: 40 },
                        grid: { display: false },
                        border: { display: false },
                      },
                    },
                  }}
                />
              </div>
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
                      <p className="text-xs text-slate-400">{c.date} · {c.time || "—"} · {c.service || "—"}</p>
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
