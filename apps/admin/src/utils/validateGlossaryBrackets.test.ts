import { describe, expect, it } from "vitest"

import { validateGlossaryBrackets } from "./validateGlossaryBrackets"

describe("validateGlossaryBrackets", () => {
  it("returns true for text without brackets", () => {
    expect(validateGlossaryBrackets("Plain text without any brackets")).toBe(true)
  })

  it("returns true for properly matched single bracket pair", () => {
    expect(validateGlossaryBrackets("Flower heads rounded with equal sized [[floret]]s")).toBe(true)
  })

  it("returns true for multiple properly matched bracket pairs", () => {
    expect(validateGlossaryBrackets("Has [[floret]]s and [[bract]]s")).toBe(true)
  })

  it("returns true for empty string", () => {
    expect(validateGlossaryBrackets("")).toBe(true)
  })

  it("returns true for adjacent bracket pairs", () => {
    expect(validateGlossaryBrackets("[[term1]][[term2]]")).toBe(true)
  })

  it("returns false for unmatched opening brackets", () => {
    expect(validateGlossaryBrackets("Has an [[unclosed term")).toBe(false)
  })

  it("returns false for unmatched closing brackets", () => {
    expect(validateGlossaryBrackets("Has an unopened term]]")).toBe(false)
  })

  it("returns false for reversed brackets", () => {
    expect(validateGlossaryBrackets("]]reversed[[")).toBe(false)
  })

  it("returns false for mismatched count - more opens", () => {
    expect(validateGlossaryBrackets("[[one]] and [[two")).toBe(false)
  })

  it("returns false for mismatched count - more closes", () => {
    expect(validateGlossaryBrackets("[[one]] and two]]")).toBe(false)
  })

  it("handles single brackets (not double) as regular text", () => {
    expect(validateGlossaryBrackets("Array[0] = value")).toBe(true)
  })

  it("handles mixed single and double brackets", () => {
    expect(validateGlossaryBrackets("Array[0] has [[term]]")).toBe(true)
  })

  it("returns false for [[ closed with single ]", () => {
    expect(validateGlossaryBrackets("[[foo]")).toBe(false)
  })

  it("returns false for single [ then ]]", () => {
    expect(validateGlossaryBrackets("[foo]]")).toBe(false)
  })

  it("returns true for [[foo] bar]] (single ] is just content)", () => {
    expect(validateGlossaryBrackets("[[foo] bar]]")).toBe(true)
  })

  it("returns false for nested brackets", () => {
    expect(validateGlossaryBrackets("[[foo [[bar]] baz]]")).toBe(false)
  })
})
