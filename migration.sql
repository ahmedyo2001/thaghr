create table if not exists public.link_reports (
  id uuid primary key default gen_random_uuid(),
  project_id uuid references public.projects(id) on delete set null,
  repo_url text,
  reported_at timestamptz not null default now()
);

alter table public.link_reports enable row level security;

drop policy if exists "Anyone can report broken links" on public.link_reports;

create policy "Anyone can report broken links"
on public.link_reports
for insert
to anon, authenticated
with check (true);
