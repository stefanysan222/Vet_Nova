"use client";

import type { FormEvent } from "react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, Lock, Mail } from "lucide-react";
import { motion } from "framer-motion";
import GoogleAuthButton from "./GoogleAuthButton";
import { loginUser, loginOrRegisterGoogle, setToken } from "../../../lib/auth";

const initialState = { email: "", password: "", remember: false };

const inputVariants = {
  rest: { scale: 1 },
  focus: { scale: 1.01, transition: { duration: 0.15 } },
};

export default function LoginForm() {
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
    if (!formData.email.trim()) e.email = "El correo es obligatorio.";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) e.email = "Ingresa un correo válido.";
    if (!formData.password) e.password = "La contraseña es obligatoria.";
    else if (formData.password.length < 6) e.password = "Mínimo 6 caracteres.";
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
    const result = await loginUser(formData.email, formData.password);
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

  return (
    <form onSubmit={handleSubmit} className="space-y-5" noValidate>
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
        o con correo electrónico
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

      {/* Email */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="space-y-1.5"
      >
        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300" htmlFor="email">
          Correo electrónico
        </label>
        <motion.div variants={inputVariants} animate={focused === "email" ? "focus" : "rest"} className="relative">
          <Mail className={`pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 transition-colors ${focused === "email" ? "text-blue-500" : "text-slate-400"}`} />
          <input
            id="email"
            type="email"
            value={formData.email}
            onChange={(e) => handleChange("email", e.target.value)}
            onFocus={() => setFocused("email")}
            onBlur={() => setFocused(null)}
            className={`${inputBase("email")} pl-10 pr-4`}
            placeholder="tucorreo@ejemplo.com"
          />
        </motion.div>
        {errors.email && (
          <motion.p initial={{ opacity: 0, x: -4 }} animate={{ opacity: 1, x: 0 }} className="text-xs text-red-600 dark:text-red-400">
            {errors.email}
          </motion.p>
        )}
      </motion.div>

      {/* Password */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.25 }}
        className="space-y-1.5"
      >
        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300" htmlFor="password">
          Contraseña
        </label>
        <motion.div variants={inputVariants} animate={focused === "password" ? "focus" : "rest"} className="relative">
          <Lock className={`pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 transition-colors ${focused === "password" ? "text-blue-500" : "text-slate-400"}`} />
          <input
            id="password"
            type={showPassword ? "text" : "password"}
            value={formData.password}
            onChange={(e) => handleChange("password", e.target.value)}
            onFocus={() => setFocused("password")}
            onBlur={() => setFocused(null)}
            className={`${inputBase("password")} pl-10 pr-10`}
            placeholder="••••••••"
          />
          <motion.button
            type="button"
            whileTap={{ scale: 0.85 }}
            onClick={() => setShowPassword((c) => !c)}
            className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 transition hover:text-slate-700 dark:hover:text-slate-200"
          >
            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </motion.button>
        </motion.div>
        {errors.password && (
          <motion.p initial={{ opacity: 0, x: -4 }} animate={{ opacity: 1, x: 0 }} className="text-xs text-red-600 dark:text-red-400">
            {errors.password}
          </motion.p>
        )}
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="flex items-center justify-between"
      >
        <label className="inline-flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
          <input
            type="checkbox"
            checked={formData.remember}
            onChange={(e) => handleChange("remember", e.target.checked)}
            className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
          />
          Recordarme
        </label>
        <a href="#" className="text-sm font-medium text-blue-600 transition hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300">
          ¿Olvidaste tu contraseña?
        </a>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.35 }}
      >
        <motion.button
          type="submit"
          disabled={loading}
          whileHover={{ scale: loading ? 1 : 1.02 }}
          whileTap={{ scale: loading ? 1 : 0.97 }}
          className="relative w-full overflow-hidden rounded-xl bg-blue-600 py-3 text-sm font-semibold text-white shadow-md transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-70 dark:bg-blue-600 dark:hover:bg-blue-500"
        >
          {loading ? (
            <span className="flex items-center justify-center gap-2">
              <motion.span
                animate={{ rotate: 360 }}
                transition={{ duration: 0.8, repeat: Infinity, ease: "linear" }}
                className="inline-block h-4 w-4 rounded-full border-2 border-white/30 border-t-white"
              />
              Iniciando sesión...
            </span>
          ) : (
            "Iniciar sesión"
          )}
        </motion.button>
      </motion.div>

      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
        className="text-center text-sm text-slate-500 dark:text-slate-400"
      >
        ¿Aún no tienes cuenta?{" "}
        <a href="/register" className="font-semibold text-blue-600 transition hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300">
          Crear cuenta
        </a>
      </motion.p>
    </form>
  );
}
