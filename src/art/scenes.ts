/* ---------------------------------------------------------------------------
   The photographs.

   Every image in the game is a small pixel painting built here: parade shots,
   Instagram grids, murals, cats. Scenes are painted programmatically — flat
   fills, dither bands, and blits of the same head sprites the dossier uses,
   so the maned wolf in the parade photo is literally the face on the board.

   A scene is cheap: a char grid handed to the same sprite engine as the
   avatars, rasterized once, cached forever. Node (validator, tests) builds
   the grids but never rasterizes them.
--------------------------------------------------------------------------- */

import { defineSprite, flipX, recolor, type Sprite } from "./pixel.ts";
import { C, FUR_COLORS, furColor } from "./palettes.ts";
import { speciesById } from "./sprites/heads.ts";
import { markingById } from "./sprites/markings.ts";

/* --- the painter ----------------------------------------------------------- */

const CODES =
  "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()-=+[]{};:<>?/|~_,'`";

class Pic {
  readonly w: number;
  readonly h: number;
  private rows: string[][];
  private palette: Record<string, string> = {};
  private byColor = new Map<string, string>();
  private next = 0;

  constructor(w: number, h: number, bg?: string) {
    this.w = w;
    this.h = h;
    this.rows = Array.from({ length: h }, () => Array.from({ length: w }, () => "."));
    if (bg) this.rect(0, 0, w, h, bg);
  }

  private code(color: string): string {
    const hit = this.byColor.get(color);
    if (hit) return hit;
    const ch = CODES[this.next];
    if (!ch) throw new Error("scene ran out of palette slots");
    this.next += 1;
    this.byColor.set(color, ch);
    this.palette[ch] = color;
    return ch;
  }

  px(x: number, y: number, color: string): void {
    const xi = Math.round(x);
    const yi = Math.round(y);
    if (xi < 0 || yi < 0 || xi >= this.w || yi >= this.h) return;
    this.rows[yi]![xi] = this.code(color);
  }

  rect(x: number, y: number, w: number, h: number, color: string): void {
    for (let yy = y; yy < y + h; yy += 1) {
      for (let xx = x; xx < x + w; xx += 1) this.px(xx, yy, color);
    }
  }

  /** Checkerboard two colors; omit `b` to leave alternate pixels untouched. */
  dither(x: number, y: number, w: number, h: number, a: string, b?: string): void {
    for (let yy = y; yy < y + h; yy += 1) {
      for (let xx = x; xx < x + w; xx += 1) {
        if ((xx + yy) % 2 === 0) this.px(xx, yy, a);
        else if (b) this.px(xx, yy, b);
      }
    }
  }

  hline(x: number, y: number, w: number, color: string): void {
    this.rect(x, y, w, 1, color);
  }

  vline(x: number, y: number, h: number, color: string): void {
    this.rect(x, y, 1, h, color);
  }

  frame(x: number, y: number, w: number, h: number, color: string): void {
    this.hline(x, y, w, color);
    this.hline(x, y + h - 1, w, color);
    this.vline(x, y, h, color);
    this.vline(x + w - 1, y, h, color);
  }

  /** Copy a sprite in. `step` samples every Nth pixel — 2 halves a head. */
  blit(sprite: Sprite, x: number, y: number, step = 1): void {
    for (let sy = 0; sy < sprite.h; sy += step) {
      for (let sx = 0; sx < sprite.w; sx += step) {
        const ch = sprite.rows[sy]?.[sx] ?? ".";
        if (ch === "." || ch === " ") continue;
        const color = sprite.palette[ch];
        if (color) this.px(x + sx / step, y + sy / step, color);
      }
    }
  }

  sprite(): Sprite {
    return defineSprite(this.rows.map((r) => r.join("")).join("\n"), this.palette);
  }
}

/* --- shared vocabulary ----------------------------------------------------- */

/** A fursona head at half size (16x15), with an optional marking overlay. */
function head(pic: Pic, x: number, y: number, headId: string, fur: string, marking?: string, markFur = "cream"): void {
  const f = furColor(fur);
  const base = recolor(speciesById(headId).head, {
    O: C.ink, B: f.base, S: f.shade, L: f.light, M: f.light,
    P: "#f2a3b8", N: C.ink, E: C.sunbeam, W: C.white, T: "#c9556c",
  });
  pic.blit(base, x, y, 2);
  if (marking) {
    const m = markingById(marking).sprite;
    if (m.w > 0) pic.blit(recolor(m, { A: furColor(markFur).base }), x, y, 2);
  }
}

/** A person from behind: hair cap, hoodie, legs. About 7px wide. */
function personBack(pic: Pic, x: number, y: number, hoodie: string, hair: string, height = 16): void {
  const bodyTop = y + 4;
  pic.rect(x + 1, y, 5, 4, hair);
  pic.rect(x, bodyTop, 7, Math.max(6, height - 9), hoodie);
  pic.rect(x + 1, bodyTop + Math.max(6, height - 9), 2, 5, C.ink2);
  pic.rect(x + 4, bodyTop + Math.max(6, height - 9), 2, 5, C.ink2);
}

