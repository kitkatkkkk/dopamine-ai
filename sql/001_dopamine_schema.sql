begin;

create type public.app_role           as enum ('student', 'pupil', 'psychologist', 'admin');
create type public.appointment_status as enum ('pending', 'confirmed', 'cancelled');
create type public.consent_kind       as enum ('booking', 'share_mood');
create type public.institution_kind   as enum ('university', 'school');

create table public.institutions (
  id         text primary key check (id ~ '^[a-z0-9]+$'),
  name       text not null,
  kind       public.institution_kind not null,
  created_at timestamptz not null default pg_catalog.now()
);

create table public.profiles (
  id                uuid primary key references auth.users (id) on delete cascade,
  role              public.app_role not null default 'student',
  institution_id    text references public.institutions (id),
  display_name      text check (pg_catalog.char_length(display_name) <= 60),
  membership_locked boolean not null default false,
  created_at        timestamptz not null default pg_catalog.now(),
  updated_at        timestamptz not null default pg_catalog.now(),
  constraint staff_needs_institution
    check (role in ('student', 'pupil') or institution_id is not null)
);
create index profiles_institution_role_idx on public.profiles (institution_id, role);

create table public.mood_entries (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references public.profiles (id) on delete cascade,
  entry_date date not null,
  mood       smallint not null check (mood between 1 and 5),
  factors    text[] not null default '{}' check (pg_catalog.cardinality(factors) <= 10),
  note       text check (pg_catalog.char_length(note) <= 500),
  created_at timestamptz not null default pg_catalog.now(),
  updated_at timestamptz not null default pg_catalog.now(),
  unique (user_id, entry_date)
);
create index mood_entries_date_idx on public.mood_entries (entry_date);

create table public.psychologist_slots (
  id              uuid primary key default gen_random_uuid(),
  psychologist_id uuid not null references public.profiles (id) on delete cascade,
  institution_id  text not null references public.institutions (id),
  starts_at       timestamptz not null,
  ends_at         timestamptz not null,
  created_at      timestamptz not null default pg_catalog.now(),
  check (ends_at > starts_at),
  unique (psychologist_id, starts_at)
);
create index psychologist_slots_inst_idx on public.psychologist_slots (institution_id, starts_at);

create table public.consents (
  id             uuid primary key default gen_random_uuid(),
  user_id        uuid not null references public.profiles (id) on delete cascade,
  kind           public.consent_kind not null,
  appointment_id uuid,
  granted_at     timestamptz not null default pg_catalog.now(),
  revoked_at     timestamptz
);

create table public.appointments (
  id             uuid primary key default gen_random_uuid(),
  user_id        uuid not null references public.profiles (id) on delete cascade,
  institution_id text not null references public.institutions (id),
  slot_id        uuid not null references public.psychologist_slots (id),
  consent_id     uuid not null references public.consents (id),
  status         public.appointment_status not null default 'pending',
  created_at     timestamptz not null default pg_catalog.now(),
  updated_at     timestamptz not null default pg_catalog.now()
);
alter table public.consents
  add constraint consents_appointment_fk
  foreign key (appointment_id) references public.appointments (id) on delete cascade;

create unique index appointments_slot_active_uq
  on public.appointments (slot_id) where status in ('pending', 'confirmed');
create index appointments_user_idx on public.appointments (user_id);

create unique index consents_active_uq
  on public.consents (appointment_id, kind)
  where revoked_at is null and appointment_id is not null;

create table public.mood_shares (
  id            uuid primary key default gen_random_uuid(),
  consent_id    uuid not null references public.consents (id) on delete cascade,
  user_id       uuid not null references public.profiles (id) on delete cascade,
  mood_entry_id uuid not null references public.mood_entries (id) on delete cascade,
  created_at    timestamptz not null default pg_catalog.now(),
  unique (consent_id, mood_entry_id)
);

insert into public.institutions (id, name, kind) values
  ('korkyt',    'Қорқыт Ата атындағы Қызылорда университеті (демо)', 'university'),
  ('bolashak',  'Болашақ университеті (демо)',                       'university'),
  ('school264', '№264 мектеп (Қызылорда, демо)',                     'school'),
  ('school278', '№278 мектеп (Қызылорда, демо)',                     'school'),
  ('school2',   '№2 мектеп (Қызылорда, демо)',                       'school'),
  ('school101', '№101 мектеп (Қызылорда, демо)',                     'school');

