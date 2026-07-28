import "./styles/tokens.css";
import "./styles/pixel-ui.css";
import "./styles/shell.css";
import "./styles/screens.css";
import "./styles/platforms.css";
import "./styles/platforms2.css";
import "./styles/motion.css";

import { CASE } from "./content/index.ts";
import { mount } from "./ui/app.ts";

const root = document.querySelector<HTMLDivElement>("#app");
if (!root) throw new Error("#app is missing from index.html");

mount(root, CASE);

// Test hook. The e2e playthrough needs to know which person each clue belongs
// to in order to file it; without this it would have to hard-code the case.
if (import.meta.env.DEV) {
  (window as unknown as { __SF__: unknown }).__SF__ = {
    clues: Object.fromEntries(
      Object.entries(CASE.clues).map(([id, c]) => [id, { person: c.person, slot: c.slot }]),
    ),
    target: Object.values(CASE.people).find((p) => p.target)?.id,
  };
}
