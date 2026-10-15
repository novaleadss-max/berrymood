import { SiteHeader } from "@/components/site-header";
import { Hero } from "@/components/hero";
import { HeroVideo } from "@/components/hero-video";
import { About, BuildYourMood, SiteFooter, ValuesBand, Visit } from "@/components/sections";

export default function Home() {
  return (
    <>
      <SiteHeader />
      <main>
        <HeroVideo>
          <Hero />
        </HeroVideo>
        <ValuesBand />
        <About />
        <BuildYourMood />
        <Visit />
      </main>
      <SiteFooter />
    </>
  );
}
