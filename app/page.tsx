import { Hero } from "@/components/home/hero";
import { About } from "@/components/home/about";
import { Interests } from "@/components/home/interests";
import { Focus } from "@/components/home/focus";
import { StackReveal } from "@/components/home/stack-reveal";
import { Work } from "@/components/home/work";
import { CurrentlyExploring } from "@/components/home/exploring";
import { Future } from "@/components/home/future";
import { Contact } from "@/components/home/contact";
import { Footer } from "@/components/layout/footer";
import { ParallaxBand } from "@/components/ui/parallax-band";

/**
 * The home page is one landscape: a full-height parallax hero, then chapter
 * bands built from the same ridge layers dividing the content into About,
 * Work and Contact.
 */
export default function Home() {
  return (
    <main>
      <Hero />

      <ParallaxBand id="about" eyebrow="About" title="Mostly curious, occasionally organised." />
      <About />
      <Interests />
      <Focus />
      <StackReveal />

      <ParallaxBand id="work" eyebrow="Work" title="Not links. Products, built in." />
      <Work />
      <CurrentlyExploring />
      <Future />

      <ParallaxBand id="contact" eyebrow="Contact" title="Have an idea? Let's build it." />
      <Contact />
      <Footer />
    </main>
  );
}
