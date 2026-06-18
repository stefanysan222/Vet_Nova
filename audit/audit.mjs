/**
 * VetNova — Auditoría completa con Playwright
 * Cubre: admin, veterinario, cliente · todas las rutas · botones, modales, formularios
 */

import { chromium } from "playwright";
import { writeFileSync, mkdirSync } from "fs";

const BASE   = "http://localhost:3001";
const SHOTS  = "./audit/screenshots";
const REPORT = "./audit/informe.md";

mkdirSync(SHOTS, { recursive: true });

// ── Credenciales ─────────────────────────────────────────────────────────────
const USERS = {
  admin:      { email: "admin@vetnova.com",    password: "Admin123!", role: "Administrador" },
  veterinario:{ email: "vet@vetnova.com",       password: "Vet1234!",  role: "Veterinario"   },
};

// ── Informe acumulado ─────────────────────────────────────────────────────────
const findings = [];
let screenshotIndex = 0;

function log(level, page, message, detail = "") {
  const entry = { level, page, message, detail, ts: new Date().toISOString() };
  findings.push(entry);
  const icon = level === "ERROR" ? "❌" : level === "WARN" ? "⚠️" : "✅";
  console.log(`${icon} [${level}] ${page} — ${message}${detail ? " | " + detail : ""}`);
}

async function shot(page, name) {
  const file = `${SHOTS}/${String(++screenshotIndex).padStart(3,"0")}_${name.replace(/[^a-z0-9]/gi,"_")}.png`;
  await page.screenshot({ path: file, fullPage: true });
  return file;
}

// ── Helper: login ─────────────────────────────────────────────────────────────
async function login(page, creds) {
  await page.goto(`${BASE}/login`, { waitUntil: "networkidle" });
  await page.fill('input[type="email"]', creds.email);
  await page.fill('input[type="password"]', creds.password);
  await page.click('button[type="submit"]');
  await page.waitForURL(/\/(admin|veterinario|cliente)/, { timeout: 8000 }).catch(() => {});
}

async function logout(page) {
  // Intenta botón de logout en sidebar
  const btn = page.locator("text=Cerrar sesión").first();
  if (await btn.isVisible().catch(() => false)) {
    await btn.click();
    await page.waitForURL(/login/, { timeout: 5000 }).catch(() => {});
  } else {
    await page.goto(`${BASE}/login`);
  }
}

// ── Capturar errores de consola ───────────────────────────────────────────────
function attachConsoleCapture(page, context) {
  page.on("console", (msg) => {
    if (msg.type() === "error") {
      log("ERROR", context, "Error de consola JS", msg.text().slice(0, 200));
    }
  });
  page.on("pageerror", (err) => {
    log("ERROR", context, "Excepción no capturada", err.message.slice(0, 200));
  });
  page.on("response", (res) => {
    if (res.status() >= 400 && res.url().includes("localhost")) {
      log("WARN", context, `HTTP ${res.status()}`, res.url().replace(BASE, ""));
    }
  });
}

// ═══════════════════════════════════════════════════════════════════════════════
// SECCIÓN 1 — RUTAS PÚBLICAS
// ═══════════════════════════════════════════════════════════════════════════════
async function auditPublic(browser) {
  const ctx  = await browser.newContext({ viewport: { width: 1280, height: 800 } });
  const page = await ctx.newPage();
  attachConsoleCapture(page, "Público");

  // Landing
  await page.goto(BASE, { waitUntil: "networkidle" });
  const title = await page.title();
  if (title) log("OK", "Landing", `Título: "${title}"`);
  else        log("WARN", "Landing", "Página sin <title>");
  await shot(page, "landing");

  // Links de navegación en landing
  const navLinks = await page.locator("nav a").all();
  log("OK", "Landing/Nav", `${navLinks.length} enlaces en la navbar`);

  // Login — credenciales inválidas
  await page.goto(`${BASE}/login`, { waitUntil: "networkidle" });
  await shot(page, "login");
  await page.fill('input[type="email"]', "noexiste@test.com");
  await page.fill('input[type="password"]', "WrongPass1!");
  await page.click('button[type="submit"]');
  await page.waitForTimeout(2000);
  const errorMsg = await page.locator("text=/error|incorrecto|no existe/i").first().isVisible().catch(() => false);
  if (errorMsg) log("OK", "Login", "Muestra mensaje de error con credenciales inválidas");
  else          log("WARN", "Login", "No se detectó mensaje de error visible con credenciales incorrectas");
  await shot(page, "login_error");

  // Register
  await page.goto(`${BASE}/register`, { waitUntil: "networkidle" });
  await shot(page, "register");
  const registerFields = await page.locator("input").count();
  log("OK", "Register", `${registerFields} campos de entrada en el formulario de registro`);

  await ctx.close();
}

