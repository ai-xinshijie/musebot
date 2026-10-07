---
name: "web-feature-explorer"
description: "Autonomously explore a web UI, discover every feature, and generate functional use cases. Use when asked to map a website's capabilities, build a feature inventory, or produce test cases from a live site. Produces features.json, use-cases.md and an exploration report."
---

# Web Feature Explorer

## Purpose
Drive a real browser over a target website, discover its routes and interactive
elements, build a page→action→page transition graph, cluster it into features,
and emit structured functional use cases. Portable: the skill assumes only a
shell and Playwright, no platform-specific browser tools.

## Tooling
- `bin/explore.py` — the explorer. Requires `pip install playwright` and
  `playwright install chromium` (once per machine).
- `--lang zh` generates `use-cases.md` and `report.md` in Chinese
  (default `en`).
- Outputs land in the chosen `--output-dir`:
  `features.json` (inventory), `use-cases.md` (Gherkin-style cases),
  `report.md` (coverage + skipped/blocked notes), `shots/` (screenshots).

## Workflow
1. **Scope the run.** Confirm with the user: start URL, login needed or not,
   `--mode discover` (read-only crawl) vs `--mode explore` (also performs
   safe clicks), `--max-pages`, `--max-depth`. Default to `discover`.
2. **Run the explorer.**
   ```sh
   python3 bin/explore.py --url https://example.com --mode discover \
     --max-pages 50 --output-dir ./out-example
   ```
   For logged-in exploration, first save a Playwright storage state manually,
   then pass `--auth-state auth.json`.
3. **Review `report.md`.** Check coverage stats and anything skipped or
   blocked (CAPTCHA, login walls, destructive actions).
4. **Refine.** Re-run interesting subtrees with a deeper `--max-depth`, or
   hand the agent `features.json` to expand use cases for one feature in
   `use-cases.md`.

## Output Contract
- `features.json`: `pages[]` (url, title, h1, interactive element counts),
  `features[]` (semantic `name` + `name_en`, entry urls, inputs, actions),
  `transitions[]` (from → action → to).
- `use-cases.md`: one section per feature, each with a happy-path case plus
  edge cases derived from actually observed forms (required fields,
  text inputs). Every case carries a `✓ verified` /
  `⚠ UNVERIFIED` mark: only steps backed by an observed transition count as
  verified; inferred edge cases must be executed manually.
- `report.md`: what was visited, coverage numbers, what was deliberately not
  touched and why.

## Operating Rules
1. Default to `--mode discover`. Switch to `explore` only when the user asked
   for interaction or the site's value is behind clicks.
2. Never submit destructive actions: delete/remove, payment/checkout, account
   closure, logout. The script skips these by pattern; if a feature needs one
   covered, write the use case by hand and mark it `manual`.
3. Respect `robots.txt` unless the user explicitly overrides for their own
   site. Keep `--delay-ms` ≥ 500 on sites you don't own.
4. Stop and report on CAPTCHA, bot walls, or login gates — do not try to
   bypass them.
5. Do not invent URLs, features, or expected results. Everything in
   `features.json` must come from an actually visited page.
6. Keep SKILL.md short; deeper heuristics live in `references/coverage.md`.
