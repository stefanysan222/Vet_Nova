"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import { createUsuario } from "../../../lib/api/usuarios";

interface RegisterUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreated?: () => void;
}

const inputClass = "form-input";

export default function RegisterUserModal({ isOpen, onClose, onCreated }: RegisterUserModalProps) {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    role: "Veterinario",
    password: "",
    confirmPassword: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setError("");
  };

  const handleClose = () => {
    setFormData({ name: "", email: "", role: "Veterinario", password: "", confirmPassword: "" });
    setError("");
    onClose();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      setError("Las contraseñas no coinciden.");
      return;
    }
    if (formData.password.length < 6) {
      setError("La contraseña debe tener al menos 6 caracteres.");
      return;
    }

    setLoading(true);
    setError("");
    try {
      await createUsuario({
        nombre: formData.name.trim(),
        email: formData.email.trim().toLowerCase(),
        password: formData.password,
        rol: formData.role,
      });
      onCreated?.();
      handleClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al registrar el usuario.");
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
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: "spring", bounce: 0, duration: 0.3 }}
            className="relative w-full max-w-2xl rounded-3xl border border-surface-200/60 bg-white shadow-modal dark:border-surface-700 dark:bg-surface-900"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-surface-100 px-6 py-4 dark:border-surface-800">
              <div>
                <h2 className="text-2xl font-semibold text-slate-900 dark:text-white">
                  Registrar Nuevo Usuario
                </h2>
                <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                  Crea una cuenta para un nuevo miembro del equipo
                </p>
              </div>
              <button
                onClick={handleClose}
                className="rounded-full p-2 transition hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <X className="h-6 w-6 text-slate-400 dark:text-slate-500" />
              </button>
            </div>

            <form
              onSubmit={handleSubmit}
              className="max-h-[70vh] space-y-6 overflow-y-auto px-6 py-5"
            >
              <div>
                <label className="form-label">Nombre Completo</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Juan Pérez García"
                  className={inputClass}
                  required
                />
              </div>

              <div>
                <label className="form-label">Correo Electrónico</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="juan@vetnova.com"
                  className={inputClass}
                  required
                />
              </div>

              <div>
                <label className="form-label">Rol</label>
                <select
                  name="role"
                  value={formData.role}
                  onChange={handleChange}
                  className={inputClass}
                  required
                >
                  <option value="Veterinario">Veterinario</option>
                  <option value="Cliente">Cliente</option>
                </select>
              </div>

              <div className="grid gap-6 sm:grid-cols-2">
                <div>
                  <label className="form-label">Contraseña</label>
                  <input
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="••••••••"
                    className={inputClass}
                    required
                  />
                </div>
                <div>
                  <label className="form-label">Confirmar Contraseña</label>
                  <input
                    type="password"
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    placeholder="••••••••"
                    className={inputClass}
                    required
                  />
                </div>
              </div>

              {error && (
                <div className="dark:bg-danger-950/30 rounded-xl border border-danger-200 bg-danger-50 px-4 py-3 text-sm text-danger-700 dark:border-danger-900 dark:text-danger-400">
                  {error}
                </div>
              )}

              <div className="flex gap-4 border-t border-surface-100 pt-6 dark:border-surface-800">
                <button
                  type="button"
                  onClick={handleClose}
                  className="flex-1 rounded-xl border border-surface-200 px-4 py-3 text-sm font-semibold text-slate-700 transition hover:bg-surface-100 dark:border-surface-700 dark:text-slate-300 dark:hover:bg-surface-800"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 rounded-xl bg-brand-600 px-4 py-3 text-sm font-semibold text-white shadow-brand-sm transition hover:bg-brand-700 disabled:opacity-60"
                >
                  {loading ? "Registrando..." : "Registrar Usuario"}
                </button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
