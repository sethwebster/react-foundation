import { expect, test } from '@playwright/test';

for (const theme of ['light', 'dark'] as const) {
  test(`keeps the homepage hero logo legible in ${theme} mode`, async ({ page }) => {
    await page.addInitScript((selectedTheme) => {
      window.localStorage.setItem('react-foundation-theme', selectedTheme);
    }, theme);
    await page.goto('/');

    const heroLogo = page.locator('main img[src*="react-logo.svg"]').first();
    await expect(heroLogo).toBeVisible();

    const opacity = await heroLogo.evaluate((element) =>
      Number.parseFloat(getComputedStyle(element).opacity),
    );

    expect(opacity).toBeGreaterThanOrEqual(theme === 'dark' ? 0.5 : 0.4);
  });
}
