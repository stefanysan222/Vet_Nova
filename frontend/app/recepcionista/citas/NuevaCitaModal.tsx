"use client";

import { useEffect, useState, type FormEvent } from "react";
import { X, CalendarDays, Loader2 } from "lucide-react";
import { fetchMascotas } from "../../../lib/api/mascotas";
import { fetchVeterinarios, type UsuarioAPI } from "../../../lib/api/usuarios";
import { addAppointment } from "../../../lib/recepcionista/storage";
import type { Appointment, PetRecord } from "../../../lib/recepcionista/types";

const SERVICIOS = [
  "Consulta general",
  "Vacunación",
  "Desparasitación",
  "Control médico",
  "Urgencias",
  "Cirugía",
  "Peluquería",
];

const HORARIOS = [
  "08:00 AM", "08:30 AM", "09:00 AM", "09:30 AM",
  "10:00 AM", "10:30 AM", "11:00 AM", "11:30 AM",
  "02:00 PM", "02:30 PM", "03:00 PM", "03:30 PM",
  "04:00 PM", "04:30 PM", "05:00 PM",
];

interface Props {
  open: boolean;
  onClose: () => void;
  onCreated: (cita: Appointment) => void;
}

const inputCls =
  "mt-1.5 h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100 dark:border-slate-700 dark:bg-slate-900 dark:text-white";

const labelCls = "text-sm font-semibold text-slate-700 dark:text-slate-300";

function hoy() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

export default function NuevaCitaModal({ open, onClose, onCreated }: Props) {
  const [mascotas, setMascotas] = useState<PetRecord[]>([]);
  const [veterinarios, setVeterinarios] = useState<UsuarioAPI[]>([]);
  const [loadingData, setLoadingData] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    petId: "",
    service: "",
    date: "",
    time: "",
    veterinarianId: "",
    notes: "",
  });

  useEffect(() => {
    if (!open) return;
    setError("");
    setForm({ petId: "", service: "", date: "", time: "", veterinarianId: "", notes: "" });
    setLoadingData(true);
    Promise.all([fetchMascotas(), fetchVeterinarios()])
      .then(([m, v]) => { setMascotas(m); setVeterinarios(v); })
      .catch(() => setError("No se pudieron cargar mascotas o veterinarios."))
      .finally(() => setLoadingData(false));
  }, [open]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");

    if (!form.petId) return setError("Selecciona una mascota.");
    if (!form.service) return setError("Selecciona el servicio.");
    if (!form.date || !form.time) return setError("Selecciona fecha y hora.");

    const mascota = mascotas.find((m) => m.id === form.petId);
    if (!mascota) return setError("Mascota no encontrada.");

    setSaving(true);
    try {
      const nueva = await addAppointment({
        date: form.date,
        time: form.time,
        petId: form.petId,
        ownerId: mascota.propietarioId,
        petName: mascota.nombre,
        ownerName: mascota.propietarioNombre,
        service: form.service,
        status: "Pendiente",
        notes: form.notes || undefined,
        veterinarianId: form.veterinarianId ? parseInt(form.veterinarianId, 10) : undefined,
        veterinarian: form.veterinarianId
          ? (veterinarios.find((v) => String(v.id) === form.veterinarianId)?.nombre ?? undefined)
          : undefined,
        petEspecie: mascota.especie,
        petRaza: mascota.raza,
      });
      onCreated(nueva);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al crear la cita.");
    } finally {
      setSaving(false);
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm">
      <div className="w-full max-w-lg overflow-hidden rounded-[28px] bg-white shadow-2xl dark:bg-slate-950">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-200 px-6 py-5 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-blue-50 text-blue-600 dark:bg-blue-900/30">
              <CalendarDays className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Nueva cita</h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">Completa los datos de la cita</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex h-9 w-9 items-center justify-center rounded-xl text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="px-6 py-5">
          {loadingData ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-7 w-7 animate-spin text-blue-600" />
            </div>
          ) : (
            <div className="grid gap-4">
              {/* Mascota */}
              <div>
                <label className={labelCls}>Mascota <span className="text-blue-600">*</span></label>
                <select
                  value={form.petId}
                  onChange={(e) => setForm((f) => ({ ...f, petId: e.target.value }))}
                  className={inputCls}
                >
                  <option value="">Selecciona una mascota</option>
                  {mascotas.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.nombre} — {m.especie} ({m.propietarioNombre})
                    </option>
                  ))}
                </select>
              </div>

              {/* Servicio */}
              <div>
                <label className={labelCls}>Servicio <span className="text-blue-600">*</span></label>
                <select
                  value={form.service}
                  onChange={(e) => setForm((f) => ({ ...f, service: e.target.value }))}
                  className={inputCls}
                >
                  <option value="">Selecciona un servicio</option>
                  {SERVICIOS.map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>

              {/* Fecha y Hora */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={labelCls}>Fecha <span className="text-blue-600">*</span></label>
                  <input
                    type="date"
                    min={hoy()}
                    value={form.date}
                    onChange={(e) => setForm((f) => ({ ...f, date: e.target.value }))}
                    className={inputCls}
                  />
                </div>
                <div>
                  <label className={labelCls}>Hora <span className="text-blue-600">*</span></label>
                  <select
                    value={form.time}
                    onChange={(e) => setForm((f) => ({ ...f, time: e.target.value }))}
                    className={inputCls}
                  >
                    <option value="">Seleccionar hora</option>
                    {HORARIOS.map((h) => (
                      <option key={h} value={h}>{h}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Veterinario */}
              <div>
                <label className={labelCls}>Veterinario asignado</label>
                <select
                  value={form.veterinarianId}
                  onChange={(e) => setForm((f) => ({ ...f, veterinarianId: e.target.value }))}
                  className={inputCls}
                >
                  <option value="">Sin asignar</option>
                  {veterinarios.map((v) => (
                    <option key={v.id} value={String(v.id)}>
                      {v.nombre ?? v.email}
                    </option>
                  ))}
                </select>
              </div>

              {/* Notas */}
              <div>
                <label className={labelCls}>Notas</label>
                <textarea
                  rows={3}
                  value={form.notes}
                  onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
                  placeholder="Motivo de consulta, síntomas u observaciones..."
                  className="mt-1.5 w-full resize-none rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
                />
              </div>

              {error && (
                <p className="rounded-xl bg-rose-50 px-4 py-2.5 text-sm text-rose-700 dark:bg-rose-950/40 dark:text-rose-300">
                  {error}
                </p>
              )}
            </div>
          )}

          {/* Footer */}
          {!loadingData && (
            <div className="mt-5 flex justify-end gap-3">
              <button
                type="button"
                onClick={onClose}
                className="rounded-xl border border-slate-200 px-5 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-900"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={saving}
                className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-2 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:opacity-60"
              >
                {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <CalendarDays className="h-4 w-4" />}
                {saving ? "Guardando..." : "Crear cita"}
              </button>
            </div>
          )}
        </form>
      </div>
    </div>
  );
}
