---
name: ui-libraries
description: >-
  Librerías externas de componentes UI del estudio (Vengeance UI, Skiper UI, Animmaster
  Lib) — de dónde sacar un componente animado ya resuelto en vez de construirlo desde
  cero, con los comandos de instalación verificados y los catálogos completos. Usar al
  diseñar (inspiración/patrones) y al construir secciones con animación no trivial:
  heroes, carruseles, marquesinas, bento grids, navbars, fondos, texto animado, efectos
  de scroll. Se activa con "usa una librería de componentes", "busca un componente
  animado", "vengeance ui", "skiper ui", "animmaster".
---

# Librerías de componentes del estudio

Cuatro fuentes externas. **Antes de escribir un componente animado desde cero, revisa si
alguna ya lo resolvió.** Elige por lo que necesitas, no por costumbre:

| Fuente | Qué es | Costo | Cómo se instala | Cuándo usarla |
|---|---|---|---|---|
| **Vengeance UI** | 129 componentes React/Next + Tailwind, animados | Gratis, OSS | shadcn CLI (registro público) | Primera opción. Cubre primitivos shadcn *y* piezas animadas (fondos, texto, carruseles, navbars) |
| **Skiper UI** | 106 componentes shadcn-style, muy animados | 37 libres / 69 de pago | shadcn CLI (registro público, los premium responden 401) | Efectos vistosos y micro-interacciones con carácter |
| **21st.dev** | Registro + Magic MCP (genera a medida) | Freemium (API key en `.env`) | Ver skill `21st-dev` | Cuando no existe la pieza y hay que generarla, o para logos de marcas |
| **Animmaster Lib** | ~300 animaciones, 60% HTML/CSS/JS puro | De pago (~USD 8), entrega por Google Drive | Archivos locales, sin CLI | Efectos WebGL/físicas/scroll que no existen en las otras. **Ver advertencias abajo** |

Los catálogos completos y verificados están en `references/` — consúltalos ahí en lugar
de navegar los sitios:

- `references/vengeance-ui.md` — los 129 componentes con las dependencias que arrastra cada uno.
- `references/skiper-ui.md` — los 106, marcados LIBRE / premium, con su nombre real.
- `references/animmaster-lib.md` — categorías, entrega, y cómo integrarlo si está comprado.

## Vengeance UI — `https://www.vengenceui.com`

Registro shadcn público. Verificado el 2026-08-07.

```bash
# instalación directa por URL (siempre funciona)
npx shadcn@latest add https://www.vengenceui.com/r/<nombre>.json

# en el sitio del estudio, con ruta absoluta:
npx shadcn@latest add https://www.vengenceui.com/r/aurora-hero.json \
  -c __WORKSPACE__/sites/<slug>
```

Alias opcional en el `components.json` del sitio (permite `@vengeanceui/aurora-hero`):

```json
{ "registries": { "@vengeanceui": "https://www.vengenceui.com/r/{name}.json" } }
```

Los archivos aterrizan en `components/ui/<nombre>.tsx`. Índice completo del registro:
`https://www.vengenceui.com/r/registry.json`.

**Cuidado con el peso**: hay componentes que arrastran `three`, `gsap` o
`@paper-design/shaders-react`. Revisa la columna de dependencias en el catálogo antes de
instalar y decide si ese efecto vale ~150 KB extra de JS en una landing. Si el
componente es puramente decorativo y pesa, no lo uses.

## Skiper UI — `https://skiper-ui.com`

Registro shadcn público con paywall parcial. Verificado el 2026-08-07: de 106
componentes, **37 responden 200 (instalables ya)** y **69 responden 401** (requieren la
licencia de pago; el estudio no la tiene salvo que se compre la licencia).

```bash
npx shadcn@latest add https://skiper-ui.com/r/skiper40.json \
  -c __WORKSPACE__/sites/<slug>
```

Demo de cualquiera: `https://skiper-ui.com/v1/skiper<NN>` — úsala con `web-reader` o
Playwright para ver el efecto antes de instalar.

