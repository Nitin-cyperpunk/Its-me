-- Companies, internships and skills as supplied by Nitin (2026-10-14).
-- Safe to re-run: existing rows are matched by slug / unique keys and left alone
-- (skills are re-categorised to the supplied grouping). Nothing is deleted.
-- Projects and education are not touched.

-- ------------------------------------------------------------------ companies
-- Logos: objects verified in the "media" bucket on 2026-10-14 (filename and the
-- image itself: CONCAVE INSIGHTS wordmark, YSM lettering; Joylane and Swado Tech
-- by filename — their marks carry no text).
insert into companies (slug, name, logo_key)
values
  ('concave-insights',   'Concave Insights',           'concave_insights_logo.jfif'),
  ('joylane-innovation', 'Joylane Innovation Pvt Ltd', 'joylanelogo.png'),
  ('swado-tech',         'Swado Tech',                 'swadotech.svg'),
  ('ysm-info-solution',  'YSM Info Solution',          'ysm-logo.png')
on conflict do nothing;

-- ---------------------------------------------------------------- experiences
-- Newest first. Month-precision dates are stored as the 1st of the month.
-- highlights = the supplied responsibilities, verbatim. technologies = only
-- those the responsibilities name.
--
-- NEEDS CONFIRMATION, so NOT published:
--   * Concave Insights — supplied as "June 2026–Present", but the FAQ says all
--     four internships are completed. is_current stays false and end_date null
--     until the status is confirmed.
--   * YSM Info Solution — no dates supplied.
insert into experiences
  (company_id, role, employment_type, location, start_date, end_date, is_current,
   summary, highlights, technologies, display_order, is_published)
select c.id, v.role, 'internship', 'Onsite', v.start_date::date, v.end_date::date, false,
       v.summary, v.highlights, v.technologies, v.display_order, v.is_published
  from (values
    ('concave-insights', 'SDE Intern', '2026-06-01', null,
     'Multi-tenant CRM platform: database development, feature work across frontend and APIs, debugging and optimisation.',
     array[
       'Worked on a multi-tenant CRM platform supporting multiple organizations and their application data.',
       'Contributed to database development and management, including schema updates, queries, and data handling.',
       'Developed and maintained application features while integrating frontend components with backend services and APIs.',
       'Debugged application issues, optimized database operations, and collaborated with the development team to deliver reliable features.'
     ],
     array[]::text[], 1, false),

    ('joylane-innovation', 'Software Developer Intern', '2026-01-01', '2026-06-01',
     'Cross-platform mobile features in React Native and TypeScript, and GraphQL APIs on Node.js and Neon DB.',
     array[
       'Developed and maintained cross-platform mobile application features using React Native and TypeScript.',
       'Built and optimized GraphQL APIs with Node.js and Neon DB, improving backend response efficiency.',
       'Performed debugging, troubleshooting, testing, and API optimization, reducing network latency by 25%.',
       'Collaborated with cross-functional teams in agile sprints to deliver scalable and production-ready software solutions.'
     ],
     array['React Native', 'TypeScript', 'GraphQL', 'Node.js', 'Neon DB'], 2, true),

    ('swado-tech', 'Frontend Developer Intern', '2025-07-01', '2026-01-01',
     'Reusable React.js and Next.js components, frontend performance and API integration.',
     array[
       'Developed reusable React.js and Next.js components, reducing development effort by 30%.',
       'Optimized frontend rendering and API integration, improving application performance by 15–20%.',
       'Worked with backend developers and designers to build responsive and scalable web features.',
       'Identified and resolved UI bugs, improving cross-browser compatibility and usability.'
     ],
     array['React.js', 'Next.js'], 3, true),

    ('ysm-info-solution', 'Frontend Developer Intern', null, null,
     'Responsive React.js interfaces from Figma designs, modular frontend architecture and REST API integration.',
     array[
       'Converted Figma designs into responsive React.js interfaces, improving UI consistency.',
       'Developed modular frontend architecture, improving maintainability and scalability.',
       'Integrated REST APIs and assisted in debugging, testing, and performance optimization.'
     ],
     array['React.js', 'Figma', 'REST APIs'], 4, false)
  ) as v(company_slug, role, start_date, end_date, summary, highlights, technologies, display_order, is_published)
  join companies c on c.slug = v.company_slug
on conflict do nothing;

-- --------------------------------------------------------------------- skills
-- The existing "React" record is the same skill as the supplied "React.js".
update skills set name = 'React.js', slug = 'react-js'
 where slug = 'react' and not exists (select 1 from skills where slug = 'react-js');

