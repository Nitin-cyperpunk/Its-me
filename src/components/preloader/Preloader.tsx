import { IBM_Plex_Mono } from "next/font/google";
import TerminalPreloader from "./TerminalPreloader";

// Same monospace as the hero, so the terminal and the desk read as one piece.
const mono = IBM_Plex_Mono({
  weight: ["400", "500", "600"],
  subsets: ["latin"],
  variable: "--intro-font-mono",
});

export default function Preloader() {
  return <TerminalPreloader className={mono.variable} />;
}
