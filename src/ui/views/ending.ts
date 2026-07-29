import { fursonaUrl } from "../../art/fursona.ts";
import { esc as escRaw, typo } from "../../platforms/kit.ts";

const esc = (value: string): string => escRaw(typo(value));
import { falseBeliefs, type GameState } from "../../engine/state.ts";
import { endingExtras, resolveVerdict, targetId } from "../../engine/ending.ts";
import type { CaseFile, EndingId } from "../../engine/types.ts";

/** Paragraphs, each arriving a beat after the last. */
function paras(text: string, startDelay = 0, step = 0.35): string {
  return text
    .trim()
    .split(/\n{2,}/)
    .map((p, i) => `<p class="reveal" style="--d:${(startDelay + i * step).toFixed(2)}s">${esc(p.trim())}</p>`)
    .join("");
}

const TONE: Record<EndingId, string> = {
  reunion: "ending--good",
  cautious: "ending--mid",
  blocked: "ending--bad",
  wrong: "ending--bad",
  away: "ending--away",
};

/**
 * The blocked reply is not prose, it's a timeline: a read receipt, a typing
 * indicator that starts and stops and starts again, and then nothing. Render
 * it as one, on delays, so the player watches the reply not arrive.
 */
function blockedReply(): string {
  return `
    <div class="dm-timeline">
      <div class="dm-line dm-line--read reveal" style="--d:0.6s">read 11:52pm</div>
      <div class="dm-bubble dm-bubble--first reveal" style="--d:1.6s" aria-label="typing">
        <i></i><i></i><i></i>
      </div>
      <div class="dm-bubble dm-bubble--second reveal" style="--d:4.2s" aria-label="typing">
        <i></i><i></i><i></i>
      </div>
      <div class="dm-line dm-line--none reveal" style="--d:7.5s">(no reply)</div>
    </div>`;
}

export function endingView(state: GameState, kase: CaseFile): string {
  const verdict = resolveVerdict(state, kase);
  const ending = kase.endings[(state.ending as EndingId) ?? verdict.ending] ?? kase.endings.cautious;
  const target = kase.people[targetId(kase)];
  const them = state.accused ? kase.people[state.accused] : null;
  const wrong = falseBeliefs(state, kase);
  const away = ending.id === "away";
  const extras = endingExtras(state, ending);

  // Walking away never tells you whether you were right. No face, no answer,
  // no score for a message that was never sent.
  const face = away ? kase.people["vale"] : them;

  const reply = away
    ? ""
    : `<div class="ending__reply">
         <div class="px-label">They wrote back</div>
         <div class="prose">${
           ending.id === "blocked" ? blockedReply() : paras(ending.reply, 0.5)
         }</div>
       </div>`;

  const epilogueDelay = ending.id === "blocked" ? 8.5 : 1.4;
  const epilogue = paras(ending.epilogue, epilogueDelay) +
    extras.map((t, i) =>
      `<p class="reveal ending__extra" style="--d:${(epilogueDelay + 0.35 * (i + 1)).toFixed(2)}s">${esc(t)}</p>`,
    ).join("");

  const breakdown = verdict.breakdown
    // A message that was never sent can't have a "how you wrote to them" row.
    .filter((row) => !away || !row.label.startsWith("How you wrote"))
    .map(
      (row) =>
        `<li><span>${esc(row.label)}</span><b class="${row.value > 0 ? "is-bad" : "is-good"}">${row.value > 0 ? "+" : ""}${row.value}</b></li>`,
    )
    .join("");

  return `
    <div class="ending ${TONE[ending.id]}">
      <div class="ending__card">
        <div class="ending__head">
          ${face ? `<img src="${fursonaUrl(face.sona)}" width="80" height="75" alt="" draggable="false">` : ""}
          <div>
            <div class="px-label">${esc(away ? "unsent" : ending.id)}</div>
            <h1 class="px-display">${esc(ending.title)}</h1>
          </div>
        </div>

        ${reply}

        <div class="prose ending__epilogue">${epilogue}</div>

        <section class="ending__score">
          <h2 class="px-label">${away ? "What you were holding" : "How you got there"}</h2>
          <ul class="ending__breakdown">${breakdown}</ul>
          ${
            !away && !verdict.correct && target
              ? `<p class="ending__note">It was ${esc(target.name)}.</p>`
              : ""
          }
          ${
            away
              ? `<p class="ending__note">You never find out whether you were right. That was the price, and you knew it when you paid it.</p>`
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
