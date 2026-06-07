"use client";

import Link from "next/link";
import { ChangeEvent, FormEvent, ReactNode, useEffect, useMemo, useState } from "react";
import { fetchCitas, createCita } from "../../../lib/api/citas";
import { SkeletonBanner, SkeletonStats, SkeletonCardList } from "../../components/ui/Skeleton";
import { fetchMascotas } from "../../../lib/api/mascotas";
import { fetchVeterinarios } from "../../../lib/api/usuarios";
import type { UsuarioAPI } from "../../../lib/api/usuarios";
import type { Appointment } from "../../../lib/recepcionista/types";
import type { PetRecord } from "../../../lib/recepcionista/types";
import { getCurrentUser } from "../../../lib/auth";
import { getClinicSlots, isClinicOpen, getScheduleLabel } from "../../../lib/utils/clinic-schedule";

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
  const [mascotas, setMascotas] = useState<PetRecord[]>([]);
  const [vets, setVets] = useState<UsuarioAPI[]>([]);
  const [currentVetName] = useState(() => getCurrentUser()?.name ?? "");
  const [loading, setLoading] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [mostrarMensaje, setMostrarMensaje] = useState(false);
  const [citaDetalle, setCitaDetalle] = useState<Cita | null>(null);
  const [formulario, setFormulario] = useState<FormularioCita>(() =>
    formularioVacio(getCurrentUser()?.name ?? ""),
  );

  useEffect(() => {
    Promise.all([
      fetchCitas(),
      fetchMascotas(),
      fetchVeterinarios().catch(() => [] as UsuarioAPI[]),
    ])
      .then(([appts, pets, vetList]) => {
        setCitas(appts.map(mapAppointmentToCita));
        setMascotas(pets);
        setVets(vetList);
      })
      .catch(() => setError("No se pudo cargar la agenda. Verifica la conexión con el servidor."))
      .finally(() => setLoading(false));
  }, []);

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
      <header className="relative overflow-hidden rounded-[26px] border border-[#D9E4F3] bg-white p-7 shadow-[0_12px_30px_rgba(15,23,42,0.06)] dark:border-[#334155] dark:bg-[#111827]">
        <div className="absolute -right-16 -top-20 h-52 w-52 rounded-full bg-[#DBEAFE]/65 blur-3xl dark:bg-[#2563EB]/20" />

        <div className="relative flex flex-col justify-between gap-5 lg:flex-row lg:items-center">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-[#2563EB] dark:text-[#93C5FD]">
              Agenda diaria
            </p>

            <h1 className="mt-3 text-3xl font-bold text-[#10213A] dark:text-white">
              Agenda Veterinaria
            </h1>

            <p className="mt-3 max-w-3xl text-base leading-7 text-[#64748B] dark:text-[#94A3B8]">
              Consulta las citas programadas y registra nuevas solicitudes de atención. Las citas
              creadas por el veterinario quedan pendientes de confirmación administrativa.
            </p>
          </div>

          <button
            type="button"
            onClick={abrirFormulario}
            className="flex h-[50px] shrink-0 items-center justify-center gap-2 rounded-xl bg-[#2F6BFF] px-6 text-[15px] font-semibold text-white shadow-sm transition hover:-translate-y-0.5 hover:bg-[#2459DF] hover:shadow-[0_10px_20px_rgba(47,107,255,0.22)]"
          >
            <span className="text-xl leading-none">+</span>
            Agendar cita
          </button>
        </div>
      </header>

      {/* ERROR */}
      {error && (
        <div className="flex items-start justify-between gap-4 rounded-[16px] border border-[#FECACA] bg-[#FEF2F2] px-5 py-4 dark:border-[#7F1D1D] dark:bg-[#450A0A]">
          <p className="text-[14px] text-[#B91C1C] dark:text-[#FECACA]">{error}</p>
          <button
            type="button"
            onClick={() => setError(null)}
            className="text-[18px] font-semibold text-[#B91C1C]"
          >
            ×
          </button>
        </div>
      )}

      {/* MENSAJE DE REGISTRO */}
      {mostrarMensaje && (
        <div className="flex items-start justify-between gap-4 rounded-[16px] border border-[#BBF7D0] bg-[#F0FDF4] px-5 py-4 dark:border-[#14532D] dark:bg-[#052E16]">
          <div>
            <p className="text-[14px] font-semibold text-[#15803D] dark:text-[#BBF7D0]">
              Cita registrada correctamente
            </p>

            <p className="mt-1 text-[13px] leading-6 text-[#166534] dark:text-[#BBF7D0]">
              La solicitud fue creada con estado <strong>Pendiente de confirmación</strong>. El
              administrador deberá revisarla y confirmarla.
            </p>
          </div>

          <button
            type="button"
            onClick={() => setMostrarMensaje(false)}
            className="text-[18px] font-semibold text-[#15803D] dark:text-[#BBF7D0]"
            aria-label="Cerrar mensaje"
          >
            ×
          </button>
        </div>
      )}

      {/* INDICADORES */}
      <section className="grid gap-4 md:grid-cols-2">
        <article className="rounded-[20px] border border-[#D9E2EF] bg-white p-6 shadow-[0_7px_20px_rgba(15,23,42,0.05)] transition hover:-translate-y-1 hover:shadow-[0_16px_32px_rgba(15,23,42,0.08)] dark:border-[#334155] dark:bg-[#111827]">
          <p className="text-sm font-medium text-[#64748B] dark:text-[#94A3B8]">
            Pendientes de confirmación
          </p>

          <p className="mt-4 text-4xl font-semibold text-[#10213A] dark:text-white">{pendientes}</p>

          <p className="mt-3 text-sm text-[#64748B] dark:text-[#94A3B8]">
            Solicitudes registradas que deben ser confirmadas por administración.
          </p>
        </article>

        <article className="rounded-[20px] border border-[#D9E2EF] bg-white p-6 shadow-[0_7px_20px_rgba(15,23,42,0.05)] transition hover:-translate-y-1 hover:shadow-[0_16px_32px_rgba(15,23,42,0.08)] dark:border-[#334155] dark:bg-[#111827]">
          <p className="text-sm font-medium text-[#64748B] dark:text-[#94A3B8]">
            Citas confirmadas
          </p>

          <p className="mt-4 text-4xl font-semibold text-[#10213A] dark:text-white">
            {confirmadas}
          </p>

          <p className="mt-3 text-sm text-[#64748B] dark:text-[#94A3B8]">
            Citas autorizadas previamente por administración para atención.
          </p>
        </article>
      </section>

      {/* LISTA DE CITAS */}
      <section className="rounded-[22px] border border-[#D9E2EF] bg-white p-6 shadow-[0_8px_24px_rgba(15,23,42,0.05)] dark:border-[#334155] dark:bg-[#111827]">
        <div className="mb-6 flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
          <div>
            <h2 className="text-[20px] font-semibold text-[#10213A] dark:text-white">
              Citas registradas
            </h2>

            <p className="mt-1 text-sm text-[#64748B] dark:text-[#94A3B8]">
              Consulta el estado actual y revisa los detalles de cada cita.
            </p>
          </div>

          <span className="w-fit rounded-full bg-[#EEF4FF] px-4 py-2 text-sm font-semibold text-[#2F6BFF] dark:bg-[#1E293B] dark:text-[#93C5FD]">
            {citas.length} citas
          </span>
        </div>

        {citas.length === 0 ? (
          <p className="py-10 text-center text-[14px] text-[#64748B] dark:text-[#94A3B8]">
            No hay citas registradas.
          </p>
        ) : (
          <div className="space-y-3">
            {citas.map((cita) => (
              <article
                key={cita.id}
                className="group rounded-[20px] border border-[#E5EAF2] bg-[#F8FAFC] p-5 transition-all duration-300 hover:-translate-y-0.5 hover:border-[#D6E3FF] hover:shadow-[0_12px_26px_rgba(15,23,42,0.06)] dark:border-[#334155] dark:bg-[#0F172A]"
              >
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="text-[15px] font-semibold text-[#10213A] transition group-hover:text-[#2563EB] dark:text-white">
                      {formatearFecha(cita.fecha)} · {cita.hora} • {cita.mascota}
                    </p>

                    <p className="mt-1 text-sm text-[#64748B] dark:text-[#94A3B8]">
                      {cita.cliente} · {cita.servicio}
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center gap-3">
                    <button
                      type="button"
                      onClick={() => setCitaDetalle(cita)}
                      className="flex h-[40px] items-center justify-center rounded-xl border border-[#D6E3FF] bg-white px-4 text-[13px] font-semibold text-[#2563EB] transition hover:-translate-y-0.5 hover:bg-[#EFF6FF] dark:border-[#334155] dark:bg-[#111827] dark:text-[#93C5FD] dark:hover:bg-[#1E293B]"
                    >
                      Ver detalles
                    </button>

                    <span
                      className={`rounded-full px-3 py-2 text-[13px] font-semibold ${estiloEstado(cita.estado)}`}
                    >
                      {cita.estado}
                    </span>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>

      {/* MODAL DETALLE DE LA CITA */}
      {citaDetalle && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#0F172A]/55 px-4 py-6 backdrop-blur-[2px]">
          <section
            role="dialog"
            aria-modal="true"
            aria-labelledby="titulo-detalle-cita"
            className="max-h-[95vh] w-full max-w-[780px] overflow-y-auto rounded-[26px] bg-white shadow-[0_26px_80px_rgba(15,23,42,0.30)] dark:bg-[#111827]"
          >
            <div className="relative overflow-hidden border-b border-[#E2E8F0] px-6 py-6 dark:border-[#334155]">
              <div className="absolute -right-10 -top-12 h-40 w-40 rounded-full bg-[#DBEAFE]/65 blur-3xl dark:bg-[#2563EB]/20" />

              <div className="relative flex items-start justify-between gap-5">
                <div>
                  <p className="text-[12px] font-semibold uppercase tracking-[0.2em] text-[#2563EB] dark:text-[#93C5FD]">
                    Detalle de la cita
                  </p>

                  <div className="mt-3 flex flex-wrap items-center gap-3">
                    <h2
                      id="titulo-detalle-cita"
                      className="text-[26px] font-bold text-[#10213A] dark:text-white"
                    >
                      {citaDetalle.mascota}
                    </h2>

                    <span
                      className={`rounded-full px-3 py-1.5 text-[12px] font-semibold ${estiloEstado(citaDetalle.estado)}`}
                    >
                      {citaDetalle.estado}
                    </span>
                  </div>

                  <p className="mt-2 text-[14px] text-[#64748B] dark:text-[#94A3B8]">
                    {citaDetalle.especie}
                    {citaDetalle.raza ? ` · ${citaDetalle.raza}` : ""}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => setCitaDetalle(null)}
                  className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-[26px] text-[#64748B] transition hover:bg-[#F1F5F9] dark:hover:bg-[#1E293B]"
                  aria-label="Cerrar detalle"
                >
                  ×
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

              <section className="rounded-[18px] border border-[#E2E8F0] bg-[#FBFCFF] p-5 dark:border-[#334155] dark:bg-[#0F172A]">
                <h3 className="text-[16px] font-semibold text-[#10213A] dark:text-white">
                  Información del paciente y propietario
                </h3>

                <div className="mt-5 grid gap-4 sm:grid-cols-2">
                  <DatoDetalle titulo="Paciente" valor={citaDetalle.mascota} />
                  <DatoDetalle titulo="Especie" valor={citaDetalle.especie || "—"} />
                  <DatoDetalle titulo="Propietario" valor={citaDetalle.cliente || "—"} />
                </div>
              </section>

              <section className="rounded-[18px] border border-[#E2E8F0] bg-[#FBFCFF] p-5 dark:border-[#334155] dark:bg-[#0F172A]">
                <h3 className="text-[16px] font-semibold text-[#10213A] dark:text-white">
                  Observaciones registradas
                </h3>

                <p className="mt-3 text-[14px] leading-7 text-[#64748B] dark:text-[#94A3B8]">
                  {citaDetalle.observaciones || "No hay observaciones registradas."}
                </p>
              </section>

              {citaDetalle.estado === "Pendiente de confirmación" && (
                <div className="rounded-[16px] border border-[#FDE68A] bg-[#FFFBEB] px-4 py-3 dark:border-[#78350F] dark:bg-[#451A03]">
                  <p className="text-[13px] leading-6 text-[#92400E] dark:text-[#FDE68A]">
                    <strong>Pendiente de confirmación:</strong> esta solicitud debe ser revisada por
                    administración antes de iniciar la atención clínica.
                  </p>
                </div>
              )}

              {(citaDetalle.estado === "Confirmada" || citaDetalle.estado === "En proceso") && (
                <div className="rounded-[16px] border border-[#DBEAFE] bg-[#EFF6FF] px-4 py-3 dark:border-[#1E3A8A] dark:bg-[#172554]">
                  <p className="text-[13px] leading-6 text-[#1D4ED8] dark:text-[#BFDBFE]">
                    Esta cita está habilitada para atención. Puedes iniciar o continuar el registro
                    clínico del paciente.
                  </p>
                </div>
              )}

              <div className="flex flex-col-reverse gap-3 border-t border-[#E2E8F0] pt-5 dark:border-[#334155] sm:flex-row sm:justify-end">
                <button
                  type="button"
                  onClick={() => setCitaDetalle(null)}
                  className="flex h-[46px] items-center justify-center rounded-xl border border-[#CBD5E1] px-6 text-[14px] font-semibold text-[#475569] transition hover:bg-[#F8FAFC] dark:border-[#334155] dark:text-[#CBD5E1] dark:hover:bg-[#1E293B]"
                >
                  Cerrar
                </button>

                {(citaDetalle.estado === "Confirmada" || citaDetalle.estado === "En proceso") && (
                  <Link
                    href={`/veterinario/consulta?cita=${citaDetalle.id}`}
                    className="flex h-[46px] items-center justify-center rounded-xl bg-[#2F6BFF] px-6 text-[14px] font-semibold text-white transition hover:bg-[#2459DF]"
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#0F172A]/55 px-4 py-6 backdrop-blur-[2px]">
          <section
            role="dialog"
            aria-modal="true"
            aria-labelledby="titulo-agendar-cita"
            className="max-h-[95vh] w-full max-w-[780px] overflow-y-auto rounded-[26px] bg-white shadow-[0_26px_80px_rgba(15,23,42,0.30)] dark:bg-[#111827]"
          >
            <div className="flex items-start justify-between border-b border-[#E2E8F0] px-6 py-5 dark:border-[#334155]">
              <div>
                <p className="text-[12px] font-semibold uppercase tracking-[0.18em] text-[#2F6BFF]">
                  Nueva solicitud
                </p>

                <h2
                  id="titulo-agendar-cita"
                  className="mt-2 text-[24px] font-bold text-[#10213A] dark:text-white"
                >
                  Agendar cita
                </h2>

                <p className="mt-2 text-[14px] text-[#64748B] dark:text-[#94A3B8]">
                  Completa los datos. La cita quedará pendiente de confirmación administrativa.
                </p>
              </div>

              <button
                type="button"
                onClick={cerrarFormulario}
                className="flex h-10 w-10 items-center justify-center rounded-xl text-[25px] text-[#64748B] transition hover:bg-[#F1F5F9] dark:hover:bg-[#1E293B]"
                aria-label="Cerrar formulario"
              >
                ×
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
                  <span className="mb-2 block text-[13px] font-semibold text-[#334155] dark:text-[#CBD5E1]">
                    Hora disponible
                  </span>
                  {!formulario.fecha ? (
                    <p className="text-xs text-[#94A3B8]">Selecciona una fecha primero.</p>
                  ) : clinicaCerrada ? (
                    <div className="rounded-xl border border-[#FECACA] bg-[#FEF2F2] px-4 py-3 text-xs text-[#B91C1C] dark:border-[#7F1D1D] dark:bg-[#450A0A] dark:text-[#FECACA]">
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
                                ? "border-[#2F6BFF] bg-[#2F6BFF] text-white"
                                : bloqueado
                                  ? "cursor-not-allowed border-[#E5EAF2] bg-[#F8FAFC] text-[#94A3B8] line-through dark:border-[#334155] dark:bg-[#0F172A]"
                                  : "border-[#CBD5E1] bg-white text-[#475569] hover:border-[#2F6BFF] dark:border-[#334155] dark:bg-[#0F172A] dark:text-[#CBD5E1]"
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
                        className={`${campoClases} cursor-not-allowed bg-[#F8FAFC] text-[#64748B] dark:bg-[#0F172A]`}
                      />
                    </CampoFormulario>

                    <CampoFormulario label="Propietario">
                      <input
                        type="text"
                        value={mascotaSeleccionada.propietarioNombre}
                        readOnly
                        className={`${campoClases} cursor-not-allowed bg-[#F8FAFC] text-[#64748B] dark:bg-[#0F172A]`}
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
                    <span className="mb-2 block text-[13px] font-semibold text-[#334155] dark:text-[#CBD5E1]">
                      Veterinario asignado
                      <span className="ml-2 text-xs font-normal text-[#94A3B8]">
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
                          className={`flex w-full items-center gap-3 rounded-xl border px-4 py-2.5 text-left text-[13px] transition ${
                            formulario.veterinarioNombre === v.nombre
                              ? "border-[#2F6BFF] bg-[#EFF6FF] text-[#1D4ED8] dark:border-[#2563EB] dark:bg-[#172554] dark:text-[#BFDBFE]"
                              : "border-[#E2E8F0] bg-white text-[#475569] hover:border-[#BFDBFE] hover:bg-[#F0F9FF] dark:border-[#334155] dark:bg-[#0F172A] dark:text-[#CBD5E1]"
                          }`}
                        >
                          <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-emerald-100 text-xs font-bold text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300">
                            {(v.nombre ?? "?")[0].toUpperCase()}
                          </span>
                          <span className="flex-1 font-medium">{v.nombre}</span>
                          {formulario.veterinarioNombre === v.nombre && (
                            <span className="text-xs font-semibold text-[#2563EB] dark:text-[#93C5FD]">
                              Seleccionado
                            </span>
                          )}
                          <span className="text-xs text-emerald-600 dark:text-emerald-400">
                            Disponible
                          </span>
                        </button>
                      ))}

                      {vetsOcupados.map((v) => (
                        <div
                          key={v.id}
                          className="flex w-full items-center gap-3 rounded-xl border border-[#E5EAF2] bg-[#F8FAFC] px-4 py-2.5 text-[13px] opacity-50 dark:border-[#334155] dark:bg-[#0F172A]"
                        >
                          <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-slate-200 text-xs font-bold text-slate-500 dark:bg-slate-700">
                            {(v.nombre ?? "?")[0].toUpperCase()}
                          </span>
                          <span className="flex-1 font-medium text-[#64748B]">{v.nombre}</span>
                          <span className="text-xs text-rose-500">Ocupado</span>
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

              <div className="rounded-[14px] border border-[#FDE68A] bg-[#FFFBEB] px-4 py-3 dark:border-[#78350F] dark:bg-[#451A03]">
                <p className="text-[13px] leading-6 text-[#92400E] dark:text-[#FDE68A]">
                  <strong>Importante:</strong> el veterinario puede registrar la solicitud, pero no
                  confirmarla. El estado inicial será <strong>Pendiente de confirmación</strong>.
                </p>
              </div>

              <div className="flex flex-col-reverse gap-3 border-t border-[#E2E8F0] pt-5 dark:border-[#334155] sm:flex-row sm:justify-end">
                <button
                  type="button"
                  onClick={cerrarFormulario}
                  className="flex h-[46px] items-center justify-center rounded-xl border border-[#CBD5E1] px-6 text-[14px] font-semibold text-[#475569] transition hover:bg-[#F8FAFC] dark:border-[#334155] dark:text-[#CBD5E1] dark:hover:bg-[#1E293B]"
                >
                  Cancelar
                </button>

                <button
                  type="submit"
                  disabled={guardando || clinicaCerrada}
                  className="flex h-[46px] items-center justify-center rounded-xl bg-[#2F6BFF] px-7 text-[14px] font-semibold text-white transition hover:bg-[#2459DF] disabled:opacity-60"
                >
                  {guardando ? "Guardando..." : "Guardar solicitud"}
                </button>
              </div>
            </form>
          </section>
        </div>
      )}
    </div>
  );
}

function CampoFormulario({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="block">
      <span className="mb-2 block text-[13px] font-semibold text-[#334155] dark:text-[#CBD5E1]">
        {label}
      </span>
      {children}
    </label>
  );
}

function DatoDetalle({ titulo, valor }: { titulo: string; valor: string }) {
  return (
    <div className="rounded-[14px] bg-[#F8FAFC] px-4 py-3 dark:bg-[#0F172A]">
      <p className="text-[11px] font-semibold uppercase tracking-wide text-[#64748B] dark:text-[#94A3B8]">
        {titulo}
      </p>
      <p className="mt-2 text-[14px] font-medium text-[#10213A] dark:text-white">{valor}</p>
    </div>
  );
}

function estiloEstado(estado: EstadoCita) {
  switch (estado) {
    case "Pendiente de confirmación":
      return "bg-[#FEF3C7] text-[#B45309] dark:bg-[#78350F] dark:text-[#FDE68A]";
    case "Confirmada":
      return "bg-[#DCFCE7] text-[#15803D] dark:bg-[#14532D] dark:text-[#BBF7D0]";
    case "En proceso":
      return "bg-[#DBEAFE] text-[#2563EB] dark:bg-[#1E3A8A] dark:text-[#BFDBFE]";
    case "Atendida":
      return "bg-[#E0E7FF] text-[#4338CA] dark:bg-[#312E81] dark:text-[#C7D2FE]";
  }
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

const campoClases =
  "h-[48px] w-full rounded-xl border border-[#CBD5E1] bg-white px-4 text-[14px] text-[#10213A] outline-none transition placeholder:text-[#94A3B8] focus:border-[#2F6BFF] focus:ring-4 focus:ring-[#2F6BFF]/10 dark:border-[#334155] dark:bg-[#0F172A] dark:text-white dark:placeholder:text-[#94A3B8]";
