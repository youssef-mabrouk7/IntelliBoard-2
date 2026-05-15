-- IntelliBoard schema + RLS policies
-- Run this whole file once in Supabase SQL Editor.

create extension if not exists "pgcrypto";

-- 1) Profiles
create table if not exists public."user" (
  id uuid references auth.users(id) on delete cascade primary key,
  name text not null default '',
  email text not null default '',
  avatar text,
  role text default 'Member',
  department text,
  job_title text,
  phone text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- 2) Projects
create table if not exists public.projects (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text,
  due_date date,
  progress integer not null default 0 check (progress between 0 and 100),
  status text not null default 'active' check (status in ('active', 'completed', 'onHold')),
  color text,
  created_at timestamptz not null default now(),
  created_by uuid references public."user"(id) on delete set null
);

-- Backward/forward compatible alters for existing DBs
alter table public.projects
  add column if not exists tasks integer not null default 0;

-- 3) Teams
create table if not exists public.teams (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text,
  progress integer not null default 0 check (progress between 0 and 100),
  color text,
  created_at timestamptz not null default now()
);

-- 4) Tasks
create table if not exists public.tasks (
  id uuid primary key default gen_random_uuid(),
  project_id uuid references public.projects(id) on delete cascade,
  team_id uuid references public.teams(id) on delete set null,
  title text not null,
  description text,
  due_date date,
  priority text not null default 'medium' check (priority in ('high', 'medium', 'low')),
  status text not null default 'inProgress' check (status in ('inProgress', 'completed', 'overdue')),
  progress integer not null default 0 check (progress between 0 and 100),
  category text,
  subtasks_count integer not null default 0,
  attachment_urls text[] not null default '{}'::text[],
  created_at timestamptz not null default now()
);

alter table public.tasks
  add column if not exists team_id uuid references public.teams(id) on delete set null;

alter table public.tasks
  add column if not exists attachment_urls text[] not null default '{}'::text[];

-- 5) Calendar Events
create table if not exists public.calendar_events (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  start_time text,
  end_time text,
  date date not null,
  color text,
  status text,
  created_at timestamptz not null default now()
);

-- Company isolation (optional, but recommended)
alter table public.calendar_events
  add column if not exists company_id uuid;

-- Junction tables
create table if not exists public.task_assignees (
  task_id uuid references public.tasks(id) on delete cascade,
  user_id uuid references public."user"(id) on delete cascade,
  primary key (task_id, user_id)
);

create table if not exists public.task_subtasks (
  id uuid primary key default gen_random_uuid(),
  task_id uuid not null references public.tasks(id) on delete cascade,
  title text not null,
  completed boolean not null default false,
  created_at timestamptz not null default now()
);

create table if not exists public.project_members (
  project_id uuid references public.projects(id) on delete cascade,
  user_id uuid references public."user"(id) on delete cascade,
  primary key (project_id, user_id)
);

create table if not exists public.team_members (
  team_id uuid references public.teams(id) on delete cascade,
  user_id uuid references public."user"(id) on delete cascade,
  primary key (team_id, user_id)
);

create table if not exists public.event_assignees (
  event_id uuid references public.calendar_events(id) on delete cascade,
  user_id uuid references public."user"(id) on delete cascade,
  primary key (event_id, user_id)
);

alter table public.event_assignees
  add column if not exists company_id uuid;

create table if not exists public.event_invites (
  id uuid primary key default gen_random_uuid(),
  company_id uuid,
  event_id uuid not null references public.calendar_events(id) on delete cascade,
  inviter_id uuid not null references public."user"(id) on delete cascade,
  invitee_id uuid not null references public."user"(id) on delete cascade,
  status text not null default 'pending' check (status in ('pending', 'accepted', 'rejected')),
  created_at timestamptz not null default now(),
  responded_at timestamptz,
  unique (event_id, invitee_id)
);

-- Helpful indexes
create index if not exists idx_tasks_project_id on public.tasks(project_id);
create index if not exists idx_tasks_team_id on public.tasks(team_id);
create index if not exists idx_task_subtasks_task_id on public.task_subtasks(task_id);
create index if not exists idx_project_members_user_id on public.project_members(user_id);
create index if not exists idx_task_assignees_user_id on public.task_assignees(user_id);
create index if not exists idx_team_members_user_id on public.team_members(user_id);

