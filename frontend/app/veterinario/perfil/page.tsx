"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { getCurrentUser } from "../../../lib/auth";
import { fetchCitas } from "../../../lib/api/citas";
import { fetchMiPerfilVeterinario, type VeterinarioPerfilAPI } from "../../../lib/api/veterinarios";
import type { Appointment } from "../../../lib/recepcionista/types";

function fechaHoy(): string {
  return new Date().toISOString().slice(0, 10);
}

export default function PerfilVeterinarioPage() {
  const user = getCurrentUser();
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
    <div className="h-full overflow-y-auto bg-[#F5F7FB] px-6 py-8 dark:bg-[#0F172A]">
      <div className="mb-8">
        <h1 className="text-[24px] font-semibold leading-none text-[#10213A] dark:text-white">
          Mi Perfil
        </h1>
        <p className="mt-4 text-[16px] text-[#64748B] dark:text-[#94A3B8]">
          Consulta tus datos personales y la información profesional asociada a tu cuenta.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-7 xl:grid-cols-[0.75fr_1fr]">
        {/* TARJETA PRINCIPAL */}
        <section className="rounded-xl border border-[#CBD5E1] bg-white p-7 shadow-sm transition-all duration-300 ease-out hover:-translate-y-1 hover:border-[#2F6BFF]/60 hover:shadow-[0_14px_30px_rgba(15,23,42,0.14)] dark:border-[#334155] dark:bg-[#111827] dark:hover:border-[#2F6BFF]">
          <div className="flex flex-col items-center text-center">
            <div className="flex h-[92px] w-[92px] items-center justify-center rounded-full bg-[#2F6BFF] text-[36px] font-semibold text-white">
              {inicial}
            </div>

            <h2 className="mt-5 text-[24px] font-semibold text-[#10213A] dark:text-white">
              {nombre}
            </h2>

            <p className="mt-2 text-[15px] text-[#64748B] dark:text-[#94A3B8]">Veterinario</p>

            <span className="mt-4 rounded-full bg-[#DDF5DE] px-4 py-1.5 text-[13px] font-semibold text-[#2F9E44] dark:bg-[#123B22] dark:text-[#86EFAC]">
              Perfil activo
            </span>
          </div>

          <div className="mt-8 space-y-4 border-t border-[#E2E8F0] pt-6 dark:border-[#334155]">
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
            className="mt-8 flex h-[45px] w-full items-center justify-center rounded-xl bg-[#2F6BFF] text-[15px] font-semibold text-white shadow-sm transition-all duration-300 ease-out hover:-translate-y-0.5 hover:bg-[#2457D6] hover:shadow-[0_10px_20px_rgba(47,107,255,0.28)]"
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
          <div className="rounded-xl border border-[#CBD5E1] bg-white p-7 shadow-sm transition-all duration-300 ease-out hover:-translate-y-1 hover:border-[#2F6BFF]/60 hover:shadow-[0_14px_30px_rgba(15,23,42,0.14)] dark:border-[#334155] dark:bg-[#111827] dark:hover:border-[#2F6BFF]">
            <h3 className="text-[20px] font-semibold text-[#10213A] dark:text-white">
              Actividad reciente
            </h3>

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
          <div className="rounded-xl border border-[#CBD5E1] bg-white p-7 shadow-sm transition-all duration-300 ease-out hover:-translate-y-1 hover:border-[#2F6BFF]/60 hover:shadow-[0_14px_30px_rgba(15,23,42,0.14)] dark:border-[#334155] dark:bg-[#111827] dark:hover:border-[#2F6BFF]">
            <h3 className="text-[20px] font-semibold text-[#10213A] dark:text-white">
              Accesos rápidos
            </h3>

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
      <span className="text-[14px] text-[#64748B] dark:text-[#94A3B8]">{label}</span>
      <span className="text-right text-[14px] font-semibold text-[#10213A] dark:text-white">
        {value}
      </span>
    </div>
  );
}

function ProfileStat({ title, value }: { title: string; value: string }) {
  return (
    <article className="rounded-xl border border-[#CBD5E1] bg-white p-5 shadow-sm transition-all duration-300 ease-out hover:-translate-y-1 hover:border-[#2F6BFF]/60 hover:shadow-[0_14px_30px_rgba(15,23,42,0.14)] dark:border-[#334155] dark:bg-[#111827] dark:hover:border-[#2F6BFF]">
      <p className="text-[14px] text-[#64748B] dark:text-[#94A3B8]">{title}</p>
      <h3 className="mt-3 text-[26px] font-semibold text-[#10213A] dark:text-white">{value}</h3>
    </article>
  );
}

function ActivityItem({ title, description }: { title: string; description: string }) {
  return (
    <div className="border-b border-[#E2E8F0] pb-4 last:border-b-0 last:pb-0 dark:border-[#334155]">
      <h4 className="text-[15px] font-semibold text-[#10213A] dark:text-white">{title}</h4>
      <p className="mt-2 text-[14px] text-[#64748B] dark:text-[#94A3B8]">{description}</p>
    </div>
  );
}

function QuickLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      className="flex h-[48px] items-center justify-center rounded-xl border border-[#CBD5E1] bg-[#F8FAFC] text-[14px] font-semibold text-[#475569] transition hover:border-[#2F6BFF] hover:bg-[#EFF6FF] hover:text-[#2F6BFF] dark:border-[#334155] dark:bg-[#0F172A] dark:text-[#94A3B8] dark:hover:border-[#2F6BFF] dark:hover:text-[#93C5FD]"
    >
      {children}
    </Link>
  );
}
