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
  placeNode,
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

  /** A search beat is in flight — results arrive after a moment, like real ones. */
  let searching = false;
  let searchTimer: number | null = null;

  /** Timers for the blocked ending's typing sounds. Cleared on restart. */
  let endingTimers: number[] = [];

  const reducedMotion = (): boolean =>
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

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

  /*
   * Entrance animations only play when the thing actually enters. Re-render is
   * whole-view, so without these flags every click would replay the rise on
   * the whole screen — the compose page used to blink on every option picked.
   */
  let lastPhase: string | null = null;
  let lastSheet: Sheet = null;
  let lastToast: string | null = null;

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
        html = playView({ state, kase, heldClue: held, searching, fresh: diffFresh(state) });
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
    if (sheet === "notebook") html += notebookView(state, kase);

    if (state.toast) {
      const tone = /doesn't|already|nothing/i.test(state.toast) ? "toast--bad" : "toast--good";
      html += `<div class="toast ${tone}">${escapeHtml(state.toast)}</div>`;
    }

    const phaseChanged = state.phase !== lastPhase;
    root.classList.toggle("enter-phase", phaseChanged);
    root.classList.toggle("enter-sheet", sheet !== null && sheet !== lastSheet);
    root.classList.toggle("enter-toast", state.toast !== null && state.toast !== lastToast);
    lastPhase = state.phase;
    lastSheet = sheet;
    lastToast = state.toast;

    const scroll = snapshotScroll();
    root.innerHTML = html;
    // Scroll only survives within a phase. A new screen starts at its top —
    // otherwise the ending opens wherever the compose page happened to be.
    if (phaseChanged) window.scrollTo({ top: 0 });
    else applyScroll(scroll);
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

  /**
   * Open a search and let the results take a beat to arrive. Instant results
   * read as a database query; a short wait reads as the internet.
   */
  function runSearch(next: GameState): void {
    if (searchTimer) window.clearTimeout(searchTimer);
    searching = !reducedMotion();
    update(next);
    if (!searching) return;
    searchTimer = window.setTimeout(() => {
      searching = false;
      searchTimer = null;
      render();
    }, 280 + Math.random() * 320);
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
      // Where the clue is leaving from, captured before the re-render eats it.
      const from =
        root.querySelector<HTMLElement>(`.chunk[data-clue="${id}"]`)?.getBoundingClientRect() ??
        lastPointer;
      const replaced = result.state.filed.length === before;
      held = null;
      if (replaced) audio.sfx.replace();
      else audio.sfx.file();
      const wasComplete = chapterComplete(state, kase);
      update(result.state);
      if (!wasComplete && chapterComplete(result.state, kase)) audio.sfx.unlock();
      flyToDossier(id, from, replaced);
    } else {
      audio.sfx.reject();
      update(setToast(state, result.message), { persist: false });
    }
  }

  /** Last known pointer position, as a rect-ish fallback for keyboard filing. */
  let lastPointer: DOMRect | null = null;

  /**
   * The clue label physically travels from where you picked it up to the row
   * it landed in. Pure decoration, so it bails under reduced motion and
   * whenever either end of the journey can't be found.
   */
  function flyToDossier(clueId: string, from: DOMRect | null, replaced: boolean): void {
    const clue = kase.clues[clueId];
    const slotSel = clue?.slot
      ? `.slot[data-slot="${clue.slot}"]`
      : `.profile__links .profile__link`;
    const target =
      root.querySelector<HTMLElement>(`${slotSel}.is-new`) ??
      root.querySelector<HTMLElement>(slotSel) ??
      root.querySelector<HTMLElement>(`.rail__card[data-person="${clue?.person ?? ""}"]`);

    if (replaced && clue?.slot) {
      // The old value gets knocked out of the slot: one sharp jolt.
      root
        .querySelector<HTMLElement>(`.slot[data-slot="${clue.slot}"]`)
        ?.classList.add("is-jolted");
    }

    if (reducedMotion() || !clue || !from || !target) return;
    const to = target.getBoundingClientRect();

    const ghost = document.createElement("div");
    ghost.className = "fly";
    ghost.textContent = clue.label;
    ghost.style.left = `${from.left}px`;
    ghost.style.top = `${from.top}px`;
    document.body.appendChild(ghost);

    ghost
      .animate(
        [
          { transform: "translate(0, 0) scale(1)", opacity: 1 },
          {
            transform: `translate(${to.left - from.left}px, ${to.top - from.top}px) scale(0.55)`,
            opacity: 0.4,
          },
        ],
        { duration: 260, easing: "steps(7, end)", fill: "forwards" },
      )
      .finished.finally(() => ghost.remove());
  }

  /** A quick settle-flash on the message preview when a line is picked. */
  function pulsePreview(): void {
    if (reducedMotion()) return;
    root
      .querySelector<HTMLElement>(".cm-preview__body")
      ?.animate(
        [{ opacity: 0.35, transform: "translateY(3px)" }, { opacity: 1, transform: "translateY(0)" }],
        { duration: 180, easing: "steps(4, end)" },
      );
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
        runSearch(openSearch(state, el.dataset.query ?? ""));
        audio.sfx.open();
        break;
      case "open-source": {
        const id = el.dataset.source ?? "";
        // The notebook links straight to sources; following one closes it.
        if (sheet) sheet = null;
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
      case "notebook-brief":
        sheet = "brief";
        render();
        break;
      case "mute":
        audio.setMuted(!state.muted);
        update({ ...state, muted: !state.muted });
        break;
      case "quit":
        for (const t of endingTimers) window.clearTimeout(t);
        endingTimers = [];
        update({ ...state, phase: "title" });
        break;

      case "compose-pick": {
        const step = el.dataset.step ?? "";
        const option = el.dataset.option ?? "";
        update({ ...state, answers: { ...state.answers, [step]: option } });
        audio.sfx.click();
        pulsePreview();
        break;
      }
      case "accuse":
        update({ ...state, accused: el.dataset.person ?? null });
        audio.sfx.click();
        break;
      case "send": {
        audio.sfx.send();
        const ending = el.dataset.ending ?? null;
        update({ ...state, phase: "ending", ending });
        audio.stopAmbience();
        // The blocked ending's typing indicator makes sound, then stops
        // making sound, which is the worst part. Timed to the CSS timeline.
        if (ending === "blocked" && !reducedMotion()) {
          for (const at of [1600, 4200]) {
            endingTimers.push(
              window.setTimeout(() => {
                for (let i = 0; i < 5; i += 1) {
                  endingTimers.push(window.setTimeout(() => audio.sfx.type(), i * 90));
                }
              }, at),
            );
          }
        }
        break;
      }
      case "walk-away": {
        // No accusation required, no message sent, no answer ever.
        audio.sfx.click();
        update({ ...state, phase: "ending", ending: "away" });
        audio.stopAmbience();
        break;
      }
      case "restart":
        clearSave();
        audio.stopAmbience();
        for (const t of endingTimers) window.clearTimeout(t);
        endingTimers = [];
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
    runSearch(openSearch(store.get(), query));
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

  /* A web node being dragged to a new spot on the board. */
  interface NodeDrag {
    id: string;
    el: HTMLElement;
    canvas: DOMRect;
    x: number;
    y: number;
    moved: boolean;
  }
  let nodeDrag: NodeDrag | null = null;

  root.addEventListener("pointerdown", (event) => {
    const target = event.target as HTMLElement;
    const chunk = target.closest<HTMLElement>(".chunk");
    if (chunk && !chunk.classList.contains("is-filed")) {
      pending = {
        id: chunk.dataset.clue ?? "",
        x: event.clientX,
        y: event.clientY,
        dragging: false,
      };
      return;
    }
    // With empty hands, web nodes can be rearranged — it's a corkboard, and
    // corkboards are for moving things around until they make sense.
    const node = target.closest<HTMLElement>(".web__node");
    const canvas = node?.closest<HTMLElement>(".web__canvas");
    if (node && canvas && !held) {
      nodeDrag = {
        id: node.dataset.person ?? "",
        el: node,
        canvas: canvas.getBoundingClientRect(),
        x: event.clientX,
        y: event.clientY,
        moved: false,
      };
    }
  });

  document.addEventListener("pointermove", (event) => {
    lastPointer = new DOMRect(event.clientX, event.clientY, 0, 0);
    if (pending && !pending.dragging) {
      const moved = Math.hypot(event.clientX - pending.x, event.clientY - pending.y);
      if (moved > 5) {
        pending.dragging = true;
        held = pending.id;
        render();
      }
    }
    if (nodeDrag) {
      if (!nodeDrag.moved) {
        const moved = Math.hypot(event.clientX - nodeDrag.x, event.clientY - nodeDrag.y);
        if (moved > 5) nodeDrag.moved = true;
      }
      if (nodeDrag.moved) {
        // Style-only while the pointer is down; state catches up on release.
        const nx = clampPct(((event.clientX - nodeDrag.canvas.left) / nodeDrag.canvas.width) * 100);
        const ny = clampPct(((event.clientY - nodeDrag.canvas.top) / nodeDrag.canvas.height) * 100);
        nodeDrag.el.style.left = `${nx}%`;
        nodeDrag.el.style.top = `${ny}%`;
        nodeDrag.el.classList.add("is-dragging");
      }
    }
    if (held) paintHover(event.clientX, event.clientY);
    syncGhost(event.clientX, event.clientY);
  });

  function clampPct(value: number): number {
    return Math.max(6, Math.min(94, value));
  }

  document.addEventListener("pointerup", (event) => {
    if (nodeDrag) {
      const drag = nodeDrag;
      nodeDrag = null;
      if (drag.moved) {
        suppressClick = true;
        const nx = clampPct(((event.clientX - drag.canvas.left) / drag.canvas.width) * 100);
        const ny = clampPct(((event.clientY - drag.canvas.top) / drag.canvas.height) * 100);
        update(placeNode(store.get(), drag.id, [nx, ny]));
        return;
      }
    }

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
