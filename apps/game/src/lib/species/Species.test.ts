import { ScientificName, SpeciesId } from "@wortle/shared"
import { describe, expect, it } from "vitest"

import { filterSpecies } from "./Species"
import { createTestSpecies } from "./Species.testUtils"
import { testSpecies } from "./testSpecies.testUtils"

describe("filterSpecies", () => {
  const speciesWithAltScientificName = createTestSpecies({
    id: SpeciesId("test.1"),
    scientificName: ScientificName("Bellis perennis"),
    alternativeScientificNames: [ScientificName("Bellis hybrida")],
  })

  const otherSpecies = createTestSpecies({
    id: SpeciesId("test.2"),
    scientificName: ScientificName("Taraxacum officinale"),
  })

  const allSpecies = [speciesWithAltScientificName, otherSpecies]

  it("matches on primary scientific name", () => {
    const result = filterSpecies(allSpecies, "perennis")

    expect(result).toEqual([speciesWithAltScientificName])
  })

  it("matches on alternative scientific name", () => {
    const result = filterSpecies(allSpecies, "hybrida")

    expect(result).toEqual([speciesWithAltScientificName])
  })

  it("does not match unrelated queries", () => {
    const result = filterSpecies(allSpecies, "rosa")

    expect(result).toEqual([])
  })
})

describe("species data consistency", () => {
  it("species IDs match their Plant Atlas URL taxon IDs", () => {
    const plantAtlasUrlPrefix = "https://plantatlas2020.org/atlas/"

    for (const species of testSpecies) {
      const plantAtlasLink = species.links.find((link) => link.url.startsWith(plantAtlasUrlPrefix))
      if (plantAtlasLink) {
        const urlTaxonId = plantAtlasLink.url.slice(plantAtlasUrlPrefix.length)
        expect(
          species.id,
          `${species.scientificName}: ID "${species.id}" should match Plant Atlas URL taxon "${urlTaxonId}"`,
        ).toBe(urlTaxonId)
      }
    }
  })
})
