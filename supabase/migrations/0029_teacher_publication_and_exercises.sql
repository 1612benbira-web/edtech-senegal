-- ============================================================
-- Deux décisions sur les enseignants
-- ============================================================
-- 1) PUBLICATION réservée au responsable d'établissement (school_admin) ou
--    au super admin. L'enseignant crée et modifie en brouillon / révision ;
--    passer un chapitre ou une leçon à « published » exige un droit de gestion.
--    Garde posée EN BASE (trigger) : l'interface ne peut pas la contourner.
-- 2) EXERCICES des enseignants étendus aux leçons des programmes PROPRES à
--    leur école (en plus du programme national), toujours limités à leurs
--    matières/niveaux affectés et à leur appartenance active à l'école.

-- ---------- 1) Garde de publication ----------
create or replace function restrict_teacher_publication()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_curriculum uuid;
  v_school     uuid;
begin
  -- Seule la TRANSITION vers « published » est contrôlée : modifier le texte
  -- d'un contenu déjà publié, ou le repasser en brouillon, reste possible.
  if new.status is distinct from 'published' then
    return new;
  end if;
  if tg_op = 'UPDATE' and old.status is not distinct from 'published' then
    return new;
  end if;

  -- Pas d'utilisateur final (éditeur SQL, service_role, scripts) : on laisse.
  if auth.uid() is null or auth.role() = 'service_role' then
    return new;
  end if;
  if is_admin() then
    return new;
  end if;

  if tg_table_name = 'chapters' then
    v_curriculum := new.curriculum_id;
  else
    select ch.curriculum_id into v_curriculum from chapters ch where ch.id = new.chapter_id;
  end if;
  select c.school_id into v_school from curriculums c where c.id = v_curriculum;

  if v_school is not null and is_school_admin(v_school) then
    return new;
  end if;

  raise exception 'Seul le responsable de l''établissement peut publier un contenu. Passe-le en « révision » pour en demander la publication.'
    using errcode = '42501';
end;
$$;

drop trigger if exists trg_chapter_restrict_publication on chapters;
create trigger trg_chapter_restrict_publication
  before insert or update on chapters
  for each row execute function restrict_teacher_publication();

drop trigger if exists trg_lesson_restrict_publication on lessons;
create trigger trg_lesson_restrict_publication
  before insert or update on lessons
  for each row execute function restrict_teacher_publication();

-- ---------- 2) Exercices sur les leçons de l'école ----------
create or replace function is_assigned_teacher_for_lesson(p_lesson_id uuid, p_school_id uuid)
returns boolean as $$
  select exists (
    select 1
    from lessons l
    join chapters ch on ch.id = l.chapter_id
    join curriculums c on c.id = ch.curriculum_id
    join school_subject_teachers sst
      on sst.subject_id = c.subject_id
     and sst.level_id = c.level_id
     and (c.series_id is null or sst.series_id is null or sst.series_id = c.series_id)
    where l.id = p_lesson_id
      -- programme national OU programme propre à CETTE école (jamais une autre)
      and (c.school_id is null or c.school_id = p_school_id)
      and sst.school_id = p_school_id
      and sst.teacher_profile_id = auth.uid()
      and is_school_teacher(p_school_id)
  );
$$ language sql security definer stable set search_path = public;
