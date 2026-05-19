# Sauce Demo — Playwright Test Suite

Automated end-to-end test suite for [saucedemo.com](https://www.saucedemo.com) using Playwright and TypeScript.

---

## Setup

```bash
npm install
npx playwright install chromium
```

---

## Run Commands

| Command | What it runs |
|---|---|
| `npm test` | All tests |
| `npm run test:smoke` | Smoke (happy path) tests only |
| `npm run test:edge` | Edge case tests only |
| `npm run test:visual` | Visual regression tests only |
| `npm run report` | Open the HTML report |

**With browser visible:**
```bash
SLOWMO=1000 npx playwright test tests/smoke/ --headed
```

**Single user across smoke and edge cases:**
```bash
npx playwright test tests/smoke/ tests/edge-cases/ -g "error_user"
```

---

## Project Structure

```
src/
  data/
    test-data.ts        ← Credentials, URLs, products, expected messages
  fixtures/
    base.fixture.ts     ← Single import point for test and expect
  pages/
    LoginPage.ts
    InventoryPage.ts
    CartPage.ts
    CheckoutStepOnePage.ts
    CheckoutStepTwoPage.ts
    CheckoutCompletePage.ts
    index.ts            ← Barrel export for all pages

tests/
  smoke/
    happy-path.spec.ts  ← Full 13-step purchase flow for all functional users
  edge-cases/
    edge-cases.spec.ts  ← Login failures, form validation, cart ops, access control
  visual/
    baseline.spec.ts    ← Captures standard_user UI as reference snapshots
    regression.spec.ts  ← Compares visual_user against those snapshots
    snapshots/          ← Baseline PNG files (committed to source control)
```

---

## Test Accounts

| Username | Password | Result |
|---|---|---|
| standard_user | secret_sauce | ✅ All 13 steps pass |
| problem_user | secret_sauce | ❌ Fails at checkout step 2 |
| performance_glitch_user | secret_sauce | ❌ Exceeds 3 s login SLA |
| error_user | secret_sauce | ❌ Fails at order finish |
| visual_user | secret_sauce | Detected by visual regression — not in happy path |
| locked_out_user | secret_sauce | ❌ Blocked at login (edge cases only) |

---

## Test Coverage

### Smoke — 4 tests

Full 13-step purchase flow for every account that can functionally complete a purchase:

> login → verify products → add to cart → verify badge → open cart → checkout → fill form → order overview → finish → success message → logout

`standard_user` passes all steps. `problem_user`, `performance_glitch_user`, and `error_user` fail at their known broken step — failures in the report are intentional and demonstrate the test suite detecting real defects.

### Edge Cases — 14 tests

| Category | Tests |
|---|---|
| Login failures | Invalid credentials, locked out, empty username, empty password |
| Checkout form validation | Missing first name, last name, postal code |
| Cart operations | Multi-item badge count, remove from cart page, remove from inventory |
| Restricted access | Direct URL to inventory, cart, and checkout without login |
| Performance | Glitch user login succeeds with extended timeout |

### Visual Regression — 4 tests

Catches UI bugs that functional assertions miss: wrong product images, CSS layout shifts, misaligned elements.

| File | Purpose |
|---|---|
| `baseline.spec.ts` | Logs in as standard_user and saves screenshots as the known-correct reference |
| `regression.spec.ts` | Logs in as visual_user and compares against the baseline — pixel differences fail |

**Initialize baselines** (run once, then commit the PNG files):
```bash
npx playwright test tests/visual/baseline.spec.ts --update-snapshots
```

**Run regression** (detects visual_user UI bugs):
```bash
npm run test:visual
```

**Update baselines** after an intentional UI change — run baseline only, never regression:
```bash
npx playwright test tests/visual/baseline.spec.ts --update-snapshots
```

---

## Reporting

Screenshots, video, and trace are captured automatically on failure.

```bash
npm run report
```
