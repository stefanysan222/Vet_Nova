# DOCUMENTO DE WIREFRAMES, MOCKUPS Y PROTOTIPOS

## 1. Portada / Encabezado

| Campo | Valor |
|---|---|
| **Proyecto** | VetNova — Sistema de gestión veterinaria |
| **Fecha** | 2026-06-12 |
| **Versión del documento** | 1.0 |
| **Responsable del diseño UX/UI** | Anderson Morales |

---

## 2. Objetivo del Documento

Este documento presenta los mockups y prototipos de interfaz diseñados para las pantallas del sistema **VetNova**.

El propósito es representar visualmente las pantallas del sistema antes (y durante) del desarrollo, permitiendo validar la navegación, la distribución de la información y la experiencia de usuario de cada rol: **Cliente**, **Veterinario**, **Administrador** y **Super Administrador**.

Las pantallas representadas están basadas en las funcionalidades implementadas en el frontend (`frontend/app/`) y replicadas como archivos HTML autocontenidos en `figma-export/`, organizados por rol, listos para importarse a Figma mediante el plugin **html.to.design**.

---

## 3. Glosario de términos

| Término | Definición |
|---|---|
| **Wireframe** | Boceto de bajo nivel que muestra la estructura básica de una pantalla. |
| **Mockup** | Diseño más detallado con estilos, colores y tipografía. |
| **Prototipo** | Versión interactiva que permite navegar entre pantallas. |

---

## 4. Resumen de Pantallas

| Código | Nombre de Pantalla | Tipo | Historia de Usuario Relacionada | Estado |
|---|---|---|---|---|
| UI-01 | Inicio de sesión | Mockup | HU-01: Iniciar sesión | Aprobado |
| UI-02 | Registro de cuenta | Mockup | HU-02: Crear cuenta de cliente | Aprobado |
| UI-03 | Dashboard Cliente | Mockup | HU-10: Ver resumen de mi cuenta | Aprobado |
| UI-04 | Mis citas | Mockup | HU-11: Consultar mis citas | Aprobado |
| UI-05 | Agendar nueva cita | Mockup | HU-12: Agendar una cita | Aprobado |
| UI-06 | Mis mascotas | Mockup | HU-13: Ver mis mascotas | Aprobado |
| UI-07 | Detalle de mascota | Mockup | HU-14: Ver perfil de mascota | Aprobado |
| UI-08 | Registrar mascota | Mockup | HU-15: Registrar nueva mascota | Aprobado |
| UI-09 | Historial médico | Mockup | HU-16: Consultar historial médico | Aprobado |
| UI-10 | Vacunas | Mockup | HU-17: Consultar vacunas | Aprobado |
| UI-11 | Notificaciones (Cliente) | Mockup | HU-18: Recibir notificaciones | Aprobado |
| UI-12 | Mi perfil (Cliente) | Mockup | HU-19: Ver mi perfil | Aprobado |
| UI-13 | Configuración de cuenta (Cliente) | Mockup | HU-20: Editar configuración de cuenta | Aprobado |
| UI-14 | Dashboard Veterinario | Mockup | HU-21: Ver agenda del día | Aprobado |
| UI-15 | Agenda veterinaria | Mockup | HU-22: Gestionar citas asignadas | Aprobado |
| UI-16 | Pacientes asignados | Mockup | HU-23: Ver pacientes asignados | Aprobado |
| UI-17 | Historial clínico del paciente | Mockup | HU-24: Consultar expediente clínico | Aprobado |
| UI-18 | Registrar consulta y tratamiento | Mockup | HU-25: Registrar consulta médica | Aprobado |
| UI-19 | Notificaciones (Veterinario) | Mockup | HU-26: Recibir alertas clínicas | Aprobado |
| UI-20 | Mi perfil (Veterinario) | Mockup | HU-27: Ver mi perfil profesional | Aprobado |
| UI-21 | Configuración (Veterinario) | Mockup | HU-28: Editar información profesional | Aprobado |
| UI-22 | Dashboard Admin | Mockup | HU-30: Ver panel administrativo | Aprobado |
| UI-23 | Gestión de usuarios | Mockup | HU-31: Administrar usuarios | Aprobado |
| UI-24 | Agenda de atención (Admin) | Mockup | HU-32: Gestionar citas de la clínica | Aprobado |
| UI-25 | Gestión de mascotas (Admin) | Mockup | HU-33: Administrar mascotas registradas | Aprobado |
| UI-26 | Reportes | Mockup | HU-34: Consultar reportes del sistema | Aprobado |
| UI-27 | Notificaciones (Admin) | Mockup | HU-35: Recibir alertas del sistema | Aprobado |
| UI-28 | Configuración (Admin) | Mockup | HU-36: Editar perfil de cuenta administrativa | Aprobado |
| UI-29 | Dashboard Super Admin | Mockup | HU-40: Administrar clínicas registradas | Aprobado |

