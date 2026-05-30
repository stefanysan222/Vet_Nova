"use client";

import { useMemo, useState } from "react";

type Notification = {
  title: string;
  description: string;
  time: string;
  category: string;
  unread: boolean;
  icon: "calendar" | "vaccine" | "payment" | "system";
  color: string;
};

const notifications: Notification[] = [
  {
    title: "Cita confirmada",
    description: "Tu cita para Max fue confirmada para hoy a las 09:00 AM.",
    time: "Hace 10 min",
    category: "Citas",
    unread: true,
    icon: "calendar",
    color: "bg-[#DBEAFE] text-[#2563EB]",
  },
  {
    title: "Recordatorio de vacunación",
    description: "Luna tiene una vacuna pendiente programada para esta semana.",
    time: "Hace 1 hora",
    category: "Vacunas",
    unread: true,
    icon: "vaccine",
    color: "bg-[#DDF5DE] text-[#2F9E44]",
  },
  {
    title: "Pago registrado",
    description: "Se registró correctamente el pago de la consulta general.",
    time: "Ayer",
    category: "Pagos",
    unread: false,
    icon: "payment",
    color: "bg-[#FBE9A9] text-[#9A6700]",
  },
  {
    title: "Historial actualizado",
    description: "El historial clínico de Rocky fue actualizado por el veterinario.",
    time: "2 días",
    category: "Sistema",
    unread: false,
    icon: "system",
    color: "bg-[#EDE9FE] text-[#6D28D9]",
  },
  {
    title: "Cita reagendada",
    description: "La cita de Bella fue movida para el viernes a las 02:00 PM.",
    time: "3 días",
    category: "Citas",
    unread: false,
    icon: "calendar",
    color: "bg-[#DBEAFE] text-[#2563EB]",
  },
];

