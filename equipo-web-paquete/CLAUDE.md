# Workspace del equipo web — agentes para construir páginas de clientes

Workspace para diseñar y construir páginas web del estudio. Integra varios toolkits
clonados como submódulos informales (NO editar dentro de ellos; se actualizan con
`git pull` + `scripts/sync-toolkits.sh`):

| Toolkit | Carpeta | Para qué |
|---------|---------|----------|
| The Architect | `the-architect/` | Entrevistar + diseñar arquitectura + generar blueprints. NO escribe código. |
| Claude Web Builder | `claude-webkit/` | Construir landing pages (Next.js + Tailwind + shadcn/ui) y publicarlas en Vercel. |
| GSAP Skills | `gsap-skills/` | Animación por scroll avanzada (ScrollTrigger, timelines). |
| HyperFrames | `hyperframes/` | Renderizar video MP4 desde HTML/CSS/animaciones (HeyGen, Apache-2.0). |
| Google Skills | `google-skills/` | Repo oficial `google/skills` (Apache-2.0): 130+ Agent Skills de productos Google. Activas solo las de Ads API, Data Manager, Analytics y `finding-google-skills` (vía `GOOGLE_ACTIVE` en `scripts/sync-toolkits.sh`); el resto (Cloud/GKE/BigQuery…) queda inactivo. Las usa `google-specialist`. |
| scroll-world | `scroll-world/` | Landing cinemática: video IA scrubbeado por scroll, la cámara vuela de escena en escena sin cortes (oso95, MIT). Una skill upstream (`scroll-world`, symlink) + la skill propia `scroll-world-studio` con las reglas del estudio. Formato especial con costo de generación por proyecto; ver sección abajo. |

## Estructura de trabajo

- `blueprints/` — salida de The Architect (`/architect` y variantes).
- `sites/<slug>/` — cada página web construida vive en su propia carpeta aquí. Nunca
  crear proyectos Next.js en la raíz ni dentro de los toolkits.
- `.claude/` — comandos, agentes y skills sincronizados desde los toolkits.
  Los comandos y la skill `architect` son COPIAS con rutas absolutas; las 13 skills
  del webkit, las de GSAP y las de HyperFrames son symlinks. Tras un `git pull` en
  cualquier toolkit, ejecutar:
  `bash __WORKSPACE__/scripts/sync-toolkits.sh`
- `.claude/skills/find-skills/` — skill de vercel-labs para descubrir e instalar skills
  del ecosistema abierto (`npx skills find <tema>` / `npx skills add <paquete>`,
  catálogo en skills.sh). Usarla cuando falte una capacidad en el equipo antes de
  escribir una skill propia.

## Equipo de agentes web (`.claude/agents/`)

Pipeline de producción para clientes — orquestado por el comando `/nueva-web`:

| Fase | Agente | Skills que usa | Entregable (en `sites/<slug>/docs/`) |
|------|--------|----------------|--------------------------------------|
| 0. Venta (preventa) | `sales-quoter` | deep-research, humanizer | `cotizacion.md` + `cotizacion-interna.md` |
| 1. Investigación | `brand-research` | deep-research, web-reader | `brand-brief.md` |
| 1b. Legal (scoping) | `legal-compliance` | deep-research | `legal-scope.md` |
| 2a. Diseño ∥ | `design-system` | ui-ux-pro-max, frontend-design | `DESIGN.md` |
| 2b. Copy ∥ | `copywriter` | humanizer, deep-research | `copy-deck.md` |
| 3. Construcción | `frontend-builder` | shadcn-ui, building-components, frontend-design, vercel-react-best-practices | proyecto en `sites/<slug>/` |
| 4a. QA ∥ | `qa-visual` | playwright-cli, web-design-guidelines, chrome-bridge-automation | `qa-report.md` |
| 4b. SEO ∥ | `seo-optimizer` | seo-audit | `seo-report.md` |
| 4c. GEO/AEO (tras 4b) | `geo-optimizer` | claude-seo-ai:geo, seo-geo-answerblocks, seo-geo-factdensity, seo-ai-crawlers | `geo-report.md` + `llms.txt` |
| 4d. Legal (producción) ∥ | `legal-compliance` | deep-research | `legal-report.md` + páginas legales |
| 5. Deploy | `deploy-engineer` | vercel-deploy | `deploy-report.md` + URL |
| 6. Google (opcional, post-deploy) | `google-specialist` | MCP NotFair-GoogleAds, toprank:google-ads*, toprank:keyword-research, ads-google, ads-math, ads-plan, skills oficiales google/skills (google-ads-api-*, data-manager-api-*, google-analytics-*-basics, finding-google-skills) | `google-report.md` |

