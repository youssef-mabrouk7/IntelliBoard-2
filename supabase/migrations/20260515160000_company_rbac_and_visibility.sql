-- Company-wide visibility + role-based write access
-- PM: create/edit everything
-- Team Leader: same except cannot create projects
-- Team Member: can update tasks (mark complete / progress) only

-- ---------------------------------------------------------------------------
-- SELECT: everything in the company is visible to all company users
-- ---------------------------------------------------------------------------
drop policy if exists projects_select_company on public.projects;
create policy projects_select_company on public.projects
for select to authenticated
using (company_id = public.current_company_id());

drop policy if exists teams_select_company on public.teams;
create policy teams_select_company on public.teams
for select to authenticated
using (company_id = public.current_company_id());

drop policy if exists tasks_select_company on public.tasks;
create policy tasks_select_company on public.tasks
for select to authenticated
using (company_id = public.current_company_id());

drop policy if exists user_select_company on public."user";
drop policy if exists user_select_own on public."user";
create policy user_select_company on public."user"
for select to authenticated
using (company_id = public.current_company_id());

-- ---------------------------------------------------------------------------
-- PROJECTS (create: PM only | edit/delete: PM + TL)
-- ---------------------------------------------------------------------------
drop policy if exists projects_insert_company on public.projects;
drop policy if exists projects_update_company on public.projects;
drop policy if exists projects_delete_company on public.projects;

create policy projects_insert_company on public.projects
for insert to authenticated
with check (
  company_id = public.current_company_id()
  and public.has_any_role(array['Project Manager'])
);

create policy projects_update_company on public.projects
for update to authenticated
using (
  company_id = public.current_company_id()
  and public.has_any_role(array['Project Manager', 'Team Leader'])
)
with check (company_id = public.current_company_id());

create policy projects_delete_company on public.projects
for delete to authenticated
using (
  company_id = public.current_company_id()
  and public.has_any_role(array['Project Manager', 'Team Leader'])
);

-- ---------------------------------------------------------------------------
-- TEAMS (PM + TL)
-- ---------------------------------------------------------------------------
drop policy if exists teams_insert_company on public.teams;
drop policy if exists teams_update_company on public.teams;
drop policy if exists teams_delete_company on public.teams;

create policy teams_insert_company on public.teams
for insert to authenticated
with check (
  company_id = public.current_company_id()
  and public.has_any_role(array['Project Manager', 'Team Leader'])
);

create policy teams_update_company on public.teams
for update to authenticated
using (
  company_id = public.current_company_id()
  and public.has_any_role(array['Project Manager', 'Team Leader'])
)
with check (company_id = public.current_company_id());

create policy teams_delete_company on public.teams
for delete to authenticated
using (
  company_id = public.current_company_id()
  and public.has_any_role(array['Project Manager', 'Team Leader'])
);

-- ---------------------------------------------------------------------------
-- TASKS (create/delete: PM + TL | update/mark: everyone in company)
-- ---------------------------------------------------------------------------
drop policy if exists tasks_insert_company on public.tasks;
drop policy if exists tasks_update_company on public.tasks;
drop policy if exists tasks_delete_company on public.tasks;

create policy tasks_insert_company on public.tasks
for insert to authenticated
with check (
  company_id = public.current_company_id()
  and public.has_any_role(array['Project Manager', 'Team Leader'])
);

create policy tasks_update_company on public.tasks
for update to authenticated
using (company_id = public.current_company_id())
with check (company_id = public.current_company_id());

create policy tasks_delete_company on public.tasks
for delete to authenticated
using (
  company_id = public.current_company_id()
  and public.has_any_role(array['Project Manager', 'Team Leader'])
);

-- ---------------------------------------------------------------------------
-- TASK SUBTASKS (create/delete: PM + TL | update: all — mark subtasks done)
-- ---------------------------------------------------------------------------
drop policy if exists task_subtasks_insert_company on public.task_subtasks;
drop policy if exists task_subtasks_update_company on public.task_subtasks;
drop policy if exists task_subtasks_delete_company on public.task_subtasks;

create policy task_subtasks_insert_company on public.task_subtasks
for insert to authenticated
with check (
  company_id = public.current_company_id()
  and public.has_any_role(array['Project Manager', 'Team Leader'])
);

create policy task_subtasks_update_company on public.task_subtasks
for update to authenticated
using (company_id = public.current_company_id())
with check (company_id = public.current_company_id());

create policy task_subtasks_delete_company on public.task_subtasks
for delete to authenticated
using (
  company_id = public.current_company_id()
  and public.has_any_role(array['Project Manager', 'Team Leader'])
);

-- ---------------------------------------------------------------------------
-- MEMBERSHIP / ASSIGNEES (PM + TL)
-- ---------------------------------------------------------------------------
drop policy if exists project_members_insert_company on public.project_members;
drop policy if exists project_members_update_company on public.project_members;
drop policy if exists project_members_delete_company on public.project_members;

create policy project_members_insert_company on public.project_members
for insert to authenticated
with check (
  company_id = public.current_company_id()
  and public.has_any_role(array['Project Manager', 'Team Leader'])
);

create policy project_members_update_company on public.project_members
for update to authenticated
using (
  company_id = public.current_company_id()
  and public.has_any_role(array['Project Manager', 'Team Leader'])
)
with check (company_id = public.current_company_id());

