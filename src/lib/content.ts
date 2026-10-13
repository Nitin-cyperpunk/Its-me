// Portfolio content for Experience, Projects, Skills and Education, read from
// Neon (lib/db.ts) and shaped exactly like the built-in content the sections
// already render (content/portfolio.ts).
//
// Freshness: in production each table is read once, then cached for
// REVALIDATE seconds (5 min) and shared by every visitor (stale-while-
// revalidate) — an edit in the database shows up within that window, or on the
// next visit after POST /api/revalidate. In development nothing is cached.
//
// Fallback: if the database isn't configured, can't be reached, or a table has
// no published rows yet, that section shows the built-in content instead — a
// section is never left empty. Failures are not cached, so the next request retries.

import "server-only";
import { unstable_cache } from "next/cache";
import {
  education as builtInEducation,
  experience as builtInExperience,
  projects as builtInProjects,
  skills as builtInSkills,
  type Experience,
  type Project,
  type Skill,
} from "@/content/portfolio";
import { getDb } from "./db";
import { skillIcon } from "./skill-icons";

export const CONTENT_TAG = "portfolio-content";
/** Seconds a read is reused before it's refreshed in the background. */
const REVALIDATE = 5 * 60;
// Locally, every request reads the database, so edits show on refresh.
const UNCACHED = process.env.NODE_ENV === "development";

// Dates come back as plain strings (to_char / ::text), so cached values
// round-trip through JSON unchanged.
const cached = <T>(name: string, read: () => Promise<T>) =>
  unstable_cache(read, [CONTENT_TAG, name], { revalidate: REVALIDATE, tags: [CONTENT_TAG] });

async function load<T>(name: string, read: () => Promise<T>): Promise<T | null> {
  if (!getDb()) return null;
  try {
    return UNCACHED ? await read() : await cached(name, read)();
  } catch (error) {
    console.error(`[content] couldn't read ${name} from the database; using built-in content.`, error);
    return null;
  }
}

const sql = () => getDb()!;
const url = (value: unknown) => (typeof value === "string" && /^(https?:\/\/|\/)/.test(value) ? value : null);
const list = (value: unknown) => (Array.isArray(value) ? value.filter((v): v is string => typeof v === "string" && v.trim() !== "") : []);

// ---------------------------------------------------------------- experience

const month = (iso: string | null) =>
  iso ? new Date(`${iso}T00:00:00Z`).toLocaleDateString("en-GB", { month: "short", year: "numeric", timeZone: "UTC" }) : null;

// stored as a lowercase value ('internship'), shown as a label ('Internship')
const label = (value: string | null) => (value ? value.charAt(0).toUpperCase() + value.slice(1) : null);

function period(start: string | null, end: string | null, current: boolean) {
  const from = month(start);
  const to = current ? "Present" : month(end);
  if (from && to) return `${from} – ${to}`;
  // only one end known: say exactly that, never imply the role is ongoing
  if (from) return `Started ${from}`;
  return to ? `Until ${to}` : null;
}

export async function getExperiences(): Promise<Experience[]> {
  const rows = await load("experiences", () =>
    sql().query(`
      select e.id::text                                    as id,
             coalesce(c.name, e.company_name)              as company_name,
             coalesce(c.logo_key, e.company_logo_key)      as logo_key,
             coalesce(c.logo_url, e.company_logo_url)      as logo_url,
             e.role, e.employment_type, e.location, e.summary, e.highlights, e.technologies,
             to_char(e.start_date, 'YYYY-MM-DD') as start_date,
             to_char(e.end_date, 'YYYY-MM-DD')   as end_date,
             e.is_current
        from experiences e
        left join companies c on c.id = e.company_id
       where e.is_published
       order by e.display_order, e.is_current desc, e.start_date desc nulls last, e.id`),
  );
  if (!rows?.length) return builtInExperience.roles;
  return rows.map((r) => ({
    kind: [label(r.employment_type), r.location].filter(Boolean).join(" · ") || "Experience",
    company: r.company_name,
    role: r.role,
    period: period(r.start_date, r.end_date, r.is_current),
    summary: r.summary,
    // a logo in the private bucket is served by our own route; otherwise an external URL
    logoUrl: r.logo_key ? mediaUrl(r.logo_key) : url(r.logo_url),
    id: r.id,
    highlights: list(r.highlights),
    technologies: list(r.technologies),
  }));
}

/** Site URL for an object in the "media" bucket (see app/media/[...key]/route.ts). */
const mediaUrl = (key: string) => `/media/${key.split("/").map(encodeURIComponent).join("/")}`;

