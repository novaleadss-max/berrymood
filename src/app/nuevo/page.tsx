import type { Metadata, Viewport } from "next";

import { Experience } from "@/components/nuevo/experience";
import "./nuevo.css";

// Vista previa del diseño nuevo. Cuando se apruebe, se mueve a "/" y se quita el noindex.
export const metadata: Metadata = {
  title: "BerryMood | Fresas con chocolate premium en Chilpancingo",
  description:
    "Fresas seleccionadas, chocolate premium y pistache. Vasos, fresas con chocolate, fresas con crema y cajas para regalo en Galerías Chilpancingo. Berry Your Mood.",
  alternates: { canonical: "/" },
  robots: { index: false, follow: true },
  openGraph: {
    title: "BerryMood | Berry Your Mood.",
    description: "Fresas con chocolate premium, armadas capa por capa, en Galerías Chilpancingo.",
    locale: "es_MX",
    type: "website",
    siteName: "BerryMood",
  },
  twitter: {
    card: "summary_large_image",
    title: "BerryMood | Berry Your Mood.",
    description: "Fresas con chocolate premium, armadas capa por capa, en Galerías Chilpancingo.",
  },
};

// La barra del navegador del celular toma el mismo café del fondo.
export const viewport: Viewport = {
  themeColor: "#1A0D08",
  colorScheme: "dark",
  viewportFit: "cover",
};

export default function NuevoPage() {
  return (
    <>
      <noscript>
        <style>{`.bm-preloader{display:none}`}</style>
      </noscript>
      <Experience />
    </>
  );
}
