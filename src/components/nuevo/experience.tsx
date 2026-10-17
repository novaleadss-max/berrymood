"use client";

/* =============================================================================
   BERRYMOOD · EXPERIENCIA (director de orquesta)

   Orden de arranque:
     1. Preloader: carga fuentes, los primeros cuadros del vaso y la fresa 3D.
     2. Lenis (scroll suave) conectado a ScrollTrigger.
     3. Capítulos, de arriba a abajo (el orden importa para los pins).
     4. El chocolate que cubre el preloader escurre hacia abajo y empieza el inicio.

   Con prefers-reduced-motion: sin Lenis, sin pins ni scrub. Cada capítulo es una
   sección normal; quedan solo fundidos suaves.
   Los valores ajustables están en ./config.ts.
   ========================================================================== */

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "gsap/SplitText";
import Lenis from "lenis";
import "lenis/dist/lenis.css";

import {
  ARMADO,
  CAPITULO_1_SCROLL,
  CAPITULO_1_SCROLL_MOVIL,
  CAPITULO_5_FACTOR,
  CAPITULO_6_SCROLL,
  CAPITULO_6_SCROLL_MOVIL,
  CAPITULO_7_SCROLL,
  CAPITULO_7_SCROLL_MOVIL,
  CAPITULOS_2_4_SCROLL,
  CAPITULOS_2_4_SCROLL_MOVIL,
  GALERIA,
  SORPRESAS,
  TIEMPO,
} from "./config";
import { Drip } from "./drip";
import { createGallery } from "./gallery";
import {
  createChocolateTrail,
  createCursor,
  createMagnetic,
  createMarquees,
  createTilt,
  finePointer,
} from "./interactions";
import { Armado, Chrome, Footer, Galeria, Hero, Historia, Marquee, Menu, Pidelo } from "./markup";
import { FrameSequence } from "./sequence";
import type { BerrySprite } from "./sprite";
import type { BerryScene } from "./strawberry";

gsap.registerPlugin(ScrollTrigger, SplitText);

type Pose = { x: number; y: number; s: number; spin: number; tilt: number; opacity: number };
type Key = { at: number; p: Pose; linear?: boolean };

const wait = (ms: number) => new Promise((r) => setTimeout(r, ms));

/** ¿Hay aceleración 3D real? (Sin GPU el 3D se dibuja por software y satura el procesador.) */
function hasGpu() {
  if ((window as { __BM_FORCE_GPU?: boolean }).__BM_FORCE_GPU) return true;
  try {
    const c = document.createElement("canvas");
    const gl = c.getContext("webgl2") ?? c.getContext("webgl");
    if (!gl) return false;
    const ext = gl.getExtension("WEBGL_debug_renderer_info");
    const name = ext ? String(gl.getParameter(ext.UNMASKED_RENDERER_WEBGL)) : "";
    gl.getExtension("WEBGL_lose_context")?.loseContext();
    return !/swiftshader|llvmpipe|software|basic render/i.test(name);
  } catch {
    return false;
  }
}
const smooth = (t: number) => t * t * (3 - 2 * t);

