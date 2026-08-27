-- ============================================================
-- Classement élève par niveau
-- ============================================================
-- Expose uniquement les informations nécessaires au classement.
-- La fonction vérifie que l'appelant appartient bien au niveau demandé.
-- Aucun accès direct aux autres lignes de profiles n'est ouvert.

create or replace function get_level_leaderboard(p_level_id uuid, p_limit integer default 10)
returns table (
  profile_id uuid,
  first_name text,
  last_name_initial text,
  xp_total integer,
  rank bigint
) as $$
begin
  if auth.uid() is null then
    raise exception 'Authentification requise';
  end if;

  if not exists (
    select 1 from public.profiles
    where id = auth.uid() and level_id = p_level_id
  ) then
    raise exception 'Niveau non autorisé';
  end if;

  return query
  select
    p.id,
    coalesce(p.first_name, 'Élève'),
    case when nullif(trim(p.last_name), '') is null then null else left(trim(p.last_name), 1) || '.' end,
    p.xp_total,
    row_number() over (order by p.xp_total desc, p.created_at asc, p.id asc)
  from public.profiles p
  where p.level_id = p_level_id
    and p.role = 'student'
  order by p.xp_total desc, p.created_at asc, p.id asc
  limit greatest(1, least(coalesce(p_limit, 10), 10));
end;
$$ language plpgsql security definer stable set search_path = public;

create or replace function get_my_level_rank(p_level_id uuid)
returns bigint as $$
declare
  result bigint;
begin
  if auth.uid() is null then
    raise exception 'Authentification requise';
  end if;

  if not exists (
    select 1 from public.profiles
    where id = auth.uid() and level_id = p_level_id
  ) then
    raise exception 'Niveau non autorisé';
  end if;

  select ranked.rank into result
  from (
    select id, row_number() over (order by xp_total desc, created_at asc, id asc) as rank
    from public.profiles
    where level_id = p_level_id and role = 'student'
  ) ranked
  where ranked.id = auth.uid();

  return result;
end;
$$ language plpgsql security definer stable set search_path = public;

revoke all on function get_level_leaderboard(uuid, integer) from public, anon;
revoke all on function get_my_level_rank(uuid) from public, anon;
grant execute on function get_level_leaderboard(uuid, integer) to authenticated;
grant execute on function get_my_level_rank(uuid) to authenticated;

create index if not exists idx_profiles_level_xp on profiles(level_id, xp_total desc, created_at asc, id asc)
where role = 'student';
