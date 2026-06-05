"use client";

import Link from "next/link";
import {
  ChangeEvent,
  FormEvent,
  ReactNode,
  useEffect,
  useMemo,
  useState,
} from "react";
import { fetchCitas, updateCita } from "../../../lib/api/citas";
import type { Appointment } from "../../../lib/recepcionista/types";
import { getCurrentUser } from "../../../lib/auth";

type Seguimiento = "No" | "Sí";

interface CitaHabilitada {
  id: string;
  petId: string;
  paciente: string;
  especie: string;
  raza: string;
  propietario: string;
  servicio: string;
  fecha: string;
  hora: string;
  estado: "Confirmada";
}

interface FormularioConsulta {
  citaId: string;
  motivoReferido: string;
  peso: string;
  temperatura: string;
  frecuenciaCardiaca: string;
  hallazgos: string;
  diagnostico: string;
  tratamiento: string;
  recomendaciones: string;
  seguimiento: Seguimiento;
  fechaControl: string;
}

function formularioInicial(): FormularioConsulta {
  return {
    citaId: "",
    motivoReferido: "",
    peso: "",
    temperatura: "",
    frecuenciaCardiaca: "",
    hallazgos: "",
    diagnostico: "",
    tratamiento: "",
    recomendaciones: "",
    seguimiento: "No",
    fechaControl: "",
  };
}

function mapAppointmentToCitaHabilitada(a: Appointment): CitaHabilitada {
  return {
    id: a.id,
    petId: a.petId,
    paciente: a.petName,
    especie: a.petEspecie ?? "",
    raza: a.petRaza ?? "",
    propietario: a.ownerName,
    servicio: a.service,
    fecha: a.date,
    hora: a.time,
    estado: "Confirmada",
  };
}

