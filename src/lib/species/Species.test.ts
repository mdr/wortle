import { describe, expect, it } from "vitest"

import { testSpecies } from "./testSpecies.testUtils"

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
