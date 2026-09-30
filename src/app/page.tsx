import Faq from "@/components/faq/Faq";
import Hero from "@/components/portfolio/Hero/Hero";
import CinematicFooter from "@/components/footer/CinematicFooter";
import Preloader from "@/components/preloader/Preloader";

export default function Home() {
  return <>
  {/* the terminal intro: a fixed overlay, gone once the page is revealed */}
  <Preloader />
  <main className="flex flex-1 flex-col text-white">
    <Hero />
    <Faq />
  </main>
  <CinematicFooter />
  </>;
}
