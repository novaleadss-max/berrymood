---
name: scroll-world-studio
description: >-
  Reglas del estudio para construir una landing cinemática "scroll-world" (la cámara vuela
  de escena en escena sin cortes, video IA scrubbeado por scroll) dentro de un sitio
  Next.js de sites/<slug>/. Envuelve a la skill upstream `scroll-world` (oso95, MIT) con
  lo que ella no decide: cuándo ofrecerla, cómo cotizarla, qué backend usar en esta
  máquina, dónde viven los assets, cómo montar el engine sin romper SEO/GEO, y cómo se
  reparte entre sales-quoter, design-system, frontend-builder y qa-visual. Se activa con
  "landing cinemática", "scroll-world", "mundo en diorama", "que la cámara vuele por la
  página", "scroll que recorre el negocio", "estilo Emons", "video scrubbeado por scroll".
---

# scroll-world en el estudio

**Lee primero la skill upstream** `scroll-world` (symlink en
`__WORKSPACE__/.claude/skills/scroll-world/`). Ella es la
fuente de verdad del procedimiento: entrevista, prompts, la ley de costuras
(frame-identical), pipeline ffmpeg, engine y QA. Este archivo NO la repite; solo fija las
decisiones del estudio que ella deja abiertas. Si algo aquí contradice al upstream en
materia de **técnica** (costuras, codificación, seeks), manda el upstream. En materia de
**proceso y dinero**, manda este archivo.

Toolkit clonado en `__WORKSPACE__/scroll-world/`. Se actualiza
con `git pull` ahí y `bash __WORKSPACE__/scripts/sync-toolkits.sh`.
Nunca editar dentro del clon.

## 1. Cuándo se ofrece (y cuándo no)

Es un **formato de landing**, no una animación que se añade a una página normal. Se ofrece
solo si se cumple todo esto:

- La marca lo aguanta: diorama/miniatura/mundo juguete, o real estate, hospitalidad y
  lujo con dirección fotorreal. Un despacho contable o una clínica estándar no lo necesita.
- El cliente tiene presupuesto para la **generación de assets** (sección 2) además del
  sitio. Sin ese renglón aprobado no se genera nada.
- El sitio es una landing de 5 a 7 beats narrativos. Para sitios multipágina, la
  scroll-world es como mucho la home; el resto se construye con el stack estándar.

Quien lo decide es `design-system` en DESIGN.md (formato, escenas, estilo, cámara), a
partir del brand-brief y de la cotización aprobada. `frontend-builder` no lo elige por su
cuenta.

Relación con las demás herramientas: no sustituye a `gsap-scrolltrigger` (anima DOM) ni a
`hyperframes` (HTML → MP4). En una página scroll-world **no se monta lenis** ni smooth
scroll: el engine lee `window.scrollY` nativo y un scroll suavizado lo desincroniza. GSAP
tampoco hace falta en esa página.

## 2. Dinero: se cotiza aparte y se aprueba antes de generar

`sales-quoter` añade una partida "Landing cinemática (generación de assets IA)" separada
del desarrollo. Fórmula del upstream (Step 1.7): `N stills + (2N−1) videos [×2 si versión
móvil nativa 9:16] + ~15 % de re-rolls`. Referencias del autor, medidas en julio de 2026 y
NO verificadas por el estudio: una cadena de 6 escenas a 1080p ≈ 27 USD vía Monid; en
créditos Higgsfield ≈ 40–55 créditos por video y ≈ 15 por still (plan Plus). Antes de
cotizar en firme, `sales-quoter` verifica el precio vigente de créditos en higgsfield.ai y
lo cita con fecha en `cotizacion-interna.md`.

Reglas:
- **Calibrar, no adivinar**: el builder genera UN still y UN video, mide el consumo real de
  créditos (`higgsfield workspace list` antes/después) y extrapola. Ese dato va a MEMORIA.md
  como hecho verificado con fecha.
- **Aprobación explícita** del total estimado antes del batch. Sin ella, se detiene y se
  escribe la entrada de memoria con `Estado: BLOQUEADO`.
- La versión móvil nativa 9:16 se ofrece siempre con su costo (≈ 2×). Si el cliente no la
  paga, el recorte central 16:9 es un stopgap que se declara por escrito en `deploy-report.md`,
  nunca se entrega en silencio.
