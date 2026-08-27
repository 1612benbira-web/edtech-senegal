alter table profiles add column if not exists phone text;
create unique index if not exists profiles_phone_unique on profiles(phone) where phone is not null;
