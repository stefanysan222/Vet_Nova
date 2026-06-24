"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  Plus,
  Users,
  Stethoscope,
  PawPrint,
  CalendarDays,
  Clock,
  Activity,
  Zap,
  CalendarPlus,
  UserPlus,
  ClipboardList,
  Hand,
} from "lucide-react";
import RegisterUserModal from "../components/admin/RegisterUserModal";
import MonthlyCalendar, { type CalendarEvent } from "../components/ui/MonthlyCalendar";
import { useAuth } from "@/lib/auth-context";
import { useIsDarkMode } from "@/lib/hooks/useDarkMode";
import { fetchCitas } from "../../lib/api/citas";
import { fetchStatsAdmin } from "../../lib/api/usuarios";
import { fetchMascotas } from "../../lib/api/mascotas";
import { fetchNotificaciones, type NotificacionAPI } from "../../lib/api/notificaciones";
import type { Appointment } from "../../lib/recepcionista/types";
import { getStatusStyle } from "../../lib/utils/status";
import { StatusBadge } from "../../lib/utils/status-badge";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { colors } from "@/lib/design-tokens";

const TODAY_ACCENT = "#8B5CF6";

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

const ACTIVITY_ICONS: Record<string, { icon: typeof PawPrint; color: string; bg: string }> = {
  nueva_mascota: { icon: PawPrint, color: "#16A34A", bg: "#F0FDF4" },
  nueva_cita: { icon: CalendarDays, color: "#2563EB", bg: "#EFF6FF" },
  nuevo_cliente: { icon: Stethoscope, color: "#7C3AED", bg: "#FAF5FF" },
  cita_actualizada: { icon: ClipboardList, color: "#D97706", bg: "#FFF7ED" },
};

const DEFAULT_ACTIVITY_ICON = { icon: ClipboardList, color: "#D97706", bg: "#FFF7ED" };

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return "Ahora";
  if (m < 60) return `Hace ${m} min`;
  const h = Math.floor(m / 60);
  if (h < 24) return `Hace ${h}h`;
  return `Hace ${Math.floor(h / 24)}d`;
}

const cardClass =
  "rounded-[13px] border-[0.5px] border-[#E4DFF0] bg-white px-4 py-3.5 dark:border-slate-700/60 dark:bg-slate-900";

function colorForService(service: string): string {
  const s = service.toLowerCase();
  if (s.includes("vacun")) return "#16A34A";
  if (s.includes("control")) return "#7C3AED";
  return "#F59E0B";
}

