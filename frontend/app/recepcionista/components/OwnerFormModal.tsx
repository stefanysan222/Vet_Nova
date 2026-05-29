"use client";

import { useEffect, useState } from "react";
import { CheckCircle2, X } from "lucide-react";
import type { Owner } from "../../../lib/recepcionista/types";

interface OwnerFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (owner: Owner) => void;
  initialOwner?: Owner;
}

const initialState = {
  name: "",
  email: "",
  phone: "",
  address: "",
};

function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
}

export default function OwnerFormModal({
  isOpen,
  onClose,
  onSave,
  initialOwner,
}: OwnerFormModalProps) {
  const [formState, setFormState] = useState(initialState);
  const [error, setError] = useState("");

  useEffect(() => {
    if (initialOwner) {
      setFormState({
        name: initialOwner.name,
        email: initialOwner.email,
        phone: initialOwner.phone,
        address: initialOwner.address,
      });
      setError("");
      return;
    }

    setFormState(initialState);
    setError("");
  }, [initialOwner, isOpen]);

  if (!isOpen) {
    return null;
  }

  const handleChange = (field: keyof typeof formState, value: string) => {
    setFormState((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = () => {
    if (!formState.name.trim() || !formState.email.trim()) {
      setError("Nombre y correo son obligatorios.");
      return;
    }

    if (!isValidEmail(formState.email)) {
      setError("Ingresa un correo válido.");
      return;
    }

    const owner: Owner = {
      id: initialOwner?.id ?? `o-${Date.now()}`,
      name: formState.name.trim(),
      email: formState.email.trim().toLowerCase(),
      phone: formState.phone.trim(),
      address: formState.address.trim(),
    };

    onSave(owner);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 px-4 py-6">
      <div className="w-full max-w-2xl rounded-[32px] bg-white p-6 shadow-2xl dark:bg-slate-950">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.28em] text-slate-500 dark:text-slate-400">
              {initialOwner ? "Editar propietario" : "Registrar propietario"}
            </p>
            <h2 className="mt-2 text-2xl font-semibold text-slate-900 dark:text-white">
              {initialOwner ? "Actualizar datos" : "Nuevo propietario"}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-2xl border border-slate-200 bg-slate-50 p-3 text-slate-700 transition hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
            aria-label="Cerrar modal"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          <label className="space-y-2 text-sm text-slate-700 dark:text-slate-200">
            Nombre completo
            <input
              value={formState.name}
              onChange={(event) => handleChange("name", event.target.value)}
              className="w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
              placeholder="Claudia Ríos"
            />
          </label>

          <label className="space-y-2 text-sm text-slate-700 dark:text-slate-200">
            Correo electrónico
            <input
              value={formState.email}
              onChange={(event) => handleChange("email", event.target.value)}
              className="w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
              placeholder="claudia.rios@mail.com"
            />
          </label>

          <label className="space-y-2 text-sm text-slate-700 dark:text-slate-200">
            Teléfono
            <input
              value={formState.phone}
              onChange={(event) => handleChange("phone", event.target.value)}
              className="w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
              placeholder="+57 300 123 4567"
            />
          </label>

          <label className="space-y-2 text-sm text-slate-700 dark:text-slate-200">
            Dirección
            <input
              value={formState.address}
              onChange={(event) => handleChange("address", event.target.value)}
              className="w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
              placeholder="Carrera 10 #7-89"
            />
          </label>
        </div>

        {error ? (
          <div className="mt-4 rounded-3xl bg-rose-50 px-4 py-3 text-sm text-rose-700 dark:bg-rose-950/40 dark:text-rose-200">
            {error}
          </div>
        ) : null}

        <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-end">
          <button
            type="button"
            onClick={onClose}
            className="inline-flex items-center justify-center rounded-3xl border border-slate-200 bg-slate-50 px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
          >
            Cancelar
          </button>

          <button
            type="button"
            onClick={handleSubmit}
            className="inline-flex items-center justify-center gap-2 rounded-3xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-700"
          >
            <CheckCircle2 className="h-4 w-4" />
            Guardar propietario
          </button>
        </div>
      </div>
    </div>
  );
}
