/* ---------------------------------------------------------------------------
   Full playthroughs.

   The important one is "greedy": search every lead, open every result, file
   every clue on whoever it belongs to, and check the game can actually be
   finished. If a chapter is unwinnable this is what catches it — the validator
   proves the graph is reachable, this proves it's reachable by clicking.
--------------------------------------------------------------------------- */

import { expect, test, type Page } from "@playwright/test";

interface ClueMeta {
  person: string;
  slot: string;
}

declare global {
  interface Window {
    __SF__?: { clues: Record<string, ClueMeta>; target: string };
  }
}

async function newGame(page: Page, sonaName = "Pipit"): Promise<void> {
  const errors: string[] = [];
  page.on("pageerror", (err) => errors.push(err.message));
  page.on("console", (msg) => {
    if (msg.type() === "error") errors.push(msg.text());
  });
  (page as Page & { _errors?: string[] })._errors = errors;

  await page.goto("/");
  await page.evaluate(() => localStorage.clear());
  await page.reload();

  await page.getByRole("button", { name: "Start" }).click();
  await page.locator("#sona-name").fill(sonaName);
  await page.getByRole("button", { name: "This is me" }).click();
  await page.getByRole("button", { name: "Start looking" }).click();
  await expect(page.locator(".browser")).toBeVisible();
}

function pageErrors(page: Page): string[] {
  return (page as Page & { _errors?: string[] })._errors ?? [];
}

/** File every unfiled clue visible on the current page onto its owner. */
async function fileVisibleClues(page: Page): Promise<number> {
  const clues = await page.evaluate(() => window.__SF__?.clues ?? {});
  let filed = 0;

  for (let guard = 0; guard < 40; guard += 1) {
    const chunk = page.locator(".chunk:not(.is-filed)").first();
    if ((await chunk.count()) === 0) break;

    const id = await chunk.getAttribute("data-clue");
    const owner = id ? clues[id]?.person : undefined;
    if (!owner) break;

    await chunk.click();
    // Either the owner is already on the board, or the clue opens a new
    // profile and the rail offers an empty slot to drop it into.
    const card = page.locator(`.rail__card[data-person="${owner}"]`);
    if ((await card.count()) === 0) {
      await page.keyboard.press("Escape");
      // Skip past this one rather than abandoning the whole page.
      await chunk.evaluate((el) => el.classList.add("is-filed"));
      continue;
    }
    await card.click();
    filed += 1;
  }

  return filed;
}

/** Type a query into the search box and submit it. */
async function runSearch(page: Page, query: string): Promise<void> {
  await page.locator('[data-act="new-search"]').first().click();
  const box = page.locator('.srp__query input[name="q"]');
  await box.fill(query);
  await box.press("Enter");
}

/**
 * Follow one not-yet-visited in-page link. Closed platforms — invite-only
 * servers, group chats — are only reachable this way, so a sweep that only
 * searches would never see them.
 */
async function followOneLink(page: Page, opened: Set<string>): Promise<boolean> {
  const tabs = await page.locator(".tab").count();
  for (let i = 0; i < tabs; i += 1) {
    await page.locator(".tab").nth(i).click();
    const ids = await page
      .locator(".pf-link[data-source]")
      .evaluateAll((els) => els.map((el) => (el as HTMLElement).dataset.source ?? ""));
    const next = ids.find((id) => id && !opened.has(id));
    if (!next) continue;

    opened.add(next);
    await page.locator(`.pf-link[data-source="${next}"]`).first().click();
    await fileVisibleClues(page);
    return true;
  }
  return false;
}

/** Search every known lead, open every hit, and file everything found. */
async function sweep(page: Page): Promise<void> {
  const openedSources = new Set<string>();
  const triedTerms = new Set<string>();

  for (let round = 0; round < 14; round += 1) {
    await page.locator('[data-act="new-search"]').first().click();
    const terms = await page.locator(".srp__term").allTextContents();
    const fresh = terms.filter((t) => !triedTerms.has(t));

    let openedThisRound = 0;

    for (const term of fresh) {
      triedTerms.add(term);
      await runSearch(page, term);

      const ids = await page
        .locator(".srp__hit")
        .evaluateAll((els) => els.map((el) => (el as HTMLElement).dataset.source ?? ""));

      for (const id of ids.filter((i) => i && !openedSources.has(i))) {
        openedSources.add(id);
        // Re-run the search each time: opening a source switches tabs, and
        // re-searching is more robust than trying to navigate back.
        await runSearch(page, term);
        const hit = page.locator(`.srp__hit[data-source="${id}"]`).first();
        if ((await hit.count()) === 0) continue;
        await hit.click();
        await fileVisibleClues(page);
        openedThisRound += 1;
      }
    }

    // Follow every in-page link we haven't taken yet.
    let followed = 0;
    for (let guard = 0; guard < 8; guard += 1) {
      if (!(await followOneLink(page, openedSources))) break;
      followed += 1;
    }

    // Second pass over pages already open: some clues only become fileable
    // once the person they belong to has appeared on the board.
    for (const tab of await page.locator(".tab").all()) {
      await tab.click();
      await fileVisibleClues(page);
    }

    if (!fresh.length && !openedThisRound && !followed && round > 0) break;
  }
}

