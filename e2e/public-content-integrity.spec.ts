import { expect, test } from '@playwright/test';

import { ecosystemLibraries } from '../src/lib/maintainer-tiers';

const trackedRepositoryLabel = `${ecosystemLibraries.length} tracked repositories`;

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
    expected: 'Contribution tracking',
  },
  {
    path: '/libraries',
    heading: 'Ecosystem support',
    expected: trackedRepositoryLabel,
  },
  {
    path: '/scoring',
    heading: 'How ecosystem support is assessed',
    expected: 'PRs × 8 + Issues × 3 + Commits × 1',
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
] as const;

for (const route of editorialRoutes) {
  test(`${route.path} uses factual public content`, async ({ page }) => {
    await page.goto(route.path);

    await expect(
      page.getByRole('heading', { level: 1, name: route.heading }),
    ).toBeVisible();
    await expect(page.getByText(route.expected, { exact: false }).first()).toBeVisible();
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

test('impact restores methodology and routes into library detail', async ({ page }) => {
  await page.goto('/impact');

  await expect(page.getByText('Existing methodology', { exact: true })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Score calculation' })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Distribution methodology' })).toBeVisible();
  await expect(page.getByRole('link', { name: /Browse tracked libraries/i })).toHaveAttribute('href', '/libraries');
  await expect(page.getByRole('link', { name: /Read scoring methodology/i })).toHaveAttribute('href', '/scoring');
  await expect(page.getByText(/First public report coming after funded work/i)).toBeVisible();
  await expect(page.getByText(/has not published quarterly distribution reports yet/i)).toBeVisible();
});

test('libraries and scoring publish the tracked ecosystem without stale counts', async ({ page }) => {
  await page.goto('/libraries');

  await expect(page.getByText(trackedRepositoryLabel, { exact: true }).first()).toBeVisible();
  await expect(page.getByText('Core React · 7 libraries')).toBeVisible();
  await expect(page.getByText('Styling · 5 libraries')).toBeVisible();
  await expect(page.getByRole('link', { name: /React Router/i })).toBeVisible();
  await expect(page.getByText(/54\+ ecosystem libraries/i)).toHaveCount(0);

  await page.goto('/scoring');
  await expect(page.getByRole('heading', { name: 'Contribution score' })).toBeVisible();
  await expect(page.getByText('PRs × 8 + Issues × 3 + Commits × 1')).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Funding distribution' })).toBeVisible();
  await expect(page.getByRole('link', { name: /View tracked libraries/i })).toHaveAttribute('href', '/libraries');
});

test('home and about expose accurate contribution, governance, and membership actions', async ({ page }) => {
  await page.goto('/');

  await expect(page.getByText('Become a contributor')).toBeVisible();
  await expect(page.getByRole('link', { name: /Browse tracked repositories/i })).toHaveAttribute('href', '/libraries');
  await page.getByRole('button', { name: /View RFCs/i }).click();
  await expect(page.getByRole('link', { name: /React RFCs/i })).toHaveAttribute('href', 'https://github.com/reactjs/rfcs');
  await expect(page.getByRole('link', { name: /Sponsor a library/i })).toHaveAttribute('href', '/libraries');
  await expect(page.getByRole('link', { name: /Open membership enrollment/i })).toHaveAttribute('href', /enrollment\.lfx\.linuxfoundation\.org/);
  await expect(page.getByRole('link', { name: 'Membership enrollment', exact: true })).toBeVisible();
  await expect(page.getByRole('link', { name: /Meet our members/i })).toHaveCount(0);
  await expect(page.getByRole('link', { name: /Subscribe/i })).toHaveCount(0);

  await page.goto('/about');
  await expect(page.getByRole('heading', { name: 'Transparent governance' })).toBeVisible();
  await expect(page.getByText('Open financials')).toBeVisible();
  await expect(page.getByText('Community input')).toBeVisible();
  await expect(page.getByText('Quarterly reports')).toBeVisible();
  await expect(page.getByText('Open source values')).toBeVisible();
  await expect(page.getByRole('link', { name: /Explore supported libraries/i })).toHaveAttribute('href', '/libraries');
});

const restoredRoutes = [
  { path: '/', heading: 'Building the future of React, together.' },
  { path: '/about', heading: 'About The React Foundation' },
  { path: '/impact', heading: 'Impact and accountability' },
  { path: '/libraries', heading: 'Ecosystem support' },
  { path: '/scoring', heading: 'How ecosystem support is assessed' },
] as const;

for (const theme of ['light', 'dark'] as const) {
  for (const viewport of [
    { name: 'desktop', width: 1280, height: 900 },
    { name: 'mobile', width: 390, height: 844 },
  ] as const) {
    test(`restored content remains readable in ${theme} ${viewport.name}`, async ({ page }) => {
      await page.setViewportSize({ width: viewport.width, height: viewport.height });
      await page.addInitScript((selectedTheme) => {
        window.localStorage.setItem('react-foundation-theme', selectedTheme);
      }, theme);

      for (const route of restoredRoutes) {
        await page.goto(route.path);
        await expect(
          page.getByRole('heading', { level: 1, name: route.heading }),
        ).toBeVisible();
        await expect(page.locator('html')).toHaveClass(
          theme === 'dark' ? /\bdark\b/ : /^(?!.*\bdark\b)/,
        );

        const horizontalOverflow = await page.evaluate(() =>
          document.documentElement.scrollWidth > document.documentElement.clientWidth + 1,
        );
        expect(horizontalOverflow).toBe(false);
      }
    });
  }
}

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