OJO: `geo-optimizer` corre SIEMPRE después de `seo-optimizer` (editan los mismos
archivos); `qa-visual` y `legal-compliance` sí van en paralelo con esa cadena.

### Memoria compartida del equipo (obligatoria en todo proyecto)

Los agentes no comparten contexto conversacional: comparten **una sola memoria en disco**.
Todos leen todo; cada uno escribe únicamente su propio archivo.

```
sites/<slug>/docs/
├── MEMORIA.md          ← estado vigente. Lo escribe SOLO el orquestador (/nueva-web).
└── memoria/
    ├── brand-research.md            ← una entrada por agente,
    ├── design-system.md               nombre fijo y dueño único.
    ├── legal-compliance-scoping.md
    ├── legal-compliance-produccion.md
    └── …
```

Reglas duras:

- **Leer antes de trabajar.** Todo agente abre `MEMORIA.md` y hace `Glob` sobre
  `memoria/*.md` ANTES de su primera acción. Es lo primero de su proceso, no un paso
  opcional al final.
- **Escribir al terminar.** Entrega = entregable + entrada de memoria. Un agente sin
  entrada deja ciego al siguiente; si termina bloqueado, escribe igual con
  `Estado: BLOQUEADO` y el motivo.
- **Un escritor por archivo.** Nadie edita la entrada de otro agente. `design-system ∥
  copywriter` y `qa-visual ∥ legal-compliance` corren en paralelo, y dos `Write` sobre el
  mismo archivo se pisan — la partición por escritor es lo que evita perder trabajo. Un
  agente relanzado añade `### Ronda N` a su propio archivo en vez de borrar lo anterior.
- **Consolidación.** El orquestador lee las entradas tras cada gate y actualiza
  `MEMORIA.md` (estado por fase, decisiones vigentes, descartes, hechos verificados con
  fuente, pendientes de cliente, riesgos, bitácora de gates).
- **Retomar un proyecto** = leer `MEMORIA.md` + `memoria/` primero, los entregables después.

Inicialización (ruta absoluta, no sobrescribe si ya existe):
`bash __WORKSPACE__/scripts/nueva-memoria.sh <slug> "<Nombre>"`
Plantilla en `templates/MEMORIA.md`. En preventa, si aún no hay `sites/<slug>/`, el
`sales-quoter` deja su memoria en `cotizaciones/<slug>/memoria/` y el orquestador la mueve
al arrancar el pipeline.

Límite honesto del mecanismo: la memoria sincroniza **entre fases**, no en vivo. Dos
agentes lanzados en el mismo mensaje no ven lo que el otro escribe durante su corrida —
por eso el paralelo solo se usa entre agentes que no dependen entre sí, y las decisiones
que los atan se fijan en `MEMORIA.md` ANTES de lanzarlos.

`legal-compliance` se invoca DOS veces por proyecto: en **scoping** (fase 1b, define
jurisdicciones y restricciones antes de construir — evita retrofitear banner de cookies y
consentimiento) y en **producción** (fase 4d, redacta aviso de privacidad, T&C y política
de cookies, y audita el sitio). Cubre México (LFPDPPP, LFPC/PROFECO, Código de Comercio) y
Estados Unidos (privacidad estatal, CAN-SPAM, TCPA, FTC, ADA/WCAG). Regla dura del estudio:
**lo que produce son borradores no vinculantes** — se entregan al cliente con la instrucción
expresa de que los valide un abogado con cédula, y el agente verifica la normativa vigente
en fuentes primarias en cada corrida en vez de citarla de memoria.

