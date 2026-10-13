-- Companies as their own records (experiences and projects point at them), and
-- stable slugs for skills. Additive and re-runnable: nothing is dropped, and the
-- existing experiences.company_name / company_logo_* columns keep working for
-- rows without a company record.

-- ------------------------------------------------------------------ companies
create table if not exists companies (
  id          bigint generated always as identity primary key,
  slug        text        not null check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  name        text        not null,
  -- key of the logo in the private "media" bucket (served from /media/<key>)
  logo_key    text        check (logo_key ~ '^[A-Za-z0-9][A-Za-z0-9._-]*(/[A-Za-z0-9][A-Za-z0-9._-]*)*$'),
  -- or an external logo URL
  logo_url    text        check (logo_url ~ '^https?://'),
  website_url text        check (website_url ~ '^https?://'),
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create unique index if not exists companies_slug_uq on companies (slug);
create unique index if not exists companies_name_uq on companies (lower(name));

create or replace trigger companies_set_updated_at before update on companies
  for each row execute function set_updated_at();

-- -------------------------------------------------------- experiences → company
alter table experiences add column if not exists company_id bigint references companies (id) on delete restrict;
create index if not exists experiences_company_idx on experiences (company_id);

-- the company record now carries the name; company_name stays for rows without one
alter table experiences alter column company_name drop not null;

do $$
begin
  if not exists (select 1 from pg_constraint where conname = 'experiences_company_ck') then
    alter table experiences
      add constraint experiences_company_ck check (company_id is not null or company_name is not null);
  end if;
end $$;

-- one record per role per company (per start date), so seeds can't duplicate it
create unique index if not exists experiences_company_role_uq
  on experiences (company_id, lower(role), coalesce(start_date, date '0001-01-01'))
  where company_id is not null;

-- ----------------------------------------------------------- projects → company
alter table projects add column if not exists company_id bigint references companies (id) on delete set null;
create index if not exists projects_company_idx on projects (company_id);

-- -------------------------------------------------------------- skill slugs
alter table skills add column if not exists slug text;

update skills
   set slug = trim(both '-' from regexp_replace(lower(name), '[^a-z0-9]+', '-', 'g'))
 where slug is null;

alter table skills alter column slug set not null;

do $$
begin
  if not exists (select 1 from pg_constraint where conname = 'skills_slug_ck') then
    alter table skills add constraint skills_slug_ck check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$');
  end if;
end $$;

create unique index if not exists skills_slug_uq on skills (slug);
