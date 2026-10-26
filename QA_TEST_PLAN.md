# Smart Inventory AI — Manual QA Test Plan & Verification Guide

> **Important Note for the Tester:**  
> This test plan is specifically authored for **manual execution by YOU (the store owner/tester)**.  
> Every test case includes exact step-by-step instructions, expected success outcomes, failure criteria to watch for, and a `[ ] PASS / [ ] FAIL` checkbox so you can record your findings.

---

## ⚠️ Prerequisite: Resuming Your Supabase Project ("Disconnect" Fix)

If your app displays connection errors, timeouts (curl error 28), or fails to load data, your Supabase hosted project is currently in a **PAUSED (inactive)** state. On the Supabase free tier, projects pause automatically after 7 days of inactivity.

### How to Resume Your Supabase Project (2 Minutes):
1. Navigate to: **[https://supabase.com/dashboard](https://supabase.com/dashboard)**
2. Log in with your Supabase credentials or GitHub.
3. In your project list, locate project reference: **`tgwboujyiexgpmsssmqd`**.
4. You will see a yellow banner stating: *"This project is paused"*.
5. Click the green **"Restore project" / "Resume"** button.
6. Wait **1 to 2 minutes** while Supabase spins up the PostgreSQL container and REST API.
7. Once the project status turns to a green dot **"Active"**, open the **SQL Editor** tab in Supabase.
8. Paste and run the following migration to enable the dedicated categories table:

```sql
-- Migration: Create categories table
create table if not exists public.categories (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references public.businesses(id) on delete cascade,
  name text not null check (char_length(btrim(name)) between 1 and 80),
  created_at timestamptz not null default now(),
  unique (business_id, name)
);

create index if not exists categories_business_idx on public.categories (business_id);
alter table public.categories enable row level security;

create policy "categories_select" on public.categories for select using (public.is_member(business_id));
create policy "categories_insert" on public.categories for insert with check (public.is_member(business_id));
create policy "categories_update" on public.categories for update using (public.is_member(business_id));
create policy "categories_delete" on public.categories for delete using (public.is_member(business_id, array['owner','manager']));
```

9. Refresh `http://localhost:3000/dashboard`. All features will now connect seamlessly!

---

## 📋 Manual Test Execution Matrix

---

### Module 1: Authentication, Google Login & Password Setup

#### `QA-AUTH-01`: Re-Login After Google OAuth (No Password Needed)
- **Goal:** Verify that a user who registered with Google can log back into their account anytime in 1 click without ever typing a password.
- **Preconditions:** You have a Google account.
- **Step-by-Step Instructions:**
  1. Open `http://localhost:3000/login` in your browser.
  2. Click the **"Continue with Google"** button.
  3. Authenticate with your Google account.
  4. Verify you land on `/dashboard`.
  5. Click the top-right profile avatar -> Click **"Sign out"**.
  6. You are returned to `/login`.
  7. Click **"Continue with Google"** again.
- **Expected Success Outcome:**
  - [ ] System automatically logs you straight back into your dashboard without prompting for any password.
  - [ ] All store data, products, and metrics are preserved.
- **Failure Criteria & What to Watch For:**
  - ❌ Redirect loop or "Unsupported provider" (indicates Google OAuth is not enabled in Supabase Dashboard -> Auth -> Providers).
  - ❌ Prompting for a password when clicking Google button.
- **Tester Result:** `[ ] PASS` &nbsp; `[ ] FAIL` &nbsp; | Notes: __________________________

---

#### `QA-AUTH-02`: Request Password Reset for Google or Email Account
- **Goal:** Verify that a user (even one who signed up via Google) can request a password reset email to set a standalone password.
- **Preconditions:** At `/login` page.
- **Step-by-Step Instructions:**
  1. On `/login`, click the **"Forgot Password?"** link below the password input.
  2. A modal titled **"Reset or Set Password"** opens.
  3. Enter your account email address (e.g. your Google account email or registered store email).
  4. Click **"Send Reset Link"**.
- **Expected Success Outcome:**
  - [ ] Button shows spinning loader *"Sending..."*.
  - [ ] Green checkmark appears with confirmation: *"Reset Email Sent! We sent a secure link to your email."*
  - [ ] A password reset email arrives in your inbox with a secure recovery link.
- **Failure Criteria & What to Watch For:**
  - ❌ Error popup without email being sent (check if SMTP is configured or if Supabase project is paused).
  - ❌ Clicking "Forgot Password" does nothing or shows a broken alert.
- **Tester Result:** `[ ] PASS` &nbsp; `[ ] FAIL` &nbsp; | Notes: __________________________

---

#### `QA-AUTH-03`: Set New Password via `/reset-password`
- **Goal:** Verify that opening the reset link allows setting a secure password.
- **Preconditions:** Password reset link received or navigate to `/reset-password` with active session.
- **Step-by-Step Instructions:**
  1. Click the recovery link from your email, or visit `http://localhost:3000/reset-password`.
  2. Enter a password with fewer than 8 characters (e.g., `pass123`).
  3. Observe the strength indicator bar (should remain gray/short).
  4. Enter a valid 8+ character password (e.g., `StrongPassword2026!`).
  5. Re-enter the same password in **"Confirm Password"**.
  6. Click **"Update Password & Continue"**.
- **Expected Success Outcome:**
  - [ ] Password updates successfully.
  - [ ] Toast notification appears: *"Password updated successfully!"*.
  - [ ] System automatically redirects you into `/dashboard`.
- **Failure Criteria & What to Watch For:**
  - ❌ Submitting mismatched passwords fails to show "Passwords do not match" validation error.
  - ❌ Passwords under 8 characters are accepted (violates Zod security constraint).
- **Tester Result:** `[ ] PASS` &nbsp; `[ ] FAIL` &nbsp; | Notes: __________________________

---

#### `QA-AUTH-04`: Set or Change Password Inside Store Settings
- **Goal:** Allow a logged-in Google OAuth user to create/update an email password directly while browsing without logging out.
- **Preconditions:** Logged in to `/dashboard`.
- **Step-by-Step Instructions:**
  1. In the sidebar, click **"Settings"** (or visit `/settings`).
  2. Scroll down to the **"Account & Security"** card.
  3. Locate the **"Set or Update Password"** section.
  4. Type a new password (min 8 chars) into **"New Password"**.
  5. Type the matching password into **"Confirm Password"**.
  6. Click **"Save Password"**.
- **Expected Success Outcome:**
  - [ ] Success toast: *"Password updated successfully!"*.
  - [ ] Input fields clear automatically.
  - [ ] You can now log in via BOTH **"Continue with Google"** AND **Email + Password** on `/login`!
- **Failure Criteria & What to Watch For:**
  - ❌ Form crashes or button stays disabled after entering valid inputs.
- **Tester Result:** `[ ] PASS` &nbsp; `[ ] FAIL` &nbsp; | Notes: __________________________

---

### Module 2: AI Business Advisor & Hourly Refresh Cooldown

#### `QA-AI-01`: View AI Business Advisor Card & Recommendations
- **Goal:** Verify that the AI Business Advisor renders executive summary, restock suggestions, 2-3 marketing strategies, and supplier tips.
- **Preconditions:** Logged in at `/dashboard` with at least 1-2 inventory items.
- **Step-by-Step Instructions:**
  1. Open `/dashboard`.
  2. Scroll to the **"AI Business Advisor"** card.
  3. Verify the model badge in the card header (either **"Gemini 3.8 Flash"** or **"Deterministic Rules"**).
  4. Verify the **Executive Summary** box at the top.
  5. Verify the **Suggested Restocks** section with urgency badges (`TODAY` or `THIS WEEK`).
  6. Verify the **Turnover & Clearance Ideas** section.
  7. Verify the **Supplier & Sourcing Tips** section.
- **Expected Success Outcome:**
  - [ ] Card loads without any blank white screens or runtime crashes.
  - [ ] Recommendations display real catalog product names and quantities.
- **Failure Criteria & What to Watch For:**
  - ❌ Card says "No Recommendations Yet" even though products exist.
  - ❌ Red crash screen.
- **Tester Result:** `[ ] PASS` &nbsp; `[ ] FAIL` &nbsp; | Notes: __________________________

---

#### `QA-AI-02`: Refresh Cooldown Protection (< 1 Hour)
- **Goal:** Prevent accidental rate limit exhaustion by enforcing a 1-hour cooldown with exact minute countdown feedback.
- **Preconditions:** AI insights have just been generated/refreshed within the last 60 minutes.
- **Step-by-Step Instructions:**
  1. On the AI Advisor card header, click the **"Refresh"** button.
  2. Observe the toast notification.
- **Expected Success Outcome:**
  - [ ] Toast displays clear remaining cooldown message:  
    *"AI insights can be refreshed once per hour. You can refresh again in X minutes."*
  - [ ] Previous recommendations remain visible without being wiped out.
- **Failure Criteria & What to Watch For:**
  - ❌ Generic error code like "500 Internal Server Error" without user-friendly minutes countdown.
  - ❌ Infinite loading spinner that freezes the screen.
- **Tester Result:** `[ ] PASS` &nbsp; `[ ] FAIL` &nbsp; | Notes: __________________________

---

#### `QA-AI-03`: Refresh Execution After 1 Hour
- **Goal:** Verify that once 1 hour has elapsed, clicking "Refresh" successfully updates recommendations.
- **Preconditions:** Last generation was > 1 hour ago (or test store reset).
- **Step-by-Step Instructions:**
  1. Verify the header shows *"Updated at [timestamp]"*.
  2. Once 1 hour has passed since that timestamp, click **"Refresh"**.
  3. Button text changes to *"Analyzing..."* with an animated spinner.
- **Expected Success Outcome:**
  - [ ] Success toast: *"Recommendations refreshed with latest inventory data"*.
  - [ ] Timestamp updates to the current time.
  - [ ] Fresh restock and marketing strategies are displayed based on current stock.
- **Failure Criteria & What to Watch For:**
  - ❌ Blocked even after 1 hour has passed.
- **Tester Result:** `[ ] PASS` &nbsp; `[ ] FAIL` &nbsp; | Notes: __________________________

---

### Module 3: Marketing Strategies & Content Scrolling

#### `QA-MKT-01`: Verify Exactly 2 to 3 Marketing Strategies
- **Goal:** Ensure the AI always delivers 2 to 3 practical marketing strategies even if all stock is healthy.
- **Preconditions:** Dashboard open.
- **Step-by-Step Instructions:**
  1. Inspect the **"Turnover & Clearance Ideas"** section of the AI Advisor card.
  2. Count the number of marketing strategy cards displayed.
- **Expected Success Outcome:**
  - [ ] Section title shows either:  
    `Turnover & Clearance Ideas (2)` or `Turnover & Clearance Ideas (3)`.
  - [ ] Exactly 2 or 3 cards are rendered.
  - [ ] Each card has a channel badge (`in-store sign`, `social media`, `sms`, or `telegram broadcast`).
- **Failure Criteria & What to Watch For:**
  - ❌ 0 or only 1 marketing strategy card shown.
  - ❌ More than 3 cards overflowing container.
- **Tester Result:** `[ ] PASS` &nbsp; `[ ] FAIL` &nbsp; | Notes: __________________________

---

#### `QA-MKT-02`: Marketing Text Scrolling & Full Visibility
- **Goal:** Verify that the full marketing idea and promotional copy can be read completely without text being cut off by `line-clamp`.
- **Preconditions:** Marketing cards displayed on Dashboard.
- **Step-by-Step Instructions:**
  1. Look at the description paragraph under the title in any marketing card.
  2. Look at the monospace sample message box (e.g., `""Special offer on..."`).
  3. If the message is long, scroll inside the box with your mouse wheel or finger.
- **Expected Success Outcome:**
  - [ ] Full explanation is readable without three dots (`...`) cutting off the text mid-sentence.
  - [ ] Sample message box allows smooth vertical scrolling (`overflow-y-auto`) to read the complete copy.
  - [ ] Card layout does not break or get clipped on mobile screens.
- **Failure Criteria & What to Watch For:**
  - ❌ Text truncated after 2 lines with no way to expand or scroll.
  - ❌ Text overflows outside the card border.
- **Tester Result:** `[ ] PASS` &nbsp; `[ ] FAIL` &nbsp; | Notes: __________________________

---

#### `QA-MKT-03`: One-Click Copy Marketing Message
- **Goal:** Verify promotional messages can be copied instantly for posting to Telegram or Facebook.
- **Step-by-Step Instructions:**
  1. Click the **"Copy Message"** button at the bottom of any marketing card.
  2. Open any text editor or browser URL bar and press `Ctrl+V` (or `Cmd+V` on Mac).
- **Expected Success Outcome:**
  - [ ] Button icon turns into a green checkmark and button text changes to *"Copied"*.
  - [ ] Toast notification: *"Promotion copied to clipboard"*.
  - [ ] Pasted text exactly matches the quote in the sample message box.
- **Failure Criteria & What to Watch For:**
  - ❌ Toast "Unable to copy to clipboard".
- **Tester Result:** `[ ] PASS` &nbsp; `[ ] FAIL` &nbsp; | Notes: __________________________

---

### Module 4: AI Workflow & System Architecture Dialog

#### `QA-WKF-01`: Open AI Workflow Modal
- **Goal:** Verify that users can inspect how the AI pipeline works at any time.
- **Step-by-Step Instructions:**
  1. On the AI Advisor card header, click the **"AI Workflow"** button (next to Refresh).
- **Expected Success Outcome:**
  - [ ] Modal opens titled **"How the AI Workflow Operates"**.
  - [ ] Clear subtitle explains deterministic rules combined with Google Gemini 3.8 Flash.
- **Failure Criteria & What to Watch For:**
  - ❌ Button does not respond or modal fails to open.
- **Tester Result:** `[ ] PASS` &nbsp; `[ ] FAIL` &nbsp; | Notes: __________________________

---

#### `QA-WKF-02`: Verify 4-Layer Workflow Explanations
- **Goal:** Verify all 4 architectural steps are clearly documented in the UI.
- **Step-by-Step Instructions:**
  1. In the open AI Workflow dialog, review the 4 steps:
     - **Step 1:** Deterministic Inventory Rules Engine (5 mathematical states).
     - **Step 2:** Google Gemini 3.8 Flash Synthesis (2-3 marketing strategies + restocks).
     - **Step 3:** Anti-Hallucination & Schema Validation (checks against catalog).
     - **Step 4:** Hourly Auto-Refresh & Deterministic Fallback (zero downtime).
  2. Click **"Got it"** to dismiss the dialog.
- **Expected Success Outcome:**
  - [ ] All 4 steps are styled with clear color-coded icons and concise descriptions.
  - [ ] Dialog closes smoothly when clicking "Got it" or the "X" button.
- **Tester Result:** `[ ] PASS` &nbsp; `[ ] FAIL` &nbsp; | Notes: __________________________

---

### Module 5: Product Import (Excel .xlsx & CSV)

#### `QA-IMP-01`: Download Sample Spreadsheets
- **Goal:** Verify users can download formatted sample templates in both CSV and Excel formats.
- **Preconditions:** Navigate to `/inventory`.
- **Step-by-Step Instructions:**
  1. On `/inventory`, locate the toolbar above the items table.
  2. Click the **"Import"** button (with green spreadsheet icon).
  3. In the top banner, click **"CSV Template"**.
  4. In the top banner, click **"Excel Template"**.
- **Expected Success Outcome:**
  - [ ] Browser downloads `smart_inventory_products_template.csv`.
  - [ ] Browser downloads `smart_inventory_products_template.xlsx`.
  - [ ] Opening either file in Excel shows columns: `Product Name`, `SKU`, `Category`, `Unit`, `Starting Quantity`, `Low Stock Threshold`, `Selling Price`, `Cost Price`, `Expiry Date`, `Notes`.
- **Failure Criteria & What to Watch For:**
  - ❌ Download fails or file is corrupt.
- **Tester Result:** `[ ] PASS` &nbsp; `[ ] FAIL` &nbsp; | Notes: __________________________

---

#### `QA-IMP-02`: Upload and Parse Valid Excel (.xlsx) File
- **Goal:** Verify Excel spreadsheets are parsed into live product rows with preview.
- **Step-by-Step Instructions:**
  1. Open the downloaded `smart_inventory_products_template.xlsx` (or create an Excel file with 2-3 products).
  2. Inside the Import dialog, click the upload area (or drag & drop the file).
  3. Select your `.xlsx` file.
- **Expected Success Outcome:**
  - [ ] File name is displayed with a green checkmark.
  - [ ] **Spreadsheet Preview** appears showing product names, categories, quantities, and prices.
  - [ ] Green badge displays: `X ready to import` (e.g. `3 ready to import`).
  - [ ] Green **"Valid"** indicator appears on each row.
- **Failure Criteria & What to Watch For:**
  - ❌ Toast "Please upload a valid .xlsx or .csv spreadsheet file".
  - ❌ File parsing error or frozen screen.
- **Tester Result:** `[ ] PASS` &nbsp; `[ ] FAIL` &nbsp; | Notes: __________________________

---

#### `QA-IMP-03`: Execute Batch Import & Confirm Inventory Insertion
- **Goal:** Verify that confirming the import writes all products to the database and refreshes the table.
- **Step-by-Step Instructions:**
  1. With valid parsed products in the preview, click **"Confirm Import (X Items)"**.
  2. Watch the button change to *"Importing Products..."* with a spinner.
- **Expected Success Outcome:**
  - [ ] Modal automatically closes.
  - [ ] Success toast: *"Successfully imported X products into your inventory!"*.
  - [ ] The items table refreshes immediately and displays the newly imported products.
  - [ ] Initial stock movements are recorded for all products with starting quantity > 0.
- **Failure Criteria & What to Watch For:**
  - ❌ Items do not appear in the table after import.
  - ❌ Duplicate SKU error without explanation.
- **Tester Result:** `[ ] PASS` &nbsp; `[ ] FAIL` &nbsp; | Notes: __________________________

---

#### `QA-IMP-04`: Reject Invalid Rows (Negative Quantity or Missing Name)
- **Goal:** Verify spreadsheet validation catches corrupt or invalid rows before saving.
- **Step-by-Step Instructions:**
  1. Create a test CSV or Excel file where one row has a blank Product Name and another has quantity `-10`.
  2. Upload the file in the Import dialog.
- **Expected Success Outcome:**
  - [ ] Preview marks the invalid rows in light red.
  - [ ] Shows exact error reason: *"Missing product name"* or *"Quantity cannot be negative"*.
  - [ ] Red badge displays `X invalid`.
  - [ ] Only valid rows can be imported, or user can clear and fix the file.
- **Tester Result:** `[ ] PASS` &nbsp; `[ ] FAIL` &nbsp; | Notes: __________________________

---

### Module 6: Category Creation & Management

#### `QA-CAT-01`: Open Category Management Dialog
- **Goal:** Verify users can view, add, and delete categories from the dedicated categories manager.
- **Step-by-Step Instructions:**
  1. Navigate to `/inventory`.
  2. In the toolbar next to "Add Item", click the **"Categories"** button (tag icon).
- **Expected Success Outcome:**
  - [ ] Modal opens titled **"Manage Product Categories"**.
  - [ ] Lists existing store categories with count badge.
  - [ ] Displays **"Quick Add Common Categories"** pill suggestions (e.g. *Bakery*, *Beverages*, *Dairy & Eggs*, *Fresh Produce*).
- **Failure Criteria & What to Watch For:**
  - ❌ Button missing or clicking does nothing.
- **Tester Result:** `[ ] PASS` &nbsp; `[ ] FAIL` &nbsp; | Notes: __________________________

---

#### `QA-CAT-02`: Quick-Add Suggested Category
- **Goal:** Verify clicking a quick-add pill immediately creates the category.
- **Step-by-Step Instructions:**
  1. In the Categories dialog, click any suggested pill (e.g., **"+ Beverages"**).
- **Expected Success Outcome:**
  - [ ] Toast appears: *"Created category "Beverages""*.
  - [ ] "Beverages" moves into the **"Existing Store Categories"** list.
  - [ ] The pill disappears from the suggestions list.
- **Failure Criteria & What to Watch For:**
  - ❌ Error toast "Failed to create category" (verify Supabase project is resumed).
- **Tester Result:** `[ ] PASS` &nbsp; `[ ] FAIL` &nbsp; | Notes: __________________________

---

#### `QA-CAT-03`: Create Custom Category
- **Goal:** Verify creating a custom category via the text input.
- **Step-by-Step Instructions:**
  1. In the Categories dialog input box, type: `Organic Gourmet Snacks`.
  2. Click **"Add"** (or press Enter).
- **Expected Success Outcome:**
  - [ ] Toast: *"Created category "Organic Gourmet Snacks""*.
  - [ ] Input box clears.
  - [ ] The new category appears in the list.
  - [ ] Click **"Done"** to close the dialog.
  - [ ] Open the **Category Filter** dropdown on `/inventory`: `Organic Gourmet Snacks` is now an available filter option!
- **Tester Result:** `[ ] PASS` &nbsp; `[ ] FAIL` &nbsp; | Notes: __________________________

---

#### `QA-CAT-04`: Create Category On-the-Fly Inside "Add Item" Dialog
- **Goal:** Verify a user can create a brand new category while adding a product without opening the category manager.
- **Step-by-Step Instructions:**
  1. On `/inventory`, click **"Add Item"**.
  2. Look at the **Category** section.
  3. If you have existing categories, click the dropdown and choose **"+ Create new category..."** (or click "+ New category" link).
  4. The input switches to a text box. Type: `Fresh Bakery Delights`.
  5. Fill Name: `Artisan Croissant`, Qty: `20`.
  6. Click **"Add to Inventory"**.
- **Expected Success Outcome:**
  - [ ] Item is created under category `Fresh Bakery Delights`.
  - [ ] Toast: *"Added "Artisan Croissant" to inventory"*.
  - [ ] Category `Fresh Bakery Delights` is now saved in your store categories list!
- **Failure Criteria & What to Watch For:**
  - ❌ Cannot type new category name.
- **Tester Result:** `[ ] PASS` &nbsp; `[ ] FAIL` &nbsp; | Notes: __________________________

---

### Module 7: Interactive System Tour ("Take a Tour") & Loading

#### `QA-TUR-01`: Launch System Tour from Top Navigation
- **Goal:** Verify that clicking "Take a Tour" in the topbar opens the interactive tour.
- **Step-by-Step Instructions:**
  1. Look at the top navigation bar (next to the theme toggle icon).
  2. Click the **"Take a Tour"** button (compass icon).
- **Expected Success Outcome:**
  - [ ] An interactive modal opens titled **"Step 1 of 7: Welcome to Smart Inventory AI"**.
  - [ ] Blue progress bar shows `14%` progress.
  - [ ] Key capabilities bullet points are displayed.
- **Failure Criteria & What to Watch For:**
  - ❌ Button not visible or dialog fails to open.
- **Tester Result:** `[ ] PASS` &nbsp; `[ ] FAIL` &nbsp; | Notes: __________________________

---

#### `QA-TUR-02`: Step Through All 7 Tour Stages
- **Goal:** Verify smooth navigation through all system feature spotlights.
- **Step-by-Step Instructions:**
  1. With the tour open, click **"Next"** repeatedly.
  2. Verify all 7 steps appear:
     - **Step 1:** System Overview
     - **Step 2:** AI Business Advisor (Gemini 3.8 Flash)
     - **Step 3:** Catalog & Quick Stock Adjustments
     - **Step 4:** Excel (.xlsx) & CSV Bulk Product Import
     - **Step 5:** Product Category Creation & Filtering
     - **Step 6:** Suppliers Directory & Lead Times
     - **Step 7:** Instant Telegram Bot Notifications
  3. On Step 7, click **"Previous"** to verify backward navigation works.
  4. Click **"Next"** back to Step 7, then click **"Get Started"**.
- **Expected Success Outcome:**
  - [ ] Progress bar smoothly animates from 14% to 100%.
  - [ ] Clicking "Previous" decrements step counter.
  - [ ] Clicking "Get Started" closes the modal cleanly.
  - [ ] Clicking "Skip Tour" on any slide closes the tour immediately.
- **Tester Result:** `[ ] PASS` &nbsp; `[ ] FAIL` &nbsp; | Notes: __________________________

---

#### `QA-TUR-03`: Verify Loading Skeletons on Navigation
- **Goal:** Verify that page transitions display smooth skeleton loaders without layout shifts.
- **Step-by-Step Instructions:**
  1. Open Network tab in Developer Tools (optional: set throttling to "Fast 3G").
  2. Click between **"Dashboard"**, **"Inventory"**, **"Suppliers"**, and **"Settings"**.
- **Expected Success Outcome:**
  - [ ] Modern pulsing skeleton placeholders appear (4 stat cards, AI advisor card outline, chart placeholders).
  - [ ] No jarring blank white screens or layout jumps.
  - [ ] Smooth transition as data resolves.
- **Tester Result:** `[ ] PASS` &nbsp; `[ ] FAIL` &nbsp; | Notes: __________________________

---

### Module 8: Stock Adjustments & Low Stock Warnings

#### `QA-STK-01`: Inline Quick Sale (-1) and Restock (+1)
- **Goal:** Verify 1-click quantity adjustments directly on table rows.
- **Step-by-Step Instructions:**
  1. Navigate to `/inventory`.
  2. In any product row with quantity > 0, click the **"-"** button (Record 1 unit sold).
  3. Observe quantity count.
  4. Click the **"+"** button (Receive 1 unit restock).
- **Expected Success Outcome:**
  - [ ] Quantity decrements by 1 on click of `-`.
  - [ ] Quantity increments by 1 on click of `+`.
  - [ ] Toast confirms: *"Recorded 1 unit sale"* / *"Recorded 1 unit restock"*.
  - [ ] If quantity reaches 0, the `-` button is disabled (preventing negative stock).
- **Failure Criteria & What to Watch For:**
  - ❌ Stock drops to negative numbers (e.g. -1).
- **Tester Result:** `[ ] PASS` &nbsp; `[ ] FAIL` &nbsp; | Notes: __________________________

---

#### `QA-STK-02`: Atomic Stock Adjustment Dialog with Audit Reason
- **Goal:** Verify custom delta adjustments with reason logging (e.g. damaged goods, supplier delivery).
- **Step-by-Step Instructions:**
  1. On `/inventory`, click the row action menu (`...`) on any item -> Click **"Adjust Stock"**.
  2. Choose reason: **"Adjustment"** or **"Damaged"**.
  3. Enter delta: `-5`.
  4. Type note: `Water damaged box during transport`.
  5. Click **"Save Adjustment"**.
- **Expected Success Outcome:**
  - [ ] Modal closes.
  - [ ] Quantity decreases by 5.
  - [ ] Click the item's name to view details: audit timeline logs the exact -5 change, timestamp, and note.
- **Tester Result:** `[ ] PASS` &nbsp; `[ ] FAIL` &nbsp; | Notes: __________________________

---

### Module 9: Telegram Bot Real-Time Alerts

#### `QA-TEL-01`: Connect Store to Telegram Bot
- **Goal:** Verify linking store alerts to Telegram.
- **Preconditions:** Telegram app installed on your phone or desktop.
- **Step-by-Step Instructions:**
  1. In the sidebar, click **"Telegram Alerts"** (or visit `/alerts`).
  2. Locate the **"Telegram Bot Integration"** card.
  3. Click **"Generate Link Code"**.
  4. Copy the 6-character code (or click the direct link to `@AIinventorysystemBOT`).
  5. In Telegram, send the command: `/start [CODE]`.
- **Expected Success Outcome:**
  - [ ] Bot replies: *"✅ Store successfully linked! You will now receive instant inventory alerts."*
  - [ ] The web page updates to show status badge **"Connected"** with your Telegram username.
- **Failure Criteria & What to Watch For:**
  - ❌ Bot does not respond (check if bot token is valid in `.env.local`).
- **Tester Result:** `[ ] PASS` &nbsp; `[ ] FAIL` &nbsp; | Notes: __________________________

---

## 📊 Summary Scorecard

| Module | Total Tests | Passed | Failed | Blocked | Notes |
| :--- | :---: | :---: | :---: | :---: | :--- |
| **1. Auth & Google Login** | 4 | | | | |
| **2. AI Advisor & Refresh** | 3 | | | | |
| **3. Marketing Strategies** | 3 | | | | |
| **4. AI Workflow Architecture** | 2 | | | | |
| **5. Excel & CSV Import** | 4 | | | | |
| **6. Category Management** | 4 | | | | |
| **7. System Tour & Loading** | 3 | | | | |
| **8. Stock Levels & ACID** | 2 | | | | |
| **9. Telegram Alerts** | 1 | | | | |
| **TOTAL** | **26** | | | | |

---

> **Ready to test?**  
> 1. Make sure your Supabase project is active (see Step 1 above).  
> 2. Open `http://localhost:3000/dashboard` in your browser.  
> 3. Go through each test case in sequence and check off `[X] PASS` as you verify each feature!
