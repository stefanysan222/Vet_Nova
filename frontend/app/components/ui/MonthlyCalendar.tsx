"use client";

import { useMemo, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useIsDarkMode } from "@/lib/hooks/useDarkMode";

const DAY_LABELS = ["L", "M", "M", "J", "V", "S", "D"];
const MONTH_LABELS = [
  "Enero",
  "Febrero",
  "Marzo",
  "Abril",
  "Mayo",
  "Junio",
  "Julio",
  "Agosto",
  "Septiembre",
  "Octubre",
  "Noviembre",
  "Diciembre",
];

function toDateKey(year: number, month: number, day: number): string {
  return `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

function formatLongDate(key: string): string {
  const [y, m, d] = key.split("-").map(Number);
  return new Date(y, m - 1, d).toLocaleDateString("es-ES", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });
}

export interface CalendarEvent {
  id: string;
  title: string;
  subtitle?: string;
  badgeLabel?: string;
  badgeClassName?: string;
}

interface MonthlyCalendarProps {
  datesWithCitas: Set<string>;
  accentColor?: string;
  legendLabel?: string;
  eventsByDate?: Record<string, CalendarEvent[]>;
  emptyDayMessage?: string;
}

export default function MonthlyCalendar({
  datesWithCitas,
  accentColor = "#7C3AED",
  legendLabel = "Con citas",
  eventsByDate,
  emptyDayMessage = "Sin citas registradas.",
}: MonthlyCalendarProps) {
  const isDark = useIsDarkMode();
  const today = new Date();
  const todayKey = today.toISOString().slice(0, 10);
  const [cursor, setCursor] = useState(new Date(today.getFullYear(), today.getMonth(), 1));
  const [selectedKey, setSelectedKey] = useState<string | null>(null);

  const year = cursor.getFullYear();
  const month = cursor.getMonth();

  const cells = useMemo(() => {
    const firstDay = new Date(year, month, 1).getDay();
    // Convierte domingo (0) a índice 6 para semana que inicia en lunes
    const leadingEmpty = (firstDay + 6) % 7;
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    const result: Array<{ day: number; key: string } | null> = [];
    for (let i = 0; i < leadingEmpty; i++) result.push(null);
    for (let day = 1; day <= daysInMonth; day++) {
      result.push({ day, key: toDateKey(year, month, day) });
    }
    return result;
  }, [year, month]);

  return (
    <div className="rounded-[13px] border-[0.5px] border-[#E4DFF0] bg-white px-4 py-3.5 dark:border-slate-700/60 dark:bg-slate-900">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-[12px] font-semibold capitalize text-slate-900 dark:text-white">
          {MONTH_LABELS[month]} {year}
        </h3>
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => {
              setCursor(new Date(year, month - 1, 1));
              setSelectedKey(null);
            }}
            className="flex h-6 w-6 items-center justify-center rounded-md text-[#555068] transition hover:bg-[#F7F6FA] dark:text-slate-400 dark:hover:bg-slate-800"
            aria-label="Mes anterior"
          >
            <ChevronLeft className="h-3.5 w-3.5" />
          </button>
          <button
            type="button"
            onClick={() => {
              setCursor(new Date(year, month + 1, 1));
              setSelectedKey(null);
            }}
            className="flex h-6 w-6 items-center justify-center rounded-md text-[#555068] transition hover:bg-[#F7F6FA] dark:text-slate-400 dark:hover:bg-slate-800"
            aria-label="Mes siguiente"
          >
            <ChevronRight className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-y-1.5 text-center">
        {DAY_LABELS.map((d, i) => (
          <span key={i} className="text-[11px] font-semibold text-[#555068] dark:text-slate-400">
            {d}
          </span>
        ))}

        {cells.map((cell, i) => {
          if (!cell) return <span key={`empty-${i}`} />;
          const isToday = cell.key === todayKey;
          const isSelected = cell.key === selectedKey;
          const hasCitas = datesWithCitas.has(cell.key);
          return (
            <button
              key={cell.key}
              type="button"
              onClick={() => setSelectedKey((prev) => (prev === cell.key ? null : cell.key))}
              className="flex flex-col items-center gap-0.5 rounded-md py-0.5 transition hover:bg-[#F7F6FA] dark:hover:bg-slate-800"
            >
              <span
                className="flex h-6 w-6 items-center justify-center rounded-full text-[11px]"
                style={
                  isToday
                    ? { background: accentColor, color: "#fff", fontWeight: 600 }
                    : isSelected
                      ? {
                          border: `1.5px solid ${accentColor}`,
                          color: accentColor,
                          fontWeight: 600,
                        }
                      : { color: isDark ? "#CBD5E1" : "#334155" }
                }
              >
                {cell.day}
              </span>
              <span
                className="h-1 w-1 rounded-full"
                style={{ background: hasCitas ? accentColor : "transparent" }}
              />
            </button>
          );
        })}
      </div>

      {selectedKey && (
        <div className="mt-3 border-t border-[#E4DFF0] pt-3 dark:border-slate-700/60">
          <p className="mb-2 text-[11px] font-semibold capitalize text-slate-900 dark:text-white">
            {formatLongDate(selectedKey)}
          </p>
          {eventsByDate?.[selectedKey]?.length ? (
            <div className="space-y-1.5">
              {eventsByDate[selectedKey].map((event) => (
                <div
                  key={event.id}
                  className="flex items-center justify-between gap-2 rounded-lg bg-[#F7F6FA] px-2.5 py-1.5 dark:bg-slate-800/60"
                >
                  <div className="min-w-0">
                    <p className="truncate text-[11px] font-semibold text-slate-900 dark:text-white">
                      {event.title}
                    </p>
                    {event.subtitle && (
                      <p className="truncate text-[10px] text-[#555068] dark:text-slate-400">
                        {event.subtitle}
                      </p>
                    )}
                  </div>
                  {event.badgeLabel && (
                    <span
                      className={`shrink-0 whitespace-nowrap rounded-full px-2 py-0.5 text-[9px] font-semibold ${event.badgeClassName ?? ""}`}
                    >
                      {event.badgeLabel}
                    </span>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-[11px] text-[#555068] dark:text-slate-400">{emptyDayMessage}</p>
          )}
        </div>
      )}

      <div className="mt-3 flex items-center gap-4 border-t border-[#E4DFF0] pt-3 dark:border-slate-700/60">
        <span className="flex items-center gap-1.5 text-[11px] text-[#555068] dark:text-slate-400">
          <span className="h-1.5 w-1.5 rounded-full" style={{ background: accentColor }} />
          {legendLabel}
        </span>
        <span className="flex items-center gap-1.5 text-[11px] text-[#555068] dark:text-slate-400">
          <span className="h-1.5 w-1.5 rounded-full bg-slate-300 dark:bg-slate-600" />
          Libre
        </span>
      </div>
    </div>
  );
}
