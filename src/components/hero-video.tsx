"use client";

/* =============================================================================
   HERO · VIDEO DE ENTRADA

   Al abrir la página se reproduce el video del armado del vaso (una vez, sin
   sonido) y, al terminar, se funde con el hero de siempre (texto + vaso).
   El video se muestra tal cual, en su calidad original, sin recortes.

   Archivo: /public/video/armado.mp4 (+ armado-poster.webp, primer cuadro).
   Para cambiarlo: reemplaza esos dos archivos con el mismo nombre.
   prefers-reduced-motion: no se reproduce; se ve directo el hero.
   ========================================================================== */

import { useEffect, useRef, useState, type ReactNode } from "react";

/* ---------- AJUSTES ------------------------------------------------------- */
const VIDEO = {
  src: "/video/armado.mp4",
  poster: "/video/armado-poster.webp",
  /** Duración del fundido final hacia el hero, en ms. */
  fadeMs: 900,
  /** Si el video no termina por algo (red lenta), mostrar el hero a los N ms. */
  safetyMs: 14000,
};

export function HeroVideo({ children }: { children: ReactNode }) {
  const root = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [phase, setPhase] = useState<"video" | "fading" | "done">("video");

  useEffect(() => {
    const layers = root.current?.querySelectorAll<HTMLElement>("[data-hero-fade]") ?? [];
    const video = videoRef.current;
    const showHero = () => {
      layers.forEach((l) => {
        l.style.transition = `opacity ${VIDEO.fadeMs}ms cubic-bezier(0.23, 1, 0.32, 1)`;
        l.style.opacity = "1";
      });
      setPhase("fading");
      window.setTimeout(() => setPhase("done"), VIDEO.fadeMs);
    };

    if (!video || window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setPhase("done");
      return;
    }

    layers.forEach((l) => (l.style.opacity = "0"));
    const safety = window.setTimeout(showHero, VIDEO.safetyMs);
    const onEnd = () => {
      window.clearTimeout(safety);
      showHero();
    };
    video.addEventListener("ended", onEnd);
    video.play().catch(onEnd); // si el navegador no deja reproducir, no bloquear

    return () => {
      window.clearTimeout(safety);
      video.removeEventListener("ended", onEnd);
      layers.forEach((l) => {
        l.style.opacity = "";
        l.style.transition = "";
      });
    };
  }, []);

  return (
    <div ref={root} className="relative">
      {children}

      {phase !== "done" && (
        <div
          aria-hidden="true"
          className="hero-video pointer-events-none absolute inset-x-0 top-0 z-30 h-svh overflow-hidden bg-[#4b4a4c]"
          style={{
            opacity: phase === "fading" ? 0 : 1,
            transition: `opacity ${VIDEO.fadeMs}ms cubic-bezier(0.23, 1, 0.32, 1)`,
          }}
        >
          {/* Pantallas anchas: el mismo video, ampliado y desenfocado, rellena los lados */}
          <video
            className="absolute inset-0 hidden h-full w-full scale-110 object-cover blur-2xl brightness-75 md:block"
            src={VIDEO.src}
            muted
            playsInline
            autoPlay
            preload="auto"
            tabIndex={-1}
          />
          <video
            ref={videoRef}
            className="absolute inset-0 h-full w-full object-cover md:object-contain"
            src={VIDEO.src}
            poster={VIDEO.poster}
            muted
            playsInline
            preload="auto"
          />
        </div>
      )}
    </div>
  );
}
