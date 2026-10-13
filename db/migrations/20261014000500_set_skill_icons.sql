-- Brand icons for the technical skills: skills.icon holds a Simple Icons slug
-- (https://simpleicons.org — CC0 brand silhouettes, bundled via the
-- `simple-icons` package; see src/lib/skill-icons.ts for the ones wired up).
-- Update-only, matched by skill slug; no new records.
--
-- No icon (plain chip, as before): SQL, REST APIs, LLM Integration and Prompt
-- Engineering have no brand logo; OpenAI's was removed from Simple Icons at
-- OpenAI's request. Java uses the OpenJDK mark (Oracle's Java logo isn't
-- available); React Native uses the React logo, which is its own.

update skills s
   set icon = v.icon
  from (values
    ('javascript',    'javascript'),
    ('typescript',    'typescript'),
    ('python',        'python'),
    ('java',          'openjdk'),
    ('react-js',      'react'),
    ('next-js',       'nextdotjs'),
    ('react-native',  'react'),
    ('html5',         'html5'),
    ('css3',          'css'),
    ('jquery',        'jquery'),
    ('tailwind-css',  'tailwindcss'),
    ('material-ui',   'mui'),
    ('node-js',       'nodedotjs'),
    ('express-js',    'express'),
    ('django',        'django'),
    ('graphql',       'graphql'),
    ('postgresql',    'postgresql'),
    ('mongodb',       'mongodb'),
    ('neon-db',       'neon'),
    ('supabase',      'supabase'),
    ('google-gemini', 'googlegemini'),
    ('hugging-face',  'huggingface'),
    ('n8n',           'n8n'),
    ('git',           'git'),
    ('github',        'github'),
    ('jira',          'jira'),
    ('postman',       'postman'),
    ('vercel',        'vercel'),
    ('figma',         'figma')
  ) as v(slug, icon)
 where s.slug = v.slug
   and s.icon is distinct from v.icon;
