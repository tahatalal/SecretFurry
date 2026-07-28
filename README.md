# Secret Furry

A pixel-art deduction game about finding someone who doesn't want to be found.

You met them once, at a convention, in the headless lounge. Four hours about
everything. You traded fursona names and meant to trade handles and didn't.
Their name is Vale, they're a maned wolf, and their accounts have been going
quiet one at a time ever since.

You're going to find them anyway. The game is about *how*.

---

## Play

```bash
npm install
```

```bash
npm run dev
```

Desktop-first — it wants at least 1280px of width. Mobile is not supported yet.

## How it plays

Search the internet. Read what comes back. Anything highlighted is a fact you
can keep: click it, then click the person it belongs to — or drag it onto them.

- **Profiles** fill in slot by slot. One fact per slot, so when two sources
  disagree, filing one throws the other out. Some of what you find is false,
  and you won't always know which.
- **The web** is the other half of the board. Facts that tie two people
  together don't go in a slot; they draw an edge. June Ferraro sells foam to
  everybody in this town, which makes her the seam between the half of the
  internet where Vale is a maned wolf and the half where somebody has a
  payroll number.
- **Filing unlocks searching.** Every fact you keep gives you something new to
  look for. Reading a page does too.

At the end you write them one message. The game knows every fact you filed and
where it came from — things they posted openly, things that crossed between
their two lives, and things they deleted. That's what the ending is graded on,
far more than whether you were right.

## Structure

```
src/
  art/         sprite engine, palettes, fursona compositor. No image files —
               every sprite is text plus a palette, rasterized at runtime.
  engine/      state, save, search, unlock gating, audio, ending logic.
  platforms/   one module per real site: a typed page shape and its layout.
  content/     the case — people, clues, sources, three chapters, endings.
  ui/          controller and views.
scripts/       case validator and dev screenshot helpers.
tests/         engine unit tests.
e2e/           full playthroughs.
```

Content is authored as structured data, not HTML. A Reddit page is
`redditThread({ sub, title, op, comments })`, and `platforms/reddit.ts` owns
every pixel of Reddit's chrome. Clues are `{{c:clue_id|visible text}}` tokens
inside that data.

## Checks

```bash
npm run check
```

Typecheck, then the case validator, then unit tests. The validator is the one
that matters: it proves every clue is pickable, every source is reachable by
some search term you can actually unlock, every chapter is completable, every
false clue has a way to be caught, and no page is thin enough to read as a
stub.

```bash
npm run e2e
```

Plays the game start to finish by clicking, which is the only way to prove the
whole graph is solvable in practice.

## Deploying

`npm run build` emits a static `dist/`. A GitHub Actions workflow that
publishes it to Pages is in `.github/workflows/deploy.yml`, disabled by
default — enable Pages for the repo and set the workflow to run on push when
you want it live.

## About the content

Every person, account, post, message, review and article in this game is
fictional. Real platforms and real conventions are depicted so the game feels
like the internet you actually use; none of them are affiliated with it,
endorse it, or appear here in any official capacity. No brand assets are
used — every logo is a pixel-art re-drawing made for this game, as is
everything else you can see.

Rockford, Illinois is a real city. Kishwaukee Middle School, Ferraro Fabric &
Foam, Riverside Church, North Main Animal Hospital, the Rockford Register
Star's coverage, and every person named in this game are not real.
