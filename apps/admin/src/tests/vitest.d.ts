import "vitest"
import "jest-extended"

declare module "vitest" {
  // eslint-disable-next-line @typescript-eslint/no-empty-object-type, @typescript-eslint/no-unused-vars
  interface Assertion<R, T> extends CustomMatchers<R> {}
}
