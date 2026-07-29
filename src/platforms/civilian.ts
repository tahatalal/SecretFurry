/* The other half of the internet: the places people use under their legal
   name. LinkedIn, Instagram, Facebook, YouTube, Maps reviews, local news, and
   a personal blog. Crossing anything from here to the fandom half is what the
   ending punishes. */

import type { Page } from "../engine/types.ts";
import { artImg, count, esc, imgbox, initialAvatar, line, page, rich } from "./kit.ts";

export function linkedinProfile(opts: {
  readonly name: string;
  readonly headline: string;
  readonly location: string;
  readonly about: string;
  readonly roles: readonly { title: string; org: string; span: string; body?: string }[];
  readonly education?: readonly { school: string; span: string; detail?: string }[];
  readonly activity?: readonly { when: string; body: string }[];
}): Page {
  return page(
    "linkedin",
    `
    <div class="li">
      <header class="li-top"><span class="li-mark">in</span><span class="li-search">Search</span></header>
      <section class="li-card li-hero">
        <div class="li-cover"></div>
        <div class="li-heroin">
          ${initialAvatar(opts.name, 88)}
          <div>
            <h1>${line(opts.name)}</h1>
            <div class="li-headline">${line(opts.headline)}</div>
            <div class="li-loc">${line(opts.location)}</div>
          </div>
        </div>
      </section>
      <section class="li-card">
        <h2>About</h2>
        <div class="li-about">${rich(opts.about)}</div>
      </section>
      <section class="li-card">
        <h2>Experience</h2>
        ${opts.roles
          .map(
            (r) => `
          <div class="li-role">
            <div class="li-rolemark"></div>
            <div>
              <b>${line(r.title)}</b>
              <div class="li-org">${line(r.org)}</div>
              <div class="li-span">${esc(r.span)}</div>
              ${r.body ? `<div class="li-rolebody">${rich(r.body)}</div>` : ""}
            </div>
          </div>`,
          )
          .join("")}
      </section>
      ${
        opts.education?.length
          ? `<section class="li-card">
               <h2>Education</h2>
               ${opts.education
                 .map(
                   (e) =>
                     `<div class="li-role"><div class="li-rolemark"></div><div><b>${line(e.school)}</b>
                        <div class="li-span">${esc(e.span)}</div>
                        ${e.detail ? `<div class="li-rolebody">${rich(e.detail)}</div>` : ""}</div></div>`,
                 )
                 .join("")}
             </section>`
          : ""
      }
      ${
        opts.activity?.length
          ? `<section class="li-card">
               <h2>Activity</h2>
               ${opts.activity
                 .map(
                   (a) =>
                     `<div class="li-act"><div class="li-span">${esc(a.when)}</div><div>${rich(a.body)}</div></div>`,
                 )
                 .join("")}
             </section>`
          : ""
      }
    </div>`,
  );
}

export function instagramProfile(opts: {
  readonly handle: string;
  readonly name: string;
  readonly bio: string;
  readonly posts: number;
  readonly followers: number;
  readonly following: number;
  readonly grid: readonly { alt: string; caption?: string; likes?: number; art?: string }[];
}): Page {
  return page(
    "instagram",
    `
    <div class="ig">
      <header class="ig-top"><b>Instagram</b></header>
      <section class="ig-head">
        ${initialAvatar(opts.name, 96)}
        <div class="ig-headmeta">
          <div class="ig-handle">${esc(opts.handle)}</div>
          <div class="ig-stats">
            <span><b>${opts.posts}</b> posts</span>
            <span><b>${count(opts.followers)}</b> followers</span>
            <span><b>${opts.following}</b> following</span>
          </div>
          <div class="ig-name">${line(opts.name)}</div>
          <div class="ig-bio">${rich(opts.bio)}</div>
        </div>
      </section>
      <div class="ig-grid">
        ${opts.grid
          .map(
            (g) => `
          <figure class="ig-cell">
            ${imgbox(g.alt, { art: g.art })}
            ${g.caption ? `<figcaption>${rich(g.caption)}</figcaption>` : ""}
          </figure>`,
          )
          .join("")}
      </div>
    </div>`,
  );
}

export function facebookPost(opts: {
  readonly group?: string;
  readonly author: string;
  readonly when: string;
  readonly body: string;
  readonly image?: { alt: string; art?: string };
  readonly reactions: number;
  readonly comments: readonly { by: string; text: string; when: string }[];
}): Page {
  return page(
    "facebook",
    `
    <div class="fb">
      <header class="fb-top"><span class="fb-mark">f</span><span class="fb-search">Search Facebook</span></header>
      ${opts.group ? `<div class="fb-group">${line(opts.group)}</div>` : ""}
      <article class="fb-post">
        <div class="fb-by">
          ${initialAvatar(opts.author, 40)}
          <div><b>${line(opts.author)}</b><div class="fb-when">${esc(opts.when)}</div></div>
        </div>
        <div class="fb-body">${rich(opts.body)}</div>
        ${opts.image ? imgbox(opts.image.alt, { art: opts.image.art, big: true }) : ""}
        <div class="fb-stats">&#128077; ${opts.reactions} &middot; ${opts.comments.length} comments</div>
        <div class="fb-comments">
          ${opts.comments
            .map(
              (c) => `
            <div class="fb-comment">
              ${initialAvatar(c.by, 28)}
              <div class="fb-cbubble"><b>${line(c.by)}</b> ${rich(c.text)}
                <div class="fb-when">${esc(c.when)}</div></div>
            </div>`,
            )
            .join("")}
        </div>
      </article>
    </div>`,
  );
}

