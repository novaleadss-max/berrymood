/* =============================================================================
   GALERÍA INFINITA + MORPH (capítulo "En fotos")

   Basado en "Infinite Scroll Gallery and Flip Transitions in GSAP" de Surya Aditya
   para Codrops — https://tympanus.net/codrops/?p=118084
   https://github.com/surya-aditya/codrops-infinite-scroll-and-content-transition
   MIT License · Copyright (c) Surya Aditya / Codrops

   Cambios para BerryMood:
   - El scroll de la página (Lenis + ScrollTrigger con pin) mueve el playhead
     suavizado, en lugar de secuestrar la rueda: la página nunca se atora.
   - Cada foto se inclina en 3D según su altura en pantalla (arriba se va hacia
     atrás, abajo hacia adelante) y la foto interior se estira con la velocidad.
   - Curvas expo para el morph, texto con SplitText línea por línea.
   ========================================================================== */

import gsap from "gsap";
import { Flip } from "gsap/Flip";
import { SplitText } from "gsap/SplitText";
import { GALERIA } from "./config";

gsap.registerPlugin(Flip, SplitText);

/** Anima elementos en el eje Y en un ciclo sin fin (helper de GSAP). */
function verticalLoop(items: HTMLElement[], config: { paused?: boolean; repeat?: number; paddingBottom?: number }) {
  const tl = gsap.timeline({
    repeat: config.repeat,
    paused: config.paused,
    defaults: { ease: "none" },
    onReverseComplete: () => {
      tl.totalTime(tl.rawTime() + tl.duration() * 100);
    },
  });
  const length = items.length;
  const heights: number[] = [];
  const yPercents: number[] = [];
  const pps = GALERIA.pxPorSegundo;
  const snap = gsap.utils.snap(1);

  gsap.set(items, {
    yPercent: (i: number, el: HTMLElement) => {
      const h = (heights[i] = parseFloat(String(gsap.getProperty(el, "height", "px"))));
      yPercents[i] = snap(
        (parseFloat(String(gsap.getProperty(el, "y", "px"))) / h) * 100 + Number(gsap.getProperty(el, "yPercent")),
      );
      return yPercents[i];
    },
  });
  gsap.set(items, { y: 0 });

  const last = items[length - 1];
  const totalHeight =
    last.offsetTop +
    (yPercents[length - 1] / 100) * heights[length - 1] +
    last.offsetHeight +
    (config.paddingBottom || 0);

  for (let i = 0; i < length; i++) {
    const item = items[i];
    const curY = (yPercents[i] / 100) * heights[i];
    const distanceToStart = item.offsetTop + curY;
    const distanceToLoop = distanceToStart + heights[i];
    tl.to(item, { yPercent: snap(((curY - distanceToLoop) / heights[i]) * 100), duration: distanceToLoop / pps }, 0).fromTo(
      item,
      { yPercent: snap(((curY - distanceToLoop + totalHeight) / heights[i]) * 100) },
      { yPercent: yPercents[i], duration: (totalHeight - distanceToLoop) / pps, immediateRender: false },
      distanceToLoop / pps,
    );
  }
  tl.progress(1, true).progress(0, true);
  return tl;
}

type Change = { el: HTMLElement; visible: boolean; top: number };

/* ---------- Slider: ciclo infinito movido por el scroll ------------------ */
class Slider {
  loop!: gsap.core.Timeline;
  private wrap!: (v: number) => number;
  private items: { el: HTMLElement; wrapper: HTMLElement; img: HTMLElement; factor: number; offset: number; visible: boolean }[];
  private playhead = { time: 0 };
  private scrub: gsap.core.Tween;
  private velocity = 0;

  constructor(
    private gallery: HTMLElement,
    private slides: HTMLElement[],
    private onToggle: (c: Change[], immediate: boolean) => void,
  ) {
    this.createLoop();
    this.items = slides.map((el, i) => ({
      el,
      wrapper: el.querySelector<HTMLElement>(".g-media")!,
      img: el.querySelector<HTMLElement>(".g-img")!,
      factor: GALERIA.velocidadesParallax[i % GALERIA.velocidadesParallax.length] - 1,
      offset: 0,
      visible: false,
    }));
    this.scrub = gsap.to(this.playhead, {
      time: 0,
      duration: GALERIA.scrub.duracion,
      ease: GALERIA.scrub.curva,
      paused: true,
      onUpdate: () => {
        this.loop.time(this.wrap(this.playhead.time));
        this.applyParallax();
      },
    });
    this.applyParallax();
  }