-- RLS enable
alter table public."user" enable row level security;
alter table public.projects enable row level security;
alter table public.tasks enable row level security;
alter table public.teams enable row level security;
alter table public.calendar_events enable row level security;
alter table public.task_assignees enable row level security;
alter table public.task_subtasks enable row level security;
alter table public.project_members enable row level security;
alter table public.team_members enable row level security;
alter table public.event_assignees enable row level security;
alter table public.event_invites enable row level security;

-- Remove previous versions to avoid duplicate policy errors
drop policy if exists "Public profiles are viewable by everyone." on public."user";
drop policy if exists "Users can update their own profile." on public."user";
drop policy if exists "Projects are viewable by members." on public.projects;
drop policy if exists "Tasks are viewable by project members." on public.tasks;
drop policy if exists task_subtasks_select on public.task_subtasks;
drop policy if exists task_subtasks_insert on public.task_subtasks;

-- Profiles policies
create policy profiles_select_authenticated
on public."user"
for select
to authenticated
using (true);

create policy profiles_insert_self
on public."user"
for insert
to authenticated
with check (auth.uid() = id);

create policy profiles_update_self
on public."user"
for update
to authenticated
using (auth.uid() = id)
with check (auth.uid() = id);

-- Projects policies
create policy projects_select
on public.projects
for select
to authenticated
using (
  created_by = auth.uid()
  or exists (
    select 1 from public.project_members pm
    where pm.project_id = projects.id and pm.user_id = auth.uid()
  )
  or exists (
    select 1
    from public.tasks t
    join public.team_members tm on tm.team_id = t.team_id
    where t.project_id = projects.id
      and tm.user_id = auth.uid()
  )
);

create policy projects_insert
on public.projects
for insert
to authenticated
with check (created_by = auth.uid() or created_by is null);

create policy projects_update
on public.projects
for update
to authenticated
using (
  created_by = auth.uid()
  or exists (
    select 1 from public.project_members pm
    where pm.project_id = projects.id and pm.user_id = auth.uid()
  )
);

-- Project members policies
create policy project_members_select
on public.project_members
for select
to authenticated
using (true);

create policy project_members_insert
on public.project_members
for insert
to authenticated
with check (true);

-- Tasks policies
create policy tasks_select
on public.tasks
for select
to authenticated
using (
  project_id is null
  or exists (
    select 1 from public.project_members pm
    where pm.project_id = tasks.project_id and pm.user_id = auth.uid()
  )
  or exists (
    select 1 from public.team_members tm
    where tm.team_id = tasks.team_id and tm.user_id = auth.uid()
  )
  or exists (
    select 1 from public.task_assignees ta
    where ta.task_id = tasks.id and ta.user_id = auth.uid()
  )
  or exists (
    select 1 from public.projects p
    where p.id = tasks.project_id and p.created_by = auth.uid()
  )
);

create policy tasks_insert
on public.tasks
for insert
to authenticated
with check (
  project_id is null
  or exists (
    select 1 from public.project_members pm
    where pm.project_id = tasks.project_id and pm.user_id = auth.uid()
  )
  or exists (
    select 1 from public.projects p
    where p.id = tasks.project_id and p.created_by = auth.uid()
  )
);

create policy tasks_update
on public.tasks
for update
to authenticated
using (
  project_id is null
  or exists (
    select 1 from public.project_members pm
    where pm.project_id = tasks.project_id and pm.user_id = auth.uid()
  )
  or exists (
    select 1 from public.projects p
    where p.id = tasks.project_id and p.created_by = auth.uid()
  )
);

-- Task assignees
create policy task_assignees_select
on public.task_assignees
for select
to authenticated
using (true);

create policy task_assignees_insert
on public.task_assignees
for insert
to authenticated
with check (true);

-- Task subtasks
create policy task_subtasks_select
on public.task_subtasks
for select
to authenticated
using (true);

create policy task_subtasks_insert
on public.task_subtasks
for insert
to authenticated
with check (true);

