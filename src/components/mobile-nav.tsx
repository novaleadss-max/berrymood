"use client";

import { useState, type CSSProperties } from "react";
import { ArrowUpRight, Menu } from "lucide-react";

import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { InstagramIcon, Sparkle } from "@/components/icons";
import { site } from "@/lib/site";

export function MobileNav() {
  const [open, setOpen] = useState(false);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="outline" size="icon" className="lg:hidden" aria-label="Abrir menú">
          <Menu className="size-5" aria-hidden="true" />
        </Button>
      </SheetTrigger>
      <SheetContent>
        <SheetTitle>Menú</SheetTitle>
        <SheetDescription>Secciones de la página de BerryMood</SheetDescription>

        <p className="flex items-center gap-2 text-[0.7rem] tracking-[0.3em] text-gold">
          <Sparkle className="size-3" />
          BERRYMOOD
        </p>

        <nav aria-label="Móvil" className="mt-14">
          <ul className="flex flex-col">
            {site.nav.map((item, i) => (
              <li
                key={item.href}
                className="nav-item border-b border-gold/15"
                style={{ "--i": i } as CSSProperties}
              >
                <SheetClose asChild>
                  <a
                    href={item.href}
                    className="press flex min-h-14 items-center font-heading text-3xl text-cream outline-none focus-visible:text-gold"
                  >
                    {item.label}
                  </a>
                </SheetClose>
              </li>
            ))}
          </ul>
        </nav>

        <div className="mt-auto space-y-4">
          <Button asChild size="lg" className="w-full">
            <a href={site.instagram.url} target="_blank" rel="noopener noreferrer">
              <InstagramIcon className="size-4" />
              {site.instagram.handle}
              <ArrowUpRight className="size-4" aria-hidden="true" />
            </a>
          </Button>
          <p className="text-center font-heading text-lg italic text-cream-muted">
            {site.slogan}
          </p>
        </div>
      </SheetContent>
    </Sheet>
  );
}