  private createLoop() {
    const gap = parseFloat(getComputedStyle(this.gallery).rowGap) || 0;
    this.loop = verticalLoop(this.slides, { repeat: -1, paused: true, paddingBottom: gap });
    this.wrap = gsap.utils.wrap(0, this.loop.duration());
  }

  /** Desplaza cada foto según su velocidad; inclina en 3D; avisa entradas/salidas. */
  applyParallax(immediate = false) {
    const changes: Change[] = [];
    const vh = window.innerHeight;
    this.velocity *= 0.9;
    // Primero se leen todas las posiciones y luego se escribe: sin recálculos de layout intercalados.
    const rects = this.items.map((item) => item.el.getBoundingClientRect());
    const stretch = 1.2 + Math.min(Math.abs(this.velocity) * 0.0009, 0.08);
    this.items.forEach((item, i) => {
      const rect = rects[i];
      const loopTop = rect.top - item.offset;
      item.offset = item.factor * (loopTop + rect.height);
      const top = loopTop + item.offset;
      const center = (top + rect.height / 2 - vh / 2) / (vh / 2); // -1 arriba, 1 abajo
      gsap.set(item.el, { y: item.offset });
      gsap.set(item.wrapper, { rotationX: gsap.utils.clamp(-1.4, 1.4, center) * -9, z: -Math.abs(center) * 60 });
      gsap.set(item.img, { yPercent: center * -6, scaleY: stretch });
      const visible = top < vh && top + rect.height > 0;
      if (visible !== item.visible) {
        item.visible = visible;
        changes.push({ el: item.el, visible, top });
      }
    });
    if (changes.length) this.onToggle(changes, immediate);
  }

  /** Mueve el destino del playhead por la distancia recorrida (px). */
  scroll(delta: number) {
    this.velocity = delta;
    (this.scrub.vars as { time: number }).time += delta / GALERIA.pxPorSegundo;
    this.scrub.invalidate().restart();
  }

  freeze() {
    this.scrub.pause();
    (this.scrub.vars as { time: number }).time = this.playhead.time;
    this.scrub.invalidate();
  }

  rebuild() {
    const progress = this.loop.progress();
    this.freeze();
    this.loop.kill();
    gsap.set(this.slides, { clearProps: "transform" });
    this.createLoop();
    this.loop.progress(progress, true);
    this.items.forEach((item) => (item.offset = 0));
    this.applyParallax(true);
    this.playhead.time = this.loop.time();
    (this.scrub.vars as { time: number }).time = this.playhead.time;
    this.scrub.invalidate();
  }

  kill() {
    this.scrub.kill();
    this.loop.kill();
  }
}

/* ---------- Reveal: imagen con fundido, pie de foto letra por letra ------- */
class Reveal {
  private items = new Map<HTMLElement, { wrapper: HTMLElement; chars: Element[]; split: SplitText }>();
  constructor(slides: HTMLElement[]) {
    slides.forEach((slide) => {
      const wrapper = slide.querySelector<HTMLElement>(".g-media")!;
      // aria "none": la foto es un botón con su propio aria-label.
      const split = new SplitText(slide.querySelector(".g-cap"), { type: "chars", aria: "none" });
      gsap.set(wrapper, { autoAlpha: 0 });
      gsap.set(split.chars, { autoAlpha: 0 });
      this.items.set(slide, { wrapper, chars: split.chars, split });
    });
  }
  toggle(changes: Change[], immediate: boolean) {
    changes
      .filter((c) => c.visible)
      .sort((a, b) => a.top - b.top)
      .forEach((c, i) => this.show(c.el, i * GALERIA.revelado.escalon, immediate));
    changes.filter((c) => !c.visible).forEach((c) => this.hide(c.el));
  }
  show(slide: HTMLElement, delay: number, immediate: boolean) {
    const it = this.items.get(slide)!;
    if (immediate) {
      gsap.set([it.wrapper, ...it.chars], { autoAlpha: 1, overwrite: true });
      return;
    }
    const { imagen, letras } = GALERIA.revelado;
    gsap.to(it.wrapper, { autoAlpha: 1, ...imagen, delay, overwrite: "auto" });
    gsap.to(it.chars, { autoAlpha: 1, ...letras, delay: delay + letras.delay, overwrite: true });
  }
  hide(slide: HTMLElement) {
    const it = this.items.get(slide)!;
    gsap.set(it.wrapper, { autoAlpha: 0, overwrite: "auto" });
    gsap.set(it.chars, { autoAlpha: 0, overwrite: true });
  }
  showAll() {
    this.items.forEach((it) => gsap.set([it.wrapper, ...it.chars], { autoAlpha: 1 }));
  }
  revert() {
    this.items.forEach((it) => it.split.revert());
  }
}

