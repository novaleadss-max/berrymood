import { SiteHeader } from "@/components/site-header";
import { Hero } from "@/components/hero";
import { Blend } from "@/components/blend";
import { About, BuildYourMood, SiteFooter, ValuesBand, Visit } from "@/components/sections";

export default function Home() {
  return (
    <>
      <SiteHeader />
      <main>
        <Blend enter={false}>
          <Hero />
        </Blend>
        <ValuesBand />
        <About />
        <BuildYourMood />
        <Visit />
      </main>
      <SiteFooter />
    </>
  );
}
