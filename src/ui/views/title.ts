import { spriteImg } from "../../art/pixel.ts";
import { HEAD_CANID } from "../../art/sprites/heads.ts";
import { recolor } from "../../art/pixel.ts";
import { furColor } from "../../art/palettes.ts";

export function titleView(canContinue: boolean): string {
  const fur = furColor("ember");
  const hero = recolor(HEAD_CANID, {
    B: fur.base,
    S: fur.shade,
    L: fur.light,
    M: fur.light,
    E: "#ffc93f",
  });

  // Vale's tell: a wolf's head in four strokes. It draws itself in on load —
  // the first thing the game shows you is the thing you'll spend it chasing.
  const glyph = `
    <svg class="title__glyph" viewBox="0 0 34 26" width="68" height="52" aria-hidden="true"
         fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="square">
      <path pathLength="120" style="--s:0" d="M4 20 L4 5 L11 11"/>
      <path pathLength="120" style="--s:1" d="M23 11 L30 5 L30 20"/>
      <path pathLength="120" style="--s:2" d="M4 20 L17 24 L30 20"/>
      <path pathLength="120" style="--s:3" d="M13 15 L17 18 L21 15"/>
    </svg>`;

  return `
    <div class="title">
      <div class="title__card">
        <div class="title__art">
          ${spriteImg(hero, { scale: 6, alt: "" })}
        </div>
        <h1 class="title__name">SECRET<br>FURRY</h1>
        ${glyph}
        <p class="title__tag">You met them once. You never got their handle.</p>
        <div class="title__actions">
          ${
            canContinue
              ? `<button class="px-btn px-btn--go" data-act="continue">Continue</button>`
              : ""
          }
          <button class="px-btn px-btn--primary" data-act="start">
            ${canContinue ? "New search" : "Start"}
          </button>
          <button class="px-btn" data-act="about">About</button>
        </div>
        <p class="title__legal">
          Every person, post, account and message in this game is fictional.
          Real platforms are depicted for recognition only; all artwork is
          original pixel art made for this game.
        </p>
      </div>
    </div>`;
}

export function aboutView(): string {
  return `
    <div class="sheet" data-act="close-sheet">
      <div class="sheet__card" data-stop>
        <h2 class="sheet__title">About</h2>
        <div class="prose">
          <p>
            You are a furry. Last winter, at a convention, you spent an entire
            afternoon in the headless lounge talking to someone. You traded
            fursona names. You meant to trade handles. You didn't.
          </p>
          <p>
            Since then they have been deleting things. Not all at once — an
            account here, a gallery there, the way someone does when they got
            scared of being found.
          </p>
          <p>
            You are going to find them anyway. The game is about how you do it.
            Every fact you file is tagged with where it came from, and the
            ending depends on that far more than on being right.
          </p>
          <p>
            <b>How to play.</b> Search. Read. Highlighted text is a fact you can
            keep — click it, then click the person it belongs to. Or drag it.
            Two facts can't share a slot, so when sources disagree you have to
            pick one, and one of them is lying.
          </p>
        </div>
        <div class="sheet__actions">
          <button class="px-btn px-btn--primary" data-act="close-sheet">Back</button>
        </div>
      </div>
    </div>`;
}