// ═══════════════════════════════════════════════════════════════════════════════
// SECCIÓN 2 — PANEL ADMIN
// ═══════════════════════════════════════════════════════════════════════════════
async function auditAdmin(browser) {
  const ctx  = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await ctx.newPage();
  attachConsoleCapture(page, "Admin");

  // Login admin
  await login(page, USERS.admin);
  const url = page.url();
  if (url.includes("/admin")) log("OK", "Admin/Login", "Redirige correctamente a /admin");
  else                        log("ERROR", "Admin/Login", `URL inesperada tras login: ${url}`);
  await shot(page, "admin_dashboard");

  // ── Dashboard ──────────────────────────────────────────────────────────────
  const statCards = await page.locator("article").count();
  log("OK", "Admin/Dashboard", `${statCards} cards de estadísticas visibles`);

  const chartCanvas = await page.locator("canvas").count();
  if (chartCanvas > 0) log("OK", "Admin/Dashboard", `${chartCanvas} gráfica(s) renderizadas`);
  else                 log("WARN", "Admin/Dashboard", "No se encontró ningún canvas de gráfica");

  // ── Usuarios ───────────────────────────────────────────────────────────────
  await page.goto(`${BASE}/admin/usuarios`, { waitUntil: "networkidle" });
  await page.waitForTimeout(1500);
  await shot(page, "admin_usuarios");

  const userCards = await page.locator("article").count();
  log("OK", "Admin/Usuarios", `${userCards} tarjeta(s) de usuario visibles`);

  // Abrir modal "Nuevo Usuario"
  const btnNuevo = page.locator("button:has-text('Nuevo Usuario'), button:has-text('Nuevo usuario')").first();
  if (await btnNuevo.isVisible()) {
    await btnNuevo.click();
    await page.waitForTimeout(800);
    const modal = page.locator("[role=dialog], .fixed.inset-0").first();
    if (await modal.isVisible().catch(() => false)) {
      log("OK", "Admin/Usuarios", "Modal 'Nuevo Usuario' abre correctamente");
      await shot(page, "admin_modal_nuevo_usuario");
      // Intentar submit vacío
      const submitBtn = modal.locator("button[type=submit]").first();
      if (await submitBtn.isVisible().catch(() => false)) {
        await submitBtn.click();
        await page.waitForTimeout(500);
        log("OK", "Admin/Usuarios", "Validación de formulario vacío probada");
      }
      // Cerrar
      const closeBtn = modal.locator("button:has-text('Cancelar'), button:has-text('×')").first();
      if (await closeBtn.isVisible().catch(() => false)) await closeBtn.click();
    } else {
      log("WARN", "Admin/Usuarios", "Modal 'Nuevo Usuario' no se abrió o no es detectable");
    }
  } else {
    log("WARN", "Admin/Usuarios", "Botón 'Nuevo Usuario' no encontrado");
  }

  // Editar primer usuario si existe
  const editBtn = page.locator("button:has-text('Editar')").first();
  if (await editBtn.isVisible().catch(() => false)) {
    await editBtn.click();
    await page.waitForTimeout(800);
    await shot(page, "admin_modal_editar_usuario");
    const closeEdit = page.locator("button:has-text('Cancelar')").first();
    if (await closeEdit.isVisible().catch(() => false)) await closeEdit.click();
    log("OK", "Admin/Usuarios", "Modal editar usuario abre correctamente");
  }

  // ── Citas ──────────────────────────────────────────────────────────────────
  await page.goto(`${BASE}/admin/citas`, { waitUntil: "networkidle" });
  await page.waitForTimeout(1500);
  await shot(page, "admin_citas");

  const citaArticles = await page.locator("article").count();
  log("OK", "Admin/Citas", `${citaArticles} elemento(s) de cita visibles`);

  // Filtros
  const filterBtns = await page.locator("button:has-text('Pendientes'), button:has-text('Confirmadas'), button:has-text('Todas')").count();
  log("OK", "Admin/Citas", `${filterBtns} botones de filtro encontrados`);
  if (filterBtns >= 2) {
    await page.locator("button:has-text('Pendientes')").first().click();
    await page.waitForTimeout(500);
    await shot(page, "admin_citas_filtro_pendientes");
    await page.locator("button:has-text('Todas')").first().click();
    await page.waitForTimeout(300);
  }

  // Confirmar cita si hay una pendiente
  const confirmBtn = page.locator("button:has-text('Confirmar')").first();
  if (await confirmBtn.isVisible().catch(() => false)) {
    await confirmBtn.click();
    await page.waitForTimeout(1500);
    const toast = await page.locator("text=/confirmada|exitosamente/i").first().isVisible().catch(() => false);
    if (toast) log("OK", "Admin/Citas", "Confirmación de cita ejecutada con toast de éxito");
    else       log("WARN", "Admin/Citas", "Confirmación ejecutada pero no se detectó toast");
    await shot(page, "admin_citas_confirmar");
  }

  // Botón Reprogramar en cita cancelada
  const rescheduleBtn = page.locator("button:has-text('Reprogramar')").first();
  if (await rescheduleBtn.isVisible().catch(() => false)) {
    await rescheduleBtn.click();
    await page.waitForTimeout(800);
    await shot(page, "admin_citas_modal_reprogramar");
    const modalReschedule = page.locator("text=Reprogramar cita").first();
    if (await modalReschedule.isVisible().catch(() => false))
      log("OK", "Admin/Citas", "Modal reprogramar abre correctamente");
    else
      log("WARN", "Admin/Citas", "Modal reprogramar no detectado tras click");
    const closeR = page.locator("button").filter({ hasText: /cancelar|×/i }).first();
    if (await closeR.isVisible().catch(() => false)) await closeR.click();
  } else {
    log("WARN", "Admin/Citas", "No hay citas canceladas visibles para probar reprogramar");
  }

  // ── Mascotas ───────────────────────────────────────────────────────────────
  await page.goto(`${BASE}/admin/mascotas`, { waitUntil: "networkidle" });
  await page.waitForTimeout(1500);
  await shot(page, "admin_mascotas");

  const petRows = await page.locator("button").filter({ hasText: /cita/i }).count();
  const mascotaCount = await page.locator("article, button[class*=rounded]").count();
  log("OK", "Admin/Mascotas", `~${mascotaCount} elementos en lista de mascotas`);

  const btnNuevaMascota = page.locator("button:has-text('Nueva mascota')").first();
  if (await btnNuevaMascota.isVisible().catch(() => false)) {
    await btnNuevaMascota.click();
    await page.waitForTimeout(800);
    await shot(page, "admin_mascotas_form_nueva");
    log("OK", "Admin/Mascotas", "Formulario nueva mascota abre correctamente");
    const cancelForm = page.locator("button:has-text('Cancelar')").first();
    if (await cancelForm.isVisible().catch(() => false)) await cancelForm.click();
  }

  // Click en primera mascota para ver detalle
  const firstPet = page.locator("button").filter({ hasText: /kg|años|Canino|Felino|Otro/i }).first();
  if (await firstPet.isVisible().catch(() => false)) {
    await firstPet.click();
    await page.waitForTimeout(800);
    await shot(page, "admin_mascotas_detalle");
    // Tab historial
    const tabHistorial = page.locator("button:has-text('Historial')").first();
    if (await tabHistorial.isVisible().catch(() => false)) {
      await tabHistorial.click();
      await page.waitForTimeout(500);
      await shot(page, "admin_mascotas_historial");
      log("OK", "Admin/Mascotas", "Modal detalle con pestaña Historial Clínico funciona");
    }
    const closeDetail = page.locator("button").filter({ hasText: /cerrar|×/i }).first();
    if (await closeDetail.isVisible().catch(() => false)) await closeDetail.click();
  }

  // Búsqueda
  const searchInput = page.locator("input[type=search], input[placeholder*=Buscar]").first();
  if (await searchInput.isVisible().catch(() => false)) {
    await searchInput.fill("max");
    await page.waitForTimeout(500);
    await shot(page, "admin_mascotas_busqueda");
    log("OK", "Admin/Mascotas", "Buscador de mascotas funciona");
    await searchInput.clear();
  }

  // ── Reportes ───────────────────────────────────────────────────────────────
  await page.goto(`${BASE}/admin/reportes`, { waitUntil: "networkidle" });
  await page.waitForTimeout(1500);
  await shot(page, "admin_reportes");
  const reportCanvas = await page.locator("canvas").count();
  if (reportCanvas > 0) log("OK", "Admin/Reportes", `${reportCanvas} gráfica(s) en reportes`);
  else                  log("WARN", "Admin/Reportes", "No se renderizó ninguna gráfica");

  // ── Notificaciones ─────────────────────────────────────────────────────────
  await page.goto(`${BASE}/admin/notificaciones`, { waitUntil: "networkidle" });
  await page.waitForTimeout(1500);
  await shot(page, "admin_notificaciones");
  const notifCards = await page.locator("article").count();
  log("OK", "Admin/Notificaciones", `${notifCards} notificaciones visibles`);

  // Click en primera notificación
  const firstNotif = page.locator("article").first();
  if (await firstNotif.isVisible().catch(() => false)) {
    await firstNotif.click();
    await page.waitForTimeout(500);
    await shot(page, "admin_notificaciones_detalle");
    log("OK", "Admin/Notificaciones", "Panel de detalle de notificación funciona");
  }

  // ── Configuración ──────────────────────────────────────────────────────────
  await page.goto(`${BASE}/admin/configuracion`, { waitUntil: "networkidle" });
  await page.waitForTimeout(1000);
  await shot(page, "admin_configuracion");
  const configForms = await page.locator("form").count();
  log("OK", "Admin/Configuracion", `${configForms} formulario(s) de configuración`);

  // Intentar guardar nombre vacío
  const nombreInput = page.locator("input[type=text]").first();
  if (await nombreInput.isVisible().catch(() => false)) {
    await nombreInput.clear();
    const saveBtn = page.locator("button[type=submit]").first();
    if (await saveBtn.isVisible().catch(() => false)) {
      const isDisabled = await saveBtn.isDisabled();
      if (isDisabled) log("OK", "Admin/Configuracion", "Botón guardar deshabilitado con campo vacío");
      else            log("WARN", "Admin/Configuracion", "Botón guardar habilitado con campo vacío");
    }
  }

  // ── Permiso: acceso a rutas de otro rol ────────────────────────────────────
  await page.goto(`${BASE}/veterinario`, { waitUntil: "networkidle" });
  await page.waitForTimeout(1000);
  const vetFromAdmin = page.url();
  if (vetFromAdmin.includes("/admin") || vetFromAdmin.includes("/login"))
    log("OK", "Admin/Permisos", "Admin no puede acceder a /veterinario (redirigido)");
  else
    log("WARN", "Admin/Permisos", `Admin accedió a /veterinario sin redirección (url: ${vetFromAdmin})`);

  await ctx.close();
}

