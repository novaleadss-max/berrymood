import { SiteHeader } from "@/components/site-header";
import { Hero } from "@/components/hero";
import { HeroSequence } from "@/components/hero-sequence";
import { ConnectedGrid } from "@/components/connected-grid";
import { About, BuildYourMood, SiteFooter, ValuesBand, Visit } from "@/components/sections";

export default function Home() {
  return (
    <>
      <SiteHeader />
      <main>
        <HeroSequence>
          <Hero />
        </HeroSequence>
        <ValuesBand />
        <About />
        <BuildYourMood />
        <ConnectedGrid />
        <Visit />
      </main>
      <SiteFooter />
    </>
  );
}
