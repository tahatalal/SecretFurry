import { fursonaUrl } from "../../art/fursona.ts";
import type { Fursona } from "../../art/fursona.ts";
import { esc as escRaw, typo } from "../../platforms/kit.ts";

const esc = (value: string): string => escRaw(typo(value));
import { chapterOf, isOverturned, type GameState } from "../../engine/state.ts";
import type { CaseFile, Chapter } from "../../engine/types.ts";

function paras(text: string): string {
  return text
    .trim()
    .split(/\n{2,}/)
    .map((p) => `<p>${esc(p.trim()).replace(/\n/g, "<br>")}</p>`)
    .join("");
}

export function briefView(chapter: Chapter, sona: Fursona): string {
  return `
    <div class="sheet">
      <div class="sheet__card">
        <div class="brief__head">
          <img src="${fursonaUrl(sona)}" width="64" height="60" alt="" draggable="false">
          <div>
            <div class="px-label">Chapter ${chapter.id}</div>
            <h2 class="sheet__title" style="margin:0">${esc(chapter.name)}</h2>
          </div>
        </div>
        <div class="prose">${paras(chapter.opening)}</div>
        <div class="brief__goal">
          <span class="px-label">What you're trying to do</span>
          <p>${esc(chapter.goal)}</p>
        </div>
        <div class="sheet__actions">
          <button class="px-btn px-btn--primary" data-act="brief-go">Start looking</button>
        </div>
      </div>
    </div>`;
}

export function chapterEndView(chapter: Chapter): string {
  return `
    <div class="sheet">
      <div class="sheet__card">
        <div class="px-label">Chapter ${chapter.id} &mdash; ${esc(chapter.name)}</div>
        <h2 class="sheet__title">That's as far as this gets you.</h2>
        <div class="prose">${paras(chapter.closing)}</div>
        <div class="sheet__actions">
          <button class="px-btn px-btn--primary" data-act="chapter-go">
            ${chapter.id === 3 ? "Write to them" : "Keep going"}
          </button>
        </div>
      </div>
    </div>`;
}

/**
 * The case log. Everything filed, grouped by person in the order you met
 * them, colored by where it came from, and linked back to its source — so
 * "wait, where did I read that?" is one click instead of a memory test.
 */
export function notebookView(state: GameState, kase: CaseFile): string {
  const chapter = chapterOf(state, kase);

  const byPerson = new Map<string, string[]>();
  for (const id of state.filed) {
    const clue = kase.clues[id];
    if (!clue) continue;
    const list = byPerson.get(clue.person) ?? [];
    const doc = kase.sources.find((s) => s.id === clue.source);
    const flagged = clue.untrue && isOverturned(state, kase, id);
    list.push(`
      <li class="casebook__row${flagged ? " is-suspect" : ""}">
        <span class="casebook__dot casebook__dot--${clue.provenance}"
              title="${clue.provenance === "open" ? "Shared openly" : clue.provenance === "crossed" ? "Crossed between their two lives" : "They tried to bury this"}"></span>
        <span class="casebook__label">${esc(clue.label)}</span>
        ${
          doc
            ? `<button type="button" class="casebook__src" data-act="open-source"
                       data-source="${esc(doc.id)}" title="${esc(doc.title)}">source</button>`
            : ""
        }
      </li>`);
    byPerson.set(clue.person, list);
  }

  const groups = [...byPerson.entries()]
    .map(([personId, rows]) => {
      const person = kase.people[personId];
      if (!person) return "";
      return `
        <section class="casebook__group">
          <header class="casebook__who">
            <img src="${fursonaUrl(person.sona)}" width="28" height="26" alt="" draggable="false">
            <b>${esc(person.name)}</b>
          </header>
          <ul class="casebook__rows">${rows.join("")}</ul>
        </section>`;
    })
    .join("");

  return `
    <div class="sheet" data-act="close-sheet">
      <div class="sheet__card" data-stop>
        <h2 class="sheet__title">Notebook</h2>
        <div class="casebook__goal">
          <span class="px-label">Chapter ${chapter.id} &mdash; ${esc(chapter.name)}</span>
          <p>${esc(chapter.goal)}</p>
          <button type="button" class="px-btn px-btn--sm" data-act="notebook-brief">Reread the brief</button>
        </div>
        <div class="casebook__legend">
          <span><i class="casebook__dot casebook__dot--open"></i> shared openly</span>
          <span><i class="casebook__dot casebook__dot--crossed"></i> crossed lives</span>
          <span><i class="casebook__dot casebook__dot--private"></i> was buried</span>
        </div>
        ${
          state.filed.length
            ? `<div class="casebook px-scroll">${groups}</div>`
            : `<p class="prose">Nothing yet. File a fact and it turns up here.</p>`
        }
        <div class="sheet__actions">
          <button class="px-btn px-btn--primary" data-act="close-sheet">Close</button>
        </div>
      </div>
    </div>`;
}
