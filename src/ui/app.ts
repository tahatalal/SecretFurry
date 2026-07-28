/* ---------------------------------------------------------------------------
   Controller.

   One store, one root element, one delegated click handler. Views are pure
   string functions; anything interactive carries data-act and is dispatched
   here. Re-render is whole-view — the pages are small and this removes a whole
   class of stale-DOM bugs.
--------------------------------------------------------------------------- */

import * as audio from "../engine/audio.ts";
import { clear as clearSave, hasSave, load, save } from "../engine/save.ts";
import { createStore } from "../engine/store.ts";
import {
  advanceChapter,
  chapterComplete,
  chapterOf,
  closeTab,
  dropTargets,
  fileClue,
  initialState,
  openSearch,
  openSource,
  selectTab,
  setToast,
  unfileClue,
  type GameState,
} from "../engine/state.ts";
import type { CaseFile } from "../engine/types.ts";
import { DEFAULT_FURSONA, fursonaUrl, type Fursona } from "../art/fursona.ts";
import { FUR_COLORS, EYE_COLORS } from "../art/palettes.ts";
import { SPECIES } from "../art/sprites/heads.ts";
import { MARKINGS } from "../art/sprites/markings.ts";
import { ACCESSORIES } from "../art/sprites/accessories.ts";
import { aboutView, titleView } from "./views/title.ts";
import { creatorView } from "./views/creator.ts";
import { briefView, chapterEndView, notebookView } from "./views/brief.ts";
import { playView, type PlayCtx } from "./views/play.ts";
import { composeView } from "./views/compose.ts";
import { endingView } from "./views/ending.ts";

type Sheet = "about" | "brief" | "chapter-end" | "notebook" | null;

