import { expect, test } from '@playwright/test';

const routes = [
  { path: '/authors', heading: 'Authors' },
  { path: '/communities/react-bangalore', heading: 'React Bangalore' },
];

const hiddenStoreRoutes = [
  '/store',
  '/store/collections',
  '/store/collections/current-drop',
  '/store/products/fiber-shell',
] as const;

for (const route of routes) {
  test(`${route.path} renders a public page`, async ({ page }) => {
    const response = await page.goto(route.path);

    expect(response?.status()).toBe(200);
    await expect(
      page.getByRole('heading', { level: 1, name: new RegExp(route.heading, 'i') }),
    ).toBeVisible();
    await expect(page.getByText(/Shopify is not configured/i)).toHaveCount(0);
    await expect(page.getByText(/Something tangled the React Fiber/i)).toHaveCount(0);
  });
}

for (const path of hiddenStoreRoutes) {
  test(`${path} stays hidden`, async ({ page }) => {
    const response = await page.goto(path);

    expect(response?.status()).toBe(404);
    await expect(page.getByText(/Checkout is not currently available/i)).toHaveCount(0);
  });
}
