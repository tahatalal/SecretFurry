/* ---------------------------------------------------------------------------
   Screenshot helper for the dev loop.

     npx tsx scripts/shot.ts [path] [outFile] [width] [height]

   Boots the Vite dev server itself, so there's nothing to start first.
--------------------------------------------------------------------------- */

import process from "node:process";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { chromium } from "playwright";
import { createServer } from "vite";

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, "..");

const [routePath = "/", outFile = "shot.png", w = "1440", h = "900"] = process.argv.slice(2);

const server = await createServer({ root, logLevel: "error", server: { port: 0 } });
await server.listen();

const address = server.httpServer?.address();
if (!address || typeof address === "string") throw new Error("dev server did not bind a port");
const url = `http://localhost:${address.port}${routePath}`;

const browser = await chromium.launch();
const page = await browser.newPage({
  viewport: { width: Number(w), height: Number(h) },
  deviceScaleFactor: 1,
});

const problems: string[] = [];
page.on("console", (msg) => {
  if (msg.type() === "error") problems.push(`console.error: ${msg.text()}`);
});
page.on("pageerror", (err) => problems.push(`pageerror: ${err.message}`));

await page.goto(url, { waitUntil: "networkidle" });
await page.evaluate(() => document.fonts.ready);
await page.waitForTimeout(150);

const out = path.resolve(root, outFile);
await page.screenshot({ path: out, fullPage: routePath.includes("full") });

await browser.close();
await server.close();

if (problems.length) {
  console.error(problems.join("\n"));
  process.exitCode = 1;
}
console.log(`wrote ${out}`);