export function mount(root: HTMLElement, kase: CaseFile): void {
  const store = createStore<GameState>(initialState());

  /** Not persisted: the clue the player has picked up but not yet filed. */
  let held: string | null = null;
  let sheet: Sheet = null;
  let toastTimer: number | null = null;

  /* --- rendering ---------------------------------------------------------- */

  /*
   * Diff against the previous frame so animations only play for things that
   * genuinely just appeared. Re-render is whole-view; without this, every
   * frame would restart the pop-in on every card on the board.
   */
  let seenPeople = new Set<string>();
  let seenClues = new Set<string>();

  function diffFresh(state: GameState): PlayCtx["fresh"] {
    const people = new Set(state.known.filter((id) => !seenPeople.has(id)));
    const clues = new Set(state.filed.filter((id) => !seenClues.has(id)));
    seenPeople = new Set(state.known);
    seenClues = new Set(state.filed);
    return { people, clues };
  }

  function render(): void {
    const state = store.get();
    let html: string;

    switch (state.phase) {
      case "title":
        html = titleView(hasSave());
        break;
      case "creator":
        html = creatorView(state.sona);
        break;
      case "brief":
      case "play":
        html = playView({ state, kase, heldClue: held, fresh: diffFresh(state) });
        break;
      case "compose":
        html = composeView(state, kase);
        break;
      case "ending":
        html = endingView(state, kase);
        break;
      default:
        html = titleView(hasSave());
    }

    if (sheet === "about") html += aboutView();
    if (sheet === "brief") html += briefView(chapterOf(state, kase), state.sona);
    if (sheet === "chapter-end") html += chapterEndView(chapterOf(state, kase));
    if (sheet === "notebook") html += notebookView(notebookLines(state));

    if (state.toast) {
      const tone = /doesn't|already|nothing/i.test(state.toast) ? "toast--bad" : "toast--good";
      html += `<div class="toast ${tone}">${escapeHtml(state.toast)}</div>`;
    }

    const scroll = snapshotScroll();
    root.innerHTML = html;
    applyScroll(scroll);
    decorateChunks();
    restoreFocus();
    syncGhost();
  }

  /*
   * Re-rendering is whole-view, which used to throw away wherever you were
   * reading the moment you filed anything. Every scrollable region is keyed by
   * selector and restored after the swap.
   */
  const SCROLLABLES = [
    "#page",
    ".profile",
    ".web",
    ".rail",
    ".ct-controls",
    ".srp__termlist",
  ] as const;

  function snapshotScroll(): Record<string, number> {
    const out: Record<string, number> = { window: window.scrollY };
    for (const sel of SCROLLABLES) {
      const el = root.querySelector<HTMLElement>(sel);
      if (el && el.scrollTop > 0) out[sel] = el.scrollTop;
    }
    return out;
  }

  function applyScroll(snap: Record<string, number>): void {
    for (const sel of SCROLLABLES) {
      const top = snap[sel];
      if (top === undefined) continue;
      const el = root.querySelector<HTMLElement>(sel);
      if (el) el.scrollTop = top;
    }
    if (snap.window) window.scrollTo({ top: snap.window });
  }

  function notebookLines(state: GameState): string[] {
    return state.filed
      .map((id) => kase.clues[id])
      .filter((c): c is NonNullable<typeof c> => Boolean(c))
      .map((c) => `${kase.people[c.person]?.name ?? c.person} — ${c.label}`);
  }

  /** Mark filed clues; the rest are draggable via pointer events. */
  function decorateChunks(): void {
    const state = store.get();
    const filed = new Set(state.filed);
    root.querySelectorAll<HTMLElement>(".chunk").forEach((el) => {
      const id = el.dataset.clue ?? "";
      el.dataset.focusKey = id;
      if (filed.has(id)) {
        el.classList.add("is-filed");
      } else if (id === held) {
        el.classList.add("is-held");
      }
    });
  }

  let focusKey: string | null = null;
  function restoreFocus(): void {
    if (!focusKey) return;
    const el = root.querySelector<HTMLElement>(`[data-focus-key="${focusKey}"]`);
    el?.focus();
    focusKey = null;
  }

  function update(next: GameState, opts: { persist?: boolean } = {}): void {
    // A clue can only be held while there's a board to drop it on.
    if (next.phase !== "play") held = null;
    store.set(next);
    if (opts.persist !== false && next.phase !== "title") save(next);
    render();
    if (next.toast) {
      if (toastTimer) window.clearTimeout(toastTimer);
      toastTimer = window.setTimeout(() => {
        update(setToast(store.get(), null), { persist: false });
      }, 2600);
    }
  }

  /* --- clue handling ------------------------------------------------------ */

  function pickUp(clueId: string): void {
    const state = store.get();
    if (state.filed.includes(clueId)) return;
    held = held === clueId ? null : clueId;
    audio.sfx.click();
    render();
  }

  function dropOn(person: string, clueId: string | null): void {
    const id = clueId ?? held;
    if (!id) return;
    const state = store.get();
    const before = state.filed.length;
    const result = fileClue(state, kase, id, person);
    if (result.ok) {
      held = null;
      if (result.state.filed.length === before) audio.sfx.replace();
      else audio.sfx.file();
      const wasComplete = chapterComplete(state, kase);
      update(result.state);
      if (!wasComplete && chapterComplete(result.state, kase)) audio.sfx.unlock();
    } else {
      audio.sfx.reject();
      update(setToast(state, result.message), { persist: false });
    }
  }

  /* --- fursona edits ------------------------------------------------------ */

  function editSona(patch: Partial<Fursona>): void {
    const state = store.get();
    update({ ...state, sona: { ...state.sona, ...patch } }, { persist: false });
  }

  function randomSona(): Fursona {
    const pick = <T>(list: readonly T[]): T =>
      list[Math.floor(Math.random() * list.length)]!;
    const species = pick(SPECIES);
    return {
      ...store.get().sona,
      head: species.id,
      // Species comes from the picked head's own list, so a shark never ends
      // up on a horse skull.
      species: pick(species.examples),
      fur: pick(FUR_COLORS).id,
      marking: pick(MARKINGS).id,
      markingFur: pick(FUR_COLORS).id,
      eyes: pick(EYE_COLORS).id,
      accessory: pick(ACCESSORIES).id,
      accent: pick(FUR_COLORS).id,
    };
  }

  /* --- actions ------------------------------------------------------------ */

  function act(name: string, el: HTMLElement, event: Event): void {
    audio.unlock();
    const state = store.get();

    switch (name) {
      case "start": {
        clearSave();
        update({ ...initialState(), phase: "creator", sona: DEFAULT_FURSONA }, { persist: false });
        break;
      }
      case "continue": {
        const saved = load();
        if (saved) {
          audio.startAmbience(saved.chapter);
          update(saved, { persist: false });
        }
        break;
      }
      case "about":
        sheet = "about";
        render();
        break;
      case "close-sheet":
        sheet = null;
        render();
        break;
      case "back-title":
        update({ ...state, phase: "title" }, { persist: false });
        break;

      case "sona":
        editSona({ [el.dataset.field as keyof Fursona]: el.dataset.value } as Partial<Fursona>);
        audio.sfx.click();
        break;
      case "sona-random":
        editSona(randomSona());
        audio.sfx.open();
        break;
      case "sona-done": {
        const first = kase.chapters[0]!;
        sheet = "brief";
        audio.startAmbience(1);
        update({ ...state, phase: "play", terms: [...first.startTerms] });
        break;
      }

      case "brief-go":
        sheet = null;
        render();
        break;

      case "new-search":
        update(openSearch(state, ""));
        break;
      case "search":
        update(openSearch(state, el.dataset.query ?? ""));
        audio.sfx.open();
        break;
      case "open-source": {
        const id = el.dataset.source ?? "";
        update(openSource(state, kase, id));
        audio.sfx.open();
        break;
      }
      case "tab":
        update(selectTab(state, el.dataset.tab ?? ""), { persist: false });
        break;
      case "tab-close":
        event.stopPropagation();
        update(closeTab(state, el.dataset.tab ?? ""), { persist: false });
        break;

      case "person": {
        const person = el.dataset.person ?? "";
        if (held) dropOn(person, null);
        else update({ ...state, focus: person }, { persist: false });
        break;
      }
      case "view":
        update(
          { ...state, view: (el.dataset.view as GameState["view"]) ?? "profile" },
          { persist: false },
        );
        audio.sfx.click();
        break;
      case "unfile":
        update(unfileClue(state, el.dataset.clue ?? ""));
        audio.sfx.click();
        break;

      case "chapter-next":
        sheet = "chapter-end";
        audio.sfx.chapter();
        render();
        break;
      case "chapter-go": {
        sheet = null;
        const next = advanceChapter(state, kase);
        audio.setChapter(next.chapter);
        update(next);
        if (next.phase === "play") {
          sheet = "brief";
          render();
        }
        break;
      }

      case "notebook":
        sheet = "notebook";
        render();
        break;
      case "mute":
        audio.setMuted(!state.muted);
        update({ ...state, muted: !state.muted });
        break;
      case "quit":
        update({ ...state, phase: "title" });
        break;

      case "compose-pick": {
        const step = el.dataset.step ?? "";
        const option = el.dataset.option ?? "";
        update({ ...state, answers: { ...state.answers, [step]: option } });
        audio.sfx.click();
        break;
      }
      case "accuse":
        update({ ...state, accused: el.dataset.person ?? null });
        audio.sfx.click();
        break;
      case "send": {
        audio.sfx.send();
        update({ ...state, phase: "ending", ending: el.dataset.ending ?? null });
        audio.stopAmbience();
        break;
      }
      case "restart":
        clearSave();
        audio.stopAmbience();
        update(initialState(), { persist: false });
        break;

      default:
        break;
    }
  }

  /* --- events ------------------------------------------------------------- */

  root.addEventListener("click", (event) => {
    const target = event.target as HTMLElement | null;
    if (!target) return;

    // A drag ends in a click event too; that click has already been handled.
    if (suppressClick) {
      suppressClick = false;
      return;
    }

    const chunk = target.closest<HTMLElement>(".chunk");
    if (chunk && !chunk.classList.contains("is-filed")) {
      pickUp(chunk.dataset.clue ?? "");
      return;
    }

    const actor = target.closest<HTMLElement>("[data-act]");
    if (!actor) return;
    // The backdrop closes on click; the card inside it doesn't. This must not
    // swallow the card's own explicit close button, which lives inside it.
    const isBackdrop = actor.classList.contains("sheet");
    if (actor.dataset.act === "close-sheet" && isBackdrop && target.closest("[data-stop]")) return;
    act(actor.dataset.act ?? "", actor, event);
  });

  root.addEventListener("submit", (event) => {
    const form = (event.target as HTMLElement).closest<HTMLElement>('[data-act="search-form"]');
    if (!form) return;
    event.preventDefault();
    const input = form.querySelector<HTMLInputElement>('input[name="q"]');
    const query = input?.value.trim() ?? "";
    if (!query) return;
    audio.sfx.open();
    update(openSearch(store.get(), query));
  });

  root.addEventListener("input", (event) => {
    const el = event.target as HTMLInputElement;
    const action = el.dataset.act;
    if (action === "sona-name") {
      const state = store.get();
      store.set({ ...state, sona: { ...state.sona, name: el.value } });
      updateCreatorPreview();
    } else if (action === "sona-species") {
      const state = store.get();
      store.set({ ...state, sona: { ...state.sona, species: el.value } });
      updateCreatorPreview();
    }
  });

  /** Text fields can't survive a full re-render mid-typing, so patch in place. */
  function updateCreatorPreview(): void {
    const state = store.get();
    const img = root.querySelector<HTMLImageElement>(".ct-big");
    const name = root.querySelector<HTMLElement>(".ct-plate__name");
    const sub = root.querySelector<HTMLElement>(".ct-plate__sub");
    const done = root.querySelector<HTMLButtonElement>('[data-act="sona-done"]');
    if (name) name.textContent = state.sona.name || "unnamed";
    if (sub) sub.textContent = `${state.sona.species} · ${state.sona.pronouns}`;
    if (img) img.src = fursonaUrl(state.sona);
    if (done) {
      const ready = state.sona.name.trim().length > 0;
      done.disabled = !ready;
      done.textContent = ready ? "This is me" : "Give them a name";
    }
  }

  root.addEventListener("keydown", (event) => {
    const key = (event as KeyboardEvent).key;
    const target = event.target as HTMLElement;

    if (key === "Escape") {
      if (sheet && sheet !== "brief") {
        sheet = null;
        render();
      } else if (held) {
        held = null;
        render();
      }
      return;
    }

    if (key !== "Enter" && key !== " ") return;
    const chunk = target.closest<HTMLElement>(".chunk");
    if (chunk && !chunk.classList.contains("is-filed")) {
      event.preventDefault();
      focusKey = chunk.dataset.clue ?? null;
      pickUp(chunk.dataset.clue ?? "");
    }
  });

  /* --- dragging ------------------------------------------------------------
     Pointer events rather than HTML5 drag-and-drop. The native API swaps the
     cursor for its own drag image, so the clue label only ever showed up in
     click-to-pick mode; this way the label rides the cursor however you move a
     clue, and the drop zones can be as generous as we like.
  ------------------------------------------------------------------------- */

  const ghost = document.createElement("div");
  ghost.className = "held";
  ghost.hidden = true;
  document.body.appendChild(ghost);

  function syncGhost(x?: number, y?: number): void {
    if (!held) {
      ghost.hidden = true;
      return;
    }
    const clue = kase.clues[held];
    if (!clue) {
      ghost.hidden = true;
      return;
    }
    // A clue about two people says so, because it can go on either of them.
    const open = dropTargets(kase, clue).filter((id) => store.get().known.includes(id));
    ghost.hidden = false;
    ghost.textContent = `${clue.label} — ${
      open.length > 1 ? "fits either of them" : "drop it on someone"
    }`;
    if (x === undefined || y === undefined) return;
    // Keep the label on screen and out from under the cursor.
    const box = ghost.getBoundingClientRect();
    const left = Math.min(x + 16, window.innerWidth - box.width - 8);
    const top = Math.min(y + 20, window.innerHeight - box.height - 8);
    ghost.style.left = `${Math.max(8, left)}px`;
    ghost.style.top = `${Math.max(8, top)}px`;
  }

  interface Pending {
    id: string;
    x: number;
    y: number;
    dragging: boolean;
  }
  let pending: Pending | null = null;
  let suppressClick = false;

  /** Who, if anyone, would receive a drop at this point. */
  function personAtPoint(x: number, y: number): string | null {
    const el = document.elementFromPoint(x, y) as HTMLElement | null;
    if (!el) return null;
    const node = el.closest<HTMLElement>("[data-person]");
    if (node?.dataset.person) return node.dataset.person;
    // Anywhere inside the open profile counts as that person.
    if (el.closest(".profile")) return store.get().focus;
    return null;
  }

  function paintHover(x: number, y: number): void {
    const over = personAtPoint(x, y);
    root.querySelectorAll<HTMLElement>("[data-person]").forEach((el) => {
      el.classList.toggle("is-drop", Boolean(over) && el.dataset.person === over);
    });
    const profile = root.querySelector<HTMLElement>(".profile");
    profile?.classList.toggle("is-drop", Boolean(over) && over === store.get().focus);
  }

  function clearHover(): void {
    root.querySelectorAll(".is-drop").forEach((el) => el.classList.remove("is-drop"));
  }

  root.addEventListener("pointerdown", (event) => {
    const chunk = (event.target as HTMLElement).closest<HTMLElement>(".chunk");
    if (!chunk || chunk.classList.contains("is-filed")) return;
    pending = {
      id: chunk.dataset.clue ?? "",
      x: event.clientX,
      y: event.clientY,
      dragging: false,
    };
  });

  document.addEventListener("pointermove", (event) => {
    if (pending && !pending.dragging) {
      const moved = Math.hypot(event.clientX - pending.x, event.clientY - pending.y);
      if (moved > 5) {
        pending.dragging = true;
        held = pending.id;
        render();
      }
    }
    if (held) paintHover(event.clientX, event.clientY);
    syncGhost(event.clientX, event.clientY);
  });

  document.addEventListener("pointerup", (event) => {
    const wasDragging = pending?.dragging ?? false;
    pending = null;
    if (!wasDragging) return;

    // Dropping on someone files it; dropping anywhere else leaves the clue in
    // hand, so it can still be placed with a second click.
    suppressClick = true;
    clearHover();
    const who = personAtPoint(event.clientX, event.clientY);
    if (who) dropOn(who, held);
  });

  /** Right-click puts a held clue back down. */
  root.addEventListener("contextmenu", (event) => {
    if (!held) return;
    event.preventDefault();
    held = null;
    clearHover();
    render();
  });

  render();
}

function escapeHtml(value: string): string {
  return value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}
