import { ScientificName, TaxonId } from "@wortle/shared"
import { describe, expect, it } from "vitest"

import { filterTaxa } from "./Taxon"
import { createTestTaxon } from "./Taxon.testUtils"
import { testTaxa } from "./testTaxa.testUtils"

describe("filterTaxa", () => {
  const taxonWithAltScientificName = createTestTaxon({
    id: TaxonId("test.1"),
    scientificName: ScientificName("Bellis perennis"),
    alternativeScientificNames: [ScientificName("Bellis hybrida")],
  })

  const otherTaxon = createTestTaxon({
    id: TaxonId("test.2"),
    scientificName: ScientificName("Taraxacum officinale"),
  })

  const allTaxa = [taxonWithAltScientificName, otherTaxon]

  it("matches on primary scientific name", () => {
    const result = filterTaxa(allTaxa, "perennis")

    expect(result).toEqual([taxonWithAltScientificName])
  })

  it("matches on alternative scientific name", () => {
    const result = filterTaxa(allTaxa, "hybrida")

    expect(result).toEqual([taxonWithAltScientificName])
  })

  it("does not match unrelated queries", () => {
    const result = filterTaxa(allTaxa, "rosa")

    expect(result).toEqual([])
  })
})

describe("taxa data consistency", () => {
  it("taxon IDs match their Plant Atlas URL taxon IDs", () => {
    const plantAtlasUrlPrefix = "https://plantatlas2020.org/atlas/"

    for (const taxon of testTaxa) {
      const plantAtlasLink = taxon.links.find((link) => link.url.startsWith(plantAtlasUrlPrefix))
      if (plantAtlasLink) {
        const urlTaxonId = plantAtlasLink.url.slice(plantAtlasUrlPrefix.length)
        expect(
          taxon.id,
          `${taxon.scientificName}: ID "${taxon.id}" should match Plant Atlas URL taxon "${urlTaxonId}"`,
        ).toBe(urlTaxonId)
      }
    }
  })
})