create function public.touch_updated_at()
returns trigger language plpgsql set search_path = '' as $$
begin
  new.updated_at := pg_catalog.now();
  return new;
end;
$$;

create trigger mood_entries_touch before update on public.mood_entries
  for each row execute function public.touch_updated_at();
create trigger appointments_touch before update on public.appointments
  for each row execute function public.touch_updated_at();
create trigger profiles_touch before update on public.profiles
  for each row execute function public.touch_updated_at();

create function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = '' as $$
begin
  insert into public.profiles (id) values (new.id) on conflict do nothing;
  return new;
end;
$$;

create trigger on_auth_user_created after insert on auth.users
  for each row execute function public.handle_new_user();

create function public.slot_integrity()
returns trigger language plpgsql security definer set search_path = '' as $$
begin
  if not exists (
    select 1 from public.profiles p
    where p.id = new.psychologist_id
      and p.role = 'psychologist'
      and p.institution_id = new.institution_id
  ) then
    raise exception 'slot_must_belong_to_psychologist_of_same_institution';
  end if;
  return new;
end;
$$;

create trigger psychologist_slots_integrity before insert on public.psychologist_slots
  for each row execute function public.slot_integrity();

create function public.my_role()
returns public.app_role language sql stable security definer set search_path = '' as $$
  select p.role from public.profiles p where p.id = (select auth.uid());
$$;

create function public.my_institution()
returns text language sql stable security definer set search_path = '' as $$
  select p.institution_id from public.profiles p where p.id = (select auth.uid());
$$;

create function public._revoke_sharing(p_appointment_id uuid)
returns void language plpgsql security definer set search_path = '' as $$
begin
  delete from public.mood_shares ms
  using public.consents c
  where ms.consent_id = c.id
    and c.appointment_id = p_appointment_id
    and c.kind = 'share_mood';
  update public.consents
     set revoked_at = pg_catalog.now()
   where appointment_id = p_appointment_id
     and kind = 'share_mood'
     and revoked_at is null;
end;
$$;

alter table public.institutions       enable row level security;
alter table public.profiles           enable row level security;
alter table public.mood_entries       enable row level security;
alter table public.psychologist_slots enable row level security;
alter table public.consents           enable row level security;
alter table public.appointments       enable row level security;
alter table public.mood_shares        enable row level security;

revoke all on all tables in schema public from anon, authenticated;
alter default privileges in schema public revoke all on tables    from anon, authenticated;
alter default privileges in schema public revoke all on functions from anon, authenticated;

grant select on public.institutions to authenticated;
create policy institutions_read on public.institutions
  for select to authenticated using (true);

grant select (id, role, institution_id, display_name, membership_locked, created_at, updated_at)
  on public.profiles to authenticated;
create policy profiles_read_own on public.profiles
  for select to authenticated using (id = (select auth.uid()));

grant select, delete on public.mood_entries to authenticated;
grant insert (user_id, entry_date, mood, factors, note) on public.mood_entries to authenticated;
grant update (mood, factors, note) on public.mood_entries to authenticated;
create policy mood_select_own on public.mood_entries
  for select to authenticated using (user_id = (select auth.uid()));
create policy mood_insert_own on public.mood_entries
  for insert to authenticated
  with check (
    user_id = (select auth.uid())
    and public.my_role() in ('student', 'pupil')
    and public.my_institution() is not null
  );
create policy mood_update_own on public.mood_entries
  for update to authenticated
  using (user_id = (select auth.uid()))
  with check (user_id = (select auth.uid()));
create policy mood_delete_own on public.mood_entries
  for delete to authenticated using (user_id = (select auth.uid()));

grant select, delete on public.psychologist_slots to authenticated;
grant insert (psychologist_id, institution_id, starts_at, ends_at)
  on public.psychologist_slots to authenticated;
create policy slots_select_own on public.psychologist_slots
  for select to authenticated using (psychologist_id = (select auth.uid()));
create policy slots_insert_own on public.psychologist_slots
  for insert to authenticated
  with check (
    psychologist_id = (select auth.uid())
    and public.my_role() = 'psychologist'
    and institution_id = public.my_institution()
  );
