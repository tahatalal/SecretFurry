/* ---------------------------------------------------------------------------
   Game state, actions, and the selectors the UI reads.

   State is one flat serializable object. Everything derivable — which sources
   exist, which slot a person's clue occupies, whether the chapter is done — is
   computed here rather than stored, so a save can never disagree with itself.
--------------------------------------------------------------------------- */

import type { Fursona } from "../art/fursona.ts";
import { DEFAULT_FURSONA } from "../art/fursona.ts";
import type {
  CaseFile,
  ChapterId,
  Clue,
  ClueId,
  ComposerOption,
  PersonId,
  Provenance,
  Slot,
  SourceDoc,
  SourceId,
} from "./types.ts";
import { SLOT_LABEL } from "./types.ts";

export type Phase = "title" | "creator" | "brief" | "play" | "compose" | "ending";

export interface Tab {
  readonly id: string;
  readonly kind: "search" | "source";
  /** For kind "search". */
  readonly query?: string;
  /** For kind "source". */
  readonly sourceId?: SourceId;
}

export interface GameState {
  readonly v: number;
  readonly phase: Phase;
  readonly chapter: ChapterId;
  readonly sona: Fursona;
  /** Clue ids the player has committed to a dossier, in filing order. */
  readonly filed: readonly ClueId[];
  /**
   * Clue ids locked into the record. Everything filed when a chapter closes
   * becomes part of the case for good — you can't un-know something on the
   * way out the door just to look better at the end.
   */
  readonly committed: readonly ClueId[];
  /** Source ids the player has laid eyes on, so re-reads don't re-highlight. */
  readonly seen: readonly SourceId[];
  readonly terms: readonly string[];
  readonly tabs: readonly Tab[];
  readonly activeTab: string;
  readonly focus: PersonId | null;
  /** Dossier panel mode: one person's facts, or everyone's connections. */
  readonly view: "profile" | "web";
  /**
   * People you have actually found. Everyone else does not exist yet as far as
   * the board is concerned — you start knowing only that Vale is out there.
   */
  readonly known: readonly PersonId[];
  readonly accused: PersonId | null;
  /** Where the player has dragged web nodes to, as [x%, y%] on the canvas. */
  readonly webPos: Readonly<Record<PersonId, readonly [number, number]>>;
  /** Composer step id -> chosen option id. */
  readonly answers: Readonly<Record<string, string>>;
  readonly ending: string | null;
  readonly muted: boolean;
  /** Transient UI note, e.g. "that doesn't fit them". Not persisted. */
  readonly toast: string | null;
}

export const SAVE_VERSION = 1;

export function initialState(): GameState {
  return {
    v: SAVE_VERSION,
    phase: "title",
    chapter: 1,
    sona: DEFAULT_FURSONA,
    filed: [],
    committed: [],
    seen: [],
    terms: [],
    tabs: [],
    activeTab: "",
    focus: "vale",
    view: "profile",
    known: ["vale"],
    accused: null,
    webPos: {},
    answers: {},
    ending: null,
    muted: false,
    toast: null,
  };
}

/* --- selectors ------------------------------------------------------------ */

/**
 * The world reacting: a page whose `until` clue has been filed is gone. It
 * stops turning up in search, and an open tab shows a tombstone instead.
 */
export function isGone(state: GameState, doc: SourceDoc): boolean {
  if (!doc.until?.length) return false;
  return doc.until.some((id) => state.filed.includes(id));
}

/** Sources that exist right now: right chapter, prerequisites filed, not dead. */
export function liveSources(state: GameState, kase: CaseFile): SourceDoc[] {
  const filed = new Set(state.filed);
  return kase.sources.filter(
    (source) =>
      source.chapter <= state.chapter &&
      (source.requires ?? []).every((id) => filed.has(id)) &&
      !isGone(state, source),
  );
}

const STOP_WORDS = new Set([
  "the", "a", "an", "of", "and", "or", "in", "on", "at", "to", "for", "is", "was",
]);

function words(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9@#. ]/g, " ")
    .split(/\s+/)
    .filter((w) => w.length > 1 && !STOP_WORDS.has(w));
}

