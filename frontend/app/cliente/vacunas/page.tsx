"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useAuth } from "@/lib/auth-context";
import { fetchCitas } from "../../../lib/api/citas";
import type { Appointment } from "../../../lib/recepcionista/types";
import { SkeletonCardList } from "../../components/ui/Skeleton";

function esVacuna(service: string) {
  return /vacun/i.test(service);
}

function estadoBadge(status: string) {
  const styles: Record<string, string> = {
    Finalizada: "bg-[#DDF5DE] text-[#2F9E44] dark:bg-[#123B22] dark:text-[#86EFAC]",
    Confirmada: "bg-[#DBEAFE] text-[#2563EB] dark:bg-[#1E3A8A] dark:text-[#93C5FD]",
    Pendiente: "bg-[#FEF3C7] text-[#B45309] dark:bg-[#78350F] dark:text-[#FDE68A]",
    Cancelada: "bg-[#FFE4E6] text-[#E11D48] dark:bg-[#4C0519] dark:text-[#FDA4AF]",
    "En espera": "bg-[#F1F5F9] text-[#475569] dark:bg-[#1E293B] dark:text-[#CBD5E1]",
    "En atención": "bg-[#EDE9FE] text-[#7C3AED] dark:bg-[#4C1D95] dark:text-[#DDD6FE]",
  };
  return styles[status] ?? styles.Pendiente;
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
    <div className="h-full overflow-y-auto bg-[#F5F7FB] px-6 py-8 dark:bg-[#0F172A]">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-[24px] font-semibold leading-none text-[#10213A] dark:text-white">
          Vacunas
        </h1>
        <p className="mt-4 text-[16px] text-[#64748B] dark:text-[#94A3B8]">
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
      <div className="mt-8 rounded-xl border border-[#CBD5E1] bg-white p-6 shadow-sm dark:border-[#334155] dark:bg-[#111827]">
        <h2 className="text-[16px] font-semibold text-[#10213A] dark:text-white">
          ¿Necesitas agendar una vacunación?
        </h2>
        <p className="mt-2 text-[14px] text-[#64748B] dark:text-[#94A3B8]">
          Agenda una cita de vacunación para tu mascota y mantén su esquema al día.
        </p>
        <Link
          href="/cliente/agendar/nueva"
          className="mt-4 inline-flex h-[44px] items-center justify-center rounded-xl bg-[#2F6BFF] px-6 text-[14px] font-semibold text-white shadow-sm transition hover:-translate-y-0.5 hover:bg-[#2457D6] hover:shadow-[0_10px_20px_rgba(47,107,255,0.28)]"
        >
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
      className={`rounded-xl border p-5 shadow-sm transition-all duration-200 hover:-translate-y-0.5 ${
        destacada
          ? "border-[#BFDBFE] bg-[#EFF6FF] hover:border-[#2F6BFF] hover:shadow-[0_8px_20px_rgba(47,107,255,0.12)] dark:border-[#1E3A8A] dark:bg-[#121D33]"
          : "border-[#CBD5E1] bg-white hover:border-[#2F6BFF]/50 hover:shadow-[0_8px_20px_rgba(15,23,42,0.08)] dark:border-[#334155] dark:bg-[#111827]"
      }`}
    >
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          <div
            className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ${
              destacada
                ? "bg-[#DBEAFE] text-[#2563EB] dark:bg-[#1E3A8A] dark:text-[#93C5FD]"
                : "bg-[#DDF5DE] text-[#2F9E44] dark:bg-[#123B22] dark:text-[#86EFAC]"
            }`}
          >
            <VaccineIcon />
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <p className="text-[15px] font-semibold text-[#10213A] dark:text-white">
                {cita.petName || "—"}
              </p>
              <span
                className={`rounded-full px-2.5 py-0.5 text-[12px] font-semibold ${estadoBadge(cita.status)}`}
              >
                {cita.status}
              </span>
            </div>
            <p className="mt-1 text-[14px] text-[#475569] dark:text-[#CBD5E1]">{cita.service}</p>
            {cita.veterinarian && (
              <p className="mt-0.5 text-[13px] text-[#64748B] dark:text-[#94A3B8]">
                Dr. {cita.veterinarian}
              </p>
            )}
          </div>
        </div>
        <div className="flex shrink-0 items-center gap-1.5 text-[13px] text-[#64748B] dark:text-[#94A3B8]">
          <CalendarIcon />
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
      <h2 className="text-[13px] font-bold uppercase tracking-[0.18em] text-[#64748B] dark:text-[#94A3B8]">
        {label}
      </h2>
      <span className="h-px flex-1 bg-[#E2E8F0] dark:bg-[#334155]" />
      <span className="rounded-full bg-[#F1F5F9] px-2.5 py-0.5 text-[12px] font-semibold text-[#64748B] dark:bg-[#1E293B] dark:text-[#94A3B8]">
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
      ? "text-[#2F9E44]"
      : color === "blue"
        ? "text-[#2563EB]"
        : "text-[#10213A] dark:text-white";
  return (
    <article className="rounded-xl border border-[#CBD5E1] bg-white px-5 py-4 shadow-sm dark:border-[#334155] dark:bg-[#111827]">
      <p className="text-[13px] text-[#64748B] dark:text-[#94A3B8]">{title}</p>
      <h3 className={`mt-2 text-[26px] font-bold ${valueClass}`}>{value}</h3>
    </article>
  );
}

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-[#CBD5E1] bg-white py-20 text-center dark:border-[#334155] dark:bg-[#111827]">
      <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-[#DDF5DE] text-[#2F9E44]">
        <VaccineIcon large />
      </div>
      <p className="text-[16px] font-semibold text-[#10213A] dark:text-white">
        Sin vacunaciones registradas
      </p>
      <p className="mt-2 text-[14px] text-[#64748B] dark:text-[#94A3B8]">
        Agenda una cita de vacunación para mantener a tus mascotas protegidas.
      </p>
      <Link
        href="/cliente/agendar/nueva"
        className="mt-6 inline-flex h-[44px] items-center justify-center rounded-xl bg-[#2F6BFF] px-6 text-[14px] font-semibold text-white transition hover:bg-[#2457D6]"
      >
        Agendar ahora
      </Link>
    </div>
  );
}

function VaccineIcon({ large }: { large?: boolean }) {
  const size = large ? 28 : 22;
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <path
        d="m14 5 5 5M4 20l6.5-6.5M10 7l7 7M8 9l7 7M6.5 17.5 4 15l8-8 5 5-8 8-2.5-2.5Z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function CalendarIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none">
      <path
        d="M7 3v4M17 3v4M4.5 9.5h15M6.5 5h11a2 2 0 0 1 2 2v11.5a2 2 0 0 1-2 2h-11a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2Z"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </svg>
  );
}
