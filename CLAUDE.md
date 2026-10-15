@AGENTS.md

# BerryMood — landing page

Landing informativa de **BerryMood** (Chocolate & Berry Lab), fresas premium con chocolate
en Galerías Chilpancingo, Gro. Sin pedidos por web: el objetivo es presencia y llevar gente
a Instagram (@berry_moodmx) y a la tienda.

Habla con el usuario en **español**, tú, claro y sin tecnicismos. Es el dueño del negocio,
no un desarrollador.

## Reglas que no se rompen

1. **Nunca publiques con `vercel` / `npx vercel` / `deploy.sh`.** Publicar = commit + push a
   `main`; Vercel despliega solo desde GitHub. Un deploy directo desde una máquina ya
   reemplazó la página una vez con una versión que el usuario no aprobó.
2. **El hero (sección de inicio) no se toca** sin que el usuario lo pida explícitamente.
   Le encanta como está: vaso al centro, anillo dorado girando, "Berry / Your / Mood.".
3. **Un cambio = un commit** con mensaje claro en español, para poder deshacer uno solo.
4. Antes de cambiar diseño o animación, muestra capturas (Playwright) y pregunta.
   Nada de transiciones entre secciones tipo "hojas" o difuminados: ya se probaron y se
   descartaron. Las secciones pasan normal al hacer scroll.
5. `npm run build` debe pasar antes de cada push.

## Marca

- Colores (del logo): chocolate `#4F2B15` (fondos en tonos `#1E1109`/`#2A180C`/`#170C06`),
  dorado `#C2883A`, crema `#FBF7F1`. El rojo fresa solo vive en las fotos.
- Tipografía: **Bodoni Moda** (títulos) + **Jost** (texto). Google Fonts vía `next/font`.
- Slogan: "Berry Your Mood." Se dice "chocolate premium" (nunca "chocolate belga").
- Assets en `public/images/` (vaso recortado, foto original, logo crema, monogramas).

## Estructura

Next.js 16 (App Router) + Tailwind 4 + `motion` (`motion/react`). Radix para el menú móvil.

- `src/components/hero.tsx` — inicio
- `src/components/sections.tsx` — valores, Quiénes somos, Visítanos, footer
- `src/components/scroll-scenes.tsx` — animaciones ligadas al scroll: foto en el arco,
  vaso fijo que gira en "Arma tu mood", logo tipo bisel Rolex
- `src/lib/site.ts` — Instagram, dirección, links

## Skills de este proyecto (`.claude/skills/`)

| Para qué | Skill | Cuándo |
|---|---|---|
| Dirección de arte | `design-taste-frontend` (Taste) | Al replantear una sección o el look general |
| Mejorar lo existente | `redesign-existing-projects` | Subir de nivel una sección ya hecha |
| Diseño y pulido | `impeccable` (`/impeccable critique`, `polish`, `audit`, `bolder`, `quieter`, `typeset`, `layout`) | Revisión antes de enseñar y antes de publicar |
| Base de diseño | `frontend-design` | Reglas anti-"hecho por IA" |
| Movimiento | `animate` → `emil-design-eng` → `apple-design` | Toda animación. Estas mandan sobre cualquier otra guía de motion |
| Revisar movimiento | `review-animations` (solo la activa el usuario con `/review-animations`), `find-animation-opportunities` | Después de animar |
| Variantes | `prototype` | Cuando el usuario no sabe qué quiere en una sección |
| Rendimiento de animación | `animation-performance` | Si algo se traba o va a tirones |
| Romper la UI | `break-ui` | Probar casos raros (textos largos, pantallas chicas) antes de publicar |
| Ver la página | Playwright MCP (`.mcp.json`) | Capturas en 375 / 768 / 1440 px |

Si dos skills se contradicen: motion lo decide la cadena de Emil Kowalski; tipografía,
color y layout los deciden Taste + Impeccable respetando la marca de arriba (Bodoni + Jost,
paleta del logo). Ninguna skill cambia estas reglas.

Reglas de motion: nunca `ease-in` en UI (usar `cubic-bezier(0.23, 1, 0.32, 1)`), nunca
`scale(0)`, solo `transform`/`opacity`/`clip-path`, `prefers-reduced-motion` más suave pero
no cero, botones con `:active { transform: scale(0.97) }`.

## Objetivo actual

Llevar la página, paso a paso y con aprobación del usuario en cada paso, a un nivel
"tipo Apple": mucho aire, tipografía enorme y precisa, producto como protagonista,
scroll que cuenta una historia sin sentirse diapositiva.
