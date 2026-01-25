import { createOptionalContext, useService, useServiceStateSelector } from "@/utils/providerish/serviceHooks"

import { PuzzleService, PuzzleServiceActions, PuzzleServiceState } from "./PuzzleService"

export const PuzzleServiceContext = createOptionalContext<PuzzleService>()

export const usePuzzleServiceActions = (): PuzzleServiceActions => useService(PuzzleServiceContext)

export const usePuzzleState = <Selected = PuzzleServiceState>(
  selector: (state: PuzzleServiceState) => Selected = (state) => state as Selected,
): Selected => useServiceStateSelector(PuzzleServiceContext, selector)
