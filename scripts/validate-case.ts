/* ---------------------------------------------------------------------------
   Case validator.

   Content is the part of this game most likely to break silently: a renamed
   clue id, a lead nobody can search for, a chapter whose key clue sits behind
   a source that can never be reached. None of that throws at runtime — it just
   makes the game unfinishable.

   Run it: npm run validate
--------------------------------------------------------------------------- */

import process from "node:process";
import { CASE } from "../src/content/index.ts";
import { sceneIds } from "../src/art/scenes.ts";
import { matchesQuery } from "../src/engine/state.ts";
import { clueIdsIn, linkIdsIn, usedArtIds } from "../src/platforms/kit.ts";
import { CAUTIOUS, REUNION, WEIGHT } from "../src/engine/ending.ts";
import type { ClueId, SourceDoc } from "../src/engine/types.ts";

const errors: string[] = [];
const warnings: string[] = [];

const fail = (msg: string) => errors.push(msg);
const warn = (msg: string) => warnings.push(msg);

const sources = CASE.sources;
const clues = CASE.clues;
const people = CASE.people;

/* --- ids ------------------------------------------------------------------ */

const sourceIds = new Set<string>();
for (const source of sources) {
  if (sourceIds.has(source.id)) fail(`Duplicate source id: ${source.id}`);
  sourceIds.add(source.id);
}

/* --- clue <-> source wiring ----------------------------------------------- */

/** clue id -> the sources whose body actually contains that token. */
const tokensBySource = new Map<string, string[]>();
const sourcesByClue = new Map<string, string[]>();

for (const source of sources) {
  const ids = clueIdsIn(source.body);
  tokensBySource.set(source.id, ids);
  for (const id of ids) {
    if (!clues[id]) fail(`${source.id} references unknown clue "${id}"`);
    const list = sourcesByClue.get(id) ?? [];
    list.push(source.id);
    sourcesByClue.set(id, list);
  }
}

for (const [id, clue] of Object.entries(clues)) {
  if (!people[clue.person]) fail(`${id} points at unknown person "${clue.person}"`);
  if (!sourceIds.has(clue.source)) fail(`${id} declares unknown source "${clue.source}"`);

  if (!clue.slot && !clue.link) {
    fail(`${id} has neither a slot nor a link — filing it would do nothing`);
  }
  if (clue.link) {
    if (!people[clue.link.to]) fail(`${id} links to unknown person "${clue.link.to}"`);
    if (clue.link.to === clue.person) fail(`${id} links ${clue.person} to themselves`);
    const other = people[clue.link.to];
    const self = people[clue.person];
    if (other && self && other.chapter !== self.chapter) {
      // Both ends must be on the board together or the edge is invisible.
      const source = sources.find((s) => s.id === clue.source);
      const need = Math.max(other.chapter, self.chapter);
      if (source && source.chapter < need) {
        fail(
          `${id} draws an edge to "${clue.link.to}", who isn't on the board until ` +
            `chapter ${need}, but the clue is findable in chapter ${source.chapter}`,
        );
      }
    }
  }

  const found = sourcesByClue.get(id);
  if (!found) {
    fail(`${id} is never pickable — no source body contains its token`);
  } else if (!found.includes(clue.source)) {
    fail(`${id} declares source "${clue.source}" but its token is in: ${found.join(", ")}`);
  }

  if (clue.overturns && !clues[clue.overturns]) {
    fail(`${id} overturns unknown clue "${clue.overturns}"`);
  }
  if (clue.overturns && clues[clue.overturns]?.slot === clue.slot) {
    fail(
      `${id} overturns ${clue.overturns} but they share slot "${clue.slot}" — ` +
        `they can never both be filed, so the contradiction never shows`,
    );
  }
}

/* --- false clues need a way out ------------------------------------------- */

for (const clue of Object.values(clues)) {
  if (!clue.untrue) continue;
  const overturner = Object.values(clues).find((c) => c.overturns === clue.id);
  const rival = clue.slot
    ? Object.values(clues).find(
        (c) => c.id !== clue.id && c.person === clue.person && c.slot === clue.slot && !c.untrue,
      )
    : undefined;
  if (!overturner && !rival) {
    fail(`${clue.id} is false with no overturning clue and no true rival in the same slot`);
  }
  if (!overturner) {
    warn(`${clue.id} is false but nothing flags it — the player only finds out at the end`);
  }
}

/* --- exactly one answer --------------------------------------------------- */

const targets = Object.values(people).filter((p) => p.target);
if (targets.length !== 1) fail(`Expected exactly one target person, found ${targets.length}`);
if (targets[0]?.isSona) fail(`The target cannot be the sona itself`);

/* --- reachability --------------------------------------------------------- */

