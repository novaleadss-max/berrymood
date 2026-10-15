"use client";

/* =============================================================================
   GALERÍA CONECTADA

   Fotos 3:2 en zigzag. Al bajar, cada foto "nace" de la esquina que comparte
   con la anterior: el marco crece de 0 a 1 y la foto adentro se aleja de 5× a
   1×. Ligado al scroll (si subes, se encogen de regreso).

   Fotos en /public/images/galeria. Para cambiar una, reemplaza el archivo con
   el mismo nombre (proporción 3:2). El acomodo está en ITEMS:
   r = fila, c = columna donde empieza (de 8), s = cuántas columnas ocupa.
   ========================================================================== */

import { useRef } from "react";
import Image from "next/image";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";

gsap.registerPlugin(ScrollTrigger, useGSAP);

const ITEMS = [
  { src: "vaso-pistache", alt: "Vaso BerryMood con fresas, chocolate y pistache", r: 1, c: 1, s: 4 },
  { src: "fresas-cayendo", alt: "Fresas cayendo dentro del vaso", r: 2, c: 5, s: 3 },
  { src: "mitades", alt: "Fresa partida a la mitad", r: 3, c: 3, s: 2 },
  { src: "chocolate", alt: "Chocolate premium cayendo sobre las fresas", r: 4, c: 1, s: 2 },
  { src: "dos-vasos", alt: "Dos vasos BerryMood con chocolate y fresas", r: 5, c: 3, s: 5 },
  { src: "vaso-vacio", alt: "Vaso BerryMood vacío", r: 6, c: 2, s: 1 },
  { src: "manos", alt: "Manos sirviendo fresas con chocolate", r: 7, c: 3, s: 3 },
  { src: "pistache", alt: "Pistache cayendo sobre el chocolate", r: 8, c: 6, s: 2 },
  { src: "charola", alt: "Charola de fresas frescas", r: 9, c: 1, s: 5 },
  { src: "chocolate-cel", alt: "Chocolate cubriendo las fresas en el vaso", r: 10, c: 6, s: 3 },
  { src: "charola-cerca", alt: "Fresas de cerca", r: 11, c: 4, s: 2 },
  { src: "vaso-listo", alt: "Vaso BerryMood terminado", r: 12, c: 1, s: 3 },
  { src: "torre", alt: "Fresas bañadas en chocolate", r: 13, c: 4, s: 5 },
];

const ANIM = {
  frameFrom: 0,
  photoFrom: 5,
  /** Empieza cuando la foto pasa 15% arriba del borde inferior de la pantalla. */
  start: "top bottom-=15%",
  /** Termina de crecer tras una pantalla más de scroll. */
  end: "+=100%",
  intro: { duration: 1.6, stagger: 0.14 },
};

export function ConnectedGrid() {
  const root = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      // Se reconstruye al cruzar 53em: el lado de conexión depende del acomodo.
      mm.add(
        {
          desktop: "(min-width: 53em) and (prefers-reduced-motion: no-preference)",
          mobile: "(max-width: 52.999em) and (prefers-reduced-motion: no-preference)",
        },
        () => {
          const items = gsap.utils.toArray<HTMLElement>("[data-item]", root.current);
          let introIndex = 0;

          items.forEach((item, i) => {
            const frame = item.querySelector<HTMLElement>("[data-frame]")!;
            const photo = item.querySelector<HTMLElement>("[data-photo]")!;
            const rect = item.getBoundingClientRect();
            const prev = items[i - 1]?.getBoundingClientRect();
            // Totalmente a la izquierda de la anterior → nace de su esquina superior derecha
            const fromRight = !!prev && rect.right <= prev.left + 1;
            const origin = fromRight ? "100% 0%" : "0% 0%";
            gsap.set([frame, photo], { transformOrigin: origin });

            const inFirstScreen = rect.top + window.scrollY < window.innerHeight;
            const tl = inFirstScreen
              ? gsap.timeline({
                  defaults: { ease: "power4.out", duration: ANIM.intro.duration },
                  delay: introIndex++ * ANIM.intro.stagger,
                })
              : gsap.timeline({
                  defaults: { ease: "power4" },
                  scrollTrigger: { trigger: item, start: ANIM.start, end: ANIM.end, scrub: true },
                });

            tl.fromTo(frame, { scale: ANIM.frameFrom }, { scale: 1 }, 0).fromTo(
              photo,
              { scale: ANIM.photoFrom },
              { scale: 1 },
              0
            );
          });
        }
      );
      return () => mm.revert();
    },
    { scope: root }
  );

  return (
    <section
      id="galeria"
      aria-labelledby="galeria-title"
      className="relative scroll-mt-4 bg-cream pt-section text-chocolate-900"
    >
      <div className="mx-auto max-w-[1440px] px-4 sm:px-8 lg:px-12">
        <p className="text-[0.7rem] font-medium tracking-[0.32em] text-gold-deep">GALERÍA</p>
        <h2 id="galeria-title" className="mt-6 max-w-[14ch] text-fluid-2xl leading-[1.02] font-normal">
          Así se ve un <span className="italic">buen mood.</span>
        </h2>

        <div className="connected-grid mt-16 pb-[50vh]">
          {ITEMS.map((it) => (
            <figure
              key={it.src}
              data-item
              className="connected-item m-0"
              style={{ "--r": it.r, "--c": it.c, "--s": it.s } as React.CSSProperties}
            >
              <div data-frame className="relative aspect-[3/2] overflow-hidden rounded-[6px] will-change-transform">
                <Image
                  data-photo
                  src={`/images/galeria/${it.src}.webp`}
                  alt={it.alt}
                  fill
                  sizes="(min-width: 848px) 60vw, 100vw"
                  className="block object-cover will-change-transform"
                />
              </div>
            </figure>
          ))}
        </div>
      </div>
    </section>
  );
}
