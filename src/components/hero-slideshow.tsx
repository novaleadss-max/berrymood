"use client";

/* =============================================================================
   HERO · CARRUSEL CON PANEO

   4 fotos a pantalla completa. Cada una se desliza despacio de lado durante
   5 s; antes de que termine, la siguiente entra encima (alternando desde
   abajo y desde la derecha). El título y el texto aparecen y se van con cada
   foto. Los números de abajo saltan a una foto.

   Fotos en /public/images/slides (horizontales). Textos en SLIDES.
   prefers-reduced-motion: las fotos no se mueven y cambian sin deslizarse.
   ========================================================================== */

import { useEffect, useRef, useState } from "react";

const SLIDES = [
  {
    src: "/images/slides/vaso.webp",
    alt: "Vaso BerryMood con fresas, chocolate premium y pistache",
    title: "Berry Your Mood.",
    text: "Fresas escogidas una por una, chocolate premium y el topping que tú elijas. Hecho al momento en Galerías Chilpancingo.",
  },
  {
    src: "/images/slides/charola.webp",
    alt: "Charola de fresas frescas",
    title: "Fresas que pasan el filtro.",
    text: "Grandes, rojas y firmes. Si no se ven así, no entran al vaso.",
  },
  {
    src: "/images/slides/chocolate.webp",
    alt: "Chocolate premium cayendo sobre fresas en un vaso BerryMood",
    title: "Chocolate premium, sin prisa.",
    text: "Lo servimos justo antes de entregarte el vaso. Por eso llega brillante.",
  },
  {
    src: "/images/slides/dos-vasos.webp",
    alt: "Dos vasos BerryMood con fresas y chocolate",
    title: "Para ti o para regalar.",
    text: "Vasos, fresas con crema y cajas. Pásate a la tienda o escríbenos por Instagram.",
  },
];

/* ---------- TIEMPOS (ms) -------------------------------------------------- */
const T = {
  slide: 5000,
  headingIn: 80,
  paragraphIn: 280,
  textOut: 3750,
  enter: 4300,
  enterDuration: 700,
  ease: "cubic-bezier(0.65, 0, 0.35, 1)",
};
const DIRECTIONS = ["translate3d(0, 100%, 0)", "translate3d(100%, 0, 0)"];

