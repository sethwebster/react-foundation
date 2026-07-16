import { expect, test } from '@playwright/test';

const editorialRoutes = [
  {
    path: '/about/board-of-directors',
    heading: 'Board of Directors',
    expected: 'Appointments are in progress',
  },
  {
    path: '/about/technical-steering-committee',
    heading: 'Technical Steering Committee',
    expected: 'Committee formation is in progress',
  },
  {
    path: '/impact',
    heading: 'Impact and accountability',
    expected: 'Reporting begins with funded work',
  },
  {
    path: '/libraries',
    heading: 'Ecosystem support',
    expected: 'Public reporting is being prepared',
  },
  {
    path: '/scoring',
    heading: 'How ecosystem support is assessed',
    expected: 'Principles before rankings',
  },
] as const;

for (const route of editorialRoutes) {
  test(`${route.path} uses factual public content`, async ({ page }) => {
    await page.goto(route.path);

    await expect(
      page.getByRole('heading', { level: 1, name: route.heading }),
    ).toBeVisible();
    await expect(page.getByText(route.expected, { exact: false })).toBeVisible();
    await expect(page.getByText(/to be announced/i)).toHaveCount(0);
    await expect(page.getByText(/using sample data/i)).toHaveCount(0);
    await expect(page.getByText(/\$1\.0m/i)).toHaveCount(0);
    await expect(page.locator('footer')).toBeVisible();
  });
}

test('the retired coming-soon route resolves to the public home page', async ({ page }) => {
  await page.goto('/coming-soon');

  await expect(page).toHaveURL('/');
  await expect(
    page.getByRole('heading', { level: 1, name: 'Building the future of React, together.' }),
  ).toBeVisible();
});
