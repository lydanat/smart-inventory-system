import { test, expect } from '@playwright/test';

test.describe('Inventory CRUD and Tenant Isolation E2E', () => {
  const timestamp = Date.now();
  const emailA = `tenant_a_${timestamp}@test.internal`;
  const emailB = `tenant_b_${timestamp}@test.internal`;
  const password = 'Password123!';
  let itemAId: string;

  test('Business A performs full CRUD with optimistic stock adjust and archive/undo', async ({ page }) => {
    // 1. Sign up Business A
    await page.goto('/signup');
    await page.fill('#businessName', `Store Alpha ${timestamp}`);
    await page.fill('#email', emailA);
    await page.fill('#password', password);
    await page.click('button[type="submit"]');

    // 2. Navigate to Inventory
    await expect(page).toHaveURL('/dashboard', { timeout: 15000 });
    await page.goto('/inventory');
    await expect(page).toHaveURL('/inventory');
    await expect(page.locator('text=Inventory Management')).toBeVisible();
    await expect(page.getByText('No items found matching your filters').first()).toBeVisible();

    // 3. Add an Item via ItemSheet
    await page.click('button:has-text("Add Item")');
    await expect(page.locator('text=Add New Item')).toBeVisible();

    await page.fill('#name', 'Organic Honey Jar 500g');
    await page.fill('#sku', `HONEY-${timestamp}`);
    await page.fill('#category', 'Pantry');
    await page.fill('#unit', 'jars');
    await page.fill('#quantity', '20');
    await page.fill('#lowStockThreshold', '5');
    await page.fill('#price', '12.50');
    await page.fill('#notes', 'Store in dry pantry. Glass jar.');

    await page.click('button[type="submit"]:has-text("Add Item")');
    await expect(page.getByRole('link', { name: 'Organic Honey Jar 500g' }).filter({ visible: true })).toBeVisible({ timeout: 10000 });
    await expect(page.getByText('In Stock', { exact: true }).filter({ visible: true })).toBeVisible();

    // 4. Quick Stock Adjustment: Record sale of 16 units -> Stock becomes 4 -> Status flips to Low Stock!
    await page.locator('button[title="Record 1 unit sold"], button:has-text("Sale (-1)")').filter({ visible: true }).first().click();
    await expect(page.locator('text=Adjust Stock Level')).toBeVisible();
    await page.fill('#delta', '-16');
    await page.click('button:has-text("Save Adjustment")');

    // Verify stock is now 4 jars and Low badge appears
    await expect(page.getByText('4 jars').filter({ visible: true }).first()).toBeVisible({ timeout: 10000 });
    await expect(page.getByText('Low (4 left)').filter({ visible: true }).first()).toBeVisible();

    // 5. Open Item Detail View
    await page.getByRole('link', { name: 'Organic Honey Jar 500g' }).filter({ visible: true }).first().click();
    await expect(page).toHaveURL(/\/inventory\/[a-f0-9-]+/);
    const url = page.url();
    itemAId = url.split('/inventory/')[1];
    expect(itemAId).toBeDefined();

    await expect(page.locator('text=Stock Movement Log')).toBeVisible();
    await expect(page.getByRole('cell', { name: '-16 jars' })).toBeVisible();

    // 6. Test Archive and Undo from Inventory table
    await page.goto('/inventory');
    // Open action menu (desktop or mobile)
    await page.locator('button:has-text("Actions"), button:has([class*="lucide-more-horizontal"])').filter({ visible: true }).first().click();
    await page.click('text=Archive Item');

    // Toast with Undo action should appear
    await expect(page.locator('text=Archived "Organic Honey Jar 500g"')).toBeVisible();
    await expect(page.locator('button:has-text("Undo")')).toBeVisible();
    await page.click('button:has-text("Undo")');
    await expect(page.locator('text=Restored "Organic Honey Jar 500g"')).toBeVisible();
    await expect(page.getByRole('link', { name: 'Organic Honey Jar 500g' }).filter({ visible: true })).toBeVisible();
  });

  test('Business B cannot see Business A inventory (Cross-tenant data isolation & IDOR 404)', async ({ page }) => {
    // 1. Sign up Business B
    await page.goto('/signup');
    await page.fill('#businessName', `Store Beta ${timestamp}`);
    await page.fill('#email', emailB);
    await page.fill('#password', password);
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL('/dashboard', { timeout: 15000 });

    // 2. Open Inventory
    await page.goto('/inventory');
    // Verify Honey Jar is NOT in Business B's table
    await expect(page.locator('text=Organic Honey Jar 500g')).not.toBeVisible();
    await expect(page.getByText('No items found matching your filters').first()).toBeVisible();

    // 3. IDOR test: Attempt to directly navigate to Business A's item URL
    if (itemAId) {
      await page.goto(`/inventory/${itemAId}`);
      // Must NOT leak Business A item details
      await expect(page.locator('text=Organic Honey Jar 500g')).not.toBeVisible();
      await expect(page.locator('text=Item or Page Not Found')).toBeVisible();
    }
  });
});
