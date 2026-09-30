// Content for the scenes after the hero. Only facts that are already known
// about Nitin are filled in; everything else is null and renders as a clearly
// marked "coming soon" slot — fill a value in and it appears.

export const about = {
  heading: ["More than", "just a developer."],
  statement:
    "I'm an AI full-stack developer and software engineer who enjoys turning ideas into useful products — web and mobile apps, AI-powered tools, automation workflows and SaaS.",
  focus: ["Web development", "Mobile development", "AI", "Automation", "SaaS", "Product building"],
};

export const education = {
  heading: ["Where the", "foundation was built."],
  degree: "B.E. Computer Engineering",
  honors: "Cybersecurity Honors",
  institution: "Late G. N. Sapkal College of Engineering",
  city: "Nashik",
  years: "2022 — 2026",
};

export type Experience = {
  /** The one detail known today: every role was an onsite internship. */
  kind: string;
  company: string | null;
  role: string | null;
  period: string | null;
  summary: string | null;
};

// Four onsite internships (from the FAQ). Names, roles and dates to be added.
const internship = (): Experience => ({
  kind: "Onsite internship",
  company: null,
  role: null,
  period: null,
  summary: null,
});

export const experience = {
  heading: ["Things I learned", "by building."],
  intro: "Four onsite internships across product-based and service-based startups.",
  roles: [internship(), internship(), internship(), internship()],
};

export type Project = {
  name: string;
  kind: string;
  summary: string;
  /** Case-study details — null until written. */
  stack: string[] | null;
  href: string | null;
};

export const projects = {
  heading: ["Ideas that made", "it out of my head."],
  items: [
    { name: "Ordra", kind: "SaaS", summary: "Cafe management platform.", stack: null, href: null },
    { name: "RentSetGo", kind: "SaaS", summary: "Property listing and real-estate platform.", stack: null, href: null },
    { name: "JobFill", kind: "Chrome extension", summary: "Autofills job application forms.", stack: null, href: null },
    { name: "n8n workflows", kind: "Automation", summary: "Automation workflows built with n8n.", stack: null, href: null },
    { name: "AI experiments", kind: "Lab", summary: "Experiments with AI and LLMs.", stack: null, href: null },
  ] satisfies Project[],
};

export type Skill = {
  name: string;
  /** What the tool is — not a proficiency claim. */
  note: string;
  /** Position in the constellation, % of the field. */
  x: number;
  y: number;
};

export const skills = {
  heading: ["The tools I use", "to turn ideas into products."],
  items: [
    { name: "React", note: "Component-driven user interfaces.", x: 18, y: 22 },
    { name: "Next.js", note: "Full-stack React framework.", x: 40, y: 12 },
    { name: "TypeScript", note: "Typed JavaScript across the stack.", x: 30, y: 44 },
    { name: "Node.js", note: "JavaScript on the server.", x: 58, y: 30 },
    { name: "Supabase", note: "Postgres, auth and storage as a service.", x: 78, y: 16 },
    { name: "PostgreSQL", note: "Relational database.", x: 86, y: 44 },
    { name: "Python", note: "Scripting, data and backends.", x: 12, y: 66 },
    { name: "FastAPI", note: "Python APIs.", x: 34, y: 80 },
    { name: "Docker", note: "Containerised environments.", x: 56, y: 62 },
    { name: "AWS", note: "Cloud infrastructure.", x: 74, y: 78 },
    { name: "n8n", note: "Workflow automation.", x: 92, y: 70 },
    { name: "AI / LLM", note: "Building with large language models.", x: 52, y: 90 },
  ] satisfies Skill[],
};

export const github = {
  heading: ["Building in public,", "one commit at a time."],
};

export type Interest = {
  name: string;
  icon: "shuttle" | "ball" | "book" | "dumbbell" | "plane" | "cup" | "note";
  /** Position in the field, % — desktop only. */
  x: number;
  y: number;
  /** A real asset later (path under /public). */
  image: string | null;
};

export const beyondCode = {
  heading: ["There is more to life", "than writing code."],
  interests: [
    { name: "Badminton", icon: "shuttle", x: 14, y: 24, image: null },
    { name: "Football", icon: "ball", x: 38, y: 64, image: null },
    { name: "Books", icon: "book", x: 58, y: 18, image: null },
    { name: "Gym", icon: "dumbbell", x: 80, y: 52, image: null },
    { name: "Travel", icon: "plane", x: 22, y: 78, image: null },
    { name: "Coffee", icon: "cup", x: 66, y: 82, image: null },
    { name: "Music", icon: "note", x: 90, y: 20, image: null },
  ] satisfies Interest[],
};