/* ---------- Transition: morph de la foto al detalle --------------------- */
type State = "closed" | "opening" | "open" | "closing";

class Transition {
  state: State = "closed";
  private content: HTMLElement;
  private preview: HTMLElement;
  private previewImg: HTMLImageElement;
  private groups: HTMLElement[];
  private active: HTMLElement | null = null;
  private tl: gsap.core.Timeline | null = null;
  private split: SplitText | null = null;
  private previewMedia: HTMLElement;
  private video: HTMLVideoElement | null = null;
  private videoHome: HTMLElement | null = null;
  private lastFocus: HTMLElement | null = null;
  private byKeyboard = false;

  constructor(
    private root: HTMLElement,
    private slides: HTMLElement[],
    private reduced: boolean,
    private hooks: { onOpen: () => void; onClose: () => void },
  ) {
    this.content = root.querySelector<HTMLElement>(".g-detail")!;
    this.preview = root.querySelector<HTMLElement>(".g-preview")!;
    this.previewImg = this.preview.querySelector("img")!;
    this.previewMedia = this.previewImg;
    this.groups = gsap.utils.toArray<HTMLElement>(".g-group", root);
  }

  private parts() {
    const slide = this.active!;
    return {
      wrapper: slide.querySelector<HTMLElement>(".g-media")!,
      caption: slide.querySelector<HTMLElement>(".g-cap")!,
      others: this.slides.filter((s) => s !== slide),
    };
  }

  async open(slide: HTMLElement, index: number, byKeyboard = false) {
    if (this.state !== "closed") return;
    this.state = "opening";
    this.active = slide;
    this.byKeyboard = byKeyboard;
    this.lastFocus = document.activeElement as HTMLElement;
    this.hooks.onOpen();

    await this.fill(slide, index);
    if (this.state !== "opening") return;

    const { wrapper, caption, others } = this.parts();
    gsap.set(wrapper, { rotationX: 0, z: 0 });
    const state = Flip.getState(wrapper, { props: "borderRadius" });

    gsap.set(this.content, { display: "block" });
    this.content.removeAttribute("aria-hidden");
    gsap.killTweensOf(wrapper);
    gsap.set(wrapper, { autoAlpha: 0 });

    if (this.video) {
      this.previewImg.style.display = "none";
      this.preview.append(this.video);
      this.previewMedia = this.video;
    }

    this.split = new SplitText(this.content.querySelectorAll(".g-back, .g-group.active > *"), {
      type: "lines,chars",
      charsClass: "char",
    });

    const A = GALERIA.abrir;
    this.tl = gsap
      .timeline({
        onComplete: () => {
          this.state = "open";
          // El foco entra al detalle (Esc o "Cerrar" lo regresan).
          this.content.querySelector<HTMLElement>(".g-back")?.focus({ preventScroll: true });
        },
        onReverseComplete: () => this.reset(),
      })
      .to(others, { autoAlpha: 0, ...A.otras }, 0)
      .to(caption, { autoAlpha: 0, duration: 0.3 }, 0)
      .add(Flip.from(state, { targets: this.preview, ...A.flip, absolute: true, props: "borderRadius" }), 0)
      .fromTo(this.previewMedia, { scale: 1.2 }, { scale: 1, ...A.flip }, 0);

    this.split.lines.forEach((line, i) => {
      this.tl!.fromTo(
        line.querySelectorAll(".char"),
        { autoAlpha: 0, yPercent: 60, rotationX: -70 },
        { autoAlpha: 1, yPercent: 0, rotationX: 0, ...A.texto },
        A.textoRetraso + i * A.escalonLinea,
      );
    });
    if (this.reduced) this.tl.progress(1);
  }

  close() {
    if (this.state === "opening") {
      this.state = "closing";
      if (!this.tl) return this.reset();
      this.tl.reverse();
      return;
    }
    if (this.state !== "open") return;
    this.state = "closing";
    const { wrapper, caption, others } = this.parts();
    const C = GALERIA.cerrar;
    this.tl = gsap
      .timeline({ onComplete: () => this.reset() })
      .to(this.split!.lines, { autoAlpha: 0, ...C.texto }, 0)
      .add(Flip.fit(this.preview, wrapper, { ...C.flip, absolute: true, props: "borderRadius" }) as gsap.core.Animation, 0)
      .to(this.previewMedia, { scale: 1.2, ...C.flip }, 0)
      .to(others, { autoAlpha: 1, duration: 0.5, ease: "power2.out" }, 0.45)
      .to(caption, { autoAlpha: 1, duration: 0.4, ease: "power2.out" }, 0.55);
    if (this.reduced) this.tl.progress(1);
  }