Dos fricciones reales de este registro:

1. Los nombres son `skiperNN`, no descriptivos. Traduce con `references/skiper-ui.md` y
   **renombra el archivo y el componente** al integrarlo (`skiper40.tsx` →
   `components/sections/hero-reveal.tsx`). Ningún sitio de cliente entrega un componente
   llamado `Skiper40`.
2. Su `registry-item.json` declara `path: "/skiperNN.tsx"` (raíz). Verifica dónde quedó
   el archivo tras el `add` y muévelo a `components/ui/` si hizo falta.

Si un `add` devuelve 401, es premium: no insistas ni busques rodeos para bajarlo —
reporta que ese componente requiere licencia y ofrece la alternativa libre más cercana.

## Animmaster Lib — `https://animmasterlib.dev`

Producto comercial de un solo pago (Junior $3 / PRO $4.99 / Premium $8). ~300
componentes en 14 categorías (scroll, hero, sliders, 3D, menús, hover, mouse, WebGL,
page transitions, texto, SVG, fondos, grid, físicas). **60% HTML/CSS/JS, 30% React, 10%
Next.js.**

No tiene registro ni CLI: tras la compra se entrega una carpeta de Google Drive con ZIPs.
Por eso, en este workspace la convención es:

```
__WORKSPACE__/vendor/animmaster-lib/
```

Antes de proponer un componente de aquí, **verifica que esa carpeta existe y tiene los
archivos**. Si no existe, di exactamente eso: la librería está comprada pero no
descargada, o no está comprada. Nunca inventes el contenido de un componente de
Animmaster ni lo "reconstruyas de memoria" a partir de la descripción del sitio.

Dos advertencias que aplican siempre:

- **Licencia**: no está publicado en el sitio si la licencia cubre uso comercial en
  proyectos de terceros (páginas de clientes del estudio). Antes del primer uso en un
  sitio de cliente, confirma los términos con la compra. Mientras no esté confirmado,
  úsala solo como referencia de efecto, no como código entregado.
- **Conversión**: la mayoría es HTML/CSS/JS con GSAP o WebGL. Portarlo a React no es
  copiar y pegar: el JS imperativo va dentro de `useGSAP`/`useEffect` con limpieza, los
  listeners se desmontan, y el markup se vuelve JSX con clases de Tailwind. Si el
  original usa GSAP+ScrollTrigger, sigue las skills `gsap-scrolltrigger` y `gsap-core`.

## Reglas del estudio (aplican a las cuatro fuentes)

1. **DESIGN.md manda.** Todo componente instalado se adapta a los tokens del proyecto
   —colores, fuentes, radios, espaciado— *antes* de integrarse. Un componente a stock con
   la paleta de otro sitio es un defecto de QA, no un atajo.
2. **El copy sale de `copy-deck.md`.** Cero lorem, cero texto de ejemplo en inglés.
3. **Homologa la animación a `motion`.** Vengeance y Skiper declaran `framer-motion`
   como dependencia; el estándar del estudio es `motion` (import `motion/react`, misma
   API). Tras instalar, reemplaza `from "framer-motion"` por `from "motion/react"` y no
   instales `framer-motion` en el proyecto. Si algún export no existe en `motion/react`,
   instala `framer-motion` solo en ese sitio y déjalo anotado.
4. **`prefers-reduced-motion` siempre.** Muchos de estos componentes animan sin
   preguntar: envuélvelos con `useReducedMotion` o desactiva el efecto. Anima solo
   transform/opacity.
5. **Client components hoja.** El componente animado lleva `"use client"`; la sección que
   lo contiene sigue siendo Server Component.
6. **Verifica que compila.** `npm run build` en verde después de cada integración: estos
   componentes suelen traer tipos laxos y dependencias que el proyecto no tenía.
7. **Atribución de origen.** Anota en `DESIGN.md` o en el reporte de build de qué
   librería salió cada sección (`hero-reveal.tsx ← skiper40`). Facilita el QA y las
   actualizaciones.
