-- Icons for the technical skills that have no official logo (or none we can
-- use): clearly generic glyphs, drawn in the theme accent rather than passed
-- off as a brand mark (src/lib/skill-icons.ts, "generic-*").
--   SQL → database; REST APIs → request/response arrows;
--   OpenAI API and LLM Integration → AI spark (OpenAI's mark was withdrawn
--   from Simple Icons at OpenAI's request); Prompt Engineering → chat bubble.
-- Update-only, matched by slug.

update skills s
   set icon = v.icon
  from (values
    ('sql',                'generic-database'),
    ('rest-apis',          'generic-api'),
    ('openai-api',         'generic-ai'),
    ('llm-integration',    'generic-ai'),
    ('prompt-engineering', 'generic-prompt')
  ) as v(slug, icon)
 where s.slug = v.slug
   and s.icon is distinct from v.icon;
