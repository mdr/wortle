import { CommonName } from "@wortle/shared"

import { makeDbTaxon } from "@/trpc/testFactories.testUtils"

import { test } from "../fixtures"
import { TrpcProcedure } from "../network/TrpcSimulator.testUtils"

test("taxa list shows a saved edit after navigating to the list while the save was in flight", async ({
  trpcSimulator,
  launcher,
}) => {
  const taxon = makeDbTaxon({ commonName: CommonName("Daisy") })
  await trpcSimulator.taxaRepository.create(taxon)
  const taxaList = await launcher.launchTaxaListPage()
  const editPage = await taxaList.openTaxon(taxon.commonName)

  const updateStall = trpcSimulator.stall(TrpcProcedure.TAXA_UPDATE)
  await editPage.setCommonName("Common Daisy")
  await editPage.saveExpectingPending()
  const taxaListAgain = await editPage.goToTaxaList()
  // The list refetches on mount and, with the save still stalled, gets the pre-save data back.
  await taxaListAgain.verifyTaxonListed(taxon.commonName)
  updateStall.resolve()

  await taxaListAgain.verifyTaxonListed("Common Daisy")
})