-- display_order = category block (100s) + position within the supplied list, so
-- ordering by display_order keeps both the category order and the order inside it.
-- Existing records (matched by slug) keep their descriptions; only their
-- category, order and publication follow the supplied grouping.
insert into skills (slug, name, category, display_order, is_published)
values
  -- Languages
  ('javascript', 'JavaScript', 'Languages', 101, true),
  ('typescript', 'TypeScript', 'Languages', 102, true),
  ('python',     'Python',     'Languages', 103, true),
  ('java',       'Java',       'Languages', 104, true),
  ('sql',        'SQL',        'Languages', 105, true),
  -- Frontend
  ('react-js',     'React.js',     'Frontend', 201, true),
  ('next-js',      'Next.js',      'Frontend', 202, true),
  ('react-native', 'React Native', 'Frontend', 203, true),
  ('html5',        'HTML5',        'Frontend', 204, true),
  ('css3',         'CSS3',         'Frontend', 205, true),
  ('jquery',       'jQuery',       'Frontend', 206, true),
  ('tailwind-css', 'Tailwind CSS', 'Frontend', 207, true),
  ('material-ui',  'Material UI',  'Frontend', 208, true),
  -- Backend
  ('node-js',    'Node.js',    'Backend', 301, true),
  ('express-js', 'Express.js', 'Backend', 302, true),
  ('django',     'Django',     'Backend', 303, true),
  ('graphql',    'GraphQL',    'Backend', 304, true),
  ('rest-apis',  'REST APIs',  'Backend', 305, true),
  -- Databases
  ('postgresql', 'PostgreSQL', 'Databases', 401, true),
  ('mongodb',    'MongoDB',    'Databases', 402, true),
  ('neon-db',    'Neon DB',    'Databases', 403, true),
  ('supabase',   'Supabase',   'Databases', 404, true),
  -- AI Tools & Technologies
  ('openai-api',         'OpenAI API',         'AI Tools & Technologies', 501, true),
  ('google-gemini',      'Google Gemini',      'AI Tools & Technologies', 502, true),
  ('hugging-face',       'Hugging Face',       'AI Tools & Technologies', 503, true),
  ('n8n',                'n8n',                'AI Tools & Technologies', 504, true),
  ('llm-integration',    'LLM Integration',    'AI Tools & Technologies', 505, true),
  ('prompt-engineering', 'Prompt Engineering', 'AI Tools & Technologies', 506, true),
  -- Developer Tools
  ('git',     'Git',     'Developer Tools', 601, true),
  ('github',  'GitHub',  'Developer Tools', 602, true),
  ('jira',    'Jira',    'Developer Tools', 603, true),
  ('postman', 'Postman', 'Developer Tools', 604, true),
  ('vercel',  'Vercel',  'Developer Tools', 605, true),
  ('figma',   'Figma',   'Developer Tools', 606, true),
  -- Core Competencies (kept apart from the technical categories)
  ('software-engineering',     'Software Engineering',     'Core Competencies', 701, true),
  ('debugging',                'Debugging',                'Core Competencies', 702, true),
  ('troubleshooting',          'Troubleshooting',          'Core Competencies', 703, true),
  ('testing',                  'Testing',                  'Core Competencies', 704, true),
  ('api-integration',          'API Integration',          'Core Competencies', 705, true),
  ('database-management',      'Database Management',      'Core Competencies', 706, true),
  ('multi-tenant-systems',     'Multi-Tenant Systems',     'Core Competencies', 707, true),
  ('responsive-design',        'Responsive Design',        'Core Competencies', 708, true),
  ('agile-development',        'Agile Development',        'Core Competencies', 709, true),
  ('performance-optimization', 'Performance Optimization', 'Core Competencies', 710, true),
  -- Soft Skills
  ('problem-solving',      'Problem Solving',      'Soft Skills', 801, true),
  ('team-collaboration',   'Team Collaboration',   'Soft Skills', 802, true),
  ('verbal-communication', 'Verbal Communication', 'Soft Skills', 803, true),
  ('adaptability',         'Adaptability',         'Soft Skills', 804, true),
  ('ownership',            'Ownership',            'Soft Skills', 805, true)
on conflict (slug) do update
  set category      = excluded.category,
      display_order = excluded.display_order,
      is_published  = excluded.is_published;

-- Skills that were on the site before but aren't in the supplied list are
-- unpublished, not deleted (FastAPI, Docker, AWS, "AI / LLM" — the last is
-- covered by "LLM Integration"). Re-publish any with:
--   update skills set is_published = true where slug = '<slug>';
update skills set is_published = false
 where slug in ('fastapi', 'docker', 'aws', 'ai-llm');
