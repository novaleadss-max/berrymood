/* =============================================================================
   FRESA REAL (video de Gemini convertido en cuadros con fondo transparente)

   El video original (fondo verde) se recortó en cuadros WebP con transparencia:
     /public/nuevo/fresa-real/d/001…080.webp   computadora (450×578)
     /public/nuevo/fresa-real/m/001…048.webp   celular (315×405)
   Para cambiar la fresa: genera otro video igual (fondo verde liso, cámara fija,
   fresa centrada) y vuelve a exportar los cuadros con el mismo nombre.

   La fresa gira sola (va y regresa, porque el video no cierra una vuelta exacta),
   gira más con el scroll y sigue al mouse. Entre cuadro y cuadro hay un fundido,
   así se ve fluida con pocos cuadros. Se dibuja en un canvas 2D del tamaño de la
   fresa que se mueve con transform: ligero en cualquier celular y sin Three.js.
   ========================================================================== */

import gsap from "gsap";
import { FRESA_REAL } from "./config";

const pad = (n: number) => String(n).padStart(3, "0");

export class BerryReal {
  /** Lo anima el scroll (mismo formato que antes: fracciones de pantalla). */
  state = { x: 0, y: 0, s: 0.5, spin: 0, tilt: 0, opacity: 0 };
  /** Entrada inicial (0→1). */
  intro = { p: 0 };

  private cfg: { ruta: string; total: number };
  private frames: (HTMLImageElement | null)[];
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private pointer = { x: 0, y: 0 };
  private look = { x: 0, y: 0 };
  private clock = 0;
  private dpr = 1;
  private last = "";
  private reduced: boolean;
  private visible = false;

  constructor(
    private layer: HTMLElement,
    opts: { mobile: boolean; reduced: boolean },
  ) {
    this.reduced = opts.reduced;
    this.cfg = opts.mobile ? FRESA_REAL.movil : FRESA_REAL.escritorio;
    this.frames = Array(this.cfg.total).fill(null);
    this.canvas = document.createElement("canvas");
    this.canvas.className = "bm-berry-canvas2d";
    this.ctx = this.canvas.getContext("2d")!;
    layer.append(this.canvas);
    this.resize();
  }

  private src(i: number) {
    return `${this.cfg.ruta}/${pad(i + 1)}.webp`;
  }

  private load(i: number) {
    return new Promise<void>((resolve) => {
      const img = new Image();
      img.decoding = "async";
      img.src = this.src(i);
      const done = () => {
        this.frames[i] = img;
        this.last = "";
        resolve();
      };
      img.decode().then(done, () => resolve());
    });
  }

  /** Los primeros cuadros (para el preloader). */
  loadFirst() {
    return Promise.all([...Array(FRESA_REAL.primeros).keys()].map((i) => this.load(i)));
  }

  /** El resto, de 4 en 4 en segundo plano. */
  async loadRest() {
    const queue = [...Array(this.cfg.total).keys()].filter((i) => !this.frames[i]);
    const worker = async () => {
      while (queue.length) await this.load(queue.shift()!);
    };
    await Promise.all(Array.from({ length: 4 }, worker));
  }

  setPointer(x: number, y: number) {
    this.pointer.x = x;
    this.pointer.y = y;
  }

  /** Cuadro cargado más cercano (por si aún no llega el que toca). */
  private frame(i: number) {
    for (let d = 0; d < this.cfg.total; d++) {
      const a = this.frames[(i - d + this.cfg.total) % this.cfg.total];
      if (a) return a;
    }
    return null;
  }

