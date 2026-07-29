import { fursonaUrl } from "../../art/fursona.ts";
import { esc as escRaw, typo } from "../../platforms/kit.ts";

const esc = (value: string): string => escRaw(typo(value));
import { livePeople, optionAvailable, provenanceTally, type GameState } from "../../engine/state.ts";
import { resolveVerdict } from "../../engine/ending.ts";
import type { CaseFile, ComposerOption } from "../../engine/types.ts";

/** A blunt hint at how a line will land, without showing the number. */
function tone(option: ComposerOption): string {
  if (option.alarm < 0) return "warm";
  if (option.alarm <= 2) return "even";
  return "sharp";
}

export function composeView(state: GameState, kase: CaseFile): string {
  // You accuse a person, not a sona — Vale and the fandom cast are off the list.
  const people = livePeople(state, kase).filter((p) => !p.isSona);
  const tally = provenanceTally(state, kase);
  const chosen = state.accused ? kase.people[state.accused] : null;
  const answered = kase.composer.every((step) => state.answers[step.id]);
  const verdict = resolveVerdict(state, kase);

  const lineup = people
    .map(
      (p) => `
      <button type="button" class="lineup__card${state.accused === p.id ? " is-on" : ""}"
              data-act="accuse" data-person="${esc(p.id)}">
        <img src="${fursonaUrl(p.sona)}" width="56" height="53" alt="" draggable="false">
        <span class="lineup__name">${esc(p.name)}</span>
        <span class="lineup__note">${esc(p.note)}</span>
      </button>`,
    )
    .join("");

  // You can only say what this run actually gave you. An option that leans on
  // the deleted journal isn't offered to someone who never found it.
  const steps = kase.composer
    .map(
      (step) => `
      <fieldset class="cm-step">
        <legend>${esc(step.prompt)}</legend>
        ${step.options
          .filter((o) => optionAvailable(state, o))
          .map(
            (o) => `
          <button type="button" class="cm-option${state.answers[step.id] === o.id ? " is-on" : ""}"
                  data-act="compose-pick" data-step="${esc(step.id)}" data-option="${esc(o.id)}"
                  data-tone="${tone(o)}">
            ${esc(o.text)}
          </button>`,
          )
          .join("")}
      </fieldset>`,
    )
    .join("");

  const draft = kase.composer
    .map((step) => step.options.find((o) => o.id === state.answers[step.id])?.text)
    .filter(Boolean)
    .join("\n\n");

  return `
    <div class="cm">
      <header class="cm-head">
        <h1 class="px-display">One message.</h1>
        <p class="prose">
          You get one. They have blocked people for less than what you already
          know. Decide who you're writing to, then decide how much of the last
          three chapters you are willing to admit out loud.
        </p>
      </header>

      <section class="cm-block">
        <h2 class="px-label">Who is Vale?</h2>
        <div class="lineup">${lineup}</div>
      </section>

      <section class="cm-block">
        <h2 class="px-label">How you got here</h2>
        <div class="cm-tally">
          <span class="px-tag px-tag--open">${tally.open} open</span>
          <span class="px-tag px-tag--crossed">${tally.crossed} crossed</span>
          <span class="px-tag px-tag--private">${tally.private} buried</span>
        </div>
        <p class="cm-tallynote">
          ${
            tally.private > 0
              ? "Some of what you know, they deleted on purpose. They will be able to tell."
              : "Nothing you have was hidden from you. That is going to matter."
          }
        </p>
      </section>

      <section class="cm-block">
        <h2 class="px-label">The message</h2>
        <div class="cm-grid">
          <div class="cm-steps">${steps}</div>
          <div class="cm-preview">
            <div class="cm-preview__head">
              ${chosen ? `<img src="${fursonaUrl(chosen.sona)}" width="32" height="30" alt="">` : ""}
              <span>${chosen ? esc(chosen.name) : "no one selected"}</span>
            </div>
            <div class="cm-preview__body">${
              draft
                ? draft
                    .split("\n\n")
                    .map((p) => `<p>${esc(p)}</p>`)
                    .join("")
                : `<p class="cm-preview__empty">Pick your lines.</p>`
            }</div>
          </div>
        </div>
      </section>

      <footer class="cm-foot">
        <button class="px-btn" data-act="walk-away"
                title="Delete the draft. Never find out.">
          Close the laptop
        </button>
        <button class="px-btn px-btn--primary" data-act="send"
                data-ending="${verdict.ending}"
                ${state.accused && answered ? "" : "disabled"}>
          ${state.accused && answered ? "Send it" : "Finish the message"}
        </button>
      </footer>
    </div>`;
}
