# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: cliente-audit.spec.ts >> Auditoría Cliente — Dashboard (/cliente) >> carga correctamente y muestra saludo personalizado
- Location: e2e\cliente-audit.spec.ts:150:7

# Error details

```
Error: expect(received).toContain(expected) // indexOf

Expected substring: "María"
Received string:    "self.__next_r=\"7Hzfxiq2kxe4mh8SLlZjc\"(self.__next_f=self.__next_f||[]).push([0])self.__next_f.push([1,\"9:I[\\\"[project]/node_modules/next/dist/next-devtools/userspace/app/segment-explorer-node.js [app-client] (ecmascript)\\\",[\\\"/_next/static/chunks/node_modules_09viah5._.js\\\",\\\"/_next/static/chunks/app_components_ui_Toast_tsx_0vp8wtf._.js\\\",\\\"/_next/static/chunks/app_layout_tsx_004glpo._.js\\\"],\\\"SegmentViewNode\\\"]\\nb:\\\"$Sreact.fragment\\\"\\n1f:I[\\\"[project]/app/components/ui/Toast.tsx [app-client] (ecmascript)\\\",[\\\"/_next/static/chunks/node_modules_09viah5._.js\\\",\\\"/_next/static/chunks/app_components_ui_Toast_tsx_0vp8wtf._.js\\\",\\\"/_next/static/chunks/app_layout_tsx_004glpo._.js\\\"],\\\"ToastProvider\\\"]\\n21:I[\\\"[project]/node_modules/next/dist/client/components/layout-router.js [app-client] (ecmascript)\\\",[\\\"/_next/static/chunks/node_modules_09viah5._.js\\\",\\\"/_next/static/chunks/app_components_ui_Toast_tsx_0vp8wtf._.js\\\",\\\"/_next/static/chunks/app_layout_tsx_004glpo._.js\\\"],\\\"default\\\"]\\n23:I[\\\"[project]/node_modules/next/dist/client/components/render-from-template-context.js [app-client] (ecmascript)\\\",[\\\"/_next/static/chunks/node_modules_09viah5._.js\\\",\\\"/_next/static/chunks/app_components_ui_Toast_tsx_0vp8wtf._.js\\\",\\\"/_next/static/chunks/app_layout_tsx_004glpo._.js\\\"],\\\"default\\\"]\\n44:I[\\\"[project]/app/cliente/ClientLayoutShell.tsx [app-client] (ecmascript)\\\",[\\\"/_next/static/chunks/node_modules_09viah5._.js\\\",\\\"/_next/static/chunks/app_components_ui_Toast_tsx_0vp8wtf._.js\\\",\\\"/_next/static/chunks/app_layout_tsx_004glpo._.js\\\",\\\"/_next/static/chunks/_0yhmd6i._.js\\\",\\\"/_next/static/chunks/node_modules_0ucs433._.js\\\",\\\"/_next/static/chunks/app_cliente_layout_tsx_0e7rjox._.js\\\"],\\\"default\\\"]\\n4a:I[\\\"[project]/node_modules/next/dist/client/components/client-page.js [app-client] (ecmascript)\\\",[\\\"/_next/static/chunks/node_modules_09viah5._.js\\\",\\\"/_next/static/chunks/app_components_ui_Toast_tsx_0vp8wtf._.js\\\",\\\"/_next/static/chunks/app_layout_tsx_004glpo._.js\\\"],\\\"ClientPageRoot\\\"]\\n4b:I[\\\"[project]/app/cliente/page.tsx [app-client] (ecmascript)\\\",[\\\"/_next/static/chunks/node_modules_09viah5._.js\\\",\\\"/_next/static/chunks/app_components_ui_Toast_tsx_0vp8wtf._.js\\\",\\\"/_next/static/chunks/app_layout_tsx_004glpo._.js\\\",\\\"/_next/static/chunks/_0yhmd6i._.js\\\",\\\"/_next/static/chunks/node_modules_0ucs433._.js\\\",\\\"/_next/static/chunks/app_cliente_layout_tsx_0e7rjox._.js\\\",\\\"/_next/static/chunks/_0t-i.3a._.js\\\",\\\"/_next/static/chunks/app_cliente_page_tsx_0_tj2dk._.js\\\"],\\\"default\\\"]\\n53:I[\\\"[project]/node_modules/next/dist/lib/framework/boundary-components.js [app-client] (ecmascript)\\\",[\\\"/_next/static/chunks/node_modules_09viah5._.js\\\",\\\"/_next/static/chunks/app_components_ui_Toast_tsx_0vp8wtf._.js\\\",\\\"/_next/static/chunks/app_layout_tsx_004glpo._.js\\\"],\\\"OutletBoundary\\\"]\\n55:\\\"$Sreact.suspense\\\"\\n62:I[\\\"[project]/node_modules/next/dist/lib/framework/boundary-components.js [app-client] (ecmascript)\\\",[\\\"/_next/static/chunks/node_modules_09viah5._.js\\\",\\\"/_next/static/chunks/app_components_ui_Toast_tsx_0vp8wtf._.js\\\",\\\"/_next/static/chunks/app_layout_tsx_004glpo._.js\\\"],\\\"ViewportBoundary\\\"]\\n6c:I[\\\"[project]/node_modules/next/dist/lib/framework/boundary-components.js [app-client] (ecmascript)\\\",[\\\"/_next/static/chunks/node_modules_09viah5._.js\\\",\\\"/_next/static/chunks/app_components_ui_Toast_tsx_0vp8wtf._.js\\\",\\\"/_next/static/chunks/app_layout_tsx_004glpo._.js\\\"],\\\"MetadataBoundary\\\"]\\n73:I[\\\"[project]/node_modules/next/dist/client/components/builtin/global-error.js [app-client] (ecmascript)\\\",[\\\"/_next/static/chunks/node_modules_09viah5._.js\\\",\\\"/_next/static/chunks/app_components_ui_Toast_tsx_0vp8wtf._.js\\\",\\\"/_next/static/chunks/app_layout_tsx_004glpo._.js\\\",\\\"/_next/static/chunks/node_modules_next_dist_client_components_builtin_global-error_0e7rjox.js\\\"],\\\"default\\\",1]\\n7f:I[\\\"[project]/node_modules/next/dist/lib/metadata/generate/icon-mark.js [app-client] (ecmascript)\\\",[\\\"/_next/static/chunks/node_modules_09viah5._.js\\\",\\\"/_next/static/chunks/app_components_ui_Toast_tsx_0vp8wtf._.js\\\",\\\"/_next/static/chunks/app_layout_tsx_004glpo._.js\\\"],\\\"IconMark\\\"]\\n:HL[\\\"/_next/static/chunks/%5Broot-of-the-server%5D__06.-pfn._.css\\\",\\\"style\\\"]\\n:HL[\\\"/_next/static/media/797e433ab948586e-s.p.09zddjkbdep5a.woff2\\\",\\\"font\\\",{\\\"crossOrigin\\\":\\\"\\\",\\\"type\\\":\\\"font/woff2\\\"}]\\n:HL[\\\"/_next/static/media/caa3a2e1cccd8315-s.p.\"])self.__next_f.push([1,\"09~u27dqhyhd6.woff2\\\",\\\"font\\\",{\\\"crossOrigin\\\":\\\"\\\",\\\"type\\\":\\\"font/woff2\\\"}]\\n1:D\\\"$6\\\"\\n1:D\\\"$2\\\"\\n1:D\\\"$7\\\"\\n1:null\\n10:D\\\"$1a\\\"\\n10:D\\\"$11\\\"\\n10:D\\\"$1c\\\"\\n25:D\\\"$27\\\"\\n25:D\\\"$26\\\"\\n25:D\\\"$29\\\"\\n25:D\\\"$28\\\"\\n25:D\\\"$2a\\\"\\n25:[[\\\"$\\\",\\\"title\\\",null,{\\\"children\\\":\\\"404: This page could not be found.\\\"},\\\"$28\\\",\\\"$2b\\\",1],[\\\"$\\\",\\\"div\\\",null,{\\\"style\\\":{\\\"fontFamily\\\":\\\"system-ui,\\\\\\\"Segoe UI\\\\\\\",Roboto,Helvetica,Arial,sans-serif,\\\\\\\"Apple Color Emoji\\\\\\\",\\\\\\\"Segoe UI Emoji\\\\\\\"\\\",\\\"height\\\":\\\"100vh\\\",\\\"textAlign\\\":\\\"center\\\",\\\"display\\\":\\\"flex\\\",\\\"flexDirection\\\":\\\"column\\\",\\\"alignItems\\\":\\\"center\\\",\\\"justifyContent\\\":\\\"center\\\"},\\\"children\\\":[\\\"$\\\",\\\"div\\\",null,{\\\"children\\\":[[\\\"$\\\",\\\"style\\\",null,{\\\"dangerouslySetInnerHTML\\\":{\\\"__html\\\":\\\"body{color:#000;background:#fff;margin:0}.next-error-h1{border-right:1px solid rgba(0,0,0,.3)}@media (prefers-color-scheme:dark){body{color:#fff;background:#000}.next-error-h1{border-right:1px solid rgba(255,255,255,.3)}}\\\"}},\\\"$28\\\",\\\"$2e\\\",1],[\\\"$\\\",\\\"h1\\\",null,{\\\"className\\\":\\\"next-error-h1\\\",\\\"style\\\":{\\\"display\\\":\\\"inline-block\\\",\\\"margin\\\":\\\"0 20px 0 0\\\",\\\"padding\\\":\\\"0 23px 0 0\\\",\\\"fontSize\\\":24,\\\"fontWeight\\\":500,\\\"verticalAlign\\\":\\\"top\\\",\\\"lineHeight\\\":\\\"49px\\\"},\\\"children\\\":404},\\\"$28\\\",\\\"$2f\\\",1],[\\\"$\\\",\\\"div\\\",null,{\\\"style\\\":{\\\"display\\\":\\\"inline-block\\\"},\\\"children\\\":[\\\"$\\\",\\\"h2\\\",null,{\\\"style\\\":{\\\"fontSize\\\":14,\\\"fontWeight\\\":400,\\\"lineHeight\\\":\\\"49px\\\",\\\"margin\\\":0},\\\"children\\\":\\\"This page could not be found.\\\"},\\\"$28\\\",\\\"$31\\\",1]},\\\"$28\\\",\\\"$30\\\",1]]},\\\"$28\\\",\\\"$2d\\\",1]},\\\"$28\\\",\\\"$2c\\\",1]]\\n10:[\\\"$\\\",\\\"html\\\",null,{\\\"lang\\\":\\\"es\\\",\\\"className\\\":\\\"geist_a71539c9-module__T19VSG__variable geist_mono_8d43a2aa-module__8Li5zG__variable h-full antialiased\\\",\\\"children\\\":[\\\"$\\\",\\\"body\\\",null,{\\\"className\\\":\\\"min-h-full flex flex-col\\\",\\\"children\\\":[\\\"$\\\",\\\"$L1f\\\",null,{\\\"children\\\":[\\\"$\\\",\\\"$L21\\\",null,{\\\"parallelRouterKey\\\":\\\"children\\\",\\\"error\\\":\\\"$undefined\\\",\\\"errorStyles\\\":\\\"$undefined\\\",\\\"errorScripts\\\":\\\"$undefined\\\",\\\"template\\\":[\\\"$\\\",\\\"$L23\\\",null,{},null,\\\"$22\\\",1],\\\"templateStyles\\\":\\\"$undefined\\\",\\\"templateScripts\\\":\\\"$undefined\\\",\\\"notFound\\\":[\\\"$\\\",\\\"$L9\\\",\\\"c-not-found\\\",{\\\"type\\\":\\\"not-found\\\",\\\"pagePath\\\":\\\"__next_builtin__not-found.js\\\",\\\"children\\\":[\\\"$25\\\",[]]},null,\\\"$24\\\",0],\\\"forbidden\\\":\\\"$undefined\\\",\\\"unauthorized\\\":\\\"$undefined\\\",\\\"segmentViewBoundaries\\\":[[\\\"$\\\",\\\"$L9\\\",null,{\\\"type\\\":\\\"boundary:not-found\\\",\\\"pagePath\\\":\\\"__next_builtin__not-found.js@boundary\\\"},null,\\\"$32\\\",1],\\\"$undefined\\\",\\\"$undefined\\\",[\\\"$\\\",\\\"$L9\\\",null,{\\\"type\\\":\\\"boundary:global-error\\\",\\\"pagePath\\\":\\\"__next_builtin__global-error.js\\\"},null,\\\"$33\\\",1]]},null,\\\"$20\\\",1]},\\\"$11\\\",\\\"$1e\\\",1]},\\\"$11\\\",\\\"$1d\\\",1]},\\\"$11\\\",\\\"$1b\\\",1]\\n39:D\\\"$41\\\"\\n39:D\\\"$3a\\\"\\n39:D\\\"$43\\\"\\n39:[\\\"$\\\",\\\"$L44\\\",null,{\\\"children\\\":[\\\"$\\\",\\\"$L21\\\",null,{\\\"parallelRouterKey\\\":\\\"children\\\",\\\"error\\\":\\\"$undefined\\\",\\\"errorStyles\\\":\\\"$undefined\\\",\\\"errorScripts\\\":\\\"$undefined\\\",\\\"template\\\":[\\\"$\\\",\\\"$L23\\\",null,{},null,\\\"$46\\\",1],\\\"templateStyles\\\":\\\"$undefined\\\",\\\"templateScripts\\\":\\\"$undefined\\\",\\\"notFound\\\":\\\"$undefined\\\",\\\"forbidden\\\":\\\"$undefined\\\",\\\"unauthorized\\\":\\\"$undefined\\\",\\\"segmentViewBoundaries\\\":[\\\"$undefined\\\",\\\"$undefined\\\",\\\"$undefined\\\",\\\"$undefined\\\"]},null,\\\"$45\\\",1]},\\\"$3a\\\",\\\"$42\\\",1]\\n4e:D\\\"$50\\\"\\n4e:D\\\"$4f\\\"\\n4e:D\\\"$52\\\"\\n4e:[\\\"$\\\",\\\"$L53\\\",null,{\\\"children\\\":[\\\"$\\\",\\\"$55\\\",null,{\\\"name\\\":\\\"Next.MetadataOutlet\\\",\\\"children\\\":\\\"$@56\\\"},\\\"$4f\\\",\\\"$54\\\",1]},\\\"$4f\\\",\\\"$51\\\",1]\\n58:D\\\"$5b\\\"\\n58:D\\\"$59\\\"\\n58:D\\\"$5c\\\"\\n58:null\\n5d:D\\\"$5f\\\"\\n5d:D\\\"$5e\\\"\\n5d:D\\\"$61\\\"\\n63:D\\\"$65\\\"\\n63:D\\\"$64\\\"\\n5d:[\\\"$\\\",\\\"$L62\\\",null,{\\\"children\\\":\\\"$L63\\\"},\\\"$5e\\\",\\\"$60\\\",1]\\n66:D\\\"$68\\\"\\n66:D\\\"$67\\\"\\n66:D\\\"$6a\\\"\\n6e:D\\\"$70\\\"\\n6e:D\\\"$6f\\\"\\n66:[\\\"$\\\",\\\"div\\\",null,{\\\"hidden\\\":true,\\\"children\\\":[\\\"$\\\",\\\"$L6c\\\",null,{\\\"children\\\":[\\\"$\\\",\\\"$55\\\",null,{\\\"name\\\":\\\"Next.Metadata\\\",\\\"children\\\":\\\"$L6e\\\"},\\\"$67\\\",\\\"$6d\\\",1]},\\\"$67\\\",\\\"$6b\\\",1]},\\\"$67\\\",\\\"$69\\\",1]\\n72:[]\\n\"])self.__next_f.push([1,\"0:{\\\"P\\\":\\\"$1\\\",\\\"c\\\":[\\\"\\\",\\\"cliente\\\"],\\\"q\\\":\\\"\\\",\\\"i\\\":true,\\\"f\\\":[[[\\\"\\\",{\\\"children\\\":[\\\"cliente\\\",{\\\"children\\\":[\\\"__PAGE__\\\",{}]}]},\\\"$undefined\\\",\\\"$undefined\\\",16],[[\\\"$\\\",\\\"$L9\\\",\\\"layout\\\",{\\\"type\\\":\\\"layout\\\",\\\"pagePath\\\":\\\"layout.tsx\\\",\\\"children\\\":[\\\"$\\\",\\\"$b\\\",\\\"c\\\",{\\\"children\\\":[[[\\\"$\\\",\\\"link\\\",\\\"0\\\",{\\\"rel\\\":\\\"stylesheet\\\",\\\"href\\\":\\\"/_next/static/chunks/%5Broot-of-the-server%5D__06.-pfn._.css\\\",\\\"precedence\\\":\\\"next_static/chunks/[root-of-the-server]__06.-pfn._.css\\\",\\\"crossOrigin\\\":\\\"$undefined\\\",\\\"nonce\\\":\\\"$undefined\\\"},null,\\\"$c\\\",0],[\\\"$\\\",\\\"script\\\",\\\"script-0\\\",{\\\"src\\\":\\\"/_next/static/chunks/node_modules_09viah5._.js\\\",\\\"async\\\":true,\\\"nonce\\\":\\\"$undefined\\\"},null,\\\"$d\\\",0],[\\\"$\\\",\\\"script\\\",\\\"script-1\\\",{\\\"src\\\":\\\"/_next/static/chunks/app_components_ui_Toast_tsx_0vp8wtf._.js\\\",\\\"async\\\":true,\\\"nonce\\\":\\\"$undefined\\\"},null,\\\"$e\\\",0],[\\\"$\\\",\\\"script\\\",\\\"script-2\\\",{\\\"src\\\":\\\"/_next/static/chunks/app_layout_tsx_004glpo._.js\\\",\\\"async\\\":true,\\\"nonce\\\":\\\"$undefined\\\"},null,\\\"$f\\\",0]],\\\"$10\\\"]},null,\\\"$a\\\",1]},null,\\\"$8\\\",0],{\\\"children\\\":[[\\\"$\\\",\\\"$L9\\\",\\\"layout\\\",{\\\"type\\\":\\\"layout\\\",\\\"pagePath\\\":\\\"cliente/layout.tsx\\\",\\\"children\\\":[\\\"$\\\",\\\"$b\\\",\\\"c\\\",{\\\"children\\\":[[[\\\"$\\\",\\\"script\\\",\\\"script-0\\\",{\\\"src\\\":\\\"/_next/static/chunks/_0yhmd6i._.js\\\",\\\"async\\\":true,\\\"nonce\\\":\\\"$undefined\\\"},null,\\\"$36\\\",0],[\\\"$\\\",\\\"script\\\",\\\"script-1\\\",{\\\"src\\\":\\\"/_next/static/chunks/node_modules_0ucs433._.js\\\",\\\"async\\\":true,\\\"nonce\\\":\\\"$undefined\\\"},null,\\\"$37\\\",0],[\\\"$\\\",\\\"script\\\",\\\"script-2\\\",{\\\"src\\\":\\\"/_next/static/chunks/app_cliente_layout_tsx_0e7rjox._.js\\\",\\\"async\\\":true,\\\"nonce\\\":\\\"$undefined\\\"},null,\\\"$38\\\",0]],\\\"$39\\\"]},null,\\\"$35\\\",1]},null,\\\"$34\\\",0],{\\\"children\\\":[[\\\"$\\\",\\\"$b\\\",\\\"c\\\",{\\\"children\\\":[[\\\"$\\\",\\\"$L9\\\",\\\"c-page\\\",{\\\"type\\\":\\\"page\\\",\\\"pagePath\\\":\\\"cliente/page.tsx\\\",\\\"children\\\":[\\\"$\\\",\\\"$L4a\\\",null,{\\\"Component\\\":\\\"$4b\\\",\\\"serverProvidedParams\\\":{\\\"searchParams\\\":{},\\\"params\\\":{},\\\"promises\\\":null}},null,\\\"$49\\\",1]},null,\\\"$48\\\",1],[[\\\"$\\\",\\\"script\\\",\\\"script-0\\\",{\\\"src\\\":\\\"/_next/static/chunks/_0t-i.3a._.js\\\",\\\"async\\\":true,\\\"nonce\\\":\\\"$undefined\\\"},null,\\\"$4c\\\",0],[\\\"$\\\",\\\"script\\\",\\\"script-1\\\",{\\\"src\\\":\\\"/_next/static/chunks/app_cliente_page_tsx_0_tj2dk._.js\\\",\\\"async\\\":true,\\\"nonce\\\":\\\"$undefined\\\"},null,\\\"$4d\\\",0]],\\\"$4e\\\"]},null,\\\"$47\\\",0],{},null,false,null]},null,false,null]},null,false,null],[\\\"$\\\",\\\"$b\\\",\\\"h\\\",{\\\"children\\\":[\\\"$58\\\",\\\"$5d\\\",\\\"$66\\\",[\\\"$\\\",\\\"meta\\\",null,{\\\"name\\\":\\\"next-size-adjust\\\",\\\"content\\\":\\\"\\\"},null,\\\"$71\\\",1]]},null,\\\"$57\\\",0],false]],\\\"m\\\":\\\"$W72\\\",\\\"G\\\":[\\\"$73\\\",[\\\"$\\\",\\\"$L9\\\",\\\"ge-svn\\\",{\\\"type\\\":\\\"global-error\\\",\\\"pagePath\\\":\\\"__next_builtin__global-error.js\\\",\\\"children\\\":[[\\\"$\\\",\\\"link\\\",\\\"0\\\",{\\\"rel\\\":\\\"stylesheet\\\",\\\"href\\\":\\\"/_next/static/chunks/%5Broot-of-the-server%5D__06.-pfn._.css\\\",\\\"precedence\\\":\\\"next_static/chunks/[root-of-the-server]__06.-pfn._.css\\\",\\\"crossOrigin\\\":\\\"$undefined\\\",\\\"nonce\\\":\\\"$undefined\\\"},null,\\\"$75\\\",0]]},null,\\\"$74\\\",0]],\\\"S\\\":false,\\\"h\\\":null,\\\"s\\\":\\\"$undefined\\\",\\\"l\\\":\\\"$undefined\\\",\\\"p\\\":\\\"$undefined\\\",\\\"d\\\":\\\"$undefined\\\",\\\"b\\\":\\\"development\\\"}\\n\"])self.__next_f.push([1,\"63:D\\\"$76\\\"\\n63:[[\\\"$\\\",\\\"meta\\\",\\\"0\\\",{\\\"charSet\\\":\\\"utf-8\\\"},\\\"$4f\\\",\\\"$77\\\",0],[\\\"$\\\",\\\"meta\\\",\\\"1\\\",{\\\"name\\\":\\\"viewport\\\",\\\"content\\\":\\\"width=device-width, initial-scale=1\\\"},\\\"$4f\\\",\\\"$78\\\",0]]\\n56:D\\\"$79\\\"\\n56:null\\n6e:D\\\"$7a\\\"\\n6e:[[\\\"$\\\",\\\"title\\\",\\\"0\\\",{\\\"children\\\":\\\"Vet Nova | Clínica Veterinaria\\\"},\\\"$4f\\\",\\\"$7b\\\",0],[\\\"$\\\",\\\"meta\\\",\\\"1\\\",{\\\"name\\\":\\\"description\\\",\\\"content\\\":\\\"Página principal de Vet Nova, clínica veterinaria con servicios de urgencias, vacunación y estética para mascotas.\\\"},\\\"$4f\\\",\\\"$7c\\\",0],[\\\"$\\\",\\\"link\\\",\\\"2\\\",{\\\"rel\\\":\\\"icon\\\",\\\"href\\\":\\\"/favicon.ico?favicon.0x3dzn~oxb6tn.ico\\\",\\\"sizes\\\":\\\"256x256\\\",\\\"type\\\":\\\"image/x-icon\\\"},\\\"$4f\\\",\\\"$7d\\\",0],[\\\"$\\\",\\\"$L7f\\\",\\\"3\\\",{},\\\"$4f\\\",\\\"$7e\\\",0]]\\n\"])Volver al inicioVetNovaClínica veterinariaBienvenido de nuevoAccede al panel de VetNova para gestionar citas, pacientes y clientes con facilidad.Continuar con Googleo con correo electrónicoCorreo electrónicoContraseñaRecordarme¿Olvidaste tu contraseña?Iniciar sesión¿Aún no tienes cuenta? Crear cuenta"
```

# Test source

```ts
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
> 158 |     expect(body).toContain("María");
      |                  ^ Error: expect(received).toContain(expected) // indexOf
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
  250 |     await nextBtn.click();
  251 |     // Si no avanza (no hay mascotas) sólo validamos el mensaje de error
  252 |     const errorEl = page.locator("text=/Selecciona una mascota/i");
  253 |     if (await errorEl.count() > 0) {
  254 |       log("/cliente/agendar/nueva", "INFO", "Sin mascotas", "El usuario de prueba no tiene mascotas; se omiten pasos 2-3");
  255 |       return;
  256 |     }
  257 | 
  258 |     // Si avanzó: ir al paso 3 y seleccionar domingo
```