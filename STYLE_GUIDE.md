# Comacon-FE — Guía de Estilos Completa (AI-Readable)

> App gestión emergencias + prevención incendios forestales.
> **Stack:** React 18.3.1 + TypeScript 5.5.4 + Chakra UI 2.10.3 + Emotion 11.14 + styled-components 6.1.18 + Vite 5.4.21 + Zustand 4.5.5

---

## ÍNDICE

1. [Tema Global](#1-tema-global-chakra-ui)
2. [Tipografía](#2-tipografía)
3. [Paleta de Colores](#3-paleta-de-colores-completa)
4. [Espaciado](#4-espaciado)
5. [Border-Radius](#5-border-radius)
6. [Sombras](#6-sombras-box-shadow)
7. [Z-Index](#7-z-index)
8. [Breakpoints](#8-breakpoints-y-patrones-responsivos)
9. [Transiciones y Animaciones](#9-transiciones-y-animaciones)
10. [Chakra Variants y ColorSchemes](#10-chakra-variants-y-colorschemes)
11. [Componentes Reutilizables](#11-componentes-reutilizables)
12. [Sistema de Iconos](#12-sistema-de-iconos)
13. [Assets SVG](#13-assets-svg-completos)
14. [Hooks Personalizados](#14-hooks-personalizados)
15. [Rutas AppRoute](#15-rutas-approute)
16. [Config / Feature Flags](#16-config--feature-flags)
17. [Patrones CSS](#17-patrones-css-recurrentes)
18. [Dependencias](#18-dependencias-ui-completas)
19. [Estructura de Pages](#19-estructura-de-pages)
20. [Patrones de Estado](#20-patrones-de-estado-global)

---

## 1. TEMA GLOBAL (Chakra UI)

**Archivo:** [src/theme.ts](src/theme.ts)

```typescript
import { extendTheme, type ThemeConfig } from "@chakra-ui/react";

const config: ThemeConfig = {
  initialColorMode: "dark",
  useSystemColorMode: false,
};

const theme = extendTheme({
  config,
  semanticTokens: {
    colors: {
      sideBar: {
        default: "#55565A",
        _dark: "#55565A",
      },
    },
  },
});
```

### Semantic Tokens

| Token   | Light     | Dark      | Uso                |
|---------|-----------|-----------|--------------------|
| sideBar | `#55565A` | `#55565A` | Sidebar, header BG |

Default mode: **dark**. Sistema no toggle automático.

---

## 2. TIPOGRAFÍA

### Fuentes

| Fuente        | Fuente del archivo                        | Stack Fallback                                   | Uso                      |
|---------------|-------------------------------------------|--------------------------------------------------|--------------------------|
| `'Osprean'`   | `src/assets/fonts/osprean.ttf`            | —                                                | Logo, branding           |
| `'OspreanFont'`| Mismo TTF, clase alternativa             | sans-serif                                       | Títulos `.osprean-title` |
| Inter         | CDN/system                                | `system-ui, Avenir, Helvetica, Arial, sans-serif`| Body, UI general         |

### Declaraciones @font-face

```css
/* src/index.css */
@font-face {
  font-family: 'Osprean';
  src: url('./assets/fonts/osprean.ttf') format('truetype');
  font-weight: normal;
  font-style: normal;
  font-display: swap;
}

/* src/assets/fonts/fonts.css */
@font-face {
  font-family: 'OspreanFont';
  src: url('./osprean.ttf') format('truetype');
}

.osprean-title {
  font-family: 'OspreanFont', sans-serif;
  color: white;
  font-size: 2rem;
  letter-spacing: 0.5px;
}
```

### Root Config Global

```css
:root {
  font-family: Inter, system-ui, Avenir, Helvetica, Arial, sans-serif;
  line-height: 1.5;
  font-weight: 400;
  font-synthesis: none;
  text-rendering: optimizeLegibility;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}
```

### Escala de Tamaños

| Elemento             | Tamaño    | line-height | font-weight |
|----------------------|-----------|-------------|-------------|
| h1                   | `3.2em`   | `1.1`       | —           |
| `.osprean-title`     | `2rem`    | —           | normal      |
| Body base            | inherit   | `1.5`       | `400`       |
| Sidebar items        | `14px`    | —           | `400`       |
| Sidebar sub-items    | `12px`    | —           | `400`       |
| Logo texto           | `18px`    | —           | —           |
| Tamaños custom vistos| `8, 9, 10, 11, 12, 13, 14, 20px` | — | — |
| Chakra tokens        | `sm=14, md=16, lg=18, xl=20, 2xl=24` | — | — |

### Reset Global

```css
h4, p, h5 { margin: 0; }
h2 { margin-top: 0; }
li { list-style: none; margin: 0; padding: 0; }
html, body, #root { height: 100%; margin: 0; padding: 0; overflow: hidden; }
body { display: flex; min-width: 320px; min-height: 100vh; }
input, select { margin: 8px 4px; }
```

---

## 3. PALETA DE COLORES COMPLETA

### 3.1 Colores de Marca

| Nombre             | Hex        | Uso                                |
|--------------------|------------|------------------------------------|
| Sidebar BG         | `#55565A`  | Sidebar, header, chatbot window    |
| Accent Teal        | `#5AAFBA`  | Overlay buttons, acento principal  |
| Resource Default   | `#5DAFB8`  | Recursos mapa default              |
| Dark BG            | `#2D3748`  | Flow editor, teams page BG         |
| Disabled Gray      | `#BBBBBB`  | Overlays deshabilitados            |

### 3.2 Colores UI Base

| Propósito         | Valor                            |
|-------------------|----------------------------------|
| Texto principal   | `white` / `#FFFFFF`              |
| Texto secundario  | `rgba(255, 255, 255, 0.7)`       |
| Texto terciario   | `rgba(255, 255, 255, 0.4)`       |
| Border/Divider    | `rgba(255, 255, 255, 0.1)`       |
| Hover BG suave    | `rgba(255, 255, 255, 0.05)`      |
| Hover BG          | `rgba(255, 255, 255, 0.1)`       |
| Hover BG fuerte   | `rgba(255, 255, 255, 0.25)`      |
| Active BG         | `rgba(255, 255, 255, 0.2)`       |
| Login input BG    | `#efefef`                        |
| Login input text  | `#2d3748`                        |

### 3.3 Colores de Estado

| Estado        | Chakra colorScheme | Hex equivalente    |
|---------------|--------------------|--------------------|
| Disponible    | `green`            | `#38A169`          |
| Asignado      | `orange`           | `#DD6B20`          |
| Mantenimiento | `red`              | `#E53E3E`          |
| En uso        | `orange`           | `#DD6B20`          |
| Fuera servicio| `red`              | `#E53E3E`          |
| Completado    | `green`            | `#38A169`          |
| Activo        | `red`/`blue`       | `#E53E3E`/`#3182CE`|
| En progreso   | `blue`             | `#3182CE`          |
| Pendiente     | `orange`           | `#DD6B20`          |
| Programado    | `purple`           | `#805AD5`          |

### 3.4 Niveles de Riesgo de Incendio (MeteoPage, MapService)

| Nivel | Hex         | Descripción    |
|-------|-------------|----------------|
| 0     | `#4A90E2`   | Sin riesgo     |
| 1     | `#00FF00`   | Riesgo mínimo  |
| 2     | `#FFFF00`   | Riesgo bajo    |
| 3     | `#FFA500`   | Moderado       |
| 4     | `#FF0000`   | Alto           |
| 5     | `#8B0000`   | Muy alto       |

### 3.5 Clasificación Archive/Incendios Históricos

| Periodo      | Hex         |
|--------------|-------------|
| 1DAY         | `#E53E3E`   |
| 7DAYS        | `#DD6B20`   |
| 30DAYS       | `#D69E2E`   |
| FireSeason   | `#3182CE`   |
| Default      | `#718096`   |

### 3.6 Categorías de Recursos (Map Layer)

| Categoría                | Hex       | Descripción |
|--------------------------|-----------|-------------|
| RL (Logísticos)          | `#4A90E2` | Azul        |
| RH (RRHH)                | `#E67E22` | Naranja     |
| MT (Medios/Transporte)   | `#27AE60` | Verde       |
| Punto agua fijo          | `#00B4D8` | Cyan        |
| Default                  | `#5DAFB8` | Teal        |

### 3.7 Grado de Vía (Track Grade)

| Grado   | Hex         | Significado     |
|---------|-------------|-----------------|
| grade1  | `#0EA5E9`   | Mejor (azul)    |
| grade2  | `#22C55E`   | Buena (verde)   |
| grade3  | `#EAB308`   | Media (ámbar)   |
| grade4  | `#F97316`   | Mala (naranja)  |
| grade5  | `#EF4444`   | Peor (rojo)     |
| sin     | `#1A5276`   | Dark blue       |

### 3.8 Modelos de Combustible (Fire Simulation - RGBA)

```
0:  [0, 100, 255, 180]       — Agua (azul)
1:  [200, 255, 200, 180]     — Verde claro
2:  [180, 245, 180, 180]
3:  [160, 235, 160, 180]
4:  [140, 220, 140, 180]
5:  [120, 205, 120, 180]
6:  [100, 190, 100, 180]
7:  [80, 175, 80, 180]
8:  [60, 160, 60, 180]
9:  [45, 145, 45, 180]
10: [30, 130, 30, 180]
11: [20, 110, 20, 180]
12: [10, 90, 10, 180]
13: [0, 70, 0, 180]          — Verde oscuro
```

### 3.9 Gráficos Meteorológicos

| Variable                 | Hex       |
|--------------------------|-----------|
| Temperatura seca (dry)   | `#E53E3E` |
| Punto de rocío           | `#38A169` |
| Viento / Humedad         | `#3182CE` |
| Soil / Left (meteogram)  | `#8B4513` |
| Right (meteogram)        | `#82CA9D` |
| MDS                      | `#2E8B57` |
| Línea cero               | `#FF0000` |
| Flight path              | `#FF9900` |
| Grid text                | `#333333` |

### 3.10 Flow Editor (Nodos)

| Elemento        | BG         | Border       | Text      |
|-----------------|------------|--------------|-----------|
| Nodo default    | `#fff`     | `1px #777`   | hereda    |
| Nodo Start/End  | `#000000`  | `2px #000000`| `#ffffff` |
| Conexiones (edge)| —         | `stroke #555555` | —     |
| Edge dashed     | —          | `stroke #999`| —         |
| Handle          | `#555`     | —            | —         |
| Selected node   | —          | `2px solid #3182ce`| —   |
| Outline focus   | —          | `2px solid #000000`| —   |
| Background grid | `#f8f9fa`  | —            | —         |
| Background dots | —          | —            | `#d1d5db` |
| Alert node BG   | `#BEE3F8`  | —            | —         |
| Warning node BG | `#FEFCBF`  | —            | —         |
| Standard node   | `#E2E8F0`  | —            | —         |

### 3.11 Border Colors Nodos Pamif

| Tipo       | Hex       |
|------------|-----------|
| Pink       | `#e91e63` |
| Blue       | `#1976d2` |
| Orange     | `#e65100` |
| Green      | `#388e3c` |
| Gray       | `#757575` |

### 3.12 Paleta Flow Editor (Node Types)

```
#ff6b6b  — Rojo
#feca57  — Amarillo
#54a0ff  — Azul claro
#1dd1a1  — Teal claro
#5f27cd  — Púrpura
#2e86de  — Azul
#576574  — Gris oscuro
#ffffff  — Blanco
```

### 3.13 Tasks/Usuarios (Mock)

| Elemento              | Hex       |
|-----------------------|-----------|
| User coral BG         | `#F5C4B3` |
| User coral text       | `#712B13` |
| User blue BG          | `#B5D4F4` |
| User blue text        | `#0C447C` |

### 3.14 Otros

| Elemento                      | Hex / Valor           |
|-------------------------------|-----------------------|
| Scrollbar thumb custom        | `#cbd5e0`             |
| Borders neutros               | `#ccc`, `#cccccc`, `#ddd` |
| Grises medios                 | `#777`, `#555`        |
| Texto oscuro                  | `#333`, `#333333`     |
| Backgrounds claros            | `#f0f0f0`, `#fafafa`, `#f9f9f9`, `#f8f9fa`, `#f1f1f1` |
| Search focus (PhotoUploader)  | `#007bff`, `#f0f8ff`  |
| Municipality highlight        | `#2563eb`             |
| Drone 3D material             | `#4299e1`             |
| Drone 3D light                | `#6bb5ff`             |
| Aquamarine accent             | `#7fffd4`             |
| Fire marker outer (map-fire)  | `rgba(255, 0, 0, 0.6)`|
| Fire marker inner (map-fire)  | `rgba(200, 0, 0, 1)`  |
| Selection highlight ring      | `rgba(29,158,117,0.2)`|
| Drop shadow blue glow         | `rgba(49,130,206,0.5)`|

### 3.15 Mapa Chakra colorScheme → Hex

| colorScheme | 500 hex default |
|-------------|-----------------|
| blue        | `#3182CE`       |
| teal        | `#319795`       |
| red         | `#E53E3E`       |
| green       | `#38A169`       |
| orange      | `#DD6B20`       |
| purple      | `#805AD5`       |
| gray        | `#718096`       |
| yellow      | `#D69E2E`       |

---

## 4. ESPACIADO

### Escala Chakra (rem)

| Token | rem      | px   |
|-------|----------|------|
| 0     | 0        | 0    |
| 0.5   | 0.125rem | 2px  |
| 1     | 0.25rem  | 4px  |
| 2     | 0.5rem   | 8px  |
| 3     | 0.75rem  | 12px |
| 4     | 1rem     | 16px |
| 5     | 1.25rem  | 20px |
| 6     | 1.5rem   | 24px |
| 8     | 2rem     | 32px |
| 10    | 2.5rem   | 40px |
| 12    | 3rem     | 48px |

### Uso Observado (frecuencia)

| Prop        | Valores + frecuencia                                    |
|-------------|---------------------------------------------------------|
| `p={}`      | `p={3}` 291x, `p={2}` 279x, `p={4}` 277x, `p={6}` 117x, `p={5}` 92x, `p={0}` 79x, `p={8}` 49x |
| `gap={}`    | `gap={2}` 106x, `gap={3}` 83x, `gap={4}` 40x, `gap={6}` 18x, `gap={1}` 16x |
| Custom px   | `p="4px"`, `p="6px"`, `p="8px"`, `p="10px"`, `p="20px"` |
| Custom gap  | `"3px"`, `"4px"`, `"5px"`, `"6px"`, `"8px"`, `"10px"`   |

### Responsive Spacing

```tsx
spacing={{ base: 1, md: 2 }}
spacing={{ base: 0.5, md: 1 }}
gap={{ base: 2, md: 3 }}
```

### Dimensiones Fijas del Layout

| Elemento              | Valor              |
|-----------------------|--------------------|
| Header height         | `55px`             |
| Sidebar expandido     | `220px`            |
| Sidebar colapsado     | `60px`             |
| Min-width body        | `320px`            |
| Input margin          | `8px 4px`          |
| Nav item padding      | `12px 16px`        |
| Sub-item padding      | `8px 16px`         |
| Collapsed item padding| `12px`             |
| Sub-item padding-left | `48px`             |
| Gap icon-text         | `12px`             |
| Item margin           | `8px` sides, `2px` vertical |

---

## 5. BORDER-RADIUS

| Token Chakra  | px    | Uso                        |
|---------------|-------|----------------------------|
| `sm`          | 2px   | —                          |
| `md`          | 6px   | Botones, inputs, items     |
| `lg`          | 8px   | Cards, sidebar items       |
| `xl`          | 12px  | Contenedores grandes       |
| `2xl`         | 16px  | Cards, modales             |
| `3xl`         | 24px  | Elementos muy redondeados  |
| `full`        | 9999px| Pills, avatares circulares |

### CSS Custom Values

- `8px` — fonts.css, sidebar items
- `12px` — ActionPlanView cards
- `10px` — scrollbar thumb
- `50%` — avatares circulares, fire markers
- `50% 50% 50% 0` — chat bubble shape

---

## 6. SOMBRAS (box-shadow)

### Chakra Shortcuts

| Valor    | Uso                        |
|----------|----------------------------|
| `sm`     | Elevación sutil            |
| `md`     | Elevación media            |
| `lg`     | Modales, menús flotantes   |
| `xl`     | Overlays                   |
| `2xl`    | Overlays alta prioridad    |

### CSS Custom

```
0 1px 4px rgba(0,0,0,.3)                                    — Sutil
0 2px 6px rgba(0,0,0,.3)                                    — Estándar
0 4px 12px rgba(0,0,0,.25)                                  — Prominente
0 0 0 2px white, 0 0 0 4px [color], 0 2px 6px rgba(0,0,0,.35) — Focus outline
0 0 10px rgba(0,0,0,0.2)                                    — Flow editor
0 25px 50px rgba(0,0,0,0.15)                                — Modal heavy
0 0 0 1px teal                                              — Focus ring
0 0 0 3px rgba(29,158,117,0.2)                              — Selection highlight
```

### Filters

```
drop-shadow(0 0 6px rgba(49,130,206,0.5))   — Glow azul
drop-shadow(0 4px 16px rgba(0,0,0,0.13))    — Card ligera
```

---

## 7. Z-INDEX

Jerarquía completa:

| Valor  | Uso                                          |
|--------|----------------------------------------------|
| 1      | Base content, sticky headers                 |
| 2      | Secondary content (drone panel, modales)     |
| 10     | Floating panels, tooltips                    |
| 500    | Map popups, incident markers                 |
| 800    | Leaflet controls (`.leaflet-top.leaflet-right`) |
| 1000   | Modales, sticky, map controls                |
| 2000   | Modal dialogs, upload overlays, profile      |
| 9999   | Welcome overlay, modal backdrop tope         |

Dinámico: Flow editor group nodes (counter incremental).

---

## 8. BREAKPOINTS Y PATRONES RESPONSIVOS

### Breakpoints Chakra (default)

| Name | em   | px   |
|------|------|------|
| base | 0    | 0    |
| sm   | 30em | 480  |
| md   | 48em | 768  |
| lg   | 62em | 992  |
| xl   | 80em | 1280 |
| 2xl  | 96em | 1536 |

### Patrones Recurrentes

```tsx
Search bar width:  { base: "60%", sm: "50%", md: "40%", lg: "30%" }
Sidebar:           { base: "0/100%", md: "60px/220px" }
Grid columns:      { base: 1, md: 3 }
Kanban grid:       { base: 1, md: 3 } spacing={6}
Video height:      { base: "250px", md: "300px", lg: "100%" }
Header gap:        { base: "8px", md: "16px" }
Content padding-L: { base: "0", md: "60px/220px" }
```

### Media Queries Custom (index.css)

```css
@media (max-width: 768px) { .layersPopup.leaflet-popup { width: 300px; } }
@media (min-width: 768px) { .layersPopup.leaflet-popup { width: 600px; } }
```

---

## 9. TRANSICIONES Y ANIMACIONES

### Transiciones

| Propiedad        | Valor        | Uso                     |
|------------------|--------------|-------------------------|
| Sidebar toggle   | `0.3s ease`  | Expansión/colapso       |
| Content shift    | `0.3s ease`  | Ajuste lateral          |

### Keyframes

**`map-fire.css` — marker-blink:**
```css
@keyframes marker-blink {
  0%   { opacity: 0.6; }
  25%  { opacity: 0.3; }
  50%  { opacity: 0.0; }
  75%  { opacity: 0.3; }
  100% { opacity: 0.6; }
}
/* Duración: 2s, infinite */
```

**Inline sx animations:**
```tsx
sx={{ animation: "tc-blink 1.4s ease-in-out infinite" }}
sx={{ animation: "af-blink 1.4s ease-in-out infinite" }}
sx={{ animation: "td-blink 1.4s ease-in-out infinite" }}
```

### Animation Library

`framer-motion: ^11.11.11` — Animaciones complejas (integra con Chakra).

---

## 10. CHAKRA VARIANTS Y COLORSCHEMES

### Button Variants

| Variant    | Uso                              |
|------------|----------------------------------|
| `solid`    | Botones filled (default)         |
| `ghost`    | Transparente, cancel             |
| `outline`  | Bordered, secundarios            |

### Tabs Variants

| Variant    | Uso                      |
|------------|--------------------------|
| `enclosed` | Teams-list, team-flow    |
| `unstyled` | Tabs sin estilo          |

### Table Variants

| Variant / Size | Uso             |
|----------------|-----------------|
| `variant="simple"` | Estándar    |
| `size="sm"`    | Compacta        |

### Badge

| Prop              | Valor                   |
|-------------------|-------------------------|
| `variant="subtle"`| Badge sutil             |
| `rounded`         | `"md"`, `"full"`        |

### ColorSchemes por Contexto

```tsx
// Teams
colorScheme={team.status === "Fuera de servicio" ? "red" : "teal"}

// Resources
colorScheme={
  resource.status === "Mantenimiento" ? "red"
  : resource.status === "En uso"      ? "orange"
  : "purple"
}

// Emergency priority
colorScheme={
  emergency.priority === "high"   ? "red"
  : emergency.priority === "medium" ? "orange"
  : "gray"
}

// Emergency status
colorScheme={
  emergency.status === "active"     ? "red"
  : emergency.status === "in_progress" ? "blue"
  : "green"
}

// Asset availability
colorScheme={isAssetAvailable(asset) ? "green" : "red"}
```

---

## 11. COMPONENTES REUTILIZABLES

### 11.1 Layout ([src/components/layout/](src/components/layout/))

#### [layout.tsx](src/components/layout/layout.tsx)
Root wrapper. Header fijo (55px, bg `sideBar`) + Sidebar + Main content. Custom event: `"sidebarToggle"`. Usa `styled.div.withConfig()` para filtrar props dinámicas.

#### [sidebar-nav-item.tsx](src/components/layout/sidebar-nav-item.tsx)
Item navegación sidebar.
- **Props:** `to`, `label`, `Icon`, `isActive`, `isCollapsed`, `onClick`
- **Active:** text `white`, bg `rgba(255,255,255,0.2)`
- **Inactive:** text `rgba(255,255,255,0.7)`, bg `transparent`
- **Hover:** bg `rgba(255,255,255,0.1)`, text `white`
- Border-radius: `8px`. Con `Tooltip` si colapsado.

#### [search-bar.tsx](src/components/layout/search-bar.tsx)
Búsqueda municipios con dropdown. Ancho responsivo `60%→30%`. Iconos `SearchIcon`/`CloseIcon` en `gray.400`. Placeholder `gray.300`.

#### [osprean-logo.tsx](src/components/layout/osprean-logo.tsx)
Logo marca. Fuente `'Osprean'` a `2rem`. Color `#fff`. BG `transparent`.

#### [my-profile.tsx](src/components/layout/my-profile.tsx)
Menú perfil desplegable con styled-components.

### 11.2 Sidebar ([src/components/side-menu.tsx](src/components/side-menu.tsx))

Estructura jerárquica:

```
├── Items top: Dashboard, Inventario
├── Secciones expandibles (con ChevronDown/UpIcon):
│   ├── Prevención → Evaluación, Adaptación, Inspección, Recorrido
│   ├── Actuación  → Plan emergencia, Gestión emergencias
│   └── Recuperación → Plan, Gestor, Archivo
├── Items bottom: Chat, Documentos, Ajustes, Soporte
└── Footer: Toggle tema (sol/luna), Ayuda
```

- BG: `#55565A` / `#55565a`
- Scrollbar custom: thumb `rgba(255,255,255,0.4)`, width `4px`
- Sub-items: `font-size: 12px`, `padding-left: 48px`
- Padding items: `12px 16px` (regulares), `8px 16px` (sub), `12px` (colapsado)
- Gap icon-text: `12px`, border-radius `8px`

### 11.3 Formularios ([src/components/form/](src/components/form/))

#### [form.tsx](src/components/form/form.tsx) — Constructor de Formularios

```typescript
type FormProps<T> = {
  formData?: T;
  fields: FormField[];
  onSubmit?: (data: T, onError: () => void) => void;
  showReset?: boolean;
  ActionButton?: React.ReactNode;
  handleOnCancel?: () => void;
  id?: string;
};

type Field = {
  type: "input" | "select" | "email" | "password" | "readonly" | "radio";
  name: string;
  label?: string;
  value?: string;
  isRequired?: boolean;
  disabled?: boolean;
  customValidation?: ValidationFunction[];
};

type SelectField = { optionsList: Option[]; type: "select"; } & Field;
type RadioField  = { type: "radio"; optionsList: string[]; } & Field;
type ReadonlyField = { type: "readonly"; option: string; };

type ValidationFunction = (value: string) => string | null;
```

Helpers: `ValidateMinLength(n)`. Usa `FormControl`, `FormLabel`, `FormErrorMessage`, `Input`, `Radio`, `RadioGroup`, `Stack`. Error rojo integrado.

#### [select.tsx](src/components/form/select.tsx)

```typescript
type Option = {
  id: string;
  name: string;
  organization?: string;
  value?: string;
  label?: string;
};

// Props: optionsList, label, id, onSelect, disabled, name, value, defaultValue, size
```

### 11.4 Modales ([src/components/modals/](src/components/modals/))

| Archivo                      | Uso                          |
|------------------------------|------------------------------|
| [delete-modal.tsx](src/components/modals/delete-modal.tsx)            | Confirmar borrado (`colorScheme="red"`) |
| [update-emergency-modal.tsx](src/components/modals/update-emergency-modal.tsx) | Actualizar emergencia |
| [upload-modal.tsx](src/components/modals/upload-modal.tsx)            | Subida archivos |
| [edit-flow-modal.tsx](src/components/edit-flow-modal.tsx)             | Editor workflow |
| [accept-user-modal.tsx](src/components/notifications-menu/accept-user-modal.tsx) | Aceptar request user |
| [report-modal.tsx](src/components/reports-notification/report-modal.tsx) | Notificación report |

**Estructura estándar:**
```
Modal + ModalOverlay + ModalContent + ModalHeader + ModalBody + ModalFooter
  Cancelar: variant="ghost"
  Acción primaria: colorScheme="blue" | "teal"
  Destructiva: colorScheme="red"
```

### 11.5 Mapa ([src/components/map/](src/components/map/))

| Componente                | Descripción                                 |
|---------------------------|---------------------------------------------|
| [MapService.tsx](src/components/map/MapService.tsx)         | Core Leaflet + Deck.gl                      |
| [MapEventHandler.tsx](src/components/map/MapEventHandler.tsx) | Listeners del mapa                        |
| [MapMenu.tsx](src/components/map/MapMenu.tsx)               | Control de capas                            |
| [MapBaseLayers.tsx](src/components/map/MapBaseLayers.tsx)   | Switch de capas base                        |
| [FloatingMenu.tsx](src/components/map/FloatingMenu.tsx)     | Menú flotante de acciones                   |
| [ContextMenu.tsx](src/components/map/ContextMenu.tsx)       | Menú contextual (click derecho)             |
| [DisableMapInteractions.tsx](src/components/map/DisableMapInteractions.tsx) | Deshabilitar zoom/drag        |
| [DraggableModButton.tsx](src/components/map/DraggableModButton.tsx) | Botón arrastrable responsivo          |
| [DrawEmergencyMode.tsx](src/components/map/DrawEmergencyMode.tsx) | Modo dibujo emergencia                  |
| [ResourceMapLayer.tsx](src/components/map/ResourceMapLayer.tsx) | Capa recursos con colores cat.            |
| [ResourceDetailModal.tsx](src/components/map/ResourceDetailModal.tsx) | Modal detalle recurso                 |
| [ShowPrediction.tsx](src/components/map/ShowPrediction.tsx) | Overlay de predicciones                     |
| [emergency-info.tsx](src/components/map/emergency-info.tsx) | Popup info emergencia                       |
| [create-emergency-modal.tsx](src/components/map/create-emergency-modal.tsx) | Crear emergencia                  |
| [map-location-selector.tsx](src/components/map/map-location-selector.tsx) | Picker ubicación                    |
| [leaflet-control.tsx](src/components/map/leaflet-control.tsx) | Control Leaflet custom                    |
| [popup.tsx](src/components/map/popup.tsx)                   | Tooltip popup                               |
| [radio-button.tsx](src/components/map/radio-button.tsx)     | Radio control                               |

**Subfolder drone:**
- [DroneMarkers.tsx](src/components/map/DroneMarkers.tsx) — Posiciones drones
- [DroneSwitch.tsx](src/components/map/DroneSwitch.tsx) — Toggle selección drone
- [GlobalVideoOverlay.tsx](src/components/map/GlobalVideoOverlay.tsx) — Overlay video global
- [MultipleDroneStreams.tsx](src/components/map/MultipleDroneStreams.tsx) — Múltiples streams
- [PlanModal.tsx](src/components/map/PlanModal.tsx) — Editor plan vuelo
- [VideoOverlay.tsx](src/components/map/VideoOverlay.tsx) — Video drone individual

### 11.6 Geo ([src/components/geo/](src/components/geo/))

| Componente                   | Uso                            |
|------------------------------|--------------------------------|
| [layer.tsx](src/components/geo/layer.tsx) | Wrapper GIS layer    |
| [emergency-info.tsx](src/components/geo/emergency-info.tsx) | Info emergencia en mapa |
| [emergency-layers-tab.tsx](src/components/geo/emergency-layers-tab.tsx) | Tabs capas emergencia |
| [emergencies-pinned.tsx](src/components/geo/emergencies-pinned.tsx) | Emergencias pinneadas |
| [hydrants.tsx](src/components/geo/hydrants.tsx) | Capa hidrantes |
| [municipality-layers.tsx](src/components/geo/municipality-layers.tsx) | Límites municipales |
| [navarra-fires.tsx](src/components/geo/navarra-fires.tsx) | Incendios históricos Navarra |
| [urban-interfaces.tsx](src/components/geo/urban-interfaces.tsx) | Interfaz urbano-forestal |

### 11.7 Archive Fire ([src/components/archiveFire/](src/components/archiveFire/))

| Componente         | Descripción                              |
|--------------------|------------------------------------------|
| [LinePlot.tsx](src/components/archiveFire/LinePlot.tsx)      | Timeline incendio (D3). Stroke `#E53E3E` start line |
| [Meteograma.tsx](src/components/archiveFire/Meteograma.tsx)  | Gráfico meteorológico (t seca rojo, rocío verde, humedad azul) |
| [Radiosondeo.tsx](src/components/archiveFire/Radiosondeo.tsx)| Radiosondeo (2 líneas stroke 2) |
| [Datos.tsx](src/components/archiveFire/Datos.tsx)            | Display de datos                         |
| [GlobeOrig.tsx](src/components/archiveFire/GlobeOrig.tsx)    | Globo 3D (openglobus)                    |
| [IncHistorico.tsx](src/components/archiveFire/IncHistorico.tsx) | Incidentes históricos                 |
| [Wetterzentrale.tsx](src/components/archiveFire/Wetterzentrale.tsx) | Integración weather center        |
| [WindMap.tsx](src/components/archiveFire/WindMap.tsx)        | Campo de viento                          |
| [Pdf.tsx](src/components/archiveFire/Pdf.tsx)                | Generación PDF                           |

### 11.8 Flow Editor ([src/components/flow-editor/](src/components/flow-editor/))

Usa `@xyflow/react: 12.10.0`.

| Componente                | Uso                                 |
|---------------------------|-------------------------------------|
| [custom-nodes.tsx](src/components/flow-editor/custom-nodes.tsx) | Decision, Action, Start, End, Group |
| [node-edit-panel.tsx](src/components/flow-editor/node-edit-panel.tsx) | Panel edición propiedades |
| [node-menu.tsx](src/components/flow-editor/node-menu.tsx) | Selector tipos de nodo       |
| [node-types.ts](src/components/flow-editor/node-types.ts) | Estilos y colores nodo       |
| [org-node-menu.tsx](src/components/flow-editor/org-node-menu.tsx) | Nodos organizacionales |
| [pamif-edges.tsx](src/components/flow-editor/pamif-edges.tsx) | Estilos edges PAMIF        |
| [pamif-node-menu.tsx](src/components/flow-editor/pamif-node-menu.tsx) | Nodos PAMIF        |

### 11.9 Flow ([src/components/flow/](src/components/flow/))

| Componente                 | Uso                        |
|----------------------------|----------------------------|
| [flow.tsx](src/components/flow/flow.tsx) | Viewer workflow (bg `#2D3748`, border `1px #ddd`) |
| [nodes/node.tsx](src/components/flow/nodes/node.tsx) | Nodo individual |
| [nodes/nodes.tsx](src/components/flow/nodes/nodes.tsx) | Colección de nodos |
| [team-data-flow.ts](src/components/flow/team-data-flow.ts) | Lógica flujo equipos |

### 11.10 Emergency / Predict / Meteo

| Componente         | Ubicación                                    |
|--------------------|----------------------------------------------|
| `emergency-panel.tsx` | [src/components/emergency/](src/components/emergency/) |
| `Predict.tsx`      | [src/components/predict/](src/components/predict/) |
| `PredictionForm.tsx` | [src/components/predict/](src/components/predict/) |
| `PredictRadio.tsx` | [src/components/predict/](src/components/predict/) |
| `Globe.tsx`        | [src/components/predict/](src/components/predict/) — Globo 3D |
| `Slider.tsx`       | [src/components/predict/](src/components/predict/) — Timeline animación |
| `LinePlot.tsx`     | [src/components/meteogram/](src/components/meteogram/) — Series meteo |

### 11.11 Users ([src/components/users/](src/components/users/))

| Componente            | Uso                      |
|-----------------------|--------------------------|
| `user-list.tsx`       | Roster usuarios          |
| `user-item.tsx`       | Card individual          |
| `user-form.tsx`       | Form crear/editar        |
| `user-form-fields.ts` | Definición campos        |
| `delete-user.tsx`     | Dialog borrado           |

### 11.12 Notifications/Chatbot

| Componente               | Ubicación                                  |
|--------------------------|--------------------------------------------|
| `notifications-menu.tsx` | [src/components/notifications-menu/](src/components/notifications-menu/) |
| `ChatbotButton.tsx`      | [src/components/chatbot/](src/components/chatbot/) — Botón flotante |
| `ChatbotContainer.tsx`   | [src/components/chatbot/](src/components/chatbot/) |
| `ChatbotWindow.tsx`      | [src/components/chatbot/](src/components/chatbot/) — bg `#55565A` |

**Hooks notificaciones:**
- `use-adaptation-task-notifications.ts`
- `use-chat-message-notifications.ts`
- `use-fire-sim-notifications.ts`
- `use-received-requests.tsx`
- `use-update-request.tsx`
- `use-works-order-notifications.ts`

### 11.13 Otros Reutilizables

| Componente                      | Archivo                                           |
|---------------------------------|---------------------------------------------------|
| `Dropdown`                      | [src/components/dropdown.tsx](src/components/dropdown.tsx) — styled-components |
| `DropdownMenu`                  | [src/components/dropdown-menu.tsx](src/components/dropdown-menu.tsx) |
| `Pagination`                    | [src/components/pagination.tsx](src/components/pagination.tsx) |
| `Timeline`                      | [src/components/timeline.tsx](src/components/timeline.tsx) |
| `PlanTimeline`                  | [src/components/planTimeline.tsx](src/components/planTimeline.tsx) |
| `NavItem`                       | [src/components/nav-item.tsx](src/components/nav-item.tsx) |
| `Location`                      | [src/components/location.tsx](src/components/location.tsx) |
| `LocationInput`                 | [src/components/location-input.tsx](src/components/location-input.tsx) |
| `MunicipalitySearched`          | [src/components/municipality-searched.tsx](src/components/municipality-searched.tsx) |
| `ViewOnlyFlow`                  | [src/components/view-only-flow.tsx](src/components/view-only-flow.tsx) |
| `RequestStatus`                 | [src/components/request-status.tsx](src/components/request-status.tsx) |
| `LayoutSkeleton`                | [src/components/layout-skeleton.tsx](src/components/layout-skeleton.tsx) bg `#55565A` |
| `UploadProgressOverlay`         | [src/components/upload-progress-overlay.tsx](src/components/upload-progress-overlay.tsx) |
| `PhotoUploader`                 | [src/components/PhotoUploader.tsx](src/components/PhotoUploader.tsx) + CSS |
| `PhotoViewer`                   | [src/components/PhotoViewer.tsx](src/components/PhotoViewer.tsx) + CSS |
| `MapFireDemo`                   | [src/components/map-fire-demo.tsx](src/components/map-fire-demo.tsx) |
| `PrivateRoute`                  | [src/components/private-route.tsx](src/components/private-route.tsx) |
| `PublicRoute`                   | [src/components/public-route.tsx](src/components/public-route.tsx) |
| `Drone3D`                       | [src/components/drone/Drone3D.tsx](src/components/drone/Drone3D.tsx) — Three.js |
| `VideoPlayer`                   | [src/components/video/video-player.tsx](src/components/video/video-player.tsx) |
| `VideoWithFallback`             | [src/components/video/video-with-fallback.tsx](src/components/video/video-with-fallback.tsx) |
| `TasksKanban`                   | [src/components/tasksKanban/TasksKanban.tsx](src/components/tasksKanban/TasksKanban.tsx) — grid `{base:1, md:3}` |
| `OperationalResources`          | [src/components/operational-resources/OperationalResources.tsx](src/components/operational-resources/OperationalResources.tsx) |
| `WelcomeOverlay`                | [src/components/welcome/WelcomeOverlay.tsx](src/components/welcome/WelcomeOverlay.tsx) — zIndex `9999` |

### 11.14 PhotoUploader.css (estilos ref)

```
border: 2px dashed #ccc;
background: #fafafa;
hover: border-color: #007bff; background: #f0f8ff;
texto principal: #333; secundario: #666
```

### 11.15 PhotoViewer.css (estilos ref)

```
color: #333; secondary: #666
background: #f9f9f9; border: 2px dashed #ddd
```

---

## 12. SISTEMA DE ICONOS

### 12.1 Librerías de Iconos Usadas

| Paquete                  | Prefijo | Ejemplos                                             |
|--------------------------|---------|------------------------------------------------------|
| `react-icons/fi`         | Fi      | FiMapPin, FiSearch, FiFilter, FiBell, FiUsers, FiSend, FiClock |
| `react-icons/fa`         | Fa      | FaThumbtack, FaCamera, FaTruck, FaUsers, FaPlus, FaBuilding |
| `react-icons/md`         | Md      | MdFireTruck, MdWarning, MdCheckCircle, MdPerson, MdBolt |
| `react-icons/io5`        | Io      | IoFlameOutline, IoPeopleOutline, IoCheckmarkCircle, IoAdd |
| `react-icons/bi`         | Bi      | BiCheck, BiX, BiTime, BiMessageDetail, BiCalendar     |
| `react-icons/im`         | Im      | ImFire                                                |
| `react-icons/hi`         | Hi      | HiOutlineCube, HiOutlineShieldCheck, HiMenu, HiX     |
| `react-icons/lu`         | Lu      | LuMapPin (lucide)                                    |
| `react-icons/pi`         | Pi      | PiDroneFill (phosphor)                               |
| `react-icons/fc`         | Fc      | FcGoogle                                             |
| `react-icons/tfi`        | Tfi     | TfiMicrosoftAlt                                      |
| `@chakra-ui/icons`       | —       | SearchIcon, CloseIcon, MoonIcon, SunIcon, AddIcon, DeleteIcon, EditIcon, CheckIcon, WarningIcon, InfoIcon, ChevronLeft/RightIcon, ArrowBackIcon, CheckCircleIcon, AttachmentIcon, SettingsIcon, ViewIcon, DownloadIcon, DragHandleIcon, StarIcon, SmallCloseIcon, RepeatIcon, RepeatClockIcon, LinkIcon |

### 12.2 Convención Iconos Sidebar

Sufijos en SVGs:
- `-BB` = Black Background (modo claro)
- `-WB` = White Background (modo oscuro)

---

## 13. ASSETS SVG COMPLETOS

### 13.1 SVG Raíz ([src/assets/svg/](src/assets/svg/))

```
Alerta.svg                           — Alerta
Circunferencia.svg                   — Círculo/perímetro
Drone-BB.svg                         — Drone (BB)
Drone-WB.svg                         — Drone (WB)
Drone-WB-SinCircunferencia.svg       — Drone sin ring
DroneNew-Active.svg                  — Drone activo
DroneNew-Disabled.svg                — Drone desactivado
WelcomeOverlay-background.svg        — BG welcome
drone.svg                            — Drone genérico
fire-marker-icon.svg                 — Marker fuego
helicopter.svg                       — Helicóptero
```

### 13.2 Header Dashboard Menu ([src/assets/svg/dashboard_menu/](src/assets/svg/dashboard_menu/))

```
ov_add_resource.svg    — Agregar recurso
ov_add_task.svg        — Agregar tarea
ov_add_tools.svg       — Agregar herramientas
ov_emergency.svg       — Botón emergencia
ov_layers.svg          — Capas mapa
ov_menu.svg            — Menú
ov_meteo.svg           — Meteorología
ov_risk.svg            — Indicador riesgo
ov_tools.svg           — Paleta herramientas
```

**Switch icons** ([switch_icons/](src/assets/svg/dashboard_menu/switch_icons/)):
```
bomb.svg       — Explosión
cloud_rain.svg — Precipitación
fire.svg       — Llamas
```

### 13.3 Header Location

```
home.svg       — Ubicación hogar
location.svg   — Ubicación actual
village.svg    — Municipio
```

### 13.4 Sidebar (Variantes BB/WB)

| Base Name      | BB Version            | WB Version            |
|----------------|-----------------------|-----------------------|
| ActionPlan     | ActionPlan-BB.svg     | ActionPlan-WB.svg     |
| Archive        | Archive-BB.svg        | Archive-WB.svg        |
| Chat           | Chat-BB.svg           | Chat-WB.svg           |
| Emergencies    | Emergencies-BB.svg    | Emergencies-WB.svg    |
| Geo            | Geo-BB.svg            | Geo-WB.svg            |
| HelpCircle     | HelpCircle-BB.svg     | HelpCircle-WB.svg     |
| Home           | Home-BB.svg           | Home-WB.svg           |
| Meteo          | Meteo-BB.svg          | Meteo-WB.svg          |
| Moon           | Moon-BB.svg           | Moon-WB.svg           |
| Predictions    | Predictions-BB.svg    | Predictions-WB.svg    |
| Reports        | Reports-BB.svg        | Reports-WB.svg        |
| Sun            | Sun-BB.svg            | Sun-WB.svg            |
| Teams          | Teams-BB.svg          | Teams-WB.svg          |

### 13.5 Sidebar Custom (usados en side-menu.tsx)

```
actuacion.svg          — Actuación
ajustes.svg            — Ajustes
centro_tareas.svg      — Centro tareas
chat.svg               — Chat
dashboar_inicio.svg    — Dashboard inicio
documentos.svg         — Documentos
historico.svg          — Histórico
inventario.svg         — Inventario
prevencion.svg         — Prevención
recuperacion.svg       — Recuperación
soporte.svg            — Soporte
```

### 13.6 Otros Assets

- [src/assets/png/](src/assets/png/) — Imágenes PNG
- [src/assets/ro_icon/](src/assets/ro_icon/) — Set iconos adicional
- [src/utils/asset-icons.ts](src/utils/asset-icons.ts) — Map tipo asset → icono (20.8KB)

---

## 14. HOOKS PERSONALIZADOS

Todos en [src/hooks/](src/hooks/). Total: 30 hooks + `index.ts` barrel.

### 14.1 Data Fetching

| Hook                        | Uso                                          |
|-----------------------------|----------------------------------------------|
| `use-aemet.tsx`             | Estaciones AEMET + condiciones meteo         |
| `use-emergencies.tsx`       | CRUD emergencias + pinneadas                 |
| `use-organizations.tsx`     | Datos organizaciones                         |
| `use-teams.tsx`             | Operaciones equipos                          |
| `use-assets.tsx`            | Inventario assets                            |
| `use-resources.tsx`         | Taxonomía recursos, CRUD, imágenes           |
| `use-user.tsx`              | Usuarios, chat users                         |
| `use-drones.tsx`            | Gestión flota drones                         |
| `use-flight-plans.tsx`      | CRUD planes vuelo                            |
| `use-inspection.tsx`        | Planes, plantillas, órdenes, tareas          |
| `use-seafile.tsx`           | Storage: reports, layers, docs               |
| `use-predictions.tsx`       | Datos predicción incendios                   |
| `use-effis.tsx`             | Índice incendios EFFIS                       |
| `use-adaptation-plans.tsx`  | CRUD planes adaptación                       |
| `use-prevention.tsx`        | Planning prevención                          |

### 14.2 Geo/Mapa

| Hook                        | Uso                                     |
|-----------------------------|-----------------------------------------|
| `use-geo.tsx`               | Geometría CRUD + capas compartidas      |
| `use-administration.tsx`    | Capas municipales                       |
| `use-municipalities.tsx`    | Geo municipios                          |
| `use-navarra.tsx`           | Incendios Navarra                       |
| `use-maps.tsx`              | Utilidades mapa                         |
| `use-pinned-emergencies.tsx`| Estado emergencias pinneadas            |

### 14.3 Utilities

| Hook                      | Uso                          |
|---------------------------|------------------------------|
| `use-auth.tsx`            | Auth + sesión usuario        |
| `use-language.tsx`        | i18n management              |
| `use-size.tsx`            | Detección tamaño responsivo  |
| `use-radiosonde.tsx`      | Sondeo atmosférico           |
| `use-pdf.tsx`             | Generación PDF               |
| `use-photo-coordinates.tsx`| GPS metadata fotos          |
| `use-flow-history.ts`     | Historial workflow           |
| `use-drone-control.tsx`   | Telemetría + control drones  |

---

## 15. RUTAS AppRoute

**Archivo:** [src/routes.ts](src/routes.ts). Total: **51 rutas**.

```typescript
enum AppRoute {
  // Core
  Home                  = "/",
  Dashboard             = "/dashboard",
  Error                 = "*",

  // Auth
  Login                 = "/login",
  Register              = "/register",
  FakeAuth              = "/fake-auth",

  // Emergency
  Emergencies           = "/emergencies",
  Actions               = "/actions",
  ActionPlanCreate      = "/action-plans/editor",
  ActionPlanView        = "/action-plans/view/:id",

  // Teams + Assessment + Predict
  Teams                 = "/teams",
  Assessment            = "/assessment",
  Predictions           = "/predictions",
  Meteo                 = "/meteo",

  // Geo + Inspection
  Geo                   = "/geo",
  Inspection            = "/inspection",
  Walk                  = "/walk",

  // Admin + Profile
  Admin                 = "/admin",
  MyProfile             = "/my-profile",
  Settings              = "/settings",
  MonitorListin         = "/monitor/listin",

  // Archive + Community
  Archive               = "/archive",
  ArchiveFire           = "/archive/:id",
  Community             = "/community",
  CommunityFireId       = "/community/:id",
  About                 = "/about",

  // Messaging + Reports
  Messages              = "/messages",
  Reports               = "/reports",

  // Drones
  Drones                = "/drones",
  Drone                 = "/drone/:id",

  // Recovery
  RecoveryList          = "/recovery",
  RecoveryForm          = "/recovery/form",
  RecoveryDetail        = "/recovery/:id",
  RecoveryMap           = "/recovery-map",

  // Inventory
  Inventory             = "/inventory",
  InventoryList         = "/inventory-page/inventory-list",
  InventoryItem         = "/inventory-page/item-resource/:id",

  // Simulation
  SimulationCreate      = "/simulation-create",
  SimulationHistory     = "/simulation-history",

  // Adaptation
  AdaptationPlans       = "/adaptation-plans",
  AdaptationPlanDetail  = "/adaptation-plans/:planId",

  // Tasks + Work Orders
  MyTasks               = "/my-tasks",
  Tasks                 = "/tasks",
  WorkOrders            = "/work-orders",

  // Test
  Test                  = "/test",
  Test2                 = "/test-2",
  Test3                 = "/test-3",

  // Support
  ServiceDesk           = "/support",
}
```

---

## 16. CONFIG / FEATURE FLAGS

**Archivo:** [src/config.ts](src/config.ts)

### Organization Types

```typescript
type OrgType = "town_hall" | "firefighters" | "public_user";
```

| Tipo           | Determinación            | Roles                                          | Create Emergency | Páginas                                                                  |
|----------------|--------------------------|------------------------------------------------|------------------|--------------------------------------------------------------------------|
| `town_hall`    | organizationId + rol     | Admin, Coordinator, Field Responder, City Official, Temporary | ✅ | Dashboard, Emergencies, Teams, Predictions, Layers, Archive, Meteo, Reports, ActionPlan, Chat |
| `firefighters` | organizationId + rol     | Firefighter, Coordinator                       | ✅ | Mismas que town_hall                                                     |
| `public_user`  | `organizationId == null` | Volunteer, Firefighter                         | ❌ | Dashboard, Predictions, Layers, Meteo (limitado)                         |

---

## 17. PATRONES CSS RECURRENTES

### 17.1 Botón Modal

```
Cancelar:             variant="ghost"
Destructivo:          colorScheme="red"
Primario:             colorScheme="blue" | "teal"
Warning:              colorScheme="orange"
Info:                 colorScheme="purple"
```

### 17.2 Card / Container Dark

```
bg:             "sideBar" (#55565A)
border-radius:  "lg" (8px) | "xl" (12px)
padding:        p={4} | p={6}
border:         1px solid rgba(255,255,255,0.1)
```

### 17.3 Item Lista Interactivo

```
Normal:  bg="transparent"              color="rgba(255,255,255,0.7)"
Hover:   bg="rgba(255,255,255,0.1)"    color="white"
Active:  bg="rgba(255,255,255,0.2)"    color="white"
Transition: 0.3s ease
Border-radius: 8px
```

### 17.4 Scrollbar Custom

```css
/* Chakra sx */
sx={{
  "&::-webkit-scrollbar": { w: "4px" },
  "&::-webkit-scrollbar-thumb": { bg: "gray.200", borderRadius: "full" }
}}

/* Alternativo con cbd5e0 */
sx={{
  '&::-webkit-scrollbar-thumb': {
    background: '#cbd5e0',
    borderRadius: '10px'
  }
}}

/* Sidebar */
scrollbar-width: thin;
::-webkit-scrollbar { width: 4px; }
::-webkit-scrollbar-thumb {
  background: rgba(255,255,255,0.4);
  border-radius: 4px;
}
```

### 17.5 GPU Acceleration

```tsx
sx={{
  willChange: 'transform',
  transform: 'translate3d(0,0,0)',
  WebkitOverflowScrolling: "touch"
}}
```

### 17.6 Vertical Text

```tsx
sx={{ writingMode: 'vertical-lr', transform: 'rotate(180deg)' }}
```

### 17.7 Grid Auto

```tsx
sx={{
  gridTemplateColumns: "repeat(7,minmax(0,1fr))",
  gridTemplateRows: "repeat(4, 1fr)",
  "&:nth-of-type(7n)": { borderRight: "none" }
}}
```

### 17.8 Login Autofill Override

```css
input.input-login {
  &:-webkit-autofill, :hover, :focus, :focus-visible {
    box-shadow: 0 0 0px 1000px #efefef inset !important;
    -webkit-text-fill-color: #2d3748 !important;
    border: 1px solid white !important;
  }
}
```

### 17.9 Fire Marker Animation

```css
.marker-outer {
  width: 40px; height: 40px;
  border-radius: 50%;
  background: rgba(255, 0, 0, 0.6);
  animation: marker-blink 2s infinite;
}
.marker-inner {
  width: 15px; height: 15px;
  border-radius: 50%;
  background: rgba(200, 0, 0, 1);
  z-index: 1;
}
```

---

## 18. DEPENDENCIAS UI COMPLETAS

### 18.1 Core UI

| Paquete                       | Versión  |
|-------------------------------|----------|
| `react`                       | 18.3.1   |
| `react-dom`                   | 18.3.1   |
| `typescript`                  | ^5.5.4   |
| `vite`                        | ^5.4.21  |
| `@vitejs/plugin-react`        | ^4.3.1   |
| `@chakra-ui/react`            | ^2.10.3  |
| `@chakra-ui/icons`            | ^2.2.1   |
| `@chakra-ui/react-utils`      | ^2.0.11  |
| `@emotion/react`              | 11.14.0  |
| `@emotion/styled`             | 11.14.1  |
| `styled-components`           | ^6.1.18  |
| `framer-motion`               | ^11.11.11|
| `chakra-multiselect`          | ^0.4.13  |

### 18.2 Iconos y Visualización

| Paquete           | Versión  |
|-------------------|----------|
| `react-icons`     | 5.5.0    |
| `d3`              | ^7.9.0   |
| `recharts`        | ^2.15.1  |
| `qrcode.react`    | ^4.2.0   |

### 18.3 Mapas y Geo

| Paquete                          | Versión  |
|----------------------------------|----------|
| `leaflet`                        | ^1.9.4   |
| `leaflet-draw`                   | ^1.0.4   |
| `react-leaflet`                  | ^4.2.1   |
| `react-leaflet-cluster`          | ^2.1.0   |
| `react-leaflet-draw`             | ^0.21.0  |
| `react-map-gl`                   | ^8.1.0   |
| `maplibre-gl`                    | ^5.17.0  |
| `georaster`                      | ^1.6.0   |
| `georaster-layer-for-leaflet`    | ^4.1.2   |
| `geotiff`                        | ^2.1.3   |
| `deck.gl`                        | 9.2.9    |
| `@openglobus/og`                 | ^0.20.4  |
| `@openglobus/openglobus-react`   | ^0.4.12  |
| `utm-latlng`                     | ^1.0.8   |

### 18.4 3D Graphics

| Paquete                | Versión   |
|------------------------|-----------|
| `three`                | ^0.183.2  |
| `@react-three/fiber`   | ^8.18.0   |
| `@react-three/drei`    | ^9.122.0  |

### 18.5 Forms / Data / State

| Paquete                  | Versión  |
|--------------------------|----------|
| `react-select`           | ^5.8.0   |
| `react-calendar`         | ^6.0.0   |
| `react-dropzone`         | ^14.3.8  |
| `react-router-dom`       | ^6.24.1  |
| `@tanstack/react-query`  | 5.90.12  |
| `zustand`                | ^4.5.5   |
| `axios`                  | 1.13.2   |
| `react-intl`             | ^6.8.1   |

### 18.6 Flow Editor

| Paquete         | Versión |
|-----------------|---------|
| `@xyflow/react` | 12.10.0 |

### 18.7 Networking / APIs

| Paquete                  | Versión  |
|--------------------------|----------|
| `socket.io-client`       | ^4.8.1   |
| `googleapis`             | ^169.0.0 |
| `@react-oauth/google`    | ^0.12.1  |
| `react-microsoft-login`  | ^2.0.1   |
| `gapi-script`            | ^1.2.0   |
| `openmeteo`              | 1.2.3    |

### 18.8 Otros

| Paquete                       | Versión  |
|-------------------------------|----------|
| `uuid`                        | ^11.1.0  |
| `react-burger-menu`           | 3.1.0    |
| `browser-image-compression`   | ^2.0.2   |
| `react-qr-reader`             | ^3.0.0-beta-1 |
| `@react-hook/resize-observer` | ^2.0.2   |
| `vite-plugin-glsl`            | 1.3.0    |

### 18.9 Dev

| Paquete                      | Versión |
|------------------------------|---------|
| `eslint`                     | ^8.57.0 |
| `jest`                       | ^29.7.0 |
| `@testing-library/react`     | 16.3.1  |

---

## 19. ESTRUCTURA DE PAGES

[src/pages/](src/pages/) — 24 directorios.

| Page                     | Archivos | Propósito                                       |
|--------------------------|----------|-------------------------------------------------|
| `actions-plans-page`     | 4        | Crear, ver, directorio planes acción            |
| `adaptation-page`        | 2        | Gestión planes adaptación                       |
| `admin-page`             | 4        | Admin sistema, users, orgs                      |
| `archive-community`      | 2        | Archivo comunidad incendios                     |
| `assessment-page`        | 1        | Evaluación riesgo                               |
| `dashboard-page`         | 1        | Dashboard principal + lista emergencias         |
| `emergency-manager-page` | 1        | Coordinación emergencias                        |
| `emergency-page`         | 11       | Detalle, táctico, recursos, tareas, activity    |
| `evaluate-simulate`      | 1        | Crear simulación + historial                    |
| `inspection-page`        | 1        | Inspecciones campo                              |
| `inventory-page`         | 4        | Inventario drones/recursos, planes vuelo        |
| `messages-page`          | 11       | Chat real-time, canales, users                  |
| `my-profile-page`        | 2        | Perfil user, org requests                       |
| `my-work-orders-page`    | 6        | Task management operativo, map                  |
| `prevention-page`        | 1        | Planning prevención                             |
| `recovery-page`          | 4        | Recovery plan + tracking                        |
| `reports-page`           | 4        | Generación reports, preview, PDF                |
| `settings-page`          | 4        | User settings, drones, dashboard config         |
| `tasks-control-page`     | 1        | Kanban, list, map, calendar                     |
| `teams-page`             | 7        | Team management, assets, emergencias            |
| `test-google`            | 0        | Google OAuth test                               |
| `test-nodes`             | 3        | Flow editor test                                |
| `walk-page`              | 1        | Operaciones campo mobile                        |
| `works-orders-admin`     | 5        | Work order management, assignment               |

---

## 20. PATRONES DE ESTADO GLOBAL

### 20.1 Zustand ([src/store/](src/store/))

State management principal. Stores separados por dominio.

### 20.2 React Context ([src/contexts/](src/contexts/))

| Context              | Propósito                    |
|----------------------|------------------------------|
| `VideoOverlayContext`| Video drone overlay global   |
| `WelcomeContext`     | Onboarding welcome screen    |

### 20.3 React Query

`@tanstack/react-query: 5.90.12` — Data fetching, cache, sync.

### 20.4 React Router

`react-router-dom: ^6.24.1` — Rutas SPA. Rutas en [src/routes.ts](src/routes.ts).

### 20.5 Internacionalización

`react-intl: ^6.8.1`. Archivos en [src/locales/](src/locales/). Uso:

```tsx
<FormattedMessage id="CLAVE" />
const intl = useIntl();
intl.formatMessage({ id: "CLAVE" })
```

Claves ejemplo:
- `SIDEMENU_HOME`, `SIDEMENU_INVENTORY`, `SIDEMENU_PREVENTION`
- `SIDEMENU_PREVENTION_ASSESSMENT`, `SIDEMENU_PREVENTION_ADAPTATION`
- `SIDEMENU_PREVENTION_INSPECTION`, `SIDEMENU_PREVENTION_WALK`
- `SIDEMENU_RESPONSE`, `SIDEMENU_RESPONSE_EMER_PLAN`, `SIDEMENU_RESPONSE_EMER_MAN`
- `SIDEMENU_RECOVERY`, `SIDEMENU_ARCHIVE`
- `GENERIC_CHAT`

### 20.6 Real-time

`socket.io-client: ^4.8.1` — WebSocket bidireccional (chat, drones, emergencias live).

---

## ESTADÍSTICAS

| Métrica                     | Valor |
|-----------------------------|-------|
| Componentes (archivos)      | 141   |
| Páginas (dirs)              | 24    |
| Rutas AppRoute              | 51    |
| Hooks personalizados        | 30    |
| Assets SVG                  | 63    |
| Colores hex únicos          | 100+  |
| colorSchemes Chakra usados  | 7     |
| Dependencias UI             | 40+   |
| Z-index range               | 1-9999|
| Global CSS lines            | 161   |

---

## NOTAS CRÍTICAS PARA AI

1. **Default mode: dark.** `initialColorMode: "dark"`. Diseñar componentes con BG oscuro primero.
2. **Semantic token `sideBar`** existe para bg principal. Usar `bg="sideBar"` en lugar de hardcodear `#55565A`.
3. **colorScheme condicional** es patrón dominante para estados — seguir mapping § 10.
4. **styled-components** se usa sólo en 4 archivos (layout, my-profile, dropdown, teams-page). Preferir Chakra `sx` + `Box` para nuevos componentes.
5. **Iconos:** preferir `@chakra-ui/icons` si existe equivalente. Para específicos usar `react-icons/fi` (Feather) o `md` (Material).
6. **SVGs sidebar:** convención `-BB` / `-WB` obligatoria para modo claro/oscuro.
7. **Form reutilizable:** [src/components/form/Form.tsx](src/components/form/Form.tsx) cubre input, email, password, select, radio, readonly. Usar antes de crear form custom.
8. **Modales:** siempre estructura Chakra `Modal + ModalOverlay + ModalContent + Header + Body + Footer`.
9. **Responsive:** `{ base, md }` es el patrón dominante. `sm`, `lg`, `xl` usados ocasionalmente.
10. **z-index:** respetar jerarquía § 7. `9999` sólo para overlays absolutamente top-level.
11. **Scrollbar custom:** aplicar el patrón del § 17.4 en contenedores con overflow.
12. **i18n obligatorio:** todas las strings de UI vía `FormattedMessage` o `intl.formatMessage`.
13. **Overflow global:** `html, body, #root { overflow: hidden; }` — gestionar scroll en contenedores internos.
14. **Assets icons table:** [src/utils/asset-icons.ts](src/utils/asset-icons.ts) mapea tipos a iconos. Consultar antes de crear nuevos.

---

*Guía de estilos completa. Objetivo: AI-readable. Stack Chakra-first, dark mode default.*
