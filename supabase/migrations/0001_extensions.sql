-- Extensions nécessaires
create extension if not exists "pgcrypto";

-- Fonction générique pour maintenir updated_at à jour
create or replace function set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;
