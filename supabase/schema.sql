-- ============================================================================
--  Rachit Sharma — Portfolio  |  Supabase schema
--  Paste the WHOLE file into:  Supabase Dashboard -> SQL Editor -> New query -> Run
--  Safe to run on a fresh project. Re-running drops and recreates everything.
-- ============================================================================

-- ---------------------------------------------------------------------------
-- 0.  ADMIN EMAIL  <-- THE ONLY LINE YOU EVER NEED TO EDIT TO CHANGE ADMIN
-- ---------------------------------------------------------------------------
-- Every write policy below calls public.is_admin(), which compares the signed-in
-- user's email against this literal. To change admin later, edit line 1 here and
-- re-run just section 5 (see the ALTER snippet at the very bottom).
-- It must match a user you create in: Authentication -> Users.
create or replace function public.is_admin()
returns boolean
language sql
stable
set search_path = ''
as $$
  select lower(coalesce(auth.jwt() ->> 'email', '')) = 'rachitsharma999088@gmail.com';
$$;

revoke all on function public.is_admin() from public;
grant execute on function public.is_admin() to anon, authenticated;


-- ---------------------------------------------------------------------------
-- 1.  TABLES
-- ---------------------------------------------------------------------------
create extension if not exists pgcrypto with schema extensions;

-- Small, flat key/value store. Only 3 keys are used today but the table stays
-- generic so you can add more without a migration.
create table if not exists public.site_settings (
  key        text primary key,
  value      text not null default '',
  updated_at timestamptz not null default now()
);

-- Long-form editable copy, one row per section. `content` holds markdown.
--   my_story      -> the multi-paragraph story in the About section
--   my_story_card -> the short paragraph in the "My Story" card
create table if not exists public.site_story (
  section_key text primary key,
  content     text not null default '',
  updated_at  timestamptz not null default now()
);

-- Selected Work cards. `display_order` drives the order on the public site.
-- tagline / tech / accent are additions to the original brief: the current card
-- design already renders all three, so dropping them would visibly regress it.
-- `coming soon` is derived — a project with no project_url renders as Coming soon.
create table if not exists public.projects (
  id            uuid primary key default gen_random_uuid(),
  title         text not null,
  category      text not null default '',
  tagline       text not null default '',
  description   text not null default '',
  tech          text[] not null default '{}',
  image_url     text,
  project_url   text,
  accent        text not null default '#d62e4a',
  display_order int not null default 0,
  created_at    timestamptz not null default now()
);

