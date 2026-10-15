"use client";

/* =============================================================================
   HERO · SECUENCIA DE FOTOS (armado del vaso BerryMood)

   Fase 1 (automática al entrar): pantalla oscura → precarga → la fresa cae y
   entra al vaso (primeros cuadros) con fundidos suaves. El scroll queda
   bloqueado mientras dura.
   Fase 2 (con el dedo / mouse): el scroll controla el resto de los cuadros
   (más fresas, chocolate, pistache). Si subes, se regresa. La sección se queda
   fija (pin) y al final la foto se funde con el hero y su texto.

   Cuadros: sacados del video (12 por segundo) →
             /public/images/sequence/001.webp … 108.webp (escritorio, 720×1280)
             /public/images/sequence/m/001.webp … 108.webp (celular, 480×853)
   Para cambiar el video: exporta los cuadros con el mismo nombre y ajusta SEQ.total.
   ========================================================================== */

import { useRef, type ReactNode } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";

gsap.registerPlugin(ScrollTrigger, useGSAP);

/* ---------- AJUSTES (cambia aquí) ----------------------------------------- */
const SEQ = {
  /** Cuántos cuadros hay en /images/sequence (001.webp … NNN.webp). */
  total: 108,
  /** Cuántos se reproducen solos al entrar (fase 1): la fresa cae dentro del vaso. */
  autoFrames: 22,
  /** Duración de la fase 1, en segundos. */
  autoDuration: 2,
  /** "crossfade" = fundido entre cuadros · "cut" = cambio directo. */
  transition: "crossfade" as "crossfade" | "cut",
  /** Qué parte de cada cuadro dura el fundido (0–1). Con video, 1 = continuo. */
  crossfade: 1,
  /** Cuánto scroll dura la fase 2, en "pantallas" (1 = alto de la pantalla). */
  scrollLength: { desktop: 3.5, mobile: 3 },
  /** Suavizado del scroll (1 = fluido; 0 = pegado al dedo). */
  scrub: 1,
  /** Última parte del scroll en la que la foto se funde con el hero (0–1). */
  revealAtEnd: 0.2,
  /** Carpeta de las imágenes. */
  path: "/images/sequence",
};

const pad = (n: number) => String(n).padStart(3, "0");
const clamp01 = (v: number) => Math.min(1, Math.max(0, v));
const smooth = (t: number) => t * t * (3 - 2 * t);

