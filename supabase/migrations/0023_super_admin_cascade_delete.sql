-- ============================================================
-- Suppression en cascade — Super Admin uniquement (Phase 22)
-- ============================================================
--
-- Jusqu'ici, deleteCurriculumAction/deleteLevelAction (app/admin/
-- curriculum-actions.ts, curriculum-content-actions.ts) REFUSAIENT la
-- suppression dès qu'une dépendance existait (chapitres, domaines,
-- séries, matières associées...), y compris pour le super_admin. C'est
-- l'inverse de ce qui est demandé ici : le super_admin doit pouvoir
-- supprimer un programme ou un niveau entier malgré ces dépendances,
-- de façon propre (pas de données orphelines, pas d'erreur de clé
-- étrangère), et de façon transactionnelle (tout ou rien).
--
-- Aucune des tables de contenu pédagogique n'a de ON DELETE CASCADE
-- (voir 0004/0005/0006/0007) : c'est un choix délibéré du schéma pour
-- ne JAMAIS supprimer de contenu silencieusement suite à une simple
-- suppression en amont. La cascade est donc gérée ici explicitement,
-- dans l'ordre correct des dépendances, à l'intérieur d'une fonction
-- PL/pgSQL — une fonction s'exécute comme une seule transaction
-- implicite : si une étape lève une exception, PostgreSQL annule
-- automatiquement tout ce que la fonction a déjà fait (ROLLBACK), donc
-- aucune suppression partielle ne peut rester en base.
--
-- Chaque fonction destructive vérifie is_admin() en premier, et lève
-- une exception sinon : même appelée directement (service_role,
-- console SQL, etc.), impossible pour un school_admin ou un simple
-- utilisateur de la déclencher. Les Server Actions ajoutent en plus
-- requireAdmin() côté application pour un message d'erreur clair.
--
-- Deux usages par cible :
--   - get_..._deletion_impact(id)  : LECTURE SEULE, calcule les
--     compteurs pour la boîte de confirmation ("Cette action
--     supprimera également : X chapitres, X leçons...") avant que
--     l'admin ne confirme.
--   - delete_..._cascade(id)       : supprime réellement, renvoie les
--     mêmes compteurs (pratique pour le message de confirmation finale
--     côté UI).

-- ============================================================
-- PROGRAMME (curriculum) — dépendants calculés une seule fois,
-- réutilisés par la fonction d'impact ET la fonction de suppression.
-- ============================================================

create or replace function curriculum_cascade_ids(p_curriculum_id uuid)
returns table (
  chapter_ids uuid[],
  lesson_ids uuid[],
  exercise_ids uuid[],
  question_ids uuid[],
  domain_ids uuid[],
  competency_ids uuid[]
) language sql security definer stable set search_path = public as $$
  with ch as (
    select id from chapters where curriculum_id = p_curriculum_id
  ), le as (
    select id from lessons where chapter_id in (select id from ch)
  ), ex as (
    select id from exercises where lesson_id in (select id from le)
  ), qu as (
    -- Une question peut être rattachée à un exercice de ce programme,
    -- ou directement à un chapitre de ce programme (colonne
    -- questions.chapter_id, cf. 0005) : les deux cas doivent être
    -- inclus pour ne laisser aucune question orpheline.
    select id from questions
    where exercise_id in (select id from ex)
       or chapter_id in (select id from ch)
  ), dm as (
    select id from domains where curriculum_id = p_curriculum_id
  ), co as (
    select id from competencies where domain_id in (select id from dm)
  )
  select
    (select coalesce(array_agg(id), '{}') from ch),
    (select coalesce(array_agg(id), '{}') from le),
    (select coalesce(array_agg(id), '{}') from ex),
    (select coalesce(array_agg(id), '{}') from qu),
    (select coalesce(array_agg(id), '{}') from dm),
    (select coalesce(array_agg(id), '{}') from co);
$$;

create or replace function get_curriculum_deletion_impact(p_curriculum_id uuid)
returns jsonb language plpgsql security definer stable set search_path = public as $$
declare
  d record;
  v_options_count int;
  v_schools_count int;
begin
  if not is_admin() then
    raise exception 'Action réservée aux super administrateurs.' using errcode = '42501';
  end if;
  if not exists (select 1 from curriculums where id = p_curriculum_id) then
    raise exception 'Programme introuvable.';
  end if;

  select * into d from curriculum_cascade_ids(p_curriculum_id);
  select count(*) into v_options_count from question_options where question_id = any(d.question_ids);
  select count(*) into v_schools_count from school_curriculums where curriculum_id = p_curriculum_id;

  return jsonb_build_object(
    'domains', coalesce(array_length(d.domain_ids, 1), 0),
    'competencies', coalesce(array_length(d.competency_ids, 1), 0),
    'chapters', coalesce(array_length(d.chapter_ids, 1), 0),
    'lessons', coalesce(array_length(d.lesson_ids, 1), 0),
    'exercises', coalesce(array_length(d.exercise_ids, 1), 0),
    'questions', coalesce(array_length(d.question_ids, 1), 0),
    'questionOptions', v_options_count,
    'schoolsUsingIt', v_schools_count
  );
end;
$$;

create or replace function delete_curriculum_cascade(p_curriculum_id uuid)
returns jsonb language plpgsql security definer set search_path = public as $$
declare
  d record;
  v_impact jsonb;
begin
  if not is_admin() then
    raise exception 'Action réservée aux super administrateurs.' using errcode = '42501';
  end if;
  if not exists (select 1 from curriculums where id = p_curriculum_id) then
    raise exception 'Programme introuvable.';
  end if;

  -- Calculé AVANT suppression : c'est ce qui sera renvoyé à l'appelant
  -- pour le message de confirmation finale.
  v_impact := get_curriculum_deletion_impact(p_curriculum_id);
  select * into d from curriculum_cascade_ids(p_curriculum_id);

  -- Ordre strict : toujours supprimer les dépendants avant leur parent.
  delete from daily_quiz_questions where question_id = any(d.question_ids);
  delete from quiz_questions where question_id = any(d.question_ids);
  delete from exercise_attempts where question_id = any(d.question_ids);
  delete from question_options where question_id = any(d.question_ids);
  delete from questions where id = any(d.question_ids);
  delete from exercises where id = any(d.exercise_ids);
  delete from lesson_progress where lesson_id = any(d.lesson_ids);
  delete from lessons where id = any(d.lesson_ids);

  -- quiz_attempts.chapter_id n'est qu'un rattachement informatif (le
  -- quiz lui-même appartient à l'élève, pas au programme) : on le vide
  -- plutôt que de supprimer l'historique de quiz de l'élève, pour ne
  -- jamais retirer un XP déjà gagné légitimement.
  update quiz_attempts set chapter_id = null where chapter_id = any(d.chapter_ids);
  delete from chapters where id = any(d.chapter_ids);

  delete from competency_progress where competency_id = any(d.competency_ids);
  delete from competencies where id = any(d.competency_ids);
  delete from domains where id = any(d.domain_ids);

  -- school_curriculums.curriculum_id est déjà ON DELETE CASCADE
  -- (migration 0017) : nettoyé automatiquement par ce DELETE.
  delete from curriculums where id = p_curriculum_id;

  return v_impact;
end;
$$;

-- ============================================================
-- NIVEAU (school_level) — délègue à delete_curriculum_cascade pour
-- chacun de ses programmes, puis nettoie séries/matières associées et
-- désinscrit les élèves actuellement rattachés à ce niveau (ils ne
-- perdent ni leur compte ni leur XP, seulement leur affectation
-- niveau/série, qu'ils devront resélectionner — cf. onboarding).
-- ============================================================

create or replace function get_level_deletion_impact(p_level_id uuid)
returns jsonb language plpgsql security definer stable set search_path = public as $$
declare
  v_curriculum_ids uuid[];
  v_series_count int;
  v_level_subjects_count int;
  v_students_count int;
  v_totals jsonb := jsonb_build_object(
    'domains', 0, 'competencies', 0, 'chapters', 0, 'lessons', 0,
    'exercises', 0, 'questions', 0, 'questionOptions', 0
  );
  v_curriculum_id uuid;
  v_one jsonb;
  v_key text;
begin
  if not is_admin() then
    raise exception 'Action réservée aux super administrateurs.' using errcode = '42501';
  end if;
  if not exists (select 1 from school_levels where id = p_level_id) then
    raise exception 'Niveau introuvable.';
  end if;

  select coalesce(array_agg(id), '{}') into v_curriculum_ids from curriculums where level_id = p_level_id;

  foreach v_curriculum_id in array v_curriculum_ids loop
    v_one := get_curriculum_deletion_impact(v_curriculum_id);
    for v_key in select jsonb_object_keys(v_totals) loop
      v_totals := jsonb_set(
        v_totals, array[v_key],
        to_jsonb((v_totals->>v_key)::int + coalesce((v_one->>v_key)::int, 0))
      );
    end loop;
  end loop;

  select count(*) into v_series_count from school_series where level_id = p_level_id;
  select count(*) into v_level_subjects_count from level_subjects where level_id = p_level_id;
  select count(*) into v_students_count from profiles where level_id = p_level_id;

  return v_totals
    || jsonb_build_object('curriculums', coalesce(array_length(v_curriculum_ids, 1), 0))
    || jsonb_build_object('series', v_series_count)
    || jsonb_build_object('levelSubjects', v_level_subjects_count)
    || jsonb_build_object('studentsAffected', v_students_count);
end;
$$;

create or replace function delete_level_cascade(p_level_id uuid)
returns jsonb language plpgsql security definer set search_path = public as $$
declare
  v_impact jsonb;
  v_curriculum_ids uuid[];
  v_curriculum_id uuid;
begin
  if not is_admin() then
    raise exception 'Action réservée aux super administrateurs.' using errcode = '42501';
  end if;
  if not exists (select 1 from school_levels where id = p_level_id) then
    raise exception 'Niveau introuvable.';
  end if;

  v_impact := get_level_deletion_impact(p_level_id);

  select coalesce(array_agg(id), '{}') into v_curriculum_ids from curriculums where level_id = p_level_id;
  foreach v_curriculum_id in array v_curriculum_ids loop
    perform delete_curriculum_cascade(v_curriculum_id);
  end loop;

  -- Un élève rattaché à ce niveau (ou une série de ce niveau) perd son
  -- affectation niveau/série — jamais son compte ni son XP — et devra
  -- resélectionner son niveau (flux onboarding déjà existant).
  update profiles set series_id = null where series_id in (select id from school_series where level_id = p_level_id);
  update profiles set level_id = null where level_id = p_level_id;

  delete from level_subjects where level_id = p_level_id;
  delete from school_series where level_id = p_level_id;
  delete from school_levels where id = p_level_id;

  return v_impact;
end;
$$;