create policy slots_delete_own on public.psychologist_slots
  for delete to authenticated using (psychologist_id = (select auth.uid()));

grant select on public.appointments to authenticated;
create policy appointments_select_own on public.appointments
  for select to authenticated using (user_id = (select auth.uid()));

grant select on public.consents to authenticated;
create policy consents_select_own on public.consents
  for select to authenticated using (user_id = (select auth.uid()));

grant select on public.mood_shares to authenticated;
create policy mood_shares_select_own on public.mood_shares
  for select to authenticated using (user_id = (select auth.uid()));

create function public.complete_onboarding(p_institution_id text, p_role public.app_role)
returns public.profiles language plpgsql security definer set search_path = '' as $$
declare
  v_uid  uuid := auth.uid();
  v_kind public.institution_kind;
  v_prof public.profiles;
begin
  if v_uid is null then raise exception 'not_authenticated' using errcode = '28000'; end if;
  if p_role not in ('student', 'pupil') then raise exception 'role_not_allowed' using errcode = '42501'; end if;

  select i.kind into v_kind from public.institutions i where i.id = p_institution_id;
  if not found then raise exception 'unknown_institution'; end if;
  if (p_role = 'pupil') <> (v_kind = 'school') then raise exception 'role_institution_mismatch'; end if;

  update public.profiles
     set role = p_role, institution_id = p_institution_id, membership_locked = true
   where id = v_uid and membership_locked = false and role in ('student', 'pupil')
  returning * into v_prof;
  if not found then raise exception 'membership_locked' using errcode = '42501'; end if;

  return v_prof;
end;
$$;

create function public.admin_set_staff_role(p_user_id uuid, p_role public.app_role, p_institution_id text)
returns void language plpgsql security definer set search_path = '' as $$
begin
  if p_role not in ('psychologist', 'admin') then raise exception 'staff_role_only'; end if;
  update public.profiles
     set role = p_role, institution_id = p_institution_id, membership_locked = true
   where id = p_user_id;
  if not found then raise exception 'profile_not_found'; end if;
end;
$$;

create function public.list_available_slots()
returns table (id uuid, institution_id text, starts_at timestamptz, ends_at timestamptz)
language sql stable security definer set search_path = '' as $$
  select s.id, s.institution_id, s.starts_at, s.ends_at
  from public.psychologist_slots s
  where public.my_role() in ('student', 'pupil')
    and s.institution_id = public.my_institution()
    and s.starts_at > pg_catalog.now()
    and not exists (
      select 1 from public.appointments a
      where a.slot_id = s.id and a.status in ('pending', 'confirmed')
    )
  order by s.starts_at;
$$;

create function public.request_appointment(p_slot_id uuid, p_consent boolean)
returns public.appointments language plpgsql security definer set search_path = '' as $$
declare
  v_uid     uuid := auth.uid();
  v_prof    public.profiles;
  v_slot    public.psychologist_slots;
  v_consent uuid;
  v_appt    public.appointments;
begin
  if v_uid is null then raise exception 'not_authenticated' using errcode = '28000'; end if;
  if p_consent is distinct from true then raise exception 'consent_required'; end if;

  select * into v_prof from public.profiles where id = v_uid;
  if not found or v_prof.role not in ('student', 'pupil') or v_prof.institution_id is null then
    raise exception 'forbidden' using errcode = '42501';
  end if;

  select * into v_slot from public.psychologist_slots where id = p_slot_id for update;
  if not found
     or v_slot.institution_id <> v_prof.institution_id
     or v_slot.starts_at <= pg_catalog.now()
     or exists (select 1 from public.appointments a
                where a.slot_id = v_slot.id and a.status in ('pending', 'confirmed'))
  then
    raise exception 'slot_unavailable';
  end if;

  insert into public.consents (user_id, kind) values (v_uid, 'booking') returning id into v_consent;

  insert into public.appointments (user_id, institution_id, slot_id, consent_id)
  values (v_uid, v_slot.institution_id, v_slot.id, v_consent)
  returning * into v_appt;

  update public.consents set appointment_id = v_appt.id where id = v_consent;
  return v_appt;
exception
  when unique_violation then raise exception 'slot_unavailable';
