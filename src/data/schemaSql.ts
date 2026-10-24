export const FAUCETFLOW_SQL_SCRIPT = `-- ====================================================================
-- FaucetFlow Complete PostgreSQL Schema for Supabase
-- Run this script in: Supabase Dashboard -> SQL Editor -> New Query
-- ====================================================================

-- 1. Enable Cryptographic Extensions
create extension if not exists pgcrypto;

-- 2. User Profiles Table
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  username text unique,
  referrer_id uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now()
);

-- 3. Multi-Coin Balances Table (BTC, LTC, DOGE, USDT)
create table if not exists public.balances (
  user_id uuid not null references auth.users(id) on delete cascade,
  coin text not null check (coin in ('BTC','LTC','DOGE','USDT')),
  amount numeric(28,12) not null default 0 check (amount >= 0),
  updated_at timestamptz not null default now(),
  primary key (user_id, coin)
);

-- 4. Reward Claims Ledger Table
create table if not exists public.claims (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  coin text not null check (coin in ('BTC','LTC','DOGE','USDT')),
  amount numeric(28,12) not null check (amount > 0),
  claimed_at timestamptz not null default now()
);

-- 4b. 10% Referral Claims Ledger Table
create table if not exists public.referral_claims (
  id uuid primary key default gen_random_uuid(),
  referrer_id uuid not null references auth.users(id) on delete cascade,
  referee_id uuid not null references auth.users(id) on delete cascade,
  coin text not null check (coin in ('BTC','LTC','DOGE','USDT')),
  amount numeric(28,12) not null check (amount > 0),
  claimed_at timestamptz not null default now()
);

-- 5. Enable Row Level Security (RLS)
alter table public.profiles enable row level security;
alter table public.balances enable row level security;
alter table public.claims enable row level security;
alter table public.referral_claims enable row level security;

-- 6. Read Policies (Owner or Admin)
drop policy if exists "profiles are viewable by owner" on public.profiles;
drop policy if exists "profiles are viewable by owner or admin" on public.profiles;
create policy "profiles are viewable by owner or admin" on public.profiles
for select to authenticated using (auth.uid() = id or public.is_admin());

drop policy if exists "balances are viewable by owner" on public.balances;
drop policy if exists "balances are viewable by owner or admin" on public.balances;
create policy "balances are viewable by owner or admin" on public.balances
for select to authenticated using (auth.uid() = user_id or public.is_admin());

drop policy if exists "claims are viewable by owner" on public.claims;
drop policy if exists "claims are viewable by owner or admin" on public.claims;
create policy "claims are viewable by owner or admin" on public.claims
for select to authenticated using (auth.uid() = user_id or public.is_admin());

drop policy if exists "referral claims are viewable by referrer or admin" on public.referral_claims;
create policy "referral claims are viewable by referrer or admin" on public.referral_claims
for select to authenticated using (auth.uid() = referrer_id or auth.uid() = referee_id or public.is_admin());

-- Notice: Direct client insert/update/delete policies are intentionally prohibited.
-- All balance mutations must execute via the SECURITY DEFINER RPC functions below.

-- 7. Trigger: Automatically initialize profile & balances on user signup
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  safe_username text;
  safe_referrer_id uuid;
begin
  safe_username := nullif(trim(new.raw_user_meta_data ->> 'username'), '');
  safe_referrer_id := nullif(trim(new.raw_user_meta_data ->> 'referrer_id'), '')::uuid;

  insert into public.profiles (id, username, referrer_id)
  values (new.id, safe_username, safe_referrer_id)
  on conflict (id) do update set
    username = coalesce(excluded.username, public.profiles.username),
    referrer_id = coalesce(excluded.referrer_id, public.profiles.referrer_id);

  insert into public.balances (user_id, coin, amount)
  values
    (new.id, 'BTC', 0),
    (new.id, 'LTC', 0),
    (new.id, 'DOGE', 0),
    (new.id, 'USDT', 0)
  on conflict (user_id, coin) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute procedure public.handle_new_user();

-- 8. Core Faucet Claim RPC Function (with 60s Cooldown, Advisory Locks & 10% Referral Bonus)
create or replace function public.claim_reward(p_coin text)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  uid uuid := auth.uid();
  reward numeric(28,12);
  last_claim timestamptz;
  ref_id uuid;
  ref_bonus numeric(28,12);
begin
  if uid is null then
    raise exception 'Please sign in before claiming.';
  end if;
  if p_coin not in ('BTC','LTC','DOGE','USDT') then
    raise exception 'Unsupported coin.';
  end if;

  -- Serializes claim attempts for the same user to prevent cooldown race conditions.
  perform pg_advisory_xact_lock(hashtextextended(uid::text || ':' || p_coin, 0));

  select max(claimed_at) into last_claim
  from public.claims where user_id = uid and coin = p_coin;

  if last_claim is not null and last_claim > now() - interval '60 seconds' then
    raise exception 'Please wait before making another claim for this coin.';
  end if;

  reward := case p_coin
    when 'BTC' then 0.00000001
    when 'LTC' then 0.00000100
    when 'DOGE' then 0.00001000
    when 'USDT' then 0.00010000
  end;

  -- 1. Payout to user
  insert into public.balances(user_id, coin, amount)
  values(uid, p_coin, reward)
  on conflict(user_id, coin)
  do update set amount = public.balances.amount + excluded.amount, updated_at = now();

  insert into public.claims(user_id, coin, amount) values(uid, p_coin, reward);

  -- 2. 10% Referral Commission Payout to Referrer
  select referrer_id into ref_id from public.profiles where id = uid;
  if ref_id is not null and ref_id <> uid then
    ref_bonus := round(reward * 0.10, 12);
    if ref_bonus > 0 then
      insert into public.balances(user_id, coin, amount)
      values(ref_id, p_coin, ref_bonus)
      on conflict(user_id, coin)
      do update set amount = public.balances.amount + excluded.amount, updated_at = now();

      insert into public.referral_claims(referrer_id, referee_id, coin, amount)
      values(ref_id, uid, p_coin, ref_bonus);
    end if;
  end if;

  return jsonb_build_object('coin', p_coin, 'amount', reward, 'claimed_at', now());
end;
$$;

revoke all on function public.claim_reward(text) from public;
grant execute on function public.claim_reward(text) to authenticated;
grant select on public.profiles, public.balances, public.claims, public.referral_claims to authenticated;

-- 9. Admin Roles & Access Control
create table if not exists public.admin_roles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  created_at timestamptz not null default now()
);
alter table public.admin_roles enable row level security;

drop policy if exists "admins can read their own role" on public.admin_roles;
create policy "admins can read their own role" on public.admin_roles
for select to authenticated using (auth.uid() = user_id);
grant select on public.admin_roles to authenticated;

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.admin_roles ar where ar.user_id = auth.uid()
  );
$$;
revoke all on function public.is_admin() from public;
grant execute on function public.is_admin() to authenticated;

-- 10. Admin List Users RPC
create or replace function public.admin_list_users()
returns table (id uuid, email text, username text, created_at timestamptz)
language plpgsql
security definer
set search_path = ''
as $$
begin
  if auth.uid() is null or not public.is_admin() then
    raise exception 'Administrator access required.' using errcode = '42501';
  end if;
  return query
    select u.id, u.email::text, p.username, u.created_at
    from auth.users u
    left join public.profiles p on p.id = u.id
    order by u.created_at desc
    limit 1000;
end;
$$;
revoke all on function public.admin_list_users() from public;
grant execute on function public.admin_list_users() to authenticated;

-- 11. Secure Admin Activity Logging
create table if not exists public.admin_activity_logs (
  id bigint generated always as identity primary key,
  actor_user_id uuid references auth.users(id) on delete set null,
  action text not null check (action in ('dashboard_view','users_view','claims_view','activity_logs_view','data_refresh')),
  details jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists admin_activity_logs_created_at_idx
  on public.admin_activity_logs (created_at desc);
create index if not exists admin_activity_logs_actor_idx
  on public.admin_activity_logs (actor_user_id, created_at desc);

alter table public.admin_activity_logs enable row level security;
revoke all on table public.admin_activity_logs from anon, authenticated;

create or replace function public.admin_log_activity(p_action text, p_details jsonb default '{}'::jsonb)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  uid uuid := auth.uid();
  safe_details jsonb := coalesce(p_details, '{}'::jsonb);
begin
  if uid is null or not public.is_admin() then
    raise exception 'Administrator access required.' using errcode = '42501';
  end if;
  if p_action not in ('dashboard_view','users_view','claims_view','activity_logs_view','data_refresh') then
    raise exception 'Unsupported activity action.' using errcode = '22023';
  end if;
  if jsonb_typeof(safe_details) <> 'object' or length(safe_details::text) > 1000 then
    raise exception 'Activity details must be a small JSON object.' using errcode = '22023';
  end if;

  insert into public.admin_activity_logs (actor_user_id, action, details)
  values (uid, p_action, safe_details);
end;
$$;
revoke all on function public.admin_log_activity(text, jsonb) from public, anon;
grant execute on function public.admin_log_activity(text, jsonb) to authenticated;

create or replace function public.admin_list_activity_logs()
returns table (
  id bigint,
  actor_user_id uuid,
  actor_email text,
  action text,
  details jsonb,
  created_at timestamptz
)
language plpgsql
security definer
set search_path = ''
as $$
begin
  if auth.uid() is null or not public.is_admin() then
    raise exception 'Administrator access required.' using errcode = '42501';
  end if;
  return query
    select l.id, l.actor_user_id, u.email::text, l.action, l.details, l.created_at
    from public.admin_activity_logs l
    left join auth.users u on u.id = l.actor_user_id
    order by l.created_at desc
    limit 200;
end;
$$;
revoke all on function public.admin_list_activity_logs() from public, anon;
grant execute on function public.admin_list_activity_logs() to authenticated;
`;

