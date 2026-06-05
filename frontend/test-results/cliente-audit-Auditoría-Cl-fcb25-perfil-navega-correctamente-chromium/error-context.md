# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: cliente-audit.spec.ts >> Auditoría Cliente — Perfil (/cliente/perfil) >> enlace 'Configuración del perfil' navega correctamente
- Location: e2e\cliente-audit.spec.ts:431:7

# Error details

```
TimeoutError: locator.click: Timeout 8000ms exceeded.
Call log:
  - waiting for getByRole('link', { name: /configuraci/i }).first()

```

# Test source

```ts
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
  412 |         "Sección 'Resumen de actividad' usa datos falsos (Max, Luna, etc.)");
  413 |     }
  414 |     if (!body.includes("Roberto")) {
  415 |       log("/cliente/perfil", "CRÍTICO", "Nombre no mostrado",
  416 |         "El perfil no muestra el nombre real del usuario autenticado");
  417 |     }
  418 |   });
  419 | 
  420 |   test("AUDIT: estadísticas del perfil son dinámicas", async ({ page }) => {
  421 |     await page.goto("/cliente/perfil");
  422 |     await page.waitForLoadState("networkidle");
  423 |     const body = await page.textContent("body") ?? "";
  424 |     // Las stats hardcodeadas son "6" mascotas, "2" citas activas, "3" notificaciones
  425 |     if (body.includes("6") && body.includes("2") && body.includes("3")) {
  426 |       log("/cliente/perfil", "ALTO", "Estadísticas hardcodeadas",
  427 |         "Las estadísticas (6 mascotas, 2 citas, 3 notificaciones) son valores fijos en el código");
  428 |     }
  429 |   });
  430 | 
  431 |   test("enlace 'Configuración del perfil' navega correctamente", async ({ page }) => {
  432 |     await page.goto("/cliente/perfil");
  433 |     await page.waitForLoadState("networkidle");
> 434 |     await page.getByRole("link", { name: /configuraci/i }).first().click();
      |                                                                    ^ TimeoutError: locator.click: Timeout 8000ms exceeded.
  435 |     await expect(page).toHaveURL(/\/cliente\/configuracion/);
  436 |   });
  437 | });
  438 | 
  439 | test.describe("Auditoría Cliente — Configuración (/cliente/configuracion)", () => {
  440 |   test.beforeEach(async ({ page }) => { await injectAuth(page, "Laura Mendoza", "laura@test.com"); });
  441 | 
  442 |   test("muestra el nombre del JWT en el formulario (no hardcodeado)", async ({ page }) => {
  443 |     await page.goto("/cliente/configuracion");
  444 |     await page.waitForLoadState("networkidle");
  445 |     const nombreInput = page.locator("input[name='nombre']");
  446 |     if (await nombreInput.count() > 0) {
  447 |       const val = await nombreInput.inputValue();
  448 |       if (val === "Juan") {
  449 |         log("/cliente/configuracion", "CRÍTICO", "Nombre hardcodeado en form",
  450 |           "El campo Nombre muestra 'Juan' del perfilInicial hardcodeado en vez del JWT");
  451 |       }
  452 |       // Tras nuestro fix debería mostrar "Laura"
  453 |       expect(val).not.toBe("Juan");
  454 |     }
  455 |   });
  456 | 
  457 |   test("guardar cambios: actualiza los datos sin recargar", async ({ page }) => {
  458 |     await page.goto("/cliente/configuracion");
  459 |     await page.waitForLoadState("networkidle");
  460 |     const nombreInput = page.locator("input[name='nombre']");
  461 |     if (await nombreInput.count() > 0) {
  462 |       await nombreInput.fill("Laura");
  463 |       const submitBtn = page.getByRole("button", { name: /guardar/i });
  464 |       await submitBtn.click();
  465 |       // Debe aparecer mensaje de éxito
  466 |       const ok = page.locator("text=/actualizada|guardada|correctamente/i");
  467 |       await expect(ok).toBeVisible({ timeout: 4000 });
  468 |     }
  469 |   });
  470 | 
  471 |   test("cancelar restaura valores originales", async ({ page }) => {
  472 |     await page.goto("/cliente/configuracion");
  473 |     await page.waitForLoadState("networkidle");
  474 |     const nombreInput = page.locator("input[name='nombre']");
  475 |     if (await nombreInput.count() > 0) {
  476 |       const original = await nombreInput.inputValue();
  477 |       await nombreInput.fill("Valor temporal que no debe guardarse");
  478 |       await page.getByRole("button", { name: /cancelar/i }).first().click();
  479 |       const restored = await nombreInput.inputValue();
  480 |       expect(restored).toBe(original);
  481 |     }
  482 |   });
  483 | });
  484 | 
  485 | test.describe("Auditoría Cliente — Notificaciones (/cliente/notificaciones)", () => {
  486 |   test.beforeEach(async ({ page }) => { await injectAuth(page); });
  487 | 
  488 |   test("carga la página correctamente", async ({ page }) => {
  489 |     const stopConsole = await collectConsoleErrors(page, "/cliente/notificaciones");
  490 |     await page.goto("/cliente/notificaciones");
  491 |     await page.waitForLoadState("networkidle");
  492 |     stopConsole();
  493 |     await expect(page.locator("h1")).toBeVisible();
  494 |   });
  495 | 
  496 |   test("filtros Todas / No leídas / Leídas funcionan", async ({ page }) => {
  497 |     await page.goto("/cliente/notificaciones");
  498 |     await page.waitForLoadState("networkidle");
  499 |     for (const filtro of ["Todas", "No leídas", "Leídas"]) {
  500 |       const btn = page.getByRole("button", { name: new RegExp(filtro, "i") });
  501 |       if (await btn.count() > 0) await btn.click();
  502 |     }
  503 |   });
  504 | });
  505 | 
  506 | test.describe("Auditoría Cliente — Historial y Vacunas (stub pages)", () => {
  507 |   test.beforeEach(async ({ page }) => { await injectAuth(page); });
  508 | 
  509 |   test("AUDIT: /cliente/historial es un stub sin datos reales", async ({ page }) => {
  510 |     await page.goto("/cliente/historial");
  511 |     await page.waitForLoadState("networkidle");
  512 |     const body = await page.textContent("body") ?? "";
  513 |     if (!body.includes("API") && !body.includes("historial") && body.length < 500) {
  514 |       log("/cliente/historial", "ALTO", "Página stub",
  515 |         "La página de Historial Médico no tiene contenido real ni conexión a API");
  516 |     }
  517 |   });
  518 | 
  519 |   test("AUDIT: /cliente/vacunas es un stub sin datos reales", async ({ page }) => {
  520 |     await page.goto("/cliente/vacunas");
  521 |     await page.waitForLoadState("networkidle");
  522 |     const body = await page.textContent("body") ?? "";
  523 |     if (body.length < 400) {
  524 |       log("/cliente/vacunas", "ALTO", "Página stub",
  525 |         "La página de Vacunas no tiene contenido real ni conexión a API");
  526 |     }
  527 |   });
  528 | });
  529 | 
  530 | test.describe("Auditoría Cliente — Sidebar y navegación", () => {
  531 |   test.beforeEach(async ({ page }) => { await injectAuth(page); });
  532 | 
  533 |   test("todos los enlaces del sidebar cargan sin redirigir a /login", async ({ page }) => {
  534 |     await page.goto("/cliente");
```