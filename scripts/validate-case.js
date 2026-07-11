const path = require("node:path");
const fs = require("node:fs");

require(path.join(__dirname, "..", "src", "case-data.js"));
const game = globalThis.SECRET_FURRY_CASE;
const errors = [];
const tokenPattern = /\{\{chunk:([^|}]+)\|([^}]+)\}\}/g;
const sourceIds = new Set(game.sources.map((source) => source.id));
const clueIds = new Set(Object.keys(game.clues));
const seenTokens = new Map();

if (sourceIds.size !== game.sources.length) errors.push("Source ids are not unique.");

for (const source of game.sources) {
  const visibleText = source.html
    .replace(tokenPattern, (_, id, label) => label)
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  const wordCount = visibleText ? visibleText.split(" ").length : 0;
  const sourceChunkCount = [...source.html.matchAll(tokenPattern)].length;
  if (wordCount < 120) errors.push(`${source.id} is too thin to feel like a believable source (${wordCount} words).`);
  if (sourceChunkCount && wordCount / sourceChunkCount < 10) errors.push(`${source.id} reads like a clue list instead of a document (${(wordCount / sourceChunkCount).toFixed(1)} words per chunk).`);

  const voidTags = new Set(["br", "hr", "img", "input", "meta", "link", "source", "wbr"]);
  const tagStack = [];
  for (const tagMatch of source.html.matchAll(/<\/?([a-z][\w-]*)\b[^>]*>/gi)) {
    const tag = tagMatch[1].toLowerCase();
    if (voidTags.has(tag) || tagMatch[0].endsWith("/>")) continue;
    if (!tagMatch[0].startsWith("</")) tagStack.push(tag);
    else if (tagStack.pop() !== tag) errors.push(`${source.id} contains mismatched HTML near ${tagMatch[0]}.`);
  }
  if (tagStack.length) errors.push(`${source.id} contains unclosed HTML tags: ${tagStack.join(", ")}.`);

  for (const required of source.requires) {
    if (!clueIds.has(required)) errors.push(`${source.id} requires missing clue ${required}.`);
  }
  for (const match of source.html.matchAll(tokenPattern)) {
    const id = match[1].trim();
    if (!clueIds.has(id)) errors.push(`${source.id} contains unknown chunk ${id}.`);
    if (!seenTokens.has(id)) seenTokens.set(id, []);
    seenTokens.get(id).push(source.id);
  }
}

for (const [id, clue] of Object.entries(game.clues)) {
  if (!sourceIds.has(clue.source)) errors.push(`${id} points to missing source ${clue.source}.`);
  if (!seenTokens.has(id)) errors.push(`${id} is never present in a source.`);
  if (seenTokens.has(id) && !seenTokens.get(id).includes(clue.source)) errors.push(`${id} is not present in its declared source ${clue.source}.`);
  if (clue.person && !game.people[clue.person]) errors.push(`${id} points to missing person ${clue.person}.`);
  if (clue.endpoints) clue.endpoints.forEach((person) => { if (!game.people[person]) errors.push(`${id} has missing endpoint ${person}.`); });
}

for (const [personId, person] of Object.entries(game.people)) {
  if (!game.clues[`${personId}_name`]) errors.push(`${personId} has no discoverable name chunk.`);
  if (!game.clues[person.photoClue]) errors.push(`${personId} has no valid portrait chunk.`);
}

const reachableSources = new Set();
const reachableClues = new Set();
let changed = true;
while (changed) {
  changed = false;
  for (const source of game.sources) {
    if (reachableSources.has(source.id) || !source.requires.every((id) => reachableClues.has(id))) continue;
    reachableSources.add(source.id);
    for (const match of source.html.matchAll(tokenPattern)) reachableClues.add(match[1].trim());
    changed = true;
  }
}

for (const source of game.sources) if (!reachableSources.has(source.id)) errors.push(`Source ${source.id} is unreachable.`);
for (const key of game.finalKeys) if (!reachableClues.has(key)) errors.push(`Final key ${key} cannot be reached.`);

const root = path.join(__dirname, "..");
const index = fs.readFileSync(path.join(root, "index.html"), "utf8");
for (const match of index.matchAll(/(?:src|href)="([^"]+)"/g)) {
  const reference = match[1];
  if (/^(?:https?:|#)/.test(reference)) continue;
  if (!fs.existsSync(path.join(root, reference))) errors.push(`Missing index asset ${reference}.`);
}
for (const stylesheet of ["styles/profiles.css", "styles/sources.css"]) {
  const css = fs.readFileSync(path.join(root, stylesheet), "utf8");
  for (const match of css.matchAll(/url\("([^"#]+)"\)/g)) {
    const referenced = path.resolve(path.dirname(path.join(root, stylesheet)), match[1]);
    if (!fs.existsSync(referenced)) errors.push(`Missing CSS asset ${match[1]} referenced by ${stylesheet}.`);
  }
}

if (errors.length) {
  console.error(errors.join("\n"));
  process.exit(1);
}

console.log(`Case valid: ${Object.keys(game.people).length} people, ${game.sources.length} sources, ${Object.keys(game.clues).length} chunks, ${game.finalKeys.length} independent final pillars.`);
