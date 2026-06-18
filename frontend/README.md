# VetNova Frontend

Landing page moderna para VetNova, software SaaS de gestión veterinaria.

## 🏗️ Arquitectura

### Estructura de Archivos

```
frontend/
├── app/
│   ├── components/          # Componentes reutilizables
│   │   ├── Button.tsx      # Componente Button base
│   │   ├── Footer.tsx      # Pie de página
│   │   ├── Hero.tsx        # Sección principal
│   │   ├── Navbar.tsx      # Barra de navegación
│   │   ├── Services.tsx    # Servicios ofrecidos
│   │   └── Stats.tsx       # Estadísticas
│   ├── constants/          # Constantes compartidas
│   │   └── index.ts        # Colores y estilos comunes
│   ├── types/              # Tipos TypeScript
│   │   └── index.ts        # Interfaces compartidas
│   ├── globals.css         # Estilos globales
│   ├── layout.tsx          # Layout principal
│   └── page.tsx            # Página principal
├── public/
│   └── Vetnova_logo.jpeg   # Logo de la aplicación
└── package.json
```

## 🎨 Diseño

- **Colores principales**: Azul (#2563eb), Blanco, Gris
- **Framework CSS**: Tailwind CSS
- **Iconos**: Lucide React
- **Tipografía**: Sistema de Tailwind

## 🧹 Código Limpio

### Principios Aplicados

1. **Separación de responsabilidades**: Componentes, constantes, tipos separados
2. **Reutilización**: Componente Button base para consistencia
3. **TypeScript**: Interfaces bien definidas para type safety
4. **Constantes**: Estilos y datos centralizados
5. **Nombres descriptivos**: Variables y funciones autoexplicativas

### Patrones de Código

- **Constantes arriba**: Todas las constantes al inicio de cada archivo
- **Imports organizados**: Librerías externas, luego locales
- **Interfaces compartidas**: Tipos reutilizables en `/types`
- **Estilos consistentes**: Sistema de constantes para colores y espaciado

## 🚀 Desarrollo

```bash
# Instalar dependencias
npm install

# Ejecutar en desarrollo
npm run dev

# Build de producción
npm run build

# Verificar linting
npx eslint .
```

## 📦 Dependencias

- **Next.js 16**: Framework React con App Router
- **React 19**: Biblioteca de componentes
- **TypeScript**: Type safety
- **Tailwind CSS**: Utilidades de estilos
- **Lucide React**: Iconos SVG

## 🎯 Mejores Prácticas Implementadas

- ✅ Componentes funcionales con hooks
- ✅ Props bien tipadas con TypeScript
- ✅ Estilos responsive con Tailwind
- ✅ Optimización de imágenes con Next.js
- ✅ Accesibilidad básica (alt texts, navegación por teclado)
- ✅ Código modular y reutilizable
- ✅ Constantes centralizadas
- ✅ Nombres semánticos en inglés
- ✅ Documentación inline donde necesario
