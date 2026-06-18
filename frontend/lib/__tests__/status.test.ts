/// <reference types="vitest/globals" />
import { describe, it, expect } from "vitest";
import { getStatusStyle, statusBadgeClasses } from "../utils/status";

describe("getStatusStyle", () => {
  const KNOWN: string[] = [
    "Pendiente",
    "Pendiente de confirmación",
    "Confirmada",
    "En espera",
    "En atención",
    "En proceso",
    "Finalizada",
    "Completada",
    "Atendida",
    "Cancelada",
    "No asistió",
    "Reprogramada",
  ];

  it.each(KNOWN)("returns defined badge/dot/label for '%s'", (status) => {
    const style = getStatusStyle(status);
    expect(typeof style.badge).toBe("string");
    expect(typeof style.dot).toBe("string");
    expect(typeof style.label).toBe("string");
    expect(style.badge.length).toBeGreaterThan(0);
  });

  it("returns fallback for unknown status", () => {
    const style = getStatusStyle("EstadoInventado");
    expect(style.label).toBe("Desconocido");
    expect(style.badge).toContain("slate");
  });

  it("Confirmada uses emerald color family", () => {
    expect(getStatusStyle("Confirmada").badge).toContain("emerald");
    expect(getStatusStyle("Confirmada").dot).toContain("emerald");
  });

  it("Cancelada and 'No asistió' use red color family", () => {
    expect(getStatusStyle("Cancelada").badge).toContain("red");
    expect(getStatusStyle("No asistió").badge).toContain("red");
  });

  it("Pendiente uses amber color family", () => {
    expect(getStatusStyle("Pendiente").badge).toContain("amber");
  });

  it("Reprogramada uses purple color family", () => {
    expect(getStatusStyle("Reprogramada").badge).toContain("purple");
  });
});

describe("statusBadgeClasses", () => {
  it("includes badge classes from status", () => {
    const classes = statusBadgeClasses("Confirmada");
    expect(classes).toContain("emerald");
    expect(classes).toContain("inline-flex");
    expect(classes).toContain("rounded-full");
  });

  it("appends extra className when provided", () => {
    const classes = statusBadgeClasses("Pendiente", "ml-2 mt-1");
    expect(classes).toContain("ml-2 mt-1");
  });

  it("works without extra className", () => {
    expect(() => statusBadgeClasses("Cancelada")).not.toThrow();
  });
});
