# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: cliente-audit.spec.ts >> Auditoría Cliente — Autenticación y protección de rutas >> redirige a /admin si el usuario es Administrador
- Location: e2e\cliente-audit.spec.ts:112:7

# Error details

```
TimeoutError: page.waitForURL: Timeout 6000ms exceeded.
=========================== logs ===========================
waiting for navigation until "load"
  navigated to "http://localhost:3001/cliente"
  navigated to "http://localhost:3001/login"
  navigated to "http://localhost:3001/login"
============================================================
```

# Test source

```ts
  25  | async function injectAuth(page: Page, name?: string, email?: string) {
  26  |   await page.addInitScript(
  27  |     ({ token, key }: { token: string; key: string }) => {
  28  |       localStorage.setItem(key, token);
  29  |     },
  30  |     { token: makeFakeJWT(name, email), key: "vetnova-token" }
  31  |   );
  32  | }
  33  | 
  34  | type Issue = {
  35  |   ruta: string;
  36  |   severidad: "CRÍTICO" | "ALTO" | "MEDIO" | "INFO";
  37  |   tipo: string;
  38  |   descripcion: string;
  39  | };
  40  | 
  41  | const issues: Issue[] = [];
  42  | 
  43  | function log(ruta: string, sev: Issue["severidad"], tipo: string, desc: string) {
  44  |   issues.push({ ruta, severidad: sev, tipo, descripcion: desc });
  45  | }
  46  | 
  47  | async function collectConsoleErrors(page: Page, ruta: string) {
  48  |   const handler = (msg: ConsoleMessage) => {
  49  |     if (msg.type() === "error") {
  50  |       const txt = msg.text();
  51  |       // Skip known benign browser errors
  52  |       if (txt.includes("favicon") || txt.includes("net::ERR")) return;
  53  |       log(ruta, "ALTO", "console.error", txt.slice(0, 200));
  54  |     }
  55  |   };
  56  |   page.on("console", handler);
  57  |   return () => page.off("console", handler);
  58  | }
  59  | 
  60  | async function collectNetworkErrors(page: Page, ruta: string) {
  61  |   const handler = (response: { url: () => string; status: () => number }) => {
  62  |     const status = response.status();
  63  |     const url = response.url();
  64  |     if (url.includes("localhost") && status >= 400) {
  65  |       const sev = status === 401 || status === 403 ? "CRÍTICO" : status === 404 ? "MEDIO" : "ALTO";
  66  |       log(ruta, sev, `HTTP ${status}`, url.replace("http://localhost:3000", ""));
  67  |     }
  68  |   };
  69  |   page.on("response", handler);
  70  |   return () => page.off("response", handler);
  71  | }
  72  | 
  73  | // ─── Constantes ───────────────────────────────────────────────────────────────
  74  | const CLIENTE_ROUTES = [
  75  |   "/cliente",
  76  |   "/cliente/agendar",
  77  |   "/cliente/agendar/nueva",
  78  |   "/cliente/mascotas",
  79  |   "/cliente/mascotas/nueva",
  80  |   "/cliente/notificaciones",
  81  |   "/cliente/historial",
  82  |   "/cliente/vacunas",
  83  |   "/cliente/perfil",
  84  |   "/cliente/configuracion",
  85  | ];
  86  | 
  87  | // Strings conocidos como hardcodeados (no deben aparecer con usuario real)
  88  | const HARDCODED_STRINGS = [
  89  |   "Juan Pérez",
  90  |   "usuario@vetnova.com",
  91  |   "+52 555 1234 5678",
  92  |   "Ciudad de México",
  93  |   "Max",          // mascota hardcodeada
  94  |   "Luna",         // mascota hardcodeada
  95  |   "Rocky",
  96  |   "Bella",
  97  |   "Charlie",
  98  |   "Mia",
  99  |   "Última cita registrada",  // actividad hardcodeada en /perfil
  100 |   "Consulta general de Max", // contenido hardcodeado
  101 | ];
  102 | 
  103 | // ─── TESTS ────────────────────────────────────────────────────────────────────
  104 | 
  105 | test.describe("Auditoría Cliente — Autenticación y protección de rutas", () => {
  106 |   test("redirige a /login si no hay token", async ({ page }) => {
  107 |     await page.goto("/cliente");
  108 |     await page.waitForURL(/login/, { timeout: 6000 });
  109 |     expect(page.url()).toContain("/login");
  110 |   });
  111 | 
  112 |   test("redirige a /admin si el usuario es Administrador", async ({ page }) => {
  113 |     await page.addInitScript(
  114 |       ({ token, key }: { token: string; key: string }) => { localStorage.setItem(key, token); },
  115 |       {
  116 |         key: "vetnova-token",
  117 |         token: (() => {
  118 |           const h = btoa(JSON.stringify({ alg: "HS256", typ: "JWT" }));
  119 |           const p = btoa(JSON.stringify({ sub: 1, name: "Admin", email: "a@a.com", role: "Administrador", exp: Math.floor(Date.now() / 1000) + 86400 }));
  120 |           return `${h}.${p}.sig`;
  121 |         })(),
  122 |       }
  123 |     );
  124 |     await page.goto("/cliente");
> 125 |     await page.waitForURL(/\/admin/, { timeout: 6000 });
      |                ^ TimeoutError: page.waitForURL: Timeout 6000ms exceeded.
  126 |     expect(page.url()).toContain("/admin");
  127 |   });
  128 | 
  129 |   test("redirige a /veterinario si el usuario es Veterinario", async ({ page }) => {
  130 |     await page.addInitScript(
  131 |       ({ token, key }: { token: string; key: string }) => { localStorage.setItem(key, token); },
  132 |       {
  133 |         key: "vetnova-token",
  134 |         token: (() => {
  135 |           const h = btoa(JSON.stringify({ alg: "HS256", typ: "JWT" }));
  136 |           const p = btoa(JSON.stringify({ sub: 2, name: "Vet", email: "v@v.com", role: "Veterinario", exp: Math.floor(Date.now() / 1000) + 86400 }));
  137 |           return `${h}.${p}.sig`;
  138 |         })(),
  139 |       }
  140 |     );
  141 |     await page.goto("/cliente");
  142 |     await page.waitForURL(/\/veterinario/, { timeout: 6000 });
  143 |     expect(page.url()).toContain("/veterinario");
  144 |   });
  145 | });
  146 | 
  147 | test.describe("Auditoría Cliente — Dashboard (/cliente)", () => {
  148 |   test.beforeEach(async ({ page }) => { await injectAuth(page); });
  149 | 
  150 |   test("carga correctamente y muestra saludo personalizado", async ({ page }) => {
  151 |     const stopConsole = await collectConsoleErrors(page, "/cliente");
  152 |     await page.goto("/cliente");
  153 |     await page.waitForLoadState("networkidle");
  154 |     stopConsole();
  155 | 
  156 |     // Debe mostrar el nombre del usuario del JWT, no "Juan"
  157 |     const body = await page.textContent("body");
  158 |     expect(body).toContain("María");
  159 |   });
  160 | 
  161 |   test("tarjetas de estadísticas existen", async ({ page }) => {
  162 |     await page.goto("/cliente");
  163 |     await page.waitForLoadState("networkidle");
  164 |     const cards = page.locator("article");
  165 |     await expect(cards.first()).toBeVisible();
  166 |   });
  167 | 
  168 |   test("enlace 'Agendar cita' navega a /cliente/agendar/nueva", async ({ page }) => {
  169 |     await page.goto("/cliente");
  170 |     await page.waitForLoadState("networkidle");
  171 |     const link = page.getByRole("link", { name: /agendar|nueva cita/i }).first();
  172 |     if (await link.count() > 0) {
  173 |       await link.click();
  174 |       await expect(page).toHaveURL(/\/cliente\/agendar/);
  175 |     } else {
  176 |       log("/cliente", "MEDIO", "Enlace faltante", "No se encontró enlace de agendar cita en el dashboard");
  177 |     }
  178 |   });
  179 | });
  180 | 
  181 | test.describe("Auditoría Cliente — Citas (/cliente/agendar)", () => {
  182 |   test.beforeEach(async ({ page }) => { await injectAuth(page); });
  183 | 
  184 |   test("carga la página de citas", async ({ page }) => {
  185 |     const stopConsole = await collectConsoleErrors(page, "/cliente/agendar");
  186 |     const stopNet = await collectNetworkErrors(page, "/cliente/agendar");
  187 |     await page.goto("/cliente/agendar");
  188 |     await page.waitForLoadState("networkidle");
  189 |     stopConsole(); stopNet();
  190 |     await expect(page.locator("h1, h2").first()).toBeVisible();
  191 |   });
  192 | 
  193 |   test("filtros de citas funcionan (Todas / Próximas / Confirmadas / Canceladas)", async ({ page }) => {
  194 |     await page.goto("/cliente/agendar");
  195 |     await page.waitForLoadState("networkidle");
  196 |     for (const filtro of ["Todas", "Próximas", "Confirmadas", "Canceladas"]) {
  197 |       const btn = page.getByRole("button", { name: new RegExp(filtro, "i") });
  198 |       if (await btn.count() > 0) await btn.click();
  199 |     }
  200 |   });
  201 | 
  202 |   test("botón 'Nueva cita' navega al formulario", async ({ page }) => {
  203 |     await page.goto("/cliente/agendar");
  204 |     await page.waitForLoadState("networkidle");
  205 |     const btn = page.getByRole("link", { name: /nueva cita|agendar/i }).first();
  206 |     if (await btn.count() > 0) {
  207 |       await btn.click();
  208 |       await expect(page).toHaveURL(/\/agendar\/nueva/);
  209 |     } else {
  210 |       log("/cliente/agendar", "MEDIO", "Botón faltante", "No se encontró botón 'Nueva cita'");
  211 |     }
  212 |   });
  213 | });
  214 | 
  215 | test.describe("Auditoría Cliente — Nueva cita (/cliente/agendar/nueva)", () => {
  216 |   test.beforeEach(async ({ page }) => { await injectAuth(page); });
  217 | 
  218 |   test("muestra el paso 1 (mascota) al cargar", async ({ page }) => {
  219 |     const stopConsole = await collectConsoleErrors(page, "/cliente/agendar/nueva");
  220 |     await page.goto("/cliente/agendar/nueva");
  221 |     await page.waitForLoadState("networkidle");
  222 |     stopConsole();
  223 |     // Barra de progreso debe existir
  224 |     await expect(page.getByText(/Mascota|mascota/i).first()).toBeVisible();
  225 |   });
```