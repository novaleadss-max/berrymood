"use client";

import Image from "next/image";
import { motion, useReducedMotion, type Transition } from "motion/react";
import { ArrowUpRight, MapPin } from "lucide-react";

import { Button } from "@/components/ui/button";
import { InstagramIcon, Leaf, Sparkle } from "@/components/icons";
import { site } from "@/lib/site";

const easeOut = [0.23, 1, 0.32, 1] as const;

const stats = [
  { value: "100%", label: "Chocolate belga", note: "en cada baño" },
  { value: "1 × 1", label: "Fresas", note: "escogidas a mano" },
  { value: "∞", label: "Combinaciones", note: "tú armas la tuya" },
];

/* Same beat as the reference: the product arrives alone, then the interface settles around it. */
export function Hero() {
  const reduce = useReducedMotion();

  const rise = (delay: number, distance = 14): {
    initial: { opacity: number; transform: string };
    animate: { opacity: number; transform: string };
    transition: Transition;
  } => ({
    initial: { opacity: 0, transform: reduce ? "none" : `translateY(${distance}px)` },
    animate: { opacity: 1, transform: reduce ? "none" : "translateY(0px)" },
    transition: { duration: reduce ? 0.4 : 0.6, delay: reduce ? 0 : delay, ease: easeOut },
  });

  const line = (i: number) => ({
    initial: {
      opacity: 0,
      clipPath: reduce ? "inset(0 0 0 0)" : "inset(0 0 100% 0)",
      transform: reduce ? "none" : "translateY(24px)",
    },
    animate: { opacity: 1, clipPath: "inset(0 0 -20% 0)", transform: "translateY(0px)" },
    transition: {
      duration: reduce ? 0.4 : 0.75,
      delay: reduce ? 0 : 0.45 + i * 0.08,
      ease: easeOut,
    },
  });

  return (
    <section
      id="inicio"
      aria-labelledby="hero-title"
      className="grain relative isolate overflow-hidden bg-chocolate-900"
    >
      {/* Warm pool of light behind the cup — the "sea" of the reference, in chocolate. */}
      <div
        aria-hidden="true"
        className="absolute inset-0 -z-10"
        style={{
          background:
            "radial-gradient(60% 55% at 50% 52%, #5a3219 0%, #3a2112 38%, #1e1109 72%, #170c06 100%)",
        }}
      />

      {/* Gold ring echoing the logo's circle, with the lab name running around it. */}
      <motion.div
        aria-hidden="true"
        className="pointer-events-none absolute top-[58%] left-1/2 -z-10 aspect-square w-[min(118vw,560px)] -translate-x-1/2 -translate-y-1/2 lg:top-1/2 lg:w-[min(78vh,820px)]"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8, delay: reduce ? 0 : 0.2, ease: easeOut }}
      >
        <div className="absolute inset-0 rounded-full border border-gold/35" />
        <div className="absolute inset-[7%] rounded-full border border-gold/10" />
        <svg viewBox="0 0 400 400" className="spin-slow absolute inset-[2.5%] h-[95%] w-[95%]">
          <defs>
            <path id="ring" d="M200,200 m-186,0 a186,186 0 1,1 372,0 a186,186 0 1,1 -372,0" />
          </defs>
          <text
            fill="#c2883a"
            fillOpacity="0.55"
            fontSize="11"
            letterSpacing="6"
            style={{ fontFamily: "var(--font-jost)" }}
          >
            <textPath href="#ring">
              CHOCOLATE &amp; BERRY LAB · BERRY YOUR MOOD · CHILPANCINGO · CHOCOLATE &amp; BERRY
              LAB · BERRY YOUR MOOD · CHILPANCINGO ·
            </textPath>
          </text>
        </svg>
        <span className="absolute top-1/2 left-0 size-2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-gold" />
        <span className="absolute top-1/2 right-0 size-2 translate-x-1/2 -translate-y-1/2 rounded-full bg-gold" />
      </motion.div>

      <div className="relative mx-auto grid min-h-[100svh] max-w-[1440px] grid-cols-1 gap-y-10 px-4 pt-28 pb-8 sm:px-8 lg:grid-cols-12 lg:grid-rows-[1fr_auto] lg:gap-x-6 lg:px-12 lg:pt-24 lg:pb-8">
        {/* Headline */}
        <div className="relative z-20 lg:col-span-6 lg:row-start-1 lg:self-center">
          <motion.p
            {...rise(0.35)}
            className="mb-6 flex items-center gap-3 text-[0.7rem] font-medium tracking-[0.32em] text-gold"
          >
            <Leaf className="h-3 w-5" />
            CHOCOLATE &amp; BERRY LAB
          </motion.p>

          <h1
            id="hero-title"
            className="font-heading text-fluid-hero leading-[0.92] lg:text-[length:min(8.5rem,12vh)] font-normal tracking-[-0.02em]"
          >
            <motion.span {...line(0)} className="text-gilded-dim -mb-[0.1em] block pb-[0.16em]">
              Berry
            </motion.span>
            <span className="flex items-center gap-4 sm:gap-6">
              <motion.span
                {...rise(0.75, 8)}
                className="hidden shrink-0 items-center gap-3 sm:flex"
                aria-hidden="true"
              >
                <span className="flex -space-x-2">
                  <span className="size-7 rounded-full border-2 border-chocolate-900 bg-[#b3261e]" />
                  <span className="size-7 rounded-full border-2 border-chocolate-900 bg-chocolate-600" />
                  <span className="size-7 rounded-full border-2 border-chocolate-900 bg-[#a7b36a]" />
                </span>
                <span className="font-body text-xs leading-tight tracking-normal text-cream/75">
                  Fresa, chocolate
                  <br />y tu topping
                </span>
              </motion.span>
              <motion.span {...line(1)} className="text-gilded -mb-[0.1em] block pb-[0.16em] pr-[0.08em] italic">
                Your
              </motion.span>
            </span>
            <motion.span {...line(2)} className="text-gilded -mb-[0.1em] block pb-[0.16em]">
              Mood.
            </motion.span>
          </h1>

          <motion.p
            {...rise(0.8)}
            className="mt-6 max-w-[34ch] text-fluid-base leading-relaxed text-cream/80"
          >
            Fresas escogidas una por una, chocolate belga y toppings que vamos cambiando. Un postre
            de siempre, servido como si fuera ocasión especial.
          </motion.p>

          <motion.div {...rise(0.9)} className="mt-8 flex flex-wrap items-center gap-3 sm:gap-5">
            <Button asChild variant="cream" size="lg">
              <a href={site.instagram.url} target="_blank" rel="noopener noreferrer">
                <InstagramIcon className="size-4" />
                Síguenos en Instagram
                <ArrowUpRight className="size-4" aria-hidden="true" />
                <span className="sr-only">(abre en otra pestaña)</span>
              </a>
            </Button>
            <Button asChild variant="ghost" size="lg" className="px-4">
              <a href="#visitanos">
                <MapPin className="size-4 text-gold" aria-hidden="true" />
                Galerías Chilpancingo
              </a>
            </Button>
          </motion.div>
        </div>

        {/* The cup — centered like the yacht, sitting between the words and the details. */}
        <motion.div
          className="relative z-10 mx-auto w-[min(78vw,340px)] lg:pointer-events-none lg:absolute lg:top-1/2 lg:left-1/2 lg:w-auto lg:-translate-x-1/2 lg:-translate-y-[46%]"
          initial={{ opacity: 0, transform: reduce ? "none" : "translateY(32px) scale(0.95)" }}
          animate={{ opacity: 1, transform: "translateY(0px) scale(1)" }}
          transition={{ duration: reduce ? 0.4 : 0.8, ease: easeOut }}
        >
          <Image
            src="/images/vaso-pistache.png"
            alt="Vaso BerryMood con capas de fresa, chocolate belga y pistache troceado encima"
            width={720}
            height={1109}
            preload
            sizes="(min-width: 1024px) 480px, 78vw"
            className="h-auto w-full drop-shadow-[0_40px_60px_rgba(10,4,1,0.65)] lg:h-[min(76vh,760px)] lg:w-auto"
          />
        </motion.div>

        {/* Right column note */}
        <motion.div
          {...rise(1.0)}
          className="relative z-20 hidden lg:col-span-3 lg:col-start-10 lg:row-start-1 lg:block lg:self-center lg:justify-self-end"
        >
          <p className="font-heading text-2xl leading-snug text-cream">
            Una fresa simple,
            <br />
            <span className="text-cream/55 italic">convertida en momento.</span>
          </p>
          <div className="mt-6 inline-flex items-center gap-3 rounded-full border border-gold/25 bg-chocolate-950/40 py-2 pr-5 pl-2">
            <span className="grid size-10 place-items-center rounded-full bg-gold/15">
              <Sparkle className="size-4 text-gold" />
            </span>
            <span className="text-xs tracking-[0.18em] text-cream/80">HECHO AL MOMENTO</span>
          </div>
        </motion.div>

        {/* Stats row */}
        <motion.dl
          {...rise(1.05)}
          className="relative z-20 grid grid-cols-3 gap-4 border-t border-gold/20 pt-6 lg:col-span-6 lg:row-start-2 lg:self-end lg:border-t-0 lg:pt-0"
        >
          {stats.map((s, i) => (
            <div
              key={s.label}
              className={`flex flex-col-reverse ${i > 0 ? "border-l border-gold/20 pl-4 sm:pl-6" : ""}`}
            >
              <dt className="mt-2 text-[0.6rem] font-medium tracking-[0.1em] text-cream uppercase sm:text-[0.7rem] sm:tracking-[0.2em]">
                {s.label}
                <span className="mt-1 block text-[0.7rem] font-normal tracking-normal text-cream-muted normal-case">
                  {s.note}
                </span>
              </dt>
              <dd className="font-heading text-3xl text-cream sm:text-4xl">{s.value}</dd>
            </div>
          ))}
        </motion.dl>

        {/* Floating card — the reference's "side view" panel, as the house favorite. */}
        <motion.aside
          {...rise(1.15, 20)}
          aria-label="Favorito de la casa"
          className="relative z-20 overflow-hidden rounded-3xl border border-gold/20 bg-chocolate-950/55 p-5 backdrop-blur-md lg:col-span-4 lg:col-start-9 lg:row-start-2 lg:self-end lg:p-6"
        >
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-[0.65rem] tracking-[0.28em] text-gold">FAVORITO DE LA CASA</p>
              <p className="mt-2 font-heading text-2xl text-cream">Vaso Pistache</p>
            </div>
            <span className="font-heading text-5xl leading-none text-cream/90 italic">
              01
            </span>
          </div>
          <div className="mt-5 flex items-end justify-between gap-4 border-t border-gold/15 pt-4">
            <ul className="flex gap-5 text-[0.7rem] tracking-[0.16em] text-cream-muted uppercase">
              <li>Fresa</li>
              <li>Chocolate belga</li>
              <li>Pistache</li>
            </ul>
          </div>
        </motion.aside>
      </div>
    </section>
  );
}