export function Experience() {
  const root = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = root.current!;
    const q = <T extends Element = HTMLElement>(s: string) => el.querySelector<T>(s)!;
    const qa = <T extends Element = HTMLElement>(s: string) => Array.from(el.querySelectorAll<T>(s));

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const mobile = window.matchMedia("(max-width: 767px)").matches;
    el.classList.toggle("bm--reduced", reduced);
    el.classList.toggle("bm--motion", !reduced);
    document.documentElement.classList.add("bm-page", "bm-lock");

    let disposed = false;
    const cleanups: (() => void)[] = [];
    const ctx = gsap.context(() => {}, el);
    let lenis: Lenis | null = null;
    let berry: BerryScene | BerrySprite | null = null;

    /* ---------- 1. Preloader --------------------------------------------- */
    const liquid = q(".bm-pre-liquid");
    const counter = q(".bm-pre-count span");
    const shown = { p: 0 };
    const parts = { frames: 0, fonts: 0, three: 0 };
    const paint = () => {
      gsap.set(liquid, { yPercent: 100 - shown.p * 100 });
      counter.textContent = String(Math.round(shown.p * 100));
    };
    const report = () => {
      const target = parts.frames * 0.6 + parts.fonts * 0.15 + parts.three * 0.25;
      gsap.to(shown, { p: target, duration: 0.6, ease: "power2.out", overwrite: true, onUpdate: paint });
    };
    paint();

    const seq = new FrameSequence(q<HTMLCanvasElement>(".bm-seq"), mobile);

    const boot = async () => {
      await Promise.all([
        reduced
          ? Promise.resolve().then(() => {
              parts.frames = 1;
              report();
            })
          : seq.loadFirst((p) => {
              parts.frames = p;
              report();
            }),
        document.fonts.ready.then(() => {
          parts.fonts = 1;
          report();
        }),
        (hasGpu()
          ? import("./strawberry").then((m) => {
              if (disposed) return;
              try {
                berry = new m.BerryScene(q<HTMLCanvasElement>(".bm-berry"), { mobile, reduced });
              } catch {
                berry = null;
              }
            })
          : Promise.resolve()
        )
          .then(async () => {
            if (berry || disposed) return;
            // Sin GPU: la misma fresa como imagen ligera (no se descarga Three.js).
            const m = await import("./sprite");
            berry = new m.BerrySprite(q(".bm-berry-sprite"), reduced);
          })
          .finally(() => {
            parts.three = 1;
            report();
          }),
        wait(TIEMPO.preloaderMinimo * 1000),
      ]);
      if (disposed) return;
      await new Promise<void>((r) =>
        gsap.to(shown, { p: 1, duration: 0.35, ease: "power2.out", overwrite: true, onUpdate: paint, onComplete: r }),
      );
      if (disposed) return;
      if (!reduced) seq.loadRest();
      ctx.add(() => setup());
    };
    boot();

    /* ---------- 2… Todo lo demás ----------------------------------------- */
    async function setup() {
      const vh = () => window.innerHeight;
      const vw = () => window.innerWidth;
      ScrollTrigger.config({ ignoreMobileResize: true });

      // Lenis ↔ ScrollTrigger
      if (!reduced) {
        lenis = new Lenis({ lerp: 0.085, smoothWheel: true });
        lenis.on("scroll", ScrollTrigger.update);
        const raf = (t: number) => lenis?.raf(t * 1000);
        gsap.ticker.add(raf);
        gsap.ticker.lagSmoothing(0);
        cleanups.push(() => {
          gsap.ticker.remove(raf);
          lenis?.destroy();
        });
      }

      drip = new Drip(q(".bm-drip"), mobile);
      header = q(".bm-header");

      /* ---- Capítulo 1 · La fresa ---------------------------------------- */
      const hero = q("#la-fresa");
      // Se divide el h1 (no los span) para que el aria-label quede en el encabezado.
      heroSplit = SplitText.create("#bm-hero-title", { type: "words,chars", charsClass: "bm-char" });
      const l1 = q(".bm-hero-l1");
      const l2 = q(".bm-hero-l2");
      heroST = ScrollTrigger.create({
        trigger: hero,
        start: "top top",
        end: reduced ? "bottom top" : mobile ? CAPITULO_1_SCROLL_MOVIL : CAPITULO_1_SCROLL,
        pin: !reduced,
      });
      if (!reduced) {
        gsap
          .timeline({ scrollTrigger: { trigger: hero, start: "top top", end: () => heroST.end, scrub: 0.7 } })
          .to(l1, { yPercent: -70, rotationX: 55, autoAlpha: 0, ease: "power2.inOut" }, 0)
          .to(l2, { yPercent: 60, rotationX: -55, autoAlpha: 0, ease: "power2.inOut" }, 0.06)
          .to([".bm-hero-sub", ".bm-hero-hint"], { y: -30, autoAlpha: 0, ease: "power2.out", duration: 0.4 }, 0);
      }

      // Seguir al mouse (o al giroscopio en Android): fresa + título en capas.
      const lx = gsap.quickTo(l1, "x", { duration: 1.2, ease: "power3.out" });
      const l2x = gsap.quickTo(l2, "x", { duration: 1.2, ease: "power3.out" });
      const setPointer = (nx: number, ny: number) => {
        berry?.setPointer(nx, ny);
        if (!reduced) {
          lx(-nx * vw() * 0.012);
          l2x(nx * vw() * 0.018);
        }
      };
      const onMove = (e: PointerEvent) => {
        if (e.pointerType !== "mouse") return;
        setPointer((e.clientX / vw()) * 2 - 1, -((e.clientY / vh()) * 2 - 1));
      };
      const onTilt = (e: DeviceOrientationEvent) => {
        if (e.gamma == null || e.beta == null) return;
        setPointer(gsap.utils.clamp(-1, 1, e.gamma / 30), gsap.utils.clamp(-1, 1, (45 - e.beta) / 30));
      };
      if (!reduced) {
        window.addEventListener("pointermove", onMove, { passive: true });
        if (!finePointer()) window.addEventListener("deviceorientation", onTilt);
        cleanups.push(() => {
          window.removeEventListener("pointermove", onMove);
          window.removeEventListener("deviceorientation", onTilt);
        });
      }

      /* ---- Capítulos 2–4 · El vaso, el chocolate, el toque final -------- */
      armado = q("#armado");
      const stage = q(".bm-armado-stage");
      const seqCanvas = q(".bm-seq");
      armST = null;
      if (!reduced) {
        const A = ARMADO;
        const frame = { f: 0 };
        const drawF = () => seq.draw(Math.round(frame.f));
        const dur = (r: number[]) => r[1] - r[0];
        const tl = gsap.timeline({
          defaults: { ease: "none" },
          scrollTrigger: {
            trigger: armado,
            start: "top top",
            end: mobile ? CAPITULOS_2_4_SCROLL_MOVIL : CAPITULOS_2_4_SCROLL,
            pin: true,
            scrub: A.scrub,
          },
        });
        armST = tl.scrollTrigger!;
        tl.set({}, {}, 1); // el tramo mide exactamente 1

        // Entrada: máscara circular desde donde cayó la fresa.
        tl.fromTo(
          stage,
          { clipPath: "circle(0% at 50% 62%)" },
          { clipPath: "circle(80% at 50% 50%)", duration: dur(A.mascara), ease: "power2.inOut" },
          A.mascara[0],
        );
        tl.to(frame, { f: A.cuadros.fresas - 1, duration: dur(A.fresas), onUpdate: drawF }, A.fresas[0]);
        tl.to(frame, { f: A.cuadros.chocolate - 1, duration: dur(A.chocolate), onUpdate: drawF }, A.chocolate[0]);
        tl.to(frame, { f: A.cuadros.total - 1, duration: dur(A.pistache), onUpdate: drawF }, A.pistache[0]);
        // El fondo se calienta mientras cae el chocolate y se relaja con el pistache.
        tl.to(seq, { tone: 1, duration: dur(A.chocolate) * 0.8, onUpdate: drawF, ease: "sine.inOut" }, A.chocolate[0]);
        tl.to(seq, { tone: 0.3, duration: dur(A.pistache) * 0.8, onUpdate: drawF, ease: "sine.inOut" }, A.pistache[0]);

        // Capítulo 2: líneas que suben dentro de una máscara.
        const t2 = SplitText.create(".bm-step--2 .bm-step-title", { type: "lines", mask: "lines" });
        tl.from(t2.lines, { yPercent: 110, duration: 0.06, stagger: 0.015, ease: "expo.out" }, 0.07)
          .from(".bm-step--2 .bm-step-text", { autoAlpha: 0, y: 24, duration: 0.05, ease: "power3.out" }, 0.1)
          .to([t2.lines, ".bm-step--2 .bm-step-text"], { yPercent: -110, autoAlpha: 0, duration: 0.05, ease: "power2.inOut" }, A.fresas[1] - 0.04);

        // Capítulo 3: palabras que llegan desde el fondo (profundidad 3D), en sincronía con el chorro.
        const t3 = SplitText.create(".bm-step--3 .bm-step-title", { type: "words" });
        tl.from(t3.words, { z: -600, autoAlpha: 0, duration: 0.08, stagger: 0.02, ease: "expo.out" }, A.chocolate[0] + 0.03)
          .from(".bm-step--3 .bm-step-text", { autoAlpha: 0, y: 24, duration: 0.05, ease: "power3.out" }, A.chocolate[0] + 0.07)
          .to([".bm-step--3"], { autoAlpha: 0, y: -40, duration: 0.05, ease: "power2.inOut" }, A.chocolate[1] - 0.04);

        // Capítulo 4: letras que giran como cartas, con la caída del pistache.
        const t4 = SplitText.create(".bm-step--4 .bm-step-title", { type: "chars", charsClass: "bm-char" });
        tl.from(t4.chars, { rotationY: -100, autoAlpha: 0, transformOrigin: "0% 50%", duration: 0.06, stagger: 0.004, ease: "expo.out" }, A.pistache[0] + 0.02)
          .from(".bm-step--4 .bm-step-text", { autoAlpha: 0, y: 24, duration: 0.05, ease: "power3.out" }, A.pistache[0] + 0.06)
          .to(".bm-step--4", { autoAlpha: 0, y: -40, duration: 0.04, ease: "power2.inOut" }, A.zoom[0]);

        // Pausa, zoom al vaso y el nombre de la marca que se junta letra por letra.
        const brand = SplitText.create(".bm-brand-name", { type: "chars", charsClass: "bm-char" });
        const mid = (brand.chars.length - 1) / 2;
        tl.to(seqCanvas, { scale: mobile ? 1.06 : 1.1, xPercent: mobile ? 0 : 25, duration: dur(A.zoom) * 0.9, ease: "power2.inOut" }, A.zoom[0] + 0.01)
          .from(brand.chars, { x: (i: number) => (i - mid) * (mobile ? 18 : 46), autoAlpha: 0, duration: dur(A.zoom) * 0.7, ease: "expo.out" }, A.zoom[0] + 0.03)
          .from(".bm-brand-slogan", { autoAlpha: 0, y: 20, duration: dur(A.zoom) * 0.4, ease: "power3.out" }, A.zoom[0] + 0.08);

        seq.draw(0, true);
      }

      /* ---- Transición: chocolate líquido hacia el menú ------------------ */
      const menu = q("#menu");
      const inOut = gsap.parseEase("power2.inOut");
      if (!reduced) {
        ScrollTrigger.create({
          trigger: menu,
          start: "top bottom",
          end: "top top",
          onUpdate: (self) => {
            const p = self.progress;
            drip.set(inOut(Math.min(1, p / 0.5)), inOut(Math.max(0, (p - 0.5) / 0.5)));
          },
          onLeave: () => drip.set(0, 0),
          onLeaveBack: () => drip.set(0, 0),
        });
      }

      /* ---- Capítulo 5 · Los productos (horizontal fijo) ----------------- */
      const track = q(".bm-menu-track");
      const dist = () => Math.max(0, track.scrollWidth - vw());
      if (!reduced) {
        const tl = gsap.timeline({
          scrollTrigger: {
            trigger: menu,
            start: "top top",
            end: () => `+=${dist() * CAPITULO_5_FACTOR}`,
            pin: ".bm-menu-pin",
            scrub: 0.6,
            invalidateOnRefresh: true,
          },
        });
        tl.to(track, { x: () => -dist(), ease: "none" });
        menuST = tl.scrollTrigger!;
        // Cada tarjeta gira en 3D al entrar y al salir, la foto se desliza adentro.
        qa(".bm-card").forEach((card) => {
          gsap.fromTo(
            card,
            { rotationY: -24, z: -160, autoAlpha: 0.35 },
            {
              rotationY: 0,
              z: 0,
              autoAlpha: 1,
              ease: "none",
              scrollTrigger: { containerAnimation: tl, trigger: card, start: "left right", end: "center 55%", scrub: true },
            },
          );
          gsap.to(card, {
            rotationY: 16,
            z: -120,
            ease: "none",
            immediateRender: false,
            scrollTrigger: { containerAnimation: tl, trigger: card, start: "center 45%", end: "right left", scrub: true },
          });
          const img = card.querySelector(".bm-card-media > *");
          if (img)
            gsap.fromTo(
              img,
              { xPercent: -8 },
              { xPercent: 8, ease: "none", scrollTrigger: { containerAnimation: tl, trigger: card, start: "left right", end: "right left", scrub: true } },
            );
        });
      } else {
        menuST = ScrollTrigger.create({ trigger: menu, start: "top top", end: "bottom top" });
      }

      // Pausa breve: el resto se prepara en otra tarea para no bloquear el hilo principal.
      await new Promise((r) => setTimeout(r, 0));
      if (disposed) return;
      ctx.add(() => setupRest());
    }

    // Variables compartidas entre las dos mitades del arranque.
    let heroST: ScrollTrigger, armST: ScrollTrigger | null, menuST: ScrollTrigger;
    let drip: Drip, header: HTMLElement, heroSplit: SplitText, armado: HTMLElement;

    function setupRest() {
      const vh = () => window.innerHeight;
      const vw = () => window.innerWidth;

      /* ---- Capítulo 6 · La historia (fondo crema, texto que se rellena) --- */
      const story = q("#historia");
      const fillWords = SplitText.create("[data-fill], [data-fill-small]", { type: "words", wordsClass: "bm-word", aria: "none" });
      let storyST: ScrollTrigger;
      if (!reduced) {
        // Cambio de fondo: un domo crema sube y se abre hasta cubrir la pantalla.
        gsap.fromTo(
          ".bm-story-bg",
          { clipPath: "inset(100% 0% 0% 0% round 50% 50% 0% 0%)" },
          {
            clipPath: "inset(0% 0% 0% 0% round 0% 0% 0% 0%)",
            ease: "power2.out",
            scrollTrigger: { trigger: story, start: "top bottom", end: "top top", scrub: 0.4 },
          },
        );
        const tl = gsap.timeline({
          defaults: { ease: "none" },
          scrollTrigger: {
            trigger: story,
            start: "top top",
            end: mobile ? CAPITULO_6_SCROLL_MOVIL : CAPITULO_6_SCROLL,
            pin: ".bm-story-pin",
            scrub: 0.5,
          },
        });
        storyST = tl.scrollTrigger!;
        tl.fromTo(fillWords.words, { opacity: 0.14 }, { opacity: 1, stagger: 0.1, duration: 0.3 }, 0);
        qa(".bm-story-img").forEach((fig) => {
          const sp = Number(fig.dataset.speed) || 1;
          tl.fromTo(
            fig,
            { yPercent: 70 * sp, rotation: -5 * sp },
            { yPercent: -90 * sp, rotation: 4 * sp, duration: tl.duration() || 1 },
            0,
          );
        });
      } else {
        storyST = ScrollTrigger.create({ trigger: story, start: "top top", end: "bottom top" });
      }
      ScrollTrigger.create({
        trigger: story,
        start: "top 8%",
        end: "bottom 8%",
        toggleClass: { targets: header, className: "is-light" },
      });

      /* ---- Capítulo 7 · Galería infinita -------------------------------- */
      const gal = q("#galeria");
      const galPin = q(".bm-gallery-pin");
      const gallery = createGallery(gal, {
        reduced,
        onOpen: () => {
          lenis?.stop();
          el.classList.add("is-detail");
        },
        onClose: () => {
          lenis?.start();
          el.classList.remove("is-detail");
        },
      });
      cleanups.push(gallery.destroy);
      let galST: ScrollTrigger;
      if (!reduced) {
        gsap.fromTo(
          galPin,
          { clipPath: "inset(16% 12% 16% 12% round 28px)" },
          {
            clipPath: "inset(0% 0% 0% 0% round 0px)",
            ease: "none",
            scrollTrigger: { trigger: gal, start: "top bottom", end: "top top", scrub: true },
          },
        );
        ScrollTrigger.create({ trigger: gal, start: "top bottom", end: "bottom top", onUpdate: () => gallery.update() });
        gsap.to(".bm-gallery-head", {
          autoAlpha: 0,
          y: -40,
          ease: "none",
          scrollTrigger: { trigger: gal, start: "top top", end: "+=35%", scrub: true },
        });
        let lastY = 0;
        galST = ScrollTrigger.create({
          trigger: gal,
          start: "top top",
          end: mobile ? CAPITULO_7_SCROLL_MOVIL : CAPITULO_7_SCROLL,
          pin: galPin,
          onToggle: (self) => (lastY = self.scroll()),
          onUpdate: (self) => {
            const y = self.scroll();
            gallery.scroll((y - lastY) * GALERIA.factorScroll);
            lastY = y;
          },
        });
        gallery.update();
      } else {
        galST = ScrollTrigger.create({ trigger: gal, start: "top top", end: "bottom top" });
      }

      /* ---- Capítulo 8 · Pídelo + footer --------------------------------- */
      const close = q("#pidelo");
      const closeTitle = SplitText.create(".bm-close-title", { type: "lines,chars", mask: "lines", charsClass: "bm-char" });
      const closeST = ScrollTrigger.create({ trigger: close, start: "top bottom", end: "top top" });
      const footer = q(".bm-footer");
      const footST = ScrollTrigger.create({ trigger: footer, start: "top bottom", end: "top 40%" });
      if (!reduced) {
        gsap
          .timeline({ scrollTrigger: { trigger: close, start: "top 65%", once: true } })
          .from(closeTitle.chars, { yPercent: 110, duration: 1.1, stagger: 0.03, ease: "expo.out" })
          .from([".bm-close-lead", ".bm-cta", ".bm-close-info"], { y: 28, autoAlpha: 0, duration: 0.9, stagger: 0.08, ease: "expo.out" }, 0.25);
        const word = SplitText.create(".bm-footer-word", { type: "chars", charsClass: "bm-char", mask: "chars" });
        gsap.from(word.chars, {
          yPercent: 100,
          stagger: 0.04,
          ease: "power3.out",
          scrollTrigger: { trigger: footer, start: "top bottom", end: "bottom bottom", scrub: 0.6 },
        });
        cleanups.push(createChocolateTrail(close, q<HTMLCanvasElement>(".bm-trail"), mobile));
      }

      /* ---- Fresa 3D: su recorrido por la página ------------------------- */
      // Poses en puntos del scroll; entre ellas se interpola (suave, o lineal si va
      // pegada a algo que se mueve). Se recalcula en cada refresh de ScrollTrigger.
      let keys: Key[] = [];
      const pose = (p: Partial<Pose>): Pose => ({ x: 0, y: 0, s: 0.5, spin: 0, tilt: 0, opacity: 1, ...p });
      const buildKeys = () => {
        const H = vh();
        const heroP = mobile ? pose({ x: 0, y: -0.02, s: 0.44, tilt: 0.32 }) : pose({ x: 0.02, y: -0.03, s: 0.62, tilt: 0.32 });
        if (reduced) {
          keys = [
            { at: 0, p: heroP },
            { at: H * 0.6, p: { ...heroP, opacity: 0 } },
          ];
          return;
        }
        const fallen = { ...heroP, y: -1.05, s: heroP.s * 0.75, spin: Math.PI * 3, tilt: 1.2 };
        const menuP = mobile
          ? pose({ x: 0.18, y: -0.3, s: 0.24, spin: Math.PI * 5, tilt: -0.2 })
          : pose({ x: 0.08, y: -0.02, s: 0.42, spin: Math.PI * 5, tilt: -0.25 });
        const closeP = mobile
          ? pose({ x: 0.3, y: 0.34, s: 0.2, spin: Math.PI * 8, tilt: 0.2 })
          : pose({ x: 0.28, y: 0.02, s: 0.5, spin: Math.PI * 8, tilt: 0.2 });
        keys = [
          { at: heroST.start, p: heroP },
          { at: heroST.end, p: fallen },
          { at: heroST.end + 1, p: { ...fallen, opacity: 0 } },
          { at: menuST.start - H * 0.45, p: { ...menuP, y: 1, opacity: 0 } },
          { at: menuST.start, p: menuP },
          // La fila de tarjetas avanza 1px por px de scroll: la fresa se va con ella.
          { at: menuST.start + vw() * 1.1, p: { ...menuP, x: menuP.x - 1.1, spin: menuP.spin + 2 }, linear: true },
          { at: menuST.start + vw() * 1.1 + 1, p: { ...menuP, x: -1, opacity: 0 } },
          { at: closeST.start, p: { ...closeP, y: -1, opacity: 0 } },
          { at: closeST.start + H * 0.75, p: closeP },
          { at: footST.start, p: closeP },
          { at: footST.end, p: { ...closeP, y: 1.05, spin: closeP.spin + 3 } },
        ].sort((a, b) => a.at - b.at);
      };
      const poseAt = (y: number): Pose => {
        if (!keys.length) return pose({ opacity: 0 });
        if (y <= keys[0].at) return keys[0].p;
        for (let i = 0; i < keys.length - 1; i++) {
          const a = keys[i];
          const b = keys[i + 1];
          if (y >= a.at && y <= b.at) {
            const t0 = (y - a.at) / Math.max(1, b.at - a.at);
            const t = b.linear ? t0 : smooth(t0);
            const out = {} as Pose;
            (Object.keys(a.p) as (keyof Pose)[]).forEach((k) => (out[k] = a.p[k] + (b.p[k] - a.p[k]) * t));
            return out;
          }
        }
        return keys[keys.length - 1].p;
      };
      const onRefresh = () => {
        buildKeys();
        seq.resize();
        berry?.resize();
      };
      ScrollTrigger.addEventListener("refresh", onRefresh);
      cleanups.push(() => ScrollTrigger.removeEventListener("refresh", onRefresh));

      const tick = (_t: number, dtMs: number) => {
        if (!berry) return;
        Object.assign(berry.state, poseAt(lenis ? lenis.scroll : window.scrollY));
        berry.tick(Math.min(dtMs, 100) / 1000);
      };
      gsap.ticker.add(tick);
      cleanups.push(() => {
        gsap.ticker.remove(tick);
        berry?.dispose();
      });

      /* ---- Indicador de capítulos + navegación -------------------------- */
      const chapterPos = (): number[] => {
        const a = armST;
        const armAt = (f: number) => (a ? a.start + (a.end - a.start) * f : armado.offsetTop);
        return [
          0,
          armAt(ARMADO.fresas[0] + 0.02),
          armAt(ARMADO.chocolate[0] + 0.02),
          armAt(ARMADO.pistache[0] + 0.02),
          menuST.start + 2,
          storyST.start + 2,
          galST.start + 2,
          closeST.end - vh() * 0.1,
        ];
      };
      const progressLinks = qa<HTMLAnchorElement>(".bm-progress a");
      const bar = q(".bm-progress-bar span");
      let active = -1;
      const updateProgress = (y: number) => {
        const pos = chapterPos();
        let idx = 0;
        pos.forEach((p, i) => {
          if (y >= p - vh() * 0.35) idx = i;
        });
        if (idx !== active) {
          active = idx;
          progressLinks.forEach((a, i) => (i === idx ? a.setAttribute("aria-current", "step") : a.removeAttribute("aria-current")));
        }
        const max = ScrollTrigger.maxScroll(window) || 1;
        gsap.set(bar, { scaleY: y / max });
      };
      const progST = ScrollTrigger.create({ onUpdate: (self) => updateProgress(self.scroll()) });
      cleanups.push(() => progST.kill());

      const goTo = (y: number) => {
        if (lenis) lenis.scrollTo(y, { duration: 1.6, easing: (t: number) => (t < 0.5 ? 16 * t ** 5 : 1 - (-2 * t + 2) ** 5 / 2) });
        else window.scrollTo({ top: y });
      };
      const targetFor = (hash: string): number | null => {
        const pos = chapterPos();
        const map: Record<string, number> = {
          "#la-fresa": pos[0],
          "#el-vaso": pos[1],
          "#el-chocolate": pos[2],
          "#el-toque-final": pos[3],
          "#menu": pos[4],
          "#historia": pos[5],
          "#galeria": pos[6],
          "#pidelo": pos[7],
        };
        return hash in map ? map[hash] : null;
      };
      const onNav = (e: MouseEvent) => {
        const a = (e.target as HTMLElement).closest<HTMLAnchorElement>("a[href^='#']");
        if (!a) return;
        const y = targetFor(a.getAttribute("href")!);
        if (y == null) return;
        e.preventDefault();
        goTo(y);
      };
      el.addEventListener("click", onNav);
      cleanups.push(() => el.removeEventListener("click", onNav));

      /* ---- Microinteracciones ------------------------------------------- */
      if (!reduced) cleanups.push(createCursor(q(".bm-cursor"), q(".bm-cursor span")));
      cleanups.push(createMagnetic(el));
      cleanups.push(createTilt(el));
      cleanups.push(createMarquees(el, reduced));

      /* ---- Sorpresas ---------------------------------------------------- */
      const rain = () => berry?.rain(mobile ? SORPRESAS.lluvia.movil : SORPRESAS.lluvia.escritorio);
      const logo = q(".bm-logo");
      const onLogo = () => {
        if (reduced) return goTo(0);
        rain();
        gsap.fromTo(logo.querySelector("img"), { rotation: 0 }, { rotation: 360, duration: 0.9, ease: "expo.out" });
      };
      logo.addEventListener("click", onLogo);
      let typed = "";
      const onKey = (e: KeyboardEvent) => {
        if (e.key.length !== 1) return;
        typed = (typed + e.key.toLowerCase()).slice(-12);
        if (typed.endsWith(SORPRESAS.lluvia.palabraSecreta)) rain();
      };
      window.addEventListener("keydown", onKey);
      cleanups.push(() => {
        logo.removeEventListener("click", onLogo);
        window.removeEventListener("keydown", onKey);
      });

      // "Otra vez, desde la fresa": el chocolate cubre todo, volvemos al inicio y la fresa cae de nuevo.
      const again = q(".bm-again");
      const onAgain = () => {
        if (reduced || !lenis) return goTo(0);
        const d = { c: 0, u: 0 };
        lenis.stop();
        gsap
          .timeline()
          .to(d, { c: 1, duration: 0.9, ease: "power2.inOut", onUpdate: () => drip.set(d.c, d.u) })
          .add(() => {
            lenis!.scrollTo(0, { immediate: true, force: true });
            ScrollTrigger.update();
            if (berry) berry.intro.p = 0;
          })
          .to(d, { u: 1, duration: TIEMPO.goteoSalida, ease: "power2.inOut", onUpdate: () => drip.set(d.c, d.u) }, "+=0.15")
          .add(() => {
            lenis!.start();
            intro(true);
          }, "<0.2");
      };
      again.addEventListener("click", onAgain);
      cleanups.push(() => again.removeEventListener("click", onAgain));

      /* ---- Entrada --------------------------------------------------------- */
      function intro(replay = false) {
        if (berry) gsap.fromTo(berry.intro, { p: 0 }, { p: 1, duration: reduced ? 0.6 : 2, ease: "expo.out", delay: replay ? 0 : 0.15 });
        if (reduced) {
          gsap.from([".bm-hero-title", ".bm-hero-sub"], { autoAlpha: 0, duration: 0.6, stagger: 0.1 });
          return;
        }
        gsap.fromTo(
          heroSplit.chars,
          { yPercent: 115, rotationX: -85, autoAlpha: 0 },
          {
            yPercent: 0,
            rotationX: 0,
            autoAlpha: 1,
            transformOrigin: "50% 100% -40px",
            duration: TIEMPO.heroLetras,
            ease: "expo.out",
            stagger: TIEMPO.heroEscalon,
            delay: 0.2,
          },
        );
        gsap.fromTo(
          [".bm-hero-sub", ".bm-hero-hint", ".bm-header > *"],
          { y: 18, autoAlpha: 0 },
          { y: 0, autoAlpha: 1, duration: 1, stagger: 0.07, ease: "expo.out", delay: 0.75 },
        );
      }

      ScrollTrigger.refresh();
      onRefresh();
      updateProgress(0);

      // Salida del preloader: el mismo chocolate escurre hacia abajo.
      const pre = q(".bm-preloader");
      document.documentElement.classList.remove("bm-lock");
      el.classList.add("is-ready");
      if (reduced) {
        gsap.to(pre, { autoAlpha: 0, duration: 0.5, onComplete: () => void gsap.set(pre, { display: "none" }) });
        intro();
        return;
      }
      lenis?.stop();
      drip.set(1, 0);
      const d = { u: 0 };
      gsap
        .timeline({
          onComplete: () => {
            lenis?.start();
          },
        })
        .to(".bm-pre-logo, .bm-pre-count, .bm-pre-name", { autoAlpha: 0, y: -20, duration: 0.4, ease: "power2.out", stagger: 0.04 })
        .set(pre, { display: "none" })
        .to(d, { u: 1, duration: TIEMPO.goteoSalida, ease: "power2.inOut", onUpdate: () => drip.set(1, d.u) })
        .add(() => intro(), "<0.15");
    }

    return () => {
      disposed = true;
      cleanups.forEach((f) => f());
      ctx.revert();
      document.documentElement.classList.remove("bm-page", "bm-lock");
    };
  }, []);

  return (
    <div className="bm" ref={root}>
      <Chrome />
      <main id="contenido">
        <Hero />
        <Armado />
        <Menu />
        <Marquee items={["Vasos BerryMood", "Fresas con chocolate", "Fresas con crema", "Cajas para regalo"]} speed={38} />
        <Historia />
        <Galeria />
        <Pidelo />
      </main>
      <Footer />
    </div>
  );
}
