"use client";

import { motion, useReducedMotion } from "motion/react";
import type { ReactNode } from "react";

const easeOut = [0.23, 1, 0.32, 1] as const;

/* Scroll reveal for marketing sections. Fires once. Reduced motion keeps the fade, drops the travel. */
export function Reveal({
  children,
  delay = 0,
  className,
  as = "div",
}: {
  children: ReactNode;
  delay?: number;
  className?: string;
  as?: "div" | "li" | "article";
}) {
  const reduce = useReducedMotion();
  const Comp = motion[as];

  return (
    <Comp
      className={className}
      initial={{ opacity: 0, transform: reduce ? "none" : "translateY(24px)" }}
      whileInView={{ opacity: 1, transform: reduce ? "none" : "translateY(0px)" }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: reduce ? 0.4 : 0.7, delay, ease: easeOut }}
    >
      {children}
    </Comp>
  );
}

/* Draws a hairline left to right once it scrolls into view. Reduced motion: fade only. */
export function DrawLine({ className }: { className?: string }) {
  const reduce = useReducedMotion();

  return (
    <motion.span
      aria-hidden="true"
      className={className}
      initial={reduce ? { opacity: 0 } : { clipPath: "inset(0 100% 0 0)" }}
      whileInView={reduce ? { opacity: 1 } : { clipPath: "inset(0 0% 0 0)" }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: reduce ? 0.4 : 0.9, delay: 0.15, ease: [0.77, 0, 0.175, 1] }}
    />
  );
}
