-- ============================================================
-- 0022 — Correctif : create_school_with_admin levait
-- "column reference school_id is ambiguous"
--
-- Cause : RETURNS TABLE (school_id uuid, ...) crée en interne
-- une variable PL/pgSQL nommée school_id, qui entre en conflit
-- avec la colonne school_id des tables schools/school_members
-- référencée dans ON CONFLICT (school_id, profile_id).
--
-- Correctif : #variable_conflict use_column indique à PL/pgSQL
-- de résoudre les noms ambigus comme des colonnes de table
-- plutôt que comme des variables — comportement inchangé pour
-- tout le reste de la fonction.
-- ============================================================

create or replace function create_school_with_admin(
  p_name text,
  p_slug text,
  p_code text,
  p_admin_profile_id uuid default null
)
returns table (school_id uuid, already_admin_elsewhere boolean)
language plpgsql
security definer
set search_path = public
as $$
#variable_conflict use_column
declare
  v_school_id uuid;
  v_already_elsewhere boolean := false;
begin
  if not is_admin() then
    raise exception 'Action réservée aux administrateurs.' using errcode = '42501';
  end if;

  insert into schools (name, slug, code)
  values (p_name, p_slug, p_code)
  returning id into v_school_id;

  if p_admin_profile_id is not null then
    select exists (
      select 1 from school_members
      where profile_id = p_admin_profile_id
        and role = 'school_admin'
        and status = 'active'
    ) into v_already_elsewhere;

    insert into school_members (school_id, profile_id, role, status)
    values (v_school_id, p_admin_profile_id, 'school_admin', 'active')
    on conflict (school_id, profile_id) do update
      set role = 'school_admin', status = 'active';
  end if;

  return query select v_school_id, v_already_elsewhere;
end;
$$;