---

## 5. Wireframes

Para este proyecto no se generaron wireframes de bajo nivel como entregable independiente: el diseño partió directamente de mockups de alta fidelidad (sección 6), construidos sobre el sistema de diseño ya implementado en el frontend (tipografía Inter, paleta de colores por rol, componentes reutilizables). Esto permitió validar simultáneamente la estructura de la información y el estilo visual con menos iteraciones.

La estructura básica (sin estilos) de cada pantalla puede observarse abriendo cualquiera de los archivos en `figma-export/` y removiendo temporalmente la configuración de Tailwind: la jerarquía de `<header>`, `<aside>`, `<nav>`, `<section>` y `<article>` refleja la organización estructural equivalente a un wireframe.

---

## 6. Mockups

🔸 Nivel medio-alto – diseño visual realista

Todos los mockups son archivos HTML autocontenidos (Tailwind CDN + tipografía Inter + iconos Lucide), ubicados en `figma-export/`, organizados por rol:

```
figma-export/
├── auth/           Inicio de sesión y registro
├── cliente/        Panel Cliente (10 vistas de módulo + dashboard)
├── veterinario/    Panel Veterinario (dashboard + 6 vistas de módulo)
├── admin/          Panel Admin (dashboard + 6 vistas de módulo)
└── super-admin/    Panel Super Admin (dashboard)
```

Paleta general: tonos institucionales **índigo** (Cliente/Veterinario, `#5457E5`) y **violeta** (Admin/Super Admin, `#7C3AED`), sobre fondos neutros claros (`#F8F8FC`/`#F7F6FA`), con estados semánticos en verde (éxito/confirmado), ámbar (pendiente), rojo (cancelado/error) y morado (reprogramado). Tipografía **Inter** en toda la aplicación. Diseño **responsive**: sidebar fijo en escritorio (`lg:flex`) que colapsa a menú móvil (`lg:hidden`), grids que pasan de 1–2 columnas en móvil a 3–5 en escritorio.

### 6.1 Autenticación (`figma-export/auth/`)

**UI-01: Inicio de sesión (`login.html`)**
- 🖼 Imagen: `login-light.png`, `login-dark.png`, `login-error.png`
- 🎨 Tarjeta centrada con logo VetNova, campos de correo y contraseña, mensaje de error inline, soporte de modo oscuro
- 🔁 Botón "Iniciar sesión" → redirige al dashboard correspondiente al rol del usuario; si el correo está asociado a varias clínicas, se muestra un selector de clínica
- 🧠 Basado en HU-01

**UI-02: Registro de cuenta (`register.html`)**
- 🖼 Imagen: `register-light.png`, `register-valid.png`
- 🎨 Formulario de registro de cliente con validaciones inline (nombre, correo, contraseña, confirmación); soporta selector de clínica al registrarse sin enlace de invitación
- 🔁 Botón "Crear cuenta" → redirige al Dashboard Cliente tras validación exitosa
- 🧠 Basado en HU-02

### 6.2 Panel Cliente (`figma-export/cliente/`)

| Código | Archivo | Descripción visual | Componentes clave |
|---|---|---|---|
| UI-03 | `cliente-dashboard.html` | Bento grid con bienvenida, próximas citas, accesos rápidos y resumen de mascotas | Tarjetas de resumen, lista de próximas citas, botones de acción rápida |
| UI-04 | `cliente-agendar.html` | Listado de citas propias con filtros por estado y resumen | Tarjetas de cita, badges de estado (Pendiente/Confirmada/Cancelada), filtros |
| UI-05 | `cliente-agendar-nueva.html` | Asistente de 3 pasos: mascota → servicio/veterinario → fecha/hora | Selector de pasos, tarjetas seleccionables, calendario, resumen final |
| UI-06 | `cliente-mascotas.html` | Grid de mascotas registradas con foto/avatar, especie y raza | Tarjetas de mascota, botón "Agregar mascota" |
| UI-07 | `cliente-mascota-detalle.html` | Perfil completo: datos generales, historial, vacunas | Cabecera con avatar, secciones por pestañas/bloques |
| UI-08 | `cliente-mascota-nueva.html` | Formulario de registro de nueva mascota | Inputs (nombre, especie, raza, edad, peso), selector de foto |
| UI-09 | `cliente-historial.html` | Historial médico agrupado por mes | Timeline de atenciones, tarjetas por consulta |
| UI-10 | `cliente-vacunas.html` | Vacunas próximas y aplicadas | Listas separadas por estado, badges de fecha |
| UI-11 | `cliente-notificaciones.html` | Centro de notificaciones | Lista de alertas, filtros, indicador de no leídas |
| UI-12 | `cliente-perfil.html` | Resumen de cuenta y estadísticas | InfoRow de datos personales, tarjetas de estadísticas, accesos rápidos |
| UI-13 | `cliente-configuracion.html` | Configuración de cuenta y seguridad | Formularios de datos personales y cambio de contraseña |

