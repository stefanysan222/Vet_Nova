"use client";

import { useEffect, useMemo, useState } from "react";
import { useAuth } from "@/lib/auth-context";
import { fetchCitas } from "../../../lib/api/citas";
import { fetchPropietarioByUsuario } from "../../../lib/api/propietarios";

type Notification = {
  title: string;
  description: string;
  time: string;
  category: string;
  unread: boolean;
  icon: "calendar" | "vaccine" | "payment" | "system";
  color: string;
};

function citaHaciaNotificacion(a: {
  id: string;
  petName: string;
  service: string;
  date: string;
  time: string;
  status: string;
  veterinarian?: string;
}): Notification {
  const esVacuna = /vacun/i.test(a.service);
  const icon: Notification["icon"] = esVacuna ? "vaccine" : "calendar";
  const color = esVacuna
    ? "bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400"
    : "bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400";

  const titulos: Record<string, string> = {
    Confirmada: "Cita confirmada",
    Pendiente: "Solicitud de cita pendiente",
    "En atención": "Tu mascota está en atención",
    "En espera": "Tu mascota está en espera",
    Finalizada: "Consulta finalizada",
    Cancelada: "Cita cancelada",
    "No asistió": "Cita sin asistencia",
    Reprogramada: "Cita reprogramada",
  };

  const descripciones: Record<string, string> = {
    Confirmada: `Tu cita para ${a.petName} (${a.service}) fue confirmada para el ${a.date} a las ${a.time}.`,
    Pendiente: `Se registró una solicitud de cita para ${a.petName} (${a.service}). Espera confirmación.`,
    "En atención": `${a.petName} está siendo atendido/a en este momento.`,
    "En espera": `${a.petName} se encuentra en sala de espera para su cita de ${a.service}.`,
    Finalizada: `La consulta de ${a.petName} (${a.service}) fue finalizada exitosamente.`,
    Cancelada: `La cita de ${a.petName} para ${a.service} fue cancelada.`,
    "No asistió": `${a.petName} no asistió a la cita de ${a.service} del ${a.date}.`,
    Reprogramada: `La cita de ${a.petName} para ${a.service} fue reprogramada.`,
  };

  return {
    title: titulos[a.status] ?? "Notificación de cita",
    description: descripciones[a.status] ?? `Cita de ${a.petName} · ${a.service}`,
    time: a.date,
    category: esVacuna ? "Vacunas" : "Citas",
    unread: ["Confirmada", "Pendiente", "En espera", "En atención"].includes(a.status),
    icon,
    color,
  };
}

