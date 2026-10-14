import Image from "next/image";
import { ArrowUpRight } from "lucide-react";

import { Button } from "@/components/ui/button";
import { InstagramIcon } from "@/components/icons";
import { MobileNav } from "@/components/mobile-nav";
import { HeaderShell } from "@/components/header-shell";
import { site } from "@/lib/site";

export function SiteHeader() {
  return (
    <HeaderShell>
      <div className="mx-auto flex h-16 max-w-[1440px] items-center justify-between gap-6 px-4 sm:px-8 lg:h-[72px] lg:px-12">
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
            className="h-8 w-auto"
            preload
          />
          <span className="text-[0.8rem] font-medium tracking-[0.32em] text-cream">
            BERRYMOOD
          </span>
        </a>

        <nav aria-label="Principal" className="hidden lg:block">
          <ul className="flex items-center gap-10 text-[0.8125rem] tracking-[0.01em] text-cream/80">
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
          <Button asChild size="sm" className="hidden sm:inline-flex">
            <a href={site.instagram.url} target="_blank" rel="noopener noreferrer">
              <InstagramIcon className="size-3.5" />
              Síguenos
              <ArrowUpRight className="size-3.5" aria-hidden="true" />
              <span className="sr-only">(abre Instagram en otra pestaña)</span>
            </a>
          </Button>
          <MobileNav />
        </div>
      </div>
    </HeaderShell>
  );
}
