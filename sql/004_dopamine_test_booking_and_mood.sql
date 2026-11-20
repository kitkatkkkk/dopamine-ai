begin;

-- This script uses fictional seed accounts. Run schema and seed scripts first.
-- It rolls back every booking and consent created during this smoke test.

do $$
declare
  v_student_id uuid;
  v_psychologist_id uuid;
  v_slot_id uuid;
  v_mood_ids text;
begin
  select id into v_student_id from auth.users where email = 'demo-participant-korkyt-01@seed.dopamine.invalid';
  select id into v_psychologist_id from auth.users where email = 'demo-psychologist-korkyt-00@seed.dopamine.invalid';
  select s.id into v_slot_id
  from public.psychologist_slots s
  where s.institution_id = 'korkyt' and s.starts_at > pg_catalog.now()
    and not exists (select 1 from public.appointments a where a.slot_id = s.id and a.status in ('pending', 'confirmed'))
  order by s.starts_at limit 1;
  select pg_catalog.array_agg(m.id)::text into v_mood_ids
  from (select id from public.mood_entries where user_id = v_student_id order by entry_date desc limit 3) m;
  if v_student_id is null or v_psychologist_id is null then raise exception 'seed_accounts_missing: run sql/002_dopamine_seed_demo.sql first'; end if;
  if v_slot_id is null then raise exception 'no_free_future_slot: rerun seed or choose another demo slot'; end if;
  if v_mood_ids is null then raise exception 'seed_mood_entries_missing: run sql/002_dopamine_seed_demo.sql first'; end if;
  perform pg_catalog.set_config('dopamine.test_student_id', v_student_id::text, true);
  perform pg_catalog.set_config('dopamine.test_psychologist_id', v_psychologist_id::text, true);
  perform pg_catalog.set_config('dopamine.test_slot_id', v_slot_id::text, true);
  perform pg_catalog.set_config('dopamine.test_mood_ids', v_mood_ids, true);
end;
$$;

-- Student books an available slot with explicit booking consent.
select pg_catalog.set_config('request.jwt.claim.sub', pg_catalog.current_setting('dopamine.test_student_id', true), true);
set local role authenticated;
select pg_catalog.set_config('dopamine.test_appt_id', a.id::text, true) as created_appointment_id
from public.request_appointment(pg_catalog.current_setting('dopamine.test_slot_id', true)::uuid, true) as a;
select id, status, slot_id, consent_id from public.appointments where id = pg_catalog.current_setting('dopamine.test_appt_id', true)::uuid;
reset role;

-- Student explicitly shares selected mood entries for this appointment.
select pg_catalog.set_config('request.jwt.claim.sub', pg_catalog.current_setting('dopamine.test_student_id', true), true);
set local role authenticated;
select public.share_mood_entries(pg_catalog.current_setting('dopamine.test_appt_id', true)::uuid, pg_catalog.current_setting('dopamine.test_mood_ids', true)::uuid[], true) as shared_entries_count;
reset role;

-- Assigned psychologist can see the appointment and explicitly shared entries.
select pg_catalog.set_config('request.jwt.claim.sub', pg_catalog.current_setting('dopamine.test_psychologist_id', true), true);
set local role authenticated;
select appointment_id, status, student_alias, mood_sharing_active
from public.list_assigned_appointments()
where appointment_id = pg_catalog.current_setting('dopamine.test_appt_id', true)::uuid;
select entry_date, mood, factors
from public.get_shared_mood_entries(pg_catalog.current_setting('dopamine.test_appt_id', true)::uuid);
reset role;

-- Student revokes optional sharing; the psychologist should then receive no mood rows.
select pg_catalog.set_config('request.jwt.claim.sub', pg_catalog.current_setting('dopamine.test_student_id', true), true);
set local role authenticated;
select public.revoke_mood_sharing(pg_catalog.current_setting('dopamine.test_appt_id', true)::uuid);
reset role;
select pg_catalog.set_config('request.jwt.claim.sub', pg_catalog.current_setting('dopamine.test_psychologist_id', true), true);
set local role authenticated;
select entry_date, mood, factors
from public.get_shared_mood_entries(pg_catalog.current_setting('dopamine.test_appt_id', true)::uuid);
reset role;
rollback;