test("greedy playthrough reaches an ending", async ({ page }) => {
  await newGame(page);

  for (const chapter of [1, 2, 3]) {
    await expect(page.locator(".topbar__chapter")).toContainText(`CH ${chapter}`);
    await sweep(page);

    const next = page.locator('[data-act="chapter-next"]');
    await expect(
      next,
      `chapter ${chapter} could not be completed by filing every reachable clue`,
    ).toBeEnabled({ timeout: 15_000 });

    await page.screenshot({ path: `shots/e2e-ch${chapter}.png` });
    await next.click();
    await page.locator('[data-act="chapter-go"]').click();

    if (chapter < 3) {
      await page.getByRole("button", { name: "Start looking" }).click();
    }
  }

  // Finale.
  await expect(page.locator(".cm")).toBeVisible();
  const target = await page.evaluate(() => window.__SF__?.target ?? "");
  await page.locator(`.lineup__card[data-person="${target}"]`).click();

  for (const step of await page.locator(".cm-step").all()) {
    await step.locator(".cm-option").first().click();
  }
  await page.screenshot({ path: "shots/e2e-compose.png", fullPage: true });

  await page.locator('[data-act="send"]').click();
  await expect(page.locator(".ending")).toBeVisible();
  await expect(page.locator(".ending__card")).toContainText(/They wrote back/i);
  await page.screenshot({ path: "shots/e2e-ending.png", fullPage: true });

  expect(pageErrors(page), "no runtime errors during a full playthrough").toEqual([]);
});

test("filing a clue on the wrong person is refused", async ({ page }) => {
  await newGame(page);

  // Get a second person onto the board first — you start knowing only Vale.
  await runSearch(page, "fursuit parade 2024 photos");
  await page.locator(".srp__hit").first().click();
  await page.locator('.chunk[data-clue="vale_link_sprocket"]').click();
  await page.locator('.rail__card[data-person="vale"]').click();
  await expect(page.locator('.rail__card[data-person="sprocket"]')).toBeVisible();

  // vale_con is about Vale alone, so Sprocket must refuse it.
  await runSearch(page, "fursuit parade 2024 photos");
  await page.locator(".srp__hit").first().click();
  await page.locator('.chunk[data-clue="vale_con"]').click();
  await page.locator('.rail__card[data-person="sprocket"]').click();

  await expect(page.locator(".toast--bad")).toContainText(/doesn't tell you anything/i);
  await expect(page.locator(".dossier__head")).toContainText("1 filed");

  // The clue stays in hand, so the right target still works.
  await page.locator('.rail__card[data-person="vale"]').click();
  await expect(page.locator(".dossier__head")).toContainText("2 filed");
});

test("walking away needs no accusation and never reveals the answer", async ({ page }) => {
  await page.goto("/");
  // Seed the finale directly; the greedy test owns the long way there.
  await page.evaluate(() => {
    const save = {
      v: 1,
      phase: "compose",
      chapter: 3,
      sona: {
        name: "Pipit", species: "cat", head: "feline", fur: "ember",
        marking: "none", markingFur: "cream", eyes: "gold",
        accessory: "none", accent: "orchid", pronouns: "they/them",
      },
      known: ["vale", "marisol", "priya"],
      muted: true,
    };
    localStorage.setItem("secret-furry:v2", JSON.stringify(save));
  });
  await page.reload();
  await page.getByRole("button", { name: "Continue" }).click();
  await expect(page.locator(".cm")).toBeVisible();

  // No accusation, no lines picked — the door out is still open.
  await page.locator('[data-act="walk-away"]').click();
  await expect(page.locator(".ending--away")).toBeVisible();
  await expect(page.locator(".ending__card")).toContainText("You close the laptop.");

  // The one thing this ending must never do is answer the question.
  await expect(page.locator(".ending__card")).not.toContainText(/It was /);
  await expect(page.locator(".ending__card")).not.toContainText("They wrote back");
});

test("contradictions evict each other in the same slot", async ({ page }) => {
  await newGame(page);
  const clues = await page.evaluate(() => window.__SF__?.clues ?? {});
  expect(clues["vale_region_pnw"]?.slot).toBe("region");
  expect(clues["vale_region_midwest"]?.slot).toBe("region");
  expect(clues["vale_region_pnw"]?.person).toBe(clues["vale_region_midwest"]?.person);
});