export function HeroSlideshow() {
  const frameRef = useRef<HTMLElement>(null);
  const slideRefs = useRef<(HTMLDivElement | null)[]>([]);
  const imageRefs = useRef<(HTMLDivElement | null)[]>([]);
  const goToRef = useRef<(p: number) => void>(() => undefined);

  const [caption, setCaption] = useState(0);
  const [page, setPage] = useState(0);
  const [headingOn, setHeadingOn] = useState(false);
  const [paragraphOn, setParagraphOn] = useState(false);

  useEffect(() => {
    const frame = frameRef.current;
    if (!frame) return;
    const slides = slideRefs.current;
    const images = imageRefs.current;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let current = 0;
    let gen = 0; // cada clic cambia la "generación": los pendientes viejos ya no hacen nada
    let dir = 0;
    let timers: number[] = [];
    let entrance: Animation | null = null;
    let entering = -1;
    const pans = new Map<number, Animation>();

    const range = (i: number) => {
      const overflow = (images[i]?.offsetWidth ?? 0) - frame.offsetWidth;
      return reduced
        ? { start: -0.5 * overflow, end: -0.5 * overflow }
        : { start: -0.875 * overflow, end: -0.125 * overflow };
    };

    const setState = (i: number, state: "hidden" | "current" | "entering") => {
      const el = slides[i];
      if (el) el.dataset.state = state;
    };

    /** Deja la foto quieta al inicio de su paneo (para su siguiente turno). */
    const resetImage = (i: number) => {
      const img = images[i];
      if (!img) return;
      img.getAnimations().forEach((a) => a.cancel());
      pans.delete(i);
      img.style.transform = `translate3d(${range(i).start}px, 0, 0)`;
    };

    const pan = (i: number, fromTime = 0) => {
      const img = images[i];
      if (!img) return;
      const { start, end } = range(i);
      img.getAnimations().forEach((a) => a.cancel());
      const anim = img.animate(
        [{ transform: `translate3d(${start}px, 0, 0)` }, { transform: `translate3d(${end}px, 0, 0)` }],
        { duration: T.slide, easing: "linear", fill: "forwards" }
      );
      anim.currentTime = fromTime;
      pans.set(i, anim);
    };

    const later = (ms: number, g: number, fn: () => void) => {
      timers.push(
        window.setTimeout(() => {
          if (g === gen) fn();
        }, ms)
      );
    };

    const enter = (n: number, g: number) => {
      const slide = slides[n];
      if (!slide) return;
      resetImage(n);
      setState(n, "entering");
      entering = n;
      const from = DIRECTIONS[dir++ % DIRECTIONS.length];
      const anim = slide.animate([{ transform: from }, { transform: "translate3d(0, 0, 0)" }], {
        duration: reduced ? 1 : T.enterDuration,
        easing: T.ease,
      });
      entrance = anim;
      anim.finished
        .then(() => {
          if (g !== gen) return;
          const old = current;
          entrance = null;
          entering = -1;
          setState(old, "hidden");
          resetImage(old);
          setState(n, "current");
          cycle(n, g);
        })
        .catch(() => undefined); // cancelada por un clic
    };

    const cycle = (i: number, g: number) => {
      current = i;
      setCaption(i);
      setPage(i);
      pan(i);
      later(T.headingIn, g, () => setHeadingOn(true));
      later(T.paragraphIn, g, () => setParagraphOn(true));
      later(T.textOut, g, () => {
        setHeadingOn(false);
        setParagraphOn(false);
      });
      later(T.enter, g, () => enter((i + 1) % SLIDES.length, g));
    };

    const clearPending = () => {
      gen += 1;
      timers.forEach(clearTimeout);
      timers = [];
      entrance?.cancel();
      entrance = null;
    };

    goToRef.current = (p: number) => {
      if (p === current) return;
      clearPending();
      // una foto que quedó a medio entrar por un clic anterior se esconde
      if (entering !== -1 && entering !== current) {
        setState(entering, "hidden");
        resetImage(entering);
      }
      entering = -1;
      setPage(p);
      setHeadingOn(false);
      setParagraphOn(false);
      // la foto actual sigue su paneo por debajo
      enter(p, gen);
    };

    SLIDES.forEach((_, i) => resetImage(i));
    cycle(0, gen);

    // al cambiar el tamaño, se recalcula el paneo sin brincar
    const onResize = () => {
      pans.forEach((anim, i) => pan(i, Number(anim.currentTime ?? 0)));
    };
    window.addEventListener("resize", onResize);
    return () => {
      window.removeEventListener("resize", onResize);
      clearPending();
    };
  }, []);

  const slide = SLIDES[caption];

  return (
    <section ref={frameRef} aria-roledescription="carousel" aria-label="BerryMood" className="slideshow">
      <div className="slideshow-slides">
        {SLIDES.map((s, i) => (
          <div
            key={s.src}
            ref={(el) => {
              slideRefs.current[i] = el;
            }}
            data-state={i === 0 ? "current" : "hidden"}
            className="slideshow-slide"
            role="img"
            aria-label={s.alt}
          >
            <div
              ref={(el) => {
                imageRefs.current[i] = el;
              }}
              className="slideshow-image"
              style={{ backgroundImage: `url(${s.src})` }}
            />
          </div>
        ))}
      </div>

      <div aria-hidden="true" className="slideshow-overlay bg-black/50" />
      <div aria-hidden="true" className="slideshow-overlay slideshow-overlay--top" />
      <div aria-hidden="true" className="slideshow-overlay slideshow-overlay--bottom" />

      <div className="slideshow-content" aria-live="polite">
        <h1 className={`slideshow-heading font-heading ${headingOn ? "is-visible" : ""}`}>{slide.title}</h1>
        <p className={`slideshow-paragraph ${paragraphOn ? "is-visible" : ""}`}>{slide.text}</p>
      </div>

      <div className="slideshow-pagination">
        {SLIDES.map((s, i) => (
          <button
            key={s.src}
            type="button"
            onClick={() => goToRef.current(i)}
            aria-label={`Ir a la foto ${i + 1}`}
            aria-current={page === i ? "true" : undefined}
          >
            {String(i + 1).padStart(2, "0")}
          </button>
        ))}
      </div>
    </section>
  );
}
