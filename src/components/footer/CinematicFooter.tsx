import { Barlow_Condensed, Caveat, Host_Grotesk } from "next/font/google";
import { headers } from "next/headers";
import { contactEmail, findProfile, siteConfig } from "@/lib/site";
import { VISITOR_HEADER } from "@/lib/visitor";
import ContactForm from "./ContactForm";
import FooterScene from "./FooterScene";
import VisitorInfo from "./VisitorInfo";

// Same faces as the FAQ so the ending reads as part of the same piece.
const display = Barlow_Condensed({
  weight: "800",
  subsets: ["latin"],
  variable: "--footer-font-display",
});

const body = Host_Grotesk({
  subsets: ["latin"],
  variable: "--footer-font-body",
});

// the handwritten aside under the contact form (same face as the hero's notes)
const script = Caveat({
  weight: "700",
  subsets: ["latin"],
  variable: "--footer-font-script",
});

const github = findProfile("github.com");
const linkedin = findProfile("linkedin.com");
// only a real, configured address is ever linked (see contactEmail in lib/site.ts)
const email = contactEmail && `mailto:${contactEmail}`;

const links = [
  github && { label: "GitHub", href: github },
  linkedin && { label: "LinkedIn", href: linkedin },
  email && { label: "Email", href: email },
].filter((link): link is { label: string; href: string } => Boolean(link));

const button =
  "inline-flex min-h-12 items-center gap-2 rounded-full border px-[1.4rem] text-[0.95rem] font-medium transition sm:backdrop-blur-sm duration-250 hover:-translate-y-0.5 focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-lime motion-reduce:transition-none motion-reduce:hover:translate-y-0";
const ghostButton = `${button} border-mist/30 bg-[rgb(20_12_50/0.6)] text-mist sm:bg-[rgb(20_12_50/0.35)] hover:border-mist/60 hover:bg-[rgb(40_24_90/0.5)]`;
// the arrow leans the way the link goes on hover
const arrow =
  "inline-block transition-transform duration-300 ease-out group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-focus-visible:translate-x-0.5 group-focus-visible:-translate-y-0.5 motion-reduce:transition-none motion-reduce:group-hover:transform-none";
// mask for each line's reveal; the padding keeps descenders from being clipped
const line = "-my-[0.04em] block overflow-hidden py-[0.04em]";

// Set by src/proxy.ts after it has verified or assigned the number.
async function getVisitorNumber() {
  const n = Number((await headers()).get(VISITOR_HEADER));
  return Number.isSafeInteger(n) && n > 0 ? n : null;
}

// Content is server-rendered; only FooterScene (the landscape + motion) and
// the live clock ship JS. data-cta / data-cta-line are the hooks FooterScene
// animates — keep them.
export default async function CinematicFooter() {
  const visitorNumber = await getVisitorNumber();

  return (
    <FooterScene
      className={`${display.variable} ${body.variable} ${script.variable} relative isolate flex min-h-[max(100svh,40rem)] flex-col overflow-clip bg-night font-[family-name:var(--footer-font-body)] text-mist lg:min-h-[max(115svh,44rem)]`}
    >
      <div className="relative z-2 mx-auto flex w-full max-w-7xl flex-1 flex-col justify-end gap-9 px-[clamp(1rem,5vw,5rem)] pt-[clamp(9rem,24svh,16rem)] pb-[clamp(1.5rem,4vw,2.5rem)]">
        {/* phones/tablets: headline, then the form; desktop: side by side */}
        <div
          data-cta
          className="grid gap-[clamp(3rem,8vw,4.5rem)] lg:grid-cols-[minmax(0,1.05fr)_minmax(0,1fr)] lg:items-start lg:gap-[clamp(3rem,6vw,7rem)]"
        >
          <div>
            <p className="mb-5 font-mono text-xs tracking-[0.24em] text-mist/70 uppercase">End of the scroll</p>

            <h2 className="font-[family-name:var(--footer-font-display)] text-[clamp(3.5rem,11vw,10rem)] leading-[0.86] font-extrabold tracking-[-0.01em] uppercase [text-shadow:0_0.08em_0.6em_rgb(7_5_26/0.45)] lg:text-[clamp(4.5rem,7.2vw,8rem)]">
              <span className={line}>
                <span className="block" data-cta-line>
                  Let&apos;s build
                </span>
              </span>
              <span className={line}>
                <span className="block text-lime" data-cta-line>
                  something.
                </span>
              </span>
            </h2>

            <p className="mt-7 max-w-md text-[clamp(1rem,1.4vw,1.2rem)] leading-normal text-mist/80">
              Have an idea, a role in mind, or just want to talk? My inbox is open.
            </p>

            <div className="mt-9 flex flex-wrap gap-3">
              {links.map((link) => (
                <a
                  key={link.label}
                  className={`group ${ghostButton}`}
                  href={link.href}
                  {...(link.href.startsWith("http")
                    ? { target: "_blank", rel: "noopener noreferrer" }
                    : {})}
                >
                  {link.label}
                  <span aria-hidden="true" className={arrow}>
                    ↗
                  </span>
                </a>
              ))}
            </div>
          </div>

          <div className="w-full max-w-xl lg:max-w-none lg:pt-[clamp(1.5rem,3vw,3rem)]">
            <ContactForm />
          </div>
        </div>

        {/* stacked and centred on phones; nav | visitor | © from md up */}
        <div className="grid items-center gap-x-8 gap-y-4 border-t border-mist/15 pt-5 text-sm text-mist/60 md:grid-cols-[1fr_auto_1fr]">
          <VisitorInfo visitorNumber={visitorNumber} className="md:col-start-2 md:row-start-1" />
          <nav
            aria-label="Contact"
            className="flex flex-wrap justify-center gap-x-6 gap-y-2 md:col-start-1 md:row-start-1 md:justify-start"
          >
            {links.map((link) => (
              <a
                key={link.label}
                className="text-mist/80 transition-colors hover:text-lime focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-lime"
                href={link.href}
                {...(link.href.startsWith("http")
                  ? { target: "_blank", rel: "noopener noreferrer" }
                  : {})}
              >
                {link.label}
              </a>
            ))}
          </nav>
          <p className="text-center md:col-start-3 md:row-start-1 md:text-right">
            © {new Date().getFullYear()} {siteConfig.name}
          </p>
        </div>
      </div>
    </FooterScene>
  );
}
