/* ---------------------------------------------------------------------------
   Shared helpers for platform renderers.

   Content is authored as plain strings with two pieces of markup:

     {{c:clue_id|visible text}}   a pickable clue
     *emphasis*                   bold

   Everything is escaped before markup is applied, so content can contain <, &
   and quotes without ceremony.
--------------------------------------------------------------------------- */

import type { Fursona } from "../art/fursona.ts";
import { fursonaUrl } from "../art/fursona.ts";
import type { Page, PlatformId } from "../engine/types.ts";

export function esc(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

const CLUE_TOKEN = /\{\{c:([a-z0-9_]+)\|([^}]+)\}\}/gi;

/**
 * A link to another page: {{go:source_id|visible text}}.
 *
 * Some places aren't on the open web. You don't find a Discord server by
 * searching for it — you find an invite link posted somewhere else and follow
 * it. Same for group chats and anything behind a login.
 */
const GO_TOKEN = /\{\{go:([a-z0-9_]+)\|([^}]+)\}\}/gi;

function outlink(id: string, label: string): string {
  return (
    `<a class="pf-link" href="#" data-act="open-source" data-source="${esc(id)}" ` +
    `title="Open ${esc(label)}">${label}</a>`
  );
}

/** Every page this body links to. Used by the reachability validator. */
export function linkIdsIn(body: string): string[] {
  const out: string[] = [];
  for (const match of body.matchAll(/class="pf-link"[^>]*data-source="([^"]+)"/g)) {
    out.push(match[1]!);
  }
  return out;
}

/**
 * Curl the quotes. The pixel body font draws a straight apostrophe as a stark
 * vertical tick that reads as a backtick at small sizes; the typographic one
 * is a proper comma shape. Applied to every rendered string so content can be
 * written with plain ASCII.
 */
export function typo(text: string): string {
  return text
    .replace(/(\w)'(\w)/g, "$1’$2")
    .replace(/'(\w)/g, "’$1")
    .replace(/(\w)'/g, "$1’")
    .replace(/(^|[\s([])"/g, "$1“")
    .replace(/"/g, "”");
}

/**
 * Escape, then turn markup into HTML. Clue tokens become <mark> elements the
 * chunk layer binds to; everything else is inert.
 */
export function rich(text: string): string {
  return esc(typo(text))
    .replace(CLUE_TOKEN, (_all, id: string, label: string) => chunk(id, label))
    .replace(GO_TOKEN, (_all, id: string, label: string) => outlink(id, label))
    .replace(/\*([^*]+)\*/g, "<b>$1</b>")
    .replace(/\n{2,}/g, "</p><p>")
    .replace(/\n/g, "<br>");
}

/** Same as rich() but without paragraph splitting — for one-line fields. */
export function line(text: string): string {
  return esc(typo(text))
    .replace(CLUE_TOKEN, (_all, id: string, label: string) => chunk(id, label))
    .replace(GO_TOKEN, (_all, id: string, label: string) => outlink(id, label))
    .replace(/\*([^*]+)\*/g, "<b>$1</b>");
}

export function chunk(id: string, label: string): string {
  return (
    `<mark class="chunk" data-clue="${esc(id)}" tabindex="0" role="button" ` +
    `aria-label="Clue: ${esc(label)}. Press Enter to file it.">${label}</mark>`
  );
}

/** Pull every clue id a body references, for the validator and the UI. */
export function clueIdsIn(body: string): string[] {
  const out: string[] = [];
  for (const match of body.matchAll(/data-clue="([^"]+)"/g)) out.push(match[1]!);
  return out;
}

export function paragraphs(text: string): string {
  return `<p>${rich(text)}</p>`;
}

export function avatar(sona: Fursona, size = 40, className = ""): string {
  return (
    `<img class="pf-avatar ${className}" src="${fursonaUrl(sona)}" width="${size}" ` +
    `height="${size}" alt="${esc(sona.name)}" draggable="false">`
  );
}

/** A generic square avatar for accounts with no sona (civilian platforms). */
export function initialAvatar(name: string, size = 40, hue = 0): string {
  const letter = esc(name.trim().charAt(0).toUpperCase() || "?");
  const bg = `hsl(${(hue || hashHue(name)) % 360} 62% 62%)`;
  return (
    `<span class="pf-initial" style="width:${size}px;height:${size}px;background:${bg};` +
    `font-size:${Math.round(size * 0.5)}px">${letter}</span>`
  );
}

function hashHue(value: string): number {
  let hash = 0;
  for (let i = 0; i < value.length; i += 1) hash = (hash * 31 + value.charCodeAt(i)) >>> 0;
  return hash % 360;
}

export function page(platform: PlatformId, body: string): Page {
  return { platform, body };
}

/** Renders a stat like "1.2K" the way every social platform does. */
export function count(n: number): string {
  if (n < 1000) return String(n);
  if (n < 1_000_000) return `${(n / 1000).toFixed(n < 10_000 ? 1 : 0)}K`;
  return `${(n / 1_000_000).toFixed(1)}M`;
}

export function joinClass(...parts: (string | false | null | undefined)[]): string {
  return parts.filter(Boolean).join(" ");
}
