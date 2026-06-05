# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: cliente-audit.spec.ts >> Auditoría Cliente — Mascotas (/cliente/mascotas) >> botón 'Nueva mascota' navega al formulario
- Location: e2e\cliente-audit.spec.ts:308:7

# Error details

```
TimeoutError: locator.click: Timeout 8000ms exceeded.
Call log:
  - waiting for getByRole('link', { name: /nueva mascota/i })

```

# Test source

```ts
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
> 311 |     await page.getByRole("link", { name: /nueva mascota/i }).click();
      |                                                              ^ TimeoutError: locator.click: Timeout 8000ms exceeded.
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
  351 |         "La página muestra datos mock de 'Max Golden Retriever'. El detalle de mascota debe leer de la API, no de mascotasIniciales[]");
  352 |     }
  353 |   });
  354 | });
  355 | 
  356 | test.describe("Auditoría Cliente — Nueva mascota (/cliente/mascotas/nueva)", () => {
  357 |   test.beforeEach(async ({ page }) => { await injectAuth(page, "Ana García", "ana@test.com"); });
  358 | 
  359 |   test("carga el formulario correctamente", async ({ page }) => {
  360 |     const stopConsole = await collectConsoleErrors(page, "/cliente/mascotas/nueva");
  361 |     await page.goto("/cliente/mascotas/nueva");
  362 |     await page.waitForLoadState("networkidle");
  363 |     stopConsole();
  364 |     await expect(page.locator("form, [role='form']").first()).toBeVisible();
  365 |   });
  366 | 
  367 |   test("validación: no permite enviar sin nombre de mascota", async ({ page }) => {
  368 |     await page.goto("/cliente/mascotas/nueva");
  369 |     await page.waitForLoadState("networkidle");
  370 |     const submitBtn = page.getByRole("button", { name: /registrar|guardar|crear/i });
  371 |     if (await submitBtn.count() > 0) await submitBtn.click();
  372 |     // El formulario debería mostrar validación HTML5 o error custom
  373 |   });
  374 | 
  375 |   test("selector de especie 'otro' muestra campo de texto adicional", async ({ page }) => {
  376 |     await page.goto("/cliente/mascotas/nueva");
  377 |     await page.waitForLoadState("networkidle");
  378 |     const otroBtn = page.getByRole("button", { name: /otro/i });
  379 |     if (await otroBtn.count() > 0) {
  380 |       await otroBtn.click();
  381 |       const extraInput = page.locator("input[placeholder*='especie'], input[name='especieOtra']");
  382 |       await expect(extraInput).toBeVisible({ timeout: 3000 });
  383 |     }
  384 |   });
  385 | });
  386 | 
  387 | test.describe("Auditoría Cliente — Perfil (/cliente/perfil)", () => {
  388 |   test.beforeEach(async ({ page }) => { await injectAuth(page, "Roberto Sánchez", "roberto@test.com"); });
  389 | 
  390 |   test("AUDIT: el perfil muestra datos REALES del usuario, no hardcodeados", async ({ page }) => {
  391 |     await page.goto("/cliente/perfil");
  392 |     await page.waitForLoadState("networkidle");
  393 |     const body = await page.textContent("body") ?? "";
  394 | 
  395 |     // No debe mostrar datos del usuario falso "Juan Pérez"
  396 |     if (body.includes("Juan Pérez")) {
  397 |       log("/cliente/perfil", "CRÍTICO", "Datos hardcodeados",
  398 |         "La página muestra 'Juan Pérez' en vez del usuario autenticado 'Roberto Sánchez'");
  399 |     }
  400 |     if (body.includes("usuario@vetnova.com")) {
  401 |       log("/cliente/perfil", "CRÍTICO", "Email hardcodeado",
  402 |         "Muestra 'usuario@vetnova.com' en vez del email del JWT");
  403 |     }
  404 |     if (body.includes("+52 555 1234 5678")) {
  405 |       log("/cliente/perfil", "ALTO", "Teléfono hardcodeado", "Teléfono es un placeholder estático");
  406 |     }
  407 |     if (body.includes("Ciudad de México")) {
  408 |       log("/cliente/perfil", "ALTO", "Ubicación hardcodeada", "Ubicación es un placeholder estático");
  409 |     }
  410 |     if (body.includes("Consulta general de Max")) {
  411 |       log("/cliente/perfil", "ALTO", "Actividad hardcodeada",
```