  /** Sorpresa: lluvia de fresas (cada una en un ángulo distinto del video). */
  rain(count: number) {
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    const loaded = this.frames.filter(Boolean) as HTMLImageElement[];
    if (!loaded.length) return;
    for (let i = 0; i < count; i++) {
      const d = new Image();
      d.src = loaded[Math.floor(Math.random() * loaded.length)].src;
      d.alt = "";
      d.className = "bm-berry-drop";
      this.layer.append(d);
      const size = 0.09 + Math.random() * 0.09;
      gsap.fromTo(
        d,
        { x: Math.random() * vw - vh * size * 0.4, y: -vh * (0.25 + Math.random() * 0.7), rotation: (Math.random() - 0.5) * 120, height: vh * size },
        {
          y: vh * 1.15,
          rotation: `+=${(Math.random() - 0.5) * 300}`,
          duration: 1.5 + Math.random() * 1.1,
          ease: "power1.in", // caída con gravedad
          delay: Math.random() * 0.6,
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
    if (!this.reduced) this.clock += dt * FRESA_REAL.velocidad * this.cfg.total;

    const intro = this.intro.p;
    const opacity = st.opacity * Math.min(1, intro * 1.4);
    const n = this.cfg.total;
    // Posición en el video: giro solo + giro por scroll + un poco con el mouse.
    const pos = this.clock + (st.spin / (Math.PI * 2)) * FRESA_REAL.porVuelta * n + this.look.x * n * 0.05 - (1 - intro) * n * 0.15;
    const period = 2 * (n - 1);
    const p = ((pos % period) + period) % period;
    const f = p <= n - 1 ? p : period - p; // ida y vuelta
    const i0 = Math.floor(f);
    const t = f - i0;

    const vw = window.innerWidth;
    const vh = window.innerHeight;
    const h = st.s * FRESA_REAL.altoVsCuerpo * (0.7 + 0.3 * intro) * vh;
    const float = this.reduced ? 0 : Math.sin(this.clock / this.cfg.total / FRESA_REAL.velocidad * 1.6) * 0.012; // flota suave
    const x = vw / 2 + st.x * vw + this.look.x * 16;
    const y = vh / 2 - (st.y + float + (1 - intro) * 0.18) * vh - this.look.y * 12;
    // Inclinación en 2D: lo que en 3D era "tilt" aquí es un giro suave del plano.
    const rot = this.reduced ? 0 : st.tilt * 14 + this.look.x * 6 - (1 - intro) * 18;

    // Oculta: no se dibuja nada.
    if (opacity < 0.005) {
      if (this.visible) {
        this.canvas.style.opacity = "0";
        this.visible = false;
      }
      return;
    }
    this.visible = true;

    // El canvas mide solo lo que la fresa y se mueve con transform (lo compone la GPU).
    const a = this.frame(i0);
    if (!a) return;
    const w = (h * a.naturalWidth) / a.naturalHeight;
    this.canvas.style.opacity = String(opacity);
    this.canvas.style.transform = `translate3d(${x - w / 2}px, ${y - h / 2}px, 0) rotate(${rot}deg)`;
    const bw = Math.round(w * this.dpr);
    const bh = Math.round(h * this.dpr);
    const resized = Math.abs(bh - this.canvas.height) > this.canvas.height * 0.04 || this.canvas.height === 0;
    if (resized) {
      this.canvas.width = bw;
      this.canvas.height = bh;
      this.canvas.style.width = `${w}px`;
      this.canvas.style.height = `${h}px`;
    } else {
      this.canvas.style.width = `${w}px`;
      this.canvas.style.height = `${h}px`;
    }
    // Solo se vuelve a pintar si cambió el cuadro del video (o el tamaño).
    const key = `${f.toFixed(2)}|${this.canvas.width}`;
    if (key === this.last) return;
    this.last = key;
    const c = this.ctx;
    const W = this.canvas.width;
    const H = this.canvas.height;
    c.clearRect(0, 0, W, H);
    c.imageSmoothingQuality = "high";
    c.globalAlpha = 1;
    c.drawImage(a, 0, 0, W, H);
    // Fundido con el siguiente cuadro: giro continuo aunque haya pocos cuadros.
    const b = t > 0.02 ? this.frames[Math.min(i0 + 1, n - 1)] : null;
    if (b) {
      c.globalAlpha = t;
      c.drawImage(b, 0, 0, W, H);
      c.globalAlpha = 1;
    }
  }

  resize() {
    this.dpr = Math.min(window.devicePixelRatio || 1, 2);
    this.canvas.height = 0; // se ajusta al tamaño de la fresa en el siguiente cuadro
    this.last = "";
  }

  dispose() {
    this.layer.replaceChildren();
  }
}
