// Brand icons for skills, keyed by the Simple Icons slug stored in skills.icon.
// Server-only: only the paths of the skills actually rendered reach the page.
// Named imports keep the bundle to these icons, not the whole set.

import "server-only";
import {
  siCss,
  siDjango,
  siExpress,
  siFigma,
  siGit,
  siGithub,
  siGooglegemini,
  siGraphql,
  siHtml5,
  siHuggingface,
  siJavascript,
  siJira,
  siJquery,
  siMongodb,
  siMui,
  siN8n,
  siNeon,
  siNextdotjs,
  siNodedotjs,
  siOpenjdk,
  siPostgresql,
  siPostman,
  siPython,
  siReact,
  siSupabase,
  siTailwindcss,
  siTypescript,
  siVercel,
  type SimpleIcon,
} from "simple-icons";

export type SkillIcon = { title: string; path: string };

const icons: Record<string, SimpleIcon> = Object.fromEntries(
  [
    siCss, siDjango, siExpress, siFigma, siGit, siGithub, siGooglegemini, siGraphql, siHtml5,
    siHuggingface, siJavascript, siJira, siJquery, siMongodb, siMui, siN8n, siNeon, siNextdotjs,
    siNodedotjs, siOpenjdk, siPostgresql, siPostman, siPython, siReact, siSupabase,
    siTailwindcss, siTypescript, siVercel,
  ].map((icon) => [icon.slug, icon]),
);

/** The icon for a stored identifier, or null (unknown ids fall back to a plain chip). */
export function skillIcon(id: string | null | undefined): SkillIcon | null {
  const icon = id ? icons[id] : undefined;
  return icon ? { title: icon.title, path: icon.path } : null;
}
