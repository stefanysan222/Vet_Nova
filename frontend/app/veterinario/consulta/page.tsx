"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { ChangeEvent, FormEvent, ReactNode, Suspense, useEffect, useMemo, useState } from "react";
import {
  AlertCircle,
  CheckCircle2,
  X,
  PawPrint,
  ClipboardList,
  Lock,
  History,
  Save,
} from "lucide-react";
import { fetchCitas, updateCita } from "../../../lib/api/citas";
import type { Appointment } from "../../../lib/recepcionista/types";
import { useAuth } from "@/lib/auth-context";

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
  return (
    <Suspense
      fallback={
        <div className="flex h-full items-center justify-center">
          <p className="text-sm text-slate-500">Cargando consulta...</p>
        </div>
      }
    >
      <RegistrarConsultaContent />
    </Suspense>
  );
}

function RegistrarConsultaContent() {
  const searchParams = useSearchParams();
  const [citasHabilitadas, setCitasHabilitadas] = useState<CitaHabilitada[]>([]);
  const [todasLasCitas, setTodasLasCitas] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [guardado, setGuardado] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formulario, setFormulario] = useState<FormularioConsulta>(formularioInicial());

  const { user } = useAuth();

  useEffect(() => {
    fetchCitas()
      .then((appts) => {
        setTodasLasCitas(appts);
        const confirmadas = appts
          .filter((a) => a.status === "Confirmada" || a.status === "En atención")
          .map(mapAppointmentToCitaHabilitada);
        setCitasHabilitadas(confirmadas);

        const citaUrl = searchParams.get("cita");
        const pacienteUrl = searchParams.get("paciente");

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
  }, [searchParams]);

  const citaSeleccionada = useMemo(
    () => citasHabilitadas.find((cita) => cita.id === formulario.citaId) ?? null,
    [formulario.citaId, citasHabilitadas],
  );

  function seleccionarCita(event: ChangeEvent<HTMLSelectElement>) {
    const citaId = event.target.value;
    setFormulario({ ...formularioInicial(), citaId });
    setGuardado(false);
    setError(null);
  }

  function actualizarCampo(
    event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>,
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
        <p className="text-sm text-surface-500 dark:text-surface-400">
          Cargando citas confirmadas...
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* ENCABEZADO */}
      <header className="overflow-hidden rounded-3xl border border-brand-200 bg-gradient-to-br from-brand-600 to-brand-700 p-7 text-white shadow-brand">
        <div className="flex flex-col justify-between gap-5 lg:flex-row lg:items-center">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-brand-200">
              Atención clínica
            </p>

            <h1 className="text-display mt-2">Registrar consulta y tratamiento</h1>

            <p className="mt-3 max-w-3xl text-sm leading-6 text-brand-100">
              Documenta la valoración médica de un paciente asignado y actualiza su historial
              clínico con diagnóstico, tratamiento y seguimiento.
            </p>
          </div>

          <Link
            href="/veterinario/citas"
            className="flex h-11 shrink-0 items-center justify-center rounded-xl bg-white px-6 text-sm font-semibold text-brand-700 shadow-sm transition hover:bg-brand-50"
          >
            Volver a agenda diaria
          </Link>
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
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl text-danger-500 transition hover:bg-danger-100 dark:hover:bg-danger-900/40"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
      )}

      {/* MENSAJE DE GUARDADO */}
      {guardado && (
        <div className="dark:bg-success-950/30 flex items-start justify-between gap-4 rounded-2xl border border-success-200 bg-success-50 px-5 py-4 dark:border-success-800">
          <div className="flex items-start gap-3">
            <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-success-500" />
            <div>
              <p className="text-sm font-semibold text-success-700 dark:text-success-400">
                Consulta registrada correctamente
              </p>
              <p className="mt-1 text-sm leading-6 text-success-600 dark:text-success-400">
                La atención clínica fue registrada y el historial del paciente ha sido actualizado.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setGuardado(false)}
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl text-success-500 transition hover:bg-success-100 dark:hover:bg-success-900/40"
            aria-label="Cerrar mensaje"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
      )}

      {citasHabilitadas.length === 0 && !loading && (
        <div className="rounded-2xl border border-brand-200 bg-brand-50 px-5 py-4 dark:border-brand-800 dark:bg-brand-950/30">
          <p className="text-sm text-brand-700 dark:text-brand-300">
            No hay citas confirmadas disponibles para atención en este momento.
          </p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="grid gap-5 xl:grid-cols-[0.92fr_1.18fr]">
        {/* DATOS DE LA ATENCIÓN */}
        <section className="rounded-2xl border border-surface-200 bg-white p-6 shadow-card dark:border-surface-700 dark:bg-surface-900">
          <div className="mb-6">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-100 text-brand-600 dark:bg-brand-900/40 dark:text-brand-300">
                <PawPrint className="h-5 w-5" />
              </div>

              <div>
                <h2 className="text-section-title">Datos de la atención</h2>
                <p className="text-subtitle mt-1">Selecciona una cita habilitada.</p>
              </div>
            </div>
          </div>

          <div className="mb-6 flex items-start gap-3 rounded-2xl border border-brand-200 bg-brand-50 px-4 py-3 dark:border-brand-800 dark:bg-brand-950/30">
            <Lock className="mt-0.5 h-[17px] w-[17px] shrink-0 text-brand-600 dark:text-brand-300" />
            <p className="text-sm leading-6 text-brand-700 dark:text-brand-300">
              Solo se muestran citas confirmadas para atención. Los datos generales no pueden
              editarse desde este módulo.
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
              <div className="rounded-2xl border border-brand-200 bg-brand-50 p-4 dark:border-brand-800 dark:bg-brand-950/30">
                <div className="flex items-center gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-brand-100 text-lg font-bold text-brand-600 dark:bg-brand-900/40 dark:text-brand-300">
                    {citaSeleccionada.paciente.charAt(0)}
                  </div>
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="text-sm font-semibold text-surface-900 dark:text-white">
                        {citaSeleccionada.paciente}
                      </p>
                      <span className="inline-flex items-center gap-1 rounded-lg bg-success-100 px-2.5 py-1 text-xs font-semibold text-success-700 dark:bg-success-900/40 dark:text-success-300">
                        Confirmada
                      </span>
                    </div>
                    <p className="mt-1 text-xs text-surface-500 dark:text-surface-400">
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
                className={`${campoClases} cursor-not-allowed bg-surface-50 text-surface-500 dark:bg-surface-950`}
              />
            </Campo>

            <Campo label="Motivo agendado">
              <input
                type="text"
                value={citaSeleccionada?.servicio ?? ""}
                readOnly
                placeholder="Se carga automáticamente al seleccionar la cita"
                className={`${campoClases} cursor-not-allowed bg-surface-50 text-surface-500 dark:bg-surface-950`}
              />
            </Campo>

            <div className="grid gap-4 sm:grid-cols-2">
              <Campo label="Fecha de atención">
                <input
                  type="text"
                  value={citaSeleccionada?.fecha ?? ""}
                  readOnly
                  placeholder="Fecha"
                  className={`${campoClases} cursor-not-allowed bg-surface-50 text-surface-500 dark:bg-surface-950`}
                />
              </Campo>

              <Campo label="Hora de atención">
                <input
                  type="text"
                  value={citaSeleccionada?.hora ?? ""}
                  readOnly
                  placeholder="Hora"
                  className={`${campoClases} cursor-not-allowed bg-surface-50 text-surface-500 dark:bg-surface-950`}
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
                className={`${campoClases} min-h-[94px] resize-none py-3`}
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
        <section className="rounded-2xl border border-surface-200 bg-white p-6 shadow-card dark:border-surface-700 dark:bg-surface-900">
          <div className="mb-6 flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-100 text-brand-600 dark:bg-brand-900/40 dark:text-brand-300">
              <ClipboardList className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-section-title">Registro clínico</h2>
              <p className="text-subtitle mt-1">
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
                className={`${campoClases} min-h-[94px] resize-none py-3`}
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
                className={`${campoClases} min-h-[94px] resize-none py-3`}
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
                className={`${campoClases} min-h-[94px] resize-none py-3`}
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
                className={`${campoClases} min-h-[94px] resize-none py-3`}
              />
            </Campo>

            <div className="rounded-2xl border border-surface-200 bg-surface-50 p-4 dark:border-surface-700 dark:bg-surface-950">
              <div className="mb-4 flex items-center gap-2">
                <History className="h-[18px] w-[18px] text-brand-600 dark:text-brand-400" />
                <h3 className="text-sm font-semibold text-surface-900 dark:text-white">
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

            <div className="flex flex-col-reverse gap-3 border-t border-surface-100 pt-6 dark:border-surface-800 sm:flex-row sm:justify-end">
              <Link
                href="/veterinario/citas"
                className="flex h-11 items-center justify-center rounded-xl border border-surface-300 bg-white px-6 text-sm font-semibold text-surface-600 transition hover:bg-surface-50 dark:border-surface-700 dark:bg-surface-900 dark:text-surface-300 dark:hover:bg-surface-800"
              >
                Cancelar
              </Link>

              <button
                type="submit"
                disabled={guardando || !citaSeleccionada}
                className="flex h-11 items-center justify-center gap-2 rounded-xl bg-brand-600 px-7 text-sm font-semibold text-white transition hover:bg-brand-700 disabled:opacity-60"
              >
                <Save className="h-[17px] w-[17px]" />
                {guardando ? "Guardando..." : "Guardar consulta"}
              </button>
            </div>
          </div>
        </section>
      </form>
    </div>
  );
}

function Campo({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="block">
      <span className="form-label">{label}</span>
      {children}
    </label>
  );
}

const campoClases = "form-input";
