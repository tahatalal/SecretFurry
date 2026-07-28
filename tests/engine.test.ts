import { describe, expect, it } from "vitest";

import { CASE } from "../src/content/index.ts";
import {
  advanceChapter,
  chapterComplete,
  connections,
  dossier,
  fileClue,
  initialState,
  liveSources,
  matchesQuery,
  openSearch,
  openSource,
  provenanceTally,
  search,
  unfileClue,
  type GameState,
} from "../src/engine/state.ts";
import { resolveVerdict, targetId } from "../src/engine/ending.ts";

function playing(): GameState {
  return { ...initialState(), phase: "play", terms: [...CASE.chapters[0]!.startTerms] };
}

function file(state: GameState, id: string): GameState {
  const clue = CASE.clues[id];
  if (!clue) throw new Error(`no such clue: ${id}`);
  const result = fileClue(state, CASE, id, clue.person);
  expect(result.ok, `${id} should file onto ${clue.person}: ${result.message}`).toBe(true);
  return result.state;
}

describe("search", () => {
  it("matches on any word order", () => {
    const bsky = CASE.sources.find((s) => s.id === "vale_bsky")!;
    expect(matchesQuery(bsky, "vale maned wolf")).toBe(true);
    expect(matchesQuery(bsky, "maned wolf vale")).toBe(true);
    expect(matchesQuery(bsky, "vale")).toBe(true);
  });

  it("does not match unrelated queries", () => {
    const bsky = CASE.sources.find((s) => s.id === "vale_bsky")!;
    expect(matchesQuery(bsky, "kishwaukee middle school")).toBe(false);
    expect(matchesQuery(bsky, "")).toBe(false);
  });

  it("only returns sources from chapters that have opened", () => {
    const state = playing();
    const results = search(state, CASE, "kishwaukee middle school staff");
    expect(results).toHaveLength(0);
  });
});

describe("filing", () => {
  it("refuses a clue that belongs to someone else", () => {
    const state = playing();
    const result = fileClue(state, CASE, "vale_sona", "marisol");
    expect(result.ok).toBe(false);
    expect(result.state.filed).toHaveLength(0);
  });

  it("refuses to file the same clue twice", () => {
    const once = file(playing(), "vale_sona");
    const twice = fileClue(once, CASE, "vale_sona", "vale");
    expect(twice.ok).toBe(false);
    expect(once.filed).toHaveLength(1);
  });

  it("evicts whatever was in the slot", () => {
    let state = file(playing(), "vale_region_pnw");
    expect(dossier(state, CASE, "vale").get("region")?.id).toBe("vale_region_pnw");

    state = file(state, "vale_region_midwest");
    expect(dossier(state, CASE, "vale").get("region")?.id).toBe("vale_region_midwest");
    expect(state.filed).toHaveLength(1);
    expect(state.filed).not.toContain("vale_region_pnw");
  });

  it("lets relationship clues accumulate without evicting each other", () => {
    let state = playing();
    state = file(state, "vale_link_bramble");
    state = file(state, "vale_link_poplar");
    expect(connections(state, CASE)).toHaveLength(2);
  });

  it("unlocks new search terms", () => {
    const state = file(playing(), "vale_sona");
    expect(state.terms).toContain("vale toyhouse ref");
  });

  it("can be undone", () => {
    const state = unfileClue(file(playing(), "vale_sona"), "vale_sona");
    expect(state.filed).toHaveLength(0);
  });
});

describe("gating", () => {
  it("hides sources whose prerequisites are unfiled", () => {
    const before = liveSources(playing(), CASE).map((s) => s.id);
    expect(before).not.toContain("vale_toyhouse");

    const after = liveSources(file(playing(), "vale_sona"), CASE).map((s) => s.id);
    expect(after).toContain("vale_toyhouse");
  });

  it("completes a chapter only once every key clue is filed", () => {
    let state = playing();
    const keys = CASE.chapters[0]!.keyClues;
    for (const id of keys.slice(0, -1)) state = file(state, id);
    expect(chapterComplete(state, CASE)).toBe(false);
    state = file(state, keys[keys.length - 1]!);
    expect(chapterComplete(state, CASE)).toBe(true);
  });

  it("carries the next chapter's leads over on advance", () => {
    const next = advanceChapter(playing(), CASE);
    expect(next.chapter).toBe(2);
    for (const term of CASE.chapters[1]!.startTerms) expect(next.terms).toContain(term);
  });
});

describe("tabs", () => {
  it("reuses the active search tab instead of stacking empties", () => {
    let state = openSearch(playing(), "");
    state = openSearch(state, "vale maned wolf");
    state = openSearch(state, "midwest furfest");
    expect(state.tabs).toHaveLength(1);
    expect(state.tabs[0]?.query).toBe("midwest furfest");
  });

  it("opens a source in its own tab and does not duplicate it", () => {
    let state = openSource(openSearch(playing(), "vale"), CASE, "vale_bsky");
    const count = state.tabs.length;
    state = openSource(state, CASE, "vale_bsky");
    expect(state.tabs).toHaveLength(count);
  });

  it("unlocks leads just from reading a page", () => {
    const state = openSource(playing(), CASE, "mff_wiki");
    expect(state.terms).toContain("fursuit parade 2024 photos");
  });
});

describe("the ending", () => {
  const openIds = Object.values(CASE.clues)
    .filter((c) => c.provenance === "open" && !c.untrue)
    .map((c) => c.id);

  function kindest(): GameState {
    let state: GameState = { ...playing(), chapter: 3 };
    for (const id of openIds) {
      const clue = CASE.clues[id]!;
      const result = fileClue(state, CASE, id, clue.person);
      if (result.ok) state = result.state;
    }
    state = { ...state, accused: targetId(CASE) };
    for (const step of CASE.composer) {
      const gentlest = [...step.options].sort((a, b) => a.alarm - b.alarm)[0]!;
      state = { ...state, answers: { ...state.answers, [step.id]: gentlest.id } };
    }
    return state;
  }

  it("rewards a run built only on what they shared openly", () => {
    expect(resolveVerdict(kindest(), CASE).ending).toBe("reunion");
  });

  it("punishes leaning on things they buried", () => {
    let state = kindest();
    for (const clue of Object.values(CASE.clues)) {
      if (clue.provenance === "open") continue;
      const result = fileClue(state, CASE, clue.id, clue.person);
      if (result.ok) state = result.state;
    }
    for (const step of CASE.composer) {
      const worst = [...step.options].sort((a, b) => b.alarm - a.alarm)[0]!;
      state = { ...state, answers: { ...state.answers, [step.id]: worst.id } };
    }
    expect(resolveVerdict(state, CASE).ending).toBe("blocked");
  });

  it("does not care how gentle you were if you picked the wrong person", () => {
    const wrong = { ...kindest(), accused: "dev" };
    expect(resolveVerdict(wrong, CASE).ending).toBe("wrong");
  });

  it("counts provenance across everything filed", () => {
    const tally = provenanceTally(kindest(), CASE);
    expect(tally.open).toBeGreaterThan(0);
    expect(tally.private).toBe(0);
  });
});