/**
 * A source matches a query when every meaningful word in the query appears in
 * its terms, title, URL or blurb. Loose enough that "vale maned wolf" and
 * "maned wolf vale" both work, strict enough that browsing isn't free.
 *
 * The validator uses this too, so a lead that can't be reached in the game
 * can't be reached in the reachability check either.
 */
export function matchesQuery(source: SourceDoc, query: string): boolean {
  // No terms means the page isn't indexed at all — invite-only servers, group
  // chats, anything behind a login. Those are reached by following a link
  // somebody posted, never by searching for them.
  if (!source.terms.length) return false;
  const needles = words(query);
  if (!needles.length) return false;
  const hay = [source.title, source.url, source.blurb, ...source.terms].join(" ").toLowerCase();
  return needles.every((n) => hay.includes(n));
}

export function search(state: GameState, kase: CaseFile, query: string): SourceDoc[] {
  if (!words(query).length) return [];
  const wanted = query.trim().toLowerCase();
  return liveSources(state, kase)
    .filter((source) => matchesQuery(source, query))
    .sort((a, b) => {
      const exactA = a.terms.some((t) => t.toLowerCase() === wanted) ? 1 : 0;
      const exactB = b.terms.some((t) => t.toLowerCase() === wanted) ? 1 : 0;
      return exactB - exactA || a.chapter - b.chapter;
    });
}

/** The clue currently filed in each of a person's slots. */
export function dossier(
  state: GameState,
  kase: CaseFile,
  person: PersonId,
): Map<Slot, Clue> {
  const out = new Map<Slot, Clue>();
  for (const id of state.filed) {
    const clue = kase.clues[id];
    if (clue?.slot && clue.person === person) out.set(clue.slot, clue);
  }
  return out;
}

export interface Edge {
  readonly clue: Clue;
  readonly from: PersonId;
  readonly to: PersonId;
  readonly label: string;
  readonly weak: boolean;
}

/** Every relationship the player has established, for the web view. */
export function connections(state: GameState, kase: CaseFile): Edge[] {
  const out: Edge[] = [];
  for (const id of state.filed) {
    const clue = kase.clues[id];
    if (!clue?.link) continue;
    if (!kase.people[clue.link.to]) continue;
    out.push({
      clue,
      from: clue.person,
      to: clue.link.to,
      label: clue.link.label,
      weak: Boolean(clue.link.weak) || isOverturned(state, kase, clue.id),
    });
  }
  return out;
}

/** Relationship clues filed against one person, for their profile panel. */
export function linksFor(state: GameState, kase: CaseFile, person: PersonId): Edge[] {
  return connections(state, kase).filter((e) => e.from === person || e.to === person);
}

/** People you have found. The board starts almost empty on purpose. */
export function livePeople(state: GameState, kase: CaseFile) {
  return Object.values(kase.people)
    .filter((p) => p.chapter <= state.chapter && state.known.includes(p.id))
    .sort((a, b) => a.chapter - b.chapter || a.name.localeCompare(b.name));
}

/**
 * Who a clue can legitimately be dropped on. A fact about one person goes on
 * that person; a fact about a relationship is about both of them, so either
 * end accepts it.
 */
export function dropTargets(_kase: CaseFile, clue: Clue): PersonId[] {
  return clue.link ? [clue.person, clue.link.to] : [clue.person];
}

/** People a clue would put on the board if filed. */
export function revealedBy(clue: Clue): PersonId[] {
  if (clue.link) return [clue.person, clue.link.to];
  return clue.reveals ? [clue.person] : [];
}

export function chapterOf(state: GameState, kase: CaseFile) {
  return kase.chapters.find((c) => c.id === state.chapter) ?? kase.chapters[0]!;
}

/**
 * A key slot is satisfied when it's filled on any candidate — any real person,
 * not a sona. The gate is "have a case", not "have the right case": you can
 * finish a chapter with a confident wrong answer, and find out in the reply.
 */
function slotSatisfied(state: GameState, kase: CaseFile, slot: Slot): boolean {
  return state.filed.some((id) => {
    const clue = kase.clues[id];
    return clue?.slot === slot && kase.people[clue.person] && !kase.people[clue.person]!.isSona;
  });
}

