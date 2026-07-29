import type { Page } from "../engine/types.ts";
import { count, esc, imgbox, initialAvatar, page, rich } from "./kit.ts";

export interface RedditComment {
  readonly user: string;
  readonly score: number;
  readonly time: string;
  readonly body: string;
  readonly op?: boolean;
  readonly replies?: readonly RedditComment[];
}

export interface RedditThread {
  readonly sub: string;
  readonly title: string;
  readonly user: string;
  readonly time: string;
  readonly score: number;
  readonly body?: string;
  readonly image?: { alt: string; art?: string };
  readonly flair?: string;
  readonly comments: readonly RedditComment[];
}

function commentTree(comment: RedditComment, depth = 0): string {
  return `
    <div class="rd-comment" style="--depth:${depth}">
      <div class="rd-cmeta">
        ${initialAvatar(comment.user, 20)}
        <b>${esc(comment.user)}</b>
        ${comment.op ? `<span class="rd-op">OP</span>` : ""}
        <span>&middot; ${esc(String(comment.score))} points &middot; ${esc(comment.time)}</span>
      </div>
      <div class="rd-cbody">${rich(comment.body)}</div>
      <div class="rd-cactions"><span>Reply</span><span>Share</span><span>Report</span></div>
      ${(comment.replies ?? []).map((r) => commentTree(r, depth + 1)).join("")}
    </div>`;
}

export function redditThread(thread: RedditThread): Page {
  return page(
    "reddit",
    `
    <div class="rd">
      <header class="rd-top">
        <span class="rd-wordmark">reddit</span>
        <div class="rd-searchbar">Search Reddit</div>
      </header>
      <div class="rd-sub">
        <span class="rd-subicon">${esc(thread.sub.replace(/^r\//, "").charAt(0).toLowerCase())}</span>
        <b>${esc(thread.sub)}</b>
        <button type="button" class="rd-join" disabled>Join</button>
      </div>
      <article class="rd-post">
        <aside class="rd-votes">
          <span class="rd-up">&#9650;</span>
          <b>${count(thread.score)}</b>
          <span class="rd-down">&#9660;</span>
        </aside>
        <div class="rd-content">
          <div class="rd-byline">
            Posted by u/${esc(thread.user)} &middot; ${esc(thread.time)}
          </div>
          <h1>${rich(thread.title)}${thread.flair ? `<span class="rd-flair">${esc(thread.flair)}</span>` : ""}</h1>
          ${thread.body ? `<div class="rd-body">${rich(thread.body)}</div>` : ""}
          ${thread.image ? imgbox(thread.image.alt, { art: thread.image.art, big: true }) : ""}
          <div class="rd-actions">
            <span>&#128172; ${thread.comments.length} comments</span>
            <span>&#8631; Share</span><span>&#9733; Save</span><span>&#8943;</span>
          </div>
        </div>
      </article>
      <section class="rd-comments">
        <div class="rd-sortbar">Sort by: <b>Top</b></div>
        ${thread.comments.map((c) => commentTree(c)).join("")}
      </section>
    </div>`,
  );
}
