"use client";

import { useEffect, useState, type ReactNode } from "react";

/* Apple-style product bar: transparent over the hero (so the hero looks exactly as
   before), then a thin translucent chocolate bar with background blur once you scroll.
   Only colors fade; nothing moves, so it never competes with the content. */
export function HeaderShell({ children }: { children: ReactNode }) {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header data-scrolled={scrolled} className="site-bar fixed inset-x-0 top-0 z-40">
      {children}
    </header>
  );
}