/** Vale's tell: the four-stroke wolf head, tiny and dark. */
function glyph(pic: Pic, x: number, y: number, color: string = C.ink): void {
  pic.px(x, y, color);
  pic.px(x, y + 1, color);
  pic.px(x + 4, y, color);
  pic.px(x + 4, y + 1, color);
  pic.px(x + 1, y + 2, color);
  pic.px(x + 3, y + 2, color);
  pic.px(x + 2, y + 3, color);
}

/** A lineless backlit badge: sunset bands, a dark bust, a rim of light. */
function badge(pic: Pic, x: number, y: number, w: number, h: number): void {
  pic.rect(x, y, w, h, C.tangerine);
  pic.rect(x, y, w, Math.floor(h / 3), C.sunbeam);
  pic.rect(x, y + h - Math.floor(h / 3), w, Math.floor(h / 3), C.berryD);
  const bx = x + Math.floor(w / 2) - 2;
  pic.rect(bx, y + Math.floor(h / 2) - 1, 4, Math.ceil(h / 2) + 1, C.ink2);
  pic.px(bx, y + Math.floor(h / 2) - 2, C.ink2);
  pic.px(bx + 3, y + Math.floor(h / 2) - 2, C.ink2);
  pic.hline(bx, y + Math.floor(h / 2) - 2, 4, "#ffb877");
  pic.frame(x, y, w, h, C.paper);
}

/** 3x5 digits, for the one sign in the game that needs numbers. */
const DIGITS: Record<string, string[]> = {
  "1": ["01.", ".1.", ".1.", ".1.", "111"].map((r) => r.replace(/0/g, ".")),
  "4": ["1.1", "1.1", "111", "..1", "..1"],
  "2": ["111", "..1", "111", "1..", "111"],
  "6": ["111", "1..", "111", "1.1", "111"],
};

function digit(pic: Pic, x: number, y: number, d: string, color: string): void {
  const rows = DIGITS[d];
  if (!rows) return;
  rows.forEach((row, yy) => {
    [...row].forEach((ch, xx) => {
      if (ch === "1") pic.px(x + xx, y + yy, color);
    });
  });
}

/** A little cat: body loaf, ears, tail. */
function cat(pic: Pic, x: number, y: number, color: string, opts: { tail?: 1 | -1; oneEye?: boolean; yawn?: boolean } = {}): void {
  pic.rect(x, y + 3, 9, 5, color);
  pic.rect(x + 6, y, 4, 5, color);
  pic.px(x + 6, y - 1, color);
  pic.px(x + 9, y - 1, color);
  const tail = opts.tail ?? -1;
  pic.vline(tail === -1 ? x - 1 : x + 9, y + 1, 4, color);
  pic.px(x + 7, y + 2, C.ink);
  if (!opts.oneEye) pic.px(x + 9, y + 2, C.ink);
  if (opts.yawn) pic.px(x + 8, y + 4, C.berryD);
}

/* --- the scenes ------------------------------------------------------------ */

