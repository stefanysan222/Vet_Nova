// Clinic operating hours — day 0 = Sunday, 6 = Saturday
const HOURS: Record<number, { open: number; close: number } | null> = {
  0: null, // Sunday: closed
  1: { open: 8, close: 20 },
  2: { open: 8, close: 20 },
  3: { open: 8, close: 20 },
  4: { open: 8, close: 20 },
  5: { open: 8, close: 20 },
  6: { open: 8, close: 17 }, // Saturday
};

function getDow(dateStr: string): number {
  const [y, m, d] = dateStr.split("-").map(Number);
  return new Date(y, m - 1, d).getDay();
}

/** Returns true if the clinic is open on the given YYYY-MM-DD date */
export function isClinicOpen(dateStr: string): boolean {
  return !!dateStr && HOURS[getDow(dateStr)] !== null;
}

/**
 * Returns the list of "HH:MM" (24 h) time slots available for the given date.
 * Returns empty array if the clinic is closed that day.
 * Slots are every 30 minutes from open to close (exclusive of closing hour).
 */
export function getClinicSlots(dateStr: string): string[] {
  if (!dateStr) return [];
  const h = HOURS[getDow(dateStr)];
  if (!h) return [];
  const slots: string[] = [];
  for (let mins = h.open * 60; mins < h.close * 60; mins += 30) {
    slots.push(
      `${String(Math.floor(mins / 60)).padStart(2, "0")}:${String(mins % 60).padStart(2, "0")}`,
    );
  }
  return slots;
}

/** Formats a "HH:MM" 24-h slot to "HH:MM AM/PM" for display */
export function formatSlot(slot: string): string {
  const [hStr, mStr] = slot.split(":");
  const h = parseInt(hStr, 10);
  const period = h < 12 ? "AM" : "PM";
  const h12 = h === 0 ? 12 : h > 12 ? h - 12 : h;
  return `${String(h12).padStart(2, "0")}:${mStr} ${period}`;
}

/** Human-readable clinic schedule for a date (used in UI banners) */
export function getScheduleLabel(dateStr: string): string {
  if (!dateStr) return "";
  const dow = getDow(dateStr);
  if (HOURS[dow] === null) return "Cerrado";
  const { open, close } = HOURS[dow]!;
  const fmt = (n: number) => `${String(n).padStart(2, "0")}:00`;
  return `${fmt(open)} – ${fmt(close)}`;
}
