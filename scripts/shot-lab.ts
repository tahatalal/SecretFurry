/* Renders every head shape, marking and accessory to shots/lab.png. */

import path from "node:path";
import { fileURLToPath } from "node:url";
import { chromium } from "playwright";
import { createServer } from "vite";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

const server = await createServer({ root, logLevel: "error", server: { port: 0 } });
await server.listen();
const addr = server.httpServer?.address();
if (!addr || typeof addr === "string") throw new Error("no port");

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1300, height: 1000 } });
await page.goto(`http://localhost:${addr.port}`);
await page.evaluate(() => localStorage.clear());
await page.reload();

// The creator is the sprite lab now: pick each build in turn and shoot it.
await page.getByRole("button", { name: "Start" }).click();
await page.locator("#sona-name").fill("Lab");

const shots: string[] = [];
const builds = await page.locator('[data-field="head"]').allTextContents();
for (const build of builds) {
  await page.locator(`[data-field="head"]`, { hasText: build }).first().click();
  await page.waitForTimeout(60);
  const src = await page.locator(".ct-big").getAttribute("src");
  shots.push(`<figure><img src="${src}" width="192" height="180"><figcaption>${build}</figcaption></figure>`);
}

await page.setContent(
  `<body style="margin:0;background:#f4e7ff;font:12px monospace;display:flex;flex-wrap:wrap;gap:14px;padding:20px">
     <style>img{image-rendering:pixelated;background:#fff8ec;border:3px solid #2b2438}
     figure{margin:0;text-align:center}figcaption{margin-top:6px;text-transform:uppercase}</style>
     ${shots.join("")}
   </body>`,
);
await page.screenshot({ path: "shots/lab.png", fullPage: true });

await browser.close();
await server.close();
console.log(`wrote shots/lab.png (${shots.length} builds)`);
