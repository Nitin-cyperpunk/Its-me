import Faq from "@/components/faq/Faq";
import Hero from "@/components/portfolio/Hero/Hero";
import CinematicFooter from "@/components/footer/CinematicFooter";

export default function Home() {
  return <>
  <main className="flex flex-1 flex-col text-white">
    <Hero />
    <Faq />
  </main>
  <CinematicFooter />
  </>;
}
