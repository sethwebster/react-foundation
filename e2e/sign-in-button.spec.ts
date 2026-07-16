import { expect, test } from '@playwright/test';

test.describe('Sign in button', () => {
  test('renders without issue', async ({ page }) => {
    await page.goto('/');

    const signIn = page.getByRole('link', { name: /^sign in$/i });
    await expect(signIn).toBeVisible();
    await expect(signIn).toHaveAttribute('href', '/auth/signin');
  });

  test('stays inside the fixed site header', async ({ page }) => {
    await page.goto('/');

    const header = page.locator('header').first();
    const signIn = page.getByRole('link', { name: /^sign in$/i });
    await expect(header).toBeVisible();
    await expect(signIn).toBeVisible();

    const [headerBox, signInBox] = await Promise.all([
      header.boundingBox(),
      signIn.boundingBox(),
    ]);
    expect(headerBox).not.toBeNull();
    expect(signInBox).not.toBeNull();
    expect(signInBox!.y).toBeGreaterThanOrEqual(headerBox!.y);
    expect(signInBox!.y + signInBox!.height).toBeLessThanOrEqual(
      headerBox!.y + headerBox!.height,
    );
  });
});
