import { expect, test } from '@playwright/test';

test('/summit renders the public event details', async ({ page }) => {
  const response = await page.goto('/summit');

  expect(response?.status()).toBe(200);
  await expect(
    page.getByRole('heading', { level: 1, name: 'Contributors Summit 2026' }),
  ).toBeVisible();
  await expect(page.getByText('10–12 Nov 2026', { exact: true })).toBeVisible();
  await expect(page.getByRole('navigation', { name: 'Summit sections' })).toBeVisible();
  await expect(page.getByRole('link', { name: 'Self-nomination form' })).toHaveAttribute(
    'href',
    'https://forms.gle/HwUngQcCnWhbuBoR6',
  );
});

test('desktop navigation links to the summit', async ({ page }) => {
  await page.goto('/');

  const summitLink = page.locator('header').getByRole('link', {
    name: 'Summit',
    exact: true,
  });
  await expect(summitLink).toBeVisible();
  await expect(summitLink).toHaveAttribute('href', '/summit');

  await summitLink.click();
  await expect(page).toHaveURL('/summit');
});

test('mobile navigation links to the summit', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/');
  await page.getByRole('button', { name: 'Open menu' }).click();

  const summitLink = page.getByRole('link', { name: 'Summit', exact: true }).last();
  await expect(summitLink).toBeVisible();
  await expect(summitLink).toHaveAttribute('href', '/summit');

  await summitLink.click();
  await expect(page).toHaveURL('/summit');
});
