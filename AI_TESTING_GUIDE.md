# Smart Inventory AI — Team Testing Guide & Expected Outputs

This guide provides testing procedures, input data fixtures, and expected outputs so the entire engineering and QA team can test and verify the AI Advisor engine together.

---

## 1. Quick Start: Run the AI Test Runner

The fastest way to test the AI engine is via the automated test runner:

```bash
npm run test:ai
```

Or run all automated Vitest unit & integration tests:

```bash
npm run test
```

---

## 2. AI Architecture Overview

The Smart Inventory AI engine uses a 4-layer defense-in-depth architecture:

```
[Store Inventory & Sales History]
               │
               ▼
┌─────────────────────────────────┐
│ Layer 1: Deterministic Rules     │  Analyzes stock level, 7d/30d velocity, days to expiry
│ (src/lib/rules/inventory-rules) │  Generates standardized RuleFlag[]
└────────────────┬────────────────┘
                 │
                 ▼
┌─────────────────────────────────┐
│ Layer 2: Gemini Advisor Engine  │  Encapsulated prompt with anti-prompt injection delimiters
│ (src/lib/services/ai.ts)        │  Calls Google Gemini with JSON schema enforcement & retry
└────────────────┬────────────────┘
                 │
                 ▼
┌─────────────────────────────────┐
│ Layer 3: Anti-Hallucination     │  Strips markdown fences, validates schema via Zod,
│ (src/lib/validation/ai.ts)      │  Strictly rejects any SKU not in the store catalog!
└────────────────┬────────────────┘
                 │ (if error / rate-limit / no key)
                 ▼
┌─────────────────────────────────┐
│ Layer 4: Fallback Engine        │  Synthesizes deterministic recommendations
│ (generateRulesFallback)         │  Guarantees 0 dashboard crashes for the merchant
└─────────────────────────────────┘
```

---

## 3. Test Scenarios: Inputs & Expected Outputs

### Test Scenario 1: AI Recommendation Generation & Schema Compliance

Verifies that the AI engine accepts structured inventory flags and returns a valid, schema-compliant recommendation containing all 4 required sections (`summary`, `restock`, `marketing`, `suppliers`).

#### Input Data:
```json
{
  "businessContext": {
    "currency": "USD",
    "activeItemsCount": 5,
    "suppliersCount": 2
  },
  "flags": [
    {
      "itemName": "Espresso Roast Beans 1kg",
      "category": "Coffee & Tea",
      "flag": "low_stock",
      "severity": "critical",
      "quantity": 2,
      "threshold": 10,
      "avgDailySales30d": 3.5,
      "suggestedReorderQty": 25,
      "supplierName": "Pacific Roasters Co."
    },
    {
      "itemName": "Organic Whole Milk 1L",
      "category": "Dairy",
      "flag": "expiring_soon",
      "severity": "warning",
      "quantity": 18,
      "threshold": 5,
      "daysToExpiry": 2,
      "avgDailySales30d": 4.0,
      "suggestedReorderQty": 20,
      "supplierName": "Valley Fresh Dairy"
    },
    {
      "itemName": "Matcha Green Tea Powder 100g",
      "category": "Coffee & Tea",
      "flag": "overstock",
      "severity": "info",
      "quantity": 45,
      "threshold": 10,
      "avgDailySales30d": 0.5,
      "daysSinceLastSale": 12
    }
  ]
}
```

#### Expected Output:
- **Status:** PASS
- **Response Format:** Valid JSON object matching `RecommendationPayload`
- **Output Content Structure:**
  - `summary`: Non-empty string advising the store owner on the #1 action today.
  - `restock`: Array (1–3 items) containing `Espresso Roast Beans 1kg`, with `urgency` set to `"today"` and `suggestedQuantity: 25`.
  - `marketing`: Array (1–3 items) containing clearance/bundle ideas for `Organic Whole Milk 1L` (expiring in 2 days) and/or `Matcha Green Tea Powder 100g` (overstock).
  - `suppliers`: Array (1–3 items) recommending supplier contact details and ordering tips.

---

### Test Scenario 2: Anti-Hallucination & Catalog Guardrails

Verifies that if an AI response hallucinates or recommends an item that does not exist in the store's real catalog, the validator blocks and throws an error before reaching the UI.

#### Input Data (Simulated Hallucination):
```json
{
  "summary": "Restock luxury goods immediately.",
  "marketing": [],
  "restock": [
    {
      "itemName": "Rolex Submariner Watch",
      "why": "High demand luxury watch.",
      "urgency": "today"
    }
  ],
  "suppliers": []
}
```
*Catalog:* `['Organic Whole Milk 1L', 'Espresso Roast Beans 1kg', 'Matcha Green Tea Powder 100g', 'Artisan Sourdough Loaf', 'Raw Almonds 500g']`

