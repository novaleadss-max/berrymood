import Image from "next/image";
import { ArrowUpRight, MapPin, Navigation } from "lucide-react";

import { Button } from "@/components/ui/button";
import { InstagramIcon, Leaf, Sparkle } from "@/components/icons";
import { DrawLine, Reveal } from "@/components/reveal";
import { site } from "@/lib/site";

const values = ["Calidad", "Exclusividad", "Creatividad", "Innovación", "Elegancia", "Atención al detalle"];

export function ValuesBand() {
  const run = [...values, ...values];
  return (
    <section aria-label="Nuestros valores" className="overflow-hidden border-y border-gold/20 bg-chocolate-950 py-6">
      <ul className="sr-only">
        {values.map((v) => (
          <li key={v}>{v}</li>
        ))}
      </ul>
      <div aria-hidden="true" className="marquee-track flex w-max">
        {[0, 1].map((copy) => (
          <div key={copy} className="flex shrink-0 items-center">
            {run.map((v, i) => (
              <span key={`${copy}-${i}`} className="flex items-center">
                <span className="px-8 font-heading text-2xl text-cream/85 italic sm:text-3xl">{v}</span>
                <Sparkle className="size-3.5 text-gold" />
              </span>
            ))}
          </div>
        ))}
      </div>
    </section>
  );
}

export function About() {
  return (
    <section
      id="nosotros"
      aria-labelledby="nosotros-title"
      className="scroll-mt-4 bg-cream py-section text-chocolate-600"
    >
      <div className="mx-auto grid max-w-[1440px] gap-12 px-4 sm:px-8 lg:grid-cols-12 lg:gap-6 lg:px-12">
        <Reveal className="lg:col-span-5">
          <div className="relative mx-auto max-w-md overflow-hidden rounded-t-full border border-gold/40 p-2 lg:mx-0">
            <Image
              src="/images/vaso-pistache-original.jpg"
              alt="Vaso de fresas con chocolate belga y pistache, con el logo de BerryMood, sobre una mesa de mármol"
              width={853}
              height={1280}
              sizes="(min-width: 1024px) 420px, 90vw"
              className="h-auto w-full rounded-t-full"
            />
          </div>
        </Reveal>

        <div className="lg:col-span-6 lg:col-start-7 lg:self-center">
          <Reveal>
            <p className="flex items-center gap-3 text-[0.7rem] font-medium tracking-[0.32em] text-gold-deep">
              <Leaf className="h-3 w-5" />
              QUIÉNES SOMOS
            </p>
            <h2
              id="nosotros-title"
              className="mt-6 text-fluid-2xl leading-[1.02] font-normal tracking-[-0.01em] text-chocolate-600"
            >
              Una fresa sola es fruta. <span className="italic text-gold-deep">Con chocolate belga</span> ya es otra
              historia.
            </h2>
          </Reveal>
          <Reveal delay={0.08}>
            <p className="mt-8 max-w-[52ch] text-fluid-base leading-relaxed text-chocolate-700">
              BerryMood nació de una idea sencilla: el postre de fresas que todos conocemos merecía un mejor
              trato. Por eso juntamos fruta fresca, chocolate belga y toppings que no encuentras en cualquier
              lado, y lo servimos con el cuidado de algo hecho para regalar. Aunque sea para ti.
            </p>
          </Reveal>

          <div className="mt-12 max-w-[52ch]">
            <Reveal delay={0.12} as="article" className="border-t border-gold/60 pt-5">
              <h3 className="text-2xl font-normal text-chocolate-600">Lo que hacemos</h3>
              <p className="mt-3 leading-relaxed text-chocolate-700">
                En <strong className="font-semibold text-chocolate-600">BerryMood</strong> transformamos fresas
                frescas en una experiencia única, combinándolas con{" "}
                <strong className="font-semibold text-chocolate-600">chocolate belga</strong> de la más alta calidad
                y una variedad de <strong className="font-semibold text-chocolate-600">toppings premium</strong>,
                creando combinaciones que sorprenden y una presentación que da gusto compartir.
              </p>
            </Reveal>
          </div>
        </div>
      </div>
    </section>
  );
}

