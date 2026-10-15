"use client";

/* =============================================================================
   HERO · ARMADO DEL VASO CON EL SCROLL

   El video del armado avanza con el scroll: caen las fresas, se vierte el
   chocolate, cae el pistache. Si subes, se regresa. La sección se queda fija
   mientras dura y al final se funde con el hero de siempre.

   Cuadros sacados de los videos originales, sin recortes ni fondos falsos:
     /public/images/armado/d/001.webp … 160.webp   computadora (1280×720)
     /public/images/armado/m/001.webp … 144.webp   celular (720×1280)
   Para cambiar el video: exporta los cuadros a 16 por segundo con el mismo
   nombre y ajusta SEQ.total.
   prefers-reduced-motion: no se anima; se ve directo el hero.
   ========================================================================== */

import { useRef, type ReactNode } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";

gsap.registerPlugin(ScrollTrigger, useGSAP);

/* ---------- AJUSTES (cambia aquí) ----------------------------------------- */
const SEQ = {
  desktop: { path: "/images/armado/d", total: 160, bg: "#150f0b", scrollLength: 3 },
  mobile: { path: "/images/armado/m", total: 144, bg: "#4b4a4c", scrollLength: 3 },
  /** Suavizado del scroll en segundos (1 = fluido; 0 = pegado al dedo). */
  scrub: 0.8,
  /** Última parte del scroll en la que el video se funde con el hero (0–1). */
  revealAtEnd: 0.14,
  /** Cuántos cuadros cargar antes de empezar (el resto carga en segundo plano). */
  firstBatch: 16,
};

const pad = (n: number) => String(n).padStart(3, "0");

export function HeroSequence({ children }: { children: ReactNode }) {
  const root = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useGSAP(
    () => {
      const overlay = root.current?.querySelector<HTMLElement>("[data-seq]");
      const canvas = canvasRef.current;
      if (!overlay || !canvas) return;

      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
        overlay.style.display = "none";
        return;
      }

      const ctx = canvas.getContext("2d", { alpha: false });
      if (!ctx) return;
      const heroLayers = root.current!.querySelectorAll<HTMLElement>("[data-hero-fade]");
      const isMobile = window.innerWidth < 768;
      const cfg = isMobile ? SEQ.mobile : SEQ.desktop;
      overlay.style.backgroundColor = cfg.bg;
      const frames: (HTMLImageElement | null)[] = Array(cfg.total).fill(null);
      const state = { f: 0 };
      let lastDrawn = -1;
      let cancelled = false;

      gsap.set(heroLayers, { autoAlpha: 0 });

      const resize = () => {
        const dpr = Math.min(window.devicePixelRatio || 1, 2);
        canvas.width = Math.round(canvas.clientWidth * dpr);
        canvas.height = Math.round(canvas.clientHeight * dpr);
        ctx.imageSmoothingQuality = "high";
        lastDrawn = -1;
        draw();
      };

      const ready = (i: number) => {
        for (let k = i; k >= 0; k--) if (frames[k]) return frames[k]!;
        return null;
      };

      // Llena la pantalla como el video (object-fit: cover) y funde cada cuadro
      // con el siguiente, para que el movimiento se sienta continuo.
      function draw() {
        const f = Math.min(Math.max(state.f, 0), cfg.total - 1);
        const key = Math.round(f * 20);
        if (key === lastDrawn) return;
        lastDrawn = key;
        const i = Math.floor(f);
        const t = f - i;
        const a = ready(i);
        if (!a) return;
        const c = ctx!;
        const s = Math.max(canvas!.width / a.naturalWidth, canvas!.height / a.naturalHeight);
        const w = a.naturalWidth * s;
        const h = a.naturalHeight * s;
        const x = (canvas!.width - w) / 2;
        const y = (canvas!.height - h) / 2;
        c.globalAlpha = 1;
        c.drawImage(a, x, y, w, h);
        const b = frames[i + 1];
        if (b && t > 0.01) {
          c.globalAlpha = t;
          c.drawImage(b, x, y, w, h);
          c.globalAlpha = 1;
        }
      }

      // decode() antes de usar cada cuadro, así no se traba al dibujar
      const load = (n: number) => {
        const img = new Image();
        img.src = `${cfg.path}/${pad(n)}.webp`;
        return img
          .decode()
          .then(() => {
            frames[n - 1] = img;
          })
          .catch(() => undefined);
      };

      const first = Math.min(SEQ.firstBatch, cfg.total);
      Promise.all(Array.from({ length: first }, (_, k) => load(k + 1))).then(async () => {
        if (cancelled) return;
        if (!frames[0]) {
          overlay.style.display = "none";
          gsap.set(heroLayers, { autoAlpha: 1 });
          return;
        }
        resize();
        window.addEventListener("resize", resize);
        gsap.to(canvas, { autoAlpha: 1, duration: 0.4, ease: "power1.out" });

        const tl = gsap.timeline({
          defaults: { ease: "none" },
          scrollTrigger: {
            trigger: root.current,
            start: "top top",
            end: () => "+=" + window.innerHeight * cfg.scrollLength,
            pin: true,
            scrub: SEQ.scrub,
            anticipatePin: 1,
            invalidateOnRefresh: true,
          },
        });
        tl.to(state, { f: cfg.total - 1, duration: 1 - SEQ.revealAtEnd, onUpdate: draw })
          .to(overlay, { autoAlpha: 0, duration: SEQ.revealAtEnd })
          .to(heroLayers, { autoAlpha: 1, duration: SEQ.revealAtEnd }, "<");
        ScrollTrigger.refresh();

        // el resto, en orden y en tandas pequeñas para no saturar el celular
        for (let n = first + 1; n <= cfg.total && !cancelled; n += 8) {
          await Promise.all(
            Array.from({ length: Math.min(8, cfg.total - n + 1) }, (_, k) => load(n + k))
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
        className="seq pointer-events-none absolute inset-x-0 top-0 z-30 h-svh overflow-hidden bg-[#4b4a4c] bg-[url(/images/armado/m/001.webp)] bg-cover bg-center md:bg-[#150f0b] md:bg-[url(/images/armado/d/001.webp)]"
      >
        <canvas ref={canvasRef} className="absolute inset-0 h-full w-full opacity-0" />
      </div>
    </div>
  );
}