🖼 Capturas de referencia: `cliente-dashboard-bento.png`, `cliente-dashboard-empty.png`, `cliente-agendar.png`, `cliente-agendar-nueva.png`, `cliente-agendar-paso2.png`, `cliente-agendar-paso3.png`, `cliente-mascotas-list.png`, `cliente-mascotas-empty.png`, `cliente-mascotas-nueva.png`, `cliente-mascota-detalle.png`, `cliente-historial.png`, `cliente-vacunas.png`, `cliente-notificaciones.png`, `cliente-perfil.png`, `cliente-configuracion.png`, `cliente-issue-overlay.png`

📱 Responsive: sidebar colapsable en móvil, grids adaptables (1 columna en móvil, 2–3 en escritorio).

### 6.3 Panel Veterinario (`figma-export/veterinario/`)

| Código | Archivo | Descripción visual | Componentes clave |
|---|---|---|---|
| UI-14 | `veterinario-dashboard.html` | Resumen de agenda del día y métricas de atención | Tarjetas de indicadores, agenda del día, gráfico de citas |
| UI-15 | `veterinario-citas.html` | Agenda veterinaria con citas registradas y sus estados | Lista de citas, badges de estado, filtros |
| UI-16 | `veterinario-mascotas.html` | Pacientes asignados y atendidos | Tarjetas de indicador (por atender/atendidos/seguimiento/tratamientos), tarjetas de paciente con badge de estado |
| UI-17 | `veterinario-historial.html` | Expediente clínico del paciente seleccionado | Selector de paciente, datos clínicos, timeline de atenciones, documento adjunto, tratamiento actual |
| UI-18 | `veterinario-consulta.html` | Registro de consulta y tratamiento | Formulario de datos de la atención (signos vitales, motivo) y registro clínico (hallazgos, diagnóstico, tratamiento, seguimiento) |
| UI-19 | `veterinario-notificaciones.html` | Alertas y seguimiento clínico | Resumen de no leídas/acciones, lista agrupada por día, filtros por tipo |
| UI-20 | `veterinario-perfil.html` | Resumen de cuenta profesional | InfoRow de datos del veterinario, estadísticas de atención, accesos rápidos |
| UI-21 | `veterinario-configuracion.html` | Información profesional y seguridad de cuenta | Formulario de datos personales/profesionales y cambio de contraseña |

🖼 Captura de referencia: `veterinario-dashboard-bento.png`

📱 Responsive: layout en grid de dos columnas (`xl:grid-cols-[...]`) que se apila en una sola columna en pantallas pequeñas.

### 6.4 Panel Administrador (`figma-export/admin/`)

| Código | Archivo | Descripción visual | Componentes clave |
|---|---|---|---|
| UI-22 | `admin-dashboard.html` | Panel administrativo con bienvenida, agenda del día, métricas, gráfico de citas, calendario y actividad reciente | Tarjetas de métricas (clientes, veterinarios, mascotas, citas), gráfico de barras, calendario mensual, acciones rápidas |
| UI-23 | `admin-usuarios.html` | Gestión de usuarios del sistema | Tarjetas de estadísticas (clientes/veterinarios/mascotas/citas/pendientes), listado de usuarios con avatar, rol (badge por color) y acciones Editar/Eliminar |
| UI-24 | `admin-citas.html` | Agenda de atención de toda la clínica | Tarjetas de estadísticas (total/pendientes/confirmadas), filtros por estado, listado de citas con acciones (Confirmar/Reprogramar/Cancelar) |
| UI-25 | `admin-mascotas.html` | Gestión de mascotas registradas | Tarjetas de estadísticas por especie (total/caninos/felinos/otros), buscador, filtros, listado con avatar por especie y conteo de citas |
| UI-26 | `admin-reportes.html` | Resumen del sistema con indicadores y gráficas | Indicadores (clientes, veterinarios, mascotas, citas hoy/pendientes), gráfico de citas por día, barra de distribución por estado, últimas citas registradas |
| UI-27 | `admin-notificaciones.html` | Alertas generadas por el sistema | Contadores (total/no leídas), pestañas (No leídas/Todas), listado de notificaciones con panel lateral de resumen |
| UI-28 | `admin-configuracion.html` | Perfil de cuenta del administrador | Tarjeta de perfil con datos de cuenta y clínica, formulario de información personal, formulario de cambio de contraseña con validación de coincidencia |

