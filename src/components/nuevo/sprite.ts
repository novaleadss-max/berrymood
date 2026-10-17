/* =============================================================================
   FRESA LIGERA (fallback sin GPU)

   Si el equipo no tiene aceleración 3D, no se descarga Three.js: se usa una
   imagen de la misma fresa (renderizada desde el modelo 3D, /public/nuevo/fresa.webp)
   que hace exactamente el mismo recorrido por la página. Se dibuja en un canvas 2D
   solo cuando cambia (así no cuenta como "imagen principal" para Lighthouse).
   La lluvia de fresas se hace con imágenes.
   ========================================================================== */

import gsap from "gsap";

const SRC = "/nuevo/fresa.webp";
/** La imagen incluye hojas y tallo: es un poco más alta que el cuerpo de la fresa 3D. */
const IMG_VS_BODY = 1.2;

export class BerrySprite {
  state = { x: 0, y: 0, s: 0.5, spin: 0, tilt: 0, opacity: 0 };
  intro = { p: 0 };
  private img: HTMLImageElement;
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private pointer = { x: 0, y: 0 };
  private look = { x: 0, y: 0 };
  private last = "";
  private dpr = 1;

  constructor(
    private layer: HTMLElement,
    private reduced: boolean,
  ) {
    this.img = new Image();
    this.img.src = SRC;
    this.img.decoding = "async";
    this.img.onload = () => (this.last = "");
    this.canvas = document.createElement("canvas");
    this.canvas.className = "bm-berry-canvas2d";
    this.ctx = this.canvas.getContext("2d")!;
    layer.append(this.canvas);
    this.resize();
  }

  setPointer(x: number, y: number) {
    this.pointer.x = x;
    this.pointer.y = y;
  }

  rain(count: number) {
    const n = Math.min(count, 22);
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    for (let i = 0; i < n; i++) {
      const d = new Image();
      d.src = SRC;
      d.alt = "";
      d.className = "bm-berry-drop";
      this.layer.append(d);
      const size = 0.08 + Math.random() * 0.08;
      gsap.fromTo(
        d,
        { x: Math.random() * vw, y: -vh * (0.2 + Math.random() * 0.6), rotation: Math.random() * 360, height: vh * size },
        {
          y: vh * 1.15,
          rotation: `+=${(Math.random() - 0.5) * 540}`,
          duration: 1.4 + Math.random() * 1.2,
          ease: "power1.in", // caída con gravedad
          delay: Math.random() * 0.5,
          onComplete: () => d.remove(),
        },
      );
    }
  }

  tick(dt: number) {
    const st = this.state;
    const k = 1 - Math.exp(-dt * 5);
    this.look.x += (this.pointer.x - this.look.x) * k;
    this.look.y += (this.pointer.y - this.look.y) * k;
    const intro = this.intro.p;
    const opacity = st.opacity * Math.min(1, intro * 1.4);
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    const h = st.s * IMG_VS_BODY * (0.7 + 0.3 * intro) * vh;
    const x = vw / 2 + st.x * vw + this.look.x * 14;
    const y = vh / 2 - (st.y + (1 - intro) * 0.18) * vh - this.look.y * 10;
    const rot = this.reduced ? 0 : st.spin * 18 + this.look.x * 8 - (1 - intro) * 40;
    const key = `${x.toFixed(1)}|${y.toFixed(1)}|${h.toFixed(1)}|${rot.toFixed(1)}|${opacity.toFixed(3)}`;
    if (key === this.last || !this.img.complete) return;
    this.last = key;
    const c = this.ctx;
    c.setTransform(1, 0, 0, 1, 0, 0);
    c.clearRect(0, 0, this.canvas.width, this.canvas.height);
    if (opacity < 0.005) return;
    const w = (h * this.img.naturalWidth) / this.img.naturalHeight;
    c.globalAlpha = opacity;
    c.setTransform(this.dpr, 0, 0, this.dpr, x * this.dpr, y * this.dpr);
    c.rotate((rot * Math.PI) / 180);
    c.drawImage(this.img, -w / 2, -h / 2, w, h);
  }

  resize() {
    this.dpr = Math.min(window.devicePixelRatio || 1, 2);
    this.canvas.width = Math.round(window.innerWidth * this.dpr);
    this.canvas.height = Math.round(window.innerHeight * this.dpr);
    this.last = "";
  }

  dispose() {
    this.layer.replaceChildren();
  }
}