  private async fill(slide: HTMLElement, index: number) {
    const media = slide.querySelector<HTMLElement>(".g-img")!;
    this.groups.forEach((g) => g.classList.toggle("active", Number(g.dataset.index) === index));
    if (media.tagName === "VIDEO") {
      this.video = media as HTMLVideoElement;
      this.videoHome = media.parentElement;
      return;
    }
    const img = media as HTMLImageElement;
    this.previewImg.src = img.currentSrc || img.src;
    this.previewImg.alt = img.alt;
    try {
      await this.previewImg.decode();
    } catch {
      /* si cambia la fuente a medio camino, la transición sigue */
    }
    const full = img.dataset.full;
    if (full) {
      const hi = new Image();
      hi.src = full;
      hi.decode()
        .then(() => {
          if (this.active === slide && this.state !== "closed") this.previewImg.src = full;
        })
        .catch(() => {});
    }
  }

  private reset() {
    const { wrapper } = this.parts();
    if (this.video && this.videoHome) {
      this.videoHome.append(this.video);
      gsap.set(this.video, { clearProps: "all" });
      this.video = null;
      this.videoHome = null;
    }
    this.previewMedia = this.previewImg;
    this.previewImg.style.display = "";
    this.split?.revert();
    this.split = null;
    gsap.set(this.content, { display: "none" });
    this.content.setAttribute("aria-hidden", "true");
    gsap.set(this.preview, { clearProps: "all" });
    gsap.set(this.previewImg, { clearProps: "all" });
    gsap.set(wrapper, { clearProps: "opacity,visibility" });
    gsap.set(wrapper, { autoAlpha: 1 });
    this.active = null;
    this.tl = null;
    this.state = "closed";
    this.hooks.onClose();
    // Con teclado el foco vuelve a la foto; con mouse no se dibuja el anillo de foco.
    if (this.byKeyboard) this.lastFocus?.focus({ preventScroll: true });
    else (document.activeElement as HTMLElement | null)?.blur?.();
  }
}

/* ---------- Montaje ----------------------------------------------------- */
export function createGallery(
  root: HTMLElement,
  opts: { reduced: boolean; onOpen: () => void; onClose: () => void },
) {
  const gallery = root.querySelector<HTMLElement>(".g-track")!;
  const slides = gsap.utils.toArray<HTMLElement>(".g-slide", root);
  const transition = new Transition(root, slides, opts.reduced, opts);

  let slider: Slider | null = null;
  let reveal: Reveal | null = null;
  if (!opts.reduced) {
    reveal = new Reveal(slides);
    slider = new Slider(gallery, slides, (c, im) => reveal!.toggle(c, im));
  }

  // Videos: solo se reproducen en pantalla.
  const videos = slides.map((s) => s.querySelector("video")).filter(Boolean) as HTMLVideoElement[];
  const io = new IntersectionObserver(
    (entries) =>
      entries.forEach((e) => {
        const v = e.target as HTMLVideoElement;
        if (e.isIntersecting && !opts.reduced) v.play().catch(() => {});
        else v.pause();
      }),
    { rootMargin: "10% 0px" },
  );
  videos.forEach((v) => io.observe(v));

  const handlers: [HTMLElement, string, EventListener][] = [];
  const on = (el: HTMLElement, type: string, fn: EventListener) => {
    el.addEventListener(type, fn);
    handlers.push([el, type, fn]);
  };
  slides.forEach((slide, index) => {
    on(slide, "click", () => transition.open(slide, index));
    on(slide, "keydown", ((e: KeyboardEvent) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        transition.open(slide, index, true);
      }
    }) as EventListener);
  });
  on(root.querySelector<HTMLElement>(".g-back")!, "click", () => transition.close());
  const onKey = (e: KeyboardEvent) => {
    if (e.key === "Escape") transition.close();
  };
  document.addEventListener("keydown", onKey);

  let resizeId = 0;
  const onResize = () => {
    clearTimeout(resizeId);
    resizeId = window.setTimeout(() => slider?.rebuild(), 200);
  };
  window.addEventListener("resize", onResize);

  return {
    /** px recorridos por el scroll de la página mientras la galería está fija. */
    scroll: (delta: number) => {
      if (transition.state === "closed") slider?.scroll(delta);
    },
    /** Recalcula parallax y revelados mientras la sección entra o sale. */
    update: () => slider?.applyParallax(),
    get isOpen() {
      return transition.state !== "closed";
    },
    destroy: () => {
      io.disconnect();
      handlers.forEach(([el, t, fn]) => el.removeEventListener(t, fn));
      document.removeEventListener("keydown", onKey);
      window.removeEventListener("resize", onResize);
      slider?.kill();
      reveal?.revert();
    },
  };
}
