import { Brand } from "effect"

export { Url } from "@wortle/shared"

export type Iso8601Date = string & Brand.Brand<"Iso8601Date">
const iso8601DatePattern = /^\d{4}-\d{2}-\d{2}$/
export const Iso8601Date = Brand.refined<Iso8601Date>(
  (s): s is Iso8601Date => iso8601DatePattern.test(s),
  (s) => Brand.error(`Invalid ISO 8601 date: ${s}`),
)

export type Degrees = number & Brand.Brand<"Degrees">
export const Degrees = Brand.nominal<Degrees>()

export type ClassNameList = string & Brand.Brand<"ClassNameList">
export const ClassNameList = Brand.nominal<ClassNameList>()

export type ImageIndex = number & Brand.Brand<"ImageIndex">
export const ImageIndex = Brand.refined<ImageIndex>(
  (n): n is ImageIndex => Number.isInteger(n) && n >= 0,
  (n) => Brand.error(`Invalid image index (must be non-negative integer): ${n}`),
)

export type Pixels = number & Brand.Brand<"Pixels">
export const Pixels = Brand.refined<Pixels>(
  (n): n is Pixels => Number.isInteger(n) && n > 0,
  (n) => Brand.error(`Invalid pixel value (must be positive integer): ${n}`),
)