const terms = new Set<string>();
for (const chapter of CASE.chapters) for (const t of chapter.startTerms) terms.add(t);

const reachedSources = new Set<string>();
const reachedClues = new Set<ClueId>();

function findable(source: SourceDoc): boolean {
  for (const term of terms) if (matchesQuery(source, term)) return true;
  return false;
}

/** Pages linked to from a page you've already reached. */
const linkedFrom = new Set<string>();

let changed = true;
while (changed) {
  changed = false;
  for (const source of sources) {
    if (reachedSources.has(source.id)) continue;
    if (!(source.requires ?? []).every((id) => reachedClues.has(id))) continue;
    // Reachable either by searching for it, or by following a link on a page
    // you already found. Closed platforms only have the second route.
    if (!findable(source) && !linkedFrom.has(source.id)) continue;

    reachedSources.add(source.id);
    changed = true;
    for (const t of source.unlocks ?? []) terms.add(t);
    for (const id of linkIdsIn(source.body)) linkedFrom.add(id);
    for (const id of tokensBySource.get(source.id) ?? []) {
      if (reachedClues.has(id)) continue;
      reachedClues.add(id);
      for (const t of clues[id]?.unlocks ?? []) terms.add(t);
    }
  }
}

for (const source of sources) {
  for (const id of linkIdsIn(source.body)) {
    if (!sourceIds.has(id)) fail(`${source.id} links to a page that doesn't exist: "${id}"`);
  }
}

for (const source of sources) {
  if (!reachedSources.has(source.id)) {
    fail(`Source "${source.id}" can never be reached — no unlocked search term finds it`);
  }
}

for (const chapter of CASE.chapters) {
  for (const id of chapter.keyClues) {
    if (!clues[id]) fail(`Chapter ${chapter.id} key clue "${id}" does not exist`);
    else if (!reachedClues.has(id)) {
      fail(`Chapter ${chapter.id} cannot be completed — key clue "${id}" is unreachable`);
    } else if (clues[id]!.untrue) {
      fail(`Chapter ${chapter.id} requires "${id}", which is a false clue`);
    }
  }
  const wrongChapter = chapter.keyClues.filter((id) => {
    const source = sources.find((s) => s.id === clues[id]?.source);
    return source && source.chapter > chapter.id;
  });
  for (const id of wrongChapter) {
    fail(`Chapter ${chapter.id} key clue "${id}" lives in a later chapter's source`);
  }
  // A key slot must be fillable by at least one reachable, true clue on a
  // candidate — otherwise the chapter can only be finished on a lie.
  for (const slot of chapter.keySlots ?? []) {
    const fillers = Object.values(clues).filter(
      (c) =>
        c.slot === slot &&
        !c.untrue &&
        people[c.person] &&
        !people[c.person]!.isSona &&
        reachedClues.has(c.id),
    );
    if (!fillers.length) {
      fail(`Chapter ${chapter.id} key slot "${slot}" has no reachable true clue on any candidate`);
    }
  }
}

/* --- the world can react, but not eat required evidence -------------------- */

const keyIds = new Set(CASE.chapters.flatMap((c) => c.keyClues));
for (const source of sources) {
  for (const id of source.until ?? []) {
    if (!clues[id]) fail(`${source.id} goes dark on unknown clue "${id}"`);
  }
  if (source.until?.length) {
    const elsewhere = (id: string) =>
      (sourcesByClue.get(id) ?? []).some((s) => s !== source.id);
    const losable = (tokensBySource.get(source.id) ?? []).filter(
      (id) => !keyIds.has(id) && !elsewhere(id) && !clues[id]?.untrue,
    );
    if (losable.length) {
      warn(`${source.id} can go dark — true clues found only there can be missed: ${losable.join(", ")}`);
    }
  }
}

/* --- endings are all achievable ------------------------------------------- */

for (const ending of Object.values(CASE.endings)) {
  // "away" is the ending where no message was sent, so no reply exists.
  if (!ending.reply.trim() && ending.id !== "away") fail(`Ending "${ending.id}" has no reply`);
  if (!ending.epilogue.trim()) fail(`Ending "${ending.id}" has no epilogue`);
  for (const v of ending.variants ?? []) {
    for (const id of [v.requiresFiled, v.missingFiled]) {
      if (id && !clues[id]) fail(`Ending "${ending.id}" variant references unknown clue "${id}"`);
    }
    for (const id of [v.requiresSeen, v.missingSeen]) {
      if (id && !sourceIds.has(id)) {
        fail(`Ending "${ending.id}" variant references unknown source "${id}"`);
      }
    }
    if (!v.text.trim()) fail(`Ending "${ending.id}" has an empty variant`);
  }
}

/* --- the composer offers a full conversation to every run ------------------ */

