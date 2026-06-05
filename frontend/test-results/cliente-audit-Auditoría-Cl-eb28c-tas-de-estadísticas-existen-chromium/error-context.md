# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: cliente-audit.spec.ts >> Auditoría Cliente — Dashboard (/cliente) >> tarjetas de estadísticas existen
- Location: e2e\cliente-audit.spec.ts:161:7

# Error details

```
Error: expect(locator).toBeVisible() failed

Locator: locator('article').first()
Expected: visible
Timeout: 5000ms
Error: element(s) not found

Call log:
  - Expect "toBeVisible" with timeout 5000ms
  - waiting for locator('article').first()

```

```yaml
- alert
- link "Volver al inicio":
  - /url: /
  - img
  - text: Volver al inicio
- link "VetNova VetNova":
  - /url: /
  - img "VetNova"
  - text: VetNova
- img
- text: Clínica veterinaria
- heading "Bienvenido de nuevo" [level=1]
- paragraph: Accede al panel de VetNova para gestionar citas, pacientes y clientes con facilidad.
- button "Continuar con Google" [disabled]
- text: o con correo electrónico Correo electrónico
- img
- textbox "Correo electrónico":
  - /placeholder: tucorreo@ejemplo.com
- text: Contraseña
- img
- textbox "Contraseña":
  - /placeholder: ••••••••
- button:
  - img
- checkbox "Recordarme"
- text: Recordarme
- link "¿Olvidaste tu contraseña?":
  - /url: "#"
- button "Iniciar sesión"
- paragraph:
  - text: ¿Aún no tienes cuenta?
  - link "Crear cuenta":
    - /url: /register
```

# Test source

```ts
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
  125 |     await page.waitForURL(/\/admin/, { timeout: 6000 });
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
> 165 |     await expect(cards.first()).toBeVisible();
      |                                 ^ Error: expect(locator).toBeVisible() failed
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
  226 | 
  227 |   test("paso 1 → botón Siguiente está deshabilitado sin mascota seleccionada", async ({ page }) => {
  228 |     await page.goto("/cliente/agendar/nueva");
  229 |     await page.waitForLoadState("networkidle");
  230 |     const btnNext = page.getByRole("button", { name: /siguiente/i });
  231 |     await btnNext.click();
  232 |     // Debe mostrar error
  233 |     const errorMsg = page.locator("text=/Selecciona una mascota/i");
  234 |     await expect(errorMsg).toBeVisible({ timeout: 3000 });
  235 |   });
  236 | 
  237 |   test("paso 3 — domingo muestra aviso de clínica cerrada", async ({ page }) => {
  238 |     await page.goto("/cliente/agendar/nueva");
  239 |     await page.waitForLoadState("networkidle");
  240 | 
  241 |     // Encontrar el próximo domingo
  242 |     const today = new Date();
  243 |     const daysUntilSunday = (7 - today.getDay()) % 7 || 7;
  244 |     const sunday = new Date(today);
  245 |     sunday.setDate(today.getDate() + daysUntilSunday);
  246 |     const sundayStr = sunday.toISOString().slice(0, 10);
  247 | 
  248 |     // Avanzar al paso 3 si hay mascotas, de lo contrario solo verificar validación
  249 |     const nextBtn = page.getByRole("button", { name: /siguiente/i });
  250 |     await nextBtn.click();
  251 |     // Si no avanza (no hay mascotas) sólo validamos el mensaje de error
  252 |     const errorEl = page.locator("text=/Selecciona una mascota/i");
  253 |     if (await errorEl.count() > 0) {
  254 |       log("/cliente/agendar/nueva", "INFO", "Sin mascotas", "El usuario de prueba no tiene mascotas; se omiten pasos 2-3");
  255 |       return;
  256 |     }
  257 | 
  258 |     // Si avanzó: ir al paso 3 y seleccionar domingo
  259 |     await page.getByRole("button", { name: /siguiente/i }).click();
  260 |     const dateInput = page.locator("input[type='date']");
  261 |     await dateInput.fill(sundayStr);
  262 |     await dateInput.dispatchEvent("change");
  263 |     await expect(page.getByText(/cerrada|Domingo/i)).toBeVisible({ timeout: 4000 });
  264 |   });
  265 | 
```