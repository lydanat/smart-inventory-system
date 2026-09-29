import { test, expect } from '@playwright/test';

test.describe('Stage 10 Complete Live Demo Rehearsal', () => {
  const timestamp = Date.now();
  const user1Email = `demo_user1_${timestamp}@test.internal`;
  const user2Email = `demo_user2_${timestamp}@test.internal`;
  const password = 'DemoPassword123!';

  test('Rehearses full demo: signup -> add stock -> go low -> telegram flow -> AI insights -> cross-tenant isolation', async ({
    page,
  }) => {
    // -------------------------------------------------------------
    // Step 1: Sign up User 1 ("Fresh Harvest Mart")
    // -------------------------------------------------------------
    await page.goto('/signup');
    await page.fill('#businessName', `Fresh Harvest Mart ${timestamp}`);
    await page.fill('#email', user1Email);
    await page.fill('#password', password);
    await page.click('button[type="submit"]');

    await expect(page).toHaveURL('/dashboard', { timeout: 15000 });
    await expect(
      page.locator(`text=Welcome to Fresh Harvest Mart ${timestamp}`)
    ).toBeVisible();

    // -------------------------------------------------------------
    // Step 2: Add initial stock in /inventory
    // -------------------------------------------------------------
    await page.goto('/inventory');
    await page.click('button:has-text("Add Item")');
    await page.fill('#name', 'Organic Fuji Apples');
    await page.fill('#category', 'Produce');
    await page.fill('#unit', 'lbs');
    await page.fill('#quantity', '25');
    await page.fill('#lowStockThreshold', '5');
    await page.fill('#price', '4.50');
    await page.click('button[type="submit"]:has-text("Add Item")');

    const appleLink = page.getByRole('link', { name: 'Organic Fuji Apples' }).filter({ visible: true });
    await expect(appleLink).toBeVisible({ timeout: 10000 });

    // Capture User 1 Item ID from link href
    const itemHref = await appleLink.getAttribute('href');
    expect(itemHref).toContain('/inventory/');

    // -------------------------------------------------------------
    // Step 3: Go low — Record sale of 22 units (leaves 3 units <= threshold 5)
    // -------------------------------------------------------------
    await page.locator('button[title="Record 1 unit sold"], button:has-text("Sale (-1)")').filter({ visible: true }).first().click();
    await expect(page.locator('text=Adjust Stock Level')).toBeVisible();
    await page.fill('#delta', '-22');
    await page.click('button:has-text("Save Adjustment")');
    await expect(page.locator('text=Adjust Stock Level')).not.toBeVisible();

    // Return to dashboard and verify Attention list shows Low Stock badge
    await page.goto('/dashboard');
    await expect(page.locator('text=Immediate Attention Needed')).toBeVisible({ timeout: 10000 });
    await expect(page.locator('text=Organic Fuji Apples').first()).toBeVisible();
    await expect(page.locator('text=Low Stock').first()).toBeVisible();

    // -------------------------------------------------------------
    // Step 4: Telegram link & alert status flow
    // -------------------------------------------------------------
    await page.goto('/alerts');
    await expect(page.locator('h2:has-text("Telegram Alerts & Settings")')).toBeVisible();

    // Generate link code
    const connectButton = page.locator('button:has-text("Generate Connection Code")').or(page.locator('button:has-text("Refresh Code")')).first();
    if (await connectButton.isVisible()) {
      await connectButton.click();
      await expect(page.locator('text=Open in Telegram App')).toBeVisible({ timeout: 10000 });
    }

    // -------------------------------------------------------------
    // Step 5: AI Insights card on Dashboard
    // -------------------------------------------------------------
    await page.goto('/dashboard');
    await expect(page.locator('text=AI Business Advisor')).toBeVisible({ timeout: 15000 });

    // Click refresh to trigger on-demand analysis of low-stock item
    const refreshButton = page.locator('button:has-text("Refresh")').first();
    if (await refreshButton.isVisible()) {
      await refreshButton.click();
    }

    // Verify suggested restock appeared for Organic Fuji Apples
    await expect(page.locator('text=Suggested Restocks').first()).toBeVisible({ timeout: 15000 });
    await expect(page.locator('text=Organic Fuji Apples').first()).toBeVisible();

    // One-click restock button opens pre-filled dialog
    const restockActionBtn = page.locator('button:has-text("Restock")').filter({ hasText: '+' }).first();
    if (await restockActionBtn.isVisible()) {
      await restockActionBtn.click();
      await expect(page.locator('text=Adjust Stock Level')).toBeVisible();
      await page.click('button:has-text("Cancel")');
    }

    // -------------------------------------------------------------
    // Step 6: Second Account cannot see First Account data (Isolation)
    // -------------------------------------------------------------
    // Sign out User 1
    await page.goto('/settings');
    await page.click('button:has-text("Sign Out")');
    await expect(page).toHaveURL('/login', { timeout: 10000 });

    // Sign up User 2 ("Green Valley Grocers")
    await page.goto('/signup');
    await page.fill('#businessName', `Green Valley Grocers ${timestamp}`);
    await page.fill('#email', user2Email);
    await page.fill('#password', password);
    await page.click('button[type="submit"]');

    await expect(page).toHaveURL('/dashboard', { timeout: 15000 });
    await expect(
      page.locator(`text=Welcome to Green Valley Grocers ${timestamp}`)
    ).toBeVisible();

    // User 2 sees 0 SKUs and healthy state
    await expect(page.locator('text=All inventory healthy')).toBeVisible();

    // User 2 visits inventory: 0 items
    await page.goto('/inventory');
    await expect(page.locator('text=Organic Fuji Apples')).not.toBeVisible();

    // User 2 attempts IDOR direct navigation to User 1 item URL -> Expect 404
    await page.goto(itemHref!);
    await expect(page.locator('text=Item or Page Not Found')).toBeVisible({ timeout: 10000 });
  });
});
