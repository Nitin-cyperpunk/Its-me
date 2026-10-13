-- Experience details Nitin entered in the Neon table editor (2026-10-14), which
-- the editor couldn't save: text[] columns need an array literal, not a
-- comma-separated string or JSON. Applied here with ARRAY[...] instead.
-- Brand names normalised to their official spelling (Supabase, Tailwind CSS, Expo).
-- Update-only, matched by company slug; re-running sets the same values.

update experiences e
   set technologies = v.technologies
  from (values
    ('concave-insights',   array['GCP', 'Django', 'AWS']),
    ('joylane-innovation', array['React Native', 'TypeScript', 'GraphQL', 'Node.js', 'Neon DB', 'Expo']),
    ('swado-tech',         array['React.js', 'Next.js', 'Supabase']),
    ('ysm-info-solution',  array['React.js', 'Figma', 'Tailwind CSS'])
  ) as v(company_slug, technologies)
  join companies c on c.slug = v.company_slug
 where e.company_id = c.id;

-- YSM Info Solution: the dates Nitin supplied.
update experiences e
   set start_date = date '2024-10-26',
       end_date   = date '2025-02-17'
  from companies c
 where c.id = e.company_id and c.slug = 'ysm-info-solution';
