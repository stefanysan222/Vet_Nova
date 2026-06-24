"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Calendar as BigCalendar,
  dateFnsLocalizer,
  Views,
  type View,
  type SlotInfo,
} from "react-big-calendar";
import { format, parse, startOfWeek, getDay } from "date-fns";
import { es } from "date-fns/locale";
import "react-big-calendar/lib/css/react-big-calendar.css";
import "./interactive-calendar.css";
import { useIsDarkMode } from "@/lib/hooks/useDarkMode";
import type { Appointment } from "@/lib/recepcionista/types";

// Color "hoy" reutilizado del sistema existente (ver MonthlyCalendar.tsx -> accentColor por defecto / TODAY_ACCENT en dashboards)
const TODAY_ACCENT = "#7C3AED";

const STATUS_EVENT_COLORS: Record<string, string> = {
  Pendiente: "#F59E0B",
  "Pendiente de confirmación": "#F59E0B",
  Confirmada: "#10B981",
  "En espera": "#3B82F6",
  "En atención": "#3B82F6",
  "En proceso": "#3B82F6",
  Finalizada: "#94A3B8",
  Completada: "#94A3B8",
  Atendida: "#94A3B8",
  Cancelada: "#EF4444",
  "No asistió": "#EF4444",
  Reprogramada: "#A855F7",
};

const locales = { es };

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek: () => startOfWeek(new Date(), { weekStartsOn: 1 }),
  getDay,
  locales,
});

const MESSAGES = {
  date: "Fecha",
  time: "Hora",
  event: "Cita",
  allDay: "Todo el día",
  week: "Semana",
  work_week: "Semana laboral",
  day: "Día",
  month: "Mes",
  previous: "Atrás",
  next: "Siguiente",
  yesterday: "Ayer",
  tomorrow: "Mañana",
  today: "Hoy",
  agenda: "Agenda",
  noEventsInRange: "No hay citas en este rango.",
  showMore: (total: number) => `+ ${total} más`,
};

export interface CalendarAppointmentEvent {
  title: string;
  start: Date;
  end: Date;
  resource: Appointment;
}

interface InteractiveCalendarProps {
  events: CalendarAppointmentEvent[];
  onSelectEvent: (event: CalendarAppointmentEvent) => void;
  /** Callback opcional para crear cita desde un slot vacío (solo roles admin/veterinario). */
  onSelectSlot?: (slotInfo: SlotInfo) => void;
  /** Habilita la selección de slots vacíos del calendario. */
  selectable?: boolean;
  /** Altura del calendario en píxeles. */
  height?: number;
  /** Vista inicial — por defecto Mes en desktop y Día en móvil (se ajusta automáticamente). */
  defaultView?: View;
}

function useIsMobile(breakpointPx = 768): boolean {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia(`(max-width: ${breakpointPx - 1}px)`);
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setIsMobile(mq.matches);
    const handler = (e: MediaQueryListEvent) => setIsMobile(e.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, [breakpointPx]);

  return isMobile;
}

export default function InteractiveCalendar({
  events,
  onSelectEvent,
  onSelectSlot,
  selectable = false,
  height = 640,
  defaultView,
}: InteractiveCalendarProps) {
  const isDark = useIsDarkMode();
  const isMobile = useIsMobile();
  const [view, setView] = useState<View>(defaultView ?? (isMobile ? Views.DAY : Views.MONTH));
  const [date, setDate] = useState(new Date());

  // Ajusta la vista automáticamente al cruzar el breakpoint móvil/desktop,
  // salvo que el usuario ya haya elegido explícitamente otra vista compatible.
  useEffect(() => {
    if (isMobile && (view === Views.MONTH || view === Views.WEEK)) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setView(Views.DAY);
    }
  }, [isMobile, view]);

  const allowedViews = useMemo<View[]>(
    () => (isMobile ? [Views.DAY, Views.AGENDA] : [Views.MONTH, Views.WEEK, Views.DAY]),
    [isMobile],
  );

  return (
    <div
      className={`vetnova-calendar rounded-2xl border border-slate-200/70 bg-white p-2 shadow-xs dark:border-slate-700 dark:bg-slate-900 sm:p-4 ${isDark ? "vetnova-calendar--dark" : ""}`}
    >
      <BigCalendar
        localizer={localizer}
        culture="es"
        events={events}
        startAccessor="start"
        endAccessor="end"
        view={view}
        onView={setView}
        views={allowedViews}
        date={date}
        onNavigate={setDate}
        messages={MESSAGES}
        style={{ height }}
        selectable={selectable}
        onSelectEvent={(event) => onSelectEvent(event as CalendarAppointmentEvent)}
        onSelectSlot={onSelectSlot}
        popup
        eventPropGetter={(event) => {
          const appt = (event as CalendarAppointmentEvent).resource;
          const isToday = appt?.date === new Date().toISOString().slice(0, 10);
          const background = isToday
            ? TODAY_ACCENT
            : (STATUS_EVENT_COLORS[appt?.status ?? ""] ?? "#94A3B8");
          return {
            style: {
              backgroundColor: background,
              borderColor: background,
              color: "#fff",
            },
          };
        }}
      />
    </div>
  );
}
