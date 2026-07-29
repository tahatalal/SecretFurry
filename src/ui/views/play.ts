import { fursonaUrl } from "../../art/fursona.ts";
import { spriteImg } from "../../art/pixel.ts";
import { LOGOS, PLATFORM_META } from "../../art/sprites/logos.ts";
import { esc as escRaw, typo } from "../../platforms/kit.ts";

/** Every string the shell renders goes through the same typographic pass. */
const esc = (value: string): string => escRaw(typo(value));
import {
  chapterOf,
  connections,
  dossier,
  dropTargets,
  isGone,
  isOverturned,
  keyProgress,
  linksFor,
  livePeople,
  liveSources,
  matchesQuery,
  search,
  type GameState,
} from "../../engine/state.ts";
import {
  PHYSICAL_SLOTS,
  SLOT_LABEL,
  SLOT_ORDER,
  type CaseFile,
  type SourceDoc,
} from "../../engine/types.ts";

export interface PlayCtx {
  readonly state: GameState;
  readonly kase: CaseFile;
  readonly heldClue: string | null;
  /** A search is "in flight" — show the wait beat instead of instant results. */
  readonly searching: boolean;
  /** Things that appeared since the last frame. Only these animate. */
  readonly fresh: {
    readonly people: ReadonlySet<string>;
    readonly clues: ReadonlySet<string>;
  };
}

/* --- top bar -------------------------------------------------------------- */

function topbar(ctx: PlayCtx): string {
  const chapter = chapterOf(ctx.state, ctx.kase);
  return `
    <header class="topbar">
      <span class="topbar__logo">${spriteImg(LOGOS.search, { scale: 1.5 })} SECRET FURRY</span>
      <span class="topbar__chapter"><b>CH ${chapter.id}</b> ${esc(chapter.name)}</span>
      <span class="topbar__goal px-grow">${esc(chapter.goal)}</span>
      <button class="px-btn px-btn--sm" data-act="notebook">Notebook</button>
      <button class="px-btn px-btn--sm px-btn--icon" data-act="mute"
              title="${ctx.state.muted ? "Unmute" : "Mute"}">${ctx.state.muted ? "&#128263;" : "&#128266;"}</button>
      <button class="px-btn px-btn--sm px-btn--icon" data-act="quit" title="Quit to title">&#10005;</button>
    </header>`;
}

/* --- browser -------------------------------------------------------------- */

function tabStrip(ctx: PlayCtx): string {
  const { state, kase } = ctx;
  const tabs = state.tabs
    .map((tab) => {
      const doc = tab.sourceId ? kase.sources.find((s) => s.id === tab.sourceId) : undefined;
      const label = tab.kind === "search" ? `“${tab.query ?? ""}”` : (doc?.title ?? "Page");
      const logo = tab.kind === "search" ? LOGOS.search : LOGOS[doc?.platform ?? "search"];
      return `
        <div class="tab${tab.id === state.activeTab ? " is-on" : ""}" data-act="tab" data-tab="${tab.id}">
          ${spriteImg(logo, { scale: 1 })}
          <span class="tab__label">${esc(label)}</span>
          <button class="tab__close" data-act="tab-close" data-tab="${tab.id}"
                  aria-label="Close tab">&#10005;</button>
        </div>`;
    })
    .join("");

  return `<div class="browser__tabs">${tabs}
    <button class="tab" data-act="new-search" title="New search">+</button>
  </div>`;
}

