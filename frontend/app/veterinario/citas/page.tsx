"use client";

import Link from "next/link";
import {
  ChangeEvent,
  FormEvent,
  ReactNode,
  useState,
} from "react";

type EstadoCita =
  | "Pendiente de confirmación"
  | "Confirmada"
  | "En proceso"
  | "Atendida";

interface Cita {
  id: number;
  pacienteId?: string;
  fecha: string;
  hora: string;
  mascota: string;
  especie: string;
  raza: string;
  cliente: string;
  telefono: string;
  servicio: string;
  observaciones: string;
  estado: EstadoCita;
}

interface FormularioCita {
  fecha: string;
  hora: string;
  mascota: string;
  especie: string;
  raza: string;
  cliente: string;
  telefono: string;
  servicio: string;
  observaciones: string;
}

const citasIniciales: Cita[] = [
  {
    id: 1,
    pacienteId: "max",
    fecha: "Hoy",
    hora: "09:00",
    mascota: "Max",
    especie: "Canino",
    raza: "Labrador Retriever",
    cliente: "Juan Pérez",
    telefono: "300 555 1010",
    servicio: "Consulta General",
    observaciones: "Paciente programado para valoración general.",
    estado: "Confirmada",
  },
  {
    id: 2,
    fecha: "Hoy",
    hora: "10:30",
    mascota: "Luna",
    especie: "Felino",
    raza: "Persa",
    cliente: "María García",
    telefono: "301 420 1200",
    servicio: "Vacunación",
    observaciones: "Solicitud registrada pendiente de revisión administrativa.",
    estado: "Pendiente de confirmación",
  },
  {
    id: 3,
    pacienteId: "rocky",
    fecha: "Hoy",
    hora: "11:00",
    mascota: "Rocky",
    especie: "Canino",
    raza: "Bulldog Francés",
    cliente: "Carlos López",
    telefono: "315 780 2211",
    servicio: "Cirugía Menor",
    observaciones: "Control y revisión posterior al procedimiento.",
    estado: "Confirmada",
  },
  {
    id: 4,
    pacienteId: "bella",
    fecha: "Hoy",
    hora: "14:00",
    mascota: "Bella",
    especie: "Canino",
    raza: "Golden Retriever",
    cliente: "Ana Martínez",
    telefono: "312 420 8800",
    servicio: "Control Post-Op",
    observaciones: "Paciente en seguimiento clínico postoperatorio.",
    estado: "En proceso",
  },
];

function formularioVacio(): FormularioCita {
  return {
    fecha: "",
    hora: "",
    mascota: "",
    especie: "",
    raza: "",
    cliente: "",
    telefono: "",
    servicio: "",
    observaciones: "",
  };
}

