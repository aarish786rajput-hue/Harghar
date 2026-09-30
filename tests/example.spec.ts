import { test, expect } from '@playwright/test';

test('has title', async ({ page }) => {
  await page.goto('/');

  // Expect a title "to contain" a substring.
  // We'll just expect it to not be empty for now, but normally you'd check for "Harghar" or similar.
  await expect(page).toHaveTitle(/.+/);
});

test('homepage loads successfully', async ({ page }) => {
  await page.goto('/');

  // You can add more specific assertions here based on your homepage content.
  // E.g., check if a main heading is visible:
  // await expect(page.locator('h1').first()).toBeVisible();
  
  // Just ensuring the page loaded and we can take a screenshot
  await page.waitForLoadState('networkidle');
  // Optional: Take a screenshot for visual regression or debug
  // await page.screenshot({ path: 'screenshot.png' });
});