const steps = [
  {
    title: "La fresa",
    body: "Grande, roja y firme. Si no pasa el filtro, no entra al vaso.",
  },
  {
    title: "El chocolate",
    body: "Belga, fundido y servido a la temperatura justa para cubrir cada fresa con una capa suave, brillante y deliciosa.",
  },
  {
    title: "El topping",
    body: "Pistache y otros que vamos rotando. Aquí es donde el mood se vuelve tuyo.",
  },
];

export function BuildYourMood() {
  return (
    <section
      id="arma-tu-mood"
      aria-labelledby="arma-title"
      className="relative scroll-mt-4 overflow-hidden bg-chocolate-800 py-section"
    >
      <div className="mx-auto max-w-[1440px] px-4 sm:px-8 lg:px-12">
        <Reveal className="grid gap-6 lg:grid-cols-12 lg:items-end">
          <h2 id="arma-title" className="text-fluid-2xl leading-[1.02] font-normal text-cream lg:col-span-7">
            Arma tu mood en <span className="text-gilded italic">tres pasos.</span>
          </h2>
          <p className="max-w-[40ch] leading-relaxed text-cream-muted lg:col-span-4 lg:col-start-9">
            Tú eliges la combinación. Nosotros nos encargamos de que salga perfecta, cada vez.
          </p>
        </Reveal>

        <div className="relative mt-16 lg:mt-24">
          <DrawLine className="absolute top-[2.6rem] right-0 left-0 hidden h-px bg-gradient-to-r from-gold/60 via-gold/25 to-transparent md:block" />
          <ol className="relative grid gap-12 md:grid-cols-3 md:gap-8">
          {steps.map((step, i) => (
            <Reveal key={step.title} as="li" delay={i * 0.08} className="relative">
              <span className="relative inline-grid size-[5.2rem] place-items-center rounded-full border border-gold/50 bg-chocolate-800 font-heading text-4xl text-gold italic">
                {i + 1}
              </span>
              <h3 className="mt-8 text-fluid-xl font-normal text-cream">{step.title}</h3>
              <p className="mt-3 max-w-[32ch] leading-relaxed text-cream-muted">{step.body}</p>
            </Reveal>
          ))}
          </ol>
        </div>
      </div>
    </section>
  );
}

export function Visit() {
  return (
    <section
      id="visitanos"
      aria-labelledby="visitanos-title"
      className="grain relative isolate scroll-mt-4 overflow-hidden bg-chocolate-900 py-section"
    >
      <div
        aria-hidden="true"
        className="absolute inset-0 -z-10"
        style={{
          background: "radial-gradient(50% 60% at 78% 50%, #4f2b15 0%, #2a180c 45%, #1e1109 80%)",
        }}
      />
      <div className="mx-auto grid max-w-[1440px] items-center gap-14 px-4 sm:px-8 lg:grid-cols-12 lg:gap-6 lg:px-12">
        <div className="lg:col-span-6">
          <Reveal>
            <p className="flex items-center gap-3 text-[0.7rem] font-medium tracking-[0.32em] text-gold">
              <MapPin className="size-3.5" aria-hidden="true" />
              VISÍTANOS
            </p>
            <h2 id="visitanos-title" className="mt-6 text-fluid-2xl leading-[1.02] font-normal text-cream">
              Te esperamos en <span className="text-gilded italic">Galerías Chilpancingo.</span>
            </h2>
          </Reveal>

          <Reveal delay={0.08}>
            <address className="mt-10 border-l border-gold/50 pl-6 text-fluid-base leading-relaxed text-cream/85 not-italic">
              <span className="block font-heading text-2xl text-cream">{site.address.place}</span>
              {site.address.street}
              <br />
              {site.address.area}
              <br />
              {site.address.city}
            </address>
            <p className="mt-6 max-w-[44ch] text-sm leading-relaxed text-cream-muted">
              Los horarios y los toppings de temporada los publicamos en Instagram. Mándanos DM si quieres
              apartar una caja para regalo.
            </p>
          </Reveal>

          <Reveal delay={0.14} className="mt-10 flex flex-wrap gap-3">
            <Button asChild size="lg">
              <a href={site.mapsUrl} target="_blank" rel="noopener noreferrer">
                <Navigation className="size-4" aria-hidden="true" />
                Cómo llegar
                <span className="sr-only">(abre Google Maps en otra pestaña)</span>
              </a>
            </Button>
            <Button asChild variant="outline" size="lg">
              <a href={site.instagram.url} target="_blank" rel="noopener noreferrer">
                <InstagramIcon className="size-4" />
                {site.instagram.handle}
                <ArrowUpRight className="size-4" aria-hidden="true" />
                <span className="sr-only">(abre Instagram en otra pestaña)</span>
              </a>
            </Button>
          </Reveal>
        </div>

        <Reveal delay={0.1} className="lg:col-span-5 lg:col-start-8">
          <div className="relative mx-auto aspect-square w-[86%] max-w-[460px]">
            <div aria-hidden="true" className="absolute inset-[-6%] rounded-full border border-gold/15" />
            <Image
              src="/images/logo-crema.png"
              alt="Logotipo de BerryMood: monograma BM dentro de un círculo dorado con el texto Chocolate & Berry Lab"
              width={884}
              height={872}
              sizes="(min-width: 1024px) 460px, 90vw"
              className="h-auto w-full"
            />
          </div>
        </Reveal>
      </div>
    </section>
  );
}

