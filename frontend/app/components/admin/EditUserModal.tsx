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

const inputClass = "form-input";

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
          className="fixed inset-0 z-[100] flex items-center justify-center bg-surface-900/50 px-4 backdrop-blur-sm"
          onClick={handleClose}
        >
          <motion.form
            initial={{ opacity: 0, scale: 0.98, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.98, y: 12 }}
            transition={{ duration: 0.18 }}
            onClick={(e) => e.stopPropagation()}
            onSubmit={handleSubmit}
            className="w-full max-w-2xl space-y-4 rounded-3xl border border-surface-200/60 bg-white p-6 shadow-modal dark:border-surface-700 dark:bg-surface-900"
          >
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
                  Editar usuario
                </h3>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  Los cambios se guardarán en la base de datos.
                </p>
              </div>
              <button
                type="button"
                onClick={handleClose}
                className="rounded-full p-2 transition hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <X className="h-5 w-5 text-slate-600 dark:text-slate-300" />
              </button>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="form-label">Nombre completo</label>
                <input
                  name="nombre"
                  value={form.nombre}
                  onChange={handleChange}
                  className={inputClass}
                  required
                />
              </div>
              <div>
                <label className="form-label">Correo</label>
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
              <label className="form-label">Rol</label>
              <select name="rol" value={form.rol} onChange={handleChange} className={inputClass}>
                <option value="Veterinario">Veterinario</option>
                <option value="Cliente">Cliente</option>
              </select>
            </div>

            {error && (
              <div className="dark:bg-danger-950/30 rounded-xl border border-danger-200 bg-danger-50 px-4 py-3 text-sm text-danger-700 dark:border-danger-900 dark:text-danger-400">
                {error}
              </div>
            )}

            <div className="flex justify-end gap-3 border-t border-surface-100 pt-4 dark:border-surface-800">
              <button
                type="button"
                onClick={handleClose}
                className="rounded-xl border border-surface-200 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-surface-100 dark:border-surface-700 dark:text-slate-300 dark:hover:bg-surface-800"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={loading}
                className="rounded-xl bg-brand-600 px-5 py-2 text-sm font-semibold text-white transition hover:bg-brand-700 disabled:opacity-60"
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
