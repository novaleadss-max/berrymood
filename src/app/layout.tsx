import type { Metadata, Viewport } from "next";
import { Bodoni_Moda, Jost } from "next/font/google";
import "./globals.css";
import { ScrollToTop } from "@/components/scroll-to-top";

const bodoni = Bodoni_Moda({
  variable: "--font-bodoni",
  subsets: ["latin"],
  display: "swap",
  style: ["normal", "italic"],
  axes: ["opsz"],
});

const jost = Jost({
  variable: "--font-jost",
  subsets: ["latin"],
  display: "swap",
});

const vercelUrl = process.env.VERCEL_PROJECT_PRODUCTION_URL ?? process.env.VERCEL_URL;
const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL ?? (vercelUrl ? `https://${vercelUrl}` : "http://localhost:3000");

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: "BerryMood | Fresas con chocolate belga en Chilpancingo",
  description:
    "Fresas seleccionadas, chocolate belga y toppings exclusivos. Vasos, fresas con crema y cajas para regalo en Galerías Chilpancingo. Berry Your Mood.",
  keywords: [
    "fresas con chocolate",
    "fresas con crema",
    "fresas Chilpancingo",
    "chocolate belga",
    "postres Chilpancingo",
    "BerryMood",
  ],
  openGraph: {
    title: "BerryMood | Berry Your Mood.",
    description:
      "Fresas seleccionadas, chocolate belga y toppings exclusivos en Galerías Chilpancingo.",
    locale: "es_MX",
    type: "website",
    siteName: "BerryMood",
  },
  twitter: {
    card: "summary_large_image",
    title: "BerryMood | Berry Your Mood.",
    description:
      "Fresas seleccionadas, chocolate belga y toppings exclusivos en Galerías Chilpancingo.",
  },
};

export const viewport: Viewport = {
  themeColor: "#1e1109",
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "FoodEstablishment",
  name: "BerryMood",
  slogan: "Berry Your Mood.",
  description:
    "Fresas premium con chocolate belga y toppings exclusivos. Chocolate & Berry Lab.",
  servesCuisine: "Postres",
  address: {
    "@type": "PostalAddress",
    streetAddress: "Blvd. René Juárez Cisneros 130, Galerías Chilpancingo",
    addressLocality: "Chilpancingo de los Bravo",
    addressRegion: "Guerrero",
    postalCode: "39010",
    addressCountry: "MX",
  },
  sameAs: ["https://www.instagram.com/berry_moodmx"],
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="es-MX" className={`${bodoni.variable} ${jost.variable} antialiased`}>
      <body className="min-h-dvh">
        <ScrollToTop />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        {children}
      </body>
    </html>
  );
}