Stack estándar de cada sitio en `sites/<slug>/`: Next.js (App Router + TypeScript) +
Tailwind + shadcn/ui + **motion** (animaciones; import `motion/react`). El
`frontend-builder` instala todo esto en cada scaffold — las dependencias viven en el
`package.json` de cada sitio, nunca en la raíz del workspace.

Animación por scroll avanzada: skills oficiales **gsap-scrolltrigger** + **gsap-core**
(symlinks al clon `gsap-skills/`, activables más en `scripts/sync-toolkits.sh` vía
`GSAP_ACTIVE`). `motion` es el estándar para entradas y micro-interacciones; GSAP +
ScrollTrigger solo cuando DESIGN.md pida pinning/scrub/storytelling por scroll (el
builder instala `gsap` + `@gsap/react` en ese proyecto). Smooth scroll premium:
**lenis** (`lenis/react`, `<ReactLenis root>`) sincronizado con ScrollTrigger; se
desactiva con `prefers-reduced-motion`.

Componentes UI — cuatro fuentes, dos skills. Las usan `design-system` (elige la pieza y
la nombra en DESIGN.md) y `frontend-builder` (la instala y la adapta):

| Fuente | Skill | Costo | Instalación |
|--------|-------|-------|-------------|
| **Vengeance UI** (129 componentes animados) | `ui-libraries` | gratis, OSS | `npx shadcn@latest add https://www.vengenceui.com/r/<name>.json` |
| **Skiper UI** (106; 37 libres, 69 premium→401) | `ui-libraries` | freemium | `npx shadcn@latest add https://skiper-ui.com/r/skiper<NN>.json` |
| **Animmaster Lib** (~300, 60% HTML/CSS/JS) | `ui-libraries` | de pago, ZIP por Drive | archivos locales en `vendor/animmaster-lib/` (no existe aún) |
| **21st.dev** (registro + generación IA) | `21st-dev` | free: 2 códigos/día | Magic MCP (`magic-21st` en `.mcp.json`) o `npx shadcn@latest add "https://21st.dev/r/...?api_key=$API_KEY_21ST"` — su registro exige la key (sin ella: 403) |

La `API_KEY_21ST` vive en `.env` y se pasa SIEMPRE por variable de entorno: nunca literal
en un comando, nunca impresa en el chat, y nunca volcando el JSON del registro de 21st
(que lleva la key incrustada en `registryDependencies`).

Orden de preferencia: pieza ya publicada (Vengeance → Skiper → 21st.dev) antes que
generarla con el MCP, y generarla antes que escribirla desde cero. Los catálogos
completos y verificados viven en `.claude/skills/ui-libraries/references/` — consultarlos
ahí en vez de navegar los sitios. Todo componente se adapta a DESIGN.md, copy-deck y
motion (`framer-motion` → `motion/react`) antes de integrarse; nada queda a stock.

## Skills de diseño premium (propias del estudio, en `.claude/skills/`)

Vendorizadas con versión fija (no se sincronizan desde toolkits):

| Skill | Origen | Licencia | Uso en el pipeline |
|-------|--------|----------|--------------------|
| `design-taste-frontend` (Taste) | Leonxlnx/taste-skill @ `f624f37` | MIT | `design-system`: dirección de arte al definir DESIGN.md (idea, composición, tipo, paleta, fotos) |
| `redesign-existing-projects` | Leonxlnx/taste-skill @ `f624f37` | MIT | Rediseño de sitios ya construidos o de clientes que traen web |
| `impeccable` | pbakaus/impeccable @ `2f98774` (v4.5.2) | Apache-2.0 | `design-system`: `/impeccable critique` y `bolder`/`quieter`; `frontend-builder`: `typeset`, `layout`; `qa-visual`: `/impeccable audit` + `/impeccable polish` como gate obligatorio antes de deploy |

