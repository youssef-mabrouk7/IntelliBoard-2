-- IntelliBoard multi-tenant schema with strict company isolation.
-- Run this in Supabase SQL editor (new project or clean schema).

create extension if not exists "pgcrypto";

-- ---------------------------------------------------------------------------
-- Core tenant model
-- ---------------------------------------------------------------------------
create table if not exists public.companies (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  slug text not null unique,
  created_at timestamptz not null default now()
);

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  company_id uuid not null references public.companies(id) on delete restrict,
  name text not null default '',
  email text not null default '',
  avatar text,
  role text not null default 'Member',
  department text,
  job_title text,
  phone text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists profiles_company_idx on public.profiles(company_id);
create index if not exists profiles_email_idx on public.profiles(email);

-- ---------------------------------------------------------------------------
-- Business entities
-- ---------------------------------------------------------------------------
create table if not exists public.projects (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies(id) on delete restrict,
  created_by uuid references public.profiles(id) on delete set null,
  name text not null,
  description text default '',
  company_name text,
  due_date date,
  progress int not null default 0 check (progress between 0 and 100),
  status text not null default 'active' check (status in ('active', 'completed', 'onHold')),
  color text not null default '#4A7C9B',
  tags text[] not null default '{}',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists projects_company_idx on public.projects(company_id);

create table if not exists public.teams (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies(id) on delete restrict,
  name text not null,
  description text default '',
  progress int not null default 0 check (progress between 0 and 100),
  color text not null default '#4A7C9B',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists teams_company_idx on public.teams(company_id);

create table if not exists public.tasks (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies(id) on delete restrict,
  project_id uuid references public.projects(id) on delete set null,
  team_id uuid references public.teams(id) on delete set null,
  title text not null,
  description text default '',
  due_date date,
  priority text not null default 'medium' check (priority in ('high', 'medium', 'low')),
  status text not null default 'inProgress' check (status in ('inProgress', 'completed', 'overdue')),
  progress int not null default 0 check (progress between 0 and 100),
  category text default '',
  subtasks_count int not null default 0,
  attachment_urls text[] not null default '{}',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists tasks_company_idx on public.tasks(company_id);
create index if not exists tasks_project_idx on public.tasks(project_id);
create index if not exists tasks_team_idx on public.tasks(team_id);

create table if not exists public.task_subtasks (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies(id) on delete restrict,
  task_id uuid not null references public.tasks(id) on delete cascade,
  title text not null,
  completed boolean not null default false,
  created_at timestamptz not null default now()
);

create index if not exists task_subtasks_company_idx on public.task_subtasks(company_id);
create index if not exists task_subtasks_task_idx on public.task_subtasks(task_id);

create table if not exists public.project_members (
  project_id uuid not null references public.projects(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  company_id uuid not null references public.companies(id) on delete restrict,
  created_at timestamptz not null default now(),
  primary key (project_id, user_id)
);

create index if not exists project_members_company_idx on public.project_members(company_id);

create table if not exists public.team_members (
  team_id uuid not null references public.teams(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  company_id uuid not null references public.companies(id) on delete restrict,
  created_at timestamptz not null default now(),
  primary key (team_id, user_id)
);

create index if not exists team_members_company_idx on public.team_members(company_id);

create table if not exists public.task_assignees (
  task_id uuid not null references public.tasks(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  company_id uuid not null references public.companies(id) on delete restrict,
  created_at timestamptz not null default now(),
  primary key (task_id, user_id)
);

create index if not exists task_assignees_company_idx on public.task_assignees(company_id);

create table if not exists public.calendar_events (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies(id) on delete restrict,
  title text not null,
  date date not null,
  start_time text,
  end_time text,
  status text,
  color text default '#4A7C9B',
  task_count int default 0,
  assignee text,
  created_at timestamptz not null default now()
);

create index if not exists calendar_events_company_idx on public.calendar_events(company_id);

create table if not exists public.event_assignees (
  event_id uuid not null references public.calendar_events(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  company_id uuid not null references public.companies(id) on delete restrict,
  created_at timestamptz not null default now(),
  primary key (event_id, user_id)
);

create index if not exists event_assignees_company_idx on public.event_assignees(company_id);

create table if not exists public.invites (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies(id) on delete restrict,
  emails text[] not null default '{}',
  role text not null default 'Member',
  message text default '',
  attachment_urls text[] not null default '{}',
  created_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now()
);

create index if not exists invites_company_idx on public.invites(company_id);

-- ---------------------------------------------------------------------------
-- Tenant helpers
-- ---------------------------------------------------------------------------
create or replace function public.current_company_id()
returns uuid
language sql
stable
security definer
set search_path = public
as $$
  select p.company_id
  from public.profiles p
  where p.id = auth.uid()
  limit 1
$$;

grant execute on function public.current_company_id() to authenticated;

create or replace function public.apply_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create or replace function public.set_company_id_from_auth()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_company_id uuid;
begin
  v_company_id := public.current_company_id();
  if v_company_id is null then
    raise exception 'No company assigned to current user profile';
  end if;

  if new.company_id is null then
    new.company_id := v_company_id;
  end if;

  if new.company_id <> v_company_id then
    raise exception 'Cross-company write blocked by tenant isolation';
  end if;

  return new;
end;
$$;

create or replace function public.enforce_parent_company_consistency()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_project_company uuid;
  v_team_company uuid;
  v_task_company uuid;
begin
  if tg_table_name = 'tasks' then
    if new.project_id is not null then
      select company_id into v_project_company from public.projects where id = new.project_id;
      if v_project_company is null or v_project_company <> new.company_id then
        raise exception 'Task project company mismatch';
      end if;
    end if;

    if new.team_id is not null then
      select company_id into v_team_company from public.teams where id = new.team_id;
      if v_team_company is null or v_team_company <> new.company_id then
        raise exception 'Task team company mismatch';
      end if;
    end if;
  end if;

  if tg_table_name = 'task_subtasks' then
    select company_id into v_task_company from public.tasks where id = new.task_id;
    if v_task_company is null or v_task_company <> new.company_id then
      raise exception 'Subtask task company mismatch';
    end if;
  end if;

  return new;
end;
$$;

create trigger profiles_set_updated_at
before update on public.profiles
for each row execute function public.apply_updated_at();

create trigger projects_set_updated_at
before update on public.projects
for each row execute function public.apply_updated_at();

create trigger teams_set_updated_at
before update on public.teams
for each row execute function public.apply_updated_at();

create trigger tasks_set_updated_at
before update on public.tasks
for each row execute function public.apply_updated_at();

create trigger projects_set_company
before insert or update on public.projects
for each row execute function public.set_company_id_from_auth();

create trigger teams_set_company
before insert or update on public.teams
for each row execute function public.set_company_id_from_auth();

create trigger tasks_set_company
before insert or update on public.tasks
for each row execute function public.set_company_id_from_auth();

create trigger task_subtasks_set_company
before insert or update on public.task_subtasks
for each row execute function public.set_company_id_from_auth();

create trigger project_members_set_company
before insert or update on public.project_members
for each row execute function public.set_company_id_from_auth();

create trigger team_members_set_company
before insert or update on public.team_members
for each row execute function public.set_company_id_from_auth();

create trigger task_assignees_set_company
before insert or update on public.task_assignees
for each row execute function public.set_company_id_from_auth();

create trigger calendar_events_set_company
before insert or update on public.calendar_events
for each row execute function public.set_company_id_from_auth();

create trigger event_assignees_set_company
before insert or update on public.event_assignees
for each row execute function public.set_company_id_from_auth();

create trigger invites_set_company
before insert or update on public.invites
for each row execute function public.set_company_id_from_auth();

create trigger tasks_enforce_company_consistency
before insert or update on public.tasks
for each row execute function public.enforce_parent_company_consistency();

create trigger task_subtasks_enforce_company_consistency
before insert or update on public.task_subtasks
for each row execute function public.enforce_parent_company_consistency();

-- ---------------------------------------------------------------------------
-- RLS (strict company isolation)
-- ---------------------------------------------------------------------------
alter table public.companies enable row level security;
alter table public.profiles enable row level security;
alter table public.projects enable row level security;
alter table public.teams enable row level security;
alter table public.tasks enable row level security;
alter table public.task_subtasks enable row level security;
alter table public.project_members enable row level security;
alter table public.team_members enable row level security;
alter table public.task_assignees enable row level security;
alter table public.calendar_events enable row level security;
alter table public.event_assignees enable row level security;
alter table public.invites enable row level security;

-- Companies: users can only see their own company record.
create policy companies_select_own on public.companies
for select to authenticated
using (id = public.current_company_id());

-- Profiles: company scope for read/write.
create policy profiles_select_company on public.profiles
for select to authenticated
using (company_id = public.current_company_id());

create policy profiles_insert_company on public.profiles
for insert to authenticated
with check (
  id = auth.uid()
  and company_id = public.current_company_id()
);

create policy profiles_update_company on public.profiles
for update to authenticated
using (company_id = public.current_company_id())
with check (company_id = public.current_company_id());

-- Generic tenant policies for all company-owned tables.
create policy projects_select_company on public.projects
for select to authenticated
using (company_id = public.current_company_id());
create policy projects_insert_company on public.projects
for insert to authenticated
with check (company_id = public.current_company_id());
create policy projects_update_company on public.projects
for update to authenticated
using (company_id = public.current_company_id())
with check (company_id = public.current_company_id());
create policy projects_delete_company on public.projects
for delete to authenticated
using (company_id = public.current_company_id());

create policy teams_select_company on public.teams
for select to authenticated
using (company_id = public.current_company_id());
create policy teams_insert_company on public.teams
for insert to authenticated
with check (company_id = public.current_company_id());
create policy teams_update_company on public.teams
for update to authenticated
using (company_id = public.current_company_id())
with check (company_id = public.current_company_id());
create policy teams_delete_company on public.teams
for delete to authenticated
using (company_id = public.current_company_id());

create policy tasks_select_company on public.tasks
for select to authenticated
using (company_id = public.current_company_id());
create policy tasks_insert_company on public.tasks
for insert to authenticated
with check (company_id = public.current_company_id());
create policy tasks_update_company on public.tasks
for update to authenticated
using (company_id = public.current_company_id())
with check (company_id = public.current_company_id());
create policy tasks_delete_company on public.tasks
for delete to authenticated
using (company_id = public.current_company_id());

create policy task_subtasks_select_company on public.task_subtasks
for select to authenticated
using (company_id = public.current_company_id());
create policy task_subtasks_insert_company on public.task_subtasks
for insert to authenticated
with check (company_id = public.current_company_id());
create policy task_subtasks_update_company on public.task_subtasks
for update to authenticated
using (company_id = public.current_company_id())
with check (company_id = public.current_company_id());
create policy task_subtasks_delete_company on public.task_subtasks
for delete to authenticated
using (company_id = public.current_company_id());

create policy project_members_select_company on public.project_members
for select to authenticated
using (company_id = public.current_company_id());
create policy project_members_insert_company on public.project_members
for insert to authenticated
with check (company_id = public.current_company_id());
create policy project_members_update_company on public.project_members
for update to authenticated
using (company_id = public.current_company_id())
with check (company_id = public.current_company_id());
create policy project_members_delete_company on public.project_members
for delete to authenticated
using (company_id = public.current_company_id());

create policy team_members_select_company on public.team_members
for select to authenticated
using (company_id = public.current_company_id());
create policy team_members_insert_company on public.team_members
for insert to authenticated
with check (company_id = public.current_company_id());
create policy team_members_update_company on public.team_members
for update to authenticated
using (company_id = public.current_company_id())
with check (company_id = public.current_company_id());
create policy team_members_delete_company on public.team_members
for delete to authenticated
using (company_id = public.current_company_id());

create policy task_assignees_select_company on public.task_assignees
for select to authenticated
using (company_id = public.current_company_id());
create policy task_assignees_insert_company on public.task_assignees
for insert to authenticated
with check (company_id = public.current_company_id());
create policy task_assignees_update_company on public.task_assignees
for update to authenticated
using (company_id = public.current_company_id())
with check (company_id = public.current_company_id());
create policy task_assignees_delete_company on public.task_assignees
for delete to authenticated
using (company_id = public.current_company_id());

create policy calendar_events_select_company on public.calendar_events
for select to authenticated
using (company_id = public.current_company_id());
create policy calendar_events_insert_company on public.calendar_events
for insert to authenticated
with check (company_id = public.current_company_id());
create policy calendar_events_update_company on public.calendar_events
for update to authenticated
using (company_id = public.current_company_id())
with check (company_id = public.current_company_id());
create policy calendar_events_delete_company on public.calendar_events
for delete to authenticated
using (company_id = public.current_company_id());

create policy event_assignees_select_company on public.event_assignees
for select to authenticated
using (company_id = public.current_company_id());
create policy event_assignees_insert_company on public.event_assignees
for insert to authenticated
with check (company_id = public.current_company_id());
create policy event_assignees_update_company on public.event_assignees
for update to authenticated
using (company_id = public.current_company_id())
with check (company_id = public.current_company_id());
create policy event_assignees_delete_company on public.event_assignees
for delete to authenticated
using (company_id = public.current_company_id());

create policy invites_select_company on public.invites
for select to authenticated
using (company_id = public.current_company_id());
create policy invites_insert_company on public.invites
for insert to authenticated
with check (company_id = public.current_company_id());
create policy invites_update_company on public.invites
for update to authenticated
using (company_id = public.current_company_id())
with check (company_id = public.current_company_id());
create policy invites_delete_company on public.invites
for delete to authenticated
using (company_id = public.current_company_id());
