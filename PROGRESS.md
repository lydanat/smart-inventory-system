# Project Progress — Smart Inventory AI

## Stage Status Overview

| Stage | Name | Status | Verified End-to-End | Commit |
|---|---|---|---|---|
| Stage 1 | Scaffold & Tooling | COMPLETED | [x] | `7870211` feat: scaffold nextjs app router... |
| Stage 2 | Database & RLS | COMPLETED | [x] | `4983cfb` feat: add full postgres schema... |
| Stage 3 | Auth & Session | COMPLETED | [x] | feat: implement auth flow, session refresh proxy, route guards, and app shell |
| Stage 4 | Inventory CRUD | COMPLETED | [x] | `ef3300d` feat: complete Stage 4 inventory CRUD... |
| Stage 5 | Dashboard | COMPLETED | [x] | `8d6b3ec` feat: complete Stage 5 Dashboard... |
| Stage 6 | Telegram Bot & Crons | COMPLETED | [x] | Pending commit |
| Stage 7 | AI Recommendations (Gemini + Rules) | IN PROGRESS | [ ] | Pending |
| Stage 8 | UI Polish & Responsive States | PENDING | [ ] | Pending |
| Stage 9 | Security Audit & Pentest | PENDING | [ ] | Pending |
| Stage 10 | Deployment & Live Demo | PENDING | [ ] | Pending |

---

## Current Work
- Stage 6 completed:
  - Built Telegram Client (`src/lib/telegram/client.ts`): HTML formatting, rate-limiting retry handling (HTTP 429), and automatic message chunking for messages exceeding Telegram's 4096 character limit.
  - Built Telegram Link Flow (`src/lib/telegram/link.ts`): High-entropy 6-character link codes, SHA-256 hash storage in `telegram_link_codes`, 15-minute expiry, and single-use atomic consumption.
  - Built Server Actions (`src/actions/telegram.ts`): `generateTelegramLinkCodeAction`, `sendTestAlertAction`, `disconnectTelegramAction`, `toggleTelegramAlertsAction`.
  - Built Telegram Webhook (`src/app/api/telegram/webhook/route.ts`):
    - Constant-time `safeCompare` header verification for `X-Telegram-Bot-Api-Secret-Token`.
    - Bot commands: `/start <code>` (auto-links store and enables alerts), `/start` (help onboarding), `/status` (instant live inventory health metrics), `/low` (list of low stock / stockout items), `/stop` (disconnects store), and `/help`.
  - Built Idempotent Cron Endpoints:
    - `POST /api/cron/low-stock`: Validates `CRON_SECRET` Bearer header, scans active subscribers, checks 24-hour per-item deduplication in `alert_events`, dispatches Telegram notifications.
    - `POST /api/cron/expiry`: Validates `CRON_SECRET` Bearer header, detects items expiring at 7d, 3d, 1d, and 0d (expired), applies daily deduplication in `alert_events`.
  - Built Alerts UI (`src/app/(app)/alerts/page.tsx`, `src/components/alerts/alerts-view.tsx`):
    - Connection card with real-time countdown timer, copy-to-clipboard, auto-linking deep link to `@AIinventorysystemBOT`.
    - Notification preferences switch.
    - Available bot commands cheatsheet.
    - Recent alert audit ledger table.
  - Automated verification:
    - 33 Vitest tests passing (RLS, validation, utils, Telegram SHA-256 hashing, code expiration, and atomic linking).
    - 12 Playwright E2E tests passing across desktop and mobile.
    - Local security test verified: unauthorized requests rejected with 401, authorized requests return 200 `{ ok: true }`.
    - `next build` compiled cleanly.
- Starting Stage 7: AI Recommendations (Gemini 2.5 Flash + Deterministic Layer 1 Rules Engine).

---

## Known Issues
- None at present.

---

## Test Results
- Supabase REST connectivity: Verified.
- Telegram getMe check: Verified bot username `AIinventorysystemBOT`.
- Gemini API key models list: Verified `gemini-2.5-flash` available.

---

## Assumptions Made
- Default currency: `USD`.
- Default timezone: `Asia/Phnom_Penh`.
- Free tier Gemini model: `gemini-2.5-flash`.
