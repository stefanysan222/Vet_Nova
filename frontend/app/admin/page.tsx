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
} from "lucide-react";
import RegisterUserModal from "../components/admin/RegisterUserModal";
import MonthlyCalendar from "../components/ui/MonthlyCalendar";
import { useAuth } from "@/lib/auth-context";
import { useIsDarkMode } from "@/lib/hooks/useDarkMode";
import { fetchCitas } from "../../lib/api/citas";
import { fetchStatsAdmin } from "../../lib/api/usuarios";
import { fetchMascotas } from "../../lib/api/mascotas";
import { fetchNotificaciones, type NotificacionAPI } from "../../lib/api/notificaciones";
import type { Appointment } from "../../lib/recepcionista/types";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

const CHART_BAR_COLORS = {
  hoy: "#8B5CF6",
  pasado: "#C4B5FD",
  proximo: "#EDE9FE",
};

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
    const conteo: Record<string, number> = {};
    citas
      .filter((c) => c.status !== "Cancelada")
      .forEach((c) => {
        if (c.date) conteo[c.date] = (conteo[c.date] ?? 0) + 1;
      });

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

  const metrics = [
    {
      label: "Clientes",
      value: stats.clientes,
      icon: Users,
      color: "#1D4ED8",
      bg: "#EFF6FF",
    },
    {
      label: "Veterinarios",
      value: stats.veterinarios,
      icon: Stethoscope,
      color: "#15803D",
      bg: "#F0FDF4",
    },
    {
      label: "Mascotas",
      value: stats.mascotas,
      icon: PawPrint,
      color: "#C2410C",
      bg: "#FFF7ED",
    },
    {
      label: "Citas hoy",
      value: stats.citasHoy,
      icon: CalendarDays,
      color: "#7E22CE",
      bg: "#FAF5FF",
    },
    {
      label: "Pendientes",
      value: stats.pendientes,
      icon: Clock,
      color: "#BE123C",
      bg: "#FFF1F2",
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
            <h1 className="mt-2 text-2xl font-bold tracking-tight text-[#1A0F35] dark:text-[#E8DCFF] sm:text-3xl">
              Hola, {userName} 👋
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
                className={cardClass}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: i * 0.06 }}
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

            <div className="mb-1 mt-3 flex items-center gap-4">
              <span className="flex items-center gap-1.5 text-[11px] text-[#555068] dark:text-slate-400">
                <span
                  className="inline-block h-2 w-2 rounded-full"
                  style={{ background: CHART_BAR_COLORS.hoy }}
                />
                Hoy
              </span>
              <span className="flex items-center gap-1.5 text-[11px] text-[#555068] dark:text-slate-400">
                <span
                  className="inline-block h-2 w-2 rounded-full"
                  style={{ background: CHART_BAR_COLORS.pasado }}
                />
                Pasado
              </span>
              <span className="flex items-center gap-1.5 text-[11px] text-[#555068] dark:text-slate-400">
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
                  <CartesianGrid vertical={false} stroke={isDark ? "#334155" : "#E4DFF0"} />
                  <XAxis
                    dataKey="date"
                    tick={{ fontSize: 10, fill: isDark ? "#94A3B8" : "#555068" }}
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
                    cursor={{ fill: "transparent" }}
                    contentStyle={{
                      background: isDark ? "#1E293B" : "#FFFFFF",
                      border: isDark ? "0.5px solid #334155" : "0.5px solid #E4DFF0",
                      borderRadius: 10,
                      fontSize: 12,
                      color: isDark ? "#E2E8F0" : "#1A0F35",
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

          <MonthlyCalendar datesWithCitas={datesWithCitas} />
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