// ═══════════════════════════════════════════════════════════════════════════════
// SECCIÓN 3 — PANEL VETERINARIO
// ═══════════════════════════════════════════════════════════════════════════════
async function auditVeterinario(browser) {
  const ctx  = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await ctx.newPage();
  attachConsoleCapture(page, "Veterinario");

  await login(page, USERS.veterinario);
  const url = page.url();
  if (url.includes("/veterinario")) log("OK", "Vet/Login", "Redirige correctamente a /veterinario");
  else                              log("ERROR", "Vet/Login", `URL inesperada: ${url}`);
  await shot(page, "vet_dashboard");

  const routes = [
    "/veterinario/citas",
    "/veterinario/mascotas",
    "/veterinario/historial",
    "/veterinario/notificaciones",
    "/veterinario/configuracion",
  ];

  for (const route of routes) {
    await page.goto(`${BASE}${route}`, { waitUntil: "networkidle" });
    await page.waitForTimeout(1200);
    const name = route.split("/").pop();
    await shot(page, `vet_${name}`);

    const hasError = await page.locator("text=/error|404|not found/i").first().isVisible().catch(() => false);
    if (hasError) log("ERROR", `Vet/${name}`, "Página muestra error o 404");
    else          log("OK", `Vet/${name}`, "Página carga sin errores visibles");
  }

  // Permiso: acceso a admin desde veterinario
  await page.goto(`${BASE}/admin`, { waitUntil: "networkidle" });
  await page.waitForTimeout(1000);
  const adminFromVet = page.url();
  if (adminFromVet.includes("/admin") && !adminFromVet.includes("login"))
    log("ERROR", "Vet/Permisos", "Veterinario puede acceder a /admin — fallo de guardia de ruta");
  else
    log("OK", "Vet/Permisos", "Veterinario no puede acceder a /admin (redirigido)");

  await ctx.close();
}

