# Wortle

A daily plant identification quiz. Each day features a different wild plant with photos and information. Players get up to 3 guesses to identify the plant.

## Architecture

- React/TypeScript frontend built with Vite
- Hosted on GitHub Pages (no backend)
- Images served from Cloudflare R2 (`images.wortle.app`)
- Infrastructure managed with Pulumi (`infra/`)

Use `nix develop -c <command>` to run commands, e.g. `nix develop -c task check`.

Run `task check` to verify work before finishing (runs tsc, lint, format, and tests).

## Coding Standards

- Prefer `undefined` over `null` where possible. Use `Option<T>` instead of `T | undefined` for type annotations.
- Name functions that may return `undefined` with a `find` prefix (e.g. `findPuzzle`).
- Prefer arrow function properties for class methods (e.g. `load = () => { ... }`).
- Prefer single expression body form for arrow functions with one-liner returns (e.g., `const fn = (x: string) => x.trim()` over `const fn = (x: string) => { return x.trim() }`).
- Prefer string enums with all caps (e.g. `enum Status { READY = "READY" }`).
- Use comments sparingly. Never comment the obvious (e.g. `@param userId - The user ID`). Only add comments to explain something that cannot be made clear from the code alone.
- Name test utility files with a `.testUtils.ts` suffix to flag them as non-production code.
- In tests, check full objects with `expect(obj).toEqual({...})` rather than individual properties.
- In tests, only specify values important for that test case; use test factory defaults for everything else.
- When fixing bugs, write a failing test first, then fix the code to make it pass.

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
