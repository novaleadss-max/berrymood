# Animmaster Lib — `https://animmasterlib.dev`

Datos verificados el 2026-08-07 desde el sitio oficial.

## Qué es

"Animmaster Lib | 300 PRO-Level Animated Components for modern Web Products". Producto
comercial de pago único, **no es un registro open source**.

Composición declarada por el autor: **60% HTML/CSS/JS, 30% React, 10% Next.js**. No
declara Tailwind.

## Precios (pago único, sitio oficial)

| Plan | Precio | Incluye |
|---|---|---|
| Junior | USD 3 | acceso limitado |
| PRO | USD 4.99 (antes 10) | acceso de por vida, sin actualizaciones |
| Premium | USD 8 (antes 20) | acceso de por vida + actualizaciones futuras |

## Categorías (14)

| Categoría | Componentes |
|---|---|
| Scroll Animations | 66 |
| Hero Animations | 26 |
| Sliders | 23 |
| 3D Animations | 22 |
| Navigation Menus | 21 |
| Hover Effects | 20 |
| Mouse Effects | 20 |
| WebGL Shaders | 18 |
| Page Transitions | 14 |
| Text Animations | 14 |
| SVG Animations | 11 |
| Background Animations | 10 |
| Grid Animations | 10 |
| Physics Effects | 10 |

## Entrega e integración

Tras la compra se da acceso a una **carpeta de Google Drive con los componentes en ZIP**.
No hay CLI, ni paquete npm, ni registro shadcn, ni demos públicas navegables por URL: el
sitio muestra previews en video/imagen.

Convención de este workspace — los archivos descomprimidos viven en:

```
__WORKSPACE__/vendor/animmaster-lib/
```

Antes de usar cualquier componente: comprobar que la carpeta existe y contiene los
archivos. Si no existe, reportarlo tal cual (no está descargada / no está comprada) y
seguir con Vengeance UI, Skiper UI o 21st.dev. **Nunca reconstruir un componente de
Animmaster "de memoria" a partir de su descripción o de un video del sitio.**

## Advertencia de licencia

El sitio público no especifica si la licencia permite uso comercial en proyectos de
terceros (páginas de clientes del estudio). Hasta confirmar los términos con el
comprobante de compra:

- Sí: usarlo como **referencia de efecto** (qué se siente, qué timing, qué curva).
- No: entregar su código dentro del sitio de un cliente.

## Cómo portar un componente HTML/CSS/JS a los sitios del estudio (Next.js)

1. El markup se vuelve JSX; las clases del CSS original se traducen a Tailwind cuando hay
   equivalente y el resto va a un `.module.css` junto al componente. No pegues un
   `<style>` global.
2. Todo el JS imperativo (GSAP, canvas, WebGL, listeners) vive dentro de un client
   component hoja con `"use client"`, en `useGSAP` (preferido, limpieza automática) o
   `useEffect` con función de limpieza que desmonte listeners, canceles rAF y mate
   timelines.
3. Si usa GSAP + ScrollTrigger, seguir las skills `gsap-scrolltrigger` y `gsap-core`, e
   instalar `gsap` y `@gsap/react` en ese sitio (nunca en la raíz del workspace).
4. Si usa WebGL/three: evaluar el costo antes. Una landing de cliente rara vez justifica
   un canvas de 150+ KB; si se usa, cargarlo con `next/dynamic` (`ssr: false`) y con
   fallback estático.
5. `prefers-reduced-motion`: el original casi nunca lo respeta. Añadirlo siempre.
6. Adaptar colores y tipografías a los tokens de `DESIGN.md` antes de integrar.
