drop policy if exists teams_select_company on public.teams;
drop policy if exists teams_insert_company on public.teams;

create policy teams_select_company on public.teams
for select to authenticated
using (
  company_id = public.current_company_id()
  and (
    public.has_any_role(array['Project Manager', 'Team Leader'])
    or exists (
      select 1
      from public.team_members tm
      where tm.team_id = teams.id
        and tm.user_id = auth.uid()
        and tm.company_id = public.current_company_id()
    )
  )
);

create policy teams_insert_company on public.teams
for insert to authenticated
with check (
  company_id = public.current_company_id()
  and public.has_any_role(array['Project Manager', 'Team Leader'])
);
