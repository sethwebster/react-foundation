import { expect, test } from '@playwright/test';
import { REACT_COMMUNITIES } from '@/data/communities';

test.describe('Community page', () => {
  const community = REACT_COMMUNITIES.at(0) ?? { slug: 'react-prague', meeting_frequency: 'irregular' };

  test.beforeEach(async ({ page }) => {
    await page.goto(`/communities/${community.slug}`);
  });

  test('renders community frequency as a labeled detail', async ({ page }) => {
    const details = page.getByText('Community details').locator('..');
    const frequency = details.getByText(community.meeting_frequency, { exact: true });

    await expect(details.getByText('Meets', { exact: true })).toBeVisible();
    await expect(frequency).toBeVisible();
  });
});
