# Coverage heuristics

How to judge whether an exploration run was "complete enough", and how to
improve the next run. Read this when `report.md` shows low numbers or the
user asks how thorough the exploration was.

## Page identity (deduplication)

`normalize_url` in `bin/explore.py` defines when two URLs are the same page:

- Fragment (`#...`) is dropped — same page.
- Tracking/session query params (`utm_*`, `gclid`, `fbclid`, `sid`, …) are
  dropped; other params are kept and sorted.
- Trailing slash normalized; host lowercased.

If a site puts real state in the query string (e.g. `?tab=settings`), that
page is intentionally kept distinct. If a site puts session IDs in the path
(`/s/abc123/cart`), add a `--strip-path` rule of your own — the script does
not guess those.

## Coverage metrics (in `report.md`)

| Metric | Healthy | Fix when low |
|---|---|---|
| pages visited vs `--max-pages` | hit the limit, or queue emptied naturally | raise `--max-pages` / `--max-depth` |
| features identified | ≥ 3 on a real product site | check sitemap seeds, login state |
| transitions observed (explore mode) | grows with clicks | more `--max-clicks-per-page`, or the site is JS-heavy (SPA) |
| blocked pages | 0 ideally | CAPTCHA/login wall → stop, ask user |
| skipped actions | only destructive ones | tune `DANGEROUS_PATTERNS` if legit flows are skipped |

## Improving a thin run

1. **SPA / JS-heavy site:** raise `--max-depth` and `--max-clicks-per-page`;
   the crawler only learns routes it can reach by clicking.
2. **Login wall:** save a Playwright storage state by hand once, rerun with
   `--auth-state`. Never automate credential entry inside the skill.
3. **Missed subtrees:** rerun with `--url <deep-link>` pointing at the
   missed section and merge the two `features.json` files by hand.
4. **Pagination / infinite scroll:** out of scope for the script — note it in
   `report.md` and cover it with a hand-written use case.

## Feature naming

`extract_features` names features semantically, not by URL:

1. Keyword match against `h1 + title + url` (login→authentication,
   cart→shopping cart, checkout/payment→checkout, …) — see
   `FEATURE_KEYWORDS` in `bin/explore.py`; extend it for new domains.
2. Most common `h1` among the group's pages.
3. URL path segment with the extension stripped (`/about.html` → "about").

If names come out wrong (e.g. every page's h1 is a product name), the
grouping is too coarse — check whether the path-prefix clustering needs a
finer rule for that site, and note it in `report.md`.

## Termination criteria

A run is done when any of these holds:

- The crawl queue is empty (natural exhaustion).
- `--max-pages` is reached.
- Two consecutive runs with deeper settings add no new features.

Report which criterion stopped the run in `report.md` so the next person
knows whether "complete" means "exhausted" or "budget-limited".
