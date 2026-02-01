import { Brand } from "effect"

export { Degrees, isIso8601Date, Iso8601Date, Url } from "@wortle/shared"

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
