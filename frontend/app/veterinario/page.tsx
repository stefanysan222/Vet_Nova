"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
  Plus,
  CalendarDays,
  CheckCircle2,
  Clock,
  ClipboardList,
  CalendarRange,
  Activity,
  Zap,
  Stethoscope,
  PawPrint,
  FileText,
} from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { SkeletonBanner, SkeletonStats, SkeletonCardList } from "../components/ui/Skeleton";
import { fetchCitas } from "../../lib/api/citas";
import type { Appointment } from "../../lib/recepcionista/types";
import MonthlyCalendar from "../components/ui/MonthlyCalendar";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { useIsDarkMode } from "@/lib/hooks/useDarkMode";

const CHART_BAR_COLORS = {
  hoy: "#6366F1",
  pasado: "#A5B4FC",
  proximo: "#E0E7FF",
};

const cardClass =
  "rounded-[13px] border-[0.5px] border-[#E4DFF0] bg-white px-4 py-3.5 dark:border-slate-700/60 dark:bg-slate-900";

function fechaHoy(): string {
  return new Date().toISOString().slice(0, 10);
}

function parseNotas(raw: string | undefined): { diagnostico?: string; tratamiento?: string } {
  if (!raw) return {};
  try {
    return JSON.parse(raw);
  } catch {
    return { diagnostico: raw };
  }
}

function colorForService(service: string): string {
  const s = service.toLowerCase();
  if (s.includes("vacun")) return "#16A34A";
  if (s.includes("control")) return "#6366F1";
  return "#F59E0B";
}

function startOfWeek(date: Date): Date {
  const d = new Date(date);
  const day = (d.getDay() + 6) % 7; // lunes = 0
  d.setDate(d.getDate() - day);
  d.setHours(0, 0, 0, 0);
  return d;
}

