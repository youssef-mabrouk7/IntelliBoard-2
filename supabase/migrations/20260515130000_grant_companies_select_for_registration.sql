-- Allow API roles to read companies (registration company picker)
grant usage on schema public to anon, authenticated;
grant select on table public.companies to anon, authenticated;

drop policy if exists companies_select_own on public.companies;

create policy companies_select_for_registration on public.companies
for select to anon, authenticated
using (true);
