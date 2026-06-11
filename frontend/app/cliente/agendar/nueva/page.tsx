"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { useAuth } from "@/lib/auth-context";
import { fetchMascotas } from "../../../../lib/api/mascotas";
import { fetchPropietarioByUsuario } from "../../../../lib/api/propietarios";
import { createCita, fetchCitas } from "../../../../lib/api/citas";
import { fetchVeterinarios } from "../../../../lib/api/usuarios";
import type { UsuarioAPI } from "../../../../lib/api/usuarios";
import type { Appointment, PetRecord } from "../../../../lib/recepcionista/types";
import {
  getClinicSlots,
  isClinicOpen,
  formatSlot,
  getScheduleLabel,
} from "../../../../lib/utils/clinic-schedule";
import { ArrowLeft, ArrowRight, CalendarDays, CheckCircle, Clock, User } from "lucide-react";

const SERVICIOS = [
  {
    id: "Consulta general",
    label: "Consulta general",
    desc: "Revisión médica completa",
    emoji: "🩺",
  },
  { id: "Vacunación", label: "Vacunación", desc: "Aplicación de vacunas", emoji: "💉" },
  { id: "Desparasitación", label: "Desparasitación", desc: "Control de parásitos", emoji: "🪱" },
  {
    id: "Control médico",
    label: "Control médico",
    desc: "Seguimiento de tratamiento",
    emoji: "📋",
  },
  { id: "Urgencia", label: "Urgencia", desc: "Atención prioritaria", emoji: "🚨" },
] as const;

function fechaMin() {
  const hoy = new Date();
  return `${hoy.getFullYear()}-${String(hoy.getMonth() + 1).padStart(2, "0")}-${String(hoy.getDate()).padStart(2, "0")}`;
}

