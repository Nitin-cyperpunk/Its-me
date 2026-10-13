-- Experience section: all four internships, in the order Nitin asked for
-- (2026-10-14): YSM, Swado Tech, Joylane, Concave Insights.
-- Updates only; matched by company slug, so re-running changes nothing further.
--
-- Publishing the two held-back records, as instructed:
--   * YSM Info Solution — no dates were supplied; they stay null and the site
--     shows none (rather than invented ones).
--   * Concave Insights — "Remote / Hybrid". Current status is still unverified,
--     so is_current stays false and end_date null: the site shows only the
--     verified start ("Started Jun 2026"), never "Present".

update experiences e
   set display_order = v.display_order,
       is_published  = true
  from (values
    ('ysm-info-solution',  1),
    ('swado-tech',         2),
    ('joylane-innovation', 3),
    ('concave-insights',   4)
  ) as v(company_slug, display_order)
  join companies c on c.slug = v.company_slug
 where e.company_id = c.id;

update experiences e
   set location = 'Remote / Hybrid'
  from companies c
 where c.id = e.company_id and c.slug = 'concave-insights';
