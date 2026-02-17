# Wortle

A daily plant identification quiz. Each day features a different wild plant with photos and information. Players get up to 3 guesses to identify the plant.

## Architecture

- React/TypeScript frontend built with Vite
- Hosted on GitHub Pages (no backend)
- Images served from Cloudflare R2 (`images.wortle.app`)
- Infrastructure managed with Pulumi (`infra/`)

All CLI commands (`pnpm`, `task`, `npx`, etc.) must be run in the nix environment via `nix develop -c <command>`, e.g. `nix develop -c task check` or `nix develop -c pnpm add some-package`.

Run `task check` to verify work before finishing (runs tsc, lint, format, and tests). When only changing code in a single package (e.g., `apps/admin`), run targeted checks instead (e.g., `task admin:check`) since IWFTs are slow. Always run `task format` first to avoid wasting time on checks that fail due to formatting.

## Coding Standards

- Prefer `undefined` over `null` where possible. Use `Option<T>` instead of `T | undefined` for type annotations.
- Name functions that may return `undefined` with a `find` prefix (e.g. `findPuzzle`).
- Prefer arrow function properties for class methods (e.g. `load = () => { ... }`).
- Prefer single expression body form for arrow functions with one-liner returns (e.g., `const fn = (x: string) => x.trim()` over `const fn = (x: string) => { return x.trim() }`).
- Use string enums instead of union types for finite sets of values (e.g. `enum Status { READY = "READY" }` not `type Status = "READY" | "PENDING"`).
- Use comments sparingly. Never comment the obvious (e.g. `@param userId - The user ID`). Only add comments to explain something that cannot be made clear from the code alone.
- Name test utility files with a `.testUtils.ts` suffix to flag them as non-production code.
- In tests, check full objects with `expect(obj).toEqual({...})` rather than individual properties.
- In tests, only specify values important for that test case; use test factory defaults for everything else.
- In tests, when a test is about the absence or presence of a field, explicitly set it (e.g., `makeImage({ stagingKey: undefined })`) rather than relying on the factory default.
- In tests, store factory results and reference their properties (e.g., `const puzzle = makeDbPuzzle(); ... puzzle.id`) rather than using test constants directly. Minimise implicit knowledge required for a test to make sense.
- In tests, assert only what the test is about. If the test is "strips stagingKey", assert that `stagingKey` is undefined — don't assert the full object shape.
- When fixing bugs, write a failing test first, then fix the code to make it pass.
- Use React's `useId` hook for accessibility label associations (e.g., `htmlFor` and `id` pairs).
- Avoid indexed access types (e.g. `Foo["bar"]`). Export and use explicit named types instead.
- Use `camelCase.dotSeparated` log codes in `serverLogger` calls (e.g. `"puzzle.created"`, `"publishImages.sync"`).

## Testing

This project uses two testing styles:

- **Unit tests** (`task test:unit`): Vitest tests for small functions, utilities, and larger pieces of logic like PuzzleService. These test code in isolation.
- **IWFTs** (`task test:iwft`): Isolated Whole Frontend Tests using Playwright component tests that render the entire `<App />`. These check whole user journeys without needing an independent environment.

## Task Commands

### Top-level

- `task check`: run all checks (tsc, lint, format, tests).
- `task format`: format code with Prettier.
- `task format:check`: check code formatting.
- `task install`: install dependencies.
- `task secrets`: scan for secrets with gitleaks.
- `task security`: run trivy security scan.
- `task sherif`: check monorepo dependency consistency.
- `task update-screenshots` (alias `us`): trigger GitHub Actions workflow to update snapshots.

### Game (`apps/game`)

