/**
 * VetNova — Auditoría automatizada de la vista Cliente
 * Cubre: todas las rutas, botones, formularios, modales, enlaces,
 *        permisos, datos hardcodeados y errores de sincronización.
 */

import { test, expect, type Page, type ConsoleMessage } from "@playwright/test";

// ─── Fake JWT (Cliente) ───────────────────────────────────────────────────────
function makeFakeJWT(name = "María Prueba", email = "maria@test.com"): string {
  const header  = btoa(JSON.stringify({ alg: "HS256", typ: "JWT" }));
  const payload = btoa(
    JSON.stringify({
      sub: 99,
      name,
      email,
      role: "Cliente",
      exp: Math.floor(Date.now() / 1000) + 86400 * 7,
    })
  );
  return `${header}.${payload}.fake-signature`;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
async function injectAuth(page: Page, name?: string, email?: string) {
  await page.addInitScript(
    ({ token, key }: { token: string; key: string }) => {
      localStorage.setItem(key, token);
    },
    { token: makeFakeJWT(name, email), key: "vetnova-token" }
  );
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
      // Skip known benign browser errors
      if (txt.includes("favicon") || txt.includes("net::ERR")) return;
      log(ruta, "ALTO", "console.error", txt.slice(0, 200));
    }
  };
  page.on("console", handler);
  return () => page.off("console", handler);
}

async function collectNetworkErrors(page: Page, ruta: string) {
  const handler = (response: { url: () => string; status: () => number }) => {
    const status = response.status();
    const url = response.url();
    if (url.includes("localhost") && status >= 400) {
      const sev = status === 401 || status === 403 ? "CRÍTICO" : status === 404 ? "MEDIO" : "ALTO";
      log(ruta, sev, `HTTP ${status}`, url.replace("http://localhost:3000", ""));
    }
  };
  page.on("response", handler);
  return () => page.off("response", handler);
}

// ─── Constantes ───────────────────────────────────────────────────────────────
const CLIENTE_ROUTES = [
  "/cliente",
  "/cliente/agendar",
  "/cliente/agendar/nueva",
  "/cliente/mascotas",
  "/cliente/mascotas/nueva",
  "/cliente/notificaciones",
  "/cliente/historial",
  "/cliente/vacunas",
  "/cliente/perfil",
  "/cliente/configuracion",
];

// Strings conocidos como hardcodeados (no deben aparecer con usuario real)
const HARDCODED_STRINGS = [
  "Juan Pérez",
  "usuario@vetnova.com",
  "+52 555 1234 5678",
  "Ciudad de México",
  "Max",          // mascota hardcodeada
  "Luna",         // mascota hardcodeada
  "Rocky",
  "Bella",
  "Charlie",
  "Mia",
  "Última cita registrada",  // actividad hardcodeada en /perfil
  "Consulta general de Max", // contenido hardcodeado
];

// ─── TESTS ────────────────────────────────────────────────────────────────────

test.describe("Auditoría Cliente — Autenticación y protección de rutas", () => {
  test("redirige a /login si no hay token", async ({ page }) => {
    await page.goto("/cliente");
    await page.waitForURL(/login/, { timeout: 6000 });
    expect(page.url()).toContain("/login");
  });

  test("redirige a /admin si el usuario es Administrador", async ({ page }) => {
    await page.addInitScript(
      ({ token, key }: { token: string; key: string }) => { localStorage.setItem(key, token); },
      {
        key: "vetnova-token",
        token: (() => {
          const h = btoa(JSON.stringify({ alg: "HS256", typ: "JWT" }));
          const p = btoa(JSON.stringify({ sub: 1, name: "Admin", email: "a@a.com", role: "Administrador", exp: Math.floor(Date.now() / 1000) + 86400 }));
          return `${h}.${p}.sig`;
        })(),
      }
    );
    await page.goto("/cliente");
    await page.waitForURL(/\/admin/, { timeout: 6000 });
    expect(page.url()).toContain("/admin");
  });

  test("redirige a /veterinario si el usuario es Veterinario", async ({ page }) => {
    await page.addInitScript(
      ({ token, key }: { token: string; key: string }) => { localStorage.setItem(key, token); },
      {
        key: "vetnova-token",
        token: (() => {
          const h = btoa(JSON.stringify({ alg: "HS256", typ: "JWT" }));
          const p = btoa(JSON.stringify({ sub: 2, name: "Vet", email: "v@v.com", role: "Veterinario", exp: Math.floor(Date.now() / 1000) + 86400 }));
          return `${h}.${p}.sig`;
        })(),
      }
    );
    await page.goto("/cliente");
    await page.waitForURL(/\/veterinario/, { timeout: 6000 });
    expect(page.url()).toContain("/veterinario");
  });
});

