/* ---------------------------------------------------------------------------
   Chiptune, generated. No audio files ship with the game.

   The ambience is a lullaby, not a level theme: a slow triangle melody low in
   its register over a heartbeat bass and a two-note sine pad, everything
   routed through a lowpass so nothing can pierce. The player stares at this
   game for two hours — the music's whole job is to disappear.

   Scheduled a bar at a time so the loop can change key between chapters
   without a gap. Everything routes through one gain node, so muting is one
   assignment.
--------------------------------------------------------------------------- */

type Wave = OscillatorType;

let ctx: AudioContext | null = null;
let master: GainNode | null = null;
let musicBus: GainNode | null = null;
let sfxBus: GainNode | null = null;
let muted = false;

function ensure(): AudioContext | null {
  if (ctx) return ctx;
  const Ctor = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
  if (!Ctor) return null;
  ctx = new Ctor();
  master = ctx.createGain();
  master.gain.value = muted ? 0 : 0.9;
  master.connect(ctx.destination);
  // All music passes through a gentle lowpass — the difference between a
  // chip lead and a dog whistle is everything above ~1.2kHz.
  const mellow = ctx.createBiquadFilter();
  mellow.type = "lowpass";
  mellow.frequency.value = 1200;
  mellow.Q.value = 0.5;
  mellow.connect(master);
  musicBus = ctx.createGain();
  musicBus.gain.value = 0.16;
  musicBus.connect(mellow);
  sfxBus = ctx.createGain();
  sfxBus.gain.value = 0.5;
  sfxBus.connect(master);
  return ctx;
}

/** Browsers only allow audio after a gesture; call this from the first click. */
export function unlock(): void {
  const audio = ensure();
  if (audio?.state === "suspended") void audio.resume();
}

export function setMuted(next: boolean): void {
  muted = next;
  if (master && ctx) {
    master.gain.setTargetAtTime(next ? 0 : 0.9, ctx.currentTime, 0.02);
  }
}

export function isMuted(): boolean {
  return muted;
}

interface ToneOptions {
  freq: number;
  dur: number;
  wave?: Wave;
  gain?: number;
  at?: number;
  bus?: GainNode | null;
  /** Slide to this frequency over the note. */
  glide?: number;
  /**
   * Seconds to reach full volume. Effects keep the hard chip attack (8ms);
   * music notes ease in so they land like breath instead of like a click.
   */
  attack?: number;
}

function tone({ freq, dur, wave = "square", gain = 0.3, at, bus, glide, attack = 0.008 }: ToneOptions): void {
  const audio = ensure();
  if (!audio) return;
  const start = at ?? audio.currentTime;
  const osc = audio.createOscillator();
  const env = audio.createGain();
  osc.type = wave;
  osc.frequency.setValueAtTime(freq, start);
  if (glide) osc.frequency.exponentialRampToValueAtTime(Math.max(20, glide), start + dur);

  env.gain.setValueAtTime(0.0001, start);
  env.gain.exponentialRampToValueAtTime(gain, start + attack);
  env.gain.exponentialRampToValueAtTime(0.0001, start + dur);

  osc.connect(env);
  env.connect(bus ?? sfxBus ?? audio.destination);
  osc.start(start);
  osc.stop(start + dur + 0.02);
}

function noise(dur: number, gain = 0.2): void {
  const audio = ensure();
  if (!audio) return;
  const frames = Math.floor(audio.sampleRate * dur);
  const buffer = audio.createBuffer(1, frames, audio.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < frames; i += 1) {
    data[i] = (Math.random() * 2 - 1) * (1 - i / frames);
  }
  const src = audio.createBufferSource();
  const env = audio.createGain();
  env.gain.value = gain;
  src.buffer = buffer;
  src.connect(env);
  env.connect(sfxBus ?? audio.destination);
  src.start();
}

/* --- sound effects -------------------------------------------------------- */