- Los créditos gastados de verdad (no el estimado) quedan registrados en MEMORIA.md.

## 3. Backend de generación (estado de referencia; verifícalo en tu máquina)

| Pieza | Estado | Regla |
|---|---|---|
| `higgsfield` CLI (npm `@higgsfield/cli` 1.1.24) | Instalar global (`npm i -g @higgsfield/cli`, Node 22) | Backend por defecto del estudio para stills Y cadena de video. Usar las funciones `gen_still`/`gen_dive`/`gen_conn` del `pipeline.md` (§1, §2, §4). |
| Autenticación Higgsfield | Pendiente: OAuth interactivo | La corre el dueño del workspace en su terminal: `higgsfield auth login` y, si aplica, `higgsfield workspace set <id>`. El agente no puede; si falla auth, se detiene y lo pide. |
| Monid CLI | NO instalado (no está en npm) | **Ignorar toda la ruta Monid** del upstream (pipeline §7, `gen_*_monid`). El fallback "créditos Higgsfield" del upstream es nuestra ruta principal. |
| MCP Higgsfield (claude.ai) | Solo si está conectado en la sesión (opcional) | `seedance_2_0` y `kling3_0` aceptan roles `start_image` y `end_image`; `gpt_image_2` acepta 3:2, 2k, high. Sirve para **preflight de costo** (`get_cost:true`) y para re-rolls sueltos. La subida de frames locales vía MCP no está probada: para la cadena, usar el CLI. |
| `codex` CLI | Opcional | Ofrecer la variante Codex para los stills (cuenta de suscripción, cero créditos) si `codex login status` reporta sesión. Una sola fuente para los N stills de un build. |
| ffmpeg, ffprobe, cwebp, jq, PIL | Requeridos | Sin cambios respecto al upstream. |

Modelo de la cadena: `seedance_2_0` por defecto, `kling3_0` como fallback NSFW, igual que
el upstream. Un solo modelo para toda la cadena. Antes de cada build, confirmar el esquema
con `higgsfield model get <modelo>` porque el catálogo cambia.

Secretos: ningún token de Higgsfield, Codex u otro va en comandos ni en el chat. Si hace
falta una key, va en `__WORKSPACE__/.env` y se carga con
`set -a && source .env && set +a`.

## 4. Dónde vive cada cosa

```
sites/<slug>/
├── video/scroll-world/work/     ← prompts (*.txt), sources crudos (.png/.mp4), frames
│                                   extraídos, *.json/*.err de cada job. NUNCA en /tmp:
│                                   los re-rolls y la auditoría de costos dependen de esto.
├── public/world/                ← stills finales (.webp) y clips codificados (vid/*.mp4)
├── public/world/scrub-engine.js ← copia literal del engine upstream (no editar; si hay
│                                   que tocarlo, copiar a lib/ y documentar el cambio)
├── components/scroll-world/     ← ScrollWorld.tsx (client) + world.config.ts (secciones)
└── docs/memoria/frontend-builder.md ← consumo real, re-rolls, modelo usado, seams QA
```

`WORK` y `ASSETS` del pipeline apuntan ahí con rutas absolutas. Los `.mp4` crudos de 1080p
se conservan en `work/` (los frames de costura salen de ahí).

Peso: una cadena de 6 escenas ronda 60–80 MB de video. Si `public/world/vid/` supera
~50 MB, los clips **no van al repo git del sitio**: se suben a Vercel Blob (o R2) y la
config los referencia por URL absoluta. El engine hace `fetch()` del clip completo como
Blob, así que necesita CORS abierto para el dominio del sitio. Los stills `.webp` sí
quedan en `public/`.

## 5. Montaje en Next.js sin romper SEO/GEO

El engine upstream construye TODO el copy con JavaScript en el cliente. Servido tal cual,
un crawler sin JS (y la mayoría de los crawlers de IA que audita `geo-optimizer`) ve una
página vacía. Regla dura del estudio:

1. **El copy se renderiza en servidor.** `app/page.tsx` (Server Component) emite, por
   cada escena, un `<section id=<id>>` con `<h2>` (title), eyebrow, `<p>` (body), tags y
   el CTA como HTML semántico real, tomados de `world.config.ts` (misma fuente que la
   config del engine, para que nunca diverjan). Ese bloque se envuelve en un contenedor
   que el componente cliente oculta al montar el engine (`hidden` vía estado, no
   `display:none` en CSS estático). Metadata, Open Graph y JSON-LD se hacen con la API
   normal de Next: el engine no las toca.
