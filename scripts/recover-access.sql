-- ============================================================
-- Récupération d'accès — à exécuter dans le SQL Editor Supabase
-- ============================================================
-- Remplace 'TON_EMAIL_ICI' par l'email du compte bloqué.

-- 1. Vérifier l'état actuel du compte et de son rattachement
select p.id, p.email, p.role, sm.id as membership_id, sm.school_id, sm.role as school_role, sm.status
from profiles p
left join school_members sm on sm.profile_id = p.id
where p.email = 'TON_EMAIL_ICI';

-- 2. Réactiver le rattachement école (si status = 'inactive')
update school_members
set status = 'active'
where profile_id = (select id from profiles where email = 'TON_EMAIL_ICI');

-- 3. Si la ligne a été SUPPRIMÉE (removeSchoolMemberAction / "Retirer"),
--    il faut la recréer — remplace SCHOOL_ID_ICI par l'id de l'école
--    (visible dans /admin/schools) et ROLE_ICI par 'student',
--    'teacher' ou 'school_admin' :
insert into school_members (school_id, profile_id, role, status)
values (
  'SCHOOL_ID_ICI',
  (select id from profiles where email = 'TON_EMAIL_ICI'),
  'ROLE_ICI',
  'active'
)
on conflict (school_id, profile_id) do update set status = 'active', role = excluded.role;

-- 4. Si tu veux aussi remettre profiles.role à sa valeur d'origine
--    (ex: repasser un compte de 'school_admin' à 'st 