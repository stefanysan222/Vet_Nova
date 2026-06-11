"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
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
import { CalendarDays, PawPrint, Clock, Plus, ChevronRight } from "lucide-react";

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
  const restoCitas = proximas.slice(1, 4);
  const citasHoy = citas.filter((c) => c.date === today).length;

  const formatDate = (iso: string) => {
    const d = new Date(iso + "T00:00:00");
    return d.toLocaleDateString("es-CO", { weekday: "long", day: "numeric", month: "long" });
  };

  const statsData = [
    {
      icon: CalendarDays,
      label: "Citas hoy",
      value: String(citasHoy),
      accentBar: "bg-brand-500",
      iconBg: "bg-brand-50 text-brand-600 dark:bg-brand-900/30 dark:text-brand-400",
    },
    {
      icon: PawPrint,
      label: "Mascotas",
      value: String(mascotas.length),
      accentBar: "bg-success-500",
      iconBg: "bg-success-50 text-success-600 dark:bg-success-950/40 dark:text-success-400",
    },
    {
      icon: Clock,
      label: "Próximas",
      value: String(proximas.length),
      accentBar: "bg-warning-500",
      iconBg: "bg-warning-50 text-warning-600 dark:bg-warning-950/40 dark:text-warning-400",
      extra: "col-span-2 sm:col-span-1",
    },
  ];

  return (
    <div className="admin-page h-full overflow-y-auto">
      {/* Encabezado */}
      <motion.div
        className="mb-6"
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
      >
        <h1 className="text-page-title">
          Hola, <NombreCliente /> 🐾
        </h1>
        <p className="text-subtitle mt-1">
          {loading
            ? "Cargando tu información..."
            : proximas.length > 0
              ? `Tienes ${proximas.length} cita${proximas.length > 1 ? "s" : ""} próxima${proximas.length > 1 ? "s" : ""}.`
              : "No tienes citas próximas. ¿Agendamos una?"}
        </p>
      </motion.div>

      {/* Stats compactos */}
      <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-3">
        {statsData.map((s, i) => (
          <motion.div
            key={s.label}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, delay: 0.1 + i * 0.07 }}
            className={s.extra}
          >
            <StatCard
              icon={s.icon}
              label={s.label}
              value={loading ? "—" : s.value}
              accentBar={s.accentBar}
              iconBg={s.iconBg}
            />
          </motion.div>
        ))}
      </div>

      <div className="grid gap-5 lg:grid-cols-[1fr_320px]">
        {/* Columna izquierda: citas */}
        <div className="space-y-4">
          {/* Próxima cita */}
          {loading ? (
            <div className="h-40 animate-pulse rounded-2xl bg-slate-200 dark:bg-slate-800" />
          ) : proximaCita ? (
            <section className="admin-header-banner">
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-brand-200">
                Próxima cita
              </p>
              <div className="mt-3 flex items-start justify-between gap-4">
                <div>
                  <h2 className="text-2xl font-bold">{proximaCita.petName}</h2>
                  <p className="mt-1 text-sm text-brand-100">{proximaCita.service || "Consulta"}</p>
                  <p className="mt-3 text-sm text-brand-100">
                    {formatDate(proximaCita.date)} · {proximaCita.time}
                  </p>
                  {proximaCita.veterinarian && (
                    <p className="mt-1 text-xs text-brand-200">{proximaCita.veterinarian}</p>
                  )}
                </div>
                <StatusBadge status={proximaCita.status as AppointmentStatus} />
              </div>
              <Link
                href="/cliente/agendar"
                className="mt-5 inline-flex items-center gap-1.5 rounded-xl bg-white/15 px-4 py-2 text-sm font-semibold text-white transition hover:bg-white/25"
              >
                Ver detalle
                <ChevronRight className="h-4 w-4" />
              </Link>
            </section>
          ) : (
            <section className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-white py-12 text-center shadow-xs dark:border-slate-700 dark:bg-slate-900">
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-brand-50 text-brand-600 dark:bg-brand-900/30 dark:text-brand-400">
                <CalendarDays className="h-6 w-6" />
              </div>
              <p className="mt-4 text-base font-semibold text-slate-900 dark:text-white">
                Sin citas próximas
              </p>
              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                Agenda una cita para comenzar.
              </p>
              <Link href="/cliente/agendar/nueva" className="btn-primary mt-5">
                <Plus className="h-4 w-4" />
                Agendar cita
              </Link>
            </section>
          )}

          {/* Resto de citas próximas */}
          {restoCitas.length > 0 && (
            <section className="admin-card">
              <div className="flex items-center justify-between border-b border-slate-200/80 px-5 py-4 dark:border-slate-700">
                <h3 className="text-section-title">Otras citas próximas</h3>
                <Link
                  href="/cliente/agendar"
                  className="text-xs font-semibold text-brand-600 hover:underline dark:text-brand-400"
                >
                  Ver todas
                </Link>
              </div>
              <div className="divide-y divide-slate-200/80 dark:divide-slate-700">
                {restoCitas.map((cita) => (
                  <div key={cita.id} className="flex items-center justify-between gap-4 px-5 py-3">
                    <div>
                      <p className="text-sm font-semibold text-slate-900 dark:text-white">
                        {cita.petName}
                      </p>
                      <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
                        {formatDate(cita.date)} · {cita.time}
                      </p>
                    </div>
                    <StatusBadge status={cita.status as AppointmentStatus} />
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Botón agendar */}
          <Link
            href="/cliente/agendar/nueva"
            className="btn-primary flex w-full items-center justify-center gap-2"
          >
            <Plus className="h-4 w-4" />
            Agendar nueva cita
          </Link>
        </div>

        {/* Columna derecha: mascotas */}
        <aside className="space-y-4">
          <section className="admin-card">
            <div className="flex items-center justify-between border-b border-slate-200/80 px-5 py-4 dark:border-slate-700">
              <h3 className="text-section-title">Mis mascotas</h3>
              <Link
                href="/cliente/mascotas"
                className="text-xs font-semibold text-brand-600 hover:underline dark:text-brand-400"
              >
                Ver todas
              </Link>
            </div>

            {loading ? (
              <div className="space-y-3 p-4">
                {[1, 2].map((i) => (
                  <div
                    key={i}
                    className="h-14 animate-pulse rounded-xl bg-slate-100 dark:bg-slate-800"
                  />
                ))}
              </div>
            ) : mascotas.length === 0 ? (
              <div className="flex flex-col items-center py-8 text-center">
                <PawPrint className="h-8 w-8 text-slate-300 dark:text-slate-600" />
                <p className="mt-3 text-sm text-slate-500 dark:text-slate-400">
                  No tienes mascotas registradas.
                </p>
              </div>
            ) : (
              <div className="divide-y divide-slate-200/80 dark:divide-slate-700">
                {mascotas.slice(0, 5).map((mascota) => (
                  <Link
                    key={mascota.id}
                    href="/cliente/mascotas"
                    className="flex items-center gap-3 px-5 py-3 transition hover:bg-slate-50 dark:hover:bg-slate-800/50"
                  >
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-50 text-lg font-bold text-brand-600 dark:bg-brand-900/30 dark:text-brand-400">
                      {mascota.nombre.charAt(0)}
                    </div>
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-slate-900 dark:text-white">
                        {mascota.nombre}
                      </p>
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        {mascota.especie}
                        {mascota.raza ? ` · ${mascota.raza}` : ""}
                      </p>
                    </div>
                    <ChevronRight className="ml-auto h-4 w-4 shrink-0 text-slate-300 dark:text-slate-600" />
                  </Link>
                ))}
              </div>
            )}
          </section>
        </aside>
      </div>
    </div>
  );
}

function StatCard({
  icon: Icon,
  label,
  value,
  accentBar,
  iconBg,
  className = "",
}: {
  icon: React.ElementType;
  label: string;
  value: string;
  accentBar: string;
  iconBg: string;
  className?: string;
}) {
  return (
    <div
      className={`admin-card relative flex items-center gap-3 overflow-hidden px-4 py-3.5 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-card-hover ${className}`}
    >
      <div className={`absolute inset-y-0 left-0 w-1 rounded-l-2xl ${accentBar}`} />
      <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${iconBg}`}>
        <Icon className="h-4 w-4" />
      </div>
      <div>
        <p className="text-label">{label}</p>
        <p className="mt-0.5 text-lg font-bold text-slate-900 dark:text-white">{value}</p>
      </div>
    </div>
  );
}
