import { expect, test } from '@playwright/test';

test('should open community detail modal when clicking View Details button in map popup', async ({ page }) => {
  await page.goto('/communities');

  const marker = page.getByRole('button', { name: /React Bangalore - platinum/i });
  await expect(marker).toBeVisible({ timeout: 20_000 });
  await marker.click();

  const popup = page.locator('.leaflet-popup');
  await expect(popup).toBeVisible({ timeout: 10_000 });

  const viewDetailsButton = popup.getByRole('link', { name: 'View Details' });
  await expect(viewDetailsButton).toBeVisible();

  await Promise.all([
    page.waitForURL(/\/communities\/[^/]+$/, { timeout: 10_000 }),
    viewDetailsButton.click(),
  ]);

  const modal = page.getByRole('dialog');
  await expect(modal).toBeVisible({ timeout: 10_000 });
  await expect(modal.getByRole('button', { name: 'Close' })).toBeVisible();
  await expect(modal.getByRole('link', { name: /View Full Page/ })).toBeVisible();
});
