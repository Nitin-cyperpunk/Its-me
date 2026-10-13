-- Portfolio content: experiences, projects, skills, education.
-- Safe to re-run: everything is "if not exists" / "or replace"; nothing is dropped.
-- The public site only ever reads rows where is_published = true.

-- updated_at maintained by the database, not by whoever writes the row
create or replace function set_updated_at() returns trigger
language plpgsql as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

-- ---------------------------------------------------------------- experiences
create table if not exists experiences (
  id               bigint generated always as identity primary key,
  company_name     text        not null,
  company_logo_url text        check (company_logo_url ~ '^https?://'),
  role             text        not null,
  employment_type  text,                                   -- e.g. 'Internship', 'Full-time'
  location         text,                                   -- e.g. 'Nashik · Onsite', 'Remote'
  start_date       date,
  end_date         date,                                   -- null while current
  is_current       boolean     not null default false,
  summary          text,
  highlights       text[]      not null default '{}',      -- responsibilities / achievements
  technologies     text[]      not null default '{}',
  links            jsonb       not null default '[]',      -- [{"label": "...", "url": "https://..."}]
  display_order    integer     not null default 0,
  is_published     boolean     not null default false,
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now(),
  constraint experiences_dates_ck   check (end_date is null or start_date is null or end_date >= start_date),
  constraint experiences_current_ck check (not (is_current and end_date is not null)),
  constraint experiences_links_ck   check (jsonb_typeof(links) = 'array')
);

-- the same role at the same company starting the same day is one record
create unique index if not exists experiences_identity_uq
  on experiences (lower(company_name), lower(role), coalesce(start_date, date '0001-01-01'));
create index if not exists experiences_public_idx
  on experiences (is_published, display_order, start_date desc);

-- ------------------------------------------------------------------- projects
create table if not exists projects (
  id                 bigint generated always as identity primary key,
  slug               text        not null check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  title              text        not null,
  category           text        not null,                 -- the label shown, e.g. 'SaaS', 'Chrome extension'
  project_type       text        not null default 'personal'
                     check (project_type in ('personal', 'client', 'work')),
  client_name        text,                                 -- for client projects
  experience_id      bigint      references experiences (id) on delete set null,
  short_description  text        not null,
  description        text,
  cover_image_url    text        check (cover_image_url ~ '^https?://|^/'),
  gallery_image_urls text[]      not null default '{}',
  technologies       text[]      not null default '{}',
  github_url         text        check (github_url ~ '^https?://'),
  live_url           text        check (live_url ~ '^https?://'),
  is_featured        boolean     not null default false,
  display_order      integer     not null default 0,
  is_published       boolean     not null default false,
  created_at         timestamptz not null default now(),
  updated_at         timestamptz not null default now()
);

create unique index if not exists projects_slug_uq on projects (slug);
create index if not exists projects_public_idx on projects (is_published, display_order);
create index if not exists projects_experience_idx on projects (experience_id);

-- --------------------------------------------------------------------- skills
create table if not exists skills (
  id            bigint generated always as identity primary key,
  name          text        not null,
  category      text        not null default 'Other',      -- e.g. 'Frontend', 'Backend', 'AI'
  description   text,                                      -- what the tool is (shown on hover)
  icon          text,                                      -- optional icon identifier
  proficiency   text,                                      -- optional label, e.g. 'Daily driver' — no numeric scores
  display_order integer     not null default 0,
  is_published  boolean     not null default false,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

create unique index if not exists skills_name_uq on skills (lower(name));
create index if not exists skills_public_idx on skills (is_published, category, display_order);

-- ------------------------------------------------------------------ education
create table if not exists education (
  id                  bigint generated always as identity primary key,
  qualification       text        not null,                -- e.g. 'B.E. Computer Engineering', 'HSC (12th)'
  institution_name    text,
  board_or_university text,
  field_of_study      text,
  honors              text,                                -- e.g. 'Cybersecurity Honors'
  location            text,
  start_year          smallint    check (start_year between 1950 and 2100),
  end_year            smallint    check (end_year between 1950 and 2100),
  grade               text,                                -- free text: '8.9 CGPA', '87%'
  description         text,
  display_order       integer     not null default 0,
  is_published        boolean     not null default false,
  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now(),
  constraint education_years_ck check (end_year is null or start_year is null or end_year >= start_year)
);

create unique index if not exists education_identity_uq
  on education (lower(qualification), lower(coalesce(institution_name, '')));
create index if not exists education_public_idx on education (is_published, display_order);

-- ------------------------------------------------------------ updated_at hooks
create or replace trigger experiences_set_updated_at before update on experiences
  for each row execute function set_updated_at();
create or replace trigger projects_set_updated_at before update on projects
  for each row execute function set_updated_at();
create or replace trigger skills_set_updated_at before update on skills
  for each row execute function set_updated_at();
create or replace trigger education_set_updated_at before update on education
  for each row execute function set_updated_at();
