"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { FormEvent, ReactNode, Suspense, useEffect, useState } from "react";
import { AlertCircle, CheckCircle2, X, Plus } from "lucide-react";
import { fetchMascotas } from "../../../lib/api/mascotas";
import { fetchCitas, createCita } from "../../../lib/api/citas";
import type { PetRecord, Appointment } from "../../../lib/recepcionista/types";
import { useAuth } from "@/lib/auth-context";

type EstadoClinico =
  | "Por atender"
  | "Atendido hoy"
  | "En seguimiento"
  | "Tratamiento activo"
  | "Control programado";

type TipoRegistro = "Consulta" | "Procedimiento" | "Vacunación" | "Control" | "Evolución clínica";

interface RegistroClinico {
  id: string;
  tipo: TipoRegistro;
  fecha: string;
  profesional: string;
  motivo: string;
  diagnostico: string;
  tratamiento: string;
  recomendaciones: string;
}

interface PacienteClinico {
  id: string;
  nombre: string;
  especie: string;
  raza: string;
  edad: string;
  peso: string;
  propietario: string;
  propietarioId: string;
  alergias: string;
  antecedentes: string;
  estado: EstadoClinico;
  tratamientoActual?: string;
  registros: RegistroClinico[];
}

interface FormularioEvolucion {
  evolucion: string;
  cambioTratamiento: string;
  recomendaciones: string;
  proximoControl: string;
  nuevoEstado: EstadoClinico;
}

function formularioInicial(): FormularioEvolucion {
  return {
    evolucion: "",
    cambioTratamiento: "",
    recomendaciones: "",
    proximoControl: "",
    nuevoEstado: "En seguimiento",
  };
}

function fechaHoy(): string {
  return new Date().toISOString().slice(0, 10);
}

function formatearFecha(isoDate: string): string {
  if (!isoDate) return "—";
  const d = new Date(`${isoDate}T00:00:00`);
  return d.toLocaleDateString("es-CO", { day: "2-digit", month: "short", year: "numeric" });
}

function mapServicioToTipo(servicio: string): TipoRegistro {
  const s = (servicio ?? "").toLowerCase();
  if (s.includes("vacun")) return "Vacunación";
  if (s.includes("cirugía") || s.includes("proced")) return "Procedimiento";
  if (s.includes("control") || s.includes("post")) return "Control";
  if (s.includes("evolución") || s.includes("evolucion") || s.includes("seguimiento"))
    return "Evolución clínica";
  return "Consulta";
}

function parseNotas(raw: string | undefined): {
  diagnostico?: string;
  tratamiento?: string;
  recomendaciones?: string;
  tipo?: string;
} {
  if (!raw) return {};
  try {
    return JSON.parse(raw);
  } catch {
    return { diagnostico: raw };
  }
}

function derivarEstado(citas: Appointment[], mascotaId: string): EstadoClinico {
  const propias = citas.filter((c) => c.petId === mascotaId);
  if (propias.length === 0) return "Control programado";
  const hoy = fechaHoy();
  if (propias.find((c) => c.date === hoy && c.status === "Confirmada")) return "Por atender";
  if (propias.find((c) => c.date === hoy && c.status === "Finalizada")) return "Atendido hoy";
  if (propias.find((c) => c.status === "En atención" || c.status === "En espera"))
    return "Tratamiento activo";
  if (propias.find((c) => c.status === "Confirmada" || c.status === "Pendiente"))
    return "En seguimiento";
  return "Control programado";
}

function buildPacienteClinico(pet: PetRecord, citas: Appointment[]): PacienteClinico {
  const propias = citas
    .filter((c) => c.petId === pet.id)
    .sort((a, b) => b.date.localeCompare(a.date));

  const registros: RegistroClinico[] = propias
    .filter((c) => c.status === "Finalizada")
    .map((c) => {
      const notas = parseNotas(c.notes);
      return {
        id: c.id,
        tipo: notas.tipo ? (notas.tipo as TipoRegistro) : mapServicioToTipo(c.service),
        fecha: formatearFecha(c.date),
        profesional: c.veterinarian ?? "Veterinario",
        motivo: c.service,
        diagnostico: notas.diagnostico ?? c.notes ?? "—",
        tratamiento: notas.tratamiento ?? "—",
        recomendaciones: notas.recomendaciones ?? "—",
      };
    });

  const ultimaTratamiento = propias.find((c) => {
    const notas = parseNotas(c.notes);
    return notas.tratamiento && notas.tratamiento !== "—";
  });
  const notasUltima = parseNotas(ultimaTratamiento?.notes);

  return {
    id: pet.id,
    nombre: pet.nombre,
    especie: pet.especie,
    raza: pet.raza,
    edad: pet.edad,
    peso: pet.peso,
    propietario: pet.propietarioNombre,
    propietarioId: pet.propietarioId,
    alergias: "No registradas",
    antecedentes: "Sin antecedentes registrados.",
    estado: derivarEstado(citas, pet.id),
    tratamientoActual: notasUltima.tratamiento ?? undefined,
    registros,
  };
}

