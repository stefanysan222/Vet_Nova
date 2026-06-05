"use client";

import type { FormEvent } from "react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, Lock, Mail, UserCircle } from "lucide-react";
import Button from "../Button";
import GoogleAuthButton from "./GoogleAuthButton";
import { registerUser, loginOrRegisterGoogle, setToken } from "../../../lib/auth";

const initialState = {
  name: "",
  email: "",
  password: "",
  confirmPassword: "",
  acceptTerms: false,
};

export default function RegisterForm() {
  const [formData, setFormData] = useState(initialState);
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const router = useRouter();

  const handleChange = (field: string, value: string | boolean) => {
    setFormData((current) => ({ ...current, [field]: value }));
    setErrors((current) => ({ ...current, [field]: "" }));
  };

  const validate = () => {
    const nextErrors: Record<string, string> = {};
    if (!formData.name.trim()) nextErrors.name = "El nombre completo es obligatorio.";
    if (!formData.email.trim()) {
      nextErrors.email = "El correo es obligatorio.";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      nextErrors.email = "Ingresa un correo válido.";
    }
    if (!formData.password) {
      nextErrors.password = "La contraseña es obligatoria.";
    } else if (formData.password.length < 8) {
      nextErrors.password = "La contraseña debe tener al menos 8 caracteres.";
    }
    if (!formData.confirmPassword) {
      nextErrors.confirmPassword = "Confirma tu contraseña.";
    } else if (formData.confirmPassword !== formData.password) {
      nextErrors.confirmPassword = "Las contraseñas no coinciden.";
    }
    if (!formData.acceptTerms) nextErrors.acceptTerms = "Debes aceptar los términos.";
    return nextErrors;
  };

  const getDashboardRoute = (role: string) => {
    if (role === "Administrador") return "/admin";
    if (role === "Veterinario") return "/veterinario";

    return "/cliente";
  };

  const handleGoogleSuccess = async (profile: { name: string; email: string; picture?: string }) => {
    setLoading(true);
    setSubmitError(null);
    const result = await loginOrRegisterGoogle(profile);
    setLoading(false);
    if (result.error) {
      setSubmitError(result.error);
      return;
    }
    if (result.token && result.user) {
      setToken(result.token);
      router.push(getDashboardRoute(result.user.role));
    }
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const nextErrors = validate();
    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      return;
    }

    setLoading(true);
    setSubmitError(null);
    const result = await registerUser({
      nombre: formData.name,
      email: formData.email,
      password: formData.password,
      rol: "Cliente",
    });
    setLoading(false);

    if (result.error) {
      setSubmitError(result.error);
      return;
    }

    setErrors({});
    if (result.token && result.user) {
      setToken(result.token);
      router.push(getDashboardRoute(result.user.role));
    }
  };

  const inputBase =
    "w-full rounded-xl border border-surface-200 bg-white py-3 text-sm text-surface-900 outline-none transition placeholder:text-surface-400 focus:border-brand-500 focus:ring-2 focus:ring-brand-100 dark:border-surface-700 dark:bg-surface-900 dark:text-white";

  const passwordStrength = (() => {
    const p = formData.password;
    if (!p) return null;
    let score = 0;
    if (p.length >= 8)  score++;
    if (p.length >= 12) score++;
    if (/[A-Z]/.test(p)) score++;
    if (/[0-9]/.test(p)) score++;
    if (/[^A-Za-z0-9]/.test(p)) score++;
    if (score <= 1) return { level: "Débil",   color: "bg-red-500",    width: "w-1/4",  text: "text-red-600"    };
    if (score <= 3) return { level: "Media",   color: "bg-amber-500",  width: "w-2/4",  text: "text-amber-600"  };
    return               { level: "Fuerte",   color: "bg-emerald-500", width: "w-full", text: "text-emerald-600" };
  })();

  return (
    <form onSubmit={handleSubmit} className="space-y-4" noValidate>
      <GoogleAuthButton label="Continuar con Google" onSuccess={handleGoogleSuccess} />

      <div className="relative flex items-center gap-3 text-xs text-surface-400">
        <span className="h-px flex-1 bg-surface-200 dark:bg-surface-700" />
        o crear cuenta con correo
        <span className="h-px flex-1 bg-surface-200 dark:bg-surface-700" />
      </div>

      {submitError && (
        <div className="rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-700">
          {submitError}
        </div>
      )}

      {/* Nombre */}
      <div className="space-y-1.5">
        <label className="block text-sm font-medium text-surface-700" htmlFor="name">Nombre completo</label>
        <div className="relative">
          <UserCircle className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-surface-400" />
          <input id="name" type="text" value={formData.name}
            onChange={(e) => handleChange("name", e.target.value)}
            className={`${inputBase} pl-10 pr-4`} placeholder="Tu nombre completo" />
        </div>
        {errors.name && <p className="text-xs text-red-600">{errors.name}</p>}
      </div>

      {/* Email */}
      <div className="space-y-1.5">
        <label className="block text-sm font-medium text-surface-700" htmlFor="email">Correo electrónico</label>
        <div className="relative">
          <Mail className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-surface-400" />
          <input id="email" type="email" value={formData.email}
            onChange={(e) => handleChange("email", e.target.value)}
            className={`${inputBase} pl-10 pr-4`} placeholder="tucorreo@ejemplo.com" />
        </div>
        {errors.email && <p className="text-xs text-red-600">{errors.email}</p>}
      </div>

      {/* Passwords */}
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-1.5">
          <label className="block text-sm font-medium text-surface-700" htmlFor="password">Contraseña</label>
          <div className="relative">
            <Lock className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-surface-400" />
            <input id="password" type={showPassword ? "text" : "password"} value={formData.password}
              onChange={(e) => handleChange("password", e.target.value)}
              className={`${inputBase} pl-10 pr-10`} placeholder="••••••••" />
            <button type="button" onClick={() => setShowPassword((c) => !c)}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-surface-400 hover:text-surface-700">
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
          {passwordStrength && (
            <div className="mt-1.5">
              <div className="h-1.5 w-full overflow-hidden rounded-full bg-surface-100 dark:bg-surface-800">
                <div className={`h-full rounded-full transition-all duration-300 ${passwordStrength.color} ${passwordStrength.width}`} />
              </div>
              <p className={`mt-1 text-[11px] font-medium ${passwordStrength.text}`}>
                Contraseña {passwordStrength.level}
              </p>
            </div>
          )}
          {errors.password && <p className="text-xs text-red-600">{errors.password}</p>}
        </div>

        <div className="space-y-1.5">
          <label className="block text-sm font-medium text-surface-700" htmlFor="confirmPassword">Confirmar</label>
          <div className="relative">
            <input id="confirmPassword" type={showPassword ? "text" : "password"} value={formData.confirmPassword}
              onChange={(e) => handleChange("confirmPassword", e.target.value)}
              className={`${inputBase} pl-4 pr-10`} placeholder="••••••••" />
          </div>
          {errors.confirmPassword && <p className="text-xs text-red-600">{errors.confirmPassword}</p>}
        </div>
      </div>

      {/* Términos */}
      <label className="flex items-start gap-2.5 text-sm text-surface-600">
        <input type="checkbox" checked={formData.acceptTerms}
          onChange={(e) => handleChange("acceptTerms", e.target.checked)}
          className="mt-0.5 h-4 w-4 rounded border-surface-300 text-brand-600 focus:ring-brand-500" />
        Acepto los términos y condiciones del servicio
      </label>
      {errors.acceptTerms && <p className="text-xs text-red-600">{errors.acceptTerms}</p>}

      <Button type="submit" disabled={loading} className="w-full justify-center py-3">
        {loading ? "Creando cuenta..." : "Crear cuenta"}
      </Button>

      <p className="text-center text-sm text-surface-500">
        ¿Ya tienes cuenta?{" "}
        <a href="/login" className="font-semibold text-brand-600 transition hover:text-brand-700">
          Iniciar sesión
        </a>
      </p>
    </form>
  );
}
