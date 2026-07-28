/* Assembles the case file. Content modules stay dumb; this is the only place
   that knows about all of them. */

import type { CaseFile, Clue, ClueId } from "../engine/types.ts";
import { PEOPLE } from "./people.ts";
import { CH1, CH1_CLUES, CH1_SOURCES } from "./ch1.ts";
import { CH2, CH2_CLUES, CH2_SOURCES } from "./ch2.ts";
import { CH3, CH3_CLUES, CH3_SOURCES } from "./ch3.ts";
import { COMPOSER, ENDINGS } from "./endings.ts";

function index(list: readonly Clue[]): Record<ClueId, Clue> {
  const out: Record<ClueId, Clue> = {};
  for (const clue of list) {
    if (out[clue.id]) throw new Error(`Duplicate clue id: ${clue.id}`);
    out[clue.id] = clue;
  }
  return out;
}

export const CASE: CaseFile = Object.freeze({
  people: PEOPLE,
  clues: index([...CH1_CLUES, ...CH2_CLUES, ...CH3_CLUES]),
  sources: [...CH1_SOURCES, ...CH2_SOURCES, ...CH3_SOURCES],
  chapters: [CH1, CH2, CH3],
  composer: COMPOSER,
  endings: ENDINGS,
});
