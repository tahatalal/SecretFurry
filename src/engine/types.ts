/* ---------------------------------------------------------------------------
   The content model.

   Three ideas do all the work:

   1. A CLUE is one fact about one person, occupying one SLOT. Two clues in the
      same person+slot contradict each other: filing one evicts the other. That
      is where the game's tension lives — some of those clues are false.

   2. A SOURCE is one page on one real platform. Its body is HTML with
      {{c:clue_id|visible text}} tokens where clues are pickable.

   3. Sources are found by SEARCHING. Filing clues unlocks search terms, which
      surface new sources, which contain new clues. That loop is the game.
--------------------------------------------------------------------------- */

import type { Fursona } from "../art/fursona.ts";

export type ChapterId = 1 | 2 | 3;

/** How you came by a fact. The ending grades you on this distribution. */
export type Provenance =
  /** They posted it publicly on a fandom account. Fair game. */
  | "open"
  /** It ties their fandom life to their legal identity. They'd be alarmed. */
  | "crossed"
  /** Deleted, leaked, or something they clearly tried to bury. */
  | "private";

/**
 * The attribute a clue fills. One clue per person per slot, so two clues in
 * the same slot are by definition a contradiction the player has to resolve.
 */
export type Slot =
  | "name"
  | "handle"
  | "sona"
  | "species"
  | "suit"
  | "build"
  | "ident"
  | "region"
  | "city"
  | "work"
  | "schedule"
  | "art"
  | "pet"
  | "con"
  | "circle"
  | "tell"
  | "reason"
  | "contact";

export const SLOT_ORDER: readonly Slot[] = [
  "name",
  "handle",
  "sona",
  "species",
  "suit",
  "build",
  "ident",
  "region",
  "city",
  "work",
  "schedule",
  "art",
  "pet",
  "con",
  "circle",
  "tell",
  "reason",
  "contact",
];

export const SLOT_LABEL: Readonly<Record<Slot, string>> = {
  name: "Name",
  handle: "Handle",
  sona: "Fursona",
  species: "Species",
  suit: "Fursuit",
  build: "Build",
  ident: "IDs & numbers",
  region: "Region",
  city: "City",
  work: "Work",
  schedule: "Schedule",
  art: "Art",
  pet: "Pet",
  con: "Cons",
  circle: "Circle",
  tell: "Tell",
  reason: "Why they hide",
  contact: "Contact",
};

/** Slots that describe a body rather than a life. Grouped in the profile. */
export const PHYSICAL_SLOTS: readonly Slot[] = ["species", "suit", "build", "ident"];

export type ClueId = string;
export type PersonId = string;
export type SourceId = string;

/**
 * A discovered relationship between two people. Filing a clue that carries one
 * draws an edge on the web. Links don't occupy a slot — a person can have any
 * number of them, and they're the only thing on the board that is about two
 * people at once.
 */
export interface Link {
  /** The other end. The clue's own `person` is this end. */
  readonly to: PersonId;
  /** How they know each other, in a few words. */
  readonly label: string;
  /** A link the player should distrust once something overturns it. */
  readonly weak?: boolean;
}

export interface Clue {
  readonly id: ClueId;
  /** Who this is a fact about, and the only person it can be filed on. */
  readonly person: PersonId;
  /** The attribute this fills. Omitted for pure relationship clues. */
  readonly slot?: Slot;
  /** Set instead of (or as well as) a slot to draw an edge on the web. */
  readonly link?: Link;
  /**
   * Filing this puts its person on the board for the first time. Nobody is
   * visible until you find them — the cast is discovered, not handed over.
   * Link clues reveal both of their endpoints automatically.
   */
  readonly reveals?: boolean;
  /** One line, shown in the dossier row. */
  readonly label: string;
  /** What you actually learned, shown when the row is expanded. */
  readonly detail: string;
  readonly provenance: Provenance;
  /** The source this token appears in. Validated against the body. */
  readonly source: SourceId;
  /**
   * False clues look exactly like true ones until something overturns them.
   * A false clue filed at the finale skews your conclusion.
   */
  readonly untrue?: boolean;
  /** Filing this clue makes these search terms available. */
  readonly unlocks?: readonly string[];
  /**
   * Filing this clue reveals that another (false) clue was wrong. The dossier
   * flags the old row instead of silently swapping it.
   */
  readonly overturns?: ClueId;
}

export type PlatformId =
  | "bluesky"
  | "reddit"
  | "discord"
  | "furaffinity"
  | "telegram"
  | "wikipedia"
  | "fandom"
  | "linkedin"
  | "instagram"
  | "facebook"
  | "youtube"
  | "kofi"
  | "toyhouse"
  | "etsy"
  | "maps"
  | "news"
  | "blog"
  | "vrchat"
  | "wayback"
  | "search"
  | "dm";

