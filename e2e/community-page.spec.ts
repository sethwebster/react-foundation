import { expect, test } from '@playwright/test';
import { REACT_COMMUNITIES } from '@/data/communities';

test.describe('Community page', () => {
  const community = REACT_COMMUNITIES.at(0) ?? { slug: 'react-prague', meeting_frequency: 'irregular' };

  test.beforeEach(async ({ page }) => {
    await page.goto(`/communities/${community.slug}`);
  });

  test('renders community stats with compact variant size', async ({ page }) => {
    const statBox = page
      .getByRole('region', { name: 'By the numbers' })
      .getByText(community.meeting_frequency, { exact: true });

    await expect(statBox).toBeVisible();
    await expect(statBox).toHaveClass(
      'font-mono-panels justify-self-end text-[15px] font-medium capitalize'
    );
  });
});
