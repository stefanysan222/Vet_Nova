"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useAuth } from "@/lib/auth-context";
import { fetchCitas } from "../../../lib/api/citas";
import { fetchMiPerfilVeterinario, type VeterinarioPerfilAPI } from "../../../lib/api/veterinarios";
import type { Appointment } from "../../../lib/recepcionista/types";

function fechaHoy(): string {
  return new Date().toISOString().slice(0, 10);
}

export default function PerfilVeterinarioPage() {
  const { user } = useAuth();
  const nombre = user?.name ?? "Veterinario";
  const email = user?.email ?? "—";
  const inicial = nombre.trim()[0]?.toUpperCase() ?? "V";

  const [citas, setCitas] = useState<Appointment[]>([]);
  const [extra, setExtra] = useState<VeterinarioPerfilAPI | null>(null);

  useEffect(() => {
    fetchCitas()
      .then(setCitas)
      .catch(() => {});
    fetchMiPerfilVeterinario()
      .then(setExtra)
      .catch(() => {});
  }, []);

  const hoy = fechaHoy();
  const mesActual = hoy.slice(0, 7);
  const citasHoy = citas.filter((c) => c.date === hoy).length;
  const consultasMes = citas.filter(
    (c) => c.date?.startsWith(mesActual) && c.status === "Finalizada",
  ).length;
  const ultimaCita = [...citas]
    .filter((c) => c.status === "Finalizada")
    .sort((a, b) => b.date.localeCompare(a.date))[0];
  const proximaCita = [...citas]
    .filter((c) => c.date >= hoy && c.status !== "Cancelada" && c.status !== "Finalizada")
    .sort((a, b) => a.date.localeCompare(b.date))[0];

  return (
    <div className="h-full overflow-y-auto bg-surface-50 px-6 py-8 dark:bg-surface-950">
      <div className="mb-8">
        <h1 className="text-page-title">Mi Perfil</h1>
        <p className="text-subtitle mt-2">
          Consulta tus datos personales y la información profesional asociada a tu cuenta.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-7 xl:grid-cols-[0.75fr_1fr]">
        {/* TARJETA PRINCIPAL */}
        <section className="rounded-2xl border border-surface-200 bg-white p-6 shadow-card transition hover:-translate-y-1 hover:shadow-card-hover dark:border-surface-700 dark:bg-surface-900">
          <div className="flex flex-col items-center text-center">
            <div className="flex h-24 w-24 items-center justify-center rounded-full bg-brand-600 text-3xl font-semibold text-white">
              {inicial}
            </div>
            <h2 className="text-section-title mt-5">{nombre}</h2>
            <p className="mt-2 text-sm text-surface-500 dark:text-surface-400">Veterinario</p>
            <span className="mt-4 inline-flex items-center gap-1 rounded-lg bg-success-100 px-2.5 py-1 text-xs font-semibold text-success-700 dark:bg-success-900/40 dark:text-success-300">
              Perfil activo
            </span>
          </div>
          <div className="mt-8 space-y-4 border-t border-surface-100 pt-6 dark:border-surface-800">
            <InfoRow label="Nombre completo" value={nombre} />
            <InfoRow label="Rol" value="Veterinario" />
            <InfoRow label="Email" value={email} />
            <InfoRow label="Teléfono" value={extra?.telefono || "—"} />
            <InfoRow label="Especialidad" value={extra?.especialidad || "—"} />
            <InfoRow label="Registro profesional" value={extra?.registroProfesional || "—"} />
            <InfoRow label="Horario" value={extra?.horarioAtencion || "—"} />
          </div>
          <Link
            href="/veterinario/configuracion"
            className="mt-8 flex h-11 w-full items-center justify-center rounded-xl bg-brand-600 text-sm font-semibold text-white transition hover:bg-brand-700"
          >
            Configurar perfil
          </Link>
        </section>

        {/* COLUMNA DERECHA */}
        <section className="space-y-7">
          <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
            <ProfileStat title="Citas de hoy" value={String(citasHoy)} />
            <ProfileStat title="Consultas del mes" value={String(consultasMes)} />
            <ProfileStat title="Total citas" value={String(citas.length)} />
          </div>

          {/* ACTIVIDAD RECIENTE */}
          <div className="rounded-2xl border border-surface-200 bg-white p-6 shadow-card transition hover:-translate-y-1 hover:shadow-card-hover dark:border-surface-700 dark:bg-surface-900">
            <h3 className="text-section-title">Actividad reciente</h3>
            <div className="mt-6 space-y-5">
              {ultimaCita ? (
                <ActivityItem
                  title="Última consulta registrada"
                  description={`${ultimaCita.petName} · ${ultimaCita.service} · ${ultimaCita.date}`}
                />
              ) : (
                <ActivityItem
                  title="Última consulta registrada"
                  description="Sin consultas finalizadas aún"
                />
              )}
              {proximaCita ? (
                <ActivityItem
                  title="Próxima cita agendada"
                  description={`${proximaCita.petName} · ${proximaCita.service} · ${proximaCita.date} ${proximaCita.time}`}
                />
              ) : (
                <ActivityItem
                  title="Próxima cita agendada"
                  description="Sin citas próximas programadas"
                />
              )}
            </div>
          </div>

          {/* ACCESOS RÁPIDOS */}
          <div className="rounded-2xl border border-surface-200 bg-white p-6 shadow-card transition hover:-translate-y-1 hover:shadow-card-hover dark:border-surface-700 dark:bg-surface-900">
            <h3 className="text-section-title">Accesos rápidos</h3>
            <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2">
              <QuickLink href="/veterinario/mascotas">Ver pacientes</QuickLink>
              <QuickLink href="/veterinario/citas">Ver agenda</QuickLink>
              <QuickLink href="/veterinario/historial">Historial clínico</QuickLink>
              <QuickLink href="/veterinario/configuracion">Configurar perfil</QuickLink>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-4">
      <span className="text-sm text-surface-500 dark:text-surface-400">{label}</span>
      <span className="text-right text-sm font-semibold text-surface-900 dark:text-white">
        {value}
      </span>
    </div>
  );
}

function ProfileStat({ title, value }: { title: string; value: string }) {
  return (
    <article className="rounded-2xl border border-surface-200 bg-white p-5 shadow-card transition hover:-translate-y-1 hover:shadow-card-hover dark:border-surface-700 dark:bg-surface-900">
      <p className="text-label">{title}</p>
      <h3 className="text-stat mt-3">{value}</h3>
    </article>
  );
}

function ActivityItem({ title, description }: { title: string; description: string }) {
  return (
    <div className="border-b border-surface-100 pb-4 last:border-b-0 last:pb-0 dark:border-surface-800">
      <h4 className="text-sm font-semibold text-surface-900 dark:text-white">{title}</h4>
      <p className="mt-2 text-sm text-surface-500 dark:text-surface-400">{description}</p>
    </div>
  );
}

function QuickLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      className="flex h-11 items-center justify-center rounded-xl border border-surface-200 bg-surface-50 text-sm font-semibold text-surface-600 transition hover:border-brand-200 hover:bg-brand-50 hover:text-brand-600 dark:border-surface-700 dark:bg-surface-950 dark:text-surface-300 dark:hover:border-brand-700 dark:hover:text-brand-400"
    >
      {children}
    </Link>
  );
}
