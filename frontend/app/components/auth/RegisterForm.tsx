"use client";

import type { FormEvent } from "react";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Building2, Eye, EyeOff, Lock, Mail, MailCheck, MapPin, UserCircle } from "lucide-react";
import { motion } from "framer-motion";
import GoogleAuthButton from "./GoogleAuthButton";
import { registerUser, loginOrRegisterGoogle, resendVerification } from "../../../lib/auth";
import {
  fetchClinicaBySlug,
  fetchClinicasActivas,
  type ClinicaActiva,
} from "../../../lib/api/clinicas";
import { useAuth } from "@/lib/auth-context";
import { useToast } from "../ui/Toast";

const initialState = { name: "", email: "", password: "", confirmPassword: "", acceptTerms: false };

export default function RegisterForm({ clinicaSlug }: { clinicaSlug?: string }) {
  const [formData, setFormData] = useState(initialState);
  const [showPassword, setShowPassword] = useState(false);
  const [focused, setFocused] = useState<string | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [clinicaState, setClinicaState] = useState<"loading" | "valid" | "invalid" | "select">(
    clinicaSlug ? "loading" : "select",
  );
  const [clinicaNombre, setClinicaNombre] = useState<string>("");
  const [resolvedSlug, setResolvedSlug] = useState<string | undefined>(clinicaSlug);
  const [clinicasActivas, setClinicasActivas] = useState<ClinicaActiva[]>([]);
  const [loadingClinicas, setLoadingClinicas] = useState(!clinicaSlug);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [pendingVerificationEmail, setPendingVerificationEmail] = useState<string | null>(null);
  const [resendStatus, setResendStatus] = useState<string | null>(null);
  const [resending, setResending] = useState(false);
  const router = useRouter();
  const { refresh } = useAuth();
  const { info } = useToast();

  useEffect(() => {
    if (!clinicaSlug) return;
    let cancelled = false;
    fetchClinicaBySlug(clinicaSlug).then((clinica) => {
      if (cancelled) return;
      if (clinica && clinica.estado === "activa") {
        setClinicaNombre(clinica.nombre);
        setClinicaState("valid");
      } else {
        setClinicaState("invalid");
      }
    });
    return () => {
      cancelled = true;
    };
  }, [clinicaSlug]);

  useEffect(() => {
    if (clinicaSlug) return;
    let cancelled = false;
    fetchClinicasActivas()
      .then((data) => {
        if (!cancelled) setClinicasActivas(data);
      })
      .finally(() => {
        if (!cancelled) setLoadingClinicas(false);
      });
    return () => {
      cancelled = true;
    };
  }, [clinicaSlug]);

  useEffect(() => {
    if (clinicaSlug) return;
    if (!("geolocation" in navigator)) return;
    navigator.geolocation.getCurrentPosition(
      (pos) => setUserLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
      () => setUserLocation(null),
      { enableHighAccuracy: true, timeout: 8000 },
    );
  }, [clinicaSlug]);

  const handleSelectClinica = (clinica: ClinicaActiva) => {
    setResolvedSlug(clinica.slug);
    setClinicaNombre(clinica.nombre);
    setClinicaState("valid");
  };

  const distanceToClinica = (clinica: ClinicaActiva): number | null => {
    if (!userLocation || clinica.latitud == null || clinica.longitud == null) return null;
    const R = 6371;
    const dLat = ((clinica.latitud - userLocation.lat) * Math.PI) / 180;
    const dLng = ((clinica.longitud - userLocation.lng) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) ** 2 +
      Math.cos((userLocation.lat * Math.PI) / 180) *
        Math.cos((clinica.latitud * Math.PI) / 180) *
        Math.sin(dLng / 2) ** 2;
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  };

  const sortedClinicas = useMemo(() => {
    if (!userLocation) return clinicasActivas;
    return [...clinicasActivas].sort((a, b) => {
      const da = distanceToClinica(a) ?? Infinity;
      const db = distanceToClinica(b) ?? Infinity;
      return da - db;
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [clinicasActivas, userLocation]);

  const locationQueryFor = (clinica: ClinicaActiva) => {
    if (clinica.latitud != null && clinica.longitud != null) {
      return `${clinica.latitud},${clinica.longitud}`;
    }
    return encodeURIComponent(`${clinica.nombre} ${clinica.direccion ?? ""}`.trim());
  };

  const mapsUrlFor = (clinica: ClinicaActiva) =>
    `https://www.google.com/maps/search/?api=1&query=${locationQueryFor(clinica)}`;

  const embedUrlFor = (clinica: ClinicaActiva) =>
    `https://maps.google.com/maps?q=${locationQueryFor(clinica)}&z=12&output=embed`;

  const mapTarget = sortedClinicas[0];

  const handleChange = (field: string, value: string | boolean) => {
    setFormData((c) => ({ ...c, [field]: value }));
    setErrors((c) => ({ ...c, [field]: "" }));
  };

  const validate = () => {
    const e: Record<string, string> = {};
    if (!formData.name.trim()) e.name = "El nombre completo es obligatorio.";
    if (!formData.email.trim()) e.email = "El correo es obligatorio.";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email))
      e.email = "Ingresa un correo válido.";
    if (!formData.password) e.password = "La contraseña es obligatoria.";
    else if (formData.password.length < 8) e.password = "Mínimo 8 caracteres.";
    if (!formData.confirmPassword) e.confirmPassword = "Confirma tu contraseña.";
    else if (formData.confirmPassword !== formData.password)
      e.confirmPassword = "Las contraseñas no coinciden.";
    if (!formData.acceptTerms) e.acceptTerms = "Debes aceptar los términos.";
    return e;
  };

  const getDashboardRoute = (role: string) => {
    if (role === "Administrador") return "/admin";
    if (role === "Veterinario") return "/veterinario";
    return "/cliente";
  };

  const notifyOtraClinica = (aviso?: { nombre: string; slug: string }) => {
    if (!aviso) return;
    info(
      `Ya tienes una cuenta en ${aviso.nombre}`,
      "Esta es una cuenta nueva e independiente. Tu historial de mascotas no se comparte entre clínicas.",
    );
  };

  const handleGoogleSuccess = async (data: { credential: string }) => {
    setLoading(true);
    setSubmitError(null);
    const result = await loginOrRegisterGoogle({ ...data, clinicaSlug: resolvedSlug });
    setLoading(false);
    if (result.error) {
      setSubmitError(result.error);
      return;
    }
    if (result.user) {
      notifyOtraClinica(result.avisoOtraClinica);
      await refresh();
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
      clinicaSlug: resolvedSlug,
    });
    setLoading(false);
    if (result.error) {
      setSubmitError(result.error);
      return;
    }
    setErrors({});
    if (result.requiresEmailVerification && result.email) {
      notifyOtraClinica(result.avisoOtraClinica);
      setPendingVerificationEmail(result.email);
    }
  };

  const handleResendVerification = async () => {
    if (!pendingVerificationEmail) return;
    setResending(true);
    setResendStatus(null);
    const { message } = await resendVerification(pendingVerificationEmail, resolvedSlug);
    setResendStatus(message);
    setResending(false);
  };

  const inputBase = (field: string) =>
    `w-full rounded-xl border py-3 text-sm text-slate-900 outline-none transition-all duration-200 placeholder:text-slate-400 dark:text-white dark:placeholder-slate-500 ${
      errors[field]
        ? "border-danger-400 bg-danger-50 dark:border-danger-500 dark:bg-danger-950/30"
        : focused === field
          ? "border-brand-400 bg-brand-50/40 ring-2 ring-brand-100 dark:border-brand-500 dark:bg-brand-950/20 dark:ring-brand-900/40"
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
    if (score <= 1)
      return {
        level: "Débil",
        color: "bg-danger-500",
        width: "w-1/4",
        text: "text-danger-600 dark:text-danger-400",
      };
    if (score <= 3)
      return {
        level: "Media",
        color: "bg-warning-500",
        width: "w-2/4",
        text: "text-warning-600 dark:text-warning-400",
      };
    return {
      level: "Fuerte",
      color: "bg-success-500",
      width: "w-full",
      text: "text-success-600 dark:text-success-400",
    };
  })();

  if (clinicaState === "loading") {
    return (
      <div className="flex items-center justify-center py-10">
        <span className="inline-block h-6 w-6 animate-spin rounded-full border-2 border-slate-300 border-t-brand-600" />
      </div>
    );
  }

  if (clinicaState === "select") {
    return (
      <div className="space-y-4">
        <div className="text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-50 text-brand-600 dark:bg-brand-950/30 dark:text-brand-300">
            <Building2 className="h-6 w-6" />
          </div>
          <p className="mt-3 text-sm leading-6 text-slate-600 dark:text-slate-300">
            Selecciona la clínica veterinaria en la que deseas registrarte.
          </p>
        </div>

        {loadingClinicas ? (
          <div className="flex items-center justify-center py-6">
            <span className="inline-block h-6 w-6 animate-spin rounded-full border-2 border-slate-300 border-t-brand-600" />
          </div>
        ) : clinicasActivas.length === 0 ? (
          <p className="text-center text-sm text-slate-500 dark:text-slate-400">
            No hay clínicas disponibles por el momento. Contacta a tu veterinaria para obtener tu
            enlace de registro.
          </p>
        ) : (
          <>
            {mapTarget && (
              <div className="overflow-hidden rounded-xl border border-slate-200 dark:border-slate-700">
                <iframe
                  title="Mapa de clínicas cercanas"
                  src={embedUrlFor(mapTarget)}
                  className="h-40 w-full border-0"
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                />
              </div>
            )}

            {!userLocation && (
              <p className="text-center text-xs text-slate-400 dark:text-slate-500">
                Activa tu ubicación en el navegador para ver las clínicas más cercanas a ti.
              </p>
            )}

            <div className="max-h-72 space-y-2 overflow-y-auto pr-1">
              {sortedClinicas.map((clinica) => {
                const distancia = distanceToClinica(clinica);
                return (
                  <div
                    key={clinica.slug}
                    className="flex items-center gap-2 rounded-xl border border-slate-200 px-4 py-3 transition hover:border-brand-300 hover:bg-brand-50 dark:border-slate-700 dark:hover:border-brand-700 dark:hover:bg-brand-950/20"
                  >
                    <button
                      type="button"
                      onClick={() => handleSelectClinica(clinica)}
                      className="flex flex-1 items-center gap-3 text-left text-sm font-medium text-slate-700 dark:text-slate-200"
                    >
                      <Building2 className="h-4 w-4 shrink-0 text-brand-500" />
                      <span className="flex-1">
                        {clinica.nombre}
                        {distancia !== null && (
                          <span className="ml-2 text-xs font-normal text-slate-400 dark:text-slate-500">
                            ·{" "}
                            {distancia < 1
                              ? `${Math.round(distancia * 1000)} m`
                              : `${distancia.toFixed(1)} km`}
                          </span>
                        )}
                      </span>
                    </button>
                    <a
                      href={mapsUrlFor(clinica)}
                      target="_blank"
                      rel="noopener noreferrer"
                      title="Ver ubicación en Google Maps"
                      className="shrink-0 rounded-lg p-2 text-slate-400 transition hover:bg-brand-100 hover:text-brand-600 dark:hover:bg-brand-950/40 dark:hover:text-brand-400"
                    >
                      <MapPin className="h-4 w-4" />
                    </a>
                  </div>
                );
              })}
            </div>
          </>
        )}

        <p className="text-center text-sm text-slate-500 dark:text-slate-400">
          ¿Ya tienes cuenta?{" "}
          <a
            href="/login"
            className="font-semibold text-brand-600 transition hover:text-brand-700 dark:text-brand-300 dark:hover:text-brand-200"
          >
            Iniciar sesión
          </a>
        </p>
      </div>
    );
  }

  if (clinicaState === "invalid") {
    return (
      <div className="space-y-4 text-center">
        <div className="dark:bg-danger-950/30 mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-danger-50 text-danger-600 dark:text-danger-400">
          <Building2 className="h-6 w-6" />
        </div>
        <p className="text-sm leading-6 text-slate-600 dark:text-slate-300">
          Este enlace de registro no es válido o la clínica está inactiva. Contacta a tu veterinaria
          para obtener el enlace correcto.
        </p>
        <a
          href="/login"
          className="inline-block text-sm font-semibold text-brand-600 transition hover:text-brand-700 dark:text-brand-300 dark:hover:text-brand-200"
        >
          Volver a iniciar sesión
        </a>
      </div>
    );
  }

  if (pendingVerificationEmail) {
    return (
      <div className="space-y-4 text-center">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-50 text-brand-600 dark:bg-brand-950/30 dark:text-brand-300">
          <MailCheck className="h-6 w-6" />
        </div>
        <h3 className="text-base font-semibold text-slate-900 dark:text-white">
          Confirma tu correo
        </h3>
        <p className="text-sm leading-6 text-slate-600 dark:text-slate-300">
          Enviamos un enlace de confirmación a <strong>{pendingVerificationEmail}</strong>. Ábrelo
          para activar tu cuenta. El enlace expira en 24 horas.
        </p>
        {resendStatus && (
          <p className="text-sm text-slate-500 dark:text-slate-400">{resendStatus}</p>
        )}
        <button
          type="button"
          onClick={handleResendVerification}
          disabled={resending}
          className="text-sm font-semibold text-brand-600 transition hover:text-brand-700 disabled:cursor-not-allowed disabled:opacity-60 dark:text-brand-300 dark:hover:text-brand-200"
        >
          {resending ? "Enviando..." : "Reenviar enlace de confirmación"}
        </button>
        <p className="text-center text-sm text-slate-500 dark:text-slate-400">
          ¿Ya confirmaste?{" "}
          <a
            href="/login"
            className="font-semibold text-brand-600 transition hover:text-brand-700 dark:text-brand-300 dark:hover:text-brand-200"
          >
            Iniciar sesión
          </a>
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4" noValidate>
      <motion.div
        initial={{ opacity: 0, y: -6 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center gap-2 rounded-xl border border-brand-100 bg-brand-50 px-4 py-3 text-sm text-brand-700 dark:border-brand-900 dark:bg-brand-950/30 dark:text-brand-300"
      >
        <Building2 className="h-4 w-4 shrink-0" />
        <span>
          Te estás registrando en <strong>{clinicaNombre}</strong>
        </span>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <GoogleAuthButton onSuccess={handleGoogleSuccess} />
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
          className="dark:bg-danger-950 rounded-xl border border-danger-100 bg-danger-50 px-4 py-3 text-sm text-danger-700 dark:border-danger-900 dark:text-danger-400"
        >
          {submitError}
        </motion.div>
      )}

      {/* Nombre */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="space-y-1.5"
      >
        <label
          className="block text-sm font-medium text-slate-700 dark:text-slate-300"
          htmlFor="name"
        >
          Nombre completo
        </label>
        <motion.div
          animate={focused === "name" ? { scale: 1.01 } : { scale: 1 }}
          transition={{ duration: 0.15 }}
          className="relative"
        >
          <UserCircle
            className={`pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 transition-colors ${focused === "name" ? "text-brand-500" : "text-slate-400"}`}
          />
          <input
            id="name"
            type="text"
            value={formData.name}
            onChange={(e) => handleChange("name", e.target.value)}
            onFocus={() => setFocused("name")}
            onBlur={() => setFocused(null)}
            className={`${inputBase("name")} pl-10 pr-4`}
            placeholder="Tu nombre completo"
          />
        </motion.div>
        {errors.name && (
          <motion.p
            initial={{ opacity: 0, x: -4 }}
            animate={{ opacity: 1, x: 0 }}
            className="text-xs text-danger-600 dark:text-danger-400"
          >
            {errors.name}
          </motion.p>
        )}
      </motion.div>

      {/* Email */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.25 }}
        className="space-y-1.5"
      >
        <label
          className="block text-sm font-medium text-slate-700 dark:text-slate-300"
          htmlFor="reg-email"
        >
          Correo electrónico
        </label>
        <motion.div
          animate={focused === "email" ? { scale: 1.01 } : { scale: 1 }}
          transition={{ duration: 0.15 }}
          className="relative"
        >
          <Mail
            className={`pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 transition-colors ${focused === "email" ? "text-brand-500" : "text-slate-400"}`}
          />
          <input
            id="reg-email"
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
          <motion.p
            initial={{ opacity: 0, x: -4 }}
            animate={{ opacity: 1, x: 0 }}
            className="text-xs text-danger-600 dark:text-danger-400"
          >
            {errors.email}
          </motion.p>
        )}
      </motion.div>

      {/* Passwords */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="grid gap-4 sm:grid-cols-2"
      >
        <div className="space-y-1.5">
          <label
            className="block text-sm font-medium text-slate-700 dark:text-slate-300"
            htmlFor="reg-password"
          >
            Contraseña
          </label>
          <motion.div
            animate={focused === "password" ? { scale: 1.01 } : { scale: 1 }}
            transition={{ duration: 0.15 }}
            className="relative"
          >
            <Lock
              className={`pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 transition-colors ${focused === "password" ? "text-brand-500" : "text-slate-400"}`}
            />
            <input
              id="reg-password"
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
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </motion.button>
          </motion.div>
          {passwordStrength && (
            <div className="mt-1.5">
              <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-slate-700">
                <motion.div
                  className={`h-full rounded-full ${passwordStrength.color}`}
                  initial={{ width: 0 }}
                  animate={{
                    width:
                      passwordStrength.width === "w-1/4"
                        ? "25%"
                        : passwordStrength.width === "w-2/4"
                          ? "50%"
                          : "100%",
                  }}
                  transition={{ duration: 0.3 }}
                />
              </div>
              <p className={`mt-1 text-[11px] font-medium ${passwordStrength.text}`}>
                Contraseña {passwordStrength.level}
              </p>
            </div>
          )}
          {errors.password && (
            <motion.p
              initial={{ opacity: 0, x: -4 }}
              animate={{ opacity: 1, x: 0 }}
              className="text-xs text-danger-600 dark:text-danger-400"
            >
              {errors.password}
            </motion.p>
          )}
        </div>

        <div className="space-y-1.5">
          <label
            className="block text-sm font-medium text-slate-700 dark:text-slate-300"
            htmlFor="confirmPassword"
          >
            Confirmar
          </label>
          <motion.div
            animate={focused === "confirmPassword" ? { scale: 1.01 } : { scale: 1 }}
            transition={{ duration: 0.15 }}
            className="relative"
          >
            <input
              id="confirmPassword"
              type={showPassword ? "text" : "password"}
              value={formData.confirmPassword}
              onChange={(e) => handleChange("confirmPassword", e.target.value)}
              onFocus={() => setFocused("confirmPassword")}
              onBlur={() => setFocused(null)}
              className={`${inputBase("confirmPassword")} pl-4 pr-4`}
              placeholder="••••••••"
            />
          </motion.div>
          {errors.confirmPassword && (
            <motion.p
              initial={{ opacity: 0, x: -4 }}
              animate={{ opacity: 1, x: 0 }}
              className="text-xs text-danger-600 dark:text-danger-400"
            >
              {errors.confirmPassword}
            </motion.p>
          )}
        </div>
      </motion.div>

      {/* Términos */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.35 }}
      >
        <label className="flex items-start gap-2.5 text-sm text-slate-600 dark:text-slate-400">
          <input
            type="checkbox"
            checked={formData.acceptTerms}
            onChange={(e) => handleChange("acceptTerms", e.target.checked)}
            className="mt-0.5 h-4 w-4 rounded border-slate-300 text-brand-600 focus:ring-brand-500"
          />
          Acepto los términos y condiciones del servicio
        </label>
        {errors.acceptTerms && (
          <motion.p
            initial={{ opacity: 0, x: -4 }}
            animate={{ opacity: 1, x: 0 }}
            className="mt-1 text-xs text-danger-600 dark:text-danger-400"
          >
            {errors.acceptTerms}
          </motion.p>
        )}
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <motion.button
          type="submit"
          disabled={loading}
          whileHover={{ scale: loading ? 1 : 1.02 }}
          whileTap={{ scale: loading ? 1 : 0.97 }}
          className="w-full rounded-xl bg-brand-600 py-3 text-sm font-semibold text-white shadow-brand-sm transition hover:bg-brand-700 disabled:cursor-not-allowed disabled:opacity-70 dark:bg-brand-600 dark:hover:bg-brand-500"
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
        <a
          href="/login"
          className="font-semibold text-brand-600 transition hover:text-brand-700 dark:text-brand-300 dark:hover:text-brand-200"
        >
          Iniciar sesión
        </a>
      </motion.p>
    </form>
  );
}
