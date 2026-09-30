"use client";

import Image from "next/image";
import { useRef } from "react";
import {
  motion,
  useMotionTemplate,
  useReducedMotion,
  useScroll,
  useTransform,
  type MotionValue,
} from "motion/react";

import { Reveal } from "@/components/reveal";

/* Scroll-linked scenes for sections 2+. Marketing surface: motion is tied to the
   scrollbar, so it can never lag or block reading. Transform and opacity only.
   Reduced motion: every scene renders static. */

/* ---------- Quiénes somos: the photo drifts inside its arch ---------- */

export function ParallaxArch() {
  const ref = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();
  const { scrollYProgress: p } = useScroll({ target: ref, offset: ["start end", "end start"] });

  const imgY = useTransform(p, [0, 1], [-7, 7]);
  const frameY = useTransform(p, [0, 1], [56, -56]);
  const imgTransform = useMotionTemplate`translateY(${imgY}%) scale(1.16)`;
  const frameTransform = useMotionTemplate`translateY(${frameY}px)`;

  return (
    <motion.div
      ref={ref}
      style={reduce ? undefined : { transform: frameTransform }}
      className="relative mx-auto max-w-md rounded-t-full border border-gold/40 p-2 lg:mx-0"
    >
      <div className="overflow-hidden rounded-t-full">
        <motion.div style={reduce ? undefined : { transform: imgTransform }}>
          <Image
            src="/images/vaso-pistache-original.jpg"
            alt="Vaso de fresas con chocolate premium y pistache, con el logo de BerryMood, sobre una mesa de mármol"
            width={853}
            height={1280}
            sizes="(min-width: 1024px) 420px, 90vw"
            className="h-auto w-full"
          />
        </motion.div>
      </div>
    </motion.div>
  );
}

/* ---------- Arma tu mood: pinned cup, steps advance with the scroll ---------- */

type Step = { title: string; body: string };