export default function HistorialPage() {
  return (
    <Suspense
      fallback={
        <div className="flex h-full items-center justify-center">
          <p className="text-sm text-slate-500">Cargando historial...</p>
        </div>
      }
    >
      <HistorialContent />
    </Suspense>
  );
}

function HistorialContent() {
  const searchParams = useSearchParams();
  const [pacientes, setPacientes] = useState<PacienteClinico[]>([]);
  const [, setTodasLasCitas] = useState<Appointment[]>([]);
  const [pacienteSeleccionado, setPacienteSeleccionado] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [registroGuardado, setRegistroGuardado] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formulario, setFormulario] = useState<FormularioEvolucion>(formularioInicial());

  const { user } = useAuth();

  useEffect(() => {
    Promise.all([fetchMascotas(), fetchCitas()])
      .then(([pets, citas]) => {
        setTodasLasCitas(citas);
        const built = pets.map((p) => buildPacienteClinico(p, citas));
        setPacientes(built);

        const pacienteUrl = searchParams.get("paciente");
        const accion = searchParams.get("accion");

        const inicial = built.find((p) => p.id === pacienteUrl) ?? built[0];
        if (inicial) setPacienteSeleccionado(inicial.id);
        if (accion === "evolucion") setMostrarFormulario(true);
      })
      .catch(() =>
        setError("No se pudo cargar los expedientes. Verifica la conexión con el servidor."),
      )
      .finally(() => setLoading(false));
  }, [searchParams]);

  const paciente = pacientes.find((p) => p.id === pacienteSeleccionado) ?? null;

  function seleccionarPaciente(id: string) {
    setPacienteSeleccionado(id);
    setRegistroGuardado(false);
  }

  function abrirFormulario() {
    setFormulario({ ...formularioInicial(), nuevoEstado: paciente?.estado ?? "En seguimiento" });
    setRegistroGuardado(false);
    setMostrarFormulario(true);
  }

  function cerrarFormulario() {
    setMostrarFormulario(false);
    setFormulario(formularioInicial());
  }

  async function handleGuardarEvolucion(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!paciente) return;

    setGuardando(true);
    setError(null);
    try {
      const notasClinicas = JSON.stringify({
        tipo: "Evolución clínica",
        diagnostico: formulario.evolucion,
        tratamiento: formulario.cambioTratamiento || "Sin cambios en el tratamiento actual.",
        recomendaciones: formulario.proximoControl
          ? `${formulario.recomendaciones} Próximo control: ${formulario.proximoControl}.`
          : formulario.recomendaciones,
      });

      const nuevaCita = await createCita({
        date: fechaHoy(),
        time: new Date().toLocaleTimeString("es-CO", {
          hour: "2-digit",
          minute: "2-digit",
          hour12: false,
        }),
        petId: paciente.id,
        ownerId: paciente.propietarioId,
        petName: paciente.nombre,
        ownerName: paciente.propietario,
        petEspecie: paciente.especie,
        petRaza: paciente.raza,
        service: "Evolución clínica",
        status: "Finalizada",
        notes: notasClinicas,
        veterinarian: user?.name ?? undefined,
      });

      const nuevoRegistro: RegistroClinico = {
        id: nuevaCita.id,
        tipo: "Evolución clínica",
        fecha: formatearFecha(nuevaCita.date),
        profesional: nuevaCita.veterinarian ?? user?.name ?? "Veterinario",
        motivo: "Seguimiento clínico",
        diagnostico: formulario.evolucion,
        tratamiento: formulario.cambioTratamiento || "Sin cambios en el tratamiento actual.",
        recomendaciones: formulario.proximoControl
          ? `${formulario.recomendaciones} Próximo control: ${formulario.proximoControl}.`
          : formulario.recomendaciones,
      };

      setPacientes((prev) =>
        prev.map((p) =>
          p.id === pacienteSeleccionado
            ? {
                ...p,
                estado: formulario.nuevoEstado,
                tratamientoActual: formulario.cambioTratamiento || p.tratamientoActual,
                registros: [nuevoRegistro, ...p.registros],
              }
            : p,
        ),
      );

      setMostrarFormulario(false);
      setRegistroGuardado(true);
      setFormulario(formularioInicial());
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al guardar la evolución.");
    } finally {
      setGuardando(false);
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <p className="text-sm text-surface-500 dark:text-surface-400">
          Cargando expedientes clínicos...
        </p>
      </div>
    );
  }

  if (!paciente && pacientes.length === 0) {
    return (
      <div className="flex min-h-[400px] flex-col items-center justify-center gap-4 rounded-3xl border border-surface-200 bg-white dark:border-surface-700 dark:bg-surface-900">
        <p className="text-base font-semibold text-surface-900 dark:text-white">
          No hay pacientes registrados
        </p>
        <p className="text-sm text-surface-500 dark:text-surface-400">
          Registra mascotas primero para ver sus expedientes.
        </p>
        <Link
          href="/veterinario/mascotas"
          className="rounded-xl bg-brand-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-brand-700"
        >
          Ver pacientes
        </Link>
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
              Historial clínico
            </p>
            <h1 className="text-display mt-2">Expediente clínico del paciente</h1>
            <p className="mt-3 max-w-3xl text-sm leading-6 text-brand-100">
              Consulta antecedentes, tratamientos y evoluciones médicas registradas.
            </p>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row">
            <Link
              href="/veterinario/mascotas"
              className="flex h-11 items-center justify-center rounded-xl border border-white/30 px-5 text-sm font-semibold text-white transition hover:bg-white/10"
            >
              Volver a pacientes
            </Link>

            {paciente && (
              <button
                type="button"
                onClick={abrirFormulario}
                className="flex h-11 items-center justify-center gap-2 rounded-xl bg-white px-5 text-sm font-semibold text-brand-700 shadow-sm transition hover:bg-brand-50"
              >
                <Plus className="h-4 w-4" />
                Agregar evolución clínica
              </button>
            )}
          </div>
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

      {registroGuardado && paciente && (
        <div className="dark:bg-success-950/30 flex items-start justify-between gap-4 rounded-2xl border border-success-200 bg-success-50 px-5 py-4 dark:border-success-800">
          <div className="flex items-start gap-3">
            <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-success-500" />
            <div>
              <p className="text-sm font-semibold text-success-700 dark:text-success-400">
                Evolución clínica registrada
              </p>
              <p className="mt-1 text-sm text-success-600 dark:text-success-400">
                El nuevo registro fue agregado al historial de {paciente.nombre} sin modificar las
                atenciones anteriores.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setRegistroGuardado(false)}
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl text-success-500 transition hover:bg-success-100 dark:hover:bg-success-900/40"
            aria-label="Cerrar mensaje"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
      )}

      <div className="grid gap-5 xl:grid-cols-[300px_1fr]">
        {/* LISTA DE PACIENTES */}
        <aside className="rounded-2xl border border-surface-200 bg-white p-5 shadow-card dark:border-surface-700 dark:bg-surface-900">
          <h2 className="text-section-title">Seleccionar paciente</h2>
          <p className="text-subtitle mt-1">Expedientes disponibles.</p>

          <div className="mt-5 space-y-3">
            {pacientes.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => seleccionarPaciente(item.id)}
                className={`w-full rounded-2xl border px-4 py-4 text-left transition ${
                  item.id === pacienteSeleccionado
                    ? "border-brand-400 bg-brand-50 dark:border-brand-600 dark:bg-brand-950/30"
                    : "border-surface-200 bg-surface-50 hover:border-brand-200 dark:border-surface-700 dark:bg-surface-950"
                }`}
              >
                <p className="text-sm font-semibold text-surface-900 dark:text-white">
                  {item.nombre}
                </p>
                <p className="mt-1 text-xs text-surface-500 dark:text-surface-400">
                  {item.especie} · {item.propietario}
                </p>
                <span
                  className={`mt-3 inline-flex items-center gap-1 rounded-lg px-2.5 py-1 text-xs font-semibold ${estiloEstado(item.estado)}`}
                >
                  {item.estado}
                </span>
              </button>
            ))}
          </div>
        </aside>

        {/* EXPEDIENTE */}
        {paciente && (
          <main className="space-y-5">
            {/* DATOS DEL PACIENTE */}
            <section className="rounded-2xl border border-surface-200 bg-white p-6 shadow-card dark:border-surface-700 dark:bg-surface-900">
              <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
                <div>
                  <div className="flex flex-wrap items-center gap-3">
                    <h2 className="text-page-title">{paciente.nombre}</h2>
                    <span
                      className={`inline-flex items-center gap-1 rounded-lg px-2.5 py-1 text-xs font-semibold ${estiloEstado(paciente.estado)}`}
                    >
                      {paciente.estado}
                    </span>
                  </div>
                  <p className="text-subtitle mt-2">
                    {paciente.especie} · {paciente.raza} · Propietario: {paciente.propietario}
                  </p>
                </div>

                <Link
                  href={`/veterinario/consulta?paciente=${paciente.id}`}
                  className="flex h-11 items-center justify-center rounded-xl border border-brand-200 bg-white px-4 text-sm font-semibold text-brand-600 transition hover:bg-brand-50 dark:border-surface-700 dark:bg-surface-900 dark:text-brand-300 dark:hover:bg-brand-950/30"
                >
                  Registrar nueva consulta
                </Link>
              </div>

              <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <DatoClinico titulo="Edad" valor={paciente.edad || "No registrada"} />
                <DatoClinico titulo="Peso" valor={paciente.peso || "No registrado"} />
                <DatoClinico titulo="Alergias" valor={paciente.alergias} />
                <DatoClinico
                  titulo="Registros clínicos"
                  valor={`${paciente.registros.length} registros`}
                />
              </div>

              <div className="mt-5 rounded-2xl border border-surface-200 bg-surface-50 px-4 py-4 dark:border-surface-700 dark:bg-surface-950">
                <p className="text-sm font-semibold text-surface-900 dark:text-white">
                  Antecedentes relevantes
                </p>
                <p className="mt-2 text-sm leading-6 text-surface-500 dark:text-surface-400">
                  {paciente.antecedentes}
                </p>
              </div>
            </section>

            <div className="grid gap-5 lg:grid-cols-[1fr_310px]">
              {/* LÍNEA DE TIEMPO */}
              <section className="rounded-2xl border border-surface-200 bg-white p-6 shadow-card dark:border-surface-700 dark:bg-surface-900">
                <div className="mb-5">
                  <h2 className="text-section-title">Historial de atenciones</h2>
                  <p className="text-subtitle mt-1">
                    Registros ordenados del más reciente al más antiguo.
                  </p>
                </div>

                {paciente.registros.length === 0 ? (
                  <div className="rounded-2xl border border-dashed border-surface-300 bg-surface-50 px-5 py-10 text-center dark:border-surface-700 dark:bg-surface-950">
                    <p className="text-sm text-surface-500 dark:text-surface-400">
                      Este paciente no tiene atenciones registradas aún.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {paciente.registros.map((registro) => (
                      <article
                        key={registro.id}
                        className="rounded-2xl border border-surface-200 bg-surface-50 p-5 dark:border-surface-700 dark:bg-surface-950"
                      >
                        <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-start">
                          <div>
                            <span
                              className={`inline-flex items-center gap-1 rounded-lg px-2.5 py-1 text-xs font-semibold ${estiloTipoRegistro(registro.tipo)}`}
                            >
                              {registro.tipo}
                            </span>
                            <h3 className="mt-3 text-sm font-semibold text-surface-900 dark:text-white">
                              {registro.motivo}
                            </h3>
                            <p className="mt-1 text-xs text-surface-500 dark:text-surface-400">
                              {registro.profesional} · {registro.fecha}
                            </p>
                          </div>
                          <span className="inline-flex items-center gap-1 rounded-lg bg-surface-200 px-2.5 py-1 text-xs font-semibold text-surface-600 dark:bg-surface-800 dark:text-surface-300">
                            Solo lectura
                          </span>
                        </div>

                        <div className="mt-4 space-y-3 text-sm leading-6">
                          <DetalleRegistro
                            titulo="Diagnóstico / evolución"
                            valor={registro.diagnostico}
                          />
                          <DetalleRegistro titulo="Tratamiento" valor={registro.tratamiento} />
                          <DetalleRegistro
                            titulo="Recomendaciones"
                            valor={registro.recomendaciones}
                          />
                        </div>
                      </article>
                    ))}
                  </div>
                )}
              </section>

              {/* COLUMNA DERECHA */}
              <div className="space-y-5">
                <section className="rounded-2xl border border-surface-200 bg-white p-5 shadow-card dark:border-surface-700 dark:bg-surface-900">
                  <h3 className="text-sm font-semibold text-surface-900 dark:text-white">
                    Documento adjunto
                  </h3>
                  <p className="text-subtitle mt-1">Historia clínica cargada previamente.</p>
                  <div className="mt-4 rounded-2xl border border-dashed border-surface-300 px-4 py-6 text-center dark:border-surface-700">
                    <p className="text-sm text-surface-500 dark:text-surface-400">
                      Los documentos adjuntos se gestionan desde el módulo de administración.
                    </p>
                  </div>
                </section>

                <section className="rounded-2xl border border-surface-200 bg-white p-5 shadow-card dark:border-surface-700 dark:bg-surface-900">
                  <h3 className="text-sm font-semibold text-surface-900 dark:text-white">
                    Tratamiento actual
                  </h3>

                  {paciente.tratamientoActual ? (
                    <>
                      <p className="mt-3 text-sm leading-6 text-surface-500 dark:text-surface-400">
                        {paciente.tratamientoActual}
                      </p>
                      <button
                        type="button"
                        onClick={abrirFormulario}
                        className="mt-4 flex h-11 w-full items-center justify-center rounded-xl bg-brand-600 text-sm font-semibold text-white transition hover:bg-brand-700"
                      >
                        Registrar cambio
                      </button>
                    </>
                  ) : (
                    <p className="mt-3 text-sm text-surface-500 dark:text-surface-400">
                      No hay tratamiento activo registrado.
                    </p>
                  )}
                </section>
              </div>
            </div>
          </main>
        )}
      </div>

      {/* MODAL AGREGAR EVOLUCIÓN */}
      {mostrarFormulario && paciente && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-surface-900/50 px-4 py-6 backdrop-blur-sm">
          <section className="max-h-[95vh] w-full max-w-[760px] overflow-y-auto rounded-3xl border border-surface-200/60 bg-white shadow-modal dark:border-surface-700 dark:bg-surface-900">
            <div className="flex items-start justify-between border-b border-surface-100 px-6 py-5 dark:border-surface-800">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-brand-600 dark:text-brand-300">
                  Seguimiento clínico
                </p>
                <h2 className="text-page-title mt-2">Agregar evolución de {paciente.nombre}</h2>
                <p className="text-subtitle mt-2">
                  Este registro será añadido al historial sin modificar la información anterior.
                </p>
              </div>

              <button
                type="button"
                onClick={cerrarFormulario}
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-surface-500 transition hover:bg-surface-100 dark:hover:bg-surface-800"
                aria-label="Cerrar formulario"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleGuardarEvolucion} className="space-y-5 p-6">
              <Campo label="Evolución del paciente">
                <textarea
                  required
                  rows={4}
                  value={formulario.evolucion}
                  onChange={(event) =>
                    setFormulario((actual) => ({ ...actual, evolucion: event.target.value }))
                  }
                  placeholder="Describe la respuesta clínica, síntomas actuales y hallazgos..."
                  className={`${campoClases} min-h-[110px] resize-none py-3`}
                />
              </Campo>

              <Campo label="Cambio o continuidad del tratamiento">
                <textarea
                  rows={3}
                  value={formulario.cambioTratamiento}
                  onChange={(event) =>
                    setFormulario((actual) => ({
                      ...actual,
                      cambioTratamiento: event.target.value,
                    }))
                  }
                  placeholder="Ej. Continuar antibiótico por 3 días adicionales..."
                  className={`${campoClases} min-h-[90px] resize-none py-3`}
                />
              </Campo>

              <Campo label="Recomendaciones">
                <textarea
                  required
                  rows={3}
                  value={formulario.recomendaciones}
                  onChange={(event) =>
                    setFormulario((actual) => ({ ...actual, recomendaciones: event.target.value }))
                  }
                  placeholder="Cuidados, signos de alarma y recomendaciones para el propietario..."
                  className={`${campoClases} min-h-[90px] resize-none py-3`}
                />
              </Campo>

              <div className="grid gap-5 md:grid-cols-2">
                <Campo label="Próximo control">
                  <input
                    type="date"
                    value={formulario.proximoControl}
                    onChange={(event) =>
                      setFormulario((actual) => ({ ...actual, proximoControl: event.target.value }))
                    }
                    className={campoClases}
                  />
                </Campo>

                <Campo label="Estado clínico actualizado">
                  <select
                    value={formulario.nuevoEstado}
                    onChange={(event) =>
                      setFormulario((actual) => ({
                        ...actual,
                        nuevoEstado: event.target.value as EstadoClinico,
                      }))
                    }
                    className={campoClases}
                  >
                    <option value="Atendido hoy">Atendido hoy</option>
                    <option value="En seguimiento">En seguimiento</option>
                    <option value="Tratamiento activo">Tratamiento activo</option>
                    <option value="Control programado">Control programado</option>
                  </select>
                </Campo>
              </div>

              <div className="rounded-2xl border border-brand-200 bg-brand-50 px-4 py-3 text-sm leading-6 text-brand-700 dark:border-brand-800 dark:bg-brand-950/30 dark:text-brand-300">
                Las evoluciones se agregan como nuevos registros cronológicos. Las consultas
                anteriores permanecen en modo de solo lectura.
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
                  disabled={guardando}
                  className="flex h-11 items-center justify-center rounded-xl bg-brand-600 px-7 text-sm font-semibold text-white transition hover:bg-brand-700 disabled:opacity-60"
                >
                  {guardando ? "Guardando..." : "Guardar evolución"}
                </button>
              </div>
            </form>
          </section>
        </div>
      )}
    </div>
  );
}

