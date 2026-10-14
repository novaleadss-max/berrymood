"use client";

/* =============================================================================
   HERO · ARMADO DEL VASO (scroll-scrubbing)

   Historia: una fresa grande sola → aparece el vaso BerryMood → llueven fresas
   y lo llenan → se vierte el chocolate y rellena los huecos → cae pistache →
   el vaso dibujado se funde con la foto real del hero y aparece el texto.

   - GSAP + ScrollTrigger, scrub suave. La sección se queda fija (pin) mientras
     dura la historia y luego el scroll sigue normal. Si subes, se regresa.
   - Una sola imagen de fresa (/images/fresa.webp) reutilizada con distintos
     tamaños, giros y posiciones.
   - Solo se anima transform y opacity (clip-path para los "revelados").
   - prefers-reduced-motion: no hay animación; se ve el hero terminado.
   ========================================================================== */

import { useRef, type CSSProperties, type ReactNode } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";

gsap.registerPlugin(ScrollTrigger, useGSAP);

/* ---------- AJUSTES (cambia aquí) ----------------------------------------- */
const CONFIG = {
  /** Máximo de fresas que caen (el vaso acomoda las que quepan). */
  strawberries: { desktop: 22, mobile: 14 },
  /** Tamaño de cada fresa, en % del ancho del vaso. Más grande = caben menos. */
  berrySize: { desktop: 24, mobile: 28 },
  /** Pedacitos de pistache. */
  pistachio: { desktop: 60, mobile: 36 },
  /** Cuánto scroll dura la historia, en "pantallas" (1 = alto de la pantalla). */
  scrollLength: { desktop: 3.4, mobile: 2.8 },
  /** Suavizado del scrub en segundos (1 = fluido; 0 = pegado al dedo). */
  scrub: 1,
  /** Tamaño de la fresa inicial respecto a las demás. */
  introScale: 2.3,
};

/* Línea de tiempo (unidades abstractas, el total se estira al scroll). */
const T = {
  cupIn: 0.25, // aparece el vaso
  firstDrop: 0.9, // la fresa grande cae
  rainStart: 1.9, // empiezan a caer las demás
  rainSpan: 3.3, // cuánto dura la lluvia
  pour: 5.6, // empieza el chocolate
  pourSpan: 2.4, // cuánto tarda en llenar
  pistachio: 8.3, // cae el pistache
  reveal: 9.3, // el vaso dibujado se funde con la foto real + texto
  end: 10,
};

/* ---------- Geometría del vaso (viewBox 720 × 1109, igual que la foto) ----- */
const VB = { w: 720, h: 1109 };
const RIM_Y = 18; // % del alto donde está el borde
const BOTTOM_Y = 98.1; // % del alto del fondo interior
const TOP_X = 4.5; // % pared izquierda arriba (derecha = 100 - x)
const BOTTOM_X = 19.5; // % pared izquierda abajo
const CHOC_TOP = 25; // % hasta donde sube el chocolate
const BERRY_ASPECT = 390 / 380; // alto / ancho de fresa.webp
const STAGE_ASPECT = VB.w / VB.h;

