-- ═══════════════════════════════════════
-- BABYTRACK — Supabase Schema
-- Run this in Supabase SQL Editor
-- ═══════════════════════════════════════

-- 1. FAMILIES (each family group)
create table public.families (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz default now()
);

-- 2. PROFILES (user profiles linked to auth)
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  family_id uuid references public.families(id) on delete cascade,
  name text not null default '',
  family_role text default 'papa',
  app_role text default 'admin',
  perms jsonb default '[]'::jsonb,
  created_at timestamptz default now()
);

-- 3. BABIES (one per family for now)
create table public.babies (
  id uuid primary key default gen_random_uuid(),
  family_id uuid references public.families(id) on delete cascade not null,
  name text not null default '',
  gender text default 'female',
  birth_date date,
  age_range text default '3-6 meses',
  photo_url text,
  created_at timestamptz default now()
);

-- 4. ENTRIES (feeding, diaper, sleep, temp, growth)
create table public.entries (
  id bigserial primary key,
  family_id uuid references public.families(id) on delete cascade not null,
  baby_id uuid references public.babies(id) on delete cascade,
  type text not null, -- feed, diaper, sleep, temp, growth
  data jsonb not null default '{}'::jsonb,
  recorded_by text,
  recorded_at timestamptz default now(),
  created_at timestamptz default now()
);

-- 5. TASKS (robust task system)
create table public.tasks (
  id bigserial primary key,
  family_id uuid references public.families(id) on delete cascade not null,
  title text not null,
  date date,
  time text,
  category text default 'general',
  assignee text,
  repeat text default 'once',
  notes text,
  done boolean default false,
  done_at timestamptz,
  created_by text,
  created_at timestamptz default now()
);

-- 6. MILESTONES (achieved milestones)
create table public.milestones (
  id bigserial primary key,
  family_id uuid references public.families(id) on delete cascade not null,
  milestone_id text not null,
  achieved_at timestamptz default now()
);

-- 7. QUESTIONS (pediatrician questions)
create table public.questions (
  id bigserial primary key,
  family_id uuid references public.families(id) on delete cascade not null,
  text text not null,
  status text default 'pending',
  asked_by text,
  created_at timestamptz default now()
);

-- 8. AI_MESSAGES (chat history)
create table public.ai_messages (
  id bigserial primary key,
  family_id uuid references public.families(id) on delete cascade not null,
  role text not null, -- user or assistant
  text text not null,
  created_at timestamptz default now()
);

-- 9. INVITATIONS
create table public.invitations (
  id bigserial primary key,
  family_id uuid references public.families(id) on delete cascade not null,
  code text not null unique,
  name text not null,
  role text default 'cuidador',
  perms jsonb default '[]'::jsonb,
  status text default 'pending',
  created_at timestamptz default now()
);

-- ═══ INDEXES ═══
create index idx_entries_family on public.entries(family_id);
create index idx_entries_type on public.entries(family_id, type);
create index idx_entries_date on public.entries(recorded_at);
create index idx_tasks_family on public.tasks(family_id);
create index idx_tasks_done on public.tasks(family_id, done);

-- ═══ ROW LEVEL SECURITY ═══
alter table public.families enable row level security;
alter table public.profiles enable row level security;
alter table public.babies enable row level security;
alter table public.entries enable row level security;
alter table public.tasks enable row level security;
alter table public.milestones enable row level security;
alter table public.questions enable row level security;
alter table public.ai_messages enable row level security;
alter table public.invitations enable row level security;

-- Helper: get current user's family_id
create or replace function public.get_my_family_id()
returns uuid
language sql
stable
security definer
as $$
  select family_id from public.profiles where id = auth.uid()
$$;

-- PROFILES: users see only their own profile
create policy "Users see own profile" on public.profiles
  for select using (id = auth.uid());
create policy "Users update own profile" on public.profiles
  for update using (id = auth.uid());
create policy "Users insert own profile" on public.profiles
  for insert with check (id = auth.uid());

-- FAMILIES: members see their family
create policy "Members see family" on public.families
  for select using (id = public.get_my_family_id());

-- BABIES: family members see their baby
create policy "Family sees baby" on public.babies
  for all using (family_id = public.get_my_family_id());

-- ENTRIES: family members CRUD their entries
create policy "Family entries" on public.entries
  for all using (family_id = public.get_my_family_id());

-- TASKS: family members CRUD tasks
create policy "Family tasks" on public.tasks
  for all using (family_id = public.get_my_family_id());

-- MILESTONES
create policy "Family milestones" on public.milestones
  for all using (family_id = public.get_my_family_id());

-- QUESTIONS
create policy "Family questions" on public.questions
  for all using (family_id = public.get_my_family_id());

-- AI MESSAGES
create policy "Family ai" on public.ai_messages
  for all using (family_id = public.get_my_family_id());

-- INVITATIONS: anyone can read by code (for joining), family can manage
create policy "Family invitations" on public.invitations
  for all using (family_id = public.get_my_family_id());
create policy "Anyone reads invitation by code" on public.invitations
  for select using (true);

-- ═══ FUNCTION: Handle new user signup ═══
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
as $$
declare
  new_family_id uuid;
begin
  -- Create a new family for this user
  insert into public.families default values returning id into new_family_id;
  
  -- Create profile
  insert into public.profiles (id, family_id, name, app_role, family_role)
  values (
    new.id,
    new_family_id,
    coalesce(new.raw_user_meta_data->>'name', 'Yo'),
    'admin',
    'papa'
  );
  
  return new;
end;
$$;

-- Trigger on auth signup
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ═══ FUNCTION: Join family via invitation ═══
create or replace function public.join_family(invite_code text)
returns json
language plpgsql
security definer
as $$
declare
  inv record;
begin
  select * into inv from public.invitations where code = invite_code and status = 'pending';
  if not found then
    return json_build_object('error', 'Código no válido');
  end if;
  
  -- Update user's profile to join this family
  update public.profiles 
  set family_id = inv.family_id, 
      app_role = inv.role, 
      name = inv.name,
      perms = inv.perms
  where id = auth.uid();
  
  -- Mark invitation as used
  update public.invitations set status = 'done' where id = inv.id;
  
  return json_build_object('success', true, 'family_id', inv.family_id);
end;
$$;
