/* =============================================================================
   CHOCOLATE QUE ESCURRE (transición entre secciones)

   Un SVG fijo a pantalla completa con dos capas de chocolate (una oscura que va
   un poco atrás para dar profundidad). `cover` (0→1) baja el chocolate desde
   arriba con gotas que se adelantan; `uncover` (0→1) lo sigue bajando hasta que
   sale por abajo y descubre la sección nueva. Un solo trazo por capa: barato.
   ========================================================================== */

import { GOTEO } from "./config";

type Drop = { x: number; w: number; len: number; lag: number };

function makeDrops(n: number, seed: number): Drop[] {
  const rnd = (i: number) => {
    const s = Math.sin(i * 127.1 + seed * 311.7) * 43758.5453;
    return s - Math.floor(s);
  };
  return Array.from({ length: n }, (_, i) => ({
    x: ((i + 0.5) / n) * 100 + (rnd(i) - 0.5) * (60 / n),
    w: 2.2 + rnd(i + 9) * (34 / n),
    len: 8 + rnd(i + 3) * 26,
    lag: rnd(i + 5) * 0.35,
  }));
}

/** Borde inferior ondulado con gotas. `base` = altura del borde (0–100). */
function edge(drops: Drop[], base: number, grow: number) {
  // Recorre de derecha a izquierda (para cerrar el trazo).
  let d = "";
  const sorted = [...drops].sort((a, b) => b.x - a.x);
  let x = 100;
  d += `L 100 ${base} `;
  for (const dr of sorted) {
    const l = dr.len * Math.max(0, Math.min(1, (grow - dr.lag) / (1 - dr.lag)));
    const y = base + l;
    const r = dr.w / 2;
    const x0 = dr.x + r * 1.6;
    const x1 = dr.x - r * 1.6;
    if (x0 < x) d += `L ${x0.toFixed(2)} ${base} `;
    // hombro → gota redondeada → hombro
    d += `C ${(dr.x + r * 0.9).toFixed(2)} ${base} ${(dr.x + r).toFixed(2)} ${(y - r * 0.6).toFixed(2)} ${dr.x.toFixed(2)} ${y.toFixed(2)} `;
    d += `C ${(dr.x - r).toFixed(2)} ${(y - r * 0.6).toFixed(2)} ${(dr.x - r * 0.9).toFixed(2)} ${base} ${x1.toFixed(2)} ${base} `;
    x = x1;
  }
  d += `L 0 ${base} `;
  return d;
}

export class Drip {
  private front: SVGPathElement;
  private back: SVGPathElement;
  private dropsF: Drop[];
  private dropsB: Drop[];

  constructor(
    private el: HTMLElement,
    mobile: boolean,
  ) {
    const n = mobile ? 8 : GOTEO.gotas;
    this.dropsF = makeDrops(n, 1);
    this.dropsB = makeDrops(n + 3, 7);
    el.innerHTML = `<svg viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true" width="100%" height="100%">
      <path fill="${GOTEO.fondo}"></path><path fill="${GOTEO.frente}"></path></svg>`;
    [this.back, this.front] = Array.from(el.querySelectorAll("path"));
    this.set(0, 0);
  }

  /**
   * cover: 0 = nada, 1 = pantalla cubierta.  uncover: 0 = cubierta, 1 = ya salió por abajo.
   */
  set(cover: number, uncover: number) {
    const visible = cover > 0.001 && uncover < 0.999;
    this.el.style.visibility = visible ? "visible" : "hidden";
    if (!visible) return;
    const path = (drops: Drop[], lead: number) => {
      const c = Math.min(1, cover * (1 + lead) - lead * 0.5);
      // la parte de abajo baja de -40 a 100 (+ gotas); la de arriba baja al descubrir
      const bottom = -40 + Math.max(0, c) * 140 + uncover * 60;
      const top = uncover * 150 - 10;
      const grow = Math.max(0, c);
      return `M 0 ${top.toFixed(2)} L 100 ${top.toFixed(2)} ${edge(drops, bottom, grow)} Z`;
    };
    this.back.setAttribute("d", path(this.dropsB, 0.18));
    this.front.setAttribute("d", path(this.dropsF, 0));
  }
}
