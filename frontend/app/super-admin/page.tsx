"use client";

import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  Activity,
  Ban,
  Building2,
  CalendarDays,
  CheckCircle2,
  ClipboardList,
  Copy,
  Mail,
  MapPin,
  Phone,
  Plus,
  X,
  Zap,
} from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { fetchClinicas, createClinica, updateClinica, type Clinica } from "../../lib/api/clinicas";
import { SkeletonCardList } from "../components/ui/Skeleton";
import { useToast } from "../components/ui/Toast";
import ConfirmDialog from "../components/ui/ConfirmDialog";
import StatusBadge from "../components/ui/StatusBadge";
import MonthlyCalendar from "../components/ui/MonthlyCalendar";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { useIsDarkMode } from "@/lib/hooks/useDarkMode";

const inputClass = "form-input";

const CHART_BAR_COLORS = {
  actual: "#8B5CF6",
  anterior: "#C4B5FD",
};

const cardClass =
  "rounded-[13px] border-[0.5px] border-[#E4DFF0] bg-white px-4 py-3.5 dark:border-slate-700/60 dark:bg-slate-900";

const emptyForm = {
  nombre: "",
  slug: "",
  direccion: "",
  telefono: "",
  email: "",
  latitud: "",
  longitud: "",
  adminNombre: "",
  adminEmail: "",
  adminPassword: "",
};

