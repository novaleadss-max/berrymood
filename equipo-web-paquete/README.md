# Equipo de agentes web para Claude Code

Un equipo de 12 agentes especializados, orquestados por el comando `/nueva-web`, que produce
la página web de un cliente de principio a fin: cotización → investigación → legal → diseño +
copy → construcción (Next.js + Tailwind + shadcn/ui + motion) → QA + SEO + GEO + legal →
deploy en Vercel → Google (Search Console, GA4, Ads).

Este paquete trae **todo lo propio del equipo** (agentes, orquestador, skills del estudio,
scripts, plantillas y el `CLAUDE.md` que fija las reglas). Los toolkits de terceros de los
que depende no vienen copiados: `scripts/setup.sh` los clona desde sus repos públicos.

No contiene ninguna clave, cuenta ni dato de cliente. Lo único que tendrás que poner tú son
tus propias credenciales (sección "Secretos").

## Requisitos

- Claude Code (CLI, app de escritorio o extensión de VS Code).
- git, Node 22+ y npm.
- Cuenta de Vercel y `npx vercel login` hecho (para la fase de deploy).
- Opcional: ffmpeg + Chrome/Chromium headless si vas a renderizar video con HyperFrames.

## Instalación (5 minutos)

```bash
# 1. Pon la carpeta donde quieras. Esa ruta será tu workspace; evita moverla después.
cd /ruta/donde/la/dejaste

# 2. Instala: clona toolkits, resuelve rutas, crea .env y .mcp.json, sincroniza .claude/
bash ./scripts/setup.sh

# 3. Abre Claude Code en esa carpeta y arranca un proyecto
claude
> /nueva-web "Panadería La Espiga, panadería artesanal en Querétaro, objetivo: pedidos por WhatsApp"
```

`setup.sh` es idempotente. Si mueves la carpeta a otra ruta, lo más simple es volver a
descomprimir el paquete original en la nueva ubicación y correrlo otra vez.

Los toolkits se clonan fijados al commit con el que se probó este equipo. Si prefieres la
última versión de cada uno: `bash ./scripts/setup.sh --latest`. Después de un `git pull`
dentro de cualquier toolkit, corre `bash ./scripts/sync-toolkits.sh`.

## Qué hay dentro

```
CLAUDE.md                 reglas del workspace: pipeline, memoria compartida, stack, toolkits
.claude/
  commands/nueva-web.md   el orquestador (/nueva-web)
  agents/                 11 agentes propios (+3 de The Architect que genera setup.sh)
  skills/                 4 skills propias: ui-libraries, 21st-dev, scroll-world-studio, find-skills
                          (+ ~35 symlinks a skills de los toolkits que genera setup.sh)
  settings.json           allowlist de permisos para que el pipeline no pregunte a cada paso
scripts/
  setup.sh                instalación en una máquina nueva
  sync-toolkits.sh        regenera symlinks/copias de los toolkits hacia .claude/
  nueva-memoria.sh        crea la memoria compartida de un proyecto (lo llama /nueva-web)
templates/MEMORIA.md      plantilla de la memoria compartida
sites/                    aquí vive cada página construida: sites/<slug>/
cotizaciones/             cotizaciones de prospectos sin proyecto aún
blueprints/               salida de /architect (proyectos complejos)
vendor/animmaster-lib/    vacío; para la librería de pago Animmaster si la compras
.env.example              variables que lee el equipo (copia a .env)
.mcp.json.example         servidor MCP de 21st.dev (setup.sh genera .mcp.json)
```

Toolkits que clona `setup.sh` (no editar dentro de ellos):

| Carpeta | Repo | Para qué |
|---|---|---|
| `claude-webkit/` | Hainrixz/claude-webkit | 13 skills de construcción, SEO, QA, deploy, research |
| `the-architect/` | Hainrixz/the-architect | `/architect`: entrevista y blueprint para proyectos complejos |
| `gsap-skills/` | greensock/gsap-skills | animación por scroll (ScrollTrigger) |
| `hyperframes/` | heygen-com/hyperframes | video MP4 desde HTML/CSS (hero video, lanzamientos) |
| `google-skills/` | google/skills | skills oficiales de Google Ads API, Analytics, Data Manager |
| `scroll-world/` | oso95/scroll-world | landing cinemática con video IA scrubbeado por scroll |

## El equipo

