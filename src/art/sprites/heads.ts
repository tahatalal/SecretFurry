/* ---------------------------------------------------------------------------
   Fursona head bases.

   Every head is 32x30 and shares the same palette keys, so a marking or an
   accessory drawn once lines up on all of them:

     O outline   B base fur   S shade     L crest/highlight
     P inner ear M muzzle     N nose      E iris
     W eye glint T mouth

   The shared anatomy every overlay depends on:
     eyes    rows 12-17, cols 6-11 (left) and 20-25 (right)
     muzzle  rows 18-29, cols 12-19
     crown   row 9
   Species identity lives entirely above row 12 — ears, horns, crests — plus
   head width. Move any of the above and every marking moves with it.
--------------------------------------------------------------------------- */

import { defineSprite, type PaletteMap, type Sprite } from "../pixel.ts";

/** Placeholder palette — real colors get swapped in by fursona.ts. */
const PROTO: PaletteMap = {
  O: "#2b2438",
  B: "#ff8a3d",
  S: "#d2601c",
  L: "#ffb877",
  P: "#f2a3b8",
  M: "#ffd0a3",
  N: "#2b2438",
  E: "#ffc93f",
  W: "#ffffff",
  T: "#c9556c",
};

/** Tall pointed ears, long snout. Maned wolf, fox, coyote, husky, jackal. */
export const HEAD_CANID: Sprite = defineSprite(
  `
................................
....OO....................OO....
...OBBO..................OBBO...
...OBPO..................OPBO...
..OBBPPO................OPPBBO..
..OBPPPO................OPPPBO..
.OBBPPPPO..............OPPPPBBO.
.OBPPPPPO..............OPPPPPBO.
.OBPPPPPO..............OPPPPPBO.
.OBBPPPBOOOOOOOOOOOOOOOBPPPBBO..
.OBBBBBBBBBBBBBBBBBBBBBBBBBBBBO.
..OBBBBBBBBBBBBBBBBBBBBBBBBBSO..
..OBBBBBOOBBBBBBBBBBBBOOBBBBSO..
..OBBBBOEEOBBBBBBBBBBOEEOBBBSO..
..OBBBOEWOEOBBBBBBBBOEWOEOBBSO..
..OBBBOEOOEOBBBBBBBBOEOOEOBBSO..
..OBBBBOEEOBBBBBBBBBBOEEOBBBSO..
..OBBBBBOOBBBBBBBBBBBBOOBBBBSO..
..OBBBBBBBBBBMMMMMMBBBBBBBBBSO..
..OBBBBBBBBBMMNNNNMMBBBBBBBBSO..
..OBBBBBBBBBMMMNNMMMBBBBBBBBSO..
..OBBBBBBBBBMMMOOMMMBBBBBBBBSO..
...OBBBBBBBBMOMMMMOMBBBBBBBSO...
...OBBBBBBBBMMMTTMMMBBBBBBBSO...
....OBBBBBBBMMMMMMMMBBBBBBSO....
.....OBBBBBBMMMMMMMMBBBBBSO.....
.......OBBBBMMMMMMMMBBBSO.......
.........OBBMMMMMMMMBSO.........
...........OMMMMMMMMO...........
............OOOOOOOO............
`,
  PROTO,
);

