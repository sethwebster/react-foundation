import { expect, test, type Locator } from '@playwright/test';

function channelToLinear(value: number) {
  const normalized = value / 255;
  return normalized <= 0.03928
    ? normalized / 12.92
    : ((normalized + 0.055) / 1.055) ** 2.4;
}

function luminance(rgb: string) {
  const channels = rgb.match(/\d+(?:\.\d+)?/g)?.slice(0, 3).map(Number);
  if (!channels || channels.length !== 3) {
    throw new Error(`Unsupported color value: ${rgb}`);
  }

  const [red, green, blue] = channels.map(channelToLinear);
  return 0.2126 * red + 0.7152 * green + 0.0722 * blue;
}

async function contrastRatio(locator: Locator) {
  const colors = await locator.evaluate((element) => {
    const styles = getComputedStyle(element);
    return {
      foreground: styles.color,
      background: styles.backgroundColor,
    };
  });
  const lighter = Math.max(luminance(colors.foreground), luminance(colors.background));
  const darker = Math.min(luminance(colors.foreground), luminance(colors.background));
  return (lighter + 0.05) / (darker + 0.05);
}

test.describe('public shell accessibility', () => {
  test.use({ viewport: { width: 390, height: 844 } });

  test('mobile header controls meet the minimum touch target', async ({ page }) => {
    await page.goto('/');

    for (const control of [
      page.getByRole('button', { name: /toggle theme/i }),
      page.getByRole('button', { name: /open menu/i }),
      page.getByRole('link', { name: /^sign in$/i }),
    ]) {
      const box = await control.boundingBox();
      expect(box, 'control should be visible').not.toBeNull();
      expect(box!.width).toBeGreaterThanOrEqual(44);
      expect(box!.height).toBeGreaterThanOrEqual(44);
    }
  });

  test('wrapped page titles retain spaces in their accessible names', async ({ page }) => {
    await page.goto('/about');
    await expect(
      page.getByRole('heading', { level: 1, name: 'About The React Foundation' }),
    ).toBeVisible();

    await page.goto('/communities');
    await expect(
      page.getByRole('heading', { level: 1, name: 'Find Your React Community' }),
    ).toBeVisible();
  });

  test('primary actions retain readable contrast in dark mode', async ({ page }) => {
    await page.addInitScript(() => {
      window.localStorage.setItem('react-foundation-theme', 'dark');
    });
    await page.goto('/');
    await expect(page.locator('html')).toHaveClass(/\bdark\b/);

    const primaryAction = page.getByRole('link', { name: 'Get involved' });
    await expect(primaryAction).toBeVisible();
    expect(await contrastRatio(primaryAction)).toBeGreaterThanOrEqual(4.5);
  });
});
