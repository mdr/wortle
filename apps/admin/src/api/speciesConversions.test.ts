import { CommonName, Family, ScientificName, SpeciesId, Url } from "@wortle/shared"
import { describe, expect, it } from "vitest"

import { apiSpeciesToDbSpecies, dbSpeciesToApiSpecies } from "./speciesConversions"

describe("speciesConversions", () => {
  const dbSpecies = {
    id: SpeciesId("2cd4p9h.test"),
    scientificName: ScientificName("Bellis perennis"),
    family: Family("Asteraceae"),
    commonName: CommonName("Daisy"),
    alternativeCommonNames: [CommonName("Common Daisy")],
    alternativeScientificNames: [ScientificName("Bellis hybrida")],
    links: [{ name: "Wikipedia", url: Url("https://en.wikipedia.org/wiki/Bellis_perennis") }],
    idTips: ["White petals", "Yellow center"],
  }

  const apiSpecies = {
    id: SpeciesId("2cd4p9h.test"),
    scientificName: ScientificName("Bellis perennis"),
    family: Family("Asteraceae"),
    commonName: CommonName("Daisy"),
    alternativeCommonNames: [CommonName("Common Daisy")],
    alternativeScientificNames: [ScientificName("Bellis hybrida")],
    links: [{ name: "Wikipedia", url: Url("https://en.wikipedia.org/wiki/Bellis_perennis") }],
    idTips: ["White petals", "Yellow center"],
  }

  describe("dbSpeciesToApiSpecies", () => {
    it("converts all fields from DbSpecies to ApiSpecies", () => {
      expect(dbSpeciesToApiSpecies(dbSpecies)).toEqual(apiSpecies)
    })
  })

  describe("apiSpeciesToDbSpecies", () => {
    it("converts all fields from ApiSpecies to DbSpecies", () => {
      expect(apiSpeciesToDbSpecies(apiSpecies)).toEqual(dbSpecies)
    })
  })
})
