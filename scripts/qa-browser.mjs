const endpoint = process.argv[2] || "http://127.0.0.1:9223";
const screenshotPath = process.argv[3] || null;
const pageUrl = "file:///C:/Users/tahaa/OneDrive/Documents/SecretFurry/index.html";
const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function retryJson(url, attempts = 40) {
  for (let attempt = 0; attempt < attempts; attempt += 1) {
    try {
      const response = await fetch(url);
      if (response.ok) return response.json();
    } catch { /* Chrome may still be starting. */ }
    await wait(125);
  }
  throw new Error(`Could not connect to ${url}`);
}

await retryJson(`${endpoint}/json/version`);
const created = await fetch(`${endpoint}/json/new?${encodeURIComponent(pageUrl)}`, { method: "PUT" }).then((response) => response.json());
const socket = new WebSocket(created.webSocketDebuggerUrl);
await new Promise((resolve, reject) => {
  socket.addEventListener("open", resolve, { once: true });
  socket.addEventListener("error", reject, { once: true });
});

let commandId = 0;
const pending = new Map();
const exceptions = [];
socket.addEventListener("message", (event) => {
  const message = JSON.parse(event.data);
  if (message.method === "Runtime.exceptionThrown") exceptions.push(message.params.exceptionDetails.text);
  if (!message.id || !pending.has(message.id)) return;
  const { resolve, reject } = pending.get(message.id);
  pending.delete(message.id);
  if (message.error) reject(new Error(message.error.message)); else resolve(message.result);
});

function send(method, params = {}) {
  commandId += 1;
  socket.send(JSON.stringify({ id: commandId, method, params }));
  return new Promise((resolve, reject) => pending.set(commandId, { resolve, reject }));
}

async function evaluate(expression) {
  const result = await send("Runtime.evaluate", { expression, awaitPromise: true, returnByValue: true });
  if (result.exceptionDetails) throw new Error(result.exceptionDetails.text);
  return result.result.value;
}

await send("Page.enable");
await send("Runtime.enable");
await send("Emulation.setDeviceMetricsOverride", { width: 1440, height: 900, deviceScaleFactor: 1, mobile: false });
await send("Page.reload", { ignoreCache: true });
await wait(500);

const title = await evaluate("document.title");
if (title !== "Secret Furry — The Velvet Jackal") throw new Error(`Unexpected title: ${title}`);
await evaluate("localStorage.clear(); location.reload()");
await wait(500);
await evaluate("document.querySelector('#startButton').click()");

const sourceOrder = ["moonrise_news", "expo_directory", "afterdark_chat", "lumen_thread", "anime_forum", "ren_portfolio", "event_logs", "backstage_archive", "private_dm"];
const initialLeads = await evaluate("[...document.querySelectorAll('#emailList [data-source]')].map((element) => element.dataset.source)");
if (initialLeads.join(",") !== "moonrise_news,expo_directory") throw new Error(`Inbox exposed the wrong initial leads: ${initialLeads.join(",")}`);
const disabledLeads = await evaluate("document.querySelectorAll('#emailList [data-source]:disabled').length");
if (disabledLeads) throw new Error("Inbox must not expose disabled future leads.");
for (const sourceId of sourceOrder) {
  await evaluate("document.querySelector('#inboxTab').click()");
  const available = await evaluate(`Boolean(document.querySelector('#emailList [data-source="${sourceId}"]'))`);
  if (!available) throw new Error(`Source did not unlock in Inbox: ${sourceId}`);
  await evaluate(`document.querySelector('#emailList [data-source="${sourceId}"]').click()`);
  const sourceReplacedInbox = await evaluate("document.querySelector('#inboxPanel').classList.contains('hidden') && !document.querySelector('#reader').classList.contains('hidden')");
  if (!sourceReplacedInbox) throw new Error(`Opening ${sourceId} did not replace the Inbox with the source.`);
  if (sourceId === "expo_directory" && screenshotPath) {
    await wait(200);
    const capture = await send("Page.captureScreenshot", { format: "png", captureBeyondViewport: false });
    const { writeFile } = await import("node:fs/promises");
    await writeFile(screenshotPath, Buffer.from(capture.data, "base64"));
  }
  const chunkIds = await evaluate("[...document.querySelectorAll('[data-chunk]:not(.filed)')].map((element) => element.dataset.chunk)");
  for (const chunkId of chunkIds) {
    const data = await evaluate(`SECRET_FURRY_CASE.clues[${JSON.stringify(chunkId)}]`);
    if (data.kind !== "identity") {
      const target = data.kind === "relationship" ? data.endpoints[0] : data.person;
      const profileExists = await evaluate(`Boolean(document.querySelector('[data-rail-person="${target}"]'))`);
      if (!profileExists) throw new Error(`Missing target profile ${target} for ${chunkId}`);
      await evaluate(`document.querySelector('[data-rail-person="${target}"]').click()`);
    }
    await evaluate(`document.querySelector('[data-chunk="${chunkId}"]').click()`);
    await evaluate("document.querySelector('.profile-drop-surface').click()");
    const filedNow = await evaluate(`document.querySelector('[data-chunk="${chunkId}"]')?.classList.contains('filed') ?? true`);
    if (!filedNow) throw new Error(`Chunk did not file: ${chunkId}`);
  }
}

await wait(1100);
const deductionVisible = await evaluate("!document.querySelector('#deductionModal').classList.contains('hidden')");
if (!deductionVisible) throw new Error("Deduction modal did not appear.");
await evaluate("document.querySelector('#revealButton').click()");
const revealLoaded = await evaluate("document.querySelector('.reveal-photo img').complete && document.querySelector('.reveal-photo img').naturalWidth > 0");
if (!revealLoaded) throw new Error("Reveal image did not load.");
await evaluate("document.querySelector('#confrontButton').click()");
await evaluate("document.querySelector('[data-ending=protect]').click()");
const endingText = await evaluate("document.querySelector('#endingText').textContent.trim()");
if (!endingText) throw new Error("Ending choice did not produce an epilogue.");
if (exceptions.length) throw new Error(`Browser exceptions: ${exceptions.join(" | ")}`);

console.log(`Browser QA passed: ${sourceOrder.length} sources, all visible chunks filed, deduction/reveal/confrontation/ending completed.`);
socket.close();
