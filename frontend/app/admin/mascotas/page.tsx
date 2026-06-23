"use client";

import { useEffect, useState, useMemo, useCallback } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  Search,
  X,
  FileText,
  Info,
  PawPrint,
  Plus,
  Pencil,
  Trash2,
  Download,
  Syringe,
  Stethoscope,
  History,
  AlertTriangle,
} from "lucide-react";
import {
  fetchMascotas,
  createMascota,
  updateMascota,
  deleteMascota,
} from "../../../lib/api/mascotas";
import { fetchPropietarios } from "../../../lib/api/propietarios";
import { fetchCitas } from "../../../lib/api/citas";
import type { PetRecord, Owner, Appointment } from "../../../lib/recepcionista/types";
import { SkeletonCardList } from "../../components/ui/Skeleton";
import { useToast } from "../../components/ui/Toast";
import ConfirmDialog from "../../components/ui/ConfirmDialog";
import {
  fetchClinicalHistory,
  downloadClinicalHistoryPdf,
  fetchConsulta,
  updateConsulta,
  deleteConsulta,
  fetchConsultaAuditoria,
  type TimelineEventAPI,
  type AuditoriaConsultaAPI,
} from "../../../lib/api/historias-clinicas";

type Tab = "info" | "historial";

const inputClass = "form-input";

/**
 * Normaliza valores históricos como "Perro"/"Gato" a las categorías
 * "Canino"/"Felino"/"Otro" usadas por los filtros y contadores.
 */
function normalizeEspecie(especie: string): "Canino" | "Felino" | "Otro" {
  const value = especie.trim().toLowerCase();
  if (value === "canino" || value === "perro") return "Canino";
  if (value === "felino" || value === "gato") return "Felino";
  return "Otro";
}

