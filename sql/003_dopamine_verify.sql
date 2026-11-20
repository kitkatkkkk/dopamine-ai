select id, name, kind
from public.institutions
order by kind, id;

select i.id as institution_id,
       i.kind,
       count(distinct p.id) filter (where p.role in ('student', 'pupil')) as participants,
       count(distinct p.id) filter (where p.role = 'psychologist')        as psychologists,
       count(m.id)                                                      as mood_entries,
       count(distinct s.id)                                             as slots
from public.institutions i
left join public.profiles p on p.institution_id = i.id
left join public.mood_entries m on m.user_id = p.id
left join public.psychologist_slots s on s.institution_id = i.id
group by i.id, i.kind
order by i.kind, i.id;

begin;
select pg_catalog.set_config(
  'request.jwt.claim.sub',
  (select id::text from auth.users where email = 'demo-participant-korkyt-01@seed.dopamine.invalid' limit 1),
  true
);
set local role authenticated;
select count(*) as available_slots_for_korkyt_student from public.list_available_slots();
reset role;
rollback;

begin;
insert into auth.users (instance_id, id, aud, role, email, raw_app_meta_data, raw_user_meta_data, created_at, updated_at)
values (
  '00000000-0000-0000-0000-000000000000'::uuid,
  '11111111-1111-1111-1111-111111111111'::uuid,
  'authenticated',
  'authenticated',
  'temp-admin-korkyt@seed.dopamine.invalid',
  '{"provider":"email","providers":["email"]}'::jsonb,
  '{}'::jsonb,
  pg_catalog.now(),
  pg_catalog.now()
)
on conflict (id) do nothing;

select public.admin_set_staff_role(
  '11111111-1111-1111-1111-111111111111'::uuid,
  'admin'::public.app_role,
  'korkyt'
);

select pg_catalog.set_config('request.jwt.claim.sub', '11111111-1111-1111-1111-111111111111', true);
set local role authenticated;
select * from public.get_institution_summary('korkyt', 'overall_30d');
select * from public.get_institution_summary('korkyt', 'weekly_28d');
reset role;
rollback;
