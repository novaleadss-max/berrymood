/* =============================================================================
   BERRYMOOD · DISEÑO NUEVO · AJUSTES

   Todo lo que se puede afinar sin tocar la lógica vive aquí: colores, cuánto
   dura cada capítulo con el scroll, velocidades del parallax, tiempos de las
   animaciones, productos y fotos de la galería.

   Duraciones de scroll: "+=150%" significa "pantalla y media de scroll".
   En celular se usan los valores *_MOVIL (más cortos, para que nada se sienta
   atorado).
   ========================================================================== */

import { site } from "@/lib/site";

/* ---------- Colores ------------------------------------------------------- */
export const COLOR = {
  /** Fondo de toda la página. Es el mismo color con el que se funden los cuadros del video. */
  fondo: "#1A0D08",
  fondoProfundo: "#120804",
  chocolate: "#4F2B15",
  chocolateOscuro: "#2F180B",
  crema: "#FBF7F1",
  fresa: "#D7232C",
  pistache: "#B5B76A",
  dorado: "#C2883A",
} as const;

/* ---------- Curvas (nada de ease-in en interfaz) --------------------------- */
export const EASE = {
  /** Entradas: arranca rápido y se asienta. */
  salida: "expo.out",
  /** Movimientos en pantalla. */
  enMedio: "power3.inOut",
  /** Inercia del scroll de la galería (como la referencia). */
  inercia: "power3.out",
  css: "cubic-bezier(0.23, 1, 0.32, 1)",
} as const;

/* ---------- Duración de cada capítulo con el scroll ----------------------- */
export const CAPITULO_1_SCROLL = "+=110%"; // La fresa (inicio)
export const CAPITULO_1_SCROLL_MOVIL = "+=70%";
export const CAPITULOS_2_4_SCROLL = "+=420%"; // El vaso + El chocolate + El toque final (un solo tramo fijo)
export const CAPITULOS_2_4_SCROLL_MOVIL = "+=260%";
export const CAPITULO_6_SCROLL = "+=140%"; // La historia (texto que se rellena)
export const CAPITULO_6_SCROLL_MOVIL = "+=90%";
export const CAPITULO_7_SCROLL = "+=130%"; // Galería infinita
export const CAPITULO_7_SCROLL_MOVIL = "+=125%";
/** "¿Se te antojó?" sube encima del final de la galería (fracción de pantalla) para que no quede café vacío.
    Si lo cambias, cambia también --bm-encima en nuevo.css. */
export const GALERIA_ENCIMA = 0.62;
/** Productos: el tramo dura lo que mide la fila de tarjetas. Multiplica para alargarlo. */
export const CAPITULO_5_FACTOR = 1;

/** Reparto interno del tramo 2–4 (0 = inicio del tramo, 1 = fin). */
export const ARMADO = {
  mascara: [0, 0.07], // círculo que descubre el vaso
  fresas: [0.04, 0.34], // cuadros 1 → 62
  chocolate: [0.34, 0.64], // cuadros 62 → 112
  pistache: [0.64, 0.86], // cuadros 112 → 160
  zoom: [0.86, 1], // acercamiento + "BerryMood"
  cuadros: { fresas: 62, chocolate: 112, total: 160 },
  /** Suavizado del scroll en segundos (0 = pegado al dedo). */
  scrub: 0.6,
};

/** Cuadros del armado (sacados del video, ya teñidos con el café del fondo). */
export const SECUENCIA = {
  escritorio: { ruta: "/nuevo/seq/d", ancho: 1280, alto: 720 },
  movil: { ruta: "/nuevo/seq/m", ancho: 540, alto: 680 },
  /** Cuántos cuadros se cargan antes de quitar el preloader. */
  primeros: 24,
};

/* ---------- Tiempos de animación (segundos) ------------------------------- */
export const TIEMPO = {
  preloaderMinimo: 1, // aunque cargue rápido, la marca se ve completa
  goteoSalida: 1.25, // el chocolate que descubre la página
  heroLetras: 1.1, // duración de cada letra del título
  heroEscalon: 0.035, // separación entre letras
  textoLineas: 0.9,
  botonMagnetico: 0.6,
  cursor: 0.35,
};

/** Transición de chocolate líquido entre secciones. */
export const GOTEO = {
  gotas: 13, // escurrimientos en pantalla (en celular se usan 8)
  /** Pantallas de scroll en que el chocolate cubre el vaso terminado. */
  cubrir: 0.7,
  /** Pantallas de scroll en que se retira y descubre el menú (las tarjetas esperan). */
  descubrir: 0.7,
  /** Capa principal (también es el fondo del preloader). */
  frente: "#2B1509",
  /** Capa que se adelanta: chocolate con leche, para que se vean las gotas. */
  fondo: COLOR.chocolate,
};

