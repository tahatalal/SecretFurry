import { fursonaUrl } from "../../art/fursona.ts";
import { esc as escRaw, typo } from "../../platforms/kit.ts";

const esc = (value: string): string => escRaw(typo(value));
import { falseBeliefs, type GameState } from "../../engine/state.ts";
import { resolveVerdict, targetId } from "../../engine/ending.ts";
import type { CaseFile, EndingId } from "../../engine/types.ts";

function paras(text: string): string {
  return text
    .trim()
    .split(/\n{2,}/)
    .map((p) => `<p>${esc(p.trim())}</p>`)
    .join("");
}

const TONE: Record<EndingId, string> = {
  reunion: "ending--good",
  cautious: "ending--mid",
  blocked: "ending--bad",
  wrong: "ending--bad",
};

export function endingView(state: GameState, kase: CaseFile): string {
  const verdict = resolveVerdict(state, kase);
  const ending = kase.endings[(state.ending as EndingId) ?? verdict.ending] ?? kase.endings.cautious;
  const target = kase.people[targetId(kase)];
  const them = state.accused ? kase.people[state.accused] : null;
  const wrong = falseBeliefs(state, kase);

  return `
    <div class="ending ${TONE[ending.id]}">
      <div class="ending__card">
        <div class="ending__head">
          ${them ? `<img src="${fursonaUrl(them.sona)}" width="80" height="75" alt="" draggable="false">` : ""}
          <div>
            <div class="px-label">${esc(ending.id)}</div>
            <h1 class="px-display">${esc(ending.title)}</h1>
          </div>
        </div>

        <div class="ending__reply">
          <div class="px-label">They wrote back</div>
          <div class="prose">${paras(ending.reply)}</div>
        </div>

        <div class="prose ending__epilogue">${paras(ending.epilogue)}</div>

        <section class="ending__score">
          <h2 class="px-label">How you got there</h2>
          <ul class="ending__breakdown">
            ${verdict.breakdown
              .map(
                (row) =>
                  `<li><span>${esc(row.label)}</span><b class="${row.value > 0 ? "is-bad" : "is-good"}">${row.value > 0 ? "+" : ""}${row.value}</b></li>`,
              )
              .join("")}
          </ul>
          ${
            !verdict.correct && target
              ? `<p class="ending__note">It was ${esc(target.name)}.</p>`
              : ""
          }
          ${
            wrong.length
              ? `<p class="ending__note">You were still carrying ${wrong.length} thing${wrong.length === 1 ? "" : "s"} that wasn't true: ${wrong
                  .map((c) => esc(c.label))
                  .join("; ")}.</p>`
              : ""
          }
        </section>

        <div class="sheet__actions">
          <button class="px-btn px-btn--primary" data-act="restart">Play again</button>
        </div>
      </div>
    </div>`;
}