const AdminDashboardPage: React.FC = () => {
  const [isRegisterModalOpen, setIsRegisterModalOpen] = useState(false);
  const [registerRole, setRegisterRole] = useState<"Veterinario" | "Cliente">("Veterinario");
  const [citas, setCitas] = useState<Appointment[]>([]);
  const [actividad, setActividad] = useState<NotificacionAPI[]>([]);
  const [stats, setStats] = useState({
    clientes: 0,
    veterinarios: 0,
    mascotas: 0,
    citasHoy: 0,
    pendientes: 0,
  });
  const { user } = useAuth();
  const userName = user?.name ?? "Administrador";
  const isDark = useIsDarkMode();
  const iconBg = (color: string, lightBg: string) => (isDark ? `${color}26` : lightBg);

  useEffect(() => {
    const hoy = new Date().toISOString().slice(0, 10);
    fetchCitas()
      .then((data) => {
        setCitas(data);
        return fetchStatsAdmin().then((usuarios) =>
          fetchMascotas().then((mascotas) => {
            setStats({
              clientes: usuarios.clientes,
              veterinarios: usuarios.veterinarios,
              mascotas: mascotas.length,
              citasHoy: data.filter((c) => c.date === hoy && c.status !== "Cancelada").length,
              pendientes: data.filter((c) => c.status === "Pendiente").length,
            });
          }),
        );
      })
      .catch(() => setCitas([]));

    fetchNotificaciones()
      .then((data) => setActividad(data.slice(0, 4)))
      .catch(() => setActividad([]));
  }, []);

  const openRegisterModal = (role: "Veterinario" | "Cliente") => {
    setRegisterRole(role);
    setIsRegisterModalOpen(true);
  };

  const chartData = useMemo(() => {
    const hoy = new Date();
    const desde = new Date(hoy);
    desde.setDate(hoy.getDate() - 29);
    const hasta = new Date(hoy);
    hasta.setDate(hoy.getDate() + 14);

    const fechas: string[] = [];
    const cur = new Date(desde);
    while (cur <= hasta) {
      fechas.push(cur.toISOString().slice(0, 10));
      cur.setDate(cur.getDate() + 1);
    }

    const todayStr = hoy.toISOString().slice(0, 10);
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

  const todayStr = new Date().toISOString().slice(0, 10);
  const agendaHoy = useMemo(
    () =>
      citas
        .filter((c) => c.date === todayStr && c.status !== "Cancelada")
        .sort((a, b) => a.time.localeCompare(b.time))
        .slice(0, 3),
    [citas, todayStr],
  );

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

  const metrics = [
    {
      label: "Clientes",
      value: stats.clientes,
      icon: Users,
      color: "#1D4ED8",
      bg: "#EFF6FF",
      href: "/admin/usuarios",
    },
    {
      label: "Veterinarios",
      value: stats.veterinarios,
      icon: Stethoscope,
      color: "#15803D",
      bg: "#F0FDF4",
      href: "/admin/usuarios",
    },
    {
      label: "Mascotas",
      value: stats.mascotas,
      icon: PawPrint,
      color: "#C2410C",
      bg: "#FFF7ED",
      href: "/admin/mascotas",
    },
    {
      label: "Citas hoy",
      value: stats.citasHoy,
      icon: CalendarDays,
      color: "#7E22CE",
      bg: "#FAF5FF",
      href: "/admin/citas",
    },
    {
      label: "Pendientes",
      value: stats.pendientes,
      icon: Clock,
      color: "#BE123C",
      bg: "#FFF1F2",
      href: "/admin/citas",
    },
  ];

  return (
    <div className="admin-page bg-[#F7F6FA] dark:bg-transparent">
      <div className="flex flex-col gap-3">
        {/* FILA 1 — Hero + Agenda de hoy */}
        <div className="grid grid-cols-1 gap-3 lg:grid-cols-[1fr_240px]">
          <motion.div
            className="rounded-[13px] bg-gradient-to-br from-[#EDE8FA] via-[#E4DCF5] to-[#EAE3F8] p-6 dark:from-[#1A1030] dark:via-[#20153A] dark:to-[#1C1232]"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            <p className="text-[11px] font-semibold uppercase tracking-[0.25em] text-[#5A4880] dark:text-[#9D88CC]">
              Panel administrativo
            </p>
            <h1 className="mt-2 flex items-center gap-2 text-2xl font-bold tracking-tight text-[#1A0F35] dark:text-[#E8DCFF] sm:text-3xl">
              Hola, {userName} <Hand className="h-5 w-5 shrink-0 sm:h-6 sm:w-6" />
            </h1>
            <p className="mt-2 max-w-md text-sm leading-6 text-[#5A4880] dark:text-[#9D88CC]">
              Gestiona usuarios, citas y mascotas desde aquí.
            </p>
            <div className="mt-5 flex flex-wrap gap-3">
              <button
                onClick={() => openRegisterModal("Veterinario")}
                className="inline-flex items-center gap-2 rounded-[9px] bg-[#7C3AED] px-4 py-2 text-[12px] font-semibold text-white transition hover:bg-[#6D28D9]"
              >
                <Plus className="h-3.5 w-3.5" />
                Nuevo usuario
              </button>
              <Link
                href="/admin/citas"
                className="inline-flex items-center gap-2 rounded-[9px] border-[0.5px] border-[#7C3AED]/30 bg-white/60 px-4 py-2 text-[12px] font-semibold text-[#7C3AED] transition hover:bg-white dark:border-[#7C3AED]/40 dark:bg-white/10 dark:text-[#C4B5FD] dark:hover:bg-white/20"
              >
                <Plus className="h-3.5 w-3.5" />
                Nueva cita
              </Link>
            </div>
          </motion.div>

          {/* Agenda de hoy */}
          <div className={cardClass}>
            <div className="mb-3 flex items-center gap-2">
              <CalendarDays className="h-4 w-4 text-[#7C3AED]" />
              <h3 className="text-[12px] font-semibold text-slate-900 dark:text-white">
                Agenda de hoy
              </h3>
            </div>
            {agendaHoy.length === 0 ? (
              <p className="text-[11px] text-[#555068] dark:text-slate-400">
                Sin citas programadas para hoy.
              </p>
            ) : (
              <div className="space-y-3">
                {agendaHoy.map((c) => (
                  <div key={c.id} className="flex items-start gap-2">
                    <span
                      className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full"
                      style={{ background: colorForService(c.service) }}
                    />
                    <p className="text-[11px] leading-5 text-slate-700 dark:text-slate-300">
                      <span className="font-semibold text-slate-900 dark:text-white">{c.time}</span>{" "}
                      {c.petName} · {c.service}
                    </p>
                  </div>
                ))}
              </div>
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
                  className={`block ${cardClass} cursor-pointer transition hover:-translate-y-0.5 hover:shadow-card-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#7C3AED]`}
                >
                  <div
                    className="mb-3 flex h-8 w-8 items-center justify-center rounded-lg"
                    style={{ background: iconBg(m.color, m.bg) }}
                  >
                    <Icon className="h-4 w-4" style={{ color: m.color }} />
                  </div>
                  <p className="text-[22px] font-bold leading-none" style={{ color: m.color }}>
                    {m.value}
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
              Citas programadas por día
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

          <MonthlyCalendar datesWithCitas={datesWithCitas} eventsByDate={eventsByDate} />
        </div>

        {/* FILA 4 — Actividad reciente + Acciones rápidas */}
        <div className="grid grid-cols-1 gap-3 lg:grid-cols-[1fr_240px]">
          <div className={cardClass}>
            <div className="mb-3 flex items-center gap-2">
              <Activity className="h-4 w-4 text-[#7C3AED]" />
              <h3 className="text-[12px] font-semibold text-slate-900 dark:text-white">
                Actividad reciente
              </h3>
            </div>
            <div className="space-y-3">
              {actividad.length === 0 ? (
                <p className="text-[11px] text-[#555068] dark:text-slate-400">
                  No hay actividad reciente.
                </p>
              ) : (
                actividad.map((item) => {
                  const {
                    icon: Icon,
                    color,
                    bg,
                  } = ACTIVITY_ICONS[item.tipo ?? ""] ?? DEFAULT_ACTIVITY_ICON;
                  return (
                    <div key={item.id} className="flex items-start gap-3">
                      <div
                        className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg"
                        style={{ background: iconBg(color, bg) }}
                      >
                        <Icon className="h-3.5 w-3.5" style={{ color }} />
                      </div>
                      <div className="min-w-0">
                        <p className="text-[11px] leading-5 text-slate-700 dark:text-slate-300">
                          {item.mensaje}
                        </p>
                        <p className="mt-0.5 text-[11px] text-[#555068] dark:text-slate-400">
                          {timeAgo(item.creadaEn)}
                        </p>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Acciones rápidas */}
          <div className={cardClass}>
            <div className="mb-3 flex items-center gap-2">
              <Zap className="h-4 w-4 text-[#7C3AED]" />
              <h3 className="text-[12px] font-semibold text-slate-900 dark:text-white">
                Acciones rápidas
              </h3>
            </div>
            <div className="space-y-2">
              <Link
                href="/admin/citas"
                className="flex w-full items-center gap-2 rounded-[9px] border-[0.5px] border-[#E4DFF0] bg-[#F7F6FA] px-3 py-2 text-[11px] font-semibold text-slate-700 transition hover:border-[#7C3AED]/30 hover:bg-[#EDE8FA] dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:border-[#7C3AED]/40 dark:hover:bg-slate-700"
              >
                <CalendarPlus className="h-3.5 w-3.5 text-[#7C3AED]" />
                Nueva cita
              </Link>
              <Link
                href="/admin/mascotas"
                className="flex w-full items-center gap-2 rounded-[9px] border-[0.5px] border-[#E4DFF0] bg-[#F7F6FA] px-3 py-2 text-[11px] font-semibold text-slate-700 transition hover:border-[#7C3AED]/30 hover:bg-[#EDE8FA] dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:border-[#7C3AED]/40 dark:hover:bg-slate-700"
              >
                <PawPrint className="h-3.5 w-3.5 text-[#7C3AED]" />
                Nueva mascota
              </Link>
              <Link
                href="/admin/reportes"
                className="flex w-full items-center gap-2 rounded-[9px] border-[0.5px] border-[#E4DFF0] bg-[#F7F6FA] px-3 py-2 text-[11px] font-semibold text-slate-700 transition hover:border-[#7C3AED]/30 hover:bg-[#EDE8FA] dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:border-[#7C3AED]/40 dark:hover:bg-slate-700"
              >
                <ClipboardList className="h-3.5 w-3.5 text-[#7C3AED]" />
                Ver historial
              </Link>
              <button
                type="button"
                onClick={() => openRegisterModal("Cliente")}
                className="flex w-full items-center gap-2 rounded-[9px] border-[0.5px] border-[#E4DFF0] bg-[#F7F6FA] px-3 py-2 text-[11px] font-semibold text-slate-700 transition hover:border-[#7C3AED]/30 hover:bg-[#EDE8FA] dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:border-[#7C3AED]/40 dark:hover:bg-slate-700"
              >
                <UserPlus className="h-3.5 w-3.5 text-[#7C3AED]" />
                Nuevo cliente
              </button>
              <button
                type="button"
                onClick={() => openRegisterModal("Veterinario")}
                className="flex w-full items-center gap-2 rounded-[9px] border-[0.5px] border-[#E4DFF0] bg-[#F7F6FA] px-3 py-2 text-[11px] font-semibold text-slate-700 transition hover:border-[#7C3AED]/30 hover:bg-[#EDE8FA] dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:border-[#7C3AED]/40 dark:hover:bg-slate-700"
              >
                <Stethoscope className="h-3.5 w-3.5 text-[#7C3AED]" />
                Nuevo veterinario
              </button>
            </div>
          </div>
        </div>
      </div>

      <RegisterUserModal
        isOpen={isRegisterModalOpen}
        onClose={() => setIsRegisterModalOpen(false)}
        initialRole={registerRole}
      />
    </div>
  );
};

export default AdminDashboardPage;
