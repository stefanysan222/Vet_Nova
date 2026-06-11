"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Plus } from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { SkeletonBanner, SkeletonStats, SkeletonCardList } from "../components/ui/Skeleton";
import { fetchCitas } from "../../lib/api/citas";
import type { Appointment } from "../../lib/recepcionista/types";
import { StatusBadge } from "../../lib/utils/status-badge";
import type { AppointmentStatus } from "../../lib/utils/status";

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

export default function VeterinarioPage() {
  const [citas, setCitas] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const userName = user?.name ?? "Veterinario";

  useEffect(() => {
    fetchCitas()
      .then(setCitas)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const hoy = fechaHoy();
  const citasHoy = citas.filter((c) => c.date === hoy);
  const atendidas = citasHoy.filter((c) => c.status === "Finalizada");
  const pendientes = citasHoy.filter((c) => c.status !== "Finalizada" && c.status !== "Cancelada");
  const conNotas = citas.filter((c) => c.notes);

  const stats = [
    { title: "Citas de hoy", value: String(citasHoy.length), description: "Agenda programada" },
    {
      title: "Pacientes atendidos",
      value: String(atendidas.length),
      description: "Consultas completadas hoy",
    },
    {
      title: "Consultas pendientes",
      value: String(pendientes.length),
      description: "Pacientes por valorar",
    },
    {
      title: "Tratamientos registrados",
      value: String(conNotas.length),
      description: "Con registro clínico",
    },
  ];

  const agendaDiaria = citasHoy.slice(0, 5);

  const pacientesAtendidos = citas.filter((c) => c.status === "Finalizada").slice(0, 3);

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
    <div className="space-y-6">
      {/* BANNER PRINCIPAL */}
      <section className="overflow-hidden rounded-2xl border border-brand-200 bg-gradient-to-br from-brand-600 to-brand-700 px-8 py-7 text-white shadow-brand">
        <div className="flex flex-col justify-between gap-5 xl:flex-row xl:items-center">
          <div>
            <p className="mb-2 text-xs font-semibold uppercase tracking-[0.24em] text-brand-200">
              Módulo veterinario
            </p>

            <h1 className="text-display">Hola, {userName} 👋</h1>

            <p className="mt-3 max-w-2xl text-sm leading-6 text-brand-100">
              Consulta tu agenda diaria, registra valoraciones y tratamientos, y revisa la historia
              clínica de tus pacientes.
            </p>
          </div>

          <Link
            href="/veterinario/consulta"
            className="flex h-11 shrink-0 items-center justify-center gap-2 rounded-xl bg-white px-6 text-sm font-semibold text-brand-700 shadow-sm transition hover:bg-brand-50"
          >
            <Plus className="h-4 w-4" />
            Registrar consulta
          </Link>
        </div>
      </section>

      {/* ESTADÍSTICAS */}
      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((stat) => (
          <article
            key={stat.title}
            className="rounded-2xl border border-surface-200 bg-white px-5 py-5 shadow-card transition hover:-translate-y-1 hover:shadow-card-hover dark:border-surface-700 dark:bg-surface-900"
          >
            <p className="text-label">{stat.title}</p>

            <p className="text-stat mt-3">{stat.value}</p>

            <p className="mt-2 text-xs text-surface-500 dark:text-surface-400">
              {stat.description}
            </p>
          </article>
        ))}
      </section>

      {/* CONTENIDO */}
      <section className="grid gap-5 xl:grid-cols-[1.25fr_0.95fr]">
        {/* AGENDA DIARIA */}
        <article className="rounded-2xl border border-surface-200 bg-white p-6 shadow-card dark:border-surface-700 dark:bg-surface-900">
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h2 className="text-section-title">Agenda diaria</h2>

              <p className="text-subtitle mt-1">Consultas programadas para hoy.</p>
            </div>

            <Link
              href="/veterinario/citas"
              className="text-sm font-semibold text-brand-600 transition hover:text-brand-700 dark:text-brand-400 dark:hover:text-brand-300"
            >
              Ver agenda completa
            </Link>
          </div>

          <div className="space-y-3">
            {agendaDiaria.length === 0 ? (
              <p className="py-8 text-center text-sm text-surface-500 dark:text-surface-400">
                No hay citas programadas para hoy.
              </p>
            ) : (
              agendaDiaria.map((cita) => (
                <div
                  key={cita.id}
                  className="flex flex-col justify-between gap-4 rounded-2xl border border-surface-200 bg-surface-50 px-4 py-4 dark:border-surface-700 dark:bg-surface-950 sm:flex-row sm:items-center"
                >
                  <div className="flex items-center gap-4">
                    <div className="flex h-12 w-[60px] shrink-0 items-center justify-center rounded-xl bg-brand-100 text-sm font-bold text-brand-600 dark:bg-brand-900/40 dark:text-brand-300">
                      {cita.time}
                    </div>

                    <div>
                      <p className="text-sm font-semibold text-surface-900 dark:text-white">
                        {cita.petName}{" "}
                        <span className="font-normal text-surface-500 dark:text-surface-400">
                          · {cita.petEspecie ?? ""}
                        </span>
                      </p>

                      <p className="mt-1 text-xs text-surface-500 dark:text-surface-400">
                        {cita.ownerName} · {cita.service}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <StatusBadge status={cita.status as AppointmentStatus} />

                    {cita.status !== "Finalizada" && cita.status !== "Cancelada" && (
                      <Link
                        href="/veterinario/consulta"
                        className="rounded-lg border border-brand-200 bg-white px-3 py-2 text-xs font-semibold text-brand-600 transition hover:bg-brand-50 dark:border-surface-700 dark:bg-surface-900 dark:text-brand-400 dark:hover:bg-brand-950/30"
                      >
                        Atender
                      </Link>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </article>

        {/* PACIENTES ATENDIDOS */}
        <article className="rounded-2xl border border-surface-200 bg-white p-6 shadow-card dark:border-surface-700 dark:bg-surface-900">
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h2 className="text-section-title">Pacientes atendidos</h2>

              <p className="text-subtitle mt-1">Últimas valoraciones registradas.</p>
            </div>

            <Link
              href="/veterinario/mascotas"
              className="text-sm font-semibold text-brand-600 transition hover:text-brand-700 dark:text-brand-400 dark:hover:text-brand-300"
            >
              Ver todos
            </Link>
          </div>

          <div className="space-y-3">
            {pacientesAtendidos.length === 0 ? (
              <p className="py-8 text-center text-sm text-surface-500 dark:text-surface-400">
                No hay pacientes atendidos recientemente.
              </p>
            ) : (
              pacientesAtendidos.map((cita) => {
                const notas = parseNotas(cita.notes);
                return (
                  <div
                    key={cita.id}
                    className="rounded-2xl border border-surface-200 px-4 py-4 dark:border-surface-700"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-sm font-semibold text-surface-900 dark:text-white">
                          {cita.petName}
                        </p>

                        <p className="mt-1 text-xs text-surface-500 dark:text-surface-400">
                          Propietario: {cita.ownerName}
                        </p>
                      </div>

                      <span className="text-xs text-surface-400">{cita.date}</span>
                    </div>

                    <div className="mt-3 rounded-xl bg-surface-50 px-3 py-3 text-xs dark:bg-surface-950">
                      <p className="text-surface-600 dark:text-surface-300">
                        <span className="font-semibold">Diagnóstico:</span>{" "}
                        {notas.diagnostico ?? cita.service}
                      </p>

                      {notas.tratamiento && (
                        <p className="mt-1 text-surface-600 dark:text-surface-300">
                          <span className="font-semibold">Tratamiento:</span> {notas.tratamiento}
                        </p>
                      )}
                    </div>

                    <Link
                      href={`/veterinario/historial?paciente=${cita.petId}`}
                      className="mt-3 inline-flex text-xs font-semibold text-brand-600 dark:text-brand-400"
                    >
                      Consultar historial clínico
                    </Link>
                  </div>
                );
              })
            )}
          </div>
        </article>
      </section>
    </div>
  );
}
