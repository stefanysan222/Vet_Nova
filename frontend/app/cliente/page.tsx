"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import NombreCliente from "./NombreCliente";
import { useAuth } from "@/lib/auth-context";
import { fetchCitas, updateCitaEstado } from "../../lib/api/citas";
import { fetchMascotas } from "../../lib/api/mascotas";
import { fetchPropietarioByUsuario } from "../../lib/api/propietarios";
import type { Appointment } from "../../lib/recepcionista/types";
import type { PetRecord } from "../../lib/recepcionista/types";
import { StatusBadge } from "../../lib/utils/status-badge";
import { getStatusStyle, type AppointmentStatus } from "../../lib/utils/status";
import AppointmentDetailModal from "../components/appointments/AppointmentDetailModal";
import {
  CalendarDays,
  PawPrint,
  Clock,
  Plus,
  ChevronRight,
  CheckCircle2,
  XCircle,
  Activity,
  Zap,
  Settings,
  CalendarPlus,
} from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import MonthlyCalendar, { type CalendarEvent } from "../components/ui/MonthlyCalendar";
import { useIsDarkMode } from "@/lib/hooks/useDarkMode";
import { colors } from "@/lib/design-tokens";

const TODAY_ACCENT = "#6366F1";

const STATUS_CHART_COLORS: Record<string, string> = {
  Confirmada: colors.success[500],
  Pendiente: colors.warning[500],
  Cancelada: colors.danger[500],
  Otras: "#94A3B8",
};

const CHART_STATUS_KEYS = ["Confirmada", "Pendiente", "Cancelada", "Otras"] as const;

function bucketStatus(status: string): keyof typeof STATUS_CHART_COLORS {
  if (status === "Confirmada" || status === "Pendiente" || status === "Cancelada") return status;
  return "Otras";
}

const cardClass =
  "rounded-[13px] border-[0.5px] border-[#E4DFF0] bg-white px-4 py-3.5 dark:border-slate-700/60 dark:bg-slate-900";

