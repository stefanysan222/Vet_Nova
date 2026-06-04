"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  AlertTriangle,
  Bell,
  CalendarDays,
  CheckCircle2,
  Clock,
  ClipboardList,
  PawPrint,
  Send,
  ShieldCheck,
  Stethoscope,
  UserRound,
  XCircle,
} from "lucide-react";
import { getCurrentUser } from "../../lib/auth";
import {
  getAppointments,
  getInventoryItems,
  getOwners,
  getPets,
} from "../../lib/recepcionista/storage";
import type {
  Appointment,
  InventoryItem,
  Owner,
  PetRecord,
} from "../../lib/recepcionista/types";

const cardHover =
  "transition-all duration-300 hover:-translate-y-1 hover:border-blue-200 hover:shadow-[0_18px_45px_rgba(37,99,235,0.12)]";

const softCardHover =
  "transition-all duration-300 hover:-translate-y-0.5 hover:border-blue-200 hover:bg-white hover:shadow-md";

const iconHover =
  "transition-all duration-300 group-hover:scale-110 group-hover:rotate-3";

const buttonHover =
  "transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg active:scale-[0.98]";

const todayDate = new Date().toISOString().slice(0, 10);

function getStatusClass(status: string) {
  switch (status) {
    case "Confirmada": return "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300";
    case "Pendiente": return "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300";
    case "En espera": return "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300";
    case "En atención": return "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300";
    case "Finalizada": return "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300";
    case "Cancelada": return "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300";
    case "No asistió": return "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300";
    default: return "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300";
  }
}

