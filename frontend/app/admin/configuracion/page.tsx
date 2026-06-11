"use client";

import { useEffect, useState } from "react";
import { User, Mail, Lock, Eye, EyeOff } from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { updateUsuario } from "../../../lib/api/usuarios";
import { useToast } from "../../components/ui/Toast";

const inputClass =
  "w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm text-slate-900 outline-none transition focus:border-brand-500 focus:ring-2 focus:ring-brand-100 dark:border-slate-700 dark:bg-slate-800 dark:text-white dark:placeholder-slate-500";

export default function ConfiguracionPage() {
  const { user } = useAuth();
  const { success, error } = useToast();

  const [nombre, setNombre] = useState("");
  const [email, setEmail] = useState("");

  useEffect(() => {
    if (!user) return;
    // Sincroniza el formulario cuando llega el perfil real desde /auth/me
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setNombre(user.name);
    setEmail(user.email);
  }, [user]);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const [savingNombre, setSavingNombre] = useState(false);
  const [savingEmail, setSavingEmail] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);

  const handleSaveNombre = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nombre.trim()) return;
    if (!user) return;
    setSavingNombre(true);
    try {
      await updateUsuario(user.id, { nombre: nombre.trim() });
      success(
        "Nombre actualizado",
        "El nombre de usuario se actualizó correctamente. Vuelve a iniciar sesión para ver los cambios reflejados.",
      );
    } catch (err) {
      error(
        "Error al actualizar",
        err instanceof Error ? err.message : "No se pudo actualizar el nombre.",
      );
    } finally {
      setSavingNombre(false);
    }
  };

  const handleSaveEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    if (!user) return;
    setSavingEmail(true);
    try {
      await updateUsuario(user.id, { email: email.trim() });
      success(
        "Correo actualizado",
        "El correo electrónico se actualizó correctamente. Vuelve a iniciar sesión para aplicar el cambio.",
      );
    } catch (err) {
      error(
        "Error al actualizar",
        err instanceof Error ? err.message : "No se pudo actualizar el correo.",
      );
    } finally {
      setSavingEmail(false);
    }
  };

  const handleSavePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentPassword) {
      error("Campo requerido", "Debes ingresar tu contraseña actual.");
      return;
    }
    if (!newPassword || !confirmPassword) return;
    if (newPassword.length < 8) {
      error("Contraseña muy corta", "La nueva contraseña debe tener al menos 8 caracteres.");
      return;
    }
    if (newPassword !== confirmPassword) {
      error(
        "Las contraseñas no coinciden",
        "Verifica que la nueva contraseña y la confirmación sean iguales.",
      );
      return;
    }
    if (!user) return;
    setSavingPassword(true);
    try {
      await updateUsuario(user.id, { password: newPassword, currentPassword });
      success(
        "Contraseña actualizada",
        "La contraseña se cambió correctamente. Usa la nueva contraseña en tu próximo inicio de sesión.",
      );
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err) {
      error(
        "Error al actualizar",
        err instanceof Error ? err.message : "No se pudo actualizar la contraseña.",
      );
    } finally {
      setSavingPassword(false);
    }
  };

  return (
    <div className="admin-page">
      <section className="admin-card-padded">
        {/* Header */}
        <div>
          <p className="text-eyebrow">Configuración</p>
          <h1 className="text-page-title mt-2">Perfil de cuenta</h1>
          <p className="text-subtitle mt-1">
            Actualiza tu nombre de usuario, correo electrónico y contraseña.
          </p>
        </div>

        <div className="mt-8 max-w-lg space-y-6">
          {/* Nombre de usuario */}
          <form
            onSubmit={handleSaveNombre}
            className="rounded-2xl border border-slate-200/70 bg-white p-5 shadow-xs dark:border-slate-700 dark:bg-slate-800/50"
          >
            <div className="mb-4 flex items-center gap-2">
              <User className="h-4 w-4 text-brand-600 dark:text-brand-400" />
              <h2 className="text-sm font-semibold text-slate-900 dark:text-white">
                Nombre de usuario
              </h2>
            </div>
            <input
              type="text"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              placeholder="Tu nombre completo"
              required
              className={inputClass}
            />
            <div className="mt-4 flex justify-end">
              <button
                type="submit"
                disabled={savingNombre || !nombre.trim() || nombre.trim() === user?.name}
                className="btn-primary disabled:opacity-50 disabled:hover:translate-y-0"
              >
                {savingNombre ? "Guardando..." : "Guardar nombre"}
              </button>
            </div>
          </form>

          {/* Correo electrónico */}
          <form
            onSubmit={handleSaveEmail}
            className="rounded-2xl border border-slate-200/70 bg-white p-5 shadow-xs dark:border-slate-700 dark:bg-slate-800/50"
          >
            <div className="mb-4 flex items-center gap-2">
              <Mail className="h-4 w-4 text-brand-600 dark:text-brand-400" />
              <h2 className="text-sm font-semibold text-slate-900 dark:text-white">
                Correo electrónico
              </h2>
            </div>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="correo@ejemplo.com"
              required
              className={inputClass}
            />
            <div className="mt-4 flex justify-end">
              <button
                type="submit"
                disabled={savingEmail || !email.trim() || email.trim() === user?.email}
                className="btn-primary disabled:opacity-50 disabled:hover:translate-y-0"
              >
                {savingEmail ? "Guardando..." : "Guardar correo"}
              </button>
            </div>
          </form>

          {/* Contraseña */}
          <form
            onSubmit={handleSavePassword}
            className="rounded-2xl border border-slate-200/70 bg-white p-5 shadow-xs dark:border-slate-700 dark:bg-slate-800/50"
          >
            <div className="mb-4 flex items-center gap-2">
              <Lock className="h-4 w-4 text-brand-600 dark:text-brand-400" />
              <h2 className="text-sm font-semibold text-slate-900 dark:text-white">Contraseña</h2>
            </div>
            <div className="space-y-3">
              <div>
                <label className="mb-1 block text-xs font-medium text-slate-500 dark:text-slate-400">
                  Contraseña actual
                </label>
                <input
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="••••••••"
                  autoComplete="current-password"
                  className={inputClass}
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-slate-500 dark:text-slate-400">
                  Nueva contraseña
                </label>
                <div className="relative">
                  <input
                    type={showNew ? "text" : "password"}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Mínimo 8 caracteres"
                    className={inputClass + " pr-10"}
                  />
                  <button
                    type="button"
                    onClick={() => setShowNew(!showNew)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                  >
                    {showNew ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-slate-500 dark:text-slate-400">
                  Confirmar contraseña
                </label>
                <div className="relative">
                  <input
                    type={showConfirm ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Repite la nueva contraseña"
                    className={inputClass + " pr-10"}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirm(!showConfirm)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                  >
                    {showConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              {/* Indicador de coincidencia */}
              {newPassword && confirmPassword && (
                <p
                  className={`text-xs font-medium ${newPassword === confirmPassword ? "text-success-600 dark:text-success-400" : "text-danger-600 dark:text-danger-400"}`}
                >
                  {newPassword === confirmPassword
                    ? "✓ Las contraseñas coinciden"
                    : "✗ Las contraseñas no coinciden"}
                </p>
              )}
            </div>
            <div className="mt-4 flex justify-end">
              <button
                type="submit"
                disabled={savingPassword || !newPassword || !confirmPassword}
                className="btn-primary disabled:opacity-50 disabled:hover:translate-y-0"
              >
                {savingPassword ? "Guardando..." : "Cambiar contraseña"}
              </button>
            </div>
          </form>

          {/* Aviso re-login */}
          <p className="text-xs text-slate-400 dark:text-slate-500">
            Los cambios de nombre y correo se aplican en la próxima sesión iniciada.
          </p>
        </div>
      </section>
    </div>
  );
}
