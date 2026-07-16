import { expect, test } from '@playwright/test';

function parseRgb(color: string): [number, number, number] {
  const channels = color.match(/\d+(?:\.\d+)?/g)?.slice(0, 3).map(Number);

  if (!channels || channels.length !== 3) {
    throw new Error(`Expected an RGB color, received "${color}"`);
  }

  return channels as [number, number, number];
}

function relativeLuminance(color: string): number {
  const channels = parseRgb(color).map((channel) => {
    const value = channel / 255;
    return value <= 0.04045
      ? value / 12.92
      : Math.pow((value + 0.055) / 1.055, 2.4);
  });

  return channels[0] * 0.2126 + channels[1] * 0.7152 + channels[2] * 0.0722;
}

function contrastRatio(foreground: string, background: string): number {
  const lighter = Math.max(
    relativeLuminance(foreground),
    relativeLuminance(background)
  );
  const darker = Math.min(
    relativeLuminance(foreground),
    relativeLuminance(background)
  );

  return (lighter + 0.05) / (darker + 0.05);
}

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

  test(`keeps the homepage closing panel heading legible in ${theme} mode`, async ({
    page,
  }) => {
    await page.addInitScript((selectedTheme) => {
      window.localStorage.setItem('react-foundation-theme', selectedTheme);
    }, theme);
    await page.goto('/');

    const heading = page.getByRole('heading', {
      level: 2,
      name: 'A stronger React ecosystem starts with participation.',
    });
    const panel = heading.locator('xpath=ancestor::div[contains(@class,"rounded-panel")][1]');

    await expect(heading).toBeVisible();
    await expect(panel).toBeVisible();

    const colors = await heading.evaluate((element) => {
      const panelElement = element.closest('.rounded-panel');

      if (!panelElement) {
        throw new Error('Expected the closing heading to be inside the panel');
      }

      return {
        heading: getComputedStyle(element).color,
        panel: getComputedStyle(panelElement).backgroundColor,
      };
    });

    expect(contrastRatio(colors.heading, colors.panel)).toBeGreaterThanOrEqual(4.5);
  });
}
