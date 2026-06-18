"use client";

import { useEffect, useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { updateUsuario } from "../../../lib/api/usuarios";
import { useToast } from "../../components/ui/Toast";

const cardClass = "rounded-[14px] border-[0.5px] border-[#E4DFF0] bg-white";

const inputClass =
  "w-full rounded-[9px] border-[0.5px] border-[#E4DFF0] bg-[#F7F6FA] px-3 py-[9px] text-sm text-slate-900 outline-none transition focus:border-[#7C3AED] focus:bg-white";

const labelClass =
  "mb-1.5 block text-[10px] font-semibold uppercase tracking-[0.05em] text-[#555068]";

const btnPrimaryClass =
  "inline-flex items-center justify-center rounded-[9px] bg-[#7C3AED] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[#6D28D9] disabled:opacity-50";

const btnSecondaryClass =
  "inline-flex items-center justify-center rounded-[9px] border-[0.5px] border-[#E4DFF0] bg-transparent px-5 py-2.5 text-sm font-semibold text-[#555068] transition hover:bg-[#F7F6FA]";

function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0][0]?.toUpperCase() ?? "?";
  return (parts[0][0] + parts[1][0]).toUpperCase();
}

export default function ConfiguracionPage() {
  const { user } = useAuth();
  const { success, error } = useToast();

  const [nombre, setNombre] = useState("");
  const [email, setEmail] = useState("");
  const [savedNombre, setSavedNombre] = useState("");
  const [savedEmail, setSavedEmail] = useState("");

  useEffect(() => {
    if (!user) return;
    // Sincroniza el formulario cuando llega el perfil real desde /auth/me
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setNombre(user.name);
    setEmail(user.email);
    setSavedNombre(user.name);
    setSavedEmail(user.email);
  }, [user]);

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const [savingProfile, setSavingProfile] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nombre.trim() || !email.trim() || !user) return;
    setSavingProfile(true);
    try {
      await updateUsuario(user.id, { nombre: nombre.trim(), email: email.trim() });
      setSavedNombre(nombre.trim());
      setSavedEmail(email.trim());
      success(
        "Perfil actualizado",
        "Tus datos se actualizaron correctamente. Vuelve a iniciar sesión para ver los cambios reflejados.",
      );
    } catch (err) {
      error(
        "Error al actualizar",
        err instanceof Error ? err.message : "No se pudo actualizar el perfil.",
      );
    } finally {
      setSavingProfile(false);
    }
  };

  const handleCancelProfile = () => {
    setNombre(savedNombre);
    setEmail(savedEmail);
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

  const handleCancelPassword = () => {
    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
  };

  const profileUnchanged = nombre.trim() === savedNombre && email.trim() === savedEmail;

  return (
    <div className="admin-page bg-[#F7F6FA] dark:bg-transparent">
      <div className="mb-6">
        <p className="text-eyebrow">Configuración</p>
        <h1 className="text-page-title mt-2">Perfil de cuenta</h1>
        <p className="text-subtitle mt-1">
          Actualiza tu nombre de usuario, correo electrónico y contraseña.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-2 lg:grid-cols-4 lg:grid-rows-5">
        {/* Vista previa del perfil */}
        <div className={`${cardClass} p-6 lg:col-span-2 lg:row-span-5`}>
          <div className="flex flex-col items-center text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[#7C3AED] text-xl font-semibold text-white">
              {getInitials(savedNombre || "?")}
            </div>
            <h2 className="mt-4 text-base font-semibold text-slate-900">{savedNombre}</h2>
            <p className="mt-1 text-sm text-[#555068]">{user?.role ?? "—"}</p>
            <p className="mt-0.5 text-xs text-[#555068]">{user?.clinicaNombre ?? "—"}</p>
          </div>

          <div className="mt-6 space-y-3 border-t border-[#E4DFF0] pt-5">
            <div className="flex items-center justify-between gap-4">
              <span className={labelClass + " mb-0"}>Nombre</span>
              <span className="text-sm font-medium text-slate-900">{savedNombre}</span>
            </div>
            <div className="flex items-center justify-between gap-4">
              <span className={labelClass + " mb-0"}>Correo</span>
              <span className="text-sm font-medium text-slate-900">{savedEmail}</span>
            </div>
            <div className="flex items-center justify-between gap-4">
              <span className={labelClass + " mb-0"}>Clínica</span>
              <span className="text-sm font-medium text-slate-900">
                {user?.clinicaNombre ?? "—"}
              </span>
            </div>
          </div>
        </div>

        {/* Formulario de actualización de datos */}
        <form
          onSubmit={handleSaveProfile}
          className={`${cardClass} p-6 lg:col-span-2 lg:col-start-3 lg:row-span-3`}
        >
          <h2 className="mb-5 text-sm font-semibold text-slate-900">Información personal</h2>

          <div>
            <label className={labelClass}>Nombre completo</label>
            <input
              type="text"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              placeholder="Tu nombre completo"
              required
              className={inputClass}
            />
          </div>

          <div className="mt-4">
            <label className={labelClass}>Correo electrónico</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="correo@ejemplo.com"
              required
              className={inputClass}
            />
          </div>

          <div className="mt-6 flex justify-end gap-3">
            <button type="button" onClick={handleCancelProfile} className={btnSecondaryClass}>
              Cancelar
            </button>
            <button
              type="submit"
              disabled={savingProfile || !nombre.trim() || !email.trim() || profileUnchanged}
              className={btnPrimaryClass}
            >
              {savingProfile ? "Guardando..." : "Guardar cambios"}
            </button>
          </div>
        </form>

        {/* Formulario de cambio de contraseña */}
        <form
          onSubmit={handleSavePassword}
          className={`${cardClass} p-6 lg:col-span-2 lg:col-start-3 lg:row-span-2 lg:row-start-4`}
        >
          <h2 className="mb-5 text-sm font-semibold text-slate-900">Cambiar contraseña</h2>

          <div className="grid gap-4 sm:grid-cols-3">
            <div>
              <label className={labelClass}>Contraseña actual</label>
              <div className="relative">
                <input
                  type={showCurrent ? "text" : "password"}
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="••••••••"
                  autoComplete="current-password"
                  className={inputClass + " pr-10"}
                />
                <button
                  type="button"
                  onClick={() => setShowCurrent(!showCurrent)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#555068] hover:text-slate-700"
                >
                  {showCurrent ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <div>
              <label className={labelClass}>Nueva contraseña</label>
              <div className="relative">
                <input
                  type={showNew ? "text" : "password"}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Mín. 8 caracteres"
                  autoComplete="new-password"
                  className={inputClass + " pr-10"}
                />
                <button
                  type="button"
                  onClick={() => setShowNew(!showNew)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#555068] hover:text-slate-700"
                >
                  {showNew ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <div>
              <label className={labelClass}>Confirmar contraseña</label>
              <div className="relative">
                <input
                  type={showConfirm ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Repite la contraseña"
                  autoComplete="new-password"
                  className={inputClass + " pr-10"}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirm(!showConfirm)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#555068] hover:text-slate-700"
                >
                  {showConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>
          </div>

          {newPassword && confirmPassword && (
            <p
              className={`mt-3 text-xs font-medium ${newPassword === confirmPassword ? "text-success-600" : "text-danger-600"}`}
            >
              {newPassword === confirmPassword
                ? "✓ Las contraseñas coinciden"
                : "✗ Las contraseñas no coinciden"}
            </p>
          )}

          <div className="mt-6 flex justify-end gap-3">
            <button type="button" onClick={handleCancelPassword} className={btnSecondaryClass}>
              Cancelar
            </button>
            <button
              type="submit"
              disabled={savingPassword || !newPassword || !confirmPassword}
              className={btnPrimaryClass}
            >
              {savingPassword ? "Actualizando..." : "Actualizar contraseña"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
