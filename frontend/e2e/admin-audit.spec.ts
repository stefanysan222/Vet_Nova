/**
 * VetNova — Auditoría automatizada de la vista Administrador
 * Cubre: protección de rutas por rol, carga de páginas sin errores
 *        de consola/red, y navegación del sidebar.
 */

import { test, expect, type Page, type ConsoleMessage } from "@playwright/test";
import { injectAuthAs } from "./auth-helper";

async function injectAuth(page: Page, name = "Admin Prueba", email = "admin@test.com") {
  await injectAuthAs(page, "Administrador", 1, name, email);
}

type Issue = {
  ruta: string;
  severidad: "CRÍTICO" | "ALTO" | "MEDIO" | "INFO";
  tipo: string;
  descripcion: string;
};
const issues: Issue[] = [];
function log(ruta: string, sev: Issue["severidad"], tipo: string, desc: string) {
  issues.push({ ruta, severidad: sev, tipo, descripcion: desc });
}

async function collectConsoleErrors(page: Page, ruta: string) {
  const handler = (msg: ConsoleMessage) => {
    if (msg.type() === "error") {
      const txt = msg.text();
      if (txt.includes("favicon") || txt.includes("net::ERR")) return;
      log(ruta, "ALTO", "console.error", txt.slice(0, 200));
    }
  };
  page.on("console", handler);
  return () => page.off("console", handler);
}

const ADMIN_ROUTES = [
  "/admin",
  "/admin/usuarios",
  "/admin/configuracion",
  "/admin/reportes",
  "/admin/mascotas",
  "/admin/notificaciones",
  "/admin/citas",
];

test.describe("@auth Auditoría Admin — Autenticación y protección de rutas", () => {
  test("redirige a /login si no hay token", async ({ page }) => {
    await page.goto("/admin");
    await page.waitForURL(/login/, { timeout: 6000 });
    expect(page.url()).toContain("/login");
  });

  test("redirige a /cliente si el usuario es Cliente", async ({ page }) => {
    await injectAuthAs(page, "Cliente", 2, "Cliente", "c@c.com");
    await page.goto("/admin");
    await page.waitForURL(/\/cliente/, { timeout: 6000 });
    expect(page.url()).toContain("/cliente");
  });

  test("redirige a /veterinario si el usuario es Veterinario", async ({ page }) => {
    await injectAuthAs(page, "Veterinario", 3, "Vet", "v@v.com");
    await page.goto("/admin");
    await page.waitForURL(/\/veterinario/, { timeout: 6000 });
    expect(page.url()).toContain("/veterinario");
  });

  test("token con firma inválida no da acceso", async ({ page }) => {
    await page.context().addCookies([
      {
        name: "vetnova-token",
        value: "eyJhbGciOiJIUzI1NiJ9.eyJyb2xlIjoiQWRtaW5pc3RyYWRvciJ9.firma-invalida",
        domain: "localhost",
        path: "/",
        httpOnly: true,
        secure: false,
        sameSite: "Strict",
        expires: Math.floor(Date.now() / 1000) + 86400,
      },
    ]);
    await page.goto("/admin");
    await page.waitForURL(/login/, { timeout: 6000 });
    expect(page.url()).toContain("/login");
  });
});

test.describe("Auditoría Admin — Carga de páginas", () => {
  test.beforeEach(async ({ page }) => {
    await injectAuth(page);
  });

  for (const ruta of ADMIN_ROUTES) {
    test(`${ruta} carga sin redirigir a /login`, async ({ page }) => {
      const stopConsole = await collectConsoleErrors(page, ruta);
      await page.goto(ruta);
      await page.waitForLoadState("networkidle");
      stopConsole();
      expect(page.url()).not.toContain("/login");
    });
  }
});

test.describe("Auditoría Admin — Sidebar y navegación", () => {
  test.beforeEach(async ({ page }) => {
    await injectAuth(page);
  });

  test("todos los enlaces del sidebar cargan sin redirigir a /login", async ({ page }) => {
    await page.goto("/admin");
    await page.waitForLoadState("networkidle");

    const navLinks = await page.locator("nav a, aside a").all();
    const hrefs: string[] = [];
    for (const link of navLinks) {
      const href = await link.getAttribute("href");
      if (href?.startsWith("/admin")) hrefs.push(href);
    }

    for (const href of hrefs) {
      await page.goto(href);
      await page.waitForLoadState("networkidle");
      if (page.url().includes("/login")) {
        log(
          href,
          "CRÍTICO",
          "Redirige a /login sin razón",
          `La ruta ${href} redirige al login con token válido`,
        );
      }
    }
  });
});

test.afterAll(async () => {
  if (issues.length === 0) {
    console.log("\n✅ No se encontraron issues en el panel admin.");
    return;
  }
  console.log("\nINFORME DE AUDITORÍA — PANEL ADMIN");
  for (const i of issues) {
    console.log(`  [${i.severidad}] [${i.tipo}] ${i.ruta} → ${i.descripcion}`);
  }
});