/* ---------- Galería infinita (movimiento de la referencia) ---------------- */
export const GALERIA = {
  /** > 1 va más rápido que el scroll, < 1 más lento. Se repiten en ciclo. */
  velocidadesParallax: [1.3, 0.8, 1.15, 0.7, 1.25, 0.85],
  /** Cuántos px recorre la galería por cada px de scroll mientras está fija. */
  factorScroll: 2.2,
  pxPorSegundo: 100,
  /** Inercia tras cada movimiento (como la referencia: 0.75s power3.out). */
  scrub: { duracion: 0.9, curva: "power3.out" },
  revelado: {
    escalon: 0.12,
    imagen: { duration: 1.1, ease: "expo.out" },
    letras: { duration: 0.5, ease: "power2.out", stagger: 0.022, delay: 0.18 },
  },
  abrir: {
    otras: { duration: 0.5, ease: "power2.out" },
    flip: { duration: 1.15, ease: "expo.inOut" },
    texto: { duration: 0.9, ease: "expo.out", stagger: 0.012 },
    textoRetraso: 0.65,
    escalonLinea: 0.06,
  },
  cerrar: {
    texto: { duration: 0.35, stagger: 0.03, ease: "power2.out" },
    flip: { duration: 0.95, ease: "expo.inOut" },
  },
};

export type Slide = {
  foto: string;
  titulo: string;
  texto: string;
  /** Desfase lateral (vw) y ancho de la foto (vw) en computadora. */
  lado: number;
  ancho: number;
  video?: boolean;
  alt: string;
};

/* Fotos de la sesión. Para cambiar una, reemplaza los archivos
   /public/nuevo/fotos/<foto>-480.webp (y -960 / -wide si existen). */
export const SLIDES: Slide[] = [
  { foto: "vaso", titulo: "Vaso Pistache", lado: -22, ancho: 22, alt: "Vaso BerryMood con fresas, chocolate y pistache sobre fondo café", texto: "Capas de fresa, chocolate y pistache hasta el borde. Es el que más nos piden." },
  { foto: "torre", titulo: "Fresas con chocolate", lado: 16, ancho: 14, alt: "Fresas enteras bañadas en chocolate, una sobre otra", texto: "Fresas enteras bañadas en chocolate premium. El clásico, bien hecho." },
  { foto: "estudio", titulo: "Listos para el chocolate", lado: -14, ancho: 24, alt: "Chocolate cayendo junto a decenas de vasos con fresas recién servidas", texto: "Decenas de vasos con fresa fresca esperando su chocolate premium." },
  { foto: "charola", titulo: "La charola", lado: 24, ancho: 17, alt: "Charola llena de fresas grandes y rojas", texto: "Grande, roja y firme. Si no pasa el filtro, no entra al vaso." },
  { foto: "cayendo", titulo: "Fresa por fresa", lado: -26, ancho: 15, alt: "Fresas cayendo dentro de un vaso vacío", texto: "Así empieza cada vaso: fresas frescas, una por una." },
  { foto: "armado", titulo: "El armado", lado: 20, ancho: 26, video: true, alt: "Video: se arma un vaso BerryMood con fresas, chocolate y pistache", texto: "Fresa, chocolate y pistache. Diez segundos que se te antojan." },
  { foto: "mitades", titulo: "Por dentro", lado: -18, ancho: 16, alt: "Una fresa partida a la mitad", texto: "Fruta fresca, sin nada que esconder." },
  { foto: "pistache", titulo: "El toque final", lado: 10, ancho: 20, alt: "Pistache cayendo sobre el chocolate del vaso", texto: "Pistache y otros toppings que vamos rotando. Aquí el mood se vuelve tuyo." },
  { foto: "manos", titulo: "Hecho a mano", lado: -12, ancho: 19, alt: "Manos con guantes sosteniendo un vaso BerryMood", texto: "Servido con el cuidado de algo hecho para regalar. Aunque sea para ti." },
  { foto: "cerca", titulo: "De cerca", lado: 22, ancho: 23, alt: "Acercamiento al pistache y las fresas con chocolate", texto: "Una capa suave, brillante y deliciosa sobre cada fresa." },
  { foto: "dos-vasos", titulo: "Para compartir", lado: -24, ancho: 18, alt: "Dos vasos BerryMood con fresas y chocolate", texto: "Uno para ti y otro para quien quieras consentir." },
  { foto: "bano", titulo: "Capa por capa", lado: 14, ancho: 15, alt: "Chocolate cayendo dentro del vaso de fresas", texto: "El chocolate baja entre las fresas hasta el fondo del vaso." },
  { foto: "listo", titulo: "Listo para ti", lado: -8, ancho: 21, alt: "Vaso BerryMood terminado con pistache", texto: "Berry Your Mood." },
];