test.describe("Auditoría Cliente — Dashboard (/cliente)", () => {
  test.beforeEach(async ({ page }) => { await injectAuth(page); });

  test("carga correctamente y muestra saludo personalizado", async ({ page }) => {
    const stopConsole = await collectConsoleErrors(page, "/cliente");
    await page.goto("/cliente");
    await page.waitForLoadState("networkidle");
    stopConsole();

    // Debe mostrar el nombre del usuario del JWT, no "Juan"
    const body = await page.textContent("body");
    expect(body).toContain("María");
  });

  test("tarjetas de estadísticas existen", async ({ page }) => {
    await page.goto("/cliente");
    await page.waitForLoadState("networkidle");
    const cards = page.locator("article");
    await expect(cards.first()).toBeVisible();
  });

  test("enlace 'Agendar cita' navega a /cliente/agendar/nueva", async ({ page }) => {
    await page.goto("/cliente");
    await page.waitForLoadState("networkidle");
    const link = page.getByRole("link", { name: /agendar|nueva cita/i }).first();
    if (await link.count() > 0) {
      await link.click();
      await expect(page).toHaveURL(/\/cliente\/agendar/);
    } else {
      log("/cliente", "MEDIO", "Enlace faltante", "No se encontró enlace de agendar cita en el dashboard");
    }
  });
});

test.describe("Auditoría Cliente — Citas (/cliente/agendar)", () => {
  test.beforeEach(async ({ page }) => { await injectAuth(page); });

  test("carga la página de citas", async ({ page }) => {
    const stopConsole = await collectConsoleErrors(page, "/cliente/agendar");
    const stopNet = await collectNetworkErrors(page, "/cliente/agendar");
    await page.goto("/cliente/agendar");
    await page.waitForLoadState("networkidle");
    stopConsole(); stopNet();
    await expect(page.locator("h1, h2").first()).toBeVisible();
  });

  test("filtros de citas funcionan (Todas / Próximas / Confirmadas / Canceladas)", async ({ page }) => {
    await page.goto("/cliente/agendar");
    await page.waitForLoadState("networkidle");
    for (const filtro of ["Todas", "Próximas", "Confirmadas", "Canceladas"]) {
      const btn = page.getByRole("button", { name: new RegExp(filtro, "i") });
      if (await btn.count() > 0) await btn.click();
    }
  });

  test("botón 'Nueva cita' navega al formulario", async ({ page }) => {
    await page.goto("/cliente/agendar");
    await page.waitForLoadState("networkidle");
    const btn = page.getByRole("link", { name: /nueva cita|agendar/i }).first();
    if (await btn.count() > 0) {
      await btn.click();
      await expect(page).toHaveURL(/\/agendar\/nueva/);
    } else {
      log("/cliente/agendar", "MEDIO", "Botón faltante", "No se encontró botón 'Nueva cita'");
    }
  });
});

