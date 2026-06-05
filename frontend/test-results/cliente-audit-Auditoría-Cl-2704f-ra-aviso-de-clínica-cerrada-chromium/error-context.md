# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: cliente-audit.spec.ts >> Auditoría Cliente — Nueva cita (/cliente/agendar/nueva) >> paso 3 — domingo muestra aviso de clínica cerrada
- Location: e2e\cliente-audit.spec.ts:237:7

# Error details

```
TimeoutError: locator.click: Timeout 8000ms exceeded.
Call log:
  - waiting for getByRole('button', { name: /siguiente/i })

```

# Test source

```ts
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
> 250 |     await nextBtn.click();
      |                   ^ TimeoutError: locator.click: Timeout 8000ms exceeded.
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
  266 |   test("botón Cancelar regresa a /cliente/agendar", async ({ page }) => {
  267 |     await page.goto("/cliente/agendar/nueva");
  268 |     await page.waitForLoadState("networkidle");
  269 |     const cancelLink = page.getByRole("link", { name: /cancelar/i });
  270 |     if (await cancelLink.count() > 0) {
  271 |       await cancelLink.click();
  272 |       await expect(page).toHaveURL(/\/cliente\/agendar/);
  273 |     }
  274 |   });
  275 | });
  276 | 
  277 | test.describe("Auditoría Cliente — Mascotas (/cliente/mascotas)", () => {
  278 |   test.beforeEach(async ({ page }) => { await injectAuth(page); });
  279 | 
  280 |   test("carga la página sin errores", async ({ page }) => {
  281 |     const stopNet = await collectNetworkErrors(page, "/cliente/mascotas");
  282 |     await page.goto("/cliente/mascotas");
  283 |     await page.waitForLoadState("networkidle");
  284 |     stopNet();
  285 |     await expect(page.locator("h1")).toBeVisible();
  286 |   });
  287 | 
  288 |   test("buscador filtra mascotas", async ({ page }) => {
  289 |     await page.goto("/cliente/mascotas");
  290 |     await page.waitForLoadState("networkidle");
  291 |     const searchInput = page.locator("input[type='text']").first();
  292 |     await searchInput.fill("zzz_inexistente");
  293 |     await page.waitForTimeout(300);
  294 |     const noResults = page.getByText(/No se encontraron/i);
  295 |     await expect(noResults).toBeVisible();
  296 |     await searchInput.fill("");
  297 |   });
  298 | 
  299 |   test("selector de especie funciona", async ({ page }) => {
  300 |     await page.goto("/cliente/mascotas");
  301 |     await page.waitForLoadState("networkidle");
  302 |     const select = page.locator("select");
  303 |     await select.selectOption("perro");
  304 |     await select.selectOption("gato");
  305 |     await select.selectOption("todas");
  306 |   });
  307 | 
  308 |   test("botón 'Nueva mascota' navega al formulario", async ({ page }) => {
  309 |     await page.goto("/cliente/mascotas");
  310 |     await page.waitForLoadState("networkidle");
  311 |     await page.getByRole("link", { name: /nueva mascota/i }).click();
  312 |     await expect(page).toHaveURL(/\/mascotas\/nueva/);
  313 |   });
  314 | 
  315 |   test("AUDIT: los enlaces 'Ver perfil' usan IDs de la API (no hardcodeados)", async ({ page }) => {
  316 |     await page.goto("/cliente/mascotas");
  317 |     await page.waitForLoadState("networkidle");
  318 |     const links = await page.locator("a[href*='/cliente/mascotas/']").all();
  319 |     for (const link of links) {
  320 |       const href = await link.getAttribute("href") ?? "";
  321 |       // Los IDs hardcodeados son "max", "luna", "rocky" etc. (strings)
  322 |       // Los IDs de la API son numéricos
  323 |       const id = href.split("/").pop() ?? "";
  324 |       if (isNaN(Number(id)) && id !== "nueva") {
  325 |         log("/cliente/mascotas", "CRÍTICO", "ID hardcodeado en enlace", `El enlace usa ID="${id}" que no es numérico — probablemente hardcodeado`);
  326 |       }
  327 |     }
  328 |   });
  329 | });
  330 | 
  331 | test.describe("Auditoría Cliente — Detalle mascota (/cliente/mascotas/[Id])", () => {
  332 |   test.beforeEach(async ({ page }) => { await injectAuth(page); });
  333 | 
  334 |   test("AUDIT: la ruta con ID numérico (API) muestra la mascota o 'no encontrada'", async ({ page }) => {
  335 |     const stopConsole = await collectConsoleErrors(page, "/cliente/mascotas/1");
  336 |     await page.goto("/cliente/mascotas/1");
  337 |     await page.waitForLoadState("networkidle");
  338 |     stopConsole();
  339 |     const body = await page.textContent("body") ?? "";
  340 |     if (body.includes("ID recibido desde la URL")) {
  341 |       log("/cliente/mascotas/[Id]", "MEDIO", "console.log en producción", "Hay console.log de debug que deben eliminarse");
  342 |     }
  343 |   });
  344 | 
  345 |   test("AUDIT: ruta con ID tipo 'max' (hardcodeado) muestra datos mock", async ({ page }) => {
  346 |     await page.goto("/cliente/mascotas/max");
  347 |     await page.waitForLoadState("networkidle");
  348 |     const body = await page.textContent("body") ?? "";
  349 |     if (body.toLowerCase().includes("max") && body.includes("Golden Retriever")) {
  350 |       log("/cliente/mascotas/[Id]", "CRÍTICO", "Datos hardcodeados visibles",
```