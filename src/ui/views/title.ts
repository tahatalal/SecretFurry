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

  return `
    <div class="title">
      <div class="title__card">
        <div class="title__art">
          ${spriteImg(hero, { scale: 6, alt: "" })}
        </div>
        <h1 class="title__name">SECRET<br>FURRY</h1>
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
