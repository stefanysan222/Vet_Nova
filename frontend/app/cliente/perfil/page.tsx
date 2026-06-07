"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { getCurrentUser } from "@/lib/auth";
import { fetchMascotas } from "@/lib/api/mascotas";
import { fetchCitas } from "@/lib/api/citas";
import { fetchPropietarioByUsuario } from "@/lib/api/propietarios";
import type { Appointment, PetRecord } from "@/lib/recepcionista/types";

type Stats = { mascotas: number; citas: number };

export default function PerfilPage() {
  const user = getCurrentUser();
  const partes = (user?.name ?? "").trim().split(" ");
  const nombre = partes[0] ?? "";
  const apellido = partes.slice(1).join(" ");
  const iniciales = `${nombre[0] ?? ""}${apellido[0] ?? ""}`.toUpperCase() || "U";
  const email = user?.email ?? "";

  const [stats, setStats] = useState<Stats>({ mascotas: 0, citas: 0 });
  const [ultimaCita, setUltimaCita] = useState<Appointment | null>(null);
  const [ultimaMascota, setUltimaMascota] = useState<PetRecord | null>(null);
  const [perfilTelefono, setPerfilTelefono] = useState("");

  useEffect(() => {
    const uid = user?.id ? Number(user.id) : undefined;

    if (uid) {
      fetchPropietarioByUsuario(uid)
        .then((owner) => setPerfilTelefono(owner?.phone ?? ""))
        .catch(() => {});
    }

    Promise.all([
      fetchMascotas(uid).catch(() => [] as PetRecord[]),
      fetchCitas(uid).catch(() => [] as Appointment[]),
    ]).then(([mascotas, citas]) => {
      const citasActivas = citas.filter(
        (c) => c.status !== "Cancelada" && c.status !== "Finalizada" && c.status !== "No asistió",
      );
      setStats({ mascotas: mascotas.length, citas: citasActivas.length });

      const sorted = [...citas].sort((a, b) => {
        const da = new Date(`${a.date}T${a.time}`).getTime();
        const db = new Date(`${b.date}T${b.time}`).getTime();
        return db - da;
      });
      setUltimaCita(sorted[0] ?? null);

      const sortedMascotas = [...mascotas].sort((a, b) =>
        (b.id ?? "").toString().localeCompare((a.id ?? "").toString()),
      );
      setUltimaMascota(sortedMascotas[0] ?? null);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="h-full overflow-y-auto bg-[#F5F7FB] px-6 py-8 dark:bg-[#0F172A]">
      <div className="mb-8">
        <h1 className="text-[24px] font-semibold leading-none text-[#10213A] dark:text-white">
          Mi Perfil
        </h1>
        <p className="mt-4 text-[16px] text-[#64748B] dark:text-[#94A3B8]">
          Vista general de tu cuenta en VetNova
        </p>
      </div>

      <div className="grid grid-cols-1 gap-7 xl:grid-cols-[0.75fr_1fr]">
        <section className="rounded-xl border border-[#CBD5E1] bg-white p-7 shadow-sm dark:border-[#334155] dark:bg-[#111827]">
          <div className="flex flex-col items-center text-center">
            <div className="flex h-[92px] w-[92px] items-center justify-center rounded-full bg-brand-600 text-[36px] font-semibold text-white">
              {iniciales}
            </div>

            <h2 className="mt-5 text-[24px] font-semibold text-[#10213A] dark:text-white">
              {nombre} {apellido}
            </h2>

            <p className="mt-2 text-[15px] text-[#64748B] dark:text-[#94A3B8]">Cliente</p>

            <span className="mt-4 rounded-full bg-[#DDF5DE] px-4 py-1.5 text-[13px] font-semibold text-[#2F9E44]">
              Cuenta activa
            </span>
          </div>

          <div className="mt-8 space-y-4 border-t border-[#E2E8F0] pt-6 dark:border-[#334155]">
            <InfoRow label="Email" value={email || "—"} />
            <InfoRow label="Teléfono" value={perfilTelefono || "—"} />
          </div>

          <Link
            href="/cliente/configuracion"
            className="mt-8 flex h-[45px] w-full items-center justify-center rounded-xl bg-brand-600 text-[15px] font-semibold text-white shadow-sm transition-colors hover:bg-brand-700"
          >
            Configuración del perfil
          </Link>
        </section>

        <section className="space-y-7">
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
            <ProfileStat title="Mascotas" value={String(stats.mascotas)} />
            <ProfileStat title="Citas activas" value={String(stats.citas)} />
          </div>

          <div className="rounded-xl border border-[#CBD5E1] bg-white p-7 shadow-sm dark:border-[#334155] dark:bg-[#111827]">
            <h3 className="text-[20px] font-semibold text-[#10213A] dark:text-white">
              Resumen de actividad
            </h3>

            <div className="mt-6 space-y-5">
              {ultimaCita ? (
                <ActivityItem
                  title="Última cita registrada"
                  description={`${ultimaCita.petName ?? "Mascota"} · ${ultimaCita.date} ${ultimaCita.time}`}
                />
              ) : (
                <ActivityItem title="Citas" description="Sin citas registradas aún" />
              )}

              {ultimaMascota ? (
                <ActivityItem
                  title="Mascota más reciente"
                  description={`${ultimaMascota.nombre} · ${ultimaMascota.especie}`}
                />
              ) : (
                <ActivityItem title="Mascotas" description="Sin mascotas registradas aún" />
              )}
            </div>
          </div>

          <div className="rounded-xl border border-[#CBD5E1] bg-white p-7 shadow-sm dark:border-[#334155] dark:bg-[#111827]">
            <h3 className="text-[20px] font-semibold text-[#10213A] dark:text-white">
              Accesos rápidos
            </h3>

            <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2">
              <QuickLink href="/cliente/mascotas">Ver mis mascotas</QuickLink>
              <QuickLink href="/cliente/agendar">Ver mis citas</QuickLink>
              <QuickLink href="/cliente/notificaciones">Ver notificaciones</QuickLink>
              <QuickLink href="/cliente/configuracion">Editar configuración</QuickLink>
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
    <article className="rounded-xl border border-[#CBD5E1] bg-white p-5 shadow-sm dark:border-[#334155] dark:bg-[#111827]">
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
      className="rounded-xl border border-[#CBD5E1] bg-white px-5 py-4 text-[15px] font-semibold text-[#10213A] hover:bg-[#F8FAFC] dark:border-[#334155] dark:bg-[#0F172A] dark:text-white dark:hover:bg-[#1E293B]"
    >
      {children}
    </Link>
  );
}
