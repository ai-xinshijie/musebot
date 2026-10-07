# Exploration report — https://www.saucedemo.com

- Date: 2026-10-07
- Format: v2 (semantic feature names, evidence sections, ✓ verified / ⚠ UNVERIFIED marks)
- Mode: explore (executed via the agent's own browser; see Methodology)
- Pages visited: 7 (limit was ~15; the site's core flows fit in 7)
- Features identified: 5
- Transitions observed: 14
- Actions deliberately skipped: 3
- Pages blocked: 0 (no CAPTCHA, no login wall beyond the demo login itself)

## What was covered

Full user journey on this demo store: login (valid + invalid credentials),
product catalog with 4 sort orders, product detail pages, add/remove cart,
cart review, and the complete checkout flow (information form with required
fields, order overview with totals $45.98 + $3.68 tax = $49.66, thank-you
page). Global chrome mapped: hamburger menu items and footer links.

## Methodology note

`bin/explore.py` (Playwright) could not reach the public web from this
sandbox: the sandbox's egress proxy rejects Chromium's TLS handshake
(`ERR_TUNNEL_CONNECTION_FAILED`; plain curl works fine). This run therefore
executed the skill's documented workflow (SKILL.md: scope → explore →
review → emit) through the agent's managed browser instead, with the same
output contract. On a machine with direct internet access (the skill's
intended target: Codex / Claude Code environments), `explore.py` runs
unmodified — it was verified end-to-end against a local test site.

## Exceptions to the skill's default rules

- Checkout was walked end-to-end. The skill normally treats checkout as
  destructive and skips it; Swag Labs is a demo store whose checkout is fake
  (no real payment, no real order), so the full flow was exercised and the
  deviation is recorded here.
- Logout and Reset App State were NOT clicked, per the skill's safety rules;
  they are covered as manual cases (UC-05-2).
- The About link (external marketing site saucelabs.com) was recorded by href
  only, not explored.

## Termination criterion

Natural exhaustion: all reachable in-scope flows were visited; the only
unvisited in-scope items were the deliberately skipped destructive actions.