end;
$$;

create function public.cancel_appointment(p_appointment_id uuid)
returns public.appointments language plpgsql security definer set search_path = '' as $$
declare
  v_uid  uuid := auth.uid();
  v_appt public.appointments;
begin
  if v_uid is null then raise exception 'not_authenticated' using errcode = '28000'; end if;
  update public.appointments
     set status = 'cancelled'
   where id = p_appointment_id and user_id = v_uid and status in ('pending', 'confirmed')
  returning * into v_appt;
  if not found then raise exception 'appointment_not_found'; end if;
  perform public._revoke_sharing(p_appointment_id);
  return v_appt;
end;
$$;

create function public.set_appointment_status(p_appointment_id uuid, p_status public.appointment_status)
returns table (id uuid, status public.appointment_status)
language plpgsql security definer set search_path = '' as $$
declare
  v_id uuid;
  v_st public.appointment_status;
begin
  if auth.uid() is null or public.my_role() is distinct from 'psychologist' then
    raise exception 'forbidden' using errcode = '42501';
  end if;
  if p_status not in ('confirmed', 'cancelled') then raise exception 'invalid_status'; end if;

  update public.appointments a
     set status = p_status
    from public.psychologist_slots s
   where a.id = p_appointment_id
     and s.id = a.slot_id
     and s.psychologist_id = auth.uid()
     and a.status in ('pending', 'confirmed')
  returning a.id, a.status into v_id, v_st;
  if not found then raise exception 'appointment_not_found'; end if;

  if p_status = 'cancelled' then
    perform public._revoke_sharing(p_appointment_id);
  end if;

  return query select v_id, v_st;
end;
$$;

create function public.list_assigned_appointments()
returns table (
  appointment_id        uuid,
  slot_id               uuid,
  starts_at             timestamptz,
  ends_at               timestamptz,
  status                public.appointment_status,
  student_alias         text,
  mood_sharing_active   boolean
)
language sql stable security definer set search_path = '' as $$
  select a.id, s.id, s.starts_at, s.ends_at, a.status,
         coalesce(p.display_name, 'Student ' || pg_catalog.left(a.user_id::text, 4)),
         exists (select 1 from public.consents c
                 where c.appointment_id = a.id and c.kind = 'share_mood' and c.revoked_at is null)
  from public.appointments a
  join public.psychologist_slots s on s.id = a.slot_id
  join public.profiles p on p.id = a.user_id
  where public.my_role() = 'psychologist'
    and s.psychologist_id = (select auth.uid())
  order by s.starts_at;
$$;

create function public.share_mood_entries(p_appointment_id uuid, p_entry_ids uuid[], p_consent boolean)
returns integer language plpgsql security definer set search_path = '' as $$
declare
  v_uid     uuid := auth.uid();
  v_ids     uuid[];
  v_consent uuid;
  v_count   integer;
begin
  if v_uid is null then raise exception 'not_authenticated' using errcode = '28000'; end if;
  if p_consent is distinct from true then raise exception 'consent_required'; end if;

  select pg_catalog.array_agg(distinct x) into v_ids from pg_catalog.unnest(p_entry_ids) as x;
  if v_ids is null or pg_catalog.cardinality(v_ids) > 31 then raise exception 'invalid_entries'; end if;

  if not exists (select 1 from public.appointments a
                 where a.id = p_appointment_id and a.user_id = v_uid
                   and a.status in ('pending', 'confirmed')) then
    raise exception 'appointment_not_found';
  end if;

  select count(*) into v_count from public.mood_entries m
   where m.user_id = v_uid and m.id = any (v_ids);
  if v_count <> pg_catalog.cardinality(v_ids) then raise exception 'invalid_entries'; end if;

  select c.id into v_consent from public.consents c
   where c.appointment_id = p_appointment_id and c.kind = 'share_mood' and c.revoked_at is null;
  if v_consent is null then
    insert into public.consents (user_id, kind, appointment_id)
    values (v_uid, 'share_mood', p_appointment_id) returning id into v_consent;
  end if;

  insert into public.mood_shares (consent_id, user_id, mood_entry_id)
  select v_consent, v_uid, x from pg_catalog.unnest(v_ids) as x
  on conflict do nothing;

  return v_count;
end;
$$;