export function youtubeVideo(opts: {
  readonly title: string;
  readonly channel: string;
  readonly subs: string;
  readonly views: string;
  readonly when: string;
  readonly frameAlt: string;
  readonly frameArt?: string;
  readonly description: string;
  readonly comments: readonly { by: string; when: string; text: string; likes?: number }[];
}): Page {
  return page(
    "youtube",
    `
    <div class="yt">
      <header class="yt-top"><span class="yt-mark">&#9654;</span><b>YouTube</b><span class="yt-search">Search</span></header>
      <div class="yt-player">${imgbox(opts.frameAlt, { art: opts.frameArt, big: true })}</div>
      <h1 class="yt-title">${line(opts.title)}</h1>
      <div class="yt-meta">${esc(opts.views)} views &middot; ${esc(opts.when)}</div>
      <div class="yt-channel">
        ${initialAvatar(opts.channel, 40)}
        <div><b>${line(opts.channel)}</b><div class="yt-subs">${esc(opts.subs)} subscribers</div></div>
        <button class="yt-sub" type="button" disabled>Subscribe</button>
      </div>
      <div class="yt-desc">${rich(opts.description)}</div>
      <section class="yt-comments">
        <h2>${opts.comments.length} Comments</h2>
        ${opts.comments
          .map(
            (c) => `
          <div class="yt-comment">
            ${initialAvatar(c.by, 32)}
            <div>
              <div class="yt-cmeta"><b>${line(c.by)}</b> <span>${esc(c.when)}</span></div>
              <div>${rich(c.text)}</div>
              <div class="yt-clikes">&#128077; ${c.likes ?? 0}</div>
            </div>
          </div>`,
          )
          .join("")}
      </section>
    </div>`,
  );
}

export function mapsPlace(opts: {
  readonly place: string;
  readonly category: string;
  readonly address: string;
  readonly rating: number;
  readonly reviewCount: number;
  readonly reviews: readonly {
    by: string;
    stars: number;
    when: string;
    text: string;
    local?: string;
  }[];
}): Page {
  return page(
    "maps",
    `
    <div class="mp">
      <header class="mp-top"><span class="mp-pin"></span><b>Google Maps</b></header>
      <section class="mp-place">
        <h1>${line(opts.place)}</h1>
        <div class="mp-cat">${esc(opts.category)}</div>
        <div class="mp-rating"><b>${opts.rating.toFixed(1)}</b>
          ${"&#9733;".repeat(Math.round(opts.rating))} <span>(${opts.reviewCount})</span></div>
        <div class="mp-addr">${line(opts.address)}</div>
      </section>
      <div class="mp-canvas">${artImg("map_pin") || "Map"}</div>
      <section class="mp-reviews">
        ${opts.reviews
          .map(
            (r) => `
          <div class="mp-review">
            <div class="mp-rby">
              ${initialAvatar(r.by, 32)}
              <div><b>${line(r.by)}</b>${r.local ? `<div class="mp-local">${esc(r.local)}</div>` : ""}</div>
            </div>
            <div class="mp-rstars">${"&#9733;".repeat(r.stars)}${"&#9734;".repeat(5 - r.stars)} <span>${esc(r.when)}</span></div>
            <div class="mp-rtext">${rich(r.text)}</div>
          </div>`,
          )
          .join("")}
      </section>
    </div>`,
  );
}

export function newsArticle(opts: {
  readonly outlet: string;
  readonly section: string;
  readonly headline: string;
  readonly standfirst: string;
  readonly byline: string;
  readonly dateline: string;
  readonly photo?: { alt: string; caption: string; art?: string };
  readonly body: string;
}): Page {
  return page(
    "news",
    `
    <div class="nw">
      <header class="nw-top">
        <b>${esc(opts.outlet)}</b>
        <nav>News &middot; Sports &middot; Life &middot; Obituaries &middot; Classifieds</nav>
      </header>
      <article class="nw-article">
        <div class="nw-section">${esc(opts.section)}</div>
        <h1>${line(opts.headline)}</h1>
        <p class="nw-stand">${rich(opts.standfirst)}</p>
        <div class="nw-byline">${line(opts.byline)} &middot; ${esc(opts.dateline)}</div>
        ${
          opts.photo
            ? `<figure class="nw-photo">
                 ${imgbox(opts.photo.alt, { art: opts.photo.art, big: true })}
                 <figcaption>${rich(opts.photo.caption)}</figcaption>
               </figure>`
            : ""
        }
        <div class="nw-body">${rich(opts.body)}</div>
      </article>
    </div>`,
  );
}

export function blogPost(opts: {
  readonly blog: string;
  readonly tagline: string;
  readonly title: string;
  readonly when: string;
  readonly body: string;
  readonly tags?: readonly string[];
  readonly comments?: readonly { by: string; when: string; text: string }[];
}): Page {
  return page(
    "blog",
    `
    <div class="bl">
      <header class="bl-top">
        <b>${line(opts.blog)}</b>
        <div class="bl-tagline">${line(opts.tagline)}</div>
      </header>
      <article class="bl-post">
        <h1>${line(opts.title)}</h1>
        <div class="bl-when">${esc(opts.when)}</div>
        <div class="bl-body">${rich(opts.body)}</div>
        ${
          opts.tags?.length
            ? `<div class="bl-tags">${opts.tags.map((t) => `<span>#${esc(t)}</span>`).join("")}</div>`
            : ""
        }
      </article>
      ${
        opts.comments?.length
          ? `<section class="bl-comments">
               <h2>${opts.comments.length} responses</h2>
               ${opts.comments
                 .map(
                   (c) =>
                     `<div class="bl-comment"><b>${line(c.by)}</b> <span>${esc(c.when)}</span><div>${rich(c.text)}</div></div>`,
                 )
                 .join("")}
             </section>`
          : ""
      }
    </div>`,
  );
}
