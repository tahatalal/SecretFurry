import type { Fursona } from "../art/fursona.ts";
import type { Page } from "../engine/types.ts";
import { avatar, esc, line, page, rich } from "./kit.ts";

export interface FaComment {
  readonly author: Fursona;
  readonly handle: string;
  readonly time: string;
  readonly text: string;
  readonly depth?: 0 | 1;
}

export interface FaSubmission {
  readonly title: string;
  readonly alt: string;
  readonly tags: readonly string[];
  readonly posted: string;
  readonly views: number;
  readonly favs: number;
  readonly description: string;
}

export interface FaJournal {
  readonly title: string;
  readonly posted: string;
  readonly body: string;
}

export interface FaUserPage {
  readonly sona: Fursona;
  readonly handle: string;
  readonly status: string;
  readonly registered: string;
  readonly profile: string;
  readonly stats: { views: number; submissions: number; favs: number; watchers: number };
  readonly journals?: readonly FaJournal[];
  readonly gallery?: readonly { title: string; alt: string }[];
  readonly shouts?: readonly FaComment[];
}

function faChrome(inner: string): string {
  return `
    <div class="fa">
      <header class="fa-top">
        <span class="fa-wordmark">Fur Affinity</span>
        <nav class="fa-nav"><span>Browse</span><span>Search</span><span>Forums</span><span>Upload</span></nav>
        <span class="fa-user">Logged in</span>
      </header>
      <div class="fa-body">${inner}</div>
      <footer class="fa-foot">Fur Affinity | For all things fluff, scaled, and feathered.</footer>
    </div>`;
}

function commentRow(c: FaComment): string {
  return `
    <div class="fa-comment${c.depth ? " fa-comment--in" : ""}">
      ${avatar(c.author, 44, "fa-pfp")}
      <div>
        <div class="fa-cmeta"><b>${esc(c.handle)}</b> <span>${esc(c.time)}</span></div>
        <div class="fa-ctext">${rich(c.text)}</div>
      </div>
    </div>`;
}

export function faUser(user: FaUserPage): Page {
  return page(
    "furaffinity",
    faChrome(`
      <section class="fa-userhead">
        ${avatar(user.sona, 100, "fa-bigpfp")}
        <div>
          <h1>${esc(user.handle)}</h1>
          <div class="fa-status">${line(user.status)}</div>
          <div class="fa-reg">Registered: ${esc(user.registered)}</div>
        </div>
        <dl class="fa-stats">
          <div><dt>Views</dt><dd>${user.stats.views}</dd></div>
          <div><dt>Submissions</dt><dd>${user.stats.submissions}</dd></div>
          <div><dt>Favs</dt><dd>${user.stats.favs}</dd></div>
          <div><dt>Watchers</dt><dd>${user.stats.watchers}</dd></div>
        </dl>
      </section>

      <section class="fa-panel">
        <h2>Artist Profile</h2>
        <div class="fa-profile">${rich(user.profile)}</div>
      </section>

      ${
        user.gallery?.length
          ? `<section class="fa-panel">
               <h2>Recent Submissions</h2>
               <div class="fa-gallery">
                 ${user.gallery
                   .map(
                     (g) =>
                       `<figure class="fa-thumb"><div class="pf-imgbox">${line(g.alt)}</div><figcaption>${line(g.title)}</figcaption></figure>`,
                   )
                   .join("")}
               </div>
             </section>`
          : ""
      }

      ${
        user.journals?.length
          ? `<section class="fa-panel">
               <h2>Journals</h2>
               ${user.journals
                 .map(
                   (j) =>
                     `<article class="fa-journal">
                        <h3>${line(j.title)}</h3>
                        <div class="fa-jdate">${esc(j.posted)}</div>
                        <div class="fa-jbody">${rich(j.body)}</div>
                      </article>`,
                 )
                 .join("")}
             </section>`
          : ""
      }

      ${
        user.shouts?.length
          ? `<section class="fa-panel">
               <h2>Shouts</h2>
               ${user.shouts.map(commentRow).join("")}
             </section>`
          : ""
      }
    `),
  );
}

export function faSubmission(opts: {
  readonly sub: FaSubmission;
  readonly artist: Fursona;
  readonly handle: string;
  readonly comments?: readonly FaComment[];
}): Page {
  const { sub } = opts;
  return page(
    "furaffinity",
    faChrome(`
      <section class="fa-submission">
        <div class="pf-imgbox pf-imgbox--big">${line(sub.alt)}</div>
        <header class="fa-subhead">
          <h1>${line(sub.title)}</h1>
          <div class="fa-subby">by ${avatar(opts.artist, 28, "fa-inlinepfp")} <b>${esc(opts.handle)}</b></div>
          <div class="fa-subdate">Posted ${esc(sub.posted)} &middot; ${sub.views} views &middot; ${sub.favs} favs</div>
        </header>
        <div class="fa-desc">${rich(sub.description)}</div>
        <div class="fa-tags">${sub.tags.map((t) => `<span>${esc(t)}</span>`).join("")}</div>
      </section>
      ${
        opts.comments?.length
          ? `<section class="fa-panel"><h2>Comments</h2>${opts.comments.map(commentRow).join("")}</section>`
          : ""
      }
    `),
  );
}

export function faJournalPage(opts: {
  readonly journal: FaJournal;
  readonly author: Fursona;
  readonly handle: string;
  readonly comments?: readonly FaComment[];
}): Page {
  return page(
    "furaffinity",
    faChrome(`
      <article class="fa-journal fa-journal--solo">
        <h1>${line(opts.journal.title)}</h1>
        <div class="fa-subby">by ${avatar(opts.author, 28, "fa-inlinepfp")} <b>${esc(opts.handle)}</b>
          <span class="fa-jdate">${esc(opts.journal.posted)}</span></div>
        <div class="fa-jbody">${rich(opts.journal.body)}</div>
      </article>
      ${
        opts.comments?.length
          ? `<section class="fa-panel"><h2>Comments</h2>${opts.comments.map(commentRow).join("")}</section>`
          : ""
      }
    `),
  );
}
