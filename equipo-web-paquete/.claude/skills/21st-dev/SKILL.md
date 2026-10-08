---
name: 21st-dev
description: >-
  Uso de 21st.dev (Magic MCP + registro de componentes) para generar e instalar
  componentes UI de calidad profesional en los sitios del estudio. Usar cuando se
  necesite un componente pulido (hero, pricing, testimonios, navbar, bento grid,
  formularios) en vez de construirlo desde cero, o inspiración de variantes reales.
  Se activa con "usa 21st", "componente de 21st.dev", "busca un componente pro".
---

# 21st.dev — Magic MCP y registro de componentes

Dos vías de uso. Elige según lo que necesites:

## Vía 1 — Magic MCP (generación con IA)

El servidor `magic-21st` está registrado en el `.mcp.json` del workspace (la API key se
lee de `__WORKSPACE__/.env`, variable `API_KEY_21ST` —
NUNCA la imprimas ni la pegues en comandos).

Herramientas reales (cárgalas vía ToolSearch con el prefijo `mcp__magic-21st__` —
verificadas el 2026-08-07 contra el servidor en vivo):

- **`search`** — busca en el catálogo (componentes, temas, plantillas) y devuelve
  metadatos: nombre, autor, preview, `installCommand` y `url`. **Gratis e ilimitada.**
  Es el punto de partida.
- **`get_component`** — trae el código de un componente por su `id`. **Es la única
  herramienta medida**: en el plan free son **2 por día** (verifica con `get_usage`).
  No la gastes explorando: primero `search`, y solo pide el código del elegido.
- **`generate`** — genera UI a partir de una descripción. NO devuelve código inline:
  devuelve una URL para abrir en el navegador y elegir variantes. Consume cuota diaria
  y en free puede responder con paywall (`locked: true`). Modo `code` (React/shadcn) o
  `sketch` (HTML/Tailwind rápido).
- **`get_inspiration`**, **`search_logo`** (logos de marcas para "confían en nosotros"),
  **`iterate_generation`**, **`get_theme`**, **`get_usage`**.

Cuota del estudio hoy: tier **free**, búsquedas ilimitadas, **2 recuperaciones de código
al día**. Por eso el orden correcto es: catálogos locales de `ui-libraries` → `search` →
`get_component` solo para la pieza final.

## Vía 2 — Registro vía shadcn CLI (REQUIERE la API key)

Corrección verificada el 2026-08-07: el registro de 21st.dev **no es público**. Sin
`api_key` devuelve **403**; con la key, 200. El `installCommand` que devuelve `search` ya
trae el parámetro:

```bash
# la key se pasa por variable de entorno, NUNCA literal en el comando
cd __WORKSPACE__/sites/<slug>
set -a && source __WORKSPACE__/.env && set +a
npx shadcn@latest add "https://21st.dev/r/<autor>/<componente>?api_key=$API_KEY_21ST"
```

**Nunca imprimas la respuesta JSON del registro en el chat ni la guardes en el
repositorio**: 21st.dev incrusta la API key dentro del propio JSON (en las URLs de
`registryDependencies`), así que volcarla filtra la credencial. Si necesitas inspeccionar
un item, redacta con `sed` antes de mostrar cualquier fragmento, o mejor no lo muestres.

## Vía 3 — Galerías de referencia para análisis

Para analizar patrones antes de diseñar o construir (no para copiar código):

- **https://www.cta.gallery/** — galería curada de secciones CTA y componentes de
  landing pages reales (muchos construidos con 21st.dev). Navégala con WebFetch o la
  skill `web-reader`: extrae estructura de la sección, jerarquía del mensaje, posición
  y texto del CTA, y patrones de layout que se repiten en los mejores ejemplos del giro
  del cliente.
- **https://21st.dev/** — el catálogo público: sirve para identificar el componente
  exacto a instalar por Vía 2 o el estilo a pedir por Vía 1.

El análisis se documenta (en DESIGN.md o en el brief) como patrones observados con URL
de referencia — nunca como screenshot-a-código ciego: el resultado debe pasar por los
tokens y el copy del proyecto.

## Reglas de uso en el estudio

1. **DESIGN.md manda**: todo componente de 21st.dev (generado o instalado) se adapta a
   los tokens del sistema de diseño del proyecto ANTES de integrarse — colores, fuentes,
   radios y espaciado. Un componente a stock con la paleta de otro sitio es un defecto
   de QA, no un atajo.
2. El copy del componente se mapea desde `copy-deck.md` — nunca se queda el lorem ni el
   texto de ejemplo en inglés.
3. Las animaciones del componente se homologan a `motion` (import `motion/react`) y a
   las reglas de motion del proyecto (`prefers-reduced-motion`, transform/opacity).
4. Si el MCP no está disponible en la sesión (no aparece con ToolSearch), usa la Vía 2 o
   construye a mano — repórtalo, no te bloquees.

## Antes de generar: revisa si ya existe

21st.dev es la fuente para **generar** lo que no existe. Si lo que necesitas es un
componente animado ya resuelto (hero, carrusel, marquesina, bento, navbar, fondo, texto
animado, efectos de scroll), primero consulta la skill `ui-libraries`: Vengeance UI (129
gratis) y Skiper UI (37 libres) tienen catálogos locales verificados y se instalan con el
CLI de shadcn sin API key. Generar a medida cuesta más y suele quedar por debajo de una
pieza ya pulida.
