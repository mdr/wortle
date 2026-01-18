import { describe, expect, it } from "vitest"

import { TestSpeciesIds } from "@/lib/testConstants.testUtils"

import { filterSpecies, getGenus } from "./Species"
import { createTestSpecies } from "./Species.testUtils"

describe("getGenus", () => {
  it("extracts genus from two-part scientific name", () => {
    expect(getGenus("Bellis perennis")).toBe("Bellis")
  })

  it("extracts genus from three-part scientific name", () => {
    expect(getGenus("Rubus fruticosus agg.")).toBe("Rubus")
  })

  it("returns the whole string when no space present", () => {
    expect(getGenus("Bellis")).toBe("Bellis")
  })
})

describe("filterSpecies", () => {
  const daisy = createTestSpecies({
    id: TestSpeciesIds.daisy,
    scientificName: "Bellis perennis",
    commonName: "Daisy",
  })

  const plantWithAltName = createTestSpecies({
    id: TestSpeciesIds.feverfew,
    commonName: "Primary Name",
    alternativeCommonNames: ["Alternate Name"],
  })

  const allSpecies = [daisy, plantWithAltName]

  it("matches common name case-insensitively", () => {
    expect(filterSpecies(allSpecies, "daisy")).toEqual([daisy])
    expect(filterSpecies(allSpecies, "DAISY")).toEqual([daisy])
  })

  it("matches scientific name", () => {
    expect(filterSpecies(allSpecies, "bellis")).toEqual([daisy])
  })

  it("matches alternative common names", () => {
    expect(filterSpecies(allSpecies, "alternate")).toEqual([plantWithAltName])
  })

  it("matches partial strings", () => {
    expect(filterSpecies(allSpecies, "ais")).toEqual([daisy])
  })

  it("excludes species by id", () => {
    expect(filterSpecies(allSpecies, "a", [daisy.id])).toEqual([plantWithAltName])
  })

  it("returns empty array when no matches", () => {
    expect(filterSpecies(allSpecies, "xyz")).toEqual([])
  })

  it("returns all matches when multiple species match", () => {
    expect(filterSpecies(allSpecies, "a")).toIncludeSameMembers([daisy, plantWithAltName])
  })
})
