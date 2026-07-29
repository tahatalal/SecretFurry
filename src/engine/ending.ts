/* ---------------------------------------------------------------------------
   How the game grades you.

   Being right about who it is only decides whether you're talking to the right
   person. What decides how it goes is the shape of what you know: facts they
   put in public cost nothing, facts that tie their sona to their legal name
   make them uneasy, and facts they deleted or that someone leaked are the ones
   that end it. Your choices in the DM then add to or subtract from that.
--------------------------------------------------------------------------- */

import { provenanceTally, type GameState } from "./state.ts";
import type { CaseFile, Ending, EndingId } from "./types.ts";

/**
 * Weight per filed clue, by where it came from.
 *
 * Open facts are free, not a discount. An earlier version subtracted for them,
 * which meant the most thorough possible run — every crossed and buried fact
 * included — scored *better* than a careful one, because there are simply more
 * open clues than anything else. Restraint has to be the thing that pays.
 */
export const WEIGHT = { open: 0, crossed: 2, private: 5 } as const;

/**
 * alarm <= REUNION is the good ending; <= CAUTIOUS is the middle one.
 *
 * REUNION leaves room for more than one sincere message. The mandatory floor
 * (chapter gates force some crossed clues) sits well under it, so a warm
 * opening plus the badge ask — not only the single gentlest combination —
 * still gets there, and one optional crossed clue doesn't end the run.
 */
export const REUNION = 8;
export const CAUTIOUS = 24;

export interface Verdict {
  readonly ending: EndingId;
  readonly alarm: number;
  readonly correct: boolean;
  /** Shown on the ending screen so the grade is legible, not mysterious. */
  readonly breakdown: readonly { label: string; value: number }[];
}

export function targetId(kase: CaseFile): string {
  return Object.values(kase.people).find((p) => p.target)?.id ?? "";
}

export function resolveVerdict(state: GameState, kase: CaseFile): Verdict {
  const tally = provenanceTally(state, kase);
  const correct = state.accused === targetId(kase);

  const fromCrossed = tally.crossed * WEIGHT.crossed;
  const fromPrivate = tally.private * WEIGHT.private;

  let fromChoices = 0;
  for (const step of kase.composer) {
    const chosen = step.options.find((o) => o.id === state.answers[step.id]);
    if (chosen) fromChoices += chosen.alarm;
  }

  const alarm = fromCrossed + fromPrivate + fromChoices;

  const breakdown = [
    {
      label: `Things they shared openly — ${tally.open}`,
      value: 0,
    },
    {
      label: `Things that crossed between their two lives — ${tally.crossed}`,
      value: fromCrossed,
    },
    {
      label: `Things they had tried to bury — ${tally.private}`,
      value: fromPrivate,
    },
    { label: "How you wrote to them", value: fromChoices },
  ];

  if (!correct) return { ending: "wrong", alarm, correct, breakdown };
  if (alarm <= REUNION) return { ending: "reunion", alarm, correct, breakdown };
  if (alarm <= CAUTIOUS) return { ending: "cautious", alarm, correct, breakdown };
  return { ending: "blocked", alarm, correct, breakdown };
}

/**
 * Epilogue paragraphs this particular run earned. The endings remember
 * specifics — whether you read the journal, whether you carried the lie —
 * so two players comparing notes get genuinely different last pages.
 */
export function endingExtras(state: GameState, ending: Ending): string[] {
  const filed = new Set(state.filed);
  const seen = new Set(state.seen);
  return (ending.variants ?? [])
    .filter(
      (v) =>
        (!v.requiresFiled || filed.has(v.requiresFiled)) &&
        (!v.missingFiled || !filed.has(v.missingFiled)) &&
        (!v.requiresSeen || seen.has(v.requiresSeen)) &&
        (!v.missingSeen || !seen.has(v.missingSeen)),
    )
    .map((v) => v.text);
}
