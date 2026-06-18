# VetNova — Informe de Auditoría Playwright

**Fecha:** 5/6/2026, 9:53:03 a. m.

## Resumen ejecutivo

| Estado | Cantidad |
|--------|----------|
| ✅ OK    | 28    |
| ⚠️ WARN  | 29  |
| ❌ ERROR | 30 |

> **30 error(es) crítico(s)** · **29 advertencia(s)**

## ❌ Errores críticos

### Público — Error de consola JS
> Failed to load resource: the server responded with a status of 401 (Unauthorized)

### Admin — Error de consola JS
> Failed to load resource: the server responded with a status of 401 (Unauthorized)

### Admin/Login — URL inesperada tras login: http://localhost:3001/login

### Admin — Error de consola JS
> Failed to load resource: the server responded with a status of 401 (Unauthorized)

### Admin — Error de consola JS
> Failed to load resource: the server responded with a status of 401 (Unauthorized)

### Admin — Error de consola JS
> Failed to load resource: the server responded with a status of 401 (Unauthorized)

### Admin — Error de consola JS
> Failed to load resource: the server responded with a status of 401 (Unauthorized)

### Admin — Error de consola JS
> Failed to load resource: the server responded with a status of 401 (Unauthorized)

### Admin — Error de consola JS
> Failed to load resource: the server responded with a status of 401 (Unauthorized)

### Admin — Error de consola JS
> Failed to load resource: the server responded with a status of 401 (Unauthorized)

### Admin — Error de consola JS
> Failed to load resource: the server responded with a status of 401 (Unauthorized)

### Admin — Error de consola JS
> Failed to load resource: the server responded with a status of 401 (Unauthorized)

### Admin — Error de consola JS
> Failed to load resource: the server responded with a status of 401 (Unauthorized)

### Admin — Error de consola JS
> Failed to load resource: the server responded with a status of 401 (Unauthorized)

### Admin — Error de consola JS
> Failed to load resource: the server responded with a status of 401 (Unauthorized)

### Admin — Error de consola JS
> Failed to load resource: the server responded with a status of 401 (Unauthorized)