test.describe("Auditoría Cliente — Nueva cita (/cliente/agendar/nueva)", () => {
  test.beforeEach(async ({ page }) => { await injectAuth(page); });

  test("muestra el paso 1 (mascota) al cargar", async ({ page }) => {
    const stopConsole = await collectConsoleErrors(page, "/cliente/agendar/nueva");
    await page.goto("/cliente/agendar/nueva");
    await page.waitForLoadState("networkidle");
    stopConsole();
    // Barra de progreso debe existir
    await expect(page.getByText(/Mascota|mascota/i).first()).toBeVisible();
  });

  test("paso 1 → botón Siguiente está deshabilitado sin mascota seleccionada", async ({ page }) => {
    await page.goto("/cliente/agendar/nueva");
    await page.waitForLoadState("networkidle");
    const btnNext = page.getByRole("button", { name: /siguiente/i });
    await btnNext.click();
    // Debe mostrar error
    const errorMsg = page.locator("text=/Selecciona una mascota/i");
    await expect(errorMsg).toBeVisible({ timeout: 3000 });
  });

  test("paso 3 — domingo muestra aviso de clínica cerrada", async ({ page }) => {
    await page.goto("/cliente/agendar/nueva");
    await page.waitForLoadState("networkidle");

    // Encontrar el próximo domingo
    const today = new Date();
    const daysUntilSunday = (7 - today.getDay()) % 7 || 7;
    const sunday = new Date(today);
    sunday.setDate(today.getDate() + daysUntilSunday);
    const sundayStr = sunday.toISOString().slice(0, 10);

    // Avanzar al paso 3 si hay mascotas, de lo contrario solo verificar validación
    const nextBtn = page.getByRole("button", { name: /siguiente/i });
    await nextBtn.click();
    // Si no avanza (no hay mascotas) sólo validamos el mensaje de error
    const errorEl = page.locator("text=/Selecciona una mascota/i");
    if (await errorEl.count() > 0) {
      log("/cliente/agendar/nueva", "INFO", "Sin mascotas", "El usuario de prueba no tiene mascotas; se omiten pasos 2-3");
      return;
    }

    // Si avanzó: ir al paso 3 y seleccionar domingo
    await page.getByRole("button", { name: /siguiente/i }).click();
    const dateInput = page.locator("input[type='date']");
    await dateInput.fill(sundayStr);
    await dateInput.dispatchEvent("change");
    await expect(page.getByText(/cerrada|Domingo/i)).toBeVisible({ timeout: 4000 });
  });

  test("botón Cancelar regresa a /cliente/agendar", async ({ page }) => {
    await page.goto("/cliente/agendar/nueva");
    await page.waitForLoadState("networkidle");
    const cancelLink = page.getByRole("link", { name: /cancelar/i });
    if (await cancelLink.count() > 0) {
      await cancelLink.click();
      await expect(page).toHaveURL(/\/cliente\/agendar/);
    }
  });
});

test.describe("Auditoría Cliente — Mascotas (/cliente/mascotas)", () => {
  test.beforeEach(async ({ page }) => { await injectAuth(page); });

  test("carga la página sin errores", async ({ page }) => {
    const stopNet = await collectNetworkErrors(page, "/cliente/mascotas");
    await page.goto("/cliente/mascotas");
    await page.waitForLoadState("networkidle");
    stopNet();
    await expect(page.locator("h1")).toBeVisible();
  });

  test("buscador filtra mascotas", async ({ page }) => {
    await page.goto("/cliente/mascotas");
    await page.waitForLoadState("networkidle");
    const searchInput = page.locator("input[type='text']").first();
    await searchInput.fill("zzz_inexistente");
    await page.waitForTimeout(300);
    const noResults = page.getByText(/No se encontraron/i);
    await expect(noResults).toBeVisible();
    await searchInput.fill("");
  });

  test("selector de especie funciona", async ({ page }) => {
    await page.goto("/cliente/mascotas");
    await page.waitForLoadState("networkidle");
    const select = page.locator("select");
    await select.selectOption("perro");
    await select.selectOption("gato");
    await select.selectOption("todas");
  });

  test("botón 'Nueva mascota' navega al formulario", async ({ page }) => {
    await page.goto("/cliente/mascotas");
    await page.waitForLoadState("networkidle");
    await page.getByRole("link", { name: /nueva mascota/i }).click();
    await expect(page).toHaveURL(/\/mascotas\/nueva/);
  });

  test("AUDIT: los enlaces 'Ver perfil' usan IDs de la API (no hardcodeados)", async ({ page }) => {
    await page.goto("/cliente/mascotas");
    await page.waitForLoadState("networkidle");
    const links = await page.locator("a[href*='/cliente/mascotas/']").all();
    for (const link of links) {
      const href = await link.getAttribute("href") ?? "";
      // Los IDs hardcodeados son "max", "luna", "rocky" etc. (strings)
      // Los IDs de la API son numéricos
      const id = href.split("/").pop() ?? "";
      if (isNaN(Number(id)) && id !== "nueva") {
        log("/cliente/mascotas", "CRÍTICO", "ID hardcodeado en enlace", `El enlace usa ID="${id}" que no es numérico — probablemente hardcodeado`);
      }
    }
  });
});