Precedencia cuando chocan: **motion** lo decide la cadena de Emil Kowalski del webkit
(`animate` → `emil-design-eng` → `apple-design`), no `/impeccable animate`. **Tipo, color y
layout**: Taste + Impeccable + `frontend-design`. El `DESIGN.md` del proyecto vive en
`sites/<slug>/docs/DESIGN.md`; si Impeccable crea `PRODUCT.md`/`DESIGN.md` en la raíz del
sitio, se consolidan en `docs/` y se borran de la raíz.

Impeccable descarga su motor la primera vez (`~/.impeccable/bin/`). Para sus hooks de
edición en vivo: `npx impeccable install` (opcional; el skill funciona sin ellos).

Ver la página: **Playwright MCP** (`playwright` en `.mcp.json`) para capturas en
375/768/1440 px; `qa-visual` lo usa antes que `playwright-cli`. **Figma MCP** (opcional,
requiere la cuenta del estudio): `/plugin install figma@claude-plugins-official` dentro de
Claude Code.

## Video: HyperFrames (`hyperframes/`)

Framework OSS de HeyGen que renderiza MP4 determinista desde HTML + CSS + animaciones
seekables (GSAP, Lottie, Three.js, CSS, WAAPI). Sirve para el video de lanzamiento del
sitio del cliente, el hero video de la landing, motion graphics para redes y clips de
features — sin salir del stack web que ya usamos.

Entrada obligatoria: la skill **`hyperframes`** (router). Se lee SIEMPRE primero ante
cualquier petición de "hazme un video / animación / motion graphic"; ella elige el
workflow y las skills de dominio.

Skills activas (symlinks desde `hyperframes/skills/`, 10 de 19):

| Grupo | Skills |
|-------|--------|
| Router | `hyperframes` |
| Dominio | `hyperframes-core` (contrato de composición), `hyperframes-animation`, `hyperframes-keyframes`, `hyperframes-creative` (frame.md, paletas, beats), `hyperframes-cli`, `hyperframes-registry` |
| Media | `media-use` (BGM, SFX, imágenes, TTS, captions, LUTs) |
| Workflows | `product-launch-video` (promo/tour de un sitio), `motion-graphics` (<10s, kinetic type, logo sting, overlay transparente) |

Los otros 9 workflows (`faceless-explainer`, `pr-to-video`, `embedded-captions`,
`talking-head-recut`, `music-to-video`, `slideshow`, `general-video`,
`remotion-to-hyperframes`, `figma`) están clonados pero inactivos: se activan
añadiéndolos a `HF_ACTIVE` en `scripts/sync-toolkits.sh` y re-ejecutándolo.

Reglas: los proyectos de video van en `sites/<slug>/video/` (nunca en la raíz ni dentro
de `hyperframes/`); el CLI se invoca con `npx hyperframes <cmd>` (v0.7.99). En sesión no
interactiva `init` exige un preset — `npx hyperframes init <nombre> --example blank`
(sin él aborta); el MP4 sale en `<proyecto>/renders/`.

Requisitos para renderizar: Node 22+, FFmpeg y Chrome/Chromium headless (`npx hyperframes doctor`
los comprueba). Opcionales: whisper-cpp (transcripción), Kokoro TTS y MusicGen locales, Docker;
sin ellos, voz y música se resuelven por la vía de API que documenta `media-use`.

## Landing cinemática: scroll-world (`scroll-world/`)

Skill de oso95 (MIT, clonada 7-sep-2026) que produce una landing donde el scroll
"scrubbea" video generado con IA: N stills isométricos (gpt_image_2) → N clips "dive-in"
(Seedance 2.0 / Kling 3.0) → N−1 conectores cuyos extremos son los frames reales de los
clips vecinos (la ley de costuras), codificados con ffmpeg y montados por un engine en JS
puro (Blob-seek, crossfade, reduced-motion → stills, endurecimiento móvil).