export function chapterComplete(state: GameState, kase: CaseFile): boolean {
  const { done, total } = keyProgress(state, kase);
  return done === total;
}

/** Progress toward the chapter gate, counting key clues and key slots alike. */
export function keyProgress(state: GameState, kase: CaseFile): { done: number; total: number } {
  const chapter = chapterOf(state, kase);
  const filed = new Set(state.filed);
  const clueDone = chapter.keyClues.filter((id) => filed.has(id)).length;
  const slots = chapter.keySlots ?? [];
  const slotDone = slots.filter((slot) => slotSatisfied(state, kase, slot)).length;
  return { done: clueDone + slotDone, total: chapter.keyClues.length + slots.length };
}

/** How the player got what they know. Drives the ending. */
export function provenanceTally(
  state: GameState,
  kase: CaseFile,
): Record<Provenance, number> {
  const tally: Record<Provenance, number> = { open: 0, crossed: 0, private: 0 };
  for (const id of state.filed) {
    const clue = kase.clues[id];
    if (clue) tally[clue.provenance] += 1;
  }
  return tally;
}

/** Filed clues that are actually false and were never overturned. */
export function falseBeliefs(state: GameState, kase: CaseFile): Clue[] {
  const filed = new Set(state.filed);
  const overturned = new Set(
    state.filed
      .map((id) => kase.clues[id]?.overturns)
      .filter((id): id is ClueId => Boolean(id)),
  );
  return state.filed
    .map((id) => kase.clues[id])
    .filter((c): c is Clue => Boolean(c && c.untrue && filed.has(c.id) && !overturned.has(c.id)));
}

export function isOverturned(state: GameState, kase: CaseFile, id: ClueId): boolean {
  return state.filed.some((f) => kase.clues[f]?.overturns === id);
}

/* --- actions -------------------------------------------------------------- */

let tabSeq = 0;
function tabId(): string {
  tabSeq += 1;
  return `t${tabSeq}`;
}

/**
 * Open a search. Reuses the active search tab if there is one, then any blank
 * search tab, and only then opens a new one — otherwise every click on
 * "Search" leaves another empty tab behind.
 */
export function openSearch(state: GameState, query: string): GameState {
  const active = state.tabs.find((t) => t.id === state.activeTab);
  const reuse =
    active?.kind === "search"
      ? active
      : state.tabs.find((t) => t.kind === "search" && !t.query);

  if (reuse) {
    return {
      ...state,
      tabs: state.tabs.map((t) => (t.id === reuse.id ? { ...t, query } : t)),
      activeTab: reuse.id,
      toast: null,
    };
  }

  const tab: Tab = { id: tabId(), kind: "search", query };
  return { ...state, tabs: [...state.tabs, tab], activeTab: tab.id, toast: null };
}

export function openSource(state: GameState, kase: CaseFile, sourceId: SourceId): GameState {
  const doc = kase.sources.find((s) => s.id === sourceId);
  const terms = [...state.terms];
  // Reading a page is itself progress: some leads only come from having looked.
  for (const term of doc?.unlocks ?? []) if (!terms.includes(term)) terms.push(term);

  const existing = state.tabs.find((t) => t.sourceId === sourceId);
  if (existing) return { ...state, activeTab: existing.id, terms, toast: null };

  const tab: Tab = { id: tabId(), kind: "source", sourceId };
  return {
    ...state,
    tabs: [...state.tabs, tab],
    activeTab: tab.id,
    terms,
    seen: state.seen.includes(sourceId) ? state.seen : [...state.seen, sourceId],
    toast: null,
  };
}

export function closeTab(state: GameState, id: string): GameState {
  const index = state.tabs.findIndex((t) => t.id === id);
  if (index < 0) return state;
  const tabs = state.tabs.filter((t) => t.id !== id);
  const nextActive =
    state.activeTab === id ? (tabs[index - 1] ?? tabs[0])?.id ?? "" : state.activeTab;
  return { ...state, tabs, activeTab: nextActive };
}

