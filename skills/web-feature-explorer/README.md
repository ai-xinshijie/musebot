# web-feature-explorer

An agent skill that autonomously explores a web UI, discovers every feature, and generates functional use cases.

Built for AI coding agents — works with **Claude Code**, **Codex**, and any agent platform that supports the [Agent Skills](https://agentskills.io) open format (`SKILL.md`). The only runtime requirement is a shell and [Playwright](https://playwright.dev).

## What it does

1. **Discovers** routes (sitemap + crawl) and enumerates interactive elements on every page
2. **Explores** safely — clicks links/buttons, records page → action → page transitions (destructive actions like delete/pay/logout are never touched)
3. **Extracts features** with semantic names (not URL fragments)
4. **Generates use cases** in Gherkin style, each marked `✓ verified` (backed by an observed transition) or `⚠ UNVERIFIED` (inferred from page structure — run manually)

## Outputs

| File | Contents |
|---|---|
| `features.json` | Page inventory, semantic features, transition graph, skipped/blocked items |
| `use-cases.md` | Gherkin use cases with evidence sections and verification marks |
| `report.md` | Coverage stats, methodology notes, exceptions to safety rules |
| `shots/` | Screenshots of visited pages |

## Quick start

```sh
pip install playwright
playwright install chromium

python3 bin/explore.py --url https://example.com --mode discover \
  --max-pages 50 --output-dir ./out

# Chinese-language docs:
python3 bin/explore.py --url https://example.com --lang zh --output-dir ./out-zh
```

Modes: `discover` (read-only crawl) and `explore` (also performs safe clicks).
For logged-in exploration, save a Playwright storage state and pass `--auth-state auth.json`.
The script auto-detects proxy settings from `HTTPS_PROXY`/`https_proxy` env vars.

## Example

`demo-saucedemo/` holds a full run against [Swag Labs](https://www.saucedemo.com)
(the Sauce Labs demo store): 5 features, 14 transitions, 12 use cases —
in both English and Chinese.

## Safety rules

- Read-only by default; `explore` mode only clicks provably safe elements
- Never submits destructive actions (delete, payment, logout, …) — by link label *or* by click
- Respects `robots.txt`, rate-limits requests, stops on CAPTCHA/bot walls
- Never invents URLs, features, or expected results

## Layout

```
web-feature-explorer/
├── SKILL.md            # the skill: Purpose / Workflow / Output Contract / Operating Rules
├── bin/explore.py      # the Playwright explorer
├── references/         # coverage heuristics, use-case template
└── demo-saucedemo/     # example run (en + zh)
```

## License

MIT
