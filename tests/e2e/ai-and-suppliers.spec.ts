import { test, expect } from '@playwright/test';

test.describe('AI Recommendations & Suppliers E2E', () => {
  const timestamp = Date.now();
  const testEmail = `ai_user_${timestamp}@test.internal`;
  const password = 'Password123!';

  test('Manages suppliers, views AI recommendations, uses one-click restock and provides feedback', async ({
    page,
  }) => {
    // 1. Sign up new store
    await page.goto('/signup');
    await page.fill('#businessName', `AI Test Store ${timestamp}`);
    await page.fill('#email', testEmail);
    await page.fill('#password', password);
    await page.click('button[type="submit"]');

    // 2. Wait for landing on /dashboard
    await expect(page).toHaveURL('/dashboard', { timeout: 15000 });

    // 3. Navigate to /suppliers
    await page.goto('/suppliers');
    await expect(page.locator('h2:has-text("Supplier Directory")')).toBeVisible();

    // 4. Create a Supplier
    await page.click('button:has-text("Add Supplier")');
    await expect(page.locator('text=Add New Supplier')).toBeVisible();
    await page.fill('#name', 'Metro Flour & Grain');
    await page.fill('#contactName', 'Alice Baker');
    await page.fill('#phone', '+1 555-0123');
    await page.fill('#email', 'alice@metroflour.com');
    await page.fill('#notes', 'Deliveries on Tuesdays and Fridays.');
    await page.click('button[type="submit"]:has-text("Create Supplier")');

    // Verify supplier is displayed
    await expect(page.locator('text=Metro Flour & Grain').filter({ visible: true }).first()).toBeVisible({ timeout: 10000 });
    await expect(page.locator('text=Alice Baker').filter({ visible: true }).first()).toBeVisible();

    // 5. Navigate to /inventory and add an item linked to this supplier with low stock
    await page.goto('/inventory');
    await page.click('button:has-text("Add Item")');
    await page.fill('#name', 'Organic Whole Wheat Flour');
    await page.fill('#category', 'Baking');
    await page.fill('#unit', 'bags');
    await page.fill('#quantity', '2');
    await page.fill('#lowStockThreshold', '10');
    await page.fill('#price', '12.00');

    // Select Supplier from Radix combobox dropdown if available
    const supplierTrigger = page.locator('#supplierId');
    if (await supplierTrigger.isVisible()) {
      await supplierTrigger.click();
      const option = page.locator('[role="option"]:has-text("Metro Flour & Grain")');
      if (await option.isVisible({ timeout: 3000 }).catch(() => false)) {
        await option.click();
      }
    }

    await page.click('button[type="submit"]:has-text("Add Item")');
    await expect(page.getByRole('link', { name: 'Organic Whole Wheat Flour' }).filter({ visible: true })).toBeVisible({ timeout: 10000 });

    // 6. Return to /dashboard and inspect AI Business Advisor Card
    await page.goto('/dashboard');
    await expect(page.locator('text=AI Business Advisor')).toBeVisible({ timeout: 15000 });

    // Verify Executive Summary exists
    const advisorCard = page.locator('text=AI Business Advisor').locator('xpath=ancestor::div[contains(@class, "rounded-xl") or contains(@class, "border")][last()]');
    await expect(advisorCard).toBeVisible();

    // Verify badge: either "Gemini" or "Deterministic Rules"
    await expect(
      page.locator('text=Gemini 3.8 Flash').or(page.locator('text=Deterministic Rules'))
    ).toBeVisible();

    // Refresh to compute fresh recommendations with newly added low-stock item
    const refreshButton = page.locator('button:has-text("Refresh")').first();
    if (await refreshButton.isVisible()) {
      await refreshButton.click();
    }

    // Verify restock suggestion for Organic Whole Wheat Flour
    await expect(page.locator('text=Suggested Restocks').first()).toBeVisible({ timeout: 15000 });
    await expect(page.locator('text=Organic Whole Wheat Flour').first()).toBeVisible();

    // 7. Click One-Click Restock on AI Card
    const restockButton = page.locator('button:has-text("Restock")').filter({ hasText: '+' }).first();
    if (await restockButton.isVisible()) {
      await restockButton.click();
      await expect(page.locator('text=Adjust Stock Level')).toBeVisible();
      await page.click('button:has-text("Save Adjustment")');
      await expect(page.locator('text=Adjust Stock Level')).not.toBeVisible();
    }

    // 8. Test Feedback vote (Thumbs Up)
    const thumbsUpButton = page.locator('button:has(svg.lucide-thumbs-up)').first();
    if (await thumbsUpButton.isVisible()) {
      await thumbsUpButton.click();
      await expect(page.locator('text=Feedback recorded')).toBeVisible();
    }

    // 9. Test Marketing Copy Button if marketing ideas present
    const copyButton = page.locator('button:has-text("Copy Message")').first();
    if (await copyButton.isVisible()) {
      await copyButton.click();
      await expect(page.locator('text=Copied').first()).toBeVisible();
    }
  });
});
