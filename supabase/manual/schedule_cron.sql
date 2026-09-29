-- ==============================================================================
-- Supabase pg_cron + pg_net Automated Schedule Script
--
-- Instructions:
-- 1. Enable the pg_cron and pg_net extensions in Supabase Dashboard (Database -> Extensions).
-- 2. Store your CRON_SECRET and SITE_URL in Supabase Vault or replace the placeholders below.
-- 3. Run this script in the Supabase SQL Editor.
-- ==============================================================================

-- Enable extensions if not already enabled
create extension if not exists pg_cron;
create extension if not exists pg_net;

-- Unschedules previous jobs if they exist to avoid duplicate executions
do $$
begin
  perform cron.unschedule('daily-low-stock-alert');
exception when others then null;
end $$;

do $$
begin
  perform cron.unschedule('daily-expiry-alert');
exception when others then null;
end $$;

-- Schedule 1: Low-stock digest every day at 08:00 AM UTC
-- Calls POST /api/cron/low-stock with Bearer CRON_SECRET
select cron.schedule(
  'daily-low-stock-alert',
  '0 8 * * *',
  $$
  select net.http_post(
    url := 'https://your-domain.vercel.app/api/cron/low-stock',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer ' || (select decrypted_secret from vault.decrypted_secrets where name = 'CRON_SECRET' limit 1)
    ),
    body := '{}'::jsonb
  );
  $$
);

-- Schedule 2: Expiration tracking digest every day at 08:05 AM UTC
-- Calls POST /api/cron/expiry with Bearer CRON_SECRET
select cron.schedule(
  'daily-expiry-alert',
  '5 8 * * *',
  $$
  select net.http_post(
    url := 'https://your-domain.vercel.app/api/cron/expiry',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer ' || (select decrypted_secret from vault.decrypted_secrets where name = 'CRON_SECRET' limit 1)
    ),
    body := '{}'::jsonb
  );
  $$
);