function formatearFecha(fecha: string | null) {
  if (!fecha) return "Sin fecha";
  const d = new Date(fecha);
  if (isNaN(d.getTime())) return "Sin fecha";
  return new Intl.DateTimeFormat("es-CO", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(d);
}

function formatearFechaHora(fecha: string | null) {
  if (!fecha) return "Sin fecha";
  const d = new Date(fecha);
  if (isNaN(d.getTime())) return "Sin fecha";
  return new Intl.DateTimeFormat("es-CO", {
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(d);
}

function PetAvatar({ pet, size = "md" }: { pet: PetRecord; size?: "sm" | "md" | "lg" }) {
  const sizeMap = { sm: "h-9 w-9 text-sm", md: "h-12 w-12 text-base", lg: "h-20 w-20 text-2xl" };
  const colors: Record<string, string> = {
    Canino: "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300",
    Felino: "bg-violet-100 text-violet-700 dark:bg-violet-900/40 dark:text-violet-300",
    Otro: "bg-teal-100 text-teal-700 dark:bg-teal-900/40 dark:text-teal-300",
  };
  const color = colors[pet.especie] ?? colors["Otro"];
  return (
    <div
      className={`${sizeMap[size]} ${color} flex shrink-0 items-center justify-center rounded-2xl font-bold`}
    >
      {pet.foto ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={pet.foto} alt={pet.nombre} className="h-full w-full rounded-2xl object-cover" />
      ) : (
        (pet.nombre[0]?.toUpperCase() ?? "?")
      )}
    </div>
  );
}

function DetailModal({
  pet,
  citas,
  onClose,
  onEdit,
  onDelete,
}: {
  pet: PetRecord;
  citas: Appointment[];
  onClose: () => void;
  onEdit: () => void;
  onDelete: () => void;
}) {
  const { success, error: notifyError } = useToast();
  const [tab, setTab] = useState<Tab>("info");
  const historial = citas
    .filter((c) => c.petId === pet.id)
    .sort((a, b) => b.date.localeCompare(a.date));

  const idMascota = Number(pet.id);
  const [eventos, setEventos] = useState<TimelineEventAPI[] | null>(null);
  const [loadingHistorial, setLoadingHistorial] = useState(true);
  const [historialError, setHistorialError] = useState("");
  const [descargandoPdf, setDescargandoPdf] = useState(false);
  const [editEvento, setEditEvento] = useState<TimelineEventAPI | null>(null);
  const [deleteEvento, setDeleteEvento] = useState<TimelineEventAPI | null>(null);
  const [auditoriaEvento, setAuditoriaEvento] = useState<TimelineEventAPI | null>(null);

  const cargarHistorial = useCallback(() => {
    setLoadingHistorial(true);
    setHistorialError("");
    fetchClinicalHistory(idMascota)
      .then((data) => setEventos(data.eventos))
      .catch(() => setHistorialError("No se pudo cargar el historial clínico."))
      .finally(() => setLoadingHistorial(false));
  }, [idMascota]);

  useEffect(() => {
    if (tab !== "historial" || !Number.isFinite(idMascota)) return;
    // Carga del historial al abrir la pestaña — setLoading(true) antes del fetch
    // es el patrón estándar ya usado en esta página (ver cargar() más abajo).
    // eslint-disable-next-line react-hooks/set-state-in-effect
    cargarHistorial();
  }, [tab, idMascota, cargarHistorial]);

  const handleDescargarPdf = async () => {
    setDescargandoPdf(true);
    try {
      await downloadClinicalHistoryPdf(
        idMascota,
        `historial-clinico-${pet.nombre || idMascota}.pdf`,
      );
    } catch {
      notifyError("Error al descargar", "No se pudo descargar el PDF del historial clínico.");
    } finally {
      setDescargandoPdf(false);
    }
  };

  const handleSavedConsulta = (mensaje: string) => {
    success("Listo", mensaje);
    setEditEvento(null);
    setDeleteEvento(null);
    cargarHistorial();
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] flex items-center justify-center bg-surface-900/50 px-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.96, opacity: 0, y: 12 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.96, opacity: 0, y: 12 }}
        transition={{ type: "spring", bounce: 0.18, duration: 0.38 }}
        className="flex max-h-[90vh] w-full max-w-2xl flex-col overflow-hidden rounded-3xl border border-surface-200/60 bg-white shadow-modal dark:border-surface-700 dark:bg-surface-900"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start gap-4 border-b border-slate-100 p-6 dark:border-slate-800">
          <PetAvatar pet={pet} size="lg" />
          <div className="min-w-0 flex-1">
            <p className="text-xs font-semibold uppercase tracking-widest text-brand-600 dark:text-brand-300">
              {pet.especie}
            </p>
            <h2 className="mt-0.5 text-2xl font-bold text-slate-900 dark:text-white">
              {pet.nombre}
            </h2>
            <p className="mt-0.5 text-sm text-slate-500 dark:text-slate-400">
              {pet.raza || "Raza no especificada"} · Propietario: {pet.propietarioNombre || "—"}
            </p>
          </div>
          <div className="flex shrink-0 items-center gap-1.5">
            <button
              onClick={onEdit}
              className="flex h-8 w-8 items-center justify-center rounded-xl text-slate-400 transition hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800"
              title="Editar mascota"
            >
              <Pencil className="h-4 w-4" />
            </button>
            <button
              onClick={onDelete}
              className="dark:hover:bg-danger-950/30 flex h-8 w-8 items-center justify-center rounded-xl text-slate-400 transition hover:bg-danger-50 hover:text-danger-600 dark:hover:text-danger-400"
              title="Eliminar mascota"
            >
              <Trash2 className="h-4 w-4" />
            </button>
            <button
              onClick={onClose}
              className="flex h-8 w-8 items-center justify-center rounded-xl text-slate-400 transition hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-slate-100 px-6 dark:border-slate-800">
          {(
            [
              { id: "info" as Tab, label: "Información", icon: Info },
              { id: "historial" as Tab, label: "Historial clínico", icon: FileText },
            ] as const
          ).map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setTab(id)}
              className={`flex items-center gap-2 border-b-2 px-4 py-3 text-sm font-semibold transition ${
                tab === id
                  ? "border-brand-600 text-brand-600 dark:border-brand-300 dark:text-brand-300"
                  : "border-transparent text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
              }`}
            >
              <Icon className="h-4 w-4" />
              {label}
              {id === "historial" && historial.length > 0 && (
                <span className="rounded-full bg-brand-100 px-1.5 py-0.5 text-xs font-bold text-brand-700 dark:bg-brand-900/40 dark:text-brand-300">
                  {historial.length}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-6">
          {tab === "info" && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                {[
                  { label: "Edad", value: pet.edad || "—" },
                  { label: "Peso", value: pet.peso || "—" },
                  { label: "Sexo", value: pet.sexo },
                  { label: "Especie", value: pet.especie || "—" },
                  { label: "Raza", value: pet.raza || "—" },
                  { label: "Fecha de nac.", value: pet.fechaNacimiento || "—" },
                ].map(({ label, value }) => (
                  <div
                    key={label}
                    className="rounded-2xl border border-slate-100 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-800/50"
                  >
                    <p className="text-xs text-slate-500 dark:text-slate-400">{label}</p>
                    <p className="mt-1 font-semibold text-slate-900 dark:text-white">{value}</p>
                  </div>
                ))}
              </div>
              <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-800/50">
                <p className="text-xs text-slate-500 dark:text-slate-400">Propietario</p>
                <p className="mt-1 font-semibold text-slate-900 dark:text-white">
                  {pet.propietarioNombre || "No registrado"}
                </p>
              </div>
            </div>
          )}

          {tab === "historial" && (
            <div>
              <div className="mb-4 flex items-center justify-end">
                <button
                  type="button"
                  onClick={handleDescargarPdf}
                  disabled={descargandoPdf || loadingHistorial || !eventos?.length}
                  className="inline-flex h-9 items-center gap-2 rounded-lg bg-brand-600 px-3.5 text-xs font-semibold text-white transition-colors hover:bg-brand-700 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <Download className="h-3.5 w-3.5" />
                  {descargandoPdf ? "Generando..." : "Descargar PDF"}
                </button>
              </div>

              {loadingHistorial ? (
                <SkeletonCardList count={3} />
              ) : historialError ? (
                <div className="rounded-2xl border border-dashed border-danger-200 bg-danger-50 px-6 py-8 text-center dark:border-danger-700/40 dark:bg-danger-900/10">
                  <p className="text-sm font-semibold text-danger-700 dark:text-danger-400">
                    {historialError}
                  </p>
                </div>
              ) : !eventos || eventos.length === 0 ? (
                <div className="flex flex-col items-center justify-center gap-3 py-12 text-center">
                  <FileText className="h-10 w-10 text-slate-300 dark:text-slate-600" />
                  <p className="text-sm text-slate-500 dark:text-slate-400">
                    No hay historial clínico registrado para esta mascota.
                  </p>
                </div>
              ) : (
                <ol className="relative space-y-5 border-l border-surface-200 pl-6 dark:border-surface-700 sm:pl-7">
                  {eventos.map((evento, i) => (
                    <AdminTimelineItem
                      key={`${evento.tipo}-${evento.fecha}-${i}`}
                      evento={evento}
                      onEdit={() => setEditEvento(evento)}
                      onDelete={() => setDeleteEvento(evento)}
                      onVerAuditoria={() => setAuditoriaEvento(evento)}
                    />
                  ))}
                </ol>
              )}
            </div>
          )}
        </div>
      </motion.div>

      <AnimatePresence>
        {editEvento && editEvento.idConsulta != null && (
          <EditConsultaModal
            key={editEvento.idConsulta}
            idConsulta={editEvento.idConsulta}
            titulo={editEvento.titulo}
            onClose={() => setEditEvento(null)}
            onSaved={() => handleSavedConsulta("La consulta se actualizó correctamente.")}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {deleteEvento && (
          <DeleteConsultaModal
            key={deleteEvento.idConsulta}
            evento={deleteEvento}
            onClose={() => setDeleteEvento(null)}
            onDeleted={() => handleSavedConsulta("La consulta se eliminó correctamente.")}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {auditoriaEvento && auditoriaEvento.idConsulta != null && (
          <AuditoriaModal
            idConsulta={auditoriaEvento.idConsulta}
            onClose={() => setAuditoriaEvento(null)}
          />
        )}
      </AnimatePresence>
    </motion.div>
  );
}

function AdminTimelineItem({
  evento,
  onEdit,
  onDelete,
  onVerAuditoria,
}: {
  evento: TimelineEventAPI;
  onEdit: () => void;
  onDelete: () => void;
  onVerAuditoria: () => void;
}) {
  const esVacuna = evento.tipo === "vacuna";
  const Icon = esVacuna ? Syringe : Stethoscope;
  const esConsultaEditable = !esVacuna && evento.idConsulta != null;

  return (
    <li className="relative">
      <span
        className={`absolute -left-[31px] top-0.5 flex h-6 w-6 items-center justify-center rounded-full sm:-left-[37px] ${
          esVacuna
            ? "bg-warning-100 text-warning-700 dark:bg-warning-900/40 dark:text-warning-400"
            : "bg-brand-100 text-brand-600 dark:bg-brand-900/40 dark:text-brand-300"
        }`}
      >
        <Icon className="h-3.5 w-3.5" />
      </span>

      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex flex-wrap items-center gap-2">
          <p className="text-sm font-semibold text-slate-900 dark:text-white">{evento.titulo}</p>
          <span
            className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-semibold ${
              esVacuna
                ? "bg-warning-50 text-warning-700 dark:bg-warning-900/30 dark:text-warning-400"
                : "bg-brand-50 text-brand-700 dark:bg-brand-900/30 dark:text-brand-300"
            }`}
          >
            {esVacuna ? "Vacuna" : "Consulta"}
          </span>
        </div>

        {esConsultaEditable && (
          <div className="flex shrink-0 items-center gap-1">
            <button
              type="button"
              onClick={onVerAuditoria}
              title="Ver historial de cambios"
              className="flex h-7 w-7 items-center justify-center rounded-lg text-slate-400 transition hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800"
            >
              <History className="h-3.5 w-3.5" />
            </button>
            <button
              type="button"
              onClick={onEdit}
              title="Editar consulta"
              className="flex h-7 w-7 items-center justify-center rounded-lg text-slate-400 transition hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800"
            >
              <Pencil className="h-3.5 w-3.5" />
            </button>
            <button
              type="button"
              onClick={onDelete}
              title="Eliminar consulta"
              className="dark:hover:bg-danger-950/30 flex h-7 w-7 items-center justify-center rounded-lg text-slate-400 transition hover:bg-danger-50 hover:text-danger-600 dark:hover:text-danger-400"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          </div>
        )}
      </div>

      <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
        {formatearFecha(evento.fecha)}
      </p>

      {evento.descripcion && (
        <p className="mt-2 whitespace-pre-line text-sm text-slate-600 dark:text-slate-300">
          {evento.descripcion}
        </p>
      )}

      {evento.registradoPor && (
        <p className="mt-1 text-xs text-slate-400 dark:text-slate-500">
          Registrado por: {evento.registradoPor}
        </p>
      )}
    </li>
  );
}

const editConsultaEmptyForm = {
  diagnostico: "",
  tratamiento: "",
  peso: "",
  temperatura: "",
  frecuencia_cardiaca: "",
  recomendaciones: "",
  motivoAuditoria: "",
};

function EditConsultaModal({
  idConsulta,
  titulo,
  onClose,
  onSaved,
}: {
  idConsulta: number;
  titulo: string;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [form, setForm] = useState(editConsultaEmptyForm);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState("");

  useEffect(() => {
    let activo = true;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setLoading(true);
    fetchConsulta(idConsulta)
      .then((data) => {
        if (!activo) return;
        setForm({
          diagnostico: data.diagnostico ?? "",
          tratamiento: data.tratamiento ?? "",
          peso: data.peso ?? "",
          temperatura: data.temperatura ?? "",
          frecuencia_cardiaca: data.frecuencia_cardiaca?.toString() ?? "",
          recomendaciones: data.recomendaciones ?? "",
          motivoAuditoria: "",
        });
      })
      .catch(() => {
        if (activo) setFormError("No se pudo cargar la consulta. Intenta de nuevo.");
      })
      .finally(() => {
        if (activo) setLoading(false);
      });
    return () => {
      activo = false;
    };
  }, [idConsulta]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    setFormError("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setFormError("");
    try {
      await updateConsulta(idConsulta, {
        diagnostico: form.diagnostico.trim() || undefined,
        tratamiento: form.tratamiento.trim() || undefined,
        peso: form.peso.trim() ? Number(form.peso) : undefined,
        temperatura: form.temperatura.trim() ? Number(form.temperatura) : undefined,
        frecuencia_cardiaca: form.frecuencia_cardiaca.trim()
          ? Number(form.frecuencia_cardiaca)
          : undefined,
        recomendaciones: form.recomendaciones.trim() || undefined,
        motivoAuditoria: form.motivoAuditoria.trim() || undefined,
      });
      onSaved();
    } catch (err) {
      setFormError(err instanceof Error ? err.message : "No se pudo actualizar la consulta.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[120] flex items-center justify-center bg-surface-900/50 px-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.96, opacity: 0, y: 12 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.96, opacity: 0, y: 12 }}
        transition={{ type: "spring", bounce: 0.18, duration: 0.38 }}
        className="flex max-h-[90vh] w-full max-w-lg flex-col overflow-hidden rounded-3xl border border-surface-200/60 bg-white shadow-modal dark:border-surface-700 dark:bg-surface-900"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4 dark:border-slate-800">
          <div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">Editar consulta</h2>
            <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">{titulo}</p>
          </div>
          <button
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-xl text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-6">
          {loading ? (
            <p className="py-8 text-center text-sm text-slate-500 dark:text-slate-400">
              Cargando consulta...
            </p>
          ) : (
            <form id="form-editar-consulta" onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="mb-1 block text-sm font-semibold text-slate-700 dark:text-slate-300">
                  Diagnóstico
                </label>
                <textarea
                  name="diagnostico"
                  value={form.diagnostico}
                  onChange={handleChange}
                  rows={2}
                  className={inputClass}
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-semibold text-slate-700 dark:text-slate-300">
                  Tratamiento
                </label>
                <textarea
                  name="tratamiento"
                  value={form.tratamiento}
                  onChange={handleChange}
                  rows={2}
                  className={inputClass}
                />
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="mb-1 block text-sm font-semibold text-slate-700 dark:text-slate-300">
                    Peso (kg)
                  </label>
                  <input
                    name="peso"
                    value={form.peso}
                    onChange={handleChange}
                    inputMode="decimal"
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-semibold text-slate-700 dark:text-slate-300">
                    Temp. (°C)
                  </label>
                  <input
                    name="temperatura"
                    value={form.temperatura}
                    onChange={handleChange}
                    inputMode="decimal"
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-semibold text-slate-700 dark:text-slate-300">
                    FC (lpm)
                  </label>
                  <input
                    name="frecuencia_cardiaca"
                    value={form.frecuencia_cardiaca}
                    onChange={handleChange}
                    inputMode="numeric"
                    className={inputClass}
                  />
                </div>
              </div>
              <div>
                <label className="mb-1 block text-sm font-semibold text-slate-700 dark:text-slate-300">
                  Recomendaciones
                </label>
                <textarea
                  name="recomendaciones"
                  value={form.recomendaciones}
                  onChange={handleChange}
                  rows={2}
                  className={inputClass}
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-semibold text-slate-700 dark:text-slate-300">
                  Motivo de la edición{" "}
                  <span className="font-normal text-slate-400">
                    (obligatorio si no registraste esta consulta)
                  </span>
                </label>
                <textarea
                  name="motivoAuditoria"
                  value={form.motivoAuditoria}
                  onChange={handleChange}
                  rows={2}
                  placeholder="Ej: Corrección solicitada por el veterinario responsable."
                  className={inputClass}
                />
              </div>
              {formError && (
                <div className="dark:bg-danger-950/30 rounded-xl border border-danger-200 bg-danger-50 px-4 py-3 text-sm text-danger-700 dark:border-danger-800 dark:text-danger-300">
                  {formError}
                </div>
              )}
            </form>
          )}
        </div>
        <div className="flex justify-end gap-3 border-t border-slate-100 px-6 py-4 dark:border-slate-800">
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl border border-slate-200 px-5 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300"
          >
            Cancelar
          </button>
          <button
            form="form-editar-consulta"
            type="submit"
            disabled={saving || loading}
            className="rounded-xl bg-brand-600 px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-brand-700 disabled:opacity-60"
          >
            {saving ? "Guardando..." : "Guardar cambios"}
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}

function DeleteConsultaModal({
  evento,
  onClose,
  onDeleted,
}: {
  evento: TimelineEventAPI;
  onClose: () => void;
  onDeleted: () => void;
}) {
  const [motivoAuditoria, setMotivoAuditoria] = useState("");
  const [deleting, setDeleting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const handleConfirm = async () => {
    if (!evento.idConsulta) return;
    setDeleting(true);
    setErrorMsg("");
    try {
      await deleteConsulta(evento.idConsulta, motivoAuditoria.trim() || undefined);
      onDeleted();
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : "No se pudo eliminar la consulta.");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[150] flex items-center justify-center bg-slate-900/50 px-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 8 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96, y: 8 }}
        transition={{ duration: 0.18 }}
        onClick={(e) => e.stopPropagation()}
        role="alertdialog"
        aria-modal="true"
        className="w-full max-w-sm rounded-2xl border border-slate-200 bg-white p-6 shadow-modal dark:border-slate-700 dark:bg-slate-900"
      >
        <div className="flex items-start gap-4">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-danger-50 text-danger-600">
            <AlertTriangle className="h-5 w-5" />
          </div>
          <div className="min-w-0">
            <h3 className="text-base font-semibold text-slate-900 dark:text-white">
              Eliminar consulta
            </h3>
            <p className="mt-1.5 text-sm leading-6 text-slate-500 dark:text-slate-400">
              ¿Seguro que deseas eliminar &quot;{evento.titulo}&quot;? El registro se ocultará del
              historial pero quedará auditado.
            </p>
          </div>
        </div>

        <div className="mt-4">
          <label className="mb-1 block text-sm font-semibold text-slate-700 dark:text-slate-300">
            Motivo de la eliminación{" "}
            <span className="font-normal text-slate-400">
              (obligatorio si no registraste esta consulta)
            </span>
          </label>
          <textarea
            value={motivoAuditoria}
            onChange={(e) => setMotivoAuditoria(e.target.value)}
            rows={2}
            placeholder="Ej: Registro duplicado, se elimina por error de captura."
            className={inputClass}
          />
        </div>

        {errorMsg && (
          <div className="dark:bg-danger-950/30 mt-3 rounded-xl border border-danger-200 bg-danger-50 px-4 py-3 text-sm text-danger-700 dark:border-danger-800 dark:text-danger-300">
            {errorMsg}
          </div>
        )}

        <div className="mt-5 flex justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            disabled={deleting}
            className="rounded-xl bg-danger-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-danger-700 disabled:opacity-60"
          >
            {deleting ? "Eliminando..." : "Eliminar"}
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}

function AuditoriaModal({ idConsulta, onClose }: { idConsulta: number; onClose: () => void }) {
  const [items, setItems] = useState<AuditoriaConsultaAPI[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let activo = true;
    fetchConsultaAuditoria(idConsulta)
      .then((data) => {
        if (activo) setItems(data);
      })
      .catch(() => {
        if (activo) setError("No se pudo cargar el historial de cambios.");
      })
      .finally(() => {
        if (activo) setLoading(false);
      });
    return () => {
      activo = false;
    };
  }, [idConsulta]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[130] flex items-center justify-center bg-surface-900/50 px-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.96, opacity: 0, y: 12 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.96, opacity: 0, y: 12 }}
        transition={{ type: "spring", bounce: 0.18, duration: 0.38 }}
        className="flex max-h-[80vh] w-full max-w-lg flex-col overflow-hidden rounded-3xl border border-surface-200/60 bg-white shadow-modal dark:border-surface-700 dark:bg-surface-900"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4 dark:border-slate-800">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">Historial de cambios</h2>
          <button
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-xl text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-6">
          {loading ? (
            <SkeletonCardList count={3} />
          ) : error ? (
            <p className="text-sm font-semibold text-danger-700 dark:text-danger-400">{error}</p>
          ) : !items || items.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-3 py-10 text-center">
              <History className="h-9 w-9 text-slate-300 dark:text-slate-600" />
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Esta consulta no tiene cambios registrados.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {items.map((item) => (
                <div
                  key={item.id_auditoria}
                  className="rounded-2xl border border-slate-100 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-800/50"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span
                      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                        item.accion === "eliminacion"
                          ? "bg-danger-50 text-danger-700 dark:bg-danger-900/30 dark:text-danger-400"
                          : "bg-brand-50 text-brand-700 dark:bg-brand-900/30 dark:text-brand-300"
                      }`}
                    >
                      {item.accion === "eliminacion" ? "Eliminación" : "Actualización"}
                    </span>
                    <span className="text-xs text-slate-400">
                      {formatearFechaHora(item.created_at)}
                    </span>
                  </div>
                  <p className="mt-2 text-sm font-semibold text-slate-900 dark:text-white">
                    {item.usuarios?.nombre ?? "Usuario desconocido"}
                  </p>
                  {item.motivo && (
                    <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
                      Motivo: {item.motivo}
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}

const emptyForm = {
  nombre: "",
  especie: "Canino",
  raza: "",
  edad: "",
  peso: "",
  sexo: "No especificado",
  propietarioId: "",
};

export default function MascotasPage() {
  const { success, error: notifyError } = useToast();
  const [pets, setPets] = useState<PetRecord[]>([]);
  const [propietarios, setPropietarios] = useState<Owner[]>([]);
  const [citas, setCitas] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [, setLoadingCitas] = useState(true);
  const [selectedPet, setSelectedPet] = useState<PetRecord | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editingPetId, setEditingPetId] = useState<string | null>(null);
  const [confirmDeletePet, setConfirmDeletePet] = useState<PetRecord | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [search, setSearch] = useState("");
  const [filtroEspecie, setFiltroEspecie] = useState<"todas" | "Canino" | "Felino" | "Otro">(
    "todas",
  );
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState("");
  const [form, setForm] = useState(emptyForm);

  const cargar = () => {
    setLoading(true);
    Promise.all([fetchMascotas(), fetchPropietarios()])
      .then(([p, prop]) => {
        setPets(p);
        setPropietarios(prop);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    // Carga inicial de datos al montar — setLoading(true) antes del fetch es el patrón estándar
    // eslint-disable-next-line react-hooks/set-state-in-effect
    cargar();
  }, []);

  useEffect(() => {
    fetchCitas()
      .then(setCitas)
      .catch(() => setCitas([]))
      .finally(() => setLoadingCitas(false));
  }, []);

  const petsFiltradas = useMemo(() => {
    return pets.filter((p) => {
      const matchSearch =
        !search ||
        p.nombre.toLowerCase().includes(search.toLowerCase()) ||
        (p.propietarioNombre ?? "").toLowerCase().includes(search.toLowerCase()) ||
        (p.raza ?? "").toLowerCase().includes(search.toLowerCase());
      const matchEspecie =
        filtroEspecie === "todas" || normalizeEspecie(p.especie) === filtroEspecie;
      return matchSearch && matchEspecie;
    });
  }, [pets, search, filtroEspecie]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    setFormError("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.nombre.trim()) {
      setFormError("El nombre es obligatorio.");
      return;
    }
    if (!form.propietarioId) {
      setFormError("Selecciona un propietario.");
      return;
    }
    setSaving(true);
    setFormError("");
    try {
      const propietario = propietarios.find((o) => o.id === form.propietarioId);
      const payload = {
        nombre: form.nombre.trim(),
        especie: form.especie,
        raza: form.raza.trim() || "",
        edad: form.edad.trim() || "",
        peso: form.peso.trim() || "",
        sexo: form.sexo as PetRecord["sexo"],
        foto: "",
        propietarioId: form.propietarioId,
        propietarioNombre: propietario?.name ?? "",
      };
      if (editingPetId) {
        await updateMascota({ id: editingPetId, ...payload });
        success("Mascota actualizada", "Los datos de la mascota se guardaron correctamente.");
      } else {
        await createMascota(payload);
        success("Mascota registrada", "La mascota se registró correctamente.");
      }
      setShowForm(false);
      setEditingPetId(null);
      setForm(emptyForm);
      cargar();
    } catch (err) {
      setFormError(
        err instanceof Error
          ? err.message
          : editingPetId
            ? "Error al actualizar la mascota."
            : "Error al registrar la mascota.",
      );
    } finally {
      setSaving(false);
    }
  };

  const openEditForm = (pet: PetRecord) => {
    setEditingPetId(pet.id);
    setForm({
      nombre: pet.nombre,
      especie: pet.especie,
      raza: pet.raza ?? "",
      edad: pet.edad ?? "",
      peso: pet.peso ?? "",
      sexo: pet.sexo,
      propietarioId: pet.propietarioId,
    });
    setFormError("");
    setSelectedPet(null);
    setShowForm(true);
  };

  const handleDeletePet = async () => {
    if (!confirmDeletePet) return;
    setDeleting(true);
    try {
      await deleteMascota(confirmDeletePet.id);
      success("Mascota eliminada", "La mascota se eliminó correctamente.");
      setConfirmDeletePet(null);
      setSelectedPet(null);
      cargar();
    } catch (err) {
      notifyError(
        "Error al eliminar",
        err instanceof Error ? err.message : "No se pudo eliminar la mascota.",
      );
    } finally {
      setDeleting(false);
    }
  };

  const especieCounts = useMemo(
    () => ({
      Canino: pets.filter((p) => normalizeEspecie(p.especie) === "Canino").length,
      Felino: pets.filter((p) => normalizeEspecie(p.especie) === "Felino").length,
      Otro: pets.filter((p) => normalizeEspecie(p.especie) === "Otro").length,
    }),
    [pets],
  );

  return (
    <>
      <div className="admin-page">
        <section className="admin-card-padded">
          {/* Header */}
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <p className="text-eyebrow">Mascotas</p>
              <h1 className="text-page-title mt-2">Gestión de mascotas</h1>
              <p className="text-subtitle mt-1">
                Consulta información y historial clínico de cada paciente.
              </p>
            </div>
            <button onClick={() => setShowForm(true)} className="btn-primary shrink-0">
              <Plus className="h-4 w-4" />
              Nueva mascota
            </button>
          </div>

          {/* Stats */}
          <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
            <article className="rounded-2xl border border-slate-200/70 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-800/50">
              <p className="text-xs font-medium text-slate-500 dark:text-slate-400">Total</p>
              <p className="mt-1 text-2xl font-bold text-slate-900 dark:text-white">
                {loading ? "—" : pets.length}
              </p>
            </article>
            <article className="rounded-2xl border border-amber-200/70 bg-amber-50 p-4 dark:border-amber-900/50 dark:bg-amber-950/20">
              <p className="text-xs font-medium text-amber-600 dark:text-amber-400">Caninos</p>
              <p className="mt-1 text-2xl font-bold text-amber-800 dark:text-amber-300">
                {loading ? "—" : especieCounts.Canino}
              </p>
            </article>
            <article className="rounded-2xl border border-violet-200/70 bg-violet-50 p-4 dark:border-violet-900/50 dark:bg-violet-950/20">
              <p className="text-xs font-medium text-violet-600 dark:text-violet-400">Felinos</p>
              <p className="mt-1 text-2xl font-bold text-violet-800 dark:text-violet-300">
                {loading ? "—" : especieCounts.Felino}
              </p>
            </article>
            <article className="rounded-2xl border border-teal-200/70 bg-teal-50 p-4 dark:border-teal-900/50 dark:bg-teal-950/20">
              <p className="text-xs font-medium text-teal-600 dark:text-teal-400">Otros</p>
              <p className="mt-1 text-2xl font-bold text-teal-800 dark:text-teal-300">
                {loading ? "—" : especieCounts.Otro}
              </p>
            </article>
          </div>

          {/* Buscador + filtros */}
          <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center">
            <div className="relative flex-1">
              <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                type="search"
                placeholder="Buscar por nombre, raza o propietario..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-10 pr-4 text-sm text-slate-900 outline-none transition focus:border-brand-500 focus:ring-2 focus:ring-brand-100 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
              />
            </div>
            <div className="flex flex-wrap gap-2">
              {(["todas", "Canino", "Felino", "Otro"] as const).map((f) => (
                <button
                  key={f}
                  onClick={() => setFiltroEspecie(f)}
                  className={`rounded-xl px-3 py-2 text-sm font-semibold transition ${
                    filtroEspecie === f
                      ? "bg-brand-600 text-white"
                      : "border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300"
                  }`}
                >
                  {f === "todas" ? "Todas" : f}
                </button>
              ))}
            </div>
          </div>

          {/* Lista */}
          <div className="mt-5">
            {loading ? (
              <div>
                <SkeletonCardList count={4} />
              </div>
            ) : petsFiltradas.length === 0 ? (
              <div className="flex flex-col items-center gap-3 rounded-2xl border border-slate-200/70 bg-slate-50 py-14 text-center dark:border-slate-700 dark:bg-slate-800/40">
                <PawPrint className="h-10 w-10 text-slate-300 dark:text-slate-600" />
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  {search || filtroEspecie !== "todas"
                    ? "No hay mascotas que coincidan con el filtro."
                    : "No hay mascotas registradas."}
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                {petsFiltradas.map((pet) => {
                  const citasCount = citas.filter((c) => c.petId === pet.id).length;
                  return (
                    <button
                      key={pet.id}
                      onClick={() => setSelectedPet(pet)}
                      className="flex w-full items-center gap-4 rounded-2xl border border-slate-200/70 bg-white p-4 text-left transition hover:border-brand-200 hover:bg-brand-50/40 dark:border-slate-700 dark:bg-slate-800/40 dark:hover:border-brand-700 dark:hover:bg-brand-950/20"
                    >
                      <PetAvatar pet={pet} size="md" />
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <p className="font-semibold text-slate-900 dark:text-white">
                            {pet.nombre}
                          </p>
                          <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs text-slate-500 dark:bg-slate-700 dark:text-slate-400">
                            {pet.especie}
                          </span>
                        </div>
                        <p className="mt-0.5 truncate text-sm text-slate-500 dark:text-slate-400">
                          {pet.raza || "Sin raza"} · {pet.propietarioNombre || "Sin propietario"}
                        </p>
                      </div>
                      <div className="hidden shrink-0 flex-col items-end gap-1 sm:flex">
                        <span className="text-xs text-slate-400">{pet.edad || "—"}</span>
                        {citasCount > 0 && (
                          <span className="rounded-full bg-brand-100 px-2 py-0.5 text-xs font-semibold text-brand-700 dark:bg-brand-900/40 dark:text-brand-300">
                            {citasCount} {citasCount === 1 ? "cita" : "citas"}
                          </span>
                        )}
                      </div>
                      <svg
                        className="h-4 w-4 shrink-0 text-slate-300 dark:text-slate-600"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 5l7 7-7 7"
                        />
                      </svg>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Contador */}
          {!loading && petsFiltradas.length > 0 && (
            <p className="mt-4 text-center text-xs text-slate-400">
              Mostrando {petsFiltradas.length} de {pets.length} mascotas
            </p>
          )}
        </section>
      </div>

      {/* Modal detalle */}
      <AnimatePresence>
        {selectedPet && (
          <DetailModal
            pet={selectedPet}
            citas={citas}
            onClose={() => setSelectedPet(null)}
            onEdit={() => openEditForm(selectedPet)}
            onDelete={() => setConfirmDeletePet(selectedPet)}
          />
        )}
      </AnimatePresence>

      {/* Modal nueva mascota */}
      <AnimatePresence>
        {showForm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-surface-900/50 px-4 backdrop-blur-sm"
            onClick={() => {
              setShowForm(false);
              setEditingPetId(null);
              setForm(emptyForm);
            }}
          >
            <motion.div
              initial={{ scale: 0.96, opacity: 0, y: 12 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.96, opacity: 0, y: 12 }}
              transition={{ type: "spring", bounce: 0.18, duration: 0.38 }}
              className="flex max-h-[90vh] w-full max-w-2xl flex-col overflow-hidden rounded-3xl border border-surface-200/60 bg-white shadow-modal dark:border-surface-700 dark:bg-surface-900"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4 dark:border-slate-800">
                <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                  {editingPetId ? "Editar mascota" : "Nueva mascota"}
                </h2>
                <button
                  onClick={() => {
                    setShowForm(false);
                    setEditingPetId(null);
                    setForm(emptyForm);
                  }}
                  className="flex h-8 w-8 items-center justify-center rounded-xl text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
              <div className="flex-1 overflow-y-auto p-6">
                <form id="form-mascota" onSubmit={handleSubmit} className="space-y-5">
                  <div className="grid gap-5 sm:grid-cols-2">
                    <div>
                      <label className="mb-1 block text-sm font-semibold text-slate-700 dark:text-slate-300">
                        Nombre *
                      </label>
                      <input
                        name="nombre"
                        value={form.nombre}
                        onChange={handleChange}
                        placeholder="Nombre de la mascota"
                        className={inputClass}
                        required
                      />
                    </div>
                    <div>
                      <label className="mb-1 block text-sm font-semibold text-slate-700 dark:text-slate-300">
                        Especie
                      </label>
                      <select
                        name="especie"
                        value={form.especie}
                        onChange={handleChange}
                        className={inputClass}
                      >
                        <option value="Canino">Canino</option>
                        <option value="Felino">Felino</option>
                        <option value="Otro">Otro</option>
                      </select>
                    </div>
                    <div>
                      <label className="mb-1 block text-sm font-semibold text-slate-700 dark:text-slate-300">
                        Raza
                      </label>
                      <input
                        name="raza"
                        value={form.raza}
                        onChange={handleChange}
                        placeholder="Raza"
                        className={inputClass}
                      />
                    </div>
                    <div>
                      <label className="mb-1 block text-sm font-semibold text-slate-700 dark:text-slate-300">
                        Sexo
                      </label>
                      <select
                        name="sexo"
                        value={form.sexo}
                        onChange={handleChange}
                        className={inputClass}
                      >
                        <option value="Macho">Macho</option>
                        <option value="Hembra">Hembra</option>
                        <option value="No especificado">No especificado</option>
                      </select>
                    </div>
                    <div>
                      <label className="mb-1 block text-sm font-semibold text-slate-700 dark:text-slate-300">
                        Edad (años)
                      </label>
                      <input
                        name="edad"
                        value={form.edad}
                        onChange={handleChange}
                        placeholder="Ej: 3 años"
                        className={inputClass}
                      />
                    </div>
                    <div>
                      <label className="mb-1 block text-sm font-semibold text-slate-700 dark:text-slate-300">
                        Peso (kg)
                      </label>
                      <input
                        name="peso"
                        value={form.peso}
                        onChange={handleChange}
                        placeholder="Ej: 4.5 kg"
                        className={inputClass}
                      />
                    </div>
                    <div className="sm:col-span-2">
                      <label className="mb-1 block text-sm font-semibold text-slate-700 dark:text-slate-300">
                        Propietario *
                      </label>
                      <select
                        name="propietarioId"
                        value={form.propietarioId}
                        onChange={handleChange}
                        className={inputClass}
                        required
                      >
                        <option value="">Seleccionar propietario</option>
                        {propietarios.map((p) => (
                          <option key={p.id} value={p.id}>
                            {p.name} — {p.email}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                  {formError && (
                    <div className="dark:bg-danger-950/30 rounded-xl border border-danger-200 bg-danger-50 px-4 py-3 text-sm text-danger-700 dark:border-danger-800 dark:text-danger-300">
                      {formError}
                    </div>
                  )}
                </form>
              </div>
              <div className="flex justify-end gap-3 border-t border-slate-100 px-6 py-4 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => {
                    setShowForm(false);
                    setEditingPetId(null);
                    setForm(emptyForm);
                  }}
                  className="rounded-xl border border-slate-200 px-5 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300"
                >
                  Cancelar
                </button>
                <button
                  form="form-mascota"
                  type="submit"
                  disabled={saving}
                  className="rounded-xl bg-brand-600 px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-brand-700 disabled:opacity-60"
                >
                  {saving ? "Guardando..." : editingPetId ? "Guardar cambios" : "Registrar mascota"}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Confirmación de eliminación */}
      <ConfirmDialog
        open={confirmDeletePet !== null}
        title="Eliminar mascota"
        description={
          confirmDeletePet
            ? `¿Seguro que deseas eliminar a "${confirmDeletePet.nombre}"? Esta acción no se puede deshacer.`
            : ""
        }
        confirmLabel={deleting ? "Eliminando..." : "Eliminar"}
        cancelLabel="Cancelar"
        variant="danger"
        onConfirm={handleDeletePet}
        onCancel={() => setConfirmDeletePet(null)}
      />
    </>
  );
}
