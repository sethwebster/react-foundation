import { expect, test } from '@playwright/test';

test.use({ viewport: { width: 320, height: 844 } });

for (const path of ['/', '/coming-soon']) {
  test(`${path} does not overflow the mobile viewport`, async ({ page }) => {
    await page.goto(path);

    const dimensions = await page.evaluate(() => ({
      viewport: document.documentElement.clientWidth,
      content: document.documentElement.scrollWidth,
    }));

    expect(dimensions.content).toBeLessThanOrEqual(dimensions.viewport);
  });
}