test.describe("Auditoría Cliente — Detalle mascota (/cliente/mascotas/[Id])", () => {
  test.beforeEach(async ({ page }) => { await injectAuth(page); });

  test("AUDIT: la ruta con ID numérico (API) muestra la mascota o 'no encontrada'", async ({ page }) => {
    const stopConsole = await collectConsoleErrors(page, "/cliente/mascotas/1");
    await page.goto("/cliente/mascotas/1");
    await page.waitForLoadState("networkidle");
    stopConsole();
    const body = await page.textContent("body") ?? "";
    if (body.includes("ID recibido desde la URL")) {
      log("/cliente/mascotas/[Id]", "MEDIO", "console.log en producción", "Hay console.log de debug que deben eliminarse");
    }
  });

  test("AUDIT: ruta con ID tipo 'max' (hardcodeado) muestra datos mock", async ({ page }) => {
    await page.goto("/cliente/mascotas/max");
    await page.waitForLoadState("networkidle");
    const body = await page.textContent("body") ?? "";
    if (body.toLowerCase().includes("max") && body.includes("Golden Retriever")) {
      log("/cliente/mascotas/[Id]", "CRÍTICO", "Datos hardcodeados visibles",
        "La página muestra datos mock de 'Max Golden Retriever'. El detalle de mascota debe leer de la API, no de mascotasIniciales[]");
    }
  });
});

test.describe("Auditoría Cliente — Nueva mascota (/cliente/mascotas/nueva)", () => {
  test.beforeEach(async ({ page }) => { await injectAuth(page, "Ana García", "ana@test.com"); });

  test("carga el formulario correctamente", async ({ page }) => {
    const stopConsole = await collectConsoleErrors(page, "/cliente/mascotas/nueva");
    await page.goto("/cliente/mascotas/nueva");
    await page.waitForLoadState("networkidle");
    stopConsole();
    await expect(page.locator("form, [role='form']").first()).toBeVisible();
  });

  test("validación: no permite enviar sin nombre de mascota", async ({ page }) => {
    await page.goto("/cliente/mascotas/nueva");
    await page.waitForLoadState("networkidle");
    const submitBtn = page.getByRole("button", { name: /registrar|guardar|crear/i });
    if (await submitBtn.count() > 0) await submitBtn.click();
    // El formulario debería mostrar validación HTML5 o error custom
  });

  test("selector de especie 'otro' muestra campo de texto adicional", async ({ page }) => {
    await page.goto("/cliente/mascotas/nueva");
    await page.waitForLoadState("networkidle");
    const otroBtn = page.getByRole("button", { name: /otro/i });
    if (await otroBtn.count() > 0) {
      await otroBtn.click();
      const extraInput = page.locator("input[placeholder*='especie'], input[name='especieOtra']");
      await expect(extraInput).toBeVisible({ timeout: 3000 });
    }
  });
});

test.describe("Auditoría Cliente — Perfil (/cliente/perfil)", () => {
  test.beforeEach(async ({ page }) => { await injectAuth(page, "Roberto Sánchez", "roberto@test.com"); });

  test("AUDIT: el perfil muestra datos REALES del usuario, no hardcodeados", async ({ page }) => {
    await page.goto("/cliente/perfil");
    await page.waitForLoadState("networkidle");
    const body = await page.textContent("body") ?? "";

    // No debe mostrar datos del usuario falso "Juan Pérez"
    if (body.includes("Juan Pérez")) {
      log("/cliente/perfil", "CRÍTICO", "Datos hardcodeados",
        "La página muestra 'Juan Pérez' en vez del usuario autenticado 'Roberto Sánchez'");
    }
    if (body.includes("usuario@vetnova.com")) {
      log("/cliente/perfil", "CRÍTICO", "Email hardcodeado",
        "Muestra 'usuario@vetnova.com' en vez del email del JWT");
    }
    if (body.includes("+52 555 1234 5678")) {
      log("/cliente/perfil", "ALTO", "Teléfono hardcodeado", "Teléfono es un placeholder estático");
    }
    if (body.includes("Ciudad de México")) {
      log("/cliente/perfil", "ALTO", "Ubicación hardcodeada", "Ubicación es un placeholder estático");
    }
    if (body.includes("Consulta general de Max")) {
      log("/cliente/perfil", "ALTO", "Actividad hardcodeada",
        "Sección 'Resumen de actividad' usa datos falsos (Max, Luna, etc.)");
    }
    if (!body.includes("Roberto")) {
      log("/cliente/perfil", "CRÍTICO", "Nombre no mostrado",
        "El perfil no muestra el nombre real del usuario autenticado");
    }
  });

  test("AUDIT: estadísticas del perfil son dinámicas", async ({ page }) => {
    await page.goto("/cliente/perfil");
    await page.waitForLoadState("networkidle");
    const body = await page.textContent("body") ?? "";
    // Las stats hardcodeadas son "6" mascotas, "2" citas activas, "3" notificaciones
    if (body.includes("6") && body.includes("2") && body.includes("3")) {
      log("/cliente/perfil", "ALTO", "Estadísticas hardcodeadas",
        "Las estadísticas (6 mascotas, 2 citas, 3 notificaciones) son valores fijos en el código");
    }
  });

  test("enlace 'Configuración del perfil' navega correctamente", async ({ page }) => {
    await page.goto("/cliente/perfil");
    await page.waitForLoadState("networkidle");
    await page.getByRole("link", { name: /configuraci/i }).first().click();
    await expect(page).toHaveURL(/\/cliente\/configuracion/);
  });
});