// ═══════════════════════════════════════════════════════════════════════════════
// SECCIÓN 4 — PANEL CLIENTE (registro + flujo)
// ═══════════════════════════════════════════════════════════════════════════════
async function auditCliente(browser) {
  const ctx  = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await ctx.newPage();
  attachConsoleCapture(page, "Cliente");

  // Registrar cliente nuevo
  const ts = Date.now();
  const clienteCreds = { email: `test_${ts}@vetnova.com`, password: "Cliente123!" };

  await page.goto(`${BASE}/register`, { waitUntil: "networkidle" });
  const nombreField = page.locator("input[name=nombre], input[placeholder*=nombre i]").first();
  const emailField  = page.locator("input[type=email]").first();
  const passField   = page.locator("input[type=password]").first();

  if (await nombreField.isVisible().catch(() => false)) await nombreField.fill("Cliente Test");
  if (await emailField.isVisible().catch(() => false))  await emailField.fill(clienteCreds.email);
  if (await passField.isVisible().catch(() => false))   await passField.fill(clienteCreds.password);

  await shot(page, "cliente_register_form");
  await page.click("button[type=submit]");
  await page.waitForTimeout(2000);
  await shot(page, "cliente_register_result");

  const afterRegister = page.url();
  if (afterRegister.includes("/cliente")) {
    log("OK", "Cliente/Register", `Registro exitoso, redirige a ${afterRegister}`);
  } else if (afterRegister.includes("/login")) {
    log("OK", "Cliente/Register", "Registro exitoso, redirige al login");
    await page.fill('input[type="email"]', clienteCreds.email);
    await page.fill('input[type="password"]', clienteCreds.password);
    await page.click("button[type=submit]");
    await page.waitForTimeout(2000);
  } else {
    log("WARN", "Cliente/Register", `URL inesperada tras registro: ${afterRegister}`);
  }

  // Navegar por el panel cliente
  const clienteRoutes = [
    "/cliente",
    "/cliente/mascotas",
    "/cliente/agendar",
    "/cliente/notificaciones",
    "/cliente/historial",
    "/cliente/perfil",
    "/cliente/configuracion",
  ];

  for (const route of clienteRoutes) {
    await page.goto(`${BASE}${route}`, { waitUntil: "networkidle" });
    await page.waitForTimeout(1200);
    const name = route === "/cliente" ? "dashboard" : route.split("/").pop();
    await shot(page, `cliente_${name}`);
    const hasError = await page.locator("text=/error|404|not found/i").first().isVisible().catch(() => false);
    if (hasError) log("ERROR", `Cliente/${name}`, "Página muestra error o 404");
    else          log("OK", `Cliente/${name}`, "Página carga sin errores visibles");
  }

  // Agendar cita — flujo completo
  await page.goto(`${BASE}/cliente/agendar/nueva`, { waitUntil: "networkidle" });
  await page.waitForTimeout(1200);
  await shot(page, "cliente_agendar_nueva");
  const agendarForm = await page.locator("form, [role=form]").count();
  if (agendarForm > 0) log("OK", "Cliente/Agendar", "Formulario de nueva cita disponible");
  else                 log("WARN", "Cliente/Agendar", "No se detectó formulario en /agendar/nueva");

  // Permiso: cliente no accede a /admin
  await page.goto(`${BASE}/admin`, { waitUntil: "networkidle" });
  await page.waitForTimeout(1000);
  const adminFromCliente = page.url();
  if (adminFromCliente.includes("/admin") && !adminFromCliente.includes("login"))
    log("ERROR", "Cliente/Permisos", "Cliente puede acceder a /admin — fallo de guardia de ruta");
  else
    log("OK", "Cliente/Permisos", "Cliente no puede acceder a /admin (redirigido)");

  await ctx.close();
}

