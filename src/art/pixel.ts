/* ---------------------------------------------------------------------------
   Pixel art engine.

   A sprite is a block of text plus a palette. One character per pixel, '.' and
   ' ' are transparent. That means a 32x32 character with 8 colors costs about
   a kilobyte of source and zero network requests, and the same definition can
   be recolored at runtime (which is how the fursona creator works).

   Rasterized results are cached per Sprite object, so re-rendering the same
   avatar a hundred times across a feed costs one canvas.
--------------------------------------------------------------------------- */

export type PaletteMap = Readonly<Record<string, string>>;

export interface Sprite {
  readonly w: number;
  readonly h: number;
  readonly rows: readonly string[];
  readonly palette: PaletteMap;
}

const TRANSPARENT = new Set([".", " ", "\t"]);

/**
 * Build a sprite from an art block. Leading/trailing blank lines are dropped
 * and rows are right-padded to the widest row, so art can be indented in
 * source without the indentation becoming part of the image — as long as every
 * row is indented equally. Common indentation is stripped automatically.
 */
export function defineSprite(art: string, palette: PaletteMap): Sprite {
  const raw = art.replace(/\r\n?/g, "\n").split("\n");

  while (raw.length && raw[0]!.trim() === "") raw.shift();
  while (raw.length && raw[raw.length - 1]!.trim() === "") raw.pop();

  const indent = raw.reduce((min, row) => {
    if (row.trim() === "") return min;
    const lead = row.length - row.trimStart().length;
    return Math.min(min, lead);
  }, Number.POSITIVE_INFINITY);
  const trimmed = raw.map((row) => (Number.isFinite(indent) ? row.slice(indent) : row));

  const w = trimmed.reduce((max, row) => Math.max(max, row.length), 0);
  const rows = trimmed.map((row) => row.padEnd(w, "."));

  return Object.freeze({ w, h: rows.length, rows: Object.freeze(rows), palette });
}

/** Return a copy of the sprite with some palette entries replaced. */
export function recolor(sprite: Sprite, overrides: PaletteMap): Sprite {
  return Object.freeze({
    w: sprite.w,
    h: sprite.h,
    rows: sprite.rows,
    palette: Object.freeze({ ...sprite.palette, ...overrides }),
  });
}

/** Flip a sprite horizontally. Useful for mirrored ears, tails, UI arrows. */
export function flipX(sprite: Sprite): Sprite {
  return Object.freeze({
    w: sprite.w,
    h: sprite.h,
    rows: Object.freeze(sprite.rows.map((row) => [...row].reverse().join(""))),
    palette: sprite.palette,
  });
}

/**
 * True in Node, where the validator and unit tests import content modules that
 * build avatars at module load. There is nothing to rasterize onto there, so
 * every sprite resolves to the same transparent pixel and the text-shaped parts
 * of the content still load.
 */
const HEADLESS = typeof document === "undefined";

const BLANK_PNG =
  "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=";

function makeCanvas(w: number, h: number): HTMLCanvasElement {
  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  return canvas;
}

const canvasCache = new WeakMap<Sprite, HTMLCanvasElement>();

/** Rasterize at 1:1. Cached per Sprite instance. */
export function rasterize(sprite: Sprite): HTMLCanvasElement {
  const cached = canvasCache.get(sprite);
  if (cached) return cached;
  if (HEADLESS) throw new Error("rasterize() needs a DOM");

  const canvas = makeCanvas(sprite.w, sprite.h);
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("2d canvas context unavailable");
  paintInto(ctx, sprite, 0, 0);
  canvasCache.set(sprite, canvas);
  return canvas;
}

function paintInto(ctx: CanvasRenderingContext2D, sprite: Sprite, ox: number, oy: number): void {
  for (let y = 0; y < sprite.h; y += 1) {
    const row = sprite.rows[y]!;
    let x = 0;
    while (x < sprite.w) {
      const ch = row[x] ?? ".";
      if (TRANSPARENT.has(ch)) {
        x += 1;
        continue;
      }
      const color = sprite.palette[ch];
      if (!color) {
        x += 1;
        continue;
      }
      // Run-length the horizontal span so wide flat areas are one fillRect.
      let run = 1;
      while (x + run < sprite.w && row[x + run] === ch) run += 1;
      ctx.fillStyle = color;
      ctx.fillRect(ox + x, oy + y, run, 1);
      x += run;
    }
  }
}

const urlCache = new WeakMap<Sprite, string>();

/** A data: URL for the sprite at 1:1. Scale with CSS + image-rendering. */
export function spriteUrl(sprite: Sprite): string {
  if (HEADLESS) return BLANK_PNG;
  const cached = urlCache.get(sprite);
  if (cached) return cached;
  const url = rasterize(sprite).toDataURL("image/png");
  urlCache.set(sprite, url);
  return url;
}

export interface SpriteImgOptions {
  /** Rendered CSS width in px. Height follows the sprite's aspect ratio. */
  size?: number;
  scale?: number;
  alt?: string;
  className?: string;
  title?: string;
  style?: string;
}

/** An <img> tag string, for the template-literal render layer. */
export function spriteImg(sprite: Sprite, opts: SpriteImgOptions = {}): string {
  const scale = opts.scale ?? (opts.size ? opts.size / sprite.w : 1);
  const w = Math.round(sprite.w * scale);
  const h = Math.round(sprite.h * scale);
  const attrs = [
    `src="${spriteUrl(sprite)}"`,
    `width="${w}"`,
    `height="${h}"`,
    `alt="${escapeAttr(opts.alt ?? "")}"`,
    opts.className ? `class="${escapeAttr(opts.className)}"` : "",
    opts.title ? `title="${escapeAttr(opts.title)}"` : "",
    opts.style ? `style="${escapeAttr(opts.style)}"` : "",
    opts.alt ? "" : 'aria-hidden="true"',
    'draggable="false"',
  ].filter(Boolean);
  return `<img ${attrs.join(" ")}>`;
}

/** A `url(...)` value for CSS backgrounds. */
export function spriteCssUrl(sprite: Sprite): string {
  return `url("${spriteUrl(sprite)}")`;
}

export interface Layer {
  sprite: Sprite;
  x?: number;
  y?: number;
}

/**
 * Composite layers into a single sprite-shaped canvas. Layers paint in array
 * order. Used by the fursona compositor; results are cached by the caller
 * against the fursona config, not here.
 */
export function composeCanvas(layers: readonly Layer[], w?: number, h?: number): HTMLCanvasElement {
  if (HEADLESS) throw new Error("composeCanvas() needs a DOM");
  const width = w ?? layers.reduce((max, l) => Math.max(max, (l.x ?? 0) + l.sprite.w), 0);
  const height = h ?? layers.reduce((max, l) => Math.max(max, (l.y ?? 0) + l.sprite.h), 0);
  const canvas = makeCanvas(Math.max(1, width), Math.max(1, height));
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("2d canvas context unavailable");
  for (const layer of layers) paintInto(ctx, layer.sprite, layer.x ?? 0, layer.y ?? 0);
  return canvas;
}

export function composeUrl(layers: readonly Layer[], w?: number, h?: number): string {
  if (HEADLESS) return BLANK_PNG;
  return composeCanvas(layers, w, h).toDataURL("image/png");
}

function escapeAttr(value: string): string {
  return value.replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;");
}
