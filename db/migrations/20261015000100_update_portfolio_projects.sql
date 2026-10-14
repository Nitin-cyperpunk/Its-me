-- Populates the four main portfolio projects with verified data:
-- descriptions, technologies, links, logos, and display order.
-- Idempotent: updates existing rows by slug, inserts only if missing.

-- Add logo_url column if it doesn't exist yet.
alter table projects add column if not exists logo_url text
  check (logo_url is null or logo_url ~ '^(https?://|/)');

-- ── Ordra ────────────────────────────────────────────────────────────
-- GitHub repo: not found on the profile — left unset.
-- Live: https://www.ordracafe.app/  (verified)
update projects set
  title             = 'Ordra',
  category          = 'SaaS',
  project_type      = 'personal',
  short_description = 'A multi-tenant cafe management SaaS platform for orders, menus, billing, analytics and business reporting.',
  description       = 'Built a multi-tenant SaaS platform for cafe management using Next.js, TypeScript, Supabase, and PostgreSQL. Developed modules for digital menus with QR table ordering, a live kitchen board, GST billing, customer management with segmentation, analytics with AI-powered business insights, and WhatsApp marketing. Designed a scalable database architecture with tenant-aware data isolation and role-based access control. Implemented a monorepo architecture using pnpm and Turborepo.',
  technologies      = '{Next.js,TypeScript,Supabase,PostgreSQL,pnpm,Turborepo}',
  live_url          = 'https://www.ordracafe.app/',
  logo_url          = '/projects/ordra-logo.png',
  display_order     = 1,
  is_featured       = true,
  is_published      = true
where slug = 'ordra';

-- ── JobFill ──────────────────────────────────────────────────────────
-- GitHub repo: https://github.com/Nitin-cyperpunk/Job-Autofill-Extension  (verified)
-- Live: https://getjobfill.vercel.app/  (verified)
update projects set
  title             = 'JobFill',
  category          = 'Chrome Extension',
  project_type      = 'personal',
  short_description = 'A privacy-first Chrome extension that saves your profile locally and autofills job application forms in seconds.',
  description       = 'Built a privacy-first Chrome extension (Manifest V3) that stores a job seeker''s profile in chrome.storage.local and autofills job application forms across supported sites including Google Forms, Greenhouse, Lever, Workday-style, and plain HTML forms. Implemented a monorepo with apps/extension and apps/website packages. Features include resume upload with PDF/DOCX parsing, deterministic field mapping with sensitive-question guards, multi-frame and Shadow DOM support, preview-before-fill safe mode, and optional AI-generated answers via OpenAI or Google Gemini with explicit user consent. No backend or account required — profile data never leaves the device unless the user opts in.',
  technologies      = '{TypeScript,React,Tailwind CSS,Vite,Chrome Extension MV3,Zod,Next.js,Vitest}',
  github_url        = 'https://github.com/Nitin-cyperpunk/Job-Autofill-Extension',
  live_url          = 'https://getjobfill.vercel.app/',
  logo_url          = '/projects/jobfill-logo.png',
  display_order     = 2,
  is_published      = true
where slug = 'jobfill';

-- ── RentSetGo ────────────────────────────────────────────────────────
-- GitHub repo: https://github.com/Nitin-cyperpunk/RentSetGo  (verified)
-- Live: https://rentsetgo.vercel.app/  (verified)
update projects set
  title             = 'RentSetGo',
  category          = 'SaaS',
  project_type      = 'personal',
  short_description = 'A property-listing platform connecting property owners with renters through direct owner contact and neighbourhood-first search.',
  description       = 'Built a property-listing platform using Next.js, TypeScript, Supabase, and PostgreSQL. Owners can sign up, list properties for rent or sale with details and photos, and manage listings from a dashboard. Renters can filter by category, budget, and location, browse active listings, and contact owners directly. Features include authentication, owner dashboard, listing expiry management, and an FAQ section. Focused on the Nashik rental market with support for residential and commercial properties.',
  technologies      = '{Next.js,TypeScript,Supabase,PostgreSQL,pnpm,Tailwind CSS}',
  github_url        = 'https://github.com/Nitin-cyperpunk/RentSetGo',
  live_url          = 'https://rentsetgo.vercel.app/',
  logo_url          = '/projects/rentsetgo-logo.png',
  display_order     = 3,
  is_published      = true
where slug = 'rentsetgo';

-- ── AlphaBlock AI ────────────────────────────────────────────────────
-- GitHub repo: https://github.com/Nitin-cyperpunk/-AlphaBlock-AI  (known/verified)
-- Live: https://alpha-block-ai-six.vercel.app/  (verified)
-- This is a new project (not repurposing an existing one).
insert into projects (slug, title, category, project_type, short_description, description, technologies, github_url, live_url, logo_url, display_order, is_published)
values (
  'alpha-block-ai',
  'AlphaBlock AI',
  'Client',
  'client',
  'A client-facing landing page for an AI-powered intelligence and execution layer for on-chain traders.',
  'Developed the frontend for AlphaBlock AI, an intelligence platform for on-chain crypto traders. Built a cinematic scroll-driven landing page with GSAP and ScrollTrigger featuring a laptop-to-phone product showcase animation, responsive breakpoints, and smooth scrolling via Lenis. The site presents KOL alerts, whale alerts, cluster alerts, surge alerts, and natural-language trading queries. Built with Next.js App Router, TypeScript, and Tailwind CSS v4.',
  '{Next.js,TypeScript,Tailwind CSS,GSAP,Lenis,ScrollTrigger}',
  'https://github.com/Nitin-cyperpunk/-AlphaBlock-AI',
  'https://alpha-block-ai-six.vercel.app/',
  '/projects/alphablock-logo.webp',
  4,
  true
) on conflict (slug) do update set
  title             = excluded.title,
  category          = excluded.category,
  project_type      = excluded.project_type,
  short_description = excluded.short_description,
  description       = excluded.description,
  technologies      = excluded.technologies,
  github_url        = excluded.github_url,
  live_url          = excluded.live_url,
  logo_url          = excluded.logo_url,
  display_order     = excluded.display_order,
  is_published      = excluded.is_published;

-- Unpublish placeholder projects that are not in the target four.
-- They remain in the database but won't render on the site.
update projects set is_published = false
where slug in ('n8n-workflows', 'ai-experiments');