export function HeroSequence({ children }: { children: ReactNode }) {
  const root = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useGSAP(
    () => {
      const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      const overlay = root.current?.querySelector<HTMLElement>("[data-seq]");
      const loader = root.current?.querySelector<HTMLElement>("[data-seq-loader]");
      const bar = root.current?.querySelector<HTMLElement>("[data-seq-bar]");
      const canvas = canvasRef.current;
      if (!overlay || !canvas || !loader || !bar) return;

      /* Sin animación: se ve directo el vaso terminado del hero. */
      if (reduce) {
        overlay.style.display = "none";
        return;
      }

      const ctx = canvas.getContext("2d");
      if (!ctx) return;
      const heroLayers = root.current!.querySelectorAll<HTMLElement>("[data-hero-fade]");
      const isMobile = window.innerWidth < 768;
      const dir = isMobile ? `${SEQ.path}/m` : SEQ.path;
      const frames: HTMLImageElement[] = [];
      const state = { f: 0 }; // cuadro actual (con decimales para el fundido)
      let cancelled = false;

      gsap.set(heroLayers, { autoAlpha: 0 });

      /* ----- bloqueo de scroll durante la fase 1 ----- */
      const block = (e: Event) => e.preventDefault();
      const lock = () => {
        document.documentElement.style.overflow = "hidden";
        window.addEventListener("wheel", block, { passive: false });
        window.addEventListener("touchmove", block, { passive: false });
      };
      const unlock = () => {
        document.documentElement.style.overflow = "";
        window.removeEventListener("wheel", block);
        window.removeEventListener("touchmove", block);
      };
      const skipIntro = Boolean(window.location.hash) || window.scrollY > 10;
      if (!skipIntro) lock();
      const safety = window.setTimeout(unlock, (SEQ.autoDuration + 6) * 1000); // nunca dejarlo trabado

      /* ----- canvas: tamaño nítido y dibujo con "contain" ----- */
      const resize = () => {
        const dpr = Math.min(window.devicePixelRatio || 1, 2);
        canvas.width = Math.round(canvas.clientWidth * dpr);
        canvas.height = Math.round(canvas.clientHeight * dpr);
        draw();
      };
      const paint = (img: HTMLImageElement, alpha: number) => {
        if (!img?.complete || alpha <= 0) return;
        const s = Math.min(canvas.width / img.naturalWidth, canvas.height / img.naturalHeight);
        const w = img.naturalWidth * s;
        const h = img.naturalHeight * s;
        ctx.globalAlpha = alpha;
        ctx.drawImage(img, (canvas.width - w) / 2, (canvas.height - h) / 2, w, h);
      };
      function draw() {
        ctx!.globalAlpha = 1;
        ctx!.clearRect(0, 0, canvas!.width, canvas!.height);
        const last = frames.length - 1;
        const f = Math.min(Math.max(state.f, 0), last);
        const i = Math.floor(f);
        const t = f - i;
        const mix =
          SEQ.transition === "cut" ? (t >= 0.5 ? 1 : 0) : smooth(clamp01((t - (1 - SEQ.crossfade)) / SEQ.crossfade));
        const base = nearestLoaded(i);
        if (!base) return;
        paint(base, 1);
        if (i < last && frames[i + 1]?.complete && frames[i + 1].naturalWidth) paint(frames[i + 1], mix);
        feather(base);
      }

      /* Si un cuadro aún no carga (scroll muy rápido), usa el anterior más cercano. */
      function nearestLoaded(i: number) {
        for (let k = i; k >= 0; k--) if (frames[k]?.complete && frames[k].naturalWidth) return frames[k];
        return null;
      }

      /* Bordes de la foto fundidos con el chocolate oscuro de la página, para que
         no se vea un rectángulo pegado sino parte del sitio. */
      const BG = "23, 12, 6"; // = chocolate-950
      function feather(img: HTMLImageElement) {
        if (!img?.complete) return;
        const c = ctx!;
        const s = Math.min(canvas!.width / img.naturalWidth, canvas!.height / img.naturalHeight);
        const w = img.naturalWidth * s;
        const h = img.naturalHeight * s;
        const x = (canvas!.width - w) / 2;
        const y = (canvas!.height - h) / 2;
        const F = Math.min(w, h) * 0.16;
        c.globalAlpha = 1;
        const edge = (x0: number, y0: number, x1: number, y1: number, rx: number, ry: number, rw: number, rh: number) => {
          const g = c.createLinearGradient(x0, y0, x1, y1);
          g.addColorStop(0, `rgba(${BG}, 1)`);
          g.addColorStop(1, `rgba(${BG}, 0)`);
          c.fillStyle = g;
          c.fillRect(rx, ry, rw, rh);
        };
        edge(x, 0, x + F, 0, x - 1, y - 1, F + 1, h + 2); // izquierda
        edge(x + w, 0, x + w - F, 0, x + w - F, y - 1, F + 1, h + 2); // derecha
        edge(0, y, 0, y + F, x - 1, y - 1, w + 2, F + 1); // arriba
        edge(0, y + h, 0, y + h - F, x - 1, y + h - F, w + 2, F + 1); // abajo
        // viñeta suave para dar profundidad
        const v = c.createRadialGradient(x + w / 2, y + h / 2, Math.min(w, h) * 0.42, x + w / 2, y + h / 2, Math.max(w, h) * 0.72);
        v.addColorStop(0, `rgba(${BG}, 0)`);
        v.addColorStop(1, `rgba(${BG}, 0.45)`);
        c.fillStyle = v;
        c.fillRect(x, y, w, h);
      }

      /* ----- precarga de todas las imágenes ----- */
      let loaded = 0;
      const load = (n: number) =>
        new Promise<void>((resolve, reject) => {
          const img = new Image();
          img.decoding = "async";
          img.onload = () => {
            loaded++;
            bar.style.transform = `scaleX(${Math.min(1, loaded / Math.min(SEQ.total, SEQ.autoFrames + 6))})`;
            resolve();
          };
          img.onerror = () => reject(new Error(`No cargó ${dir}/${pad(n)}.webp`));
          img.src = `${dir}/${pad(n)}.webp`;
          frames[n - 1] = img;
        });

      // Primero los cuadros de la intro (arranca rápido, sobre todo en celular);
      // el resto se carga en segundo plano mientras se ve la fase 1.
      const first = Math.min(SEQ.total, SEQ.autoFrames + 6);
      const rest = () =>
        Promise.all(Array.from({ length: SEQ.total - first }, (_, k) => load(first + k + 1).catch(() => undefined)));
      Promise.all(Array.from({ length: first }, (_, k) => load(k + 1)))
        .then(() => {
          void rest();
          if (cancelled) return;
          resize();
          window.addEventListener("resize", resize);
          gsap.to(loader, { autoAlpha: 0, duration: 0.3 });

          const auto = Math.max(1, Math.min(SEQ.autoFrames, SEQ.total));

          /* ===== FASE 1: automática ===== */
          const intro = gsap.timeline({
            paused: skipIntro,
            onComplete: startScroll,
          });
          intro
            .fromTo(canvas, { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.7, ease: "power1.out" })
            .to(state, { f: auto - 1, duration: SEQ.autoDuration, ease: "none", onUpdate: draw }, 0.3);

          if (skipIntro) {
            state.f = auto - 1;
            gsap.set(canvas, { autoAlpha: 1 });
            draw();
            startScroll();
          }

          /* ===== FASE 2: el scroll controla el resto ===== */
          function startScroll() {
            window.clearTimeout(safety);
            unlock();
            const vh = () =>
              window.innerHeight * (isMobile ? SEQ.scrollLength.mobile : SEQ.scrollLength.desktop);
            const tl = gsap.timeline({
              defaults: { ease: "none" },
              scrollTrigger: {
                trigger: root.current,
                start: "top top",
                end: () => "+=" + vh(),
                pin: true,
                scrub: SEQ.scrub,
                anticipatePin: 1,
                invalidateOnRefresh: true,
              },
            });
            const seqPart = 1 - SEQ.revealAtEnd;
            tl.fromTo(state, { f: auto - 1 }, { f: SEQ.total - 1, duration: seqPart, onUpdate: draw })
              .to(overlay!, { autoAlpha: 0, duration: SEQ.revealAtEnd })
              .to(heroLayers, { autoAlpha: 1, duration: SEQ.revealAtEnd }, "<");
            ScrollTrigger.refresh();
          }
        })
        .catch(() => {
          // si algo falla, no bloquear la página: se muestra el hero normal
          window.clearTimeout(safety);
          unlock();
          overlay.style.display = "none";
          gsap.set(heroLayers, { autoAlpha: 1 });
        });

      return () => {
        cancelled = true;
        window.clearTimeout(safety);
        unlock();
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
        className="seq pointer-events-none absolute inset-x-0 top-0 z-30 h-svh overflow-hidden bg-chocolate-950"
      >
        <canvas ref={canvasRef} className="absolute inset-0 h-full w-full opacity-0" />

        {/* Carga: línea dorada fina, discreta */}
        <div data-seq-loader className="absolute top-1/2 left-1/2 h-px w-24 -translate-x-1/2 bg-gold/15">
          <div data-seq-bar className="h-full w-full origin-left scale-x-0 bg-gold" />
        </div>
      </div>
    </div>
  );
}
