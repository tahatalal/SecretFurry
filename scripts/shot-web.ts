/* Drives a short playthrough and screenshots the connection web + a platform
   page, for eyeballing during development. Not part of the test suite. */

import path from "node:path";
import { fileURLToPath } from "node:url";
import { chromium } from "playwright";
import { createServer } from "vite";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

const server = await createServer({ root, logLevel: "error", server: { port: 0 } });
await server.listen();
const addr = server.httpServer?.address();
if (!addr || typeof addr === "string") throw new Error("no port");
const base = `http://localhost:${addr.port}`;

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });

await page.goto(base);
await page.evaluate(() => localStorage.clear());
await page.reload();
await page.getByRole("button", { name: "Start" }).click();
await page.locator("#sona-name").fill("Pipit");
await page.getByRole("button", { name: "This is me" }).click();
await page.getByRole("button", { name: "Start looking" }).click();

interface Meta {
  person: string;
}
const clues = await page.evaluate(
  () => (window as unknown as { __SF__: { clues: Record<string, Meta> } }).__SF__.clues,
);

async function open(term: string): Promise<void> {
  await page.locator('[data-act="new-search"]').first().click();
  const box = page.locator('.srp__query input[name="q"]');
  await box.fill(term);
  await box.press("Enter");
  const hit = page.locator(".srp__hit").first();
  if (await hit.count()) await hit.click();
}

async function fileAll(): Promise<void> {
  for (let i = 0; i < 25; i += 1) {
    const chunk = page.locator(".chunk:not(.is-filed)").first();
    if (!(await chunk.count())) return;
    const id = await chunk.getAttribute("data-clue");
    const owner = id ? clues[id]?.person : undefined;
    if (!owner) return;
    await chunk.click();
    const card = page.locator(`.rail__card[data-person="${owner}"]`);
    if (!(await card.count())) {
      await page.keyboard.press("Escape");
      return;
    }
    await card.click();
  }
}

for (const term of [
  "vale maned wolf",
  "midwest furs telegram",
  "fursuit parade 2024 photos",
  "valethemaned fur affinity",
]) {
  await open(term);
  await fileAll();
}

await page.screenshot({ path: "shots/dev-source.png" });
await page.locator('[data-act="view"][data-view="web"]').click();
await page.waitForTimeout(200);
await page.screenshot({ path: "shots/dev-web.png" });

await browser.close();
await server.close();
console.log("wrote shots/dev-source.png and shots/dev-web.png");
