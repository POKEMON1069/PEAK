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

export default function Home() {
  return (
    <main className="pt-16">
      <Hero />
      <About />
      <Interests />
      <Focus />
      <StackReveal />
      <Work />
      <CurrentlyExploring />
      <Future />
      <Contact />
      <Footer />
    </main>
  );
}