export const sfx = {
  click: () => tone({ freq: 660, dur: 0.04, gain: 0.16 }),
  open: () => {
    tone({ freq: 520, dur: 0.06, gain: 0.16 });
    tone({ freq: 780, dur: 0.08, gain: 0.14, at: (ctx?.currentTime ?? 0) + 0.05 });
  },
  /** A clue lands in the dossier. The game's most-heard sound — keep it warm. */
  file: () => {
    const t = ctx?.currentTime ?? 0;
    tone({ freq: 587, dur: 0.07, gain: 0.2, at: t });
    tone({ freq: 880, dur: 0.12, gain: 0.18, at: t + 0.06 });
  },
  /** A clue evicts another. Same shape, sour ending. */
  replace: () => {
    const t = ctx?.currentTime ?? 0;
    tone({ freq: 660, dur: 0.07, gain: 0.18, at: t });
    tone({ freq: 494, dur: 0.14, gain: 0.16, at: t + 0.06 });
  },
  reject: () => tone({ freq: 180, dur: 0.14, gain: 0.18, wave: "sawtooth", glide: 120 }),
  unlock: () => {
    const t = ctx?.currentTime ?? 0;
    [523, 659, 784, 1047].forEach((f, i) =>
      tone({ freq: f, dur: 0.1, gain: 0.16, at: t + i * 0.06 }),
    );
  },
  chapter: () => {
    const t = ctx?.currentTime ?? 0;
    [392, 523, 659, 784, 1047].forEach((f, i) =>
      tone({ freq: f, dur: 0.22, gain: 0.18, wave: "triangle", at: t + i * 0.12 }),
    );
  },
  type: () => noise(0.02, 0.06),
  send: () => {
    const t = ctx?.currentTime ?? 0;
    tone({ freq: 440, dur: 0.1, gain: 0.2, at: t, glide: 880 });
  },
};

/* --- ambience --------------------------------------------------------------
   A real piece, not a pattern: sixteen bars in an A A' B A" song form over a
   moving chord progression, with a written melody. The form alternates
   between a full pass and a sparse one, so the music doesn't literally
   repeat for about seventy seconds — and even then it repeats the way a
   lullaby does, not the way a siren does.
----------------------------------------------------------------------------- */

/** Chapter -> root note. Each chapter drops a little, but stays major. */
const ROOTS = [0, 261.63, 233.08, 196.0];

/** Slow. Two-and-a-quarter seconds to a bar — a resting heart rate. */
const BEAT = 0.56;

/** The major scale, in semitones, for turning scale steps into pitch. */
const MAJOR = [0, 2, 4, 5, 7, 9, 11];

/** A frequency for a scale step (0 = do, 7 = the octave, negatives allowed). */
function noteHz(root: number, step: number): number {
  const octave = Math.floor(step / 7);
  const degree = ((step % 7) + 7) % 7;
  return root * Math.pow(2, (MAJOR[degree]! + 12 * octave) / 12);
}

/**
 * The harmony, one chord per bar, as scale-degree roots:
 * A  (I  vi IV V) — home, a little wistful
 * A' (I  vi ii V) — the same thought, second-guessed
 * B  (vi IV I  V) — the lift
 * A" (I  IV V  I) — and back down to land
 */
const CHORDS = [0, 5, 3, 4, 0, 5, 1, 4, 5, 3, 0, 4, 0, 3, 4, 0] as const;

/**
 * The melody: sixteen bars, four beats each, in scale steps from the key
 * root; null is a rest. Two unhurried notes a bar, phrased as questions in
 * the A sections and an answer that climbs in B before coming home to do.
 */
const MELODY: readonly (readonly (number | null)[])[] = [
  [4, null, 2, null],   // sol  mi
  [2, null, 0, null],   // mi   do
  [5, null, 3, null],   // la   fa
  [4, null, null, null],// sol —
  [4, null, 5, null],   // sol  la
  [7, null, 5, null],   // do'  la
  [1, null, 3, null],   // re   fa
  [2, null, 1, null],   // mi   re
  [7, null, 9, null],   // do'  mi'
  [8, null, 7, null],   // re'  do'
  [7, null, 4, null],   // do'  sol
  [5, null, 6, null],   // la   ti
  [7, null, 2, null],   // do'  mi
  [3, null, 1, null],   // fa   re
  [2, null, 1, null],   // mi   re
  [0, null, null, null],// do — home
];

