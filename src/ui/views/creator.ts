import type { Fursona } from "../../art/fursona.ts";
import { fursonaUrl } from "../../art/fursona.ts";
import { EYE_COLORS, FUR_COLORS } from "../../art/palettes.ts";
import { SPECIES, speciesById } from "../../art/sprites/heads.ts";
import { MARKINGS } from "../../art/sprites/markings.ts";
import { ACCESSORIES } from "../../art/sprites/accessories.ts";
import { esc } from "../../platforms/kit.ts";

const PRONOUNS = ["they/them", "she/her", "he/him", "he/they", "she/they", "any"];

function swatchRow(
  field: keyof Fursona,
  current: string,
  items: readonly { id: string; name: string; hex: string }[],
): string {
  return `<div class="ct-swatches">
    ${items
      .map(
        (c) =>
          `<button type="button" class="ct-swatch${c.id === current ? " is-on" : ""}"
             style="--c:${c.hex}" title="${esc(c.name)}"
             data-act="sona" data-field="${field}" data-value="${c.id}">
             <span class="px-sr">${esc(c.name)}</span>
           </button>`,
      )
      .join("")}
  </div>`;
}

function chipRow(
  field: keyof Fursona,
  current: string,
  items: readonly { id: string; name: string }[],
): string {
  return `<div class="ct-chips">
    ${items
      .map(
        (i) =>
          `<button type="button" class="px-btn px-btn--sm${i.id === current ? " px-btn--primary" : ""}"
             data-act="sona" data-field="${field}" data-value="${i.id}">${esc(i.name)}</button>`,
      )
      .join("")}
  </div>`;
}

export function creatorView(sona: Fursona): string {
  const species = speciesById(sona.head);
  const furSwatches = FUR_COLORS.map((c) => ({ id: c.id, name: c.name, hex: c.base }));
  const ready = sona.name.trim().length > 0;

  return `
    <div class="ct">
      <header class="ct-head">
        <h1 class="px-display">Who are you online?</h1>
        <p>Before you go looking for someone else's sona, you need your own.
           This is the face every site in this game will see you as.</p>
      </header>

      <div class="ct-grid">
        <aside class="ct-preview px-panel">
          <img class="ct-big" src="${fursonaUrl(sona)}" width="256" height="240" alt="Your fursona">
          <div class="ct-plate">
            <div class="ct-plate__name">${esc(sona.name || "unnamed")}</div>
            <div class="ct-plate__sub">${esc(sona.species)} &middot; ${esc(sona.pronouns)}</div>
          </div>
          <button class="px-btn px-btn--cool px-btn--sm" data-act="sona-random">Surprise me</button>
        </aside>

        <div class="ct-controls px-scroll">
          <section class="ct-block">
            <label class="px-label" for="sona-name">Sona name</label>
            <input class="px-input" id="sona-name" type="text" maxlength="22"
                   placeholder="what people call you at cons"
                   value="${esc(sona.name)}" data-act="sona-name">
          </section>

          <section class="ct-block">
            <div class="px-label">Build</div>
            ${chipRow("head", sona.head, SPECIES.map((s) => ({ id: s.id, name: s.name })))}
            <div class="ct-hint">${species.examples.join(" &middot; ")}</div>
          </section>

          <section class="ct-block">
            <label class="px-label" for="sona-species">Species</label>
            <input class="px-input" id="sona-species" type="text" maxlength="28"
                   value="${esc(sona.species)}" data-act="sona-species">
          </section>

          <section class="ct-block">
            <div class="px-label">Fur</div>
            ${swatchRow("fur", sona.fur, furSwatches)}
          </section>

          <section class="ct-block">
            <div class="px-label">Markings</div>
            ${chipRow("marking", sona.marking, MARKINGS)}
            ${sona.marking === "none" ? "" : swatchRow("markingFur", sona.markingFur, furSwatches)}
          </section>

          <section class="ct-block">
            <div class="px-label">Eyes</div>
            ${swatchRow("eyes", sona.eyes, EYE_COLORS)}
          </section>

          <section class="ct-block">
            <div class="px-label">Accessory</div>
            ${chipRow("accessory", sona.accessory, ACCESSORIES)}
            ${sona.accessory === "none" || sona.accessory === "glasses" ? "" : swatchRow("accent", sona.accent, furSwatches)}
          </section>

          <section class="ct-block">
            <div class="px-label">Pronouns</div>
            ${chipRow("pronouns", sona.pronouns, PRONOUNS.map((p) => ({ id: p, name: p })))}
          </section>
        </div>
      </div>

      <footer class="ct-foot">
        <button class="px-btn" data-act="back-title">Back</button>
        <button class="px-btn px-btn--primary" data-act="sona-done" ${ready ? "" : "disabled"}>
          ${ready ? "This is me" : "Give them a name"}
        </button>
      </footer>
    </div>`;
}
