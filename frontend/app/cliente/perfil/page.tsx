"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useAuth } from "@/lib/auth-context";
import { fetchMascotas } from "@/lib/api/mascotas";
import { fetchCitas } from "@/lib/api/citas";
import { fetchPropietarioByUsuario } from "@/lib/api/propietarios";
import type { Appointment, PetRecord } from "@/lib/recepcionista/types";

type Stats = { mascotas: number; citas: number };

export default function PerfilPage() {
  const { user } = useAuth();
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
  }, [user]);

  return (
    <div className="h-full overflow-y-auto bg-surface-50 px-6 py-8 dark:bg-surface-950">
      <div className="mb-8">
        <h1 className="text-page-title">Mi Perfil</h1>
        <p className="text-subtitle mt-2">Vista general de tu cuenta en VetNova</p>
      </div>

      <div className="grid grid-cols-1 gap-7 xl:grid-cols-[0.75fr_1fr]">
        <section className="rounded-xl border border-surface-200 bg-white p-7 shadow-sm dark:border-surface-700 dark:bg-surface-900">
          <div className="flex flex-col items-center text-center">
            <div className="flex h-24 w-24 items-center justify-center rounded-full bg-brand-600 text-3xl font-semibold text-white">
              {iniciales}
            </div>

            <h2 className="mt-5 text-xl font-semibold text-surface-900 dark:text-white">
              {nombre} {apellido}
            </h2>

            <p className="mt-2 text-sm text-surface-500 dark:text-surface-400">Cliente</p>

            <span className="mt-4 rounded-lg bg-success-100 px-4 py-1.5 text-xs font-semibold text-success-700 dark:bg-success-900/30 dark:text-success-400">
              Cuenta activa
            </span>
          </div>

          <div className="mt-8 space-y-4 border-t border-surface-200 pt-6 dark:border-surface-700">
            <InfoRow label="Email" value={email || "—"} />
            <InfoRow label="Teléfono" value={perfilTelefono || "—"} />
          </div>

          <Link href="/cliente/configuracion" className="btn-primary mt-8 w-full">
            Configuración del perfil
          </Link>
        </section>

        <section className="space-y-7">
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
            <ProfileStat title="Mascotas" value={String(stats.mascotas)} />
            <ProfileStat title="Citas activas" value={String(stats.citas)} />
          </div>

          <div className="rounded-xl border border-surface-200 bg-white p-7 shadow-sm dark:border-surface-700 dark:bg-surface-900">
            <h3 className="text-section-title">Resumen de actividad</h3>

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

          <div className="rounded-xl border border-surface-200 bg-white p-7 shadow-sm dark:border-surface-700 dark:bg-surface-900">
            <h3 className="text-section-title">Accesos rápidos</h3>

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
      <span className="text-sm text-surface-500 dark:text-surface-400">{label}</span>
      <span className="text-right text-sm font-semibold text-surface-900 dark:text-white">
        {value}
      </span>
    </div>
  );
}

function ProfileStat({ title, value }: { title: string; value: string }) {
  return (
    <article className="rounded-2xl border border-surface-200 bg-white p-5 shadow-card dark:border-surface-700 dark:bg-surface-900">
      <p className="text-label">{title}</p>
      <h3 className="text-stat-sm mt-3">{value}</h3>
    </article>
  );
}

function ActivityItem({ title, description }: { title: string; description: string }) {
  return (
    <div className="border-b border-surface-200 pb-4 last:border-b-0 last:pb-0 dark:border-surface-700">
      <h4 className="text-sm font-semibold text-surface-900 dark:text-white">{title}</h4>
      <p className="mt-2 text-sm text-surface-500 dark:text-surface-400">{description}</p>
    </div>
  );
}

function QuickLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      className="rounded-xl border border-surface-200 bg-white px-5 py-4 text-sm font-semibold text-surface-900 transition-colors hover:border-brand-400 hover:text-brand-600 dark:border-surface-700 dark:bg-surface-950 dark:text-white dark:hover:bg-surface-800"
    >
      {children}
    </Link>
  );
}
