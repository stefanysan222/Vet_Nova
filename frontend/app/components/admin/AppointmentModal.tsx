"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";

export interface AppointmentRecord {
  id: string;
  mascota: string;
  veterinario: string;
  fecha: string;
  hora: string;
  servicio: string;
  estado: "Confirmada" | "Pendiente" | "Cancelada";
}

interface AppointmentModalProps {
  isOpen: boolean;
  pets: string[];
  onClose: () => void;
  onSave: (appointment: AppointmentRecord) => void;
  initialAppointment?: AppointmentRecord;
}

const emptyAppointment: Omit<AppointmentRecord, "id"> = {
  mascota: "",
  veterinario: "",
  fecha: new Date().toISOString().split("T")[0],
  hora: "09:00",
  servicio: "Consulta general",
  estado: "Pendiente",
};

export default function AppointmentModal({ isOpen, pets, onClose, onSave, initialAppointment }: AppointmentModalProps) {
  const [appointment, setAppointment] = useState<AppointmentRecord>({ id: "", ...emptyAppointment });
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (!isOpen) {
      setAppointment({ id: "", ...emptyAppointment });
      setErrors({});
      return;
    }

    if (initialAppointment) {
      setAppointment(initialAppointment);
    } else {
      setAppointment({ id: "", ...emptyAppointment });
    }
    setErrors({});
  }, [initialAppointment, isOpen]);

  const handleChange = (field: keyof Omit<AppointmentRecord, "id">, value: string) => {
    setAppointment((current) => ({ ...current, [field]: value }));
    setErrors((current) => ({ ...current, [field]: "" }));
  };

  const validate = () => {
    const nextErrors: Record<string, string> = {};

    if (!appointment.mascota.trim()) nextErrors.mascota = "Selecciona una mascota.";
    if (!appointment.veterinario.trim()) nextErrors.veterinario = "Selecciona un veterinario.";
    if (!appointment.fecha.trim()) nextErrors.fecha = "Selecciona fecha.";
    if (!appointment.hora.trim()) nextErrors.hora = "Selecciona hora.";
    if (!appointment.servicio.trim()) nextErrors.servicio = "Describe el servicio.";

    return nextErrors;
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const nextErrors = validate();

    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      return;
    }

    onSave({
      ...appointment,
      id: appointment.id || `${Date.now()}-${Math.random().toString(16).slice(2)}`,
    });
    onClose();
  };

  const veterinarios = ["Dr. García", "Dra. Martínez", "Dr. Rodríguez", "Dra. Elena"];

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
          onClick={onClose}
        >
          <motion.form
            initial={{ opacity: 0, y: 20, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.98 }}
            transition={{ type: "spring", bounce: 0, duration: 0.25 }}
            onSubmit={handleSubmit}
            className="w-full max-w-2xl overflow-hidden rounded-[2rem] border border-slate-200 bg-white p-6 shadow-2xl"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex items-center justify-between gap-4 border-b border-slate-200 pb-4">
              <div>
                <h2 className="text-2xl font-semibold text-slate-900">Crear o editar cita</h2>
                <p className="mt-1 text-sm text-slate-500">Asocia fecha, hora, mascota y veterinario.</p>
              </div>
              <button type="button" onClick={onClose} className="rounded-full p-2 text-slate-500 transition hover:bg-slate-100">
                <X className="h-6 w-6" />
              </button>
            </div>

            <div className="mt-6 grid gap-5 sm:grid-cols-2">
              <label className="space-y-2">
                <span className="text-sm font-semibold text-slate-700">Mascota</span>
                <select
                  value={appointment.mascota}
                  onChange={(event) => handleChange("mascota", event.target.value)}
                  className="w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                >
                  <option value="">Selecciona mascota</option>
                  {pets.map((pet) => (
                    <option key={pet} value={pet}>{pet}</option>
                  ))}
                </select>
                {errors.mascota ? <p className="text-sm text-rose-600">{errors.mascota}</p> : null}
              </label>

              <label className="space-y-2">
                <span className="text-sm font-semibold text-slate-700">Veterinario</span>
                <select
                  value={appointment.veterinario}
                  onChange={(event) => handleChange("veterinario", event.target.value)}
                  className="w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                >
                  <option value="">Selecciona veterinario</option>
                  {veterinarios.map((name) => (
                    <option key={name} value={name}>{name}</option>
                  ))}
                </select>
                {errors.veterinario ? <p className="text-sm text-rose-600">{errors.veterinario}</p> : null}
              </label>

              <label className="space-y-2">
                <span className="text-sm font-semibold text-slate-700">Fecha</span>
                <input
                  type="date"
                  value={appointment.fecha}
                  onChange={(event) => handleChange("fecha", event.target.value)}
                  className="w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                />
                {errors.fecha ? <p className="text-sm text-rose-600">{errors.fecha}</p> : null}
              </label>

              <label className="space-y-2">
                <span className="text-sm font-semibold text-slate-700">Hora</span>
                <input
                  type="time"
                  value={appointment.hora}
                  onChange={(event) => handleChange("hora", event.target.value)}
                  className="w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                />
                {errors.hora ? <p className="text-sm text-rose-600">{errors.hora}</p> : null}
              </label>
            </div>

            <label className="mt-4 space-y-2">
              <span className="text-sm font-semibold text-slate-700">Servicio</span>
              <input
                value={appointment.servicio}
                onChange={(event) => handleChange("servicio", event.target.value)}
                className="w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                placeholder="Ej: Consulta general, vacunas, cirugía"
              />
              {errors.servicio ? <p className="text-sm text-rose-600">{errors.servicio}</p> : null}
            </label>

            <label className="mt-4 space-y-2">
              <span className="text-sm font-semibold text-slate-700">Estado</span>
              <select
                value={appointment.estado}
                onChange={(event) => handleChange("estado", event.target.value)}
                className="w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              >
                <option value="Pendiente">Pendiente</option>
                <option value="Confirmada">Confirmada</option>
                <option value="Cancelada">Cancelada</option>
              </select>
            </label>

            <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={onClose}
                className="rounded-3xl border border-slate-200 px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="rounded-3xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white shadow-sm shadow-blue-500/20 transition hover:bg-blue-700"
              >
                Guardar cita
              </button>
            </div>
          </motion.form>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
