# Use-case template

`bin/explore.py` generates `use-cases.md` from this shape. When writing or
expanding cases by hand, follow the same shape so output stays uniform.
`--lang zh` switches all generated prose to Chinese; Gherkin keywords
(Given/When/Then) stay in English in both languages.

## Case header

```markdown
## UC-03: checkout ✓ verified

**Entries:** https://shop.example.com/cart

**Evidence (observed during exploration):**
- click button 'Checkout'
```

- ID: `UC-<feature number>`; sub-cases `UC-03-1`, `UC-03-2`, …
- Name: semantic feature name, never a URL fragment. The script derives it
  from keyword matching on h1/title/URL, then most-common h1, then the URL
  path with the extension stripped.
- Every case ends with a verification mark: `✓ verified` (backed by an
  observed transition) or `⚠ UNVERIFIED` (inferred, must be run manually).

## Happy path (always first)

```gherkin
Feature: checkout
  Scenario: user completes the checkout flow
    Given the user is on https://shop.example.com/cart with items in the cart
    When the user fills shipping address with valid data
    And submits the form
    Then the order confirmation page appears
    And no error message is shown
```

## Edge cases (pick the ones that apply)

- **UC-x-2 Missing required input** — submit with a required field empty;
  expect a validation message naming the field, form not submitted.
- **UC-x-3 Invalid input** — malformed email/phone/card; expect a message
  explaining the expected format.
- **UC-x-4 Unauthorized** — logged-out user hits a protected entry; expect
  redirect to login, and return to the entry after login.
- **UC-x-5 Empty state** — e.g. empty cart, no search results; expect a clear
  empty-state message, not a blank page or crash.

## Rules

- Steps must be executable by a human or a browser agent — no "the system
  magically knows".
- One observable outcome per `Then`. No compound assertions.
- Cases that need destructive actions (real payment, real deletion) are
  marked `manual` and never auto-run.
- Expected results describe behavior, never implementation ("shows error
  near the field", not "raises ValidationError").
- Never invent an edge case the page doesn't support: "invalid email" only
  appears when a text/email input was actually observed, and it is marked
  UNVERIFIED unless the invalid submission was really executed.
