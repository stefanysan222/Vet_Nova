# VetNova — Maquetación para Figma

Esta carpeta contiene archivos HTML autocontenidos que replican visualmente las vistas clave de VetNova, listos para importarse a Figma como maquetación (mockup) estática.

## Estructura de carpetas

```
figma-export/
├── auth/           Inicio de sesión y registro
├── cliente/        Panel Cliente (10 vistas de módulo + dashboard)
├── veterinario/    Panel Veterinario (dashboard + 6 vistas de módulo)
├── admin/          Dashboard del panel Admin
└── super-admin/    Dashboard del panel Super Admin
```

## Archivos incluidos

### `auth/`

| Archivo | Vista |
|---|---|
| `login.html` | Inicio de sesión |
| `register.html` | Registro de cuenta (cliente) |

### `cliente/`

| Archivo | Vista |
|---|---|
| `cliente-dashboard.html` | Dashboard del panel Cliente |
| `cliente-agendar.html` | Mis citas (listado, resumen y filtros) |
| `cliente-agendar-nueva.html` | Agendar nueva cita (asistente de 3 pasos) |
| `cliente-mascotas.html` | Mis mascotas (listado en grid) |
| `cliente-mascota-detalle.html` | Perfil completo de una mascota |
| `cliente-mascota-nueva.html` | Registro de una nueva mascota |
| `cliente-historial.html` | Historial médico agrupado por mes |
| `cliente-vacunas.html` | Vacunas (próximas y aplicadas) |
| `cliente-notificaciones.html` | Centro de notificaciones |
| `cliente-perfil.html` | Mi perfil (resumen de cuenta) |
| `cliente-configuracion.html` | Configuración de cuenta y seguridad |

### `veterinario/`

| Archivo | Vista |
|---|---|
| `veterinario-dashboard.html` | Dashboard del panel Veterinario |
| `veterinario-citas.html` | Agenda Veterinaria (citas registradas y estados) |
| `veterinario-mascotas.html` | Pacientes asignados y atendidos |
| `veterinario-historial.html` | Expediente clínico del paciente (historial de atenciones) |
| `veterinario-consulta.html` | Registrar consulta y tratamiento |
| `veterinario-notificaciones.html` | Alertas y seguimiento (notificaciones clínicas) |
| `veterinario-perfil.html` | Mi Perfil (resumen de cuenta) |
| `veterinario-configuracion.html` | Mi perfil — información del veterinario y seguridad |

### `admin/`

| Archivo | Vista |
|---|---|
| `admin-dashboard.html` | Dashboard del panel Admin (acento violeta) |
| `admin-usuarios.html` | Gestión de Usuarios (estadísticas y listado de usuarios) |
| `admin-citas.html` | Agenda de atención (citas, filtros y acciones) |
| `admin-mascotas.html` | Gestión de mascotas (listado y filtros por especie) |
| `admin-reportes.html` | Resumen del sistema (indicadores, gráficas y distribución de citas) |
| `admin-notificaciones.html` | Alertas del sistema (notificaciones de citas) |
| `admin-configuracion.html` | Perfil de cuenta (información personal y contraseña) |

### `super-admin/`

| Archivo | Vista |
|---|---|
| `super-admin-dashboard.html` | Dashboard del panel Super Admin (acento violeta + tabla de clínicas) |

---

Cada archivo es 100% autónomo: incluye su propia configuración de Tailwind (vía CDN), tipografía Inter (Google Fonts) e iconos Lucide (vía CDN). No dependen de archivos locales del proyecto, por lo que pueden abrirse directamente en el navegador o importarse a Figma sin preparación adicional.

Los datos (nombres, citas, métricas, calendario, etc.) son **mock/estáticos**, solo para representar el diseño.

## Cómo importar a Figma con el plugin "html.to.design"

1. Abre Figma (escritorio o navegador) y crea o abre el archivo donde quieras pegar las maquetaciones.
2. Instala el plugin **html.to.design** desde la Community de Figma (busca "html.to.design").
3. Abre el plugin: menú **Plugins → html.to.design**.
4. Elige la opción de importar **desde una URL** o **subiendo un archivo HTML local**:
   - Si el plugin permite arrastrar archivos, arrastra el `.html` deseado directamente.
   - Si solo acepta URL, abre el archivo HTML en el navegador (doble clic) y copia la URL local (`file:///...`), o sirve la carpeta con un servidor estático simple (por ejemplo `npx serve figma-export`) y usa la URL `http://localhost:.../veterinario/veterinario-citas.html`.
5. Espera a que el plugin renderice la página y genere las capas de Figma (frames, textos, formas, iconos).
6. Una vez importado, el resultado aparece como un frame editable: puedes reorganizar capas, ajustar componentes y aplicar tus propios estilos/variables de Figma.

## Recomendaciones

- Importa **una vista por frame** para mantener el archivo de Figma organizado (por ejemplo, un frame por dashboard).
- Después de importar, agrupa los elementos repetidos (sidebar, header, cards de métricas) como **componentes** de Figma para reutilizarlos entre vistas.
- Los iconos de Lucide se renderizan como SVG; si el plugin los convierte en imágenes, puedes reemplazarlos por el plugin oficial de iconos Lucide para Figma si necesitas que sean editables.
- Los colores y sombras usados corresponden a los tokens reales del proyecto (`tailwind.config.ts` y `globals.css`), por lo que puedes crear **estilos de color** en Figma con los mismos valores para mantener consistencia con el código.