function addressBar(ctx: PlayCtx): string {
  const tab = ctx.state.tabs.find((t) => t.id === ctx.state.activeTab);
  const doc = tab?.sourceId
    ? ctx.kase.sources.find((s) => s.id === tab.sourceId)
    : undefined;
  const url =
    doc?.url ??
    (tab?.kind === "search"
      ? `google.com/search?q=${encodeURIComponent(tab.query ?? "")}`
      : "");
  const lastSearch = [...ctx.state.tabs].reverse().find((t) => t.kind === "search" && t.query);

  return `
    <div class="browser__bar">
      ${
        tab?.kind === "source" && lastSearch
          ? `<button class="px-btn px-btn--sm px-btn--icon" data-act="tab" data-tab="${lastSearch.id}"
                     title="Back to results">&#8592;</button>`
          : ""
      }
      <span class="browser__url">${url ? `&#128274; ${esc(url)}` : "no page open"}</span>
      <button class="px-btn px-btn--sm px-btn--cool" data-act="new-search">Search</button>
    </div>`;
}

function searchPage(ctx: PlayCtx, query: string): string {
  const hits = query ? search(ctx.state, ctx.kase, query) : [];
  const terms = ctx.state.terms;

  const results = hits
    .map((doc: SourceDoc) => {
      const meta = PLATFORM_META[doc.platform];
      // Visited links go purple, the way they do everywhere else on the web,
      // so a long results page tells you where you've already been.
      const seen = ctx.state.seen.includes(doc.id);
      return `
        <div class="srp__hit${seen ? " is-seen" : ""}" data-act="open-source" data-source="${esc(doc.id)}">
          <div class="srp__crumb">${spriteImg(LOGOS[doc.platform], { scale: 1 })} ${esc(meta.name)} &rsaquo; ${esc(doc.url)}</div>
          <h3 class="srp__title">${esc(doc.title)}</h3>
          <div class="srp__blurb">${esc(doc.blurb)}</div>
          ${seen ? `<div class="srp__seen">Visited</div>` : ""}
        </div>`;
    })
    .join("");

  // A lead is spent when everything it surfaces has been visited. It stays
  // clickable — pages change as clues are filed — but it stops shouting.
  const live = liveSources(ctx.state, ctx.kase);
  const spent = (term: string): boolean => {
    const found = live.filter((s) => matchesQuery(s, term));
    return found.length > 0 && found.every((s) => ctx.state.seen.includes(s.id));
  };

  // Newest leads first — by chapter three there are two dozen of these and the
  // one you just unlocked is almost always the one you want.
  const suggestions = terms.length
    ? `<div class="srp__terms">
         <div class="srp__termlabel">Things you know to look for &mdash; newest first</div>
         <div class="srp__termlist">
         ${[...terms]
           .reverse()
           .map(
             (t) =>
               `<button class="srp__term${spent(t) ? " is-spent" : ""}" data-act="search" data-query="${esc(t)}">${
                 spent(t) ? "&#10003; " : ""
               }${esc(t)}</button>`,
           )
           .join("")}
         </div>
       </div>`
    : "";

  const wait = `
    <div class="srp__wait" role="status" aria-live="polite">
      <span class="srp__waitdots"><i></i><i></i><i></i></span>
      Searching&hellip;
    </div>`;

  return `
    <div class="srp page">
      <form class="srp__query" data-act="search-form">
        ${spriteImg(LOGOS.search, { scale: 1.6 })}
        <input class="srp__box" name="q" type="search" autocomplete="off"
               placeholder="Search" value="${esc(query)}">
        <button class="px-btn px-btn--sm px-btn--primary" type="submit">Go</button>
      </form>
      ${suggestions}
      ${
        query
          ? ctx.searching
            ? wait
            : hits.length
              ? `<div class="srp__count">About ${hits.length * 4370 + 12} results</div>${results}`
              : `<div class="srp__none">
                   Your search &mdash; <b>${esc(query)}</b> &mdash; did not match anything you can use yet.
                   <br><br>Try one of the things you already know to look for, or read further into
                   a page you have open. New leads come from facts you file.
                 </div>`
          : `<div class="srp__none">Type something, or pick a lead above.</div>`
      }
    </div>`;
}

function browser(ctx: PlayCtx): string {
  const tab = ctx.state.tabs.find((t) => t.id === ctx.state.activeTab);
  let body: string;

  if (!tab) {
    body = `<div class="browser__empty">
      <div class="px-display" style="font-size:16px">Nothing open</div>
      <p class="prose">Start with a search. You remember more than you think you do.</p>
      <button class="px-btn px-btn--primary" data-act="new-search">Open search</button>
    </div>`;
  } else if (tab.kind === "search") {
    body = searchPage(ctx, tab.query ?? "");
  } else {
    const doc = ctx.kase.sources.find((s) => s.id === tab.sourceId);
    if (doc && isGone(ctx.state, doc)) {
      // The world reacted. The page died while you were working the case.
      const meta = PLATFORM_META[doc.platform];
      body = `
        <div class="browser__empty tombstone">
          ${spriteImg(LOGOS[doc.platform], { scale: 2 })}
          <div class="px-display" style="font-size:14px">Nothing here anymore.</div>
          <p class="prose">This ${esc(meta.name)} page has been taken down by whoever owned it.
          It was up the last time you looked.</p>
          <p class="prose tombstone__note">Anything you filed from it stays filed. You can't
          un-see a page, and neither can anyone else.</p>
        </div>`;
    } else {
      body = doc
        ? `<div class="page">${doc.body}</div>`
        : `<div class="browser__empty"><p class="prose">This page is gone.</p></div>`;
    }
  }

  return `
    <section class="browser">
      ${tabStrip(ctx)}
      ${addressBar(ctx)}
      <div class="browser__page px-scroll" id="page">${body}</div>
    </section>`;
}

/* --- dossier -------------------------------------------------------------- */

/** People the held clue could legitimately be dropped on. */
function heldTargets(ctx: PlayCtx): Set<string> {
  const clue = ctx.heldClue ? ctx.kase.clues[ctx.heldClue] : null;
  return new Set(clue ? dropTargets(ctx.kase, clue) : []);
}

function rail(ctx: PlayCtx): string {
  const people = livePeople(ctx.state, ctx.kase);
  const targets = heldTargets(ctx);

  return `<div class="rail">
    ${people
      .map((p) => {
        const filled = dossier(ctx.state, ctx.kase, p.id).size;
        const on = ctx.state.focus === p.id;
        const target = targets.has(p.id);
        const fresh = ctx.fresh.people.has(p.id) ? " is-new" : "";
        return `
          <button type="button" class="rail__card${on ? " is-on" : ""}${target ? " is-target" : ""}${fresh}"
                  data-act="person" data-person="${esc(p.id)}"
                  title="${esc(p.name)} — ${esc(p.note)}">
            <img src="${fursonaUrl(p.sona)}" width="42" height="40" alt="" draggable="false">
            <span class="rail__name">${esc(p.name)}</span>
            ${filled ? `<span class="rail__count">${filled}</span>` : ""}
          </button>`;
      })
      .join("")}
    ${newProfileSlot(ctx)}
    ${
      people.length < 2 && !ctx.heldClue
        ? `<span class="rail__hint">Everyone else is still out there somewhere.</span>`
        : ""
    }
  </div>`;
}

/**
 * A clue that introduces somebody you haven't met needs a target, or it can
 * never be filed. Holding one opens an empty slot on the rail; dropping there
 * is what puts them on the board. The card stays anonymous until you do.
 */
function newProfileSlot(ctx: PlayCtx): string {
  const clue = ctx.heldClue ? ctx.kase.clues[ctx.heldClue] : null;
  if (!clue) return "";

  const stranger = dropTargets(ctx.kase, clue).find(
    (id) => !ctx.state.known.includes(id) && ctx.kase.people[id],
  );
  if (!stranger) return "";

  return `
    <button type="button" class="rail__card rail__card--new is-target"
            data-act="person" data-person="${esc(stranger)}"
            title="Start a new profile from this">
      <span class="rail__plus">+</span>
      <span class="rail__name">New</span>
    </button>`;
}

function profile(ctx: PlayCtx): string {
  const people = livePeople(ctx.state, ctx.kase);
  const person = ctx.kase.people[ctx.state.focus ?? ""] ?? people[0];
  if (!person) return `<div class="profile"><p class="prose">No one yet.</p></div>`;

  const filed = dossier(ctx.state, ctx.kase, person.id);
  const isTarget = heldTargets(ctx).has(person.id);

  const row = (slot: (typeof SLOT_ORDER)[number]): string => {
    const clue = filed.get(slot);
    if (!clue) {
      return `<div class="slot" data-slot="${slot}">
        <span class="slot__key">${SLOT_LABEL[slot]}</span>
        <span class="slot__empty">&mdash;</span>
        <span></span>
      </div>`;
    }
    const flagged = clue.untrue && isOverturned(ctx.state, ctx.kase, clue.id);
    const fresh = ctx.fresh.clues.has(clue.id) ? " is-new" : "";
    // A clue a closed chapter was built on is part of the record — no X.
    const locked = ctx.state.committed.includes(clue.id);
    return `<div class="slot is-filled${flagged ? " is-suspect" : ""}${fresh}" data-slot="${slot}">
      <span class="slot__key">${SLOT_LABEL[slot]}</span>
      <span>
        <span class="slot__value">${esc(clue.label)}</span>
        <span class="slot__detail">${esc(clue.detail)}</span>
      </span>
      ${
        locked
          ? `<span class="slot__lock" title="Part of the record — a closed chapter was built on this.">&#9679;</span>`
          : `<button class="slot__drop" data-act="unfile" data-clue="${esc(clue.id)}"
                     title="Take this back out">&#10005;</button>`
      }
      ${
        flagged
          ? `<span class="slot__flag">You found something that contradicts this. It was wrong.</span>`
          : ""
      }
    </div>`;
  };

  // Body and identifiers sit in their own block — what they look like in suit,
  // and the numbers that follow a person around, are a different kind of fact
  // from where they work.
  const physical = PHYSICAL_SLOTS.filter((s) => filed.has(s));
  const life = SLOT_ORDER.filter((s) => !PHYSICAL_SLOTS.includes(s));

  const rows =
    life.map(row).join("") +
    (physical.length
      ? `<div class="profile__group">
           <div class="px-label">Description</div>
           ${physical.map(row).join("")}
         </div>`
      : "");

  const links = linksFor(ctx.state, ctx.kase, person.id);
  const linkRows = links.length
    ? `<div class="profile__links">
         <div class="px-label">Connections</div>
         ${links
           .map((e) => {
             const other = e.from === person.id ? e.to : e.from;
             const lockedLink = ctx.state.committed.includes(e.clue.id);
             return `
             <div class="profile__link${e.weak ? " is-weak" : ""}">
               <img src="${fursonaUrl(ctx.kase.people[other]?.sona ?? person.sona)}"
                    width="28" height="26" alt="" draggable="false">
               <span>
                 <b>${esc(ctx.kase.people[other]?.name ?? other)}</b>
                 <span class="profile__how">${esc(e.label)}</span>
               </span>
               ${
                 lockedLink
                   ? `<span class="slot__lock" title="Part of the record — a closed chapter was built on this.">&#9679;</span>`
                   : `<button class="slot__drop" data-act="unfile" data-clue="${esc(e.clue.id)}"
                              title="Take this back out">&#10005;</button>`
               }
             </div>`;
           })
           .join("")}
       </div>`
    : "";

  return `
    <div class="profile px-scroll${isTarget ? " is-target" : ""}" data-person="${esc(person.id)}"
         data-act="person">
      <div class="profile__head">
        <img src="${fursonaUrl(person.sona)}" width="64" height="60" alt="" draggable="false">
        <div>
          <div class="profile__name">${esc(person.name)}</div>
          <div class="profile__note">${esc(person.note)}</div>
        </div>
      </div>
      ${rows}
      ${linkRows}
      ${
        ctx.heldClue && isTarget
          ? `<div class="profile__droppad">Drop it anywhere in here</div>`
          : ""
      }
    </div>`;
}

/* --- connection web ------------------------------------------------------- */

function web(ctx: PlayCtx): string {
  const people = livePeople(ctx.state, ctx.kase);
  const edges = connections(ctx.state, ctx.kase);
  const visible = new Set(people.map((p) => p.id));

  // Only draw edges whose both ends are on the board this chapter.
  const drawn = edges.filter((e) => visible.has(e.from) && visible.has(e.to));

  /*
   * Authored positions cover the whole cast. In chapter one only a handful of
   * them exist, so the board would sit in a corner — rescale whoever is
   * actually present to fill the canvas.
   */
  const xs = people.map((p) => p.pos[0]);
  const ys = people.map((p) => p.pos[1]);
  const span = (values: number[]) => {
    const lo = Math.min(...values);
    const hi = Math.max(...values);
    return { lo, range: hi - lo || 1 };
  };
  const sx = span(xs);
  const sy = span(ys);
  const PAD = 14;
  const fit = (value: number, s: { lo: number; range: number }): number =>
    PAD + ((value - s.lo) / s.range) * (100 - PAD * 2);
  const at = (id: string): [number, number] => {
    // A node the player has dragged stays where they put it.
    const pinned = ctx.state.webPos[id];
    if (pinned) return [pinned[0], pinned[1]];
    const p = ctx.kase.people[id]!;
    return [fit(p.pos[0], sx), fit(p.pos[1], sy)];
  };

  const lines = drawn
    .map((e) => {
      const [ax, ay] = at(e.from);
      const [bx, by] = at(e.to);
      const a = { pos: [ax, ay] as const };
      const b = { pos: [bx, by] as const };
      const mx = (a.pos[0] + b.pos[0]) / 2;
      const my = (a.pos[1] + b.pos[1]) / 2;
      const on = ctx.state.focus === e.from || ctx.state.focus === e.to;
      const fresh = ctx.fresh.clues.has(e.clue.id) ? " is-new" : "";
      return `
        <line x1="${a.pos[0]}" y1="${a.pos[1]}" x2="${b.pos[0]}" y2="${b.pos[1]}"
              class="web__edge${e.weak ? " is-weak" : ""}${on ? " is-on" : ""}${fresh}"
              vector-effect="non-scaling-stroke" />
        <circle cx="${mx}" cy="${my}" r="1.6"
                class="web__knot${e.weak ? " is-weak" : ""}${fresh}"
                vector-effect="non-scaling-stroke" />`;
    })
    .join("");

  const targets = heldTargets(ctx);
  const nodes = people
    .map((p) => {
      const filled = dossier(ctx.state, ctx.kase, p.id).size;
      const degree = drawn.filter((e) => e.from === p.id || e.to === p.id).length;
      const on = ctx.state.focus === p.id;
      const target = targets.has(p.id);
      const fresh = ctx.fresh.people.has(p.id) ? " is-new" : "";
      const [nx, ny] = at(p.id);
      return `
        <button type="button"
                class="web__node${on ? " is-on" : ""}${target ? " is-target" : ""}${p.isSona ? " is-sona" : ""}${filled || degree ? "" : " is-cold"}${fresh}"
                style="left:${nx}%;top:${ny}%"
                data-act="person" data-person="${esc(p.id)}"
                title="${esc(p.name)} — ${esc(p.note)}">
          <img src="${fursonaUrl(p.sona)}" width="40" height="38" alt="" draggable="false">
          <span class="web__label">${esc(p.name.split(" ")[0] ?? p.name)}</span>
          ${filled ? `<span class="web__count">${filled}</span>` : ""}
        </button>`;
    })
    .join("");

  const legend = drawn.length
    ? drawn
        .map(
          (e) => `
          <li class="web__link${e.weak ? " is-weak" : ""}">
            <b>${esc(ctx.kase.people[e.from]?.name ?? e.from)}</b>
            <span class="web__arrow">&harr;</span>
            <b>${esc(ctx.kase.people[e.to]?.name ?? e.to)}</b>
            <span class="web__how">${esc(e.label)}</span>
          </li>`,
        )
        .join("")
    : `<li class="web__empty">No connections yet. Facts that tie two people together
         go on this board instead of into a slot.</li>`;

  return `
    <div class="web px-scroll">
      <div class="web__canvas">
        <svg class="web__wires" viewBox="0 0 100 100" preserveAspectRatio="none"
             aria-hidden="true">${lines}</svg>
        ${nodes}
      </div>
      <ul class="web__links">${legend}</ul>
    </div>`;
}

function foot(ctx: PlayCtx): string {
  const chapter = chapterOf(ctx.state, ctx.kase);
  const { done, total } = keyProgress(ctx.state, ctx.kase);
  const complete = done === total;

  return `
    <div class="dossier__foot">
      <div class="progress">
        <span>CH ${chapter.id}</span>
        <span class="progress__track"><span class="progress__fill" style="width:${Math.round((done / Math.max(1, total)) * 100)}%"></span></span>
        <span>${done}/${total}</span>
      </div>
      <button class="px-btn px-btn--go" style="width:100%" data-act="chapter-next" ${complete ? "" : "disabled"}>
        ${complete ? (chapter.id === 3 ? "You know who it is" : "Next chapter") : "Keep looking"}
      </button>
    </div>`;
}

/* --- shell ---------------------------------------------------------------- */

export function playView(ctx: PlayCtx): string {
  return `
    <div class="app">
      ${topbar(ctx)}
      <div class="work">
        ${browser(ctx)}
        <section class="dossier">
          <div class="dossier__head">
            <div class="dossier__modes">
              <button type="button" class="mode${ctx.state.view === "profile" ? " is-on" : ""}"
                      data-act="view" data-view="profile">Profile</button>
              <button type="button" class="mode${ctx.state.view === "web" ? " is-on" : ""}"
                      data-act="view" data-view="web">Web</button>
            </div>
            <span>${ctx.state.filed.length} filed</span>
          </div>
          ${rail(ctx)}
          ${ctx.state.view === "web" ? web(ctx) : profile(ctx)}
          ${foot(ctx)}
        </section>
      </div>
    </div>`;
}