function formatearFecha(iso: string) {
  if (!iso) return "Sin seleccionar";
  const d = new Date(iso + "T00:00:00");
  return d.toLocaleDateString("es-CO", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export default function NuevaCitaPage() {
  const router = useRouter();
  const [paso, setPaso] = useState<1 | 2 | 3>(1);
  const [mascotas, setMascotas] = useState<PetRecord[]>([]);
  const [mascotaId, setMascotaId] = useState("");
  const [servicio, setServicio] = useState("");
  const [fecha, setFecha] = useState("");
  const [hora, setHora] = useState("");
  const [motivo, setMotivo] = useState("");
  const [vetNombre, setVetNombre] = useState("");
  const [vets, setVets] = useState<UsuarioAPI[]>([]);
  const [vetsLoaded, setVetsLoaded] = useState(false);
  const [citasExistentes, setCitasExistentes] = useState<Appointment[]>([]);
  const [error, setError] = useState("");
  const [guardando, setGuardando] = useState(false);
  const [propietarioId, setPropietarioId] = useState("");
  const { user } = useAuth();
  const propietarioNombre = user?.name ?? "";

  useEffect(() => {
    if (!user) return;

    const cargar = async () => {
      try {
        const prop = await fetchPropietarioByUsuario(user.id);
        if (!prop) return;
        setPropietarioId(prop.id);
        const [pets, allCitas, vetList] = await Promise.all([
          fetchMascotas(parseInt(prop.id, 10)),
          fetchCitas().catch(() => [] as Appointment[]),
          fetchVeterinarios().catch(() => [] as UsuarioAPI[]),
        ]);
        setMascotas(pets);
        setCitasExistentes(allCitas);
        setVets(vetList);
        if (pets.length === 1) setMascotaId(pets[0].id);
      } catch {
        /* */
      } finally {
        setVetsLoaded(true);
      }
    };
    cargar();
  }, [user]);

  // Dynamic slots for the selected date; exclude past slots when date is today
  const slots = useMemo(() => {
    const raw = getClinicSlots(fecha);
    if (!fecha) return raw;
    const hoy = fechaMin();
    if (fecha !== hoy) return raw;
    const now = new Date();
    const currentMins = now.getHours() * 60 + now.getMinutes();
    return raw.filter((s) => {
      const [h, m] = s.split(":").map(Number);
      return h * 60 + m > currentMins;
    });
  }, [fecha]);

  // Vet availability for the selected date+time
  const busyVetNames = useMemo(() => {
    if (!fecha || !hora) return new Set<string>();
    return new Set(
      citasExistentes
        .filter((a) => a.date === fecha && a.time === hora && a.status !== "Cancelada")
        .map((a) => a.veterinarian)
        .filter(Boolean) as string[],
    );
  }, [citasExistentes, fecha, hora]);

  const vetsDisponibles = vets.filter((v) => !busyVetNames.has(v.nombre ?? ""));
  const vetsOcupados = vets.filter((v) => busyVetNames.has(v.nombre ?? ""));

  const mascotaSeleccionada = mascotas.find((m) => m.id === mascotaId);

  const avanzar = () => {
    if (paso === 1 && !mascotaId) {
      setError("Selecciona una mascota.");
      return;
    }
    if (paso === 2 && !servicio) {
      setError("Selecciona un servicio.");
      return;
    }
    setError("");
    setPaso((p) => Math.min(p + 1, 3) as 1 | 2 | 3);
  };

  const retroceder = () => {
    setError("");
    setPaso((p) => Math.max(p - 1, 1) as 1 | 2 | 3);
  };

  const handleSubmit = async () => {
    if (!fecha) {
      setError("Selecciona una fecha.");
      return;
    }
    if (!isClinicOpen(fecha)) {
      setError("La clínica no atiende ese día. Selecciona otro.");
      return;
    }
    if (!hora) {
      setError("Selecciona una hora.");
      return;
    }
    if (new Date(fecha + "T00:00:00") < new Date(fechaMin() + "T00:00:00")) {
      setError("La fecha no puede ser anterior a hoy.");
      return;
    }
    if (!mascotaSeleccionada) return;

    setGuardando(true);
    setError("");
    try {
      await createCita({
        date: fecha,
        time: hora,
        petId: mascotaSeleccionada.id,
        ownerId: propietarioId,
        petName: mascotaSeleccionada.nombre,
        ownerName: propietarioNombre,
        petEspecie: mascotaSeleccionada.especie,
        petRaza: mascotaSeleccionada.raza,
        service: servicio,
        status: "Pendiente",
        veterinarian: vetNombre || undefined,
        notes: motivo.trim() || undefined,
      });
      router.push("/cliente/agendar?solicitud=enviada");
    } catch (err) {
      setGuardando(false);
      setError(
        err instanceof Error ? err.message : "No se pudo guardar la cita. Verifica tu conexión.",
      );
    }
  };

  const PASOS = ["Mascota", "Servicio", "Fecha y hora"];

  return (
    <div className="admin-page h-full overflow-y-auto">
      {/* Encabezado */}
      <div className="mb-6">
        <Link
          href="/cliente/agendar"
          className="inline-flex items-center gap-1.5 text-sm text-slate-500 transition hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
        >
          <ArrowLeft className="h-4 w-4" />
          Volver a citas
        </Link>
        <h1 className="text-page-title mt-3">Nueva solicitud de cita</h1>
      </div>

      {/* Barra de progreso */}
      <div className="mb-8">
        <div className="flex items-center gap-0">
          {PASOS.map((nombre, i) => {
            const num = i + 1;
            const activo = paso === num;
            const completo = paso > num;
            return (
              <div key={nombre} className="flex flex-1 items-center">
                <div className="flex flex-col items-center">
                  <div
                    className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-bold transition ${
                      completo
                        ? "bg-brand-600 text-white"
                        : activo
                          ? "bg-brand-600 text-white ring-4 ring-brand-200 dark:ring-brand-900"
                          : "bg-slate-200 text-slate-400 dark:bg-slate-700"
                    }`}
                  >
                    {completo ? <CheckCircle className="h-4 w-4" /> : num}
                  </div>
                  <p
                    className={`mt-1.5 text-[11px] font-semibold ${activo || completo ? "text-brand-600 dark:text-brand-400" : "text-slate-400"}`}
                  >
                    {nombre}
                  </p>
                </div>
                {i < PASOS.length - 1 && (
                  <div
                    className={`mb-5 h-0.5 flex-1 transition ${completo ? "bg-brand-600" : "bg-slate-200 dark:bg-slate-700"}`}
                  />
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Contenido del paso */}
      <div className="admin-card p-6">
        {/* Paso 1: Mascota */}
        {paso === 1 && (
          <div>
            <h2 className="text-section-title">¿Para qué mascota es la cita?</h2>
            <p className="text-subtitle mt-1">Selecciona la mascota que necesita atención.</p>

            {mascotas.length === 0 ? (
              <div className="mt-6 rounded-xl border border-dashed border-slate-300 bg-slate-50 p-8 text-center dark:border-slate-700 dark:bg-slate-800/50">
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  No tienes mascotas registradas.
                </p>
                <p className="mt-1 text-xs text-slate-400">
                  Registra una mascota para poder agendar citas.
                </p>
              </div>
            ) : (
              <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {mascotas.map((m) => (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() => {
                      setMascotaId(m.id);
                      setError("");
                    }}
                    className={`flex items-center gap-4 rounded-xl border p-4 text-left transition ${
                      mascotaId === m.id
                        ? "border-brand-500 bg-brand-50 dark:border-brand-500 dark:bg-brand-900/20"
                        : "border-slate-200 bg-white hover:border-brand-300 dark:border-slate-700 dark:bg-slate-900 dark:hover:border-slate-600"
                    }`}
                  >
                    <div
                      className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl text-xl font-bold ${
                        mascotaId === m.id
                          ? "bg-brand-600 text-white"
                          : "bg-brand-50 text-brand-600 dark:bg-brand-900/30 dark:text-brand-400"
                      }`}
                    >
                      {m.nombre.charAt(0)}
                    </div>
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-slate-900 dark:text-white">
                        {m.nombre}
                      </p>
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        {m.especie}
                        {m.raza ? ` · ${m.raza}` : ""}
                      </p>
                      {m.edad && <p className="text-xs text-slate-400">{m.edad}</p>}
                    </div>
                    {mascotaId === m.id && (
                      <CheckCircle className="ml-auto h-5 w-5 shrink-0 text-brand-600 dark:text-brand-400" />
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Paso 2: Servicio */}
        {paso === 2 && (
          <div>
            <h2 className="text-section-title">¿Qué necesita {mascotaSeleccionada?.nombre}?</h2>
            <p className="text-subtitle mt-1">Selecciona el tipo de atención requerida.</p>

            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              {SERVICIOS.map((s) => (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => {
                    setServicio(s.id);
                    setError("");
                  }}
                  className={`flex items-center gap-4 rounded-xl border p-4 text-left transition ${
                    servicio === s.id
                      ? "border-brand-500 bg-brand-50 dark:border-brand-500 dark:bg-brand-900/20"
                      : "border-slate-200 bg-white hover:border-brand-300 dark:border-slate-700 dark:bg-slate-900"
                  }`}
                >
                  <span className="text-2xl">{s.emoji}</span>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-slate-900 dark:text-white">
                      {s.label}
                    </p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">{s.desc}</p>
                  </div>
                  {servicio === s.id && (
                    <CheckCircle className="ml-auto h-5 w-5 shrink-0 text-brand-600 dark:text-brand-400" />
                  )}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Paso 3: Fecha, hora y veterinario */}
        {paso === 3 && (
          <div>
            <h2 className="text-section-title">Elige fecha, hora y veterinario</h2>
            <p className="text-subtitle mt-1">
              Selecciona cuándo quieres que {mascotaSeleccionada?.nombre} sea atendida.
            </p>

            <div className="mt-5 grid gap-5 sm:grid-cols-2">
              {/* Fecha */}
              <div>
                <label className="mb-2 flex items-center gap-1.5 text-sm font-semibold text-slate-700 dark:text-slate-200">
                  <CalendarDays className="h-4 w-4 text-brand-600" />
                  Fecha
                </label>
                <input
                  type="date"
                  min={fechaMin()}
                  value={fecha}
                  onChange={(e) => {
                    setFecha(e.target.value);
                    setHora("");
                    setVetNombre("");
                    setError("");
                  }}
                  className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-brand-400 focus:ring-2 focus:ring-brand-400/10 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
                />
                {fecha && (
                  <p
                    className={`mt-1.5 text-xs font-medium ${isClinicOpen(fecha) ? "text-success-600" : "text-danger-600"}`}
                  >
                    {isClinicOpen(fecha)
                      ? `Horario: ${getScheduleLabel(fecha)}`
                      : "La clínica está cerrada este día (domingos no hay atención)"}
                  </p>
                )}
              </div>

              {/* Hora */}
              <div>
                <label className="mb-2 flex items-center gap-1.5 text-sm font-semibold text-slate-700 dark:text-slate-200">
                  <Clock className="h-4 w-4 text-brand-600" />
                  Hora disponible
                </label>
                {!fecha ? (
                  <p className="text-xs text-slate-400">Selecciona una fecha primero.</p>
                ) : !isClinicOpen(fecha) ? (
                  <div className="dark:bg-danger-950/30 rounded-xl border border-danger-200 bg-danger-50 px-4 py-3 text-xs text-danger-700 dark:border-danger-900 dark:text-danger-400">
                    No hay turnos disponibles. La clínica permanece cerrada los domingos.
                  </div>
                ) : slots.length === 0 ? (
                  <div className="dark:bg-warning-950/30 rounded-xl border border-warning-200 bg-warning-50 px-4 py-3 text-xs text-warning-700 dark:border-warning-900 dark:text-warning-400">
                    No quedan turnos disponibles para hoy. Selecciona otra fecha.
                  </div>
                ) : (
                  <div className="grid grid-cols-3 gap-2">
                    {slots.map((s) => (
                      <button
                        key={s}
                        type="button"
                        onClick={() => {
                          setHora(s);
                          setVetNombre("");
                          setError("");
                        }}
                        className={`rounded-lg border py-2 text-xs font-semibold transition ${
                          hora === s
                            ? "border-brand-600 bg-brand-600 text-white"
                            : "border-slate-200 bg-white text-slate-600 hover:border-brand-300 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-400"
                        }`}
                      >
                        {formatSlot(s)}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Selector de veterinario — solo cuando fecha+hora están seleccionados */}
            {fecha && hora && isClinicOpen(fecha) && (
              <div className="mt-5">
                <label className="mb-2 flex items-center gap-1.5 text-sm font-semibold text-slate-700 dark:text-slate-200">
                  <User className="h-4 w-4 text-brand-600" />
                  Veterinario de preferencia
                  <span className="ml-1 font-normal text-slate-400">(opcional)</span>
                  {vets.length > 0 && (
                    <span className="ml-auto text-xs font-normal text-slate-400">
                      {vetsDisponibles.length} disponible{vetsDisponibles.length !== 1 ? "s" : ""}
                    </span>
                  )}
                </label>

                {!vetsLoaded ? (
                  <p className="text-xs text-slate-400">Cargando veterinarios...</p>
                ) : vets.length === 0 ? (
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    La clínica asignará un veterinario disponible al confirmar tu cita.
                  </p>
                ) : (
                  <div className="space-y-2">
                    {vetsDisponibles.map((v) => (
                      <button
                        key={v.id}
                        type="button"
                        onClick={() =>
                          setVetNombre(vetNombre === (v.nombre ?? "") ? "" : (v.nombre ?? ""))
                        }
                        className={`flex w-full items-center gap-3 rounded-xl border px-4 py-2.5 text-left text-sm transition ${
                          vetNombre === v.nombre
                            ? "border-brand-400 bg-brand-50 text-brand-800 dark:border-brand-600 dark:bg-brand-950/40 dark:text-brand-200"
                            : "border-slate-200 bg-white text-slate-700 hover:border-brand-200 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300"
                        }`}
                      >
                        <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-success-100 text-xs font-bold text-success-700 dark:bg-success-900/40 dark:text-success-300">
                          {(v.nombre ?? "?")[0].toUpperCase()}
                        </span>
                        <span className="flex-1 font-medium">{v.nombre}</span>
                        <span className="text-xs text-success-600 dark:text-success-400">
                          Disponible
                        </span>
                        {vetNombre === v.nombre && (
                          <CheckCircle className="h-4 w-4 text-brand-600" />
                        )}
                      </button>
                    ))}

                    {vetsOcupados.map((v) => (
                      <div
                        key={v.id}
                        className="flex w-full items-center gap-3 rounded-xl border border-slate-100 bg-slate-50 px-4 py-2.5 text-sm opacity-50 dark:border-slate-800 dark:bg-slate-800/50"
                      >
                        <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-slate-200 text-xs font-bold text-slate-500 dark:bg-slate-700">
                          {(v.nombre ?? "?")[0].toUpperCase()}
                        </span>
                        <span className="flex-1 font-medium text-slate-500 dark:text-slate-400">
                          {v.nombre}
                        </span>
                        <span className="text-xs text-danger-500">Ocupado a esta hora</span>
                      </div>
                    ))}

                    {vets.length > 0 && vetsDisponibles.length === 0 && (
                      <p className="text-xs text-warning-600 dark:text-warning-400">
                        Todos los veterinarios tienen cita a esta hora. La clínica asignará uno al
                        confirmar.
                      </p>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Motivo */}
            <div className="mt-5">
              <label className="mb-2 block text-sm font-semibold text-slate-700 dark:text-slate-200">
                Motivo de la consulta <span className="font-normal text-slate-400">(opcional)</span>
              </label>
              <textarea
                rows={3}
                value={motivo}
                onChange={(e) => setMotivo(e.target.value)}
                placeholder="Describe brevemente el motivo de la consulta o síntomas observados..."
                className="w-full resize-none rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-brand-400 focus:ring-2 focus:ring-brand-400/10 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
              />
            </div>

            {/* Resumen */}
            <div className="mt-5 rounded-xl border border-brand-200 bg-brand-50 px-4 py-4 dark:border-brand-800/50 dark:bg-brand-900/20">
              <p className="text-eyebrow">Resumen de la solicitud</p>
              <div className="mt-3 grid grid-cols-2 gap-2 text-sm">
                <div>
                  <p className="text-label">Mascota</p>
                  <p className="mt-0.5 font-semibold text-slate-900 dark:text-white">
                    {mascotaSeleccionada?.nombre}
                  </p>
                </div>
                <div>
                  <p className="text-label">Servicio</p>
                  <p className="mt-0.5 font-semibold text-slate-900 dark:text-white">{servicio}</p>
                </div>
                <div>
                  <p className="text-label">Fecha</p>
                  <p className="mt-0.5 font-semibold text-slate-900 dark:text-white">
                    {fecha ? formatearFecha(fecha) : "—"}
                  </p>
                </div>
                <div>
                  <p className="text-label">Hora</p>
                  <p className="mt-0.5 font-semibold text-slate-900 dark:text-white">
                    {hora ? formatSlot(hora) : "—"}
                  </p>
                </div>
                <div className="col-span-2">
                  <p className="text-label">Veterinario</p>
                  <p className="mt-0.5 font-semibold text-slate-900 dark:text-white">
                    {vetNombre || "Sin preferencia (la clínica asignará)"}
                  </p>
                </div>
              </div>
              <p className="mt-3 text-xs text-slate-500 dark:text-slate-400">
                La cita quedará en estado{" "}
                <strong className="text-slate-700 dark:text-slate-200">
                  Pendiente de confirmación
                </strong>
                . La clínica revisará y confirmará el horario.
              </p>
            </div>
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="dark:bg-danger-950/30 mt-4 rounded-xl border border-danger-200 bg-danger-50 px-4 py-3 text-sm text-danger-700 dark:border-danger-800 dark:text-danger-400">
            {error}
          </div>
        )}
      </div>

      {/* Botones de navegación */}
      <div className="mt-5 flex items-center justify-between">
        {paso > 1 ? (
          <button type="button" onClick={retroceder} className="btn-secondary">
            <ArrowLeft className="h-4 w-4" />
            Atrás
          </button>
        ) : (
          <Link href="/cliente/agendar" className="btn-secondary">
            <ArrowLeft className="h-4 w-4" />
            Cancelar
          </Link>
        )}

        {paso < 3 ? (
          <button
            type="button"
            onClick={avanzar}
            disabled={mascotas.length === 0 && paso === 1}
            className="btn-primary disabled:opacity-50"
          >
            Siguiente
            <ArrowRight className="h-4 w-4" />
          </button>
        ) : (
          <button
            type="button"
            onClick={handleSubmit}
            disabled={guardando}
            className="btn-primary disabled:opacity-50"
          >
            {guardando ? "Enviando..." : "Solicitar cita"}
            <CheckCircle className="h-4 w-4" />
          </button>
        )}
      </div>
    </div>
  );
}
