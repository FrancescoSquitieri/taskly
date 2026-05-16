import { expect, test } from '@playwright/test';

test.describe('Dashboard landing page', () => {
  test('renders the headline card', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByRole('heading', { name: /taskly dashboard/i })).toBeVisible();
  });

  test('shows the connection status badge', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByText(/connection status:/i)).toBeVisible();
  });

  test('renders the primary call to action', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByRole('button', { name: /primary action/i })).toBeVisible();
  });
});