export default function NotificacionesPage() {
  const [selectedNotification, setSelectedNotification] = useState<Notification | null>(null);
  const [filter, setFilter] = useState<"all" | "unread" | "read">("all");

  const unreadCount = notifications.filter((item) => item.unread).length;
  const filteredNotifications = useMemo(() => {
    if (filter === "unread") return notifications.filter((item) => item.unread);
    if (filter === "read") return notifications.filter((item) => !item.unread);
    return notifications;
  }, [filter]);

  const selected = selectedNotification || null;

  const handleViewAll = () => {
    setFilter("all");
    setSelectedNotification(null);
  };

  return (
    <div className="h-full overflow-y-auto bg-[#F5F7FB] px-6 py-8">
      {/* Header */}
      <div className="mb-8 flex items-start justify-between gap-4">
        <div>
          <h1 className="text-[24px] font-semibold leading-none text-[#10213A]">
            Notificaciones
          </h1>
          <p className="mt-4 text-[16px] text-[#64748B]">
            Centro de alertas y recordatorios
          </p>
        </div>

        <button
          type="button"
          onClick={handleViewAll}
          className="inline-flex h-[45px] items-center gap-2 rounded-xl bg-[#2F6BFF] px-5 text-[16px] font-semibold text-white shadow-sm"
        >
          <CheckIcon />
          Ver todas las notificaciones
        </button>
      </div>

      {/* Summary cards */}
      <div className="mb-7 grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-4">
        <SummaryCard
          title="Total"
          value={notifications.length.toString()}
          icon={<BellCardIcon />}
        />

        <SummaryCard
          title="No leídas"
          value={unreadCount.toString()}
          icon={<UnreadIcon />}
        />

        <SummaryCard
          title="Citas"
          value="2"
          icon={<CalendarCardIcon />}
        />

        <SummaryCard
          title="Recordatorios"
          value="1"
          icon={<ReminderIcon />}
        />
      </div>

      {/* Main content */}
      <div className="grid grid-cols-1 gap-7 xl:grid-cols-[1fr_0.35fr]">
        {/* Notifications list */}
        <section className="rounded-xl border border-[#CBD5E1] bg-white p-6 shadow-sm">
          <div className="mb-6 flex items-center justify-between gap-4">
            <div>
              <h2 className="text-[20px] font-semibold text-[#10213A]">
                Notificaciones recientes
              </h2>
              <p className="mt-2 text-[14px] text-[#64748B]">
                Revisa las novedades relacionadas con tus mascotas y citas.
              </p>
            </div>

            <div className="hidden items-center gap-2 md:flex">
              <button
                type="button"
                onClick={() => setFilter("all")}
                className={`rounded-xl px-4 py-2 text-[14px] font-semibold ${filter === "all" ? "bg-[#2F6BFF] text-white" : "text-[#10213A] hover:bg-[#F1F5F9]"}`}
              >
                Todas
              </button>
              <button
                type="button"
                onClick={() => setFilter("unread")}
                className={`rounded-xl px-4 py-2 text-[14px] font-semibold ${filter === "unread" ? "bg-[#2F6BFF] text-white" : "text-[#10213A] hover:bg-[#F1F5F9]"}`}
              >
                No leídas
              </button>
              <button
                type="button"
                onClick={() => setFilter("read")}
                className={`rounded-xl px-4 py-2 text-[14px] font-semibold ${filter === "read" ? "bg-[#2F6BFF] text-white" : "text-[#10213A] hover:bg-[#F1F5F9]"}`}
              >
                Leídas
              </button>
            </div>
          </div>

          {filteredNotifications.length === 0 ? (
            <div className="rounded-3xl border border-dashed border-[#CBD5E1] bg-[#F8FAFC] p-10 text-center">
              <p className="text-lg font-semibold text-[#10213A]">No hay notificaciones con este filtro.</p>
              <p className="mt-3 text-sm text-[#64748B]">
                Presiona "Ver todas" para regresar al listado completo.
              </p>
              <button
                type="button"
                onClick={handleViewAll}
                className="mt-6 rounded-full bg-[#2F6BFF] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#2358d8]"
              >
                Ver todas
              </button>
            </div>
          ) : (
            <div className="divide-y divide-[#E2E8F0]">
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
                        <h3 className="text-[16px] font-semibold text-[#10213A]">
                          {item.title}
                        </h3>

                        {item.unread && (
                          <span className="h-2.5 w-2.5 rounded-full bg-[#EF4444]" />
                        )}
                      </div>

                      <p className="mt-2 max-w-[720px] text-[14px] leading-6 text-[#64748B]">
                        {item.description}
                      </p>

                      <div className="mt-3 flex items-center gap-3">
                        <span className="rounded-full bg-[#F1F5F9] px-3 py-1 text-[12px] font-semibold text-[#52698A]">
                          {item.category}
                        </span>
                        <span className="text-[13px] text-[#94A3B8]">
                          {item.time}
                        </span>
                      </div>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => setSelectedNotification(item)}
                    className="shrink-0 rounded-lg px-3 py-2 text-[13px] font-semibold text-[#2F6BFF] hover:bg-[#EFF6FF]"
                  >
                    Ver
                  </button>
                </article>
              ))}
            </div>
          )}
        </section>

        {/* Detalle de notificación */}
        <aside className="rounded-xl border border-[#CBD5E1] bg-white p-6 shadow-sm xl:min-h-[520px]">
          {selected ? (
            <div>
              <div className="mb-4 flex items-center justify-between gap-4">
                <div>
                  <p className="text-sm font-semibold uppercase tracking-[0.24em] text-[#2563EB]">
                    Detalle de notificación
                  </p>
                  <h2 className="mt-2 text-2xl font-semibold text-[#10213A]">{selected.title}</h2>
                </div>
                <span className={`rounded-2xl px-3 py-2 text-sm font-semibold ${selected.unread ? "bg-[#FEF3C7] text-[#92400E]" : "bg-[#E2E8F0] text-[#475569]"}`}>
                  {selected.unread ? "No leída" : "Leída"}
                </span>
              </div>

              <div className="rounded-3xl border border-[#E2E8F0] bg-[#F8FAFC] p-5">
                <p className="text-sm font-semibold text-[#334155]">Categoría</p>
                <p className="mt-2 text-base text-[#10213A]">{selected.category}</p>
              </div>

              <div className="mt-6 space-y-4">
                <div>
                  <p className="text-sm font-semibold text-[#334155]">Descripción</p>
                  <p className="mt-2 text-base leading-7 text-[#475569]">{selected.description}</p>
                </div>

                <div>
                  <p className="text-sm font-semibold text-[#334155]">Fecha</p>
                  <p className="mt-2 text-base leading-7 text-[#475569]">{selected.time}</p>
                </div>
              </div>

              <div className="mt-8">
                <button
                  type="button"
                  onClick={handleViewAll}
                  className="rounded-full bg-[#2F6BFF] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#2358d8]"
                >
                  Ver todas las notificaciones
                </button>
              </div>
            </div>
          ) : (
            <div className="flex h-full flex-col items-center justify-center rounded-3xl border border-dashed border-[#CBD5E1] bg-[#F8FAFC] p-8 text-center">
              <p className="text-xl font-semibold text-[#10213A]">Selecciona una notificación</p>
              <p className="mt-3 text-sm text-[#64748B]">Haz clic en "Ver" para ver todo el detalle de la notificación.</p>
              <button
                type="button"
                onClick={handleViewAll}
                className="mt-6 rounded-full bg-[#2F6BFF] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#2358d8]"
              >
                Volver a todas
              </button>
            </div>
          )}
        </aside>

        {/* Settings card */}
        <aside className="space-y-7">
          <section className="rounded-xl border border-[#CBD5E1] bg-white p-6 shadow-sm">
            <h2 className="text-[18px] font-semibold text-[#10213A]">
              Preferencias
            </h2>

            <div className="mt-6 space-y-5">
              <PreferenceRow title="Citas" enabled />
              <PreferenceRow title="Vacunas" enabled />
              <PreferenceRow title="Pagos" enabled={false} />
              <PreferenceRow title="Sistema" enabled />
            </div>
          </section>

          <section className="rounded-xl border border-[#CBD5E1] bg-white p-6 shadow-sm">
            <h2 className="text-[18px] font-semibold text-[#10213A]">
              Resumen
            </h2>

            <div className="mt-5 space-y-4">
              <SummaryLine label="Notificaciones nuevas" value="2" />
              <SummaryLine label="Esta semana" value="5" />
              <SummaryLine label="Recordatorios activos" value="3" />
            </div>
          </section>
        </aside>
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
    <article className="flex h-[86px] items-center justify-between rounded-xl border border-[#CBD5E1] bg-white px-5 shadow-sm">
      <div>
        <p className="text-[13px] leading-none text-[#64748B]">{title}</p>
        <h3 className="mt-3 text-[22px] font-semibold leading-none text-[#10213A]">
          {value}
        </h3>
      </div>

      <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-[#DBEAFE] text-[#2563EB]">
        {icon}
      </div>
    </article>
  );
}