create function public.revoke_mood_sharing(p_appointment_id uuid)
returns void language plpgsql security definer set search_path = '' as $$
begin
  if auth.uid() is null then raise exception 'not_authenticated' using errcode = '28000'; end if;
  if not exists (select 1 from public.appointments a
                 where a.id = p_appointment_id and a.user_id = auth.uid()) then
    raise exception 'appointment_not_found';
  end if;
  perform public._revoke_sharing(p_appointment_id);
end;
$$;

create function public.get_shared_mood_entries(p_appointment_id uuid)
returns table (entry_date date, mood smallint, factors text[])
language sql stable security definer set search_path = '' as $$
  select m.entry_date, m.mood, m.factors
  from public.appointments a
  join public.psychologist_slots s on s.id = a.slot_id
  join public.consents c on c.appointment_id = a.id and c.kind = 'share_mood' and c.revoked_at is null
  join public.mood_shares ms on ms.consent_id = c.id
  join public.mood_entries m on m.id = ms.mood_entry_id
  where a.id = p_appointment_id
    and a.status in ('pending', 'confirmed')
    and public.my_role() = 'psychologist'
    and s.psychologist_id = (select auth.uid())
  order by m.entry_date;
$$;

create function public.get_institution_summary(p_institution_id text, p_view text default 'overall_30d')
returns table (bucket text, participant_band text, avg_mood numeric, suppressed boolean)
language plpgsql stable security definer set search_path = '' as $$
declare
  v_uid  uuid := auth.uid();
  v_role public.app_role;
  v_inst text;
  v_days integer;
begin
  select p.role, p.institution_id into v_role, v_inst from public.profiles p where p.id = v_uid;
  if v_uid is null or v_role is distinct from 'admin' or v_inst is distinct from p_institution_id then
    raise exception 'forbidden' using errcode = '42501';
  end if;

  if p_view = 'weekly_28d' then
    return query
      select ('week_' || (4 - g.w))::text,
             case when s.n < 20 then null
                  when s.n >= 40 then '40+'
                  else ((s.n / 10) * 10)::text || '-' || ((s.n / 10) * 10 + 9)::text end,
             case when s.n >= 20 then pg_catalog.round(s.a, 1) end,
             s.n < 20
      from pg_catalog.generate_series(3, 0, -1) as g(w)
      cross join lateral (
        select count(distinct m.user_id)::integer as n, avg(m.mood) as a
        from public.mood_entries m
        join public.profiles p on p.id = m.user_id
        where p.institution_id = v_inst
          and p.role in ('student', 'pupil')
          and m.entry_date between current_date - (7 * g.w + 6) and current_date - (7 * g.w)
      ) s;
    return;
  elsif p_view = 'overall_7d' then
    v_days := 7;
  elsif p_view = 'overall_30d' then
    v_days := 30;
  else
    raise exception 'invalid_view';
  end if;

  return query
    select 'overall'::text,
           case when s.n < 20 then null
                when s.n >= 40 then '40+'
                else ((s.n / 10) * 10)::text || '-' || ((s.n / 10) * 10 + 9)::text end,
           case when s.n >= 20 then pg_catalog.round(s.a, 1) end,
           s.n < 20
    from (
      select count(distinct m.user_id)::integer as n, avg(m.mood) as a
      from public.mood_entries m
      join public.profiles p on p.id = m.user_id
      where p.institution_id = v_inst
        and p.role in ('student', 'pupil')
        and m.entry_date between current_date - (v_days - 1) and current_date
    ) s;
end;
$$;

revoke execute on all functions in schema public from public, anon, authenticated;

grant execute on function
  public.my_role(),
  public.my_institution(),
  public.complete_onboarding(text, public.app_role),
  public.list_available_slots(),
  public.request_appointment(uuid, boolean),
  public.cancel_appointment(uuid),
  public.set_appointment_status(uuid, public.appointment_status),
  public.list_assigned_appointments(),
  public.share_mood_entries(uuid, uuid[], boolean),
  public.revoke_mood_sharing(uuid),
  public.get_shared_mood_entries(uuid),
  public.get_institution_summary(text, text)
to authenticated;

grant execute on function public.admin_set_staff_role(uuid, public.app_role, text) to service_role;

commit;
