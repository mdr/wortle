# Wortle

Use `nix develop -c <command>` to run commands, e.g. `nix develop -c task check`.

Run `task check` to verify work before finishing (runs tsc, lint, format, and tests).

## Coding Standards

- Prefer `undefined` over `null` where possible.
- Name functions that may return `undefined` with a `find` prefix (e.g. `findPuzzle`).
- Prefer arrow function properties for class methods (e.g. `load = () => { ... }`).
- Prefer single expression body form for arrow functions with one-liner returns (e.g., `const fn = (x: string) => x.trim()` over `const fn = (x: string) => { return x.trim() }`).
- Prefer string enums with all caps (e.g. `enum Status { READY = "READY" }`).
- Use comments sparingly. Never comment the obvious (e.g. `@param userId - The user ID`). Only add comments to explain something that cannot be made clear from the code alone.
- Name test utility files with a `.testUtils.ts` suffix to flag them as non-production code.
- In tests, check full objects with `expect(obj).toEqual({...})` rather than individual properties.
- In tests, only specify values important for that test case; use test factory defaults for everything else.
- When fixing bugs, write a failing test first, then fix the code to make it pass.

## Task Commands

- `task install`: install dependencies.
- `task dev`: run the dev server.
- `task tsc`: type check.
- `task lint`: lint.
- `task format`: format code.
- `task format:check`: check formatting.
- `task test:unit`: run unit tests.
- `task test:ct`: run component tests.
- `task stryker`: run mutation testing.
- `task build`: build.
- `task analyze`: build with bundle analysis.
- `task knip`: unused code scan.
- `task check`: run all checks.
