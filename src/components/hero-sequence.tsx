"use client";

/* =============================================================================
   HERO · ARMADO DEL VASO (video cuadro por cuadro, controlado por el scroll)

   Desde el primer movimiento del scroll, el video avanza: caen las fresas,
   se vierte el chocolate, cae el pistache. Si subes, se regresa. La sección se
   queda fija (pin) mientras dura y al final se funde con el hero y su texto.

   Cuadros (sacados del video a 16 por segundo, con el fondo gris reemplazado
   por el café chocolate de la marca):
     /public/images/sequence/001.webp … 136.webp     (escritorio, 720×1280)
     /public/images/sequence/m/001.webp … 136.webp   (celular, 480×853)
   Para cambiar el video: exporta los cuadros con el mismo nombre y ajusta
   SEQ.total.
   ========================================================================== */

import { useRef, type ReactNode } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";

gsap.registerPlugin(ScrollTrigger, useGSAP);

/* ---------- AJUSTES (cambia aquí) ----------------------------------------- */
const SEQ = {
  /** Cuántos cuadros hay en /images/sequence (001.webp … NNN.webp). */
  total: 136,
  /** Cuánto scroll dura el armado, en "pantallas" (1 = alto de la pantalla). */
  scrollLength: { desktop: 4, mobile: 3.5 },
  /** Suavizado del scroll en segundos (1 = fluido; 0 = pegado al dedo). */
  scrub: 1,
  /** Última parte del scroll en la que el vaso se funde con el hero (0–1). */
  revealAtEnd: 0.15,
  /** Cuántos cuadros cargar antes de mostrar (el resto carga en segundo plano). */
  firstBatch: 12,
  /** Carpeta de los cuadros. */
  path: "/images/sequence",
};

/* Color del fondo horneado en los cuadros = chocolate-900 de la página. */
const BG = "30, 17, 9";

const pad = (n: number) => String(n).padStart(3, "0");

export function HeroSequence({ children }: { children: ReactNode }) {
  const root = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useGSAP(
    () => {
      const overlay = root.current?.querySelector<HTMLElement>("[data-seq]");
      const canvas = canvasRef.current;
      if (!overlay || !canvas) return;

      /* Sin animación: se ve directo el hero con el vaso terminado. */
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
        overlay.style.display = "none";
        return;
      }

      const ctx = canvas.getContext("2d", { alpha: false });
      if (!ctx) return;
      const heroLayers = root.current!.querySelectorAll<HTMLElement>("[data-hero-fade]");
      const isMobile = window.innerWidth < 768;
      const dir = isMobile ? `${SEQ.path}/m` : SEQ.path;
      const frames: (HTMLImageElement | null)[] = Array(SEQ.total).fill(null);
      const state = { f: 0 };
      let lastDrawn = -1;
      let cancelled = false;

      gsap.set(heroLayers, { autoAlpha: 0 });

      /* ----- dibujo ----- */
      const resize = () => {
        const dpr = Math.min(window.devicePixelRatio || 1, 2);
        canvas.width = Math.round(canvas.clientWidth * dpr);
        canvas.height = Math.round(canvas.clientHeight * dpr);
        lastDrawn = -1;
        draw();
      };

      const ready = (i: number) => {
        for (let k = i; k >= 0; k--) if (frames[k]) return frames[k]!;
        return null;
      };

      function draw() {
        // 16 cuadros por segundo + fundido entre vecinos = se siente continuo
        const f = Math.min(Math.max(state.f, 0), SEQ.total - 1);
        const key = Math.round(f * 20); // no redibujar si casi no cambió
        if (key === lastDrawn) return;
        lastDrawn = key;
        const i = Math.floor(f);
        const t = f - i;
        const a = ready(i);
        if (!a) return;
        const c = ctx!;
        const s = Math.min(canvas!.width / a.naturalWidth, canvas!.height / a.naturalHeight);
        const w = a.naturalWidth * s;
        const h = a.naturalHeight * s;
        const x = (canvas!.width - w) / 2;
        const y = (canvas!.height - h) / 2;
        c.globalAlpha = 1;
        c.fillStyle = `rgb(${BG})`;
        c.fillRect(0, 0, canvas!.width, canvas!.height);
        c.drawImage(a, x, y, w, h);
        const b = frames[i + 1];
        if (b && t > 0.01) {
          c.globalAlpha = t;
          c.drawImage(b, x, y, w, h);
          c.globalAlpha = 1;
        }
        // orillas izquierda/derecha fundidas con el fondo (en pantallas anchas)
        if (x > 1) {
          const F = w * 0.18;
          for (const [x0, x1] of [
            [x, x + F],
            [x + w, x + w - F],
          ]) {
            const g = c.createLinearGradient(x0, 0, x1, 0);
            g.addColorStop(0, `rgba(${BG}, 1)`);
            g.addColorStop(1, `rgba(${BG}, 0)`);
            c.fillStyle = g;
            c.fillRect(Math.min(x0, x1) - 1, 0, F + 2, canvas!.height);
          }
        }
      }

      /* ----- carga: decode() antes de usar cada cuadro, así no se traba ----- */
      const load = (n: number) => {
        const img = new Image();
        img.src = `${dir}/${pad(n)}.webp`;
        return img
          .decode()
          .then(() => {
            frames[n - 1] = img;
          })
          .catch(() => undefined);
      };

      const first = Math.min(SEQ.firstBatch, SEQ.total);
      Promise.all(Array.from({ length: first }, (_, k) => load(k + 1))).then(async () => {
        if (cancelled) return;
        if (!frames[0]) {
          // sin cuadros no hay animación: se muestra el hero normal
          overlay.style.display = "none";
          gsap.set(heroLayers, { autoAlpha: 1 });
          return;
        }
        resize();
        window.addEventListener("resize", resize);
        gsap.to(canvas, { autoAlpha: 1, duration: 0.5, ease: "power1.out" });

        const tl = gsap.timeline({
          defaults: { ease: "none" },
          scrollTrigger: {
            trigger: root.current,
            start: "top top",
            end: () =>
              "+=" + window.innerHeight * (isMobile ? SEQ.scrollLength.mobile : SEQ.scrollLength.desktop),
            pin: true,
            scrub: SEQ.scrub,
            anticipatePin: 1,
            invalidateOnRefresh: true,
          },
        });
        tl.to(state, { f: SEQ.total - 1, duration: 1 - SEQ.revealAtEnd, onUpdate: draw })
          .to(overlay, { autoAlpha: 0, duration: SEQ.revealAtEnd })
          .to(heroLayers, { autoAlpha: 1, duration: SEQ.revealAtEnd }, "<");
        ScrollTrigger.refresh();

        // el resto, en orden y en tandas pequeñas para no saturar el celular
        for (let n = first + 1; n <= SEQ.total && !cancelled; n += 6) {
          await Promise.all(
            Array.from({ length: Math.min(6, SEQ.total - n + 1) }, (_, k) => load(n + k))
          );
          lastDrawn = -1;
          draw();
        }
      });

      return () => {
        cancelled = true;
        window.removeEventListener("resize", resize);
      };
    },
    { scope: root }
  );

  return (
    <div ref={root} className="relative">
      {children}

      <div
        data-seq
        aria-hidden="true"
        className="seq pointer-events-none absolute inset-x-0 top-0 z-30 h-svh overflow-hidden"
        style={{ backgroundColor: `rgb(${BG})` }}
      >
        <canvas ref={canvasRef} className="absolute inset-0 h-full w-full opacity-0" />
      </div>
    </div>
  );
}
