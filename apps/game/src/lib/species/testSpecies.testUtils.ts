import { Url } from "@/utils/brandedTypes"

import {
  CommonName,
  DefaultSpeciesRepository,
  Family,
  ScientificName,
  type Species,
  SpeciesId,
  type SpeciesRepository,
} from "./Species"

export const testSpecies: Species[] = [
  {
    id: SpeciesId("2cd4p9h.23w"),
    scientificName: ScientificName("Succisa pratensis"),
    family: Family("Caprifoliaceae"),
    commonName: CommonName("Devil's-bit Scabious"),
    alternativeCommonNames: [CommonName("Devil's-bit")],
    links: [
      { name: "Plant Atlas", url: Url("https://plantatlas2020.org/atlas/2cd4p9h.23w") },
      { name: "Wikipedia", url: Url("https://en.wikipedia.org/wiki/Succisa_pratensis") },
      { name: "NatureSpot", url: Url("https://www.naturespot.org/species/devils-bit-scabious") },
      {
        name: "Flora of East Anglia",
        url: Url("http://webidguides.com/_templates/group_scabious.html#Devil's-bit%20Scabious"),
      },
    ],
    idTips: ["Flower heads rounded with equal sized [[floret]]s", "All leaves [[entire]]", "[[Corolla]] 4-lobed"],
  },
  {
    id: SpeciesId("2cd4p9h.9b1"),
    scientificName: ScientificName("Tanacetum vulgare"),
    family: Family("Asteraceae"),
    commonName: CommonName("Tansy"),
    alternativeCommonNames: [],
    links: [
      { name: "Plant Atlas", url: Url("https://plantatlas2020.org/atlas/2cd4p9h.9b1") },
      { name: "Wikipedia", url: Url("https://en.wikipedia.org/wiki/Tanacetum_vulgare") },
      { name: "NatureSpot", url: Url("https://www.naturespot.org/species/tansy") },
      {
        name: "Flora of East Anglia",
        url: Url("http://webidguides.com/_templates/group_yellowbutton.html#Common%20Tansy"),
      },
    ],
    idTips: [
      "The plant has bright yellow, button-like flower heads arranged in flat-topped clusters.",
      "The flower heads lack [[ray florets]] and consist only of tightly packed [[disc florets]].",
      "The leaves are deeply divided into many narrow, toothed segments.",
    ],
  },
  {
    id: SpeciesId("2cd4p9h.yhw"),
    scientificName: ScientificName("Tanacetum parthenium"),
    family: Family("Asteraceae"),
    commonName: CommonName("Feverfew"),
    alternativeCommonNames: [],
    links: [{ name: "Plant Atlas", url: Url("https://plantatlas2020.org/atlas/2cd4p9h.yhw") }],
    idTips: [],
  },
  {
    id: SpeciesId("2cd4p9h.xyv"),
    scientificName: ScientificName("Knautia arvensis"),
    family: Family("Caprifoliaceae"),
    commonName: CommonName("Field Scabious"),
    alternativeCommonNames: [],
    links: [{ name: "Plant Atlas", url: Url("https://plantatlas2020.org/atlas/2cd4p9h.xyv") }],
    idTips: [],
  },
  {
    id: SpeciesId("2cd4p9h.1e3"),
    scientificName: ScientificName("Lotus corniculatus"),
    family: Family("Fabaceae"),
    commonName: CommonName("Bird's-foot Trefoil"),
    alternativeCommonNames: [],
    links: [{ name: "Plant Atlas", url: Url("https://plantatlas2020.org/atlas/2cd4p9h.1e3") }],
    idTips: [],
  },
  {
    id: SpeciesId("2cd4p9h.94n"),
    scientificName: ScientificName("Primula farinosa"),
    family: Family("Primulaceae"),
    commonName: CommonName("Bird's-eye Primrose"),
    alternativeCommonNames: [],
    links: [
      { name: "Plant Atlas", url: Url("https://plantatlas2020.org/atlas/2cd4p9h.94n") },
      { name: "Wikipedia", url: Url("https://en.wikipedia.org/wiki/Primula_farinosa") },
    ],
    idTips: [],
  },
  {
    id: SpeciesId("2cd4p9h.8nb"),
    scientificName: ScientificName("Geranium robertianum"),
    family: Family("Geraniaceae"),
    commonName: CommonName("Herb-Robert"),
    alternativeCommonNames: [CommonName("Stinking Bob")],
    links: [
      { name: "Plant Atlas", url: Url("https://plantatlas2020.org/atlas/2cd4p9h.8nb") },
      { name: "Wikipedia", url: Url("https://en.wikipedia.org/wiki/Geranium_robertianum") },
      {
        name: "Flora of East Anglia",
        url: Url("http://webidguides.com/_templates/group_erodium.html#Common%20Herb-Robert"),
      },
      { name: "NatureSpot", url: Url("https://www.naturespot.org/species/herb-robert") },
    ],
    idTips: [],
  },
  {
    id: SpeciesId("2cd4p9h.xbs"),
    scientificName: ScientificName("Bellis perennis"),
    family: Family("Asteraceae"),
    commonName: CommonName("Daisy"),
    alternativeCommonNames: [],
    links: [
      { name: "Plant Atlas", url: Url("https://plantatlas2020.org/atlas/2cd4p9h.xbs") },
      { name: "Wikipedia", url: Url("https://en.wikipedia.org/wiki/Bellis_perennis") },
      { name: "NatureSpot", url: Url("https://www.naturespot.org/species/daisy") },
      {
        name: "Flora of East Anglia",
        url: Url("http://webidguides.com/_templates/group_whitedaisies.html#Common%20Daisy"),
      },
    ],
    idTips: [],
  },
  {
    id: SpeciesId("2cd4p9h.21r"),
    scientificName: ScientificName("Smyrnium olusatrum"),
    family: Family("Apiaceae"),
    commonName: CommonName("Alexanders"),
    alternativeCommonNames: [],
    links: [{ name: "Plant Atlas", url: Url("https://plantatlas2020.org/atlas/2cd4p9h.21r") }],
    idTips: [],
  },
  {
    id: SpeciesId("2cd4p9h.xgb"),
    scientificName: ScientificName("Cichorium intybus"),
    family: Family("Asteraceae"),
    commonName: CommonName("Chicory"),
    alternativeCommonNames: [],
    links: [{ name: "Plant Atlas", url: Url("https://plantatlas2020.org/atlas/2cd4p9h.xgb") }],
    idTips: [],
  },
  {
    id: SpeciesId("2cd4p9h.z9"),
    scientificName: ScientificName("Hyacinthoides non-scripta"),
    family: Family("Asparagaceae"),
    commonName: CommonName("Bluebell"),
    alternativeCommonNames: [],
    links: [{ name: "Plant Atlas", url: Url("https://plantatlas2020.org/atlas/2cd4p9h.z9") }],
    idTips: [],
  },
]

export const testSpeciesRepository: SpeciesRepository = new DefaultSpeciesRepository(testSpecies)