export default function RegistrarConsultaPage() {
  const [citasHabilitadas, setCitasHabilitadas] = useState<CitaHabilitada[]>([]);
  const [todasLasCitas, setTodasLasCitas] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [guardado, setGuardado] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formulario, setFormulario] = useState<FormularioConsulta>(formularioInicial());

  const user = getCurrentUser();

  useEffect(() => {
    fetchCitas()
      .then((appts) => {
        setTodasLasCitas(appts);
        const confirmadas = appts
          .filter((a) => a.status === "Confirmada" || a.status === "En atención")
          .map(mapAppointmentToCitaHabilitada);
        setCitasHabilitadas(confirmadas);

        const parametros = new URLSearchParams(window.location.search);
        const citaUrl = parametros.get("cita");
        const pacienteUrl = parametros.get("paciente");

        if (citaUrl) {
          const found = confirmadas.find((c) => c.id === citaUrl);
          if (found) {
            setFormulario((actual) => ({ ...actual, citaId: found.id }));
          }
        } else if (pacienteUrl) {
          const found = confirmadas.find((c) => c.petId === pacienteUrl);
          if (found) {
            setFormulario((actual) => ({ ...actual, citaId: found.id }));
          }
        }
      })
      .catch(() => setError("No se pudo cargar las citas. Verifica la conexión con el servidor."))
      .finally(() => setLoading(false));
  }, []);

  const citaSeleccionada = useMemo(
    () => citasHabilitadas.find((cita) => cita.id === formulario.citaId) ?? null,
    [formulario.citaId, citasHabilitadas]
  );

  function seleccionarCita(event: ChangeEvent<HTMLSelectElement>) {
    const citaId = event.target.value;
    setFormulario({ ...formularioInicial(), citaId });
    setGuardado(false);
    setError(null);
  }

  function actualizarCampo(
    event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) {
    const campo = event.target.name as keyof FormularioConsulta;
    const valor = event.target.value;
    setFormulario((actual) => ({
      ...actual,
      [campo]: valor,
      ...(campo === "seguimiento" && valor === "No" ? { fechaControl: "" } : {}),
    }));
    setGuardado(false);
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!citaSeleccionada) return;

    const citaOriginal = todasLasCitas.find((a) => a.id === citaSeleccionada.id);
    if (!citaOriginal) return;

    setGuardando(true);
    setError(null);
    try {
      const notasClinicas = JSON.stringify({
        tipo: "Consulta",
        motivoReferido: formulario.motivoReferido,
        hallazgos: formulario.hallazgos,
        diagnostico: formulario.diagnostico,
        tratamiento: formulario.tratamiento,
        recomendaciones: formulario.recomendaciones,
        peso: formulario.peso,
        temperatura: formulario.temperatura,
        frecuenciaCardiaca: formulario.frecuenciaCardiaca,
        seguimiento: formulario.seguimiento,
        ...(formulario.seguimiento === "Sí" ? { fechaControl: formulario.fechaControl } : {}),
      });

      await updateCita({
        ...citaOriginal,
        status: "Finalizada",
        notes: notasClinicas,
        veterinarian: user?.name ?? citaOriginal.veterinarian,
      });

      setCitasHabilitadas((prev) => prev.filter((c) => c.id !== citaSeleccionada.id));
      setGuardado(true);
      setFormulario(formularioInicial());
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al guardar la consulta.");
    } finally {
      setGuardando(false);
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <p className="text-[14px] text-[#64748B] dark:text-[#94A3B8]">Cargando citas confirmadas...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* ENCABEZADO */}
      <section className="consulta-enter relative overflow-hidden rounded-[24px] border border-[#D9E4F3] bg-white p-6 shadow-[0_10px_28px_rgba(15,23,42,0.06)] dark:border-[#334155] dark:bg-[#111827]">
        <div className="consulta-orb absolute -right-16 -top-20 h-52 w-52 rounded-full bg-[#DBEAFE]/70 blur-3xl dark:bg-[#2563EB]/20" />

        <div className="relative flex flex-col justify-between gap-5 lg:flex-row lg:items-center">
          <div>
            <p className="text-[13px] font-semibold uppercase tracking-[0.2em] text-[#2563EB] dark:text-[#93C5FD]">
              Atención clínica
            </p>

            <h1 className="mt-3 text-[29px] font-bold text-[#10213A] dark:text-white">
              Registrar consulta y tratamiento
            </h1>

            <p className="mt-3 max-w-3xl text-[14px] leading-7 text-[#64748B] dark:text-[#94A3B8]">
              Documenta la valoración médica de un paciente asignado y actualiza su historial clínico
              con diagnóstico, tratamiento y seguimiento.
            </p>
          </div>

          <Link
            href="/veterinario/citas"
            className="flex h-[48px] shrink-0 items-center justify-center rounded-xl border border-[#D6E3FF] bg-white px-5 text-[14px] font-semibold text-[#2563EB] transition hover:-translate-y-0.5 hover:bg-[#EFF6FF] dark:border-[#334155] dark:bg-[#111827] dark:text-[#93C5FD]"
          >
            Volver a agenda diaria
          </Link>
        </div>
      </section>

      {/* ERROR */}
      {error && (
        <div className="flex items-start justify-between gap-4 rounded-[16px] border border-[#FECACA] bg-[#FEF2F2] px-5 py-4 dark:border-[#7F1D1D] dark:bg-[#450A0A]">
          <p className="text-[14px] text-[#B91C1C] dark:text-[#FECACA]">{error}</p>
          <button type="button" onClick={() => setError(null)} className="text-[18px] font-semibold text-[#B91C1C]">×</button>
        </div>
      )}

      {/* MENSAJE DE GUARDADO */}
      {guardado && (
        <div className="consulta-alert-enter flex items-start justify-between gap-4 rounded-[16px] border border-[#BBF7D0] bg-[#F0FDF4] px-5 py-4 dark:border-[#14532D] dark:bg-[#052E16]">
          <div>
            <p className="text-[14px] font-semibold text-[#15803D] dark:text-[#BBF7D0]">
              Consulta registrada correctamente
            </p>
            <p className="mt-1 text-[13px] leading-6 text-[#166534] dark:text-[#BBF7D0]">
              La atención clínica fue registrada y el historial del paciente ha sido actualizado.
            </p>
          </div>
          <button
            type="button"
            onClick={() => setGuardado(false)}
            className="text-[19px] font-semibold text-[#15803D] dark:text-[#BBF7D0]"
            aria-label="Cerrar mensaje"
          >
            ×
          </button>
        </div>
      )}

      {citasHabilitadas.length === 0 && !loading && (
        <div className="rounded-[16px] border border-[#DBEAFE] bg-[#EFF6FF] px-5 py-4 dark:border-[#1E3A8A] dark:bg-[#172554]">
          <p className="text-[14px] text-[#1D4ED8] dark:text-[#BFDBFE]">
            No hay citas confirmadas disponibles para atención en este momento.
          </p>
        </div>
      )}

      <form
        onSubmit={handleSubmit}
        className="grid gap-5 xl:grid-cols-[0.92fr_1.18fr]"
      >
        {/* DATOS DE LA ATENCIÓN */}
        <section className="consulta-card rounded-[22px] border border-[#D9E2EF] bg-white p-6 shadow-[0_8px_24px_rgba(15,23,42,0.05)] dark:border-[#334155] dark:bg-[#111827]">
          <div className="mb-6">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-[14px] bg-[#EFF6FF] text-[#2563EB] dark:bg-[#1E3A8A] dark:text-[#BFDBFE]">
                <ConsultaIcon name="patient" />
              </div>

              <div>
                <h2 className="text-[19px] font-semibold text-[#10213A] dark:text-white">
                  Datos de la atención
                </h2>
                <p className="mt-1 text-[13px] text-[#64748B] dark:text-[#94A3B8]">
                  Selecciona una cita habilitada.
                </p>
              </div>
            </div>
          </div>

          <div className="mb-6 flex items-start gap-3 rounded-[14px] border border-[#DBEAFE] bg-[#EFF6FF] px-4 py-3 dark:border-[#1E3A8A] dark:bg-[#172554]">
            <ConsultaIcon name="lock" className="mt-0.5 h-[17px] w-[17px] shrink-0 text-[#2563EB] dark:text-[#93C5FD]" />
            <p className="text-[13px] leading-6 text-[#1D4ED8] dark:text-[#BFDBFE]">
              Solo se muestran citas confirmadas para atención. Los datos generales no pueden editarse
              desde este módulo.
            </p>
          </div>

          <div className="space-y-5">
            <Campo label="Cita confirmada / paciente asignado">
              <select
                name="citaId"
                value={formulario.citaId}
                onChange={seleccionarCita}
                required
                className={campoClases}
              >
                <option value="" disabled>
                  Seleccionar cita confirmada
                </option>

                {citasHabilitadas.map((cita) => (
                  <option key={cita.id} value={cita.id}>
                    {cita.hora} — {cita.paciente} · {cita.servicio}
                  </option>
                ))}
              </select>
            </Campo>

            {citaSeleccionada && (
              <div className="consulta-patient-summary rounded-[16px] border border-[#D6E3FF] bg-gradient-to-r from-[#F8FBFF] to-[#EFF6FF] p-4 dark:border-[#29406B] dark:from-[#0F172A] dark:to-[#172554]">
                <div className="flex items-center gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-[15px] bg-[#DBEAFE] text-[18px] font-bold text-[#2563EB] dark:bg-[#1E3A8A] dark:text-[#BFDBFE]">
                    {citaSeleccionada.paciente.charAt(0)}
                  </div>
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="text-[15px] font-semibold text-[#10213A] dark:text-white">
                        {citaSeleccionada.paciente}
                      </p>
                      <span className="rounded-full bg-[#DCFCE7] px-2.5 py-1 text-[11px] font-semibold text-[#15803D] dark:bg-[#14532D] dark:text-[#BBF7D0]">
                        Confirmada
                      </span>
                    </div>
                    <p className="mt-1 text-[13px] text-[#64748B] dark:text-[#94A3B8]">
                      {citaSeleccionada.especie}
                      {citaSeleccionada.raza ? ` · ${citaSeleccionada.raza}` : ""}
                    </p>
                  </div>
                </div>
              </div>
            )}

            <Campo label="Propietario">
              <input
                type="text"
                value={citaSeleccionada?.propietario ?? ""}
                readOnly
                placeholder="Se carga automáticamente al seleccionar la cita"
                className={`${campoClases} campo-bloqueado`}
              />
            </Campo>

            <Campo label="Motivo agendado">
              <input
                type="text"
                value={citaSeleccionada?.servicio ?? ""}
                readOnly
                placeholder="Se carga automáticamente al seleccionar la cita"
                className={`${campoClases} campo-bloqueado`}
              />
            </Campo>

            <div className="grid gap-4 sm:grid-cols-2">
              <Campo label="Fecha de atención">
                <input
                  type="text"
                  value={citaSeleccionada?.fecha ?? ""}
                  readOnly
                  placeholder="Fecha"
                  className={`${campoClases} campo-bloqueado`}
                />
              </Campo>

              <Campo label="Hora de atención">
                <input
                  type="text"
                  value={citaSeleccionada?.hora ?? ""}
                  readOnly
                  placeholder="Hora"
                  className={`${campoClases} campo-bloqueado`}
                />
              </Campo>
            </div>

            <Campo label="Motivo referido durante la atención">
              <textarea
                name="motivoReferido"
                value={formulario.motivoReferido}
                onChange={actualizarCampo}
                rows={3}
                required
                placeholder="Ej. El propietario reporta pérdida de apetito y decaimiento desde hace dos días..."
                className={`${campoClases} textarea-style`}
              />
            </Campo>

            <div className="grid gap-4 sm:grid-cols-3">
              <Campo label="Peso">
                <input
                  type="text"
                  name="peso"
                  value={formulario.peso}
                  onChange={actualizarCampo}
                  placeholder="Ej. 12 kg"
                  required
                  className={campoClases}
                />
              </Campo>

              <Campo label="Temperatura">
                <input
                  type="text"
                  name="temperatura"
                  value={formulario.temperatura}
                  onChange={actualizarCampo}
                  placeholder="38.5 °C"
                  required
                  className={campoClases}
                />
              </Campo>

              <Campo label="Frec. cardiaca">
                <input
                  type="text"
                  name="frecuenciaCardiaca"
                  value={formulario.frecuenciaCardiaca}
                  onChange={actualizarCampo}
                  placeholder="ppm"
                  className={campoClases}
                />
              </Campo>
            </div>
          </div>
        </section>

        {/* REGISTRO CLÍNICO */}
        <section className="consulta-card consulta-card-delay rounded-[22px] border border-[#D9E2EF] bg-white p-6 shadow-[0_8px_24px_rgba(15,23,42,0.05)] dark:border-[#334155] dark:bg-[#111827]">
          <div className="mb-6 flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-[14px] bg-[#EFF6FF] text-[#2563EB] dark:bg-[#1E3A8A] dark:text-[#BFDBFE]">
              <ConsultaIcon name="clipboard" />
            </div>
            <div>
              <h2 className="text-[19px] font-semibold text-[#10213A] dark:text-white">
                Registro clínico
              </h2>
              <p className="mt-1 text-[13px] text-[#64748B] dark:text-[#94A3B8]">
                Documenta diagnóstico, tratamiento y seguimiento.
              </p>
            </div>
          </div>

          <div className="space-y-5">
            <Campo label="Hallazgos clínicos">
              <textarea
                name="hallazgos"
                value={formulario.hallazgos}
                onChange={actualizarCampo}
                rows={3}
                required
                placeholder="Describe signos, síntomas y resultados de la valoración..."
                className={`${campoClases} textarea-style`}
              />
            </Campo>

            <Campo label="Diagnóstico">
              <textarea
                name="diagnostico"
                value={formulario.diagnostico}
                onChange={actualizarCampo}
                rows={3}
                required
                placeholder="Registra el diagnóstico clínico del paciente..."
                className={`${campoClases} textarea-style`}
              />
            </Campo>

            <Campo label="Tratamiento formulado">
              <textarea
                name="tratamiento"
                value={formulario.tratamiento}
                onChange={actualizarCampo}
                rows={3}
                required
                placeholder="Medicamentos, dosis, frecuencia y duración..."
                className={`${campoClases} textarea-style`}
              />
            </Campo>

            <Campo label="Recomendaciones y signos de alarma">
              <textarea
                name="recomendaciones"
                value={formulario.recomendaciones}
                onChange={actualizarCampo}
                rows={3}
                required
                placeholder="Cuidados en casa, recomendaciones y signos de alarma..."
                className={`${campoClases} textarea-style`}
              />
            </Campo>

            <div className="rounded-[16px] border border-[#E2E8F0] bg-[#FBFCFF] p-4 dark:border-[#334155] dark:bg-[#0F172A]">
              <div className="mb-4 flex items-center gap-2">
                <ConsultaIcon name="history" className="h-[18px] w-[18px] text-[#2563EB]" />
                <h3 className="text-[14px] font-semibold text-[#10213A] dark:text-white">
                  Seguimiento posterior
                </h3>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <Campo label="¿Requiere seguimiento?">
                  <select
                    name="seguimiento"
                    value={formulario.seguimiento}
                    onChange={actualizarCampo}
                    className={campoClases}
                  >
                    <option value="No">No</option>
                    <option value="Sí">Sí</option>
                  </select>
                </Campo>

                <Campo label="Fecha próxima de control">
                  <input
                    type="date"
                    name="fechaControl"
                    value={formulario.fechaControl}
                    onChange={actualizarCampo}
                    disabled={formulario.seguimiento === "No"}
                    required={formulario.seguimiento === "Sí"}
                    className={`${campoClases} ${formulario.seguimiento === "No" ? "cursor-not-allowed opacity-55" : ""}`}
                  />
                </Campo>
              </div>
            </div>

            <div className="flex flex-col-reverse gap-3 border-t border-[#E2E8F0] pt-6 dark:border-[#334155] sm:flex-row sm:justify-end">
              <Link
                href="/veterinario/citas"
                className="consulta-button-secondary flex h-[47px] items-center justify-center rounded-xl border border-[#CBD5E1] bg-white px-6 text-[14px] font-semibold text-[#475569] dark:border-[#334155] dark:bg-[#111827] dark:text-[#CBD5E1]"
              >
                Cancelar
              </Link>

              <button
                type="submit"
                disabled={guardando || !citaSeleccionada}
                className="consulta-button-primary flex h-[47px] items-center justify-center gap-2 rounded-xl bg-[#2F6BFF] px-7 text-[14px] font-semibold text-white disabled:opacity-60"
              >
                <ConsultaIcon name="save" className="h-[17px] w-[17px]" />
                {guardando ? "Guardando..." : "Guardar consulta"}
              </button>
            </div>
          </div>
        </section>
      </form>

      <style jsx global>{`
        @keyframes consulta-fade-up {
          from { opacity: 0; transform: translateY(14px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes consulta-orb {
          0%, 100% { transform: translate(0, 0); }
          50% { transform: translate(-12px, 10px); }
        }
        .consulta-enter { animation: consulta-fade-up 0.45s ease-out both; }
        .consulta-orb { animation: consulta-orb 7s ease-in-out infinite; }
        .consulta-alert-enter { animation: consulta-fade-up 0.3s ease-out both; }
        .consulta-card { animation: consulta-fade-up 0.45s ease-out 0.12s both; transition: border-color 0.25s ease, box-shadow 0.25s ease; }
        .consulta-card-delay { animation-delay: 0.2s; }
        .consulta-card:hover { border-color: #bfdbfe; box-shadow: 0 16px 32px rgba(15, 23, 42, 0.07); }
        .consulta-patient-summary { animation: consulta-fade-up 0.25s ease-out both; }
        .input-style { width: 100%; height: 48px; border: 1px solid #cbd5e1; border-radius: 12px; background: #ffffff; padding: 0 14px; font-size: 14px; color: #10213a; outline: none; transition: border-color 0.2s ease, box-shadow 0.2s ease, background 0.2s ease; }
        .input-style:focus { border-color: #2563eb; box-shadow: 0 0 0 4px rgba(37, 99, 235, 0.1); }
        .input-style::placeholder { color: #94a3b8; }
        .textarea-style { height: auto; min-height: 94px; padding: 12px 14px; resize: none; }
        .campo-bloqueado { cursor: not-allowed; background: #f8fafc; color: #64748b; }
        .consulta-button-primary { transition: transform 0.2s ease, background 0.2s ease, box-shadow 0.2s ease; }
        .consulta-button-primary:hover:not(:disabled) { transform: translateY(-2px); background: #2459df; box-shadow: 0 10px 18px rgba(47, 107, 255, 0.22); }
        .consulta-button-secondary { transition: transform 0.2s ease, border-color 0.2s ease, background 0.2s ease; }
        .consulta-button-secondary:hover { transform: translateY(-2px); border-color: #bfdbfe; background: #f8fbff; }
        .dark .input-style { border-color: #334155; background: #0f172a; color: #ffffff; }
        .dark .campo-bloqueado { background: #0f172a; color: #94a3b8; }
        .dark .consulta-button-secondary:hover { background: #1e293b; }
        @media (prefers-reduced-motion: reduce) {
          .consulta-enter, .consulta-orb, .consulta-alert-enter, .consulta-card, .consulta-patient-summary { animation: none !important; }
          .consulta-button-primary:hover, .consulta-button-secondary:hover { transform: none !important; }
        }
      `}</style>
    </div>
  );
}