const PAINTERS: Record<string, () => Sprite> = {
  /* Nine laminated badges fanned on a hotel bedspread. */
  fa_badges: () => {
    const p = new Pic(48, 36, C.orchidD);
    p.dither(0, 0, 48, 36, "#8f54d6");
    for (let i = 0; i < 9; i += 1) {
      const x = 3 + (i % 3) * 15 + (Math.floor(i / 3) % 2) * 2;
      const y = 2 + Math.floor(i / 3) * 11;
      badge(p, x, y, 12, 9);
      glyph(p, x + 7, y + 5, C.ink);
    }
    return p.sprite();
  },

  /* Sundog's ref sheet: front and back views, swatches, hex-code dashes. */
  fa_ref_sundog: () => {
    const p = new Pic(48, 36, C.paper);
    p.frame(0, 0, 48, 36, C.paperEdge);
    head(p, 4, 4, "canid", "marigold", "cheeks", "cream");
    const back = flipX(recolor(speciesById("canid").head, {
      O: C.ink, B: furColor("marigold").base, S: furColor("marigold").shade,
      L: furColor("marigold").light, M: furColor("marigold").base,
      P: furColor("marigold").shade, N: furColor("marigold").base,
      E: furColor("marigold").base, W: furColor("marigold").base, T: furColor("marigold").base,
    }));
    p.blit(back, 27, 4, 2);
    const swatches = ["marigold", "cream", "cocoa", "rust"];
    swatches.forEach((s, i) => {
      p.rect(5 + i * 10, 25, 7, 5, furColor(s).base);
      p.frame(5 + i * 10, 25, 7, 5, C.ink3);
      p.hline(5 + i * 10, 32, 6, C.ink4);
    });
    return p.sprite();
  },

  /* YCH template: a backlit canid leaning on a railing, face left blank. */
  fa_ych: () => {
    const p = new Pic(48, 36);
    p.rect(0, 0, 48, 12, C.sunbeam);
    p.rect(0, 12, 48, 8, C.tangerine);
    p.rect(0, 20, 48, 8, C.berry);
    p.rect(0, 28, 48, 8, C.berryD);
    p.dither(0, 10, 48, 3, C.tangerine);
    p.dither(0, 18, 48, 3, C.berry);
    p.hline(4, 22, 40, C.ink);
    p.vline(8, 22, 12, C.ink);
    p.vline(24, 22, 12, C.ink);
    p.vline(40, 22, 12, C.ink);
    p.rect(18, 10, 8, 14, C.ink2);
    p.rect(19, 5, 6, 6, C.paper);
    p.px(19, 3, C.ink2);
    p.px(24, 3, C.ink2);
    p.px(19, 4, C.ink2);
    p.px(24, 4, C.ink2);
    p.hline(18, 10, 8, "#ffb877");
    return p.sprite();
  },

  /* Two sketchbook pages of lineless hand studies. */
  fa_hands: () => {
    const p = new Pic(48, 36, "#2a3238");
    p.rect(2, 3, 21, 30, C.paper);
    p.rect(25, 3, 21, 30, C.paper2);
    for (const [ox, oy] of [[5, 7], [13, 18], [28, 8], [36, 20]] as const) {
      p.rect(ox, oy + 4, 6, 6, furColor("cocoa").base);
      for (let f = 0; f < 4; f += 1) p.vline(ox + 1 + f, oy, 4 + (f % 2), furColor("cocoa").base);
      p.hline(ox, oy + 4, 6, furColor("cocoa").light);
    }
    return p.sprite();
  },

  /* Parade block 14: the corridor, the crowd, and the maned wolf mid-wave. */
  parade_block: () => {
    const p = new Pic(80, 48, "#d8d3e6");
    p.rect(0, 0, 80, 8, "#b9b2d0");
    for (let i = 0; i < 4; i += 1) {
      p.rect(4 + i * 20, 2, 12, 14, C.sunbeam);
      p.dither(4 + i * 20, 10, 12, 6, "#d8d3e6");
      p.frame(4 + i * 20, 2, 12, 14, "#8f88a8");
    }
    p.rect(0, 40, 80, 8, "#9c93ae");
    p.hline(0, 40, 80, "#8f88a8");
    // Back row: heads over the crowd, a couple of species.
    const row: readonly (readonly [string, string])[] =
      [["round", "moss"], ["feline", "slate"], ["canid", "cobalt"], ["horned", "bubblegum"]];
    row.forEach(([hid, fur], i) => {
      personBack(p, 6 + i * 19, 22, furColor(fur).shade, C.ink2, 14);
      head(p, 2 + i * 19, 14, hid, fur);
    });
    // Front and centre: Vale. Ember partial, cream blaze, one arm up.
    p.rect(34, 32, 11, 12, C.ink2);
    p.rect(44, 24, 3, 10, furColor("ember").base);
    head(p, 32, 18, "canid", "ember", "blaze", "cream");
    p.rect(38, 34, 4, 3, C.sunbeam);
    glyph(p, 38, 34, C.ink);
    p.vline(33, 34, 9, furColor("ember").base);
    p.px(33, 43, furColor("cream").base);
    // The block sign.
    p.rect(64, 26, 12, 9, C.paper);
    p.frame(64, 26, 12, 9, C.ink);
    digit(p, 66, 28, "1", C.ink);
    digit(p, 71, 28, "4", C.ink);
    return p.sprite();
  },

  /* Vale's Toyhouse ref: two views, swatches, and the glyph in the corner. */
  toyhouse_ref: () => {
    const p = new Pic(80, 48, C.paper);
    p.frame(0, 0, 80, 48, C.paperEdge);
    head(p, 6, 6, "canid", "ember", "blaze", "cream");
    const side = flipX(recolor(speciesById("canid").head, {
      O: C.ink, B: furColor("ember").base, S: furColor("ember").shade,
      L: furColor("ember").light, M: furColor("cream").base,
      P: "#f2a3b8", N: C.ink, E: C.sunbeam, W: C.white, T: "#c9556c",
    }));
    p.blit(side, 30, 6, 2);
    // The gradient, spelled out: muzzle to chest.
    p.rect(54, 6, 8, 4, furColor("ember").shade);
    p.rect(54, 10, 8, 4, furColor("ember").base);
    p.rect(54, 14, 8, 4, furColor("ember").light);
    p.rect(54, 18, 8, 4, furColor("cream").base);
    p.frame(54, 6, 8, 16, C.ink3);
    const swatches = ["ember", "cream", "rust", "cocoa", "orchid"];
    swatches.forEach((s, i) => {
      p.rect(6 + i * 12, 32, 8, 6, furColor(s).base);
      p.frame(6 + i * 12, 32, 8, 6, C.ink3);
      p.hline(6 + i * 12, 40, 7, C.ink4);
    });
    glyph(p, 72, 42, C.ink2);
    return p.sprite();
  },

  /* Six people from behind at the spring meet. The far right one is Vale. */
  bowling_backs: () => {
    const p = new Pic(80, 48, "#3a3352");
    // The lanes, glowing at the far end.
    p.rect(0, 8, 80, 10, "#57496e");
    p.rect(0, 8, 80, 3, "#6e5d88");
    for (let lane = 0; lane < 4; lane += 1) {
      const cx = 8 + lane * 20;
      for (let pin = 0; pin < 3; pin += 1) {
        p.vline(cx + pin * 3, 9, 3, C.paper);
        p.px(cx + pin * 3, 9, C.berry);
      }
    }
    p.rect(0, 18, 80, 4, "#8a7ba6");
    p.rect(0, 22, 80, 26, "#494066");
    p.dither(0, 22, 80, 26, "#413a5c");
    // The lineup, in their sona hoodies.
    const crew: readonly (readonly [string, string])[] = [
      ["snow", "slate"], ["slate", "ink"], ["cocoa", "rust"],
      ["rust", "cocoa"], ["lilac", "slate"],
    ];
    crew.forEach(([hoodie, hair], i) => {
      personBack(p, 5 + i * 12, 20, furColor(hoodie).base, furColor(hair).shade, 18);
    });
    // Vale: ember hoodie, tail out, holding the ball, turned away.
    personBack(p, 66, 19, furColor("ember").base, furColor("ember").shade, 19);
    p.vline(74, 26, 8, furColor("ember").base);
    p.px(74, 34, furColor("cream").base);
    p.rect(64, 30, 4, 4, C.cobaltD);
    p.px(65, 31, C.paper);
    return p.sprite();
  },

  /* Etsy: a stack of foam sheets on the counter. */
  foam_stack: () => {
    const p = new Pic(48, 36, C.paper2);
    p.rect(0, 28, 48, 8, furColor("cocoa").base);
    p.hline(0, 28, 48, furColor("cocoa").shade);
    for (let i = 0; i < 5; i += 1) {
      p.rect(10, 24 - i * 4, 28, 4, i % 2 ? "#c9cedb" : "#dde1ea");
      p.hline(10, 24 - i * 4, 28, "#aab0bf");
    }
    return p.sprite();
  },

  /* Etsy: twelve minky squares, fanned. */
  minky_bundle: () => {
    const p = new Pic(48, 36, C.paper2);
    FUR_COLORS.slice(0, 12).forEach((c, i) => {
      const x = 3 + (i % 6) * 7;
      const y = 6 + Math.floor(i / 6) * 13 + (i % 2) * 2;
      p.rect(x, y, 7, 10, c.base);
      p.hline(x, y, 7, c.light);
      p.vline(x, y, 10, c.shade);
    });
    return p.sprite();
  },

  /* Etsy: mesh roll and buckram sheet. */
  mesh_roll: () => {
    const p = new Pic(48, 36, C.paper2);
    p.rect(0, 30, 48, 6, furColor("cocoa").base);
    p.rect(6, 8, 14, 22, C.ink2);
    p.dither(6, 8, 14, 22, C.ink);
    p.rect(8, 4, 10, 4, C.ink2);
    p.rect(26, 12, 16, 18, C.paper);
    p.frame(26, 12, 16, 18, C.paperEdge);
    p.dither(28, 14, 12, 14, C.paper2);
    return p.sprite();
  },

  /* The mural on 7th Street, students in front, glyph knee-height. */
  mural_photo: () => {
    const p = new Pic(80, 48);
    // Brick.
    p.rect(0, 0, 80, 40, furColor("rust").base);
    for (let y = 0; y < 40; y += 4) {
      p.hline(0, y, 80, furColor("rust").shade);
      for (let x = (y / 4) % 2 ? 4 : 0; x < 80; x += 8) p.px(x, y + 2, furColor("rust").shade);
    }
    // The mural itself: sunset, animals walking out of it, rim-lit.
    p.rect(8, 4, 64, 30, C.berryD);
    p.rect(8, 4, 64, 10, C.sunbeam);
    p.rect(8, 14, 64, 8, C.tangerine);
    p.dither(8, 12, 64, 4, C.sunbeam);
    p.dither(8, 20, 64, 4, C.tangerine);
    const animals = [12, 28, 44, 58];
    animals.forEach((x, i) => {
      const top = 23 - (i % 2);
      // Body, head, ears — walking left to right, out of the sunset.
      p.rect(x, top, 9, 30 - top, C.ink2);
      p.rect(x + 6, top - 5, 5, 6, C.ink2);
      p.px(x + 7, top - 6, C.ink2);
      p.px(x + 10, top - 6, C.ink2);
      p.px(x - 1, top + 1, C.ink2);
      p.px(x - 2, top, C.ink2);
      // Legs: carve two notches out of the bottom.
      p.vline(x + 2, 28, 2, C.berryD);
      p.vline(x + 6, 28, 2, C.berryD);
      // The whole point of the style: light along the upper contour.
      p.hline(x - 1, top - 1, 7, "#ffb877");
      p.hline(x + 6, top - 6, 1, "#ffb877");
      p.px(x + 8, top - 7, "#ffb877");
      p.px(x + 9, top - 7, "#ffb877");
      p.hline(x + 6, top - 5, 5, furColor("ember").base);
    });
    p.frame(8, 4, 64, 30, furColor("rust").shade);
    glyph(p, 66, 29, C.ink);
    // The kids, arms up, paint everywhere.
    p.rect(0, 40, 80, 8, "#9c93ae");
    const kids = ["meadow", "cobalt", "bubblegum", "sunbeam", "lagoon"];
    kids.forEach((c, i) => {
      const x = 8 + i * 14;
      personBack(p, x, 34, furColor(c).base, C.ink2, 13);
      p.px(x - 1, 36, furColor(kids[(i + 1) % 5]!).base);
      p.vline(x - 1, 33, 4, furColor(c).base);
      p.vline(x + 7, 33, 4, furColor(c).base);
    });
    return p.sprite();
  },

  /* A map with a dropped pin. */
  map_pin: () => {
    const p = new Pic(64, 32, "#e8ecdf");
    p.rect(0, 0, 64, 32, "#e8ecdf");
    // The river.
    for (let y = 0; y < 32; y += 1) p.rect(40 + Math.floor(y / 6), y, 4, 1, "#a9d3e8");
    // Streets.
    for (let y = 5; y < 32; y += 8) p.hline(0, y, 64, C.white);
    for (let x = 8; x < 64; x += 12) p.vline(x, 0, 32, C.white);
    p.rect(14, 10, 8, 5, "#cfd8c2");
    p.rect(28, 18, 10, 6, "#cfd8c2");
    // The pin.
    p.rect(30, 8, 5, 4, C.berry);
    p.px(31, 12, C.berry);
    p.px(32, 13, C.berryD);
    p.px(32, 9, C.white);
    return p.sprite();
  },

  /* Priya: three cats on a sunny windowsill. */
  cats_windowsill: () => {
    const p = new Pic(48, 36, "#fff3d9");
    p.rect(4, 2, 40, 22, "#bfe3f2");
    p.dither(4, 2, 40, 8, "#dff1f9");
    p.frame(4, 2, 40, 22, furColor("cocoa").base);
    p.vline(24, 2, 22, furColor("cocoa").base);
    p.rect(0, 24, 48, 4, furColor("cocoa").light);
    p.hline(0, 24, 48, furColor("cocoa").base);
    p.rect(0, 28, 48, 8, C.paper3);
    cat(p, 6, 16, furColor("cocoa").base, { tail: -1 });
    cat(p, 20, 17, C.ink2, { tail: 1 });
    cat(p, 34, 16, furColor("ember").base, { yawn: true });
    return p.sprite();
  },

  /* Priya: the plush fox on a cutting mat. */
  plush_fox: () => {
    const p = new Pic(48, 36, furColor("moss").base);
    for (let y = 4; y < 36; y += 8) p.hline(0, y, 48, furColor("moss").light);
    for (let x = 4; x < 48; x += 8) p.vline(x, 0, 36, furColor("moss").light);
    // The fox: sitting, tail curled, bead eyes.
    p.rect(16, 14, 12, 12, furColor("ember").base);
    p.rect(18, 8, 8, 8, furColor("ember").base);
    p.px(18, 6, furColor("ember").base);
    p.px(19, 7, furColor("ember").base);
    p.px(25, 6, furColor("ember").base);
    p.px(24, 7, furColor("ember").base);
    p.rect(20, 12, 4, 3, furColor("cream").base);
    p.px(20, 10, C.ink);
    p.px(24, 10, C.ink);
    p.rect(16, 22, 12, 4, furColor("cream").base);
    p.rect(28, 18, 6, 5, furColor("ember").base);
    p.rect(32, 18, 2, 5, furColor("cream").base);
    // Spool and thimble.
    p.rect(6, 24, 5, 7, furColor("bubblegum").base);
    p.hline(6, 24, 5, furColor("bubblegum").shade);
    p.hline(6, 30, 5, furColor("bubblegum").shade);
    p.rect(38, 26, 4, 5, "#c9cedb");
    p.dither(38, 26, 4, 2, "#aab0bf");
    return p.sprite();
  },

  /* Priya: break room, clock reading ten past three. */
  break_room: () => {
    const p = new Pic(48, 36, "#eef0f4");
    p.rect(0, 24, 48, 12, "#cfd4de");
    p.hline(0, 24, 48, "#b4bac8");
    // The clock.
    p.rect(19, 4, 10, 10, C.white);
    p.frame(19, 4, 10, 10, C.ink2);
    p.px(23, 5, C.ink3);
    p.px(23, 12, C.ink3);
    p.px(20, 9, C.ink3);
    p.px(27, 9, C.ink3);
    p.hline(24, 9, 3, C.ink);
    p.px(24, 7, C.ink);
    p.px(24, 8, C.ink);
    // Lunchbox on the table.
    p.rect(8, 18, 10, 7, furColor("cobalt").base);
    p.hline(8, 18, 10, furColor("cobalt").light);
    p.rect(11, 16, 4, 2, furColor("cobalt").shade);
    // Mug.
    p.rect(32, 20, 5, 5, C.berry);
    p.px(38, 21, C.berry);
    p.px(38, 22, C.berry);
    return p.sprite();
  },

  /* Priya: the craft fair table under paper leaves. */
  craft_table: () => {
    const p = new Pic(48, 36, C.paper2);
    // The string of leaves.
    p.hline(0, 4, 48, C.ink4);
    for (let x = 2; x < 48; x += 6) {
      const c = x % 12 === 2 ? C.tangerine : x % 18 === 8 ? C.berry : C.sunbeamD;
      p.px(x, 5, c);
      p.rect(x - 1, 6, 3, 2, c);
      p.px(x, 8, c);
    }
    // The table.
    p.rect(2, 22, 44, 5, furColor("cocoa").base);
    p.rect(4, 27, 3, 8, furColor("cocoa").shade);
    p.rect(41, 27, 3, 8, furColor("cocoa").shade);
    p.rect(2, 20, 44, 2, C.paper);
    // A dozen small plush in bright colors.
    const colors = ["ember", "meadow", "cobalt", "bubblegum", "marigold", "orchid", "lagoon", "rust", "mint", "cherry", "lilac", "moss"];
    colors.forEach((c, i) => {
      const x = 4 + (i % 6) * 7;
      const y = 13 + Math.floor(i / 6) * 4;
      p.rect(x, y, 4, 4, furColor(c).base);
      p.px(x, y - 1, furColor(c).base);
      p.px(x + 3, y - 1, furColor(c).base);
    });
    return p.sprite();
  },

  /* Priya: the med drawer, immaculate. */
  med_drawer: () => {
    const p = new Pic(48, 36, "#dfe3ea");
    p.frame(0, 0, 48, 36, "#b4bac8");
    for (let row = 0; row < 3; row += 1) {
      for (let col = 0; col < 4; col += 1) {
        const x = 3 + col * 11;
        const y = 3 + row * 11;
        p.rect(x, y, 10, 10, "#eef0f4");
        p.frame(x, y, 10, 10, "#b4bac8");
        p.rect(x + 2, y + 2, 6, 2, C.white);
        p.px(x + 1, y + 3, furColor("lagoon").base);
        p.rect(x + 2, y + 6, 6, 2, C.white);
        p.px(x + 1, y + 7, furColor("lagoon").base);
      }
    }
    p.rect(16, 0, 16, 3, C.sunbeam);
    return p.sprite();
  },

  /* Priya: Nadia's pot holder, Priya's casserole. */
  pot_holder: () => {
    const p = new Pic(48, 36, C.paper3);
    p.dither(2, 6, 18, 18, furColor("bubblegum").base, furColor("orchid").base);
    p.frame(2, 6, 18, 18, furColor("orchid").shade);
    p.px(19, 5, furColor("orchid").shade);
    // The casserole, slightly burned.
    p.rect(24, 12, 20, 12, furColor("rust").base);
    p.hline(24, 12, 20, furColor("rust").light);
    p.rect(26, 14, 16, 6, furColor("cocoa").light);
    p.dither(28, 14, 12, 4, C.ink2);
    p.px(23, 16, furColor("rust").base);
    p.px(44, 16, furColor("rust").base);
    return p.sprite();
  },

  /* Dev: dense blackwork on a forearm. */
  blackwork_arm: () => {
    const p = new Pic(48, 36, "#f4ece2");
    // The arm, diagonal.
    for (let i = 0; i < 22; i += 1) {
      p.rect(4 + i * 2, 28 - i, 14, 3, furColor("cocoa").light);
    }
    // Heavy geometric line — all outline, no fill.
    for (let i = 3; i < 19; i += 2) {
      p.px(8 + i * 2, 26 - i, C.ink);
      p.px(9 + i * 2, 26 - i, C.ink);
      p.px(10 + i * 2, 27 - i, C.ink);
    }
    for (let i = 5; i < 17; i += 4) {
      p.frame(6 + i * 2, 22 - i, 6, 6, C.ink);
    }
    return p.sprite();
  },

  /* Dev: botanical linework, single unbroken strokes. */
  botanical_lines: () => {
    const p = new Pic(48, 36, C.paper);
    p.frame(0, 0, 48, 36, C.paperEdge);
    for (const [sx, lean] of [[10, 1], [24, -1], [38, 1]] as const) {
      for (let y = 30; y > 6; y -= 1) {
        p.px(sx + Math.floor(((30 - y) / 8) * lean), y, C.ink2);
      }
      for (let leaf = 0; leaf < 3; leaf += 1) {
        const ly = 24 - leaf * 7;
        p.px(sx + 1 + leaf * lean, ly, C.ink2);
        p.px(sx + 2 + leaf * lean, ly - 1, C.ink2);
        p.px(sx + 3 + leaf * lean, ly - 1, C.ink2);
        p.px(sx - 1, ly - 3, C.ink2);
        p.px(sx - 2, ly - 4, C.ink2);
      }
    }
    return p.sprite();
  },

  /* Dev: the departures board, Lagos on it. */
  departures: () => {
    const p = new Pic(48, 36, C.ink);
    p.frame(0, 0, 48, 36, C.ink2);
    p.rect(2, 2, 44, 5, C.ink2);
    for (let row = 0; row < 5; row += 1) {
      const y = 10 + row * 5;
      p.rect(4, y, 8, 2, C.sunbeam);
      p.rect(16, y, 12, 2, row === 2 ? C.meadow : C.sunbeam);
      p.rect(32, y, 6, 2, C.sunbeamD);
      p.px(42, y, row === 2 ? C.meadow : C.tangerine);
      p.px(42, y + 1, row === 2 ? C.meadow : C.tangerine);
    }
    return p.sprite();
  },

  /* Dev: a market street at dusk, lights strung, everything moving. */
  market_dusk: () => {
    const p = new Pic(48, 36);
    p.rect(0, 0, 48, 10, furColor("orchid").base);
    p.rect(0, 10, 48, 6, C.berry);
    p.rect(0, 16, 48, 6, C.tangerine);
    p.dither(0, 9, 48, 3, furColor("orchid").base);
    p.dither(0, 15, 48, 3, C.berry);
    p.rect(0, 22, 48, 14, C.ink2);
    // Stalls.
    for (const x of [2, 18, 34]) {
      p.rect(x, 18, 12, 10, C.ink);
      p.rect(x + 1, 15, 10, 3, C.berryD);
    }
    // String lights.
    for (let x = 1; x < 48; x += 4) p.px(x, 13 + (x % 8 === 1 ? 1 : 0), C.sunbeam);
    // Motion blur: horizontal smears low in the frame.
    for (const [x, y, w] of [[6, 30, 10], [22, 32, 14], [4, 33, 8]] as const) {
      p.hline(x, y, w, C.ink3);
    }
    return p.sprite();
  },

  /* Dev: a hand holding a bowl of jollof. */
  jollof: () => {
    const p = new Pic(48, 36, "#f4ece2");
    p.rect(12, 14, 24, 10, C.white);
    p.hline(12, 23, 24, "#c9cedb");
    p.rect(14, 12, 20, 4, furColor("rust").base);
    p.dither(14, 12, 20, 4, C.tangerine);
    p.px(20, 9, C.ink4);
    p.px(26, 8, C.ink4);
    p.px(23, 10, C.ink4);
    // The hand underneath.
    p.rect(16, 24, 16, 6, furColor("cocoa").base);
    for (let f = 0; f < 4; f += 1) p.vline(17 + f * 4, 24, 4, furColor("cocoa").shade);
    return p.sprite();
  },

  /* Dev: snow on a windshield, back in Illinois. */
  snow_windshield: () => {
    const p = new Pic(48, 36, C.ink2);
    p.frame(0, 0, 48, 36, C.ink);
    p.dither(0, 0, 48, 8, C.white);
    p.dither(0, 8, 12, 10, C.white);
    p.dither(36, 8, 12, 12, C.white);
    p.dither(0, 30, 48, 6, C.white);
    // The wiper arc.
    for (let i = 0; i < 20; i += 1) {
      p.px(10 + i, 26 - Math.floor(Math.sin((i / 19) * Math.PI) * 10), C.ink3);
    }
    // A little of the shop, through the glass.
    p.rect(20, 14, 10, 8, C.ink);
    p.rect(22, 16, 6, 3, C.berry);
    return p.sprite();
  },

  /* Casey: the finished head on the workbench. */
  fursuit_workbench: () => {
    const p = new Pic(80, 48, "#5a5145");
    p.rect(0, 30, 80, 18, furColor("cocoa").base);
    p.hline(0, 30, 80, furColor("cocoa").light);
    // The ref sheet taped to the wall.
    p.rect(6, 4, 16, 12, C.paper);
    p.frame(6, 4, 16, 12, C.paperEdge);
    p.rect(8, 6, 5, 5, furColor("rust").base);
    p.rect(15, 6, 5, 5, furColor("cream").base);
    p.rect(8, 13, 12, 1, C.ink4);
    p.px(11, 3, C.lagoon);
    p.px(17, 3, C.lagoon);
    // The head itself, on a stand.
    p.rect(36, 26, 8, 4, C.ink2);
    head(p, 30, 10, "canid", "rust", "mask", "cream");
    // The serger.
    p.rect(56, 18, 16, 12, "#7d8598");
    p.rect(58, 14, 6, 4, "#7d8598");
    p.rect(68, 20, 4, 6, "#535a6b");
    p.px(60, 22, C.berry);
    p.vline(55, 18, 12, "#535a6b");
    // Foam offcuts.
    for (const [x, y] of [[8, 32], [16, 35], [26, 33], [48, 34], [70, 33]] as const) {
      p.rect(x, y, 5, 3, "#dde1ea");
      p.hline(x, y, 5, "#c9cedb");
    }
    return p.sprite();
  },

  /* Nadia: the dock at night, from the break room window. */
  loading_dock: () => {
    const p = new Pic(80, 48, "#171226");
    // Floodlight.
    p.rect(50, 4, 3, 10, C.ink3);
    p.rect(48, 2, 7, 3, C.sunbeam);
    for (let y = 5; y < 34; y += 1) {
      const spread = Math.floor((y - 4) * 0.9);
      p.dither(51 - spread, y, spread * 2, 1, "#4a4159");
    }
    p.dither(38, 24, 28, 10, "#6f6483");
    // The dock building and bays.
    p.rect(4, 16, 34, 18, "#2b2438");
    for (let i = 0; i < 3; i += 1) {
      p.rect(7 + i * 11, 22, 8, 12, "#4a4159");
      p.hline(7 + i * 11, 26, 8, "#2b2438");
      p.hline(7 + i * 11, 30, 8, "#2b2438");
    }
    p.hline(4, 16, 34, "#4a4159");
    // A trailer under the light.
    p.rect(46, 26, 24, 8, "#7d8598");
    p.rect(44, 30, 4, 4, "#535a6b");
    p.px(48, 34, C.ink);
    p.px(66, 34, C.ink);
    p.rect(0, 34, 80, 14, "#211a33");
    // The window frame you're shooting through.
    p.frame(0, 0, 80, 48, C.ink);
    p.frame(1, 1, 78, 46, "#3b3352");
    p.px(74, 6, C.paper);
    return p.sprite();
  },

  /* Theo: the VOD thumbnail — farm game, webcam corner, schedule bar. */
  stream_vod: () => {
    const p = new Pic(80, 48);
    // The game: a tidy little farm.
    p.rect(0, 0, 80, 14, "#8fd7f2");
    p.rect(0, 14, 80, 26, furColor("moss").base);
    p.dither(0, 14, 80, 26, furColor("moss").light);
    for (let row = 0; row < 3; row += 1) {
      p.rect(8, 18 + row * 6, 26, 3, furColor("cocoa").base);
      for (let x = 10; x < 32; x += 4) p.px(x, 19 + row * 6, furColor("meadow").shade);
    }
    p.rect(46, 10, 14, 12, furColor("rust").base);
    p.rect(44, 8, 18, 4, furColor("rust").shade);
    p.rect(51, 16, 4, 6, C.ink2);
    // Webcam box: Theo's actual face.
    p.rect(58, 26, 22, 20, C.ink);
    head(p, 61, 29, "horned", "lagoon");
    p.frame(58, 26, 22, 20, C.berry);
    // Schedule overlay.
    p.rect(0, 40, 58, 8, C.ink);
    digit(p, 4, 41, "2", C.sunbeam);
    p.px(9, 43, C.sunbeam);
    p.px(9, 45, C.sunbeam);
    digit(p, 12, 41, "6", C.sunbeam);
    p.rect(20, 43, 34, 2, C.ink3);
    return p.sprite();
  },
};

/* --- lookup ----------------------------------------------------------------- */

const cache = new Map<string, Sprite>();

/** The scene for an art id, or null if no painter exists for it. */
export function sceneById(id: string): Sprite | null {
  const hit = cache.get(id);
  if (hit) return hit;
  const painter = PAINTERS[id];
  if (!painter) return null;
  const sprite = painter();
  cache.set(id, sprite);
  return sprite;
}

/** Every art id, for the validator: content can't point at a missing scene. */
export function sceneIds(): string[] {
  return Object.keys(PAINTERS);
}
