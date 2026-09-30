"use client";

import { useRef, type ReactNode } from "react";
import { motion, useReducedMotion, useScroll, useTransform } from "motion/react";

/* Rolex-style continuity: no cuts between sections. Content surfaces gradually as
   its section rises into view and dissolves upward as it leaves, all tied to the
   scroll position (never time-based), while the section backgrounds fade into each
   other with gradients. Reduced motion: opacity only, no travel. */

export function Blend({
  children,
  enter = true,
  exit = true,
}: {
  children: ReactNode;
  enter?: boolean;
  exit?: boolean;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();

  const { scrollYProgress: a } = useScroll({ target: ref, offset: ["start 0.95", "start 0.3"] });
  const { scrollYProgress: b } = useScroll({ target: ref, offset: ["end 0.7", "end 0.05"] });

  const ease = (v: number) => 1 - Math.pow(1 - Math.min(1, Math.max(0, v)), 3);

  // Function transforms: computed in JS so the clamped ends are exact.
  const opacity = useTransform([a, b], ([va, vb]: number[]) => {
    const inn = enter ? ease(va) : 1;
    const out = exit ? ease(vb) : 0;
    return inn * (1 - out);
  });
  const transform = useTransform([a, b], ([va, vb]: number[]) => {
    const inn = enter ? ease(va) : 1;
    const out = exit ? ease(vb) : 0;
    if (reduce || (inn >= 1 && out <= 0)) return "none";
    const y = (1 - inn) * 64 - out * 48;
    const s = 0.96 + 0.04 * inn;
    return `translateY(${y.toFixed(2)}px) scale(${s.toFixed(4)})`;
  });

  return (
    <motion.div ref={ref} style={{ opacity, transform }}>
      {children}
    </motion.div>
  );
}
