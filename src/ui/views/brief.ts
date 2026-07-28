import { fursonaUrl } from "../../art/fursona.ts";
import type { Fursona } from "../../art/fursona.ts";
import { esc as escRaw, typo } from "../../platforms/kit.ts";

const esc = (value: string): string => escRaw(typo(value));
import type { Chapter } from "../../engine/types.ts";

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

export function notebookView(lines: readonly string[]): string {
  return `
    <div class="sheet" data-act="close-sheet">
      <div class="sheet__card" data-stop>
        <h2 class="sheet__title">Notebook</h2>
        <div class="prose">
          ${
            lines.length
              ? `<ul class="notebook">${lines.map((l) => `<li>${esc(l)}</li>`).join("")}</ul>`
              : `<p>Nothing yet. File a fact and it turns up here.</p>`
          }
        </div>
        <div class="sheet__actions">
          <button class="px-btn px-btn--primary" data-act="close-sheet">Close</button>
        </div>
      </div>
    </div>`;
}
