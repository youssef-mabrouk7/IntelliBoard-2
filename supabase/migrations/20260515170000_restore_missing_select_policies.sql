-- Required for insert().select() and listing company data
create policy calendar_events_select_company on public.calendar_events
for select to authenticated
using (company_id = public.current_company_id());

create policy event_assignees_select_company on public.event_assignees
for select to authenticated
using (company_id = public.current_company_id());

create policy invites_select_company on public.invites
for select to authenticated
using (company_id = public.current_company_id());

create policy project_members_select_company on public.project_members
for select to authenticated
using (company_id = public.current_company_id());

create policy task_assignees_select_company on public.task_assignees
for select to authenticated
using (company_id = public.current_company_id());

create policy task_history_select_company on public.task_history
for select to authenticated
using (company_id = public.current_company_id());

create policy task_subtasks_select_company on public.task_subtasks
for select to authenticated
using (company_id = public.current_company_id());

create policy team_members_select_company on public.team_members
for select to authenticated
using (company_id = public.current_company_id());
