# JSON Lens — Local JSON Formatter & Viewer

> **The JSON formatter that never phones home.**

A Chrome extension (Manifest V3) that formats, validates, and explores JSON —
built for the developers leaving tracking-laden formatters behind.

## Features

- **Paste / upload / clipboard** — paste JSON, open a `.json` file, or read
  straight from your clipboard (only when *you* press the button).
- **Format & validate** — pretty-prints with syntax highlighting; invalid JSON
  gets a clear error with **line + column**.
- **Tree view** — collapsible nested objects/arrays, expand-all / collapse-all.
- **Search** — find matches across the document with ↑/↓ navigation.
- **Copy formatted ↔ minified** — one click, no dialog.
- **Follows your OS theme** — light/dark via `prefers-color-scheme`.
- **100% local** — see Privacy below.

## Install (developer mode)

1. Open `chrome://extensions`
2. Enable **Developer mode** (top right)
3. Click **Load unpacked** and select this folder (`jsonlens/`)
4. Pin **JSON Lens** to the toolbar, click the icon → **Open JSON Lens**

## Privacy — why "zero network" is real, not a slogan

- **No `fetch`, no `XMLHttpRequest`, no WebSocket, no beacons.** Search the
  source: the only network-adjacent API used is `navigator.clipboard`
  (local) and `chrome.storage.local` (on-device).
- **Manifest requests only two permissions:**
  - `clipboardRead` — reads your clipboard *only* when you press the Paste button.
  - `storage` — remembers your last input *on this device* so a refresh doesn't lose work.
- **No `host_permissions`, no content scripts, no remote code.** There is
  physically nowhere for your data to go.
- No account, no analytics, no ads — now and forever. If a future version
  ever needs the network, it will ask first.

## Project structure

```
jsonlens/
├── manifest.json        # MV3 manifest, minimal permissions
├── popup.html           # Toolbar popup (launcher)
├── tab.html             # Full-page editor/viewer UI
├── icons/               # 16 / 48 / 128 px icons
├── src/
│   ├── app.js           # All logic: parse, render, search, copy
│   ├── popup.js         # Popup launcher
│   └── styles.css       # Theming (OS light/dark)
└── README.md
```

No build step, no dependencies. Open the files and read them — that's the point.

## Roadmap (Pro — planned)

The free version stays free and stays local. A future **Pro** tier
(target `$4.99/mo` or `$39` one-time) may add:

1. **Semantic JSON diff** — key-order-insensitive, nested-aware comparison
   (not line-based text diff).
2. **Huge file support** — streaming/virtualized rendering past the current
   ~500k character guard.
3. Pro themes and JSONPath query bar.

## License

TBD — all rights reserved for now.