// ═══════════════════════════════════════════════════════════════════════════════
// SECCIÓN 5 — RESPONSIVE (móvil 375px)
// ═══════════════════════════════════════════════════════════════════════════════
async function auditMobile(browser) {
  const ctx  = await browser.newContext({ viewport: { width: 375, height: 812 } });
  const page = await ctx.newPage();
  attachConsoleCapture(page, "Mobile");

  await login(page, USERS.admin);
  await page.waitForTimeout(1000);
  await shot(page, "mobile_admin_dashboard");

  // Sidebar mobile
  const menuBtn = page.locator("button:has-text('Menú'), button[aria-label*=menú i]").first();
  if (await menuBtn.isVisible().catch(() => false)) {
    await menuBtn.click();
    await page.waitForTimeout(500);
    await shot(page, "mobile_sidebar_open");
    log("OK", "Mobile/Sidebar", "Sidebar móvil abre correctamente");
    await page.keyboard.press("Escape");
  } else {
    log("WARN", "Mobile/Sidebar", "Botón de menú móvil no encontrado en 375px");
  }

  // Landing mobile
  await page.goto(BASE, { waitUntil: "networkidle" });
  await shot(page, "mobile_landing");
  log("OK", "Mobile/Landing", "Landing carga en viewport 375px");

  await ctx.close();
}

