/* Telegram, Discord, and one-to-one DMs. All three are message lists; they
   differ in chrome, density, and what metadata they leak. */

import type { Fursona } from "../art/fursona.ts";
import type { Page } from "../engine/types.ts";
import { avatar, esc, initialAvatar, page, rich } from "./kit.ts";

export interface ChatLine {
  readonly who: string;
  readonly sona?: Fursona;
  readonly time: string;
  readonly text: string;
  /** Renders as a shared image card. */
  readonly image?: { alt: string };
  /** Renders as a system line: joins, pins, name changes. */
  readonly system?: boolean;
  /** Marks the message as edited or deleted, which is often the clue. */
  readonly note?: string;
  readonly mine?: boolean;
}

export interface ChatDay {
  readonly date: string;
  readonly lines: readonly ChatLine[];
}

function lineRow(line: ChatLine, compact: boolean): string {
  if (line.system) {
    return `<div class="ch-system">${rich(line.text)}</div>`;
  }
  const pic = line.sona ? avatar(line.sona, compact ? 34 : 40, "ch-pfp") : initialAvatar(line.who, compact ? 34 : 40);
  return `
    <div class="ch-line${line.mine ? " ch-line--mine" : ""}">
      ${pic}
      <div class="ch-bubble">
        <div class="ch-meta"><b>${esc(line.who)}</b><span>${esc(line.time)}</span></div>
        <div class="ch-text">${rich(line.text)}</div>
        ${line.image ? `<div class="pf-imgbox">${rich(line.image.alt)}</div>` : ""}
        ${line.note ? `<div class="ch-note">${rich(line.note)}</div>` : ""}
      </div>
    </div>`;
}

export function telegramGroup(opts: {
  readonly group: string;
  readonly members: string;
  readonly pinned?: string;
  readonly days: readonly ChatDay[];
}): Page {
  return page(
    "telegram",
    `
    <div class="tg">
      <header class="tg-head">
        <span class="tg-icon">${esc(opts.group.charAt(0))}</span>
        <div>
          <b>${esc(opts.group)}</b>
          <div class="tg-members">${esc(opts.members)}</div>
        </div>
      </header>
      ${opts.pinned ? `<div class="tg-pinned">&#128204; ${rich(opts.pinned)}</div>` : ""}
      <div class="tg-scroll">
        ${opts.days
          .map(
            (day) =>
              `<div class="ch-date">${esc(day.date)}</div>` +
              day.lines.map((l) => lineRow(l, true)).join(""),
          )
          .join("")}
      </div>
      <div class="tg-compose">Message</div>
    </div>`,
  );
}

export function discordChannel(opts: {
  readonly server: string;
  readonly channel: string;
  readonly topic: string;
  readonly channels: readonly string[];
  readonly days: readonly ChatDay[];
}): Page {
  return page(
    "discord",
    `
    <div class="dc">
      <aside class="dc-side">
        <div class="dc-server">${esc(opts.server)}</div>
        <div class="dc-chanlist">
          ${opts.channels
            .map(
              (c) =>
                `<div class="dc-chan${c === opts.channel ? " is-on" : ""}"># ${esc(c)}</div>`,
            )
            .join("")}
        </div>
      </aside>
      <div class="dc-main">
        <header class="dc-head">
          <b># ${esc(opts.channel)}</b>
          <span class="dc-topic">${esc(opts.topic)}</span>
        </header>
        <div class="dc-scroll">
          ${opts.days
            .map(
              (day) =>
                `<div class="ch-date">${esc(day.date)}</div>` +
                day.lines.map((l) => lineRow(l, false)).join(""),
            )
            .join("")}
        </div>
      </div>
    </div>`,
  );
}

export function dmThread(opts: {
  readonly with: string;
  readonly sona?: Fursona;
  readonly subtitle?: string;
  readonly days: readonly ChatDay[];
}): Page {
  return page(
    "dm",
    `
    <div class="dm">
      <header class="dm-head">
        ${opts.sona ? avatar(opts.sona, 40, "dm-pfp") : initialAvatar(opts.with, 40)}
        <div>
          <b>${esc(opts.with)}</b>
          ${opts.subtitle ? `<div class="dm-sub">${esc(opts.subtitle)}</div>` : ""}
        </div>
      </header>
      <div class="dm-scroll">
        ${opts.days
          .map(
            (day) =>
              `<div class="ch-date">${esc(day.date)}</div>` +
              day.lines.map((l) => lineRow(l, true)).join(""),
          )
          .join("")}
      </div>
    </div>`,
  );
}
