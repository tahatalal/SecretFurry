/* ---------------------------------------------------------------------------
   The cast.

   Vale is a sona, not a person — a dossier you fill in exactly like the others,
   but you can't accuse a sona of being themselves. The nine candidates arrive
   in chapter 2, and one of them is the answer.

   Every NPC gets a sona of their own so the fandom half of the game is full of
   faces rather than initials.
--------------------------------------------------------------------------- */

import { sona } from "../art/fursona.ts";
import type { Person } from "../engine/types.ts";

export const VALE = sona("Vale", "maned wolf", {
  head: "canid",
  fur: "ember",
  marking: "blaze",
  markingFur: "cream",
  eyes: "gold",
  accessory: "none",
  accent: "orchid",
  pronouns: "they/them",
});

/* --- fandom bit players --------------------------------------------------- */

export const CAST = {
  /** Runs the Midwest Furs telegram. Herds cats professionally. */
  bramble: sona("Bramble", "badger", {
    head: "feline",
    fur: "slate",
    marking: "mask",
    markingFur: "snow",
    eyes: "leaf",
    accessory: "glasses",
    pronouns: "he/him",
  }),
  /** Con photographer. Posts 900 parade photos every year, tagged and sorted. */
  shutter: sona("Shutterbug", "fennec", {
    head: "round",
    fur: "cream",
    marking: "cheeks",
    markingFur: "rust",
    eyes: "copper",
    accessory: "headphones",
    accent: "lagoon",
    pronouns: "she/her",
  }),
  /** Fursuit maker, permanently behind on queue. */
  quill: sona("Quillon", "hedgehog", {
    head: "round",
    fur: "cocoa",
    marking: "spots",
    markingFur: "cream",
    eyes: "amber",
    accessory: "cap",
    accent: "meadow",
    pronouns: "they/them",
  }),
  /** Loud, kind, knows everyone, remembers nothing. */
  sprocket: sona("Sprocket", "protogen", {
    head: "horned",
    fur: "snow",
    marking: "stripes",
    markingFur: "lagoon",
    eyes: "sky",
    accessory: "headphones",
    accent: "berry",
    pronouns: "he/they",
  }),
  /** Ref sheet artist. Extremely normal about deadlines, allegedly. */
  marrow: sona("Marrow", "sergal", {
    head: "horned",
    fur: "ink",
    marking: "brow",
    markingFur: "bubblegum",
    eyes: "violet",
    accessory: "none",
    pronouns: "she/her",
  }),
  /** The one who always answers questions in the local chat. */
  poplar: sona("Poplar", "deer", {
    head: "round",
    fur: "rust",
    marking: "spots",
    markingFur: "cream",
    eyes: "leaf",
    accessory: "flowers",
    accent: "sunbeam",
    pronouns: "she/her",
  }),
  /** VRChat regular, awake at appalling hours. */
  tessellate: sona("Tessellate", "dutch angel dragon", {
    head: "horned",
    fur: "lilac",
    marking: "blaze",
    markingFur: "mint",
    eyes: "teal",
    accessory: "collar",
    accent: "orchid",
    pronouns: "any",
  }),
  /** Ko-fi mutual. Buys everyone's YCHs. */
  cobble: sona("Cobble", "otter", {
    head: "feline",
    fur: "moss",
    marking: "pale",
    markingFur: "cream",
    eyes: "gold",
    accessory: "none",
    pronouns: "he/him",
  }),
} as const;

/* --- the dossier cast ----------------------------------------------------- */

/**
 * Candidate sonas are deliberately *not* Vale-like. If a candidate turns out to
 * be Vale, this sona is the one they use for their public, throwaway, "yes I
 * know what a furry is" presence — not the one they're hiding.
 */
