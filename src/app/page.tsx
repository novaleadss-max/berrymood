import { SiteHeader } from "@/components/site-header";
import { Hero } from "@/components/hero";
import { About, BuildYourMood, SiteFooter, ValuesBand, Visit } from "@/components/sections";

export default function Home() {
  return (
    <>
      <SiteHeader />
      <main>
        <Hero />
        <ValuesBand />
        <About />
        <BuildYourMood />
        <Visit />
      </main>
      <SiteFooter />
    </>
  );
}