export function selectTab(state: GameState, id: string): GameState {
  return { ...state, activeTab: id, toast: null };
}

export interface FileResult {
  readonly state: GameState;
  readonly ok: boolean;
  readonly message: string;
}

/**
 * Commit a clue to a person's dossier. Filing into an occupied slot evicts
 * whatever was there — that eviction is the whole contradiction mechanic.
 */
export function fileClue(
  state: GameState,
  kase: CaseFile,
  clueId: ClueId,
  person: PersonId,
): FileResult {
  const clue = kase.clues[clueId];
  if (!clue) return { state, ok: false, message: "Nothing to file." };
  if (state.filed.includes(clueId)) {
    return { state, ok: false, message: "Already in the dossier." };
  }
  const targets = dropTargets(kase, clue);
  if (!targets.includes(person)) {
    const who = kase.people[person]?.name ?? "them";
    return { state, ok: false, message: `That doesn't tell you anything about ${who}.` };
  }

  // Only slotted clues evict. Relationship clues accumulate freely — a person
  // can be connected to any number of others.
  const evicted = clue.slot
    ? state.filed.find((id) => {
        const other = kase.clues[id];
        return other && other.person === person && other.slot === clue.slot;
      })
    : undefined;

  const filed = evicted
    ? [...state.filed.filter((id) => id !== evicted), clueId]
    : [...state.filed, clueId];

  const terms = [...state.terms];
  for (const term of clue.unlocks ?? []) if (!terms.includes(term)) terms.push(term);

  // Filing a fact about somebody is finding them. The `reveals` flag still
  // matters for authoring intent, but the board must never hold a fact about
  // a person it refuses to show.
  const known = [...state.known];
  const found: string[] = [];
  const met = [clue.person, ...(clue.link ? [clue.link.to] : []), ...revealedBy(clue)];
  for (const id of met) {
    if (known.includes(id) || !kase.people[id]) continue;
    known.push(id);
    found.push(kase.people[id]!.name);
  }

  const message = found.length
    ? `New on the board: ${found.join(" and ")}.`
    : evicted
      ? `Filed — it replaces what you had under ${SLOT_LABEL[clue.slot!].toLowerCase()}.`
      : "Filed.";

  return {
    state: { ...state, filed, terms, known, focus: person, toast: message },
    ok: true,
    message,
  };
}

export function unfileClue(state: GameState, clueId: ClueId): GameState {
  // Once a chapter has closed over a clue, it's evidence, not a draft. The
  // ending grades what you knew, and you knew this.
  if (state.committed.includes(clueId)) {
    return { ...state, toast: "That's in the record now. It doesn't come back out." };
  }
  return { ...state, filed: state.filed.filter((id) => id !== clueId), toast: null };
}

/** Everything filed at a chapter boundary becomes permanent. */
function commitFiled(state: GameState): readonly ClueId[] {
  const committed = new Set(state.committed);
  for (const id of state.filed) committed.add(id);
  return [...committed];
}

export function advanceChapter(state: GameState, kase: CaseFile): GameState {
  const committed = commitFiled(state);
  if (state.chapter >= 3) return { ...state, committed, phase: "compose", toast: null };
  const next = (state.chapter + 1) as ChapterId;
  const chapter = kase.chapters.find((c) => c.id === next);
  const terms = [...state.terms];
  for (const term of chapter?.startTerms ?? []) {
    if (!terms.includes(term)) terms.push(term);
  }
  return { ...state, committed, chapter: next, terms, tabs: [], activeTab: "", toast: null };
}

/** Pin a dragged web node where the player left it. */
export function placeNode(
  state: GameState,
  person: PersonId,
  pos: readonly [number, number],
): GameState {
  return { ...state, webPos: { ...state.webPos, [person]: pos } };
}

/** Whether a composer option is on the table for this run. */
export function optionAvailable(state: GameState, option: ComposerOption): boolean {
  return (
    (option.requiresFiled ?? []).every((id) => state.filed.includes(id)) &&
    (option.requiresSeen ?? []).every((id) => state.seen.includes(id))
  );
}

export function setToast(state: GameState, toast: string | null): GameState {
  return { ...state, toast };
}
