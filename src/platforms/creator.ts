/* The places furries put their characters and take their money: Toyhouse,
   Ko-fi, Etsy, VRChat. */

import type { Fursona } from "../art/fursona.ts";
import type { Page } from "../engine/types.ts";
import { avatar, esc, line, page, rich } from "./kit.ts";

export function toyhouseCharacter(opts: {
  readonly sona: Fursona;
  readonly owner: string;
  readonly created: string;
  readonly designer: string;
  readonly tags: readonly string[];
  readonly profile: string;
  readonly refAlt: string;
  readonly log?: readonly { when: string; what: string }[];
}): Page {
  return page(
    "toyhouse",
    `
    <div class="th">
      <header class="th-top"><b>Toyhouse</b><span>Browse &middot; Characters &middot; Forums</span></header>
      <div class="th-body">
        <div class="th-main">
          <h1>${esc(opts.sona.name)}</h1>
          <div class="pf-imgbox pf-imgbox--big">${line(opts.refAlt)}</div>
          <div class="th-profile">${rich(opts.profile)}</div>
        </div>
        <aside class="th-side">
          ${avatar(opts.sona, 96, "th-pfp")}
          <dl class="th-facts">
            <div><dt>Owner</dt><dd>${line(opts.owner)}</dd></div>
            <div><dt>Created</dt><dd>${esc(opts.created)}</dd></div>
            <div><dt>Designer</dt><dd>${line(opts.designer)}</dd></div>
          </dl>
          <div class="th-tags">${opts.tags.map((t) => `<span>${esc(t)}</span>`).join("")}</div>
          ${
            opts.log?.length
              ? `<div class="th-log">
                   <div class="th-logtitle">Ownership log</div>
                   ${opts.log.map((l) => `<div><b>${esc(l.when)}</b> ${line(l.what)}</div>`).join("")}
                 </div>`
              : ""
          }
        </aside>
      </div>
    </div>`,
  );
}

export function kofiPage(opts: {
  readonly sona?: Fursona;
  readonly handle: string;
  readonly title: string;
  readonly about: string;
  readonly goal?: { label: string; percent: number };
  readonly posts: readonly { title: string; when: string; body: string; locked?: boolean }[];
}): Page {
  return page(
    "kofi",
    `
    <div class="kf">
      <header class="kf-top"><span class="kf-cup">&#9749;</span><b>Ko-fi</b></header>
      <div class="kf-hero">
        ${opts.sona ? avatar(opts.sona, 72, "kf-pfp") : ""}
        <div>
          <h1>${esc(opts.title)}</h1>
          <div class="kf-handle">ko-fi.com/${esc(opts.handle)}</div>
        </div>
        <button class="kf-btn" type="button" disabled>Support</button>
      </div>
      <div class="kf-about">${rich(opts.about)}</div>
      ${
        opts.goal
          ? `<div class="kf-goal">
               <div class="kf-goallabel">${line(opts.goal.label)}</div>
               <div class="kf-bar"><span style="width:${opts.goal.percent}%"></span></div>
             </div>`
          : ""
      }
      <div class="kf-posts">
        ${opts.posts
          .map(
            (p) => `
          <article class="kf-post${p.locked ? " is-locked" : ""}">
            <h2>${line(p.title)}</h2>
            <div class="kf-when">${esc(p.when)}</div>
            <div>${p.locked ? `<span class="kf-lock">&#128274; Supporters only</span> ` : ""}${rich(p.body)}</div>
          </article>`,
          )
          .join("")}
      </div>
    </div>`,
  );
}

export function etsyShop(opts: {
  readonly shop: string;
  readonly tagline: string;
  readonly location: string;
  readonly sales: number;
  readonly since: string;
  readonly announcement: string;
  readonly items: readonly { title: string; price: string; alt: string }[];
  readonly reviews: readonly { by: string; stars: number; when: string; text: string }[];
}): Page {
  return page(
    "etsy",
    `
    <div class="et">
      <header class="et-top"><b>Etsy</b><span class="et-search">Search for anything</span></header>
      <section class="et-shop">
        <h1>${esc(opts.shop)}</h1>
        <div class="et-tag">${line(opts.tagline)}</div>
        <div class="et-meta">
          <span>${line(opts.location)}</span>
          <span>&middot; ${opts.sales} sales</span>
          <span>&middot; On Etsy since ${esc(opts.since)}</span>
        </div>
      </section>
      <div class="et-announce"><b>Announcement</b> ${rich(opts.announcement)}</div>
      <div class="et-grid">
        ${opts.items
          .map(
            (i) => `
          <figure class="et-item">
            <div class="pf-imgbox">${line(i.alt)}</div>
            <figcaption><span>${line(i.title)}</span><b>${esc(i.price)}</b></figcaption>
          </figure>`,
          )
          .join("")}
      </div>
      <section class="et-reviews">
        <h2>Reviews</h2>
        ${opts.reviews
          .map(
            (r) => `
          <div class="et-review">
            <div class="et-stars">${"&#9733;".repeat(r.stars)}${"&#9734;".repeat(5 - r.stars)}
              <b>${esc(r.by)}</b> <span>${esc(r.when)}</span></div>
            <div>${rich(r.text)}</div>
          </div>`,
          )
          .join("")}
      </section>
    </div>`,
  );
}

export function vrchatProfile(opts: {
  readonly sona: Fursona;
  readonly display: string;
  readonly status: string;
  readonly bio: string;
  readonly worlds: readonly { name: string; visits: string }[];
  readonly note?: string;
}): Page {
  return page(
    "vrchat",
    `
    <div class="vr">
      <header class="vr-top"><b>VRChat</b><span>Home &middot; Worlds &middot; Avatars &middot; Social</span></header>
      <section class="vr-card">
        ${avatar(opts.sona, 88, "vr-pfp")}
        <div>
          <h1>${esc(opts.display)}</h1>
          <div class="vr-status"><span class="vr-dot"></span>${line(opts.status)}</div>
          <p class="vr-bio">${rich(opts.bio)}</p>
        </div>
      </section>
      <section class="vr-worlds">
        <h2>Favorite worlds</h2>
        ${opts.worlds
          .map((w) => `<div class="vr-world"><b>${line(w.name)}</b><span>${esc(w.visits)}</span></div>`)
          .join("")}
      </section>
      ${opts.note ? `<div class="vr-note">${rich(opts.note)}</div>` : ""}
    </div>`,
  );
}