/** What a platform module returns: its id plus the rendered page body. */
export interface Page {
  readonly platform: PlatformId;
  readonly body: string;
}

export interface SourceDoc {
  readonly id: SourceId;
  readonly platform: PlatformId;
  /** Shown in the address bar. Must look like a plausible real URL. */
  readonly url: string;
  /** Browser tab text and search-result heading. */
  readonly title: string;
  /** Search-result snippet. */
  readonly blurb: string;
  readonly chapter: ChapterId;
  /** Queries that surface this page. Matched loosely. */
  readonly terms: readonly string[];
  /** Clues that must be filed before this page exists at all. */
  readonly requires?: readonly ClueId[];
  /**
   * Filing any of these clues takes the page down for good. The world reacts:
   * accounts deactivate, pages 404. Anything already filed from it stays
   * filed — you saw it, and that can't be undone either.
   */
  readonly until?: readonly ClueId[];
  /** Search terms that become available once this page has been read. */
  readonly unlocks?: readonly string[];
  readonly body: string;
}

export interface Person {
  readonly id: PersonId;
  /** Legal name, or "—" until you learn it. */
  readonly name: string;
  /** One-line description shown on the dossier card. */
  readonly note: string;
  /** Their fandom sona, if you've connected them to one. */
  readonly sona: Fursona;
  /** Where they sit on the connection web, as [x%, y%]. */
  readonly pos: readonly [number, number];
  /** Chapter this person becomes visible in. */
  readonly chapter: ChapterId;
  /** The one you're actually looking for. Exactly one person has this. */
  readonly target?: boolean;
  /**
   * True for the sona itself. Vale is a dossier you fill in like anyone else,
   * but Vale is not a person you can accuse — the accusation is about which
   * real name is behind them.
   */
  readonly isSona?: boolean;
}

export interface Chapter {
  readonly id: ChapterId;
  readonly name: string;
  /** Shown on the chapter card. */
  readonly goal: string;
  readonly opening: string;
  /** Search terms you start the chapter with. */
  readonly startTerms: readonly string[];
  /** Filing all of these ends the chapter. */
  readonly keyClues: readonly ClueId[];
  /**
   * Slots that must be filled on at least one candidate — a real person, not a
   * sona — for the chapter to end. The gate is "build a case on somebody", not
   * "find the right somebody", which is what makes a confident wrong case
   * possible.
   */
  readonly keySlots?: readonly Slot[];
  /** Shown when the chapter completes. */
  readonly closing: string;
}

export type EndingId = "reunion" | "cautious" | "blocked" | "wrong" | "away";

/**
 * An extra epilogue paragraph that only appears when the run earned it. All
 * conditions present on a variant must hold.
 */
export interface EndingVariant {
  /** Only shown if this clue was filed at the end. */
  readonly requiresFiled?: ClueId;
  /** Only shown if this clue was never filed. */
  readonly missingFiled?: ClueId;
  /** Only shown if this page was read. */
  readonly requiresSeen?: SourceId;
  /** Only shown if this page was never read. */
  readonly missingSeen?: SourceId;
  readonly text: string;
}

export interface Ending {
  readonly id: EndingId;
  readonly title: string;
  /** The reply you get, in their voice. Empty only for "away" — no message, no reply. */
  readonly reply: string;
  /** What happened afterwards. */
  readonly epilogue: string;
  /** Run-specific paragraphs appended to the epilogue. */
  readonly variants?: readonly EndingVariant[];
}

/** One choice in the DM composer. */
export interface ComposerOption {
  readonly id: string;
  readonly text: string;
  /** Negative = makes them more comfortable, positive = more alarmed. */
  readonly alarm: number;
  /** Only offered if all of these clues are filed. You can't mention what you don't have. */
  readonly requiresFiled?: readonly ClueId[];
  /** Only offered if all of these pages were read. */
  readonly requiresSeen?: readonly SourceId[];
}

export interface ComposerStep {
  readonly id: string;
  readonly prompt: string;
  readonly options: readonly ComposerOption[];
}

export interface CaseFile {
  readonly people: Readonly<Record<PersonId, Person>>;
  readonly clues: Readonly<Record<ClueId, Clue>>;
  readonly sources: readonly SourceDoc[];
  readonly chapters: readonly Chapter[];
  readonly composer: readonly ComposerStep[];
  readonly endings: Readonly<Record<EndingId, Ending>>;
}
