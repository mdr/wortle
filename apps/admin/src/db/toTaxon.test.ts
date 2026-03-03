import { CommonName, Family, ScientificName, TaxonId, Url } from "@wortle/shared"
import { describe, expect, it } from "vitest"

import { dbTaxonToTaxon, dbTaxaToSpeciesData } from "./toTaxon"

describe("dbTaxonToTaxon", () => {
  const dbTaxon = {
    id: TaxonId("2cd4p9h.test"),
    scientificName: ScientificName("Bellis perennis"),
    family: Family("Asteraceae"),
    commonName: CommonName("Daisy"),
    alternativeCommonNames: [CommonName("Common Daisy")],
    alternativeScientificNames: [ScientificName("Bellis hybrida")],
    links: [{ name: "Wikipedia", url: Url("https://en.wikipedia.org/wiki/Bellis_perennis") }],
    idTips: ["White petals", "Yellow center"],
  }

  it("converts all fields from DbTaxon to Taxon", () => {
    expect(dbTaxonToTaxon(dbTaxon)).toEqual({
      id: TaxonId("2cd4p9h.test"),
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

describe("dbTaxaToSpeciesData", () => {
  it("converts DbTaxon array to SpeciesData sorted by scientific name", () => {
    const dbTaxa = [
      {
        id: TaxonId("2cd4p9h.z"),
        scientificName: ScientificName("Zinnia elegans"),
        family: Family("Asteraceae"),
        commonName: CommonName("Zinnia"),
        alternativeCommonNames: [],
        alternativeScientificNames: [],
        links: [],
        idTips: [],
      },
      {
        id: TaxonId("2cd4p9h.a"),
        scientificName: ScientificName("Achillea millefolium"),
        family: Family("Asteraceae"),
        commonName: CommonName("Yarrow"),
        alternativeCommonNames: [],
        alternativeScientificNames: [],
        links: [],
        idTips: [],
      },
    ]

    const result = dbTaxaToSpeciesData(dbTaxa)

    expect(result.species[0].scientificName).toBe("Achillea millefolium")
    expect(result.species[1].scientificName).toBe("Zinnia elegans")
  })
})