export default function NotificacionesPage() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [selectedNotification, setSelectedNotification] = useState<Notification | null>(null);
  const [filter, setFilter] = useState<"all" | "unread" | "read">("all");
  const { user } = useAuth();

  useEffect(() => {
    if (!user) return;
    const uid = Number(user.id);
    fetchPropietarioByUsuario(uid)
      .then((prop) => {
        if (!prop) return fetchCitas(uid);
        return fetchCitas(uid);
      })
      .then((appts) => {
        const limiteFecha = new Date(Date.now() - 30 * 86400000).toISOString().slice(0, 10);
        const recientes = appts
          .filter((a) => a.date >= limiteFecha)
          .sort((a, b) => b.date.localeCompare(a.date));
        setNotifications(recientes.map(citaHaciaNotificacion));
      })
      .catch(() => {});
  }, [user]);

  const unreadCount = notifications.filter((item) => item.unread).length;
  const filteredNotifications = useMemo(() => {
    if (filter === "unread") return notifications.filter((item) => item.unread);
    if (filter === "read") return notifications.filter((item) => !item.unread);
    return notifications;
  }, [filter, notifications]);

  const selected = selectedNotification || null;

  const handleViewAll = () => {
    setFilter("all");
    setSelectedNotification(null);
  };

  return (
    <div className="admin-page h-full overflow-y-auto">
      {/* Header */}
      <div className="mb-8 flex items-start justify-between gap-4">
        <div>
          <h1 className="text-page-title">Notificaciones</h1>
          <p className="text-subtitle mt-2">Centro de alertas y recordatorios</p>
        </div>

        <button type="button" onClick={handleViewAll} className="btn-primary whitespace-nowrap">
          <CheckIcon />
          Ver todas
        </button>
      </div>

      {/* Summary cards */}
      <div className="mb-6 grid grid-cols-2 gap-4 xl:grid-cols-4">
        <SummaryCard
          title="Total"
          value={notifications.length.toString()}
          icon={<BellCardIcon />}
        />

        <SummaryCard title="No leídas" value={unreadCount.toString()} icon={<UnreadIcon />} />

        <SummaryCard
          title="Citas"
          value={notifications.filter((n) => n.category === "Citas").length.toString()}
          icon={<CalendarCardIcon />}
        />

        <SummaryCard
          title="Recordatorios"
          value={notifications.filter((n) => n.category === "Vacunas").length.toString()}
          icon={<ReminderIcon />}
        />
      </div>

      {/* Main content */}
      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[1fr_0.38fr]">
        {/* Notifications list */}
        <section className="admin-card-padded">
          <div className="mb-6 flex items-center justify-between gap-4">
            <div>
              <h2 className="text-section-title">Notificaciones recientes</h2>
              <p className="text-subtitle mt-1">
                Revisa las novedades relacionadas con tus mascotas y citas.
              </p>
            </div>

            <div className="hidden items-center gap-2 md:flex">
              {(["all", "unread", "read"] as const).map((f) => (
                <button
                  key={f}
                  type="button"
                  onClick={() => setFilter(f)}
                  className={`rounded-xl px-4 py-2 text-sm font-semibold transition-all ${
                    filter === f
                      ? "bg-brand-600 text-white shadow-brand-sm"
                      : "text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800"
                  }`}
                >
                  {f === "all" ? "Todas" : f === "unread" ? "No leídas" : "Leídas"}
                </button>
              ))}
            </div>
          </div>

          {filteredNotifications.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-10 text-center dark:border-slate-700 dark:bg-slate-800/50">
              <p className="text-section-title">No hay notificaciones con este filtro.</p>
              <p className="text-subtitle mt-2">
                Presiona &quot;Ver todas&quot; para regresar al listado completo.
              </p>
              <button type="button" onClick={handleViewAll} className="btn-primary mt-5">
                Ver todas
              </button>
            </div>
          ) : (
            <div className="divide-y divide-slate-200 dark:divide-slate-700">
              {filteredNotifications.map((item) => (
                <article
                  key={`${item.title}-${item.time}`}
                  className="flex items-start justify-between gap-5 py-5 first:pt-0 last:pb-0"
                >
                  <div className="flex min-w-0 gap-4">
                    <div
                      className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ${item.color}`}
                    >
                      {item.icon === "calendar" && <CalendarIcon />}
                      {item.icon === "vaccine" && <VaccineIcon />}
                      {item.icon === "payment" && <PaymentIcon />}
                      {item.icon === "system" && <SystemIcon />}
                    </div>

                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
                          {item.title}
                        </h3>
                        {item.unread && <span className="h-2 w-2 rounded-full bg-red-500" />}
                      </div>
                      <p className="mt-1 max-w-[720px] text-sm leading-6 text-slate-500 dark:text-slate-400">
                        {item.description}
                      </p>
                      <div className="mt-2 flex items-center gap-3">
                        <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-semibold text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                          {item.category}
                        </span>
                        <span className="text-xs text-slate-400">{item.time}</span>
                      </div>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => setSelectedNotification(item)}
                    className="shrink-0 rounded-lg px-3 py-1.5 text-xs font-semibold text-brand-600 hover:bg-brand-50 dark:text-brand-400 dark:hover:bg-brand-900/30"
                  >
                    Ver
                  </button>
                </article>
              ))}
            </div>
          )}
        </section>

        {/* Detalle + Preferencias */}
        <div className="space-y-5">
          {/* Detalle de notificación */}
          <aside className="admin-card-padded xl:min-h-[300px]">
            {selected ? (
              <div>
                <div className="mb-4 flex items-center justify-between gap-4">
                  <div>
                    <p className="text-eyebrow">Detalle</p>
                    <h2 className="text-section-title mt-1">{selected.title}</h2>
                  </div>
                  <span
                    className={`rounded-full px-2.5 py-1 text-xs font-semibold ${selected.unread ? "bg-amber-50 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400" : "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300"}`}
                  >
                    {selected.unread ? "No leída" : "Leída"}
                  </span>
                </div>

                <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-800/50">
                  <p className="text-label">Categoría</p>
                  <p className="mt-1 text-sm font-semibold text-slate-900 dark:text-white">
                    {selected.category}
                  </p>
                </div>

                <div className="mt-4 space-y-3">
                  <div>
                    <p className="text-label">Descripción</p>
                    <p className="mt-1 text-sm leading-6 text-slate-600 dark:text-slate-300">
                      {selected.description}
                    </p>
                  </div>
                  <div>
                    <p className="text-label">Fecha</p>
                    <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
                      {selected.time}
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleViewAll}
                  className="btn-primary mt-5 w-full justify-center"
                >
                  Ver todas las notificaciones
                </button>
              </div>
            ) : (
              <div className="flex h-full min-h-[200px] flex-col items-center justify-center rounded-xl border border-dashed border-slate-300 bg-slate-50 p-8 text-center dark:border-slate-700 dark:bg-slate-800/50">
                <p className="text-section-title">Selecciona una notificación</p>
                <p className="text-subtitle mt-2">
                  Haz clic en &quot;Ver&quot; para ver el detalle.
                </p>
                <button type="button" onClick={handleViewAll} className="btn-secondary mt-4">
                  Volver a todas
                </button>
              </div>
            )}
          </aside>

          {/* Preferencias */}
          <section className="admin-card-padded">
            <h2 className="text-section-title">Preferencias</h2>
            <div className="mt-4 space-y-4">
              <PreferenceRow title="Citas" enabled />
              <PreferenceRow title="Vacunas" enabled />
              <PreferenceRow title="Pagos" enabled={false} />
              <PreferenceRow title="Sistema" enabled />
            </div>
          </section>

          <section className="admin-card-padded">
            <h2 className="text-section-title">Resumen</h2>
            <div className="mt-4 space-y-3">
              <SummaryLine label="Notificaciones nuevas" value={unreadCount.toString()} />
              <SummaryLine label="Este mes" value={notifications.length.toString()} />
              <SummaryLine
                label="Recordatorios activos"
                value={notifications
                  .filter((n) => n.unread && n.category === "Vacunas")
                  .length.toString()}
              />
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}

function SummaryCard({
  title,
  value,
  icon,
}: {
  title: string;
  value: string;
  icon: React.ReactNode;
}) {
  return (
    <article className="admin-card flex items-center justify-between px-5 py-4">
      <div>
        <p className="text-label">{title}</p>
        <h3 className="mt-2 text-2xl font-bold text-slate-900 dark:text-white">{value}</h3>
      </div>
      <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-50 text-brand-600 dark:bg-brand-900/30 dark:text-brand-400">
        {icon}
      </div>
    </article>
  );
}

function PreferenceRow({ title, enabled }: { title: string; enabled: boolean }) {
  return (
    <div className="flex items-center justify-between gap-4">
      <p className="text-sm font-semibold text-slate-900 dark:text-white">{title}</p>
      <button
        className={`relative h-6 w-11 rounded-full transition ${enabled ? "bg-brand-600" : "bg-slate-300 dark:bg-slate-600"}`}
      >
        <span
          className={`absolute top-[2px] h-5 w-5 rounded-full bg-white shadow-xs transition ${enabled ? "left-[22px]" : "left-[2px]"}`}
        />
      </button>
    </div>
  );
}

function SummaryLine({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between border-b border-slate-200 pb-3 last:border-b-0 last:pb-0 dark:border-slate-700">
      <span className="text-sm text-slate-500 dark:text-slate-400">{label}</span>
      <span className="text-sm font-semibold text-slate-900 dark:text-white">{value}</span>
    </div>
  );
}

/* Icons */

function CheckIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
      <path
        d="m5 13 4 4L19 7"
        stroke="white"
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function BellCardIcon() {
  return (
    <svg width="23" height="23" viewBox="0 0 24 24" fill="none">
      <path
        d="M15 18H6.5c.7-.8 1.5-2.2 1.5-4.8 0-3.2 1.8-5.2 4.5-5.2s4.5 2 4.5 5.2c0 2.6.8 4 1.5 4.8H15Z"
        stroke="#2563EB"
        strokeWidth="2"
        strokeLinejoin="round"
      />
      <path d="M10 19.2a2.2 2.2 0 0 0 4 0" stroke="#2563EB" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

function UnreadIcon() {
  return (
    <svg width="23" height="23" viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="12" r="8" stroke="#2563EB" strokeWidth="2" />
      <circle cx="12" cy="12" r="3" fill="#2563EB" />
    </svg>
  );
}

function CalendarCardIcon() {
  return (
    <svg width="23" height="23" viewBox="0 0 24 24" fill="none">
      <rect x="3.5" y="5.5" width="17" height="15" rx="2.5" stroke="#2563EB" strokeWidth="2" />
      <path
        d="M7 3.8v3.4M17 3.8v3.4M3.5 9.5h17"
        stroke="#2563EB"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}

function ReminderIcon() {
  return (
    <svg width="23" height="23" viewBox="0 0 24 24" fill="none">
      <path
        d="M12 7v5l3 2"
        stroke="#2563EB"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="12" cy="12" r="9" stroke="#2563EB" strokeWidth="2" />
    </svg>
  );
}

function CalendarIcon() {
  return <CalendarCardIcon />;
}

function VaccineIcon() {
  return (
    <svg width="23" height="23" viewBox="0 0 24 24" fill="none">
      <path
        d="m14 5 5 5M4 20l6.5-6.5M10 7l7 7M8 9l7 7M6.5 17.5 4 15l8-8 5 5-8 8-2.5-2.5Z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function PaymentIcon() {
  return (
    <svg width="23" height="23" viewBox="0 0 24 24" fill="none">
      <path
        d="M12 3v18M15.8 7.2c-.7-.9-2-1.5-3.6-1.5-2.3 0-3.9 1.1-3.9 2.9 0 1.9 1.6 2.5 4.2 3.1 2.5.6 4.1 1.2 4.1 3.1 0 1.8-1.7 3.1-4.1 3.1-1.9 0-3.4-.7-4.2-1.8"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}

function SystemIcon() {
  return (
    <svg width="23" height="23" viewBox="0 0 24 24" fill="none">
      <path
        d="M12 15.2a3.2 3.2 0 1 0 0-6.4 3.2 3.2 0 0 0 0 6.4Z"
        stroke="currentColor"
        strokeWidth="2"
      />
      <path
        d="M19.4 13.2c.1-.4.1-.8.1-1.2s0-.8-.1-1.2l2-1.5-2-3.5-2.4 1a8 8 0 0 0-2-.9L14.7 3h-5.4L9 5.9c-.7.2-1.4.5-2 .9l-2.4-1-2 3.5 2 1.5A7 7 0 0 0 4.5 12c0 .4 0 .8.1 1.2l-2 1.5 2 3.5 2.4-1c.6.4 1.3.7 2 .9l.3 2.9h5.4l.3-2.9c.7-.2 1.4-.5 2-.9l2.4 1 2-3.5-2-1.5Z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinejoin="round"
      />
    </svg>
  );
}