- `task game:dev`: start game development server.
- `task game:build`: build game.
- `task game:check`: run all checks for game (tsc, lint, format, tests).
- `task game:tsc`: type check game.
- `task game:lint`: run ESLint on game.
- `task game:format`: format game files.
- `task game:format:check`: check formatting of game files.
- `task game:test:unit`: run unit tests.
- `task game:test:iwft`: run isolated whole frontend tests.
- `task game:test:iwft:install`: install Playwright browsers.
- `task game:test:iwft:ui`: run IWFTs with UI.
- `task game:stryker`: run mutation testing with Stryker.
- `task game:knip`: find unused code.
- `task game:knip:prod`: find unused code (production only, ignores test usage).
- `task game:analyze`: build and analyze bundle size.
- `task game:ngrok`: expose local dev server via ngrok.
- `task game:coverage`: run all tests with coverage and merge reports.
- `task game:coverage:unit`: run unit tests with coverage.
- `task game:coverage:iwft`: run IWFTs with coverage.
- `task game:coverage:merge`: merge unit and IWFT coverage reports.

### Admin (`apps/admin`)

- `task admin:dev`: start admin development server.
- `task admin:build`: build admin.
- `task admin:check`: run all checks for admin (tsc, lint, format, test).
- `task admin:tsc`: type check admin.
- `task admin:lint`: run ESLint on admin.
- `task admin:format`: format admin files.
- `task admin:format:check`: check formatting of admin files.
- `task admin:test`: run admin unit tests.
- `task admin:copy-originals`: copy originals from prod to dev R2 bucket.
- `task admin:db:generate`: generate a new migration from schema changes.
- `task admin:db:migrate:dev`: run migrations on dev database.
- `task admin:db:migrate:prod`: run migrations on prod database.
- `task admin:db:seed-puzzles:dev`: seed puzzle data to dev database from data.wortle.app.
- `task admin:db:seed-puzzles:prod`: seed puzzle data to prod database from data.wortle.app.
- `task admin:db:seed-species:dev`: seed species data to dev database from data.wortle.app.
- `task admin:db:seed-species:prod`: seed species data to prod database from data.wortle.app.

### Infrastructure (`infra/`)

- `task infra:check`: run all checks for infra (tsc, lint, format).
- `task infra:tsc`: type check infrastructure code.
- `task infra:lint`: run ESLint on infrastructure code.
- `task infra:format`: format infra files.
- `task infra:format:check`: check formatting of infra files.
- `task infra:preview`: preview infrastructure changes.
- `task infra:up`: apply infrastructure changes.

### Shared (`packages/shared`)

- `task shared:check`: run all checks for shared package (tsc, lint, format).
- `task shared:tsc`: type check shared package.
- `task shared:lint`: run ESLint on shared package.
- `task shared:format`: format shared package files.
- `task shared:format:check`: check formatting of shared package files.

### UI (`packages/ui`)

- `task ui:check`: run all checks for UI package (tsc, lint, format).
- `task ui:tsc`: type check UI package.
- `task ui:lint`: run ESLint on UI package.
- `task ui:format`: format UI package files.
- `task ui:format:check`: check formatting of UI package files.

## Database Migrations

Drizzle-kit only runs SQL files listed in `apps/admin/drizzle/meta/_journal.json`. When adding a new migration:

1. Create the SQL file in `apps/admin/drizzle/` (e.g. `0004_add_foo.sql`)
2. Add a corresponding entry to `_journal.json` with the next `idx` and matching `tag` (filename without `.sql`)
3. Run `task admin:db:migrate:dev` to apply

If you forget step 2, `drizzle-kit migrate` will silently succeed without running the new file.

## Infrastructure Caveats

**Pulumi/Vercel env var replacement bug**: When updating a Vercel `ProjectEnvironmentVariable` secret value, `pulumi up` may fail with `ENV_CONFLICT`. The provider attempts create-before-delete, which fails because the variable already exists. Workaround: manually delete the env var in Vercel UI before running `pulumi up`.

**Turbo env passthrough**: Turbo only exposes env vars listed in `turbo.json` `env` array to build tasks. When adding a new server env var to `apps/admin/src/env.ts`, also add it to `turbo.json` — otherwise the Vercel build will fail with `Invalid environment variables` even though the var is set in the Vercel project.

## R2 Bucket Operations

Use wrangler with 1Password credentials and `--remote` flag (wrangler defaults to local simulation otherwise):

```bash
nix develop -c op run --account=my.1password.com --env-file=.env.wrangler -- pnpm dlx wrangler r2 object put wortle-data/file.json --content-type "application/json" --remote --pipe < file.json
```