Es un **formato de landing con costo por proyecto**, no una animación genérica: no
sustituye a `gsap-scrolltrigger` (anima DOM) ni a `hyperframes` (HTML → MP4). Entrada
obligatoria: la skill **`scroll-world-studio`** (propia, en `.claude/skills/`), que
envuelve a la upstream `scroll-world` con las reglas del estudio: cuándo se ofrece (marca
tipo diorama/miniatura o fotorreal premium, 5–7 beats, presupuesto de generación
aprobado), cotización aparte por `sales-quoter`, backend de generación, ubicación de
assets en `sites/<slug>/video/scroll-world/work/` y `public/world/`, montaje en Next.js
con el copy renderizado en servidor (el engine lo construye en cliente y sin eso SEO/GEO
fallan), y el reparto entre agentes.

Backend de generación: `higgsfield` CLI (npm `@higgsfield/cli`, instalar global). **La
autenticación (`higgsfield auth login`) es OAuth interactivo y la corre el dueño del workspace
en su terminal**, nunca un agente. La ruta Monid del upstream se ignora (no está en npm): la
cadena se renderiza con créditos Higgsfield. Si además hay un MCP de Higgsfield conectado,
sirve para preflight de costo y re-rolls sueltos (`start_image`/`end_image` en `seedance_2_0`
y `kling3_0`). Costos de referencia del autor (julio 2026, no verificados): cadena de 6
escenas 1080p ≈ 27 USD; versión móvil nativa 9:16 duplica los videos. Se calibra con un
still y un video antes del batch y el consumo real queda en MEMORIA.md.

Los agentes de The Architect (`stack-researcher`, `blueprint-writer`,
`blueprint-validator`) cubren la fase de arquitectura previa cuando el proyecto es
más que una landing. Los handoffs entre agentes son SIEMPRE archivos en
`sites/<slug>/docs/` — ningún agente depende de contexto conversacional de otro.

## Cuál flujo usar

1. **Diseñar/planear un proyecto** → comandos `/architect`, `/architect-quick`,
   `/architect-brownfield`, `/architect-next`, `/architect-audit`, `/architect-refresh`.
   Siguen las instrucciones de `the-architect/` (ya con rutas absolutas resueltas).
   Los blueprints se escriben en `./blueprints/`.
2. **Construir una landing** → seguir el flujo de `claude-webkit/CLAUDE.md`
   (cuestionario → sistema de diseño → scaffold → build → QA → deploy).
   OJO con las rutas: ese documento asume que se ejecuta desde `claude-webkit/`;
   desde aquí, sus referencias a `docs/...` son `claude-webkit/docs/...`
   (p. ej. `claude-webkit/docs/questionnaire-es.md`,
   `claude-webkit/docs/system-prompt-es.md`). Las skills que menciona ya están
   disponibles vía `.claude/skills/`. El scaffold del proyecto va en `sites/<slug>/`.
3. **Página para un cliente (flujo estándar del estudio)** → `/nueva-web`: orquesta al
   equipo de agentes de principio a fin con gates de calidad entre fases.
4. **Flujo completo para proyectos complejos**: `/architect` para el blueprint →
   `/nueva-web` (o el flujo del webkit) leyendo ese blueprint como fuente de requisitos.

## Reglas del workspace

- Idioma con el usuario: español. Docs técnicos internos pueden quedar en inglés.
- El "role lock" de `claude-webkit/CLAUDE.md` aplica SOLO mientras se está en el
  flujo de construcción de una landing, no a toda sesión en este workspace.
- No editar archivos dentro de `the-architect/` ni `claude-webkit/`: cualquier
  ajuste se hace en este CLAUDE.md, en `.claude/` o en `scripts/sync-toolkits.sh`.