/** Huge round ears. Fennec, bat, mouse, rabbit, chinchilla, deer. */
export const HEAD_ROUND: Sprite = defineSprite(
  `
................................
..OOOOOOO..............OOOOOOO..
.OBBBBBBBO............OBBBBBBBO.
OBPPPPPPPBO..........OBPPPPPPPBO
OBPPPPPPPBO..........OBPPPPPPPBO
OBPPPPPPPBO..........OBPPPPPPPBO
OBPPPPPPPBO..........OBPPPPPPPBO
.OBPPPPPBO............OBPPPPPBO.
.OBBPPPBBO............OBBPPPBBO.
..OBBBBBOOOOOOOOOOOOOOOBBBBBO...
..OBBBBBBBBBBBBBBBBBBBBBBBBBBO..
..OBBBBBBBBBBBBBBBBBBBBBBBBBSO..
..OBBBBBOOBBBBBBBBBBBBOOBBBBSO..
..OBBBBOEEOBBBBBBBBBBOEEOBBBSO..
..OBBBOEWOEOBBBBBBBBOEWOEOBBSO..
..OBBBOEOOEOBBBBBBBBOEOOEOBBSO..
..OBBBBOEEOBBBBBBBBBBOEEOBBBSO..
..OBBBBBOOBBBBBBBBBBBBOOBBBBSO..
..OBBBBBBBBBBMMMMMMBBBBBBBBBSO..
..OBBBBBBBBBMMNNNNMMBBBBBBBBSO..
..OBBBBBBBBBMMMNNMMMBBBBBBBBSO..
...OBBBBBBBBMMMOOMMMBBBBBBBSO...
...OBBBBBBBBMOMMMMOMBBBBBBBSO...
....OBBBBBBBMMMTTMMMBBBBBBSO....
.....OBBBBBBMMMMMMMMBBBBBSO.....
......OBBBBBMMMMMMMMBBBBSO......
........OBBBMMMMMMMMBBSO........
..........OOMMMMMMMMOO..........
...........OMMMMMMMMO...........
............OOOOOOOO............
`,
  PROTO,
);

/** Small tufted ears, wide cheeks. Cat, lynx, snow leopard, otter, ferret. */
export const HEAD_FELINE: Sprite = defineSprite(
  `
................................
................................
................................
....O......................O....
....OO....................OO....
...OBO....................OBO...
...OBPO..................OPBO...
..OBBPPO................OPPBBO..
..OBBPPPO..............OPPPBBO..
.OBBPPPPOOOOOOOOOOOOOOOOPPPPBBO.
.OBBBBBBBBBBBBBBBBBBBBBBBBBBBBO.
OBBBBBBBBBBBBBBBBBBBBBBBBBBBBBSO
OBBBBBBBOOBBBBBBBBBBBBOOBBBBBBSO
OBBBBBBOEEOBBBBBBBBBBOEEOBBBBBSO
OBBBBBOEWOEOBBBBBBBBOEWOEOBBBBSO
OBBBBBOEOOEOBBBBBBBBOEOOEOBBBBSO
OBBBBBBOEEOBBBBBBBBBBOEEOBBBBBSO
OBBBBBBBOOBBBBBBBBBBBBOOBBBBBBSO
.OBBBBBBBBBBBMMMMMMBBBBBBBBBBSO.
.OBBBBBBBBBBMMNNNNMMBBBBBBBBBSO.
.OBBBBBBBBBBMMMNNMMMBBBBBBBBBSO.
.OBBBBBBBBBBMOMOOMOMBBBBBBBBBSO.
..OBBBBBBBBBMMMMMMMMBBBBBBBBSO..
...OBBBBBBBBMMMMMMMMBBBBBBBSO...
....OBBBBBBBMMMMMMMMBBBBBBSO....
.....OBBBBBBMMMMMMMMBBBBBSO.....
.......OBBBBMMMMMMMMBBBSO.......
.........OBBMMMMMMMMBSO.........
...........OMMMMMMMMO...........
............OOOOOOOO............
`,
  PROTO,
);

/** Swept horns. Dragon, sergal, protogen, dutch angel dragon, goat. */
export const HEAD_HORNED: Sprite = defineSprite(
  `
OOOO........................OOOO
OSSO........................OSSO
OSSSO......................OSSSO
.OSSSO....................OSSSO.
.OSSSO....................OSSSO.
..OSSSO..................OSSSO..
..OBSSSO................OSSSBO..
...OBSSSO..............OSSSBO...
...OBBSSO..............OSSBBO...
...OBBSSOOOOOOOOOOOOOOOOSSBBO...
...OBBBBBBBBBBBBBBBBBBBBBBBBO...
..OBBBBBBBBBBBBBBBBBBBBBBBBBSO..
..OBBBBBOOBBBBBBBBBBBBOOBBBBSO..
..OBBBBOEEOBBBBBBBBBBOEEOBBBSO..
..OBBBOEWOEOBBBBBBBBOEWOEOBBSO..
..OBBBOEOOEOBBBBBBBBOEOOEOBBSO..
..OBBBBOEEOBBBBBBBBBBOEEOBBBSO..
..OBBBBBOOBBBBBBBBBBBBOOBBBBSO..
..OBBBBBBBBBBMMMMMMBBBBBBBBBSO..
..OBBBBBBBBBMMNNNNMMBBBBBBBBSO..
..OBBBBBBBBBMMMNNMMMBBBBBBBBSO..
..OBBBBBBBBBMMMOOMMMBBBBBBBBSO..
..OBBBBBBBBBMOMMMMOMBBBBBBBBSO..
...OBBBBBBBBMMMTTMMMBBBBBBBSO...
...OBBBBBBBBMMMMMMMMBBBBBBBSO...
....OBBBBBBBMMMMMMMMBBBBBBSO....
.....OBBBBBBMMMMMMMMBBBBBSO.....
.......OBBBBMMMMMMMMBBBSO.......
.........OBBMMMMMMMMBSO.........
............OOOOOOOO............
`,
  PROTO,
);