export interface SchemaSection {
  id: string;
  title: string;
  description: string;
  codeSnippet: string;
}

export const SCHEMA_SECTIONS: SchemaSection[] = [
  {
    id: 'crypto-profiles',
    title: 'Profiles & Cryptographic Extensions',
    description: 'Enables pgcrypto and links auth.users to public.profiles with cascading deletions.',
    codeSnippet: `create extension if not exists pgcrypto;\n\ncreate table if not exists public.profiles (\n  id uuid primary key references auth.users(id) on delete cascade,\n  username text unique,\n  created_at timestamptz not null default now()\n);`,
  },
  {
    id: 'balances-claims',
    title: 'Multi-Coin Balances & Claims Ledger',
    description: 'High-precision numeric(28,12) storage for BTC, LTC, DOGE, and USDT with strict check constraints.',
    codeSnippet: `create table if not exists public.balances (\n  user_id uuid not null references auth.users(id) on delete cascade,\n  coin text not null check (coin in ('BTC','LTC','DOGE','USDT')),\n  amount numeric(28,12) not null default 0 check (amount >= 0),\n  updated_at timestamptz not null default now(),\n  primary key (user_id, coin)\n);\n\ncreate table if not exists public.claims (\n  id uuid primary key default gen_random_uuid(),\n  user_id uuid not null references auth.users(id) on delete cascade,\n  coin text not null check (coin in ('BTC','LTC','DOGE','USDT')),\n  amount numeric(28,12) not null check (amount > 0),\n  claimed_at timestamptz not null default now()\n);`,
  },
  {
    id: 'claim-rpc',
    title: 'Atomic claim_reward() with Advisory Lock',
    description: 'Serializes claim attempts with pg_advisory_xact_lock to prevent double-spending or cooldown bypasses.',
    codeSnippet: `create or replace function public.claim_reward(p_coin text)\nreturns jsonb language plpgsql security definer set search_path = '' as $$\ndeclare\n  uid uuid := auth.uid();\n  reward numeric(28,12);\n  last_claim timestamptz;\nbegin\n  if uid is null then raise exception 'Please sign in before claiming.'; end if;\n  if p_coin not in ('BTC','LTC','DOGE','USDT') then raise exception 'Unsupported coin.'; end if;\n\n  -- Prevent race conditions with advisory lock\n  perform pg_advisory_xact_lock(hashtextextended(uid::text || ':' || p_coin, 0));\n\n  select max(claimed_at) into last_claim\n  from public.claims where user_id = uid and coin = p_coin;\n\n  if last_claim is not null and last_claim > now() - interval '60 seconds' then\n    raise exception 'Please wait before making another claim for this coin.';\n  end if;\n\n  reward := case p_coin\n    when 'BTC' then 0.00000001\n    when 'LTC' then 0.00000100\n    when 'DOGE' then 0.00001000\n    when 'USDT' then 0.00010000\n  end;\n\n  insert into public.balances(user_id, coin, amount)\n  values(uid, p_coin, reward)\n  on conflict(user_id, coin)\n  do update set amount = public.balances.amount + excluded.amount, updated_at = now();\n\n  insert into public.claims(user_id, coin, amount) values(uid, p_coin, reward);\n  return jsonb_build_object('coin', p_coin, 'amount', reward, 'claimed_at', now());\nend; $$;`,
  },
  {
    id: 'admin-system',
    title: 'Admin Roles & Activity Audit Logs',
    description: 'Strict security definer RPCs admin_list_users() and admin_log_activity() with role verification.',
    codeSnippet: `create table if not exists public.admin_roles (\n  user_id uuid primary key references auth.users(id) on delete cascade,\n  created_at timestamptz not null default now()\n);\n\ncreate or replace function public.is_admin() returns boolean\nlanguage sql stable security definer set search_path = '' as $$\n  select exists (select 1 from public.admin_roles ar where ar.user_id = auth.uid());\n$$;`,
  },
  {
    id: 'referral-bonus',
    title: '10% Referral Bonus & Attribution Table',
    description: 'Tracks user invites and automatically credits referrers a 10% commission on every referee claim.',
    codeSnippet: `create table if not exists public.referrals (\n  user_id uuid primary key references auth.users(id) on delete cascade,\n  referrer_id uuid not null references auth.users(id) on delete cascade,\n  created_at timestamptz not null default now()\n);\n\ncreate table if not exists public.referral_claims (\n  id uuid primary key default gen_random_uuid(),\n  referrer_id uuid not null references auth.users(id) on delete cascade,\n  referee_id uuid not null references auth.users(id) on delete cascade,\n  coin text not null check (coin in ('BTC','LTC','DOGE','USDT')),\n  amount numeric(28,12) not null check (amount > 0),\n  claimed_at timestamptz not null default now()\n);\n\n-- In claim_reward(), credit 10% bonus directly to referrer:\n-- bonus := round(reward * 0.10, 12);\n-- insert into public.balances(user_id, coin, amount) values (referrer_id, p_coin, bonus)\n-- on conflict (user_id, coin) do update set amount = public.balances.amount + excluded.amount;`,
  },
];
