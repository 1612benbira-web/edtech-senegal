-- ============================================================
-- Inscription : vérifier un numéro de téléphone AVANT de créer le compte
-- ============================================================
--
-- Un numéro peut être rattaché à un compte de deux façons :
--   - auth.users.phone  (Supabase Auth, enregistré sans le "+")
--   - profiles.phone    (enregistré avec le "+")
-- Le contrôle fait par l'application ne regardait que profiles.phone. Or
-- certains comptes anciens ont un numéro dans auth.users mais pas dans leur
-- profil : pour ces numéros, le contrôle passait, le compte était créé, puis
-- l'association du numéro échouait sur la contrainte users_phone_key
-- (« Error updating user ») et le compte devait être annulé. L'élève
-- recevait alors un e-mail de confirmation pour un compte déjà supprimé.
--
-- Cette fonction répond « ce numéro est-il déjà utilisé ? » en regardant
-- les deux endroits. Elle est appelée UNIQUEMENT par le serveur
-- (service_role), comme complete_registration (0028).

create or replace function is_phone_registered(p_phone text)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
           select 1 from auth.users u
           where u.phone = ltrim(trim(p_phone), '+')
         )
      or exists (
           select 1 from profiles p
           where p.phone in (trim(p_phone), ltrim(trim(p_phone), '+'), '+' || ltrim(trim(p_phone), '+'))
         );
$$;

revoke execute on function is_phone_registered(text) from public, anon, authenticated;
grant  execute on function is_phone_registered(text) to service_role;
