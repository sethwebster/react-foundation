import { expect, test } from '@playwright/test';

const routes = [
  { path: '/authors', heading: 'Authors' },
  { path: '/communities/react-bangalore', heading: 'React Bangalore' },
  { path: '/store/collections/current-drop', heading: 'Current drop' },
  { path: '/store/products/fiber-shell', heading: 'Fiber Shell' },
];

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
