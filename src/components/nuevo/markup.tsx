/* =============================================================================
   MARCADO DE LA PÁGINA NUEVA

   Solo HTML y textos (todos sacados del sitio que ya existía). Las animaciones
   viven en experience.tsx; sin JavaScript la página se lee completa.
   ========================================================================== */

import type { CSSProperties } from "react";
import { site } from "@/lib/site";
import { CAPITULOS, PRODUCTOS, SLIDES, WHATSAPP, pedidoUrl, type Slide } from "./config";

const foto = (name: string, size: 480 | 960 | "wide") => `/nuevo/fotos/${name}-${size}.webp`;
/** Fotos que existen en 960 (las de la sesión nueva). */
const HAS_960 = new Set(["vaso", "vertido", "cerca", "charola"]);
const srcSet = (name: string) => (HAS_960.has(name) ? `${foto(name, 480)} 480w, ${foto(name, 960)} 960w` : undefined);

const pedidoLabel = WHATSAPP ? "Pídelo por WhatsApp" : "Pídelo por Instagram";
const ext = { target: "_blank", rel: "noopener noreferrer" } as const;

function Arrow() {
  return (
    <svg className="bm-arrow" viewBox="0 0 24 24" aria-hidden="true">
      <path d="M7 17 17 7M9 7h8v8" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function Chrome() {
  return (
    <>
      <a className="bm-skip" href="#contenido">
        Saltar al contenido
      </a>

      <div className="bm-preloader" aria-hidden="true">
        <div className="bm-pre-logo">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/images/monograma-crema.png" alt="" width={498} height={491} className="bm-pre-ghost" />
          <div className="bm-pre-mask">
            <div className="bm-pre-liquid">
              <svg viewBox="0 0 200 20" preserveAspectRatio="none" className="bm-pre-wave">
                <path d="M0 10 Q 25 0 50 10 T 100 10 T 150 10 T 200 10 V 20 H 0 Z" />
              </svg>
            </div>
          </div>
        </div>
        <p className="bm-pre-count">
          <span>0</span>
        </p>
        <p className="bm-pre-name">Chocolate &amp; Berry Lab</p>
      </div>

      <div className="bm-drip" aria-hidden="true" />
      <div className="bm-berry-sprite" aria-hidden="true" />
      <div className="bm-cursor" aria-hidden="true">
        <span />
      </div>

      <header className="bm-header">
        <button type="button" className="bm-logo" aria-label="BerryMood. Toca el logo para una sorpresa." data-cursor="¿Fresas?">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/nuevo/monograma-72.webp" alt="" width={72} height={71} />
          <span translate="no">BerryMood</span>
        </button>
        <nav aria-label="Principal" className="bm-nav">
          <a href="#menu" className="bm-link">Menú</a>
          <a href="#historia" className="bm-link">Historia</a>
          <a href="#galeria" className="bm-link">Fotos</a>
          <a href="#pidelo" className="bm-link">Visítanos</a>
        </nav>
        <a href={pedidoUrl} {...ext} className="bm-btn bm-btn--sm" data-magnetic="0.3">
          <span data-magnetic-inner>Pídelo</span>
          <span className="sr-only"> (abre en otra pestaña)</span>
        </a>
      </header>

      <nav className="bm-progress" aria-label="Capítulos">
        <div className="bm-progress-bar" aria-hidden="true">
          <span />
        </div>
        <ol>
          {CAPITULOS.map((c, i) => (
            <li key={c.id}>
              <a href={`#${c.id}`} data-chapter={i}>
                <span className="bm-progress-dot" aria-hidden="true" />
                <span className="bm-progress-label">{c.nombre}</span>
              </a>
            </li>
          ))}
        </ol>
      </nav>
    </>
  );
}

export function Hero() {
  return (
    <section id="la-fresa" className="bm-hero" aria-labelledby="bm-hero-title">
      <h1 id="bm-hero-title" className="bm-hero-title">
        <span className="bm-hero-l1">Berry</span>
        <span className="bm-hero-l2">Your Mood.</span>
      </h1>
      <p className="bm-hero-sub">
        Fresas con chocolate premium
        <br />
        en {site.address.place}.
      </p>
      <p className="bm-hero-hint" aria-hidden="true">
        <span>Desliza</span>
        <i />
      </p>
    </section>
  );
}

const PASOS = [
  {
    id: "el-vaso",
    cls: "bm-step--2",
    titulo: "Fresa por fresa.",
    texto: "Grande, roja y firme. Si no pasa el filtro, no entra al vaso.",
    cuadro: 62,
  },
  {
    id: "el-chocolate",
    cls: "bm-step--3",
    titulo: "Chocolate premium.",
    texto: "Fundido y servido a la temperatura justa para cubrir cada fresa.",
    cuadro: 112,
  },
  {
    id: "el-toque-final",
    cls: "bm-step--4",
    titulo: "El toque final.",
    texto: "Pistache y otros toppings que vamos rotando. Aquí el mood se vuelve tuyo.",
    cuadro: 160,
  },
];

export function Armado() {
  return (
    <section id="armado" className="bm-armado" aria-label="Cómo se arma un vaso BerryMood">
      <div className="bm-armado-stage">
        <canvas
          className="bm-seq"
          role="img"
          aria-label="Un vaso BerryMood se arma: caen las fresas, luego el chocolate y al final el pistache."
        />
        {PASOS.map((p) => (
          <div key={p.id} id={p.id} className={`bm-step ${p.cls}`}>
            <h2 className="bm-step-title">{p.titulo}</h2>
            <p className="bm-step-text">{p.texto}</p>
          </div>
        ))}
        <div className="bm-brand" aria-hidden="true">
          <p className="bm-brand-name" translate="no">
            BerryMood
          </p>
          <p className="bm-brand-slogan">Berry Your Mood.</p>
        </div>
      </div>

      {/* Versión sin animación (prefers-reduced-motion): los tres momentos como fotos. */}
      <div className="bm-armado-static">
        {PASOS.map((p) => (
          <figure key={p.id}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={`/nuevo/seq/d/${String(p.cuadro).padStart(3, "0")}.webp`} alt="" loading="lazy" width={1280} height={720} />
            <figcaption>
              <strong>{p.titulo}</strong> {p.texto}
            </figcaption>
          </figure>
        ))}
      </div>
    </section>
  );
}

export function Menu() {
  return (
    <section id="menu" className="bm-menu" aria-labelledby="bm-menu-title">
      <div className="bm-menu-pin">
        <div className="bm-menu-track">
          <div className="bm-menu-intro">
            <h2 id="bm-menu-title" className="bm-h2">
              Cuatro formas
              <br />
              de antojarte.
            </h2>
            <p className="bm-menu-note">Los precios los tenemos en tienda. Muy pronto también van a estar aquí.</p>
          </div>
          {PRODUCTOS.map((p) => (
            <article key={p.nombre} className="bm-card" data-tilt>
              <div className="bm-card-inner" data-tilt-target>
                <div className="bm-card-media">
                  {p.foto ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      data-tilt-depth
                      src={foto(p.foto, 480)}
                      srcSet={srcSet(p.foto)}
                      sizes="(max-width: 767px) 80vw, 30vw"
                      alt={p.alt}
                      loading="lazy"
                      width={480}
                      height={600}
                    />
                  ) : (
                    <div className="bm-card-placeholder" data-tilt-depth>
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src="/images/logo-crema.png" alt="" width={884} height={872} loading="lazy" />
                    </div>
                  )}
                </div>
                <div className="bm-card-body">
                  <p className="bm-card-tag">{p.etiqueta}</p>
                  <h3 className="bm-card-title">{p.nombre}</h3>
                  <p className="bm-card-text">{p.texto}</p>
                </div>
              </div>
            </article>
          ))}
          <div className="bm-menu-end">
            <p className="bm-menu-end-text">¿Cuál va a ser tu mood hoy?</p>
            <a href={pedidoUrl} {...ext} className="bm-btn" data-magnetic="0.35">
              <span data-magnetic-inner>{pedidoLabel}</span>
              <span className="sr-only"> (abre en otra pestaña)</span>
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}

export function Marquee({ items, speed = 40, dir = "left", big = false }: { items: string[]; speed?: number; dir?: "left" | "right"; big?: boolean }) {
  const run = [...items, ...items];
  return (
    <div className={`bm-marquee${big ? " bm-marquee--big" : ""}`} aria-hidden="true">
      <div className="bm-marquee-track" data-marquee={speed} data-dir={dir}>
        {[0, 1].map((copy) =>
          run.map((t, i) => (
            <span key={`${copy}-${i}`} className="bm-marquee-item">
              {t}
              <svg viewBox="0 0 20 20" className="bm-marquee-mark">
                <path d="M10 0c.9 5.6 4.4 9.1 10 10-5.6.9-9.1 4.4-10 10C9.1 14.4 5.6 10.9 0 10 5.6 9.1 9.1 5.6 10 0Z" />
              </svg>
            </span>
          )),
        )}
      </div>
    </div>
  );
}

export function Historia() {
  return (
    <section id="historia" className="bm-story" aria-labelledby="bm-story-title">
      <div className="bm-story-pin">
        <div className="bm-story-bg" aria-hidden="true" />
        <h2 id="bm-story-title" className="sr-only">
          La historia de BerryMood
        </h2>
        <div className="bm-story-copy">
          <p className="bm-story-text" data-fill>
            Una fresa sola es fruta. Con chocolate premium ya es otra historia.
          </p>
          <p className="bm-story-small" data-fill-small>
            BerryMood nació de una idea sencilla: el postre de fresas que todos conocemos merecía un mejor trato.
          </p>
        </div>
        {[
          { f: "manos", alt: "Manos sirviendo un vaso BerryMood", cls: "a", speed: 1.25 },
          { f: "chocolate-cel", alt: "Chocolate cayendo sobre fresas", cls: "b", speed: 0.8 },
          { f: "charola-cerca", alt: "Fresas frescas de cerca", cls: "c", speed: 1.05 },
          { f: "mitades", alt: "Fresa partida a la mitad", cls: "d", speed: 0.65 },
        ].map((im) => (
          <figure key={im.f} className={`bm-story-img bm-story-img--${im.cls}`} data-speed={im.speed}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={foto(im.f, 480)} alt={im.alt} loading="lazy" width={480} height={600} />
          </figure>
        ))}
      </div>
    </section>
  );
}

function SlideMedia({ s }: { s: Slide }) {
  if (s.video) {
    return (
      <video
        className="g-img"
        muted
        loop
        playsInline
        preload="metadata"
        poster="/nuevo/video/poster.webp"
        aria-label={s.alt}
        disablePictureInPicture
      >
        <source src="/nuevo/video/armado.webm" type="video/webm" />
        <source src="/nuevo/video/armado.mp4" type="video/mp4" />
      </video>
    );
  }
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      className="g-img"
      src={foto(s.foto, 480)}
      srcSet={srcSet(s.foto)}
      sizes="(max-width: 767px) 40vw, 25vw"
      data-full={foto(s.foto, "wide")}
      alt={s.alt}
      width={480}
      height={600}
      loading="lazy"
      decoding="async"
    />
  );
}

export function Galeria() {
  return (
    <section id="galeria" className="bm-gallery" aria-labelledby="bm-gallery-title">
      <div className="bm-gallery-pin">
        <div className="bm-gallery-head">
          <h2 id="bm-gallery-title" className="bm-h2">
            El mood,
            <br />
            en fotos.
          </h2>
          <p>Toca una foto para verla de cerca.</p>
        </div>
        <div className="g-stage">
          <div className="g-track">
            {SLIDES.map((s) => (
              <div
                key={s.foto}
                className="g-slide"
                tabIndex={0}
                role="button"
                aria-label={`Ver ${s.titulo}`}
                data-cursor="Ver"
                style={{ "--stagger": `${s.lado}vw`, "--img-w": `${s.ancho}vw` } as CSSProperties}
              >
                <div className="g-media">
                  <SlideMedia s={s} />
                </div>
                <p className="g-cap">{s.titulo}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="g-detail" role="dialog" aria-modal="true" aria-label="Foto de cerca" aria-hidden="true">
        <figure className="g-preview">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img alt="" />
        </figure>
        <div className="g-groups">
          <button type="button" className="g-back" data-cursor="Cerrar">
            Cerrar
          </button>
          {SLIDES.map((s, i) => (
            <div key={s.foto} className="g-group" data-index={i}>
              <p className="g-title">{s.titulo}</p>
              <p className="g-text">{s.texto}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export function Pidelo() {
  return (
    <section id="pidelo" className="bm-close" aria-labelledby="bm-close-title">
      <canvas className="bm-trail" aria-hidden="true" />
      <div className="bm-close-inner">
        <h2 id="bm-close-title" className="bm-close-title">
          ¿Se te
          <br />
          antojó?
        </h2>
        <p className="bm-close-lead">
          Pasa por el tuyo a {site.address.place}
          <br />o escríbenos y te lo tenemos listo.
        </p>
        <a href={pedidoUrl} {...ext} className="bm-cta" data-magnetic="0.45" data-cursor="Pedir">
          <span data-magnetic-inner>{pedidoLabel}</span>
          <span className="sr-only"> (abre en otra pestaña)</span>
        </a>
        <div className="bm-close-info">
          <address>
            <strong>{site.address.place}</strong>
            {site.address.street}
            <br />
            {site.address.area}
            <br />
            {site.address.city}
          </address>
          <div className="bm-close-links">
            <a href={site.mapsUrl} {...ext} className="bm-link">
              Cómo llegar <Arrow />
              <span className="sr-only"> (abre Google Maps en otra pestaña)</span>
            </a>
            <a href={site.instagram.url} {...ext} className="bm-link">
              {site.instagram.handle} <Arrow />
              <span className="sr-only"> (abre Instagram en otra pestaña)</span>
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}

export function Footer() {
  return (
    <footer className="bm-footer">
      <Marquee items={["Berry Your Mood.", "Chocolate & Berry Lab", "Chilpancingo, Gro."]} speed={32} dir="right" />
      <p className="bm-footer-word" aria-hidden="true" translate="no">
        BerryMood
      </p>
      <div className="bm-footer-row">
        <p>© {new Date().getFullYear()} BerryMood. Chocolate &amp; Berry Lab.</p>
        <button type="button" className="bm-again bm-link" data-cursor="Otra vez">
          Otra vez, desde la fresa
        </button>
        <p>Chilpancingo, Guerrero</p>
      </div>
    </footer>
  );
}
