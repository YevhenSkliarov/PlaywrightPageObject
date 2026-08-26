---
name: playwright-test-authoring
description: Use when writing or modifying Playwright tests, page objects, fixtures, or selectors in this repo (PlaywrightPageObject). Covers the project's selector strategy, POM shape, fixture wiring, and spec conventions so generated tests match the existing style. Trigger on requests like "add a test for X", "automate this test case", "create a page object for Y", "add a fixture for Z".
---

# Playwright test authoring (PlaywrightPageObject conventions)

This repo has a small, consistent style. Follow it exactly rather than introducing new patterns — read `PageObjects/LoginPage.ts`, `fixtures/test.ts`, and `tests/login-tests/LoginTests.spec.ts` as the reference implementation if anything below is ambiguous.

## 1. Selector strategy

For every element, check the live DOM (via the `playwright` MCP browser tools — `browser_navigate`, `browser_snapshot`) and pick the **first** of these that applies, in order. Don't skip ahead to a later option just because it's more familiar — always check higher-priority options first.

1. `page.getByTestId('kebab-case-id')` — config remaps `testIdAttribute` to `data-test`, so this targets the app's real `data-test` attribute. Test-id strings are kebab-case and should read as the element's purpose (`'checkout-button'`, not `'btn1'`).
2. `page.getByRole(role, { name: '...' })` — use the element's accessible role and accessible name from the snapshot (e.g. `getByRole('button', { name: 'Submit' })`).
3. `page.getByText('...')` — for elements identified by visible, stable text content (not role-based, e.g. a plain `<span>` or `<div>`).
4. `page.getByLabel('...')` — for form inputs with an associated `<label>`.
5. `page.getByPlaceholder('...')` — for inputs identified only by placeholder text.
6. **Last resort**: CSS or XPath via `page.locator('css-selector')` / `page.locator('xpath=//...')` — only when none of the above five apply to the element (e.g. no test id, no meaningful role/name, no stable text, no label, no placeholder). When you use this, flag it explicitly in your output as a gap — the element would benefit from a `data-test` attribute (or better semantics) — rather than treating the CSS/XPath locator as a permanent, first-class choice.

Never guess any of these — confirm against the real DOM/snapshot before writing the locator.

## 2. Page Objects (`PageObjects/`)

Template, mirroring `PageObjects/LoginPage.ts`:

```ts
import { Page, Locator } from '@playwright/test';
import BasePage from './BasePage';

export class SomePage extends BasePage {
  someField: Locator;
  submitButton: Locator;

  constructor(protected readonly page: Page) {
    super(page);
    this.someField = this.page.getByTestId('some-field');
    this.submitButton = this.page.getByTestId('submit-button');
  }

  async submit(data: SomeData) {
    await this.someField.fill(data.value);
    await this.submitButton.click();
  }
}
```

Rules:

- `BasePage` stays the default export; every concrete page is a **named export** `extends BasePage`.
- Declare every `Locator` as a public class field, assign all of them in the constructor. Don't resolve locators lazily inside methods.
- One file per page, `PascalCase.ts`, filename matches the class name, flat in `PageObjects/` (no subfolders, no `.page.ts` suffix).
- Action methods are `async`, take a typed domain object as the parameter when the action involves more than one field (see `User` in `LoginPage.ts`), and live on the page class itself.
- Only add a navigation method (`open()`-style) if the page is a real entry point; otherwise pages are reached via another page's action, matching how `ProductsPage` has no `open()`.

## 3. Fixtures (`fixtures/test.ts`)

This is a **single file** — do not create per-feature fixture files or instantiate POMs inline in test files.

To add a new page:

1. Add its type to the `App` type map: `somePage: SomePage;`
2. Add a property to `base.extend<App>({...})`:
   ```ts
   somePage: async ({ page }, use) => {
     use(new SomePage(page));
   },
   ```
3. If the page is an entry point reached by direct navigation (like `loginPage`), call `await page.open()` (or equivalent) before `use(...)`. If it's reached via another page's flow, construct it without navigating (like `productsPage`).

To add new test data:

- If it needs env vars or fixture composition (like `users`), add it as a fixture the same way, sourced from `process.env`.
- If it's a static expected-value string/object with no runtime dependency, it does **not** belong here — put it in `tests/test-data/test-data.ts` instead (see below).

Never import `expect` from `@playwright/test` directly in a spec — `fixtures/test.ts` re-exports it, and specs must import both `test` and `expect` from there.

## 4. Test data (`tests/test-data/test-data.ts` or a per-feature equivalent)

- Naming: `<page>ExpectedData` objects, keyed by field, e.g. `loginPageExpectedData.lockedUserError`.
- Never inline expected strings directly in assertions inside a spec file — extract them here first.
- Test data shouldn't be hardcoded in the fixture — if it needs to be dynamic, put it in a fixture and reference it from the test data object.

## 5. Specs (`tests/<feature>-tests/<Feature>Tests.spec.ts`)

Template, mirroring `tests/login-tests/LoginTests.spec.ts`:

```ts
import { expect, test } from '../../fixtures/test';
import { somePageExpectedData } from '../test-data/test-data';

test.describe('Some Feature', () => {
  test('Descriptive scenario title', async ({ somePage }) => {
    await somePage.submit(validData);
    await expect(somePage.confirmation).toHaveText(somePageExpectedData.confirmationText);
  });
});
```
- Every test should be ended with a single assertion that verifies the expected outcome of the scenario.

Rules:

- `test.describe('<Feature Name>', ...)` — a real, human-readable feature name. Never leave it as a generic placeholder like `'test'`.
- Test titles are plain-English sentences describing the scenario, Title Case first word.
- Assertions are always web-first (`expect(locator).toHaveText/toBeVisible/...`), never `expect(await locator.textContent())`.
- Folder: `kebab-case` under `tests/` (e.g. `checkout-tests/`). File: `PascalCase` + `Tests.spec.ts`.
- Group multiple related scenarios for a feature into one spec file (this repo groups by feature, not one file per test case).
- Every test should be ended with a single assertion that verifies the expected outcome of the scenario.

## 6. Done checklist

Before declaring a generated/updated test finished, verify:

- [ ] Every locator follows the priority order (testId → role → text → label → placeholder → CSS/XPath) — nothing lower in the list is used where something higher would have worked.
- [ ] Any CSS/XPath locator present is flagged as a gap, not left unremarked.
- [ ] Every locator was confirmed against the real DOM/snapshot (via MCP browser tools), not guessed.
- [ ] New POM follows the `BasePage`/named-export/constructor-locators shape.
- [ ] No POM instantiated ad hoc in a spec — it's wired through `fixtures/test.ts`.
- [ ] No hardcoded expected strings in the spec — they're in a `*ExpectedData` object.
- [ ] `test.describe` has a real feature name.
- [ ] File/folder names match the established naming convention.
- [ ] `npx playwright test <new spec>` passes.
