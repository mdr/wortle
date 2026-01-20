import { describe, expect, it } from "vitest"

import { parseTipRegions } from "./TipWithGlossary"

describe("parseTipRegions", () => {
  it("returns plain text as a single text region", () => {
    expect(parseTipRegions("A simple tip")).toEqual([{ type: "text", text: "A simple tip" }])
  })

  it("parses a glossary term in the middle of text", () => {
    expect(parseTipRegions("Look at the [[floret]] closely")).toEqual([
      { type: "text", text: "Look at the " },
      { type: "glossary", term: "floret", displayText: "floret" },
      { type: "text", text: " closely" },
    ])
  })

  it("parses multiple glossary terms", () => {
    expect(parseTipRegions("Check the [[corolla]] and [[floret]]")).toEqual([
      { type: "text", text: "Check the " },
      { type: "glossary", term: "corolla", displayText: "corolla" },
      { type: "text", text: " and " },
      { type: "glossary", term: "floret", displayText: "floret" },
    ])
  })

  it("handles glossary term at the start", () => {
    expect(parseTipRegions("[[Floret]] is important")).toEqual([
      { type: "glossary", term: "floret", displayText: "Floret" },
      { type: "text", text: " is important" },
    ])
  })

  it("handles glossary term at the end", () => {
    expect(parseTipRegions("Look for the [[corolla]]")).toEqual([
      { type: "text", text: "Look for the " },
      { type: "glossary", term: "corolla", displayText: "corolla" },
    ])
  })

  it("preserves display text case while lowercasing term for lookup", () => {
    expect(parseTipRegions("The [[Floret]] here")).toEqual([
      { type: "text", text: "The " },
      { type: "glossary", term: "floret", displayText: "Floret" },
      { type: "text", text: " here" },
    ])
  })

  it("treats unknown terms as plain text", () => {
    expect(parseTipRegions("Look at the [[unknown]]")).toEqual([
      { type: "text", text: "Look at the " },
      { type: "text", text: "unknown" },
    ])
  })

  it("handles multi-word glossary terms", () => {
    expect(parseTipRegions("Notice the [[ray florets]]")).toEqual([
      { type: "text", text: "Notice the " },
      { type: "glossary", term: "ray florets", displayText: "ray florets" },
    ])
  })

  it("returns empty array for empty string", () => {
    expect(parseTipRegions("")).toEqual([])
  })

  it("handles only a glossary term", () => {
    expect(parseTipRegions("[[entire]]")).toEqual([{ type: "glossary", term: "entire", displayText: "entire" }])
  })
})