function PreferenceRow({
  title,
  enabled,
}: {
  title: string;
  enabled: boolean;
}) {
  return (
    <div className="flex items-center justify-between gap-4">
      <p className="text-[15px] font-semibold text-[#10213A]">{title}</p>

      <button
        className={`relative h-[24px] w-[44px] rounded-full transition ${
          enabled ? "bg-[#2F6BFF]" : "bg-[#94A3B8]"
        }`}
      >
        <span
          className={`absolute top-[2px] h-[20px] w-[20px] rounded-full bg-white shadow-sm transition ${
            enabled ? "left-[22px]" : "left-[2px]"
          }`}
        />
      </button>
    </div>
  );
}

function SummaryLine({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between border-b border-[#E2E8F0] pb-3 last:border-b-0 last:pb-0">
      <span className="text-[14px] text-[#64748B]">{label}</span>
      <span className="text-[15px] font-semibold text-[#10213A]">{value}</span>
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
      <path
        d="M10 19.2a2.2 2.2 0 0 0 4 0"
        stroke="#2563EB"
        strokeWidth="2"
        strokeLinecap="round"
      />
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
      <rect
        x="3.5"
        y="5.5"
        width="17"
        height="15"
        rx="2.5"
        stroke="#2563EB"
        strokeWidth="2"
      />
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