export default function ClientePage() {
  const [citas, setCitas] = useState<Appointment[]>([]);
  const [mascotas, setMascotas] = useState<PetRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const isDark = useIsDarkMode();
  const [detalleCitaOpen, setDetalleCitaOpen] = useState(false);
  const [cancelLoading, setCancelLoading] = useState(false);

  useEffect(() => {
    if (!user) return;

    const loadData = async () => {
      try {
        const [userCitas, propietario] = await Promise.all([
          fetchCitas(),
          fetchPropietarioByUsuario(user.id),
        ]);
        setCitas(userCitas);
        if (propietario) {
          const pets = await fetchMascotas(parseInt(propietario.id, 10));
          setMascotas(pets);
        }
      } catch {
        setCitas([]);
        setMascotas([]);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [user]);

  const today = new Date().toISOString().split("T")[0];
  const proximas = citas
    .filter((c) => c.date >= today && c.status !== "Cancelada" && c.status !== "Finalizada")
    .sort((a, b) => a.date.localeCompare(b.date) || a.time.localeCompare(b.time));

  const proximaCita = proximas[0] ?? null;
  const citasHoy = citas.filter((c) => c.date === today).length;
  const completadas = citas.filter((c) => c.status === "Finalizada").length;
  const canceladas = citas.filter((c) => c.status === "Cancelada").length;

  const formatDate = (iso: string) => {
    const d = new Date(iso + "T00:00:00");
    return d.toLocaleDateString("es-CO", { weekday: "long", day: "numeric", month: "long" });
  };

  const handleCancelarProximaCita = async (cita: Appointment) => {
    setCancelLoading(true);
    try {
      await updateCitaEstado(cita.id, "Cancelada");
      setCitas((prev) => prev.map((c) => (c.id === cita.id ? { ...c, status: "Cancelada" } : c)));
      setDetalleCitaOpen(false);
    } catch {
      // Si falla la llamada, dejamos el modal abierto para que el usuario reintente.
    } finally {
      setCancelLoading(false);
    }
  };

  const chartData = useMemo(() => {
    const now = new Date();
    const desde = new Date(now);
    desde.setDate(now.getDate() - 29);
    const hasta = new Date(now);
    hasta.setDate(now.getDate() + 14);

    const fechas: string[] = [];
    const cur = new Date(desde);
    while (cur <= hasta) {
      fechas.push(cur.toISOString().slice(0, 10));
      cur.setDate(cur.getDate() + 1);
    }

    const todayStr = now.toISOString().slice(0, 10);
    const conteo: Record<string, Record<string, number>> = {};
    citas.forEach((c) => {
      if (!c.date) return;
      const bucket = bucketStatus(c.status);
      conteo[c.date] ??= { Confirmada: 0, Pendiente: 0, Cancelada: 0, Otras: 0 };
      conteo[c.date][bucket] += 1;
    });

    const fechasConDatos = fechas.filter((f) => conteo[f] || f === todayStr);

    return fechasConDatos.map((f) => {
      const [, m, d] = f.split("-");
      const counts = conteo[f] ?? { Confirmada: 0, Pendiente: 0, Cancelada: 0, Otras: 0 };
      return {
        fullDate: f,
        date: `${d}/${m}`,
        isToday: f === todayStr,
        ...counts,
      };
    });
  }, [citas]);

  const [selectedChartDate, setSelectedChartDate] = useState<string | null>(null);
  const [hiddenSeries, setHiddenSeries] = useState<Set<string>>(new Set());
  const toggleSeries = (key: string) =>
    setHiddenSeries((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });

  const datesWithCitas = useMemo(() => {
    const set = new Set<string>();
    citas.filter((c) => c.status !== "Cancelada").forEach((c) => c.date && set.add(c.date));
    return set;
  }, [citas]);

  const eventsByDate = useMemo(() => {
    const map: Record<string, CalendarEvent[]> = {};
    citas
      .filter((c) => c.status !== "Cancelada" && c.date)
      .sort((a, b) => a.time.localeCompare(b.time))
      .forEach((c) => {
        const style = getStatusStyle(c.status);
        (map[c.date] ??= []).push({
          id: c.id,
          title: `${c.time} · ${c.petName}`,
          subtitle: c.service,
          badgeLabel: style.label,
          badgeClassName: style.badge,
        });
      });
    return map;
  }, [citas]);

  const iconBg = (color: string, lightBg: string) => (isDark ? `${color}26` : lightBg);

  const metrics = [
    {
      label: "Citas hoy",
      value: citasHoy,
      icon: CalendarDays,
      color: "#1D4ED8",
      bg: "#EFF6FF",
      href: "/cliente/agendar",
    },
    {
      label: "Mascotas",
      value: mascotas.length,
      icon: PawPrint,
      color: "#15803D",
      bg: "#F0FDF4",
      href: "/cliente/mascotas",
    },
    {
      label: "Próximas",
      value: proximas.length,
      icon: Clock,
      color: "#C2410C",
      bg: "#FFF7ED",
      href: "/cliente/agendar",
    },
    {
      label: "Completadas",
      value: completadas,
      icon: CheckCircle2,
      color: "#4338CA",
      bg: "#EEF2FF",
      href: "/cliente/historial",
    },
    {
      label: "Canceladas",
      value: canceladas,
      icon: XCircle,
      color: "#BE123C",
      bg: "#FFF1F2",
      href: "/cliente/agendar",
    },
  ];

  return (
    <div className="bg-[#F7F6FA] dark:bg-transparent">
      <div className="flex flex-col gap-3">
        {/* FILA 1 — Hero + Próxima cita */}
        <div className="grid grid-cols-1 gap-3 lg:grid-cols-[1fr_240px]">
          <motion.div
            className="rounded-[13px] bg-gradient-to-br from-[#E9EAFB] via-[#E1E4F9] to-[#E7E9FB] p-6 dark:from-[#15173A] dark:via-[#191D45] dark:to-[#171A3E]"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            <p className="text-[11px] font-semibold uppercase tracking-[0.25em] text-[#4C4A8A] dark:text-[#A5A9F0]">
              Panel cliente
            </p>
            <h1 className="mt-2 text-2xl font-bold tracking-tight text-[#1E1B4B] dark:text-[#E0E3FF] sm:text-3xl">
              Hola, <NombreCliente soloNombre /> 🐾
            </h1>
            <p className="mt-2 max-w-md text-sm leading-6 text-[#4C4A8A] dark:text-[#A5A9F0]">
              {loading
                ? "Cargando tu información..."
                : proximas.length > 0
                  ? `Tienes ${proximas.length} cita${proximas.length > 1 ? "s" : ""} próxima${proximas.length > 1 ? "s" : ""}.`
                  : "No tienes citas próximas. ¿Agendamos una?"}
            </p>
            <div className="mt-5 flex flex-wrap gap-3">
              <Link
                href="/cliente/agendar/nueva"
                className="inline-flex items-center gap-2 rounded-[9px] bg-[#6366F1] px-4 py-2 text-[12px] font-semibold text-white transition hover:bg-[#4F46E5]"
              >
                <Plus className="h-3.5 w-3.5" />
                Agendar cita
              </Link>
              <Link
                href="/cliente/mascotas"
                className="inline-flex items-center gap-2 rounded-[9px] border-[0.5px] border-[#6366F1]/30 bg-white/60 px-4 py-2 text-[12px] font-semibold text-[#6366F1] transition hover:bg-white"
              >
                <PawPrint className="h-3.5 w-3.5" />
                Mis mascotas
              </Link>
            </div>
          </motion.div>

          {/* Próxima cita */}
          <div className={cardClass}>
            <div className="mb-3 flex items-center gap-2">
              <CalendarDays className="h-4 w-4 text-[#6366F1]" />
              <h3 className="text-[12px] font-semibold text-slate-900 dark:text-white">
                Próxima cita
              </h3>
            </div>
            {loading ? (
              <p className="text-[11px] text-[#555068] dark:text-slate-400">Cargando...</p>
            ) : proximaCita ? (
              <div className="space-y-1.5">
                <p className="text-[11px] font-semibold text-slate-900 dark:text-white">
                  {proximaCita.petName}
                </p>
                <p className="text-[11px] text-[#555068] dark:text-slate-400">
                  {proximaCita.service || "Consulta"}
                </p>
                <p className="text-[11px] text-[#555068] dark:text-slate-400">
                  {formatDate(proximaCita.date)} · {proximaCita.time}
                </p>
                <div className="pt-1">
                  <StatusBadge status={proximaCita.status as AppointmentStatus} />
                </div>
                <button
                  type="button"
                  onClick={() => setDetalleCitaOpen(true)}
                  className="mt-2 inline-flex cursor-pointer items-center gap-1 text-[11px] font-semibold text-[#6366F1] transition hover:text-[#4F46E5] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#6366F1]"
                >
                  Ver detalle
                  <ChevronRight className="h-3 w-3" />
                </button>
              </div>
            ) : (
              <p className="text-[11px] text-[#555068] dark:text-slate-400">Sin citas próximas.</p>
            )}
          </div>
        </div>

        {/* FILA 2 — Métricas */}
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
          {metrics.map((m, i) => {
            const Icon = m.icon;
            return (
              <motion.div
                key={m.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: i * 0.06 }}
              >
                <Link
                  href={m.href}
                  className={`block ${cardClass} cursor-pointer transition hover:-translate-y-0.5 hover:shadow-card-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#6366F1]`}
                >
                  <div
                    className="mb-3 flex h-8 w-8 items-center justify-center rounded-lg"
                    style={{ background: iconBg(m.color, m.bg) }}
                  >
                    <Icon className="h-4 w-4" style={{ color: m.color }} />
                  </div>
                  <p className="text-[22px] font-bold leading-none" style={{ color: m.color }}>
                    {loading ? "—" : m.value}
                  </p>
                  <p className="mt-1.5 text-[11px] text-[#555068] dark:text-slate-400">{m.label}</p>
                </Link>
              </motion.div>
            );
          })}
        </div>

        {/* FILA 3 — Gráfica + Calendario */}
        <div className="grid grid-cols-1 gap-3 lg:grid-cols-[1fr_240px]">
          <div className={cardClass}>
            <h2 className="text-[12px] font-semibold text-slate-900 dark:text-white">
              Mis citas por día
            </h2>
            <p className="mt-0.5 text-[11px] text-[#555068] dark:text-slate-400">
              Últimos 30 días y próximos 14
            </p>

            <div className="mb-1 mt-3 flex flex-wrap items-center gap-3">
              {CHART_STATUS_KEYS.map((key) => {
                const isHidden = hiddenSeries.has(key);
                return (
                  <button
                    key={key}
                    type="button"
                    onClick={() => toggleSeries(key)}
                    className={`flex items-center gap-1.5 text-[11px] transition-opacity ${isHidden ? "opacity-40" : ""} text-[#555068] dark:text-slate-400`}
                    aria-pressed={!isHidden}
                  >
                    <span
                      className="inline-block h-2 w-2 rounded-full"
                      style={{ background: STATUS_CHART_COLORS[key] }}
                    />
                    {key}
                  </button>
                );
              })}
              <span className="flex items-center gap-1.5 text-[11px] font-semibold text-[#555068] dark:text-slate-400">
                <span
                  className="inline-block h-2 w-2 rounded-full border-2"
                  style={{ borderColor: TODAY_ACCENT }}
                />
                Hoy
              </span>
            </div>

            <div className="h-60 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} barSize={22} barGap={4}>
                  <CartesianGrid vertical={false} stroke={isDark ? "#334155" : "#E4DFF0"} />
                  <XAxis
                    dataKey="date"
                    tick={(props) => {
                      const { x, y, payload } = props;
                      const point = chartData[payload.index];
                      const isToday = point?.isToday;
                      return (
                        <text
                          x={x}
                          y={Number(y) + 10}
                          textAnchor="middle"
                          fontSize={10}
                          fontWeight={isToday ? 700 : 400}
                          fill={isToday ? TODAY_ACCENT : isDark ? "#94A3B8" : "#555068"}
                        >
                          {payload.value}
                        </text>
                      );
                    }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis
                    tick={{ fontSize: 10, fill: isDark ? "#94A3B8" : "#555068" }}
                    axisLine={false}
                    tickLine={false}
                    allowDecimals={false}
                  />
                  <Tooltip
                    cursor={{ fill: isDark ? "rgba(148,163,184,0.08)" : "rgba(99,102,241,0.06)" }}
                    content={({ active, payload, label }) => {
                      if (!active || !payload?.length) return null;
                      const visible = payload.filter((p) => Number(p.value ?? 0) > 0);
                      if (visible.length === 0) return null;
                      return (
                        <div
                          className="rounded-[10px] border-[0.5px] px-3 py-2 text-xs"
                          style={{
                            background: isDark ? "#1E293B" : "#FFFFFF",
                            borderColor: isDark ? "#334155" : "#E4DFF0",
                            color: isDark ? "#E2E8F0" : "#1A0F35",
                          }}
                        >
                          <p className="mb-1 font-semibold">{label}</p>
                          {visible.map((p) => (
                            <div key={String(p.dataKey)} className="flex items-center gap-1.5">
                              <span
                                className="h-1.5 w-1.5 rounded-full"
                                style={{ background: p.color }}
                              />
                              {p.name}: {p.value}
                            </div>
                          ))}
                        </div>
                      );
                    }}
                  />
                  {CHART_STATUS_KEYS.filter((key) => !hiddenSeries.has(key)).map((key) => (
                    <Bar
                      key={key}
                      dataKey={key}
                      stackId="citas"
                      fill={STATUS_CHART_COLORS[key]}
                      radius={[6, 6, 6, 6]}
                      className="cursor-pointer"
                      onClick={(_, index) =>
                        setSelectedChartDate((prev) =>
                          prev === chartData[index]?.fullDate ? null : chartData[index]?.fullDate,
                        )
                      }
                    />
                  ))}
                </BarChart>
              </ResponsiveContainer>
            </div>

            {selectedChartDate &&
              (() => {
                const citasDelDia = citas.filter((c) => c.date === selectedChartDate);
                return (
                  <div className="mt-3 border-t border-[#E4DFF0] pt-3 dark:border-slate-700/60">
                    <p className="mb-2 text-[11px] font-semibold capitalize text-slate-900 dark:text-white">
                      {new Date(selectedChartDate + "T00:00:00").toLocaleDateString("es-ES", {
                        weekday: "long",
                        day: "numeric",
                        month: "long",
                      })}
                    </p>
                    {citasDelDia.length === 0 ? (
                      <p className="text-[11px] text-[#555068] dark:text-slate-400">
                        Sin citas registradas.
                      </p>
                    ) : (
                      <div className="space-y-1.5">
                        {citasDelDia.map((c) => (
                          <div
                            key={c.id}
                            className="flex items-center justify-between gap-2 rounded-lg bg-[#F7F6FA] px-2.5 py-1.5 dark:bg-slate-800/60"
                          >
                            <div className="min-w-0">
                              <p className="truncate text-[11px] font-semibold text-slate-900 dark:text-white">
                                {c.time} · {c.petName}
                              </p>
                              <p className="truncate text-[10px] text-[#555068] dark:text-slate-400">
                                {c.service}
                              </p>
                            </div>
                            <StatusBadge status={c.status} className="shrink-0 text-[9px]" />
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })()}
          </div>

          <MonthlyCalendar
            datesWithCitas={datesWithCitas}
            eventsByDate={eventsByDate}
            accentColor="#6366F1"
          />
        </div>

        {/* FILA 4 — Mis mascotas + Acciones rápidas */}
        <div className="grid grid-cols-1 gap-3 lg:grid-cols-[1fr_240px]">
          <div className={cardClass}>
            <div className="mb-3 flex items-center gap-2">
              <Activity className="h-4 w-4 text-[#6366F1]" />
              <h3 className="text-[12px] font-semibold text-slate-900 dark:text-white">
                Mis mascotas
              </h3>
            </div>
            {loading ? (
              <p className="text-[11px] text-[#555068] dark:text-slate-400">Cargando...</p>
            ) : mascotas.length === 0 ? (
              <p className="text-[11px] text-[#555068] dark:text-slate-400">
                No tienes mascotas registradas.
              </p>
            ) : (
              <div className="space-y-3">
                {mascotas.slice(0, 5).map((mascota) => (
                  <Link
                    key={mascota.id}
                    href="/cliente/mascotas"
                    className="flex items-center gap-3"
                  >
                    <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-[#EEF2FF] text-[11px] font-bold text-[#6366F1] dark:bg-[#6366F1]/20">
                      {mascota.nombre.charAt(0)}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-[11px] font-semibold text-slate-900 dark:text-white">
                        {mascota.nombre}
                      </p>
                      <p className="text-[11px] text-[#555068] dark:text-slate-400">
                        {mascota.especie}
                        {mascota.raza ? ` · ${mascota.raza}` : ""}
                      </p>
                    </div>
                    <ChevronRight className="h-3.5 w-3.5 shrink-0 text-slate-300 dark:text-slate-600" />
                  </Link>
                ))}
              </div>
            )}
          </div>

          {/* Acciones rápidas */}
          <div className={cardClass}>
            <div className="mb-3 flex items-center gap-2">
              <Zap className="h-4 w-4 text-[#6366F1]" />
              <h3 className="text-[12px] font-semibold text-slate-900 dark:text-white">
                Acciones rápidas
              </h3>
            </div>
            <div className="space-y-2">
              <Link
                href="/cliente/agendar/nueva"
                className="flex w-full items-center gap-2 rounded-[9px] border-[0.5px] border-[#E4DFF0] bg-[#F7F6FA] px-3 py-2 text-[11px] font-semibold text-slate-700 transition hover:border-[#6366F1]/30 hover:bg-[#EEF2FF] dark:border-slate-700/60 dark:bg-slate-800/60 dark:text-slate-300 dark:hover:border-[#6366F1]/40 dark:hover:bg-[#6366F1]/10"
              >
                <CalendarPlus className="h-3.5 w-3.5 text-[#6366F1]" />
                Agendar cita
              </Link>
              <Link
                href="/cliente/mascotas"
                className="flex w-full items-center gap-2 rounded-[9px] border-[0.5px] border-[#E4DFF0] bg-[#F7F6FA] px-3 py-2 text-[11px] font-semibold text-slate-700 transition hover:border-[#6366F1]/30 hover:bg-[#EEF2FF] dark:border-slate-700/60 dark:bg-slate-800/60 dark:text-slate-300 dark:hover:border-[#6366F1]/40 dark:hover:bg-[#6366F1]/10"
              >
                <PawPrint className="h-3.5 w-3.5 text-[#6366F1]" />
                Mis mascotas
              </Link>
              <Link
                href="/cliente/agendar"
                className="flex w-full items-center gap-2 rounded-[9px] border-[0.5px] border-[#E4DFF0] bg-[#F7F6FA] px-3 py-2 text-[11px] font-semibold text-slate-700 transition hover:border-[#6366F1]/30 hover:bg-[#EEF2FF] dark:border-slate-700/60 dark:bg-slate-800/60 dark:text-slate-300 dark:hover:border-[#6366F1]/40 dark:hover:bg-[#6366F1]/10"
              >
                <CalendarDays className="h-3.5 w-3.5 text-[#6366F1]" />
                Ver citas
              </Link>
              <Link
                href="/cliente/historial"
                className="flex w-full items-center gap-2 rounded-[9px] border-[0.5px] border-[#E4DFF0] bg-[#F7F6FA] px-3 py-2 text-[11px] font-semibold text-slate-700 transition hover:border-[#6366F1]/30 hover:bg-[#EEF2FF] dark:border-slate-700/60 dark:bg-slate-800/60 dark:text-slate-300 dark:hover:border-[#6366F1]/40 dark:hover:bg-[#6366F1]/10"
              >
                <Activity className="h-3.5 w-3.5 text-[#6366F1]" />
                Historial de mi mascota
              </Link>
              <Link
                href="/cliente/configuracion"
                className="flex w-full items-center gap-2 rounded-[9px] border-[0.5px] border-[#E4DFF0] bg-[#F7F6FA] px-3 py-2 text-[11px] font-semibold text-slate-700 transition hover:border-[#6366F1]/30 hover:bg-[#EEF2FF] dark:border-slate-700/60 dark:bg-slate-800/60 dark:text-slate-300 dark:hover:border-[#6366F1]/40 dark:hover:bg-[#6366F1]/10"
              >
                <Settings className="h-3.5 w-3.5 text-[#6366F1]" />
                Mi perfil
              </Link>
            </div>
          </div>
        </div>
      </div>

      <AppointmentDetailModal
        isOpen={detalleCitaOpen}
        onClose={() => setDetalleCitaOpen(false)}
        appointment={proximaCita}
        onCancel={handleCancelarProximaCita}
        cancelLoading={cancelLoading}
      />
    </div>
  );
}
