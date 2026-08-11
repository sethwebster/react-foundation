import { expect, test } from '@playwright/test';

test('opens the full community profile from a map popup', async ({ page }) => {
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

  await expect(page.getByRole('dialog')).toHaveCount(0);
  await expect(
    page.getByRole('heading', { level: 1, name: 'React Bangalore' }),
  ).toBeVisible();
  await expect(page.getByRole('link', { name: /Back to all communities/i })).toBeVisible();
});

test('keeps Leaflet controls below the fixed site header', async ({ page }) => {
  await page.goto('/communities');

  const header = page.locator('header').first();
  const zoomControl = page.locator('.leaflet-control-zoom');

  await expect(header).toBeVisible();
  await expect(zoomControl).toBeVisible({ timeout: 20_000 });

  const headerLayer = await header.evaluate((element) =>
    Number.parseInt(getComputedStyle(element).zIndex, 10),
  );
  const mapLayer = await zoomControl.evaluate((element) =>
    Number.parseInt(getComputedStyle(element).zIndex, 10),
  );

  expect(headerLayer).toBeGreaterThan(mapLayer);
});

test('aligns the map with the centered community directory column', async ({
  page,
}) => {
  await page.goto('/communities');

  const mapSection = page
    .locator('.community-map')
    .locator('xpath=ancestor::section[1]');
  const directorySection = page.locator('#communities');

  await expect(mapSection).toBeVisible({ timeout: 20_000 });
  await expect(directorySection).toBeVisible();

  const mapWidth = await mapSection.evaluate(
    (element) => element.getBoundingClientRect().width,
  );
  const directoryWidth = await directorySection.evaluate(
    (element) => element.getBoundingClientRect().width,
  );

  expect(Math.abs(mapWidth - directoryWidth)).toBeLessThan(1);
});