export default function VeterinarioCitasPage() {
  const [citas, setCitas] = useState<Cita[]>(citasIniciales);
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [mostrarMensaje, setMostrarMensaje] = useState(false);
  const [citaDetalle, setCitaDetalle] = useState<Cita | null>(null);
  const [formulario, setFormulario] =
    useState<FormularioCita>(formularioVacio());

  const pendientes = citas.filter(
    (cita) => cita.estado === "Pendiente de confirmación"
  ).length;

  const confirmadas = citas.filter(
    (cita) => cita.estado === "Confirmada"
  ).length;

  function handleChange(
    event: ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) {
    const { name, value } = event.target;

    setFormulario((actual) => ({
      ...actual,
      [name]: value,
    }));
  }

  function abrirFormulario() {
    setFormulario(formularioVacio());
    setMostrarMensaje(false);
    setMostrarFormulario(true);
  }

  function cerrarFormulario() {
    setMostrarFormulario(false);
    setFormulario(formularioVacio());
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const nuevaCita: Cita = {
      id: Date.now(),
      fecha: formulario.fecha,
      hora: formulario.hora,
      mascota: formulario.mascota,
      especie: formulario.especie,
      raza: formulario.raza,
      cliente: formulario.cliente,
      telefono: formulario.telefono,
      servicio: formulario.servicio,
      observaciones: formulario.observaciones,
      estado: "Pendiente de confirmación",
    };

    setCitas((actuales) => [nuevaCita, ...actuales]);
    setMostrarFormulario(false);
    setMostrarMensaje(true);
    setFormulario(formularioVacio());
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
              Consulta las citas programadas y registra nuevas solicitudes de
              atención. Las citas creadas por el veterinario quedan pendientes
              de confirmación administrativa.
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

      {/* MENSAJE DE REGISTRO */}
      {mostrarMensaje && (
        <div className="flex items-start justify-between gap-4 rounded-[16px] border border-[#BBF7D0] bg-[#F0FDF4] px-5 py-4 dark:border-[#14532D] dark:bg-[#052E16]">
          <div>
            <p className="text-[14px] font-semibold text-[#15803D] dark:text-[#BBF7D0]">
              Cita registrada correctamente
            </p>

            <p className="mt-1 text-[13px] leading-6 text-[#166534] dark:text-[#BBF7D0]">
              La solicitud fue creada con estado{" "}
              <strong>Pendiente de confirmación</strong>. El administrador
              deberá revisarla y confirmarla.
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

          <p className="mt-4 text-4xl font-semibold text-[#10213A] dark:text-white">
            {pendientes}
          </p>

          <p className="mt-3 text-sm text-[#64748B] dark:text-[#94A3B8]">
            Solicitudes registradas que deben ser confirmadas por
            administración.
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
                    className={`rounded-full px-3 py-2 text-[13px] font-semibold ${estiloEstado(
                      cita.estado
                    )}`}
                  >
                    {cita.estado}
                  </span>
                </div>
              </div>
            </article>
          ))}
        </div>
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
                      className={`rounded-full px-3 py-1.5 text-[12px] font-semibold ${estiloEstado(
                        citaDetalle.estado
                      )}`}
                    >
                      {citaDetalle.estado}
                    </span>
                  </div>

                  <p className="mt-2 text-[14px] text-[#64748B] dark:text-[#94A3B8]">
                    {citaDetalle.especie} · {citaDetalle.raza}
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
              </div>

              <section className="rounded-[18px] border border-[#E2E8F0] bg-[#FBFCFF] p-5 dark:border-[#334155] dark:bg-[#0F172A]">
                <h3 className="text-[16px] font-semibold text-[#10213A] dark:text-white">
                  Información del paciente y propietario
                </h3>

                <div className="mt-5 grid gap-4 sm:grid-cols-2">
                  <DatoDetalle titulo="Paciente" valor={citaDetalle.mascota} />
                  <DatoDetalle
                    titulo="Especie y raza"
                    valor={`${citaDetalle.especie} · ${citaDetalle.raza}`}
                  />
                  <DatoDetalle
                    titulo="Propietario"
                    valor={citaDetalle.cliente}
                  />
                  <DatoDetalle
                    titulo="Teléfono"
                    valor={citaDetalle.telefono}
                  />
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
                    <strong>Pendiente de confirmación:</strong> esta solicitud
                    debe ser revisada por administración antes de iniciar la
                    atención clínica.
                  </p>
                </div>
              )}

              {(citaDetalle.estado === "Confirmada" ||
                citaDetalle.estado === "En proceso") && (
                <div className="rounded-[16px] border border-[#DBEAFE] bg-[#EFF6FF] px-4 py-3 dark:border-[#1E3A8A] dark:bg-[#172554]">
                  <p className="text-[13px] leading-6 text-[#1D4ED8] dark:text-[#BFDBFE]">
                    Esta cita está habilitada para atención. Puedes iniciar o
                    continuar el registro clínico del paciente.
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

                {citaDetalle.pacienteId &&
                  (citaDetalle.estado === "Confirmada" ||
                    citaDetalle.estado === "En proceso") && (
                    <Link
                      href={`/veterinario/consulta?paciente=${citaDetalle.pacienteId}`}
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
                  Completa los datos. La cita quedará pendiente de
                  confirmación administrativa.
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
                <CampoFormulario label="Fecha de la cita">
                  <input
                    type="date"
                    name="fecha"
                    value={formulario.fecha}
                    onChange={handleChange}
                    required
                    className={campoClases}
                  />
                </CampoFormulario>

                <CampoFormulario label="Hora">
                  <input
                    type="time"
                    name="hora"
                    value={formulario.hora}
                    onChange={handleChange}
                    required
                    className={campoClases}
                  />
                </CampoFormulario>

                <CampoFormulario label="Mascota">
                  <input
                    type="text"
                    name="mascota"
                    value={formulario.mascota}
                    onChange={handleChange}
                    placeholder="Nombre de la mascota"
                    required
                    className={campoClases}
                  />
                </CampoFormulario>

                <CampoFormulario label="Especie">
                  <select
                    name="especie"
                    value={formulario.especie}
                    onChange={handleChange}
                    required
                    className={campoClases}
                  >
                    <option value="" disabled>
                      Selecciona la especie
                    </option>
                    <option value="Canino">Canino</option>
                    <option value="Felino">Felino</option>
                    <option value="Otro">Otro</option>
                  </select>
                </CampoFormulario>

                <CampoFormulario label="Raza">
                  <input
                    type="text"
                    name="raza"
                    value={formulario.raza}
                    onChange={handleChange}
                    placeholder="Raza de la mascota"
                    required
                    className={campoClases}
                  />
                </CampoFormulario>

                <CampoFormulario label="Propietario">
                  <input
                    type="text"
                    name="cliente"
                    value={formulario.cliente}
                    onChange={handleChange}
                    placeholder="Nombre del propietario"
                    required
                    className={campoClases}
                  />
                </CampoFormulario>

                <CampoFormulario label="Teléfono de contacto">
                  <input
                    type="tel"
                    name="telefono"
                    value={formulario.telefono}
                    onChange={handleChange}
                    placeholder="Número de contacto"
                    required
                    className={campoClases}
                  />
                </CampoFormulario>

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
                  <strong>Importante:</strong> el veterinario puede registrar
                  la solicitud, pero no confirmarla. El estado inicial será{" "}
                  <strong>Pendiente de confirmación</strong>.
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
                  className="flex h-[46px] items-center justify-center rounded-xl bg-[#2F6BFF] px-7 text-[14px] font-semibold text-white transition hover:bg-[#2459DF]"
                >
                  Guardar solicitud
                </button>
              </div>
            </form>
          </section>
        </div>
      )}
    </div>
  );
}

