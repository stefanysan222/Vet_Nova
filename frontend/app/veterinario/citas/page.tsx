"use client";

import Link from "next/link";
import { ChangeEvent, FormEvent, ReactNode, useEffect, useMemo, useState } from "react";
import { Plus, X, AlertCircle, CheckCircle2, CalendarDays, List } from "lucide-react";
import { fetchCitas, createCita } from "../../../lib/api/citas";
import { SkeletonBanner, SkeletonStats, SkeletonCardList } from "../../components/ui/Skeleton";
import { fetchMascotas } from "../../../lib/api/mascotas";
import { fetchVeterinarios } from "../../../lib/api/usuarios";
import type { UsuarioAPI } from "../../../lib/api/usuarios";
import type { Appointment } from "../../../lib/recepcionista/types";
import type { PetRecord } from "../../../lib/recepcionista/types";
import { useAuth } from "@/lib/auth-context";
import { getClinicSlots, isClinicOpen, getScheduleLabel } from "../../../lib/utils/clinic-schedule";
import { StatusBadge } from "../../../lib/utils/status-badge";
import type { AppointmentStatus } from "../../../lib/utils/status";
import AppointmentDetailModal from "../../components/appointments/AppointmentDetailModal";
import InteractiveCalendar, {
  type CalendarAppointmentEvent,
} from "../../components/calendar/InteractiveCalendar";
import type { SlotInfo } from "react-big-calendar";

type EstadoCita = "Pendiente de confirmación" | "Confirmada" | "En proceso" | "Atendida";

interface Cita {
  id: string;
  petId: string;
  fecha: string;
  hora: string;
  mascota: string;
  especie: string;
  raza: string;
  cliente: string;
  servicio: string;
  observaciones: string;
  estado: EstadoCita;
  veterinario?: string;
}

interface FormularioCita {
  fecha: string;
  hora: string;
  mascotaId: string;
  servicio: string;
  observaciones: string;
  veterinarioNombre: string;
}

function mapApiStatusToEstado(status: string): EstadoCita {
  switch (status) {
    case "Confirmada":
      return "Confirmada";
    case "En espera":
    case "En atención":
      return "En proceso";
    case "Finalizada":
    case "No asistió":
      return "Atendida";
    default:
      return "Pendiente de confirmación";
  }
}

function mapAppointmentToCita(a: Appointment): Cita {
  return {
    id: a.id,
    petId: a.petId,
    fecha: a.date,
    hora: a.time,
    mascota: a.petName,
    especie: a.petEspecie ?? "",
    raza: a.petRaza ?? "",
    cliente: a.ownerName,
    servicio: a.service,
    observaciones: a.notes ?? "",
    estado: mapApiStatusToEstado(a.status),
    veterinario: a.veterinarian,
  };
}

function formularioVacio(vetName = ""): FormularioCita {
  return {
    fecha: "",
    hora: "",
    mascotaId: "",
    servicio: "",
    observaciones: "",
    veterinarioNombre: vetName,
  };
}

