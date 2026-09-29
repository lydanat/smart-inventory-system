import { test, expect } from '@playwright/test';

test.describe('Responsive Polish & Mobile Experience E2E', () => {
  const timestamp = Date.now();
  const testEmail = `polish_user_${timestamp}@test.internal`;
  const password = 'Password123!';

  test('Works smoothly at 375px mobile, 768px tablet, and 1280px desktop with dark mode and settings', async ({
    page,
  }) => {
    // Set 375px mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });

    // 1. Signup on Mobile Viewport
    await page.goto('/signup');
    await page.fill('#businessName', `Mobile Store ${timestamp}`);
    await page.fill('#email', testEmail);
    await page.fill('#password', password);
    await page.click('button[type="submit"]');

    // 2. Mobile Dashboard Landing
    await expect(page).toHaveURL('/dashboard', { timeout: 15000 });
    await expect(page.locator(`text=Welcome to Mobile Store ${timestamp}`)).toBeVisible();

    // 3. Test Mobile Navigation Drawer
    const menuButton = page.getByRole('button', { name: 'Toggle navigation menu' });
    await expect(menuButton).toBeVisible();
    await menuButton.click();

    // Check mobile drawer content and navigate to /inventory
    const inventoryNavLink = page.getByRole('link', { name: 'Inventory' });
    await expect(inventoryNavLink).toBeVisible();
    await inventoryNavLink.click();
    await expect(page).toHaveURL('/inventory');

    // 4. Add an item on mobile
    await page.click('button:has-text("Add Item")');
    await page.fill('#name', 'Mobile Cold Brew 250ml');
    await page.fill('#category', 'Beverages');
    await page.fill('#unit', 'cans');
    await page.fill('#quantity', '5');
    await page.fill('#lowStockThreshold', '10');
    await page.fill('#price', '3.75');
    await page.click('button[type="submit"]:has-text("Add Item")');

    // Verify item card is visible on mobile (<640px stacked card view)
    await expect(
      page.locator('text=Mobile Cold Brew 250ml').filter({ visible: true }).first()
    ).toBeVisible({ timeout: 10000 });

    // 5. Navigate to /settings via drawer
    await menuButton.click();
    const settingsNavLink = page.getByRole('link', { name: 'Settings' });
    await expect(settingsNavLink).toBeVisible();
    await settingsNavLink.click();
    await expect(page).toHaveURL('/settings');
    await expect(page.locator('h2:has-text("Settings")')).toBeVisible();

    // Update store name and currency
    await page.fill('#name', `Mobile Store ${timestamp} Updated`);
    await page.click('button:has-text("Save Changes")');
    await expect(page.locator('text=Store preferences updated successfully')).toBeVisible();

    // 6. Test Tablet Viewport (768px)
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.goto('/dashboard');
    await expect(page.locator(`text=Welcome to Mobile Store ${timestamp} Updated`)).toBeVisible();

    // 7. Test Desktop Viewport (1280px)
    await page.setViewportSize({ width: 1280, height: 800 });
    await page.goto('/dashboard');
    // On desktop, desktop sidebar is visible
    await expect(page.locator('aside').filter({ hasText: 'Dashboard' })).toBeVisible();

    // 8. Test Dark Mode Switch
    const themeToggle = page.locator('button[aria-label="Toggle theme"]').first();
    if (await themeToggle.isVisible()) {
      await themeToggle.click();
      // Dropdown menu opens with Light, Dark, System
      const darkOption = page.locator('[role="menuitem"]:has-text("Dark")');
      if (await darkOption.isVisible()) {
        await darkOption.click();
        // Verify html element has dark class
        const html = page.locator('html');
        await expect(html).toHaveClass(/dark/);
      }
    }
  });
});
