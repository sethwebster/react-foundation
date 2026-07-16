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
  {
    path: '/authors',
    heading: 'Authors and contributors',
    expected: 'People who write for the foundation',
  },
  {
    path: '/become-a-member',
    heading: 'Membership',
    expected: 'Membership is handled by the Linux Foundation',
  },
  {
    path: '/communities/add',
    heading: 'Add your community',
    expected: 'Submit a meetup, conference, or study group',
  },
  {
    path: '/communities/start',
    heading: 'Start a React community',
    expected: 'Begin with a useful first event',
  },
  {
    path: '/store',
    heading: 'The foundation store is not open yet',
    expected: 'Checkout is not currently available',
  },
  {
    path: '/store/collections',
    heading: 'Store collections',
    expected: 'Preview planned and archived merchandise',
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

test('product previews disclose that checkout is unavailable', async ({ page }) => {
  await page.goto('/store/products/fiber-shell');

  await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
  await expect(page.getByText('Checkout is not currently available', { exact: false })).toBeVisible();
  await expect(page.getByText(/impact guarantee/i)).toHaveCount(0);
  await expect(page.locator('footer')).toBeVisible();
});

test('community profiles use the shared editorial detail layout', async ({ page }) => {
  await page.goto('/communities/react-bangalore');

  await expect(
    page.getByRole('heading', { level: 1, name: 'React Bangalore' }),
  ).toBeVisible();
  await expect(page.getByText('Community details')).toBeVisible();
  await expect(page.getByText(/earn CoIS rewards/i)).toHaveCount(0);
  await expect(page.locator('footer')).toBeVisible();
});

test('unknown public routes use the shared not-found page', async ({ page }) => {
  await page.goto('/this-route-does-not-exist');

  await expect(
    page.getByRole('heading', { level: 1, name: 'Page not found' }),
  ).toBeVisible();
  await expect(page.locator('footer')).toBeVisible();
});
