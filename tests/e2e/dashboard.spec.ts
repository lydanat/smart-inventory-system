import { test, expect } from '@playwright/test';

test.describe('Dashboard Overview E2E', () => {
  const timestamp = Date.now();
  const testEmail = `dashboard_user_${timestamp}@test.internal`;
  const password = 'Password123!';

  test('Dashboard shows metrics, onboarding checklist, attention list, and supports inline restock', async ({
    page,
  }) => {
    // 1. Sign up new store
    await page.goto('/signup');
    await page.fill('#businessName', `Dashboard Store ${timestamp}`);
    await page.fill('#email', testEmail);
    await page.fill('#password', password);
    await page.click('button[type="submit"]');

    // 2. Land on /dashboard
    await expect(page).toHaveURL('/dashboard', { timeout: 15000 });
    await expect(page.locator(`text=Welcome to Dashboard Store ${timestamp}`)).toBeVisible();

    // 3. Verify Onboarding Checklist appears for new store (<3 items)
    await expect(page.locator('text=Getting Started Checklist')).toBeVisible();
    await expect(page.locator('text=1. Create Store')).toBeVisible();
    await expect(page.locator('text=2. Add 3 Items (0/3)')).toBeVisible();

    // 4. Verify Initial Stat Cards show 0 items and healthy state
    await expect(page.locator('text=Total SKUs')).toBeVisible();
    await expect(page.locator('text=All inventory healthy')).toBeVisible();

    // 5. Navigate to Inventory and create an item with low stock (qty: 2, threshold: 5)
    await page.goto('/inventory');
    await page.click('button:has-text("Add Item")');
    await page.fill('#name', 'Organic Sourdough Bread');
    await page.fill('#category', 'Bakery');
    await page.fill('#unit', 'loaves');
    await page.fill('#quantity', '2');
    await page.fill('#lowStockThreshold', '5');
    await page.fill('#price', '6.50');
    await page.click('button[type="submit"]:has-text("Add Item")');
    await expect(page.getByRole('link', { name: 'Organic Sourdough Bread' }).filter({ visible: true })).toBeVisible({ timeout: 10000 });

    // 6. Return to Dashboard and verify metrics update
    await page.goto('/dashboard');
    await expect(page).toHaveURL('/dashboard');

    // Onboarding checklist progress updated to 1/3
    await expect(page.locator('text=2. Add 3 Items (1/3)')).toBeVisible();

    // Attention Needed list now shows Organic Sourdough Bread with Low Stock badge
    await expect(page.locator('text=Immediate Attention Needed')).toBeVisible();
    await expect(page.locator('text=Organic Sourdough Bread').first()).toBeVisible();
    await expect(page.locator('text=Low Stock').first()).toBeVisible();

    // 7. Inline Quick Restock from Dashboard Attention List
    await page.locator('button:has-text("Quick Restock")').first().click();
    await expect(page.locator('text=Adjust Stock Level')).toBeVisible();
    await page.fill('#delta', '10');
    await page.click('button:has-text("Save Adjustment")');

    // 8. Verify item is restocked to 12 loaves and Attention List flips to "All inventory healthy"
    await expect(page.locator('text=All inventory healthy')).toBeVisible({ timeout: 10000 });

    // 9. Test Dismissing the Onboarding Checklist
    await page.locator('button[title="Dismiss onboarding guide"]').click();
    await expect(page.locator('text=Getting Started Checklist')).not.toBeVisible();

    // Reload page to verify dismiss persistence
    await page.reload();
    await expect(page.locator('text=Getting Started Checklist')).not.toBeVisible();
  });
});
