import { SiteHeader } from "@/components/site-header";
import { HeroSlideshow } from "@/components/hero-slideshow";
import { About, BuildYourMood, SiteFooter, ValuesBand, Visit } from "@/components/sections";

export default function Home() {
  return (
    <>
      <SiteHeader />
      <main>
        <HeroSlideshow />
        <ValuesBand />
        <About />
        <BuildYourMood />
        <Visit />
      </main>
      <SiteFooter />
    </>
  );
}
