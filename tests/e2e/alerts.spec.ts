import { test, expect } from '@playwright/test';

test.describe('Telegram Alerts & Settings E2E', () => {
  const timestamp = Date.now();
  const testEmail = `alerts_user_${timestamp}@test.internal`;
  const password = 'Password123!';

  test('User views Alerts page, generates 15-minute connection code, and inspects bot commands', async ({
    page,
  }) => {
    // 1. Sign up new store
    await page.goto('/signup');
    await page.fill('#businessName', `Alerts Store ${timestamp}`);
    await page.fill('#email', testEmail);
    await page.fill('#password', password);
    await page.click('button[type="submit"]');

    await expect(page).toHaveURL('/dashboard', { timeout: 15000 });

    // 2. Navigate to Alerts & Settings
    await page.goto('/alerts');
    await expect(page).toHaveURL('/alerts');
    await expect(page.locator('h2:has-text("Telegram Alerts & Settings")')).toBeVisible();

    // 3. Verify Connection card shows Not Linked
    await expect(page.locator('text=Telegram Bot Channel')).toBeVisible();
    await expect(page.locator('text=Not Linked')).toBeVisible();
    await expect(page.locator('text=Available Bot Commands')).toBeVisible();
    await expect(page.locator('text=/status')).toBeVisible();
    await expect(page.locator('text=/low')).toBeVisible();
    await expect(page.locator('text=/stop')).toBeVisible();

    // 4. Click "Connect Telegram" to generate temporary link code
    await page.click('button:has-text("Connect Telegram")');

    // 5. Verify 6-character code appears with countdown timer and deep link button
    await expect(page.locator('text=One-Time Connection Code')).toBeVisible({ timeout: 10000 });
    await expect(page.locator('text=Expires in')).toBeVisible();
    await expect(page.locator('a:has-text("Open in Telegram (Auto-Link)")')).toBeVisible();

    // 6. Test copy code button
    await page.locator('button[title="Copy Code"]').click();
    await expect(page.locator('text=Copied code')).toBeVisible();

    // 7. Verify Notification Preferences card
    await expect(page.locator('text=Notification Preferences')).toBeVisible();
    await expect(page.locator('text=Low Stock & Stockout Alerts')).toBeVisible();
    await expect(page.locator('text=Impending Expiration Notices')).toBeVisible();

    // 8. Verify Alert Log empty state
    await expect(page.locator('text=Recent Alert Log')).toBeVisible();
    await expect(page.locator('text=No alert notifications have been dispatched yet.')).toBeVisible();
  });
});