export const PEOPLE: Readonly<Record<string, Person>> = {
  vale: {
    id: "vale",
    pos: [50, 13],
    name: "Vale",
    note: "A maned wolf you talked to for four hours and then never found again.",
    sona: VALE,
    chapter: 1,
    isSona: true,
  },

  /* The fandom half of the board. You can't accuse a sona of being a sona, but
     these are the people Vale is standing next to, and the shape of that is
     half the puzzle. */
  bramble: {
    id: "bramble",
    pos: [17, 14],
    name: "Bramble",
    note: "Runs the Midwest Furs chat. Has known Vale four years and has never seen their face.",
    sona: CAST.bramble,
    chapter: 1,
    isSona: true,
  },
  poplar: {
    id: "poplar",
    pos: [83, 14],
    name: "Poplar",
    note: "The one Vale actually talks to. Knew something was coming and didn't ask.",
    sona: CAST.poplar,
    chapter: 1,
    isSona: true,
  },
  sprocket: {
    id: "sprocket",
    pos: [17, 30],
    name: "Sprocket",
    note: "Wears one of Vale's badges on his bag and tells everyone who made it.",
    sona: CAST.sprocket,
    chapter: 1,
    isSona: true,
  },
  quillon: {
    id: "quillon",
    pos: [83, 30],
    name: "Quillon",
    note: "Fursuit maker. Left a shout on Vale's page offering help with something he never names.",
    sona: CAST.quill,
    chapter: 1,
    isSona: true,
  },

  marisol: {
    id: "marisol",
    pos: [50, 63],
    name: "Marisol Enriquez",
    note: "Teaches art at a middle school on the east side. Almost no internet footprint, which is itself unusual.",
    sona: sona("Marisol Enriquez", "—", {
      head: "canid",
      fur: "cocoa",
      marking: "none",
      eyes: "copper",
      accessory: "none",
      pronouns: "she/her",
    }),
    chapter: 2,
    target: true,
  },
  dev: {
    id: "dev",
    pos: [15, 34],
    name: "Dev Okonjo",
    note: "Tattoo apprentice on 7th Street. Draws every waking minute and shows all of it.",
    sona: sona("Dev Okonjo", "—", {
      head: "feline",
      fur: "ink",
      marking: "none",
      eyes: "gold",
      accessory: "none",
      pronouns: "he/him",
    }),
    chapter: 2,
  },
  wren: {
    id: "wren",
    pos: [85, 34],
    name: "Wren Halloway",
    note: "Runs the teen maker space at the public library. Knows every 3D printer in the county.",
    sona: sona("Wren Halloway", "—", {
      head: "avian",
      fur: "slate",
      marking: "none",
      eyes: "leaf",
      accessory: "none",
      pronouns: "they/them",
    }),
    chapter: 2,
  },
  casey: {
    id: "casey",
    pos: [10, 60],
    name: "Casey Brandt",
    note: "HVAC tech. Owns an industrial serger, which is a strange thing for an HVAC tech to own.",
    sona: sona("Casey Brandt", "—", {
      head: "canid",
      fur: "rust",
      marking: "none",
      eyes: "sky",
      accessory: "none",
      pronouns: "he/him",
    }),
    chapter: 2,
  },
  priya: {
    id: "priya",
    pos: [90, 60],
    name: "Priya Raman",
    note: "Veterinary technician. Posts about her cat more than about herself.",
    sona: sona("Priya Raman", "—", {
      head: "feline",
      fur: "marigold",
      marking: "none",
      eyes: "amber",
      accessory: "none",
      pronouns: "she/her",
    }),
    chapter: 2,
  },
  theo: {
    id: "theo",
    pos: [22, 87],
    name: "Theo Lindqvist",
    note: "Community college, second year. Streams four nights a week and is loud about all of it.",
    sona: sona("Theo Lindqvist", "—", {
      head: "horned",
      fur: "lagoon",
      marking: "none",
      eyes: "violet",
      accessory: "none",
      pronouns: "he/him",
    }),
    chapter: 2,
  },
  june: {
    id: "june",
    pos: [50, 37],
    name: "June Ferraro",
    note: "Owns Ferraro Fabric & Foam. Sells upholstery foam to people who are not upholstering anything.",
    sona: sona("June Ferraro", "—", {
      head: "round",
      fur: "bubblegum",
      marking: "none",
      eyes: "rose",
      accessory: "none",
      pronouns: "she/her",
    }),
    chapter: 2,
  },
  amos: {
    id: "amos",
    pos: [78, 87],
    name: "Amos Whitfield",
    note: "Youth pastor. Of everyone here, he has the most to lose and the least he's willing to say.",
    sona: sona("Amos Whitfield", "—", {
      head: "canid",
      fur: "snow",
      marking: "none",
      eyes: "silver",
      accessory: "none",
      pronouns: "he/him",
    }),
    chapter: 2,
  },
  nadia: {
    id: "nadia",
    pos: [50, 92],
    name: "Nadia Kelly",
    note: "Nights at the distribution center off Route 20. Online at hours nobody else is.",
    sona: sona("Nadia Kelly", "—", {
      head: "round",
      fur: "orchid",
      marking: "none",
      eyes: "teal",
      accessory: "none",
      pronouns: "she/her",
    }),
    chapter: 2,
  },
};
