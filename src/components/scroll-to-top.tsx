"use client";

import { useEffect } from "react";

/* Mobile browsers restore the last scroll position on reload, so returning visitors
   landed at the footer. Always open at the hero unless the URL points to a section. */
export function ScrollToTop() {
  useEffect(() => {
    if ("scrollRestoration" in history) history.scrollRestoration = "manual";
    if (!window.location.hash) window.scrollTo({ top: 0, left: 0, behavior: "instant" });
  }, []);

  return null;
}
