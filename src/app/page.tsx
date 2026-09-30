import { SiteHeader } from "@/components/site-header";
import { Hero } from "@/components/hero";
import { Scene } from "@/components/scene";
import { About, BuildYourMood, SiteFooter, ValuesBand, Visit } from "@/components/sections";

export default function Home() {
  return (
    <>
      <SiteHeader />
      <main>
        <Scene layer={1}>
          <Hero />
          <ValuesBand />
        </Scene>
        <Scene layer={2} covers>
          <About />
        </Scene>
        <Scene layer={3} covers>
          <BuildYourMood />
        </Scene>
        <Scene layer={4} covers recedes={false}>
          <Visit />
        </Scene>
      </main>
      <SiteFooter />
    </>
  );
}