function CampoFormulario({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-2 block text-[13px] font-semibold text-[#334155] dark:text-[#CBD5E1]">
        {label}
      </span>

      {children}
    </label>
  );
}

function DatoDetalle({
  titulo,
  valor,
}: {
  titulo: string;
  valor: string;
}) {
  return (
    <div className="rounded-[14px] bg-[#F8FAFC] px-4 py-3 dark:bg-[#0F172A]">
      <p className="text-[11px] font-semibold uppercase tracking-wide text-[#64748B] dark:text-[#94A3B8]">
        {titulo}
      </p>

      <p className="mt-2 text-[14px] font-medium text-[#10213A] dark:text-white">
        {valor}
      </p>
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
  if (fecha === "Hoy") {
    return "Hoy";
  }

  const fechaLocal = new Date(`${fecha}T00:00:00`);

  return fechaLocal.toLocaleDateString("es-CO", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

const campoClases =
  "h-[48px] w-full rounded-xl border border-[#CBD5E1] bg-white px-4 text-[14px] text-[#10213A] outline-none transition placeholder:text-[#94A3B8] focus:border-[#2F6BFF] focus:ring-4 focus:ring-[#2F6BFF]/10 dark:border-[#334155] dark:bg-[#0F172A] dark:text-white dark:placeholder:text-[#94A3B8]";