export default function VeterinarioCitasPage() {
  const [citas, setCitas] = useState<Cita[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [mascotas, setMascotas] = useState<PetRecord[]>([]);
  const [vets, setVets] = useState<UsuarioAPI[]>([]);
  const { user } = useAuth();
  const [currentVetName, setCurrentVetName] = useState("");
  const [loading, setLoading] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [mostrarMensaje, setMostrarMensaje] = useState(false);
  const [citaDetalle, setCitaDetalle] = useState<Cita | null>(null);
  const [formulario, setFormulario] = useState<FormularioCita>(() => formularioVacio(""));
  const [vistaActiva, setVistaActiva] = useState<"lista" | "calendario">("lista");
  const [citaCalendario, setCitaCalendario] = useState<Appointment | null>(null);

  useEffect(() => {
    if (!user) return;
    // Sincroniza el nombre del veterinario cuando llega el perfil real desde /auth/me
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setCurrentVetName(user.name ?? "");
  }, [user]);

  useEffect(() => {
    Promise.all([
      fetchCitas(),
      fetchMascotas(),
      fetchVeterinarios().catch(() => [] as UsuarioAPI[]),
    ])
      .then(([appts, pets, vetList]) => {
        setCitas(appts.map(mapAppointmentToCita));
        setAppointments(appts);
        setMascotas(pets);
        setVets(vetList);
      })
      .catch(() => setError("No se pudo cargar la agenda. Verifica la conexión con el servidor."))
      .finally(() => setLoading(false));
  }, []);

  const calendarEvents = useMemo<CalendarAppointmentEvent[]>(() => {
    return appointments
      .filter((a) => a.date)
      .map((a) => {
        const [hh, mm] = (a.time || "00:00").split(":").map((n) => parseInt(n, 10) || 0);
        const start = new Date(`${a.date}T00:00:00`);
        start.setHours(hh, mm, 0, 0);
        const end = new Date(start);
        end.setMinutes(end.getMinutes() + 30);
        return {
          title: `${a.time ?? ""} ${a.petName}`.trim(),
          start,
          end,
          resource: a,
        };
      });
  }, [appointments]);

  // TODO(MP-01): "Agendar cita" abre el formulario completo definido abajo (mascota, servicio,
  // veterinario, etc.). Reutilizamos ese mismo modal preseleccionando fecha/hora del slot
  // en vez de construir un formulario nuevo desde cero.
  const handleSelectSlot = (slotInfo: SlotInfo) => {
    const fecha = slotInfo.start.toISOString().slice(0, 10);
    const hora = slotInfo.start.toTimeString().slice(0, 5);
    setFormulario({ ...formularioVacio(currentVetName), fecha, hora });
    setMostrarMensaje(false);
    setMostrarFormulario(true);
  };

  // Slots de la clínica para la fecha seleccionada
  const clinicSlots = useMemo(() => getClinicSlots(formulario.fecha), [formulario.fecha]);
  const clinicaCerrada = !!formulario.fecha && !isClinicOpen(formulario.fecha);

  // Slots ya ocupados para el veterinario seleccionado en la fecha escogida
  const slotsBloqueados = useMemo(() => {
    const vetName = formulario.veterinarioNombre || currentVetName;
    if (!formulario.fecha || !vetName) return new Set<string>();
    return new Set(
      citas
        .filter(
          (c) =>
            c.fecha === formulario.fecha && c.veterinario === vetName && c.estado !== "Atendida",
        )
        .map((c) => c.hora),
    );
  }, [citas, formulario.fecha, formulario.veterinarioNombre, currentVetName]);

  // Vets ocupados en la fecha+hora seleccionada
  const busyVetNames = useMemo(() => {
    if (!formulario.fecha || !formulario.hora) return new Set<string>();
    return new Set(
      citas
        .filter(
          (c) =>
            c.fecha === formulario.fecha && c.hora === formulario.hora && c.estado !== "Atendida",
        )
        .map((c) => c.veterinario)
        .filter(Boolean) as string[],
    );
  }, [citas, formulario.fecha, formulario.hora]);

  const vetsDisponibles = vets.filter((v) => !busyVetNames.has(v.nombre ?? ""));
  const vetsOcupados = vets.filter((v) => busyVetNames.has(v.nombre ?? ""));

  const pendientes = citas.filter((c) => c.estado === "Pendiente de confirmación").length;
  const confirmadas = citas.filter((c) => c.estado === "Confirmada").length;

  const mascotaSeleccionada = mascotas.find((m) => m.id === formulario.mascotaId) ?? null;

  function handleChange(
    event: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>,
  ) {
    const { name, value } = event.target;
    setFormulario((actual) => ({ ...actual, [name]: value }));
  }

  function abrirFormulario() {
    setFormulario(formularioVacio(currentVetName));
    setMostrarMensaje(false);
    setMostrarFormulario(true);
  }

  function cerrarFormulario() {
    setMostrarFormulario(false);
    setFormulario(formularioVacio());
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!mascotaSeleccionada) return;

    setGuardando(true);
    setError(null);
    try {
      const nueva = await createCita({
        date: formulario.fecha,
        time: formulario.hora,
        petId: mascotaSeleccionada.id,
        ownerId: mascotaSeleccionada.propietarioId,
        petName: mascotaSeleccionada.nombre,
        ownerName: mascotaSeleccionada.propietarioNombre,
        petEspecie: mascotaSeleccionada.especie,
        petRaza: mascotaSeleccionada.raza,
        service: formulario.servicio,
        status: "Pendiente",
        veterinarian: formulario.veterinarioNombre || undefined,
        notes: formulario.observaciones || undefined,
      });
      setCitas((actuales) => [mapAppointmentToCita(nueva), ...actuales]);
      setMostrarFormulario(false);
      setMostrarMensaje(true);
      setFormulario(formularioVacio());
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al guardar la cita.");
    } finally {
      setGuardando(false);
    }
  }

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
      {/* ENCABEZADO */}
      <header className="overflow-hidden rounded-3xl border border-brand-200 bg-gradient-to-br from-brand-600 to-brand-700 p-7 text-white shadow-brand dark:border-brand-900/40 dark:from-brand-800 dark:to-brand-950 dark:shadow-brand-sm">
        <div className="flex flex-col justify-between gap-5 lg:flex-row lg:items-center">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-brand-200">
              Agenda diaria
            </p>

            <h1 className="text-display mt-2">Agenda Veterinaria</h1>

            <p className="mt-3 max-w-3xl text-sm leading-6 text-brand-100">
              Consulta las citas programadas y registra nuevas solicitudes de atención. Las citas
              creadas por el veterinario quedan pendientes de confirmación administrativa.
            </p>
          </div>

          <button
            type="button"
            onClick={abrirFormulario}
            className="flex h-11 shrink-0 items-center justify-center gap-2 rounded-xl bg-white px-6 text-sm font-semibold text-brand-700 shadow-sm transition hover:bg-brand-50"
          >
            <Plus className="h-4 w-4" />
            Agendar cita
          </button>
        </div>
      </header>

      {/* ERROR */}
      {error && (
        <div className="dark:bg-danger-950/30 flex items-start justify-between gap-4 rounded-2xl border border-danger-200 bg-danger-50 px-5 py-4 dark:border-danger-800">
          <div className="flex items-start gap-3">
            <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-danger-500" />
            <p className="text-sm text-danger-700 dark:text-danger-400">{error}</p>
          </div>
          <button
            type="button"
            onClick={() => setError(null)}
            className="text-danger-500 transition hover:text-danger-700 dark:hover:text-danger-300"
            aria-label="Cerrar error"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
      )}

      {/* MENSAJE DE REGISTRO */}
      {mostrarMensaje && (
        <div className="dark:bg-success-950/30 flex items-start justify-between gap-4 rounded-2xl border border-success-200 bg-success-50 px-5 py-4 dark:border-success-800">
          <div className="flex items-start gap-3">
            <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-success-500" />
            <div>
              <p className="text-sm font-semibold text-success-700 dark:text-success-400">
                Cita registrada correctamente
              </p>

              <p className="mt-1 text-sm leading-6 text-success-700/90 dark:text-success-400/90">
                La solicitud fue creada con estado <strong>Pendiente de confirmación</strong>. El
                administrador deberá revisarla y confirmarla.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setMostrarMensaje(false)}
            className="text-success-500 transition hover:text-success-700 dark:hover:text-success-300"
            aria-label="Cerrar mensaje"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
      )}

      {/* INDICADORES */}
      <section className="grid gap-4 md:grid-cols-2">
        <article className="rounded-2xl border border-surface-200 bg-white p-6 shadow-card transition hover:-translate-y-1 hover:shadow-card-hover dark:border-surface-700 dark:bg-surface-900">
          <p className="text-label">Pendientes de confirmación</p>

          <p className="text-stat mt-3">{pendientes}</p>

          <p className="mt-2 text-xs text-surface-500 dark:text-surface-400">
            Solicitudes registradas que deben ser confirmadas por administración.
          </p>
        </article>

        <article className="rounded-2xl border border-surface-200 bg-white p-6 shadow-card transition hover:-translate-y-1 hover:shadow-card-hover dark:border-surface-700 dark:bg-surface-900">
          <p className="text-label">Citas confirmadas</p>

          <p className="text-stat mt-3">{confirmadas}</p>

          <p className="mt-2 text-xs text-surface-500 dark:text-surface-400">
            Citas autorizadas previamente por administración para atención.
          </p>
        </article>
      </section>

      {/* LISTA DE CITAS */}
      <section className="rounded-2xl border border-surface-200 bg-white p-6 shadow-card dark:border-surface-700 dark:bg-surface-900">
        <div className="mb-6 flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
          <div>
            <h2 className="text-section-title">Citas registradas</h2>

            <p className="text-subtitle mt-1">
              Consulta el estado actual y revisa los detalles de cada cita.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <span className="w-fit rounded-lg bg-brand-100 px-4 py-2 text-sm font-semibold text-brand-600 dark:bg-brand-900/40 dark:text-brand-300">
              {citas.length} citas
            </span>

            <div className="flex gap-1 rounded-xl border border-surface-200 bg-white p-1 dark:border-surface-700 dark:bg-surface-900">
              <button
                type="button"
                onClick={() => setVistaActiva("lista")}
                className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
                  vistaActiva === "lista"
                    ? "bg-brand-600 text-white"
                    : "text-surface-600 hover:bg-surface-100 dark:text-surface-300 dark:hover:bg-surface-800"
                }`}
              >
                <List className="h-3.5 w-3.5" />
                Lista
              </button>
              <button
                type="button"
                onClick={() => setVistaActiva("calendario")}
                className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
                  vistaActiva === "calendario"
                    ? "bg-brand-600 text-white"
                    : "text-surface-600 hover:bg-surface-100 dark:text-surface-300 dark:hover:bg-surface-800"
                }`}
              >
                <CalendarDays className="h-3.5 w-3.5" />
                Calendario
              </button>
            </div>
          </div>
        </div>

        {vistaActiva === "calendario" ? (
          <InteractiveCalendar
            events={calendarEvents}
            onSelectEvent={(event) => setCitaCalendario(event.resource)}
            onSelectSlot={handleSelectSlot}
            selectable
          />
        ) : citas.length === 0 ? (
          <p className="py-10 text-center text-sm text-surface-500 dark:text-surface-400">
            No hay citas registradas.
          </p>
        ) : (
          <div className="space-y-3">
            {citas.map((cita) => (
              <article
                key={cita.id}
                className="group rounded-2xl border border-surface-200 bg-surface-50 p-5 transition-all duration-300 hover:-translate-y-0.5 hover:border-brand-200 hover:shadow-card-hover dark:border-surface-700 dark:bg-surface-950"
              >
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="text-sm font-semibold text-surface-900 transition group-hover:text-brand-600 dark:text-white">
                      {formatearFecha(cita.fecha)} · {cita.hora} • {cita.mascota}
                    </p>

                    <p className="mt-1 text-sm text-surface-500 dark:text-surface-400">
                      {cita.cliente} · {cita.servicio}
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center gap-3">
                    <button
                      type="button"
                      onClick={() => setCitaDetalle(cita)}
                      className="flex h-10 items-center justify-center rounded-xl border border-brand-200 bg-white px-4 text-xs font-semibold text-brand-600 transition hover:-translate-y-0.5 hover:bg-brand-50 dark:border-surface-700 dark:bg-surface-900 dark:text-brand-300 dark:hover:bg-brand-950/30"
                    >
                      Ver detalles
                    </button>

                    <StatusBadge status={cita.estado as AppointmentStatus} />
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>

      {/* MODAL DETALLE DE LA CITA */}
      {citaDetalle && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-surface-900/50 px-4 py-6 backdrop-blur-sm">
          <section
            role="dialog"
            aria-modal="true"
            aria-labelledby="titulo-detalle-cita"
            className="max-h-[95vh] w-full max-w-[780px] overflow-y-auto rounded-3xl border border-surface-200/60 bg-white shadow-modal dark:border-surface-700 dark:bg-surface-900"
          >
            <div className="border-b border-surface-100 px-6 py-6 dark:border-surface-800">
              <div className="flex items-start justify-between gap-5">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-brand-600 dark:text-brand-300">
                    Detalle de la cita
                  </p>

                  <div className="mt-3 flex flex-wrap items-center gap-3">
                    <h2 id="titulo-detalle-cita" className="text-page-title">
                      {citaDetalle.mascota}
                    </h2>

                    <StatusBadge status={citaDetalle.estado as AppointmentStatus} />
                  </div>

                  <p className="text-subtitle mt-2">
                    {citaDetalle.especie}
                    {citaDetalle.raza ? ` · ${citaDetalle.raza}` : ""}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => setCitaDetalle(null)}
                  className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-surface-500 transition hover:bg-surface-100 dark:hover:bg-surface-800"
                  aria-label="Cerrar detalle"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>

            <div className="space-y-6 p-6">
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <DatoDetalle titulo="Fecha" valor={formatearFecha(citaDetalle.fecha)} />
                <DatoDetalle titulo="Hora" valor={citaDetalle.hora} />
                <DatoDetalle titulo="Servicio" valor={citaDetalle.servicio} />
                <DatoDetalle titulo="Estado" valor={citaDetalle.estado} />
                <DatoDetalle
                  titulo="Veterinario asignado"
                  valor={citaDetalle.veterinario || "Sin asignar"}
                />
              </div>

              <section className="rounded-2xl border border-surface-200 bg-surface-50 p-5 dark:border-surface-700 dark:bg-surface-950">
                <h3 className="text-sm font-semibold text-surface-900 dark:text-white">
                  Información del paciente y propietario
                </h3>

                <div className="mt-5 grid gap-4 sm:grid-cols-2">
                  <DatoDetalle titulo="Paciente" valor={citaDetalle.mascota} />
                  <DatoDetalle titulo="Especie" valor={citaDetalle.especie || "—"} />
                  <DatoDetalle titulo="Propietario" valor={citaDetalle.cliente || "—"} />
                </div>
              </section>

              <section className="rounded-2xl border border-surface-200 bg-surface-50 p-5 dark:border-surface-700 dark:bg-surface-950">
                <h3 className="text-sm font-semibold text-surface-900 dark:text-white">
                  Observaciones registradas
                </h3>

                <p className="mt-3 text-sm leading-6 text-surface-500 dark:text-surface-400">
                  {citaDetalle.observaciones || "No hay observaciones registradas."}
                </p>
              </section>

              {citaDetalle.estado === "Pendiente de confirmación" && (
                <div className="dark:bg-warning-950/30 rounded-2xl border border-warning-200 bg-warning-50 px-4 py-3 dark:border-warning-800">
                  <p className="text-sm leading-6 text-warning-700 dark:text-warning-400">
                    <strong>Pendiente de confirmación:</strong> esta solicitud debe ser revisada por
                    administración antes de iniciar la atención clínica.
                  </p>
                </div>
              )}

              {(citaDetalle.estado === "Confirmada" || citaDetalle.estado === "En proceso") && (
                <div className="rounded-2xl border border-brand-200 bg-brand-50 px-4 py-3 dark:border-brand-800 dark:bg-brand-950/30">
                  <p className="text-sm leading-6 text-brand-700 dark:text-brand-300">
                    Esta cita está habilitada para atención. Puedes iniciar o continuar el registro
                    clínico del paciente.
                  </p>
                </div>
              )}

              <div className="flex flex-col-reverse gap-3 border-t border-surface-100 pt-5 dark:border-surface-800 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  onClick={() => setCitaDetalle(null)}
                  className="flex h-11 items-center justify-center rounded-xl border border-surface-300 px-6 text-sm font-semibold text-surface-600 transition hover:bg-surface-50 dark:border-surface-700 dark:text-surface-300 dark:hover:bg-surface-800"
                >
                  Cerrar
                </button>

                {(citaDetalle.estado === "Confirmada" || citaDetalle.estado === "En proceso") && (
                  <Link
                    href={`/veterinario/consulta?cita=${citaDetalle.id}`}
                    className="flex h-11 items-center justify-center rounded-xl bg-brand-600 px-6 text-sm font-semibold text-white transition hover:bg-brand-700"
                  >
                    Registrar consulta
                  </Link>
                )}
              </div>
            </div>
          </section>
        </div>
      )}

      {/* MODAL AGENDAR CITA */}
      {mostrarFormulario && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-surface-900/50 px-4 py-6 backdrop-blur-sm">
          <section
            role="dialog"
            aria-modal="true"
            aria-labelledby="titulo-agendar-cita"
            className="max-h-[95vh] w-full max-w-[780px] overflow-y-auto rounded-3xl border border-surface-200/60 bg-white shadow-modal dark:border-surface-700 dark:bg-surface-900"
          >
            <div className="flex items-start justify-between border-b border-surface-100 px-6 py-5 dark:border-surface-800">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-brand-600 dark:text-brand-300">
                  Nueva solicitud
                </p>

                <h2 id="titulo-agendar-cita" className="text-page-title mt-2">
                  Agendar cita
                </h2>

                <p className="text-subtitle mt-2">
                  Completa los datos. La cita quedará pendiente de confirmación administrativa.
                </p>
              </div>

              <button
                type="button"
                onClick={cerrarFormulario}
                className="flex h-10 w-10 items-center justify-center rounded-xl text-surface-500 transition hover:bg-surface-100 dark:hover:bg-surface-800"
                aria-label="Cerrar formulario"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5 p-6">
              <div className="grid gap-5 md:grid-cols-2">
                {/* Fecha */}
                <CampoFormulario label="Fecha de la cita">
                  <input
                    type="date"
                    name="fecha"
                    value={formulario.fecha}
                    onChange={(e) => {
                      handleChange(e);
                      setFormulario((f) => ({ ...f, hora: "", veterinarioNombre: currentVetName }));
                    }}
                    required
                    className={campoClases}
                  />
                  {formulario.fecha && (
                    <p
                      className={`mt-1 text-xs font-medium ${isClinicOpen(formulario.fecha) ? "text-emerald-600" : "text-rose-600"}`}
                    >
                      {isClinicOpen(formulario.fecha)
                        ? `Horario: ${getScheduleLabel(formulario.fecha)}`
                        : "La clínica está cerrada este día"}
                    </p>
                  )}
                </CampoFormulario>

                {/* Hora — slots dinámicos */}
                <div>
                  <span className="form-label">Hora disponible</span>
                  {!formulario.fecha ? (
                    <p className="text-xs text-surface-400">Selecciona una fecha primero.</p>
                  ) : clinicaCerrada ? (
                    <div className="dark:bg-danger-950/30 rounded-xl border border-danger-200 bg-danger-50 px-4 py-3 text-xs text-danger-700 dark:border-danger-800 dark:text-danger-400">
                      No hay turnos disponibles. La clínica está cerrada ese día.
                    </div>
                  ) : (
                    <div className="grid max-h-[180px] grid-cols-3 gap-2 overflow-y-auto pr-1">
                      {clinicSlots.map((slot) => {
                        const bloqueado = slotsBloqueados.has(slot);
                        return (
                          <button
                            key={slot}
                            type="button"
                            disabled={bloqueado}
                            onClick={() => setFormulario((f) => ({ ...f, hora: slot }))}
                            title={bloqueado ? "Ya tienes una cita a esta hora" : undefined}
                            className={`rounded-xl border py-2 text-xs font-semibold transition ${
                              formulario.hora === slot
                                ? "border-brand-600 bg-brand-600 text-white"
                                : bloqueado
                                  ? "cursor-not-allowed border-surface-200 bg-surface-50 text-surface-400 line-through dark:border-surface-700 dark:bg-surface-950"
                                  : "border-surface-300 bg-white text-surface-600 hover:border-brand-400 dark:border-surface-700 dark:bg-surface-950 dark:text-surface-300"
                            }`}
                          >
                            {slot}
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* Mascota */}
                <div className="md:col-span-2">
                  <CampoFormulario label="Mascota">
                    <select
                      name="mascotaId"
                      value={formulario.mascotaId}
                      onChange={handleChange}
                      required
                      className={campoClases}
                    >
                      <option value="" disabled>
                        Selecciona la mascota
                      </option>
                      {mascotas.map((m) => (
                        <option key={m.id} value={m.id}>
                          {m.nombre} ({m.especie}) — Propietario: {m.propietarioNombre}
                        </option>
                      ))}
                    </select>
                  </CampoFormulario>
                </div>

                {mascotaSeleccionada && (
                  <>
                    <CampoFormulario label="Especie">
                      <input
                        type="text"
                        value={mascotaSeleccionada.especie}
                        readOnly
                        className={`${campoClases} cursor-not-allowed bg-surface-50 text-surface-500 dark:bg-surface-950`}
                      />
                    </CampoFormulario>

                    <CampoFormulario label="Propietario">
                      <input
                        type="text"
                        value={mascotaSeleccionada.propietarioNombre}
                        readOnly
                        className={`${campoClases} cursor-not-allowed bg-surface-50 text-surface-500 dark:bg-surface-950`}
                      />
                    </CampoFormulario>
                  </>
                )}

                {/* Servicio */}
                <div className="md:col-span-2">
                  <CampoFormulario label="Servicio solicitado">
                    <select
                      name="servicio"
                      value={formulario.servicio}
                      onChange={handleChange}
                      required
                      className={campoClases}
                    >
                      <option value="" disabled>
                        Selecciona el servicio
                      </option>
                      <option value="Consulta General">Consulta General</option>
                      <option value="Vacunación">Vacunación</option>
                      <option value="Control Post-Op">Control Post-Op</option>
                      <option value="Desparasitación">Desparasitación</option>
                      <option value="Urgencia">Urgencia</option>
                      <option value="Cirugía Menor">Cirugía Menor</option>
                    </select>
                  </CampoFormulario>
                </div>

                {/* Veterinario — disponibilidad basada en fecha+hora */}
                {formulario.fecha && formulario.hora && !clinicaCerrada && (
                  <div className="md:col-span-2">
                    <span className="form-label">
                      Veterinario asignado
                      <span className="ml-2 font-normal normal-case text-surface-400">
                        {vetsDisponibles.length} disponible{vetsDisponibles.length !== 1 ? "s" : ""}{" "}
                        a las {formulario.hora}
                      </span>
                    </span>
                    <div className="space-y-2">
                      {vetsDisponibles.map((v) => (
                        <button
                          key={v.id}
                          type="button"
                          onClick={() =>
                            setFormulario((f) => ({
                              ...f,
                              veterinarioNombre:
                                f.veterinarioNombre === (v.nombre ?? "") ? "" : (v.nombre ?? ""),
                            }))
                          }
                          className={`flex w-full items-center gap-3 rounded-xl border px-4 py-2.5 text-left text-sm transition ${
                            formulario.veterinarioNombre === v.nombre
                              ? "border-brand-400 bg-brand-50 text-brand-700 dark:border-brand-600 dark:bg-brand-950/30 dark:text-brand-300"
                              : "border-surface-200 bg-white text-surface-600 hover:border-brand-200 hover:bg-brand-50/40 dark:border-surface-700 dark:bg-surface-950 dark:text-surface-300"
                          }`}
                        >
                          <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-success-100 text-xs font-bold text-success-700 dark:bg-success-900/40 dark:text-success-300">
                            {(v.nombre ?? "?")[0].toUpperCase()}
                          </span>
                          <span className="flex-1 font-medium">{v.nombre}</span>
                          {formulario.veterinarioNombre === v.nombre && (
                            <span className="text-xs font-semibold text-brand-600 dark:text-brand-300">
                              Seleccionado
                            </span>
                          )}
                          <span className="text-xs text-success-600 dark:text-success-400">
                            Disponible
                          </span>
                        </button>
                      ))}

                      {vetsOcupados.map((v) => (
                        <div
                          key={v.id}
                          className="flex w-full items-center gap-3 rounded-xl border border-surface-200 bg-surface-50 px-4 py-2.5 text-sm opacity-50 dark:border-surface-700 dark:bg-surface-950"
                        >
                          <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-surface-200 text-xs font-bold text-surface-500 dark:bg-surface-700">
                            {(v.nombre ?? "?")[0].toUpperCase()}
                          </span>
                          <span className="flex-1 font-medium text-surface-500">{v.nombre}</span>
                          <span className="text-xs text-danger-500">Ocupado</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <CampoFormulario label="Observaciones">
                <textarea
                  name="observaciones"
                  value={formulario.observaciones}
                  onChange={handleChange}
                  rows={4}
                  placeholder="Describe información adicional sobre la cita..."
                  className={`${campoClases} min-h-[105px] resize-none py-3`}
                />
              </CampoFormulario>

              <div className="dark:bg-warning-950/30 rounded-2xl border border-warning-200 bg-warning-50 px-4 py-3 dark:border-warning-800">
                <p className="text-sm leading-6 text-warning-700 dark:text-warning-400">
                  <strong>Importante:</strong> el veterinario puede registrar la solicitud, pero no
                  confirmarla. El estado inicial será <strong>Pendiente de confirmación</strong>.
                </p>
              </div>

              <div className="flex flex-col-reverse gap-3 border-t border-surface-100 pt-5 dark:border-surface-800 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  onClick={cerrarFormulario}
                  className="flex h-11 items-center justify-center rounded-xl border border-surface-300 px-6 text-sm font-semibold text-surface-600 transition hover:bg-surface-50 dark:border-surface-700 dark:text-surface-300 dark:hover:bg-surface-800"
                >
                  Cancelar
                </button>

                <button
                  type="submit"
                  disabled={guardando || clinicaCerrada}
                  className="flex h-11 items-center justify-center rounded-xl bg-brand-600 px-7 text-sm font-semibold text-white transition hover:bg-brand-700 disabled:opacity-60"
                >
                  {guardando ? "Guardando..." : "Guardar solicitud"}
                </button>
              </div>
            </form>
          </section>
        </div>
      )}

      <AppointmentDetailModal
        isOpen={!!citaCalendario}
        onClose={() => setCitaCalendario(null)}
        appointment={citaCalendario}
      />
    </div>
  );
}

function CampoFormulario({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="block">
      <span className="form-label">{label}</span>
      {children}
    </label>
  );
}

function DatoDetalle({ titulo, valor }: { titulo: string; valor: string }) {
  return (
    <div className="rounded-xl bg-surface-50 px-4 py-3 dark:bg-surface-950">
      <p className="text-caption">{titulo}</p>
      <p className="mt-2 text-sm font-medium text-surface-900 dark:text-white">{valor}</p>
    </div>
  );
}

function formatearFecha(fecha: string) {
  if (!fecha || fecha === "Hoy") return fecha;
  const fechaLocal = new Date(`${fecha}T00:00:00`);
  return fechaLocal.toLocaleDateString("es-CO", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

const campoClases = "form-input";