/** Feather crest and hooked beak. Gryphon, corvid, avali, owl, parrot. */
export const HEAD_AVIAN: Sprite = defineSprite(
  `
.........OO....OO....OO.........
........OLLO..OLLO..OLLO........
........OLLLOOLLLOOLLLO.........
........OLLLLLLLLLLLLLLO........
.......OBLLLLLLLLLLLLLLBO.......
......OBBLLLLLLLLLLLLLLBBO......
.....OBBBLLLLLLLLLLLLLLBBBO.....
....OBBBBBBBBBBBBBBBBBBBBBBO....
...OBBBBBBBBBBBBBBBBBBBBBBBBO...
..OBBBBBBBBBBBBBBBBBBBBBBBBBBO..
..OBBBBBBBBBBBBBBBBBBBBBBBBBSO..
..OBBBBBBBBBBBBBBBBBBBBBBBBBSO..
..OBBBBBOOBBBBBBBBBBBBOOBBBBSO..
..OBBBBOEEOBBBBBBBBBBOEEOBBBSO..
..OBBBOEWOEOBBBBBBBBOEWOEOBBSO..
..OBBBOEOOEOBBBBBBBBOEOOEOBBSO..
..OBBBBOEEOBBBBBBBBBBOEEOBBBSO..
..OBBBBBOOBBBBBBBBBBBBOOBBBBSO..
..OBBBBBBBBBMMMMMMMMBBBBBBBBSO..
..OBBBBBBBBMMMMMMMMMMBBBBBBBSO..
...OBBBBBBBMMMNNNNMMMBBBBBBSO...
....OBBBBBBMMMMMMMMMMBBBBBSO....
.....OBBBBBMMMMMMMMMMBBBBSO.....
.......OBBBMMMMMMMMMMBBSO.......
.........OBMMMMMMMMMMSO.........
..........OMMMMMMMMMMO..........
...........OMMMMMMMMO...........
............OMMMMMMO............
.............OMMMMO.............
..............OOOO..............
`,
  PROTO,
);

export interface SpeciesDef {
  readonly id: string;
  /** What a person would actually call this sona type in the creator. */
  readonly name: string;
  readonly head: Sprite;
  /** Species people pick under this head shape. */
  readonly examples: readonly string[];
}

export const SPECIES: readonly SpeciesDef[] = [
  {
    id: "canid",
    name: "Canid",
    head: HEAD_CANID,
    examples: ["maned wolf", "fox", "coyote", "husky", "shepherd", "jackal"],
  },
  {
    id: "round",
    name: "Big Ears",
    head: HEAD_ROUND,
    examples: ["fennec", "bat", "mouse", "rabbit", "chinchilla", "deer"],
  },
  {
    id: "feline",
    name: "Feline",
    head: HEAD_FELINE,
    examples: ["cat", "lynx", "snow leopard", "red panda", "otter", "ferret"],
  },
  {
    id: "horned",
    name: "Horned",
    head: HEAD_HORNED,
    examples: ["dragon", "sergal", "protogen", "dutch angel dragon", "goat"],
  },
  {
    id: "avian",
    name: "Avian",
    head: HEAD_AVIAN,
    examples: ["gryphon", "corvid", "avali", "owl", "parrot"],
  },
] as const;

export function speciesById(id: string): SpeciesDef {
  return SPECIES.find((s) => s.id === id) ?? SPECIES[0]!;
}
