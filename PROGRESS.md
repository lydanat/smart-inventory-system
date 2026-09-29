# Project Progress — Smart Inventory AI

## Stage Status Overview

| Stage | Name | Status | Verified End-to-End | Commit |
|---|---|---|---|---|
| Stage 1 | Scaffold & Tooling | COMPLETED | [x] | `7870211` feat: scaffold nextjs app router... |
| Stage 2 | Database & RLS | COMPLETED | [x] | `4983cfb` feat: add full postgres schema... |
| Stage 3 | Auth & Session | COMPLETED | [x] | `935f118` feat: implement auth flow, session refresh proxy... |
| Stage 4 | Inventory CRUD | COMPLETED | [x] | `ef3300d` feat: complete Stage 4 inventory CRUD... |
| Stage 5 | Dashboard | COMPLETED | [x] | `8d6b3ec` feat: complete Stage 5 Dashboard... |
| Stage 6 | Telegram Bot & Crons | COMPLETED | [x] | `ac98d12` feat: complete Stage 6 Telegram bot & crons... |
| Stage 7 | AI Recommendations (Gemini + Rules) | COMPLETED | [x] | Pending commit |
| Stage 8 | UI Polish & Responsive States | IN PROGRESS | [ ] | Pending |
| Stage 9 | Security Audit & Pentest | PENDING | [ ] | Pending |
| Stage 10 | Deployment & Live Demo | PENDING | [ ] | Pending |

---

## Current Work
- Stage 7 completed:
  - Built Layer 1 Deterministic Rules Engine (`src/lib/rules/inventory-rules.ts`):
    - Pure functions with testable fixed dates for `out_of_stock`, `low_stock`, `expired`, `expiring_soon`, `overstock`, `slow_moving`, and `fast_mover`.
    - Section 10.1 reorder formula: `suggestedReorderQty = max(round(avgDailySales30d * 14) - quantity, threshold * 2 - quantity, 1)`.
    - Unit tests in `tests/unit/rules.test.ts` (10 tests, 100% passing).
  - Built Layer 2 Gemini AI Service (`src/lib/services/ai.ts`):
    - Official `@google/genai` SDK integration with `GoogleGenAI`.
    - Active model: `gemini-3.8-flash`.
    - Input building with SHA-256 state hashing for caching (`ai_recommendations` table, 6h expiry).
    - Strict Anti-Hallucination validation (`src/lib/validation/ai.ts`): Zod schema validation + verification that every referenced item name exists in the catalog.
    - Rate limiting: max 1 on-demand generation per hour per business (`ai:business:${businessId}`) and global budget tracking (`ai:global`, default 200 calls/day via `check_rate_limit` RPC).
    - Graceful fallback (`generateRulesFallback`): when Gemini key is unset, rate-limited, or times out (>15s), system falls back seamlessly to deterministic rules synthesis (`source: 'rules_only'`) so the dashboard card never errors out.
  - Built Feedback & Action System (`src/actions/ai.ts`):
    - `refreshRecommendationsAction` (with `withAuth`, rate limit checks).
    - `recordFeedbackAction` (stores thumbs up/down ratings in `ai_feedback`).
  - Built Dashboard AI Card (`src/components/dashboard/ai-insights-card.tsx`):
    - Executive summary, Gemini / Rules source badge, updated timestamp.
    - Restock suggestions with one-click restock pre-filling `StockAdjustDialog`.
    - Marketing clearance ideas with one-click copy message.
    - Supplier tips with directory links.
    - Thumbs up/down feedback affordances.
    - Non-blocking streaming Suspense wrapper (`AIInsightsWrapper`, `AIInsightsSkeleton`) in `src/app/(app)/dashboard/page.tsx`.
  - Built Suppliers Directory (`src/app/(app)/suppliers/page.tsx`, `src/components/suppliers/*`):
    - Full CRUD with Zod validation, search filtering, responsive desktop table and mobile cards.
  - Automated verification:
    - 52 Vitest unit & integration tests passing.
    - 14 Playwright E2E tests passing across desktop and mobile.
    - `npm run build` compiled cleanly.
- Starting Stage 8: UI Polish & Responsive States (375px, 768px, 1280px responsiveness, dark mode check, empty & error states everywhere, loading skeletons, PWA `manifest.webmanifest`, accessibility audit).

---

## Known Issues
- None at present.

---

## Test Results
- Supabase REST connectivity: Verified.
- Telegram getMe check: Verified bot username `AIinventorysystemBOT`.
- Gemini API key generation: Verified `gemini-3.8-flash` producing grounded JSON recommendations.
- Unit & integration tests: 52 passed.
- E2E tests: 14 passed.
- Production build: Succeeded (`next build`).

---

## Assumptions Made
- Default currency: `USD`.
- Default timezone: `Asia/Phnom_Penh`.
- Free tier Gemini model: `gemini-3.8-flash`.
