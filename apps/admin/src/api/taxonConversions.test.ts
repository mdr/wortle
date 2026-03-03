import { CommonName, Family, ScientificName, TaxonId, Url } from "@wortle/shared"
import { describe, expect, it } from "vitest"

import { apiTaxonToDbTaxon, dbTaxonToApiTaxon } from "./taxonConversions"

describe("taxonConversions", () => {
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

  const apiTaxon = {
    id: TaxonId("2cd4p9h.test"),
    scientificName: ScientificName("Bellis perennis"),
    family: Family("Asteraceae"),
    commonName: CommonName("Daisy"),
    alternativeCommonNames: [CommonName("Common Daisy")],
    alternativeScientificNames: [ScientificName("Bellis hybrida")],
    links: [{ name: "Wikipedia", url: Url("https://en.wikipedia.org/wiki/Bellis_perennis") }],
    idTips: ["White petals", "Yellow center"],
  }

  describe("dbTaxonToApiTaxon", () => {
    it("converts all fields from DbTaxon to ApiTaxon", () => {
      expect(dbTaxonToApiTaxon(dbTaxon)).toEqual(apiTaxon)
    })
  })

  describe("apiTaxonToDbTaxon", () => {
    it("converts all fields from ApiTaxon to DbTaxon", () => {
      expect(apiTaxonToDbTaxon(apiTaxon)).toEqual(dbTaxon)
    })
  })
})