| Fase | Agente | Entregable en `sites/<slug>/docs/` |
|---|---|---|
| 0 Venta | `sales-quoter` | `cotizacion.md` + `cotizacion-interna.md` |
| 1 Investigación | `brand-research` | `brand-brief.md` |
| 1b Legal (scoping) | `legal-compliance` | `legal-scope.md` |
| 2a Diseño ∥ | `design-system` | `DESIGN.md` |
| 2b Copy ∥ | `copywriter` | `copy-deck.md` |
| 3 Construcción | `frontend-builder` | proyecto Next.js en `sites/<slug>/` |
| 4a QA ∥ | `qa-visual` | `qa-report.md` |
| 4b SEO ∥ | `seo-optimizer` | `seo-report.md` |
| 4c GEO (tras SEO) | `geo-optimizer` | `geo-report.md` + `llms.txt` |
| 4d Legal (producción) ∥ | `legal-compliance` | `legal-report.md` + páginas legales |
| 5 Deploy | `deploy-engineer` | `deploy-report.md` + URL |
| 6 Google (opcional) | `google-specialist` | `google-report.md` |

Los agentes no comparten conversación: comparten **una memoria en disco**
(`sites/<slug>/docs/MEMORIA.md` + `memoria/<agente>.md`). Cada uno la lee antes de empezar y
escribe su entrada al terminar. `CLAUDE.md` explica las reglas; no hace falta que las
memorices, el orquestador las impone.

Puedes invocar cualquier agente solo, sin el pipeline: "cotiza una landing para X",
"revisa la página de sites/x", "optimiza el SEO de sites/x".

## Secretos (lo que tienes que poner tú)

Nada de esto viene en el paquete. Todo va en `.env` o en tu entorno, nunca en comandos ni
en el chat.

| Qué | Dónde | Para qué | Sin ello |
|---|---|---|---|
| `API_KEY_21ST` | `.env` | skill `21st-dev`: Magic MCP y registro de componentes (https://21st.dev/mcp) | el MCP `magic-21st` no arranca; el resto del equipo funciona igual |
| Sesión de Vercel | `npx vercel login` | fase 5 (deploy) | `deploy-engineer` se detiene y lo pide |
| Sesión de Higgsfield | `higgsfield auth login` (OAuth interactivo) | solo landings `scroll-world` (generación de video IA con costo) | ese formato no se ofrece |
| Acceso a Google Ads / GA4 | MCP NotFair-GoogleAds del plugin toprank, o cuenta del cliente | fase 6 | `google-specialist` entrega checklist para el cliente |

## Plugins opcionales que usan los agentes

Los agentes funcionan sin ellos (traen un checklist propio de respaldo), pero con ellos
rinden más. Se instalan una vez, en una sesión interactiva de Claude Code:

| Plugin | Lo usa | Instalación |
|---|---|---|
| `claude-seo-ai` (Hainrixz/claude-seo-ai) | `geo-optimizer` (`claude-seo-ai:geo`, answerblocks, factdensity, ai-crawlers) | `/plugin marketplace add Hainrixz/claude-seo-ai` → `/plugin install claude-seo-ai@claude-seo-ai` |
| `toprank` (nowork-studio/toprank) | `google-specialist` (google-ads, keyword-research) | `/plugin marketplace add nowork-studio/toprank` → `/plugin install toprank@nowork-studio` |
| `vercel` (anthropics/claude-plugins-official) | `deploy-engineer` como apoyo | `/plugin install vercel@claude-plugins-official` |

`google-specialist` menciona además las skills `ads-google`, `ads-math` y `ads-plan`, que
forman parte de un paquete de auditoría de anuncios instalado a nivel de usuario
(`~/.claude/skills/`) y no vienen aquí. Si no las tienes, el agente lo detecta y sigue
sin ellas.

## Cómo trabajamos con el equipo (prácticas, no reglas del código)

- El orquestador coordina y revisa; los agentes ejecutan. Cuando un entregable no pasa el
  gate, se relanza al agente con la instrucción concreta, no se arregla a mano.
- Hay un solo punto de aprobación humana intermedio: la dirección de diseño (fin de la fase
  2). Todo lo demás corre con gates automáticos.
- Los documentos legales que produce `legal-compliance` son borradores: se entregan al
  cliente con la indicación expresa de que los revise un abogado.
- Las cotizaciones salen en MXN con precios de referencia de Guadalajara. Si trabajas en
  otra plaza, ajusta la tabla de niveles en `.claude/agents/sales-quoter.md`.
- Rutas absolutas en todos los comandos Bash de los agentes: el directorio de trabajo no
  está garantizado entre llamadas.

## Licencias

Lo propio de este paquete (agentes, orquestador, skills del estudio, scripts) se comparte
tal cual, para uso libre. Cada toolkit clonado conserva su licencia: claude-webkit y
the-architect (ver sus repos), gsap-skills (GreenSock), hyperframes (Apache-2.0),
google/skills (Apache-2.0), scroll-world (MIT). La skill `find-skills` es de vercel-labs.
