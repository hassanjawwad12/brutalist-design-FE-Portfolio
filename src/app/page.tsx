import { Header } from "@/components/layout/Header";
import { Ticker } from "@/components/layout/Ticker";
import { Footer } from "@/components/layout/Footer";
import { Hero } from "@/components/sections/Hero";
import { Work } from "@/components/sections/Work";
import { About } from "@/components/sections/About";
import { Skills } from "@/components/sections/Skills";

export default function Home() {
  return (
    <>
      <Header />
      <main className="flex-1">
        <Hero />
        <Ticker />
        <Work />
        <About />
        <Skills />
      </main>
      <Footer />
    </>
  );
}
