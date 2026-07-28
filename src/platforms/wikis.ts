/* Wikipedia and Fandom. Both are reference pages; Wikipedia is austere and
   Fandom is loud, and the difference is half the recognition. */

import type { Page } from "../engine/types.ts";
import { esc, line, page, rich } from "./kit.ts";

export interface WikiSection {
  readonly heading: string;
  readonly body?: string;
  /** Renders as a bullet list, either instead of or after the prose. */
  readonly bullets?: readonly string[];
}

export interface InfoboxRow {
  readonly key: string;
  readonly value: string;
}

export function wikipediaArticle(opts: {
  readonly title: string;
  readonly lede: string;
  readonly infobox?: { title: string; rows: readonly InfoboxRow[] };
  readonly sections: readonly WikiSection[];
}): Page {
  return page(
    "wikipedia",
    `
    <div class="wp">
      <header class="wp-top">
        <span class="wp-globe">W</span>
        <div>
          <b>WIKIPEDIA</b>
          <div class="wp-sub">The Free Encyclopedia</div>
        </div>
      </header>
      <div class="wp-body">
        <h1 class="wp-title">${esc(opts.title)}</h1>
        <div class="wp-fromwp">From Wikipedia, the free encyclopedia</div>
        ${
          opts.infobox
            ? `<aside class="wp-infobox">
                 <div class="wp-infotitle">${esc(opts.infobox.title)}</div>
                 <table>${opts.infobox.rows
                   .map((r) => `<tr><th>${esc(r.key)}</th><td>${line(r.value)}</td></tr>`)
                   .join("")}</table>
               </aside>`
            : ""
        }
        <div class="wp-lede">${rich(opts.lede)}</div>
        ${opts.sections
          .map(
            (s, i) => `
          <section class="wp-section">
            <h2>${esc(s.heading)}<span class="wp-edit">[ edit ]</span></h2>
            ${s.body ? `<div>${rich(s.body)}</div>` : ""}
            ${
              s.bullets
                ? `<ul>${s.bullets.map((b) => `<li>${rich(b)}</li>`).join("")}</ul>`
                : ""
            }
            ${i === opts.sections.length - 1 ? "" : ""}
          </section>`,
          )
          .join("")}
      </div>
    </div>`,
  );
}

export function fandomArticle(opts: {
  readonly wiki: string;
  readonly title: string;
  readonly lede: string;
  readonly infobox?: { title: string; rows: readonly InfoboxRow[] };
  readonly sections: readonly WikiSection[];
}): Page {
  return page(
    "fandom",
    `
    <div class="fd">
      <header class="fd-top">
        <span class="fd-mark">F</span>
        <b>${esc(opts.wiki)}</b>
        <span class="fd-nav">Explore &middot; Wiki Content &middot; Community</span>
      </header>
      <div class="fd-banner">ADVERTISEMENT</div>
      <div class="fd-body">
        <h1 class="fd-title">${esc(opts.title)}</h1>
        ${
          opts.infobox
            ? `<aside class="fd-infobox">
                 <div class="fd-infotitle">${esc(opts.infobox.title)}</div>
                 ${opts.infobox.rows
                   .map(
                     (r) =>
                       `<div class="fd-inforow"><span>${esc(r.key)}</span><span>${line(r.value)}</span></div>`,
                   )
                   .join("")}
               </aside>`
            : ""
        }
        <div class="fd-lede">${rich(opts.lede)}</div>
        ${opts.sections
          .map(
            (s) => `
          <section class="fd-section">
            <h2>${esc(s.heading)}</h2>
            ${s.body ? `<div>${rich(s.body)}</div>` : ""}
            ${s.bullets ? `<ul>${s.bullets.map((b) => `<li>${rich(b)}</li>`).join("")}</ul>` : ""}
          </section>`,
          )
          .join("")}
      </div>
    </div>`,
  );
}

/** An archived snapshot of a page that no longer exists. Always "private". */
export function wayback(opts: {
  readonly original: string;
  readonly captured: string;
  readonly snapshots: number;
  readonly inner: string;
}): Page {
  return page(
    "wayback",
    `
    <div class="wb">
      <header class="wb-bar">
        <span class="wb-mark">INTERNET ARCHIVE</span>
        <span class="wb-way">WaybackMachine</span>
        <span class="wb-url">${esc(opts.original)}</span>
      </header>
      <div class="wb-strip">
        <b>${opts.snapshots}</b> captures &middot; saved ${esc(opts.captured)}
        <span class="wb-warn">This page is no longer live.</span>
      </div>
      <div class="wb-frame">${opts.inner}</div>
    </div>`,
  );
}
