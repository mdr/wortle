import { CommonName, Family, ScientificName, SpeciesId, Url } from "@wortle/shared"
import { describe, expect, it } from "vitest"

import { dbSpeciesToSpecies, dbSpeciesToSpeciesData } from "./toSpecies"

describe("dbSpeciesToSpecies", () => {
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

  it("converts all fields from DbSpecies to Species", () => {
    expect(dbSpeciesToSpecies(dbSpecies)).toEqual({
      id: SpeciesId("2cd4p9h.test"),
      scientificName: ScientificName("Bellis perennis"),
      family: Family("Asteraceae"),
      commonName: CommonName("Daisy"),
      alternativeCommonNames: [CommonName("Common Daisy")],
      alternativeScientificNames: [ScientificName("Bellis hybrida")],
      links: [{ name: "Wikipedia", url: Url("https://en.wikipedia.org/wiki/Bellis_perennis") }],
      idTips: ["White petals", "Yellow center"],
    })
  })
})

describe("dbSpeciesToSpeciesData", () => {
  it("converts DbSpecies array to SpeciesData sorted by scientific name", () => {
    const dbSpecies = [
      {
        id: SpeciesId("2cd4p9h.z"),
        scientificName: ScientificName("Zinnia elegans"),
        family: Family("Asteraceae"),
        commonName: CommonName("Zinnia"),
        alternativeCommonNames: [],
        alternativeScientificNames: [],
        links: [],
        idTips: [],
      },
      {
        id: SpeciesId("2cd4p9h.a"),
        scientificName: ScientificName("Achillea millefolium"),
        family: Family("Asteraceae"),
        commonName: CommonName("Yarrow"),
        alternativeCommonNames: [],
        alternativeScientificNames: [],
        links: [],
        idTips: [],
      },
    ]

    const result = dbSpeciesToSpeciesData(dbSpecies)

    expect(result.species[0].scientificName).toBe("Achillea millefolium")
    expect(result.species[1].scientificName).toBe("Zinnia elegans")
  })
})