🖼 Capturas de referencia: `admin-dashboard-full.png`, `admin-dashboard-full2.png`, `admin-dashboard-scrolled.png`, `admin-configuracion.png`, `admin-configuracion-1440.png`, `admin-config-interact.png`, `admin-config-cancel.png`

🎨 Acento institucional violeta (`#7C3AED`), sidebar con datos del administrador y clínica activa, topbar con buscador global, modo oscuro y notificaciones.

### 6.5 Panel Super Administrador (`figma-export/super-admin/`)

**UI-29: Dashboard Super Admin (`super-admin-dashboard.html`)**
- 🖼 Imagen: `super-admin-light.png`, `super-admin-dark.png`, `super-admin-light-wide.png`, `super-admin-dashboard-bento.png`, `super-admin-table.png`
- 🎨 Acento violeta, métricas globales de la plataforma (clínicas, usuarios) y tabla de clínicas registradas con su estado
- ✅ Incluye tabla de clínicas, indicadores globales y acciones administrativas sobre clínicas
- 🧠 Basado en HU-40

---

## 7. Prototipos

🔶 Nivel más alto – navegación simulada

Existen dos formas de evaluar el prototipo interactivo de VetNova:

1. **Prototipo navegable en Figma** (a partir de los mockups)
   - Importar los archivos de `figma-export/<rol>/*.html` a Figma con el plugin **html.to.design** (ver instrucciones en `figma-export/README.md`).
   - Conectar los frames resultantes con el conector de Figma para simular el flujo: `Login → Dashboard (según rol) → Módulo correspondiente`.
   - 📝 Flujo de ejemplo (Cliente): `UI-01 Login → UI-03 Dashboard → UI-05 Agendar nueva cita → UI-04 Mis citas`.

2. **Prototipo funcional (aplicación real)**
   - El frontend (`frontend/`) es una aplicación Next.js completamente funcional conectada a la API del backend.
   - Ejecutar con `npm run dev` dentro de `frontend/` y abrir `http://localhost:3000`.
   - Cada rol (Cliente, Veterinario, Administrador, Super Administrador) tiene su propio layout y navegación protegida por autenticación (`frontend/app/admin/layout.tsx` y equivalentes por rol).
   - 🔄 Flujo simulado: `Login → selección de clínica (si aplica) → Dashboard del rol → módulos del menú lateral`.

> Nota de validación: no se han registrado aún pruebas formales con usuarios externos sobre este prototipo; las validaciones realizadas hasta ahora corresponden a revisión interna de diseño (ver `audit/informe-auditoria-fullstack.md`).

---

## 8. Comentarios y Observaciones Globales

- **Accesibilidad**: los botones de acción incluyen iconografía + texto (no solo iconos); el toggle de modo oscuro incluye `aria-label` dinámico ("Activar modo claro"/"Activar modo oscuro"). Se recomienda revisar contraste de los badges de estado (ámbar/verde/rojo) en modo oscuro.
- **Compatibilidad de diseño con dispositivos**: todas las pantallas usan un patrón responsive consistente — sidebar fijo en escritorio (`lg:flex`) y menú deslizable en móvil (`lg:hidden` + overlay), grids que se adaptan de 1 columna (móvil) a 3–5 columnas (escritorio).
- **Modo oscuro**: soportado en toda la aplicación mediante la clase `dark` en `<html>`, con overrides específicos para el panel Admin/Super Admin (acento violeta `#A78BFA` sobre fondo `#0E0B16`).
- **Consistencia visual**: el panel Cliente y Veterinario comparten la paleta índigo; Admin y Super Admin comparten la paleta violeta. Los estados de citas (Pendiente, Confirmada, Cancelada, Finalizada, Reprogramada, En proceso) usan el mismo mapeo de color en todos los roles.
- **Cambios sugeridos**: pendiente de revisión por el equipo — registrar aquí observaciones de stakeholders una vez compartido el prototipo en Figma.

---

## 9. Control de Cambios

| Versión | Fecha | Cambios | Responsable |
|---|---|---|---|
| 1.0 | 2026-06-12 | Mockups iniciales de las 29 pantallas (Auth, Cliente, Veterinario, Admin, Super Admin) exportadas a `figma-export/` y documentadas | Anderson Morales |
