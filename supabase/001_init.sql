create extension if not exists "pgcrypto";

create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  created_at timestamptz not null default now()
);

create table if not exists public.goals (
  user_id uuid primary key references auth.users (id) on delete cascade,
  calories_target integer not null default 2600,
  protein_target_g integer not null default 200,
  carbs_target_g integer not null default 250,
  fat_target_g integer not null default 70,
  updated_at timestamptz not null default now()
);

create table if not exists public.foods_cached (
  id uuid primary key default gen_random_uuid(),
  source text not null default 'seed',
  source_food_id text not null unique,
  name text not null,
  brand text,
  serving_unit text not null default 'g',
  serving_size numeric(10,2) not null default 100,
  calories numeric(10,2) not null,
  protein_g numeric(10,2) not null,
  carbs_g numeric(10,2) not null,
  fat_g numeric(10,2) not null,
  created_at timestamptz not null default now()
);

create table if not exists public.daily_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  log_date date not null,
  created_at timestamptz not null default now(),
  unique (user_id, log_date)
);

create table if not exists public.log_entries (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  daily_log_id uuid not null references public.daily_logs (id) on delete cascade,
  food_name_snapshot text not null,
  brand_snapshot text,
  quantity numeric(10,2) not null,
  unit text not null,
  calories_snapshot numeric(10,2) not null,
  protein_g_snapshot numeric(10,2) not null,
  carbs_g_snapshot numeric(10,2) not null,
  fat_g_snapshot numeric(10,2) not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists foods_cached_name_idx on public.foods_cached using gin (to_tsvector('simple', name));
create index if not exists daily_logs_user_date_idx on public.daily_logs (user_id, log_date desc);
create index if not exists log_entries_daily_log_idx on public.log_entries (daily_log_id);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger goals_updated_at
before update on public.goals
for each row
execute function public.set_updated_at();

create trigger log_entries_updated_at
before update on public.log_entries
for each row
execute function public.set_updated_at();

alter table public.profiles enable row level security;
alter table public.goals enable row level security;
alter table public.foods_cached enable row level security;
alter table public.daily_logs enable row level security;
alter table public.log_entries enable row level security;

create policy "Users can view own profile" on public.profiles
for select using (auth.uid() = id);

create policy "Users can insert own profile" on public.profiles
for insert with check (auth.uid() = id);

create policy "Users can view own goals" on public.goals
for select using (auth.uid() = user_id);

create policy "Users can insert own goals" on public.goals
for insert with check (auth.uid() = user_id);

create policy "Users can update own goals" on public.goals
for update using (auth.uid() = user_id);

create policy "Authenticated users can read foods" on public.foods_cached
for select using (auth.uid() is not null);

create policy "Authenticated users can insert foods" on public.foods_cached
for insert with check (auth.uid() is not null);

create policy "Users can view own logs" on public.daily_logs
for select using (auth.uid() = user_id);

create policy "Users can insert own logs" on public.daily_logs
for insert with check (auth.uid() = user_id);

create policy "Users can update own logs" on public.daily_logs
for update using (auth.uid() = user_id);

create policy "Users can delete own logs" on public.daily_logs
for delete using (auth.uid() = user_id);

create policy "Users can view own entries" on public.log_entries
for select using (auth.uid() = user_id);

create policy "Users can insert own entries" on public.log_entries
for insert with check (auth.uid() = user_id);

create policy "Users can update own entries" on public.log_entries
for update using (auth.uid() = user_id);

create policy "Users can delete own entries" on public.log_entries
for delete using (auth.uid() = user_id);

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id) values (new.id) on conflict do nothing;
  insert into public.goals (user_id) values (new.id) on conflict do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;

create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_user();
