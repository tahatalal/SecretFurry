import type { Fursona } from "../art/fursona.ts";
import type { Page } from "../engine/types.ts";
import { avatar, count, esc, line, page, rich } from "./kit.ts";

export interface BskyPost {
  readonly author: Fursona;
  readonly handle: string;
  readonly time: string;
  readonly text: string;
  readonly replies?: number;
  readonly reposts?: number;
  readonly likes?: number;
  /** Renders as an image card with a caption instead of a real image. */
  readonly image?: { alt: string; caption?: string };
  readonly replyTo?: string;
  /** A quoted post shown inset. */
  readonly quote?: { handle: string; name: string; text: string };
}

export interface BskyProfile {
  readonly sona: Fursona;
  readonly handle: string;
  readonly bio: string;
  readonly followers: number;
  readonly following: number;
  readonly joined: string;
  readonly pinned?: string;
  readonly posts: readonly BskyPost[];
}

function postRow(post: BskyPost): string {
  return `
    <article class="bsky-post">
      ${avatar(post.author, 42, "bsky-pfp")}
      <div class="bsky-body">
        <div class="bsky-meta">
          <span class="bsky-name">${esc(post.author.name)}</span>
          <span class="bsky-handle">@${esc(post.handle)}</span>
          <span class="bsky-dot">&middot;</span>
          <span class="bsky-time">${esc(post.time)}</span>
        </div>
        ${post.replyTo ? `<div class="bsky-replyto">Reply to @${esc(post.replyTo)}</div>` : ""}
        <div class="bsky-text">${rich(post.text)}</div>
        ${
          post.quote
            ? `<div class="bsky-quote">
                 <div class="bsky-meta">
                   <span class="bsky-name">${esc(post.quote.name)}</span>
                   <span class="bsky-handle">@${esc(post.quote.handle)}</span>
                 </div>
                 <div class="bsky-text">${rich(post.quote.text)}</div>
               </div>`
            : ""
        }
        ${
          post.image
            ? `<figure class="bsky-image">
                 <div class="pf-imgbox">${line(post.image.alt)}</div>
                 ${post.image.caption ? `<figcaption>${rich(post.image.caption)}</figcaption>` : ""}
               </figure>`
            : ""
        }
        <div class="bsky-actions">
          <span>&#128172; ${count(post.replies ?? 0)}</span>
          <span>&#8635; ${count(post.reposts ?? 0)}</span>
          <span>&#9825; ${count(post.likes ?? 0)}</span>
        </div>
      </div>
    </article>`;
}

export function bskyProfile(profile: BskyProfile): Page {
  return page(
    "bluesky",
    `
    <div class="bsky">
      <div class="bsky-banner"></div>
      <header class="bsky-head">
        ${avatar(profile.sona, 80, "bsky-bigpfp")}
        <div class="bsky-headmeta">
          <h1>${esc(profile.sona.name)}</h1>
          <div class="bsky-handle">@${esc(profile.handle)}</div>
          <div class="bsky-stats">
            <b>${count(profile.followers)}</b> followers
            <b>${count(profile.following)}</b> following
          </div>
          <p class="bsky-bio">${rich(profile.bio)}</p>
          <div class="bsky-joined">Joined ${esc(profile.joined)}</div>
        </div>
        <button class="bsky-follow" type="button" disabled>Follow</button>
      </header>
      ${
        profile.pinned
          ? `<div class="bsky-pinned">&#128204; Pinned &mdash; ${rich(profile.pinned)}</div>`
          : ""
      }
      <nav class="bsky-tabs"><span class="is-on">Posts</span><span>Replies</span><span>Media</span><span>Likes</span></nav>
      <div class="bsky-feed">${profile.posts.map(postRow).join("")}</div>
    </div>`,
  );
}

export function bskyThread(opts: {
  readonly root: BskyPost;
  readonly replies: readonly BskyPost[];
}): Page {
  return page(
    "bluesky",
    `
    <div class="bsky">
      <div class="bsky-feed bsky-feed--thread">
        ${postRow(opts.root)}
        <div class="bsky-replies">${opts.replies.map(postRow).join("")}</div>
      </div>
    </div>`,
  );
}
