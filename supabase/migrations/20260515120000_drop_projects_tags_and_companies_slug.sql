-- Drop legacy project tag columns (singular + plural)
alter table public.projects drop column if exists tag;
alter table public.projects drop column if exists tags;

-- Drop company slug (name remains unique)
alter table public.companies drop constraint if exists companies_slug_key;
alter table public.companies drop column if exists slug;