create policy project_members_delete_company on public.project_members
for delete to authenticated
using (
  company_id = public.current_company_id()
  and public.has_any_role(array['Project Manager', 'Team Leader'])
);

drop policy if exists team_members_insert_company on public.team_members;
drop policy if exists team_members_update_company on public.team_members;
drop policy if exists team_members_delete_company on public.team_members;

create policy team_members_insert_company on public.team_members
for insert to authenticated
with check (
  company_id = public.current_company_id()
  and public.has_any_role(array['Project Manager', 'Team Leader'])
);

create policy team_members_update_company on public.team_members
for update to authenticated
using (
  company_id = public.current_company_id()
  and public.has_any_role(array['Project Manager', 'Team Leader'])
)
with check (company_id = public.current_company_id());

create policy team_members_delete_company on public.team_members
for delete to authenticated
using (
  company_id = public.current_company_id()
  and public.has_any_role(array['Project Manager', 'Team Leader'])
);

drop policy if exists task_assignees_insert_company on public.task_assignees;
drop policy if exists task_assignees_update_company on public.task_assignees;
drop policy if exists task_assignees_delete_company on public.task_assignees;

create policy task_assignees_insert_company on public.task_assignees
for insert to authenticated
with check (
  company_id = public.current_company_id()
  and public.has_any_role(array['Project Manager', 'Team Leader'])
);

create policy task_assignees_update_company on public.task_assignees
for update to authenticated
using (
  company_id = public.current_company_id()
  and public.has_any_role(array['Project Manager', 'Team Leader'])
)
with check (company_id = public.current_company_id());

create policy task_assignees_delete_company on public.task_assignees
for delete to authenticated
using (
  company_id = public.current_company_id()
  and public.has_any_role(array['Project Manager', 'Team Leader'])
);

-- ---------------------------------------------------------------------------
-- CALENDAR + INVITES (PM + TL)
-- ---------------------------------------------------------------------------
drop policy if exists calendar_events_select_company on public.calendar_events;
create policy calendar_events_select_company on public.calendar_events
for select to authenticated
using (company_id = public.current_company_id());

drop policy if exists calendar_events_insert_company on public.calendar_events;
drop policy if exists calendar_events_update_company on public.calendar_events;
drop policy if exists calendar_events_delete_company on public.calendar_events;

create policy calendar_events_insert_company on public.calendar_events
for insert to authenticated
with check (
  company_id = public.current_company_id()
  and public.has_any_role(array['Project Manager', 'Team Leader'])
);

create policy calendar_events_update_company on public.calendar_events
for update to authenticated
using (
  company_id = public.current_company_id()
  and public.has_any_role(array['Project Manager', 'Team Leader'])
)
with check (company_id = public.current_company_id());

create policy calendar_events_delete_company on public.calendar_events
for delete to authenticated
using (
  company_id = public.current_company_id()
  and public.has_any_role(array['Project Manager', 'Team Leader'])
);

drop policy if exists event_assignees_insert_company on public.event_assignees;
drop policy if exists event_assignees_update_company on public.event_assignees;
drop policy if exists event_assignees_delete_company on public.event_assignees;

create policy event_assignees_insert_company on public.event_assignees
for insert to authenticated
with check (
  company_id = public.current_company_id()
  and public.has_any_role(array['Project Manager', 'Team Leader'])
);

create policy event_assignees_update_company on public.event_assignees
for update to authenticated
using (
  company_id = public.current_company_id()
  and public.has_any_role(array['Project Manager', 'Team Leader'])
)
with check (company_id = public.current_company_id());

create policy event_assignees_delete_company on public.event_assignees
for delete to authenticated
using (
  company_id = public.current_company_id()
  and public.has_any_role(array['Project Manager', 'Team Leader'])
);

drop policy if exists invites_insert_company on public.invites;
drop policy if exists invites_update_company on public.invites;
drop policy if exists invites_delete_company on public.invites;

create policy invites_insert_company on public.invites
for insert to authenticated
with check (
  company_id = public.current_company_id()
  and public.has_any_role(array['Project Manager', 'Team Leader'])
);

create policy invites_update_company on public.invites
for update to authenticated
using (
  company_id = public.current_company_id()
  and public.has_any_role(array['Project Manager', 'Team Leader'])
)
with check (company_id = public.current_company_id());

create policy invites_delete_company on public.invites
for delete to authenticated
using (
  company_id = public.current_company_id()
  and public.has_any_role(array['Project Manager', 'Team Leader'])
);

-- ---------------------------------------------------------------------------
-- TASK HISTORY (read: company | write: all roles — task marking logs history)
-- ---------------------------------------------------------------------------
drop policy if exists task_history_insert_company on public.task_history;

create policy task_history_insert_company on public.task_history
for insert to authenticated
with check (company_id = public.current_company_id());

-- ---------------------------------------------------------------------------
-- USER PROFILE (read: company | update own or PM/TL manages company users)
-- ---------------------------------------------------------------------------
drop policy if exists user_update_company on public."user";

create policy user_update_company on public."user"
for update to authenticated
using (
  company_id = public.current_company_id()
  and (
    id = auth.uid()
    or public.has_any_role(array['Project Manager', 'Team Leader'])
  )
)
with check (company_id = public.current_company_id());