export default function VeterinarioPage() {
  const [citas, setCitas] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const userName = user?.name ?? "Veterinario";
  const isDark = useIsDarkMode();

  useEffect(() => {
    fetchCitas()
      .then(setCitas)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const hoy = fechaHoy();
  const citasHoy = useMemo(() => citas.filter((c) => c.date === hoy), [citas, hoy]);
  const atendidas = citasHoy.filter((c) => c.status === "Finalizada");
  const pendientes = citasHoy.filter((c) => c.status !== "Finalizada" && c.status !== "Cancelada");
  const conNotas = citas.filter((c) => c.notes);

  const citasEstaSemana = useMemo(() => {
    const inicio = startOfWeek(new Date());
    const fin = new Date(inicio);
    fin.setDate(fin.getDate() + 6);
    return citas.filter((c) => {
      if (c.status === "Cancelada" || !c.date) return false;
      const d = new Date(c.date);
      return d >= inicio && d <= fin;
    });
  }, [citas]);

  const chartData = useMemo(() => {
    const today = new Date();
    const desde = new Date(today);
    desde.setDate(today.getDate() - 29);
    const hasta = new Date(today);
    hasta.setDate(today.getDate() + 14);

    const fechas: string[] = [];
    const cur = new Date(desde);
    while (cur <= hasta) {
      fechas.push(cur.toISOString().slice(0, 10));
      cur.setDate(cur.getDate() + 1);
    }

    const todayStr = today.toISOString().slice(0, 10);
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

  const agendaHoy = useMemo(
    () =>
      citasHoy
        .filter((c) => c.status !== "Cancelada")
        .sort((a, b) => a.time.localeCompare(b.time))
        .slice(0, 3),
    [citasHoy],
  );

  const datesWithCitas = useMemo(() => {
    const set = new Set<string>();
    citas.filter((c) => c.status !== "Cancelada").forEach((c) => c.date && set.add(c.date));
    return set;
  }, [citas]);

  const pacientesAtendidos = useMemo(
    () => citas.filter((c) => c.status === "Finalizada").slice(0, 3),
    [citas],
  );

  const iconBg = (color: string, lightBg: string) => (isDark ? `${color}26` : lightBg);

  const metrics = [
    {
      label: "Citas hoy",
      value: citasHoy.length,
      icon: CalendarDays,
      color: "#1D4ED8",
      bg: "#EFF6FF",
    },
    {
      label: "Atendidas",
      value: atendidas.length,
      icon: CheckCircle2,
      color: "#15803D",
      bg: "#F0FDF4",
    },
    {
      label: "Pendientes",
      value: pendientes.length,
      icon: Clock,
      color: "#BE123C",
      bg: "#FFF1F2",
    },
    {
      label: "Tratamientos",
      value: conNotas.length,
      icon: ClipboardList,
      color: "#C2410C",
      bg: "#FFF7ED",
    },
    {
      label: "Esta semana",
      value: citasEstaSemana.length,
      icon: CalendarRange,
      color: "#4338CA",
      bg: "#EEF2FF",
    },
  ];

  if (loading) {
    return (
      <div className="space-y-6">
        <SkeletonBanner />
        <SkeletonStats count={4} />
        <SkeletonCardList count={5} />
      </div>
    );
  }

  return (
    <div className="bg-[#F7F6FA] dark:bg-transparent">
      <div className="flex flex-col gap-3">
        {/* FILA 1 — Hero + Agenda de hoy */}
        <div className="grid grid-cols-1 gap-3 lg:grid-cols-[1fr_240px]">
          <motion.div
            className="rounded-[13px] bg-gradient-to-br from-[#E9EAFB] via-[#E1E4F9] to-[#E7E9FB] p-6 dark:from-[#15173A] dark:via-[#191D45] dark:to-[#171A3E]"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            <p className="text-[11px] font-semibold uppercase tracking-[0.25em] text-[#4C4A8A] dark:text-[#A5A9F0]">
              Módulo veterinario
            </p>
            <h1 className="mt-2 text-2xl font-bold tracking-tight text-[#1E1B4B] dark:text-[#E0E3FF] sm:text-3xl">
              Hola, {userName} 👋
            </h1>
            <p className="mt-2 max-w-md text-sm leading-6 text-[#4C4A8A] dark:text-[#A5A9F0]">
              Consulta tu agenda diaria, registra valoraciones y revisa la historia clínica de tus
              pacientes.
            </p>
            <div className="mt-5 flex flex-wrap gap-3">
              <Link
                href="/veterinario/consulta"
                className="inline-flex items-center gap-2 rounded-[9px] bg-[#6366F1] px-4 py-2 text-[12px] font-semibold text-white transition hover:bg-[#4F46E5]"
              >
                <Plus className="h-3.5 w-3.5" />
                Registrar consulta
              </Link>
              <Link
                href="/veterinario/citas"
                className="inline-flex items-center gap-2 rounded-[9px] border-[0.5px] border-[#6366F1]/30 bg-white/60 px-4 py-2 text-[12px] font-semibold text-[#6366F1] transition hover:bg-white"
              >
                <CalendarDays className="h-3.5 w-3.5" />
                Ver agenda
              </Link>
            </div>
          </motion.div>

          {/* Agenda de hoy */}
          <div className={cardClass}>
            <div className="mb-3 flex items-center gap-2">
              <CalendarDays className="h-4 w-4 text-[#6366F1]" />
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

          <MonthlyCalendar datesWithCitas={datesWithCitas} accentColor="#6366F1" />
        </div>

        {/* FILA 4 — Pacientes atendidos + Acciones rápidas */}
        <div className="grid grid-cols-1 gap-3 lg:grid-cols-[1fr_240px]">
          <div className={cardClass}>
            <div className="mb-3 flex items-center gap-2">
              <Activity className="h-4 w-4 text-[#6366F1]" />
              <h3 className="text-[12px] font-semibold text-slate-900 dark:text-white">
                Pacientes atendidos recientemente
              </h3>
            </div>
            {pacientesAtendidos.length === 0 ? (
              <p className="text-[11px] text-[#555068] dark:text-slate-400">
                No hay pacientes atendidos recientemente.
              </p>
            ) : (
              <div className="space-y-3">
                {pacientesAtendidos.map((cita) => {
                  const notas = parseNotas(cita.notes);
                  return (
                    <div key={cita.id} className="flex items-start gap-3">
                      <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-[#EEF2FF] dark:bg-[#6366F1]/20">
                        <PawPrint className="h-3.5 w-3.5 text-[#6366F1]" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-[11px] font-semibold leading-5 text-slate-900 dark:text-white">
                          {cita.petName}{" "}
                          <span className="font-normal text-[#555068] dark:text-slate-400">
                            · {cita.ownerName}
                          </span>
                        </p>
                        <p className="mt-0.5 text-[11px] leading-5 text-slate-700 dark:text-slate-300">
                          {notas.diagnostico ?? cita.service}
                          {notas.tratamiento ? ` · ${notas.tratamiento}` : ""}
                        </p>
                        <Link
                          href={`/veterinario/historial?paciente=${cita.petId}`}
                          className="mt-0.5 inline-flex text-[11px] font-semibold text-[#6366F1]"
                        >
                          Consultar historial clínico
                        </Link>
                      </div>
                    </div>
                  );
                })}
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
                href="/veterinario/consulta"
                className="flex w-full items-center gap-2 rounded-[9px] border-[0.5px] border-[#E4DFF0] bg-[#F7F6FA] px-3 py-2 text-[11px] font-semibold text-slate-700 transition hover:border-[#6366F1]/30 hover:bg-[#EEF2FF] dark:border-slate-700/60 dark:bg-slate-800/60 dark:text-slate-300 dark:hover:border-[#6366F1]/40 dark:hover:bg-[#6366F1]/10"
              >
                <Stethoscope className="h-3.5 w-3.5 text-[#6366F1]" />
                Registrar consulta
              </Link>
              <Link
                href="/veterinario/citas"
                className="flex w-full items-center gap-2 rounded-[9px] border-[0.5px] border-[#E4DFF0] bg-[#F7F6FA] px-3 py-2 text-[11px] font-semibold text-slate-700 transition hover:border-[#6366F1]/30 hover:bg-[#EEF2FF] dark:border-slate-700/60 dark:bg-slate-800/60 dark:text-slate-300 dark:hover:border-[#6366F1]/40 dark:hover:bg-[#6366F1]/10"
              >
                <CalendarDays className="h-3.5 w-3.5 text-[#6366F1]" />
                Ver agenda completa
              </Link>
              <Link
                href="/veterinario/mascotas"
                className="flex w-full items-center gap-2 rounded-[9px] border-[0.5px] border-[#E4DFF0] bg-[#F7F6FA] px-3 py-2 text-[11px] font-semibold text-slate-700 transition hover:border-[#6366F1]/30 hover:bg-[#EEF2FF] dark:border-slate-700/60 dark:bg-slate-800/60 dark:text-slate-300 dark:hover:border-[#6366F1]/40 dark:hover:bg-[#6366F1]/10"
              >
                <PawPrint className="h-3.5 w-3.5 text-[#6366F1]" />
                Pacientes
              </Link>
              <Link
                href="/veterinario/historial"
                className="flex w-full items-center gap-2 rounded-[9px] border-[0.5px] border-[#E4DFF0] bg-[#F7F6FA] px-3 py-2 text-[11px] font-semibold text-slate-700 transition hover:border-[#6366F1]/30 hover:bg-[#EEF2FF] dark:border-slate-700/60 dark:bg-slate-800/60 dark:text-slate-300 dark:hover:border-[#6366F1]/40 dark:hover:bg-[#6366F1]/10"
              >
                <FileText className="h-3.5 w-3.5 text-[#6366F1]" />
                Historial clínico
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
