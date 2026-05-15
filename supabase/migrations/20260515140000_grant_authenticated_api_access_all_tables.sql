-- API roles must have table privileges; RLS enforces tenant isolation.
grant usage on schema public to anon, authenticated;

grant select on table public.companies to anon;

grant select, insert, update, delete on table
  public.projects,
  public.project_members,
  public.teams,
  public.team_members,
  public.tasks,
  public.task_assignees,
  public.task_subtasks,
  public.task_history,
  public.calendar_events,
  public.event_assignees,
  public.invites,
  public.companies
  to authenticated;

grant select, insert, update, delete on table public."user" to authenticated;

grant usage, select on all sequences in schema public to authenticated;

grant execute on function public.current_company_id() to authenticated;
grant execute on function public.current_user_role() to authenticated;
grant execute on function public.has_any_role(text[]) to authenticated;
