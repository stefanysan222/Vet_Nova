/// <reference types="vitest/globals" />
import { describe, it, expect } from "vitest";
import {
  isClinicOpen,
  getClinicSlots,
  formatSlot,
  getScheduleLabel,
} from "../utils/clinic-schedule";

// Reference dates (fixed to avoid flakiness):
// 2024-01-01 = Monday
// 2024-01-06 = Saturday
// 2024-01-07 = Sunday
const MONDAY = "2024-01-01";
const SATURDAY = "2024-01-06";
const SUNDAY = "2024-01-07";

describe("isClinicOpen", () => {
  it("returns true for weekday", () => {
    expect(isClinicOpen(MONDAY)).toBe(true);
  });

  it("returns true for Saturday", () => {
    expect(isClinicOpen(SATURDAY)).toBe(true);
  });

  it("returns false for Sunday", () => {
    expect(isClinicOpen(SUNDAY)).toBe(false);
  });

  it("returns false for empty string", () => {
    expect(isClinicOpen("")).toBe(false);
  });
});

describe("getClinicSlots", () => {
  it("returns slots for a weekday (08:00–20:00 every 30 min = 24 slots)", () => {
    const slots = getClinicSlots(MONDAY);
    expect(slots).toHaveLength(24);
    expect(slots[0]).toBe("08:00");
    expect(slots[slots.length - 1]).toBe("19:30");
  });

  it("returns slots for Saturday (08:00–17:00 = 18 slots)", () => {
    const slots = getClinicSlots(SATURDAY);
    expect(slots).toHaveLength(18);
    expect(slots[0]).toBe("08:00");
    expect(slots[slots.length - 1]).toBe("16:30");
  });

  it("returns empty array for Sunday", () => {
    expect(getClinicSlots(SUNDAY)).toEqual([]);
  });

  it("returns empty array for empty string", () => {
    expect(getClinicSlots("")).toEqual([]);
  });

  it("all slots follow HH:MM format", () => {
    const slots = getClinicSlots(MONDAY);
    for (const s of slots) {
      expect(s).toMatch(/^\d{2}:\d{2}$/);
    }
  });
});

describe("formatSlot", () => {
  it("formats midnight as 12:00 AM", () => {
    expect(formatSlot("00:00")).toBe("12:00 AM");
  });

  it("formats noon as 12:00 PM", () => {
    expect(formatSlot("12:00")).toBe("12:00 PM");
  });

  it("formats 08:00 as 08:00 AM", () => {
    expect(formatSlot("08:00")).toBe("08:00 AM");
  });

  it("formats 13:30 as 01:30 PM", () => {
    expect(formatSlot("13:30")).toBe("01:30 PM");
  });

  it("formats 19:30 as 07:30 PM", () => {
    expect(formatSlot("19:30")).toBe("07:30 PM");
  });
});

describe("getScheduleLabel", () => {
  it("returns HH:00 – HH:00 format for weekday", () => {
    expect(getScheduleLabel(MONDAY)).toBe("08:00 – 20:00");
  });

  it("returns Saturday schedule", () => {
    expect(getScheduleLabel(SATURDAY)).toBe("08:00 – 17:00");
  });

  it("returns 'Cerrado' for Sunday", () => {
    expect(getScheduleLabel(SUNDAY)).toBe("Cerrado");
  });

  it("returns empty string for empty input", () => {
    expect(getScheduleLabel("")).toBe("");
  });
});
