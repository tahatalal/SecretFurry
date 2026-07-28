/* The clue-handling rules: the label rides the cursor while dragging, the
   whole profile is a drop zone, and a clue about two people goes on either. */

import { expect, test, type Page } from "@playwright/test";

async function intoChapterOne(page: Page): Promise<void> {
  await page.goto("/");
  await page.evaluate(() => localStorage.clear());
  await page.reload();
  await page.getByRole("button", { name: "Start" }).click();
  await page.locator("#sona-name").fill("Pipit");
  await page.getByRole("button", { name: "This is me" }).click();
  await page.getByRole("button", { name: "Start looking" }).click();
}

async function openSource(page: Page, term: string): Promise<void> {
  await page.locator('[data-act="new-search"]').first().click();
  const box = page.locator('.srp__query input[name="q"]');
  await box.fill(term);
  await box.press("Enter");
  await page.locator(".srp__hit").first().click();
}

test("the clue label follows the pointer while dragging", async ({ page }) => {
  await intoChapterOne(page);
  await openSource(page, "vale maned wolf");

  const ghost = page.locator(".held");
  await expect(ghost).toBeHidden();

  const chunk = page.locator(".chunk:not(.is-filed)").first();
  const box = (await chunk.boundingBox())!;

  await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
  await page.mouse.down();
  await page.mouse.move(box.x + 120, box.y + 90, { steps: 8 });

  await expect(ghost, "the label should appear on drag, not only on click").toBeVisible();
  const first = (await ghost.boundingBox())!;

  await page.mouse.move(box.x + 260, box.y + 200, { steps: 8 });
  const second = (await ghost.boundingBox())!;
  expect(second.x, "the label should track the cursor").not.toBe(first.x);

  await page.mouse.up();
});

test("a clue can be dropped anywhere in the profile, not just the avatar", async ({ page }) => {
  await intoChapterOne(page);
  await openSource(page, "vale maned wolf");

  const chunk = page.locator(".chunk:not(.is-filed)").first();
  const from = (await chunk.boundingBox())!;

  // Aim at empty space near the bottom of the profile panel, well away from
  // any avatar or rail card.
  const profile = page.locator(".profile");
  const to = (await profile.boundingBox())!;

  await page.mouse.move(from.x + from.width / 2, from.y + from.height / 2);
  await page.mouse.down();
  await page.mouse.move(to.x + to.width / 2, to.y + to.height - 24, { steps: 12 });
  await page.mouse.up();

  await expect(page.locator(".dossier__head")).toContainText("1 filed");
  await expect(page.locator(".chunk.is-filed")).toHaveCount(1);
});

test("a clue about two people can be filed on either of them", async ({ page }) => {
  await intoChapterOne(page);

  // vale_link_sprocket is about Vale and Sprocket both.
  await openSource(page, "fursuit parade 2024 photos");
  const link = page.locator('.chunk[data-clue="vale_link_sprocket"]');
  await expect(link).toBeVisible();

  await link.click();
  // Both ends light up as valid targets while it is held.
  await expect(page.locator('.rail__card[data-person="vale"]')).toHaveClass(/is-target/);

  // Vale is the only one on the board yet, so filing reveals Sprocket.
  await page.locator('.rail__card[data-person="vale"]').click();
  await expect(page.locator('.rail__card[data-person="sprocket"]')).toBeVisible();

  // Now unfile and re-file it onto the other end instead.
  await page.locator('[data-act="unfile"][data-clue="vale_link_sprocket"]').first().click();
  await openSource(page, "fursuit parade 2024 photos");
  await page.locator('.chunk[data-clue="vale_link_sprocket"]').click();
  await page.locator('.rail__card[data-person="sprocket"]').click();
  await expect(page.locator(".dossier__head")).toContainText("1 filed");
});

test("nobody is on the board until you find them", async ({ page }) => {
  await intoChapterOne(page);

  // You start knowing only that Vale exists.
  await expect(page.locator(".rail__card")).toHaveCount(1);
  await expect(page.locator('.rail__card[data-person="vale"]')).toBeVisible();

  await openSource(page, "fursuit parade 2024 photos");
  await page.locator('.chunk[data-clue="vale_link_sprocket"]').click();
  await page.locator('.rail__card[data-person="vale"]').click();

  await expect(page.locator(".rail__card")).toHaveCount(2);
  await expect(page.locator(".toast")).toContainText(/New on the board/i);
});

test("closed platforms are reached by following a link, not by searching", async ({ page }) => {
  await intoChapterOne(page);

  // The regional Telegram group is not indexed.
  await page.locator('[data-act="new-search"]').first().click();
  const box = page.locator('.srp__query input[name="q"]');
  await box.fill("midwest furs telegram");
  await box.press("Enter");
  await expect(page.locator(".srp__none")).toBeVisible();

  // It is linked from the convention's wiki page.
  await openSource(page, "midwest furfest");
  const invite = page.locator('.pf-link[data-source="midwest_telegram"]');
  await expect(invite).toBeVisible();
  await invite.click();
  await expect(page.locator(".tg")).toBeVisible();
});

test("visited results are marked as visited", async ({ page }) => {
  await intoChapterOne(page);
  await openSource(page, "vale maned wolf");

  await page.locator('[data-act="new-search"]').first().click();
  const box = page.locator('.srp__query input[name="q"]');
  await box.fill("vale maned wolf");
  await box.press("Enter");

  await expect(page.locator(".srp__hit.is-seen").first()).toBeVisible();
  await expect(page.locator(".srp__seen").first()).toContainText("Visited");
});
