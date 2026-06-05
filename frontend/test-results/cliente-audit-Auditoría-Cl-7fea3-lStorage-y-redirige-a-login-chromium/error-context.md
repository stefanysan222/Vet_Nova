# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: cliente-audit.spec.ts >> Auditoría Cliente — Sidebar y navegación >> cerrar sesión limpia localStorage y redirige a /login
- Location: e2e\cliente-audit.spec.ts:553:7

# Error details

```
TimeoutError: locator.click: Timeout 8000ms exceeded.
Call log:
  - waiting for getByRole('button', { name: /cerrar sesi/i })
    - locator resolved to <button type="button" class="flex items-center gap-3 text-[15px] font-semibold text-[#10213A] transition-colors hover:text-[#2F6BFF] dark:text-white dark:hover:text-[#60A5FA]">…</button>
  - attempting click action
    2 × waiting for element to be visible, enabled and stable
      - element is visible, enabled and stable
      - scrolling into view if needed
      - done scrolling
      - <nextjs-portal></nextjs-portal> from <script data-nextjs-dev-overlay="true">…</script> subtree intercepts pointer events
    - retrying click action
    - waiting 20ms
    2 × waiting for element to be visible, enabled and stable
      - element is visible, enabled and stable
      - scrolling into view if needed
      - done scrolling
      - <nextjs-portal></nextjs-portal> from <script data-nextjs-dev-overlay="true">…</script> subtree intercepts pointer events
    - retrying click action
      - waiting 100ms
    - waiting for element to be visible, enabled and stable
    - element is visible, enabled and stable
    - scrolling into view if needed
    - done scrolling
    - <nextjs-portal></nextjs-portal> from <script data-nextjs-dev-overlay="true">…</script> subtree intercepts pointer events
  - retrying click action
    - waiting 500ms
    - waiting for element to be visible, enabled and stable
  - element was detached from the DOM, retrying

```

# Test source

```ts
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
  535 |     await page.waitForLoadState("networkidle");
  536 | 
  537 |     const navLinks = await page.locator("nav a, aside a").all();
  538 |     const hrefs: string[] = [];
  539 |     for (const link of navLinks) {
  540 |       const href = await link.getAttribute("href");
  541 |       if (href?.startsWith("/cliente")) hrefs.push(href);
  542 |     }
  543 | 
  544 |     for (const href of hrefs) {
  545 |       await page.goto(href);
  546 |       await page.waitForLoadState("networkidle");
  547 |       if (page.url().includes("/login")) {
  548 |         log(href, "CRÍTICO", "Redirige a /login sin razón", `La ruta ${href} redirige al login con token válido`);
  549 |       }
  550 |     }
  551 |   });
  552 | 
  553 |   test("cerrar sesión limpia localStorage y redirige a /login", async ({ page }) => {
  554 |     await page.goto("/cliente");
  555 |     await page.waitForLoadState("networkidle");
  556 |     const logoutBtn = page.getByRole("button", { name: /cerrar sesi/i });
  557 |     if (await logoutBtn.count() > 0) {
> 558 |       await logoutBtn.click();
      |                       ^ TimeoutError: locator.click: Timeout 8000ms exceeded.
  559 |       await page.waitForURL(/login/, { timeout: 5000 });
  560 |       const token = await page.evaluate(() => localStorage.getItem("vetnova-token"));
  561 |       const perfil = await page.evaluate(() => localStorage.getItem("vetnova_cliente_perfil"));
  562 |       expect(token).toBeNull();
  563 |       expect(perfil).toBeNull();
  564 |     }
  565 |   });
  566 | });
  567 | 
  568 | test.describe("Auditoría Cliente — Datos hardcodeados globales", () => {
  569 |   test.beforeEach(async ({ page }) => { await injectAuth(page, "Roberto Test", "roberto@test.com"); });
  570 | 
  571 |   test("AUDIT: ninguna ruta muestra strings hardcodeados del usuario 'Juan'", async ({ page }) => {
  572 |     for (const ruta of CLIENTE_ROUTES) {
  573 |       await page.goto(ruta);
  574 |       await page.waitForLoadState("networkidle");
  575 |       const body = await page.textContent("body") ?? "";
  576 |       for (const str of HARDCODED_STRINGS) {
  577 |         if (body.includes(str)) {
  578 |           const sev = ["Juan Pérez", "usuario@vetnova.com"].includes(str) ? "CRÍTICO" : "MEDIO";
  579 |           log(ruta, sev, "String hardcodeado detectado", `"${str}" encontrado en ${ruta}`);
  580 |         }
  581 |       }
  582 |     }
  583 |   });
  584 | });
  585 | 
  586 | // ─── Resumen final ────────────────────────────────────────────────────────────
  587 | test.afterAll(async () => {
  588 |   if (issues.length === 0) {
  589 |     console.log("\n✅ No se encontraron issues en el panel cliente.");
  590 |     return;
  591 |   }
  592 | 
  593 |   console.log("\n" + "═".repeat(70));
  594 |   console.log("  INFORME DE AUDITORÍA — PANEL CLIENTE");
  595 |   console.log("═".repeat(70));
  596 | 
  597 |   const bySev: Record<string, Issue[]> = { CRÍTICO: [], ALTO: [], MEDIO: [], INFO: [] };
  598 |   for (const i of issues) bySev[i.severidad].push(i);
  599 | 
  600 |   for (const [sev, list] of Object.entries(bySev)) {
  601 |     if (!list.length) continue;
  602 |     const icon = sev === "CRÍTICO" ? "🔴" : sev === "ALTO" ? "🟠" : sev === "MEDIO" ? "🟡" : "🔵";
  603 |     console.log(`\n${icon} ${sev} (${list.length})`);
  604 |     for (const i of list) {
  605 |       console.log(`  [${i.tipo}] ${i.ruta}`);
  606 |       console.log(`    → ${i.descripcion}`);
  607 |     }
  608 |   }
  609 |   console.log("\n" + "═".repeat(70));
  610 |   console.log(`  Total: ${issues.length} issues | Críticos: ${bySev.CRÍTICO.length} | Altos: ${bySev.ALTO.length} | Medios: ${bySev.MEDIO.length}`);
  611 |   console.log("═".repeat(70) + "\n");
  612 | });
  613 | 
```