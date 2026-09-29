# Project Progress — Smart Inventory AI

## Stage Status Overview

| Stage | Name | Status | Verified End-to-End | Commit |
|---|---|---|---|---|
| Stage 1 | Scaffold & Tooling | COMPLETED | [x] | `7870211` feat: scaffold nextjs app router... |
| Stage 2 | Database & RLS | COMPLETED | [x] | `4983cfb` feat: add full postgres schema... |
| Stage 3 | Auth & Session | COMPLETED | [x] | feat: implement auth flow, session refresh proxy, route guards, and app shell |
| Stage 4 | Inventory CRUD | COMPLETED | [x] | `ef3300d` feat: complete Stage 4 inventory CRUD... |
| Stage 5 | Dashboard | COMPLETED | [x] | Pending commit |
| Stage 6 | Telegram Bot & Crons | IN PROGRESS | [ ] | Pending |
| Stage 7 | AI Recommendations (Gemini + Rules) | PENDING | [ ] | Pending |
| Stage 8 | UI Polish & Responsive States | PENDING | [ ] | Pending |
| Stage 9 | Security Audit & Pentest | PENDING | [ ] | Pending |
| Stage 10 | Deployment & Live Demo | PENDING | [ ] | Pending |

---

## Current Work
- Stage 5 completed:
  - Built Dashboard Service (`src/lib/services/dashboard.ts`):
    - `getDashboardSummary`: Invokes live `dashboard_summary` RPC for SKUs, low stock count, stockout count, expiring soon count, expired count, and inventory valuation.
    - `getAttentionNeededItems`: Retrieves top 8 critical items prioritized by urgency (expired > out of stock > expiring soon > low stock).
    - `getFastMovingItems`: Analyzes stock movement ledger for highest negative volume in the last 7 days.
    - `getStockByCategory`: Aggregates category counts, units, and valuations for interactive donut charts.
    - `getRecentMovementsChartData`: Computes 14-day inbound (restocks) vs outbound (sales/adjustments) activity.
  - Built Dashboard Components:
    - `StatCards`: 4 glanceable KPI cards with valuation tooltip, status badges, and direct links to filtered inventory views (`/inventory?status=...`).
    - `OnboardingChecklist`: Dynamic progress card for stores with < 3 items, step-by-step progress bar, direct action triggers, and permanent localStorage dismissal.
    - `AttentionList`: Actionable alert list with urgency badges and inline `StockAdjustDialog` quick restock integration.
    - `FastMovers`: Top 5 selling items table with stock velocity and remaining quantities.
    - `DashboardCharts`: Responsive Recharts Donut category distribution with value percentage tooltips and 14-day stacked/grouped bar chart.
  - Automated verification:
    - 30 Vitest unit & integration tests passing.
    - 2 Playwright E2E tests passing on desktop and mobile: Dashboard metrics, onboarding checklist step transitions, attention list updates upon adding low stock, inline quick restock restoring healthy status, and dismissal persistence.
    - `next build` compiled cleanly.
- Starting Stage 6: Telegram Bot & Crons (webhook, SHA-256 link codes, bot commands `/start`, `/status`, `/low`, `/stop`, scheduled alert crons, Alerts page UI).

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
