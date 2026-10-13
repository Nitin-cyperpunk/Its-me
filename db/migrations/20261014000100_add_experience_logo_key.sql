-- Company logos stored in the project's private object-storage bucket ("media").
-- The row keeps the object's key (e.g. 'ysm-logo.png'), never a URL: the site
-- serves it from /media/<key> (src/app/media/[...key]/route.ts), so nothing
-- that expires is ever saved here. company_logo_url stays for external URLs.
-- Additive and re-runnable.

alter table experiences
  add column if not exists company_logo_key text;

do $$
begin
  if not exists (select 1 from pg_constraint where conname = 'experiences_company_logo_key_ck') then
    alter table experiences
      add constraint experiences_company_logo_key_ck
      check (company_logo_key ~ '^[A-Za-z0-9][A-Za-z0-9._-]*(/[A-Za-z0-9][A-Za-z0-9._-]*)*$');
  end if;
end $$;
