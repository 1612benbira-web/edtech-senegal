-- ============================================================
-- Durcissement sécurité/pédagogique (Phase 15 — audit) : étend le
-- garde-fou "pas de publication sans source" (introduit en 0004 pour
-- `curriculums` uniquement) aux tables `chapters` et `lessons`, qui
-- possèdent elles aussi leurs propres colonnes `source`/`source_url`.
-- ============================================================
--
-- Sans ce trigger, updateChapterStatusAction/updateLessonStatusAction
-- pouvaient faire passer un chapitre ou une leçon à 'published' sans
-- aucune source renseignée, en violation directe de la règle non
-- négociable posée en Phase 1 : "un contenu sans source ne peut pas
-- être promu à published" (contrainte applicative devant être
-- renforcée par un trigger).

create or replace function check_chapter_publishable()
returns trigger as $$
begin
  if new.status = 'published' and (new.source_url is null and new.source is null) then
    raise exception 'Un chapitre ne peut être publié sans source ni source_url';
  end if;
  return new;
end;
$$ language plpgsql;

create trigger trg_chapter_publish_guard
  before insert or update on chapters
  for each row execute function check_chapter_publishable();

create or replace function check_lesson_publishable()
returns trigger as $$
begin
  if new.status = 'published' and (new.source_url is null and new.source is null) then
    raise exception 'Une leçon ne peut être publiée sans source ni source_url';
  end if;
  return new;
end;
$$ language plpgsql;

create trigger trg_lesson_publish_guard
  before insert or update on lessons
  for each row execute function check_lesson_publishable();
