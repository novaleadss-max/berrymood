import Image from "next/image";
import { ArrowUpRight } from "lucide-react";

import { Button } from "@/components/ui/button";
import { InstagramIcon } from "@/components/icons";
import { MobileNav } from "@/components/mobile-nav";
import { site } from "@/lib/site";

export function SiteHeader() {
  return (
    <header className="absolute inset-x-0 top-0 z-40">
      <div className="mx-auto flex max-w-[1440px] items-center justify-between gap-6 px-4 pt-5 sm:px-8 lg:px-12 lg:pt-7">
        <a
          href="#inicio"
          className="press flex min-h-11 items-center gap-3 rounded-full outline-none focus-visible:ring-2 focus-visible:ring-ring"
          aria-label="BerryMood, ir al inicio"
        >
          <Image
            src="/images/monograma-crema.png"
            alt=""
            width={498}
            height={491}
            className="h-9 w-auto"
            preload
          />
          <span className="text-[0.8rem] font-medium tracking-[0.32em] text-cream">
            BERRYMOOD
          </span>
        </a>

        <nav aria-label="Principal" className="hidden lg:block">
          <ul className="flex items-center gap-12 text-sm text-cream/85">
            {site.nav.map((item) => (
              <li key={item.href}>
                <a
                  href={item.href}
                  className="link-underline rounded-sm py-2 outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  {item.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>

        <div className="flex items-center gap-2">
          <Button asChild className="hidden sm:inline-flex">
            <a href={site.instagram.url} target="_blank" rel="noopener noreferrer">
              <InstagramIcon className="size-4" />
              Síguenos
              <ArrowUpRight className="size-4" aria-hidden="true" />
              <span className="sr-only">(abre Instagram en otra pestaña)</span>
            </a>
          </Button>
          <MobileNav />
        </div>
      </div>
    </header>
  );
}
