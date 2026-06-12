"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import NombreCliente from "./NombreCliente";
import { useAuth } from "@/lib/auth-context";
import { fetchCitas } from "../../lib/api/citas";
import { fetchMascotas } from "../../lib/api/mascotas";
import { fetchPropietarioByUsuario } from "../../lib/api/propietarios";
import type { Appointment } from "../../lib/recepcionista/types";
import type { PetRecord } from "../../lib/recepcionista/types";
import { StatusBadge } from "../../lib/utils/status-badge";
import type { AppointmentStatus } from "../../lib/utils/status";
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
import MonthlyCalendar from "../components/ui/MonthlyCalendar";

const CHART_BAR_COLORS = {
  hoy: "#6366F1",
  pasado: "#A5B4FC",
  proximo: "#E0E7FF",
};

const cardClass = "rounded-[13px] border-[0.5px] border-[#E4DFF0] bg-white px-4 py-3.5";

export default function ClientePage() {
  const [citas, setCitas] = useState<Appointment[]>([]);
  const [mascotas, setMascotas] = useState<PetRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

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

  const datesWithCitas = useMemo(() => {
    const set = new Set<string>();
    citas.filter((c) => c.status !== "Cancelada").forEach((c) => c.date && set.add(c.date));
    return set;
  }, [citas]);

  const metrics = [
    {
      label: "Citas hoy",
      value: citasHoy,
      icon: CalendarDays,
      color: "#1D4ED8",
      bg: "#EFF6FF",
    },
    {
      label: "Mascotas",
      value: mascotas.length,
      icon: PawPrint,
      color: "#15803D",
      bg: "#F0FDF4",
    },
    {
      label: "Próximas",
      value: proximas.length,
      icon: Clock,
      color: "#C2410C",
      bg: "#FFF7ED",
    },
    {
      label: "Completadas",
      value: completadas,
      icon: CheckCircle2,
      color: "#4338CA",
      bg: "#EEF2FF",
    },
    {
      label: "Canceladas",
      value: canceladas,
      icon: XCircle,
      color: "#BE123C",
      bg: "#FFF1F2",
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
              <h3 className="text-[12px] font-semibold text-slate-900">Próxima cita</h3>
            </div>
            {loading ? (
              <p className="text-[11px] text-[#555068]">Cargando...</p>
            ) : proximaCita ? (
              <div className="space-y-1.5">
                <p className="text-[11px] font-semibold text-slate-900">{proximaCita.petName}</p>
                <p className="text-[11px] text-[#555068]">{proximaCita.service || "Consulta"}</p>
                <p className="text-[11px] text-[#555068]">
                  {formatDate(proximaCita.date)} · {proximaCita.time}
                </p>
                <div className="pt-1">
                  <StatusBadge status={proximaCita.status as AppointmentStatus} />
                </div>
                <Link
                  href="/cliente/agendar"
                  className="mt-2 inline-flex items-center gap-1 text-[11px] font-semibold text-[#6366F1]"
                >
                  Ver detalle
                  <ChevronRight className="h-3 w-3" />
                </Link>
              </div>
            ) : (
              <p className="text-[11px] text-[#555068]">Sin citas próximas.</p>
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
                  style={{ background: m.bg }}
                >
                  <Icon className="h-4 w-4" style={{ color: m.color }} />
                </div>
                <p className="text-[22px] font-bold leading-none" style={{ color: m.color }}>
                  {loading ? "—" : m.value}
                </p>
                <p className="mt-1.5 text-[11px] text-[#555068]">{m.label}</p>
              </motion.div>
            );
          })}
        </div>

        {/* FILA 3 — Gráfica + Calendario */}
        <div className="grid grid-cols-1 gap-3 lg:grid-cols-[1fr_240px]">
          <div className={cardClass}>
            <h2 className="text-[12px] font-semibold text-slate-900">Mis citas por día</h2>
            <p className="mt-0.5 text-[11px] text-[#555068]">Últimos 30 días y próximos 14</p>

            <div className="mb-1 mt-3 flex items-center gap-4">
              <span className="flex items-center gap-1.5 text-[11px] text-[#555068]">
                <span
                  className="inline-block h-2 w-2 rounded-full"
                  style={{ background: CHART_BAR_COLORS.hoy }}
                />
                Hoy
              </span>
              <span className="flex items-center gap-1.5 text-[11px] text-[#555068]">
                <span
                  className="inline-block h-2 w-2 rounded-full"
                  style={{ background: CHART_BAR_COLORS.pasado }}
                />
                Pasado
              </span>
              <span className="flex items-center gap-1.5 text-[11px] text-[#555068]">
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
                  <CartesianGrid vertical={false} stroke="#E4DFF0" />
                  <XAxis
                    dataKey="date"
                    tick={{ fontSize: 10, fill: "#555068" }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis
                    tick={{ fontSize: 10, fill: "#555068" }}
                    axisLine={false}
                    tickLine={false}
                    allowDecimals={false}
                  />
                  <Tooltip
                    cursor={{ fill: "transparent" }}
                    contentStyle={{
                      background: "#FFFFFF",
                      border: "0.5px solid #E4DFF0",
                      borderRadius: 10,
                      fontSize: 12,
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

        {/* FILA 4 — Mis mascotas + Acciones rápidas */}
        <div className="grid grid-cols-1 gap-3 lg:grid-cols-[1fr_240px]">
          <div className={cardClass}>
            <div className="mb-3 flex items-center gap-2">
              <Activity className="h-4 w-4 text-[#6366F1]" />
              <h3 className="text-[12px] font-semibold text-slate-900">Mis mascotas</h3>
            </div>
            {loading ? (
              <p className="text-[11px] text-[#555068]">Cargando...</p>
            ) : mascotas.length === 0 ? (
              <p className="text-[11px] text-[#555068]">No tienes mascotas registradas.</p>
            ) : (
              <div className="space-y-3">
                {mascotas.slice(0, 5).map((mascota) => (
                  <Link
                    key={mascota.id}
                    href="/cliente/mascotas"
                    className="flex items-center gap-3"
                  >
                    <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-[#EEF2FF] text-[11px] font-bold text-[#6366F1]">
                      {mascota.nombre.charAt(0)}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-[11px] font-semibold text-slate-900">
                        {mascota.nombre}
                      </p>
                      <p className="text-[11px] text-[#555068]">
                        {mascota.especie}
                        {mascota.raza ? ` · ${mascota.raza}` : ""}
                      </p>
                    </div>
                    <ChevronRight className="h-3.5 w-3.5 shrink-0 text-slate-300" />
                  </Link>
                ))}
              </div>
            )}
          </div>

          {/* Acciones rápidas */}
          <div className={cardClass}>
            <div className="mb-3 flex items-center gap-2">
              <Zap className="h-4 w-4 text-[#6366F1]" />
              <h3 className="text-[12px] font-semibold text-slate-900">Acciones rápidas</h3>
            </div>
            <div className="space-y-2">
              <Link
                href="/cliente/agendar/nueva"
                className="flex w-full items-center gap-2 rounded-[9px] border-[0.5px] border-[#E4DFF0] bg-[#F7F6FA] px-3 py-2 text-[11px] font-semibold text-slate-700 transition hover:border-[#6366F1]/30 hover:bg-[#EEF2FF]"
              >
                <CalendarPlus className="h-3.5 w-3.5 text-[#6366F1]" />
                Agendar cita
              </Link>
              <Link
                href="/cliente/mascotas"
                className="flex w-full items-center gap-2 rounded-[9px] border-[0.5px] border-[#E4DFF0] bg-[#F7F6FA] px-3 py-2 text-[11px] font-semibold text-slate-700 transition hover:border-[#6366F1]/30 hover:bg-[#EEF2FF]"
              >
                <PawPrint className="h-3.5 w-3.5 text-[#6366F1]" />
                Mis mascotas
              </Link>
              <Link
                href="/cliente/citas"
                className="flex w-full items-center gap-2 rounded-[9px] border-[0.5px] border-[#E4DFF0] bg-[#F7F6FA] px-3 py-2 text-[11px] font-semibold text-slate-700 transition hover:border-[#6366F1]/30 hover:bg-[#EEF2FF]"
              >
                <CalendarDays className="h-3.5 w-3.5 text-[#6366F1]" />
                Ver citas
              </Link>
              <Link
                href="/cliente/configuracion"
                className="flex w-full items-center gap-2 rounded-[9px] border-[0.5px] border-[#E4DFF0] bg-[#F7F6FA] px-3 py-2 text-[11px] font-semibold text-slate-700 transition hover:border-[#6366F1]/30 hover:bg-[#EEF2FF]"
              >
                <Settings className="h-3.5 w-3.5 text-[#6366F1]" />
                Mi perfil
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
