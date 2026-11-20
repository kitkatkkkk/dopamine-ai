begin;

drop trigger if exists mood_entries_touch on public.mood_entries;
drop trigger if exists appointments_touch on public.appointments;
drop trigger if exists profiles_touch on public.profiles;
drop trigger if exists on_auth_user_created on auth.users;
drop trigger if exists psychologist_slots_integrity on public.psychologist_slots;

drop function if exists public.get_institution_summary(text, text);
drop function if exists public.get_shared_mood_entries(uuid);
drop function if exists public.revoke_mood_sharing(uuid);
drop function if exists public.share_mood_entries(uuid, uuid[], boolean);
drop function if exists public.list_assigned_appointments();
drop function if exists public.set_appointment_status(uuid, public.appointment_status);
drop function if exists public.cancel_appointment(uuid);
drop function if exists public.request_appointment(uuid, boolean);
drop function if exists public.list_available_slots();
drop function if exists public.admin_set_staff_role(uuid, public.app_role, text);
drop function if exists public.complete_onboarding(text, public.app_role);
drop function if exists public._revoke_sharing(uuid);
drop function if exists public.my_institution();
drop function if exists public.my_role();
drop function if exists public.slot_integrity();
drop function if exists public.handle_new_user();
drop function if exists public.touch_updated_at();

alter table if exists public.consents
  drop constraint if exists consents_appointment_fk;

drop table if exists public.mood_shares cascade;
drop table if exists public.appointments cascade;
drop table if exists public.consents cascade;
drop table if exists public.psychologist_slots cascade;
drop table if exists public.mood_entries cascade;
drop table if exists public.profiles cascade;
drop table if exists public.institutions cascade;

drop type if exists public.institution_kind cascade;
drop type if exists public.consent_kind cascade;
drop type if exists public.appointment_status cascade;
drop type if exists public.app_role cascade;

commit;
