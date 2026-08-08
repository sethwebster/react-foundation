import { expect, test } from "@playwright/test";

test.use({ viewport: { width: 1280, height: 800 } });

const CONTRIBUTOR_CARD_TITLES = [
  "Contribute to Repos",
  "Support Financially",
  "Sponsor a Library",
  "Become a Member",
] as const;

const readContributorCardLayout = (cardElement: HTMLElement) => {
  const description = cardElement.querySelector("p.text-sm.leading-relaxed");
  if (!description) {
    return null;
  }

  const contentStack = description.parentElement;
  const headerRow = description.previousElementSibling;
  const icon = headerRow?.firstElementChild;
  const titleContainer = headerRow?.lastElementChild;

  if (!contentStack || !headerRow || !icon) {
    return null;
  }

  const descriptionRect = description.getBoundingClientRect();
  const iconRect = icon.getBoundingClientRect();
  const headerRect = headerRow.getBoundingClientRect();

  return {
    contentStackUsesColumnLayout: contentStack.classList.contains("flex-col"),
    descriptionIsSiblingOfHeaderRow:
      headerRow.nextElementSibling === description,
    descriptionNotNestedInHeaderRow: !headerRow.contains(description),
    titleContainerHasNoDescription: titleContainer?.querySelector("p") === null,
    descriptionAlignedWithCardContent:
      Math.abs(descriptionRect.left - iconRect.left) < 2,
    descriptionBelowHeaderRow: descriptionRect.top >= headerRect.bottom - 2,
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
    const card = page.locator("#contribute .grid > div").filter({
      has: page.getByRole("heading", {
        name: CONTRIBUTOR_CARD_TITLES[0],
        level: 3,
      }),
    });

    await expect(card).toBeVisible();

    const layout = await card.evaluate(readContributorCardLayout);

    expect(layout).not.toBeNull();
    expect(layout?.contentStackUsesColumnLayout).toBeTruthy();
    expect(layout?.descriptionIsSiblingOfHeaderRow).toBeTruthy();
    expect(layout?.descriptionNotNestedInHeaderRow).toBeTruthy();
    expect(layout?.titleContainerHasNoDescription).toBeTruthy();
    expect(layout?.descriptionAlignedWithCardContent).toBeTruthy();
    expect(layout?.descriptionBelowHeaderRow).toBeTruthy();
  });

  test("renders full-width descriptions for every contributor card on desktop", async ({
    page,
  }) => {
    const section = page.locator("#contribute");
    const cards = section.locator(".grid > div");
    await expect(cards).toHaveCount(CONTRIBUTOR_CARD_TITLES.length);

    const cardCount = await cards.count();

    for (let index = 0; index < cardCount; index += 1) {
      const layout = await cards.nth(index).evaluate(readContributorCardLayout);
      expect(layout).not.toBeNull();
      expect(layout?.descriptionNotNestedInHeaderRow).toBeTruthy();

      const widths = await cards.nth(index).evaluate((cardElement) => {
        const description = cardElement.querySelector(
          "p.text-sm.leading-relaxed",
        );
        if (!description) {
          return null;
        }

        const cardRect = cardElement.getBoundingClientRect();
        const descriptionRect = description.getBoundingClientRect();

        return {
          cardWidth: cardRect.width,
          descriptionWidth: descriptionRect.width,
        };
      });

      expect(widths).not.toBeNull();
      expect(widths?.descriptionWidth).toBeGreaterThan(
        (widths?.cardWidth ?? 0) * 0.75,
      );
    }
  });
});
