import { test, expect } from '@playwright/test';

test.describe('Authentication and Route Guard E2E', () => {
  const timestamp = Date.now();
  const testEmail = `e2e_user_${timestamp}@test.internal`;
  const testPassword = 'StrongPassword123!';
  const testStoreName = `E2E Mart ${timestamp}`;

  test('redirects unauthenticated user from /dashboard to /login', async ({ page }) => {
    await page.goto('/dashboard');
    await expect(page).toHaveURL(/\/login/);
    await expect(page.locator('text=Welcome back')).toBeVisible();
  });

  test('completes full signup flow and lands on empty dashboard', async ({ page }) => {
    // 1. Visit signup page
    await page.goto('/signup');
    await expect(page.locator('text=Create your store')).toBeVisible();

    // 2. Fill registration form
    await page.fill('#businessName', testStoreName);
    await page.fill('#email', testEmail);
    await page.fill('#password', testPassword);

    // 3. Submit
    await page.click('button[type="submit"]');

    // 4. Verify landing on dashboard
    await expect(page).toHaveURL('/dashboard', { timeout: 15000 });
    await expect(page.locator(`text=Welcome to ${testStoreName}`)).toBeVisible();
    await expect(page.locator('text=Getting Started Checklist')).toBeVisible();
    await expect(page.locator('text=Total SKUs')).toBeVisible();

    // 5. Sign out
    await page.click('button:has-text("OWNER")');
    await page.click('text=Sign out');
    await expect(page).toHaveURL(/\/login/);

    // 6. Confirm signed out user cannot re-open /dashboard
    await page.goto('/dashboard');
    await expect(page).toHaveURL(/\/login/);
  });
});
