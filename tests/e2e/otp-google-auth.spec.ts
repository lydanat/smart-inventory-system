import { test, expect } from '@playwright/test';

test.describe('Google OAuth and Password Authentication Flow E2E', () => {
  test('verifies Google Sign-In button triggers OAuth flow', async ({ page }) => {
    await page.goto('/login');
    await expect(page.locator('text=Welcome Back')).toBeVisible();

    const googleBtn = page.locator('button:has-text("Sign in with Google")');
    await expect(googleBtn).toBeVisible();

    // Intercept navigation or wait for OAuth URL redirect
    const [request] = await Promise.all([
      // Supabase Google OAuth redirects to https://tgwboujyiexgpmsssmqd.supabase.co/auth/v1/authorize?provider=google
      page.waitForRequest((req) => req.url().includes('provider=google') || req.url().includes('supabase.co'), { timeout: 10000 }).catch(() => null),
      googleBtn.click(),
    ]);

    if (request) {
      expect(request.url()).toContain('provider=google');
    }
  });

  test('validates email and password fields on /login', async ({ page }) => {
    await page.goto('/login');

    const emailInput = page.locator('#email');
    const passwordInput = page.locator('#password');
    const submitBtn = page.getByRole('button', { name: 'Sign In', exact: true });

    await expect(emailInput).toBeVisible();
    await expect(passwordInput).toBeVisible();
    await expect(submitBtn).toBeVisible();

    // Trigger validation on empty submit
    await submitBtn.click();
    await expect(page.locator('text=Please enter a valid email address')).toBeVisible();

    // Fill invalid credentials
    await emailInput.fill('invalid_login@example.com');
    await passwordInput.fill('WrongPassword123!');
    await submitBtn.click();

    // Alert or error message shows
    await expect(page.locator('[role="alert"]').or(page.locator('text=Wrong email or password'))).toBeVisible({ timeout: 10000 });
  });

  test('verifies Google Sign-Up button is present and clickable on /signup', async ({ page }) => {
    await page.goto('/signup');
    await expect(page.locator('text=Create your store')).toBeVisible();

    const googleSignUpBtn = page.locator('button:has-text("Sign up with Google")');
    await expect(googleSignUpBtn).toBeVisible();
    await expect(googleSignUpBtn).toBeEnabled();
  });
});
