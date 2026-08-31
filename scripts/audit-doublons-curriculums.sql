-- ============================================================
-- AUDIT DES DOUBLONS — LECTURE SEULE, NE SUPPRIME RIEN
-- ============================================================
-- À exécuter dans le SQL Editor Supabase (ou psql). Ce script ne fait
-- aucun UPDATE ni DELETE : il liste uniquement les curriculums groupés
-- par niveau + matière, avec leurs volumes de contenu et la présence
-- ou non de progression élève, pour permettre une décision éclairée
-- AVANT toute suppression (cf. Partie 3 de la mission : ne rien
-- supprimer sans confirmation explicite du porteur de projet).

-- 1) Vue d'ensemble : tous les curriculums par niveau + matière.
select
  l.code as niveau,
  s.name as matiere,
  c.id,
  c.title,
  c.version,
  c.status,
  c.is_demo,
  c.created_at,
  (select count(*) from chapters ch where ch.curriculum_id = c.id and ch.deleted_at is null) as nb_chapitres,
  (select count(*) from lessons le join chapters ch on ch.id = le.chapter_id where ch.curriculum_id = c.id and le.deleted_at is null) as nb_lecons,
  (select count(*) from exercises ex join lessons le on le.id = ex.lesson_id join chapters ch on ch.id = le.chapter_id where ch.curriculum_id = c.id and ex.deleted_at is null) as nb_exercices,
  (select count(*) from questions q join exercises ex on ex.id = q.exercise_id join lessons le on le.id = ex.lesson_id join chapters ch on ch.id = le.chapter_id where ch.curriculum_id = c.id and q.deleted_at is null) as nb_questions
from curriculums c
join school_levels l on l.id = c.level_id
join subjects s on s.id = c.subject_id
order by l."order", s.name, c.created_at;

-- 2) Doublons STRICTS suspects : même niveau + même matière + même
-- titre normalisé (espaces/casse ignorés). Un Lot A et un Lot B sur la
-- même matière ont des TITRES DIFFÉRENTS (par ex. "Mathématiques 6e –
-- Programme sénégalais" partagé, mais des VERSIONS différentes comme
-- "6e-maths-v1" vs une éventuelle "6e-maths-lotB-v1") : ils ne
-- ressortent PAS forcément ici comme doublons si leurs versions
-- diffèrent — la requête isole les cas où titre ET niveau ET matière
-- coïncident, ce qui est le signal le plus fiable d'un vrai doublon
-- (deux imports concurrents du même programme).
select
  l.code as niveau,
  s.name as matiere,
  lower(trim(c.title)) as titre_normalise,
  count(*) as nb_curriculums,
  array_agg(c.id order by c.created_at) as ids,
  array_agg(c.version order by c.created_at) as versions,
  array_agg(c.status order by c.created_at) as statuts,
  array_agg(c.created_at order by c.created_at) as dates_creation
from curriculums c
join school_levels l on l.id = c.level_id
join subjects s on s.id = c.subject_id
group by l.code, s.name, lower(trim(c.title))
having count(*) > 1
order by l.code, s.name;

-- 3) Pour chaque curriculum, présence de progression élève réelle —
-- NE JAMAIS supprimer un curriculum qui a de la progression sans en
-- informer explicitement le porteur de projet (cf. mission).
-- Adapter les noms de colonnes ci-dessous si lesson_progress /
-- exercise_attempts / competency_progress utilisent d'autres FK dans
-- ce projet (vérifier avec \d lesson_progress avant exécution si le
-- résultat semble incohérent).
select
  c.id as curriculum_id,
  c.title,
  c.version,
  (select count(*) from lesson_progress lp join lessons le on le.id = lp.lesson_id join chapters ch on ch.id = le.chapter_id where ch.curriculum_id = c.id) as nb_lesson_progress,
  (select count(*) from exercise_attempts ea join exercises ex on ex.id = ea.exercise_id join lessons le on le.id = ex.lesson_id join chapters ch on ch.id = le.chapter_id where ch.curriculum_id = c.id) as nb_exercise_attempts,
  (select count(*) from competency_progress cp join competencies comp on comp.id = cp.competency_id join domains d on d.id = comp.domain_id where d.curriculum_id = c.id) as nb_competency_progress
from curriculums c
order by c.created_at;

-- 4) Cas connu à vérifier en priorité (trouvé lors de l'analyse
-- statique du code, PAS encore confirmé en base) : le fichier
-- scripts/import-6e-svt.backup.ts est une ancienne version de
-- scripts/import-6e-svt.ts (contenu identique mais mal encodé —
-- "DÃ©couverte" au lieu de "Découverte" — signe qu'il a été remplacé).
-- Contrairement au script actuel qui cible un CURRICULUM_ID fixe
-- ("ff89b282-ab13-41f1-a5b7-923d1e935749"), le script .backup crée/
-- retrouve son curriculum par TITRE ("Programme de SVT - 6e") +
-- VERSION. Si ce script .backup a un jour été exécuté contre la base
-- réelle, il a pu créer un DEUXIÈME curriculum SVT 6e distinct de
-- celui utilisé aujourd'hui. Vérifier spécifiquement :
select id, title, version, status, created_at
from curriculums
where lower(title) like '%svt%6e%' or lower(title) like '%svt%– programme sénégalais%' or id = 'ff89b282-ab13-41f1-a5b7-923d1e935749'
order by created_at;
