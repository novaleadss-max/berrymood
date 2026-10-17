/* =============================================================================
   SECUENCIA DEL ARMADO (capítulos 2–4)

   Los 160 cuadros del video se dibujan en un canvas según el scroll: avanzan y
   retroceden con el dedo. Computadora usa cuadros 16:9; celular, un recorte
   vertical del mismo video. Los cuadros ya traen el café del fondo, así que el
   canvas se rellena con ese color y nunca se nota dónde termina el video.
   ========================================================================== */

import { ARMADO, COLOR, SECUENCIA } from "./config";

const pad = (n: number) => String(n).padStart(3, "0");

export class FrameSequence {
  private frames: (HTMLImageElement | null)[];
  private ctx: CanvasRenderingContext2D;
  private cfg: (typeof SECUENCIA)["escritorio"];
  private current = -1;
  private wanted = 0;
  /** 0…1: tono del chocolate que se suma encima (capítulo 3). */
  tone = 0;
  private lastTone = -1;
  /** Altura del vaso en pantalla (0 arriba, 0.5 centro). En celular sube para dejar espacio al texto. */
  private anchor: number;

  constructor(
    private canvas: HTMLCanvasElement,
    mobile: boolean,
  ) {
    this.cfg = mobile ? SECUENCIA.movil : SECUENCIA.escritorio;
    this.anchor = mobile ? 0.22 : 0.5;
    this.frames = Array(ARMADO.cuadros.total).fill(null);
    this.ctx = canvas.getContext("2d", { alpha: false })!;
    this.resize();
  }

  private load(i: number) {
    return new Promise<void>((resolve) => {
      const img = new Image();
      img.decoding = "async";
      img.src = `${this.cfg.ruta}/${pad(i + 1)}.webp`;
      const done = () => {
        this.frames[i] = img;
        if (i === this.wanted || this.current === -1) this.draw(this.wanted, true);
        resolve();
      };
      img.decode().then(done, () => {
        img.onload = done;
        img.onerror = () => resolve();
      });
    });
  }

  /** Carga los primeros cuadros (para el preloader) y devuelve una promesa. */
  async loadFirst(onProgress?: (p: number) => void) {
    const n = SECUENCIA.primeros;
    let done = 0;
    // El último cuadro también (vaso terminado), por si alguien salta al final.
    const first = [...Array(n).keys(), ARMADO.cuadros.total - 1];
    await Promise.all(
      first.map((i) =>
        this.load(i).then(() => {
          done++;
          onProgress?.(done / first.length);
        }),
      ),
    );
  }

  /** El resto en segundo plano, de 6 en 6 para no saturar la red del celular. */
  async loadRest() {
    const queue = [...Array(ARMADO.cuadros.total).keys()].filter((i) => !this.frames[i]);
    const worker = async () => {
      while (queue.length) await this.load(queue.shift()!);
    };
    await Promise.all(Array.from({ length: 6 }, worker));
  }

  resize() {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const w = this.canvas.clientWidth || window.innerWidth;
    const h = this.canvas.clientHeight || window.innerHeight;
    this.canvas.width = Math.round(w * dpr);
    this.canvas.height = Math.round(h * dpr);
    this.ctx.imageSmoothingQuality = "high";
    this.current = -1;
    this.draw(this.wanted, true);
  }

  /** Dibuja el cuadro i (0…159). Si aún no carga, usa el más cercano anterior. */
  draw(i: number, force = false) {
    this.wanted = i;
    let k = i;
    while (k > 0 && !this.frames[k]) k--;
    const img = this.frames[k];
    if (!force && k === this.current && this.tone === this.lastTone) return;
    const { width: W, height: H } = this.canvas;
    const ctx = this.ctx;
    ctx.globalCompositeOperation = "source-over";
    ctx.fillStyle = COLOR.fondo;
    ctx.fillRect(0, 0, W, H);
    if (img) {
      // "contain": el vaso siempre completo, centrado, sin cortarse.
      const s = Math.min(W / this.cfg.ancho, H / this.cfg.alto);
      const dw = this.cfg.ancho * s;
      const dh = this.cfg.alto * s;
      ctx.drawImage(img, (W - dw) / 2, (H - dh) * this.anchor, dw, dh);
    }
    if (this.tone > 0.001) {
      // Capítulo 3: el fondo se calienta hacia chocolate con leche.
      ctx.globalCompositeOperation = "soft-light";
      ctx.fillStyle = `rgba(150, 82, 40, ${this.tone * 0.85})`;
      ctx.fillRect(0, 0, W, H);
      ctx.globalCompositeOperation = "source-over";
    }
    this.current = k;
    this.lastTone = this.tone;
  }

}