#### Expected Output:
- **Status:** PASS (Hallucination caught and rejected)
- **Expected Error Message:**
  `Hallucination detected: "Rolex Submariner Watch" not found in real inventory`

---

### Test Scenario 3: Offline / Fallback Resiliency Engine (Zero-Crash Guarantee)

Verifies that if `GEMINI_API_KEY` is omitted, the user hits HTTP 429 rate limit, or the remote AI service returns HTTP 503 unavailable, the system transparently degrades to deterministic rules synthesis so the merchant's dashboard never breaks.

#### Input Data:
Simulated network failure / invalid API key with `sampleFlags`.

#### Expected Output:
- **Status:** PASS (Zero exceptions thrown to caller)
- **Fallback Generated Fields:**
  - `summary`: `"Immediate restock required: 1 SKU is critically low or out of stock."`
  - `restock`: Contains `Espresso Roast Beans 1kg` with suggested quantity calculated deterministically (`threshold * 2` or `suggestedReorderQty`).
  - `marketing`: Contains actionable clearance suggestion for `Organic Whole Milk 1L` before expiry.
  - `suppliers`: Contains supplier reorder suggestion for `Pacific Roasters Co.`.
- **Source Indicator:** `"rules_only"` (instead of `"gemini"`).

---

### Test Scenario 4: SHA-256 Hash Idempotency & Cache Keying

Verifies that identical inventory flags produce an identical 64-character SHA-256 fingerprint, guaranteeing that repeat page views are served instantly from cache (sub-millisecond) without incurring paid Gemini API token charges.

#### Input Data:
`sampleFlags` + `sampleBusinessContext` + `v1.0.0` hashed twice.

#### Expected Output:
- **Status:** PASS
- **Hash 1 Length:** 64 hex characters
- **Hash 2 Length:** 64 hex characters
- **Equality:** `hash1 === hash2` (e.g., `9587fa14fdb12269...`)

---

## 4. Manual Browser UI Testing Checklist (For Team QA)

To test the AI system end-to-end in the browser application:

1. **Start the local server:**
   ```bash
   npm run dev
   ```
2. **Log in:**
   - Navigate to `http://localhost:3000/login`
   - Log in with valid credentials.
3. **Open Dashboard:**
   - Navigate to `http://localhost:3000/dashboard`
   - Observe the **AI Business Advisor** card at the top.
4. **Verify UI Components:**
   - **Daily Briefing Summary:** 1–2 actionable sentences highlighted in the header.
   - **Restock Priorities:** Red/amber badges indicating urgency (`Today` or `This Week`) with recommended reorder quantities.
   - **Revenue & Clearance Ideas:** Marketing ideas with copy-pasteable promo messages for overstock/expiring items.
   - **Supplier Recommendations:** Negotiation/order tips for primary product categories.
5. **Verify Force Refresh & Rate Limiting:**
   - Click the **"Refresh Advice"** button.
   - If refreshed within 1 hour, verify the UI displays a helpful rate limit notification:
     *"AI recommendations can be refreshed once per hour. Please try again later."*
6. **Verify Offline / Missing API Key Behavior:**
   - Temporarily comment out `GEMINI_API_KEY` in `.env.local`.
   - Reload the dashboard.
   - Verify the AI card still renders complete, structured advice using the deterministic fallback engine without error banners.

---

## 5. Team Test Matrix Summary

| Test ID | Test Category | Execution Command / Path | Expected Result | Pass Criteria |
| :--- | :--- | :--- | :--- | :--- |
| **AI-01** | Live / Mock Generation | `npm run test:ai` (Test 1) | Structured JSON with 4 sections | Valid Zod schema, non-empty fields |
| **AI-02** | Anti-Hallucination | `npm run test:ai` (Test 2) | Invented items rejected | Throws validation error on unknown SKU |
| **AI-03** | Fallback Resiliency | `npm run test:ai` (Test 3) | Generates rules-only advice | 0 crashes, source tagged `rules_only` |
| **AI-04** | Cache Fingerprint | `npm run test:ai` (Test 4) | SHA-256 hash match | 64-char hex match, zero redundant calls |
| **AI-05** | Unit Tests | `npm run test tests/unit/ai-parser.test.ts` | 6/6 tests pass | Zod schema & edge cases validated |
| **AI-06** | Rules Unit Tests | `npm run test tests/unit/rules-fallback.test.ts` | 3/3 tests pass | Rules fallback logic verified |
| **AI-07** | Dashboard UI Card | Browser: `/dashboard` | Card renders with badges & tips | Responsive, dark/light mode compatible |
