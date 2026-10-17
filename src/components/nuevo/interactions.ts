/* =============================================================================
   MICROINTERACCIONES

   - Cursor propio (punto con mezcla de color) que cambia según lo que toca.
   - Botones magnéticos: se acercan al cursor y regresan con resorte.
   - Tilt 3D en tarjetas.
   - Marquees infinitos que aceleran (y cambian de sentido) con el scroll.
   - Sorpresa: chocolate que se derrite siguiendo el cursor/dedo.

   Todo lo de cursor, imán y tilt solo existe con mouse (hover: hover, pointer: fine).
   ========================================================================== */

import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { COLOR, SORPRESAS, TIEMPO } from "./config";

type Cleanup = () => void;

export const finePointer = () => window.matchMedia("(hover: hover) and (pointer: fine)").matches;

/* ---------- Cursor ------------------------------------------------------ */
export function createCursor(el: HTMLElement, label: HTMLElement): Cleanup {
  if (!finePointer()) return () => {};
  el.style.display = "block";
  const x = gsap.quickTo(el, "x", { duration: TIEMPO.cursor, ease: "power3.out" });
  const y = gsap.quickTo(el, "y", { duration: TIEMPO.cursor, ease: "power3.out" });
  let shown = false;

  const move = (e: PointerEvent) => {
    if (e.pointerType !== "mouse") return;
    if (!shown) {
      gsap.set(el, { x: e.clientX, y: e.clientY });
      gsap.to(el, { autoAlpha: 1, duration: 0.3 });
      shown = true;
    }
    x(e.clientX);
    y(e.clientY);
  };
  const over = (e: PointerEvent) => {
    const t = (e.target as HTMLElement).closest<HTMLElement>("[data-cursor], a, button, [role=button]");
    const mode = t?.dataset.cursor ?? (t ? "link" : "");
    el.dataset.mode = mode;
    label.textContent = mode && mode !== "link" ? mode : "";
  };
  const leave = () => {
    gsap.to(el, { autoAlpha: 0, duration: 0.2 });
    shown = false;
  };
  const down = () => el.classList.add("is-down");
  const up = () => el.classList.remove("is-down");

  window.addEventListener("pointermove", move, { passive: true });
  document.addEventListener("pointerover", over);
  document.documentElement.addEventListener("pointerleave", leave);
  window.addEventListener("pointerdown", down);
  window.addEventListener("pointerup", up);
  return () => {
    window.removeEventListener("pointermove", move);
    document.removeEventListener("pointerover", over);
    document.documentElement.removeEventListener("pointerleave", leave);
    window.removeEventListener("pointerdown", down);
    window.removeEventListener("pointerup", up);
  };
}

/* ---------- Botones magnéticos ------------------------------------------ */
export function createMagnetic(root: HTMLElement): Cleanup {
  if (!finePointer()) return () => {};
  const offs: Cleanup[] = [];
  root.querySelectorAll<HTMLElement>("[data-magnetic]").forEach((el) => {
    const strength = Number(el.dataset.magnetic) || 0.35;
    const inner = el.querySelector<HTMLElement>("[data-magnetic-inner]");
    const xTo = gsap.quickTo(el, "x", { duration: TIEMPO.botonMagnetico, ease: "power3.out" });
    const yTo = gsap.quickTo(el, "y", { duration: TIEMPO.botonMagnetico, ease: "power3.out" });
    const ixTo = inner && gsap.quickTo(inner, "x", { duration: TIEMPO.botonMagnetico, ease: "power3.out" });
    const iyTo = inner && gsap.quickTo(inner, "y", { duration: TIEMPO.botonMagnetico, ease: "power3.out" });
    const move = (e: PointerEvent) => {
      const r = el.getBoundingClientRect();
      const dx = e.clientX - (r.left + r.width / 2);
      const dy = e.clientY - (r.top + r.height / 2);
      xTo(dx * strength);
      yTo(dy * strength);
      ixTo?.(dx * strength * 0.4);
      iyTo?.(dy * strength * 0.4);
    };
    const leave = () => {
      // Regreso con resorte: sí rebota un poco, se siente vivo.
      gsap.to(el, { x: 0, y: 0, duration: 0.9, ease: "elastic.out(1, 0.45)", overwrite: true });
      if (inner) gsap.to(inner, { x: 0, y: 0, duration: 0.9, ease: "elastic.out(1, 0.45)", overwrite: true });
    };
    el.addEventListener("pointermove", move);
    el.addEventListener("pointerleave", leave);
    offs.push(() => {
      el.removeEventListener("pointermove", move);
      el.removeEventListener("pointerleave", leave);
    });
  });
  return () => offs.forEach((f) => f());
}

/* ---------- Tilt 3D en tarjetas ----------------------------------------- */
export function createTilt(root: HTMLElement): Cleanup {
  if (!finePointer()) return () => {};
  const offs: Cleanup[] = [];
  root.querySelectorAll<HTMLElement>("[data-tilt]").forEach((card) => {
    const target = card.querySelector<HTMLElement>("[data-tilt-target]") ?? card;
    const img = card.querySelector<HTMLElement>("[data-tilt-depth]");
    const rx = gsap.quickTo(target, "rotationX", { duration: 0.6, ease: "power3.out" });
    const ry = gsap.quickTo(target, "rotationY", { duration: 0.6, ease: "power3.out" });
    const ix = img && gsap.quickTo(img, "x", { duration: 0.6, ease: "power3.out" });
    const iy = img && gsap.quickTo(img, "y", { duration: 0.6, ease: "power3.out" });
    const move = (e: PointerEvent) => {
      const r = target.getBoundingClientRect();
      const px = (e.clientX - r.left) / r.width - 0.5;
      const py = (e.clientY - r.top) / r.height - 0.5;
      rx(-py * 12);
      ry(px * 14);
      ix?.(px * -18);
      iy?.(py * -18);
    };
    const leave = () => {
      rx(0);
      ry(0);
      ix?.(0);
      iy?.(0);
    };
    card.addEventListener("pointermove", move);
    card.addEventListener("pointerleave", leave);
    offs.push(() => {
      card.removeEventListener("pointermove", move);
      card.removeEventListener("pointerleave", leave);
    });
  });
  return () => offs.forEach((f) => f());
}

