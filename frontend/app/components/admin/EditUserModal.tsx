"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import { updateUsuario } from "../../../lib/api/usuarios";

interface EditUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUpdated?: () => void;
  user?: { id: number; name: string; email: string; role: string } | null;
}

const inputClass =
  "w-full rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-900 outline-none transition focus:border-brand-500 focus:ring-2 focus:ring-brand-100";

export default function EditUserModal({ isOpen, onClose, onUpdated, user }: EditUserModalProps) {
  const [form, setForm] = useState({ nombre: "", email: "", rol: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Sincronizar el formulario cuando cambia el usuario a editar (modal reutilizable)
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (user) setForm({ nombre: user.name, email: user.email, rol: user.role });
  }, [user]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setError("");
  };

  const handleClose = () => {
    setError("");
    onClose();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setLoading(true);
    setError("");
    try {
      await updateUsuario(user.id, {
        nombre: form.nombre.trim(),
        email: form.email.trim().toLowerCase(),
        rol: form.rol,
      });
      onUpdated?.();
      handleClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al actualizar el usuario.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
          onClick={handleClose}
        >
          <motion.form
            initial={{ opacity: 0, scale: 0.98, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.98, y: 12 }}
            transition={{ duration: 0.18 }}
            onClick={(e) => e.stopPropagation()}
            onSubmit={handleSubmit}
            className="w-full max-w-2xl space-y-4 rounded-2xl bg-white p-6 shadow-xl"
          >
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-slate-900">Editar usuario</h3>
                <p className="text-sm text-slate-500">
                  Los cambios se guardarán en la base de datos.
                </p>
              </div>
              <button
                type="button"
                onClick={handleClose}
                className="rounded-full p-2 transition hover:bg-slate-100"
              >
                <X className="h-5 w-5 text-slate-600" />
              </button>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">
                  Nombre completo
                </label>
                <input
                  name="nombre"
                  value={form.nombre}
                  onChange={handleChange}
                  className={inputClass}
                  required
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">Correo</label>
                <input
                  name="email"
                  type="email"
                  value={form.email}
                  onChange={handleChange}
                  className={inputClass}
                  required
                />
              </div>
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">Rol</label>
              <select name="rol" value={form.rol} onChange={handleChange} className={inputClass}>
                <option value="Veterinario">Veterinario</option>
                <option value="Cliente">Cliente</option>
              </select>
            </div>

            {error && (
              <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                {error}
              </div>
            )}

            <div className="flex justify-end gap-3 border-t border-slate-200 pt-4">
              <button
                type="button"
                onClick={handleClose}
                className="rounded-2xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={loading}
                className="rounded-2xl bg-brand-600 px-5 py-2 text-sm font-semibold text-white transition hover:bg-brand-700 disabled:opacity-60"
              >
                {loading ? "Guardando..." : "Guardar cambios"}
              </button>
            </div>
          </motion.form>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