/**
 * Storage keys that published experiences point at — the only objects the
 * /media route will serve, so the rest of the private bucket stays private.
 */
export async function getPublishedMediaKeys(): Promise<Set<string>> {
  const rows = await load("media-keys", () =>
    sql().query(`
      select distinct coalesce(c.logo_key, e.company_logo_key) as key
        from experiences e
        left join companies c on c.id = e.company_id
       where e.is_published and coalesce(c.logo_key, e.company_logo_key) is not null`),
  );
  return new Set((rows ?? []).map((r) => r.key as string));
}

// ------------------------------------------------------------------ projects

export async function getProjects(): Promise<Project[]> {
  const rows = await load("projects", () =>
    sql().query(`
      select slug, title, category, short_description, technologies,
             cover_image_url, github_url, live_url
        from projects
       where is_published
       order by is_featured desc, display_order, id`),
  );
  if (!rows?.length) return builtInProjects.items;
  return rows.map((r) => {
    const stack = list(r.technologies);
    const liveUrl = url(r.live_url);
    const githubUrl = url(r.github_url);
    return {
      name: r.title,
      kind: r.category,
      summary: r.short_description,
      stack: stack.length ? stack : null,
      href: liveUrl ?? githubUrl,
      coverUrl: url(r.cover_image_url),
      githubUrl,
      liveUrl,
    };
  });
}

// -------------------------------------------------------------------- skills

export type SkillGroup = { category: string; items: Skill[] };

// Positions inside one category's constellation (% of the field): staggered
// rows of three, alternately shifted, with a little vertical jitter — reads as a
// constellation, and long names never land on top of each other. Deterministic.
function layout(count: number) {
  const perRow = count <= 4 ? 2 : 3;
  const rows = Math.ceil(count / perRow);
  return Array.from({ length: count }, (_, i) => {
    const row = Math.floor(i / perRow);
    const inRow = Math.min(perRow, count - row * perRow);
    const col = i % perRow;
    const shift = row % 2 ? 6 : -6;
    const x = 14 + (72 * (col + 0.5)) / inRow + shift;
    const jitter = ((col * 37 + row * 17) % 9) - 4;
    const y = 10 + (80 * (row + 0.5)) / rows + jitter;
    return { x: Math.round(x * 10) / 10, y: Math.round(y * 10) / 10 };
  });
}

/** Published skills, grouped by category in their configured order. */
export async function getSkillGroups(): Promise<SkillGroup[]> {
  const rows = await load("skills", () =>
    sql().query(`
      select name, category, description, icon
        from skills
       where is_published
       order by display_order, name`),
  );
  // the built-in constellation keeps its hand-placed layout as a single group
  if (!rows?.length) return [{ category: "Tools", items: builtInSkills.items }];

  const groups = new Map<string, Omit<Skill, "x" | "y">[]>();
  for (const r of rows) {
    const list = groups.get(r.category) ?? [];
    const icon = skillIcon(r.icon);
    list.push({
      name: r.name,
      note: r.description || r.category,
      icon,
      // what its particles form when selected: databases share the cylinder,
      // anything with a brand icon traces that logo, the rest keep the pattern
      shape: r.category === "Databases" ? "database" : icon ? "icon" : null,
    });
    groups.set(r.category, list);
  }
  return [...groups].map(([category, list]) => {
    const spots = layout(list.length);
    return { category, items: list.map((skill, i) => ({ ...skill, ...spots[i] })) };
  });
}

// ----------------------------------------------------------------- education

export type EducationEntry = {
  qualification: string;
  honors: string | null;
  institution: string | null;
  city: string | null;
  years: string | null;
  grade: string | null;
};

const years = (start: number | null, end: number | null) =>
  start && end ? `${start} — ${end}` : start ? `${start} —` : end ? String(end) : null;

const builtInEntry: EducationEntry = {
  qualification: builtInEducation.degree,
  honors: builtInEducation.honors,
  institution: builtInEducation.institution,
  city: builtInEducation.city,
  years: builtInEducation.years,
  grade: null,
};

/** The first entry is the headline card; the rest are listed under it. */
export async function getEducation(): Promise<EducationEntry[]> {
  const rows = await load("education", () =>
    sql().query(`
      select qualification, honors, institution_name, location, start_year, end_year, grade
        from education
       where is_published
       order by display_order, end_year desc nulls last, id`),
  );
  if (!rows?.length) return [builtInEntry];
  return rows.map((r) => ({
    qualification: r.qualification,
    honors: r.honors,
    institution: r.institution_name,
    city: r.location,
    years: years(r.start_year, r.end_year),
    grade: r.grade,
  }));
}
