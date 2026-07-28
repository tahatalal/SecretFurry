/* ---------------------------------------------------------------------------
   The one palette. These hexes are duplicated in styles/tokens.css as CSS
   custom properties; if you change one, change both. Sprites can't read CSS
   variables, and CSS can't read TS, so this pair is the seam.
--------------------------------------------------------------------------- */

export const C = {
  ink: "#2b2438",
  ink2: "#4a3f5c",
  ink3: "#6f6483",
  ink4: "#9c93ae",

  paper: "#fff8ec",
  paper2: "#ffefd8",
  paper3: "#ffe3c0",
  paperEdge: "#e3cdb2",
  white: "#ffffff",

  berry: "#ff4d6d",
  berryD: "#d62b4d",
  tangerine: "#ff8a3d",
  tangerineD: "#e06a1c",
  sunbeam: "#ffd43f",
  sunbeamD: "#e0ae15",
  meadow: "#3fca7a",
  meadowD: "#21a459",
  lagoon: "#2fc6dd",
  lagoonD: "#129cb2",
  cobalt: "#4d7cfe",
  cobaltD: "#2b56d0",
  orchid: "#a86bf0",
  orchidD: "#8244cc",
  bubblegum: "#ff9ec4",
  bubblegumD: "#e06d9d",
} as const;

export type ColorName = keyof typeof C;

/* --- fur colors ------------------------------------------------------------
   Named the way people in the fandom actually name a sona's colors, because
   these strings show up in the creator UI and in the ending text.
--------------------------------------------------------------------------- */

export interface FurColor {
  readonly id: string;
  readonly name: string;
  /** main body */
  readonly base: string;
  /** shading / underside */
  readonly shade: string;
  /** highlight / lit edge */
  readonly light: string;
}

export const FUR_COLORS: readonly FurColor[] = [
  { id: "ember", name: "Ember", base: "#ff8a3d", shade: "#d2601c", light: "#ffb877" },
  { id: "cherry", name: "Cherry", base: "#ff5d78", shade: "#cf3053", light: "#ff96a9" },
  { id: "marigold", name: "Marigold", base: "#ffc93f", shade: "#d99b14", light: "#ffe38c" },
  { id: "moss", name: "Moss", base: "#5fc47c", shade: "#2f9553", light: "#96e0aa" },
  { id: "lagoon", name: "Lagoon", base: "#39c2d6", shade: "#1291a6", light: "#84e0ec" },
  { id: "cobalt", name: "Cobalt", base: "#5f86f5", shade: "#3355c4", light: "#9db3fb" },
  { id: "orchid", name: "Orchid", base: "#b17bef", shade: "#7f48bd", light: "#d2aef8" },
  { id: "bubblegum", name: "Bubblegum", base: "#ff9ec4", shade: "#d46b95", light: "#ffc7de" },
  { id: "cocoa", name: "Cocoa", base: "#a4714a", shade: "#734a2c", light: "#c99b74" },
  { id: "cream", name: "Cream", base: "#ffe9c6", shade: "#d9bc93", light: "#fff6e5" },
  { id: "slate", name: "Slate", base: "#7d8598", shade: "#535a6b", light: "#a9b1c1" },
  { id: "ink", name: "Ink", base: "#4a4159", shade: "#2b2438", light: "#6f6483" },
  { id: "snow", name: "Snow", base: "#f4f6fb", shade: "#c9cedb", light: "#ffffff" },
  { id: "mint", name: "Mint", base: "#9ce8c8", shade: "#68b898", light: "#c8f5e2" },
  { id: "rust", name: "Rust", base: "#c4603c", shade: "#8f3f24", light: "#e08a66" },
  { id: "lilac", name: "Lilac", base: "#cbb6f2", shade: "#9b83c4", light: "#e5daf9" },
] as const;

export const EYE_COLORS: readonly { id: string; name: string; hex: string }[] = [
  { id: "gold", name: "Gold", hex: "#ffc93f" },
  { id: "amber", name: "Amber", hex: "#ff9436" },
  { id: "leaf", name: "Leaf", hex: "#4fc46f" },
  { id: "sky", name: "Sky", hex: "#4fc0f0" },
  { id: "cobalt", name: "Cobalt", hex: "#5f86f5" },
  { id: "violet", name: "Violet", hex: "#b17bef" },
  { id: "rose", name: "Rose", hex: "#ff6f8e" },
  { id: "teal", name: "Teal", hex: "#2fc6b0" },
  { id: "copper", name: "Copper", hex: "#c4603c" },
  { id: "silver", name: "Silver", hex: "#c9cedb" },
] as const;

export function furColor(id: string): FurColor {
  return FUR_COLORS.find((c) => c.id === id) ?? FUR_COLORS[0]!;
}

export function eyeColor(id: string): string {
  return EYE_COLORS.find((c) => c.id === id)?.hex ?? EYE_COLORS[0]!.hex;
}