let loopTimer: number | null = null;
/** Where we are in the sixteen-bar form. */
let bar = 0;
/** Completed passes through the form. Odd passes play the sparse variation. */
let pass = 0;
let chapterRoot = ROOTS[1]!;

/** A long sine swell — the warm bed the rest of the bar lies on. */
function pad(freq: number, dur: number, at: number, gain = 0.09): void {
  const audio = ensure();
  if (!audio || !musicBus) return;
  const osc = audio.createOscillator();
  const env = audio.createGain();
  osc.type = "sine";
  osc.frequency.setValueAtTime(freq, at);
  env.gain.setValueAtTime(0.0001, at);
  env.gain.exponentialRampToValueAtTime(gain, at + dur * 0.35);
  env.gain.exponentialRampToValueAtTime(0.0001, at + dur);
  osc.connect(env);
  env.connect(musicBus);
  osc.start(at);
  osc.stop(at + dur + 0.05);
}

function scheduleBar(): void {
  const audio = ensure();
  if (!audio || !musicBus) return;
  const now = audio.currentTime + 0.05;
  const barDur = 4 * BEAT;
  const chord = CHORDS[bar]!;
  const next = CHORDS[(bar + 1) % CHORDS.length]!;
  const sparse = pass % 2 === 1;

  // The bed: the chord's root, plus its fifth on full passes and its third
  // on sparse ones — when the tune thins out, the harmony gets warmer.
  pad(noteHz(chapterRoot, chord) / 2, barDur, now);
  pad(noteHz(chapterRoot, chord + (sparse ? 2 : 4)) / 2, barDur, now, 0.055);

  for (let i = 0; i < 4; i += 1) {
    const at = now + i * BEAT;

    // Bass follows the chords: root on one and three, and at the end of
    // each four-bar phrase it walks to wherever the harmony goes next.
    if (i % 2 === 0) {
      tone({
        freq: noteHz(chapterRoot, chord) / 2,
        dur: BEAT * 1.7,
        wave: "triangle",
        gain: 0.36,
        at,
        bus: musicBus,
        attack: 0.03,
      });
    } else if (i === 3 && bar % 4 === 3 && next !== chord) {
      tone({
        freq: noteHz(chapterRoot, next) / 2,
        dur: BEAT * 0.9,
        wave: "triangle",
        gain: 0.22,
        at,
        bus: musicBus,
        attack: 0.03,
      });
    }

    // The tune. Full passes play it as written; sparse passes keep only the
    // first note of each bar and let it ring, like humming the half you
    // remember.
    const step = MELODY[bar]![i];
    if (step === null || step === undefined) continue;
    if (sparse && i > 0) continue;
    tone({
      freq: noteHz(chapterRoot, step),
      dur: sparse ? BEAT * 3.2 : BEAT * 1.6,
      wave: "triangle",
      gain: sparse ? 0.12 : 0.15,
      at,
      bus: musicBus,
      attack: 0.05,
    });
  }

  bar += 1;
  if (bar >= CHORDS.length) {
    bar = 0;
    pass += 1;
  }
}

export function startAmbience(chapter: number): void {
  const audio = ensure();
  if (!audio) return;
  chapterRoot = ROOTS[chapter] ?? ROOTS[1]!;
  if (loopTimer !== null) return;
  scheduleBar();
  loopTimer = window.setInterval(scheduleBar, 4 * BEAT * 1000);
}

export function setChapter(chapter: number): void {
  chapterRoot = ROOTS[chapter] ?? ROOTS[1]!;
  // A new chapter starts its key at the top of the form — a clean phrase,
  // not a key change mid-sentence.
  bar = 0;
}

export function stopAmbience(): void {
  if (loopTimer !== null) {
    window.clearInterval(loopTimer);
    loopTimer = null;
  }
  bar = 0;
  pass = 0;
}
