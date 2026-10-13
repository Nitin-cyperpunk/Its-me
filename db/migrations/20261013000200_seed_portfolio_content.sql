-- Seeds the content the site already shows (src/content/portfolio.ts), so the
-- database starts in the same state as the page. Nothing here is new information.
-- Re-running is harmless: existing rows (matched by their unique keys) are left alone,
-- so later edits made in the database are never overwritten.

-- Education: the degree as shown today. The 12th record has only its label —
-- the details aren't known yet, so it stays unpublished until they're filled in.
insert into education
  (qualification, field_of_study, honors, institution_name, location, start_year, end_year, display_order, is_published)
values
  ('B.E. Computer Engineering', 'Computer Engineering', 'Cybersecurity Honors',
   'Late G. N. Sapkal College of Engineering', 'Nashik', 2022, 2026, 1, true),
  ('Higher Secondary Certificate (12th)', null, null, null, null, null, null, 2, false)
on conflict do nothing;

-- Projects: the five on the site, in their current order. Stack, links and
-- images aren't written yet (the site says "case study coming soon").
insert into projects (slug, title, category, short_description, display_order, is_published)
values
  ('ordra',          'Ordra',          'SaaS',             'Cafe management platform.',                 1, true),
  ('rentsetgo',      'RentSetGo',      'SaaS',             'Property listing and real-estate platform.', 2, true),
  ('jobfill',        'JobFill',        'Chrome extension', 'Autofills job application forms.',          3, true),
  ('n8n-workflows',  'n8n workflows',  'Automation',       'Automation workflows built with n8n.',      4, true),
  ('ai-experiments', 'AI experiments', 'Lab',              'Experiments with AI and LLMs.',             5, true)
on conflict do nothing;

-- Skills: the twelve on the site, with the same one-line descriptions.
insert into skills (name, category, description, display_order, is_published)
values
  ('React',      'Frontend',   'Component-driven user interfaces.',      1,  true),
  ('Next.js',    'Frontend',   'Full-stack React framework.',            2,  true),
  ('TypeScript', 'Frontend',   'Typed JavaScript across the stack.',     3,  true),
  ('Node.js',    'Backend',    'JavaScript on the server.',              4,  true),
  ('Supabase',   'Data',       'Postgres, auth and storage as a service.', 5, true),
  ('PostgreSQL', 'Data',       'Relational database.',                   6,  true),
  ('Python',     'Backend',    'Scripting, data and backends.',          7,  true),
  ('FastAPI',    'Backend',    'Python APIs.',                           8,  true),
  ('Docker',     'Cloud',      'Containerised environments.',            9,  true),
  ('AWS',        'Cloud',      'Cloud infrastructure.',                  10, true),
  ('n8n',        'Automation', 'Workflow automation.',                   11, true),
  ('AI / LLM',   'AI',         'Building with large language models.',   12, true)
on conflict do nothing;

-- Experiences: none yet — company names, roles and dates haven't been provided.
-- Until published rows exist, the site keeps its four "to be added" placeholders.
