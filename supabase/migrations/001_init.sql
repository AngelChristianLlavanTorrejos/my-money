-- Licenses only. Does not create profiles or change accounts / transactions.
-- Run in the Supabase SQL Editor.
--
-- Names are written to existing public.personal_information
-- (first_name, middle_name, last_name, user_id).
--
-- Confirm email: if ON, signUp has no session until the user clicks the email
-- link, so license claim cannot happen in the same step. Turn it OFF for this
-- phase, or leave it ON and claim later after confirmed login.

create table if not exists public.licenses (
  id uuid primary key default gen_random_uuid(),
  license_key text not null,
  status text not null default 'available'
    check (status in ('available', 'claimed', 'revoked')),
  user_id uuid unique references auth.users (id) on delete set null,
  claimed_at timestamptz,
  created_at timestamptz not null default now(),
  constraint licenses_license_key_unique unique (license_key)
);

alter table public.licenses enable row level security;

revoke all on public.licenses from anon, authenticated, public;

-- No policies: the app cannot read or write license rows directly.

create or replace function public.validate_license(p_key text)
returns text
language plpgsql
security definer
set search_path = public
as $$
declare
  normalized text;
  rec public.licenses%rowtype;
begin
  normalized := upper(trim(coalesce(p_key, '')));

  if normalized = '' then
    return 'invalid';
  end if;

  select * into rec
  from public.licenses
  where license_key = normalized;

  if not found then
    return 'invalid';
  end if;

  return rec.status;
end;
$$;

create or replace function public.complete_onboarding(
  p_license_key text,
  p_first_name text default null,
  p_middle_name text default null,
  p_last_name text default null,
  p_platform text default null
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  uid uuid := auth.uid();
  normalized text;
  first_name_value text;
  last_name_value text;
  middle_name_value text;
  rec public.licenses%rowtype;
  claimed_id uuid;
  updated_count integer;
begin
  if uid is null then
    raise exception 'NOT_AUTHENTICATED' using errcode = 'P0001';
  end if;

  normalized := upper(trim(coalesce(p_license_key, '')));

  if normalized = '' then
    raise exception 'INVALID_LICENSE' using errcode = 'P0001';
  end if;

  first_name_value := trim(coalesce(p_first_name, ''));
  last_name_value := trim(coalesce(p_last_name, ''));
  middle_name_value := nullif(trim(coalesce(p_middle_name, '')), '');

  if first_name_value <> '' and last_name_value <> '' then
    update public.personal_information
    set
      first_name = first_name_value,
      middle_name = middle_name_value,
      last_name = last_name_value
    where user_id = uid;

    get diagnostics updated_count = row_count;

    if updated_count = 0 then
      insert into public.personal_information (
        user_id,
        first_name,
        middle_name,
        last_name
      )
      values (
        uid,
        first_name_value,
        middle_name_value,
        last_name_value
      );
    end if;
  end if;

  select * into rec
  from public.licenses
  where license_key = normalized;

  if not found then
    raise exception 'INVALID_LICENSE' using errcode = 'P0001';
  end if;

  if rec.status = 'revoked' then
    raise exception 'LICENSE_REVOKED' using errcode = 'P0001';
  end if;

  if rec.user_id = uid then
    return jsonb_build_object('ok', true, 'status', 'claimed');
  end if;

  if rec.user_id is not null or rec.status = 'claimed' then
    raise exception 'LICENSE_ALREADY_CLAIMED' using errcode = 'P0001';
  end if;

  if exists (
    select 1
    from public.licenses
    where user_id = uid
      and license_key <> normalized
  ) then
    raise exception 'USER_HAS_LICENSE' using errcode = 'P0001';
  end if;

  update public.licenses
  set
    user_id = uid,
    status = 'claimed',
    claimed_at = now()
  where license_key = normalized
    and status = 'available'
    and user_id is null
  returning id into claimed_id;

  if claimed_id is null then
    raise exception 'LICENSE_ALREADY_CLAIMED' using errcode = 'P0001';
  end if;

  return jsonb_build_object('ok', true, 'status', 'claimed');
end;
$$;

revoke all on function public.validate_license(text) from public;
grant execute on function public.validate_license(text) to anon, authenticated;

revoke all on function public.complete_onboarding(text, text, text, text, text) from public;
grant execute on function public.complete_onboarding(text, text, text, text, text) to authenticated;

insert into public.licenses (license_key, status)
values
  ('LICENSE-ABCD-1234', 'available'),
  ('LICENSE-EFGH-5678', 'available'),
  ('LICENSE-IJKL-9012', 'available')
on conflict (license_key) do nothing;