function slugify(value: string): string {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

function timeAgo(dateStr: string): string {
  const diffMs = Date.now() - new Date(dateStr).getTime();
  const minutes = Math.floor(diffMs / 60000);
  if (minutes < 1) return "hace un momento";
  if (minutes < 60) return `hace ${minutes} min`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `hace ${hours} h`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `hace ${days} d`;
  const months = Math.floor(days / 30);
  return `hace ${months} mes${months > 1 ? "es" : ""}`;
}

export default function SuperAdminPage() {
  const { user } = useAuth();
  const { success, error: notifyError } = useToast();
  const [clinicas, setClinicas] = useState<Clinica[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState("");
  const [form, setForm] = useState(emptyForm);
  const [slugEdited, setSlugEdited] = useState(false);
  const [toggleTarget, setToggleTarget] = useState<Clinica | null>(null);
  const [toggling, setToggling] = useState(false);
  const [coordsTarget, setCoordsTarget] = useState<Clinica | null>(null);
  const [coordsForm, setCoordsForm] = useState({ latitud: "", longitud: "" });
  const [coordsError, setCoordsError] = useState("");
  const [savingCoords, setSavingCoords] = useState(false);
  const isDark = useIsDarkMode();

  const cargar = () => {
    setLoading(true);
    fetchClinicas()
      .then(setClinicas)
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    cargar();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormError("");
    if (name === "nombre") {
      setForm((prev) => ({
        ...prev,
        nombre: value,
        slug: slugEdited ? prev.slug : slugify(value),
      }));
      return;
    }
    if (name === "slug") {
      setSlugEdited(true);
      setForm((prev) => ({ ...prev, slug: slugify(value) }));
      return;
    }
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleUseMyLocation = () => {
    if (!("geolocation" in navigator)) {
      notifyError("No disponible", "Tu navegador no soporta geolocalización.");
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setForm((prev) => ({
          ...prev,
          latitud: pos.coords.latitude.toFixed(6),
          longitud: pos.coords.longitude.toFixed(6),
        }));
      },
      () => notifyError("No se pudo obtener tu ubicación", "Revisa los permisos del navegador."),
    );
  };

  const closeForm = () => {
    setShowForm(false);
    setForm(emptyForm);
    setSlugEdited(false);
    setFormError("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.nombre.trim() || !form.slug.trim()) {
      setFormError("El nombre y el slug de la clínica son obligatorios.");
      return;
    }
    if (!form.adminNombre.trim() || !form.adminEmail.trim() || !form.adminPassword.trim()) {
      setFormError("Completa los datos del administrador inicial.");
      return;
    }
    if (form.adminPassword.length < 8) {
      setFormError("La contraseña del administrador debe tener al menos 8 caracteres.");
      return;
    }
    setSaving(true);
    setFormError("");
    try {
      await createClinica({
        nombre: form.nombre.trim(),
        slug: form.slug.trim(),
        direccion: form.direccion.trim() || undefined,
        telefono: form.telefono.trim() || undefined,
        email: form.email.trim() || undefined,
        latitud: form.latitud.trim() ? Number(form.latitud) : undefined,
        longitud: form.longitud.trim() ? Number(form.longitud) : undefined,
        adminNombre: form.adminNombre.trim(),
        adminEmail: form.adminEmail.trim(),
        adminPassword: form.adminPassword,
      });
      success("Clínica registrada", "La clínica y su administrador se crearon correctamente.");
      closeForm();
      cargar();
    } catch (err) {
      setFormError(err instanceof Error ? err.message : "Error al registrar la clínica.");
    } finally {
      setSaving(false);
    }
  };

  const handleToggleEstado = async () => {
    if (!toggleTarget) return;
    setToggling(true);
    const nuevoEstado = toggleTarget.estado === "activa" ? "inactiva" : "activa";
    try {
      await updateClinica(toggleTarget.id, { estado: nuevoEstado });
      success(
        nuevoEstado === "activa" ? "Clínica activada" : "Clínica desactivada",
        `${toggleTarget.nombre} ahora está ${nuevoEstado}.`,
      );
      setToggleTarget(null);
      cargar();
    } catch (err) {
      notifyError(
        "Error al actualizar",
        err instanceof Error ? err.message : "No se pudo actualizar el estado de la clínica.",
      );
    } finally {
      setToggling(false);
    }
  };

  const openCoordsModal = (c: Clinica) => {
    setCoordsTarget(c);
    setCoordsForm({
      latitud: c.latitud != null ? String(c.latitud) : "",
      longitud: c.longitud != null ? String(c.longitud) : "",
    });
    setCoordsError("");
  };

  const closeCoordsModal = () => {
    setCoordsTarget(null);
    setCoordsForm({ latitud: "", longitud: "" });
    setCoordsError("");
  };

  const handleCoordsUseMyLocation = () => {
    if (!("geolocation" in navigator)) {
      notifyError("No disponible", "Tu navegador no soporta geolocalización.");
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setCoordsForm({
          latitud: pos.coords.latitude.toFixed(6),
          longitud: pos.coords.longitude.toFixed(6),
        });
      },
      () => notifyError("No se pudo obtener tu ubicación", "Revisa los permisos del navegador."),
    );
  };

  const handleSaveCoords = async () => {
    if (!coordsTarget) return;
    const latStr = coordsForm.latitud.trim();
    const lngStr = coordsForm.longitud.trim();
    if ((latStr && !lngStr) || (!latStr && lngStr)) {
      setCoordsError("Completa tanto la latitud como la longitud.");
      return;
    }
    const latitud = latStr ? Number(latStr) : undefined;
    const longitud = lngStr ? Number(lngStr) : undefined;
    if (latStr && (Number.isNaN(latitud) || latitud! < -90 || latitud! > 90)) {
      setCoordsError("La latitud debe estar entre -90 y 90.");
      return;
    }
    if (lngStr && (Number.isNaN(longitud) || longitud! < -180 || longitud! > 180)) {
      setCoordsError("La longitud debe estar entre -180 y 180.");
      return;
    }
    setSavingCoords(true);
    setCoordsError("");
    try {
      await updateClinica(coordsTarget.id, { latitud, longitud });
      success(
        "Ubicación actualizada",
        `La ubicación de ${coordsTarget.nombre} se guardó correctamente.`,
      );
      closeCoordsModal();
      cargar();
    } catch (err) {
      setCoordsError(err instanceof Error ? err.message : "No se pudo actualizar la ubicación.");
    } finally {
      setSavingCoords(false);
    }
  };

  const handleCopyLink = async (slug: string, nombre: string) => {
    const url = `${window.location.origin}/register?clinica=${slug}`;
    try {
      await navigator.clipboard.writeText(url);
      success("Enlace copiado", `Enlace de registro de ${nombre} copiado al portapapeles.`);
    } catch {
      notifyError("No se pudo copiar", "Copia el enlace manualmente: " + url);
    }
  };

  const ultimasClinicas = useMemo(
    () =>
      [...clinicas]
        .sort((a, b) => (b.createdAt ?? "").localeCompare(a.createdAt ?? ""))
        .slice(0, 3),
    [clinicas],
  );

  const actividadReciente = useMemo(() => ultimasClinicas.slice(0, 4), [ultimasClinicas]);

  const chartData = useMemo(() => {
    const now = new Date();
    const months: { label: string; year: number; month: number }[] = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      months.push({
        label: d.toLocaleDateString("es-ES", { month: "short" }).replace(".", ""),
        year: d.getFullYear(),
        month: d.getMonth(),
      });
    }
    return months.map((m) => {
      const count = clinicas.filter((c) => {
        if (!c.createdAt) return false;
        const cd = new Date(c.createdAt);
        return cd.getFullYear() === m.year && cd.getMonth() === m.month;
      }).length;
      const isCurrent = m.year === now.getFullYear() && m.month === now.getMonth();
      return {
        date: m.label,
        actual: isCurrent ? count : 0,
        anterior: !isCurrent ? count : 0,
      };
    });
  }, [clinicas]);

  const datesConClinicas = useMemo(() => {
    const set = new Set<string>();
    clinicas.forEach((c) => c.createdAt && set.add(c.createdAt.slice(0, 10)));
    return set;
  }, [clinicas]);

  const now = new Date();
  const nuevasEsteMes = clinicas.filter((c) => {
    if (!c.createdAt) return false;
    const d = new Date(c.createdAt);
    return d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth();
  }).length;
  const contactoCompleto = clinicas.filter((c) => c.direccion && c.telefono && c.email).length;

  const iconBg = (color: string, lightBg: string) => (isDark ? `${color}26` : lightBg);

  const metrics = [
    {
      label: "Total clínicas",
      value: clinicas.length,
      icon: Building2,
      color: "#1D4ED8",
      bg: "#EFF6FF",
    },
    {
      label: "Activas",
      value: clinicas.filter((c) => c.estado === "activa").length,
      icon: CheckCircle2,
      color: "#15803D",
      bg: "#F0FDF4",
    },
    {
      label: "Inactivas",
      value: clinicas.filter((c) => c.estado !== "activa").length,
      icon: Ban,
      color: "#BE123C",
      bg: "#FFF1F2",
    },
    {
      label: "Nuevas este mes",
      value: nuevasEsteMes,
      icon: CalendarDays,
      color: "#C2410C",
      bg: "#FFF7ED",
    },
    {
      label: "Contacto completo",
      value: contactoCompleto,
      icon: Mail,
      color: "#7E22CE",
      bg: "#FAF5FF",
    },
  ];

  return (
    <>
      <div className="admin-page bg-[#F7F6FA] dark:bg-transparent">
        <div className="flex flex-col gap-3">
          {/* FILA 1 — Hero + Últimas clínicas */}
          <div className="grid grid-cols-1 gap-3 lg:grid-cols-[1fr_240px]">
            <motion.div
              className="rounded-[13px] bg-gradient-to-br from-[#EDE8FA] via-[#E4DCF5] to-[#EAE3F8] p-6 dark:from-[#1A1030] dark:via-[#20153A] dark:to-[#1C1232]"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
            >
              <p className="text-[11px] font-semibold uppercase tracking-[0.25em] text-[#5A4880] dark:text-[#9D88CC]">
                Panel super administrativo
              </p>
              <h1 className="mt-2 text-2xl font-bold tracking-tight text-[#1A0F35] dark:text-[#E8DCFF] sm:text-3xl">
                Hola, {user?.name ?? "Super Administrador"} 👋
              </h1>
              <p className="mt-2 max-w-md text-sm leading-6 text-[#5A4880] dark:text-[#9D88CC]">
                Gestiona las clínicas que usan VetNova, activa o desactiva sus accesos y registra
                nuevas sedes.
              </p>
              <div className="mt-5 flex flex-wrap gap-3">
                <button
                  onClick={() => setShowForm(true)}
                  className="inline-flex items-center gap-2 rounded-[9px] bg-[#7C3AED] px-4 py-2 text-[12px] font-semibold text-white transition hover:bg-[#6D28D9]"
                >
                  <Plus className="h-3.5 w-3.5" />
                  Nueva clínica
                </button>
                <a
                  href="#tabla-clinicas"
                  className="inline-flex items-center gap-2 rounded-[9px] border-[0.5px] border-[#7C3AED]/30 bg-white/60 px-4 py-2 text-[12px] font-semibold text-[#7C3AED] transition hover:bg-white"
                >
                  <ClipboardList className="h-3.5 w-3.5" />
                  Ver listado
                </a>
              </div>
            </motion.div>

            {/* Últimas clínicas */}
            <div className={cardClass}>
              <div className="mb-3 flex items-center gap-2">
                <Building2 className="h-4 w-4 text-[#7C3AED]" />
                <h3 className="text-[12px] font-semibold text-slate-900 dark:text-white">
                  Últimas clínicas
                </h3>
              </div>
              {ultimasClinicas.length === 0 ? (
                <p className="text-[11px] text-[#555068] dark:text-slate-400">
                  Sin clínicas registradas todavía.
                </p>
              ) : (
                <div className="space-y-3">
                  {ultimasClinicas.map((c) => (
                    <div key={c.id} className="flex items-start gap-2">
                      <span
                        className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full"
                        style={{ background: c.estado === "activa" ? "#16A34A" : "#94A3B8" }}
                      />
                      <p className="text-[11px] leading-5 text-slate-700 dark:text-slate-300">
                        <span className="font-semibold text-slate-900 dark:text-white">
                          {c.nombre}
                        </span>
                        <br />
                        {c.createdAt ? timeAgo(c.createdAt) : "—"}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* FILA 2 — Métricas */}
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
            {metrics.map((m, i) => {
              const Icon = m.icon;
              return (
                <motion.div
                  key={m.label}
                  className={cardClass}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: i * 0.06 }}
                >
                  <div
                    className="mb-3 flex h-8 w-8 items-center justify-center rounded-lg"
                    style={{ background: iconBg(m.color, m.bg) }}
                  >
                    <Icon className="h-4 w-4" style={{ color: m.color }} />
                  </div>
                  <p className="text-[22px] font-bold leading-none" style={{ color: m.color }}>
                    {loading ? "—" : m.value}
                  </p>
                  <p className="mt-1.5 text-[11px] text-[#555068] dark:text-slate-400">{m.label}</p>
                </motion.div>
              );
            })}
          </div>

          {/* FILA 3 — Gráfica + Calendario */}
          <div className="grid grid-cols-1 gap-3 lg:grid-cols-[1fr_240px]">
            <div className={cardClass}>
              <h2 className="text-[12px] font-semibold text-slate-900 dark:text-white">
                Clínicas registradas por mes
              </h2>
              <p className="mt-0.5 text-[11px] text-[#555068] dark:text-slate-400">
                Últimos 6 meses
              </p>

              <div className="mb-1 mt-3 flex items-center gap-4">
                <span className="flex items-center gap-1.5 text-[11px] text-[#555068] dark:text-slate-400">
                  <span
                    className="inline-block h-2 w-2 rounded-full"
                    style={{ background: CHART_BAR_COLORS.actual }}
                  />
                  Mes actual
                </span>
                <span className="flex items-center gap-1.5 text-[11px] text-[#555068] dark:text-slate-400">
                  <span
                    className="inline-block h-2 w-2 rounded-full"
                    style={{ background: CHART_BAR_COLORS.anterior }}
                  />
                  Meses anteriores
                </span>
              </div>

              <div className="h-60 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData} barSize={28} barGap={4}>
                    <CartesianGrid vertical={false} stroke={isDark ? "#334155" : "#E4DFF0"} />
                    <XAxis
                      dataKey="date"
                      tick={{ fontSize: 10, fill: isDark ? "#94A3B8" : "#555068" }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <YAxis
                      tick={{ fontSize: 10, fill: isDark ? "#94A3B8" : "#555068" }}
                      axisLine={false}
                      tickLine={false}
                      allowDecimals={false}
                    />
                    <Tooltip
                      cursor={{ fill: "transparent" }}
                      contentStyle={{
                        background: isDark ? "#1E293B" : "#FFFFFF",
                        border: isDark ? "0.5px solid #334155" : "0.5px solid #E4DFF0",
                        borderRadius: 10,
                        fontSize: 12,
                        color: isDark ? "#E2E8F0" : "#1A0F35",
                      }}
                      formatter={(value) => [
                        `${value} clínica${Number(value) !== 1 ? "s" : ""}`,
                        "",
                      ]}
                    />
                    <Bar
                      dataKey="actual"
                      stackId="clinicas"
                      fill={CHART_BAR_COLORS.actual}
                      radius={[6, 6, 6, 6]}
                    />
                    <Bar
                      dataKey="anterior"
                      stackId="clinicas"
                      fill={CHART_BAR_COLORS.anterior}
                      radius={[6, 6, 6, 6]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            <MonthlyCalendar
              datesWithCitas={datesConClinicas}
              accentColor="#7C3AED"
              legendLabel="Registros"
            />
          </div>

          {/* FILA 4 — Actividad reciente + Acciones rápidas */}
          <div className="grid grid-cols-1 gap-3 lg:grid-cols-[1fr_240px]">
            <div className={cardClass}>
              <div className="mb-3 flex items-center gap-2">
                <Activity className="h-4 w-4 text-[#7C3AED]" />
                <h3 className="text-[12px] font-semibold text-slate-900 dark:text-white">
                  Actividad reciente
                </h3>
              </div>
              {actividadReciente.length === 0 ? (
                <p className="text-[11px] text-[#555068] dark:text-slate-400">
                  Sin actividad reciente.
                </p>
              ) : (
                <div className="space-y-3">
                  {actividadReciente.map((c) => (
                    <div key={c.id} className="flex items-start gap-3">
                      <div
                        className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg"
                        style={{
                          background: isDark
                            ? c.estado === "activa"
                              ? "#16A34A26"
                              : "#64748B26"
                            : c.estado === "activa"
                              ? "#F0FDF4"
                              : "#F1F5F9",
                        }}
                      >
                        <Building2
                          className="h-3.5 w-3.5"
                          style={{ color: c.estado === "activa" ? "#16A34A" : "#64748B" }}
                        />
                      </div>
                      <div className="min-w-0">
                        <p className="text-[11px] leading-5 text-slate-700 dark:text-slate-300">
                          Se registró la clínica «{c.nombre}»
                        </p>
                        <p className="mt-0.5 text-[11px] text-[#555068] dark:text-slate-400">
                          {c.createdAt ? timeAgo(c.createdAt) : "—"}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Acciones rápidas */}
            <div className={cardClass}>
              <div className="mb-3 flex items-center gap-2">
                <Zap className="h-4 w-4 text-[#7C3AED]" />
                <h3 className="text-[12px] font-semibold text-slate-900 dark:text-white">
                  Acciones rápidas
                </h3>
              </div>
              <div className="space-y-2">
                <button
                  type="button"
                  onClick={() => setShowForm(true)}
                  className="flex w-full items-center gap-2 rounded-[9px] border-[0.5px] border-[#E4DFF0] bg-[#F7F6FA] px-3 py-2 text-[11px] font-semibold text-slate-700 transition hover:border-[#7C3AED]/30 hover:bg-[#EDE8FA] dark:border-slate-700/60 dark:bg-slate-800/60 dark:text-slate-300 dark:hover:border-[#7C3AED]/40 dark:hover:bg-[#7C3AED]/10"
                >
                  <Plus className="h-3.5 w-3.5 text-[#7C3AED]" />
                  Nueva clínica
                </button>
                <a
                  href="#tabla-clinicas"
                  className="flex w-full items-center gap-2 rounded-[9px] border-[0.5px] border-[#E4DFF0] bg-[#F7F6FA] px-3 py-2 text-[11px] font-semibold text-slate-700 transition hover:border-[#7C3AED]/30 hover:bg-[#EDE8FA] dark:border-slate-700/60 dark:bg-slate-800/60 dark:text-slate-300 dark:hover:border-[#7C3AED]/40 dark:hover:bg-[#7C3AED]/10"
                >
                  <ClipboardList className="h-3.5 w-3.5 text-[#7C3AED]" />
                  Ver listado completo
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Lista de clínicas */}
        <section id="tabla-clinicas" className={`${cardClass} mt-3`}>
          <div>
            <h2 className="text-[12px] font-semibold text-slate-900 dark:text-white">
              Veterinarias registradas
            </h2>
            <p className="mt-0.5 text-[11px] text-[#555068] dark:text-slate-400">
              Gestiona las clínicas que usan VetNova y su administrador inicial.
            </p>
          </div>
          <div className="mt-4">
            {loading ? (
              <SkeletonCardList count={4} />
            ) : clinicas.length === 0 ? (
              <div className="flex flex-col items-center gap-3 rounded-2xl border border-slate-200/70 bg-slate-50 py-14 text-center dark:border-slate-700 dark:bg-slate-800/40">
                <Building2 className="h-10 w-10 text-slate-300 dark:text-slate-600" />
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  Todavía no hay clínicas registradas.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto rounded-2xl border border-slate-200/70 dark:border-slate-700">
                <table className="w-full min-w-[720px] border-collapse text-left text-sm">
                  <thead>
                    <tr className="border-b border-slate-200/70 bg-slate-50 dark:border-slate-700 dark:bg-slate-800/50">
                      <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                        Clínica
                      </th>
                      <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                        Contacto
                      </th>
                      <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                        Registrada
                      </th>
                      <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                        Estado
                      </th>
                      <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                        Acciones
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {clinicas.map((c) => (
                      <tr
                        key={c.id}
                        id={`clinica-row-${c.id}`}
                        className="bg-white transition hover:bg-slate-50 dark:bg-transparent dark:hover:bg-slate-800/40"
                      >
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-violet-100 text-violet-700 dark:bg-violet-900/40 dark:text-violet-300">
                              <Building2 className="h-5 w-5" />
                            </div>
                            <div className="min-w-0">
                              <p className="font-semibold text-slate-900 dark:text-white">
                                {c.nombre}
                              </p>
                              <div className="flex items-center gap-1.5">
                                <p className="truncate text-xs text-slate-400">
                                  /register?clinica={c.slug}
                                </p>
                                <button
                                  type="button"
                                  onClick={() => handleCopyLink(c.slug, c.nombre)}
                                  className="shrink-0 rounded-md p-1 text-slate-400 transition hover:bg-slate-100 hover:text-brand-600 dark:hover:bg-slate-800 dark:hover:text-brand-400"
                                  aria-label="Copiar enlace de registro"
                                  title="Copiar enlace de registro"
                                >
                                  <Copy className="h-3.5 w-3.5" />
                                </button>
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex flex-col gap-1 text-xs text-slate-500 dark:text-slate-400">
                            {c.direccion && (
                              <span className="flex items-center gap-1">
                                <MapPin className="h-3 w-3 shrink-0" /> {c.direccion}
                              </span>
                            )}
                            {c.telefono && (
                              <span className="flex items-center gap-1">
                                <Phone className="h-3 w-3 shrink-0" /> {c.telefono}
                              </span>
                            )}
                            {c.email && (
                              <span className="flex items-center gap-1">
                                <Mail className="h-3 w-3 shrink-0" /> {c.email}
                              </span>
                            )}
                            {!c.direccion && !c.telefono && !c.email && <span>—</span>}
                          </div>
                        </td>
                        <td className="px-4 py-3 text-sm text-slate-500 dark:text-slate-400">
                          {c.createdAt
                            ? new Date(c.createdAt).toLocaleDateString("es-ES", {
                                day: "2-digit",
                                month: "short",
                                year: "numeric",
                              })
                            : "—"}
                        </td>
                        <td className="px-4 py-3">
                          <StatusBadge status={c.estado === "activa" ? "Activa" : "Inactiva"} />
                        </td>
                        <td className="px-4 py-3 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => openCoordsModal(c)}
                              className="btn-secondary px-3.5 py-2 text-xs"
                              title={
                                c.latitud != null && c.longitud != null
                                  ? "Editar coordenadas"
                                  : "Agregar coordenadas"
                              }
                            >
                              <MapPin className="h-3.5 w-3.5" />
                            </button>
                            <button
                              onClick={() => setToggleTarget(c)}
                              className={
                                c.estado === "activa"
                                  ? "btn-danger px-3.5 py-2 text-xs"
                                  : "btn-secondary px-3.5 py-2 text-xs"
                              }
                            >
                              {c.estado === "activa" ? "Desactivar" : "Activar"}
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </section>
      </div>

      {/* Modal nueva clínica */}
      <AnimatePresence>
        {showForm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-surface-900/50 px-4 backdrop-blur-sm"
            onClick={closeForm}
          >
            <motion.div
              initial={{ scale: 0.96, opacity: 0, y: 12 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.96, opacity: 0, y: 12 }}
              transition={{ type: "spring", bounce: 0.18, duration: 0.38 }}
              className="flex max-h-[90vh] w-full max-w-2xl flex-col overflow-hidden rounded-3xl border border-surface-200/60 bg-white shadow-modal dark:border-surface-700 dark:bg-surface-900"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4 dark:border-slate-800">
                <h2 className="text-lg font-bold text-slate-900 dark:text-white">Nueva clínica</h2>
                <button
                  onClick={closeForm}
                  className="flex h-8 w-8 items-center justify-center rounded-xl text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
              <div className="flex-1 overflow-y-auto p-6">
                <form id="form-clinica" onSubmit={handleSubmit} className="space-y-6">
                  <div>
                    <h3 className="text-section-title mb-3">Datos de la clínica</h3>
                    <div className="grid gap-5 sm:grid-cols-2">
                      <div>
                        <label className="mb-1 block text-sm font-semibold text-slate-700 dark:text-slate-300">
                          Nombre *
                        </label>
                        <input
                          name="nombre"
                          value={form.nombre}
                          onChange={handleChange}
                          placeholder="Nombre de la clínica"
                          className={inputClass}
                          required
                        />
                      </div>
                      <div>
                        <label className="mb-1 block text-sm font-semibold text-slate-700 dark:text-slate-300">
                          Slug (enlace de registro) *
                        </label>
                        <input
                          name="slug"
                          value={form.slug}
                          onChange={handleChange}
                          placeholder="mi-clinica"
                          className={inputClass}
                          required
                        />
                      </div>
                      <div>
                        <label className="mb-1 block text-sm font-semibold text-slate-700 dark:text-slate-300">
                          Dirección
                        </label>
                        <input
                          name="direccion"
                          value={form.direccion}
                          onChange={handleChange}
                          className={inputClass}
                        />
                      </div>
                      <div>
                        <label className="mb-1 block text-sm font-semibold text-slate-700 dark:text-slate-300">
                          Teléfono
                        </label>
                        <input
                          name="telefono"
                          value={form.telefono}
                          onChange={handleChange}
                          className={inputClass}
                        />
                      </div>
                      <div className="sm:col-span-2">
                        <label className="mb-1 block text-sm font-semibold text-slate-700 dark:text-slate-300">
                          Email de la clínica
                        </label>
                        <input
                          type="email"
                          name="email"
                          value={form.email}
                          onChange={handleChange}
                          className={inputClass}
                        />
                      </div>
                      <div>
                        <label className="mb-1 block text-sm font-semibold text-slate-700 dark:text-slate-300">
                          Latitud
                        </label>
                        <input
                          type="number"
                          step="any"
                          name="latitud"
                          value={form.latitud}
                          onChange={handleChange}
                          placeholder="-2.170998"
                          className={inputClass}
                        />
                      </div>
                      <div>
                        <label className="mb-1 block text-sm font-semibold text-slate-700 dark:text-slate-300">
                          Longitud
                        </label>
                        <input
                          type="number"
                          step="any"
                          name="longitud"
                          value={form.longitud}
                          onChange={handleChange}
                          placeholder="-79.922359"
                          className={inputClass}
                        />
                      </div>
                      <div className="sm:col-span-2">
                        <button
                          type="button"
                          onClick={handleUseMyLocation}
                          className="inline-flex items-center gap-1.5 text-xs font-semibold text-brand-600 transition hover:text-brand-700 dark:text-brand-300 dark:hover:text-brand-200"
                        >
                          <MapPin className="h-3.5 w-3.5" />
                          Usar mi ubicación actual
                        </button>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-section-title mb-3">Administrador inicial</h3>
                    <div className="grid gap-5 sm:grid-cols-2">
                      <div className="sm:col-span-2">
                        <label className="mb-1 block text-sm font-semibold text-slate-700 dark:text-slate-300">
                          Nombre *
                        </label>
                        <input
                          name="adminNombre"
                          value={form.adminNombre}
                          onChange={handleChange}
                          className={inputClass}
                          required
                        />
                      </div>
                      <div>
                        <label className="mb-1 block text-sm font-semibold text-slate-700 dark:text-slate-300">
                          Email *
                        </label>
                        <input
                          type="email"
                          name="adminEmail"
                          value={form.adminEmail}
                          onChange={handleChange}
                          className={inputClass}
                          required
                        />
                      </div>
                      <div>
                        <label className="mb-1 block text-sm font-semibold text-slate-700 dark:text-slate-300">
                          Contraseña *
                        </label>
                        <input
                          type="password"
                          name="adminPassword"
                          value={form.adminPassword}
                          onChange={handleChange}
                          className={inputClass}
                          minLength={8}
                          required
                        />
                      </div>
                    </div>
                  </div>

                  {formError && (
                    <div className="dark:bg-danger-950/30 rounded-xl border border-danger-200 bg-danger-50 px-4 py-3 text-sm text-danger-700 dark:border-danger-800 dark:text-danger-300">
                      {formError}
                    </div>
                  )}
                </form>
              </div>
              <div className="flex justify-end gap-3 border-t border-slate-100 px-6 py-4 dark:border-slate-800">
                <button type="button" onClick={closeForm} className="btn-secondary">
                  Cancelar
                </button>
                <button form="form-clinica" type="submit" disabled={saving} className="btn-primary">
                  {saving ? "Guardando..." : "Registrar clínica"}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Modal editar ubicación */}
      <AnimatePresence>
        {coordsTarget && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-surface-900/50 px-4 backdrop-blur-sm"
            onClick={closeCoordsModal}
          >
            <motion.div
              initial={{ scale: 0.96, opacity: 0, y: 12 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.96, opacity: 0, y: 12 }}
              transition={{ type: "spring", bounce: 0.18, duration: 0.38 }}
              className="w-full max-w-md overflow-hidden rounded-3xl border border-surface-200/60 bg-white shadow-modal dark:border-surface-700 dark:bg-surface-900"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4 dark:border-slate-800">
                <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                  Ubicación de {coordsTarget.nombre}
                </h2>
                <button
                  onClick={closeCoordsModal}
                  className="flex h-8 w-8 items-center justify-center rounded-xl text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
              <div className="space-y-4 p-6">
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  Estas coordenadas se usan para mostrar la clínica en el mapa y calcular la
                  distancia con los usuarios al registrarse.
                </p>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="mb-1 block text-sm font-semibold text-slate-700 dark:text-slate-300">
                      Latitud
                    </label>
                    <input
                      type="number"
                      step="any"
                      value={coordsForm.latitud}
                      onChange={(e) =>
                        setCoordsForm((prev) => ({ ...prev, latitud: e.target.value }))
                      }
                      placeholder="-2.170998"
                      className={inputClass}
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-sm font-semibold text-slate-700 dark:text-slate-300">
                      Longitud
                    </label>
                    <input
                      type="number"
                      step="any"
                      value={coordsForm.longitud}
                      onChange={(e) =>
                        setCoordsForm((prev) => ({ ...prev, longitud: e.target.value }))
                      }
                      placeholder="-79.922359"
                      className={inputClass}
                    />
                  </div>
                </div>
                <button
                  type="button"
                  onClick={handleCoordsUseMyLocation}
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-brand-600 transition hover:text-brand-700 dark:text-brand-300 dark:hover:text-brand-200"
                >
                  <MapPin className="h-3.5 w-3.5" />
                  Usar mi ubicación actual
                </button>
                {coordsError && (
                  <div className="dark:bg-danger-950/30 rounded-xl border border-danger-200 bg-danger-50 px-4 py-3 text-sm text-danger-700 dark:border-danger-800 dark:text-danger-300">
                    {coordsError}
                  </div>
                )}
              </div>
              <div className="flex justify-end gap-3 border-t border-slate-100 px-6 py-4 dark:border-slate-800">
                <button type="button" onClick={closeCoordsModal} className="btn-secondary">
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={handleSaveCoords}
                  disabled={savingCoords}
                  className="btn-primary"
                >
                  {savingCoords ? "Guardando..." : "Guardar"}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Confirmación activar/desactivar */}
      <ConfirmDialog
        open={toggleTarget !== null}
        title={toggleTarget?.estado === "activa" ? "Desactivar clínica" : "Activar clínica"}
        description={
          toggleTarget
            ? toggleTarget.estado === "activa"
              ? `¿Seguro que deseas desactivar "${toggleTarget.nombre}"? Sus usuarios no podrán registrarse mediante su enlace mientras esté inactiva.`
              : `¿Deseas reactivar "${toggleTarget.nombre}"?`
            : ""
        }
        confirmLabel={
          toggling ? "Guardando..." : toggleTarget?.estado === "activa" ? "Desactivar" : "Activar"
        }
        cancelLabel="Cancelar"
        variant={toggleTarget?.estado === "activa" ? "danger" : "warning"}
        onConfirm={handleToggleEstado}
        onCancel={() => setToggleTarget(null)}
      />
    </>
  );
}
