-- ============================================================
-- Corrections de sécurité (Phase 20)
-- ============================================================
--
-- Cette migration NE modifie AUCUNE migration déjà appliquée (0001 à
-- 0019). Elle corrige trois problèmes identifiés lors de l'audit :
--
-- 1. school_members : un school_admin pouvait SUPPRIMER un autre
--    school_admin de sa propre école (la policy "FOR ALL" ne
--    restreignait le rôle cible que via le WITH CHECK, qui ne
--    s'applique PAS aux DELETE ni à la ligne existante d'un UPDATE).
--
-- 2. Visibilité des programmes globaux : un curriculum global
--    (school_id IS NULL) était visible par RLS à tout élève membre
--    d'une école, MÊME SI cette école n'avait pas activé ce
--    programme via school_curriculums.enabled. Le filtrage n'existait
--    que côté application (lib/queries/programme.ts), pas au niveau
--    ligne — un élève pouvait donc interroger Supabase directement
--    (REST/JS) pour lire des chapitres/leçons/exercices/questions
--    d'un programme global non activé pour son école.
--
-- 3. Création d'une école + attribution de son school_admin : ajoute
--    une fonction RPC transactionnelle pour que l'école ne puisse
--    jamais exister sans que le rattachement de son administrateur
--    (déjà résolu côté serveur : profil existant ou nouvellement
--    invité) réussisse également.

-- ============================================================
-- 1. SCHOOL_MEMBERS — un school_admin ne peut plus toucher un autre
--    school_admin de son école (ni le modifier, ni le supprimer).
--    On remplace l'unique policy "FOR ALL" par trois policies
--    dédiées : INSERT / UPDATE / DELETE, chacune avec une clause
--    USING qui exclut explicitement les lignes role = 'school_admin'.
-- ============================================================

drop policy if exists "school_members_school_admin_manage" on school_members;

create policy "school_members_school_admin_insert" on school_members
  for insert
  with check (
    is_school_admin(school_id)
    and role in ('student', 'teacher')
  );

-- USING porte sur la ligne EXISTANTE : un school_admin ne peut donc
-- même pas sélectionner comme cible une ligne où role = 'school_admin'
-- (contrairement à l'ancienne policy FOR ALL, où seul le WITH CHECK -
-- qui ne protège que la ligne APRÈS écriture - empêchait de la
-- transformer en school_admin, sans empêcher de la modifier/supprimer
-- si elle l'était déjà).
create policy "school_members_school_admin_update" on school_members
  for update
  using (
    is_school_admin(school_id)
    and role in ('student', 'teacher')
  )
  with check (
    is_school_admin(school_id)
    and role in ('student', 'teacher')
  );

create policy "school_members_school_admin_delete" on school_members
  for delete
  using (
    is_school_admin(school_id)
    and role in ('student', 'teacher')
  );

-- ============================================================
-- 2. VISIBILITÉ DES PROGRAMMES GLOBAUX — cohérente avec
--    school_curriculums.enabled.
--
-- Règle :
--   - programme privé d'une école (school_id renseigné) : inchangé,
--     réservé aux membres actifs de cette école.
--   - programme global (school_id NULL) :
--       * un utilisateur SANS AUCUNE école active le voit toujours
--         (compatibilité historique : comptes créés avant le
--         multi-écoles, cf. schoolService.ts) ;
--       * un utilisateur membre actif d'au moins une école ne le voit
--         que si CETTE école a explicitement activé le programme
--         (school_curriculums.enabled = true).
--
-- Cette fonction est utilisée par toute la chaîne de policies SELECT
-- (curriculums, chapters, lessons, exercises, questions,
-- question_options — cf. 0019), donc corriger UNIQUEMENT cette
-- fonction referme le trou de sécurité sur toute la chaîne.
-- ============================================================

create or replace function curriculum_visible_to_current_user(p_curriculum_id uuid)
returns boolean as $$
  select exists (
    select 1 from curriculums c
    where c.id = p_curriculum_id
      and (
        (c.school_id is not null and is_school_member(c.school_id))
        or (
          c.school_id is null
          and (
            not exists (
              select 1 from school_members sm
              where sm.profile_id = auth.uid() and sm.status = 'active'
            )
            or exists (
              select 1 from school_members sm
              join school_curriculums sc on sc.school_id = sm.school_id
              where sm.profile_id = auth.uid()
                and sm.status = 'active'
                and sc.curriculum_id = c.id
                and sc.enabled = true
            )
          )
        )
      )
  );
$$ language sql security definer stable set search_path = public;

-- ============================================================
-- 3. CRÉATION ATOMIQUE D'UNE ÉCOLE + SON SCHOOL_ADMIN
--
-- Appelée uniquement depuis une Server Action après requireAdmin()
-- (le SECURITY DEFINER + le contrôle is_admin() interne empêchent tout
-- appel direct non autorisé, y compris depuis le client si la clé
-- anon était utilisée). p_admin_profile_id est résolu par la Server
-- Action AVANT l'appel : soit un profil existant retrouvé par email,
-- soit le profil auto-créé par le trigger on_auth_user_created suite
-- à un auth.admin.inviteUserByEmail (cf. schools/actions.ts). Ainsi,
-- école + rattachement de son administrateur sont créés dans UNE
-- SEULE transaction : si l'un échoue (contrainte unique sur le code
-- établissement, etc.), l'autre est annulé — jamais d'école orpheline
-- sans administrateur.
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
