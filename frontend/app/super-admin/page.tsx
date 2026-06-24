"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import {
  Activity,
  Ban,
  Building2,
  CalendarDays,
  CheckCircle2,
  ClipboardList,
  Copy,
  History,
  Mail,
  MapPin,
  Phone,
  Plus,
  User,
  X,
  Zap,
} from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import {
  fetchClinicas,
  createClinica,
  updateClinica,
  changeClinicaAdmin,
  fetchAdminHistory,
  type Clinica,
  type AdminHistoryEntry,
} from "../../lib/api/clinicas";
import AddressAutocomplete from "../components/maps/AddressAutocomplete";
import MapPreview from "../components/maps/MapPreview";
import { useToast } from "../components/ui/Toast";
import ConfirmDialog from "../components/ui/ConfirmDialog";
import Pagination from "../components/ui/Pagination";
import ClinicasTable from "../components/super-admin/ClinicasTable";
import { StatusBadge } from "../../lib/utils/status-badge";
import MonthlyCalendar, { type CalendarEvent } from "../components/ui/MonthlyCalendar";
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
  adminEmail: "",
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
  const [hiddenChartSeries, setHiddenChartSeries] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState("");
  const [form, setForm] = useState(emptyForm);
  const [formCoords, setFormCoords] = useState<{ latitud: number; longitud: number } | null>(null);
  const [slugEdited, setSlugEdited] = useState(false);
  const [toggleTarget, setToggleTarget] = useState<Clinica | null>(null);
  const [toggling, setToggling] = useState(false);
  const [detailTarget, setDetailTarget] = useState<Clinica | null>(null);
  const [historyPage, setHistoryPage] = useState<{
    data: AdminHistoryEntry[];
    page: number;
    lastPage: number;
  }>({ data: [], page: 1, lastPage: 1 });
  const [historyLoading, setHistoryLoading] = useState(false);
  const [changeAdminEmail, setChangeAdminEmail] = useState("");
  const [changeAdminError, setChangeAdminError] = useState("");
  const [changingAdmin, setChangingAdmin] = useState(false);
  const [coordsTarget, setCoordsTarget] = useState<Clinica | null>(null);
  const [coordsForm, setCoordsForm] = useState({
    direccion: "",
    latitud: null as number | null,
    longitud: null as number | null,
  });
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

  const handleDireccionChange = (value: string) => {
    setFormError("");
    setForm((prev) => ({ ...prev, direccion: value }));
    // Si el usuario edita manualmente el texto, invalidamos las coordenadas
    // previamente seleccionadas hasta que escoja una nueva sugerencia.
    setFormCoords(null);
  };

  const handleDireccionSelect = ({
    direccion,
    latitud,
    longitud,
  }: {
    direccion: string;
    latitud: number;
    longitud: number;
  }) => {
    setForm((prev) => ({ ...prev, direccion }));
    setFormCoords({ latitud, longitud });
  };

  const closeForm = () => {
    setShowForm(false);
    setForm(emptyForm);
    setFormCoords(null);
    setSlugEdited(false);
    setFormError("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.nombre.trim() || !form.slug.trim()) {
      setFormError("El nombre y el slug de la clínica son obligatorios.");
      return;
    }
    if (!form.adminEmail.trim()) {
      setFormError("El correo del administrador inicial es obligatorio.");
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
        latitud: formCoords?.latitud,
        longitud: formCoords?.longitud,
        adminEmail: form.adminEmail.trim(),
      });
      success(
        "Clínica registrada",
        "La clínica se creó correctamente. Enviamos una contraseña temporal al correo del administrador.",
      );
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
      direccion: c.direccion || "",
      latitud: c.latitud ?? null,
      longitud: c.longitud ?? null,
    });
    setCoordsError("");
  };

  const closeCoordsModal = () => {
    setCoordsTarget(null);
    setCoordsForm({ direccion: "", latitud: null, longitud: null });
    setCoordsError("");
  };

  const handleCoordsDireccionChange = (value: string) => {
    setCoordsError("");
    setCoordsForm((prev) => ({ ...prev, direccion: value, latitud: null, longitud: null }));
  };

  const handleCoordsDireccionSelect = ({
    direccion,
    latitud,
    longitud,
  }: {
    direccion: string;
    latitud: number;
    longitud: number;
  }) => {
    setCoordsError("");
    setCoordsForm({ direccion, latitud, longitud });
  };

  const handleSaveCoords = async () => {
    if (!coordsTarget) return;
    setSavingCoords(true);
    setCoordsError("");
    try {
      await updateClinica(coordsTarget.id, {
        direccion: coordsForm.direccion.trim() || undefined,
        latitud: coordsForm.latitud ?? undefined,
        longitud: coordsForm.longitud ?? undefined,
      });
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

  const loadHistory = (clinicaId: number, page = 1) => {
    setHistoryLoading(true);
    fetchAdminHistory(clinicaId, page, 5)
      .then((res) =>
        setHistoryPage({ data: res.data, page: res.page, lastPage: res.lastPage || 1 }),
      )
      .catch(() => setHistoryPage({ data: [], page: 1, lastPage: 1 }))
      .finally(() => setHistoryLoading(false));
  };

  const openDetail = (c: Clinica) => {
    setDetailTarget(c);
    setChangeAdminEmail("");
    setChangeAdminError("");
    loadHistory(c.id, 1);
  };

  // Permite enlazar directamente a una clínica usando #clinica-row-{id}
  // en la URL: al cargar las clínicas, si el hash coincide con una fila,
  // abrimos su drawer de detalle automáticamente.
  useEffect(() => {
    if (loading || clinicas.length === 0) return;
    const hash = window.location.hash;
    const match = hash.match(/^#clinica-row-(\d+)$/);
    if (!match) return;
    const id = Number(match[1]);
    const clinica = clinicas.find((c) => c.id === id);
    if (clinica) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      openDetail(clinica);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loading, clinicas]);

  const closeDetail = () => {
    setDetailTarget(null);
    setHistoryPage({ data: [], page: 1, lastPage: 1 });
    setChangeAdminEmail("");
    setChangeAdminError("");
  };

  const handleChangeAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!detailTarget) return;
    if (!changeAdminEmail.trim()) {
      setChangeAdminError("El correo del nuevo administrador es obligatorio.");
      return;
    }
    setChangingAdmin(true);
    setChangeAdminError("");
    try {
      const updated = await changeClinicaAdmin(detailTarget.id, {
        newAdminEmail: changeAdminEmail.trim(),
      });
      setDetailTarget(updated);
      setClinicas((prev) => prev.map((c) => (c.id === updated.id ? updated : c)));
      setChangeAdminEmail("");
      success(
        "Administrador actualizado",
        "El nuevo administrador recibirá una contraseña temporal por correo.",
      );
      loadHistory(detailTarget.id, 1);
    } catch (err) {
      setChangeAdminError(
        err instanceof Error ? err.message : "No se pudo cambiar el administrador.",
      );
    } finally {
      setChangingAdmin(false);
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

  const eventsByDate = useMemo(() => {
    const map: Record<string, CalendarEvent[]> = {};
    clinicas
      .filter((c) => c.createdAt)
      .forEach((c) => {
        const key = c.createdAt.slice(0, 10);
        (map[key] ??= []).push({
          id: String(c.id),
          title: c.nombre,
          subtitle: c.direccion || undefined,
          badgeLabel: c.estado === "activa" ? "Activa" : "Inactiva",
          badgeClassName:
            c.estado === "activa"
              ? "bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-800"
              : "bg-slate-100 text-slate-600 border border-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700",
        });
      });
    return map;
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
                <Link
                  href="#tabla-clinicas"
                  className="inline-flex items-center gap-2 rounded-[9px] border-[0.5px] border-[#7C3AED]/30 bg-white/60 px-4 py-2 text-[12px] font-semibold text-[#7C3AED] transition hover:bg-white"
                >
                  <ClipboardList className="h-3.5 w-3.5" />
                  Ver listado
                </Link>
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
                <div className="space-y-2">
                  {ultimasClinicas.map((c) => (
                    <button
                      key={c.id}
                      type="button"
                      onClick={() => openDetail(c)}
                      className="flex w-full items-start gap-2 rounded-[9px] p-1.5 text-left transition hover:-translate-y-0.5 hover:bg-[#F7F6FA] hover:shadow-card-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#7C3AED] dark:hover:bg-slate-800/60"
                    >
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
                    </button>
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
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: i * 0.06 }}
                >
                  <Link
                    href="#tabla-clinicas"
                    className={`block ${cardClass} cursor-pointer transition hover:-translate-y-0.5 hover:shadow-card-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#7C3AED]`}
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
                    <p className="mt-1.5 text-[11px] text-[#555068] dark:text-slate-400">
                      {m.label}
                    </p>
                  </Link>
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
                {(["actual", "anterior"] as const).map((key) => {
                  const isHidden = hiddenChartSeries.has(key);
                  return (
                    <button
                      key={key}
                      type="button"
                      onClick={() =>
                        setHiddenChartSeries((prev) => {
                          const next = new Set(prev);
                          if (next.has(key)) next.delete(key);
                          else next.add(key);
                          return next;
                        })
                      }
                      className={`flex items-center gap-1.5 text-[11px] transition-opacity ${isHidden ? "opacity-40" : ""} text-[#555068] dark:text-slate-400`}
                      aria-pressed={!isHidden}
                    >
                      <span
                        className="inline-block h-2 w-2 rounded-full"
                        style={{ background: CHART_BAR_COLORS[key] }}
                      />
                      {key === "actual" ? "Mes actual" : "Meses anteriores"}
                    </button>
                  );
                })}
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
                    {!hiddenChartSeries.has("actual") && (
                      <Bar
                        dataKey="actual"
                        stackId="clinicas"
                        fill={CHART_BAR_COLORS.actual}
                        radius={[6, 6, 6, 6]}
                      />
                    )}
                    {!hiddenChartSeries.has("anterior") && (
                      <Bar
                        dataKey="anterior"
                        stackId="clinicas"
                        fill={CHART_BAR_COLORS.anterior}
                        radius={[6, 6, 6, 6]}
                      />
                    )}
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            <MonthlyCalendar
              datesWithCitas={datesConClinicas}
              eventsByDate={eventsByDate}
              accentColor="#7C3AED"
              legendLabel="Registros"
              emptyDayMessage="Sin clínicas registradas."
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
                <Link
                  href="#tabla-clinicas"
                  className="flex w-full items-center gap-2 rounded-[9px] border-[0.5px] border-[#E4DFF0] bg-[#F7F6FA] px-3 py-2 text-[11px] font-semibold text-slate-700 transition hover:border-[#7C3AED]/30 hover:bg-[#EDE8FA] dark:border-slate-700/60 dark:bg-slate-800/60 dark:text-slate-300 dark:hover:border-[#7C3AED]/40 dark:hover:bg-[#7C3AED]/10"
                >
                  <ClipboardList className="h-3.5 w-3.5 text-[#7C3AED]" />
                  Ver clínicas
                </Link>
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
            <ClinicasTable
              clinicas={clinicas}
              loading={loading}
              onRowClick={openDetail}
              onCopyLink={handleCopyLink}
              onEditCoords={openCoordsModal}
              onToggleEstado={setToggleTarget}
            />
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
                      <div className="sm:col-span-2">
                        <label className="mb-1 block text-sm font-semibold text-slate-700 dark:text-slate-300">
                          Dirección
                        </label>
                        <AddressAutocomplete
                          name="direccion"
                          value={form.direccion}
                          onChange={handleDireccionChange}
                          onSelect={handleDireccionSelect}
                          placeholder="Busca la dirección de la clínica..."
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
                      <div>
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
                      <div className="sm:col-span-2">
                        <label className="mb-1 block text-sm font-semibold text-slate-700 dark:text-slate-300">
                          Vista previa del mapa
                        </label>
                        <MapPreview lat={formCoords?.latitud} lng={formCoords?.longitud} />
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-section-title mb-3">Administrador inicial</h3>
                    <div className="grid gap-5">
                      <div>
                        <label className="mb-1 block text-sm font-semibold text-slate-700 dark:text-slate-300">
                          Correo del administrador *
                        </label>
                        <input
                          type="email"
                          name="adminEmail"
                          value={form.adminEmail}
                          onChange={handleChange}
                          placeholder="admin@correo.com"
                          className={inputClass}
                          required
                        />
                        <p className="mt-1.5 text-xs text-slate-400">
                          Le enviaremos una contraseña temporal a este correo para que pueda iniciar
                          sesión y configurar su cuenta.
                        </p>
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
                  Busca y selecciona la dirección de la clínica para actualizar su ubicación en el
                  mapa y calcular la distancia con los usuarios al registrarse.
                </p>
                <div>
                  <label className="mb-1 block text-sm font-semibold text-slate-700 dark:text-slate-300">
                    Dirección
                  </label>
                  <AddressAutocomplete
                    value={coordsForm.direccion}
                    onChange={handleCoordsDireccionChange}
                    onSelect={handleCoordsDireccionSelect}
                    placeholder="Busca la dirección de la clínica..."
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-semibold text-slate-700 dark:text-slate-300">
                    Vista previa del mapa
                  </label>
                  <MapPreview lat={coordsForm.latitud} lng={coordsForm.longitud} />
                </div>
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

      {/* Drawer detalle de clínica */}
      <AnimatePresence>
        {detailTarget && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm"
            onClick={closeDetail}
          >
            <motion.aside
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", bounce: 0, duration: 0.3 }}
              className="absolute bottom-0 right-0 top-0 flex w-full max-w-full flex-col overflow-hidden bg-white shadow-2xl dark:bg-slate-950 sm:w-[440px] sm:max-w-[440px]"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4 dark:border-slate-800">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-violet-100 text-violet-700 dark:bg-violet-900/40 dark:text-violet-300">
                    <Building2 className="h-5 w-5" />
                  </div>
                  <div className="min-w-0">
                    <h2 className="truncate text-base font-bold text-slate-900 dark:text-white">
                      {detailTarget.nombre}
                    </h2>
                    <StatusBadge
                      status={detailTarget.estado === "activa" ? "Activa" : "Inactiva"}
                    />
                  </div>
                </div>
                <button
                  onClick={closeDetail}
                  className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
                  aria-label="Cerrar"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <div className="flex-1 space-y-5 overflow-y-auto p-6">
                <div>
                  <h3 className="text-section-title mb-3">Datos generales</h3>
                  <dl className="space-y-3">
                    <div className="flex items-start gap-2">
                      <ClipboardList className="mt-0.5 h-4 w-4 shrink-0 text-slate-400" />
                      <div className="min-w-0">
                        <dt className="text-xs text-slate-400">Slug / enlace de registro</dt>
                        <dd className="flex items-center gap-1.5 text-sm text-slate-700 dark:text-slate-300">
                          <span className="truncate">/register?clinica={detailTarget.slug}</span>
                          <button
                            type="button"
                            onClick={() => handleCopyLink(detailTarget.slug, detailTarget.nombre)}
                            className="shrink-0 rounded-md p-1 text-slate-400 transition hover:bg-slate-100 hover:text-brand-600 dark:hover:bg-slate-800 dark:hover:text-brand-400"
                            aria-label="Copiar enlace de registro"
                            title="Copiar enlace de registro"
                          >
                            <Copy className="h-3.5 w-3.5" />
                          </button>
                        </dd>
                      </div>
                    </div>
                    <div className="flex items-start gap-2">
                      <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-slate-400" />
                      <div className="min-w-0">
                        <dt className="text-xs text-slate-400">Dirección</dt>
                        <dd className="text-sm text-slate-700 dark:text-slate-300">
                          {detailTarget.direccion || "Sin dirección registrada"}
                        </dd>
                      </div>
                    </div>
                    <div className="flex items-start gap-2">
                      <Phone className="mt-0.5 h-4 w-4 shrink-0 text-slate-400" />
                      <div className="min-w-0">
                        <dt className="text-xs text-slate-400">Teléfono</dt>
                        <dd className="text-sm text-slate-700 dark:text-slate-300">
                          {detailTarget.telefono || "—"}
                        </dd>
                      </div>
                    </div>
                    <div className="flex items-start gap-2">
                      <Mail className="mt-0.5 h-4 w-4 shrink-0 text-slate-400" />
                      <div className="min-w-0">
                        <dt className="text-xs text-slate-400">Email de la clínica</dt>
                        <dd className="text-sm text-slate-700 dark:text-slate-300">
                          {detailTarget.email || "—"}
                        </dd>
                      </div>
                    </div>
                    <div className="flex items-start gap-2">
                      <CalendarDays className="mt-0.5 h-4 w-4 shrink-0 text-slate-400" />
                      <div className="min-w-0">
                        <dt className="text-xs text-slate-400">Registrada</dt>
                        <dd className="text-sm text-slate-700 dark:text-slate-300">
                          {detailTarget.createdAt
                            ? new Date(detailTarget.createdAt).toLocaleDateString("es-ES", {
                                day: "2-digit",
                                month: "long",
                                year: "numeric",
                              })
                            : "—"}
                        </dd>
                      </div>
                    </div>
                  </dl>
                </div>

                {detailTarget.latitud != null && detailTarget.longitud != null && (
                  <div>
                    <h3 className="text-section-title mb-3">Ubicación en el mapa</h3>
                    <MapPreview lat={detailTarget.latitud} lng={detailTarget.longitud} />
                  </div>
                )}

                <div>
                  <h3 className="text-section-title mb-3">Administrador actual</h3>
                  {detailTarget.admin ? (
                    <div className="flex items-start gap-2">
                      <User className="mt-0.5 h-4 w-4 shrink-0 text-slate-400" />
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-slate-900 dark:text-white">
                          {detailTarget.admin.nombre || "—"}
                        </p>
                        <p className="text-sm text-slate-500 dark:text-slate-400">
                          {detailTarget.admin.email}
                        </p>
                      </div>
                    </div>
                  ) : (
                    <p className="text-sm text-slate-500 dark:text-slate-400">
                      Esta clínica no tiene administrador asignado.
                    </p>
                  )}
                </div>

                <form
                  onSubmit={handleChangeAdmin}
                  className="rounded-xl border border-slate-200/70 p-4 dark:border-slate-700"
                >
                  <h3 className="text-section-title mb-3">Cambiar administrador</h3>
                  <label className="mb-1 block text-sm font-semibold text-slate-700 dark:text-slate-300">
                    Correo del nuevo administrador
                  </label>
                  <input
                    type="email"
                    value={changeAdminEmail}
                    onChange={(e) => {
                      setChangeAdminEmail(e.target.value);
                      setChangeAdminError("");
                    }}
                    placeholder="nuevo-admin@correo.com"
                    className={inputClass}
                  />
                  <p className="mt-1.5 text-xs text-slate-400">
                    Si el correo no pertenece a un usuario existente, se creará una cuenta y se le
                    enviará una contraseña temporal por email.
                  </p>
                  {changeAdminError && (
                    <div className="dark:bg-danger-950/30 mt-3 rounded-xl border border-danger-200 bg-danger-50 px-3 py-2 text-xs text-danger-700 dark:border-danger-800 dark:text-danger-300">
                      {changeAdminError}
                    </div>
                  )}
                  <button
                    type="submit"
                    disabled={changingAdmin}
                    className="btn-primary mt-3 w-full"
                  >
                    {changingAdmin ? "Cambiando..." : "Asignar nuevo administrador"}
                  </button>
                </form>

                <div>
                  <div className="mb-3 flex items-center gap-2">
                    <History className="h-4 w-4 text-[#7C3AED]" />
                    <h3 className="text-section-title">Historial de administradores</h3>
                  </div>
                  {historyLoading ? (
                    <p className="text-sm text-slate-500 dark:text-slate-400">Cargando...</p>
                  ) : historyPage.data.length === 0 ? (
                    <p className="text-sm text-slate-500 dark:text-slate-400">
                      Sin cambios de administrador registrados.
                    </p>
                  ) : (
                    <div className="space-y-3">
                      {historyPage.data.map((h) => (
                        <div
                          key={h.id}
                          className="rounded-xl border border-slate-200/70 p-3 text-xs dark:border-slate-700"
                        >
                          <p className="text-slate-700 dark:text-slate-300">
                            <span className="font-semibold text-slate-900 dark:text-white">
                              {h.newAdmin.nombre || h.newAdmin.email}
                            </span>{" "}
                            asignado por{" "}
                            <span className="font-medium">
                              {h.changedBy.nombre || h.changedBy.email}
                            </span>
                          </p>
                          {h.previousAdmin && (
                            <p className="mt-0.5 text-slate-400">
                              Reemplazó a {h.previousAdmin.nombre || h.previousAdmin.email}
                            </p>
                          )}
                          <p className="mt-1 text-slate-400">
                            {new Date(h.changedAt).toLocaleString("es-ES", {
                              day: "2-digit",
                              month: "short",
                              year: "numeric",
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </p>
                        </div>
                      ))}
                      {historyPage.lastPage > 1 && (
                        <Pagination
                          page={historyPage.page}
                          totalPages={historyPage.lastPage}
                          onPageChange={(p) => loadHistory(detailTarget.id, p)}
                          className="pt-1"
                        />
                      )}
                    </div>
                  )}
                </div>
              </div>

              <div className="flex justify-end gap-3 border-t border-slate-100 px-6 py-4 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => {
                    const target = detailTarget;
                    closeDetail();
                    if (target) openCoordsModal(target);
                  }}
                  className="btn-secondary"
                >
                  Editar ubicación
                </button>
                <button
                  type="button"
                  onClick={() => {
                    const target = detailTarget;
                    closeDetail();
                    if (target) setToggleTarget(target);
                  }}
                  className={detailTarget.estado === "activa" ? "btn-danger" : "btn-primary"}
                >
                  {detailTarget.estado === "activa" ? "Desactivar" : "Activar"}
                </button>
              </div>
            </motion.aside>
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