/* ---------- Productos (del menú que ya existía) --------------------------- */
export type Producto = {
  nombre: string;
  texto: string;
  etiqueta: string;
  /** Foto en /public/nuevo/fotos. null = aún no hay foto (se muestra el monograma). */
  foto: string | null;
  alt: string;
};

export const PRODUCTOS: Producto[] = [
  {
    nombre: "Vasos BerryMood",
    texto: "Capas de fresa, chocolate y toppings hasta el borde. El de pistache es el que más nos piden.",
    etiqueta: "El favorito",
    foto: "vaso",
    alt: "Vaso BerryMood de fresas con chocolate y pistache",
  },
  {
    nombre: "Fresas con chocolate",
    texto: "Fresas enteras bañadas en chocolate premium y terminadas con el topping que tú elijas.",
    etiqueta: "El clásico",
    foto: "torre",
    alt: "Fresas enteras bañadas en chocolate",
  },
  {
    nombre: "Fresas con crema",
    texto: "La receta de toda la vida: fresa recién cortada y crema suave. Sin inventos, solo mejores ingredientes.",
    etiqueta: "De siempre",
    foto: "charola", // PENDIENTE: no hay foto de fresas con crema; se usa la charola de fresas.
    alt: "Charola de fresas frescas",
  },
  {
    nombre: "Cajas para regalo",
    texto: "Para un cumpleaños, un aniversario o para quedar bien sin decir mucho. Las armamos a tu gusto.",
    etiqueta: "Para regalar",
    foto: null, // PENDIENTE: falta foto de las cajas.
    alt: "",
  },
];

/* ---------- Contacto ------------------------------------------------------ */
/** PENDIENTE: escribe aquí el WhatsApp con lada, solo números (ej. "527471234567").
    Mientras esté vacío, los botones dicen "Síguenos en Instagram" y llevan a Instagram. */
export const WHATSAPP = "";
export const MENSAJE_WHATSAPP = "Hola BerryMood, quiero hacer un pedido.";

export const pedidoUrl = WHATSAPP
  ? `https://wa.me/${WHATSAPP}?text=${encodeURIComponent(MENSAJE_WHATSAPP)}`
  : site.instagram.url;

/* ---------- Capítulos (indicador de progreso) ----------------------------- */
export const CAPITULOS = [
  { id: "la-fresa", nombre: "La fresa" },
  { id: "el-vaso", nombre: "El vaso" },
  { id: "el-chocolate", nombre: "El chocolate" },
  { id: "el-toque-final", nombre: "El toque final" },
  { id: "menu", nombre: "Los productos" },
  { id: "historia", nombre: "La historia" },
  { id: "galeria", nombre: "En fotos" },
  { id: "pidelo", nombre: "Pídelo" },
] as const;

/* ---------- Sorpresas ----------------------------------------------------- */
export const SORPRESAS = {
  /** Fresas que llueven al tocar el logo (o al escribir "fresa"). */
  lluvia: { escritorio: 70, movil: 28, palabraSecreta: "fresa" },
  /** Chocolate que se derrite siguiendo el cursor en "Pídelo". */
  rastro: { gotasMax: 90, gotasMaxMovil: 40 },
};

/* ---------- Fresa real (foto de Gemini con relieve) ----------------------- */
export const FRESA_REAL = {
  /** Cuánto volumen tiene (0 = plana, 0.5 = muy abultada). */
  relieve: 0.26,
  /** Cuánto gira siguiendo el mouse / el celular (radianes). */
  giroMouse: 0.4,
  /** Balanceo solo, como si flotara (giro en radianes, velocidad en rad/s). */
  balanceo: { giro: 0.22, velocidad: 0.55 },
  /** Cuánto voltea con el scroll. */
  giroScroll: 0.38,
  /** Cuánto rueda sobre sí misma al caer (fracción del giro del scroll). */
  rodar: 0.32,
  /** La foto incluye hojas: es un poco más alta que el cuerpo de la fresa. */
  altoVsCuerpo: 1.22,
};