function Campo({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="block">
      <span className="mb-2 block text-[13px] font-semibold text-[#334155] dark:text-[#CBD5E1]">
        {label}
      </span>
      {children}
    </label>
  );
}

type IconName = "patient" | "clipboard" | "lock" | "history" | "save";

function ConsultaIcon({ name, className = "h-5 w-5" }: { name: IconName; className?: string }) {
  const svgProps = { className, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: 1.8, strokeLinecap: "round" as const, strokeLinejoin: "round" as const };
  switch (name) {
    case "patient": return <svg {...svgProps}><ellipse cx="8" cy="7" rx="2" ry="2.6" /><ellipse cx="16" cy="7" rx="2" ry="2.6" /><ellipse cx="6.5" cy="13" rx="2" ry="2.6" /><ellipse cx="17.5" cy="13" rx="2" ry="2.6" /><path d="M12 18.6c2.2 0 3.8-1.3 3.8-3 0-1.8-1.6-2.9-3.3-2.9-.8 0-1.5.2-2.1.7-.5.3-1 .4-1.5.4-1.5 0-2.7 1-2.7 2.4 0 1.4 1.2 2.4 2.8 2.4H12Z" /></svg>;
    case "clipboard": return <svg {...svgProps}><path d="M9 4h6" /><path d="M9 3.5h6A1.5 1.5 0 0 1 16.5 5v1h-9V5A1.5 1.5 0 0 1 9 3.5Z" /><rect x="5" y="6" width="14" height="15" rx="2" /><path d="M9 11h6M9 15h6M9 18h4" /></svg>;
    case "lock": return <svg {...svgProps}><rect x="5" y="10" width="14" height="10" rx="2" /><path d="M8 10V7a4 4 0 0 1 8 0v3" /></svg>;
    case "history": return <svg {...svgProps}><path d="M12 7v5l3.5 2" /><path d="M20.5 12a8.5 8.5 0 1 1-2.7-6.2" /><path d="M20.5 4.5v5h-5" /></svg>;
    case "save": return <svg {...svgProps}><path d="M5 4h11l3 3v13H5Z" /><path d="M8 4v6h8V4" /><path d="M8 20v-6h8v6" /></svg>;
  }
}

const campoClases = "input-style";
