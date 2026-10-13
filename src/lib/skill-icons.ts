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

/**
 * color: the brand's official colour (null for generic glyphs, which use the
 * theme accent). darkBrand: the official colour is near-black, so on the dark
 * theme it's shown inverted (light), as those brands do on dark backgrounds.
 */
export type SkillIcon = { title: string; path: string; color: string | null; darkBrand: boolean };

// Generic glyphs (24×24, filled) for skills with no official logo — clearly
// not brand marks.
const generic: Record<string, { title: string; path: string }> = {
  "generic-database": {
    title: "Database",
    path: "M12 2c4.4 0 8 1.3 8 3s-3.6 3-8 3-8-1.3-8-3 3.6-3 8-3Zm-8 6.2C5.5 9.4 8.5 10 12 10s6.5-.6 8-1.8V12c0 1.7-3.6 3-8 3s-8-1.3-8-3V8.2Zm0 7C5.5 16.4 8.5 17 12 17s6.5-.6 8-1.8V19c0 1.7-3.6 3-8 3s-8-1.3-8-3v-3.8Z",
  },
  "generic-api": {
    title: "API",
    path: "M16 3l5 5-5 5V9.5H8v-3h8V3ZM8 11v3.5h8v3H8V21l-5-5 5-5Z",
  },
  "generic-ai": {
    title: "AI",
    path: "M12 1.5l2.6 7.9 7.9 2.6-7.9 2.6-2.6 7.9-2.6-7.9L1.5 12l7.9-2.6L12 1.5Z",
  },
  "generic-prompt": {
    title: "Prompt",
    path: "M4 3h16a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H9l-5 4v-4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2Z",
  },
};

// relative luminance of a hex colour (WCAG), to spot near-black brand colours
const luminance = (hex: string) => {
  const [r, g, b] = [0, 2, 4].map((i) => {
    const c = parseInt(hex.slice(i, i + 2), 16) / 255;
    return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
};

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
  if (!id) return null;
  const glyph = generic[id];
  if (glyph) return { ...glyph, color: null, darkBrand: false };
  const icon = icons[id];
  return icon
    ? { title: icon.title, path: icon.path, color: `#${icon.hex}`, darkBrand: luminance(icon.hex) < 0.05 }
    : null;
}