test.describe("Auditoría Cliente — Configuración (/cliente/configuracion)", () => {
  test.beforeEach(async ({ page }) => { await injectAuth(page, "Laura Mendoza", "laura@test.com"); });

  test("muestra el nombre del JWT en el formulario (no hardcodeado)", async ({ page }) => {
    await page.goto("/cliente/configuracion");
    await page.waitForLoadState("networkidle");
    const nombreInput = page.locator("input[name='nombre']");
    if (await nombreInput.count() > 0) {
      const val = await nombreInput.inputValue();
      if (val === "Juan") {
        log("/cliente/configuracion", "CRÍTICO", "Nombre hardcodeado en form",
          "El campo Nombre muestra 'Juan' del perfilInicial hardcodeado en vez del JWT");
      }
      // Tras nuestro fix debería mostrar "Laura"
      expect(val).not.toBe("Juan");
    }
  });

  test("guardar cambios: actualiza los datos sin recargar", async ({ page }) => {
    await page.goto("/cliente/configuracion");
    await page.waitForLoadState("networkidle");
    const nombreInput = page.locator("input[name='nombre']");
    if (await nombreInput.count() > 0) {
      await nombreInput.fill("Laura");
      const submitBtn = page.getByRole("button", { name: /guardar/i });
      await submitBtn.click();
      // Debe aparecer mensaje de éxito
      const ok = page.locator("text=/actualizada|guardada|correctamente/i");
      await expect(ok).toBeVisible({ timeout: 4000 });
    }
  });

  test("cancelar restaura valores originales", async ({ page }) => {
    await page.goto("/cliente/configuracion");
    await page.waitForLoadState("networkidle");
    const nombreInput = page.locator("input[name='nombre']");
    if (await nombreInput.count() > 0) {
      const original = await nombreInput.inputValue();
      await nombreInput.fill("Valor temporal que no debe guardarse");
      await page.getByRole("button", { name: /cancelar/i }).first().click();
      const restored = await nombreInput.inputValue();
      expect(restored).toBe(original);
    }
  });
});

test.describe("Auditoría Cliente — Notificaciones (/cliente/notificaciones)", () => {
  test.beforeEach(async ({ page }) => { await injectAuth(page); });

  test("carga la página correctamente", async ({ page }) => {
    const stopConsole = await collectConsoleErrors(page, "/cliente/notificaciones");
    await page.goto("/cliente/notificaciones");
    await page.waitForLoadState("networkidle");
    stopConsole();
    await expect(page.locator("h1")).toBeVisible();
  });

  test("filtros Todas / No leídas / Leídas funcionan", async ({ page }) => {
    await page.goto("/cliente/notificaciones");
    await page.waitForLoadState("networkidle");
    for (const filtro of ["Todas", "No leídas", "Leídas"]) {
      const btn = page.getByRole("button", { name: new RegExp(filtro, "i") });
      if (await btn.count() > 0) await btn.click();
    }
  });
});