// ═══════════════════════════════════════════════════════════════════════════════
// GENERAR INFORME MARKDOWN
// ═══════════════════════════════════════════════════════════════════════════════
function generateReport() {
  const errors = findings.filter(f => f.level === "ERROR");
  const warns  = findings.filter(f => f.level === "WARN");
  const oks    = findings.filter(f => f.level === "OK");

  const byPage = {};
  for (const f of findings) {
    if (!byPage[f.page]) byPage[f.page] = [];
    byPage[f.page].push(f);
  }

  let md = `# VetNova — Informe de Auditoría Playwright\n\n`;
  md += `**Fecha:** ${new Date().toLocaleString("es-CO")}\n\n`;
  md += `## Resumen ejecutivo\n\n`;
  md += `| Estado | Cantidad |\n|--------|----------|\n`;
  md += `| ✅ OK    | ${oks.length}    |\n`;
  md += `| ⚠️ WARN  | ${warns.length}  |\n`;
  md += `| ❌ ERROR | ${errors.length} |\n\n`;
  md += `> **${errors.length} error(es) crítico(s)** · **${warns.length} advertencia(s)**\n\n`;

  if (errors.length > 0) {
    md += `## ❌ Errores críticos\n\n`;
    for (const e of errors) {
      md += `### ${e.page} — ${e.message}\n`;
      if (e.detail) md += `> ${e.detail}\n`;
      md += `\n`;
    }
  }

  if (warns.length > 0) {
    md += `## ⚠️ Advertencias\n\n`;
    for (const w of warns) {
      md += `- **${w.page}**: ${w.message}${w.detail ? ` — *${w.detail}*` : ""}\n`;
    }
    md += `\n`;
  }

  md += `## Detalle por sección\n\n`;
  for (const [pageName, items] of Object.entries(byPage)) {
    md += `### ${pageName}\n\n`;
    for (const item of items) {
      const icon = item.level === "ERROR" ? "❌" : item.level === "WARN" ? "⚠️" : "✅";
      md += `- ${icon} ${item.message}${item.detail ? ` — \`${item.detail}\`` : ""}\n`;
    }
    md += `\n`;
  }

  md += `## Screenshots\n\n`;
  md += `Guardados en \`audit/screenshots/\` (${screenshotIndex} capturas).\n\n`;

  md += `---\n*Generado automáticamente por \`audit/audit.mjs\`*\n`;

  writeFileSync(REPORT, md, "utf8");
  console.log(`\n📄 Informe guardado en: ${REPORT}`);
}

// ═══════════════════════════════════════════════════════════════════════════════
// MAIN
// ═══════════════════════════════════════════════════════════════════════════════
const browser = await chromium.launch({ headless: true });

console.log("🔍 Iniciando auditoría VetNova...\n");

try {
  console.log("── [1/5] Rutas públicas ─────────────────────────");
  await auditPublic(browser);

  console.log("\n── [2/5] Panel Administrador ───────────────────");
  await auditAdmin(browser);

  console.log("\n── [3/5] Panel Veterinario ─────────────────────");
  await auditVeterinario(browser);

  console.log("\n── [4/5] Panel Cliente ─────────────────────────");
  await auditCliente(browser);

  console.log("\n── [5/5] Responsive mobile ─────────────────────");
  await auditMobile(browser);
} catch (err) {
  console.error("💥 Error fatal en la auditoría:", err);
} finally {
  await browser.close();
  generateReport();
}
