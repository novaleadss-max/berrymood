import { SiteHeader } from "@/components/site-header";
import { Hero } from "@/components/hero";
import { HeroAssembly } from "@/components/hero-assembly";
import { About, BuildYourMood, SiteFooter, ValuesBand, Visit } from "@/components/sections";

export default function Home() {
  return (
    <>
      <SiteHeader />
      <main>
        <HeroAssembly>
          <Hero />
        </HeroAssembly>
        <ValuesBand />
        <About />
        <BuildYourMood />
        <Visit />
      </main>
      <SiteFooter />
    </>
  );
}
