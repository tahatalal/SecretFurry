/* Clicks every interactive control the game exposes and reports anything that
   throws, does nothing, or scrolls the page back to the top. */

import { expect, test, type Page } from "@playwright/test";

async function boot(page: Page): Promise<string[]> {
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(`pageerror: ${e.message}`));
  page.on("console", (m) => {
    if (m.type() === "error") errors.push(`console: ${m.text()}`);
  });
  await page.goto("/");
  await page.evaluate(() => localStorage.clear());
  await page.reload();
  return errors;
}

test("every control on the title and creator responds", async ({ page }) => {
  const errors = await boot(page);

  await page.getByRole("button", { name: "About" }).click();
  await expect(page.locator(".sheet__card")).toBeVisible();
  await page.getByRole("button", { name: "Back" }).click();
  await expect(page.locator(".sheet__card")).toHaveCount(0);

  await page.getByRole("button", { name: "Start" }).click();
  await expect(page.locator(".ct")).toBeVisible();

  const before = await page.locator(".ct-big").getAttribute("src");
  await page.getByRole("button", { name: "Surprise me" }).click();
  expect(await page.locator(".ct-big").getAttribute("src")).not.toBe(before);

  // Every swatch and chip should change the preview or at least not throw.
  for (const sel of [".ct-swatch", ".ct-chips .px-btn"]) {
    const items = page.locator(sel);
    const n = Math.min(await items.count(), 8);
    for (let i = 0; i < n; i += 1) await items.nth(i).click();
  }

  await page.getByRole("button", { name: "Back" }).click();
  await expect(page.locator(".title")).toBeVisible();

  expect(errors).toEqual([]);
});

test("in-game controls work and do not jump the page to the top", async ({ page }) => {
  const errors = await boot(page);

  await page.getByRole("button", { name: "Start" }).click();
  await page.locator("#sona-name").fill("Pipit");
  await page.getByRole("button", { name: "This is me" }).click();
  await page.getByRole("button", { name: "Start looking" }).click();

  // Open something long enough to scroll.
  await page.locator('[data-act="new-search"]').first().click();
  const box = page.locator('.srp__query input[name="q"]');
  await box.fill("valethemaned fur affinity");
  await box.press("Enter");
  await page.locator(".srp__hit").first().click();

  const pane = page.locator("#page");

  // Use a clue far enough down the page that reading it means scrolling, so a
  // reset would actually be visible.
  const chunk = page.locator(".chunk:not(.is-filed)").last();
  await chunk.scrollIntoViewIfNeeded();
  const deep = await pane.evaluate((el) => el.scrollTop);
  expect(deep, "test needs a page long enough to scroll").toBeGreaterThan(300);

  const id = await chunk.getAttribute("data-clue");
  const clues = await page.evaluate(
    () =>
      (window as unknown as { __SF__: { clues: Record<string, { person: string }> } }).__SF__
        .clues,
  );
  await chunk.click();
  expect(
    await pane.evaluate((el) => el.scrollTop),
    "picking a clue up should not move the page",
  ).toBe(deep);

  await page.locator(`.rail__card[data-person="${clues[id ?? ""]?.person}"]`).click();
  expect(
    await pane.evaluate((el) => el.scrollTop),
    "reading position should survive filing a clue",
  ).toBe(deep);

  await page.locator('[data-act="view"][data-view="web"]').click();
  expect(
    await pane.evaluate((el) => el.scrollTop),
    "reading position should survive switching the dossier view",
  ).toBe(deep);
  await page.locator('[data-act="view"][data-view="profile"]').click();

  // Toolbar.
  await page.locator('[data-act="notebook"]').click();
  await expect(page.locator(".sheet__card")).toBeVisible();
  await page.getByRole("button", { name: "Close", exact: true }).click();
  await expect(page.locator(".sheet__card")).toHaveCount(0);

  await page.locator('[data-act="mute"]').click();
  await page.locator('[data-act="mute"]').click();

  await expect(page.locator(".profile")).toBeVisible();

  // Tabs.
  const tabCount = await page.locator(".tab").count();
  await page.locator(".tab__close").first().click();
  await expect(page.locator(".tab")).toHaveCount(tabCount - 1);

  expect(errors).toEqual([]);
});