/* Random con semilla: mismo resultado en servidor y navegador. */
function seeded(seed: number) {
  let a = seed;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const wallX = (y: number) =>
  TOP_X + ((BOTTOM_X - TOP_X) * (y - RIM_Y)) / (BOTTOM_Y - RIM_Y);

type Slot = { x: number; y: number; rot: number; scale: number; flip: number }; // centro en % del vaso

/* Acomoda fresas de abajo hacia arriba, en filas, con variación natural. */
function packSlots(size: number, max: number, seed: number): Slot[] {
  const rnd = seeded(seed);
  const h = size * BERRY_ASPECT * STAGE_ASPECT; // alto de fresa en % del alto
  const slots: Slot[] = [];
  let y = BOTTOM_Y - h * 0.42;
  let row = 0;
  while (y > 14 && slots.length < max) {
    const yb = Math.min(BOTTOM_Y, y + h * 0.3);
    const left = Math.max(wallX(yb), TOP_X) + size * 0.42;
    const right = 100 - left;
    const n = Math.max(1, Math.floor((right - left) / (size * 0.8)) + 1);
    const rowSlots: Slot[] = [];
    for (let i = 0; i < n; i++) {
      const base = n === 1 ? 50 : left + ((right - left) * i) / (n - 1);
      const offset = row % 2 ? size * 0.18 : -size * 0.12;
      rowSlots.push({
        x: Math.min(right, Math.max(left, base + offset * (n > 1 ? 1 : 0) + (rnd() - 0.5) * size * 0.16)),
        y: y + (rnd() - 0.5) * h * 0.12,
        rot: (rnd() - 0.5) * 70,
        scale: 0.86 + rnd() * 0.26, // tamaños distintos
        flip: rnd() < 0.5 ? -1 : 1, // la mitad volteadas, para que no se vean iguales
      });
    }
    // dentro de la fila, orden aleatorio (caen sin patrón)
    rowSlots.sort(() => rnd() - 0.5);
    slots.push(...rowSlots);
    y -= h * 0.62;
    row++;
  }
  return slots.slice(0, max);
}

type Piece = { x: number; y: number; w: number; rot: number; shape: string; color: string };

const PISTACHIO_COLORS = ["#a9b56c", "#8e9b4c", "#c4bf74", "#76843d", "#b8a65e"];

function makePistachio(count: number, seed: number): Piece[] {
  const rnd = seeded(seed);
  return Array.from({ length: count }, () => {
    const x = 20 + rnd() * 60;
    const k = (x - 50) / 32;
    const mound = 21.5 - 8 * (1 - k * k); // montañita: más alto al centro
    const pts = Array.from({ length: 6 }, (_, j) => {
      const ang = (j / 6) * Math.PI * 2 + rnd() * 0.6;
      const r = 32 + rnd() * 18;
      return `${(50 + Math.cos(ang) * r).toFixed(1)}% ${(50 + Math.sin(ang) * r).toFixed(1)}%`;
    }).join(", ");
    return {
      x,
      y: mound + rnd() * 3,
      w: 3 + rnd() * 2.6,
      rot: rnd() * 360,
      shape: `polygon(${pts})`,
      color: PISTACHIO_COLORS[Math.floor(rnd() * PISTACHIO_COLORS.length)],
    };
  });
}

const MAX_BERRIES = Math.max(CONFIG.strawberries.desktop, CONFIG.strawberries.mobile);
const MAX_PIECES = Math.max(CONFIG.pistachio.desktop, CONFIG.pistachio.mobile);
const PIECES = makePistachio(MAX_PIECES, 7);

/* La pared del vaso por dentro, para recortar el chocolate. */
const INTERIOR = `polygon(${TOP_X}% ${RIM_Y}%, ${100 - TOP_X}% ${RIM_Y}%, ${100 - BOTTOM_X}% ${BOTTOM_Y}%, ${BOTTOM_X}% ${BOTTOM_Y}%)`;

export function HeroAssembly({ children }: { children: ReactNode }) {
  const root = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      ScrollTrigger.config({ ignoreMobileResize: true });

      mm.add(
        {
          desktop: "(min-width: 1024px) and (prefers-reduced-motion: no-preference)",
          mobile: "(max-width: 1023px) and (prefers-reduced-motion: no-preference)",
        },
        (ctx) => {
          const isDesktop = Boolean(ctx.conditions?.desktop);
          const q = gsap.utils.selector(root);
          const size = isDesktop ? CONFIG.berrySize.desktop : CONFIG.berrySize.mobile;
          const h = size * BERRY_ASPECT * STAGE_ASPECT;
          const max = isDesktop ? CONFIG.strawberries.desktop : CONFIG.strawberries.mobile;
          const slots = packSlots(size, max, 11);
          const berries = q<HTMLElement>("[data-berry]");
          const pieces = q<HTMLElement>("[data-piece]");
          const pieceCount = isDesktop ? CONFIG.pistachio.desktop : CONFIG.pistachio.mobile;
          const heroLayers = q<HTMLElement>("[data-hero-fade]");

          /* Posición en % del vaso → xPercent / yPercent (relativos al tamaño de
             cada fresa), así todo escala solo si cambia el tamaño de pantalla. */
          const toX = (cx: number) => ((cx - size / 2) / size) * 100;
          const toY = (cy: number) => ((cy - h / 2) / h) * 100;

          gsap.set(q("[data-assembly]"), { autoAlpha: 1 });
          gsap.set(heroLayers, { autoAlpha: 0 });
          gsap.set(q("[data-cup]"), { autoAlpha: 0, y: 40, scale: 0.95, transformOrigin: "50% 100%" });
          berries.forEach((b, i) => {
            if (i >= slots.length) return gsap.set(b, { display: "none" });
            gsap.set(b, { display: "block", autoAlpha: i === 0 ? 1 : 0 });
          });
          gsap.set(berries[0], {
            x: 0, // el CSS inicial ya traía un translate: se limpia para no sumarlo dos veces
            y: 0,
            xPercent: toX(50),
            yPercent: toY(40),
            rotation: -10,
            scale: CONFIG.introScale,
          });
          pieces.forEach((p, i) => gsap.set(p, { display: i < pieceCount ? "block" : "none", autoAlpha: 0 }));
          gsap.set(q("[data-choc-level]"), { yPercent: 100 });
          gsap.set(q("[data-choc-wave]"), { xPercent: 0 });
          gsap.set(q("[data-stream]"), { scaleY: 0, transformOrigin: "50% 0%", autoAlpha: 1 });
          gsap.set(q("[data-drizzle]"), { clipPath: "inset(0% 0% 100% 0%)" });

          const tl = gsap.timeline({
            defaults: { ease: "none" },
            scrollTrigger: {
              trigger: root.current,
              start: "top top",
              end: () =>
                "+=" + window.innerHeight * (isDesktop ? CONFIG.scrollLength.desktop : CONFIG.scrollLength.mobile),
              pin: true,
              scrub: CONFIG.scrub,
              anticipatePin: 1,
              invalidateOnRefresh: true,
            },
          });

          /* 1–2 · Aparece el vaso debajo de la fresa */
          tl.to(q("[data-cup]"), { autoAlpha: 1, y: 0, scale: 1, duration: 0.7, ease: "power2.out" }, T.cupIn);

          /* 3 · La fresa grande cae al fondo con un pequeño rebote */
          const s0 = slots[0];
          tl.to(
            berries[0],
            { xPercent: toX(s0.x), yPercent: toY(s0.y), scaleX: s0.scale * s0.flip, scaleY: s0.scale, rotation: s0.rot, duration: 0.85, ease: "power2.in" },
            T.firstDrop
          )
            .to(berries[0], { yPercent: toY(s0.y) - 7, duration: 0.1, ease: "power1.out" })
            .to(berries[0], { yPercent: toY(s0.y), duration: 0.1, ease: "power1.in" });

          /* 3 · Lluvia: cada vez más seguidas (exponente < 1) */
          for (let i = 1; i < slots.length; i++) {
            const s = slots[i];
            const at = T.rainStart + T.rainSpan * Math.pow((i - 1) / Math.max(1, slots.length - 1), 0.62);
            const fromY = toY(-18 - (i % 3) * 6); // arriba, fuera del vaso
            const drift = ((i * 37) % 11) - 5; // ligera deriva lateral
            tl.set(berries[i], { autoAlpha: 1, xPercent: toX(s.x + drift), yPercent: fromY, rotation: s.rot - 160, scaleX: s.scale * s.flip, scaleY: s.scale }, at)
              .to(
                berries[i],
                { xPercent: toX(s.x), yPercent: toY(s.y), rotation: s.rot, duration: 0.55, ease: "power2.in" },
                at
              )
              .to(berries[i], { yPercent: toY(s.y) - 5, duration: 0.07, ease: "power1.out" }, at + 0.55)
              .to(berries[i], { yPercent: toY(s.y), duration: 0.07, ease: "power1.in" }, at + 0.62);
          }

          /* 4 · Chocolate: chorro, nivel que sube con ondulación, chorro se corta */
          tl.to(q("[data-stream]"), { scaleY: 1, duration: 0.35, ease: "power1.in" }, T.pour)
            .to(q("[data-choc-level]"), { yPercent: 0, duration: T.pourSpan, ease: "sine.inOut" }, T.pour + 0.25)
            .to(q("[data-choc-wave]"), { xPercent: -50, duration: T.pourSpan + 0.4 }, T.pour + 0.2)
            .to(q("[data-drizzle]"), { clipPath: "inset(0% 0% 0% 0%)", duration: 0.7, ease: "power1.out" }, T.pour + T.pourSpan - 0.3)
            .set(q("[data-stream]"), { transformOrigin: "50% 100%" }, T.pour + T.pourSpan + 0.2)
            .to(q("[data-stream]"), { scaleY: 0, duration: 0.3, ease: "power1.out" }, T.pour + T.pourSpan + 0.2);

          /* 5 · Pistache triturado cae encima */
          PIECES.slice(0, pieceCount).forEach((p, i) => {
            const at = T.pistachio + i * 0.018;
            tl.set(pieces[i], { autoAlpha: 1, yPercent: -900, rotation: p.rot - 120 }, at).to(
              pieces[i],
              { yPercent: 0, rotation: p.rot, duration: 0.45, ease: "power2.in" },
              at
            );
          });

          /* 6 · El vaso dibujado se funde con la foto real y vuelve el texto */
          tl.to(q("[data-assembly]"), { autoAlpha: 0, duration: T.end - T.reveal, ease: "power1.inOut" }, T.reveal)
            .to(heroLayers, { autoAlpha: 1, duration: T.end - T.reveal, ease: "power1.inOut" }, T.reveal)
            .to({}, { duration: 0.0001 }, T.end);

          return () => {
            gsap.set(heroLayers, { clearProps: "opacity,visibility" });
          };
        }
      );
    },
    { scope: root }
  );

  return (
    <div ref={root} className="relative">
      {children}

      <div
        data-assembly
        aria-hidden="true"
        className="assembly pointer-events-none absolute inset-x-0 top-0 z-20 h-svh overflow-hidden"
        style={
          {
            "--bn-d": CONFIG.berrySize.desktop,
            "--bn-m": CONFIG.berrySize.mobile,
            "--intro": CONFIG.introScale,
          } as CSSProperties
        }
      >
        {/* El "escenario" mide igual que el vaso del hero para fundirse con él */}
        <div className="assembly-stage absolute top-1/2 left-1/2 aspect-[720/1109] h-[60svh] -translate-x-1/2 -translate-y-[46%] lg:h-[min(76vh,760px)]">
          {/* Fondo interior del vaso (vidrio de atrás) */}
          <svg data-cup viewBox={`0 0 ${VB.w} ${VB.h}`} className="absolute inset-0 h-full w-full">
            <defs>
              <linearGradient id="cupBack" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0" stopColor="#fbf7f1" stopOpacity="0.06" />
                <stop offset="1" stopColor="#fbf7f1" stopOpacity="0.02" />
              </linearGradient>
            </defs>
            <path d="M24 198 L136 1090 Q360 1104 584 1090 L696 198 Z" fill="url(#cupBack)" />
            <ellipse cx="360" cy="198" rx="336" ry="15" fill="none" stroke="#fbf7f1" strokeOpacity="0.14" strokeWidth="2" />
          </svg>

          {/* Chocolate detrás de las fresas: rellena los huecos */}
          <ChocolateFill />

          {/* Fresas: una sola imagen, reutilizada */}
          {Array.from({ length: MAX_BERRIES }, (_, i) => (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              key={i}
              data-berry
              src="/images/fresa.webp"
              alt=""
              decoding="async"
              draggable={false}
              className={`berry absolute top-0 left-0 h-auto will-change-transform ${i === 0 ? "berry-intro" : "opacity-0"}`}
            />
          ))}

          {/* Chocolate por delante, translúcido: se ven las fresas "bañadas" */}
          <ChocolateFill front />

          {/* Escurrido de chocolate sobre las fresas de arriba */}
          <svg data-drizzle viewBox={`0 0 ${VB.w} ${VB.h}`} className="absolute inset-0 h-full w-full">
            <defs>
              <linearGradient id="drizzle" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0" stopColor="#7a4524" />
                <stop offset="0.5" stopColor="#4f2b15" />
                <stop offset="1" stopColor="#3a1f0f" />
              </linearGradient>
            </defs>
            <path
              fill="url(#drizzle)"
              d="M90 250 C150 205 230 225 290 200 C350 178 410 214 470 196 C540 176 600 214 640 240
                 C650 262 630 284 600 278 L598 330 C597 352 578 352 576 330 L572 286
                 C540 296 520 300 496 296 L494 352 C493 378 470 378 468 352 L464 300
                 C420 306 380 296 350 304 L347 340 C346 360 326 360 325 340 L322 306
                 C280 312 240 300 206 296 L203 368 C202 392 180 392 179 368 L176 294
                 C140 290 110 284 90 270 C80 262 82 256 90 250 Z"
            />
            <path
              d="M140 238 C220 214 300 226 360 210 C420 198 500 220 580 230"
              fill="none"
              stroke="#c49a76"
              strokeOpacity="0.45"
              strokeWidth="6"
              strokeLinecap="round"
            />
          </svg>

          {/* Chorro de chocolate desde arriba */}
          <div
            data-stream
            className="absolute left-[48.6%] w-[2.8%] rounded-b-full"
            style={{
              top: "-60%",
              height: `${60 + CHOC_TOP + 2}%`,
              background: "linear-gradient(90deg, #3a1f0f 0%, #7a4524 45%, #a86a43 55%, #4f2b15 100%)",
            }}
          />

          {/* Vaso BerryMood por delante: plástico transparente + logo dorado */}
          <CupFront />

          {/* Pistache triturado */}
          {PIECES.map((p, i) => (
            <span
              key={i}
              data-piece
              className="absolute top-0 left-0 block aspect-square opacity-0"
              style={{
                left: `${p.x - p.w / 2}%`,
                top: `${p.y}%`,
                width: `${p.w}%`,
                clipPath: p.shape,
                background: `radial-gradient(circle at 35% 30%, #e3dc9c 0%, ${p.color} 55%, #5c6a2c 100%)`,
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

/* Relleno de chocolate recortado a la forma interior del vaso. El nivel sube
   moviendo una capa con transform; la ola de arriba se desliza de lado. */
function ChocolateFill({ front = false }: { front?: boolean }) {
  return (
    <div className="absolute inset-0" style={{ clipPath: INTERIOR, opacity: front ? 0.62 : 1 }}>
      <div data-choc-level className="absolute inset-x-0 bottom-0 will-change-transform" style={{ top: `${CHOC_TOP}%` }}>
        <div
          className="absolute inset-0"
          style={{
            background: front
              ? "linear-gradient(180deg, #5a3219 0%, #3a1f0f 100%)"
              : "linear-gradient(180deg, #6e3d1f 0%, #4f2b15 35%, #33190b 100%)",
          }}
        />
        {!front && (
          /* brillo vertical, como chocolate contra el plástico */
          <div
            className="absolute inset-y-0 left-[22%] w-[9%]"
            style={{ background: "linear-gradient(90deg, transparent, rgba(255,214,170,0.16), transparent)" }}
          />
        )}
        <svg
          data-choc-wave
          viewBox="0 0 400 20"
          preserveAspectRatio="none"
          className="absolute left-0 h-[3.2%] w-[200%] will-change-transform"
          style={{ top: "-3%" }}
        >
          <path
            d="M0 10 Q25 2 50 10 T100 10 T150 10 T200 10 T250 10 T300 10 T350 10 T400 10 V20 H0 Z"
            fill={front ? "#5a3219" : "#6e3d1f"}
          />
          {!front && (
            <path
              d="M0 10 Q25 2 50 10 T100 10 T150 10 T200 10 T250 10 T300 10 T350 10 T400 10"
              fill="none"
              stroke="#c49a76"
              strokeOpacity="0.55"
              strokeWidth="1.4"
            />
          )}
        </svg>
      </div>
    </div>
  );
}

/* El vaso BerryMood: plástico transparente con ceja en el borde, dos aros
   arriba, aros en la base y el logo impreso en dorado claro. */
function CupFront() {
  const ridge = (y: number) => {
    const t = (y - 198) / (1090 - 198);
    const l = 24 + (136 - 24) * t;
    const r = 720 - l;
    return `M${l} ${y} Q360 ${y + 12} ${r} ${y}`;
  };
  return (
    <svg data-cup viewBox={`0 0 ${VB.w} ${VB.h}`} className="absolute inset-0 h-full w-full">
      <defs>
        <linearGradient id="glass" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#ffffff" stopOpacity="0.2" />
          <stop offset="0.1" stopColor="#ffffff" stopOpacity="0.06" />
          <stop offset="0.5" stopColor="#ffffff" stopOpacity="0.015" />
          <stop offset="0.88" stopColor="#ffffff" stopOpacity="0.06" />
          <stop offset="1" stopColor="#ffffff" stopOpacity="0.18" />
        </linearGradient>
        <filter id="soft" x="-20%" y="-5%" width="140%" height="110%">
          <feGaussianBlur stdDeviation="6" />
        </filter>
      </defs>
      <path
        d="M24 198 L136 1090 Q360 1104 584 1090 L696 198 Z"
        fill="url(#glass)"
        stroke="#ffffff"
        strokeOpacity="0.32"
        strokeWidth="2.5"
      />
      {/* reflejos verticales */}
      <path d="M78 250 L104 250 L190 1040 L170 1040 Z" fill="#ffffff" opacity="0.16" filter="url(#soft)" />
      <path d="M642 250 L654 250 L560 1040 L552 1040 Z" fill="#ffffff" opacity="0.12" filter="url(#soft)" />
      {/* aros del vaso */}
      <path d={ridge(300)} fill="none" stroke="#ffffff" strokeOpacity="0.22" strokeWidth="2" />
      <path d={ridge(352)} fill="none" stroke="#ffffff" strokeOpacity="0.16" strokeWidth="2" />
      <path d={ridge(1000)} fill="none" stroke="#ffffff" strokeOpacity="0.18" strokeWidth="2" />
      <path d={ridge(1046)} fill="none" stroke="#ffffff" strokeOpacity="0.14" strokeWidth="2" />
      {/* ceja del borde */}
      <ellipse cx="360" cy="198" rx="340" ry="17" fill="none" stroke="#ffffff" strokeOpacity="0.6" strokeWidth="5" />
      <ellipse cx="360" cy="212" rx="334" ry="15" fill="none" stroke="#ffffff" strokeOpacity="0.2" strokeWidth="2" />
      {/* logo impreso */}
      <image href="/images/logo-vaso.webp" x="185" y="540" width="350" height="345" opacity="0.95" />
    </svg>
  );
}