const ungated = (step: (typeof CASE.composer)[number]) =>
  step.options.filter((o) => !o.requiresFiled?.length && !o.requiresSeen?.length);

for (const step of CASE.composer) {
  if (ungated(step).length < 2) {
    fail(`Composer step "${step.id}" needs at least two always-available options`);
  }
  for (const option of step.options) {
    for (const id of option.requiresFiled ?? []) {
      if (!clues[id]) fail(`Composer option "${option.id}" requires unknown clue "${id}"`);
    }
    for (const id of option.requiresSeen ?? []) {
      if (!sourceIds.has(id)) fail(`Composer option "${option.id}" requires unknown source "${id}"`);
    }
  }
}

// The floor only counts options every run is offered; gated ones may be absent.
const bestCase = CASE.composer.reduce(
  (sum, step) => sum + Math.min(...ungated(step).map((o) => o.alarm)),
  0,
);
const worstCase = CASE.composer.reduce(
  (sum, step) => sum + Math.max(...step.options.map((o) => o.alarm)),
  0,
);
/*
 * You cannot finish without filing every key clue and filling every key slot,
 * so those are a floor on alarm. If that floor plus the gentlest possible
 * message still lands above the reunion threshold, the good ending is
 * unreachable no matter how carefully anyone plays.
 */
const slotFloor = CASE.chapters
  .flatMap((c) => c.keySlots ?? [])
  .reduce((sum, slot) => {
    const costs = Object.values(clues)
      .filter(
        (c) => c.slot === slot && !c.untrue && people[c.person] && !people[c.person]!.isSona,
      )
      .map((c) => WEIGHT[c.provenance]);
    return sum + (costs.length ? Math.min(...costs) : 0);
  }, 0);

const mandatory =
  CASE.chapters
    .flatMap((c) => c.keyClues)
    .reduce((sum, id) => sum + (WEIGHT[clues[id]?.provenance ?? "open"] ?? 0), 0) + slotFloor;

if (mandatory + bestCase > REUNION) {
  fail(
    `The "reunion" ending is unreachable: the mandatory evidence alone costs ${mandatory} ` +
      `and the gentlest message only gives back ${-bestCase} (threshold ${REUNION})`,
  );
}

const everything = Object.values(clues).reduce(
  (sum, c) => sum + WEIGHT[c.provenance],
  0,
);
if (everything + worstCase <= CAUTIOUS) {
  fail(`The "blocked" ending is unreachable — even the worst possible run scores too low`);
}
if (mandatory + bestCase === REUNION) {
  warn(`"reunion" is only reachable on a perfect run — no room for a single extra crossed clue`);
}

/* --- these have to read like real pages ----------------------------------- */

const PLACEHOLDER = /\b(lorem ipsum|TODO|TKTK|FIXME|placeholder|xxx+)\b/i;

for (const source of sources) {
  const visible = source.body
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  const wordCount = visible ? visible.split(" ").length : 0;
  const chunkCount = (tokensBySource.get(source.id) ?? []).length;

  if (wordCount < 140) {
    fail(`${source.id} is too thin to read as a real page (${wordCount} words)`);
  }
  if (chunkCount && wordCount / chunkCount < 40) {
    fail(
      `${source.id} reads like a clue list, not a document ` +
        `(${(wordCount / chunkCount).toFixed(0)} words per clue)`,
    );
  }
  if (PLACEHOLDER.test(visible)) fail(`${source.id} still contains placeholder text`);
  if (!source.terms.length && !linkedFrom.has(source.id)) {
    fail(`${source.id} has no search terms and nothing links to it — nothing can find it`);
  }
  if (!source.blurb.trim()) fail(`${source.id} has no search-result blurb`);
}

/* --- every painted scene is on a page somewhere ---------------------------- */

// Unknown ids already throw inside imgbox when content loads; this is the
// other direction — art that exists but nothing displays.
const MAP_ART = new Set(["map_pin"]); // drawn by the maps chrome, not content
for (const id of sceneIds()) {
  if (!usedArtIds.has(id) && !MAP_ART.has(id)) {
    warn(`Scene "${id}" is painted but no page shows it`);
  }
}

/* --- report --------------------------------------------------------------- */

if (warnings.length) {
  console.warn(`${warnings.length} warning(s):`);
  for (const w of warnings) console.warn(`  ~ ${w}`);
}

if (errors.length) {
  console.error(`\n${errors.length} error(s):`);
  for (const e of errors) console.error(`  ! ${e}`);
  process.exit(1);
}

const counts = {
  people: Object.keys(people).length,
  clues: Object.keys(clues).length,
  sources: sources.length,
  chapters: CASE.chapters.length,
};
console.log(
  `Case valid — ${counts.chapters} chapters, ${counts.sources} sources, ` +
    `${counts.clues} clues, ${counts.people} people.`,
);
