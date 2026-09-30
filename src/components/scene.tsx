"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { motion, useReducedMotion, useScroll, useTransform } from "motion/react";

import { cn } from "@/lib/utils";

/* One "page" of the stack. When its end reaches the bottom of the screen it holds
   still (sticky), the next scene slides up over it, and it recedes: shrinks a touch
   and darkens. The seam between sections disappears, so scrolling reads as a scene
   change rather than a page moving past.

   - Sticky `top` is negative for scenes taller than the screen, so they scroll
     normally until their last screenful, then hold.
   - Progress is measured on a sentinel right after the scene: sticky elements move,
     the sentinel doesn't.
   - `overflow: clip` rounds the corners without creating a scroll container, so the
     pinned "Arma tu mood" scene inside keeps working. */

export function Scene({
  children,
  layer,
  covers = false,
  recedes = true,
  className,
}: {
  children: ReactNode;
  layer: number;
  covers?: boolean;
  recedes?: boolean;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const end = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();
  const [geo, setGeo] = useState({ top: 0, origin: "50% 50%" });

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const measure = () => {
      const h = el.offsetHeight;
      const vh = window.innerHeight;
      // Recede around the middle of the part that's still on screen.
      setGeo({ top: Math.min(0, vh - h), origin: `50% ${Math.max(h / 2, h - vh / 2)}px` });
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    window.addEventListener("resize", measure);
    return () => {
      ro.disconnect();
      window.removeEventListener("resize", measure);
    };
  }, []);

  const { scrollYProgress: p } = useScroll({ target: end, offset: ["start end", "start start"] });
  // Function transforms: computed in JS, exact at the clamped ends.
  const transform = useTransform(p, (v) => (v <= 0 || reduce || !recedes ? "none" : `scale(${1 - 0.07 * v})`));
  const dim = useTransform(p, (v) => (recedes ? Math.min(1, Math.max(0, v)) * 0.7 : 0));

  return (
    <>
      <div
        ref={ref}
        className={cn(
          "sticky",
          covers && "overflow-clip rounded-t-[28px] shadow-[0_-24px_60px_rgba(10,4,1,0.55)] sm:rounded-t-[40px]",
          className
        )}
        style={{ top: geo.top, zIndex: layer }}
      >
        <motion.div style={{ transform, transformOrigin: geo.origin }}>{children}</motion.div>
        <motion.div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 bg-chocolate-950"
          style={{ opacity: dim }}
        />
      </div>
      <div ref={end} aria-hidden="true" className="h-0" />
    </>
  );
}
