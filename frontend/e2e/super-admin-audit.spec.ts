/**
 * VetNova — Auditoría automatizada de la vista SuperAdministrador
 * Cubre: protección de rutas por rol y carga de página sin errores
 *        de consola/red.
 */

import { test, expect, type Page, type ConsoleMessage } from "@playwright/test";
import { injectAuthAs } from "./auth-helper";

async function injectAuth(page: Page, name = "SuperAdmin Prueba", email = "superadmin@test.com") {
  await injectAuthAs(page, "SuperAdministrador", 1, name, email);
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

test.describe("@auth Auditoría SuperAdmin — Autenticación y protección de rutas", () => {
  test("redirige a /login si no hay token", async ({ page }) => {
    await page.goto("/super-admin");
    await page.waitForURL(/login/, { timeout: 6000 });
    expect(page.url()).toContain("/login");
  });

  test("redirige a /admin si el usuario es Administrador (no SuperAdministrador)", async ({
    page,
  }) => {
    await injectAuthAs(page, "Administrador", 2, "Admin", "a@a.com");
    await page.goto("/super-admin");
    await page.waitForURL(/\/admin/, { timeout: 6000 });
    expect(page.url()).toContain("/admin");
  });

  test("redirige a /cliente si el usuario es Cliente", async ({ page }) => {
    await injectAuthAs(page, "Cliente", 3, "Cliente", "c@c.com");
    await page.goto("/super-admin");
    await page.waitForURL(/\/cliente/, { timeout: 6000 });
    expect(page.url()).toContain("/cliente");
  });

  test("un JWT firmado con otro secreto no da acceso (firma inválida)", async ({ page }) => {
    const { SignJWT } = await import("jose");
    const otherSecret = new TextEncoder().encode("secreto-incorrecto-no-coincide-con-el-backend");
    const forged = await new SignJWT({
      sub: "99",
      role: "SuperAdministrador",
      name: "Atacante",
      email: "x@x.com",
    })
      .setProtectedHeader({ alg: "HS256" })
      .setExpirationTime(Math.floor(Date.now() / 1000) + 86400)
      .sign(otherSecret);

    await page.context().addCookies([
      {
        name: "vetnova-token",
        value: forged,
        domain: "localhost",
        path: "/",
        httpOnly: true,
        secure: false,
        sameSite: "Strict",
        expires: Math.floor(Date.now() / 1000) + 86400,
      },
    ]);
    await page.goto("/super-admin");
    await page.waitForURL(/login/, { timeout: 6000 });
    expect(page.url()).toContain("/login");
  });
});

test.describe("Auditoría SuperAdmin — Carga de página", () => {
  test.beforeEach(async ({ page }) => {
    await injectAuth(page);
  });

  test("/super-admin carga sin redirigir a /login", async ({ page }) => {
    const stopConsole = await collectConsoleErrors(page, "/super-admin");
    await page.goto("/super-admin");
    await page.waitForLoadState("networkidle");
    stopConsole();
    expect(page.url()).not.toContain("/login");
  });
});

test.afterAll(async () => {
  if (issues.length === 0) {
    console.log("\n✅ No se encontraron issues en el panel super-admin.");
    return;
  }
  console.log("\nINFORME DE AUDITORÍA — PANEL SUPER-ADMIN");
  for (const i of issues) {
    console.log(`  [${i.severidad}] [${i.tipo}] ${i.ruta} → ${i.descripcion}`);
  }
});