-- Teams policies
create policy teams_select
on public.teams
for select
to authenticated
using (
  exists (
    select 1 from public.team_members tm
    where tm.team_id = teams.id and tm.user_id = auth.uid()
  )
);

create policy teams_insert
on public.teams
for insert
to authenticated
with check (true);

create policy teams_update
on public.teams
for update
to authenticated
using (true);

-- Team members policies
create policy team_members_select
on public.team_members
for select
to authenticated
using (true);

create policy team_members_insert
on public.team_members
for insert
to authenticated
with check (true);

-- Calendar events policies
drop policy if exists calendar_events_select on public.calendar_events;
drop policy if exists calendar_events_insert on public.calendar_events;
drop policy if exists calendar_events_update on public.calendar_events;

create policy calendar_events_select
on public.calendar_events
for select
to authenticated
using (
  company_id is not null
  and company_id = (select p.company_id from public."user" p where p.id = auth.uid())
);

create policy calendar_events_insert
on public.calendar_events
for insert
to authenticated
with check (
  company_id is not null
  and company_id = (select p.company_id from public."user" p where p.id = auth.uid())
);

create policy calendar_events_update
on public.calendar_events
for update
to authenticated
using (
  company_id is not null
  and company_id = (select p.company_id from public."user" p where p.id = auth.uid())
)
with check (
  company_id is not null
  and company_id = (select p.company_id from public."user" p where p.id = auth.uid())
);

-- Event assignees policies
drop policy if exists event_assignees_select on public.event_assignees;
drop policy if exists event_assignees_insert on public.event_assignees;

create policy event_assignees_select
on public.event_assignees
for select
to authenticated
using (
  company_id is not null
  and company_id = (select p.company_id from public."user" p where p.id = auth.uid())
);

create policy event_assignees_insert
on public.event_assignees
for insert
to authenticated
with check (
  company_id is not null
  and company_id = (select p.company_id from public."user" p where p.id = auth.uid())
);

create policy event_invites_select
on public.event_invites
for select
to authenticated
using (
  company_id is not null
  and company_id = (select p.company_id from public."user" p where p.id = auth.uid())
  and (invitee_id = auth.uid() or inviter_id = auth.uid())
);

create policy event_invites_insert
on public.event_invites
for insert
to authenticated
with check (
  inviter_id = auth.uid()
  and company_id is not null
  and company_id = (select p.company_id from public."user" p where p.id = auth.uid())
  and exists (
    select 1 from public."user" invitee
    where invitee.id = event_invites.invitee_id
      and invitee.company_id = (select p.company_id from public."user" p where p.id = auth.uid())
  )
);

create policy event_invites_update
on public.event_invites
for update
to authenticated
using (
  company_id is not null
  and company_id = (select p.company_id from public."user" p where p.id = auth.uid())
  and (invitee_id = auth.uid() or inviter_id = auth.uid())
)
with check (
  company_id is not null
  and company_id = (select p.company_id from public."user" p where p.id = auth.uid())
);

-- Task due-date + history extension
alter table public.task_subtasks
  add column if not exists due_date date;

create table if not exists public.task_history (
  id uuid primary key default gen_random_uuid(),
  task_id uuid not null references public.tasks(id) on delete cascade,
  changed_by uuid references public."user"(id) on delete set null,
  action_type text not null default 'update' check (action_type in ('create', 'update', 'delete')),
  field_name text not null,
  old_value text,
  new_value text,
  created_at timestamptz not null default now()
);

create index if not exists idx_task_history_task_id on public.task_history(task_id);
alter table public.task_history enable row level security;

drop policy if exists task_history_select on public.task_history;
drop policy if exists task_history_insert on public.task_history;

create policy task_history_select
on public.task_history
for select
to authenticated
using (
  exists (
    select 1 from public.tasks t
    where t.id = task_history.task_id
      and (
        t.project_id is null
        or exists (
          select 1 from public.project_members pm
          where pm.project_id = t.project_id and pm.user_id = auth.uid()
        )
        or exists (
          select 1 from public.projects p
          where p.id = t.project_id and p.created_by = auth.uid()
        )
      )
  )
);

create policy task_history_insert
on public.task_history
for insert
to authenticated
with check (changed_by = auth.uid() or changed_by is null);