### Admin — Error de consola JS
> Error: Sesión expirada. Por favor inicia sesión nuevamente.
    at apiFetch (http://localhost:3001/_next/static/chunks/_139.v4p._.js:32:19)
    at async fetchCitas (http://localhost:3001/_next/static/

### Veterinario — Excepción no capturada
> Hydration failed because the server rendered text didn't match the client. As a result this tree will be regenerated on the client. This can happen if a SSR-ed Client Component used:

- A server/clien

### Veterinario — Excepción no capturada
> Hydration failed because the server rendered text didn't match the client. As a result this tree will be regenerated on the client. This can happen if a SSR-ed Client Component used:

- A server/clien

### Veterinario — Excepción no capturada
> Hydration failed because the server rendered text didn't match the client. As a result this tree will be regenerated on the client. This can happen if a SSR-ed Client Component used:

- A server/clien

### Veterinario — Excepción no capturada
> Hydration failed because the server rendered text didn't match the client. As a result this tree will be regenerated on the client. This can happen if a SSR-ed Client Component used:

- A server/clien

### Veterinario — Excepción no capturada
> Hydration failed because the server rendered text didn't match the client. As a result this tree will be regenerated on the client. This can happen if a SSR-ed Client Component used:

- A server/clien

### Veterinario — Excepción no capturada
> Hydration failed because the server rendered text didn't match the client. As a result this tree will be regenerated on the client. This can happen if a SSR-ed Client Component used:

- A server/clien

### Veterinario — Error de consola JS
> Failed to load resource: the server responded with a status of 403 (Forbidden)

### Veterinario — Error de consola JS
> Failed to load resource: the server responded with a status of 403 (Forbidden)

### Cliente — Error de consola JS
> Failed to load resource: the server responded with a status of 401 (Unauthorized)

### Cliente — Error de consola JS
> Failed to load resource: the server responded with a status of 401 (Unauthorized)

### Cliente — Error de consola JS
> Failed to load resource: the server responded with a status of 401 (Unauthorized)

### Cliente — Error de consola JS
> Failed to load resource: the server responded with a status of 401 (Unauthorized)

### Mobile — Error de consola JS
> Failed to load resource: the server responded with a status of 401 (Unauthorized)

## ⚠️ Advertencias

- **Login**: No se detectó mensaje de error visible con credenciales incorrectas
- **Público**: HTTP 401 — *http://localhost:3000/auth/login*
- **Admin**: HTTP 401 — *http://localhost:3000/auth/login*
- **Admin/Dashboard**: No se encontró ningún canvas de gráfica
- **Admin**: HTTP 401 — *http://localhost:3000/usuarios*
- **Admin**: HTTP 401 — *http://localhost:3000/mascotas*
- **Admin**: HTTP 401 — *http://localhost:3000/usuarios*
- **Admin**: HTTP 401 — *http://localhost:3000/citas*
- **Admin/Usuarios**: Botón 'Nuevo Usuario' no encontrado
- **Admin**: HTTP 401 — *http://localhost:3000/citas*
- **Admin/Citas**: No hay citas canceladas visibles para probar reprogramar
- **Admin**: HTTP 401 — *http://localhost:3000/mascotas*
- **Admin**: HTTP 401 — *http://localhost:3000/propietarios*
- **Admin**: HTTP 401 — *http://localhost:3000/citas*
- **Admin**: HTTP 401 — *http://localhost:3000/usuarios*
- **Admin**: HTTP 401 — *http://localhost:3000/mascotas*
- **Admin**: HTTP 401 — *http://localhost:3000/citas*
- **Admin/Reportes**: No se renderizó ninguna gráfica
- **Admin**: HTTP 401 — *http://localhost:3000/citas*
- **Admin**: HTTP 401 — *http://localhost:3000/citas*
- **Veterinario**: HTTP 403 — *http://localhost:3000/usuarios*
- **Veterinario**: HTTP 403 — *http://localhost:3000/usuarios*
- **Cliente/Register**: URL inesperada tras registro: http://localhost:3001/register
- **Cliente**: HTTP 401 — *http://localhost:3000/usuarios*
- **Cliente**: HTTP 401 — *http://localhost:3000/mascotas*
- **Cliente**: HTTP 401 — *http://localhost:3000/citas*
- **Cliente**: HTTP 401 — *http://localhost:3000/citas*
- **Mobile**: HTTP 401 — *http://localhost:3000/auth/login*
- **Mobile/Sidebar**: Botón de menú móvil no encontrado en 375px

## Detalle por sección

### Landing

- ✅ Título: "Vet Nova | Clínica Veterinaria"

### Landing/Nav

- ✅ 4 enlaces en la navbar

### Login

- ⚠️ No se detectó mensaje de error visible con credenciales incorrectas

### Público

- ⚠️ HTTP 401 — `http://localhost:3000/auth/login`
- ❌ Error de consola JS — `Failed to load resource: the server responded with a status of 401 (Unauthorized)`

### Register

- ✅ 5 campos de entrada en el formulario de registro

### Admin

- ⚠️ HTTP 401 — `http://localhost:3000/auth/login`
- ❌ Error de consola JS — `Failed to load resource: the server responded with a status of 401 (Unauthorized)`
- ⚠️ HTTP 401 — `http://localhost:3000/usuarios`
- ❌ Error de consola JS — `Failed to load resource: the server responded with a status of 401 (Unauthorized)`
- ⚠️ HTTP 401 — `http://localhost:3000/mascotas`
- ❌ Error de consola JS — `Failed to load resource: the server responded with a status of 401 (Unauthorized)`
- ⚠️ HTTP 401 — `http://localhost:3000/usuarios`
- ❌ Error de consola JS — `Failed to load resource: the server responded with a status of 401 (Unauthorized)`
- ⚠️ HTTP 401 — `http://localhost:3000/citas`
- ❌ Error de consola JS — `Failed to load resource: the server responded with a status of 401 (Unauthorized)`
- ⚠️ HTTP 401 — `http://localhost:3000/citas`
- ❌ Error de consola JS — `Failed to load resource: the server responded with a status of 401 (Unauthorized)`
- ⚠️ HTTP 401 — `http://localhost:3000/mascotas`
- ❌ Error de consola JS — `Failed to load resource: the server responded with a status of 401 (Unauthorized)`
- ⚠️ HTTP 401 — `http://localhost:3000/propietarios`
- ❌ Error de consola JS — `Failed to load resource: the server responded with a status of 401 (Unauthorized)`
- ⚠️ HTTP 401 — `http://localhost:3000/citas`
- ❌ Error de consola JS — `Failed to load resource: the server responded with a status of 401 (Unauthorized)`
- ⚠️ HTTP 401 — `http://localhost:3000/usuarios`
- ❌ Error de consola JS — `Failed to load resource: the server responded with a status of 401 (Unauthorized)`
- ⚠️ HTTP 401 — `http://localhost:3000/mascotas`
- ❌ Error de consola JS — `Failed to load resource: the server responded with a status of 401 (Unauthorized)`
- ⚠️ HTTP 401 — `http://localhost:3000/citas`
- ❌ Error de consola JS — `Failed to load resource: the server responded with a status of 401 (Unauthorized)`
- ⚠️ HTTP 401 — `http://localhost:3000/citas`
- ❌ Error de consola JS — `Failed to load resource: the server responded with a status of 401 (Unauthorized)`
- ⚠️ HTTP 401 — `http://localhost:3000/citas`
- ❌ Error de consola JS — `Failed to load resource: the server responded with a status of 401 (Unauthorized)`
- ❌ Error de consola JS — `Error: Sesión expirada. Por favor inicia sesión nuevamente.
    at apiFetch (http://localhost:3001/_next/static/chunks/_139.v4p._.js:32:19)
    at async fetchCitas (http://localhost:3001/_next/static/`

### Admin/Login

- ❌ URL inesperada tras login: http://localhost:3001/login

### Admin/Dashboard

- ✅ 0 cards de estadísticas visibles
- ⚠️ No se encontró ningún canvas de gráfica

### Admin/Usuarios

- ✅ 0 tarjeta(s) de usuario visibles
- ⚠️ Botón 'Nuevo Usuario' no encontrado

### Admin/Citas

- ✅ 0 elemento(s) de cita visibles
- ✅ 0 botones de filtro encontrados
- ⚠️ No hay citas canceladas visibles para probar reprogramar

### Admin/Mascotas

- ✅ ~2 elementos en lista de mascotas

### Admin/Reportes

- ⚠️ No se renderizó ninguna gráfica

### Admin/Notificaciones

- ✅ 0 notificaciones visibles

### Admin/Configuracion

- ✅ 1 formulario(s) de configuración

### Admin/Permisos

- ✅ Admin no puede acceder a /veterinario (redirigido)

### Vet/Login

- ✅ Redirige correctamente a /veterinario

### Veterinario

- ❌ Excepción no capturada — `Hydration failed because the server rendered text didn't match the client. As a result this tree will be regenerated on the client. This can happen if a SSR-ed Client Component used:

- A server/clien`
- ❌ Excepción no capturada — `Hydration failed because the server rendered text didn't match the client. As a result this tree will be regenerated on the client. This can happen if a SSR-ed Client Component used:

- A server/clien`
- ❌ Excepción no capturada — `Hydration failed because the server rendered text didn't match the client. As a result this tree will be regenerated on the client. This can happen if a SSR-ed Client Component used:

- A server/clien`
- ❌ Excepción no capturada — `Hydration failed because the server rendered text didn't match the client. As a result this tree will be regenerated on the client. This can happen if a SSR-ed Client Component used:

- A server/clien`
- ❌ Excepción no capturada — `Hydration failed because the server rendered text didn't match the client. As a result this tree will be regenerated on the client. This can happen if a SSR-ed Client Component used:

- A server/clien`
- ❌ Excepción no capturada — `Hydration failed because the server rendered text didn't match the client. As a result this tree will be regenerated on the client. This can happen if a SSR-ed Client Component used:

- A server/clien`
- ⚠️ HTTP 403 — `http://localhost:3000/usuarios`
- ❌ Error de consola JS — `Failed to load resource: the server responded with a status of 403 (Forbidden)`
- ⚠️ HTTP 403 — `http://localhost:3000/usuarios`
- ❌ Error de consola JS — `Failed to load resource: the server responded with a status of 403 (Forbidden)`

### Vet/citas

- ✅ Página carga sin errores visibles

### Vet/mascotas

- ✅ Página carga sin errores visibles

### Vet/historial

- ✅ Página carga sin errores visibles

### Vet/notificaciones

- ✅ Página carga sin errores visibles

### Vet/configuracion

- ✅ Página carga sin errores visibles

### Vet/Permisos

- ✅ Veterinario no puede acceder a /admin (redirigido)

### Cliente/Register

- ⚠️ URL inesperada tras registro: http://localhost:3001/register

### Cliente/dashboard

- ✅ Página carga sin errores visibles

### Cliente/mascotas

- ✅ Página carga sin errores visibles

### Cliente/agendar

- ✅ Página carga sin errores visibles

### Cliente/notificaciones

- ✅ Página carga sin errores visibles

### Cliente/historial

- ✅ Página carga sin errores visibles

### Cliente/perfil

- ✅ Página carga sin errores visibles

### Cliente/configuracion

- ✅ Página carga sin errores visibles

### Cliente/Agendar

- ✅ Formulario de nueva cita disponible

### Cliente

- ⚠️ HTTP 401 — `http://localhost:3000/usuarios`
- ❌ Error de consola JS — `Failed to load resource: the server responded with a status of 401 (Unauthorized)`
- ⚠️ HTTP 401 — `http://localhost:3000/mascotas`
- ❌ Error de consola JS — `Failed to load resource: the server responded with a status of 401 (Unauthorized)`
- ⚠️ HTTP 401 — `http://localhost:3000/citas`
- ❌ Error de consola JS — `Failed to load resource: the server responded with a status of 401 (Unauthorized)`
- ⚠️ HTTP 401 — `http://localhost:3000/citas`
- ❌ Error de consola JS — `Failed to load resource: the server responded with a status of 401 (Unauthorized)`

### Cliente/Permisos

- ✅ Cliente no puede acceder a /admin (redirigido)

### Mobile

- ⚠️ HTTP 401 — `http://localhost:3000/auth/login`
- ❌ Error de consola JS — `Failed to load resource: the server responded with a status of 401 (Unauthorized)`

### Mobile/Sidebar

- ⚠️ Botón de menú móvil no encontrado en 375px

### Mobile/Landing

- ✅ Landing carga en viewport 375px

## Screenshots

Guardados en `audit/screenshots/` (29 capturas).

---
*Generado automáticamente por `audit/audit.mjs`*
