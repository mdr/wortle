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
- When fixing bugs, write a failing test first, then fix the code to make it pass.
- Use React's `useId` hook for accessibility label associations (e.g., `htmlFor` and `id` pairs).

## Testing

This project uses two testing styles:

- **Unit tests** (`task test:unit`): Vitest tests for small functions, utilities, and larger pieces of logic like PuzzleService. These test code in isolation.
- **IWFTs** (`task test:iwft`): Isolated Whole Frontend Tests using Playwright component tests that render the entire `<App />`. These check whole user journeys without needing an independent environment.

## Task Commands

- `task install`: install dependencies.
- `task dev`: run the dev server.
- `task tsc`: type check.
- `task lint`: lint.
- `task format`: format code.
- `task format:check`: check formatting.
- `task test:unit`: run unit tests.
- `task test:iwft`: run isolated whole frontend tests (IWFTs).
- `task stryker`: run mutation testing.
- `task build`: build.
- `task analyze`: build with bundle analysis.
- `task knip`: unused code scan.
- `task check`: run all checks.
- `task infra:tsc`: type check infrastructure code.
- `task infra:preview`: preview infrastructure changes.
- `task infra:up`: apply infrastructure changes.

## R2 Bucket Operations

Use wrangler with 1Password credentials and `--remote` flag (wrangler defaults to local simulation otherwise):

```bash
nix develop -c op run --account=my.1password.com --env-file=.env.wrangler -- pnpm dlx wrangler r2 object put wortle-data/file.json --content-type "application/json" --remote --pipe < file.json
```
