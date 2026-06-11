"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useAuth } from "@/lib/auth-context";
import { fetchCitas } from "../../../lib/api/citas";
import type { Appointment } from "../../../lib/recepcionista/types";
import { SkeletonCardList } from "../../components/ui/Skeleton";
import { StatusBadge } from "../../../lib/utils/status-badge";
import type { AppointmentStatus } from "../../../lib/utils/status";
import { Syringe, CalendarDays } from "lucide-react";

function esVacuna(service: string) {
  return /vacun/i.test(service);
}

export default function ClientVacunasPage() {
  const [citas, setCitas] = useState<Appointment[]>([]);
  const [cargando, setCargando] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    if (!user) return;
    fetchCitas(Number(user.id))
      .then((data) => {
        const vacunas = data.filter((c) => esVacuna(c.service ?? ""));
        setCitas(vacunas.sort((a, b) => b.date.localeCompare(a.date)));
      })
      .catch(() => {})
      .finally(() => setCargando(false));
  }, [user]);

  const hoy = new Date().toISOString().slice(0, 10);

  const proximas = useMemo(
    () =>
      citas.filter(
        (c) => c.date >= hoy && !["Cancelada", "Finalizada", "No asistió"].includes(c.status),
      ),
    [citas, hoy],
  );
  const pasadas = useMemo(
    () =>
      citas.filter(
        (c) => c.date < hoy || ["Finalizada", "No asistió", "Cancelada"].includes(c.status),
      ),
    [citas, hoy],
  );

  return (
    <div className="h-full overflow-y-auto bg-surface-50 px-6 py-8 dark:bg-surface-950">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-page-title">Vacunas</h1>
        <p className="text-subtitle mt-2">
          Consulta las vacunas pendientes y el historial de vacunación de tus mascotas.
        </p>
      </div>

      {/* Stats */}
      <div className="mb-8 grid grid-cols-2 gap-5 md:grid-cols-3">
        <StatCard title="Total vacunaciones" value={citas.length} />
        <StatCard title="Próximas" value={proximas.length} color="blue" />
        <StatCard
          title="Aplicadas"
          value={citas.filter((c) => c.status === "Finalizada").length}
          color="green"
        />
      </div>

      {cargando ? (
        <SkeletonCardList count={4} />
      ) : citas.length === 0 ? (
        <EmptyState />
      ) : (
        <div className="space-y-8">
          {proximas.length > 0 && (
            <section>
              <SectionHeader label="Próximas vacunaciones" count={proximas.length} />
              <div className="mt-4 space-y-3">
                {proximas.map((c) => (
                  <VacunaCard key={c.id} cita={c} destacada />
                ))}
              </div>
            </section>
          )}

          {pasadas.length > 0 && (
            <section>
              <SectionHeader label="Historial de vacunación" count={pasadas.length} />
              <div className="mt-4 space-y-3">
                {pasadas.map((c) => (
                  <VacunaCard key={c.id} cita={c} />
                ))}
              </div>
            </section>
          )}
        </div>
      )}

      {/* CTA */}
      <div className="mt-8 rounded-2xl border border-surface-200 bg-white p-6 shadow-card dark:border-surface-700 dark:bg-surface-900">
        <h2 className="text-section-title">¿Necesitas agendar una vacunación?</h2>
        <p className="text-body mt-2">
          Agenda una cita de vacunación para tu mascota y mantén su esquema al día.
        </p>
        <Link href="/cliente/agendar/nueva" className="btn-primary mt-4">
          Agendar vacunación
        </Link>
      </div>
    </div>
  );
}

function VacunaCard({ cita, destacada }: { cita: Appointment; destacada?: boolean }) {
  const fecha = cita.date
    ? new Date(cita.date + "T00:00:00").toLocaleDateString("es-CO", {
        day: "numeric",
        month: "long",
        year: "numeric",
      })
    : "—";

  return (
    <article
      className={`rounded-2xl border p-5 shadow-card transition-all duration-200 hover:-translate-y-0.5 hover:shadow-card-hover ${
        destacada
          ? "border-brand-200 bg-brand-50/60 dark:border-brand-800 dark:bg-brand-950/20"
          : "border-surface-200 bg-white dark:border-surface-700 dark:bg-surface-900"
      }`}
    >
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          <div
            className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ${
              destacada
                ? "bg-brand-100 text-brand-600 dark:bg-brand-900/40 dark:text-brand-300"
                : "bg-success-100 text-success-700 dark:bg-success-900/30 dark:text-success-400"
            }`}
          >
            <Syringe className="h-[22px] w-[22px]" />
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <p className="text-sm font-semibold text-surface-900 dark:text-white">
                {cita.petName || "—"}
              </p>
              <StatusBadge status={cita.status as AppointmentStatus} />
            </div>
            <p className="mt-1 text-sm text-surface-600 dark:text-surface-300">{cita.service}</p>
            {cita.veterinarian && (
              <p className="mt-0.5 text-xs text-surface-500 dark:text-surface-400">
                Dr. {cita.veterinarian}
              </p>
            )}
          </div>
        </div>
        <div className="flex shrink-0 items-center gap-1.5 text-xs text-surface-500 dark:text-surface-400">
          <CalendarDays className="h-[15px] w-[15px]" />
          <span>
            {fecha}
            {cita.time ? ` · ${cita.time}` : ""}
          </span>
        </div>
      </div>
    </article>
  );
}

function SectionHeader({ label, count }: { label: string; count: number }) {
  return (
    <div className="flex items-center gap-3">
      <h2 className="text-caption">{label}</h2>
      <span className="h-px flex-1 bg-surface-200 dark:bg-surface-700" />
      <span className="rounded-lg bg-surface-100 px-2.5 py-0.5 text-xs font-semibold text-surface-500 dark:bg-surface-800 dark:text-surface-400">
        {count}
      </span>
    </div>
  );
}

function StatCard({
  title,
  value,
  color,
}: {
  title: string;
  value: number;
  color?: "green" | "blue";
}) {
  const valueClass =
    color === "green"
      ? "text-success-600 dark:text-success-400"
      : color === "blue"
        ? "text-brand-600 dark:text-brand-400"
        : "text-surface-900 dark:text-white";
  return (
    <article className="rounded-2xl border border-surface-200 bg-white px-5 py-4 shadow-card dark:border-surface-700 dark:bg-surface-900">
      <p className="text-label">{title}</p>
      <h3 className={`text-stat-sm mt-2 ${valueClass}`}>{value}</h3>
    </article>
  );
}

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-surface-300 bg-white py-20 text-center dark:border-surface-700 dark:bg-surface-900">
      <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-success-100 text-success-700 dark:bg-success-900/30 dark:text-success-400">
        <Syringe className="h-7 w-7" />
      </div>
      <p className="text-sm font-semibold text-surface-900 dark:text-white">
        Sin vacunaciones registradas
      </p>
      <p className="mt-2 text-sm text-surface-500 dark:text-surface-400">
        Agenda una cita de vacunación para mantener a tus mascotas protegidas.
      </p>
      <Link href="/cliente/agendar/nueva" className="btn-primary mt-6">
        Agendar ahora
      </Link>
    </div>
  );
}
