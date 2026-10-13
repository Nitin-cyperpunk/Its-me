// Portfolio content for Experience, Projects, Skills and Education, read from
// Neon (lib/db.ts) and shaped exactly like the built-in content the sections
// already render (content/portfolio.ts).
//
// Freshness: each table is read once, then cached for REVALIDATE seconds and
// shared by every visitor (stale-while-revalidate). An edit in the database
// shows up within that window, or immediately after POST /api/revalidate.
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

export const CONTENT_TAG = "portfolio-content";
/** Seconds a read is reused before it's refreshed in the background. */
const REVALIDATE = 60 * 60;

// Dates come back as plain strings (to_char / ::text), so cached values
// round-trip through JSON unchanged.
const cached = <T>(name: string, read: () => Promise<T>) =>
  unstable_cache(read, [CONTENT_TAG, name], { revalidate: REVALIDATE, tags: [CONTENT_TAG] });

async function load<T>(name: string, read: () => Promise<T>): Promise<T | null> {
  if (!getDb()) return null;
  try {
    return await cached(name, read)();
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

function period(start: string | null, end: string | null, current: boolean) {
  const from = month(start);
  const to = current ? "Present" : month(end);
  return from && to ? `${from} – ${to}` : from ?? to;
}

export async function getExperiences(): Promise<Experience[]> {
  const rows = await load("experiences", () =>
    sql().query(`
      select company_name, company_logo_url, company_logo_key, role, employment_type, location, summary,
             to_char(start_date, 'YYYY-MM-DD') as start_date,
             to_char(end_date, 'YYYY-MM-DD')   as end_date,
             is_current
        from experiences
       where is_published
       order by display_order, is_current desc, start_date desc nulls last, id`),
  );
  if (!rows?.length) return builtInExperience.roles;
  return rows.map((r) => ({
    kind: [r.employment_type, r.location].filter(Boolean).join(" · ") || "Experience",
    company: r.company_name,
    role: r.role,
    period: period(r.start_date, r.end_date, r.is_current),
    summary: r.summary,
    // a logo in the private bucket is served by our own route; otherwise an external URL
    logoUrl: r.company_logo_key ? mediaUrl(r.company_logo_key) : url(r.company_logo_url),
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
      select distinct company_logo_key as key
        from experiences
       where is_published and company_logo_key is not null`),
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

// Skills already on the site keep their hand-placed spots in the constellation.
const placed = new Map(builtInSkills.items.map((s) => [s.name.toLowerCase(), { x: s.x, y: s.y }]));

// A new skill gets the free spot farthest from every other node, picked from a
// fixed set of candidates — deterministic, so it doesn't move between visits.
function place(taken: { x: number; y: number }[]) {
  let best = { x: 50, y: 50 };
  let bestGap = -1;
  for (let i = 0; i < 160; i++) {
    const angle = i * 2.399963; // golden angle
    const radius = Math.sqrt((i + 0.5) / 160);
    const candidate = { x: 50 + 40 * radius * Math.cos(angle), y: 50 + 40 * radius * Math.sin(angle) };
    const gap = Math.min(...taken.map((t) => Math.hypot(t.x - candidate.x, t.y - candidate.y)), Infinity);
    if (gap > bestGap) {
      bestGap = gap;
      best = candidate;
    }
  }
  return { x: Math.round(best.x * 10) / 10, y: Math.round(best.y * 10) / 10 };
}

export async function getSkills(): Promise<Skill[]> {
  const rows = await load("skills", () =>
    sql().query(`
      select name, category, description
        from skills
       where is_published
       order by category, display_order, name`),
  );
  if (!rows?.length) return builtInSkills.items;
  const taken: { x: number; y: number }[] = [];
  const known = rows.filter((r) => placed.has(r.name.toLowerCase()));
  const fresh = rows.filter((r) => !placed.has(r.name.toLowerCase()));
  for (const r of known) taken.push(placed.get(r.name.toLowerCase())!);
  const positions = new Map<string, { x: number; y: number }>();
  for (const r of known) positions.set(r.name, placed.get(r.name.toLowerCase())!);
  for (const r of fresh) {
    const spot = place(taken);
    taken.push(spot);
    positions.set(r.name, spot);
  }
  return rows.map((r) => ({
    name: r.name,
    note: r.description || r.category,
    ...positions.get(r.name)!,
  }));
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
