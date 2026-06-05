"use client";

import type { FormEvent } from "react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, Lock, Mail, UserCircle } from "lucide-react";
import { motion } from "framer-motion";
import GoogleAuthButton from "./GoogleAuthButton";
import { registerUser, loginOrRegisterGoogle, setToken } from "../../../lib/auth";

const initialState = { name: "", email: "", password: "", confirmPassword: "", acceptTerms: false };

export default function RegisterForm() {
  const [formData, setFormData] = useState(initialState);
  const [showPassword, setShowPassword] = useState(false);
  const [focused, setFocused] = useState<string | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleChange = (field: string, value: string | boolean) => {
    setFormData((c) => ({ ...c, [field]: value }));
    setErrors((c) => ({ ...c, [field]: "" }));
  };

  const validate = () => {
    const e: Record<string, string> = {};
    if (!formData.name.trim()) e.name = "El nombre completo es obligatorio.";
    if (!formData.email.trim()) e.email = "El correo es obligatorio.";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) e.email = "Ingresa un correo válido.";
    if (!formData.password) e.password = "La contraseña es obligatoria.";
    else if (formData.password.length < 8) e.password = "Mínimo 8 caracteres.";
    if (!formData.confirmPassword) e.confirmPassword = "Confirma tu contraseña.";
    else if (formData.confirmPassword !== formData.password) e.confirmPassword = "Las contraseñas no coinciden.";
    if (!formData.acceptTerms) e.acceptTerms = "Debes aceptar los términos.";
    return e;
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
    if (result.error) { setSubmitError(result.error); return; }
    if (result.token && result.user) { setToken(result.token); router.push(getDashboardRoute(result.user.role)); }
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const nextErrors = validate();
    if (Object.keys(nextErrors).length > 0) { setErrors(nextErrors); return; }
    setLoading(true);
    setSubmitError(null);
    const result = await registerUser({ nombre: formData.name, email: formData.email, password: formData.password, rol: "Cliente" });
    setLoading(false);
    if (result.error) { setSubmitError(result.error); return; }
    setErrors({});
    if (result.token && result.user) { setToken(result.token); router.push(getDashboardRoute(result.user.role)); }
  };

  const inputBase = (field: string) =>
    `w-full rounded-xl border py-3 text-sm text-slate-900 outline-none transition-all duration-200 placeholder:text-slate-400 dark:text-white dark:placeholder-slate-500 ${
      errors[field]
        ? "border-red-400 bg-red-50 dark:border-red-500 dark:bg-red-950/30"
        : focused === field
        ? "border-blue-400 bg-blue-50/50 ring-2 ring-blue-100 dark:border-blue-500 dark:bg-blue-950/20 dark:ring-blue-900/40"
        : "border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-800/60"
    }`;

  const passwordStrength = (() => {
    const p = formData.password;
    if (!p) return null;
    let score = 0;
    if (p.length >= 8) score++;
    if (p.length >= 12) score++;
    if (/[A-Z]/.test(p)) score++;
    if (/[0-9]/.test(p)) score++;
    if (/[^A-Za-z0-9]/.test(p)) score++;
    if (score <= 1) return { level: "Débil", color: "bg-red-500", width: "w-1/4", text: "text-red-600 dark:text-red-400" };
    if (score <= 3) return { level: "Media", color: "bg-amber-500", width: "w-2/4", text: "text-amber-600 dark:text-amber-400" };
    return { level: "Fuerte", color: "bg-emerald-500", width: "w-full", text: "text-emerald-600 dark:text-emerald-400" };
  })();

  return (
    <form onSubmit={handleSubmit} className="space-y-4" noValidate>
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
        <GoogleAuthButton label="Continuar con Google" onSuccess={handleGoogleSuccess} />
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.15 }}
        className="relative flex items-center gap-3 text-xs text-slate-400"
      >
        <span className="h-px flex-1 bg-slate-200 dark:bg-slate-700" />
        o crear cuenta con correo
        <span className="h-px flex-1 bg-slate-200 dark:bg-slate-700" />
      </motion.div>

      {submitError && (
        <motion.div
          initial={{ opacity: 0, y: -6 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900 dark:bg-red-950 dark:text-red-400"
        >
          {submitError}
        </motion.div>
      )}

      {/* Nombre */}
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="space-y-1.5">
        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300" htmlFor="name">Nombre completo</label>
        <motion.div animate={focused === "name" ? { scale: 1.01 } : { scale: 1 }} transition={{ duration: 0.15 }} className="relative">
          <UserCircle className={`pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 transition-colors ${focused === "name" ? "text-blue-500" : "text-slate-400"}`} />
          <input id="name" type="text" value={formData.name}
            onChange={(e) => handleChange("name", e.target.value)}
            onFocus={() => setFocused("name")} onBlur={() => setFocused(null)}
            className={`${inputBase("name")} pl-10 pr-4`} placeholder="Tu nombre completo" />
        </motion.div>
        {errors.name && <motion.p initial={{ opacity: 0, x: -4 }} animate={{ opacity: 1, x: 0 }} className="text-xs text-red-600 dark:text-red-400">{errors.name}</motion.p>}
      </motion.div>

      {/* Email */}
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }} className="space-y-1.5">
        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300" htmlFor="reg-email">Correo electrónico</label>
        <motion.div animate={focused === "email" ? { scale: 1.01 } : { scale: 1 }} transition={{ duration: 0.15 }} className="relative">
          <Mail className={`pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 transition-colors ${focused === "email" ? "text-blue-500" : "text-slate-400"}`} />
          <input id="reg-email" type="email" value={formData.email}
            onChange={(e) => handleChange("email", e.target.value)}
            onFocus={() => setFocused("email")} onBlur={() => setFocused(null)}
            className={`${inputBase("email")} pl-10 pr-4`} placeholder="tucorreo@ejemplo.com" />
        </motion.div>
        {errors.email && <motion.p initial={{ opacity: 0, x: -4 }} animate={{ opacity: 1, x: 0 }} className="text-xs text-red-600 dark:text-red-400">{errors.email}</motion.p>}
      </motion.div>

      {/* Passwords */}
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-1.5">
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300" htmlFor="reg-password">Contraseña</label>
          <motion.div animate={focused === "password" ? { scale: 1.01 } : { scale: 1 }} transition={{ duration: 0.15 }} className="relative">
            <Lock className={`pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 transition-colors ${focused === "password" ? "text-blue-500" : "text-slate-400"}`} />
            <input id="reg-password" type={showPassword ? "text" : "password"} value={formData.password}
              onChange={(e) => handleChange("password", e.target.value)}
              onFocus={() => setFocused("password")} onBlur={() => setFocused(null)}
              className={`${inputBase("password")} pl-10 pr-10`} placeholder="••••••••" />
            <motion.button type="button" whileTap={{ scale: 0.85 }} onClick={() => setShowPassword((c) => !c)}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200">
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </motion.button>
          </motion.div>
          {passwordStrength && (
            <div className="mt-1.5">
              <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-slate-700">
                <motion.div
                  className={`h-full rounded-full ${passwordStrength.color}`}
                  initial={{ width: 0 }}
                  animate={{ width: passwordStrength.width === "w-1/4" ? "25%" : passwordStrength.width === "w-2/4" ? "50%" : "100%" }}
                  transition={{ duration: 0.3 }}
                />
              </div>
              <p className={`mt-1 text-[11px] font-medium ${passwordStrength.text}`}>Contraseña {passwordStrength.level}</p>
            </div>
          )}
          {errors.password && <motion.p initial={{ opacity: 0, x: -4 }} animate={{ opacity: 1, x: 0 }} className="text-xs text-red-600 dark:text-red-400">{errors.password}</motion.p>}
        </div>

        <div className="space-y-1.5">
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300" htmlFor="confirmPassword">Confirmar</label>
          <motion.div animate={focused === "confirmPassword" ? { scale: 1.01 } : { scale: 1 }} transition={{ duration: 0.15 }} className="relative">
            <input id="confirmPassword" type={showPassword ? "text" : "password"} value={formData.confirmPassword}
              onChange={(e) => handleChange("confirmPassword", e.target.value)}
              onFocus={() => setFocused("confirmPassword")} onBlur={() => setFocused(null)}
              className={`${inputBase("confirmPassword")} pl-4 pr-4`} placeholder="••••••••" />
          </motion.div>
          {errors.confirmPassword && <motion.p initial={{ opacity: 0, x: -4 }} animate={{ opacity: 1, x: 0 }} className="text-xs text-red-600 dark:text-red-400">{errors.confirmPassword}</motion.p>}
        </div>
      </motion.div>

      {/* Términos */}
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }}>
        <label className="flex items-start gap-2.5 text-sm text-slate-600 dark:text-slate-400">
          <input type="checkbox" checked={formData.acceptTerms}
            onChange={(e) => handleChange("acceptTerms", e.target.checked)}
            className="mt-0.5 h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500" />
          Acepto los términos y condiciones del servicio
        </label>
        {errors.acceptTerms && <motion.p initial={{ opacity: 0, x: -4 }} animate={{ opacity: 1, x: 0 }} className="mt-1 text-xs text-red-600 dark:text-red-400">{errors.acceptTerms}</motion.p>}
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
        <motion.button
          type="submit"
          disabled={loading}
          whileHover={{ scale: loading ? 1 : 1.02 }}
          whileTap={{ scale: loading ? 1 : 0.97 }}
          className="w-full rounded-xl bg-blue-600 py-3 text-sm font-semibold text-white shadow-md transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-70 dark:bg-blue-600 dark:hover:bg-blue-500"
        >
          {loading ? (
            <span className="flex items-center justify-center gap-2">
              <motion.span
                animate={{ rotate: 360 }}
                transition={{ duration: 0.8, repeat: Infinity, ease: "linear" }}
                className="inline-block h-4 w-4 rounded-full border-2 border-white/30 border-t-white"
              />
              Creando cuenta...
            </span>
          ) : (
            "Crear cuenta"
          )}
        </motion.button>
      </motion.div>

      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.45 }}
        className="text-center text-sm text-slate-500 dark:text-slate-400"
      >
        ¿Ya tienes cuenta?{" "}
        <a href="/login" className="font-semibold text-blue-600 transition hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300">
          Iniciar sesión
        </a>
      </motion.p>
    </form>
  );
}
