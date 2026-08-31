-- ============================================================
-- Script de test manuel — multi-écoles (à exécuter après migration)
-- ============================================================
--
-- À exécuter dans le SQL editor de Supabase (ou psql), APRÈS avoir
-- appliqué 0017_multi_school.sql et 0018_multi_school_rls.sql.
--
-- Ce script utilise le rôle postgres/service_role (il contourne la RLS
-- pour PRÉPARER les données de test). Les vérifications de cloisonnement
-- elles-mêmes doivent être faites en se connectant réellement dans
-- l'application avec les comptes Élève A / Élève B créés manuellement
-- (la RLS ne peut pas être testée depuis ce script car auth.uid()
-- n'existe que dans une vraie session authentifiée).

-- 1. Créer deux écoles de test
insert into schools (name, slug, code) values
  ('École TEST A', 'ecole-test-a', 'ECOLE-A-2026'),
  ('École TEST B', 'ecole-test-b', 'ECOLE-B-2026')
on conflict (code) do nothing;

-- 2. Repérer le curriculum SVT 6e déjà importé (script import-6e-svt.ts)
--    et l'activer pour l'École A uniquement dans un premier temps.
with svt as (
  select id from curriculums where title ilike '%SVT%6e%' and status = 'published' limit 1
),
school_a as (select id from schools where code = 'ECOLE-A-2026'),
school_b as (select id from schools where code = 'ECOLE-B-2026')
insert into school_curriculums (school_id, curriculum_id, enabled)
select school_a.id, svt.id, true from school_a, svt
union all
select school_b.id, svt.id, true from school_b, svt
on conflict (school_id, curriculum_id) do update set enabled = excluded.enabled;

-- 3. Créer les comptes "Élève A" et "Élève B" via Supabase Auth d'abord
--    (dashboard Supabase > Authentication > Add user, ou l'écran
--    d'inscription de l'app avec le code ECOLE-A-2026 / ECOLE-B-2026 —
--    RECOMMANDÉ : utiliser directement le formulaire d'inscription de
--    l'app avec le champ "Code établissement" renseigné, ce qui teste
--    en même temps le rattachement automatique implémenté dans
--    registerAction). Si les comptes existent déjà, rattacher
--    manuellement :
--
-- insert into school_members (school_id, profile_id, role)
-- select s.id, p.id, 'student'
-- from schools s, profiles p
-- where s.code = 'ECOLE-A-2026' and p.email = 'eleveA@test.sn'
-- on conflict (school_id, profile_id) do nothing;

-- 4. Vérification attendue (à faire en se connectant dans l'app) :
--    - Élève A voit "SVT 6e" dans son programme, avec 17 leçons.
--    - Élève B voit "SVT 6e" dans son programme (activé aussi pour B à
--      l'étape 2), avec 17 leçons.

-- 5. Désactiver SVT 6e pour l'École B uniquement :
update school_curriculums sc
set enabled = false
from schools s
where sc.school_id = s.id and s.code = 'ECOLE-B-2026'
  and sc.curriculum_id = (select id from curriculums where title ilike '%SVT%6e%' limit 1);

-- 6. Résultat attendu (reconnecte-toi ou rafraîchis /dashboard) :
--    - Élève A : SVT 6e toujours visible (école A inchangée).
--    - Élève B : SVT 6e disparaît du dashboard/programme (getMyProgramme
--      renvoie curriculumId: null pour cette matière) ; un accès direct
--      par URL à une leçon/exercice de ce curriculum renvoie 404
--      (voir la vérification ajoutée dans lesson/[lessonId]/page.tsx et
--      exercise/[exerciseId]/page.tsx).
--    - Le curriculum SVT 6e lui-même existe toujours dans `curriculums`
--      (vérifier : select status from curriculums where id = ...) — il
--      n'a jamais été supprimé, seule la relation school_curriculums a
--      été désactivée.

-- 7. Test cross-school (à faire avec les comptes school_admin) :
--    Créer un membre school_admin pour l'école A :
--
-- insert into school_members (school_id, profile_id, role)
-- select s.id, p.id, 'school_admin'
-- from schools s, profiles p
-- where s.code = 'ECOLE-A-2026' and p.email = 'adminA@test.sn'
-- on conflict (school_id, profile_id) do update set role = 'school_admin';
--
-- update profiles set role = 'school_admin' where email = 'adminA@test.sn';
--
--    Puis, connecté en tant qu'adminA@test.sn dans l'app :
--    - /admin/schools/<id_ecole_A> doit être accessible.
--    - /admin/schools/<id_ecole_B> doit renvoyer une erreur d'accès
--      (requireSchoolAccess lève NotSchoolAdminError, capturée par
--      app/admin/error.tsx).
--    - La page membres de l'école A ne doit jamais afficher les élèves
--      de l'école B (vérifié par la policy RLS school_members_select).
