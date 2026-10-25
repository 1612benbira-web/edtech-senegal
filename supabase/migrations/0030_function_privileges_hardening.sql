-- ============================================================
-- Durcissement des droits d'exécution des fonctions SQL
-- ============================================================
-- Constat (analyse de sécurité Supabase) : des fonctions SECURITY DEFINER du
-- schéma public sont appelables par n'importe qui via /rest/v1/rpc, y compris
-- sans être connecté. Toutes celles qui créent/suppriment des données
-- vérifient déjà les droits de l'appelant en interne (is_admin(),
-- is_school_admin()) : aucune faille exploitable. On referme malgré tout
-- l'accès inutile (défense en profondeur).
--
-- NON touchés : les fonctions utilisées par les règles d'accès (RLS)
-- — is_admin, is_school_*, is_assigned_teacher_*, curriculum_visible_*, etc. —
-- car les règles s'exécutent avec les droits de l'utilisateur et en ont besoin.

-- 1) Helper interne : appelé uniquement depuis les fonctions de suppression
--    (qui s'exécutent avec les droits du propriétaire), jamais par l'application.
--    Il renvoie des identifiants de contenu sans contrôle de droits.
revoke execute on function curriculum_cascade_ids(uuid) from public, anon, authenticated;
grant  execute on function curriculum_cascade_ids(uuid) to service_role;

-- 2) Fonctions réservées aux administrateurs / responsables : appelées par
--    l'application avec la session d'un utilisateur CONNECTÉ ; l'accès anonyme
--    n'a aucun usage légitime. Les contrôles internes restent en place.
revoke execute on function create_school_with_admin(text, text, text, uuid) from public, anon;
revoke execute on function delete_curriculum_cascade(uuid)                  from public, anon;
revoke execute on function delete_level_cascade(uuid)                       from public, anon;
revoke execute on function fan_out_message_notifications(uuid)              from public, anon;
revoke execute on function get_curriculum_deletion_impact(uuid)             from public, anon;
revoke execute on function get_level_deletion_impact(uuid)                  from public, anon;

grant execute on function create_school_with_admin(text, text, text, uuid) to authenticated, service_role;
grant execute on function delete_curriculum_cascade(uuid)                  to authenticated, service_role;
grant execute on function delete_level_cascade(uuid)                       to authenticated, service_role;
grant execute on function fan_out_message_notifications(uuid)              to authenticated, service_role;
grant execute on function get_curriculum_deletion_impact(uuid)             to authenticated, service_role;
grant execute on function get_level_deletion_impact(uuid)                  to authenticated, service_role;

-- 3) search_path figé sur les 4 fonctions signalées (évite le détournement
--    par un schéma placé avant public dans le chemin de recherche).
alter function set_updated_at()                set search_path = public;
alter function check_curriculum_publishable()  set search_path = public;
alter function check_chapter_publishable()     set search_path = public;
alter function check_lesson_publishable()      set search_path = public;
