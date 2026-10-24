-- ============================================================
-- Inscription atomique : profil + rattachement à l'école en UNE transaction
-- ============================================================
-- Avant : signUp, puis plusieurs appels séparés (profil, téléphone, école)
-- dont les échecs laissaient un compte à moitié créé. Le trigger
-- handle_new_user() ne copie que (id, email) : les noms/téléphone et l'école
-- sont donc complétés ici, d'un bloc. Toute exception annule tout.
--
-- Appelée UNIQUEMENT par le serveur (service_role), juste après signUp.
-- Le code établissement est re-validé ici (école active) : on ne fait jamais
-- confiance à un identifiant d'école venant du client.

create or replace function complete_registration(
  p_user_id     uuid,
  p_first_name  text,
  p_last_name   text,
  p_phone       text,
  p_school_code text
)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_school_id uuid;
  v_first     text;
begin
  select first_name into v_first from profiles where id = p_user_id;
  if not found then
    raise exception 'PROFILE_NOT_FOUND';
  end if;
  -- Un profil déjà complété n'est pas un compte tout juste créé : on refuse.
  if v_first is not null then
    raise exception 'ALREADY_COMPLETED';
  end if;

  if p_school_code is not null and length(trim(p_school_code)) > 0 then
    select id into v_school_id
    from schools
    where code = upper(trim(p_school_code)) and status = 'active';
    if v_school_id is null then
      raise exception 'SCHOOL_NOT_FOUND';
    end if;
  end if;

  begin
    update profiles
       set first_name = p_first_name,
           last_name  = p_last_name,
           phone      = nullif(trim(p_phone), '')
     where id = p_user_id;
  exception when unique_violation then
    raise exception 'PHONE_TAKEN';
  end;

  if v_school_id is not null then
    insert into school_members (school_id, profile_id, role, status)
    values (v_school_id, p_user_id, 'student', 'active')
    on conflict (school_id, profile_id) do nothing;
  end if;
end;
$$;

revoke execute on function complete_registration(uuid, text, text, text, text) from public, anon, authenticated;
grant  execute on function complete_registration(uuid, text, text, text, text) to service_role;
