-- Oiko schema. Run in Supabase SQL Editor (one-off).
-- See CLAUDE.md "当前进度 → 步骤 7" for context.

-- projects ------------------------------------------------------------------
create table public.projects (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null default 'Untitled',
  initial_prompt text,
  outputs jsonb not null default '{}'::jsonb,
  agent_history jsonb not null default '[]'::jsonb,
  generated_html text,
  current_stage text not null default 'research',
  completed_stages jsonb not null default '[]'::jsonb,
  done boolean not null default false,
  iterations integer not null default 0,
  status text not null default 'draft',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index projects_user_id_updated_at_idx
  on public.projects (user_id, updated_at desc);

create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin new.updated_at := now(); return new; end;
$$;

create trigger projects_set_updated_at
  before update on public.projects
  for each row execute function public.set_updated_at();

alter table public.projects enable row level security;

create policy "users see own projects"
  on public.projects for select using (auth.uid() = user_id);
create policy "users insert own projects"
  on public.projects for insert with check (auth.uid() = user_id);
create policy "users update own projects"
  on public.projects for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "users delete own projects"
  on public.projects for delete using (auth.uid() = user_id);

-- reviews -------------------------------------------------------------------
-- Built ahead of time so Round 3 (audit feature) doesn't need a fresh migration.
create table public.reviews (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  url text not null,
  context jsonb,
  report jsonb,
  created_at timestamptz not null default now()
);

create index reviews_user_id_created_at_idx
  on public.reviews (user_id, created_at desc);

alter table public.reviews enable row level security;

create policy "users see own reviews"
  on public.reviews for select using (auth.uid() = user_id);
create policy "users insert own reviews"
  on public.reviews for insert with check (auth.uid() = user_id);
create policy "users delete own reviews"
  on public.reviews for delete using (auth.uid() = user_id);
