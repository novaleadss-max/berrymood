# BerryMood

Landing page de **BerryMood**: fresas con chocolate premium. Galerías Chilpancingo, Gro.

*Berry Your Mood.*

## Correr en local

```bash
npm install
npm run dev
```

Abre http://localhost:3000.

## Dónde editar

- Textos del menú, pasos y nosotros: `src/components/sections.tsx`
- Hero: `src/components/hero.tsx`
- Instagram, dirección y liga de Maps: `src/lib/site.ts`
- Colores: `src/app/globals.css` (bloque `:root`)

## Publicar

La página se publica en **Cloudflare Pages** (proyecto `berrymood`), conectado a este repo de GitHub:

- Publicar = commit + push a `main`. Cloudflare hace el build solo y actualiza la página.
- Cada rama distinta de `main` genera una vista previa con su propia dirección.
- Configuración en Cloudflare: comando `npm run build`, carpeta de salida `out`, `NODE_VERSION=22`.
- El sitio se exporta como archivos estáticos (`output: "export"` en `next.config.ts`).
- Nunca se publica a mano a producción.