export function MoodScrolly({ steps }: { steps: Step[] }) {
  const ref = useRef<HTMLElement>(null);
  const reduce = useReducedMotion();
  const { scrollYProgress: p } = useScroll({ target: ref, offset: ["start start", "end end"] });

  // The cup turns toward you on each step, like a watch being presented.
  const rotate = useTransform(p, [0, 0.33, 0.66, 1], [-16, 4, -7, 6]);
  const scale = useTransform(p, [0, 0.33, 0.66, 1], [0.84, 1.06, 0.98, 1.02]);
  const lift = useTransform(p, [0, 1], [32, -32]);
  const cup = useMotionTemplate`translateY(${lift}px) rotate(${rotate}deg) scale(${scale})`;

  const ringTurn = useTransform(p, [0, 1], [0, -140]);
  const ring = useMotionTemplate`rotate(${ringTurn}deg)`;
  const glow = useTransform(p, [0, 0.5, 1], [0.35, 0.8, 0.5]);
  const fill = useMotionTemplate`scaleX(${p})`;

  // Enter/leave like the other sections: surface while rising, dissolve upward when done.
  const { scrollYProgress: rise } = useScroll({ target: ref, offset: ["start 0.95", "start 0.65"] });
  const { scrollYProgress: leave } = useScroll({ target: ref, offset: ["end 0.6", "end 0"] });
  const easeOut3 = (v: number) => 1 - Math.pow(1 - Math.min(1, Math.max(0, v)), 3);
  const stageOpacity = useTransform([rise, leave], ([i, o]: number[]) => easeOut3(i) * (1 - 0.35 * easeOut3(o)));
  const stageTransform = useTransform([rise, leave], ([i, o]: number[]) => {
    const inn = easeOut3(i);
    const out = easeOut3(o);
    if (inn >= 1 && out <= 0) return "none";
    return `translateY(${((1 - inn) * 28 - out * 36).toFixed(2)}px)`;
  });

  if (reduce) return <StaticMood steps={steps} />;

  return (
    <section
      ref={ref}
      id="arma-tu-mood"
      aria-labelledby="arma-title"
      className="relative scroll-mt-4 bg-chocolate-800"
      style={{ height: `${steps.length * 100 + 60}svh` }}
    >
      <div className="sticky top-0 h-[100svh] overflow-hidden">
        <motion.div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0"
          style={{
            opacity: glow,
            background: "radial-gradient(45% 50% at 30% 55%, #5a3219 0%, rgba(42,24,12,0) 70%)",
          }}
        />

        <motion.div
          style={{ opacity: stageOpacity, transform: stageTransform }}
          className="relative mx-auto flex h-full max-w-[1440px] flex-col px-4 pt-20 pb-8 sm:px-8 lg:grid lg:grid-cols-12 lg:items-center lg:gap-6 lg:px-12 lg:py-0">
          {/* Cup */}
          <div className="relative order-2 flex min-h-0 flex-1 items-center justify-center lg:order-1 lg:col-span-6 lg:h-full">
            <motion.div
              aria-hidden="true"
              style={{ transform: ring }}
              className="absolute aspect-square h-[88%] max-h-[640px] rounded-full border border-gold/25"
            >
              <span className="absolute top-1/2 left-0 size-2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-gold" />
              <span className="absolute top-0 left-1/2 size-1.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-gold/60" />
              <span className="absolute top-1/2 right-0 size-2 translate-x-1/2 -translate-y-1/2 rounded-full bg-gold" />
            </motion.div>
            <motion.div style={{ transform: cup }} className="relative h-[92%] max-h-[720px]">
              <Image
                src="/images/vaso-pistache.png"
                alt="Vaso BerryMood de fresa, chocolate premium y pistache"
                width={720}
                height={1109}
                sizes="(min-width: 1024px) 460px, 60vw"
                className="h-full w-auto drop-shadow-[0_40px_60px_rgba(10,4,1,0.6)]"
              />
            </motion.div>
          </div>

          {/* Copy: `contents` on mobile so heading, cup and steps stack in order */}
          <div className="contents lg:order-2 lg:col-span-5 lg:col-start-8 lg:block">
          <div className="relative order-1">
            <h2 id="arma-title" className="text-fluid-xl leading-[1.02] font-normal text-cream lg:text-fluid-2xl">
              Arma tu mood en <span className="text-gilded italic">tres pasos.</span>
            </h2>
            <p className="mt-3 hidden max-w-[40ch] leading-relaxed text-cream-muted lg:block">
              Tú eliges la combinación. Nosotros nos encargamos de que salga perfecta, cada vez.
            </p>

            <div aria-hidden="true" className="mt-5 lg:mt-10">
              <div className="flex justify-between font-heading text-sm text-gold italic">
                {steps.map((_, i) => (
                  <span key={i}>{String(i + 1).padStart(2, "0")}</span>
                ))}
              </div>
              <div className="mt-2 h-px bg-gold/20">
                <motion.div style={{ transform: fill }} className="h-px origin-left bg-gold" />
              </div>
            </div>
          </div>

          <ol className="relative order-3 mt-4 h-[9.5rem] sm:h-[8.5rem] lg:mt-10 lg:h-[12rem]">
            {steps.map((step, i) => (
              <MoodStep key={step.title} step={step} i={i} n={steps.length} p={p} />
            ))}
          </ol>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

function MoodStep({ step, i, n, p }: { step: Step; i: number; n: number; p: MotionValue<number> }) {
  const s = i / n;
  const e = (i + 1) / n;
  const f = 0.07;
  const first = i === 0;
  const last = i === n - 1;

  const input = first ? [0, e - f, e] : last ? [s, s + f, 1] : [s, s + f, e - f, e];
  const opacityOut = first ? [1, 1, 0] : last ? [0, 1, 1] : [0, 1, 1, 0];
  const yOut = first ? [0, 0, -28] : last ? [28, 0, 0] : [28, 0, 0, -28];

  // Function transforms run in JS: the accelerated scroll-timeline path mis-maps
  // clamped keyframes here and left step 1 half-visible under the others.
  const opacity = useTransform(p, (v) => lerpSteps(v, input, opacityOut));
  const y = useTransform(p, (v) => lerpSteps(v, input, yOut));
  const transform = useMotionTemplate`translateY(${y}px)`;

  return (
    <motion.li style={{ opacity, transform }} className="absolute inset-x-0 top-0">
      <div className="flex items-baseline gap-4">
        <span className="font-heading text-4xl text-gold italic lg:text-5xl">{i + 1}</span>
        <h3 className="text-fluid-xl font-normal text-cream">{step.title}</h3>
      </div>
      <p className="mt-3 max-w-[40ch] leading-relaxed text-cream-muted">{step.body}</p>
    </motion.li>
  );
}

function lerpSteps(v: number, input: number[], output: number[]) {
  if (v <= input[0]) return output[0];
  for (let k = 1; k < input.length; k++) {
    if (v <= input[k]) {
      const t = (v - input[k - 1]) / (input[k] - input[k - 1]);
      return output[k - 1] + (output[k] - output[k - 1]) * t;
    }
  }
  return output[output.length - 1];
}

function StaticMood({ steps }: { steps: Step[] }) {
  return (
    <section
      id="arma-tu-mood"
      aria-labelledby="arma-title"
      className="relative scroll-mt-4 overflow-hidden bg-chocolate-800 py-section"
    >
      <div className="mx-auto max-w-[1440px] px-4 sm:px-8 lg:px-12">
        <Reveal className="grid gap-6 lg:grid-cols-12 lg:items-end">
          <h2 id="arma-title" className="text-fluid-2xl leading-[1.02] font-normal text-cream lg:col-span-7">
            Arma tu mood en <span className="text-gilded italic">tres pasos.</span>
          </h2>
          <p className="max-w-[40ch] leading-relaxed text-cream-muted lg:col-span-4 lg:col-start-9">
            Tú eliges la combinación. Nosotros nos encargamos de que salga perfecta, cada vez.
          </p>
        </Reveal>
        <ol className="mt-16 grid gap-12 md:grid-cols-3 md:gap-8 lg:mt-24">
          {steps.map((step, i) => (
            <Reveal key={step.title} as="li" delay={i * 0.08}>
              <span className="inline-grid size-[5.2rem] place-items-center rounded-full border border-gold/50 font-heading text-4xl text-gold italic">
                {i + 1}
              </span>
              <h3 className="mt-8 text-fluid-xl font-normal text-cream">{step.title}</h3>
              <p className="mt-3 max-w-[32ch] leading-relaxed text-cream-muted">{step.body}</p>
            </Reveal>
          ))}
        </ol>
      </div>
    </section>
  );
}

/* ---------- Visítanos: the logo turns like a bezel and settles upright ---------- */

export function BezelLogo() {
  const ref = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();
  const { scrollYProgress: p } = useScroll({ target: ref, offset: ["start end", "center center"] });

  const turn = useTransform(p, [0, 1], [-110, 0]);
  const size = useTransform(p, [0, 1], [0.86, 1]);
  const counter = useTransform(p, [0, 1], [70, 0]);
  const logo = useMotionTemplate`rotate(${turn}deg) scale(${size})`;
  const ring = useMotionTemplate`rotate(${counter}deg)`;

  return (
    <div ref={ref} className="relative mx-auto aspect-square w-[86%] max-w-[460px]">
      <motion.div
        aria-hidden="true"
        style={reduce ? undefined : { transform: ring }}
        className="absolute inset-[-6%] rounded-full border border-dashed border-gold/25"
      />
      <motion.div style={reduce ? undefined : { transform: logo }}>
        <Image
          src="/images/logo-crema.png"
          alt="Logotipo de BerryMood: monograma BM dentro de un círculo dorado con el texto Chocolate & Berry Lab"
          width={884}
          height={872}
          sizes="(min-width: 1024px) 460px, 90vw"
          className="h-auto w-full"
        />
      </motion.div>
    </div>
  );
}