/* ---------- Marquees que responden al scroll ---------------------------- */
export function createMarquees(root: HTMLElement, reduced: boolean): Cleanup {
  const tweens: gsap.core.Tween[] = [];
  root.querySelectorAll<HTMLElement>("[data-marquee]").forEach((track) => {
    const speed = Number(track.dataset.marquee) || 40; // segundos por vuelta
    const dir = track.dataset.dir === "right" ? 1 : -1;
    const tw = gsap.fromTo(
      track,
      { xPercent: dir === -1 ? 0 : -50 },
      { xPercent: dir === -1 ? -50 : 0, duration: speed, ease: "none", repeat: -1 },
    );
    if (reduced) tw.timeScale(0.25);
    tweens.push(tw);
  });
  if (reduced || !tweens.length) return () => tweens.forEach((t) => t.kill());

  // La velocidad del scroll empuja los marquees; al soltar regresan a su paso.
  const st = ScrollTrigger.create({
    onUpdate: (self) => {
      const v = self.getVelocity() / 300;
      const boost = gsap.utils.clamp(-6, 6, v);
      tweens.forEach((t) => {
        gsap.to(t, { timeScale: (self.direction || 1) * (1 + Math.abs(boost)), duration: 0.2, overwrite: true });
        gsap.to(t, { timeScale: self.direction || 1, duration: 1.2, delay: 0.2, ease: "power2.out" });
      });
    },
  });
  return () => {
    st.kill();
    tweens.forEach((t) => t.kill());
  };
}

/* ---------- Sorpresa: chocolate derretido que sigue al cursor ----------- */
export function createChocolateTrail(section: HTMLElement, canvas: HTMLCanvasElement, mobile: boolean): Cleanup {
  const ctx = canvas.getContext("2d")!;
  const max = mobile ? SORPRESAS.rastro.gotasMaxMovil : SORPRESAS.rastro.gotasMax;
  type Blob = { x: number; y: number; r: number; vy: number; life: number; drip: number };
  const blobs: Blob[] = [];
  let running = false;
  let last = { x: 0, y: 0, t: 0 };
  let dpr = 1;

  const size = () => {
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    const r = section.getBoundingClientRect();
    canvas.width = Math.round(r.width * dpr);
    canvas.height = Math.round(r.height * dpr);
  };
  size();

  const tick = () => {
    const W = canvas.width;
    const H = canvas.height;
    ctx.clearRect(0, 0, W, H);
    for (let i = blobs.length - 1; i >= 0; i--) {
      const b = blobs[i];
      b.life -= 0.012;
      b.vy += 0.025 * b.drip;
      b.y += b.vy;
      b.r *= 0.992;
      if (b.life <= 0 || b.r < 0.6) {
        blobs.splice(i, 1);
        continue;
      }
      ctx.globalAlpha = Math.min(1, b.life * 1.6);
      // gota: círculo + estela hacia abajo (como chocolate que escurre)
      ctx.fillStyle = COLOR.chocolate;
      ctx.beginPath();
      ctx.arc(b.x * dpr, b.y * dpr, b.r * dpr, 0, Math.PI * 2);
      ctx.fill();
      if (b.drip > 0.4) {
        ctx.fillRect((b.x - b.r * 0.45) * dpr, (b.y - b.vy * 6) * dpr, b.r * 0.9 * dpr, b.vy * 6 * dpr);
      }
      // brillo
      ctx.fillStyle = "rgba(251,247,241,0.18)";
      ctx.beginPath();
      ctx.arc((b.x - b.r * 0.35) * dpr, (b.y - b.r * 0.35) * dpr, b.r * 0.28 * dpr, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalAlpha = 1;
    if (!blobs.length) {
      running = false;
      gsap.ticker.remove(tick);
    }
  };

  const add = (x: number, y: number, speed: number) => {
    const n = Math.min(3, 1 + Math.floor(speed / 12));
    for (let i = 0; i < n && blobs.length < max; i++) {
      blobs.push({
        x: x + (Math.random() - 0.5) * 10,
        y: y + (Math.random() - 0.5) * 10,
        r: 5 + Math.random() * 9 + Math.min(speed, 40) * 0.12,
        vy: 0,
        life: 1,
        drip: Math.random(),
      });
    }
    if (!running) {
      running = true;
      gsap.ticker.add(tick);
    }
  };

  const move = (e: PointerEvent) => {
    const r = section.getBoundingClientRect();
    const x = e.clientX - r.left;
    const y = e.clientY - r.top;
    const now = performance.now();
    const speed = Math.hypot(x - last.x, y - last.y) / Math.max(1, now - last.t) * 16;
    if (now - last.t > (mobile ? 40 : 22)) {
      add(x, y, speed);
      last = { x, y, t: now };
    }
  };
  section.addEventListener("pointermove", move, { passive: true });
  window.addEventListener("resize", size);
  return () => {
    section.removeEventListener("pointermove", move);
    window.removeEventListener("resize", size);
    gsap.ticker.remove(tick);
  };
}
