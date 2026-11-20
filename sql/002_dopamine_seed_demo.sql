begin;

delete from auth.users where email like '%@seed.dopamine.invalid';

create temp table seed_people on commit drop as
with raw_people as (
  select pg_catalog.md5('dopamine-seed:' || i.id || ':' || n) as h,
         i.id   as institution_id,
         i.kind as kind,
         'participant'::text as person,
         n
  from public.institutions i
  cross join pg_catalog.generate_series(1, 24) as n
  union all
  select pg_catalog.md5('dopamine-seed-psy:' || i.id) as h,
         i.id,
         i.kind,
         'psychologist'::text,
         0
  from public.institutions i
)
select (
         pg_catalog.substr(h, 1, 8) || '-' ||
         pg_catalog.substr(h, 9, 4) || '-' ||
         pg_catalog.substr(h, 13, 4) || '-' ||
         pg_catalog.substr(h, 17, 4) || '-' ||
         pg_catalog.substr(h, 21, 12)
       )::uuid as id,
       institution_id,
       kind,
       person,
       n
from raw_people;

insert into auth.users (instance_id, id, aud, role, email, raw_app_meta_data, raw_user_meta_data, created_at, updated_at)
select '00000000-0000-0000-0000-000000000000'::uuid,
       s.id,
       'authenticated',
       'authenticated',
       'demo-' || s.person || '-' || s.institution_id || '-' || pg_catalog.lpad(s.n::text, 2, '0') || '@seed.dopamine.invalid',
       '{"provider":"email","providers":["email"]}'::jsonb,
       '{"seed":true}'::jsonb,
       pg_catalog.now(),
       pg_catalog.now()
from seed_people s;

update public.profiles p
   set institution_id    = s.institution_id,
       role              = case
                             when s.person = 'psychologist' then 'psychologist'::public.app_role
                             when s.kind = 'school'         then 'pupil'::public.app_role
                             else 'student'::public.app_role
                           end,
       display_name      = case
                             when s.person = 'psychologist' then 'Demo psychologist (' || s.institution_id || ')'
                             else 'Demo participant ' || pg_catalog.lpad(s.n::text, 2, '0')
                           end,
       membership_locked = true
  from seed_people s
 where p.id = s.id;

insert into public.mood_entries (user_id, entry_date, mood, factors)
select s.id,
       current_date - d,
       (1 + ((pg_catalog.hashtext(s.id::text || ':m:' || d) & 2147483647) % 5))::smallint,
       array[(array['study', 'sleep', 'social', 'family', 'health'])
             [1 + ((pg_catalog.hashtext(s.id::text || ':f:' || d) & 2147483647) % 5)]]
from seed_people s
cross join pg_catalog.generate_series(0, 27) as d
where s.person = 'participant'
  and (d + s.n) % 2 = 0;

insert into public.psychologist_slots (psychologist_id, institution_id, starts_at, ends_at)
select s.id,
       s.institution_id,
       pg_catalog.date_trunc('day', pg_catalog.now()) + pg_catalog.make_interval(days => d, hours => h),
       pg_catalog.date_trunc('day', pg_catalog.now()) + pg_catalog.make_interval(days => d, hours => h + 1)
from seed_people s
cross join pg_catalog.generate_series(1, 3) as d
cross join (values (4), (6), (9)) as hh(h)
where s.person = 'psychologist';

commit;
