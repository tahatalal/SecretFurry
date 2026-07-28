/* ---------------------------------------------------------------------------
   Chiptune, generated. No audio files ship with the game.

   A square-wave lead over a soft triangle bass, scheduled a bar at a time so
   the loop can change key between chapters without a gap. Everything routes
   through one gain node, so muting is one assignment.
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
  musicBus = ctx.createGain();
  musicBus.gain.value = 0.16;
  musicBus.connect(master);
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
}

function tone({ freq, dur, wave = "square", gain = 0.3, at, bus, glide }: ToneOptions): void {
  const audio = ensure();
  if (!audio) return;
  const start = at ?? audio.currentTime;
  const osc = audio.createOscillator();
  const env = audio.createGain();
  osc.type = wave;
  osc.frequency.setValueAtTime(freq, start);
  if (glide) osc.frequency.exponentialRampToValueAtTime(Math.max(20, glide), start + dur);

  // Hard attack, quick decay. Anything softer stops sounding like a chip.
  env.gain.setValueAtTime(0.0001, start);
  env.gain.exponentialRampToValueAtTime(gain, start + 0.008);
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

/* --- ambience ------------------------------------------------------------- */

/** Chapter -> root note. Each chapter drops a little, but stays major. */
const ROOTS = [0, 261.63, 233.08, 196.0];
const SCALE = [0, 2, 4, 7, 9, 12, 14, 16];

let loopTimer: number | null = null;
let step = 0;
let chapterRoot = ROOTS[1]!;

function scheduleBar(): void {
  const audio = ensure();
  if (!audio || !musicBus) return;
  const beat = 0.34;
  const now = audio.currentTime + 0.05;

  for (let i = 0; i < 4; i += 1) {
    const at = now + i * beat;
    // Bass: root, root, fifth, root.
    const bassNote = i === 2 ? chapterRoot * 1.5 : chapterRoot;
    tone({ freq: bassNote / 2, dur: beat * 0.85, wave: "triangle", gain: 0.5, at, bus: musicBus });

    // Lead: a wandering arpeggio that never quite repeats.
    const degree = SCALE[(step + i * 2) % SCALE.length]!;
    const lead = chapterRoot * Math.pow(2, degree / 12);
    if ((step + i) % 3 !== 2) {
      tone({ freq: lead * 2, dur: beat * 0.5, wave: "square", gain: 0.22, at, bus: musicBus });
    }
  }
  step += 1;
}

export function startAmbience(chapter: number): void {
  const audio = ensure();
  if (!audio) return;
  chapterRoot = ROOTS[chapter] ?? ROOTS[1]!;
  if (loopTimer !== null) return;
  scheduleBar();
  loopTimer = window.setInterval(scheduleBar, 4 * 340);
}

export function setChapter(chapter: number): void {
  chapterRoot = ROOTS[chapter] ?? ROOTS[1]!;
}

export function stopAmbience(): void {
  if (loopTimer !== null) {
    window.clearInterval(loopTimer);
    loopTimer = null;
  }
}
