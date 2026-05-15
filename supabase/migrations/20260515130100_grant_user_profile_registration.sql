grant select, insert, update on table public."user" to authenticated;

create policy user_select_own on public."user"
for select to authenticated
using (id = auth.uid());

create policy user_insert_own_profile on public."user"
for insert to authenticated
with check (id = auth.uid());
