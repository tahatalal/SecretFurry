# Secret Furry

`Secret Furry` is an original desktop-first pixel-art investigation game. The player follows Inbox leads into believable fictional websites, pulls contextual data from them, builds one person at a time, and uses a detective-board overview to identify the performer behind Velvet Static.

Each lead opens a distinct in-world source: a long-form newspaper report, public staff directory, social thread, workplace channel, personal blog, craft forum, raw access-control export, photographer's archive, or encrypted group conversation. Datachunks remain phrases inside the source's natural typography, with ordinary context and non-clue material around them.

## Play

Open `index.html` directly in a modern desktop browser. No build step, server, account, or dependency installation is required.

## Controls

- Click an Inbox lead to replace the Inbox with its linked source.
- Use the fixed **Inbox** tab to return to available leads; opened sources remain beside it as switchable tabs.
- Drag a highlighted data chunk anywhere onto the active dossier; the game files it automatically.
- Names create new profiles. Image chunks reveal portraits.
- Use the portrait rail to switch people.
- Use **Network** to inspect discovered relationships, then click a portrait to return to its dossier.
- Clicking a chunk and then the dossier is an accessibility fallback for dragging.

## Validation

```powershell
node --check src/app.js
node --check src/case-data.js
node scripts/validate-case.js
```

An optional Chrome DevTools smoke test is included at `scripts/qa-browser.mjs`; it expects a local headless Chrome endpoint on port 9223.

All characters, messages, accounts, images, and personal data are fictional. The generated art assets are original project assets.
