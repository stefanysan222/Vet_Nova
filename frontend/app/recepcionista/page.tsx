"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { PawPrint, ShieldCheck } from "lucide-react";
import { getCurrentUser } from "../../lib/auth";
import {
  getAppointments,
  getInventoryItems,
  getOwners,
  getPets,
} from "../../lib/recepcionista/storage";
import type { Appointment, InventoryItem, Owner, PetRecord } from "../../lib/recepcionista/types";

const todayDate = new Date().toISOString().slice(0, 10);

export default function RecepcionistaPage() {
  const [userName, setUserName] = useState("Recepcionista");
  const [owners, setOwners] = useState<Owner[]>([]);
  const [pets, setPets] = useState<PetRecord[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [inventory, setInventory] = useState<InventoryItem[]>([]);

  useEffect(() => {
    setUserName(getCurrentUser()?.name ?? "Recepcionista");

    const loadData = () => {
      setOwners(getOwners());
      setPets(getPets());
      setAppointments(getAppointments());
      setInventory(getInventoryItems());
    };

    loadData();
    window.addEventListener("vetnova-recepcionista-updated", loadData);
    window.addEventListener("storage", loadData);

    return () => {
      window.removeEventListener("vetnova-recepcionista-updated", loadData);
      window.removeEventListener("storage", loadData);
    };
  }, []);

  const pendingCount = useMemo(
    () => appointments.filter((item) => item.status === "Pendiente").length,
    [appointments],
  );

  const lowStockCount = useMemo(
    () => inventory.filter((item) => item.status !== "Disponible").length,
    [inventory],
  );

  const todayAppointments = useMemo(
    () => appointments.filter((item) => item.date === todayDate),
    [appointments],
  );

  return (
    <div className="space-y-6">
      <section className="rounded-[28px] bg-gradient-to-r from-[#2563EB] via-[#2385F3] to-[#06A7E9] px-8 py-10 text-white shadow-[0_22px_50px_rgba(37,99,235,0.20)]">
        <div className="flex flex-col gap-6 xl:flex-row xl:items-center xl:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-white/80">Recepcionista</p>
            <h1 className="mt-3 text-4xl font-bold leading-tight">Bienvenido{userName ? `, ${userName}` : ""}</h1>
            <p className="mt-4 max-w-2xl text-base leading-7 text-white/90">
              Gestiona propietarios, mascotas, citas e inventario desde el panel de recepción.
            </p>
          </div>
          <div className="inline-flex items-center gap-2 rounded-full bg-white/15 px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-slate-950/10">
            <ShieldCheck className="h-4 w-4" />
            Recepción activa
          </div>
        </div>
      </section>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <article className="rounded-[20px] border border-slate-200 bg-white px-5 py-6 shadow-sm dark:border-slate-800 dark:bg-slate-950">
          <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Propietarios</p>
          <p className="mt-4 text-3xl font-semibold text-slate-900 dark:text-white">{owners.length}</p>
          <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">Registros disponibles</p>
        </article>
        <article className="rounded-[20px] border border-slate-200 bg-white px-5 py-6 shadow-sm dark:border-slate-800 dark:bg-slate-950">
          <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Mascotas</p>
          <p className="mt-4 text-3xl font-semibold text-slate-900 dark:text-white">{pets.length}</p>
          <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">Fichas activas</p>
        </article>
        <article className="rounded-[20px] border border-slate-200 bg-white px-5 py-6 shadow-sm dark:border-slate-800 dark:bg-slate-950">
          <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Citas pendientes</p>
          <p className="mt-4 text-3xl font-semibold text-slate-900 dark:text-white">{pendingCount}</p>
          <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">Esperan confirmación</p>
        </article>
        <article className="rounded-[20px] border border-slate-200 bg-white px-5 py-6 shadow-sm dark:border-slate-800 dark:bg-slate-950">
          <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Alertas de inventario</p>
          <p className="mt-4 text-3xl font-semibold text-slate-900 dark:text-white">{lowStockCount}</p>
          <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">Productos con stock bajo o agotado</p>
        </article>
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.45fr_0.55fr]">
        <article className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-950">
          <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-xl font-semibold text-slate-900 dark:text-white">Citas de hoy</h2>
              <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">Revisa la agenda y confirma los turnos programados.</p>
            </div>
            <Link href="/recepcionista/citas" className="inline-flex rounded-full bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-700">
              Ver todas las citas
            </Link>
          </div>

          <div className="space-y-4">
            {todayAppointments.length > 0 ? (
              todayAppointments.map((appointment) => (
                <div key={appointment.id} className="rounded-[24px] border border-slate-200 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-900">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <p className="text-sm font-semibold text-slate-900 dark:text-white">{appointment.service}</p>
                      <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{appointment.petName} · {appointment.ownerName}</p>
                    </div>
                    <span className="rounded-full bg-blue-100 px-3 py-1 text-sm font-semibold text-blue-700 dark:bg-blue-900/20 dark:text-blue-200">
                      {appointment.status}
                    </span>
                  </div>
                  <div className="mt-3 flex flex-wrap items-center gap-3 text-sm text-slate-500 dark:text-slate-400">
                    <span>{appointment.time}</span>
                    <span className="inline-flex items-center gap-1 rounded-full bg-white px-3 py-1 text-slate-700 shadow-sm dark:bg-slate-950 dark:text-slate-200">
                      <PawPrint className="h-4 w-4 text-blue-600" />
                      {appointment.veterinarian ?? "Veterinario no asignado"}
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <div className="rounded-[24px] border border-dashed border-slate-300/70 bg-white p-8 text-center dark:border-slate-700 dark:bg-slate-950">
                <p className="text-sm font-semibold text-slate-900 dark:text-white">No hay citas programadas para hoy</p>
                <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">Puedes crear nuevas citas en la sección de citas.</p>
              </div>
            )}
          </div>
        </article>

        <aside className="space-y-6 rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-950">
          <div className="rounded-[24px] border border-slate-200 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-900">
            <p className="text-sm font-semibold text-slate-900 dark:text-white">Acciones rápidas</p>
            <div className="mt-4 grid gap-3">
              <Link href="/recepcionista/usuarios" className="rounded-3xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100">
                Gestionar usuarios
              </Link>
              <Link href="/recepcionista/mascotas" className="rounded-3xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100">
                Gestionar mascotas
              </Link>
              <Link href="/recepcionista/citas" className="rounded-3xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100">
                Agendar cita
              </Link>
              <Link href="/recepcionista/inventario" className="rounded-3xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100">
                Ver inventario
              </Link>
            </div>
          </div>

          <div className="rounded-[24px] border border-slate-200 bg-[#FEF3C7] p-4 dark:border-slate-700 dark:bg-[#423B0C]">
            <p className="text-sm font-semibold text-[#92400E]">Alerta de inventario</p>
            <p className="mt-2 text-sm text-[#92400E]/90">
              {lowStockCount > 0 ? `${lowStockCount} artículo(s) con stock bajo o agotado.` : "Inventario estable."}
            </p>
          </div>
        </aside>
      </section>
    </div>
  );
}