export default function RecepcionistaPage() {
  const [userName, setUserName] = useState("Recepcionista");
  const [owners, setOwners] = useState<Owner[]>([]);
  const [pets, setPets] = useState<PetRecord[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [inventory, setInventory] = useState<InventoryItem[]>([]);

  useEffect(() => {
    setUserName(getCurrentUser()?.name ?? "Recepcionista");

    Promise.all([
      getOwners(),
      getPets(),
      getAppointments(),
      getInventoryItems(),
    ]).then(([o, p, a, i]) => {
      setOwners(o);
      setPets(p);
      setAppointments(a);
      setInventory(i);
    }).catch(console.error);
  }, []);

  const todayAppointments = useMemo(
    () => appointments.filter((item) => item.date === todayDate),
    [appointments],
  );

  const pendingCount = useMemo(
    () => todayAppointments.filter((item) => item.status === "Pendiente").length,
    [todayAppointments],
  );

  const waitingCount = useMemo(
    () => todayAppointments.filter((item) => item.status === "En espera").length,
    [todayAppointments],
  );

  const cancelledCount = useMemo(
    () => todayAppointments.filter((item) => item.status === "Cancelada").length,
    [todayAppointments],
  );

  const confirmedCount = useMemo(
    () => todayAppointments.filter((item) => item.status === "Confirmada").length,
    [todayAppointments],
  );

  const nextAppointments = useMemo(
    () =>
      [...todayAppointments]
        .sort((a, b) => a.time.localeCompare(b.time))
        .slice(0, 5),
    [todayAppointments],
  );

  const petsArrivingToday = useMemo(() => {
    const petNames = new Set(todayAppointments.map((item) => item.petName));
    return petNames.size;
  }, [todayAppointments]);

  const veterinariansToday = useMemo(() => {
    const vets = todayAppointments.map((item) => item.veterinarian).filter(Boolean);
    return Array.from(new Set(vets));
  }, [todayAppointments]);

  const lowStockCount = useMemo(
    () => inventory.filter((item) => item.status !== "Disponible").length,
    [inventory],
  );

  const importantAlerts = useMemo(() => {
    const alerts: string[] = [];
    if (pendingCount > 0) alerts.push(`${pendingCount} cita(s) pendiente(s) por confirmar.`);
    if (waitingCount > 0) alerts.push(`${waitingCount} paciente(s) se encuentran en espera.`);
    if (lowStockCount > 0) alerts.push(`${lowStockCount} producto(s) con stock bajo o agotado.`);
    if (todayAppointments.length === 0) alerts.push("No hay citas programadas para hoy.");
    return alerts;
  }, [pendingCount, waitingCount, lowStockCount, todayAppointments.length]);

  return (
    <div className="space-y-6">
      <section className="group relative overflow-hidden rounded-[32px] bg-gradient-to-r from-[#2563EB] via-[#2385F3] to-[#06A7E9] px-8 py-10 text-white shadow-[0_22px_50px_rgba(37,99,235,0.20)] transition-all duration-500 hover:shadow-[0_28px_70px_rgba(37,99,235,0.32)]">
        <div className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-white/20 blur-3xl transition-transform duration-700 group-hover:scale-125" />
        <div className="pointer-events-none absolute -bottom-24 left-16 h-60 w-60 rounded-full bg-cyan-200/20 blur-2xl motion-safe:animate-pulse" />
        <div className="pointer-events-none absolute right-16 top-16 h-24 w-24 rounded-full border border-white/20" />
        <div className="relative z-10 flex flex-col gap-6 xl:flex-row xl:items-center xl:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-white/80">Recepcionista</p>
            <h1 className="mt-3 text-4xl font-bold leading-tight">
              Bienvenido{userName ? `, ${userName}` : ""}
            </h1>
            <p className="mt-4 max-w-2xl text-base leading-7 text-white/90">
              Gestiona la agenda diaria, confirma citas, registra llegadas y comunica novedades al equipo veterinario.
            </p>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <Link href="/recepcionista/citas" className={`inline-flex items-center justify-center rounded-full bg-white px-6 py-3 text-sm font-semibold text-blue-600 shadow-lg shadow-slate-950/10 hover:bg-blue-50 ${buttonHover}`}>
              Crear nueva cita
            </Link>
            <div className="inline-flex items-center justify-center gap-2 rounded-full bg-white/15 px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-slate-950/10 backdrop-blur">
              <ShieldCheck className="h-4 w-4" />
              Recepción activa
            </div>
          </div>
        </div>
      </section>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <article className={`group relative overflow-hidden rounded-[24px] border border-slate-200 bg-white px-5 py-6 shadow-sm dark:border-slate-800 dark:bg-slate-950 ${cardHover}`}>
          <div className="absolute inset-x-0 bottom-0 h-1 bg-gradient-to-r from-blue-600 to-cyan-400 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Citas hoy</p>
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-blue-50 text-blue-600 transition-colors duration-300 group-hover:bg-blue-600 group-hover:text-white">
              <CalendarDays className={`h-5 w-5 ${iconHover}`} />
            </div>
          </div>
          <p className="mt-4 text-3xl font-semibold text-slate-900 dark:text-white">{todayAppointments.length}</p>
          <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">Programadas para la jornada</p>
        </article>

        <article className={`group relative overflow-hidden rounded-[24px] border border-slate-200 bg-white px-5 py-6 shadow-sm dark:border-slate-800 dark:bg-slate-950 ${cardHover}`}>
          <div className="absolute inset-x-0 bottom-0 h-1 bg-gradient-to-r from-yellow-500 to-amber-300 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Pendientes</p>
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-yellow-50 text-yellow-600 transition-colors duration-300 group-hover:bg-yellow-600 group-hover:text-white">
              <Clock className={`h-5 w-5 ${iconHover}`} />
            </div>
          </div>
          <p className="mt-4 text-3xl font-semibold text-slate-900 dark:text-white">{pendingCount}</p>
          <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">Esperan confirmación</p>
        </article>

        <article className={`group relative overflow-hidden rounded-[24px] border border-slate-200 bg-white px-5 py-6 shadow-sm dark:border-slate-800 dark:bg-slate-950 ${cardHover}`}>
          <div className="absolute inset-x-0 bottom-0 h-1 bg-gradient-to-r from-blue-600 to-cyan-400 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-slate-500 dark:text-slate-400">En espera</p>
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-blue-50 text-blue-600 transition-colors duration-300 group-hover:bg-blue-600 group-hover:text-white">
              <UserRound className={`h-5 w-5 ${iconHover}`} />
            </div>
          </div>
          <p className="mt-4 text-3xl font-semibold text-slate-900 dark:text-white">{waitingCount}</p>
          <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">Pacientes esperando atención</p>
        </article>

        <article className={`group relative overflow-hidden rounded-[24px] border border-slate-200 bg-white px-5 py-6 shadow-sm dark:border-slate-800 dark:bg-slate-950 ${cardHover}`}>
          <div className="absolute inset-x-0 bottom-0 h-1 bg-gradient-to-r from-red-600 to-pink-400 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Canceladas</p>
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-red-50 text-red-600 transition-colors duration-300 group-hover:bg-red-600 group-hover:text-white">
              <XCircle className={`h-5 w-5 ${iconHover}`} />
            </div>
          </div>
          <p className="mt-4 text-3xl font-semibold text-slate-900 dark:text-white">{cancelledCount}</p>
          <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">Citas canceladas hoy</p>
        </article>
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.45fr_0.55fr]">
        <article className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-950">
          <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-xl font-semibold text-slate-900 dark:text-white">Próximas citas</h2>
              <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">Revisa la agenda, confirma turnos y registra la llegada de pacientes.</p>
            </div>
            <Link href="/recepcionista/citas" className="inline-flex rounded-full bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-700">
              Ver agenda completa
            </Link>
          </div>

          <div className="space-y-4">
            {nextAppointments.length > 0 ? (
              nextAppointments.map((appointment) => (
                <div key={appointment.id} className={`group rounded-[26px] border border-slate-200 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-900 ${softCardHover}`}>
                  <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                    <div className="flex gap-4">
                      <div className="min-w-16">
                        <p className="text-base font-bold text-blue-600">{appointment.time}</p>
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-slate-900 dark:text-white">{appointment.petName}</p>
                        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{appointment.ownerName}</p>
                        <p className="text-sm text-slate-500 dark:text-slate-400">{appointment.service}</p>
                        <p className="mt-1 inline-flex items-center gap-1 text-sm text-slate-500 dark:text-slate-400">
                          <Stethoscope className="h-4 w-4 text-blue-600" />
                          {appointment.veterinarian ?? "Veterinario no asignado"}
                        </p>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <span className={`rounded-full px-3 py-1 text-xs font-semibold ${getStatusClass(appointment.status)}`}>
                        {appointment.status}
                      </span>
                      <Link href="/recepcionista/citas" className={`rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-semibold text-slate-700 transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-600 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-200 ${buttonHover}`}>
                        Check-in
                      </Link>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="rounded-[24px] border border-dashed border-slate-300/70 bg-white p-8 text-center dark:border-slate-700 dark:bg-slate-950">
                <p className="text-sm font-semibold text-slate-900 dark:text-white">No hay citas programadas para hoy</p>
                <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">Puedes crear nuevas citas desde la sección de agenda.</p>
              </div>
            )}
          </div>
        </article>

        <aside className="space-y-6">
          <article className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-950">
            <div className="mb-5 flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Resumen de recepción</h2>
                <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Datos rápidos del día.</p>
              </div>
              <ClipboardList className="h-5 w-5 text-slate-400" />
            </div>
            <div className="grid gap-3">
              <div className="rounded-[20px] bg-slate-50 p-4 dark:bg-slate-900">
                <p className="text-sm text-slate-500 dark:text-slate-400">Mascotas que llegan hoy</p>
                <p className="mt-2 text-2xl font-semibold text-slate-900 dark:text-white">{petsArrivingToday}</p>
              </div>
              <div className="rounded-[20px] bg-slate-50 p-4 dark:bg-slate-900">
                <p className="text-sm text-slate-500 dark:text-slate-400">Veterinarios asignados hoy</p>
                <p className="mt-2 text-2xl font-semibold text-slate-900 dark:text-white">{veterinariansToday.length}</p>
              </div>
              <div className="rounded-[20px] bg-slate-50 p-4 dark:bg-slate-900">
                <p className="text-sm text-slate-500 dark:text-slate-400">Citas confirmadas</p>
                <p className="mt-2 text-2xl font-semibold text-slate-900 dark:text-white">{confirmedCount}</p>
              </div>
            </div>
          </article>

          <article className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-950">
            <div className="mb-5 flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Acciones rápidas</h2>
                <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Tareas frecuentes de recepción.</p>
              </div>
              <CheckCircle2 className="h-5 w-5 text-slate-400" />
            </div>
            <div className="grid gap-3">
              <Link href="/recepcionista/citas" className="inline-flex items-center gap-2 rounded-3xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100">
                <CalendarDays className="h-4 w-4 text-blue-600" />
                Crear o confirmar cita
              </Link>
              <Link href="/recepcionista/clientes" className="inline-flex items-center gap-2 rounded-3xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100">
                <UserRound className="h-4 w-4 text-blue-600" />
                Registrar cliente
              </Link>
              <Link href="/recepcionista/mascotas" className="inline-flex items-center gap-2 rounded-3xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100">
                <PawPrint className="h-4 w-4 text-blue-600" />
                Registrar mascota
              </Link>
              <Link href="/recepcionista/notificaciones" className="inline-flex items-center gap-2 rounded-3xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100">
                <Send className="h-4 w-4 text-blue-600" />
                Enviar recordatorio
              </Link>
              <Link href="/recepcionista/inventario" className="inline-flex items-center gap-2 rounded-3xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100">
                <ClipboardList className="h-4 w-4 text-blue-600" />
                Consultar inventario básico
              </Link>
            </div>
          </article>

          <article className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-950">
            <div className="mb-5 flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Alertas importantes</h2>
                <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Novedades que requieren seguimiento.</p>
              </div>
              <Bell className="h-5 w-5 text-slate-400" />
            </div>
            <div className="space-y-3">
              {importantAlerts.map((alert) => (
                <div key={alert} className="flex gap-3 rounded-[18px] bg-orange-50 p-3 text-sm text-orange-800 dark:bg-orange-900/20 dark:text-orange-200">
                  <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
                  <p>{alert}</p>
                </div>
              ))}
            </div>
          </article>
        </aside>
      </section>

      <section className="grid gap-6 xl:grid-cols-3">
        <article className={`group relative overflow-hidden rounded-[24px] border border-slate-200 bg-white px-5 py-6 shadow-sm dark:border-slate-800 dark:bg-slate-950 ${cardHover}`}>
          <div className="absolute inset-x-0 bottom-0 h-1 bg-gradient-to-r from-indigo-600 to-cyan-400 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Clientes registrados</p>
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600 transition-colors duration-300 group-hover:bg-indigo-600 group-hover:text-white">
              <UserRound className={`h-5 w-5 ${iconHover}`} />
            </div>
          </div>
          <p className="mt-4 text-3xl font-semibold text-slate-900 dark:text-white">{owners.length}</p>
          <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">Consulta datos básicos, contacto y mascotas asociadas.</p>
        </article>

        <article className={`group relative overflow-hidden rounded-[24px] border border-slate-200 bg-white px-5 py-6 shadow-sm dark:border-slate-800 dark:bg-slate-950 ${cardHover}`}>
          <div className="absolute inset-x-0 bottom-0 h-1 bg-gradient-to-r from-emerald-600 to-teal-400 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Mascotas registradas</p>
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600 transition-colors duration-300 group-hover:bg-emerald-600 group-hover:text-white">
              <PawPrint className={`h-5 w-5 ${iconHover}`} />
            </div>
          </div>
          <p className="mt-4 text-3xl font-semibold text-slate-900 dark:text-white">{pets.length}</p>
          <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">Fichas básicas disponibles para recepción.</p>
        </article>

        <article className={`group relative overflow-hidden rounded-[24px] border border-slate-200 bg-white px-5 py-6 shadow-sm dark:border-slate-800 dark:bg-slate-950 ${cardHover}`}>
          <div className="absolute inset-x-0 bottom-0 h-1 bg-gradient-to-r from-cyan-600 to-sky-400 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Inventario básico</p>
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-cyan-50 text-cyan-600 transition-colors duration-300 group-hover:bg-cyan-600 group-hover:text-white">
              <ClipboardList className={`h-5 w-5 ${iconHover}`} />
            </div>
          </div>
          <p className="mt-4 text-3xl font-semibold text-slate-900 dark:text-white">{lowStockCount}</p>
          <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">Alertas de stock bajo o agotado.</p>
        </article>
      </section>
    </div>
  );
}
