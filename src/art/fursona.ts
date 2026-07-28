/* ---------------------------------------------------------------------------
   Fursona compositor.

   A fursona is a small plain-data config. Everything visual is derived from
   it, so the player's sona and all forty-odd NPC sonas in the game are the
   same kind of object and render through the same path.
--------------------------------------------------------------------------- */

import { composeUrl, recolor, type Layer } from "./pixel.ts";
import { eyeColor, furColor } from "./palettes.ts";
import { speciesById } from "./sprites/heads.ts";
import { markingById } from "./sprites/markings.ts";
import { accessoryById } from "./sprites/accessories.ts";

export interface Fursona {
  /** What they go by in the fandom. Not a legal name. */
  readonly name: string;
  /** Free-text species label, e.g. "maned wolf". Shown in bios. */
  readonly species: string;
  /** Head shape id from SPECIES. */
  readonly head: string;
  /** FurColor id. */
  readonly fur: string;
  readonly marking: string;
  /** FurColor id used for the marking. */
  readonly markingFur: string;
  /** EYE_COLORS id. */
  readonly eyes: string;
  readonly accessory: string;
  /** FurColor id used to tint the accessory. */
  readonly accent: string;
  readonly pronouns: string;
}

export const DEFAULT_FURSONA: Fursona = {
  name: "",
  species: "maned wolf",
  head: "canid",
  fur: "ember",
  marking: "blaze",
  markingFur: "cream",
  eyes: "gold",
  accessory: "none",
  accent: "lagoon",
  pronouns: "they/them",
};

const INNER_EAR = "#f2a3b8";
const MOUTH = "#c9556c";

function layers(sona: Fursona): Layer[] {
  const fur = furColor(sona.fur);
  const mark = furColor(sona.markingFur);
  const accent = furColor(sona.accent);
  const species = speciesById(sona.head);
  const marking = markingById(sona.marking);
  const accessory = accessoryById(sona.accessory);

  const out: Layer[] = [
    {
      sprite: recolor(species.head, {
        B: fur.base,
        S: fur.shade,
        L: fur.light,
        M: fur.light,
        P: INNER_EAR,
        E: eyeColor(sona.eyes),
        T: MOUTH,
      }),
    },
  ];

  if (marking.sprite.w > 0) {
    out.push({ sprite: recolor(marking.sprite, { A: mark.base }) });
  }

  if (accessory.sprite.w > 0) {
    const tint =
      accessory.tintKey === "none" ? {} : { [accessory.tintKey]: accent.base };
    out.push({ sprite: recolor(accessory.sprite, tint) });
  }

  return out;
}

const urlCache = new Map<string, string>();

function key(sona: Fursona): string {
  return [
    sona.head,
    sona.fur,
    sona.marking,
    sona.markingFur,
    sona.eyes,
    sona.accessory,
    sona.accent,
  ].join("|");
}

/** A data: URL for the sona's head at 1:1 (32x30). Cached by appearance. */
export function fursonaUrl(sona: Fursona): string {
  const k = key(sona);
  const hit = urlCache.get(k);
  if (hit) return hit;
  const url = composeUrl(layers(sona), 32, 30);
  urlCache.set(k, url);
  return url;
}

export interface AvatarOptions {
  size?: number;
  className?: string;
  /** Rounded like a real profile picture instead of a hard pixel square. */
  round?: boolean;
  title?: string;
}

/** An avatar <img> string for the template-literal render layer. */
export function fursonaAvatar(sona: Fursona, opts: AvatarOptions = {}): string {
  const size = opts.size ?? 40;
  const cls = ["sona-avatar", opts.round ? "sona-avatar--round" : "", opts.className ?? ""]
    .filter(Boolean)
    .join(" ");
  const label = opts.title ?? `${sona.name}, a ${sona.species}`;
  return (
    `<img src="${fursonaUrl(sona)}" class="${cls}" width="${size}" height="${size}" ` +
    `alt="${escapeAttr(label)}" draggable="false">`
  );
}

function escapeAttr(value: string): string {
  return value.replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;");
}

/**
 * Build an NPC sona without spelling out every field. The fandom half of the
 * cast has dozens of these, and most only care about two or three knobs.
 */
export function sona(name: string, species: string, over: Partial<Fursona> = {}): Fursona {
  return { ...DEFAULT_FURSONA, name, species, ...over };
}
