/* Versioned localStorage persistence. A save that can't be read is discarded
   rather than repaired — this is a two-hour game, not a bank. */

import { initialState, SAVE_VERSION, type GameState } from "./state.ts";

const KEY = "secret-furry:v2";

/** Fields that are UI-transient and must not survive a reload. */
function scrub(state: GameState): GameState {
  return { ...state, toast: null };
}

export function save(state: GameState): void {
  try {
    localStorage.setItem(KEY, JSON.stringify(scrub(state)));
  } catch {
    // Private browsing, quota, or no storage at all. The game still plays.
  }
}

export function load(): GameState | null {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<GameState>;
    if (parsed.v !== SAVE_VERSION) return null;
    // Merge over a fresh state so a save written by an older build that is
    // missing a field still boots.
    return { ...initialState(), ...parsed, toast: null } as GameState;
  } catch {
    return null;
  }
}

export function clear(): void {
  try {
    localStorage.removeItem(KEY);
  } catch {
    /* nothing to do */
  }
}

export function hasSave(): boolean {
  try {
    return localStorage.getItem(KEY) !== null;
  } catch {
    return false;
  }
}