export function SiteFooter() {
  return (
    <footer className="border-t border-gold/20 bg-chocolate-950 pt-16 pb-8">
      <div className="mx-auto max-w-[1440px] px-4 sm:px-8 lg:px-12">
        <div className="grid gap-12 md:grid-cols-12">
          <div className="md:col-span-5">
            <div className="flex items-center gap-3">
              <Image src="/images/monograma-crema.png" alt="" width={498} height={491} className="h-10 w-auto" />
              <span className="text-sm font-medium tracking-[0.32em] text-cream">BERRYMOOD</span>
            </div>
            <p className="mt-6 font-heading text-4xl text-cream italic">{site.slogan}</p>
          </div>

          <nav aria-label="Pie de página" className="md:col-span-3 md:col-start-7">
            <p className="text-[0.7rem] tracking-[0.28em] text-gold">SECCIONES</p>
            <ul className="mt-4 space-y-1">
              {site.nav.map((item) => (
                <li key={item.href}>
                  <a
                    href={item.href}
                    className="inline-flex min-h-11 items-center rounded-sm text-cream/80 outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  >
                    <span className="link-underline">{item.label}</span>
                  </a>
                </li>
              ))}
            </ul>
          </nav>

          <div className="md:col-span-3">
            <p className="text-[0.7rem] tracking-[0.28em] text-gold">ENCUÉNTRANOS</p>
            <p className="mt-4 leading-relaxed text-cream/80">
              {site.address.place}
              <br />
              {site.address.city}
            </p>
            <a
              href={site.instagram.url}
              target="_blank"
              rel="noopener noreferrer"
              className="press mt-4 inline-flex min-h-11 items-center gap-2 rounded-full text-cream outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <InstagramIcon className="size-5 text-gold" />
              <span className="link-underline">{site.instagram.handle}</span>
              <span className="sr-only">(abre Instagram en otra pestaña)</span>
            </a>
          </div>
        </div>

        <div className="mt-16 flex flex-col gap-3 border-t border-gold/15 pt-6 text-sm text-cream-muted sm:flex-row sm:justify-between">
          <p>© {new Date().getFullYear()} BerryMood. Chocolate &amp; Berry Lab.</p>
          <p>Chilpancingo, Guerrero</p>
        </div>
        <p className="mt-6 text-center text-sm text-cream-muted/80">
          Built with Claude Web Builder by{" "}
          <a
            href="https://tododeia.com"
            target="_blank"
            rel="noopener noreferrer"
            className="underline-offset-4 hover:underline"
          >
            Tododeia
          </a>
        </p>
      </div>
    </footer>
  );
}
