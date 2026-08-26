# PlaywrightPageObject

Playwright Test automation suite for [SauceDemo](https://www.saucedemo.com), written in TypeScript using the Page Object Model pattern.

## Tech stack

- **Test runner**: `@playwright/test` (^1.62.1) — no wrapper (no Mocha/Jest/Cucumber).
- **Language**: TypeScript, ESM (`"type": "module"` in package.json). `tsconfig.json` targets ES2022 with `strict` mode, `moduleResolution: Bundler` (matches Playwright's own transpile-per-file behavior — no explicit `.js` extensions needed on relative imports).
- **Reporting**: built-in `html` reporter + `allure-playwright`.
- **Env vars**: loaded via `dotenv` in `global-setup.ts`.
- **Formatting**: `prettier` (^2.5.1) configured via `.prettierrc.json` (single quotes, semicolons, 100 print width, trailing commas). Run `npm run format` / `npm run format:check`.
- **Type checking**: `npm run typecheck` (`tsc --noEmit`).
- **Linting**: ESLint (flat config, `eslint.config.js`) — `@eslint/js` + `typescript-eslint` recommended rules, `eslint-plugin-playwright` recommended rules scoped to `tests/**/*.ts`, `eslint-config-prettier` to defer style to Prettier. Run `npm run lint` / `npm run lint:fix`.
- Not yet present: CI/CD (`.github/workflows`).

## Commands

```bash
npm test                              # runs npx playwright test --reporter=html,allure-playwright
npx playwright test <path>            # run a single spec file
npx playwright test -g "<title>"      # run tests matching a title
npx playwright show-report            # open the last HTML report
npx allure generate allure-results --clean -o allure-report && npx allure open allure-report
npm run typecheck                     # tsc --noEmit
npm run format / npm run format:check # prettier --write / --check
npm run lint / npm run lint:fix       # eslint . / eslint . --fix
```

Target app: `baseURL: https://www.saucedemo.com` (public demo site, no local dev server to boot).

Required `.env` (gitignored) variables: `USERNAME`, `PASSWORD`, `LOCKED_USER`.

## Directory layout

```
PageObjects/            Flat page object classes (BasePage.ts, LoginPage.ts, ProductsPage.ts, ...)
fixtures/test.ts         Single custom-fixtures file (test.extend) — instantiates POMs, exposes test data, re-exports `expect`
tests/
  <feature>-tests/       One folder per feature, e.g. login-tests/
    <Feature>Tests.spec.ts
  test-data/
    test-data.ts         Expected-value constants, <page>ExpectedData naming
manual-test-cases/       Manual test case CSVs (TestRail/Xray-style), one file per feature
global-setup.ts          Playwright globalSetup — loads dotenv
playwright.config.ts     testDir: ./tests, testIdAttribute: 'data-test', baseURL, chromium/firefox/webkit projects
.mcp.json                Playwright MCP server (browser automation for AI sub-agents)
eslint.config.js         ESLint flat config (typescript-eslint + eslint-plugin-playwright + prettier)
```

## Conventions

These are established by the existing code and enforced by the `playwright-test-authoring` skill (see below) — follow them for any new test.

## AI-assisted test generation

Three sub-agents implement the pipeline for growing coverage; they share the `playwright-test-authoring` skill for conventions and use the `playwright` MCP server for live browser access:

1. **`manual-test-case-writer`** — explores a feature on the live site and writes a manual test case CSV to `manual-test-cases/<feature>.csv`.
2. **`auto-test-writer`** — turns a CSV (or feature description) into POMs, fixtures, test-data, and a spec file per the conventions above, then runs the new tests and iterates until green.
3. **`test-failure-investigator`** — given a failing run, diagnoses whether it's a broken selector, a real app defect, flakiness, or an environment/config issue.

Typical flow: `manual-test-case-writer` → `auto-test-writer` → (on failure) `test-failure-investigator`.