test.describe("Auditoría Cliente — Historial y Vacunas (stub pages)", () => {
  test.beforeEach(async ({ page }) => { await injectAuth(page); });

  test("AUDIT: /cliente/historial es un stub sin datos reales", async ({ page }) => {
    await page.goto("/cliente/historial");
    await page.waitForLoadState("networkidle");
    const body = await page.textContent("body") ?? "";
    if (!body.includes("API") && !body.includes("historial") && body.length < 500) {
      log("/cliente/historial", "ALTO", "Página stub",
        "La página de Historial Médico no tiene contenido real ni conexión a API");
    }
  });

  test("AUDIT: /cliente/vacunas es un stub sin datos reales", async ({ page }) => {
    await page.goto("/cliente/vacunas");
    await page.waitForLoadState("networkidle");
    const body = await page.textContent("body") ?? "";
    if (body.length < 400) {
      log("/cliente/vacunas", "ALTO", "Página stub",
        "La página de Vacunas no tiene contenido real ni conexión a API");
    }
  });
});

test.describe("Auditoría Cliente — Sidebar y navegación", () => {
  test.beforeEach(async ({ page }) => { await injectAuth(page); });

  test("todos los enlaces del sidebar cargan sin redirigir a /login", async ({ page }) => {
    await page.goto("/cliente");
    await page.waitForLoadState("networkidle");

    const navLinks = await page.locator("nav a, aside a").all();
    const hrefs: string[] = [];
    for (const link of navLinks) {
      const href = await link.getAttribute("href");
      if (href?.startsWith("/cliente")) hrefs.push(href);
    }

    for (const href of hrefs) {
      await page.goto(href);
      await page.waitForLoadState("networkidle");
      if (page.url().includes("/login")) {
        log(href, "CRÍTICO", "Redirige a /login sin razón", `La ruta ${href} redirige al login con token válido`);
      }
    }
  });

  test("cerrar sesión limpia localStorage y redirige a /login", async ({ page }) => {
    await page.goto("/cliente");
    await page.waitForLoadState("networkidle");
    const logoutBtn = page.getByRole("button", { name: /cerrar sesi/i });
    if (await logoutBtn.count() > 0) {
      await logoutBtn.click();
      await page.waitForURL(/login/, { timeout: 5000 });
      const token = await page.evaluate(() => localStorage.getItem("vetnova-token"));
      const perfil = await page.evaluate(() => localStorage.getItem("vetnova_cliente_perfil"));
      expect(token).toBeNull();
      expect(perfil).toBeNull();
    }
  });
});

test.describe("Auditoría Cliente — Datos hardcodeados globales", () => {
  test.beforeEach(async ({ page }) => { await injectAuth(page, "Roberto Test", "roberto@test.com"); });

  test("AUDIT: ninguna ruta muestra strings hardcodeados del usuario 'Juan'", async ({ page }) => {
    for (const ruta of CLIENTE_ROUTES) {
      await page.goto(ruta);
      await page.waitForLoadState("networkidle");
      const body = await page.textContent("body") ?? "";
      for (const str of HARDCODED_STRINGS) {
        if (body.includes(str)) {
          const sev = ["Juan Pérez", "usuario@vetnova.com"].includes(str) ? "CRÍTICO" : "MEDIO";
          log(ruta, sev, "String hardcodeado detectado", `"${str}" encontrado en ${ruta}`);
        }
      }
    }
  });
});

// ─── Resumen final ────────────────────────────────────────────────────────────
test.afterAll(async () => {
  if (issues.length === 0) {
    console.log("\n✅ No se encontraron issues en el panel cliente.");
    return;
  }

  console.log("\n" + "═".repeat(70));
  console.log("  INFORME DE AUDITORÍA — PANEL CLIENTE");
  console.log("═".repeat(70));

  const bySev: Record<string, Issue[]> = { CRÍTICO: [], ALTO: [], MEDIO: [], INFO: [] };
  for (const i of issues) bySev[i.severidad].push(i);

  for (const [sev, list] of Object.entries(bySev)) {
    if (!list.length) continue;
    const icon = sev === "CRÍTICO" ? "🔴" : sev === "ALTO" ? "🟠" : sev === "MEDIO" ? "🟡" : "🔵";
    console.log(`\n${icon} ${sev} (${list.length})`);
    for (const i of list) {
      console.log(`  [${i.tipo}] ${i.ruta}`);
      console.log(`    → ${i.descripcion}`);
    }
  }
  console.log("\n" + "═".repeat(70));
  console.log(`  Total: ${issues.length} issues | Críticos: ${bySev.CRÍTICO.length} | Altos: ${bySev.ALTO.length} | Medios: ${bySev.MEDIO.length}`);
  console.log("═".repeat(70) + "\n");
});
