import { expect, test } from "@playwright/test";

test.use({ viewport: { width: 1280, height: 800 } });

const CONTRIBUTOR_CARD_TITLES = [
  "Contribute to Repos",
  "Sponsor a Library",
  "Become a Member",
] as const;

const readContributorCardLayout = (cardElement: HTMLElement) => {
  const title = cardElement.querySelector("h3");
  const description = cardElement.querySelector("p.text-sm.leading-6");
  if (!title || !description) {
    return null;
  }

  const contentStack = description.parentElement;
  if (!contentStack) {
    return null;
  }

  const descriptionRect = description.getBoundingClientRect();
  const titleRect = title.getBoundingClientRect();
  const contentRect = contentStack.getBoundingClientRect();

  return {
    descriptionIsSiblingOfTitle: title.nextElementSibling === description,
    descriptionAlignedWithCardContent:
      Math.abs(descriptionRect.left - contentRect.left) < 2,
    descriptionBelowTitle: descriptionRect.top >= titleRect.bottom - 2,
  };
};

test.describe("About page contributor cards", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/about");
    await expect(
      page.getByRole("heading", { name: "Become a Contributor" }),
    ).toBeVisible();
  });

  test("keeps card descriptions below the icon/title row instead of beside the icon", async ({
    page,
  }) => {
    const card = page.locator("#contribute article").filter({
      has: page.getByRole("heading", {
        name: CONTRIBUTOR_CARD_TITLES[0],
        level: 3,
      }),
    });

    await expect(card).toBeVisible();

    const layout = await card.evaluate(readContributorCardLayout);

    expect(layout).not.toBeNull();
    expect(layout?.descriptionIsSiblingOfTitle).toBeTruthy();
    expect(layout?.descriptionAlignedWithCardContent).toBeTruthy();
    expect(layout?.descriptionBelowTitle).toBeTruthy();
  });

  test("renders full-width descriptions for every contributor card on desktop", async ({
    page,
  }) => {
    const section = page.locator("#contribute");
    const cards = section.locator("article");
    await expect(cards).toHaveCount(CONTRIBUTOR_CARD_TITLES.length);

    const cardCount = await cards.count();

    for (let index = 0; index < cardCount; index += 1) {
      const layout = await cards.nth(index).evaluate(readContributorCardLayout);
      expect(layout).not.toBeNull();
      expect(layout?.descriptionIsSiblingOfTitle).toBeTruthy();

      const widths = await cards.nth(index).evaluate((cardElement) => {
        const description = cardElement.querySelector(
          "p.text-sm.leading-6",
        );
        if (!description) {
          return null;
        }

        const contentRect = description.parentElement?.getBoundingClientRect();
        const descriptionRect = description.getBoundingClientRect();

        return {
          contentWidth: contentRect?.width ?? 0,
          descriptionWidth: descriptionRect.width,
        };
      });

      expect(widths).not.toBeNull();
      expect(widths?.descriptionWidth).toBeGreaterThan(
        (widths?.contentWidth ?? 0) * 0.95,
      );
    }
  });
});
