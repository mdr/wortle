import { Brand } from "effect"

export type ClassNameList = string & Brand.Brand<"ClassNameList">
export const ClassNameList = Brand.nominal<ClassNameList>()

export type ImageIndex = number & Brand.Brand<"ImageIndex">
export const ImageIndex = Brand.make<ImageIndex>(
  (n) => (Number.isInteger(n) && n >= 0) || `Invalid image index (must be non-negative integer): ${n}`,
)

export type Pixels = number & Brand.Brand<"Pixels">
export const Pixels = Brand.make<Pixels>(
  (n) => (Number.isInteger(n) && n > 0) || `Invalid pixel value (must be positive integer): ${n}`,
)