2. **El engine se monta en cliente.** `ScrollWorld.tsx` (`"use client"`) carga
   `/world/scrub-engine.js` con `next/script` (`strategy="afterInteractive"`, `onLoad`) y
   llama a `window.mountScrollWorld(ref.current, config)`. Declarar el tipo global en
   `types/scroll-world.d.ts`. Es un patrón recomendado, no verificado todavía en un proyecto real:
   el builder lo valida con `next build` y con la primera corrida de `qa-visual`.
3. **Tema desde DESIGN.md.** Los tokens del engine (`--sw-bg`, `--sw-ink`,
   `--sw-ink-soft`, `--sw-accent`, `--sw-font-display`, `--sw-font-body`) se fijan en
   `globals.css` sobre `.sw-root` desde la paleta y las fuentes de DESIGN.md. `--sw-bg`
   DEBE ser el mismo hex que el fondo de los stills. El `accent` por sección también sale
   de DESIGN.md.
4. **Navbar y CTA.** El engine trae su propio topbar (`brand`, `nav`, `cta`). En una
   scroll-world ese topbar ES el navbar de la página: no se duplica con el de shadcn.
   `nav:false` si DESIGN.md pide otra navegación.
5. **Copy y escenas** salen del `copy-deck.md` (eyebrow, title de 3–6 palabras, body de
   una oración, 0–3 tags, CTA en la última) y de DESIGN.md (subject de cada diorama,
   preámbulo de estilo, cámara). El `copywriter` escribe el copy con esa estructura
   cuando DESIGN.md declara el formato.
6. **Reduced motion** ya lo resuelve el engine (stills sin video). `qa-visual` lo
   verifica; no se añade lógica encima.
7. **`viewport-fit=cover`** en el viewport de Next (`export const viewport`), como pide
   el template upstream.

## 6. Reparto entre agentes

| Agente | Qué hace con scroll-world |
|---|---|
| `sales-quoter` | Partida separada de generación IA con la fórmula de la sección 2; precio de créditos verificado con fecha. |
| `design-system` | Decide el formato en DESIGN.md: 5–7 escenas con su `subject`, preámbulo de estilo (uno de los de `prompts.md` o propio), cámara (fly-through / walkthrough / locked-iso), paleta → tokens `--sw-*`, si hay versión móvil nativa. |
| `copywriter` | Copy por escena con la estructura de `prompts.md` → "Copy per section". |
| `frontend-builder` | Corre Steps 0–7 del upstream con las reglas de las secciones 3–5. Registra consumo real. |
| `qa-visual` | Step 8 del upstream: screenshots antes/después de cada costura, `video.seekable.end(0) > 0`, `currentTime` sigue al scroll, reduced-motion → stills, viewport móvil (throttling 4–6× si hay versión móvil). Falla el gate si una costura salta. |
| `seo-optimizer` / `geo-optimizer` | Auditan el HTML servido (sección 5.1). Si el copy no está en el HTML del servidor, es hallazgo bloqueante. |
| `legal-compliance` | Los prompts ya piden "no text, no logos, no people" en fotorreal. Nada de personas reales identificables ni marcas de terceros en las escenas. |

Cada agente escribe su entrada en `sites/<slug>/docs/memoria/<agente>.md`, como siempre.

## 7. Límites honestos

- Generar toma 3–8 min por clip. Todo se lanza en background y se hace polling con
  un `until`-loop con timeout, nunca `sleep && …` en foreground.
- El filtro NSFW de Seedance da falsos positivos en interiores, spa, piscinas, recámaras.
  Presupuestar re-rolls; el fallback a `kling3_0` para UN clip está sancionado por el
  upstream.
- Las notas del upstream tienen fecha de julio de 2026. Los modelos, flags y precios
  cambian: se re-verifican en cada build, no se citan de memoria.
- Nada de esto se ha corrido aún de punta a punta en el estudio. El primer proyecto que lo
  use es el que valida el patrón de montaje en Next (sección 5) y deja el aprendizaje en
  esta skill.
