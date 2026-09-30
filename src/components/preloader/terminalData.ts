// Everything the terminal prints. Times are seconds from the start of the
// intro; the timeline never shows a line earlier than this, and nudges it later
// only when the line before it hasn't finished yet.

export type IntroStage =
  | "boot"
  | "profile"
  | "projects"
  | "skills"
  | "interests"
  | "finalizing"
  | "ready"
  | "transition"
  | "complete";

export type TerminalLine =
  | { kind: "log"; at: number; stamp: string; text: string; tone?: "accent" }
  | { kind: "field"; at: number; stamp: string; label: string; value: string }
  | { kind: "check"; at: number; stamp: string; text: string; note?: string }
  | { kind: "success"; at: number; stamp: string; text: string }
  | { kind: "progress"; at: number; duration: number }
  | { kind: "identity"; at: number; name: string; tagline: string };

export type TerminalPhase = {
  id: Exclude<IntroStage, "transition" | "complete">;
  /** When the command starts typing. */
  start: number;
  /** When the empty prompt first appears (defaults to `start`). */
  promptAt?: number;
  command: string;
  lines: TerminalLine[];
};

export const PROMPT = { user: "nitinverse@portfolio", path: "~" };

/** When the terminal turns to glass and the page starts showing through. */
export const REVEAL_AT = 11.5;

export const terminalPhases: TerminalPhase[] = [
  {
    id: "boot",
    promptAt: 0.2,
    start: 0.5,
    command: "./boot",
    lines: [
      { kind: "log", at: 0.75, stamp: "[ 00ms]", text: "Booting nitinverse..." },
      { kind: "log", at: 0.95, stamp: "[120ms]", text: "Initializing system modules..." },
      { kind: "log", at: 1.2, stamp: "[340ms]", text: "Loading environment..." },
      { kind: "log", at: 1.5, stamp: "[680ms]", text: "Checking dependencies..." },
      { kind: "success", at: 1.75, stamp: "[920ms]", text: "Preparing portfolio runtime..." },
    ],
  },
  {
    id: "profile",
    start: 2.0,
    command: "./load_profile",
    lines: [
      { kind: "log", at: 2.0, stamp: "[2.0s]", text: "Initializing developer.profile" },
      { kind: "field", at: 2.3, stamp: "[2.3s]", label: "Name", value: "Nitin Singh" },
      { kind: "field", at: 2.6, stamp: "[2.6s]", label: "Role", value: "Full Stack Developer" },
      { kind: "field", at: 2.9, stamp: "[2.9s]", label: "Focus", value: "Web • AI • Automation" },
      { kind: "field", at: 3.2, stamp: "[3.2s]", label: "Location", value: "India" },
      { kind: "field", at: 3.5, stamp: "[3.5s]", label: "Motto", value: "Build • Learn • Ship" },
    ],
  },
  {
    id: "projects",
    start: 4.0,
    command: "./load_projects",
    lines: [
      { kind: "log", at: 4.0, stamp: "[4.0s]", text: "Fetching projects..." },
      { kind: "check", at: 4.3, stamp: "[4.3s]", text: "Ordra", note: "Cafe Management SaaS" },
      { kind: "check", at: 4.8, stamp: "[4.8s]", text: "RentSetGo", note: "Real Estate SaaS" },
      { kind: "check", at: 5.2, stamp: "[5.2s]", text: "JobFill", note: "Chrome Extension" },
      { kind: "check", at: 5.6, stamp: "[5.6s]", text: "n8n", note: "Automation Workflows" },
      { kind: "check", at: 5.9, stamp: "[5.9s]", text: "AI Experiments" },
    ],
  },
  {
    id: "skills",
    start: 6.0,
    command: "./load_skills",
    lines: [
      { kind: "log", at: 6.0, stamp: "[6.0s]", text: "Loading technical skills..." },
      // speeds up as it goes, like a cache warming
      { kind: "check", at: 6.2, stamp: "[6.2s]", text: "React" },
      { kind: "check", at: 6.4, stamp: "[6.4s]", text: "Next.js" },
      { kind: "check", at: 6.58, stamp: "[6.6s]", text: "TypeScript" },
      { kind: "check", at: 6.74, stamp: "[6.8s]", text: "Node.js" },
      { kind: "check", at: 6.88, stamp: "[7.0s]", text: "Supabase" },
      { kind: "check", at: 7.0, stamp: "[7.2s]", text: "PostgreSQL" },
      { kind: "check", at: 7.12, stamp: "[7.4s]", text: "AI / LLM" },
      { kind: "check", at: 7.24, stamp: "[7.5s]", text: "n8n / Automation" },
    ],
  },
  {
    id: "interests",
    start: 7.5,
    command: "./load_life",
    lines: [
      { kind: "log", at: 7.5, stamp: "[7.5s]", text: "Loading personal modules..." },
      { kind: "check", at: 7.7, stamp: "[7.7s]", text: "Coffee" },
      { kind: "check", at: 7.9, stamp: "[7.9s]", text: "Books" },
      { kind: "check", at: 8.1, stamp: "[8.1s]", text: "Badminton" },
      { kind: "check", at: 8.28, stamp: "[8.3s]", text: "Football" },
      { kind: "check", at: 8.46, stamp: "[8.5s]", text: "Gym" },
      { kind: "check", at: 8.64, stamp: "[8.7s]", text: "Travel" },
      { kind: "check", at: 8.8, stamp: "[8.9s]", text: "Music" },
    ],
  },
  {
    id: "finalizing",
    start: 9.0,
    command: "./prepare_launch",
    lines: [
      { kind: "log", at: 9.0, stamp: "[9.0s]", text: "Assembling portfolio..." },
      { kind: "log", at: 9.3, stamp: "[9.4s]", text: "Optimizing assets..." },
      { kind: "log", at: 9.55, stamp: "[9.8s]", text: "Finalizing experience..." },
      { kind: "progress", at: 9.7, duration: 0.5 },
      { kind: "success", at: 10.25, stamp: "[10.2s]", text: "System ready!" },
    ],
  },
  {
    id: "ready",
    start: 10.5,
    command: "./start",
    lines: [
      { kind: "identity", at: 10.62, name: "NITINVERSE", tagline: "BUILD • LEARN • SHIP" },
      { kind: "log", at: 10.95, stamp: "[10.8s]", text: "Welcome to my world.", tone: "accent" },
      { kind: "log", at: 11.1, stamp: "[11.0s]", text: "Entering portfolio..." },
    ],
  },
];

/** Screen-reader status for each stage (the terminal itself is decorative). */
export const stageLabels: Record<IntroStage, string> = {
  boot: "Booting portfolio",
  profile: "Loading profile",
  projects: "Loading projects",
  skills: "Loading skills",
  interests: "Loading interests",
  finalizing: "Finalizing",
  ready: "Ready",
  transition: "Entering portfolio",
  complete: "",
};