function DatoClinico({ titulo, valor }: { titulo: string; valor: string }) {
  return (
    <div className="rounded-xl bg-surface-50 px-4 py-3 dark:bg-surface-950">
      <p className="text-caption">{titulo}</p>
      <p className="mt-2 text-sm font-medium text-surface-900 dark:text-white">{valor}</p>
    </div>
  );
}

function DetalleRegistro({ titulo, valor }: { titulo: string; valor: string }) {
  return (
    <p className="text-surface-600 dark:text-surface-300">
      <span className="font-semibold">{titulo}:</span> {valor}
    </p>
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

function estiloEstado(estado: EstadoClinico) {
  switch (estado) {
    case "Por atender":
      return "bg-warning-100 text-warning-700 dark:bg-warning-900/40 dark:text-warning-300";
    case "Atendido hoy":
      return "bg-success-100 text-success-700 dark:bg-success-900/40 dark:text-success-300";
    case "En seguimiento":
      return "bg-brand-100 text-brand-600 dark:bg-brand-900/40 dark:text-brand-300";
    case "Tratamiento activo":
      return "bg-danger-100 text-danger-700 dark:bg-danger-900/40 dark:text-danger-300";
    case "Control programado":
      return "bg-brand-100 text-brand-700 dark:bg-brand-900/40 dark:text-brand-300";
  }
}

function estiloTipoRegistro(tipo: TipoRegistro) {
  switch (tipo) {
    case "Evolución clínica":
      return "bg-success-100 text-success-700 dark:bg-success-900/40 dark:text-success-300";
    case "Procedimiento":
      return "bg-danger-100 text-danger-700 dark:bg-danger-900/40 dark:text-danger-300";
    case "Vacunación":
      return "bg-brand-100 text-brand-700 dark:bg-brand-900/40 dark:text-brand-300";
    case "Control":
      return "bg-brand-100 text-brand-600 dark:bg-brand-900/40 dark:text-brand-300";
    case "Consulta":
      return "bg-brand-50 text-brand-600 dark:bg-brand-950/30 dark:text-brand-300";
  }
}

const campoClases = "form-input";
