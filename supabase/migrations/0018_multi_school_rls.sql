-- ============================================================
-- RLS multi-écoles (Phase 18)
-- ============================================================
--
-- Chaîne d'accès :
--   auth.uid() -> profiles -> school_members -> school_id -> données
--
-- is_admin() (0009) reste le super_admin global (rôle 'admin').
-- On ajoute :
--   - is_school_admin(school_id)  : school_admin actif de CETTE école
--   - is_school_member(school_id) : membre actif (tout rôle) de CETTE école
--
-- Aucune policy n'est ajoutée sur le contenu pédagogique global
-- (curriculums/chapters/lessons/exercises/questions) : ces tables ne
-- portent pas de school_id (cf. 0017) et restent visibles selon leur
-- seul statut de publication (0009). Le filtrage "ce programme est-il
-- activé pour l'école de cet élève ?" est un filtre métier appliqué
-- dans lib/queries (programme.ts) et lib/services/schoolService.ts,
-- pas une restriction de sécurité au niveau ligne : le contenu
-- pédagogique publié n'est pas une donnée confidentielle par école.
-- Ce qui DOIT être strictement cloisonné par RLS, et l'est ci-dessous :
-- l'annuaire des écoles, les rattachements (school_members) et les
-- programmes activés par école (school_curriculums).

create or replace function is_school_admin(p_school_id uuid)
returns boolean as $$
  select exists (
    select 1 from school_members
    where school_id = p_school_id
      and profile_id = auth.uid()
      and role = 'school_admin'
      and status = 'active'
  );
$$ language sql security definer stable set search_path = public;

create or replace function is_school_member(p_school_id uuid)
returns boolean as $$
  select exists (
    select 1 from school_members
    where school_id = p_school_id
      and profile_id = auth.uid()
      and status = 'active'
  );
$$ language sql security definer stable set search_path = public;

-- ============================================================
-- SCHOOLS
-- ============================================================
alter table schools enable row level security;

create policy "schools_select_admin_or_member" on schools
  for select using (
    is_admin()
    or is_school_member(id)
  );

create policy "schools_admin_all" on schools
  for all using (is_admin()) with check (is_admin());

-- Un school_admin peut mettre à jour les informations de SA propre
-- école (nom, etc.) mais ne peut ni la créer ni la supprimer. Le champ
-- `status` (activer/désactiver un établissement) reste réservé au
-- super_admin : voir le trigger protect_school_status_column ci-dessous
-- (RLS protège les LIGNES, pas les COLONNES — même limite que 0011/0012).
create policy "schools_update_own_school_admin" on schools
  for update using (is_school_admin(id)) with check (is_school_admin(id));

create or replace function protect_school_status_column()
returns trigger as $$
begin
  if auth.role() <> 'service_role' and not is_admin() then
    if new.status is distinct from old.status then
      raise exception 'Seul un super administrateur peut activer/désactiver un établissement.';
    end if;
  end if;
  return new;
end;
$$ language plpgsql security definer set search_path = public;

create trigger trg_protect_school_status_column
  before update on schools
  for each row execute function protect_school_status_column();

-- ============================================================
-- SCHOOL_MEMBERS
-- ============================================================
alter table school_members enable row level security;

create policy "school_members_select" on school_members
  for select using (
    is_admin()
    or profile_id = auth.uid()
    or is_school_admin(school_id)
  );

create policy "school_members_admin_all" on school_members
  for all using (is_admin()) with check (is_admin());

-- Un school_admin gère les élèves/enseignants de SA propre école
-- uniquement (jamais un autre school_admin, et jamais une autre école).
create policy "school_members_school_admin_manage" on school_members
  for all using (is_school_admin(school_id))
  with check (is_school_admin(school_id) and role in ('student', 'teacher'));

-- ============================================================
-- SCHOOL_CURRICULUMS
-- ============================================================
alter table school_curriculums enable row level security;

create policy "school_curriculums_select" on school_curriculums
  for select using (
    is_admin()
    or is_school_member(school_id)
  );

create policy "school_curriculums_admin_all" on school_curriculums
  for all using (is_admin()) with check (is_admin());

create policy "school_curriculums_school_admin_manage" on school_curriculums
  for all using (is_school_admin(school_id))
  with check (is_school_admin(school_id));

-- ============================================================
-- PROFILES — un school_admin doit pouvoir lister les profils des
-- membres de SA propre école (nécessaire pour la page /admin/schools/[id]/members).
-- Ne remplace pas la policy existante "profiles_select_own_or_admin" (0009),
-- s'y ajoute.
-- ============================================================
create policy "profiles_select_school_admin" on profiles
  for select using (
    exists (
      select 1 from school_members sm
      where sm.profile_id = profiles.id
        and sm.status = 'active'
        and is_school_admin(sm.school_id)
    )
  );