create table if not exists public.blog_posts (
  id              uuid primary key default gen_random_uuid(),
  title           text not null,
  slug            text not null unique,
  excerpt         text not null default '',
  content         text not null default '',
  category        text not null default '',
  cover_image_url text,
  published       boolean not null default false,
  published_at    timestamptz,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

create index if not exists blog_posts_published_idx
  on public.blog_posts (published, published_at desc);
create index if not exists projects_order_idx
  on public.projects (display_order);

-- Keeps updated_at honest without the app having to remember it.
create or replace function public.touch_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists blog_posts_touch on public.blog_posts;
create trigger blog_posts_touch
  before update on public.blog_posts
  for each row execute function public.touch_updated_at();


-- ---------------------------------------------------------------------------
-- 2.  ROW LEVEL SECURITY
-- ---------------------------------------------------------------------------
-- Enabled on every table. With RLS on, the anon key in the browser is useless on
-- its own: every statement is evaluated here first.
--
--   public  (anon)  -> projects: yes.  blog_posts: published only.
--                      site_settings / site_story: NO policy at all, so the
--                      browser cannot read them even if it tries. The public
--                      site gets them through the /api/content serverless
--                      function, which uses the service-role key server-side.
--   admin            -> authenticated AND email matches public.is_admin().
alter table public.site_settings enable row level security;
alter table public.site_story    enable row level security;
alter table public.projects      enable row level security;
alter table public.blog_posts    enable row level security;

-- Not `force row level security`: the dashboard's own SQL editor and
-- supabase/seed.sql run as the table owner, and FORCING RLS would lock them out
-- of their own inserts. The service role used by /api/content holds BYPASSRLS
-- and is unaffected either way.

-- Projects: public read, admin write
drop policy if exists "projects public read"  on public.projects;
drop policy if exists "projects admin read"   on public.projects;
drop policy if exists "projects admin insert" on public.projects;
drop policy if exists "projects admin update" on public.projects;
drop policy if exists "projects admin delete" on public.projects;

create policy "projects public read" on public.projects
  for select to anon using (true);
create policy "projects admin read" on public.projects
  for select to authenticated using (public.is_admin());
create policy "projects admin insert" on public.projects
  for insert to authenticated with check (public.is_admin());
create policy "projects admin update" on public.projects
  for update to authenticated using (public.is_admin()) with check (public.is_admin());
create policy "projects admin delete" on public.projects
  for delete to authenticated using (public.is_admin());

-- Blog: public read of published rows only, admin sees everything
drop policy if exists "blog public read published" on public.blog_posts;
drop policy if exists "blog admin read"   on public.blog_posts;
drop policy if exists "blog admin insert" on public.blog_posts;
drop policy if exists "blog admin update" on public.blog_posts;
drop policy if exists "blog admin delete" on public.blog_posts;

create policy "blog public read published" on public.blog_posts
  for select to anon using (published = true);
create policy "blog admin read" on public.blog_posts
  for select to authenticated using (public.is_admin());
create policy "blog admin insert" on public.blog_posts
  for insert to authenticated with check (public.is_admin());
create policy "blog admin update" on public.blog_posts
  for update to authenticated using (public.is_admin()) with check (public.is_admin());
create policy "blog admin delete" on public.blog_posts
  for delete to authenticated using (public.is_admin());

-- Settings + story: admin only. No anon policy = no public read, by design.
drop policy if exists "settings admin read"   on public.site_settings;
drop policy if exists "settings admin insert" on public.site_settings;
drop policy if exists "settings admin update" on public.site_settings;
drop policy if exists "settings admin delete" on public.site_settings;

create policy "settings admin read" on public.site_settings
  for select to authenticated using (public.is_admin());
create policy "settings admin insert" on public.site_settings
  for insert to authenticated with check (public.is_admin());
create policy "settings admin update" on public.site_settings
  for update to authenticated using (public.is_admin()) with check (public.is_admin());
create policy "settings admin delete" on public.site_settings
  for delete to authenticated using (public.is_admin());

drop policy if exists "story admin read"   on public.site_story;
drop policy if exists "story admin insert" on public.site_story;
drop policy if exists "story admin update" on public.site_story;
drop policy if exists "story admin delete" on public.site_story;

create policy "story admin read" on public.site_story
  for select to authenticated using (public.is_admin());
create policy "story admin insert" on public.site_story
  for insert to authenticated with check (public.is_admin());
create policy "story admin update" on public.site_story
  for update to authenticated using (public.is_admin()) with check (public.is_admin());
create policy "story admin delete" on public.site_story
  for delete to authenticated using (public.is_admin());


-- ---------------------------------------------------------------------------
-- 3.  STORAGE — one public bucket, "site-media"
-- ---------------------------------------------------------------------------
-- "Folders" in Supabase Storage are just key prefixes, so /hero, /projects and
-- /blog are created by the app the first time it uploads, not here.
insert into storage.buckets (id, name, public)
values ('site-media', 'site-media', true)
on conflict (id) do update set public = true;

-- Anyone may read (the bucket is public, so the CDN serves the images directly
-- and they never touch this API). Only the admin may write.
drop policy if exists "site-media public read"   on storage.objects;
drop policy if exists "site-media admin insert"  on storage.objects;
drop policy if exists "site-media admin update"  on storage.objects;
drop policy if exists "site-media admin delete"  on storage.objects;

create policy "site-media public read" on storage.objects
  for select to anon, authenticated
  using (bucket_id = 'site-media');
create policy "site-media admin insert" on storage.objects
  for insert to authenticated
  with check (bucket_id = 'site-media' and public.is_admin());
create policy "site-media admin update" on storage.objects
  for update to authenticated
  using (bucket_id = 'site-media' and public.is_admin())
  with check (bucket_id = 'site-media' and public.is_admin());
create policy "site-media admin delete" on storage.objects
  for delete to authenticated
  using (bucket_id = 'site-media' and public.is_admin());


-- ---------------------------------------------------------------------------
-- 4.  DONE — now run supabase/seed.sql
-- ---------------------------------------------------------------------------


-- ---------------------------------------------------------------------------
-- 5.  CHANGING THE ADMIN EMAIL LATER (run this instead of the whole file)
-- ---------------------------------------------------------------------------
-- create or replace function public.is_admin()
-- returns boolean
-- language sql
-- stable
-- set search_path = ''
-- as $$
--   select lower(coalesce(auth.jwt() ->> 'email', '')) = 'new-email@example.com';
-- $$;
-- grant execute on function public.is_admin() to anon, authenticated;
