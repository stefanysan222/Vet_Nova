"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { getCurrentUser } from "../../lib/auth";
import { fetchCitas } from "../../lib/api/citas";
import type { Appointment } from "../../lib/recepcionista/types";
import { getStatusStyle } from "../../lib/utils/status";

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
  const [userName, setUserName] = useState("Veterinario");

  useEffect(() => {
    const u = getCurrentUser();
    if (u?.name) setUserName(u.name);
  }, []);

  useEffect(() => {
    fetchCitas()
      .then(setCitas)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const hoy = fechaHoy();
  const citasHoy = citas.filter((c) => c.date === hoy);
  const atendidas = citasHoy.filter((c) => c.status === "Finalizada");
  const pendientes = citasHoy.filter(
    (c) => c.status !== "Finalizada" && c.status !== "Cancelada"
  );
  const conNotas = citas.filter((c) => c.notes);

  const stats = [
    { title: "Citas de hoy", value: String(citasHoy.length), description: "Agenda programada" },
    { title: "Pacientes atendidos", value: String(atendidas.length), description: "Consultas completadas hoy" },
    { title: "Consultas pendientes", value: String(pendientes.length), description: "Pacientes por valorar" },
    { title: "Tratamientos registrados", value: String(conNotas.length), description: "Con registro clínico" },
  ];

  const agendaDiaria = citasHoy.slice(0, 5);

  const pacientesAtendidos = citas
    .filter((c) => c.status === "Finalizada")
    .slice(0, 3);

  if (loading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <p className="text-[14px] text-[#64748B] dark:text-[#94A3B8]">Cargando agenda...</p>
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

            <h1 className="text-[28px] font-bold leading-tight">
              Hola, {userName} 👋
            </h1>

            <p className="mt-3 max-w-2xl text-sm leading-6 text-brand-100">
              Consulta tu agenda diaria, registra valoraciones y tratamientos,
              y revisa la historia clínica de tus pacientes.
            </p>
          </div>

          <Link
            href="/veterinario/consulta"
            className="flex h-[44px] shrink-0 items-center justify-center rounded-xl bg-white px-6 text-sm font-semibold text-brand-700 shadow-sm transition hover:bg-brand-50"
          >
            + Registrar consulta
          </Link>
        </div>
      </section>

      {/* ESTADÍSTICAS */}
      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((stat) => (
          <article
            key={stat.title}
            className="rounded-[18px] border border-[#E2E8F0] bg-white px-5 py-5 shadow-[0_4px_18px_rgba(15,23,42,0.05)] transition hover:-translate-y-1 hover:shadow-[0_12px_28px_rgba(15,23,42,0.09)] dark:border-[#334155] dark:bg-[#111827]"
          >
            <p className="text-[13px] font-medium text-[#64748B] dark:text-[#94A3B8]">
              {stat.title}
            </p>

            <p className="mt-3 text-[30px] font-bold text-[#10213A] dark:text-white">
              {stat.value}
            </p>

            <p className="mt-2 text-[12px] text-[#64748B] dark:text-[#94A3B8]">
              {stat.description}
            </p>
          </article>
        ))}
      </section>

      {/* CONTENIDO */}
      <section className="grid gap-5 xl:grid-cols-[1.25fr_0.95fr]">
        {/* AGENDA DIARIA */}
        <article className="rounded-[20px] border border-[#E2E8F0] bg-white p-6 shadow-[0_4px_18px_rgba(15,23,42,0.05)] dark:border-[#334155] dark:bg-[#111827]">
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h2 className="text-[19px] font-semibold text-[#10213A] dark:text-white">
                Agenda diaria
              </h2>

              <p className="mt-1 text-[13px] text-[#64748B] dark:text-[#94A3B8]">
                Consultas programadas para hoy.
              </p>
            </div>

            <Link
              href="/veterinario/citas"
              className="text-[14px] font-semibold text-[#2563EB] transition hover:text-[#1D4ED8]"
            >
              Ver agenda completa
            </Link>
          </div>

          <div className="space-y-3">
            {agendaDiaria.length === 0 ? (
              <p className="py-8 text-center text-[14px] text-[#64748B] dark:text-[#94A3B8]">
                No hay citas programadas para hoy.
              </p>
            ) : (
              agendaDiaria.map((cita) => (
                <div
                  key={cita.id}
                  className="flex flex-col justify-between gap-4 rounded-[16px] border border-[#E5EAF2] bg-[#F8FAFC] px-4 py-4 dark:border-[#334155] dark:bg-[#0F172A] sm:flex-row sm:items-center"
                >
                  <div className="flex items-center gap-4">
                    <div className="flex h-[48px] w-[60px] shrink-0 items-center justify-center rounded-xl bg-[#EEF4FF] text-[14px] font-bold text-[#2563EB] dark:bg-[#1E293B] dark:text-[#93C5FD]">
                      {cita.time}
                    </div>

                    <div>
                      <p className="text-[15px] font-semibold text-[#10213A] dark:text-white">
                        {cita.petName}{" "}
                        <span className="font-normal text-[#64748B] dark:text-[#94A3B8]">
                          · {cita.petEspecie ?? ""}
                        </span>
                      </p>

                      <p className="mt-1 text-[13px] text-[#64748B] dark:text-[#94A3B8]">
                        {cita.ownerName} · {cita.service}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className={`inline-flex items-center rounded-full px-3 py-1.5 text-[12px] font-semibold ${getStatusStyle(cita.status).badge}`}>
                      {cita.status}
                    </span>

                    {cita.status !== "Finalizada" && cita.status !== "Cancelada" && (
                      <Link
                        href="/veterinario/consulta"
                        className="rounded-lg border border-[#D6E3FF] bg-white px-3 py-2 text-[12px] font-semibold text-[#2563EB] transition hover:bg-[#EFF6FF] dark:border-[#334155] dark:bg-[#111827]"
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
        <article className="rounded-[20px] border border-[#E2E8F0] bg-white p-6 shadow-[0_4px_18px_rgba(15,23,42,0.05)] dark:border-[#334155] dark:bg-[#111827]">
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h2 className="text-[19px] font-semibold text-[#10213A] dark:text-white">
                Pacientes atendidos
              </h2>

              <p className="mt-1 text-[13px] text-[#64748B] dark:text-[#94A3B8]">
                Últimas valoraciones registradas.
              </p>
            </div>

            <Link
              href="/veterinario/mascotas"
              className="text-[14px] font-semibold text-[#2563EB]"
            >
              Ver todos
            </Link>
          </div>

          <div className="space-y-3">
            {pacientesAtendidos.length === 0 ? (
              <p className="py-8 text-center text-[14px] text-[#64748B] dark:text-[#94A3B8]">
                No hay pacientes atendidos recientemente.
              </p>
            ) : (
              pacientesAtendidos.map((cita) => {
                const notas = parseNotas(cita.notes);
                return (
                  <div
                    key={cita.id}
                    className="rounded-[16px] border border-[#E5EAF2] px-4 py-4 dark:border-[#334155]"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-[15px] font-semibold text-[#10213A] dark:text-white">
                          {cita.petName}
                        </p>

                        <p className="mt-1 text-[13px] text-[#64748B] dark:text-[#94A3B8]">
                          Propietario: {cita.ownerName}
                        </p>
                      </div>

                      <span className="text-[12px] text-[#94A3B8]">
                        {cita.date}
                      </span>
                    </div>

                    <div className="mt-3 rounded-xl bg-[#F8FAFC] px-3 py-3 text-[13px] dark:bg-[#0F172A]">
                      <p className="text-[#475569] dark:text-[#CBD5E1]">
                        <span className="font-semibold">Diagnóstico:</span>{" "}
                        {notas.diagnostico ?? cita.service}
                      </p>

                      {notas.tratamiento && (
                        <p className="mt-1 text-[#475569] dark:text-[#CBD5E1]">
                          <span className="font-semibold">Tratamiento:</span>{" "}
                          {notas.tratamiento}
                        </p>
                      )}
                    </div>

                    <Link
                      href={`/veterinario/historial?paciente=${cita.petId}`}
                      className="mt-3 inline-flex text-[13px] font-semibold text-[#2563EB]"
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
